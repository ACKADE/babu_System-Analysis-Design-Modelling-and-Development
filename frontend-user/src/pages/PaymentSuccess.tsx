import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ordersApi } from '../api/orders';

export function PaymentSuccess() {
  const { orderId } = useParams<{ orderId: string }>();

  const { data: order, isLoading, isError } = useQuery({
    queryKey: ['order', orderId],
    queryFn: async () => { const res = await ordersApi.getById(Number(orderId)); return res.data; },
    enabled: !!orderId,
    retry: 1,
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-3">
        <div className="spinner" />
        <p style={{ color: 'var(--color-ink-muted)' }} className="text-sm">加载中...</p>
      </div>
    );
  }

  if (isError || !order) {
    return (
      <div className="text-center py-32">
        <p style={{ color: 'var(--color-ink-muted)' }} className="text-lg mb-4">订单不存在或无权查看</p>
        <Link to="/orders" className="btn-ghost">返回我的订单</Link>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto text-center page-enter">
      <div
        className="w-16 h-16 mx-auto mb-5 rounded-full flex items-center justify-center"
        style={{ background: 'var(--color-sage-bg)' }}
      >
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--color-sage)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </div>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', color: 'var(--color-sage)', marginBottom: '0.5rem' }}>
        支付成功
      </h1>
      <p className="text-sm" style={{ color: 'var(--color-ink-muted)' }}>您的订单已提交，我们将尽快为您发货</p>

      <div
        className="rounded-[3px] p-6 mt-8 text-left"
        style={{ background: 'white', boxShadow: 'var(--shadow-card)' }}
      >
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span style={{ color: 'var(--color-ink-muted)' }}>订单号</span>
            <span className="font-medium" style={{ fontFamily: 'var(--font-display)', color: 'var(--color-ink)' }}>
              {(order as any).orderNo}
            </span>
          </div>
          <div className="flex justify-between">
            <span style={{ color: 'var(--color-ink-muted)' }}>收货人</span>
            <span style={{ color: 'var(--color-ink)' }}>{(order as any).recipientName}</span>
          </div>
          <div className="flex justify-between">
            <span style={{ color: 'var(--color-ink-muted)' }}>收货地址</span>
            <span style={{ color: 'var(--color-ink)' }}>{(order as any).recipientAddress}</span>
          </div>
          <div className="flex justify-between">
            <span style={{ color: 'var(--color-ink-muted)' }}>联系电话</span>
            <span style={{ color: 'var(--color-ink)' }}>{(order as any).recipientPhone}</span>
          </div>
          <div className="flex justify-between pt-3" style={{ borderTop: '1px solid var(--color-paper-dark)' }}>
            <span style={{ color: 'var(--color-ink-muted)' }}>实付金额</span>
            <span className="text-xl font-bold" style={{ fontFamily: 'var(--font-display)', color: 'var(--color-terra)' }}>
              &yen;{Number((order as any).totalAmount).toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-8 flex items-center justify-center gap-6 text-sm">
        <Link to={`/orders/${orderId}`} className="btn-primary">
          查看订单详情
        </Link>
        <Link to="/" className="btn-ghost">
          继续购物
        </Link>
      </div>
    </div>
  );
}
