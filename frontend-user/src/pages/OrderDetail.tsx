import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import {
  ordersApi,
  type ApiMessageError,
  type Order,
  type OrderItemSnapshot,
} from '../api/orders';
import { useLanguage } from '../hooks/useLanguage';

export function OrderDetail() {
  const { id } = useParams<{ id: string }>();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [returnReason, setReturnReason] = useState('');
  const [showReturnForm, setShowReturnForm] = useState(false);
  const [reviewProductId, setReviewProductId] = useState<number>(0);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewContent, setReviewContent] = useState('');
  const [showReviewForm, setShowReviewForm] = useState(false);

  const STATUS_MAP: Record<string, string> = {
    PAID: t('status.PAID'),
    SHIPPED: t('status.SHIPPED'),
    COMPLETED: t('status.COMPLETED'),
    CANCELLED: t('status.CANCELLED'),
    RETURN_PENDING: t('status.RETURN_PENDING'),
    REFUNDED: t('status.REFUNDED'),
  };

  const { data: order, isLoading, isError } = useQuery({
    queryKey: ['order', id],
    queryFn: () => ordersApi.getById(Number(id)),
    enabled: !!id,
  });

  const cancelMutation = useMutation<unknown, AxiosError<ApiMessageError>>({
    mutationFn: () => ordersApi.cancel(Number(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['order', id] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });

  const confirmMutation = useMutation<unknown, AxiosError<ApiMessageError>>({
    mutationFn: () => ordersApi.confirm(Number(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['order', id] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });

  const returnMutation = useMutation<unknown, AxiosError<ApiMessageError>>({
    mutationFn: () => ordersApi.requestReturn(Number(id), returnReason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['order', id] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      setShowReturnForm(false);
      setReturnReason('');
    },
  });

  const reviewMutation = useMutation<unknown, AxiosError<ApiMessageError>>({
    mutationFn: () => ordersApi.createReview(Number(id), {
      productId: reviewProductId,
      rating: reviewRating,
      content: reviewContent || undefined,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['order', id] });
      setShowReviewForm(false);
      setReviewContent('');
    },
  });

  useEffect(() => {
    cancelMutation.reset();
    confirmMutation.reset();
    returnMutation.reset();
    reviewMutation.reset();
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-3">
        <div className="spinner" />
        <p style={{ color: 'var(--color-ink-muted)' }} className="text-sm">{t('common.loading')}</p>
      </div>
    );
  }

  if (isError || !order) {
    return (
      <div className="text-center py-32">
        <p style={{ color: 'var(--color-ink-muted)' }} className="text-lg mb-4">{t('order.notFound')}</p>
        <Link to="/orders" className="btn-ghost">{t('order.backToOrders')}</Link>
      </div>
    );
  }

  const o: Order = order;
  const canCancel = o.status === 'PAID';
  const canConfirm = o.status === 'SHIPPED';
  const canReturn = o.status === 'COMPLETED' && o.returnAttempts < 3;
  const canReview = o.status === 'COMPLETED' && !o.review;
  const actionErrorMessage =
    cancelMutation.error?.response?.data?.message ||
    confirmMutation.error?.response?.data?.message ||
    t('common.error');

  return (
    <div className="max-w-2xl mx-auto page-enter">
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate('/orders')}
          className="flex items-center gap-1 text-xs font-medium hover:opacity-70 transition-opacity"
          style={{ color: 'var(--color-ink-light)' }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          {t('orders.backToList')}
        </button>
      </div>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', marginBottom: '1.5rem' }}>{t('order.title')}</h1>

      <div
        className="rounded-[3px] p-6 space-y-4"
        style={{ background: 'white', boxShadow: 'var(--shadow-card)' }}
      >
        <div className="flex justify-between items-center">
          <span className="text-sm tracking-wide" style={{ color: 'var(--color-ink-muted)' }}>{o.orderNo}</span>
          <span
            className="text-xs px-2.5 py-1 rounded-[2px] font-medium"
            style={{ background: 'var(--color-paper-warm)', color: 'var(--color-ink-light)' }}
          >
            {STATUS_MAP[o.status] || o.status}
          </span>
        </div>

        <div className="text-sm space-y-1.5" style={{ color: 'var(--color-ink-light)' }}>
          <p>{t('order.recipientLabel')}{o.recipientName}</p>
          <p>{t('order.addressLabel')}{o.recipientAddress}</p>
          <p>{t('order.phoneLabel')}{o.recipientPhone}</p>
        </div>

        <div className="pt-4" style={{ borderTop: '1px solid var(--color-paper-dark)' }}>
          <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--color-ink)' }}>{t('order.itemsLabel')}</h3>
          {o.items?.map((item: OrderItemSnapshot) => (
            <div
              key={item.id}
              className="flex items-center gap-3 py-2.5"
              style={{ borderBottom: '1px solid var(--color-paper-dark)' }}
            >
              <div
                className="w-12 h-12 rounded-[2px] overflow-hidden shrink-0"
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
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate" style={{ color: 'var(--color-ink)' }}>{item.productName}</p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--color-ink-muted)' }}>
                  &yen;{Number(item.productPrice).toFixed(2)} × {item.quantity}
                </p>
              </div>
              <span className="text-sm font-medium" style={{ color: 'var(--color-ink)' }}>
                &yen;{(Number(item.productPrice) * item.quantity).toFixed(2)}
              </span>
            </div>
          ))}
        </div>

        <div className="pt-4 text-right" style={{ borderTop: '1px solid var(--color-paper-dark)' }}>
          <span style={{ color: 'var(--color-ink-muted)' }} className="text-sm">{t('order.totalLabel')}</span>
          <span className="text-xl font-bold" style={{ fontFamily: 'var(--font-display)', color: 'var(--color-terra)' }}>
            &yen;{Number(o.totalAmount).toFixed(2)}
          </span>
        </div>

        {o.returnReason && (
          <div
            className="rounded-[3px] p-3 text-sm"
            style={{ background: 'var(--color-paper-warm)' }}
          >
            <p style={{ color: 'var(--color-ink-light)' }}>{t('order.returnReason')}{o.returnReason}</p>
            {o.returnRejectedReason && (
              <p className="mt-1" style={{ color: 'var(--color-terra)' }}>{t('order.rejectReason')}{o.returnRejectedReason}</p>
            )}
            {o.returnAttempts > 0 && (
              <p className="mt-1" style={{ color: 'var(--color-ink-muted)' }}>{t('order.returnAttempts', { current: o.returnAttempts, max: 3 })}</p>
            )}
          </div>
        )}
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        {canCancel && (
          <button
            onClick={() => { if (window.confirm(t('order.confirmCancel'))) cancelMutation.mutate(); }}
            disabled={cancelMutation.isPending}
            className="btn-ghost"
            style={{ borderColor: 'var(--color-terra)', color: 'var(--color-terra)' }}
          >
            {cancelMutation.isPending ? t('order.cancelling') : t('order.cancelOrder')}
          </button>
        )}
        {canConfirm && (
          <button
            onClick={() => { if (window.confirm(t('order.confirmReceipt'))) confirmMutation.mutate(); }}
            disabled={confirmMutation.isPending}
            className="btn-primary"
            style={{ background: 'var(--color-sage)' }}
          >
            {confirmMutation.isPending ? t('order.confirming') : t('order.confirmReceiptBtn')}
          </button>
        )}
        {canReturn && !showReturnForm && (
          <button
            onClick={() => setShowReturnForm(true)}
            className="btn-ghost"
            style={{ borderColor: 'var(--color-gold)', color: 'var(--color-gold)' }}
          >
            {t('order.requestReturn')}
          </button>
        )}
      </div>

      {(cancelMutation.isError || confirmMutation.isError) && (
        <p className="text-sm mt-3" style={{ color: 'var(--color-terra)' }}>
          {actionErrorMessage}
        </p>
      )}

      {showReturnForm && (
        <div
          className="mt-4 rounded-[3px] p-4"
          style={{ background: 'white', boxShadow: 'var(--shadow-card)' }}
        >
          <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--color-ink)' }}>{t('order.returnFormTitle')}</h3>
          <textarea
            value={returnReason}
            onChange={(e) => setReturnReason(e.target.value)}
            placeholder={t('order.returnPlaceholder')}
            className="input-field"
            rows={3}
          />
          <div className="mt-3 flex gap-2">
            <button
              onClick={() => { setShowReturnForm(false); setReturnReason(''); }}
              className="btn-ghost"
            >
              {t('common.cancel')}
            </button>
            <button
              onClick={() => returnMutation.mutate()}
              disabled={returnReason.length < 5 || returnMutation.isPending}
              className="btn-primary"
              style={{ background: 'var(--color-gold)' }}
            >
              {returnMutation.isPending ? t('order.submitting') : t('order.submitRequest')}
            </button>
          </div>
          {returnMutation.isError && (
            <p className="text-sm mt-2" style={{ color: 'var(--color-terra)' }}>
              {returnMutation.error?.response?.data?.message || t('order.requestFailed')}
            </p>
          )}
        </div>
      )}

      {canReview && !showReviewForm && (
        <div className="mt-4">
          <button
            onClick={() => {
              setShowReviewForm(true);
              if (o.items?.length > 0) setReviewProductId(o.items[0].productId);
            }}
            className="btn-primary"
            style={{ background: 'var(--color-gold)' }}
          >
            {t('order.reviewProduct')}
          </button>
        </div>
      )}

      {showReviewForm && (
        <div
          className="mt-4 rounded-[3px] p-4"
          style={{ background: 'white', boxShadow: 'var(--shadow-card)' }}
        >
          <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--color-ink)' }}>{t('order.reviewFormTitle')}</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-sm mb-1.5" style={{ color: 'var(--color-ink-light)' }}>{t('order.reviewProductLabel')}</label>
              <select
                value={reviewProductId}
                onChange={(e) => setReviewProductId(Number(e.target.value))}
                className="input-field"
              >
                {o.items?.map((item: OrderItemSnapshot) => (
                  <option key={item.productId} value={item.productId}>{item.productName}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm mb-1.5" style={{ color: 'var(--color-ink-light)' }}>{t('order.reviewRating')}</label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setReviewRating(star)}
                    className="text-xl transition-colors"
                    style={{ color: star <= reviewRating ? 'var(--color-gold)' : 'var(--color-paper-dark)' }}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm mb-1.5" style={{ color: 'var(--color-ink-light)' }}>{t('order.reviewContent')}</label>
              <textarea
                value={reviewContent}
                onChange={(e) => setReviewContent(e.target.value)}
                className="input-field"
                rows={2}
              />
            </div>
            <div className="flex gap-2">
              <button onClick={() => setShowReviewForm(false)} className="btn-ghost">{t('common.cancel')}</button>
              <button
                onClick={() => reviewMutation.mutate()}
                disabled={reviewMutation.isPending}
                className="btn-primary"
                style={{ background: 'var(--color-gold)' }}
              >
                {reviewMutation.isPending ? t('order.submitting') : t('order.submitReview')}
              </button>
            </div>
            {reviewMutation.isError && (
              <p className="text-sm" style={{ color: 'var(--color-terra)' }}>
                {reviewMutation.error?.response?.data?.message || t('order.reviewFailed')}
              </p>
            )}
          </div>
        </div>
      )}

      {o.review && (
        <div
          className="mt-4 rounded-[3px] p-4"
          style={{ background: 'white', boxShadow: 'var(--shadow-card)' }}
        >
          <h3 className="text-sm font-semibold mb-2" style={{ color: 'var(--color-ink)' }}>{t('order.myReview')}</h3>
          <p style={{ color: 'var(--color-gold)', fontSize: '0.9rem' }}>
            {'★'.repeat(o.review.rating)}{'☆'.repeat(5 - o.review.rating)}
          </p>
          {o.review.content && (
            <p className="text-sm mt-1" style={{ color: 'var(--color-ink-light)' }}>{o.review.content}</p>
          )}
        </div>
      )}
    </div>
  );
}
