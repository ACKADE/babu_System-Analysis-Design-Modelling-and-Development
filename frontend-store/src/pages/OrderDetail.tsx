import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import {
  ordersApi,
  type ApiMessageError,
  type Order,
  type OrderItemSnapshot,
} from '../api/orders';
import { useLanguage, getCurrentLang } from '../hooks/useLanguage';

export function OrderDetail() {
  const { id } = useParams<{ id: string }>();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectForm, setShowRejectForm] = useState(false);

  const STATUS_MAP: Record<string, string> = {
    PAID: t('status.PAID'),
    SHIPPED: t('status.SHIPPED'),
    COMPLETED: t('status.COMPLETED'),
    CANCELLED: t('status.CANCELLED'),
    RETURN_PENDING: t('status.RETURN_PENDING'),
    REFUNDED: t('status.REFUNDED'),
  };

  const { data: order, isLoading, isError } = useQuery({
    queryKey: ['order', 'admin', id],
    queryFn: () => ordersApi.getById(Number(id)),
    enabled: !!id,
  });

  const shipMutation = useMutation<unknown, AxiosError<ApiMessageError>>({
    mutationFn: () => ordersApi.updateStatus(Number(id), 'SHIPPED'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['order', 'admin', id] });
      queryClient.invalidateQueries({ queryKey: ['orders', 'admin'] });
    },
  });

  const approveReturnMutation = useMutation<unknown, AxiosError<ApiMessageError>>({
    mutationFn: () => ordersApi.approveReturn(Number(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['order', 'admin', id] });
      queryClient.invalidateQueries({ queryKey: ['orders', 'admin'] });
    },
  });

  const rejectReturnMutation = useMutation<unknown, AxiosError<ApiMessageError>>({
    mutationFn: () => ordersApi.rejectReturn(Number(id), rejectReason || undefined),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['order', 'admin', id] });
      queryClient.invalidateQueries({ queryKey: ['orders', 'admin'] });
      setShowRejectForm(false);
      setRejectReason('');
    },
  });

  useEffect(() => {
    shipMutation.reset();
    approveReturnMutation.reset();
    rejectReturnMutation.reset();
  }, [id]);

  const locale = getCurrentLang() === 'en' ? 'en-US' : 'zh-CN';

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-3">
        <div className="spinner" />
        <p style={{ color: 'var(--color-slate-500)' }} className="text-xs">{t('common.loading')}</p>
      </div>
    );
  }

  if (isError || !order) {
    return (
      <div className="text-center py-32">
        <p style={{ color: 'var(--color-slate-500)' }}>{t('adminOrder.notFound')}</p>
      </div>
    );
  }

  const o: Order = order;
  const canShip = o.status === 'PAID';
  const canHandleReturn = o.status === 'RETURN_PENDING';
  const actionErrorMessage =
    shipMutation.error?.response?.data?.message ||
    approveReturnMutation.error?.response?.data?.message ||
    rejectReturnMutation.error?.response?.data?.message ||
    t('common.error');

  const cardStyle = {
    background: 'var(--color-slate-900)',
    border: '1px solid var(--color-slate-800)',
    borderRadius: 'var(--radius-card)',
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-4">
        <button
          onClick={() => navigate('/orders')}
          className="flex items-center gap-1 text-xs font-medium hover:opacity-70 transition-opacity"
          style={{ color: 'var(--color-slate-500)' }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          {t('adminOrder.backToList')}
        </button>
      </div>
      <h1 style={{ marginBottom: '1.25rem' }}>{t('adminOrder.title')}</h1>

      <div className="p-6 space-y-4" style={cardStyle}>
        <div className="flex justify-between items-center">
          <span className="text-xs" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-slate-500)' }}>
            {o.orderNo}
          </span>
          <span className="badge" style={{ color: 'var(--color-slate-400)', background: 'var(--color-slate-800)' }}>
            {STATUS_MAP[o.status] || o.status}
          </span>
        </div>

        <div className="text-xs space-y-1.5" style={{ color: 'var(--color-slate-400)' }}>
          <p>{t('adminOrder.userName')}{o.user?.name || '-'}</p>
          <p>{t('adminOrder.email')}{o.user?.email || '-'}</p>
          <p>{t('adminOrder.recipient')}{o.recipientName}</p>
          <p>{t('adminOrder.address')}{o.recipientAddress}</p>
          <p>{t('adminOrder.phone')}{o.recipientPhone}</p>
          {o.shippedAt && <p>{t('adminOrder.shippedAt')}{new Date(o.shippedAt).toLocaleString(locale)}</p>}
          {o.refundedAt && <p>{t('adminOrder.refundedAt')}{new Date(o.refundedAt).toLocaleString(locale)}</p>}
        </div>

        <div className="pt-4" style={{ borderTop: '1px solid var(--color-slate-800)' }}>
          <h3 className="text-xs font-semibold mb-3" style={{ color: 'var(--color-slate-300)' }}>{t('adminOrder.items')}</h3>
          {o.items?.map((item: OrderItemSnapshot) => (
            <div
              key={item.id}
              className="flex items-center gap-3 py-2.5"
              style={{ borderBottom: '1px solid var(--color-slate-800)' }}
            >
              <div
                className="w-12 h-12 rounded-[3px] overflow-hidden shrink-0"
                style={{ background: 'var(--color-slate-800)' }}
              >
                {item.productImage ? (
                  <img src={`/${item.productImage}`} alt={item.productName} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[10px]" style={{ color: 'var(--color-slate-600)' }}>
                    {t('common.noImageShort')}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium truncate" style={{ color: 'var(--color-slate-200)' }}>{item.productName}</p>
                <p className="text-[11px] mt-0.5" style={{ color: 'var(--color-slate-500)' }}>
                  &yen;{Number(item.productPrice).toFixed(2)} × {item.quantity}
                </p>
              </div>
              <span className="text-xs" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-slate-300)' }}>
                &yen;{(Number(item.productPrice) * item.quantity).toFixed(2)}
              </span>
            </div>
          ))}
        </div>

        <div className="pt-4 text-right" style={{ borderTop: '1px solid var(--color-slate-800)' }}>
          <span className="text-xs" style={{ color: 'var(--color-slate-500)' }}>{t('adminOrder.total')}</span>
          <span className="text-xl font-bold" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-amber)' }}>
            &yen;{Number(o.totalAmount).toFixed(2)}
          </span>
        </div>

        {o.returnReason && (
          <div className="rounded-[3px] p-3 text-xs" style={{ background: 'var(--color-slate-850)' }}>
            <p style={{ color: 'var(--color-slate-400)' }}>{t('adminOrder.returnReason')}{o.returnReason}</p>
            {o.returnRejectedReason && (
              <p className="mt-1" style={{ color: 'var(--color-red-soft)' }}>{t('adminOrder.rejectReason')}{o.returnRejectedReason}</p>
            )}
            <p className="mt-1" style={{ color: 'var(--color-slate-500)' }}>{t('adminOrder.attempts', { current: o.returnAttempts, max: 3 })}</p>
          </div>
        )}

        {o.review && (
          <div className="rounded-[3px] p-3 text-xs" style={{ background: 'var(--color-amber-bg)', border: '1px solid var(--color-amber-border)' }}>
            <p className="font-medium" style={{ color: 'var(--color-amber)' }}>{t('adminOrder.userReview')}</p>
            <p style={{ color: 'var(--color-amber-light)' }} className="mt-0.5">
              {'★'.repeat(o.review.rating)}{'☆'.repeat(5 - o.review.rating)}
            </p>
            {o.review.content && <p className="mt-1" style={{ color: 'var(--color-slate-400)' }}>{o.review.content}</p>}
          </div>
        )}
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        {canShip && (
          <button
            onClick={() => { if (window.confirm(t('adminOrder.confirmShip'))) shipMutation.mutate(); }}
            disabled={shipMutation.isPending}
            className="btn-primary"
          >
            {shipMutation.isPending ? t('adminOrder.shipping') : t('adminOrder.shipBtn')}
          </button>
        )}
        {canHandleReturn && !showRejectForm && (
          <>
            <button
              onClick={() => { if (window.confirm(t('adminOrder.confirmApprove'))) approveReturnMutation.mutate(); }}
              disabled={approveReturnMutation.isPending}
              className="btn-primary"
              style={{ background: 'var(--color-emerald)', color: 'var(--color-slate-950)' }}
            >
              {approveReturnMutation.isPending ? t('common.processing') : t('adminOrder.approveReturn')}
            </button>
            <button onClick={() => setShowRejectForm(true)} className="btn-danger">
              {t('adminOrder.rejectReturn')}
            </button>
          </>
        )}
      </div>

      {showRejectForm && (
        <div className="mt-4 p-4" style={cardStyle}>
          <h3 className="text-xs font-semibold mb-3" style={{ color: 'var(--color-slate-300)' }}>{t('adminOrder.rejectFormTitle')}</h3>
          <textarea
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder={t('adminOrder.rejectPlaceholder')}
            className="input-field"
            rows={2}
          />
          <div className="mt-3 flex gap-2">
            <button
              onClick={() => { setShowRejectForm(false); setRejectReason(''); }}
              className="btn-ghost"
            >
              {t('common.cancel')}
            </button>
            <button
              onClick={() => rejectReturnMutation.mutate()}
              disabled={rejectReturnMutation.isPending}
              className="btn-danger"
            >
              {rejectReturnMutation.isPending ? t('common.processing') : t('adminOrder.confirmReject')}
            </button>
          </div>
        </div>
      )}

      {(shipMutation.isError || approveReturnMutation.isError || rejectReturnMutation.isError) && (
        <p className="text-xs mt-2" style={{ color: 'var(--color-red-soft)' }}>
          {actionErrorMessage}
        </p>
      )}
    </div>
  );
}
