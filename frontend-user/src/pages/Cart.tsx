import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import { cartApi, type CartItem } from '../api/cart';
import type { ApiMessageError } from '../api/orders';

export function Cart() {
  const queryClient = useQueryClient();

  const { data: cartItems, isLoading, isError } = useQuery({
    queryKey: ['cart'],
    queryFn: cartApi.getAll,
  });

  const updateMutation = useMutation<
    unknown,
    AxiosError<ApiMessageError>,
    { itemId: number; quantity: number }
  >({
    mutationFn: ({ itemId, quantity }: { itemId: number; quantity: number }) =>
      cartApi.update(itemId, quantity),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cart'] }),
  });

  const removeMutation = useMutation<unknown, AxiosError<ApiMessageError>, number>({
    mutationFn: (itemId: number) => cartApi.remove(itemId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cart'] }),
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-3">
        <div className="spinner" />
        <p style={{ color: 'var(--color-ink-muted)' }} className="text-sm">加载中...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-32">
        <p style={{ color: 'var(--color-terra)' }}>加载购物车失败</p>
      </div>
    );
  }

  const items = cartItems || [];
  const activeItems = items.filter((item: CartItem) => item.product.isActive);
  const total = activeItems
    .reduce((sum: number, item: CartItem) => sum + Number(item.product.price) * item.quantity, 0);
  const actionErrorMessage =
    updateMutation.error?.response?.data?.message ||
    removeMutation.error?.response?.data?.message ||
    '操作失败';

  if (items.length === 0) {
    return (
      <div className="text-center py-32">
        <div className="mb-4" style={{ color: 'var(--color-paper-dark)' }}>
          <svg className="mx-auto" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round">
            <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
          </svg>
        </div>
        <p style={{ color: 'var(--color-ink-muted)' }} className="text-lg mb-4">购物车是空的</p>
        <Link to="/" className="btn-ghost">去逛逛</Link>
      </div>
    );
  }

  return (
    <div className="page-enter">
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', marginBottom: '1.5rem' }}>购物车</h1>

      {(updateMutation.isError || removeMutation.isError) && (
        <div
          className="p-3 rounded-[3px] mb-4 text-sm font-medium"
          style={{ background: 'var(--color-terra-bg)', color: 'var(--color-terra)' }}
        >
          {actionErrorMessage}
        </div>
      )}

      <div className="rounded-[3px] overflow-hidden" style={{ background: 'white', boxShadow: 'var(--shadow-card)' }}>
        {items.map((item: CartItem) => {
          const isOff = !item.product.isActive;
          return (
            <div
              key={item.id}
              className="flex items-center gap-4 p-4"
              style={{ borderBottom: '1px solid var(--color-paper-dark)' }}
            >
              <div
                className="rounded-[3px] overflow-hidden shrink-0"
                style={{ width: '4.5rem', height: '4.5rem', background: 'var(--color-paper-warm)' }}
              >
                {item.product.thumbnailUrl ? (
                  <img src={`/${item.product.thumbnailUrl}`} alt={item.product.name}
                    className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xs" style={{ color: 'var(--color-ink-muted)' }}>
                    暂无
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <Link
                  to={`/product/${item.productId}`}
                  className="font-medium truncate block hover:opacity-70 transition-opacity"
                  style={{ color: 'var(--color-ink)' }}
                >
                  {item.product.name}
                </Link>
                <p className="text-sm mt-0.5 font-medium" style={{ color: 'var(--color-terra)' }}>
                  &yen;{Number(item.product.price).toFixed(2)}
                </p>
                {isOff && (
                  <span
                    className="text-xs px-1.5 py-0.5 rounded-[2px] mt-1 inline-block"
                    style={{ background: 'var(--color-terra-bg)', color: 'var(--color-terra)' }}
                  >
                    已下架
                  </span>
                )}
              </div>
              {isOff ? (
                <button
                  onClick={() => { if (window.confirm('确认要删除此商品吗？')) removeMutation.mutate(item.id); }}
                  className="text-sm font-medium hover:opacity-70 transition-opacity"
                  style={{ color: 'var(--color-terra)' }}
                >
                  删除
                </button>
              ) : (
                <>
                  <div
                    className="flex items-center rounded-[3px] overflow-hidden"
                    style={{ border: '1px solid var(--color-paper-dark)' }}
                  >
                    <button
                      onClick={() => item.quantity > 1 && updateMutation.mutate({ itemId: item.id, quantity: item.quantity - 1 })}
                      className="w-7 h-7 flex items-center justify-center text-sm transition-colors hover:bg-[var(--color-paper-warm)]"
                      style={{ color: 'var(--color-ink-light)' }}
                    >
                      −
                    </button>
                    <span
                      className="w-8 h-7 flex items-center justify-center text-xs font-medium"
                      style={{ borderLeft: '1px solid var(--color-paper-dark)', borderRight: '1px solid var(--color-paper-dark)' }}
                    >
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => item.quantity < item.product.stock && updateMutation.mutate({ itemId: item.id, quantity: item.quantity + 1 })}
                      className="w-7 h-7 flex items-center justify-center text-sm transition-colors hover:bg-[var(--color-paper-warm)]"
                      style={{ color: 'var(--color-ink-light)' }}
                    >
                      +
                    </button>
                  </div>
                  <div className="w-24 text-right font-medium" style={{ color: 'var(--color-ink)' }}>
                    &yen;{(Number(item.product.price) * item.quantity).toFixed(2)}
                  </div>
                  <button
                    onClick={() => { if (window.confirm('确认要删除此商品吗？')) removeMutation.mutate(item.id); }}
                    className="text-sm hover:opacity-70 transition-opacity"
                    style={{ color: 'var(--color-ink-muted)' }}
                  >
                    删除
                  </button>
                </>
              )}
            </div>
          );
        })}
      </div>

      <div
        className="mt-5 flex items-center justify-between rounded-[3px] p-4"
        style={{ background: 'white', boxShadow: 'var(--shadow-card)' }}
      >
        <span className="text-sm" style={{ color: 'var(--color-ink-light)' }}>
          共 {activeItems.length} 件商品
        </span>
        <div className="flex items-center gap-4">
          <span className="text-xl font-bold" style={{ fontFamily: 'var(--font-display)', color: 'var(--color-terra)' }}>
            &yen;{total.toFixed(2)}
          </span>
          <Link to="/checkout" className="btn-primary">
            去结算
          </Link>
        </div>
      </div>
    </div>
  );
}
