import { z } from 'zod';

export const registerSchema = z.object({
  body: z.object({
    name: z.string().min(2, '用户名至少2个字符').max(50, '用户名最多50个字符'),
    email: z.string().email('邮箱格式不正确'),
    password: z.string().min(6, '密码至少6位'),
    role: z.enum(['USER', 'ADMIN']),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email('邮箱格式不正确'),
    password: z.string().min(1, '请输入密码'),
  }),
});

export const forgotPasswordSchema = z.object({
  body: z.object({
    email: z.string().email('邮箱格式不正确'),
  }),
});

export const updateProfileSchema = z.object({
  body: z.object({
    name: z.string().min(2, '用户名至少2个字符').max(50, '用户名最多50个字符'),
  }),
});

export const updatePasswordSchema = z.object({
  body: z.object({
    oldPassword: z.string().min(1, '请输入旧密码'),
    newPassword: z.string().min(6, '新密码至少6位'),
  }),
});
