import { z } from 'zod';

export const createOrderSchema = z.object({
  body: z.object({
    recipientName: z.string().min(1, '收货人姓名不能为空'),
    recipientAddress: z.string().min(1, '收货地址不能为空'),
    recipientPhone: z.string().regex(/^[0-9]{7,15}$/, '手机号须为7-15位数字'),
  }),
});

export const updateOrderStatusSchema = z.object({
  body: z.object({
    status: z.enum(['SHIPPED']),
  }),
});

export const createReviewSchema = z.object({
  body: z.object({
    productId: z.number().int().positive('请选择评价商品'),
    rating: z.number().int().min(1, '评分至少1星').max(5, '评分最多5星'),
    content: z.string().optional(),
  }),
});

export const returnRequestSchema = z.object({
  body: z.object({
    returnReason: z.string().min(5, '退货原因至少5个字'),
  }),
});
