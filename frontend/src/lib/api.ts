import axios from 'axios';
import { useStore } from '@/store';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    // Prefer the live Zustand store token (always up-to-date, avoids any
    // serialisation/deserialisation race with localStorage).
    const token = useStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      // Fallback: read directly from persisted storage in case the store has
      // not yet hydrated (e.g. very first render before onRehydrateStorage).
      try {
        const storeData = localStorage.getItem('xoana-store');
        if (storeData) {
          const parsed = JSON.parse(storeData);
          const storedToken = parsed?.state?.token;
          if (storedToken) config.headers.Authorization = `Bearer ${storedToken}`;
        }
      } catch {}
    }
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      // Only redirect when we are NOT already on the login page to prevent
      // redirect loops (e.g. when the login request itself returns 401).
      if (!window.location.pathname.startsWith('/login')) {
        useStore.getState().clearAuth();
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;

// API endpoints
export const authApi = {
  login: (data: { username: string; password: string }) => api.post('/api/auth/login', data),
  register: (data: { username: string; email: string; password: string; nickname?: string }) =>
    api.post('/api/auth/register', data),
};

export const productApi = {
  getAll: (params?: { page?: number; size?: number; category?: string; keyword?: string }) =>
    api.get('/api/products', { params }),
  getFeatured: () => api.get('/api/products/featured'),
  getById: (id: number) => api.get(`/api/products/${id}`),
  create: (data: unknown) => api.post('/api/products', data),
  update: (id: number, data: unknown) => api.put(`/api/products/${id}`, data),
  delete: (id: number) => api.delete(`/api/products/${id}`),
};

export const articleApi = {
  getAll: (params?: { page?: number; size?: number }) => api.get('/api/articles', { params }),
  getRecent: () => api.get('/api/articles/recent'),
  getById: (id: number) => api.get(`/api/articles/${id}`),
  getAllAdmin: (params?: { page?: number; size?: number }) =>
    api.get('/api/articles/admin/all', { params }),
  create: (data: unknown) => api.post('/api/articles', data),
  update: (id: number, data: unknown) => api.put(`/api/articles/${id}`, data),
  delete: (id: number) => api.delete(`/api/articles/${id}`),
};

export const orderApi = {
  create: (data: unknown) => api.post('/api/orders', data),
  getMyOrders: (params?: { page?: number; size?: number }) => api.get('/api/orders/my', { params }),
  getAllAdmin: (params?: { page?: number; size?: number }) =>
    api.get('/api/orders/admin/all', { params }),
  updateStatus: (id: number, status: string) =>
    api.put(`/api/orders/${id}/status`, null, { params: { status } }),
  processPayment: (id: number, method: string) =>
    api.post(`/api/orders/${id}/pay`, null, { params: { method } }),
};

export const userApi = {
  getProfile: () => api.get('/api/users/me'),
  updateProfile: (data: unknown) => api.put('/api/users/me', data),
  getAllAdmin: (params?: { page?: number; size?: number }) =>
    api.get('/api/users/admin/all', { params }),
  toggleStatus: (id: number) => api.put(`/api/users/admin/${id}/status`),
};

export const trafficApi = {
  track: (path: string) => api.post('/api/traffic/track', { path }).catch(() => {}),
  getStats: (days?: number) => api.get('/api/traffic/stats', { params: { days } }),
};

export const uploadApi = {
  uploadImage: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/api/upload/image', formData);
  },
};

export const contactApi = {
  submit: (data: { name: string; email: string; message: string }) =>
    api.post('/api/contact', data),
  getAll: (params?: { page?: number; size?: number }) =>
    api.get('/api/contact', { params }),
  markAsRead: (id: number) => api.put(`/api/contact/${id}/read`),
  delete: (id: number) => api.delete(`/api/contact/${id}`),
};
