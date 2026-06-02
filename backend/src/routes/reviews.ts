import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma';
import { authenticate, requireRole } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createReviewSchema } from '../schemas/order.schema';

const router = Router();

/**
 * @swagger
 * /api/products/{id}/reviews:
 *   get:
 *     tags: [Reviews]
 *     summary: 获取商品评价列表
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: 评价列表 }
 */
router.get('/products/:id/reviews', async (req: Request, res: Response): Promise<void> => {
  try {
    const reviews = await prisma.review.findMany({
      where: { productId: Number(req.params.id) },
      include: { user: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json(reviews);
  } catch (error) {
    console.error('Get reviews error:', error);
    res.status(500).json({ message: '获取评价失败' });
  }
});

/**
 * @swagger
 * /api/orders/{id}/review:
 *   post:
 *     tags: [Reviews]
 *     summary: 提交商品评价（每个订单限一条）
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
 *             required: [productId, rating]
 *             properties:
 *               productId: { type: integer }
 *               rating: { type: integer, minimum: 1, maximum: 5 }
 *               content: { type: string }
 *     responses:
 *       201: { description: 评价成功 }
 *       400: { description: 不允许评价或已评价过 }
 */
router.post('/orders/:id/review', authenticate, requireRole('USER'), validate(createReviewSchema), async (req: Request, res: Response): Promise<void> => {
  try {
    const orderId = Number(req.params.id);
    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) {
      res.status(404).json({ message: '订单不存在' });
      return;
    }
    if (order.userId !== req.user!.userId) {
      res.status(403).json({ message: '无权操作此订单' });
      return;
    }
    if (order.status !== 'COMPLETED') {
      res.status(400).json({ message: '仅可对已完成的订单进行评价' });
      return;
    }

    const existingReview = await prisma.review.findUnique({ where: { orderId } });
    if (existingReview) {
      res.status(400).json({ message: '该订单已评价过' });
      return;
    }

    const { productId, rating, content } = req.body;

    const orderItem = await prisma.orderItem.findFirst({
      where: { orderId, productId },
    });
    if (!orderItem) {
      res.status(400).json({ message: '该商品不属于此订单' });
      return;
    }

    const review = await prisma.review.create({
      data: {
        userId: req.user!.userId,
        productId,
        orderId,
        rating,
        content: content || null,
      },
      include: { user: { select: { id: true, name: true } } },
    });
    res.status(201).json(review);
  } catch (error) {
    console.error('Create review error:', error);
    res.status(500).json({ message: '提交评价失败' });
  }
});

export default router;
