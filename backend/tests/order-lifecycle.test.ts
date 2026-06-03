import { applyOrderAutoCompletion } from '../src/services/orderLifecycle';

describe('order lifecycle helper', () => {
  it('marks shipped orders older than 7 days as completed', async () => {
    const update = jest.fn().mockResolvedValue(undefined);

    const order = {
      id: 9,
      status: 'SHIPPED',
      shippedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
    };

    const changed = await applyOrderAutoCompletion(order, {
      order: { update },
    });

    expect(changed).toBe(true);
    expect(order.status).toBe('COMPLETED');
    expect(update).toHaveBeenCalledWith({
      where: { id: 9 },
      data: { status: 'COMPLETED' },
    });
  });

  it('does not mutate newer shipped orders', async () => {
    const update = jest.fn().mockResolvedValue(undefined);

    const order = {
      id: 10,
      status: 'SHIPPED',
      shippedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    };

    const changed = await applyOrderAutoCompletion(order, {
      order: { update },
    });

    expect(changed).toBe(false);
    expect(order.status).toBe('SHIPPED');
    expect(update).not.toHaveBeenCalled();
  });
});
