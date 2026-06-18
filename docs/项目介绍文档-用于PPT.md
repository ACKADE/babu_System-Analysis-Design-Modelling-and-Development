# Babu 小型电商演示平台 — 项目介绍文档

> **用途**：本文档用于制作项目汇报/答辩 PPT，内容详尽，可按章节拆分为多页幻灯片。
>
> **项目类型**：课程设计项目（系统分析与设计建模与开发）
>
> **团队人数**：4 人 | **开发方法**：敏捷 Scrum，2 周 Sprint

---

## 一、项目概述

### 1.1 项目定位

**Babu** 是一个**全栈小型电商演示平台**，采用**前后端分离架构**，包含两个独立前端（用户端 + 管理端）和一个共享后端，通过 Docker Compose 一键部署。

### 1.2 核心特性

- 完整的电商购物闭环：商品浏览 → 加入购物车 → 下单 → 支付（模拟）→ 发货 → 确认收货 → 退换货
- 双角色系统：普通用户（USER）和管理员（ADMIN），支持同一邮箱持有双重角色
- 对称注册机制：两侧注册同一邮箱时自动合并角色
- 齐全的订单状态机：PAID → SHIPPED → COMPLETED，支持取消、退货、退款审核全流程
- 7 天自动完成：已发货订单到达 7 天自动转为已完成（懒加载模式）
- 看板式订单管理：管理员界面以看板视图管理订单流转
- 中英文双语切换：两个前端均支持中/英文界面实时切换

### 1.3 项目规模

| 维度 | 数量 |
|------|------|
| API 端点 | 30 个 |
| 数据库模型 | 8 张表 |
| 前端页面 | 18 个（用户端 10 + 管理端 8） |
| 自动化测试 | 7 个（Jest + Supertest） |
| Docker 服务 | 4 个（MySQL + 后端 + 用户端 + 管理端） |
| 品类种子数据 | 48 个（12 父类 × 4 子类） |
| 中英文翻译键 | 320+ 条 |

---

## 二、团队与开发方法

### 2.1 团队成员与分工

| 姓名 | 学号 | 角色 |
|------|------|------|
| 李同心 | 202432110105 | 主后端开发 + 副 DevOps |
| 李友轩 | 202332110119 | 主前端（用户端）+ 副 UI 设计 |
| 黄雨静 | 202432110113 | 主前端（管理端）+ 副测试 |
| 刘岩博 | 202432110119 | 主数据库设计 + 副文档 |

### 2.2 开发方法：敏捷 Scrum

- **迭代周期**：2 周 Sprint
- **风险管理**：识别了技术风险（Docker 构建失败、JWT 安全性）和团队风险（进度延误、协作冲突），每项均制定了应对策略
- **会议机制**：每日站会 + Sprint 评审 + 回顾会议

### 2.3 项目使命

> 通过完整的前后端开发实践，掌握系统分析、设计、建模与开发的完整流程，理解电商核心业务逻辑的实现方式。

---

## 三、技术架构

### 3.1 整体架构图

```
┌─────────────────────────────────────────────────────────┐
│                    Docker Compose                        │
│                                                          │
│  ┌──────────────┐  ┌──────────────┐                     │
│  │ 用户前端 :5173│  │ 管理前端 :5174│   React 19 + Vite 8 │
│  │  (Nginx)     │  │  (Nginx)     │   Tailwind CSS 4     │
│  └──────┬───────┘  └──────┬───────┘   TanStack Query 5   │
│         │ /api /uploads   │                              │
│         ▼                 ▼                              │
│  ┌─────────────────────────────────┐                    │
│  │       后端 API :3000             │   Express 4        │
│  │   (Node.js 20 Alpine)           │   Prisma 5          │
│  │   JWT 鉴权 + Zod 校验           │   TypeScript 5      │
│  └──────────────┬──────────────────┘                    │
│                 │                                        │
│                 ▼                                        │
│  ┌─────────────────────────────────┐                    │
│  │      MySQL 8.0 :3306            │                    │
│  └─────────────────────────────────┘                    │
└─────────────────────────────────────────────────────────┘
```

### 3.2 技术栈详表

