import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma';
import { authenticate, requireRole } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createOrderSchema, updateOrderStatusSchema, returnRequestSchema } from '../schemas/order.schema';

const router = Router();

/**
 * @swagger
 * /api/orders:
 *   post:
 *     tags: [Orders]
 *     summary: 创建订单（结算）
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [recipientName, recipientAddress, recipientPhone]
 *             properties:
 *               recipientName: { type: string }
 *               recipientAddress: { type: string }
 *               recipientPhone: { type: string }
 *     responses:
 *       201: { description: 订单创建成功 }
 *       400: { description: 购物车为空或无有效商品 }
 */
router.post('/', authenticate, requireRole('USER'), validate(createOrderSchema), async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const { recipientName, recipientAddress, recipientPhone } = req.body;

    const cartItems = await prisma.cartItem.findMany({
      where: { userId },
      include: { product: true },
    });

    const activeItems = cartItems.filter((item) => item.product.isActive);

    if (activeItems.length === 0) {
      res.status(400).json({ message: '购物车中无可结算的有效商品' });
      return;
    }

    for (const item of activeItems) {
      if (item.quantity > item.product.stock) {
        res.status(400).json({
          message: `商品「${item.product.name}」库存不足，当前仅剩 ${item.product.stock} 件`,
        });
        return;
      }
    }

    const totalAmount = activeItems.reduce(
      (sum, item) => sum + Number(item.product.price) * item.quantity,
      0
    );

    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
    const seq = await prisma.orderSequence.upsert({
      where: { date: dateStr },
      update: { lastSeq: { increment: 1 } },
      create: { date: dateStr, lastSeq: 1 },
    });
    const orderNo = `${dateStr}${String(seq.lastSeq).padStart(4, '0')}`;

    const order = await prisma.$transaction(async (tx) => {
      for (const item of activeItems) {
        const result = await tx.product.updateMany({
          where: { id: item.productId, stock: { gte: item.quantity } },
          data: { stock: { decrement: item.quantity } },
        });
        if (result.count === 0) {
          throw new Error(`商品「${item.product.name}」库存不足，当前仅剩 ${item.product.stock} 件`);
        }
      }

      const created = await tx.order.create({
        data: {
          orderNo,
          userId,
          recipientName,
          recipientAddress,
          recipientPhone,
          totalAmount,
          items: {
            create: activeItems.map((item) => ({
              productId: item.productId,
              productName: item.product.name,
              productPrice: item.product.price,
              productImage: item.product.thumbnailUrl,
              quantity: item.quantity,
            })),
          },
        },
        include: { items: true },
      });

      const activeItemIds = activeItems.map((item) => item.id);
      await tx.cartItem.deleteMany({
        where: { id: { in: activeItemIds } },
      });

      return created;
    });

    res.status(201).json(order);
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ message: '创建订单失败' });
  }
});

/**
 * @swagger
 * /api/orders:
 *   get:
 *     tags: [Orders]
 *     summary: 获取订单列表 (USER获取自己的 / ADMIN获取全部)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: 订单列表 }
 */
router.get('/', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const isAdmin = req.user!.role.includes('ADMIN');
    const statusFilter = req.query.status as string | undefined;

    const where: Record<string, unknown> = {};
    if (!isAdmin) {
      where.userId = req.user!.userId;
    }
    if (statusFilter) {
      where.status = statusFilter;
    }

    const orders = await prisma.order.findMany({
      where,
      include: {
        items: true,
        user: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    for (const order of orders) {
      if (order.status === 'SHIPPED' && order.shippedAt && new Date(order.shippedAt) <= sevenDaysAgo) {
        await prisma.order.update({
          where: { id: order.id },
          data: { status: 'COMPLETED' },
        });
        order.status = 'COMPLETED';
      }
    }

    res.json(orders);
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ message: '获取订单列表失败' });
  }
});

/**
 * @swagger
 * /api/orders/{id}:
 *   get:
 *     tags: [Orders]
 *     summary: 获取订单详情
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: 订单详情 }
 *       404: { description: 订单不存在 }
 */
