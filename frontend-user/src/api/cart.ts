import apiClient from './client';

export interface CartProductSummary {
  id: number;
  name: string;
  price: number | string;
  stock: number;
  isActive: boolean;
  thumbnailUrl?: string | null;
}

export interface CartItem {
  id: number;
  productId: number;
  quantity: number;
  product: CartProductSummary;
}

export const cartApi = {
  getAll: async () => {
    const res = await apiClient.get<CartItem[]>('/cart');
    return res.data;
  },
  add: (productId: number, quantity?: number) => apiClient.post('/cart', { productId, quantity }),
  update: (itemId: number, quantity: number) => apiClient.put(`/cart/${itemId}`, { quantity }),
  remove: (itemId: number) => apiClient.delete(`/cart/${itemId}`),
};
