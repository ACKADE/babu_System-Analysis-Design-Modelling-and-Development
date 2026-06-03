import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ordersApi, type Order } from '../api/orders';

const COLUMNS = [
  { key: 'PAID', label: '待发货', accent: '#60a5fa' },
  { key: 'SHIPPED', label: '已发货', accent: '#eab308' },
  { key: 'COMPLETED', label: '已完成', accent: '#4ade80' },
  { key: 'RETURN_PENDING', label: '售后中', accent: '#f59e0b' },
];

const STATUS_LABEL: Record<string, string> = {
  CANCELLED: '已取消',
  REFUNDED: '已退款',
};

export function Orders() {
  const { data: orders, isLoading, isError } = useQuery({
    queryKey: ['orders', 'admin'],
    queryFn: ordersApi.getAll,
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

  const grouped: Record<string, Order[]> = {};
  for (const col of COLUMNS) grouped[col.key] = [];
  grouped['_other'] = [];
  for (const o of orders || []) {
    if (grouped[o.status]) {
      grouped[o.status].push(o);
    } else {
      grouped['_other'].push(o);
    }
  }

  const hasOrders = (orders || []).length > 0;

  return (
    <div className="page-enter">
      <h1 style={{ marginBottom: '1.5rem' }}>订单管理</h1>

      {!hasOrders ? (
        <div className="text-center py-32">
          <p style={{ color: 'var(--color-slate-500)' }}>暂无订单</p>
        </div>
      ) : (
        <>
          {/* Kanban — 4 equal-height columns, vertical dividers span full height */}
          <div
            className="hidden md:grid"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              minHeight: 'calc(100vh - 220px)',
            }}
          >
            {COLUMNS.map((col, colIdx) => (
              <div
                key={col.key}
                style={{
                  paddingLeft: colIdx === 0 ? '0' : '1.25rem',
                  paddingRight: colIdx === COLUMNS.length - 1 ? '0' : '1.25rem',
                  borderRight:
                    colIdx < COLUMNS.length - 1
                      ? '1px solid var(--color-slate-800)'
                      : 'none',
                }}
              >
                {/* Header */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    marginBottom: '1rem',
                    paddingBottom: '0.625rem',
                    borderBottom: `2px solid ${col.accent}20`,
                  }}
                >
                  <span
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: '50%',
                      background: col.accent,
                      flexShrink: 0,
                    }}
                  />
                  <span
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      color: 'var(--color-slate-300)',
                      letterSpacing: '0.02em',
                    }}
                  >
                    {col.label}
                  </span>
                  <span
                    style={{
                      marginLeft: 'auto',
                      fontSize: '0.6875rem',
                      fontWeight: 600,
                      color: col.accent,
                      background: `${col.accent}18`,
                      padding: '0.125rem 0.5rem',
                      borderRadius: 3,
                      minWidth: '1.25rem',
                      textAlign: 'center',
                      lineHeight: '1.4',
                    }}
                  >
                    {grouped[col.key].length}
                  </span>
                </div>

                {/* Cards */}
                {grouped[col.key].length === 0 ? (
                  <p
                    style={{
                      color: 'var(--color-slate-600)',
                      fontSize: '0.75rem',
                      textAlign: 'center',
                      paddingTop: '2rem',
                      paddingBottom: '2rem',
                    }}
                  >
                    暂无订单
                  </p>
                ) : (
                  grouped[col.key].map((order: Order, idx: number) => (
                    <Link
                      key={order.id}
                      to={`/orders/${order.id}`}
                      style={{
                        display: 'block',
                        padding: '0.75rem 0.75rem 0.75rem 0.75rem',
                        borderLeft: `2px solid ${col.accent}`,
                        borderBottom: '1px solid var(--color-slate-850)',
                        animation: `fadeUp 0.35s ease-out both`,
                        animationDelay: `${idx * 50}ms`,
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'var(--color-slate-900)';
                        e.currentTarget.style.borderLeftColor = col.accent;
                        e.currentTarget.style.borderLeftWidth = '3px';
                        e.currentTarget.style.paddingLeft = 'calc(0.75rem - 1px)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.borderLeftColor = col.accent;
                        e.currentTarget.style.borderLeftWidth = '2px';
                        e.currentTarget.style.paddingLeft = '0.75rem';
                      }}
                    >
                      <span
                        style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: '0.6875rem',
                          color: 'var(--color-slate-500)',
                        }}
                      >
                        {order.orderNo}
                      </span>
                      <p
                        style={{
                          fontSize: '0.8125rem',
                          fontWeight: 500,
                          color: 'var(--color-slate-200)',
                          margin: '0.25rem 0 0.375rem 0',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {order.user?.name || '未知用户'}
                      </p>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                        }}
                      >
                        <span
                          style={{
                            fontSize: '0.6875rem',
                            color: 'var(--color-slate-500)',
                          }}
                        >
                          {new Date(order.createdAt).toLocaleDateString('zh-CN')}
                        </span>
                        <span
                          style={{
                            fontFamily: 'var(--font-mono)',
                            fontSize: '0.8125rem',
                            fontWeight: 600,
                            color: col.accent,
                          }}
                        >
                          &yen;{Number(order.totalAmount).toFixed(2)}
                        </span>
                      </div>
                    </Link>
                  ))
                )}
              </div>
            ))}
          </div>

          {/* Mobile: stacked columns */}
          <div className="grid grid-cols-1 gap-6 md:hidden">
            {COLUMNS.map((col) => (
              <div key={col.key}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    marginBottom: '0.75rem',
                    paddingBottom: '0.5rem',
                    borderBottom: `2px solid ${col.accent}20`,
                  }}
                >
                  <span
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: '50%',
                      background: col.accent,
                      flexShrink: 0,
                    }}
                  />
                  <span
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      color: 'var(--color-slate-300)',
                    }}
                  >
                    {col.label}
                  </span>
                  <span
                    style={{
                      marginLeft: 'auto',
                      fontSize: '0.6875rem',
                      fontWeight: 600,
                      color: col.accent,
                      background: `${col.accent}18`,
                      padding: '0.125rem 0.5rem',
                      borderRadius: 3,
                    }}
                  >
                    {grouped[col.key].length}
                  </span>
                </div>
                {grouped[col.key].length === 0 ? (
                  <p style={{ color: 'var(--color-slate-600)', fontSize: '0.75rem' }}>
                    暂无订单
                  </p>
                ) : (
                  grouped[col.key].map((order: Order) => (
                    <Link
                      key={order.id}
                      to={`/orders/${order.id}`}
                      style={{
                        display: 'block',
                        padding: '0.625rem 0.75rem',
                        borderLeft: `2px solid ${col.accent}`,
                        borderBottom: '1px solid var(--color-slate-850)',
                      }}
                    >
                      <span
                        style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: '0.6875rem',
                          color: 'var(--color-slate-500)',
                        }}
                      >
                        {order.orderNo}
                      </span>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          marginTop: '0.125rem',
                        }}
                      >
                        <span style={{ fontSize: '0.8125rem', color: 'var(--color-slate-200)' }}>
                          {order.user?.name || '未知用户'}
                        </span>
                        <span
                          style={{
                            fontFamily: 'var(--font-mono)',
                            fontSize: '0.8125rem',
                            fontWeight: 600,
                            color: col.accent,
                          }}
                        >
                          &yen;{Number(order.totalAmount).toFixed(2)}
                        </span>
                      </div>
                    </Link>
                  ))
                )}
              </div>
            ))}
          </div>

          {/* Archived — closed orders */}
          {grouped['_other'].length > 0 && (
            <div style={{ marginTop: '2.5rem' }}>
              <details style={{ cursor: 'pointer' }}>
                <summary
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 500,
                    color: 'var(--color-slate-500)',
                    listStyle: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.375rem',
                    userSelect: 'none',
                  }}
                >
                  <svg
                    width="10"
                    height="10"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  >
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                  已结束的订单 ({grouped['_other'].length})
                </summary>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                    gap: '0',
                    marginTop: '0.75rem',
                  }}
                >
                  {grouped['_other'].map((order: Order) => (
                    <Link
                      key={order.id}
                      to={`/orders/${order.id}`}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '0.75rem',
                        padding: '0.5rem 0.75rem',
                        borderBottom: '1px solid var(--color-slate-850)',
                        transition: 'background 0.15s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'var(--color-slate-900)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent';
                      }}
                    >
                      <div style={{ minWidth: 0 }}>
                        <span
                          style={{
                            fontFamily: 'var(--font-mono)',
                            fontSize: '0.6875rem',
                            color: 'var(--color-slate-500)',
                          }}
                        >
                          {order.orderNo}
                        </span>
                        <p
                          style={{
                            fontSize: '0.75rem',
                            color: 'var(--color-slate-400)',
                            marginTop: '0.125rem',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {order.user?.name || '-'} · &yen;{Number(order.totalAmount).toFixed(2)}
                        </p>
                      </div>
                      <span
                        style={{
                          fontSize: '0.625rem',
                          fontWeight: 500,
                          color: 'var(--color-slate-500)',
                          background: 'var(--color-slate-800)',
                          padding: '0.125rem 0.375rem',
                          borderRadius: 2,
                          flexShrink: 0,
                        }}
                      >
                        {STATUS_LABEL[order.status] || order.status}
                      </span>
                    </Link>
                  ))}
                </div>
              </details>
            </div>
          )}
        </>
      )}
    </div>
  );
}
