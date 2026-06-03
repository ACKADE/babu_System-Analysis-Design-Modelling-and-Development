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
  getAll: async () => {
    const res = await apiClient.get<Order[]>('/orders');
    return res.data;
  },
  getById: async (id: number) => {
    const res = await apiClient.get<Order>(`/orders/${id}`);
    return res.data;
  },
  updateStatus: async (id: number, status: 'SHIPPED') => {
    const res = await apiClient.patch<Order>(`/orders/${id}/status`, { status });
    return res.data;
  },
  approveReturn: async (id: number) => {
    const res = await apiClient.post<{ message: string; status: OrderStatus }>(`/orders/${id}/return/approve`);
    return res.data;
  },
  rejectReturn: async (id: number, rejectReason?: string) => {
    const res = await apiClient.post<Order>(`/orders/${id}/return/reject`, { rejectReason });
    return res.data;
  },
};
