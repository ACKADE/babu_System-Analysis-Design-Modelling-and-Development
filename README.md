<p align="center">
  <img src="https://readme-typing-svg.demolab.com?font=Georgia&size=28&duration=2000&pause=800&color=C4953A&center=true&vCenter=true&width=600&lines=%F0%9F%8F%AA+Babu+%E7%94%B5%E5%95%86%E5%B9%B3%E5%8F%B0;%E8%AF%BE%E7%A8%8B%E8%AE%BE%E8%AE%A1+%C2%B7+%E5%85%A8%E6%A0%88%E5%AE%9E%E8%B7%B5" alt="Babu 电商平台" />
</p>

<p align="center">
  <b>一个全栈电商演示平台</b> · 顾客端 + 管理后台 + REST API · Docker 一键部署
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-20%2B-339933?logo=nodedotjs&logoColor=white" />
  <img src="https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/Express-4-000000?logo=express&logoColor=white" />
  <img src="https://img.shields.io/badge/Prisma-5-2D3748?logo=prisma&logoColor=white" />
  <img src="https://img.shields.io/badge/MySQL-8-4479A1?logo=mysql&logoColor=white" />
  <img src="https://img.shields.io/badge/Tailwind-3-06B6D4?logo=tailwindcss&logoColor=white" />
  <img src="https://img.shields.io/badge/Docker-2496ED?logo=docker&logoColor=white" />
</p>

---

## ✨ 功能概览

| 角色 | 功能 |
|------|------|
| 🛍️ **顾客** | 浏览商品 · 分类筛选 · 购物车 · 下单结算 · 确认收货 · 售后申请 · 商品评价 |
| 🏪 **管理员** | 商品管理（上架 / 下架） · 分类管理 · 订单看板 · 发货处理 · 售后审核 |
| 🔐 **系统** | JWT 双令牌认证 · 对称注册（同一邮箱可持双角色） · 乐观锁库存 |

## 🧱 技术栈

```
┌─────────────────────────────────────────────────┐
│                    前端层                         │
│  frontend-user (顾客端)    frontend-store (管理端) │
│  React 18 + Vite 5        React 18 + Vite 5      │
│  TanStack Query 5         TanStack Query 5        │
│  React Router v6          React Router v6          │
│  Tailwind CSS 3           Tailwind CSS 3           │
│  Nginx (生产)              Nginx (生产)             │
└──────────────┬──────────────────────────────────┘
               │  /api  /uploads
┌──────────────▼──────────────────────────────────┐
│                    后端层                         │
│  Node.js 20 + Express 4 + TypeScript 5           │
│  JWT 双令牌 (Access 15min + Refresh 7d)           │
│  zod 校验 · multer 上传 · Swagger API 文档        │
│  Jest + Supertest 测试                            │
└──────────────┬──────────────────────────────────┘
               │  Prisma ORM
┌──────────────▼──────────────────────────────────┐
│                    数据层                         │
│  MySQL 8.0 · 8 个数据模型 · 48 个商品分类         │
└─────────────────────────────────────────────────┘
```

## 🚀 快速开始

```bash
# 1. 克隆仓库
git clone <your-repo-url>
cd babu_System-Analysis-Design-Modelling-and-Development

# 2. 启动全部服务（MySQL + 后端 + 两个前端）
docker compose up -d
```

> 💡 **WebStorm / IntelliJ 用户**：也可以直接在 IDE 中右键 `docker-compose.yml` → Run，效果相同。

启动完成后打开浏览器：

| 页面 | 地址 |
|------|------|
| 🛍️ 顾客端 | http://localhost:5173 |
| 🏪 管理端 | http://localhost:5174 |
| 📡 API 文档 (Swagger) | http://localhost:3000/api-docs |

<details>
<summary>🔧 国内网络环境注意事项</summary>
<br/>

若 Docker Hub 拉取镜像失败，先配置镜像加速器，再使用经典构建器启动：

```bash
DOCKER_BUILDKIT=0 docker compose up -d --build
```
</details>

### 🔑 默认账户

| 角色 | 邮箱 | 密码 |
|------|------|------|
| 管理员 | `admin@shop.com` | `admin123` |
| 顾客 | 自行注册即可 | — |

## 📂 项目结构

