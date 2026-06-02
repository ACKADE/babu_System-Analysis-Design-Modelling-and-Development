# CLAUDE.md

This repository stores specification and planning artifacts for a small web-based e-commerce platform.

## Project Baseline
- Architecture: modular monolith
- Backend: Node.js + Express + TypeScript + Prisma + MySQL
- Frontend (both user/admin): React + Vite + TypeScript
- Styling: Tailwind CSS
- Data fetching: TanStack Query + axios
- Docs: Swagger/OpenAPI
- Deployment: Docker Compose

## Critical Conventions
1. Keep user and admin frontend stacks consistent (React + TS only).
2. Do not model multi-role accounts as comma-separated strings.
3. Do not use fixed password reset defaults; use reset tokens with expiry.
4. Preserve money precision in API responses (string-formatted decimals).
5. Enforce order state transitions with explicit state machine checks.

## Functional Scope
- User side: product browse, cart, checkout, orders, after-sales, review, profile.
- Admin side: product management, order fulfillment, return approval, dashboard.

## Delivery Principle
- Keep requirements, APIs, and implementation plans synchronized.
- Any architecture or security change must update docs in the same PR.
