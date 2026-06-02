import apiClient from './client';

export const categoriesApi = {
  getAll: () => apiClient.get('/categories'),
};
