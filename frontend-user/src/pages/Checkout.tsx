import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cartApi } from '../api/cart';
import { ordersApi } from '../api/orders';

export function Checkout() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [recipientName, setRecipientName] = useState('');
  const [recipientAddress, setRecipientAddress] = useState('');
  const [recipientPhone, setRecipientPhone] = useState('');

  const { data: cartItems, isLoading } = useQuery({
    queryKey: ['cart'],
    queryFn: async () => { const res = await cartApi.getAll(); return res.data; },
  });

  const items = (cartItems || []).filter((item: any) => item.product.isActive);
  const total = items.reduce((sum: number, item: any) => sum + Number(item.product.price) * item.quantity, 0);

  const createOrderMutation = useMutation({
    mutationFn: () => ordersApi.create({ recipientName, recipientAddress, recipientPhone }),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      navigate(`/payment-success/${res.data.id}`, { replace: true });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;
    createOrderMutation.mutate();
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-3">
        <div className="spinner" />
        <p style={{ color: 'var(--color-ink-muted)' }} className="text-sm">加载中...</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-32">
        <p style={{ color: 'var(--color-ink-muted)' }} className="text-lg">购物车中无可结算商品</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto page-enter">
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', marginBottom: '1.5rem' }}>确认订单</h1>

      <div
        className="rounded-[3px] p-6 mb-4"
        style={{ background: 'white', boxShadow: 'var(--shadow-card)' }}
      >
        <h2 className="text-sm font-semibold mb-5" style={{ color: 'var(--color-ink)' }}>收货信息</h2>
        <form id="checkout-form" onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-ink-light)' }}>收货人</label>
            <input
              type="text"
              value={recipientName}
              onChange={(e) => setRecipientName(e.target.value)}
              className="input-field"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-ink-light)' }}>收货地址</label>
            <input
              type="text"
              value={recipientAddress}
              onChange={(e) => setRecipientAddress(e.target.value)}
              className="input-field"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-ink-light)' }}>联系电话</label>
            <input
              type="text"
              value={recipientPhone}
              onChange={(e) => setRecipientPhone(e.target.value)}
              className="input-field"
              required
              pattern="[0-9]{7,15}"
              title="7-15位数字"
            />
          </div>
        </form>
      </div>

      <div
        className="rounded-[3px] p-6 mb-4"
        style={{ background: 'white', boxShadow: 'var(--shadow-card)' }}
      >
        <h2 className="text-sm font-semibold mb-4" style={{ color: 'var(--color-ink)' }}>商品清单</h2>
        {items.map((item: any) => (
          <div
            key={item.id}
            className="flex items-center gap-3 py-2.5"
            style={{ borderBottom: '1px solid var(--color-paper-dark)' }}
          >
            <span className="flex-1 text-sm" style={{ color: 'var(--color-ink)' }}>{item.product.name} × {item.quantity}</span>
            <span className="text-sm" style={{ color: 'var(--color-ink-light)' }}>
              &yen;{(Number(item.product.price) * item.quantity).toFixed(2)}
            </span>
          </div>
        ))}
        <div
          className="flex justify-between items-center mt-4 pt-4"
          style={{ borderTop: '1px solid var(--color-paper-dark)' }}
        >
          <span className="font-medium text-sm" style={{ color: 'var(--color-ink)' }}>合计</span>
          <span className="text-xl font-bold" style={{ fontFamily: 'var(--font-display)', color: 'var(--color-terra)' }}>
            &yen;{total.toFixed(2)}
          </span>
        </div>
      </div>

      {createOrderMutation.isError && (
        <div
          className="p-3 rounded-[3px] mb-4 text-sm font-medium"
          style={{ background: 'var(--color-terra-bg)', color: 'var(--color-terra)' }}
        >
          {(createOrderMutation.error as any)?.response?.data?.message || '提交订单失败'}
        </div>
      )}

      <button
        type="submit"
        form="checkout-form"
        disabled={createOrderMutation.isPending}
        className="btn-primary w-full text-base py-3"
      >
        {createOrderMutation.isPending ? '提交中...' : '提交订单并支付'}
      </button>
    </div>
  );
}