| 层级 | 技术 | 版本 | 选型理由 |
|------|------|------|----------|
| **后端运行时** | Node.js + Express | 20 / 4 | 生态成熟，学习曲线平缓，适合教学项目 |
| **语言** | TypeScript | 5 | 类型安全，减少运行时错误 |
| **ORM** | Prisma | 5 | 类型安全的数据库访问，自动生成类型 |
| **数据库** | MySQL | 8.0 | 关系型数据库，适合电商数据结构 |
| **身份验证** | JWT 双令牌 | — | Access Token（15min）+ Refresh Token（7天）无状态认证 |
| **输入校验** | Zod | — | 声明式 Schema → 中间件 → 路由，类型推导 |
| **文件上传** | Multer | — | 图片上传，5MB 限制，仅允许 JPEG/PNG/GIF/WebP |
| **API 文档** | Swagger | — | swagger-jsdoc + swagger-ui-express 自动生成 |
| **安全** | Helmet + Rate Limit | — | HTTP 安全头 + 接口频率限制 |
| **测试** | Jest + Supertest | — | 接口测试 + 单元测试 |
| **前端框架** | React | 19 | 组件化 UI，生态丰富 |
| **构建工具** | Vite | 8 | 极速 HMR 热更新 |
| **CSS** | Tailwind CSS | 4 | 原子化 CSS（v4 无配置文件，CSS-first 配置） |
| **数据请求** | TanStack Query | 5 | 服务端状态管理，自动缓存/失效/重试 |
| **路由** | React Router | 7 | 声明式路由，支持嵌套布局 |
| **HTTP 客户端** | Axios | — | 拦截器机制实现无感 Token 刷新 |
| **部署** | Docker Compose | — | 4 服务编排，一键启动 |

### 3.3 端口规划

| 服务 | 对外端口 | 对内端口 | 说明 |
|------|----------|----------|------|
| 后端 API | 3000 | 3000 | 含 Swagger 文档页面 `/api-docs` |
| 用户前端 | 5173 | 80 (Nginx) | `/api`、`/uploads` 代理到后端 |
| 管理前端 | 5174 | 80 (Nginx) | 同上代理模式 |
| MySQL | 13306 | 3306 | 容器内使用 `mysql:3306`，宿主机暴露 `13306` |

---

## 四、数据库设计

### 4.1 E-R 模型（8 张表）

```
User ──┬── CartItem ──── Product ──── Category (自引用树)
       │       │               │
       │       │               ├── Review (含 Order 引用)
       │       │               │
       ├── Order ─── OrderItem (快照模式)
       │
       └── OrderSequence (订单号生成器)
```

### 4.2 各表说明

| 模型 | 核心字段 | 设计要点 |
|------|----------|----------|
| **User** | id, name, email, password, role, createdAt | role 为逗号分隔字符串（如 `"USER,ADMIN"`），支持对称注册 |
| **Category** | id, name, parentId | 自引用树结构，`(parentId, name)` 联合唯一，支持无限层级 |
| **Product** | id, name, summary, description, price(Decimal), stock, thumbnailUrl, imageUrl, isActive, categoryId | 软删除（isActive），价格使用 Decimal 防浮点误差 |
| **CartItem** | id, userId, productId, quantity | `(userId, productId)` 联合唯一，每个用户每个商品仅一条 |
| **Order** | id, orderNo, userId, recipient*, totalAmount(Decimal), status, shippedAt, returnReason, returnAttempts | 完整的收件人快照 + 退货追踪 |
| **OrderItem** | id, orderId, productId, productName, productPrice(Decimal), productImage, quantity | **快照模式**：下单时冻结商品信息，不受后续商品修改影响 |
| **OrderSequence** | date(VarChar 8), lastSeq | 原子订单号生成：YYYYMMDD + 4 位流水号，`findFirst + 1` 或 `create 0001` |
| **Review** | id, userId, productId, orderId(@unique), rating(1-5), content | 每笔订单仅可评价一次，防止重复评价 |

### 4.3 关键设计决策

1. **订单项快照**：OrderItem 存储商品名称、价格、图片的**历史副本**，确保即使商品下架或价格变动，历史订单数据依然完整且准确。
2. **软删除**：产品不真正删除，通过 `isActive` 布尔字段切换上下架状态，保护历史订单关联。
3. **库存乐观锁**：扣减库存时使用 `WHERE stock >= quantity`，防止超卖。
4. **对称注册**：同一邮箱在用户端和管理端分别注册时，如果密码一致，自动追加角色（如 `"USER"` → `"USER,ADMIN"`），密码不一致则拒绝。
5. **Decimal 类型处理**：价格字段使用 Prisma Decimal 类型，后端通过全局 JSON 序列化中间件自动转为 Number。

