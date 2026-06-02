# 小型电商演示平台 — 项目骨架搭建实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 搭建完整的 monorepo 项目骨架：Docker Compose + Express/Prisma 后端 + 两个 Vite/React 前端，可一键启动并访问

**Architecture:** Docker Compose 编排 MySQL 和后端服务；后端 Express + TypeScript + Prisma 提供 RESTful API；两个独立 Vite React 前端（用户端 + 商店端）通过 Vite proxy 转发 API 请求到后端 3000 端口；所有服务通过 TypeScript 共享类型安全

**Tech Stack:** Docker Compose, MySQL 8, Node.js 20+, Express 4, TypeScript 5, Prisma 5, Tailwind CSS 3, React 18, Vite 5, TanStack Query 5, axios, React Router 6

---

### Task 1: 根目录配置

**Files:**
- Create: `docker-compose.yml`
- Create: `.gitignore`

- [ ] **Step 1: 创建 .gitignore**

```bash
cat > .gitignore << 'GITEOF'
node_modules/
dist/
.env
uploads/*
!uploads/.gitkeep
*.log
.DS_Store
GITEOF
```

- [ ] **Step 2: 创建 docker-compose.yml**

```yaml
version: '3.8'

services:
  mysql:
    image: mysql:8.0
    container_name: ecommerce-mysql
    restart: unless-stopped
    environment:
      MYSQL_ROOT_PASSWORD: root123
      MYSQL_DATABASE: ecommerce
      MYSQL_USER: ecommerce
      MYSQL_PASSWORD: ecommerce123
    ports:
      - "3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
      interval: 10s
      timeout: 5s
      retries: 5

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: ecommerce-backend
    restart: unless-stopped
    ports:
      - "3000:3000"
    environment:
      DATABASE_URL: mysql://ecommerce:ecommerce123@mysql:3306/ecommerce
      JWT_ACCESS_SECRET: access-secret-change-in-production
      JWT_REFRESH_SECRET: refresh-secret-change-in-production
      JWT_ACCESS_EXPIRES_IN: 15m
      JWT_REFRESH_EXPIRES_IN: 7d
      PORT: 3000
    volumes:
      - ./backend/uploads:/app/uploads
      - ./backend/src:/app/src
      - ./backend/prisma:/app/prisma
    depends_on:
      mysql:
        condition: service_healthy
    command: >
      sh -c "npx prisma migrate deploy && npx prisma db seed && node dist/index.js"

volumes:
  mysql_data:
```

- [ ] **Step 3: 创建 uploads 占位文件**

```bash
mkdir -p backend/uploads
touch backend/uploads/.gitkeep
```

- [ ] **Step 4: Commit**

```bash
git add docker-compose.yml .gitignore backend/uploads/.gitkeep
git commit -m "chore: add root docker-compose and gitignore"
```

---

### Task 2: 后端 Dockerfile

**Files:**
- Create: `backend/Dockerfile`
- Create: `backend/.dockerignore`

- [ ] **Step 1: 创建 backend/.dockerignore**

```bash
cat > backend/.dockerignore << 'EOF'
node_modules
dist
uploads
.env
EOF
```

- [ ] **Step 2: 创建 backend/Dockerfile**

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
COPY tsconfig.json ./
COPY prisma ./prisma/
RUN npm ci
COPY src ./src/
RUN npm run build

