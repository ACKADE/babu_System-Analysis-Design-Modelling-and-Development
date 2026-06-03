type OrderLike = {
  id: number;
  status: string;
  shippedAt: Date | null;
};

type OrderUpdater = {
  order: {
    update: (args: { where: { id: number }; data: { status: string } }) => Promise<unknown>;
  };
};

export async function applyOrderAutoCompletion(
  order: OrderLike,
  prismaLike: OrderUpdater
): Promise<boolean> {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const shouldComplete =
    order.status === 'SHIPPED' &&
    !!order.shippedAt &&
    new Date(order.shippedAt) <= sevenDaysAgo;

  if (!shouldComplete) {
    return false;
  }

  await prismaLike.order.update({
    where: { id: order.id },
    data: { status: 'COMPLETED' },
  });
  order.status = 'COMPLETED';
  return true;
}
