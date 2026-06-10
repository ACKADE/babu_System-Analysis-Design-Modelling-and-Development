import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import { cartApi, type CartItem } from '../api/cart';
import { ordersApi, type ApiMessageError, type Order } from '../api/orders';
import { useLanguage } from '../hooks/useLanguage';

export function Checkout() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [recipientName, setRecipientName] = useState('');
  const [recipientAddress, setRecipientAddress] = useState('');
  const [recipientPhone, setRecipientPhone] = useState('');

  const { data: cartItems, isLoading } = useQuery({
    queryKey: ['cart'],
    queryFn: cartApi.getAll,
  });

  const items = (cartItems || []).filter((item: CartItem) => item.product.isActive);
  const total = items.reduce((sum: number, item: CartItem) => sum + Number(item.product.price) * item.quantity, 0);

  const createOrderMutation = useMutation<Order, AxiosError<ApiMessageError>>({
    mutationFn: () => ordersApi.create({ recipientName, recipientAddress, recipientPhone }),
    onSuccess: (createdOrder) => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      navigate(`/payment-success/${createdOrder.id}`, { replace: true });
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
        <p style={{ color: 'var(--color-ink-muted)' }} className="text-sm">{t('common.loading')}</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-32">
        <p style={{ color: 'var(--color-ink-muted)' }} className="text-lg">{t('cart.noCheckoutItems')}</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto page-enter">
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', marginBottom: '1.5rem' }}>{t('checkout.title')}</h1>

      <div
        className="rounded-[3px] p-6 mb-4"
        style={{ background: 'white', boxShadow: 'var(--shadow-card)' }}
      >
        <h2 className="text-sm font-semibold mb-5" style={{ color: 'var(--color-ink)' }}>{t('checkout.shippingInfo')}</h2>
        <form id="checkout-form" onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-ink-light)' }}>{t('checkout.recipientName')}</label>
            <input
              type="text"
              value={recipientName}
              onChange={(e) => setRecipientName(e.target.value)}
              className="input-field"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-ink-light)' }}>{t('checkout.recipientAddress')}</label>
            <input
              type="text"
              value={recipientAddress}
              onChange={(e) => setRecipientAddress(e.target.value)}
              className="input-field"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-ink-light)' }}>{t('checkout.recipientPhone')}</label>
            <input
              type="text"
              value={recipientPhone}
              onChange={(e) => setRecipientPhone(e.target.value)}
              className="input-field"
              required
              pattern="[0-9]{7,15}"
              title={t('checkout.phoneHint')}
            />
          </div>
        </form>
      </div>

      <div
        className="rounded-[3px] p-6 mb-4"
        style={{ background: 'white', boxShadow: 'var(--shadow-card)' }}
      >
        <h2 className="text-sm font-semibold mb-4" style={{ color: 'var(--color-ink)' }}>{t('checkout.itemsList')}</h2>
        {items.map((item: CartItem) => (
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
          <span className="font-medium text-sm" style={{ color: 'var(--color-ink)' }}>{t('checkout.total')}</span>
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
          {createOrderMutation.error?.response?.data?.message || t('checkout.submitFailed')}
        </div>
      )}

      <button
        type="submit"
        form="checkout-form"
        disabled={createOrderMutation.isPending}
        className="btn-primary w-full text-base py-3"
      >
        {createOrderMutation.isPending ? t('checkout.submitting') : t('checkout.placeOrder')}
      </button>
    </div>
  );
}