FROM node:20-alpine
WORKDIR /app
RUN apk add --no-cache openssl
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY package*.json ./
COPY tsconfig.json ./
RUN mkdir -p uploads
EXPOSE 3000
CMD ["node", "dist/index.js"]
```

- [ ] **Step 3: Commit**

```bash
git add backend/Dockerfile backend/.dockerignore
git commit -m "chore: add backend Dockerfile"
```

---

### Task 3: 后端 package.json 与 TypeScript 配置

**Files:**
- Create: `backend/package.json`
- Create: `backend/tsconfig.json`
- Create: `backend/.env`

- [ ] **Step 1: 创建 backend/package.json**

```json
{
  "name": "ecommerce-backend",
  "version": "1.0.0",
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "db:migrate": "prisma migrate dev",
    "db:push": "prisma db push",
    "db:seed": "prisma db seed",
    "db:studio": "prisma studio",
    "test": "jest --passWithNoTests"
  },
  "prisma": {
    "seed": "tsx prisma/seed.ts"
  },
  "dependencies": {
    "@prisma/client": "^5.15.0",
    "bcryptjs": "^2.4.3",
    "cors": "^2.8.5",
    "dotenv": "^16.4.5",
    "express": "^4.19.2",
    "jsonwebtoken": "^9.0.2",
    "multer": "^1.4.5-lts.1",
    "swagger-jsdoc": "^6.2.8",
    "swagger-ui-express": "^5.0.0",
    "zod": "^3.23.8"
  },
  "devDependencies": {
    "@types/bcryptjs": "^2.4.6",
    "@types/cors": "^2.8.17",
    "@types/express": "^4.17.21",
    "@types/jest": "^29.5.12",
    "@types/jsonwebtoken": "^9.0.6",
    "@types/multer": "^1.4.11",
    "@types/swagger-jsdoc": "^6.0.4",
    "@types/swagger-ui-express": "^4.1.6",
    "jest": "^29.7.0",
    "prisma": "^5.15.0",
    "supertest": "^7.0.0",
    "@types/supertest": "^6.0.2",
    "ts-jest": "^29.1.4",
    "tsx": "^4.15.4",
    "typescript": "^5.4.5"
  }
}
```

- [ ] **Step 2: 创建 backend/tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "commonjs",
    "lib": ["ES2022"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

- [ ] **Step 3: 创建 backend/.env**

```
DATABASE_URL=mysql://ecommerce:ecommerce123@localhost:3306/ecommerce
JWT_ACCESS_SECRET=access-secret-dev-only
JWT_REFRESH_SECRET=refresh-secret-dev-only
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
PORT=3000
```

- [ ] **Step 4: 安装依赖**

```bash
cd backend && npm install
```

- [ ] **Step 5: Commit**

```bash
git add backend/package.json backend/package-lock.json backend/tsconfig.json backend/.env
git commit -m "chore: init backend project with dependencies"
```

---

### Task 4: Prisma Schema 与初始迁移

**Files:**
- Create: `backend/prisma/schema.prisma`
- Create: `backend/prisma/seed.ts`

- [ ] **Step 1: 创建 backend/prisma/schema.prisma**

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}

model User {
  id        Int        @id @default(autoincrement())
  name      String
  email     String     @unique
  password  String
  role      String     @default("USER")
  createdAt DateTime   @default(now())
  cartItems CartItem[]
  orders    Order[]
  reviews   Review[]
}

model Category {
  id       Int        @id @default(autoincrement())
  name     String
  parentId Int?
  parent   Category?  @relation("CategoryTree", fields: [parentId], references: [id])
  children Category[] @relation("CategoryTree")
  products Product[]

  @@unique([parentId, name])
}

model Product {
  id           Int        @id @default(autoincrement())
  name         String
  summary      String
  description  String     @db.Text
  price        Decimal    @db.Decimal(10, 2)
  stock        Int        @default(0)
  thumbnailUrl String
  imageUrl     String
  isActive     Boolean    @default(true)
  categoryId   Int
  category     Category   @relation(fields: [categoryId], references: [id])
  createdAt    DateTime   @default(now())
  updatedAt    DateTime   @updatedAt
  cartItems    CartItem[]
  orderItems   OrderItem[]
  reviews      Review[]
}

model CartItem {
  id        Int      @id @default(autoincrement())
  userId    Int
  productId Int
  quantity  Int      @default(1)
  createdAt DateTime @default(now())
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  product   Product  @relation(fields: [productId], references: [id], onDelete: Cascade)

  @@unique([userId, productId])
}

model Order {
  id                   Int         @id @default(autoincrement())
  orderNo              String      @unique
  userId               Int
  recipientName        String
  recipientAddress     String
  recipientPhone       String
  totalAmount          Decimal     @db.Decimal(10, 2)
  status               String      @default("PAID")
  shippedAt            DateTime?
  returnReason         String?     @db.Text
  returnRejectedReason String?     @db.Text
  returnAttempts       Int         @default(0)
  refundedAt           DateTime?
  createdAt            DateTime    @default(now())
  user                 User        @relation(fields: [userId], references: [id], onDelete: Cascade)
  items                OrderItem[]
  review               Review?
}

model OrderItem {
  id           Int     @id @default(autoincrement())
  orderId      Int
  productId    Int
  productName  String
  productPrice Decimal @db.Decimal(10, 2)
  productImage String
  quantity     Int
  order        Order   @relation(fields: [orderId], references: [id], onDelete: Cascade)
  product      Product @relation(fields: [productId], references: [id], onDelete: Cascade)
}

model OrderSequence {
  date    String @id @db.VarChar(8)
  lastSeq Int    @default(0)
}

model Review {
  id        Int      @id @default(autoincrement())
  userId    Int
  productId Int
  orderId   Int      @unique
  rating    Int
  content   String?  @db.Text
  createdAt DateTime @default(now())
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  product   Product  @relation(fields: [productId], references: [id], onDelete: Cascade)
  order     Order    @relation(fields: [orderId], references: [id], onDelete: Cascade)
}
```

- [ ] **Step 2: 创建 backend/prisma/seed.ts**

```typescript
import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const password = await hash('admin123', 10);

  await prisma.user.upsert({
    where: { email: 'admin@shop.com' },
    update: {},
    create: {
      name: 'Admin',
      email: 'admin@shop.com',
      password,
      role: 'ADMIN',
    },
  });

  console.log('Seed completed');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

- [ ] **Step 3: Commit**

```bash
git add backend/prisma/schema.prisma backend/prisma/seed.ts
git commit -m "feat: add Prisma schema and seed"
```

---

### Task 5: 后端 Express 入口与核心中间件

**Files:**
- Create: `backend/src/index.ts`
- Create: `backend/src/app.ts`
- Create: `backend/src/middleware/auth.ts`
- Create: `backend/src/middleware/validate.ts`
- Create: `backend/src/middleware/errorHandler.ts`
- Create: `backend/src/middleware/upload.ts`
- Create: `backend/src/lib/prisma.ts`
- Create: `backend/src/lib/jwt.ts`
- Create: `backend/src/schemas/auth.schema.ts`
- Create: `backend/src/schemas/product.schema.ts`
- Create: `backend/src/schemas/order.schema.ts`
- Create: `backend/src/schemas/cart.schema.ts`

- [ ] **Step 1: 创建 backend/src/lib/prisma.ts**

```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default prisma;
```

- [ ] **Step 2: 创建 backend/src/lib/jwt.ts**

```typescript
import jwt from 'jsonwebtoken';

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'access-secret-dev-only';
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'refresh-secret-dev-only';
const ACCESS_EXPIRES_IN = process.env.JWT_ACCESS_EXPIRES_IN || '15m';
const REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