router.get('/:id', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const order = await prisma.order.findUnique({
      where: { id: Number(req.params.id) },
      include: {
        items: true,
        review: true,
        user: { select: { id: true, name: true, email: true } },
      },
    });

    if (!order) {
      res.status(404).json({ message: '订单不存在' });
      return;
    }

    const isAdmin = req.user!.role.includes('ADMIN');
    if (!isAdmin && order.userId !== req.user!.userId) {
      res.status(403).json({ message: '无权访问此订单' });
      return;
    }

    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    if (order.status === 'SHIPPED' && order.shippedAt && new Date(order.shippedAt) <= sevenDaysAgo) {
      await prisma.order.update({
        where: { id: order.id },
        data: { status: 'COMPLETED' },
      });
      order.status = 'COMPLETED';
    }

    res.json(order);
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ message: '获取订单详情失败' });
  }
});

/**
 * @swagger
 * /api/orders/{id}/status:
 *   patch:
 *     tags: [Orders]
 *     summary: 更新订单状态 (管理员)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status]
 *             properties:
 *               status: { type: string, enum: [SHIPPED] }
 *     responses:
 *       200: { description: 更新成功 }
 */
router.patch(
  '/:id/status',
  authenticate,
  requireRole('ADMIN'),
  validate(updateOrderStatusSchema),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const order = await prisma.order.findUnique({ where: { id: Number(req.params.id) } });
      if (!order) {
        res.status(404).json({ message: '订单不存在' });
        return;
      }

      const { status } = req.body;

      if (order.status !== 'PAID' || status !== 'SHIPPED') {
        res.status(400).json({
          message: `不能将订单从 ${order.status} 变更为 ${status}`,
        });
        return;
      }

      const updated = await prisma.order.update({
        where: { id: order.id },
        data: { status, shippedAt: new Date() },
        include: {
          items: true,
          user: { select: { id: true, name: true, email: true } },
        },
      });
      res.json(updated);
    } catch (error) {
      console.error('Update order status error:', error);
      res.status(500).json({ message: '更新订单状态失败' });
    }
  }
);

/**
 * @swagger
 * /api/orders/{id}/confirm:
 *   post:
 *     tags: [Orders]
 *     summary: 确认收货 (SHIPPED → COMPLETED)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: 确认收货成功 }
 *       400: { description: 当前状态不允许确认收货 }
 */
router.post('/:id/confirm', authenticate, requireRole('USER'), async (req: Request, res: Response): Promise<void> => {
  try {
    const order = await prisma.order.findUnique({ where: { id: Number(req.params.id) } });
    if (!order) {
      res.status(404).json({ message: '订单不存在' });
      return;
    }
    if (order.userId !== req.user!.userId) {
      res.status(403).json({ message: '无权操作此订单' });
      return;
    }
    if (order.status !== 'SHIPPED') {
      res.status(400).json({ message: '当前订单状态不允许确认收货' });
      return;
    }
    const updated = await prisma.order.update({
      where: { id: order.id },
      data: { status: 'COMPLETED' },
      include: { items: true },
    });
    res.json(updated);
  } catch (error) {
    console.error('Confirm order error:', error);
    res.status(500).json({ message: '确认收货失败' });
  }
});

/**
 * @swagger
 * /api/orders/{id}/cancel:
 *   post:
 *     tags: [Orders]
 *     summary: 取消订单 (PAID → CANCELLED，恢复库存)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: 取消成功 }
 *       400: { description: 当前状态不允许取消 }
 */
router.post('/:id/cancel', authenticate, requireRole('USER'), async (req: Request, res: Response): Promise<void> => {
  try {
    const order = await prisma.order.findUnique({
      where: { id: Number(req.params.id) },
      include: { items: true },
    });
    if (!order) {
      res.status(404).json({ message: '订单不存在' });
      return;
    }
    if (order.userId !== req.user!.userId) {
      res.status(403).json({ message: '无权操作此订单' });
      return;
    }
    if (order.status !== 'PAID') {
      res.status(400).json({ message: '当前订单状态不允许取消' });
      return;
    }
    await prisma.$transaction(async (tx) => {
      await tx.order.update({
        where: { id: order.id },
        data: { status: 'CANCELLED' },
      });
      for (const item of order.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { increment: item.quantity } },
        });
      }
    });
    res.json({ message: '订单已取消', status: 'CANCELLED' });
  } catch (error) {
    console.error('Cancel order error:', error);
    res.status(500).json({ message: '取消订单失败' });
  }
});

