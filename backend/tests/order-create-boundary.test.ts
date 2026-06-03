import request from 'supertest';
import jwt from 'jsonwebtoken';

const mockPrisma = {
  cartItem: {
    findMany: jest.fn(),
  },
  orderSequence: {
    upsert: jest.fn(),
  },
  $transaction: jest.fn(),
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

describe('order creation boundaries', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns 400 when stock becomes insufficient during transactional deduction', async () => {
    mockPrisma.cartItem.findMany.mockResolvedValue([
      {
        id: 11,
        userId: 1,
        productId: 101,
        quantity: 2,
        product: {
          id: 101,
          name: 'Phone',
          price: 1999,
          stock: 2,
          isActive: true,
          thumbnailUrl: 'uploads/test.png',
        },
      },
    ]);
    mockPrisma.orderSequence.upsert.mockResolvedValue({ lastSeq: 1 });
    mockPrisma.$transaction.mockImplementation(async (callback: (tx: any) => Promise<unknown>) => {
      const tx = {
        product: {
          updateMany: jest.fn().mockResolvedValue({ count: 0 }),
        },
        order: {
          create: jest.fn(),
        },
        cartItem: {
          deleteMany: jest.fn(),
        },
      };
      return callback(tx);
    });

    const res = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        recipientName: '张三',
        recipientAddress: '测试地址',
        recipientPhone: '13800138000',
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toContain('库存不足');
  });
});
