import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma';
import { authenticate, requireRole } from '../middleware/auth';

const router = Router();

/**
 * @swagger
 * /api/dashboard:
 *   get:
 *     tags: [Dashboard]
 *     summary: 仪表盘统计数据 (管理员)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: 统计数据 }
 */
router.get('/', authenticate, requireRole('ADMIN'), async (_req: Request, res: Response): Promise<void> => {
  try {
    const [totalProducts, activeProducts, totalOrders, pendingShipOrders, returnPendingCount] = await Promise.all([
      prisma.product.count(),
      prisma.product.count({ where: { isActive: true } }),
      prisma.order.count(),
      prisma.order.count({ where: { status: 'PAID' } }),
      prisma.order.count({ where: { status: 'RETURN_PENDING' } }),
    ]);

    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthlyOrders = await prisma.order.findMany({
      where: {
        createdAt: { gte: firstDayOfMonth },
        status: { in: ['PAID', 'SHIPPED', 'COMPLETED'] },
      },
      select: { totalAmount: true },
    });
    const monthlySales = monthlyOrders.reduce((sum, o) => sum + Number(o.totalAmount), 0);

    const monthlyOrderCount = await prisma.order.count({
      where: { createdAt: { gte: firstDayOfMonth } },
    });

    res.json({
      totalProducts,
      activeProducts,
      monthlyOrderCount,
      pendingShipOrders,
      monthlySales,
      returnPendingCount,
    });
  } catch (error) {
    console.error('Get dashboard error:', error);
    res.status(500).json({ message: '获取统计数据失败' });
  }
});

export default router;
