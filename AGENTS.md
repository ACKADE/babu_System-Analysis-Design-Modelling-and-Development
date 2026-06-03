# AGENTS.md

This file provides guidance to Codex (Codex.ai/code) when working with code in this repository.

## Shell & Encoding

- Use **PowerShell 7 (pwsh)** as default shell. Path: `C:\Users\32654\AppData\Local\Microsoft\WindowsApps\pwsh.exe`
- Fall back to Git Bash only when pwsh is unsuitable.
- All files containing Chinese must be UTF-8 without BOM (`-Encoding UTF8` in PowerShell).

## Project Overview

A **small e-commerce demo platform** (course project) with two frontends (user-facing store + admin management) sharing one Express/Prisma backend, orchestrated via Docker Compose.

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Node.js 20+, Express 4, TypeScript 5 |
| ORM | Prisma 5 (MySQL 8) |
| Auth | JWT dual-token (Access 15min + Refresh 7d) |
| Validation | zod (schema → middleware → routes) |
| File upload | multer (5MB limit, local disk, images only) |
| API docs | swagger-jsdoc + swagger-ui-express |
| Testing | Jest + Supertest (separate test DB) |
| Frontend (both) | React 18, Vite 5, TypeScript 5 |
| Styling | Tailwind CSS 3 |
| Data fetching | TanStack Query 5 + axios |
| Routing | React Router v6 |
| Deployment | Docker Compose |

## Project Structure

```
project-root/
├── docker-compose.yml       # 4 services: MySQL + backend + user-frontend + store-frontend
├── backend/
│   ├── prisma/schema.prisma # 8 models (see below)
│   ├── prisma/seed.ts
│   ├── src/
│   │   ├── index.ts         # Entry point (dotenv, listen)
│   │   ├── app.ts           # Express setup (cors, json, routes, error handler)
│   │   ├── swagger.ts
│   │   ├── lib/prisma.ts    # Singleton PrismaClient
│   │   ├── lib/jwt.ts       # sign/verify for access + refresh tokens
│   │   ├── routes/          # auth, products, cart, orders, categories, reviews, dashboard
│   │   ├── middleware/      # auth (authenticate, requireRole), validate (zod), errorHandler, upload
│   │   └── schemas/         # zod schemas for auth, product, order, cart
│   └── uploads/             # Image uploads (mounted as volume)
├── frontend-user/           # Customer-facing store (port 5173)
│   └── src/
│       ├── api/             # client.ts (axios + interceptor), auth/products/cart/orders modules
│       ├── components/      # Layout, ProtectedRoute
│       ├── hooks/           # useAuth
│       └── pages/           # ProductList, ProductDetail, Cart, Checkout, Orders, Login, Register, Profile, etc.
├── frontend-store/          # Admin management (port 5174)
│   └── src/                 # Same structure, ADMIN-only route guards
└── docs/                    # Specs, task docs, plans
```

## Ports

| Service | Port |
|---|---|
| Backend API + Swagger | 3000 |
| User frontend | 5173 |
| Store frontend | 5174 |
| MySQL | 3306 |
| phpMyAdmin (optional) | 8080 |

Each Vite frontend proxies `/api` and `/uploads` to `localhost:3000`.

## Commands

```bash
# Backend (cd backend)
npm install              # Install dependencies
npm run dev              # Start dev server (tsx watch, port 3000)
npm run build            # Compile TypeScript (tsc)
npm start                # Run built JS
npm test                 # Jest (passWithNoTests enabled)
npx prisma db push       # Push schema to DB without migrations
npx prisma db seed       # Seed admin user (admin@shop.com / admin123)
npx prisma studio        # Open Prisma Studio GUI

# Frontend (cd frontend-user or cd frontend-store)
npm install
npm run dev              # Vite HMR dev server
npm run build            # Production build
npm run preview          # Preview production build

# Docker
docker compose up -d                   # Start all 4 services (MySQL + backend + 2 frontends)
docker compose up -d --build           # Rebuild images then start
docker compose down                    # Stop all services
docker compose up -d <service-name>    # Start/rebuild single service (mysql/backend/user-frontend/store-frontend)
# If Docker Hub is unreachable (China), use:
DOCKER_BUILDKIT=0 docker compose up -d --build
```

