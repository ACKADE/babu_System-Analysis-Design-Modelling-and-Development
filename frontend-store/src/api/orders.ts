import apiClient from './client';

export const ordersApi = {
  getAll: () => apiClient.get('/orders'),
  getById: (id: number) => apiClient.get(`/orders/${id}`),
  updateStatus: (id: number, status: 'SHIPPED') =>
    apiClient.patch(`/orders/${id}/status`, { status }),
  approveReturn: (id: number) => apiClient.post(`/orders/${id}/return/approve`),
  rejectReturn: (id: number, rejectReason?: string) =>
    apiClient.post(`/orders/${id}/return/reject`, { rejectReason }),
};
