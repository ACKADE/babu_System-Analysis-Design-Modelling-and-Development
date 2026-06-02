import apiClient from './client';

export const reviewsApi = {
  getByProduct: (productId: number) => apiClient.get(`/products/${productId}/reviews`),
};
