import request from 'supertest';
import jwt from 'jsonwebtoken';

const mockPrisma = {
  product: {
    findUnique: jest.fn(),
  },
};

jest.mock('../src/lib/prisma', () => ({
  __esModule: true,
  default: mockPrisma,
}));

import app from '../src/app';

const adminToken = jwt.sign(
  { userId: 2, email: 'admin@test.com', role: 'ADMIN' },
  'access-secret-dev-only'
);

describe('product detail visibility', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('hides inactive product details from public requests', async () => {
    mockPrisma.product.findUnique.mockResolvedValue({
      id: 8,
      name: 'Hidden Product',
      isActive: false,
    });

    const res = await request(app).get('/api/products/8');

    expect(res.status).toBe(404);
  });

  it('allows admins to access inactive product details', async () => {
    mockPrisma.product.findUnique.mockResolvedValue({
      id: 8,
      name: 'Hidden Product',
      isActive: false,
    });

    const res = await request(app)
      .get('/api/products/8')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.id).toBe(8);
  });
});
