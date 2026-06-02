# 小型电商演示平台 — 完整实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 以需求规格说明书为核心蓝本，统一实施后端（30 API 端点）+ 用户端前端（10 页面）+ 商店端前端（8 页面），交付完整可运行的全栈电商演示平台

**Architecture:** Docker Compose 编排 MySQL 8 + Express/Prisma 后端 + 两个 Vite/React 前端。后端 7 个路由文件覆盖认证/商品/购物车/订单/分类/评价/仪表盘，全部 30 个 API 端点含完整业务逻辑。两个前端各自独立构建，共享 axios interceptor + TanStack Query 模式，通过 Vite proxy 统一转发到后端 3000 端口。

**Tech Stack:** Docker Compose, MySQL 8, Node.js 20+, Express 4, TypeScript 5, Prisma 5, Tailwind CSS 3, React 18, Vite 5, TanStack Query 5, axios, React Router 6, zod, multer, JWT, swagger-jsdoc

---

## Phase 0：需求规格说明书覆盖矩阵

本计划以 `docs/需求规格说明书.md` 为核心蓝本，每个功能模块均映射到具体 Task：

| 模块 | 说明 | 后端 API | 用户端页面 | 商店端页面 |
|------|------|---------|-----------|-----------|
| U01 | 商品列表+分类筛选 | GET /products, GET /categories | ProductList | — |
| U02 | 商品详情+加购 | GET /products/:id | ProductDetail | — |
| U03 | 购物车管理 | GET/POST/PUT/DELETE /cart | Cart | — |
| U04 | 结算+模拟支付 | POST /orders | Checkout, PaymentSuccess | — |
| U05 | 历史订单 | GET /orders, GET /orders/:id, POST /orders/:id/confirm | Orders, OrderDetail | — |
| U06 | 注册登录 | POST /auth/register, /login, /refresh, /logout, /forgot-password, GET /me | Login, Register, Profile | — |
| U07 | 订单取消+售后 | POST /orders/:id/cancel, /return | OrderDetail | — |
| U08 | 个人中心 | PUT /auth/profile, /password | Profile | — |
| U09 | 商品评价 | POST /orders/:id/review, GET /products/:id/reviews | OrderDetail, ProductDetail | — |
| S01 | 商店端注册登录 | 同 U06 API | — | Login, Register |
| S02 | 商品管理 | POST/PUT/PATCH /products, GET /categories | — | ProductManage, ProductForm |
| S03 | 订单管理+退货审批 | PATCH /orders/:id/status, /return/approve, /return/reject | — | Orders, OrderDetail |
| S04 | 仪表盘 | GET /dashboard | — | Dashboard |
| S05 | 管理员个人中心 | PUT /auth/profile, /password | — | Profile |

---

## Phase 1：后端基础设施与全部 30 个 API 端点

Phase 1 的代码在 `docs/superpowers/plans/2026-06-02-project-scaffolding.md` 中已完整编写。以下摘要引用各 Task，仅标注差异与补充。

### Task 1.1：根目录 Docker Compose + .gitignore

**参考：** `2026-06-02-project-scaffolding.md` Task 1（代码完整，直接执行）

### Task 1.2：后端 Dockerfile + .dockerignore

**参考：** `2026-06-02-project-scaffolding.md` Task 2（代码完整，直接执行）

### Task 1.3：后端 package.json + tsconfig.json + .env

**参考：** `2026-06-02-project-scaffolding.md` Task 3（代码完整，直接执行）

### Task 1.4：Prisma Schema + Seed

**参考：** `2026-06-02-project-scaffolding.md` Task 4（代码完整，8 表 Prisma schema + admin seed）

### Task 1.5：Express 入口、核心中间件、zod Schemas

**参考：** `2026-06-02-project-scaffolding.md` Task 5（代码完整）

**补充：** `backend/src/lib/prisma.ts` 需要增加 Decimal 序列化：

- [ ] **Step 1: 修改 `backend/src/lib/prisma.ts`**

```typescript
import { PrismaClient } from '@prisma/client';

// Prisma Decimal → Number 全局序列化，避免 $numberDecimal 脏数据
(Decimal.prototype as any).toJSON = function () {
  return Number(this.toString());
};

const prisma = new PrismaClient();

export default prisma;
```

注意：需在文件顶部添加 `import { Decimal } from '@prisma/client/runtime/library';`

### Task 1.6：后端 7 个路由文件（30 个 API 端点）

**参考：** `2026-06-02-project-scaffolding.md` Task 6（代码完整）

覆盖所有 30 个端点：
- `auth.ts`（8 个）：register, login, refresh, logout, forgot-password, GET /me, PUT /profile, PUT /password
- `products.ts`（5 个）：GET /, GET /:id, POST /, PUT /:id, PATCH /:id/toggle
- `cart.ts`（4 个）：GET /, POST /, PUT /:itemId, DELETE /:itemId
- `orders.ts`（9 个）：POST /, GET /, GET /:id, PATCH /:id/status, POST /:id/confirm, /cancel, /return, /return/approve, /return/reject
- `categories.ts`（1 个）：GET /
- `reviews.ts`（2 个）：GET /products/:id/reviews, POST /orders/:id/review
- `dashboard.ts`（1 个）：GET /

---

## Phase 2：用户端前端完整实现（10 页面）

**目标：** 实现需求规格说明书 U01-U09 全部 9 个功能模块，覆盖 loading/empty/error 三态，TanStack Query 数据获取，Tailwind CSS 样式。

### Task 2.1：用户端项目骨架 + 基础设施

**参考：** `2026-06-02-project-scaffolding.md` Task 7 + Task 8 Steps 1-8

这些 Steps 已包含：Vite 项目创建、依赖安装、vite.config.ts 代理、Tailwind 配置、API client（含 401 拦截刷新）、4 个 API 模块（auth/products/cart/orders）、useAuth hook、ProtectedRoute、Layout、App.tsx 路由、main.tsx 入口。

**直接执行 scaffolding plan 的 Task 7 Steps 1-6 + Task 8 Steps 1-8。**

---

### Task 2.2：Login 页面

**Spec: U06 — 登录表单：邮箱 + 密码 + 忘记密码链接**

**Files:**
- Modify: `frontend-user/src/pages/Login.tsx`
- Modify: `frontend-user/src/api/auth.ts`（追加 forgotPassword 和 getMe 方法）

- [ ] **Step 1: 替换 auth API 模块（追加 forgotPassword/getMe/updateProfile/updatePassword 方法）**

将 `frontend-user/src/api/auth.ts` 中的 `authApi` 对象替换为完整版：

```typescript
export const authApi = {
  register: (data: RegisterData) => apiClient.post('/auth/register', data),
  login: (data: LoginData) => apiClient.post('/auth/login', data),
  refresh: (refreshToken: string) => apiClient.post('/auth/refresh', { refreshToken }),
  logout: () => apiClient.post('/auth/logout'),
  forgotPassword: (email: string) => apiClient.post('/auth/forgot-password', { email }),
  getMe: () => apiClient.get('/auth/me'),
  updateProfile: (name: string) => apiClient.put('/auth/profile', { name }),
  updatePassword: (oldPassword: string, newPassword: string) =>
    apiClient.put('/auth/password', { oldPassword, newPassword }),
};
```

- [ ] **Step 2: 实现 Login 页面**

```typescript
import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { authApi } from '../api/auth';
import { useAuth } from '../hooks/useAuth';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [forgotEmail, setForgotEmail] = useState('');
  const [showForgot, setShowForgot] = useState(false);
  const [forgotMsg, setForgotMsg] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const from = (location.state as any)?.from?.pathname || '/';

  const loginMutation = useMutation({
    mutationFn: () => authApi.login({ email, password }),
    onSuccess: (res) => {
      const { user, accessToken, refreshToken } = res.data;
      login(user, accessToken, refreshToken);
      navigate(from, { replace: true });
    },
  });

  const forgotMutation = useMutation({
    mutationFn: () => authApi.forgotPassword(forgotEmail),
    onSuccess: (res) => setForgotMsg(res.data.message),
    onError: (err: any) => setForgotMsg(err.response?.data?.message || '操作失败'),
  });

  return (
    <div className="max-w-md mx-auto mt-16">
      <h1 className="text-2xl font-bold text-center mb-8">登录</h1>
      {loginMutation.isError && (
        <div className="bg-red-50 text-red-600 p-3 rounded mb-4 text-sm">
          {(loginMutation.error as any)?.response?.data?.message || '登录失败'}
        </div>
      )}
      <form
        onSubmit={(e) => { e.preventDefault(); loginMutation.mutate(); }}
        className="space-y-4"
      >
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">邮箱</label>
          <input
            type="email" value={email} onChange={(e) => setEmail(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">密码</label>
          <input
            type="password" value={password} onChange={(e) => setPassword(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            required
          />
        </div>
        <button
          type="submit" disabled={loginMutation.isPending}
          className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {loginMutation.isPending ? '登录中...' : '登录'}
        </button>
      </form>
      <div className="mt-4 text-center text-sm space-y-2">
        <p>还没有账号？<Link to="/register" className="text-blue-600 hover:underline">去注册</Link></p>
        <button
          onClick={() => setShowForgot(!showForgot)}
          className="text-gray-500 hover:text-blue-600"
        >
          忘记密码？
        </button>
      </div>
      {showForgot && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600 mb-2">输入注册邮箱，密码将重置为 123456</p>
          <div className="flex gap-2">
            <input
              type="email" value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)}
              placeholder="注册邮箱" className="flex-1 border rounded px-2 py-1 text-sm"
            />
            <button
              onClick={() => forgotMutation.mutate()} disabled={forgotMutation.isPending}
              className="px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700 disabled:opacity-50"
            >
              重置
            </button>
          </div>
          {forgotMsg && <p className="mt-2 text-sm text-green-600">{forgotMsg}</p>}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add frontend-user/src/pages/Login.tsx frontend-user/src/api/auth.ts
git commit -m "feat: implement user login page with forgot password"
```

---

### Task 2.3：Register 页面

**Spec: U06 — 注册表单：用户名 + 邮箱 + 密码 + 确认密码，角色默认 USER**

**Files:**
- Modify: `frontend-user/src/pages/Register.tsx`