## Data Model (Prisma)

8 models: **User**, **Category** (self-referencing tree), **Product**, **CartItem**, **Order**, **OrderItem** (snapshot), **OrderSequence** (atomic order-no generator), **Review**

Key design decisions:
- **Symmetric registration**: Same email can hold USER+ADMIN roles (comma-separated string). Registering on the other side appends the role if password matches.
- **Order items are snapshots**: `OrderItem` stores `productName`, `productPrice`, `productImage` at time of purchase — unaffected by later product edits/deletion.
- **Soft delete for products**: `isActive` boolean toggle, never hard-delete (preserves order history).
- **Order numbering**: `OrderSequence` table for `YYYYMMDD` + 4-digit atomic increment.
- **Inventory protection**: Stock decrement uses `WHERE stock >= quantity` for optimistic concurrency.
- **Reviews**: One review per order (`orderId` @unique), up to 3 return attempts (`returnAttempts`).

## Order State Machine

```
PAID → SHIPPED → COMPLETED (manual confirm or 7-day lazy auto-complete)
PAID → CANCELLED (user cancel, stock restored)
COMPLETED → RETURN_PENDING → REFUNDED (admin approve, stock restored)
RETURN_PENDING → COMPLETED (admin reject, returnAttempts +1)
```

CANCELLED and REFUNDED are terminal states. Return requests capped at 3 attempts.

## API Pattern

- Success: return data or `{ message, ...data }` directly
- Error: `{ message: "描述", errors?: [{ field, message }] }` — `errors` only present on zod validation failure
- Status codes: 200/201 (success), 400 (validation/business), 401 (unauthenticated), 403 (wrong role), 404, 413 (file too large), 500

## Key Middleware

- `authenticate` — extracts Bearer token, attaches `req.user` (userId, email, role)
- `requireRole(...roles)` — checks `req.user.role` includes any of the required roles
- `validate(zodSchema)` — validates `{ body, query, params }` against a zod schema, returns 400 with field-level errors

## Decimal Handling

Prisma `Decimal` type must be serialized to `Number` in Express responses. The backend must include a global JSON serialization middleware (e.g., `Decimal.prototype.toJSON = function() { return Number(this.toString()) }`).

## Frontend Auth Flow

- Tokens and user object stored in `sessionStorage`
- Axios request interceptor attaches `Authorization: Bearer <accessToken>`
- Axios response interceptor catches 401 → tries `/api/auth/refresh` with refresh token → retries original request
- On refresh failure: clear storage, redirect to `/login`
- Store frontend additionally checks `role.includes('ADMIN')` on app load, clears session if absent

## TanStack Query Mutation Patterns

**CRITICAL**: Both frontends use `staleTime: 5 min` on the QueryClient. Queries will NOT refetch after mutations unless explicitly invalidated.

Every `useMutation.onSuccess` MUST invalidate **all** affected query scopes:

```tsx
// Detail page mutation — must invalidate both detail AND list:
onSuccess: () => {
  queryClient.invalidateQueries({ queryKey: ['order', id] });    // detail
  queryClient.invalidateQueries({ queryKey: ['orders'] });       // list (fuzzy — matches ['orders', 'admin'] too)
}
```

**Cross-entity mutation state pollution**: When navigating between detail pages (e.g., Order #1 → Order #2), a prior mutation's error/success state persists because the component stays mounted. Reset all mutations on `id` change:

```tsx
useEffect(() => {
  mutationA.reset();
  mutationB.reset();
}, [id]);
```

**Error display is mandatory**: Every mutation error MUST render visible feedback. `onSuccess` alone is not enough — a silent failure makes the user think the action didn't register.

## Image Handling

- multer saves to `backend/uploads/` with timestamp + random prefix filenames
- Allowed MIME types: JPEG, PNG, GIF, WebP
- Frontend uses CSS `object-fit: cover` (1:1 cards/thumbnails) or `contain` (4:3 detail page)
- On product edit: new upload replaces old file on disk
- On failed product creation: orphan uploaded files should be cleaned up

## Primary Language

All user-facing UI text, API error messages, and documentation are written in **Chinese (Simplified)**. Code identifiers and comments are in English.
