import apiClient from './client';

export const ordersApi = {
  create: (data: { recipientName: string; recipientAddress: string; recipientPhone: string }) =>
    apiClient.post('/orders', data),
  getAll: () => apiClient.get('/orders'),
  getById: (id: number) => apiClient.get(`/orders/${id}`),
  confirm: (id: number) => apiClient.post(`/orders/${id}/confirm`),
  cancel: (id: number) => apiClient.post(`/orders/${id}/cancel`),
  requestReturn: (id: number, returnReason: string) =>
    apiClient.post(`/orders/${id}/return`, { returnReason }),
  createReview: (orderId: number, data: { productId: number; rating: number; content?: string }) =>
    apiClient.post(`/orders/${orderId}/review`, data),
};