---

## 五、功能模块详解

### 5.1 用户端功能（U01-U09，共 9 个模块）

| 模块 | 功能 | 对应页面 | 对应 API |
|------|------|----------|----------|
| **U01 用户认证** | 注册、登录、Token 刷新、忘记密码（重置为 123456） | Login, Register | `/api/auth/register`, `/api/auth/login`, `/api/auth/refresh`, `/api/auth/forgot-password` |
| **U02 个人中心** | 查看/修改个人信息、修改密码 | Profile | `/api/auth/me`, `/api/auth/profile`, `/api/auth/password` |
| **U03 商品浏览** | 商品列表（按分类筛选）、商品详情（含评价） | ProductList, ProductDetail | `/api/products`, `/api/products/:id`, `/api/products/:id/reviews` |
| **U04 购物车** | 添加商品、修改数量、删除商品 | Cart | `/api/cart` (CRUD) |
| **U05 下单结算** | 填写收货信息、提交订单、库存校验 | Checkout | `/api/orders` (POST) |
| **U06 支付成功** | 确认页展示订单摘要 | PaymentSuccess | — |
| **U07 订单管理** | 查看订单列表/详情、取消订单、确认收货 | Orders, OrderDetail | `/api/orders`, `/api/orders/:id`, `/api/orders/:id/cancel`, `/api/orders/:id/confirm` |
| **U08 退货申请** | 申请退货（最多 3 次）、查看退货状态 | OrderDetail | `/api/orders/:id/return` |
| **U09 商品评价** | 确认收货后评价商品（评分 1-5 + 文字） | OrderDetail | `/api/orders/:id/review` |

### 5.2 管理端功能（S01-S05，共 5 个模块）

| 模块 | 功能 | 对应页面 | 对应 API |
|------|------|----------|----------|
| **S01 管理员认证** | 注册（只能获得 ADMIN 角色）、登录（非 ADMIN 拒绝） | Login, Register | `/api/auth/register`, `/api/auth/login` |
| **S02 仪表盘** | 统计卡片：商品总数/在售数、月订单/月销售额、待发货/待退货数 | Dashboard | `/api/dashboard` |
| **S03 商品管理** | 商品 CRUD、上下架切换、图片上传/替换、分类选择 | ProductManage, ProductForm | `/api/products` (CRUD + toggle) |
| **S04 看板订单** | 4 列看板视图（待发货/已发货/已完成/待退货）+ 已归档折叠区 | Orders (kanban) | `/api/orders` (admin) |
| **S05 订单处理** | 发货、批准退货（恢复库存）、拒绝退货（+1 次数） | OrderDetail | `/api/orders/:id/status`, `/api/orders/:id/return/approve`, `/api/orders/:id/return/reject` |

---

## 六、订单状态机

### 6.1 状态流转图

```
                    ┌──────────┐
                    │   PAID   │  ← 用户下单
                    │  待发货  │
                    └────┬─────┘
                         │
              ┌──────────┼──────────┐
              │ 管理员发货 │          │ 用户取消
              ▼          │          ▼
        ┌──────────┐    │    ┌───────────┐
        │ SHIPPED  │    │    │ CANCELLED  │  ← 终态，恢复库存
        │  待收货  │    │    │   已取消   │
        └────┬─────┘    │    └───────────┘
             │          │
    ┌────────┼────────┐ │
    │ 用户确认 │ 7天自动 │ │
    ▼        ▼        │ │
┌──────────────┐     │ │
│  COMPLETED   │     │ │
│   已完成     │◄────┘ │
└──────┬───────┘       │
       │ 用户申请退货    │
       ▼               │
┌──────────────┐       │
│RETURN_PENDING│       │  ← 最多 3 次退货申请
│   待退货     │       │
└──────┬───────┘       │
       │               │
  ┌────┼────┐          │
  │ 批准 │ 拒绝         │
  ▼    ▼              │
┌────────┐  ┌──────────┐
│REFUNDED│  │COMPLETED │  ← 拒绝后退回已完成
│ 已退款 │  │  (退回)   │
└────────┘  └──────────┘
  终态         继续可用
```

