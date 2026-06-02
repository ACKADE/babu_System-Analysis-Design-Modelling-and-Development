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
  getAll: (showAll = true) => apiClient.get<Product[]>('/products', { params: { all: showAll } }),
  getById: (id: number) => apiClient.get<Product>(`/products/${id}`),
  create: (formData: FormData) =>
    apiClient.post('/products', formData),
  update: (id: number, formData: FormData) =>
    apiClient.put(`/products/${id}`, formData),
  toggle: (id: number) => apiClient.patch(`/products/${id}/toggle`),
};