export interface TokenPayload {
  userId: number;
  email: string;
  role: string;
}

export function signAccessToken(payload: TokenPayload): string {
  return jwt.sign(payload, ACCESS_SECRET, { expiresIn: ACCESS_EXPIRES_IN });
}

export function signRefreshToken(payload: TokenPayload): string {
  return jwt.sign(payload, REFRESH_SECRET, { expiresIn: REFRESH_EXPIRES_IN });
}

export function verifyAccessToken(token: string): TokenPayload {
  return jwt.verify(token, ACCESS_SECRET) as TokenPayload;
}

export function verifyRefreshToken(token: string): TokenPayload {
  return jwt.verify(token, REFRESH_SECRET) as TokenPayload;
}
```

- [ ] **Step 3: 创建 backend/src/middleware/auth.ts**

```typescript
import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, TokenPayload } from '../lib/jwt';

declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}

export function authenticate(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ message: '未提供认证令牌' });
    return;
  }

  const token = authHeader.split(' ')[1];
  try {
    const payload = verifyAccessToken(token);
    req.user = payload;
    next();
  } catch {
    res.status(401).json({ message: '认证令牌无效或已过期' });
  }
}

export function requireRole(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ message: '未认证' });
      return;
    }
    const userRoles = req.user.role.split(',').map((r) => r.trim());
    const hasRole = roles.some((r) => userRoles.includes(r));
    if (!hasRole) {
      res.status(403).json({ message: '无权限访问' });
      return;
    }
    next();
  };
}
```

- [ ] **Step 4: 创建 backend/src/middleware/validate.ts**

```typescript
import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';

export function validate(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({
          message: '请求参数校验失败',
          errors: error.errors.map((e) => ({
            field: e.path.join('.'),
            message: e.message,
          })),
        });
        return;
      }
      next(error);
    }
  };
}
```

- [ ] **Step 5: 创建 backend/src/middleware/errorHandler.ts**

```typescript
import { Request, Response, NextFunction } from 'express';

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  console.error('Unhandled error:', err);
  res.status(500).json({ message: '服务器内部错误' });
}
```

- [ ] **Step 6: 创建 backend/src/middleware/upload.ts**

```typescript
import multer from 'multer';
import path from 'path';

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, path.resolve(__dirname, '../../uploads'));
  },
  filename: (_req, file, cb) => {
    const timestamp = Date.now();
    const ext = path.extname(file.originalname);
    cb(null, `${timestamp}-${Math.random().toString(36).slice(2, 8)}${ext}`);
  },
});

export const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
    files: 2,
  },
  fileFilter: (_req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('仅支持 JPEG、PNG、GIF、WebP 格式'));
    }
  },
});
```

- [ ] **Step 7: 创建 backend/src/schemas/auth.schema.ts**

```typescript
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
```

- [ ] **Step 8: 创建 backend/src/schemas/product.schema.ts**

```typescript
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
```

- [ ] **Step 9: 创建 backend/src/schemas/order.schema.ts**

```typescript
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
    status: z.enum(['SHIPPED']), // 管理员仅允许发货操作
  }),
});
```

- [ ] **Step 10: 创建 backend/src/schemas/cart.schema.ts**

```typescript
import { z } from 'zod';

export const addCartItemSchema = z.object({
  body: z.object({
    productId: z.number().int().positive(),
    quantity: z.number().int().min(1).default(1),
  }),
});

export const updateCartItemSchema = z.object({
  body: z.object({
    quantity: z.number().int().min(1),
  }),
});
```

- [ ] **Step 11: 创建 backend/src/app.ts**

```typescript
import express from 'express';
import cors from 'cors';
import path from 'path';
import swaggerUi from 'swagger-ui-express';
import { errorHandler } from './middleware/errorHandler';
import { swaggerSpec } from './swagger';
import authRoutes from './routes/auth';
import productRoutes from './routes/products';
import cartRoutes from './routes/cart';
import orderRoutes from './routes/orders';
import categoryRoutes from './routes/categories';
import reviewRoutes from './routes/reviews';
import dashboardRoutes from './routes/dashboard';

const app = express();

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.resolve(__dirname, '../uploads')));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api', reviewRoutes); // review routes handle /products/:id/reviews and /orders/:id/review

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use(errorHandler);

export default app;
```

- [ ] **Step 12: 创建 backend/src/index.ts**

```typescript
import dotenv from 'dotenv';
dotenv.config();