/**
 * @swagger
 * /api/orders/{id}/return:
 *   post:
 *     tags: [Orders]
 *     summary: 申请退货 (COMPLETED → RETURN_PENDING)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [returnReason]
 *             properties:
 *               returnReason: { type: string }
 *     responses:
 *       200: { description: 退货申请已提交 }
 *       400: { description: 不允许申请或已达次数上限 }
 */
router.post('/:id/return', authenticate, requireRole('USER'), validate(returnRequestSchema), async (req: Request, res: Response): Promise<void> => {
  try {
    const order = await prisma.order.findUnique({ where: { id: Number(req.params.id) } });
    if (!order) {
      res.status(404).json({ message: '订单不存在' });
      return;
    }
    if (order.userId !== req.user!.userId) {
      res.status(403).json({ message: '无权操作此订单' });
      return;
    }
    if (order.status !== 'COMPLETED') {
      res.status(400).json({ message: '当前订单状态不允许申请售后' });
      return;
    }
    if (order.returnAttempts >= 3) {
      res.status(400).json({ message: '售后次数已达上限（3次）' });
      return;
    }
    const { returnReason } = req.body;
    const updated = await prisma.order.update({
      where: { id: order.id },
      data: { status: 'RETURN_PENDING', returnReason },
      include: { items: true },
    });
    res.json(updated);
  } catch (error) {
    console.error('Return request error:', error);
    res.status(500).json({ message: '申请售后失败' });
  }
});

/**
 * @swagger
 * /api/orders/{id}/return/approve:
 *   post:
 *     tags: [Orders]
 *     summary: 同意退货 (ADMIN: RETURN_PENDING → REFUNDED，恢复库存)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: 已同意退货并退款 }
 */
router.post('/:id/return/approve', authenticate, requireRole('ADMIN'), async (req: Request, res: Response): Promise<void> => {
  try {
    const order = await prisma.order.findUnique({
      where: { id: Number(req.params.id) },
      include: { items: true },
    });
    if (!order) {
      res.status(404).json({ message: '订单不存在' });
      return;
    }
    if (order.status !== 'RETURN_PENDING') {
      res.status(400).json({ message: '当前订单状态不允许此操作' });
      return;
    }
    await prisma.$transaction(async (tx) => {
      await tx.order.update({
        where: { id: order.id },
        data: { status: 'REFUNDED', refundedAt: new Date() },
      });
      for (const item of order.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { increment: item.quantity } },
        });
      }
    });
    res.json({ message: '已同意退货并退款', status: 'REFUNDED' });
  } catch (error) {
    console.error('Approve return error:', error);
    res.status(500).json({ message: '操作失败' });
  }
});

/**
 * @swagger
 * /api/orders/{id}/return/reject:
 *   post:
 *     tags: [Orders]
 *     summary: 拒绝退货 (ADMIN: RETURN_PENDING → COMPLETED)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               rejectReason: { type: string }
 *     responses:
 *       200: { description: 已拒绝退货 }
 */
router.post('/:id/return/reject', authenticate, requireRole('ADMIN'), async (req: Request, res: Response): Promise<void> => {
  try {
    const order = await prisma.order.findUnique({ where: { id: Number(req.params.id) } });
    if (!order) {
      res.status(404).json({ message: '订单不存在' });
      return;
    }
    if (order.status !== 'RETURN_PENDING') {
      res.status(400).json({ message: '当前订单状态不允许此操作' });
      return;
    }
    const { rejectReason } = req.body;
    const updated = await prisma.order.update({
      where: { id: order.id },
      data: {
        status: 'COMPLETED',
        returnRejectedReason: rejectReason || null,
        returnAttempts: order.returnAttempts + 1,
      },
      include: { items: true },
    });
    res.json(updated);
  } catch (error) {
    console.error('Reject return error:', error);
    res.status(500).json({ message: '操作失败' });
  }
});

export default router;
