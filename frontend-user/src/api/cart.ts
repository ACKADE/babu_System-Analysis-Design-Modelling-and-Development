import apiClient from './client';

export const cartApi = {
  getAll: () => apiClient.get('/cart'),
  add: (productId: number, quantity?: number) => apiClient.post('/cart', { productId, quantity }),
  update: (itemId: number, quantity: number) => apiClient.put(`/cart/${itemId}`, { quantity }),
  remove: (itemId: number) => apiClient.delete(`/cart/${itemId}`),
};
