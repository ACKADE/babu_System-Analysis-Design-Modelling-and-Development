import apiClient from './client';

interface RegisterData {
  name: string;
  email: string;
  password: string;
  role: 'USER' | 'ADMIN';
}

interface LoginData {
  email: string;
  password: string;
}

export const authApi = {
  register: (data: RegisterData) => apiClient.post('/auth/register', data),
  login: (data: LoginData) => apiClient.post('/auth/login', data),
  refresh: (refreshToken: string) => apiClient.post('/auth/refresh', { refreshToken }),
  logout: () => apiClient.post('/auth/logout'),
  forgotPassword: (email: string) => apiClient.post('/auth/forgot-password', { email }),
  getMe: () => apiClient.get('/auth/me'),
  updateProfile: (name: string) => apiClient.put('/auth/profile', { name }),
  updatePassword: (oldPassword: string, newPassword: string) =>
    apiClient.put('/auth/password', { oldPassword, newPassword }),
};
