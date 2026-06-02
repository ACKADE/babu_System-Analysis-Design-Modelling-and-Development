import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { productsApi, Product } from '../api/products';
import { categoriesApi } from '../api/categories';

export function ProductList() {
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);

  const { data: products, isLoading, isError } = useQuery({
    queryKey: ['products'],
    queryFn: async () => { const res = await productsApi.getAll(); return res.data; },
  });

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => { const res = await categoriesApi.getAll(); return res.data; },
  });

  const filtered = selectedCategoryId
    ? (products || []).filter((p: Product) => p.categoryId === selectedCategoryId)
    : (products || []);

  if (isLoading) {
    return (
      <div>
        <div className="flex gap-2 mb-8 flex-wrap">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="skeleton h-8 rounded-[3px]" style={{ width: `${48 + i * 22}px` }} />
          ))}
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="rounded-[3px] overflow-hidden border" style={{ background: 'white', borderColor: 'var(--color-paper-dark)' }}>
              <div className="aspect-square skeleton" style={{ borderRadius: 0 }} />
              <div className="p-3.5 space-y-2.5">
                <div className="skeleton h-4 w-3/4" />
                <div className="skeleton h-3 w-1/2" />
                <div className="skeleton h-5 w-1/3 mt-2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-32">
        <p style={{ color: 'var(--color-terra)' }} className="text-lg">加载商品失败，请稍后重试</p>
      </div>
    );
  }

  return (
    <div>
      {categories && categories.length > 0 && (
        <div className="flex gap-2 mb-8 flex-wrap">
          <button
            onClick={() => setSelectedCategoryId(null)}
            className="px-4 py-1.5 rounded-[3px] text-sm font-medium transition-all duration-150"
            style={{
              background: selectedCategoryId === null ? 'var(--color-ink)' : 'var(--color-paper-warm)',
              color: selectedCategoryId === null ? 'var(--color-paper)' : 'var(--color-ink-light)',
            }}
          >
            全部
          </button>
          {categories.map((cat: any) => (
            <span key={cat.id} className="flex gap-1">
              <button
                onClick={() => setSelectedCategoryId(cat.id)}
                className="px-4 py-1.5 rounded-[3px] text-sm font-medium transition-all duration-150"
                style={{
                  background: selectedCategoryId === cat.id ? 'var(--color-ink)' : 'var(--color-paper-warm)',
                  color: selectedCategoryId === cat.id ? 'var(--color-paper)' : 'var(--color-ink-light)',
                }}
              >
                {cat.name}
              </button>
              {cat.children?.map((child: any) => (
                <button
                  key={child.id}
                  onClick={() => setSelectedCategoryId(child.id)}
                  className="px-4 py-1.5 rounded-[3px] text-sm font-medium transition-all duration-150 ml-0.5"
                  style={{
                    background: selectedCategoryId === child.id ? 'var(--color-ink)' : 'var(--color-paper-warm)',
                    color: selectedCategoryId === child.id ? 'var(--color-paper)' : 'var(--color-ink-light)',
                  }}
                >
                  {child.name}
                </button>
              ))}
            </span>
          ))}
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="text-center py-32">
          <div className="mb-4" style={{ color: 'var(--color-paper-dark)' }}>
            <svg className="mx-auto" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round">
              <path d="M20 7H4c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V9c0-1.1-.9-2-2-2Z" />
              <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
            </svg>
          </div>
          <p style={{ color: 'var(--color-ink-muted)' }} className="text-lg">暂无商品</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {filtered.map((product: Product, idx: number) => (
            <Link
              key={product.id}
              to={`/product/${product.id}`}
              className="card-reveal rounded-[3px] overflow-hidden transition-all duration-300 border"
              style={{
                background: 'white',
                boxShadow: 'var(--shadow-card)',
                borderColor: 'var(--color-paper-dark)',
                animationDelay: `${idx * 60}ms`,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = 'var(--shadow-card-hover)';
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.borderColor = 'var(--color-terra)';
                (e.currentTarget.querySelector('.card-image') as HTMLElement).style.transform = 'scale(1.05)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = 'var(--shadow-card)';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.borderColor = 'var(--color-paper-dark)';
                (e.currentTarget.querySelector('.card-image') as HTMLElement).style.transform = 'scale(1)';
              }}
            >
              <div className="aspect-square overflow-hidden" style={{ background: 'var(--color-paper-warm)' }}>
                {product.thumbnailUrl ? (
                  <img
                    src={`/${product.thumbnailUrl}`}
                    alt={product.name}
                    className="card-image w-full h-full object-cover transition-transform duration-500"
                  />
                ) : (
                  <div className="card-image w-full h-full flex items-center justify-center text-sm" style={{ color: 'var(--color-ink-muted)' }}>
                    暂无图片
                  </div>
                )}
              </div>
              <div className="p-3.5">
                <h3 className="font-medium truncate" style={{ fontFamily: 'var(--font-display)', color: 'var(--color-ink)', fontSize: '0.95rem' }}>
                  {product.name}
                </h3>
                <p className="text-xs truncate mt-1" style={{ color: 'var(--color-ink-muted)' }}>{product.summary}</p>
                <p className="mt-2.5 font-semibold" style={{ color: 'var(--color-terra)', fontSize: '1.05rem' }}>
                  &yen;{Number(product.price).toFixed(2)}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