- [ ] **Step 1: 实现 Register 页面**

```typescript
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { authApi } from '../api/auth';
import { useAuth } from '../hooks/useAuth';

export function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [localError, setLocalError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const registerMutation = useMutation({
    mutationFn: () => {
      if (password !== confirmPassword) throw new Error('两次密码不一致');
      if (password.length < 6) throw new Error('密码至少6位');
      return authApi.register({ name, email, password, role: 'USER' });
    },
    onSuccess: (res) => {
      const { user, accessToken, refreshToken } = res.data;
      login(user, accessToken, refreshToken);
      navigate('/', { replace: true });
    },
    onError: (err: any) => {
      if (err.response?.data?.message) setLocalError(err.response.data.message);
      else if (err.message) setLocalError(err.message);
    },
  });

  return (
    <div className="max-w-md mx-auto mt-16">
      <h1 className="text-2xl font-bold text-center mb-8">注册</h1>
      {localError && (
        <div className="bg-red-50 text-red-600 p-3 rounded mb-4 text-sm">{localError}</div>
      )}
      <form
        onSubmit={(e) => { e.preventDefault(); setLocalError(''); registerMutation.mutate(); }}
        className="space-y-4"
      >
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">用户名</label>
          <input
            type="text" value={name} onChange={(e) => setName(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            required minLength={2}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">邮箱</label>
          <input
            type="email" value={email} onChange={(e) => setEmail(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">密码</label>
          <input
            type="password" value={password} onChange={(e) => setPassword(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            required minLength={6}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">确认密码</label>
          <input
            type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            required
          />
        </div>
        <button
          type="submit" disabled={registerMutation.isPending}
          className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {registerMutation.isPending ? '注册中...' : '注册'}
        </button>
      </form>
      <p className="mt-4 text-center text-sm">
        已有账号？<Link to="/login" className="text-blue-600 hover:underline">去登录</Link>
      </p>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend-user/src/pages/Register.tsx
git commit -m "feat: implement user register page"
```

---

### Task 2.4：ProductList 页面

**Spec: U01 — 商品卡片网格 + 左侧分类树 + 顶部搜索 + loading/空/错误三态**

**Files:**
- Modify: `frontend-user/src/pages/ProductList.tsx`
- Modify: `frontend-user/src/api/products.ts`（追加 categories API）

- [ ] **Step 1: 追加 categories API**

```typescript
// 在 frontend-user/src/api/products.ts 末尾追加
import apiClient from './client';

// ... 保留原有 Product interface 和 productsApi ...

interface Category {
  id: number;
  name: string;
  parentId: number | null;
  children?: Category[];
}

export const categoriesApi = {
  getTree: () => apiClient.get<Category[]>('/categories'),
};
```

- [ ] **Step 2: 实现 ProductList 页面**

