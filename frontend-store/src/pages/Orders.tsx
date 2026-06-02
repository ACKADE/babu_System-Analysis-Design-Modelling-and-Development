import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ordersApi } from '../api/orders';

const STATUS_MAP: Record<string, string> = {
  PAID: '待发货',
  SHIPPED: '已发货',
  COMPLETED: '已完成',
  CANCELLED: '已取消',
  RETURN_PENDING: '售后中',
  REFUNDED: '已退款',
};

const STATUS_STYLE: Record<string, { color: string; bg: string }> = {
  PAID: { color: '#60a5fa', bg: 'rgba(96,165,250,0.08)' },
  SHIPPED: { color: '#facc15', bg: 'rgba(250,204,21,0.08)' },
  COMPLETED: { color: 'var(--color-emerald)', bg: 'var(--color-emerald-bg)' },
  CANCELLED: { color: 'var(--color-slate-500)', bg: 'var(--color-slate-800)' },
  RETURN_PENDING: { color: 'var(--color-amber)', bg: 'var(--color-amber-bg)' },
  REFUNDED: { color: 'var(--color-slate-500)', bg: 'var(--color-slate-800)' },
};

export function Orders() {
  const { data: orders, isLoading, isError } = useQuery({
    queryKey: ['orders', 'admin'],
    queryFn: async () => { const res = await ordersApi.getAll(); return res.data; },
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-3">
        <div className="spinner" />
        <p style={{ color: 'var(--color-slate-500)' }} className="text-xs">加载中...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-32">
        <p style={{ color: 'var(--color-red-soft)' }}>加载订单失败</p>
      </div>
    );
  }

  return (
    <div>
      <h1 style={{ marginBottom: '1.25rem' }}>订单管理</h1>
      {(!orders || orders.length === 0) ? (
        <div
          className="text-center py-32 rounded-[4px]"
          style={{ color: 'var(--color-slate-500)', background: 'var(--color-slate-900)', border: '1px solid var(--color-slate-800)' }}
        >
          暂无订单
        </div>
      ) : (
        <div
          className="rounded-[4px] overflow-hidden"
          style={{ background: 'var(--color-slate-900)', border: '1px solid var(--color-slate-800)' }}
        >
          <table className="table-dark">
            <thead>
              <tr>
                <th>订单号</th>
                <th>用户</th>
                <th>金额</th>
                <th>状态</th>
                <th>时间</th>
                <th className="text-right">操作</th>
              </tr>
            </thead>
            <tbody>
              {(orders as any[]).map((order: any) => {
                const st = STATUS_STYLE[order.status] || STATUS_STYLE.CANCELLED;
                const needsAttention = order.status === 'PAID' || order.status === 'RETURN_PENDING';
                return (
                  <tr key={order.id}>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--color-slate-400)' }}>
                      {order.orderNo}
                    </td>
                    <td>{order.user?.name || '-'}</td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>
                      &yen;{Number(order.totalAmount).toFixed(2)}
                    </td>
                    <td>
                      <span className="inline-flex items-center gap-1.5">
                        {needsAttention && (
                          <span style={{
                            width: '6px', height: '6px', borderRadius: '50%',
                            background: order.status === 'PAID' ? '#60a5fa' : 'var(--color-amber)',
                            display: 'inline-block',
                          }} />
                        )}
                        <span className="badge" style={{ color: st.color, background: st.bg }}>
                          {STATUS_MAP[order.status] || order.status}
                        </span>
                      </span>
                    </td>
                    <td style={{ fontSize: '0.75rem', color: 'var(--color-slate-500)' }}>
                      {new Date(order.createdAt).toLocaleDateString('zh-CN')}
                    </td>
                    <td className="text-right">
                      <Link
                        to={`/orders/${order.id}`}
                        className="text-xs hover:opacity-70 transition-opacity"
                        style={{ color: 'var(--color-amber)' }}
                      >
                        详情
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
