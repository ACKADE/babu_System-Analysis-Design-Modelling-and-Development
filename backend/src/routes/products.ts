import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma';
import { verifyAccessToken } from '../lib/jwt';
import { authenticate, requireRole } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { upload } from '../middleware/upload';
import { createProductSchema } from '../schemas/product.schema';
import path from 'path';
import fs from 'fs';

const router = Router();

function deleteFileIfExists(relativePath: string | null | undefined): void {
  if (!relativePath) return;
  const absolutePath = path.resolve(__dirname, '..', '..', relativePath);
  if (fs.existsSync(absolutePath)) {
    fs.unlinkSync(absolutePath);
  }
}

/**
 * @swagger
 * /api/products:
 *   get:
 *     tags: [Products]
 *     summary: 获取商品列表
 *     parameters:
 *       - in: query
 *         name: all
 *         schema: { type: string }
 *         description: 管理员传 all=true 获取含下架的全部商品
 *     responses:
 *       200: { description: 商品列表 }
 */
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    let showAll = false;
    if (req.query.all === 'true') {
      const authHeader = req.headers.authorization;
      if (authHeader?.startsWith('Bearer ')) {
        try {
          const payload = verifyAccessToken(authHeader.split(' ')[1]);
          showAll = payload.role.split(',').map((role) => role.trim()).includes('ADMIN');
        } catch {
          showAll = false;
        }
      }
    }
    const products = await prisma.product.findMany({
      where: showAll ? {} : { isActive: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json(products);
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ message: '获取商品列表失败' });
  }
});

/**
 * @swagger
 * /api/products/{id}:
 *   get:
 *     tags: [Products]
 *     summary: 获取商品详情
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: 商品详情 }
 *       404: { description: 商品不存在 }
 */
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const product = await prisma.product.findUnique({
      where: { id: Number(req.params.id) },
    });
    if (!product) {
      res.status(404).json({ message: '商品不存在' });
      return;
    }
    if (!product.isActive) {
      let isAdmin = false;
      const authHeader = req.headers.authorization;

      if (authHeader?.startsWith('Bearer ')) {
        try {
          const payload = verifyAccessToken(authHeader.split(' ')[1]);
          isAdmin = payload.role
            .split(',')
            .map((role) => role.trim())
            .includes('ADMIN');
        } catch {
          isAdmin = false;
        }
      }

      if (!isAdmin) {
        res.status(404).json({ message: '商品不存在' });
        return;
      }
    }
    res.json(product);
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ message: '获取商品详情失败' });
  }
});

/**
 * @swagger
 * /api/products:
 *   post:
 *     tags: [Products]
 *     summary: 创建商品 (管理员)
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [name, summary, description, price, stock]
 *             properties:
 *               name: { type: string }
 *               summary: { type: string }
 *               description: { type: string }
 *               price: { type: number }
 *               stock: { type: integer }
 *               thumbnail: { type: string, format: binary }
 *               image: { type: string, format: binary }
 *     responses:
 *       201: { description: 创建成功 }
 */
router.post(
  '/',
  authenticate,
  requireRole('ADMIN'),
  upload.fields([
    { name: 'thumbnail', maxCount: 1 },
    { name: 'image', maxCount: 1 },
  ]),
  validate(createProductSchema),
  async (req: Request, res: Response): Promise<void> => {
    const uploadedFiles: string[] = [];
    try {
      const { name, summary, description, price, stock, categoryId } = req.body;
      const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;

      const thumbnailUrl = files?.thumbnail?.[0]
        ? path.posix.join('uploads', files.thumbnail[0].filename)
        : '';
      const imageUrl = files?.image?.[0]
        ? path.posix.join('uploads', files.image[0].filename)
        : '';

      if (thumbnailUrl) uploadedFiles.push(thumbnailUrl);
      if (imageUrl) uploadedFiles.push(imageUrl);

      const product = await prisma.product.create({
        data: {
          name,
          summary,
          description,
          price,
          stock: Number(stock),
          categoryId: Number(categoryId),
          thumbnailUrl,
          imageUrl,
        },
      });
      res.status(201).json(product);
    } catch (error) {
      for (const filePath of uploadedFiles) {
        deleteFileIfExists(filePath);
      }
      console.error('Create product error:', error);
      res.status(500).json({ message: '创建商品失败' });
    }
  }
);

/**
 * @swagger
 * /api/products/{id}:
 *   put:
 *     tags: [Products]
 *     summary: 编辑商品 (管理员)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: 编辑成功 }
 */
router.put(
  '/:id',
  authenticate,
  requireRole('ADMIN'),
  upload.fields([
    { name: 'thumbnail', maxCount: 1 },
    { name: 'image', maxCount: 1 },
  ]),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const productId = Number(req.params.id);
      const existing = await prisma.product.findUnique({ where: { id: productId } });
      if (!existing) {
        res.status(404).json({ message: '商品不存在' });
        return;
      }

      const { name, summary, description, price, stock, categoryId } = req.body;
      const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
      const uploadedFiles: string[] = [];

      const data: Record<string, unknown> = {};
      if (name !== undefined) data.name = name;
      if (summary !== undefined) data.summary = summary;
      if (description !== undefined) data.description = description;
      if (price !== undefined) data.price = Number(price);
      if (stock !== undefined) data.stock = Number(stock);
      if (categoryId !== undefined) data.categoryId = Number(categoryId);
      if (files?.thumbnail?.[0]) {
        const newPath = path.posix.join('uploads', files.thumbnail[0].filename);
        uploadedFiles.push(newPath);
        data.thumbnailUrl = newPath;
      }
      if (files?.image?.[0]) {
        const newPath = path.posix.join('uploads', files.image[0].filename);
        uploadedFiles.push(newPath);
        data.imageUrl = newPath;
      }

      try {
        const product = await prisma.product.update({
          where: { id: productId },
          data,
        });

        if (files?.thumbnail?.[0]) {
          deleteFileIfExists(existing.thumbnailUrl);
        }
        if (files?.image?.[0]) {
          deleteFileIfExists(existing.imageUrl);
        }

        res.json(product);
      } catch (updateError) {
        for (const filePath of uploadedFiles) {
          deleteFileIfExists(filePath);
        }
        throw updateError;
      }
    } catch (error) {
      console.error('Update product error:', error);
      res.status(500).json({ message: '编辑商品失败' });
    }
  }
);

/**
 * @swagger
 * /api/products/{id}/toggle:
 *   patch:
 *     tags: [Products]
 *     summary: 上架/下架商品 (管理员)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: 操作成功 }
 */
router.patch(
  '/:id/toggle',
  authenticate,
  requireRole('ADMIN'),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const product = await prisma.product.findUnique({
        where: { id: Number(req.params.id) },
      });
      if (!product) {
        res.status(404).json({ message: '商品不存在' });
        return;
      }
      const updated = await prisma.product.update({
        where: { id: product.id },
        data: { isActive: !product.isActive },
      });
      res.json(updated);
    } catch (error) {
      console.error('Toggle product error:', error);
      res.status(500).json({ message: '操作失败' });
    }
  }
);

export default router;