### 6.2 状态转换规则

| 源状态 | 目标状态 | 触发者 | 条件 | 副作用 |
|--------|----------|--------|------|--------|
| PAID | SHIPPED | 管理员 | — | 记录 shippedAt |
| PAID | CANCELLED | 用户 | — | 恢复库存 |
| SHIPPED | COMPLETED | 用户 / 系统 | 用户主动或 shippedAt ≥ 7 天 | — |
| COMPLETED | RETURN_PENDING | 用户 | returnAttempts < 3 | 记录退货原因 |
| RETURN_PENDING | REFUNDED | 管理员 | — | 恢复库存 |
| RETURN_PENDING | COMPLETED | 管理员 | — | returnAttempts +1 |

### 6.3 7 天自动完成机制

- **触发方式**：懒加载模式（非定时任务），每次查询订单列表或详情时自动检测
- **实现位置**：`services/orderLifecycle.ts`
- **判断逻辑**：`status === 'SHIPPED' && shippedAt < now - 7 days → COMPLETED`
- **优势**：无需额外基础设施（Cron/消息队列），零运维成本

---

## 七、API 设计

### 7.1 设计规范

| 约定 | 说明 |
|------|------|
| **成功响应** | 直接返回数据或 `{ message, ...data }` |
| **错误响应** | `{ message: "中文描述", errors?: [{ field, message }] }` |
| **HTTP 状态码** | 200/201 成功，400 业务/校验错误，401 未登录，403 无权限，404 不存在，413 文件过大，500 服务器错误 |
| **字段级错误** | 仅 Zod 校验失败时附带 `errors` 数组，标注具体字段和原因 |
| **分页** | 当前版本未实现，返回全量数据（适用于教学 demo 规模） |

### 7.2 所有 API 端点（30 个）

#### 认证模块（8 个）
| 方法 | 路径 | 说明 | 认证 | 频率限制 |
|------|------|------|------|----------|
| POST | `/api/auth/register` | 对称注册 | — | 20/15min |
| POST | `/api/auth/login` | 登录获取双令牌 | — | 20/15min |
| POST | `/api/auth/refresh` | 刷新 Access Token | Refresh Token | — |
| POST | `/api/auth/logout` | 登出（无操作） | — | — |
| POST | `/api/auth/forgot-password` | 重置密码为 123456 | — | 20/15min |
| GET | `/api/auth/me` | 获取当前用户信息 | Access Token | — |
| PUT | `/api/auth/profile` | 修改用户名 | Access Token | — |
| PUT | `/api/auth/password` | 修改密码（需旧密码） | Access Token | — |

#### 商品模块（5 个）
| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| GET | `/api/products` | 商品列表（公开仅显示在售，`?all=true` + admin 显示全部） | 可选 |
| GET | `/api/products/:id` | 商品详情（公开 404 屏蔽下架商品） | 可选 |
| POST | `/api/products` | 创建商品（multipart 含图片） | ADMIN |
| PUT | `/api/products/:id` | 编辑商品（可替换图片） | ADMIN |
| PATCH | `/api/products/:id/toggle` | 上下架切换 | ADMIN |

#### 购物车模块（4 个）
| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| GET | `/api/cart` | 获取购物车列表 | USER |
| POST | `/api/cart` | 添加商品到购物车 | USER |
| PUT | `/api/cart/:itemId` | 修改商品数量 | USER |
| DELETE | `/api/cart/:itemId` | 移除购物车项 | USER |

#### 订单模块（9 个）
| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| POST | `/api/orders` | 创建订单（事务：扣库存+清购物车+生成单号） | USER |
| GET | `/api/orders` | 订单列表（支持 `?status=` 筛选） | USER/ADMIN |
| GET | `/api/orders/:id` | 订单详情 | USER/ADMIN |
| PATCH | `/api/orders/:id/status` | 发货（PAID → SHIPPED） | ADMIN |
| POST | `/api/orders/:id/confirm` | 确认收货 | USER |
| POST | `/api/orders/:id/cancel` | 取消订单（事务：恢复库存） | USER |
| POST | `/api/orders/:id/return` | 申请退货（≤3 次） | USER |
| POST | `/api/orders/:id/return/approve` | 批准退货（事务：恢复库存） | ADMIN |
| POST | `/api/orders/:id/return/reject` | 拒绝退货（次数 +1） | ADMIN |

