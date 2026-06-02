import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { productsApi } from '../api/products';
import { cartApi } from '../api/cart';
import { reviewsApi } from '../api/reviews';
import { useAuth } from '../hooks/useAuth';

export function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const { isLoggedIn } = useAuth();
  const [quantity, setQuantity] = useState(1);
  const [addedMsg, setAddedMsg] = useState('');

  const { data: product, isLoading, isError } = useQuery({
    queryKey: ['product', id],
    queryFn: async () => { const res = await productsApi.getById(Number(id)); return res.data; },
    enabled: !!id,
  });

  const { data: reviews } = useQuery({
    queryKey: ['reviews', id],
    queryFn: async () => { const res = await reviewsApi.getByProduct(Number(id!)); return res.data; },
    enabled: !!id,
  });

  const addCartMutation = useMutation({
    mutationFn: () => cartApi.add(Number(id), quantity),
    onSuccess: () => {
      setAddedMsg(`已添加 ${quantity} 件到购物车`);
      setTimeout(() => setAddedMsg(''), 3000);
    },
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-3">
        <div className="spinner" />
        <p style={{ color: 'var(--color-ink-muted)' }} className="text-sm">加载中...</p>
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="text-center py-32">
        <p style={{ color: 'var(--color-ink-muted)' }} className="text-lg mb-4">商品不存在</p>
        <Link to="/" className="btn-ghost">返回商品列表</Link>
      </div>
    );
  }

  return (
    <div className="page-enter">
      <nav className="flex items-center gap-1.5 text-xs mb-6" style={{ color: 'var(--color-ink-muted)' }}>
        <Link to="/" className="hover:opacity-70 transition-opacity">全部商品</Link>
        <span>/</span>
        <span style={{ color: 'var(--color-ink)' }}>{product.name}</span>
      </nav>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <div
          className="aspect-[4/3] rounded-[3px] overflow-hidden flex items-center justify-center"
          style={{ background: 'var(--color-paper-warm)' }}
        >
          {product.imageUrl ? (
            <img src={`/${product.imageUrl}`} alt={product.name} className="w-full h-full object-contain" />
          ) : (
            <span style={{ color: 'var(--color-ink-muted)' }} className="text-sm">暂无图片</span>
          )}
        </div>

        <div>
          <h1 style={{ fontFamily: 'var(--font-display)' }}>{product.name}</h1>
          <p className="mt-3 text-sm leading-relaxed" style={{ color: 'var(--color-ink-muted)' }}>{product.summary}</p>

          <div className="mt-6 flex items-baseline gap-3">
            <span className="text-3xl font-bold" style={{ fontFamily: 'var(--font-display)', color: 'var(--color-terra)' }}>
              &yen;{Number(product.price).toFixed(2)}
            </span>
          </div>

          <p className="mt-3 text-sm" style={{ color: product.stock > 0 ? 'var(--color-sage)' : 'var(--color-terra)' }}>
            {product.stock > 0 ? `库存 ${product.stock} 件` : '暂时缺货'}
          </p>

          <div className="mt-7 flex items-center gap-3">
            <div
              className="flex items-center rounded-[3px] overflow-hidden"
              style={{ border: '1px solid var(--color-paper-dark)' }}
            >
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-9 h-9 flex items-center justify-center text-sm transition-colors hover:bg-[var(--color-paper-warm)]"
                style={{ color: 'var(--color-ink-light)', background: 'white' }}
                disabled={quantity <= 1}
              >
                −
              </button>
              <span
                className="w-10 h-9 flex items-center justify-center text-sm font-medium"
                style={{ borderLeft: '1px solid var(--color-paper-dark)', borderRight: '1px solid var(--color-paper-dark)' }}
              >
                {quantity}
              </span>
              <button
                onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                className="w-9 h-9 flex items-center justify-center text-sm transition-colors hover:bg-[var(--color-paper-warm)]"
                style={{ color: 'var(--color-ink-light)', background: 'white' }}
                disabled={quantity >= product.stock}
              >
                +
              </button>
            </div>

            {isLoggedIn ? (
              <button
                onClick={() => addCartMutation.mutate()}
                disabled={product.stock === 0 || addCartMutation.isPending}
                className="btn-primary flex-1"
              >
                {product.stock === 0 ? '库存不足' : addCartMutation.isPending ? '添加中...' : '加入购物车'}
              </button>
            ) : (
              <Link to="/login" className="btn-primary flex-1 text-center">
                登录后购买
              </Link>
            )}
          </div>

          {addedMsg && (
            <p className="mt-3 text-sm font-medium" style={{ color: 'var(--color-sage)' }}>{addedMsg}</p>
          )}
          {addCartMutation.isError && (
            <p className="mt-3 text-sm" style={{ color: 'var(--color-terra)' }}>
              {(addCartMutation.error as any)?.response?.data?.message || '添加到购物车失败'}
            </p>
          )}

          <div className="mt-8 pt-8" style={{ borderTop: '1px solid var(--color-paper-dark)' }}>
            <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--color-ink)' }}>商品描述</h3>
            <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: 'var(--color-ink-light)' }}>
              {product.description}
            </p>
          </div>
        </div>
      </div>

      {reviews && reviews.length > 0 && (
        <div className="mt-14">
          <h2 className="mb-6" style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem' }}>
            商品评价 <span style={{ color: 'var(--color-ink-muted)', fontSize: '0.9rem' }}>({reviews.length})</span>
          </h2>
          <div className="space-y-4">
            {reviews.map((review: any, idx: number) => (
              <div
                key={review.id}
                className="card-reveal rounded-[3px] p-5"
                style={{
                  background: 'white',
                  boxShadow: 'var(--shadow-card)',
                  animationDelay: `${idx * 80}ms`,
                }}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm" style={{ color: 'var(--color-ink)' }}>
                    {review.user?.name || '匿名'}
                  </span>
                  <span style={{ color: 'var(--color-gold)', fontSize: '0.85rem', letterSpacing: '1px' }}>
                    {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                  </span>
                </div>
                {review.content && (
                  <p className="text-sm mt-2 leading-relaxed" style={{ color: 'var(--color-ink-light)' }}>{review.content}</p>
                )}
                <p className="text-xs mt-2" style={{ color: 'var(--color-ink-muted)' }}>
                  {new Date(review.createdAt).toLocaleDateString('zh-CN')}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
