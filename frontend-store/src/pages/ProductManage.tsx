import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productsApi, type Product } from '../api/products';

export function ProductManage() {
  const queryClient = useQueryClient();

  const { data: products, isLoading, isError } = useQuery({
    queryKey: ['products', 'admin'],
    queryFn: async () => { const res = await productsApi.getAll(true); return res.data; },
  });

  const toggleMutation = useMutation({
    mutationFn: (id: number) => productsApi.toggle(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['products', 'admin'] }),
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
        <p style={{ color: 'var(--color-red-soft)' }}>加载商品失败</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h1>商品管理</h1>
        <Link to="/products/new" className="btn-primary text-xs">
          新增商品
        </Link>
      </div>

      {(!products || products.length === 0) ? (
        <div
          className="text-center py-32 rounded-[4px]"
          style={{ color: 'var(--color-slate-500)', background: 'var(--color-slate-900)', border: '1px solid var(--color-slate-800)' }}
        >
          暂无商品
        </div>
      ) : (
        <div
          className="rounded-[4px] overflow-hidden"
          style={{ background: 'var(--color-slate-900)', border: '1px solid var(--color-slate-800)' }}
        >
          <table className="table-dark">
            <thead>
              <tr>
                <th>商品</th>
                <th>价格</th>
                <th>库存</th>
                <th>状态</th>
                <th className="text-right">操作</th>
              </tr>
            </thead>
            <tbody>
              {(products as Product[]).map((product) => (
                <tr key={product.id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <div
                        className="w-9 h-9 rounded-[3px] overflow-hidden shrink-0"
                        style={{ background: 'var(--color-slate-800)' }}
                      >
                        {product.thumbnailUrl ? (
                          <img src={`/${product.thumbnailUrl}`} alt={product.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[10px]" style={{ color: 'var(--color-slate-600)' }}>
                            暂无
                          </div>
                        )}
                      </div>
                      <span className="font-medium truncate max-w-[180px]" style={{ color: 'var(--color-slate-200)' }}>
                        {product.name}
                      </span>
                    </div>
                  </td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>
                    &yen;{Number(product.price).toFixed(2)}
                  </td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>
                    {product.stock}
                  </td>
                  <td>
                    <span
                      className="badge"
                      style={{
                        color: product.isActive ? 'var(--color-emerald)' : 'var(--color-slate-500)',
                        background: product.isActive ? 'var(--color-emerald-bg)' : 'var(--color-slate-800)',
                      }}
                    >
                      {product.isActive ? '上架' : '下架'}
                    </span>
                  </td>
                  <td className="text-right">
                    <div className="flex items-center justify-end gap-3">
                      <Link
                        to={`/products/${product.id}/edit`}
                        className="text-xs hover:opacity-70 transition-opacity"
                        style={{ color: 'var(--color-amber)' }}
                      >
                        编辑
                      </Link>
                      <button
                        onClick={() => toggleMutation.mutate(product.id)}
                        className="text-xs hover:opacity-70 transition-opacity"
                        style={{ color: product.isActive ? 'var(--color-red-soft)' : 'var(--color-emerald)' }}
                      >
                        {product.isActive ? '下架' : '上架'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