#### 其他模块（4 个）
| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| GET | `/api/categories` | 分类树 | — |
| GET | `/api/products/:id/reviews` | 商品评价列表 | — |
| POST | `/api/orders/:id/review` | 创建评价（仅一次） | USER |
| GET | `/api/dashboard` | 仪表盘统计数据 | ADMIN |
| GET | `/api/health` | 健康检查 | — |

---

## 八、安全设计

### 8.1 多层安全防护

| 层级 | 措施 | 实现 |
|------|------|------|
| **传输安全** | HTTP 安全头 | helmet 中间件 |
| **认证** | JWT 双令牌 | Access Token 15 分钟 + Refresh Token 7 天 |
| **授权** | 角色中间件 | `authenticate` 提取身份 + `requireRole(...roles)` 校验角色 |
| **输入校验** | Zod Schema 中间件 | 所有请求 body/query/params 均经过 Schema 校验 |
| **频率限制** | Rate Limit | 认证接口 20 次/15 分钟窗口 |
| **文件上传** | 类型白名单 + 大小限制 | 仅 JPEG/PNG/GIF/WebP，单文件 ≤ 5MB |
| **密码** | bcrypt 哈希 | 不存储明文 |
| **库存** | 乐观锁 | `WHERE stock >= quantity` 防止并发超卖 |
| **前端** | 路由守卫 | `ProtectedRoute` 组件 + TanStack Query 5 分钟缓存 |

### 8.2 前端 Token 刷新机制

```
请求 → 401？→ 是 → 用 RefreshToken 换新 AccessToken → 重试原请求
                    → 失败 → 清除 sessionStorage → 跳转登录页
       → 否 → 返回数据
```

---

## 九、前端设计

### 9.1 用户端（frontend-user）

**设计风格**：温暖纸质感
- 配色：米白底色 + 大地色系 + 金色点缀 + 鼠尾草绿
- 字体：衬线展示字体
- 圆角：大圆角卡片

**页面结构**（10 页）：

| 页面 | 核心交互 |
|------|----------|
| **商品列表** | 父分类横滑 Tab + 子分类网格按钮筛选；商品卡片网格（缩略图、名称、价格），hover 上浮动效；骨架屏加载态；空状态/错误提示 |
| **商品详情** | 4:3 主图（object-contain）+ 缩略图；数量选择器 ± 按钮（≥1）；加入购物车（未登录跳登录）；商品描述富文本区；评价列表（星级 + 内容 + 日期） |
| **购物车** | 商品行（图、名、单价、数量±、小计）；已下架商品红色标记；删除按钮（二次确认）；底栏合计 + 去结算按钮 |
| **结算页** | 收货信息表单（姓名 2-50 字、手机 7-15 位、详细地址）；订单明细列表 + 合计；提交按钮（请求中禁用防重复） |
| **支付成功** | 绿色勾号动画；订单号 + 收件人 + 地址 + 电话 + 金额摘要；"查看订单" / "继续购物" 按钮 |
| **我的订单** | 订单卡片列表（单号、状态彩色标签、商品缩略图、金额）；按状态筛选 |
| **订单详情** | 完整订单信息 + 商品列表 + 状态标签 + 收件人信息；操作按钮：取消（PAID）、确认收货（SHIPPED）、申请退货（COMPLETED 且 <3 次）、写评价（COMPLETED 且未评） |
| **登录/注册** | 邮箱 + 密码表单；忘记密码（重置为 123456，Demo 模式）；错误提示 / 成功提示 |
| **个人中心** | 邮箱（只读）+ 角色显示；用户名行内编辑；修改密码表单 |

**缓存策略**：QueryClient `staleTime: 5 min`，每次 mutation 成功的 `onSuccess` 中精确 invalidate 所有受影响的 query scope。

**跨实体状态清理**：订单详情页在 `id` 变化时 `useEffect` 重置所有 mutation 状态，防止 A 订单的错误/成功提示出现在 B 订单。

### 9.2 管理端（frontend-store）

**设计风格**：暗色专业风
- 配色：Slate 950-300 灰阶 + 琥珀色强调 + 翠绿色成功态
- 字体：等宽数字字体（表格/统计数据）
- 布局：52px 宽侧边栏 + 主内容区

**页面结构**（8 页）：

