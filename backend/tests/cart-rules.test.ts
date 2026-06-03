import request from 'supertest';
import jwt from 'jsonwebtoken';

const mockPrisma = {
  cartItem: {
    findUnique: jest.fn(),
    update: jest.fn(),
  },
};

jest.mock('../src/lib/prisma', () => ({
  __esModule: true,
  default: mockPrisma,
}));

import app from '../src/app';

const userToken = jwt.sign(
  { userId: 1, email: 'user@test.com', role: 'USER' },
  'access-secret-dev-only'
);

describe('cart route rules', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('rejects quantity updates for inactive products', async () => {
    mockPrisma.cartItem.findUnique.mockResolvedValue({
      id: 10,
      userId: 1,
      quantity: 1,
      product: {
        id: 100,
        stock: 8,
        isActive: false,
      },
    });

    const res = await request(app)
      .put('/api/cart/10')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ quantity: 2 });

    expect(res.status).toBe(400);
    expect(res.body.message).toContain('下架');
    expect(mockPrisma.cartItem.update).not.toHaveBeenCalled();
  });

  it('rejects quantity updates above stock', async () => {
    mockPrisma.cartItem.findUnique.mockResolvedValue({
      id: 10,
      userId: 1,
      quantity: 1,
      product: {
        id: 100,
        stock: 2,
        isActive: true,
      },
    });

    const res = await request(app)
      .put('/api/cart/10')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ quantity: 3 });

    expect(res.status).toBe(400);
    expect(res.body.message).toContain('库存不足');
    expect(mockPrisma.cartItem.update).not.toHaveBeenCalled();
  });
});