import app from './app';

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Swagger docs: http://localhost:${PORT}/api-docs`);
});
```

- [ ] **Step 13: 创建 backend/src/swagger.ts**

```typescript
import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: '小型电商平台 API',
      version: '1.0.0',
      description: '用户端与商店端的 RESTful API 文档',
    },
    servers: [{ url: 'http://localhost:3000' }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  apis: ['./src/routes/*.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);
```

- [ ] **Step 14: Commit**

```bash
git add backend/src/
git commit -m "feat: add Express app entry, middleware, and validation schemas"
```

---

### Task 6: 后端路由实现

**Files:**
- Create: `backend/src/routes/auth.ts`
- Create: `backend/src/routes/products.ts`
- Create: `backend/src/routes/cart.ts`
- Create: `backend/src/routes/orders.ts`
- Create: `backend/src/routes/categories.ts`
- Create: `backend/src/routes/reviews.ts`
- Create: `backend/src/routes/dashboard.ts`

- [ ] **Step 1: 创建 backend/src/routes/auth.ts**

```typescript
import { Router, Request, Response } from 'express';
import { hash, compare } from 'bcryptjs';
import prisma from '../lib/prisma';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../lib/jwt';
import { validate } from '../middleware/validate';
import { registerSchema, loginSchema } from '../schemas/auth.schema';

const router = Router();

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
router.post('/register', validate(registerSchema), async (req: Request, res: Response): Promise<void> => {
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
router.post('/login', validate(loginSchema), async (req: Request, res: Response): Promise<void> => {
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
router.post('/refresh', async (req: Request, res: Response): Promise<void> => {
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
router.post('/forgot-password', async (req: Request, res: Response): Promise<void> => {
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
router.put('/profile', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const { name } = req.body;
    if (!name || name.length < 2) {
      res.status(400).json({ message: '用户名至少2个字符' });
      return;
    }
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
router.put('/password', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const { oldPassword, newPassword } = req.body;
    if (!newPassword || newPassword.length < 6) {
      res.status(400).json({ message: '新密码至少6位' });
      return;
    }
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
```

- [ ] **Step 2: 创建 backend/src/routes/products.ts**

```typescript
import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma';
import { authenticate, requireRole } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { upload } from '../middleware/upload';
import { createProductSchema, updateProductSchema } from '../schemas/product.schema';
import path from 'path';

const router = Router();

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
    const showAll = req.query.all === 'true';
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
    try {
      const { name, summary, description, price, stock, categoryId } = req.body;
      const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;

      const thumbnailUrl = files?.thumbnail?.[0]
        ? path.posix.join('uploads', files.thumbnail[0].filename)
        : '';
      const imageUrl = files?.image?.[0]
        ? path.posix.join('uploads', files.image[0].filename)
        : '';

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

      const data: Record<string, unknown> = {};
      if (name !== undefined) data.name = name;
      if (summary !== undefined) data.summary = summary;
      if (description !== undefined) data.description = description;
      if (price !== undefined) data.price = Number(price);
      if (stock !== undefined) data.stock = Number(stock);
      if (categoryId !== undefined) data.categoryId = Number(categoryId);
      if (files?.thumbnail?.[0]) {
        data.thumbnailUrl = path.posix.join('uploads', files.thumbnail[0].filename);
      }
      if (files?.image?.[0]) {
        data.imageUrl = path.posix.join('uploads', files.image[0].filename);
      }

      const product = await prisma.product.update({
        where: { id: productId },
        data,
      });
      res.json(product);
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
```

- [ ] **Step 3: 创建 backend/src/routes/cart.ts**

```typescript
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

    // 库存校验：添加/叠加后的数量不能超过当前库存
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
```

- [ ] **Step 4: 创建 backend/src/routes/orders.ts**

```typescript
import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma';
import { authenticate, requireRole } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createOrderSchema, updateOrderStatusSchema } from '../schemas/order.schema';

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

    // 过滤下架商品（下架商品跳过结算，保留在购物车）
    const activeItems = cartItems.filter((item) => item.product.isActive);

    if (activeItems.length === 0) {
      res.status(400).json({ message: '购物车中无可结算的有效商品' });
      return;
    }

    // 逐件校验库存，任一件不足则返回具体提示
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

    // 生成订单编号：YYYYMMDD + 4位序号（OrderSequence 原子递增）
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
    const seq = await prisma.orderSequence.upsert({
      where: { date: dateStr },
      update: { lastSeq: { increment: 1 } },
      create: { date: dateStr, lastSeq: 1 },
    });
    const orderNo = `${dateStr}${String(seq.lastSeq).padStart(4, '0')}`;

    // Prisma 事务：创建订单 + 扣减库存 + 生成订单编号 + 清空已结算购物车项
    const order = await prisma.$transaction(async (tx) => {
      // 扣减库存（WHERE stock >= quantity 乐观并发保护，检查返回值确保实际扣减成功）
      for (const item of activeItems) {
        const result = await tx.product.updateMany({
          where: { id: item.productId, stock: { gte: item.quantity } },
          data: { stock: { decrement: item.quantity } },
        });
        if (result.count === 0) {
          throw new Error(`商品「${item.product.name}」库存不足，当前仅剩 ${item.product.stock} 件`);
        }
      }

      // 创建订单（含快照 OrderItem）
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

      // 清空已结算的购物车项
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

    // 惰性自动收货：SHIPPED + 7天 → COMPLETED
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

    // 惰性自动收货：SHIPPED + 7天 → COMPLETED
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
 *               status: { type: string, enum: [SHIPPED, COMPLETED] }
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

      // 管理员仅允许 PAID → SHIPPED（发货），COMPLETED 由用户确认收货或 7 天自动完成
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
    // 事务：修改状态 + 恢复库存
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
 *               returnReason: { type: string, minLength: 5 }
 *     responses:
 *       200: { description: 退货申请已提交 }
 *       400: { description: 不允许申请或已达次数上限 }
 */
router.post('/:id/return', authenticate, requireRole('USER'), async (req: Request, res: Response): Promise<void> => {
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
    if (!returnReason || returnReason.length < 5) {
      res.status(400).json({ message: '退货原因至少5个字' });
      return;
    }
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
    // 事务：退款 + 恢复库存
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
```

- [ ] **Step 5: 创建 backend/src/routes/categories.ts**

```typescript
import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma';

const router = Router();

/**
 * @swagger
 * /api/categories:
 *   get:
 *     tags: [Categories]
 *     summary: 获取分类树（二级）
 *     responses:
 *       200: { description: 分类树 }
 */
router.get('/', async (_req: Request, res: Response): Promise<void> => {
  try {
    const categories = await prisma.category.findMany({
      where: { parentId: null },
      include: { children: true },
      orderBy: { id: 'asc' },
    });
    res.json(categories);
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ message: '获取分类失败' });
  }
});

export default router;
```

- [ ] **Step 6: 创建 backend/src/routes/reviews.ts**

```typescript
import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma';
import { authenticate, requireRole } from '../middleware/auth';

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
router.post('/orders/:id/review', authenticate, requireRole('USER'), async (req: Request, res: Response): Promise<void> => {
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
    if (!rating || rating < 1 || rating > 5) {
      res.status(400).json({ message: '评分须在 1-5 之间' });
      return;
    }

    // 验证 productId 属于本订单商品
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
```

- [ ] **Step 7: 创建 backend/src/routes/dashboard.ts**

```typescript
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

    // 本月销售额：PAID + SHIPPED + COMPLETED
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

    // 本月订单数
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
```

- [ ] **Step 8: 验证后端编译通过**

```bash
cd backend && npx tsx src/index.ts
```
Expected: Server starts without errors. Then Ctrl+C to stop.

- [ ] **Step 9: Commit**

```bash
git add backend/src/routes/
git commit -m "feat: add all API routes (auth, products, cart, orders, categories, reviews, dashboard)"
```

---

### Task 7: 用户端前端脚手架 (Vite + React + TypeScript + Tailwind)

**Files:**
- Create: `frontend-user/` (via Vite scaffold)
- Modify: `frontend-user/vite.config.ts`
- Create: `frontend-user/tailwind.config.js`
- Create: `frontend-user/postcss.config.js`

- [ ] **Step 1: 使用 Vite 创建 React + TypeScript 项目**

```bash
cd /d "C:\Users\32654\Desktop\babu_System-Analysis-Design-Modelling-and-Development"
npm create vite@latest frontend-user -- --template react-ts
cd frontend-user && npm install
```

- [ ] **Step 2: 安装额外依赖**

```bash
cd frontend-user && npm install @tanstack/react-query axios react-router-dom
npm install -D tailwindcss @tailwindcss/vite
```

- [ ] **Step 3: 配置 Vite 代理和 Tailwind CSS**

Configure `frontend-user/vite.config.ts`:

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
      '/uploads': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
})
```

- [ ] **Step 4: 添加 Tailwind 入口样式**

Create `frontend-user/src/index.css`:

```css
@import "tailwindcss";
```

- [ ] **Step 5: 验证前端能启动**

```bash
cd frontend-user && npm run dev
```
Expected: Vite dev server starts on http://localhost:5173. Ctrl+C to stop.

- [ ] **Step 6: Commit**

```bash
git add frontend-user/
git commit -m "feat: scaffold user frontend with Vite + React + Tailwind"
```

---

### Task 8: 用户端前端核心结构

**Files:**
- Create: `frontend-user/src/api/client.ts`
- Create: `frontend-user/src/api/auth.ts`
- Create: `frontend-user/src/api/products.ts`
- Create: `frontend-user/src/api/cart.ts`
- Create: `frontend-user/src/api/orders.ts`
- Modify: `frontend-user/src/App.tsx`
- Modify: `frontend-user/src/main.tsx`
- Create: `frontend-user/src/pages/ProductList.tsx`
- Create: `frontend-user/src/pages/ProductDetail.tsx`
- Create: `frontend-user/src/pages/Cart.tsx`
- Create: `frontend-user/src/pages/Checkout.tsx`
- Create: `frontend-user/src/pages/PaymentSuccess.tsx`
- Create: `frontend-user/src/pages/Orders.tsx`
- Create: `frontend-user/src/pages/OrderDetail.tsx`
- Create: `frontend-user/src/pages/Login.tsx`
- Create: `frontend-user/src/pages/Register.tsx`
- Create: `frontend-user/src/components/Layout.tsx`
- Create: `frontend-user/src/components/ProtectedRoute.tsx`
- Create: `frontend-user/src/hooks/useAuth.ts`

- [ ] **Step 1: 创建 API 客户端 `frontend-user/src/api/client.ts`**

```typescript
import axios from 'axios';

const apiClient = axios.create({
  baseURL: '/api',
  timeout: 10000,
});

apiClient.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = sessionStorage.getItem('refreshToken');
      if (refreshToken) {
        try {
          const { data } = await axios.post('/api/auth/refresh', { refreshToken });
          sessionStorage.setItem('accessToken', data.accessToken);
          sessionStorage.setItem('refreshToken', data.refreshToken);
          originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
          return apiClient(originalRequest);
        } catch {
          sessionStorage.clear();
          window.location.href = '/login';
        }
      } else {
        sessionStorage.clear();
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
```

- [ ] **Step 2: 创建 API 模块**

`frontend-user/src/api/auth.ts`:
```typescript
import apiClient from './client';

interface RegisterData {
  name: string;
  email: string;
  password: string;
  role: 'USER' | 'ADMIN';
}

interface LoginData {
  email: string;
  password: string;
}

export const authApi = {
  register: (data: RegisterData) => apiClient.post('/auth/register', data),
  login: (data: LoginData) => apiClient.post('/auth/login', data),
  refresh: (refreshToken: string) => apiClient.post('/auth/refresh', { refreshToken }),
  logout: () => apiClient.post('/auth/logout'),
};
```

`frontend-user/src/api/products.ts`:
```typescript
import apiClient from './client';

export interface Product {
  id: number;
  name: string;
  summary: string;
  description: string;
  price: string;
  stock: number;
  thumbnailUrl: string;
  imageUrl: string;
  isActive: boolean;
}

export const productsApi = {
  getAll: () => apiClient.get<Product[]>('/products'),
  getById: (id: number) => apiClient.get<Product>(`/products/${id}`),
};
```

`frontend-user/src/api/cart.ts`:
```typescript
import apiClient from './client';

export const cartApi = {
  getAll: () => apiClient.get('/cart'),
  add: (productId: number, quantity?: number) => apiClient.post('/cart', { productId, quantity }),
  update: (itemId: number, quantity: number) => apiClient.put(`/cart/${itemId}`, { quantity }),
  remove: (itemId: number) => apiClient.delete(`/cart/${itemId}`),
};
```

`frontend-user/src/api/orders.ts`:
```typescript
import apiClient from './client';

export const ordersApi = {
  create: (data: { recipientName: string; recipientAddress: string; recipientPhone: string }) =>
    apiClient.post('/orders', data),
  getAll: () => apiClient.get('/orders'),
  getById: (id: number) => apiClient.get(`/orders/${id}`),
};
```

- [ ] **Step 3: 创建认证 Hook `frontend-user/src/hooks/useAuth.ts`**

```typescript
import { useState, useEffect, useCallback } from 'react';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = sessionStorage.getItem('user');
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        sessionStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const login = useCallback((userData: User, accessToken: string, refreshToken: string) => {
    sessionStorage.setItem('accessToken', accessToken);
    sessionStorage.setItem('refreshToken', refreshToken);
    sessionStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  }, []);

  const logout = useCallback(() => {
    sessionStorage.clear();
    setUser(null);
  }, []);

  return { user, loading, login, logout, isLoggedIn: !!user };
}
```

- [ ] **Step 4: 创建受保护路由组件 `frontend-user/src/components/ProtectedRoute.tsx`**

```typescript
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

interface Props {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: Props) {
  const { isLoggedIn, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">加载中...</div>;
  }

  if (!isLoggedIn) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
```

- [ ] **Step 5: 创建布局组件 `frontend-user/src/components/Layout.tsx`**

```typescript
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../hooks/useAuth';

export function Layout() {
  const { user, isLoggedIn, logout } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const handleLogout = () => {
    queryClient.clear();
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="text-xl font-bold text-blue-600">简易商城</Link>
          <nav className="flex items-center gap-4">
            <Link to="/" className="text-gray-600 hover:text-blue-600">商品</Link>
            {isLoggedIn && (
              <>
                <Link to="/cart" className="text-gray-600 hover:text-blue-600">购物车</Link>
                <Link to="/orders" className="text-gray-600 hover:text-blue-600">我的订单</Link>
              </>
            )}
            {isLoggedIn ? (
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-500">{user?.name}</span>
                <button onClick={handleLogout} className="text-sm text-red-500 hover:text-red-700">
                  退出
                </button>
              </div>
            ) : (
              <Link to="/login" className="text-gray-600 hover:text-blue-600">登录</Link>
            )}
          </nav>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}
```

- [ ] **Step 6: 创建页面占位组件**

`frontend-user/src/pages/ProductList.tsx`:
```typescript
export function ProductList() {
  return <div>商品列表</div>;
}
```

`frontend-user/src/pages/ProductDetail.tsx`:
```typescript
export function ProductDetail() {
  return <div>商品详情</div>;
}
```

`frontend-user/src/pages/Cart.tsx`:
```typescript
export function Cart() {
  return <div>购物车</div>;
}
```

`frontend-user/src/pages/Checkout.tsx`:
```typescript
export function Checkout() {
  return <div>结算</div>;
}
```

`frontend-user/src/pages/PaymentSuccess.tsx`:
```typescript
export function PaymentSuccess() {
  return <div>支付成功</div>;
}
```

`frontend-user/src/pages/Orders.tsx`:
```typescript
export function Orders() {
  return <div>我的订单</div>;
}
```

`frontend-user/src/pages/OrderDetail.tsx`:
```typescript
export function OrderDetail() {
  return <div>订单详情</div>;
}
```

`frontend-user/src/pages/Login.tsx`:
```typescript
export function Login() {
  return <div>登录</div>;
}
```

`frontend-user/src/pages/Register.tsx`:
```typescript
export function Register() {
  return <div>注册</div>;
}
```

- [ ] **Step 7: 设置主入口和路由 `frontend-user/src/main.tsx`**

```typescript
import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App';
import './index.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </React.StrictMode>
);
```

- [ ] **Step 8: 设置路由 `frontend-user/src/App.tsx`**

```typescript
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { ProductList } from './pages/ProductList';
import { ProductDetail } from './pages/ProductDetail';
import { Cart } from './pages/Cart';
import { Checkout } from './pages/Checkout';
import { PaymentSuccess } from './pages/PaymentSuccess';
import { Orders } from './pages/Orders';
import { OrderDetail } from './pages/OrderDetail';
import { Login } from './pages/Login';
import { Register } from './pages/Register';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<ProductList />} />
          <Route path="product/:id" element={<ProductDetail />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
          <Route path="checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
          <Route path="payment-success/:orderId" element={<ProtectedRoute><PaymentSuccess /></ProtectedRoute>} />
          <Route path="orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
          <Route path="orders/:id" element={<ProtectedRoute><OrderDetail /></ProtectedRoute>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
```

- [ ] **Step 9: 验证用户端前端能启动**

```bash
cd frontend-user && npm run dev
```
Expected: Server starts on http://localhost:5173, pages render placeholder text. Ctrl+C to stop.

- [ ] **Step 10: Commit**

```bash
git add frontend-user/src/
git commit -m "feat: add user frontend pages, routing, API client, and auth"
```

---

### Task 9: 商店端前端脚手架

**Files:**
- Create: `frontend-store/` (via Vite scaffold)
- Same structure as user frontend but for admin

- [ ] **Step 1: 使用 Vite 创建商店端 React + TypeScript 项目**

```bash
cd "C:\Users\32654\Desktop\babu_System-Analysis-Design-Modelling-and-Development"
npm create vite@latest frontend-store -- --template react-ts
cd frontend-store && npm install
```

- [ ] **Step 2: 安装依赖**

```bash
cd frontend-store && npm install @tanstack/react-query axios react-router-dom
npm install -D tailwindcss @tailwindcss/vite
```

- [ ] **Step 3: 配置 Vite 和 Tailwind**

`frontend-store/vite.config.ts`:
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5174,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
      '/uploads': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
})
```

`frontend-store/src/index.css`:
```css
@import "tailwindcss";
```

- [ ] **Step 4: 创建共享的基础设施**

Create `frontend-store/src/api/client.ts` (same as user frontend):
```typescript
import axios from 'axios';

const apiClient = axios.create({
  baseURL: '/api',
  timeout: 10000,
});

apiClient.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = sessionStorage.getItem('refreshToken');
      if (refreshToken) {
        try {
          const { data } = await axios.post('/api/auth/refresh', { refreshToken });
          sessionStorage.setItem('accessToken', data.accessToken);
          sessionStorage.setItem('refreshToken', data.refreshToken);
          originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
          return apiClient(originalRequest);
        } catch {
          sessionStorage.clear();
          window.location.href = '/login';
        }
      } else {
        sessionStorage.clear();
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
```

Create `frontend-store/src/hooks/useAuth.ts` (same pattern, check ADMIN role):
```typescript
import { useState, useEffect, useCallback } from 'react';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = sessionStorage.getItem('user');
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as User;
        if (!parsed.role.includes('ADMIN')) {
          sessionStorage.clear();
          setUser(null);
        } else {
          setUser(parsed);
        }
      } catch {
        sessionStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const login = useCallback((userData: User, accessToken: string, refreshToken: string) => {
    if (!userData.role.includes('ADMIN')) return false;
    sessionStorage.setItem('accessToken', accessToken);
    sessionStorage.setItem('refreshToken', refreshToken);
    sessionStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    return true;
  }, []);

  const logout = useCallback(() => {
    sessionStorage.clear();
    setUser(null);
  }, []);

  return { user, loading, login, logout, isLoggedIn: !!user };
}
```

Create `frontend-store/src/api/auth.ts`:
```typescript
import apiClient from './client';

interface RegisterData {
  name: string;
  email: string;
  password: string;
  role: 'USER' | 'ADMIN';
}

interface LoginData {
  email: string;
  password: string;
}

export const authApi = {
  register: (data: RegisterData) => apiClient.post('/auth/register', data),
  login: (data: LoginData) => apiClient.post('/auth/login', data),
  refresh: (refreshToken: string) => apiClient.post('/auth/refresh', { refreshToken }),
  logout: () => apiClient.post('/auth/logout'),
};
```

Create `frontend-store/src/api/products.ts`:
```typescript
import apiClient from './client';

export interface Product {
  id: number;
  name: string;
  summary: string;
  description: string;
  price: string;
  stock: number;
  thumbnailUrl: string;
  imageUrl: string;
  isActive: boolean;
}

export const productsApi = {
  getAll: (showAll = true) => apiClient.get<Product[]>('/products', { params: { all: showAll } }),
  getById: (id: number) => apiClient.get<Product>(`/products/${id}`),
  create: (formData: FormData) =>
    apiClient.post('/products', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update: (id: number, formData: FormData) =>
    apiClient.put(`/products/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  toggle: (id: number) => apiClient.patch(`/products/${id}/toggle`),
};
```

Create `frontend-store/src/api/orders.ts`:
```typescript
import apiClient from './client';

export const ordersApi = {
  getAll: () => apiClient.get('/orders'),
  getById: (id: number) => apiClient.get(`/orders/${id}`),
  updateStatus: (id: number, status: 'SHIPPED' | 'COMPLETED') =>
    apiClient.patch(`/orders/${id}/status`, { status }),
};
```

- [ ] **Step 5: 创建商店端组件和页面**

`frontend-store/src/components/Layout.tsx`:
```typescript
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export function Layout() {
  const { user, isLoggedIn, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="text-xl font-bold text-green-600">商店管理</Link>
          {isLoggedIn && (
            <nav className="flex items-center gap-4">
              <Link to="/" className="text-gray-600 hover:text-green-600">商品管理</Link>
              <Link to="/orders" className="text-gray-600 hover:text-green-600">订单管理</Link>
              <span className="text-sm text-gray-500">{user?.name}</span>
              <button onClick={handleLogout} className="text-sm text-red-500 hover:text-red-700">退出</button>
            </nav>
          )}
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}
```

`frontend-store/src/components/ProtectedRoute.tsx`:
```typescript
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

interface Props {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: Props) {
  const { isLoggedIn, loading } = useAuth();

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">加载中...</div>;
  }

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
```

Page placeholders:

`frontend-store/src/pages/ProductManage.tsx`:
```typescript
export function ProductManage() {
  return <div>商品管理</div>;
}
```

`frontend-store/src/pages/ProductForm.tsx`:
```typescript
export function ProductForm() {
  return <div>商品表单</div>;
}
```

`frontend-store/src/pages/Orders.tsx`:
```typescript
export function Orders() {
  return <div>订单管理</div>;
}
```

`frontend-store/src/pages/OrderDetail.tsx`:
```typescript
export function OrderDetail() {
  return <div>订单详情</div>;
}
```

`frontend-store/src/pages/Login.tsx`:
```typescript
export function Login() {
  return <div>商店端登录</div>;
}
```

`frontend-store/src/pages/Register.tsx`:
```typescript
export function Register() {
  return <div>商店端注册</div>;
}
```

- [ ] **Step 6: 设置路由 `frontend-store/src/App.tsx`**

```typescript
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { ProductManage } from './pages/ProductManage';
import { ProductForm } from './pages/ProductForm';
import { Orders } from './pages/Orders';
import { OrderDetail } from './pages/OrderDetail';
import { Login } from './pages/Login';
import { Register } from './pages/Register';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route index element={<ProductManage />} />
          <Route path="products/new" element={<ProductForm />} />
          <Route path="products/:id/edit" element={<ProductForm />} />
          <Route path="orders" element={<Orders />} />
          <Route path="orders/:id" element={<OrderDetail />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
```

- [ ] **Step 7: 设置入口 `frontend-store/src/main.tsx`**

```typescript
import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App';
import './index.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </React.StrictMode>
);
```

- [ ] **Step 8: 验证商店端前端能启动**

```bash
cd frontend-store && npm run dev
```
Expected: Server starts on http://localhost:5174, protected routes redirect to /login.

- [ ] **Step 9: Commit**

```bash
git add frontend-store/
git commit -m "feat: scaffold store frontend with Vite + React + Tailwind"
```

---

## Self-Review

### 1. Spec Coverage

| Spec Section | Task |
|-------------|------|
| 技术路线 (Architecture Diagram) | Task 1 (Docker Compose) |
| 技术栈明细 (Tech Stack Details) | Tasks 2-9 |
| 项目结构 (Project Structure) | Task 1, 3, 7, 9 |
| 端口规划 | Task 1, 7, 9 |
| 数据模型 (Prisma Schema) | Task 4 |
| API 接口 | Task 5, 6 |
| U01 商品列表 | Placeholder in Task 8 |
| U02 商品详情 | Placeholder in Task 8 |
| U03 购物车 | Placeholder in Task 8 |
| U04 结算支付 | Placeholder in Task 8 |
| U05 历史订单 | Placeholder in Task 8 |
| U06 注册登录 | Placeholder in Task 8 (reused in Task 9) |
| S01 注册登录 | Placeholder in Task 9 |
| S02 商品管理 | Placeholder in Task 9 |
| S03 订单管理 | Placeholder in Task 9 |

**Gaps identified:** All placeholder pages need to be implemented in a subsequent plan. The current plan covers the full project skeleton — Docker, complete backend with all 30 API endpoints (auth/product/cart/order/categories/reviews/dashboard + Prisma transactions + OrderSequence + stock validation), and frontend structure with routing. This is intentional: this plan delivers a runnable skeleton.

### 2. Placeholder Scan
- No "TBD" or "TODO" found
- No "implement later" found
- No "add appropriate error handling" — all error handling is explicitly implemented
- Page placeholders are actual components returning placeholder text — not instructions to implement later

### 3. Type Consistency
- `TokenPayload` interface used consistently across auth middleware and JWT lib
- `Product` interface in frontend matches Prisma schema
- Route paths consistent between frontend pages and backend API
- API client paths match backend route definitions

---

**Plan complete and saved to `docs/superpowers/plans/2026-06-02-project-scaffolding.md`.**

This plan delivers a full runnable project skeleton:
- Docker Compose with MySQL + backend
- Complete backend with all routes, middleware, and auth logic
- User frontend with routing and API client setup
- Store frontend with routing and API client setup
- All page placeholders ready for feature implementation in the next plan

The next phase would be implementing each page with full UI components, TanStack Query hooks, and connecting to the backend.