| 页面 | 核心交互 |
|------|----------|
| **仪表盘** | 6 张统计卡片（2 列网格）：商品总数、在售商品、待发货（>0 高亮）、待退货、月订单量、月销售额 |
| **商品管理** | 表格视图（缩略图、名称、价格、库存、状态标签 + 编辑/上下架按钮）；"添加商品" 按钮跳转表单 |
| **商品表单** | 创建/编辑双模式；名称、摘要、描述(textarea)、价格、库存、分类（2 级扁平列表带缩进）；文件拖拽上传区（缩略图 + 详情图，预览 + 移除按钮）；FormData 提交 |
| **看板订单** | 4 列看板（PAID / SHIPPED / COMPLETED / RETURN_PENDING），列间竖线分隔，每列不同强调色；卡片显示单号、用户、日期、金额；可折叠"已归档"区显示 CANCELLED + REFUNDED |
| **订单详情** | 完整订单信息（单号、用户姓名邮箱、收件人、时间戳、商品列表、金额）；操作按钮：发货（PAID，琥珀色）、批准退货（RETURN_PENDING，翠绿色）、拒绝退货（RETURN_PENDING，红色）；退货原因展示；用户评价展示（琥珀色框）；mutation 状态 id 变化时重置 |
| **登录/注册** | 暗色主题卡片；登录后校验 role 含 ADMIN，否则拒绝并提示"该账号无管理员权限"；注册自动获得 ADMIN 角色 |

### 9.3 中英文国际化

- **实现方式**：React Context + 自定义 `useLanguage` Hook
- **翻译条目**：用户端 170+ 条，管理端 150+ 条，合计 320+
- **覆盖范围**：导航栏、通用文本、商品、购物车、结算、订单、认证、个人中心、状态标签、表单验证提示
- **切换方式**：顶栏/侧边栏语言切换按钮（EN / 中）

---

## 十、测试策略

### 10.1 测试现状

| 测试文件 | 测试数量 | 覆盖内容 |
|----------|----------|----------|
| `health.test.ts` | 1 | 健康检查接口 `GET /api/health` |
| `cart-rules.test.ts` | 2 | 购物车更新数量时拒绝已下架商品、拒绝超库存数量 |
| `product-visibility.test.ts` | 2 | `?all=true` 无 admin token 仅返回在售品，admin token 返回全部 |
| `product-detail-visibility.test.ts` | 2 | 下架商品详情公开返回 404，admin 返回 200 |
| `order-lifecycle.test.ts` | 2 | 7 天自动完成：旧发货自动转完成，新发货不变 |
| `order-create-boundary.test.ts` | 1 | 库存竞争返回 400 `库存不足` 而非 500 |

**合计**：7 个测试，全部通过

### 10.2 测试技术

- **框架**：Jest + ts-jest
- **HTTP 测试**：Supertest（不启动服务器，直接传入 Express app）
- **数据层**：`jest.mock('../src/lib/prisma')` 全局 Mock PrismaClient
- **运行方式**：`npm test`（后端目录）

---

## 十一、部署方案

### 11.1 Docker Compose 一键部署

```bash
# 启动全部 4 个服务
docker compose up -d

# 重建镜像并启动（代码变更后）
docker compose up -d --build

# 停止所有服务
docker compose down
```

### 11.2 服务编排流程

```
1. mysql 容器启动（健康检查: mysqladmin ping）
2. backend 容器启动（depends_on mysql healthy）
   ├── npx prisma db push     ← 同步 Schema 到 DB
   ├── npx prisma db seed     ← 填充种子数据
   └── npx tsx src/index.ts   ← 启动 Express
3. user-frontend 容器启动（depends_on backend）
4. store-frontend 容器启动（depends_on backend）
```

### 11.3 前端 Nginx 配置

- 静态文件直接服务
- SPA fallback：所有非 `/api`、非 `/uploads` 路由 → `index.html`
- `/api` 反向代理 → `backend:3000`
- `/uploads` 反向代理 → `backend:3000`

---

## 十二、项目亮点与技术特色

### 12.1 工程化亮点