```
├── docker-compose.yml          # 4 服务编排
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma       # 8 个数据模型
│   │   └── seed.ts             # 48 个商品分类种子数据
│   └── src/
│       ├── app.ts              # Express 应用配置
│       ├── index.ts            # 入口文件
│       ├── swagger.ts          # Swagger 文档
│       ├── lib/                # Prisma / JWT 工具
│       ├── middleware/         # auth · validate · upload · error
│       ├── routes/             # 7 个路由模块
│       └── schemas/            # zod 校验模式
├── frontend-user/              # 顾客端 (:5173)
│   └── src/
│       ├── api/                # axios + 拦截器
│       ├── components/         # Layout · ProtectedRoute
│       ├── hooks/              # useAuth (React Context)
│       └── pages/              # 9 个页面组件
└── frontend-store/             # 管理端 (:5174)
    └── src/                    # 同上结构 + ADMIN 路由守卫
```

## 🔄 订单状态机

```
  ┌──────┐    用户取消      ┌───────────┐
  │ PAID │ ───────────────→ │ CANCELLED │  终态 · 库存恢复
  └──┬───┘                  └───────────┘
     │ 管理员发货
     ▼
  ┌────────┐  确认收货/7天自动   ┌───────────┐
  │SHIPPED │ ─────────────────→ │ COMPLETED │
  └────────┘                    └─────┬─────┘
                                     │ 申请售后 (最多 3 次)
                                     ▼
                               ┌───────────────┐
                               │ RETURN_PENDING │
                               └───┬───────┬───┘
                     同意退货        │       │  拒绝退货
                                     ▼       ▼
                               ┌────────┐  ┌───────────┐
                               │REFUNDED│  │ COMPLETED │
                               │  终态   │  │ (attempt+1)│
                               └────────┘  └───────────┘
```

## 🗃️ 数据模型

```
User ──┬── CartItem ──── Product ──── Category (树形)
       │                     │
       ├── Order ── OrderItem │
       │    │          (快照)  │
       │    └── Review ───────┘
       │
       └── (role: USER | ADMIN)
```

关键设计：
- **OrderItem 快照** — 存储下单时的商品名 / 价格 / 图片，后续商品修改不影响历史订单
- **软删除** — `Product.isActive` 切换，保留订单关联
- **乐观锁库存** — `WHERE stock >= quantity` 防止超卖
- **对称注册** — 同一邮箱在两端注册自动合并角色，无需重复创建

## 📡 API 概览

| 方法 | 路径 | 说明 |
|------|------|------|
| `POST` | `/api/auth/register` | 注册 |
| `POST` | `/api/auth/login` | 登录 |
| `POST` | `/api/auth/refresh` | 刷新令牌 |
| `GET` | `/api/products` | 商品列表 |
| `GET` | `/api/products/:id` | 商品详情 |
| `POST` | `/api/products` | 新增商品 🔒 ADMIN |
| `PUT` | `/api/products/:id` | 编辑商品 🔒 ADMIN |
| `GET` | `/api/cart` | 购物车 |
| `POST` | `/api/cart` | 加入购物车 |
| `POST` | `/api/orders` | 创建订单 |
| `GET` | `/api/orders` | 订单列表 |
| `POST` | `/api/orders/:id/confirm` | 确认收货 |
| `POST` | `/api/orders/:id/cancel` | 取消订单 |
| `PATCH` | `/api/orders/:id/status` | 发货 🔒 ADMIN |
| `POST` | `/api/orders/:id/return` | 申请售后 |
| `GET` | `/api/categories` | 分类列表 |

> 📡 完整 Swagger 文档：启动后访问 http://localhost:3000/api-docs

## 🎨 设计亮点

- **双主题** — 顾客端温暖纸质感 / 管理端暗色专业风，各自独立的视觉体系
- **看板式订单管理** — 四列状态流，竖线贯穿到底，一目了然
- **渐进式筛选** — 折叠面板，Grid 精确对齐，展开收起带过渡动画
- **拖拽上传** — 商品图片支持点击选择 + 拖拽投放，即时预览

## 📸 界面预览

<details open>
<summary>🛍️ 顾客端</summary>

| 商品列表 | 商品详情 |
|:---:|:---:|
| 分类筛选 · 网格布局 · 悬停效果 | 大图展示 · 数量选择 · 加入购物车 |

| 购物车 | 订单列表 |
|:---:|:---:|
| 数量调整 · 即时计算 | 状态标签 · 时间线展示 |

</details>

<details>
<summary>🏪 管理端</summary>

| 订单看板 | 商品管理 |
|:---:|:---:|
| 四列状态看板 · 竖线贯穿分隔 | 上架 / 下架 · 库存管理 |

</details>

---

<p align="center">
  <sub>Made with ❤️ for System Analysis & Design</sub>
</p>
