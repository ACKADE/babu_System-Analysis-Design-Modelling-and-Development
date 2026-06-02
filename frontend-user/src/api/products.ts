import apiClient from './client';

export interface Product {
  id: number;
  name: string;
  summary: string;
  description: string;
  price: string;
  stock: number;
  thumbnailUrl: string;
  imageUrl: string;
  isActive: boolean;
  categoryId: number;
}

export const productsApi = {
  getAll: () => apiClient.get<Product[]>('/products'),
  getById: (id: number) => apiClient.get<Product>(`/products/${id}`),
};
