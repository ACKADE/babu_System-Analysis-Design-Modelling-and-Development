import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productsApi } from '../api/products';
import { categoriesApi } from '../api/categories';

export function ProductForm() {
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [name, setName] = useState('');
  const [summary, setSummary] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [image, setImage] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState('');
  const [imagePreview, setImagePreview] = useState('');

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => { const res = await categoriesApi.getAll(); return res.data; },
  });

  const { data: product } = useQuery({
    queryKey: ['product', id],
    queryFn: async () => { const res = await productsApi.getById(Number(id)); return res.data; },
    enabled: isEdit,
  });

  useEffect(() => {
    if (product && isEdit) {
      setName(product.name);
      setSummary(product.summary);
      setDescription(product.description);
      setPrice(String(Number(product.price)));
      setStock(String(product.stock));
      setCategoryId(String(product.categoryId));
      if (product.thumbnailUrl) setThumbnailPreview(`/${product.thumbnailUrl}`);
      if (product.imageUrl) setImagePreview(`/${product.imageUrl}`);
    }
  }, [product, isEdit]);

  const createMutation = useMutation({
    mutationFn: () => {
      const fd = new FormData();
      fd.append('name', name);
      fd.append('summary', summary);
      fd.append('description', description);
      fd.append('price', price);
      fd.append('stock', stock);
      fd.append('categoryId', categoryId || '0');
      if (thumbnail) fd.append('thumbnail', thumbnail);
      if (image) fd.append('image', image);
      return productsApi.create(fd);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products', 'admin'] });
      navigate('/products', { replace: true });
    },
  });

  const updateMutation = useMutation({
    mutationFn: () => {
      const fd = new FormData();
      fd.append('name', name);
      fd.append('summary', summary);
      fd.append('description', description);
      fd.append('price', price);
      fd.append('stock', stock);
      fd.append('categoryId', categoryId || '0');
      if (thumbnail) fd.append('thumbnail', thumbnail);
      if (image) fd.append('image', image);
      return productsApi.update(Number(id), fd);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products', 'admin'] });
      navigate('/products', { replace: true });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEdit) {
      updateMutation.mutate();
    } else {
      createMutation.mutate();
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;
  const error = (createMutation.error || updateMutation.error) as any;

  return (
    <div className="max-w-2xl mx-auto">
      <h1 style={{ marginBottom: '1.25rem' }}>{isEdit ? '编辑商品' : '新增商品'}</h1>

      {error && (
        <div
          className="p-3 rounded-[4px] mb-4 text-xs font-medium"
          style={{ background: 'var(--color-red-bg)', color: 'var(--color-red-soft)' }}
        >
          {error?.response?.data?.message || '操作失败'}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="rounded-[4px] p-6 space-y-4"
        style={{ background: 'var(--color-slate-900)', border: '1px solid var(--color-slate-800)' }}
      >
        <div>
          <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--color-slate-400)' }}>商品名称 *</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="input-field" required />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--color-slate-400)' }}>简要描述 *</label>
          <input type="text" value={summary} onChange={(e) => setSummary(e.target.value)} className="input-field" required />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--color-slate-400)' }}>详细描述 *</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="input-field" rows={4} required />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--color-slate-400)' }}>价格 *</label>
            <input type="number" value={price} onChange={(e) => setPrice(e.target.value)}
              className="input-field" required step="0.01" min="0" />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--color-slate-400)' }}>库存 *</label>
            <input type="number" value={stock} onChange={(e) => setStock(e.target.value)}
              className="input-field" required min="0" />
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--color-slate-400)' }}>分类 *</label>
          <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="input-field" required>
            <option value="" disabled>请选择分类</option>
            {Array.isArray(categories) && categories.map((cat: any) => [
              <option key={cat.id} value={cat.id}>{cat.name}</option>,
              ...(cat.children || []).map((child: any) => (
                <option key={child.id} value={child.id}>&nbsp;&nbsp;└ {child.name}</option>
              ))
            ])}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--color-slate-400)' }}>缩略图</label>
          <input
            type="file" accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) { setThumbnail(file); setThumbnailPreview(URL.createObjectURL(file)); }
            }}
            className="text-xs"
            style={{ color: 'var(--color-slate-400)' }}
          />
          {thumbnailPreview && (
            <img src={thumbnailPreview} alt="缩略图预览"
              className="mt-2 w-24 h-24 object-cover rounded-[3px]"
              style={{ border: '1px solid var(--color-slate-700)' }} />
          )}
        </div>
        <div>
          <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--color-slate-400)' }}>详情图</label>
          <input
            type="file" accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) { setImage(file); setImagePreview(URL.createObjectURL(file)); }
            }}
            className="text-xs"
            style={{ color: 'var(--color-slate-400)' }}
          />
          {imagePreview && (
            <img src={imagePreview} alt="详情图预览"
              className="mt-2 w-24 h-24 object-cover rounded-[3px]"
              style={{ border: '1px solid var(--color-slate-700)' }} />
          )}
        </div>
        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={() => navigate('/products', { replace: true })}
            className="btn-ghost"
          >
            取消
          </button>
          <button type="submit" disabled={isPending} className="btn-primary flex-1">
            {isPending ? '保存中...' : '保存'}
          </button>
        </div>
      </form>
    </div>
  );
}
