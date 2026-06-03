# Stability First Batch Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the first batch of stability-focused fixes so the project is closer to a reliable demo baseline and its backend/frontend rules are more consistent.

**Architecture:** Keep the existing backend route-centered structure and both existing frontends, but tighten behavior around cart/order/product state consistency and add the minimum verification scaffolding needed to make changes safely. Prefer targeted fixes over broad refactors in this batch.

**Tech Stack:** Node.js, Express, TypeScript, Prisma, React, Vite, TanStack Query, Jest, Supertest

---

### Task 1: Restore Local Verification Baseline

**Files:**
- Modify: `backend/package.json`
- Create: `backend/jest.config.js` if required by current test setup
- Create: `backend/tests/health.test.ts`

- [ ] **Step 1: Install workspace dependencies**

Run:

```bash
cd backend && npm install
cd ../frontend-user && npm install
cd ../frontend-store && npm install
```

Expected: all three installs complete without missing-package errors.

- [ ] **Step 2: Write a failing backend smoke test**

Create `backend/tests/health.test.ts` with a minimal app-level request:

```ts
import request from 'supertest';
import app from '../src/app';

describe('GET /api/health', () => {
  it('returns ok status', async () => {
    const res = await request(app).get('/api/health');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok' });
  });
});
```

- [ ] **Step 3: Run the backend test to verify RED**

Run:

```bash
cd backend && npm test -- health.test.ts
```

Expected: FAIL if Jest/ts-jest config is incomplete or test discovery is not wired yet.

- [ ] **Step 4: Add the minimum Jest config needed to run TypeScript tests**

If the RED step fails because Jest is not configured for TypeScript, add:

```js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
};
```

- [ ] **Step 5: Run the backend test to verify GREEN**

Run:

```bash
cd backend && npm test -- health.test.ts
```

Expected: PASS with 1 passing test.

### Task 2: Lock Cart Rules to Backend Truth

**Files:**
- Modify: `backend/src/routes/cart.ts`
- Test: `backend/tests/cart-rules.test.ts`

- [ ] **Step 1: Write failing tests for cart state consistency**

Add tests covering:

```ts
it('rejects quantity updates for inactive products', async () => {
  expect(true).toBe(false);
});

it('rejects quantity updates above stock', async () => {
  expect(true).toBe(false);
});
```

Replace placeholders with real seeded or mocked app/database setup in the actual test file.

- [ ] **Step 2: Run the cart tests to verify RED**

Run:

```bash
cd backend && npm test -- cart-rules.test.ts
```

Expected: FAIL because current update route does not uniformly enforce inactive-product behavior.

- [ ] **Step 3: Implement minimal backend cart rule fixes**

Apply targeted fixes in `backend/src/routes/cart.ts` so that:

```ts
if (!cartItem.product.isActive) {
  res.status(400).json({ message: '该商品已下架，仅支持从购物车移除' });
  return;
}
```

and keep stock checks intact.

- [ ] **Step 4: Run the cart tests to verify GREEN**

Run:

```bash
cd backend && npm test -- cart-rules.test.ts
```

Expected: PASS.

### Task 3: Separate Order Read Flow From Hidden State Mutation

**Files:**
- Modify: `backend/src/routes/orders.ts`
- Create: `backend/src/services/orderLifecycle.ts`
- Test: `backend/tests/order-lifecycle.test.ts`

- [ ] **Step 1: Write failing tests for shipped-order auto-complete behavior**

Create tests around a helper-level function, for example:

```ts
it('marks shipped orders older than 7 days as completed', async () => {
  expect(true).toBe(false);
});

it('does not mutate newer shipped orders', async () => {
  expect(true).toBe(false);
});
```

- [ ] **Step 2: Run the lifecycle tests to verify RED**

Run:

```bash
cd backend && npm test -- order-lifecycle.test.ts
```

Expected: FAIL because the helper does not exist yet.

- [ ] **Step 3: Extract minimal lifecycle helper and reuse it**

Create a focused helper in `backend/src/services/orderLifecycle.ts` and call it from the two read endpoints instead of duplicating inline mutation logic.

- [ ] **Step 4: Run the lifecycle tests to verify GREEN**

Run:

```bash
cd backend && npm test -- order-lifecycle.test.ts
```

Expected: PASS.

### Task 4: Tighten Product Visibility Rules

**Files:**
- Modify: `backend/src/routes/products.ts`
- Test: `backend/tests/product-visibility.test.ts`

- [ ] **Step 1: Write failing tests for admin-only expanded product access**

Add tests for:

```ts
it('hides inactive products from normal list requests', async () => {
  expect(true).toBe(false);
});

it('does not honor all=true for unauthenticated requests', async () => {
  expect(true).toBe(false);
});
```

- [ ] **Step 2: Run the product visibility tests to verify RED**

Run:

```bash
cd backend && npm test -- product-visibility.test.ts
```

Expected: FAIL because the current route accepts `all=true` too broadly.

- [ ] **Step 3: Implement minimal visibility rule changes**

Update `backend/src/routes/products.ts` so expanded listing behavior is only available to authenticated admins, while preserving the existing default public listing.

- [ ] **Step 4: Run the product visibility tests to verify GREEN**

Run:

```bash
cd backend && npm test -- product-visibility.test.ts
```

Expected: PASS.

### Task 5: Verify End-to-End Build Status After Fixes

**Files:**
- Modify: any touched files above only if verification exposes required follow-up fixes

- [ ] **Step 1: Run backend test suite**

Run:

```bash
cd backend && npm test
```

Expected: all backend tests pass.

- [ ] **Step 2: Run backend build**

Run:

```bash
cd backend && npm run build
```

Expected: exit code 0.

- [ ] **Step 3: Run user frontend build**

Run:

```bash
cd frontend-user && npm run build
```

Expected: exit code 0, or concrete compile failures that must be fixed before claiming this batch is stable.

- [ ] **Step 4: Run store frontend build**

Run:

```bash
cd frontend-store && npm run build
```

Expected: exit code 0, or concrete compile failures that must be fixed before claiming this batch is stable.

- [ ] **Step 5: Commit**

Run:

```bash
git add backend docs/superpowers/plans/2026-06-03-stability-first-batch.md
git commit -m "fix: stabilize first batch of backend rules"
```
