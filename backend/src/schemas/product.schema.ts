import { z } from 'zod';

export const createProductSchema = z.object({
  body: z.object({
    name: z.string().min(1, '商品名称不能为空').max(100),
    summary: z.string().min(1, '一句话简介不能为空').max(200),
    description: z.string().min(1, '详情描述不能为空'),
    price: z.coerce.number().positive('价格必须大于0'),
    stock: z.coerce.number().int().min(0, '库存不能为负数'),
    categoryId: z.coerce.number().int().positive('请选择商品分类'),
  }),
});

export const updateProductSchema = z.object({
  body: z.object({
    name: z.string().min(1).max(100).optional(),
    summary: z.string().min(1).max(200).optional(),
    description: z.string().min(1).optional(),
    price: z.coerce.number().positive().optional(),
    stock: z.coerce.number().int().min(0).optional(),
    categoryId: z.coerce.number().int().positive().optional(),
  }),
});
