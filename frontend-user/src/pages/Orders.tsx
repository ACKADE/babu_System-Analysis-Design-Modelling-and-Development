import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ordersApi, type Order, type OrderItemSnapshot } from '../api/orders';
import { useLanguage } from '../hooks/useLanguage';

export function Orders() {
  const { t } = useLanguage();

  const STATUS_MAP: Record<string, string> = {
    PAID: t('status.PAID'),
    SHIPPED: t('status.SHIPPED'),
    COMPLETED: t('status.COMPLETED'),
    CANCELLED: t('status.CANCELLED'),
    RETURN_PENDING: t('status.RETURN_PENDING'),
    REFUNDED: t('status.REFUNDED'),
  };

  const STATUS_STYLE: Record<string, { bg: string; color: string }> = {
    PAID: { bg: 'var(--color-gold-light)', color: 'var(--color-gold)' },
    SHIPPED: { bg: '#e8f0fe', color: '#3b6cb4' },
    COMPLETED: { bg: 'var(--color-sage-bg)', color: 'var(--color-sage)' },
    CANCELLED: { bg: 'var(--color-paper-warm)', color: 'var(--color-ink-muted)' },
    RETURN_PENDING: { bg: 'var(--color-terra-bg)', color: 'var(--color-terra)' },
    REFUNDED: { bg: 'var(--color-paper-warm)', color: 'var(--color-ink-muted)' },
  };

  const { data: orders, isLoading, isError } = useQuery({
    queryKey: ['orders'],
    queryFn: ordersApi.getAll,
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-3">
        <div className="spinner" />
        <p style={{ color: 'var(--color-ink-muted)' }} className="text-sm">{t('common.loading')}</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-32">
        <p style={{ color: 'var(--color-terra)' }}>{t('orders.loadFailed')}</p>
      </div>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <div className="text-center py-32">
        <p style={{ color: 'var(--color-ink-muted)' }} className="text-lg mb-4">{t('orders.empty')}</p>
        <Link to="/" className="btn-ghost">{t('product.browseShop')}</Link>
      </div>
    );
  }

  return (
    <div className="page-enter">
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', marginBottom: '1.5rem' }}>{t('orders.title')}</h1>
      <div className="space-y-4">
        {orders.map((order: Order, idx: number) => {
          const st = STATUS_STYLE[order.status] || STATUS_STYLE.CANCELLED;
          return (
            <Link
              key={order.id}
              to={`/orders/${order.id}`}
              className="card-reveal block rounded-[3px] p-5 transition-all duration-300"
              style={{
                background: 'white',
                boxShadow: 'var(--shadow-card)',
                animationDelay: `${idx * 60}ms`,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = 'var(--shadow-card-hover)';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = 'var(--shadow-card)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm tracking-wide" style={{ color: 'var(--color-ink-muted)' }}>
                  {order.orderNo}
                </span>
                <span
                  className="text-xs px-2.5 py-1 rounded-[2px] font-medium"
                  style={{ background: st.bg, color: st.color }}
                >
                  {STATUS_MAP[order.status] || order.status}
                </span>
              </div>
              <div className="space-y-2.5">
                {order.items?.map((item: OrderItemSnapshot) => (
                  <div key={item.id} className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-[2px] overflow-hidden shrink-0"
                      style={{ background: 'var(--color-paper-warm)' }}
                    >
                      {item.productImage ? (
                        <img src={`/${item.productImage}`} alt={item.productName} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[10px]" style={{ color: 'var(--color-ink-muted)' }}>
                          {t('common.noImageShort')}
                        </div>
                      )}
                    </div>
                    <span className="flex-1 text-sm truncate" style={{ color: 'var(--color-ink)' }}>{item.productName}</span>
                    <span className="text-xs" style={{ color: 'var(--color-ink-muted)' }}>× {item.quantity}</span>
                    <span className="text-sm" style={{ color: 'var(--color-ink-light)' }}>
                      &yen;{Number(item.productPrice).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
              <div className="text-right mt-3 pt-3 text-sm" style={{ borderTop: '1px solid var(--color-paper-dark)' }}>
                <span style={{ color: 'var(--color-ink-muted)' }}>{t('orders.itemsAndTotal', { count: order.items?.length || 0 })}</span>
                <span className="font-bold" style={{ color: 'var(--color-terra)' }}>
                  &yen;{Number(order.totalAmount).toFixed(2)}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
