import { Router, Request, Response } from 'express';
import rateLimit from 'express-rate-limit';
import { hash, compare } from 'bcryptjs';
import prisma from '../lib/prisma';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../lib/jwt';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { registerSchema, loginSchema, forgotPasswordSchema, updateProfileSchema, updatePasswordSchema } from '../schemas/auth.schema';

const router = Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { message: '请求过于频繁，请稍后再试' },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     tags: [Auth]
 *     summary: 注册
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password, role]
 *             properties:
 *               name: { type: string }
 *               email: { type: string, format: email }
 *               password: { type: string, minLength: 6 }
 *               role: { type: string, enum: [USER, ADMIN] }
 *     responses:
 *       201: { description: 注册成功 }
 *       400: { description: 参数错误或邮箱已注册 }
 */
router.post('/register', authLimiter, validate(registerSchema), async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, role } = req.body;

    const existingUser = await prisma.user.findUnique({ where: { email } });

    if (existingUser) {
      const existingRoles = existingUser.role.split(',').map((r: string) => r.trim());
      if (existingRoles.includes(role)) {
        res.status(400).json({ message: '该账号已在此端注册过，请直接登录' });
        return;
      }
      const isPasswordValid = await compare(password, existingUser.password);
      if (!isPasswordValid) {
        res.status(400).json({ message: '该邮箱已注册，密码错误' });
        return;
      }
      const mergedRoles = [...new Set([...existingRoles, role])].join(',');
      const updatedUser = await prisma.user.update({
        where: { email },
        data: { role: mergedRoles },
      });
      const tokenPayload = { userId: updatedUser.id, email: updatedUser.email, role: mergedRoles };
      const accessToken = signAccessToken(tokenPayload);
      const refreshToken = signRefreshToken(tokenPayload);
      res.status(200).json({
        message: '角色追加成功',
        user: { id: updatedUser.id, name: updatedUser.name, email: updatedUser.email, role: mergedRoles },
        accessToken,
        refreshToken,
      });
      return;
    }

    const hashedPassword = await hash(password, 10);
    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword, role },
    });

    const tokenPayload = { userId: user.id, email: user.email, role };
    const accessToken = signAccessToken(tokenPayload);
    const refreshToken = signRefreshToken(tokenPayload);

    res.status(201).json({
      message: '注册成功',
      user: { id: user.id, name: user.name, email: user.email, role },
      accessToken,
      refreshToken,
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: '注册失败，请稍后重试' });
  }
});

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: 登录
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string, format: email }
 *               password: { type: string }
 *     responses:
 *       200: { description: 登录成功 }
 *       400: { description: 邮箱或密码错误 }
 */
router.post('/login', authLimiter, validate(loginSchema), async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      res.status(400).json({ message: '邮箱或密码错误' });
      return;
    }

    const isPasswordValid = await compare(password, user.password);
    if (!isPasswordValid) {
      res.status(400).json({ message: '邮箱或密码错误' });
      return;
    }

    const tokenPayload = { userId: user.id, email: user.email, role: user.role };
    const accessToken = signAccessToken(tokenPayload);
    const refreshToken = signRefreshToken(tokenPayload);

    res.json({
      message: '登录成功',
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
      accessToken,
      refreshToken,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: '登录失败，请稍后重试' });
  }
});

/**
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     tags: [Auth]
 *     summary: 刷新令牌
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [refreshToken]
 *             properties:
 *               refreshToken: { type: string }
 *     responses:
 *       200: { description: 刷新成功 }
 *       401: { description: 刷新令牌无效 }
 */
router.post('/refresh', authLimiter, async (req: Request, res: Response): Promise<void> => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      res.status(400).json({ message: '缺少刷新令牌' });
      return;
    }
    const payload = verifyRefreshToken(refreshToken);
    const user = await prisma.user.findUnique({ where: { id: payload.userId } });
    if (!user) {
      res.status(401).json({ message: '用户不存在' });
      return;
    }
    const tokenPayload = { userId: user.id, email: user.email, role: user.role };
    const newAccessToken = signAccessToken(tokenPayload);
    const newRefreshToken = signRefreshToken(tokenPayload);
    res.json({ accessToken: newAccessToken, refreshToken: newRefreshToken });
  } catch {
    res.status(401).json({ message: '刷新令牌无效或已过期' });
  }
});

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     tags: [Auth]
 *     summary: 登出
 *     responses:
 *       200: { description: 登出成功 }
 */
router.post('/logout', (_req: Request, res: Response): void => {
  res.json({ message: '登出成功' });
});

/**
 * @swagger
 * /api/auth/forgot-password:
 *   post:
 *     tags: [Auth]
 *     summary: 忘记密码（重置为 123456）
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email: { type: string, format: email }
 *     responses:
 *       200: { description: 密码重置成功 }
 *       404: { description: 邮箱未注册 }
 */
router.post('/forgot-password', authLimiter, validate(forgotPasswordSchema), async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      res.status(404).json({ message: '该邮箱未注册' });
      return;
    }
    const hashedPassword = await hash('123456', 10);
    await prisma.user.update({
      where: { email },
      data: { password: hashedPassword },
    });
    res.json({ message: '密码已重置为 123456，请登录后修改' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: '操作失败，请稍后重试' });
  }
});

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     tags: [Auth]
 *     summary: 获取当前用户信息
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: 用户信息 }
 */
router.get('/me', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    });
    if (!user) {
      res.status(404).json({ message: '用户不存在' });
      return;
    }
    res.json(user);
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({ message: '获取用户信息失败' });
  }
});

/**
 * @swagger
 * /api/auth/profile:
 *   put:
 *     tags: [Auth]
 *     summary: 更新用户名
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name: { type: string }
 *     responses:
 *       200: { description: 更新成功 }
 */
router.put('/profile', authenticate, validate(updateProfileSchema), async (req: Request, res: Response): Promise<void> => {
  try {
    const { name } = req.body;
    const user = await prisma.user.update({
      where: { id: req.user!.userId },
      data: { name },
      select: { id: true, name: true, email: true, role: true },
    });
    res.json({ message: '用户名修改成功', user });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: '修改用户名失败' });
  }
});

/**
 * @swagger
 * /api/auth/password:
 *   put:
 *     tags: [Auth]
 *     summary: 修改密码
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [oldPassword, newPassword]
 *             properties:
 *               oldPassword: { type: string }
 *               newPassword: { type: string, minLength: 6 }
 *     responses:
 *       200: { description: 密码修改成功 }
 *       400: { description: 旧密码错误 }
 */
router.put('/password', authenticate, validate(updatePasswordSchema), async (req: Request, res: Response): Promise<void> => {
  try {
    const { oldPassword, newPassword } = req.body;
    const user = await prisma.user.findUnique({ where: { id: req.user!.userId } });
    if (!user) {
      res.status(404).json({ message: '用户不存在' });
      return;
    }
    const isPasswordValid = await compare(oldPassword, user.password);
    if (!isPasswordValid) {
      res.status(400).json({ message: '旧密码错误' });
      return;
    }
    const hashedPassword = await hash(newPassword, 10);
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });
    res.json({ message: '密码修改成功' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ message: '修改密码失败' });
  }
});

export default router;