1. **类型安全全链路**：TypeScript + Zod + Prisma 三重型检（数据库 → 后端 → 前端），编译期发现大部分 bug
2. **前后端分离 + Docker 统一部署**：开发时 Vite HMR 热更新，部署时 Nginx 静态服务，一套 compose 文件全搞定
3. **API 文档自动生成**：Swagger JSDoc 注释即文档，`/api-docs` 实时可交互测试
4. **种子数据即开即用**：`prisma db seed` 一键生成管理员账号 + 48 个品类，立即可演示
5. **AI 友好的 CLAUDE.md**：为 Claude Code 提供完整的项目上下文（架构、模式、约定），提高 AI 辅助开发效率

### 12.2 业务逻辑亮点

1. **订单项快照模式**：商品信息变动不影响历史订单数据完整性
2. **原子订单号生成**：`OrderSequence` 表 + Prisma 事务保证唯一且连续
3. **7 天自动完成**：无需 Cron，查询时懒加载判断，零运维成本
4. **对称注册 + 角色合并**：创新的双端注册机制，同一账号可身兼两角
5. **退货次数限制**：最多 3 次退货申请，防止滥用

### 12.3 前端体验亮点

1. **看板式订单管理**：直观的拖拽式视觉设计（虽未实现拖拽，但布局已完全看板化）
2. **无感 Token 刷新**：Axios 拦截器自动处理，用户无需关心登录态
3. **中英文实时切换**：Context 驱动，全界面即时响应
4. **精确的缓存失效**：每次变更操作精确 invalidate 相关查询，避免手动刷新
5. **文件拖拽上传**：自定义 FileUploadZone 组件，支持拖拽 + 点击 + 预览 + 移除

---

## 十三、已知不足与改进方向

| 维度 | 当前状态 | 改进方向 |
|------|----------|----------|
| **分类管理** | 仅查询，无 CRUD | 增加管理端分类增删改查 |
| **分页** | 全量返回 | 实现分页 + 游标/偏移查询 |
| **测试覆盖** | 7 个 API 测试 | 扩展到单元测试 + 前端组件测试 + E2E |
| **代码结构** | 部分业务逻辑在路由层 | 抽取 Service 层，路由仅做调度 |
| **前端复用** | 两个前端大量重复代码 | 抽取共享组件库/hooks |
| **类型安全** | 存在 `any` 逃逸 | 全面消除 `any`，启用 strict 模式 |
| **支付** | 纯模拟 | 集成真实支付网关（如 Stripe/支付宝） |
| **图片管理** | 本地磁盘存储 | 迁移到对象存储（S3/OSS） |

---

## 十四、默认账号与快速体验

### 14.1 默认账号

| 账号 | 密码 | 角色 |
|------|------|------|
| `admin@shop.com` | `admin123` | ADMIN（管理员） |

普通用户通过前端注册页面自行创建。

### 14.2 快速启动步骤

1. 确保已安装 Docker Desktop
2. 克隆项目并进入目录
3. 执行 `docker compose up -d`
4. 等待服务启动完成（约 1-2 分钟）
5. 访问：
   - 用户商城：`http://localhost:5173`
   - 管理后台：`http://localhost:5174`
   - API 文档：`http://localhost:3000/api-docs`

---

## 附录：PPT 制作建议

建议将本文档拆分为以下 PPT 页面（约 20-25 页）：

| 页码 | 内容 | 来源章节 |
|------|------|----------|
| 1 | 封面（项目名 + 团队成员） | 一 |
| 2 | 目录 | — |
| 3 | 项目概述与定位 | 一 |
| 4 | 项目规模一览 | 一.3 |
| 5 | 团队分工与开发方法 | 二 |
| 6 | 技术架构总览图 | 三.1 |
| 7 | 技术栈详解 | 三.2 |
| 8 | 数据库 E-R 图 | 四.1 |
| 9 | 数据库设计要点 | 四.2-3 |
| 10-11 | 用户端功能模块 | 五.1 |
| 12-13 | 管理端功能模块 | 五.2 |
| 14 | 订单状态机 | 六 |
| 15 | API 设计规范 | 七.1 |
| 16 | 核心 API 展示 | 七.2 |
| 17 | 安全设计 | 八 |
| 18 | 用户端 UI 展示 | 九.1 |
| 19 | 管理端 UI 展示 | 九.2 |
| 20 | 中英文国际化 | 九.3 |
| 21 | 测试策略 | 十 |
| 22 | Docker 部署方案 | 十一 |
| 23 | 项目亮点总结 | 十二 |
| 24 | 不足与改进 | 十三 |
| 25 | 致谢 / Q&A | — |
