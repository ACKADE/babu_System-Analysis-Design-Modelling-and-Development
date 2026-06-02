# 项目脚手架计划（修订版）

## 目标
快速搭建一个“可启动、可联调、可扩展”的双端电商项目基线，确保后续开发不返工。

## 阶段 1：仓库结构与工程约束
- 建立 `backend`、`frontend-user`、`frontend-store`、`docs` 目录
- 统一 TypeScript、ESLint、Prettier（如课程要求）
- 统一环境变量模板与命名规范

## 阶段 2：基础设施
- Docker Compose：MySQL + backend + 可选 phpMyAdmin
- 后端健康检查、错误处理中间件、日志中间件
- Swagger 初始化并接入基础鉴权说明

## 阶段 3：后端基线
- Prisma 初始化、迁移与 seed
- Auth/Product/Order 模块路由骨架
- RBAC 中间件（USER / ADMIN）

## 阶段 4：前端基线
- 用户端与商家端分别初始化 React + Vite + TS
- 接入路由、请求客户端、鉴权拦截器
- 建立 Layout、ProtectedRoute、基础页面壳

## 阶段 5：联调基线
- 跑通登录、商品列表、创建商品 3 条最小联调路径
- 建立统一错误提示规范

## 完成标准
- 新成员在一小时内可本地启动并访问三端（用户端/商家端/API）
- 至少 3 个 API 在 Swagger 可调试可回包
- 两个前端可基于真实 API 成功读写数据