```typescript
import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { productsApi, categoriesApi, Product } from '../api/products';

export function ProductList() {
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [searchKeyword, setSearchKeyword] = useState('');

  const { data: products, isLoading, isError, refetch } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const res = await productsApi.getAll();
      return res.data;
    },
  });

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await categoriesApi.getTree();
      return res.data;
    },
  });

  // 构建 categoryId → 名称的映射表（含二级分类）
  const categoryNameMap = useMemo(() => {
    const map: Record<number, string> = {};
    categories?.forEach((cat) => {
      map[cat.id] = cat.name;
      cat.children?.forEach((child) => {
        map[child.id] = child.name;
      });
    });
    return map;
  }, [categories]);

  const filtered = useMemo(() => {
    if (!products) return [];
    let result = products;
    if (selectedCategoryId) {
      result = result.filter((p: any) => p.categoryId === selectedCategoryId);
    }
    if (searchKeyword.trim()) {
      const kw = searchKeyword.trim().toLowerCase();
      result = result.filter((p: Product) => p.name.toLowerCase().includes(kw));
    }
    return result;
  }, [products, selectedCategoryId, searchKeyword]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="bg-white rounded-lg p-4 animate-pulse">
            <div className="bg-gray-200 aspect-square rounded mb-3" />
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
            <div className="h-3 bg-gray-200 rounded w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500 mb-4">加载失败，请稍后重试</p>
        <button onClick={() => refetch()} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          重试
        </button>
      </div>
    );
  }

  return (
    <div className="flex gap-6">
      {/* 左侧分类树 */}
      <aside className="w-48 shrink-0">
        <h3 className="font-medium text-gray-700 mb-3">商品分类</h3>
        <ul className="space-y-1">
          <li>
            <button
              onClick={() => setSelectedCategoryId(null)}
              className={`w-full text-left px-3 py-1.5 rounded text-sm ${
                selectedCategoryId === null ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              全部
            </button>
          </li>
          {categories?.map((cat) => (
            <li key={cat.id}>
              <button
                onClick={() => setSelectedCategoryId(cat.id)}
                className={`w-full text-left px-3 py-1.5 rounded text-sm ${
                  selectedCategoryId === cat.id ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {cat.name}
              </button>
              {cat.children && cat.children.length > 0 && (
                <ul className="ml-3 mt-1 space-y-1">
                  {cat.children.map((child) => (
                    <li key={child.id}>
                      <button
                        onClick={() => setSelectedCategoryId(child.id)}
                        className={`w-full text-left px-3 py-1 rounded text-sm ${
                          selectedCategoryId === child.id ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-500 hover:bg-gray-100'
                        }`}
                      >
                        {child.name}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      </aside>

      {/* 右侧商品列表 */}
      <div className="flex-1">
        {/* 搜索框 */}
        <div className="mb-6">
          <input
            type="text" value={searchKeyword} onChange={(e) => setSearchKeyword(e.target.value)}
            placeholder="搜索商品名称..."
            className="w-full max-w-md border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          />
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-400 text-lg">暂无商品</p>
            {searchKeyword && <p className="text-gray-400 text-sm mt-1">试试其他关键词</p>}
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-4">
            {filtered.map((product: any) => (
              <Link
                key={product.id}
                to={`/product/${product.id}`}
                className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="aspect-square bg-gray-100">
                  {product.thumbnailUrl ? (
                    <img
                      src={`/${product.thumbnailUrl}`} alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300 text-sm">暂无图片</div>
                  )}
                </div>
                <div className="p-3">
                  <h3 className="font-medium text-gray-800 truncate">{product.name}</h3>
                  <p className="text-sm text-gray-400 truncate mt-1">{product.summary}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-red-500 font-bold text-lg">&yen;{Number(product.price).toFixed(2)}</span>
                    <span className="text-xs text-gray-400">{categoryNameMap[product.categoryId] || '-'}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add frontend-user/src/pages/ProductList.tsx frontend-user/src/api/products.ts
git commit -m "feat: implement product list with category tree and search"
```

---

### Task 2.5：ProductDetail 页面

**Spec: U02 — 大图 + 完整描述 + 价格 + 库存 + 数量选择器 + 加入购物车（库存校验 + 未登录拦截）**

**Files:**
- Modify: `frontend-user/src/pages/ProductDetail.tsx`

- [ ] **Step 1: 实现 ProductDetail 页面**

```typescript
import { useState, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productsApi, categoriesApi } from '../api/products';
import { cartApi } from '../api/cart';
import { useAuth } from '../hooks/useAuth';

export function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [quantity, setQuantity] = useState(1);
  const [addedMsg, setAddedMsg] = useState('');

  const { data: product, isLoading, isError } = useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      const res = await productsApi.getById(Number(id));
      return res.data;
    },
    enabled: !!id,
  });

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => { const res = await categoriesApi.getTree(); return res.data; },
  });

  const categoryName = useMemo(() => {
    if (!categories || !product) return '';
    for (const cat of categories) {
      if (cat.id === (product as any).categoryId) return cat.name;
      const child = cat.children?.find((c: any) => c.id === (product as any).categoryId);
      if (child) return child.name;
    }
    return '';
  }, [categories, product]);

  const addMutation = useMutation({
    mutationFn: () => cartApi.add(Number(id), quantity),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      setAddedMsg('已加入购物车');
    },
  });

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto animate-pulse">
        <div className="flex gap-8">
          <div className="w-96 aspect-[4/3] bg-gray-200 rounded" />
          <div className="flex-1 space-y-4">
            <div className="h-8 bg-gray-200 rounded w-3/4" />
            <div className="h-4 bg-gray-200 rounded w-1/2" />
            <div className="h-10 bg-gray-200 rounded w-1/3" />
          </div>
        </div>
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500 text-lg mb-4">商品不存在或已下架</p>
        <Link to="/" className="text-blue-600 hover:underline">返回商品列表</Link>
      </div>
    );
  }

  const handleAddToCart = () => {
    if (!isLoggedIn) {
      navigate('/login', { state: { from: { pathname: `/product/${id}` } } });
      return;
    }
    addMutation.mutate();
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex gap-8">
        {/* 左侧大图 */}
        <div className="w-96 shrink-0">
          <div className="aspect-[4/3] bg-gray-100 rounded-lg overflow-hidden">
            {product.imageUrl ? (
              <img src={`/${product.imageUrl}`} alt={product.name}
                className="w-full h-full object-contain" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-300">暂无图片</div>
            )}
          </div>
        </div>
        {/* 右侧信息 */}
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-800">{product.name}</h1>
          <p className="text-gray-500 mt-2">{product.summary}</p>
          {categoryName && <p className="text-sm text-blue-500 mt-1">分类：{categoryName}</p>}
          <div className="mt-6 text-3xl font-bold text-red-500">
            &yen;{Number(product.price).toFixed(2)}
          </div>
          <div className="mt-4 text-sm text-gray-500">
            库存：{product.stock > 0 ? (
              <span className="text-green-600">{product.stock} 件</span>
            ) : (
              <span className="text-red-500">暂时缺货</span>
            )}
          </div>
          {/* 数量选择 + 加购 */}
          <div className="mt-6 flex items-center gap-4">
            <div className="flex items-center border rounded-lg">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="px-3 py-2 text-gray-500 hover:bg-gray-50"
              >
                -
              </button>
              <span className="px-4 py-2 border-x">{quantity}</span>
              <button
                onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                className="px-3 py-2 text-gray-500 hover:bg-gray-50"
              >
                +
              </button>
            </div>
            <button
              onClick={handleAddToCart}
              disabled={addMutation.isPending || product.stock === 0 || !product.isActive}
              className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {addMutation.isPending ? '添加中...' : !product.isActive ? '已下架' : product.stock === 0 ? '暂时缺货' : '加入购物车'}
            </button>
          </div>
          {addMutation.isError && (
            <p className="mt-2 text-sm text-red-500">
              {(addMutation.error as any)?.response?.data?.message || '操作失败'}
            </p>
          )}
          {addedMsg && (
            <div className="mt-4 p-3 bg-green-50 text-green-700 rounded-lg text-sm">
              <p>{addedMsg}</p>
              <div className="mt-2 flex gap-3">
                <Link to="/cart" className="text-blue-600 hover:underline font-medium">去购物车</Link>
                <Link to="/" className="text-gray-500 hover:underline">继续逛逛</Link>
              </div>
            </div>
          )}
          {/* 完整描述 */}
          <div className="mt-8">
            <h3 className="font-medium text-gray-700 mb-2">商品详情</h3>
            <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">{product.description}</p>
          </div>
        </div>
      </div>
      {/* 评价区域 — Task 2.10 实现 */}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend-user/src/pages/ProductDetail.tsx
git commit -m "feat: implement product detail with add-to-cart"
```

---

### Task 2.6：Cart 页面

**Spec: U03 — 购物车列表 + 数量修改 + 删除 + 下架标记 + 总金额 + 空购物车状态**

**Files:**
- Modify: `frontend-user/src/pages/Cart.tsx`
- Modify: `frontend-user/src/components/Layout.tsx`（追加购物车徽标）

- [ ] **Step 1: 实现 Cart 页面**

```typescript
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cartApi } from '../api/cart';

export function Cart() {
  const queryClient = useQueryClient();

  const { data: cartItems, isLoading, isError } = useQuery({
    queryKey: ['cart'],
    queryFn: async () => {
      const res = await cartApi.getAll();
      return res.data;
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ itemId, quantity }: { itemId: number; quantity: number }) =>
      cartApi.update(itemId, quantity),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cart'] }),
  });

  const removeMutation = useMutation({
    mutationFn: (itemId: number) => cartApi.remove(itemId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cart'] }),
  });

  if (isLoading) {
    return <div className="text-center py-20 text-gray-400">加载中...</div>;
  }

  if (isError) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500 mb-4">加载购物车失败</p>
        <button onClick={() => queryClient.invalidateQueries({ queryKey: ['cart'] })}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">重试</button>
      </div>
    );
  }

  const items = cartItems || [];
  const total = items
    .filter((item: any) => item.product.isActive)
    .reduce((sum: number, item: any) => sum + Number(item.product.price) * item.quantity, 0);

  if (items.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-400 text-lg">购物车是空的</p>
        <Link to="/" className="mt-4 inline-block text-blue-600 hover:underline">去逛逛</Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">购物车</h1>
      {(updateMutation.isError || removeMutation.isError) && (
        <div className="bg-red-50 text-red-600 p-3 rounded mb-4 text-sm">
          {((updateMutation.error || removeMutation.error) as any)?.response?.data?.message || '操作失败'}
        </div>
      )}
      <div className="bg-white rounded-lg shadow-sm">
        {items.map((item: any) => {
          const isOff = !item.product.isActive;
          return (
            <div key={item.id} className="flex items-center gap-4 p-4 border-b last:border-0">
              <div className="w-20 h-20 bg-gray-100 rounded overflow-hidden shrink-0">
                {item.product.thumbnailUrl ? (
                  <img src={`/${item.product.thumbnailUrl}`} alt={item.product.name}
                    className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">暂无</div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <Link to={`/product/${item.productId}`} className="font-medium text-gray-800 hover:text-blue-600 truncate block">
                  {item.product.name}
                </Link>
                <p className="text-red-500 text-sm mt-1">&yen;{Number(item.product.price).toFixed(2)}</p>
                {isOff && <span className="text-xs text-red-500 bg-red-50 px-1.5 py-0.5 rounded">已下架</span>}
              </div>
              {isOff ? (
                <button
                  onClick={() => { if (window.confirm('确认要删除此商品吗？')) removeMutation.mutate(item.id); }}
                  className="text-sm text-red-500 hover:text-red-700"
                >
                  删除
                </button>
              ) : (
                <>
                  <div className="flex items-center border rounded">
                    <button
                      onClick={() => item.quantity > 1 && updateMutation.mutate({ itemId: item.id, quantity: item.quantity - 1 })}
                      className="px-2 py-1 text-gray-500 hover:bg-gray-50 text-sm"
                    >
                      -
                    </button>
                    <span className="px-3 py-1 border-x text-sm">{item.quantity}</span>
                    <button
                      onClick={() => item.quantity < item.product.stock && updateMutation.mutate({ itemId: item.id, quantity: item.quantity + 1 })}
                      className="px-2 py-1 text-gray-500 hover:bg-gray-50 text-sm"
                    >
                      +
                    </button>
                  </div>
                  <div className="text-gray-700 font-medium w-24 text-right">
                    &yen;{(Number(item.product.price) * item.quantity).toFixed(2)}
                  </div>
                  <button
                    onClick={() => { if (window.confirm('确认要删除此商品吗？')) removeMutation.mutate(item.id); }}
                    className="text-sm text-gray-400 hover:text-red-500"
                  >
                    删除
                  </button>
                </>
              )}
            </div>
          );
        })}
      </div>
      <div className="mt-6 flex items-center justify-between bg-white rounded-lg p-4 shadow-sm">
        <span className="text-gray-600">
          共 {items.filter((i: any) => i.product.isActive).length} 件商品
        </span>
        <div className="flex items-center gap-4">
          <span className="text-xl font-bold text-red-500">&yen;{total.toFixed(2)}</span>
          <Link
            to="/checkout"
            className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            去结算
          </Link>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: 更新 Layout 组件 — 购物车数量徽标**

在 Layout 组件的购物车链接旁追加数量徽标。修改 `frontend-user/src/components/Layout.tsx`，将购物车链接替换为：

```typescript
// 在组件顶部添加 import
import { useQuery } from '@tanstack/react-query';
import { cartApi } from '../api/cart';

// 在 Layout 组件内部添加
const { data: cartData } = useQuery({
  queryKey: ['cart'],
  queryFn: async () => { const res = await cartApi.getAll(); return res.data; },
  enabled: isLoggedIn,
});

const cartCount = cartData?.length || 0;

// 将购物车 Link 替换为:
<Link to="/cart" className="text-gray-600 hover:text-blue-600 relative">
  购物车
  {cartCount > 0 && (
    <span className="absolute -top-2 -right-4 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
      {cartCount}
    </span>
  )}
</Link>
```

- [ ] **Step 3: Commit**

```bash
git add frontend-user/src/pages/Cart.tsx frontend-user/src/components/Layout.tsx
git commit -m "feat: implement cart page with quantity controls and badge"
```

---

### Task 2.7：Checkout + PaymentSuccess 页面

**Spec: U04 — 收货信息表单 + 商品清单 + 总金额 + 重复提交防护 + 支付成功展示**

**Files:**
- Modify: `frontend-user/src/pages/Checkout.tsx`
- Modify: `frontend-user/src/pages/PaymentSuccess.tsx`

- [ ] **Step 1: 实现 Checkout 页面**

```typescript
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { cartApi } from '../api/cart';
import { ordersApi } from '../api/orders';

export function Checkout() {
  const navigate = useNavigate();
  const [recipientName, setRecipientName] = useState('');
  const [recipientAddress, setRecipientAddress] = useState('');
  const [recipientPhone, setRecipientPhone] = useState('');

  const { data: cartItems, isLoading } = useQuery({
    queryKey: ['cart'],
    queryFn: async () => { const res = await cartApi.getAll(); return res.data; },
  });

  const items = (cartItems || []).filter((item: any) => item.product.isActive);
  const total = items.reduce((sum: number, item: any) => sum + Number(item.product.price) * item.quantity, 0);

  const createOrderMutation = useMutation({
    mutationFn: () => ordersApi.create({ recipientName, recipientAddress, recipientPhone }),
    onSuccess: (res) => {
      navigate(`/payment-success/${res.data.id}`, { replace: true });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;
    createOrderMutation.mutate();
  };

  if (isLoading) {
    return <div className="text-center py-20 text-gray-400">加载中...</div>;
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-400 text-lg">购物车中无可结算商品</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">确认订单</h1>
      {/* 收货信息 */}
      <div className="bg-white rounded-lg p-6 shadow-sm mb-4">
        <h2 className="font-medium mb-4">收货信息</h2>
        <form id="checkout-form" onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">收货人</label>
            <input type="text" value={recipientName} onChange={(e) => setRecipientName(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">收货地址</label>
            <input type="text" value={recipientAddress} onChange={(e) => setRecipientAddress(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">联系电话</label>
            <input type="text" value={recipientPhone} onChange={(e) => setRecipientPhone(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
              required pattern="[0-9]{7,15}" title="7-15位数字" />
          </div>
        </form>
      </div>
      {/* 商品清单 */}
      <div className="bg-white rounded-lg p-6 shadow-sm mb-4">
        <h2 className="font-medium mb-4">商品清单</h2>
        {items.map((item: any) => (
          <div key={item.id} className="flex items-center gap-3 py-2 border-b last:border-0">
            <span className="flex-1 text-sm">{item.product.name} × {item.quantity}</span>
            <span className="text-sm text-gray-600">&yen;{(Number(item.product.price) * item.quantity).toFixed(2)}</span>
          </div>
        ))}
        <div className="flex justify-between items-center mt-4 pt-4 border-t">
          <span className="font-medium">合计</span>
          <span className="text-xl font-bold text-red-500">&yen;{total.toFixed(2)}</span>
        </div>
      </div>
      {createOrderMutation.isError && (
        <div className="bg-red-50 text-red-600 p-3 rounded mb-4 text-sm">
          {(createOrderMutation.error as any)?.response?.data?.message || '提交订单失败'}
        </div>
      )}
      <button
        type="submit" form="checkout-form"
        disabled={createOrderMutation.isPending}
        className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-lg"
      >
        {createOrderMutation.isPending ? '提交中...' : '提交订单并支付'}
      </button>
    </div>
  );
}
```

- [ ] **Step 2: 实现 PaymentSuccess 页面**

```typescript
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ordersApi } from '../api/orders';

export function PaymentSuccess() {
  const { orderId } = useParams<{ orderId: string }>();

  const { data: order, isLoading } = useQuery({
    queryKey: ['order', orderId],
    queryFn: async () => { const res = await ordersApi.getById(Number(orderId)); return res.data; },
    enabled: !!orderId,
  });

  if (isLoading) {
    return <div className="text-center py-20 text-gray-400">加载中...</div>;
  }

  if (!order) {
    return <div className="text-center py-20 text-gray-500">订单不存在</div>;
  }

  return (
    <div className="max-w-lg mx-auto text-center">
      <div className="text-6xl mb-4">&#10004;</div>
      <h1 className="text-2xl font-bold text-green-600 mb-2">支付成功！</h1>
      <div className="bg-white rounded-lg p-6 shadow-sm mt-6 text-left">
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">订单号</span>
            <span className="font-mono font-medium">{(order as any).orderNo}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">收货人</span>
            <span>{(order as any).recipientName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">收货地址</span>
            <span>{(order as any).recipientAddress}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">联系电话</span>
            <span>{(order as any).recipientPhone}</span>
          </div>
          <div className="border-t pt-2 mt-2">
            {(order as any).items?.map((item: any) => (
              <div key={item.id} className="flex justify-between py-1">
                <span>{item.productName} × {item.quantity}</span>
                <span>&yen;{(Number(item.productPrice) * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div className="flex justify-between border-t pt-2 font-bold">
            <span>合计</span>
            <span className="text-red-500">&yen;{Number((order as any).totalAmount).toFixed(2)}</span>
          </div>
        </div>
      </div>
      <div className="mt-6 flex justify-center gap-4">
        <Link to="/orders" className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">查看订单</Link>
        <Link to="/" className="px-6 py-2 border rounded-lg hover:bg-gray-50">继续购物</Link>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add frontend-user/src/pages/Checkout.tsx frontend-user/src/pages/PaymentSuccess.tsx
git commit -m "feat: implement checkout and payment success pages"
```

---

### Task 2.8：Orders + OrderDetail 页面

**Spec: U05 + U07 — 订单列表（状态筛选 + 倒序 + 空态） + 订单详情（商品快照 + 操作按钮：取消/确认收货/申请售后/去评价）**

**Files:**
- Modify: `frontend-user/src/pages/Orders.tsx`
- Modify: `frontend-user/src/pages/OrderDetail.tsx`
- Modify: `frontend-user/src/api/orders.ts`（追加 confirm/cancel/return 方法）

- [ ] **Step 1: 补全 orders API**

在 `frontend-user/src/api/orders.ts` 中替换为完整版：

```typescript
import apiClient from './client';

export const ordersApi = {
  create: (data: { recipientName: string; recipientAddress: string; recipientPhone: string }) =>
    apiClient.post('/orders', data),
  getAll: (status?: string) =>
    apiClient.get('/orders', { params: status ? { status } : {} }),
  getById: (id: number) => apiClient.get(`/orders/${id}`),
  confirm: (id: number) => apiClient.post(`/orders/${id}/confirm`),
  cancel: (id: number) => apiClient.post(`/orders/${id}/cancel`),
  requestReturn: (id: number, returnReason: string) =>
    apiClient.post(`/orders/${id}/return`, { returnReason }),
};
```

- [ ] **Step 2: 实现 Orders 列表页面**

```typescript
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ordersApi } from '../api/orders';

const STATUS_LABELS: Record<string, string> = {
  PAID: '已支付', SHIPPED: '已发货', COMPLETED: '已完成',
  CANCELLED: '已取消', RETURN_PENDING: '退货中', REFUNDED: '已退款',
};

const STATUS_COLORS: Record<string, string> = {
  PAID: 'bg-blue-100 text-blue-700', SHIPPED: 'bg-orange-100 text-orange-700',
  COMPLETED: 'bg-green-100 text-green-700', CANCELLED: 'bg-gray-100 text-gray-500',
  RETURN_PENDING: 'bg-yellow-100 text-yellow-700', REFUNDED: 'bg-gray-100 text-gray-500',
};

const STATUS_OPTIONS = ['', 'PAID', 'SHIPPED', 'COMPLETED', 'CANCELLED', 'RETURN_PENDING', 'REFUNDED'];

export function Orders() {
  const [statusFilter, setStatusFilter] = useState('');

  const { data: orders, isLoading, isError } = useQuery({
    queryKey: ['orders', statusFilter],
    queryFn: async () => {
      const res = await ordersApi.getAll(statusFilter || undefined);
      return res.data;
    },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">我的订单</h1>
      <div className="mb-4">
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm">
          <option value="">全部</option>
          <option value="PAID">已支付</option>
          <option value="SHIPPED">已发货</option>
          <option value="COMPLETED">已完成</option>
          <option value="RETURN_PENDING">退货中</option>
          <option value="REFUNDED">已退款</option>
          <option value="CANCELLED">已取消</option>
        </select>
      </div>
      {isLoading && <div className="text-center py-20 text-gray-400">加载中...</div>}
      {isError && <div className="text-center py-20 text-gray-500">加载失败</div>}
      {orders && orders.length === 0 && (
        <div className="text-center py-20">
          <p className="text-gray-400 text-lg">还没有订单</p>
          <Link to="/" className="mt-4 inline-block text-blue-600 hover:underline">去逛逛</Link>
        </div>
      )}
      {orders && orders.length > 0 && (
        <div className="space-y-3">
          {orders.map((order: any) => (
            <Link key={order.id} to={`/orders/${order.id}`}
              className="block bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-sm text-gray-500">{order.orderNo}</span>
                <span className={`text-xs px-2 py-0.5 rounded ${STATUS_COLORS[order.status] || ''}`}>
                  {STATUS_LABELS[order.status] || order.status}
                </span>
              </div>
              <div className="text-sm text-gray-600">
                {order.items?.slice(0, 3).map((item: any) => (
                  <span key={item.id} className="mr-3">{item.productName} × {item.quantity}</span>
                ))}
                {order.items?.length > 3 && <span>等 {order.items.length} 件</span>}
              </div>
              <div className="mt-2 flex justify-between items-center">
                <span className="text-sm text-gray-400">{new Date(order.createdAt).toLocaleDateString('zh-CN')}</span>
                <span className="font-bold text-red-500">&yen;{Number(order.totalAmount).toFixed(2)}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 3: 实现 OrderDetail 页面**

```typescript
import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ordersApi } from '../api/orders';

const STATUS_LABELS: Record<string, string> = {
  PAID: '已支付', SHIPPED: '已发货', COMPLETED: '已完成',
  CANCELLED: '已取消', RETURN_PENDING: '退货中', REFUNDED: '已退款',
};

const STATUS_COLORS: Record<string, string> = {
  PAID: 'bg-blue-100 text-blue-700', SHIPPED: 'bg-orange-100 text-orange-700',
  COMPLETED: 'bg-green-100 text-green-700', CANCELLED: 'bg-gray-100 text-gray-500',
  RETURN_PENDING: 'bg-yellow-100 text-yellow-700', REFUNDED: 'bg-gray-100 text-gray-500',
};

export function OrderDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [returnReason, setReturnReason] = useState('');

  const { data: order, isLoading } = useQuery({
    queryKey: ['order', id],
    queryFn: async () => { const res = await ordersApi.getById(Number(id)); return res.data; },
  });

  const confirmMutation = useMutation({
    mutationFn: () => ordersApi.confirm(Number(id)),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['order', id] }),
  });

  const cancelMutation = useMutation({
    mutationFn: () => ordersApi.cancel(Number(id)),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['order', id] }),
  });

  const returnMutation = useMutation({
    mutationFn: () => ordersApi.requestReturn(Number(id), returnReason),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['order', id] }); setReturnReason(''); },
  });

  if (isLoading) return <div className="text-center py-20 text-gray-400">加载中...</div>;
  if (!order) return <div className="text-center py-20 text-gray-500">订单不存在</div>;

  const o = order as any;
  const hasReview = !!o.review;

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">订单详情</h1>
      <div className="bg-white rounded-lg p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500 font-mono">{o.orderNo}</span>
          <span className={`text-xs px-2 py-0.5 rounded ${STATUS_COLORS[o.status] || ''}`}>
            {STATUS_LABELS[o.status] || o.status}
          </span>
        </div>
        {/* 收货信息 */}
        <div className="text-sm text-gray-600 space-y-1">
          <p>收货人：{o.recipientName}</p>
          <p>地址：{o.recipientAddress}</p>
          <p>电话：{o.recipientPhone}</p>
        </div>
        {/* 商品清单 */}
        <div className="border-t pt-4">
          <h3 className="font-medium mb-3">商品清单</h3>
          {o.items?.map((item: any) => (
            <div key={item.id} className="flex items-center gap-3 py-2 border-b last:border-0">
              <div className="w-12 h-12 bg-gray-100 rounded overflow-hidden shrink-0">
                {item.productImage && <img src={`/${item.productImage}`} alt="" className="w-full h-full object-cover" />}
              </div>
              <span className="flex-1 text-sm">{item.productName}</span>
              <span className="text-sm text-gray-500">×{item.quantity}</span>
              <span className="text-sm">&yen;{(Number(item.productPrice) * item.quantity).toFixed(2)}</span>
            </div>
          ))}
        </div>
        <div className="border-t pt-4 flex justify-between font-bold">
          <span>合计</span>
          <span className="text-red-500 text-lg">&yen;{Number(o.totalAmount).toFixed(2)}</span>
        </div>
      </div>

      {/* 操作按钮 */}
      <div className="mt-6 space-y-3">
        {o.status === 'PAID' && (
          <div className="flex gap-3">
            <button onClick={() => { if (window.confirm('确定取消此订单吗？取消后将自动退款。')) cancelMutation.mutate(); }} disabled={cancelMutation.isPending}
              className="flex-1 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 disabled:opacity-50">
              取消订单
            </button>
          </div>
        )}
        {o.status === 'SHIPPED' && (
          <button onClick={() => confirmMutation.mutate()} disabled={confirmMutation.isPending}
            className="w-full py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50">
            确认收货
          </button>
        )}
        {o.status === 'COMPLETED' && !hasReview && (
          <Link to={`/orders/${o.id}/review`}
            className="block text-center py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            去评价
          </Link>
        )}
        {o.status === 'COMPLETED' && o.returnAttempts < 3 && (
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-2">申请售后（退货退款）— 剩余次数：{3 - o.returnAttempts}/3</p>
            <textarea value={returnReason} onChange={(e) => setReturnReason(e.target.value)}
              placeholder="退货原因（至少5个字）" rows={3}
              className="w-full border rounded-lg px-3 py-2 text-sm resize-none outline-none focus:ring-2 focus:ring-blue-500" />
            <button onClick={() => returnMutation.mutate()} disabled={returnMutation.isPending || returnReason.length < 5}
              className="mt-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 text-sm">
              提交申请
            </button>
            {returnMutation.isError && (
              <p className="mt-2 text-sm text-red-500">{(returnMutation.error as any)?.response?.data?.message}</p>
            )}
          </div>
        )}
        {o.status === 'COMPLETED' && o.returnAttempts >= 3 && (
          <p className="text-sm text-gray-400">售后次数已达上限（3次）</p>
        )}
        {o.status === 'RETURN_PENDING' && (
          <p className="text-sm text-yellow-600 bg-yellow-50 p-3 rounded-lg">售后申请处理中，请等待管理员审核</p>
        )}
        {o.returnRejectedReason && (
          <p className="text-sm text-gray-500 bg-gray-50 p-3 rounded-lg">拒绝原因：{o.returnRejectedReason}</p>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 4: 在 App.tsx 中添加 ReviewForm 路由**

在 `frontend-user/src/App.tsx` 中，**将 ReviewForm 路由放在 OrderDetail 路由之前**（React Router v6 中更具体的路径应先匹配）：

```typescript
// 在 Orders 的 ProtectedRoute 内部，将 order 相关路由改为:
<Route path="orders/:id/review" element={<ProtectedRoute><ReviewForm /></ProtectedRoute>} />
<Route path="orders/:id" element={<ProtectedRoute><OrderDetail /></ProtectedRoute>} />
```

并在 import 中添加 `import { ReviewForm } from './pages/ReviewForm';`

- [ ] **Step 5: Commit**

```bash
git add frontend-user/src/pages/Orders.tsx frontend-user/src/pages/OrderDetail.tsx frontend-user/src/api/orders.ts frontend-user/src/App.tsx
git commit -m "feat: implement orders list and order detail with cancel/confirm/return"
```

---

### Task 2.9：Profile 页面

**Spec: U08 — 用户名 inline 编辑 + 修改密码**

**Files:**
- Modify: `frontend-user/src/pages/Profile.tsx`（新建）
- Modify: `frontend-user/src/App.tsx`（追加路由）

- [ ] **Step 1: 在 App.tsx 添加 Profile 路由**

```typescript
import { Profile } from './pages/Profile';
// 在 ProtectedRoute 内部追加:
<Route path="profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
```

- [ ] **Step 2: 实现 Profile 页面**

```typescript
import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { authApi } from '../api/auth';
import { useAuth } from '../hooks/useAuth';

export function Profile() {
  const { user } = useAuth();
  const [editingName, setEditingName] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const nameMutation = useMutation({
    mutationFn: () => authApi.updateProfile(name),
    onSuccess: (res) => {
      sessionStorage.setItem('user', JSON.stringify(res.data.user));
      setEditingName(false);
      setMsg({ type: 'success', text: '用户名修改成功' });
    },
    onError: (err: any) => setMsg({ type: 'error', text: err.response?.data?.message || '修改失败' }),
  });

  const passwordMutation = useMutation({
    mutationFn: () => {
      if (newPassword.length < 6) throw new Error('新密码至少6位');
      if (newPassword !== confirmPassword) throw new Error('两次密码不一致');
      return authApi.updatePassword(oldPassword, newPassword);
    },
    onSuccess: () => {
      setOldPassword(''); setNewPassword(''); setConfirmPassword('');
      setMsg({ type: 'success', text: '密码修改成功' });
    },
    onError: (err: any) => setMsg({ type: 'error', text: err.response?.data?.message || err.message || '修改失败' }),
  });

  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-8">个人中心</h1>
      {msg && (
        <div className={`p-3 rounded mb-4 text-sm ${msg.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
          {msg.text}
        </div>
      )}
      {/* 用户信息 */}
      <div className="bg-white rounded-lg p-6 shadow-sm mb-6">
        <h2 className="font-medium mb-4">基本信息</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-500 mb-1">邮箱</label>
            <p className="text-gray-700">{user?.email}</p>
          </div>
          <div>
            <label className="block text-sm text-gray-500 mb-1">用户名</label>
            {editingName ? (
              <div className="flex gap-2">
                <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                  className="flex-1 border rounded px-2 py-1 text-sm" />
                <button onClick={() => nameMutation.mutate()} disabled={nameMutation.isPending}
                  className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700">保存</button>
                <button onClick={() => { setEditingName(false); setName(user?.name || ''); }}
                  className="px-3 py-1 border rounded text-sm">取消</button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span>{user?.name}</span>
                <button onClick={() => setEditingName(true)} className="text-blue-600 text-sm hover:underline">编辑</button>
              </div>
            )}
          </div>
        </div>
      </div>
      {/* 修改密码 */}
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <h2 className="font-medium mb-4">修改密码</h2>
        <form onSubmit={(e) => { e.preventDefault(); setMsg(null); passwordMutation.mutate(); }} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-500 mb-1">旧密码</label>
            <input type="password" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)}
              className="w-full border rounded-lg px-3 py-2" required />
          </div>
          <div>
            <label className="block text-sm text-gray-500 mb-1">新密码</label>
            <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
              className="w-full border rounded-lg px-3 py-2" required minLength={6} />
          </div>
          <div>
            <label className="block text-sm text-gray-500 mb-1">确认新密码</label>
            <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full border rounded-lg px-3 py-2" required />
          </div>
          <button type="submit" disabled={passwordMutation.isPending}
            className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
            {passwordMutation.isPending ? '修改中...' : '修改密码'}
          </button>
        </form>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add frontend-user/src/pages/Profile.tsx frontend-user/src/App.tsx
git commit -m "feat: implement user profile page with name edit and password change"
```

---

### Task 2.10：ReviewForm 页面 + ProductDetail 评价列表

**Spec: U09 — 订单评价（选商品 + 1-5 星 + 文字）+ 商品详情页下方评价列表**

**Files:**
- Create: `frontend-user/src/pages/ReviewForm.tsx`
- Modify: `frontend-user/src/pages/ProductDetail.tsx`（底部追加评价列表）
- Create: `frontend-user/src/api/reviews.ts`

- [ ] **Step 1: 创建 reviews API**

`frontend-user/src/api/reviews.ts`:

```typescript
import apiClient from './client';

export const reviewsApi = {
  getByProduct: (productId: number) => apiClient.get(`/products/${productId}/reviews`),
  create: (orderId: number, data: { productId: number; rating: number; content?: string }) =>
    apiClient.post(`/orders/${orderId}/review`, data),
};
```

- [ ] **Step 2: 实现 ReviewForm 页面**

`frontend-user/src/pages/ReviewForm.tsx`:

```typescript
import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { ordersApi } from '../api/orders';
import { reviewsApi } from '../api/reviews';

export function ReviewForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [productId, setProductId] = useState<number | ''>('');
  const [rating, setRating] = useState(5);
  const [content, setContent] = useState('');

  const { data: order, isLoading } = useQuery({
    queryKey: ['order', id],
    queryFn: async () => { const res = await ordersApi.getById(Number(id)); return res.data; },
  });

  const reviewMutation = useMutation({
    mutationFn: () => reviewsApi.create(Number(id), { productId: Number(productId), rating, content: content || undefined }),
    onSuccess: () => navigate(`/orders/${id}`, { replace: true }),
  });

  if (isLoading) return <div className="text-center py-20 text-gray-400">加载中...</div>;
  if (!order) return <div className="text-center py-20 text-gray-500">订单不存在</div>;

  const o = order as any;

  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-6">商品评价</h1>
      <div className="bg-white rounded-lg p-6 shadow-sm space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">选择评价商品</label>
          <select value={productId} onChange={(e) => setProductId(Number(e.target.value))}
            className="w-full border rounded-lg px-3 py-2 text-sm">
            <option value="">请选择</option>
            {o.items?.map((item: any) => (
              <option key={item.productId} value={item.productId}>{item.productName}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">评分</label>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button key={star} type="button" onClick={() => setRating(star)}
                className={`text-2xl ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`}>
                &#9733;
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">评价内容（可选）</label>
          <textarea value={content} onChange={(e) => setContent(e.target.value)}
            rows={4} className="w-full border rounded-lg px-3 py-2 text-sm resize-none" placeholder="分享你的使用体验..." />
        </div>
        <button onClick={() => reviewMutation.mutate()}
          disabled={reviewMutation.isPending || !productId}
          className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
          {reviewMutation.isPending ? '提交中...' : '提交评价'}
        </button>
        {reviewMutation.isError && (
          <p className="text-sm text-red-500">{(reviewMutation.error as any)?.response?.data?.message || '提交失败'}</p>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: 在 ProductDetail 底部追加评价列表**

首先，在 `frontend-user/src/pages/ProductDetail.tsx` 顶部的 import 区域追加：

```typescript
import { reviewsApi } from '../api/reviews';
```

然后，在 ProductDetail 的 return 最末尾（`</div>` 闭合前）追加：

```typescript
{/* 评价列表 */}
<div className="mt-12 max-w-4xl mx-auto">
  <h2 className="text-xl font-bold mb-4">商品评价</h2>
  <ProductReviews productId={Number(id)} />
</div>
```

并在文件末尾（ProductDetail 函数体之后）创建 ProductReviews 组件：

```typescript
function ProductReviews({ productId }: { productId: number }) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['reviews', productId],
    queryFn: async () => { const res = await reviewsApi.getByProduct(productId); return res.data; },
  });

  if (isLoading) return <p className="text-gray-400 text-sm">加载评价中...</p>;
  if (isError) return <p className="text-gray-400 text-sm">评价加载失败</p>;

  const reviews = data || [];
  if (reviews.length === 0) {
    return <p className="text-gray-400 text-sm">暂无评价</p>;
  }

  return (
    <div className="space-y-3">
      {reviews.map((review: any) => (
        <div key={review.id} className="bg-white rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="font-medium text-sm">{review.user?.name || '匿名用户'}</span>
            <span className="text-yellow-400 text-sm">{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</span>
          </div>
          {review.content && <p className="text-gray-600 text-sm">{review.content}</p>}
          <p className="text-xs text-gray-400 mt-2">{new Date(review.createdAt).toLocaleDateString('zh-CN')}</p>
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add frontend-user/src/pages/ReviewForm.tsx frontend-user/src/pages/ProductDetail.tsx frontend-user/src/api/reviews.ts
git commit -m "feat: implement review form and product reviews section"
```

---

### Task 2.11：用户端收尾 — 导航栏个人中心下拉菜单

**Spec: U08 — 导航栏已登录时点击用户名下拉菜单 [个人中心] [退出]**

**Files:**
- Modify: `frontend-user/src/components/Layout.tsx`

- [ ] **Step 1: 在 Layout 中实现下拉菜单**

将 Layout 中用户名显示区域替换为简单的 Link：

```typescript
// 将 header 中的用户信息区域替换为:
{isLoggedIn ? (
  <div className="flex items-center gap-3">
    <Link to="/profile" className="text-sm text-gray-500 hover:text-blue-600">{user?.name}</Link>
    <Link to="/cart" className="text-gray-600 hover:text-blue-600 relative">
      购物车
      {cartCount > 0 && (
        <span className="absolute -top-2 -right-4 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
          {cartCount}
        </span>
      )}
    </Link>
    <Link to="/orders" className="text-gray-600 hover:text-blue-600">我的订单</Link>
    <button onClick={handleLogout} className="text-sm text-red-500 hover:text-red-700">退出</button>
  </div>
) : (
  <Link to="/login" className="text-gray-600 hover:text-blue-600">登录</Link>
)}
```

- [ ] **Step 2: Commit**

```bash
git add frontend-user/src/components/Layout.tsx
git commit -m "feat: add profile link and polish user navigation"
```

---

## Phase 3：商店端前端完整实现（8 页面）

**目标：** 实现需求规格说明书 S01-S05 全部 5 个功能模块。

### Task 3.1：商店端项目骨架 + 基础设施

**参考：** `2026-06-02-project-scaffolding.md` Task 9 Steps 1-8

直接执行，但需要修正以下内容：

- [ ] **Step 1a: 修正 App.tsx 路由（scaffolding plan 的 App.tsx 缺少 Dashboard 和 Profile 路由）**

将 `frontend-store/src/App.tsx` 替换为：

```typescript
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Dashboard } from './pages/Dashboard';
import { ProductManage } from './pages/ProductManage';
import { ProductForm } from './pages/ProductForm';
import { Orders } from './pages/Orders';
import { OrderDetail } from './pages/OrderDetail';
import { Profile } from './pages/Profile';
import { Login } from './pages/Login';
import { Register } from './pages/Register';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route index element={<Dashboard />} />
          <Route path="products" element={<ProductManage />} />
          <Route path="products/new" element={<ProductForm />} />
          <Route path="products/:id/edit" element={<ProductForm />} />
          <Route path="orders" element={<Orders />} />
          <Route path="orders/:id" element={<OrderDetail />} />
          <Route path="profile" element={<Profile />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
```

注意：index 路由为 Dashboard（符合需求 S04"登录后默认进入仪表盘页"），ProductManage 移至 `/products`。

- [ ] **Step 1b: 确认以下文件齐全：**
- `frontend-store/src/api/client.ts` + `auth.ts` + `products.ts` + `orders.ts`
- `frontend-store/src/hooks/useAuth.ts`（含 ADMIN 角色校验）
- `frontend-store/src/components/Layout.tsx` + `ProtectedRoute.tsx`

**补充 API 模块：**

`frontend-store/src/api/dashboard.ts`:

```typescript
import apiClient from './client';

export const dashboardApi = {
  getStats: () => apiClient.get('/dashboard'),
};
```

- [ ] **Step: Commit**

```bash
git add frontend-store/src/
git commit -m "feat: scaffold store frontend with all API modules"
```

---

### Task 3.2：商店端 Login + Register 页面

**Spec: S01 — 商店端注册/登录，与用户端共用接口，角色标记为 ADMIN**

**Files:**
- Modify: `frontend-store/src/pages/Login.tsx`
- Modify: `frontend-store/src/pages/Register.tsx`

- [ ] **Step 1: 实现商店端 Login 页面（含 ADMIN 角色校验）**

基于用户端 Login 代码，修改以下 5 点：
- Register 的 `role` 参数为 `'ADMIN'`
- 登录后跳转到 `/`（仪表盘）
- 标题文案为"商店管理登录"/"商店管理注册"
- 颜色主题使用 `green` 系（`blue-600` → `green-600`）
- **关键差异：** `onSuccess` 中检查 `login()` 返回值，若为 `false`（非 ADMIN 角色）则提示"无权限访问，请使用管理员账号"：

```typescript
const loginMutation = useMutation({
  mutationFn: () => authApi.login({ email, password }),
  onSuccess: (res) => {
    const { user, accessToken, refreshToken } = res.data;
    if (!login(user, accessToken, refreshToken)) {
      setLocalError('无权限访问，请使用管理员账号');
      return;
    }
    navigate(from, { replace: true });
  },
});
```

- [ ] **Step 2: 实现商店端 Register 页面**

基于用户端 Register 代码，修改 `role` 参数为 `'ADMIN'`，颜色使用 green 系，标题文案适配。

- [ ] **Step 3: Commit**

```bash
git add frontend-store/src/pages/Login.tsx frontend-store/src/pages/Register.tsx
git commit -m "feat: implement store login and register pages"
```

---

### Task 3.3：Dashboard 页面

**Spec: S04 — 4 张统计卡片（商品总数+已上架 / 本月订单+待发货 / 本月销售额 / 待处理退货），点击跳转**

**Files:**
- Modify: `frontend-store/src/pages/Dashboard.tsx`

- [ ] **Step 1: 实现 Dashboard 页面**

```typescript
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { dashboardApi } from '../api/dashboard';

export function Dashboard() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => { const res = await dashboardApi.getStats(); return res.data; },
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white rounded-lg p-6 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-3" />
            <div className="h-8 bg-gray-200 rounded w-1/3" />
          </div>
        ))}
      </div>
    );
  }

  if (isError) {
    return <div className="text-center py-20 text-gray-500">加载统计数据失败</div>;
  }

  const cards = [
    { label: '商品总数', value: `${data?.activeProducts || 0} / ${data?.totalProducts || 0}`, sub: '已上架 / 全部', link: '/products' },
    { label: '本月订单', value: `${data?.monthlyOrderCount || 0}`, sub: `待发货 ${data?.pendingShipOrders || 0}`, link: '/orders' },
    { label: '本月销售额', value: `¥${(data?.monthlySales || 0).toFixed(2)}`, sub: '', link: '/orders' },
    { label: '待处理退货', value: `${data?.returnPendingCount || 0}`, sub: '', link: '/orders?status=RETURN_PENDING' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">仪表盘</h1>
      <div className="grid grid-cols-4 gap-4">
        {cards.map((card, i) => (
          <Link key={i} to={card.link}
            className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
            <p className="text-sm text-gray-500 mb-2">{card.label}</p>
            <p className="text-2xl font-bold text-gray-800">{card.value}</p>
            {card.sub && <p className="text-xs text-gray-400 mt-1">{card.sub}</p>}
          </Link>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend-store/src/pages/Dashboard.tsx
git commit -m "feat: implement admin dashboard with statistics cards"
```

---

### Task 3.4：ProductManage 页面

**Spec: S02 — 商品管理表格（含已下架）+ 添加入口 + 上架/下架切换**

**Files:**
- Modify: `frontend-store/src/pages/ProductManage.tsx`

- [ ] **Step 1: 实现 ProductManage 页面**

```typescript
import { useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { productsApi, categoriesApi } from '../api/products';

export function ProductManage() {
  const queryClient = useQueryClient();

  const { data: products, isLoading, isError } = useQuery({
    queryKey: ['admin-products'],
    queryFn: async () => { const res = await productsApi.getAll(true); return res.data; },
  });

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => { const res = await categoriesApi.getTree(); return res.data; },
  });

  const categoryNameMap = useMemo(() => {
    const map: Record<number, string> = {};
    categories?.forEach((cat: any) => {
      map[cat.id] = cat.name;
      cat.children?.forEach((child: any) => { map[child.id] = child.name; });
    });
    return map;
  }, [categories]);

  const toggleMutation = useMutation({
    mutationFn: (id: number) => productsApi.toggle(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-products'] }),
  });

  if (isLoading) return <div className="text-center py-20 text-gray-400">加载中...</div>;
  if (isError) return <div className="text-center py-20 text-gray-500">加载失败</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">商品管理</h1>
        <Link to="/products/new" className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
          添加商品
        </Link>
      </div>
      <div className="bg-white rounded-lg shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-gray-50 text-left">
              <th className="px-4 py-3">缩略图</th>
              <th className="px-4 py-3">名称</th>
              <th className="px-4 py-3">分类</th>
              <th className="px-4 py-3">价格</th>
              <th className="px-4 py-3">库存</th>
              <th className="px-4 py-3">状态</th>
              <th className="px-4 py-3">操作</th>
            </tr>
          </thead>
          <tbody>
            {(products || []).map((product: any) => (
              <tr key={product.id} className="border-b hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div className="w-12 h-12 bg-gray-100 rounded overflow-hidden">
                    {product.thumbnailUrl ? (
                      <img src={`/${product.thumbnailUrl}`} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">无</div>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 font-medium">{product.name}</td>
                <td className="px-4 py-3 text-gray-500">{categoryNameMap[product.categoryId] || '-'}</td>
                <td className="px-4 py-3">&yen;{Number(product.price).toFixed(2)}</td>
                <td className="px-4 py-3">{product.stock}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded ${product.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {product.isActive ? '上架' : '下架'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <Link to={`/products/${product.id}/edit`}
                      className="text-blue-600 hover:underline text-xs">编辑</Link>
                    <button onClick={() => toggleMutation.mutate(product.id)}
                      className={`text-xs hover:underline ${product.isActive ? 'text-red-500' : 'text-green-600'}`}>
                      {product.isActive ? '下架' : '上架'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {(!products || products.length === 0) && (
              <tr><td colSpan={7} className="text-center py-10 text-gray-400">暂无商品</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend-store/src/pages/ProductManage.tsx
git commit -m "feat: implement product management table with toggle"
```

---

### Task 3.5：ProductForm 页面

**Spec: S02 — 商品添加/编辑表单：两级分类联动 + 图片上传预览 + 创建/编辑提交**

**Files:**
- Modify: `frontend-store/src/pages/ProductForm.tsx`
- Create/Modify: `frontend-store/src/api/products.ts`（追加 categories API 导入）

- [ ] **Step 1: 补全 products API（追加 categories）**

在 `frontend-store/src/api/products.ts` 中追加：

```typescript
interface Category {
  id: number;
  name: string;
  parentId: number | null;
  children?: Category[];
}

export const categoriesApi = {
  getTree: () => apiClient.get<Category[]>('/categories'),
};
```

- [ ] **Step 2: 实现 ProductForm 页面**

```typescript
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { productsApi, categoriesApi } from '../api/products';

export function ProductForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [name, setName] = useState('');
  const [summary, setSummary] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState('');
  const [imagePreview, setImagePreview] = useState('');

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => { const res = await categoriesApi.getTree(); return res.data; },
  });

  const { data: product } = useQuery({
    queryKey: ['product', id],
    queryFn: async () => { const res = await productsApi.getById(Number(id)); return res.data; },
    enabled: isEdit,
  });

  useEffect(() => {
    if (product) {
      const p = product as any;
      setName(p.name);
      setSummary(p.summary);
      setDescription(p.description);
      setPrice(String(Number(p.price)));
      setStock(String(p.stock));
      setCategoryId(String(p.categoryId));
      if (p.thumbnailUrl) setThumbnailPreview(`/${p.thumbnailUrl}`);
      if (p.imageUrl) setImagePreview(`/${p.imageUrl}`);
    }
  }, [product]);

  const handleThumbnail = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { alert('图片最大5MB'); return; }
      setThumbnailFile(file);
      setThumbnailPreview(URL.createObjectURL(file));
    }
  };

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { alert('图片最大5MB'); return; }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const mutation = useMutation({
    mutationFn: () => {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('summary', summary);
      formData.append('description', description);
      formData.append('price', price);
      formData.append('stock', stock);
      formData.append('categoryId', categoryId);
      if (thumbnailFile) formData.append('thumbnail', thumbnailFile);
      if (imageFile) formData.append('image', imageFile);
      return isEdit ? productsApi.update(Number(id), formData) : productsApi.create(formData);
    },
    onSuccess: () => navigate('/', { replace: true }),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate();
  };

  const parentCategories = categories?.filter((c: any) => !c.parentId) || [];
  const selectedParentId = categories?.find((c: any) => c.id === Number(categoryId))?.parentId;
  const childCategories = selectedParentId
    ? parentCategories.find((c: any) => c.id === selectedParentId)?.children || []
    : [];

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">{isEdit ? '编辑商品' : '添加商品'}</h1>
      {mutation.isError && (
        <div className="bg-red-50 text-red-600 p-3 rounded mb-4 text-sm">
          {(mutation.error as any)?.response?.data?.message || '操作失败'}
        </div>
      )}
      <form onSubmit={handleSubmit} className="bg-white rounded-lg p-6 shadow-sm space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">商品名称</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} required
            className="w-full border rounded-lg px-3 py-2" />
        </div>
        {/* 两级分类联动 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">所属分类</label>
          <div className="flex gap-2">
            <select value={selectedParentId || ''} onChange={(e) => {
              const parentId = Number(e.target.value);
              const firstChild = categories?.find((c: any) => c.id === parentId)?.children?.[0];
              setCategoryId(firstChild ? String(firstChild.id) : '');
            }} className="flex-1 border rounded-lg px-3 py-2 text-sm">
              <option value="">选择一级分类</option>
              {parentCategories.map((c: any) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            {childCategories.length > 0 && (
              <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}
                className="flex-1 border rounded-lg px-3 py-2 text-sm">
                <option value="">选择二级分类</option>
                {childCategories.map((c: any) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            )}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">一句话简介</label>
          <input type="text" value={summary} onChange={(e) => setSummary(e.target.value)} required
            className="w-full border rounded-lg px-3 py-2" maxLength={200} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">详情描述</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} required
            rows={5} className="w-full border rounded-lg px-3 py-2 resize-none" />
        </div>
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">价格</label>
            <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} required
              min="0.01" step="0.01" className="w-full border rounded-lg px-3 py-2" />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">库存</label>
            <input type="number" value={stock} onChange={(e) => setStock(e.target.value)} required
              min="0" step="1" className="w-full border rounded-lg px-3 py-2" />
          </div>
        </div>
        {/* 图片上传 */}
        <div className="flex gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">缩略图</label>
            <input type="file" accept="image/jpeg,image/png,image/gif,image/webp"
              onChange={handleThumbnail} className="text-sm" />
            {thumbnailPreview && (
              <div className="mt-2 w-24 h-24 bg-gray-100 rounded overflow-hidden">
                <img src={thumbnailPreview} alt="" className="w-full h-full object-cover" />
              </div>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">详情大图</label>
            <input type="file" accept="image/jpeg,image/png,image/gif,image/webp"
              onChange={handleImage} className="text-sm" />
            {imagePreview && (
              <div className="mt-2 w-32 h-24 bg-gray-100 rounded overflow-hidden">
                <img src={imagePreview} alt="" className="w-full h-full object-contain" />
              </div>
            )}
          </div>
        </div>
        <div className="flex gap-3 pt-4">
          <button type="submit" disabled={mutation.isPending}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50">
            {mutation.isPending ? '保存中...' : '保存'}
          </button>
          <button type="button" onClick={() => navigate(-1)}
            className="px-6 py-2 border rounded-lg hover:bg-gray-50">取消</button>
        </div>
      </form>
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add frontend-store/src/pages/ProductForm.tsx frontend-store/src/api/products.ts
git commit -m "feat: implement product create/edit form with category cascade and image upload"
```

---

### Task 3.6：商店端 Orders 列表 + OrderDetail 页面

**Spec: S03 — 全部订单查看 + 状态筛选 + 发货操作 + 退货审批（同意/拒绝）**

**Files:**
- Modify: `frontend-store/src/pages/Orders.tsx`
- Modify: `frontend-store/src/pages/OrderDetail.tsx`
- Modify: `frontend-store/src/api/orders.ts`（追加 approveReturn/rejectReturn）

- [ ] **Step 1: 补全 orders API**

替换 `frontend-store/src/api/orders.ts`:

```typescript
import apiClient from './client';

export const ordersApi = {
  getAll: (status?: string) => apiClient.get('/orders', { params: status ? { status } : {} }),
  getById: (id: number) => apiClient.get(`/orders/${id}`),
  updateStatus: (id: number, status: 'SHIPPED' | 'COMPLETED') =>
    apiClient.patch(`/orders/${id}/status`, { status }),
  approveReturn: (id: number) => apiClient.post(`/orders/${id}/return/approve`),
  rejectReturn: (id: number, rejectReason?: string) =>
    apiClient.post(`/orders/${id}/return/reject`, { rejectReason }),
};
```

- [ ] **Step 2: 实现商店端 Orders 列表页面**

```typescript
import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ordersApi } from '../api/orders';

const STATUS_LABELS: Record<string, string> = {
  PAID: '已支付', SHIPPED: '已发货', COMPLETED: '已完成',
  CANCELLED: '已取消', RETURN_PENDING: '退货中', REFUNDED: '已退款',
};

const STATUS_COLORS: Record<string, string> = {
  PAID: 'bg-blue-100 text-blue-700', SHIPPED: 'bg-orange-100 text-orange-700',
  COMPLETED: 'bg-green-100 text-green-700', CANCELLED: 'bg-gray-100 text-gray-500',
  RETURN_PENDING: 'bg-yellow-100 text-yellow-700', REFUNDED: 'bg-gray-100 text-gray-500',
};

export function Orders() {
  const [searchParams, setSearchParams] = useSearchParams();
  const statusFilter = searchParams.get('status') || '';

  const { data: orders, isLoading, isError } = useQuery({
    queryKey: ['admin-orders', statusFilter],
    queryFn: async () => { const res = await ordersApi.getAll(statusFilter || undefined); return res.data; },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">订单管理</h1>
      <div className="mb-4">
        <select value={statusFilter} onChange={(e) => setSearchParams(e.target.value ? { status: e.target.value } : {})}
          className="border rounded-lg px-3 py-2 text-sm">
          <option value="">全部</option>
          <option value="PAID">已支付</option>
          <option value="SHIPPED">已发货</option>
          <option value="COMPLETED">已完成</option>
          <option value="RETURN_PENDING">退货中</option>
          <option value="REFUNDED">已退款</option>
          <option value="CANCELLED">已取消</option>
        </select>
      </div>
      {isLoading && <div className="text-center py-20 text-gray-400">加载中...</div>}
      {isError && <div className="text-center py-20 text-gray-500">加载失败</div>}
      {orders && (
        <div className="bg-white rounded-lg shadow-sm overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50 text-left">
                <th className="px-4 py-3">订单号</th>
                <th className="px-4 py-3">用户</th>
                <th className="px-4 py-3">金额</th>
                <th className="px-4 py-3">状态</th>
                <th className="px-4 py-3">时间</th>
                <th className="px-4 py-3">操作</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order: any) => (
                <tr key={order.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-xs">{order.orderNo}</td>
                  <td className="px-4 py-3">{order.user?.name || '-'}</td>
                  <td className="px-4 py-3">&yen;{Number(order.totalAmount).toFixed(2)}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded ${STATUS_COLORS[order.status] || ''}`}>
                      {STATUS_LABELS[order.status] || order.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{new Date(order.createdAt).toLocaleDateString('zh-CN')}</td>
                  <td className="px-4 py-3">
                    <Link to={`/orders/${order.id}`} className="text-blue-600 hover:underline text-xs">详情</Link>
                  </td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr><td colSpan={6} className="text-center py-10 text-gray-400">暂无订单</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 3: 实现商店端 OrderDetail 页面**

```typescript
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ordersApi } from '../api/orders';

const STATUS_LABELS: Record<string, string> = {
  PAID: '已支付', SHIPPED: '已发货', COMPLETED: '已完成',
  CANCELLED: '已取消', RETURN_PENDING: '退货中', REFUNDED: '已退款',
};

export function OrderDetail() {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const [rejectReason, setRejectReason] = useState('');

  const { data: order, isLoading } = useQuery({
    queryKey: ['admin-order', id],
    queryFn: async () => { const res = await ordersApi.getById(Number(id)); return res.data; },
  });

  const shipMutation = useMutation({
    mutationFn: () => ordersApi.updateStatus(Number(id), 'SHIPPED'),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-order', id] }),
  });

  const approveMutation = useMutation({
    mutationFn: () => ordersApi.approveReturn(Number(id)),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-order', id] }),
  });

  const rejectMutation = useMutation({
    mutationFn: () => ordersApi.rejectReturn(Number(id), rejectReason || undefined),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-order', id] }); setRejectReason(''); },
  });

  if (isLoading) return <div className="text-center py-20 text-gray-400">加载中...</div>;
  if (!order) return <div className="text-center py-20 text-gray-500">订单不存在</div>;

  const o = order as any;

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">订单详情</h1>
      <div className="bg-white rounded-lg p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-sm text-gray-500 font-mono">{o.orderNo}</span>
            <p className="text-sm text-gray-600 mt-1">用户：{o.user?.name} ({o.user?.email})</p>
          </div>
          <span className="text-sm px-2 py-0.5 rounded bg-gray-100">{STATUS_LABELS[o.status] || o.status}</span>
        </div>
        <div className="text-sm text-gray-600 space-y-1">
          <p>收货人：{o.recipientName}</p>
          <p>地址：{o.recipientAddress}</p>
          <p>电话：{o.recipientPhone}</p>
        </div>
        <div className="border-t pt-4">
          <h3 className="font-medium mb-3">商品清单</h3>
          {o.items?.map((item: any) => (
            <div key={item.id} className="flex justify-between py-2 border-b last:border-0 text-sm">
              <span>{item.productName} × {item.quantity}</span>
              <span>&yen;{(Number(item.productPrice) * item.quantity).toFixed(2)}</span>
            </div>
          ))}
        </div>
        <div className="border-t pt-4 flex justify-between font-bold">
          <span>合计</span>
          <span className="text-red-500 text-lg">&yen;{Number(o.totalAmount).toFixed(2)}</span>
        </div>
        {o.returnReason && (
          <div className="bg-yellow-50 p-3 rounded text-sm text-yellow-700">退货原因：{o.returnReason}</div>
        )}
      </div>

      {/* 操作按钮 */}
      <div className="mt-6 space-y-3">
        {o.status === 'PAID' && (
          <button onClick={() => { if (window.confirm('确认发货？')) shipMutation.mutate(); }} disabled={shipMutation.isPending}
            className="w-full py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50">
            发货
          </button>
        )}
        {o.status === 'RETURN_PENDING' && (
          <div className="space-y-3">
            <div className="flex gap-3">
              <button onClick={() => { if (window.confirm('确认同意退货？库存将自动恢复。')) approveMutation.mutate(); }} disabled={approveMutation.isPending}
                className="flex-1 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50">
                同意退货
              </button>
              <button onClick={() => { if (window.confirm('确认拒绝退货？')) rejectMutation.mutate(); }} disabled={rejectMutation.isPending}
                className="flex-1 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 disabled:opacity-50">
                拒绝退货
              </button>
            </div>
            <input type="text" value={rejectReason} onChange={(e) => setRejectReason(e.target.value)}
              placeholder="拒绝原因（可选）" className="w-full border rounded-lg px-3 py-2 text-sm" />
          </div>
        )}
        {['CANCELLED', 'REFUNDED'].includes(o.status) && (
          <p className="text-sm text-gray-400 text-center">此订单已完结，不可操作</p>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add frontend-store/src/pages/Orders.tsx frontend-store/src/pages/OrderDetail.tsx frontend-store/src/api/orders.ts
git commit -m "feat: implement admin order management with ship/approve/reject"
```

---

### Task 3.7：商店端 Profile 页面

**Spec: S05 — 管理员个人信息：用户名编辑 + 修改密码**

**Files:**
- Modify: `frontend-store/src/pages/Profile.tsx`（新建）
- Modify: `frontend-store/src/App.tsx`（追加路由）
- Modify: `frontend-store/src/api/auth.ts`（追加 getMe/updateProfile/updatePassword 方法）

- [ ] **Step 1: 补全 auth API + 添加路由**

代码逻辑与用户端 Profile 完全一致（参见 Task 2.9），仅颜色主题用 green 系。直接复制用户端 Profile 代码，将 `blue-*` 替换为 `green-*`。

在 App.tsx 的 ProtectedRoute 内追加：
```typescript
<Route path="profile" element={<Profile />} />
```

并在 Layout 中确保有"个人中心"导航链接指向 `/profile`。

- [ ] **Step 2: Commit**

```bash
git add frontend-store/src/pages/Profile.tsx frontend-store/src/App.tsx frontend-store/src/api/auth.ts frontend-store/src/components/Layout.tsx
git commit -m "feat: implement admin profile page"
```

---

### Task 3.8：商店端 Layout — 侧边导航栏

**Spec: S04/S05 — 侧边导航（仪表盘/商品管理/订单管理/个人中心）+ 顶部用户名+退出**

**Files:**
- Modify: `frontend-store/src/components/Layout.tsx`

- [ ] **Step 1: 实现侧边导航 Layout**

```typescript
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../hooks/useAuth';

const NAV_ITEMS = [
  { path: '/', label: '仪表盘' },
  { path: '/products', label: '商品管理' },
  { path: '/orders', label: '订单管理' },
  { path: '/profile', label: '个人中心' },
];

export function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();

  const handleLogout = () => {
    queryClient.clear();
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* 侧边栏 */}
      <aside className="w-56 bg-white shadow-sm shrink-0 flex flex-col">
        <div className="p-4 border-b">
          <Link to="/" className="text-lg font-bold text-green-600">商店管理</Link>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {NAV_ITEMS.map((item) => (
            <Link key={item.path} to={item.path}
              className={`block px-3 py-2 rounded-lg text-sm ${
                (item.path === '/' ? location.pathname === '/' : location.pathname.startsWith(item.path))
                  ? 'bg-green-50 text-green-700 font-medium'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}>
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t">
          <p className="text-sm text-gray-500">{user?.name}</p>
          <button onClick={handleLogout} className="text-xs text-red-500 hover:text-red-700 mt-1">退出</button>
        </div>
      </aside>
      {/* 主内容区 */}
      <main className="flex-1 p-6 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend-store/src/components/Layout.tsx
git commit -m "feat: implement sidebar navigation for admin layout"
```

---

## Phase 4：收尾验证

### Task 4.1：全局验证与修复

- [ ] **Step 1: 启动后端并验证编译**

```bash
cd backend && npm run dev
```

Expected: Server starts on :3000, no TypeScript errors.

- [ ] **Step 2: 测试关键 API 端点**

```bash
curl http://localhost:3000/api/health
curl http://localhost:3000/api/categories
curl http://localhost:3000/api/products
```

Expected: All return 200 with valid JSON.

- [ ] **Step 3: 启动用户端前端**

```bash
cd frontend-user && npm run dev
```

验证：http://localhost:5173 可访问，页面正常渲染。

- [ ] **Step 4: 启动商店端前端**

```bash
cd frontend-store && npm run dev
```

验证：http://localhost:5174 可访问，未登录重定向到 /login。

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "chore: final validation and fixes"
```

---

## 覆盖验证清单

| 需求项 | 实现位置 |
|--------|---------|
| U01 — 商品列表+分类筛选 | Task 2.4 (ProductList) |
| U02 — 商品详情+加购 | Task 2.5 (ProductDetail) |
| U03 — 购物车管理 | Task 2.6 (Cart) |
| U04 — 结算+模拟支付 | Task 2.7 (Checkout + PaymentSuccess) |
| U05 — 历史订单 | Task 2.8 (Orders + OrderDetail) |
| U06 — 注册登录 | Task 2.2 (Login) + 2.3 (Register) |
| U07 — 订单取消+售后 | Task 2.8 (OrderDetail — cancel/return) |
| U08 — 个人中心 | Task 2.9 (Profile) |
| U09 — 商品评价 | Task 2.10 (ReviewForm + ProductDetail reviews) |
| S01 — 商店端注册登录 | Task 3.2 (Login + Register) |
| S02 — 商品管理 | Task 3.4 (ProductManage) + 3.5 (ProductForm) |
| S03 — 订单管理+退货审批 | Task 3.6 (Orders + OrderDetail) |
| S04 — 仪表盘 | Task 3.3 (Dashboard) |
| S05 — 管理员个人中心 | Task 3.7 (Profile) |
| 30 API 端点 | Phase 1 (Task 1.6 / scaffolding plan Task 6) |
| 8 表数据模型 | Phase 1 (Task 1.4 / scaffolding plan Task 4) |
| Decimal 序列化 | Task 1.5 补充 |
| JWT 双 Token | Phase 1 (scaffolding Task 5 — jwt.ts + auth middleware) |
| 订单编号原子生成 | Phase 1 (scaffolding Task 6 — orders.ts OrderSequence) |
| 库存并发保护 | Phase 1 (scaffolding Task 6 — orders.ts stock gte) |
| 7天惰性自动收货 | Phase 1 (scaffolding Task 6 — orders.ts GET) |
| 图片上传+预览 | Task 3.5 (ProductForm) |
| 对称注册 | Phase 1 (scaffolding Task 6 — auth.ts register) |

---

**Plan complete. 统一实施计划已保存到 `docs/superpowers/plans/2026-06-02-full-implementation.md`。**
