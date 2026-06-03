import apiClient from './client';

export type OrderStatus =
  | 'PAID'
  | 'SHIPPED'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'RETURN_PENDING'
  | 'REFUNDED';

export interface OrderItemSnapshot {
  id: number;
  productId: number;
  productName: string;
  productPrice: number | string;
  productImage: string | null;
  quantity: number;
}

export interface OrderReview {
  id: number;
  rating: number;
  content: string | null;
}

export interface OrderUserSummary {
  id: number;
  name: string;
  email: string;
}

export interface Order {
  id: number;
  orderNo: string;
  status: OrderStatus;
  recipientName: string;
  recipientAddress: string;
  recipientPhone: string;
  totalAmount: number | string;
  createdAt: string;
  shippedAt?: string | null;
  refundedAt?: string | null;
  returnReason?: string | null;
  returnRejectedReason?: string | null;
  returnAttempts: number;
  items: OrderItemSnapshot[];
  review?: OrderReview | null;
  user?: OrderUserSummary;
}

export interface ApiMessageError {
  message: string;
}

export const ordersApi = {
  create: async (data: { recipientName: string; recipientAddress: string; recipientPhone: string }) => {
    const res = await apiClient.post<Order>('/orders', data);
    return res.data;
  },
  getAll: async () => {
    const res = await apiClient.get<Order[]>('/orders');
    return res.data;
  },
  getById: async (id: number) => {
    const res = await apiClient.get<Order>(`/orders/${id}`);
    return res.data;
  },
  confirm: async (id: number) => {
    const res = await apiClient.post<Order>(`/orders/${id}/confirm`);
    return res.data;
  },
  cancel: async (id: number) => {
    const res = await apiClient.post<{ message: string; status: OrderStatus }>(`/orders/${id}/cancel`);
    return res.data;
  },
  requestReturn: async (id: number, returnReason: string) => {
    const res = await apiClient.post<Order>(`/orders/${id}/return`, { returnReason });
    return res.data;
  },
  createReview: async (orderId: number, data: { productId: number; rating: number; content?: string }) => {
    const res = await apiClient.post(`/orders/${orderId}/review`, data);
    return res.data;
  },
};
