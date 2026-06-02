import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma';
import { authenticate, requireRole } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { addCartItemSchema, updateCartItemSchema } from '../schemas/cart.schema';

const router = Router();

/**
 * @swagger
 * /api/cart:
 *   get:
 *     tags: [Cart]
 *     summary: 获取购物车
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: 购物车列表 }
 */
router.get('/', authenticate, requireRole('USER'), async (req: Request, res: Response): Promise<void> => {
  try {
    const cartItems = await prisma.cartItem.findMany({
      where: { userId: req.user!.userId },
      include: { product: true },
      orderBy: { createdAt: 'asc' },
    });
    res.json(cartItems);
  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({ message: '获取购物车失败' });
  }
});

/**
 * @swagger
 * /api/cart:
 *   post:
 *     tags: [Cart]
 *     summary: 添加商品到购物车
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [productId]
 *             properties:
 *               productId: { type: integer }
 *               quantity: { type: integer, default: 1 }
 *     responses:
 *       201: { description: 添加成功 }
 */
router.post('/', authenticate, requireRole('USER'), validate(addCartItemSchema), async (req: Request, res: Response): Promise<void> => {
  try {
    const { productId, quantity } = req.body;
    const userId = req.user!.userId;

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) {
      res.status(404).json({ message: '商品不存在' });
      return;
    }
    if (!product.isActive) {
      res.status(400).json({ message: '该商品已下架，无法加入购物车' });
      return;
    }

    const addQuantity = quantity || 1;

    const existing = await prisma.cartItem.findUnique({
      where: { userId_productId: { userId, productId } },
    });

    const totalQuantity = existing ? existing.quantity + addQuantity : addQuantity;

    if (totalQuantity > product.stock) {
      res.status(400).json({
        message: `库存不足，当前仅剩 ${product.stock} 件`,
      });
      return;
    }

    if (existing) {
      const updated = await prisma.cartItem.update({
        where: { id: existing.id },
        data: { quantity: totalQuantity },
        include: { product: true },
      });
      res.json(updated);
      return;
    }

    const cartItem = await prisma.cartItem.create({
      data: { userId, productId, quantity: addQuantity },
      include: { product: true },
    });
    res.status(201).json(cartItem);
  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({ message: '添加到购物车失败' });
  }
});

/**
 * @swagger
 * /api/cart/{itemId}:
 *   put:
 *     tags: [Cart]
 *     summary: 修改购物车商品数量
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: itemId
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: 修改成功 }
 */
router.put('/:itemId', authenticate, requireRole('USER'), validate(updateCartItemSchema), async (req: Request, res: Response): Promise<void> => {
  try {
    const itemId = Number(req.params.itemId);
    const { quantity } = req.body;

    const cartItem = await prisma.cartItem.findUnique({
      where: { id: itemId },
      include: { product: true },
    });
    if (!cartItem || cartItem.userId !== req.user!.userId) {
      res.status(404).json({ message: '购物车项不存在' });
      return;
    }

    if (quantity > cartItem.product.stock) {
      res.status(400).json({ message: `库存不足，当前库存 ${cartItem.product.stock}` });
      return;
    }

    const updated = await prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity },
      include: { product: true },
    });
    res.json(updated);
  } catch (error) {
    console.error('Update cart error:', error);
    res.status(500).json({ message: '修改购物车失败' });
  }
});

/**
 * @swagger
 * /api/cart/{itemId}:
 *   delete:
 *     tags: [Cart]
 *     summary: 移除购物车商品
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: itemId
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: 移除成功 }
 */
router.delete('/:itemId', authenticate, requireRole('USER'), async (req: Request, res: Response): Promise<void> => {
  try {
    const itemId = Number(req.params.itemId);
    const cartItem = await prisma.cartItem.findUnique({ where: { id: itemId } });
    if (!cartItem || cartItem.userId !== req.user!.userId) {
      res.status(404).json({ message: '购物车项不存在' });
      return;
    }
    await prisma.cartItem.delete({ where: { id: itemId } });
    res.json({ message: '移除成功' });
  } catch (error) {
    console.error('Delete cart error:', error);
    res.status(500).json({ message: '移除购物车失败' });
  }
});

export default router;
