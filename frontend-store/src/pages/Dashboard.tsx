import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '../api/dashboard';

export function Dashboard() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => { const res = await dashboardApi.get(); return res.data; },
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
        <p style={{ color: 'var(--color-red-soft)' }}>加载统计数据失败</p>
      </div>
    );
  }

  const stats = [
    { label: '商品总数', value: data?.totalProducts ?? 0 },
    { label: '在售商品', value: data?.activeProducts ?? 0 },
    { label: '待发货订单', value: data?.pendingShipOrders ?? 0, highlight: (data?.pendingShipOrders ?? 0) > 0 },
    { label: '售后中', value: data?.returnPendingCount ?? 0, highlight: (data?.returnPendingCount ?? 0) > 0 },
    { label: '本月订单', value: data?.monthlyOrderCount ?? 0 },
    { label: '本月销售额', value: `¥${Number(data?.monthlySales ?? 0).toFixed(2)}` },
  ];

  return (
    <div>
      <h1 style={{ marginBottom: '1.5rem' }}>仪表盘</h1>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-[4px] p-5 transition-all duration-200"
            style={{
              background: 'var(--color-slate-900)',
              border: '1px solid var(--color-slate-800)',
              boxShadow: 'var(--shadow-card)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--color-slate-600)';
              e.currentTarget.style.boxShadow = 'var(--shadow-card-hover)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--color-slate-800)';
              e.currentTarget.style.boxShadow = 'var(--shadow-card)';
            }}
          >
            <p className="text-xs mb-2" style={{ color: 'var(--color-slate-500)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              {stat.label}
            </p>
            <p
              className="text-2xl font-bold tracking-tight"
              style={{
                fontFamily: 'var(--font-mono)',
                color: stat.highlight ? 'var(--color-amber)' : 'var(--color-slate-100)',
              }}
            >
              {stat.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
