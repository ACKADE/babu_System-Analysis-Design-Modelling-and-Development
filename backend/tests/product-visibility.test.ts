import request from 'supertest';
import jwt from 'jsonwebtoken';

const mockPrisma = {
  product: {
    findMany: jest.fn(),
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

describe('product visibility rules', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPrisma.product.findMany.mockResolvedValue([]);
  });

  it('does not honor all=true for unauthenticated requests', async () => {
    await request(app).get('/api/products?all=true');

    expect(mockPrisma.product.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { isActive: true },
      })
    );
  });

  it('allows admins to request all products', async () => {
    await request(app)
      .get('/api/products?all=true')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(mockPrisma.product.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {},
      })
    );
  });
});
