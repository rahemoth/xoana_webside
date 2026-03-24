// import axios from 'axios';
//
// const RAW_BASE =
//   process.env.NEXT_PUBLIC_API_BASE ||
//   process.env.NEXT_PUBLIC_API_URL ||
//   '/api';
//
// // remove trailing slashes to avoid // in urls
// const API_BASE_URL = RAW_BASE.replace(/\/+$/, '');
//
// const api = axios.create({
//   baseURL: API_BASE_URL,
//   headers: { 'Content-Type': 'application/json' },
// });
//
// api.interceptors.request.use((config) => {
//   if (typeof window !== 'undefined') {
//     // Read token from Zustand persisted storage
//     try {
//       const storeData = localStorage.getItem('xoana-store');
//       if (storeData) {
//         const parsed = JSON.parse(storeData);
//         const token = parsed?.state?.token;
//         if (token) config.headers.Authorization = `Bearer ${token}`;
//       }
//     } catch {}
//   }
//   return config;
// });
//
// api.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     if (error.response?.status === 401 && typeof window !== 'undefined') {
//       localStorage.removeItem('xoana_token');
//       localStorage.removeItem('xoana_user');
//       window.location.href = '/login';
//     }
//     return Promise.reject(error);
//   }
// );
//
// export default api;
//
// // API endpoints (NOTE: paths are relative to baseURL, so DO NOT prefix with /api again)
// export const authApi = {
//   login: (data: { username: string; password: string }) => api.post('/auth/login', data),
//   register: (data: { username: string; email: string; password: string; nickname?: string }) =>
//     api.post('/auth/register', data),
// };
//
// export const productApi = {
//   getAll: (params?: { page?: number; size?: number; category?: string; keyword?: string }) =>
//     api.get('/products', { params }),
//   getFeatured: () => api.get('/products/featured'),
//   getById: (id: number) => api.get(`/products/${id}`),
//   create: (data: unknown) => api.post('/products', data),
//   update: (id: number, data: unknown) => api.put(`/products/${id}`, data),
//   delete: (id: number) => api.delete(`/products/${id}`),
// };
//
// export const articleApi = {
//   getAll: (params?: { page?: number; size?: number }) => api.get('/articles', { params }),
//   getRecent: () => api.get('/articles/recent'),
//   getById: (id: number) => api.get(`/articles/${id}`),
//   getAllAdmin: (params?: { page?: number; size?: number }) =>
//     api.get('/articles/admin/all', { params }),
//   create: (data: unknown) => api.post('/articles', data),
//   update: (id: number, data: unknown) => api.put(`/articles/${id}`, data),
//   delete: (id: number) => api.delete(`/articles/${id}`),
// };
//
// export const orderApi = {
//   create: (data: unknown) => api.post('/orders', data),
//   getMyOrders: (params?: { page?: number; size?: number }) => api.get('/orders/my', { params }),
//   getAllAdmin: (params?: { page?: number; size?: number }) =>
//     api.get('/orders/admin/all', { params }),
//   updateStatus: (id: number, status: string) =>
//     api.put(`/orders/${id}/status`, null, { params: { status } }),
//   processPayment: (id: number, method: string) =>
//     api.post(`/orders/${id}/pay`, null, { params: { method } }),
// };
//
// export const userApi = {
//   getProfile: () => api.get('/users/me'),
//   updateProfile: (data: unknown) => api.put('/users/me', data),
//   getAllAdmin: (params?: { page?: number; size?: number }) =>
//     api.get('/users/admin/all', { params }),
//   toggleStatus: (id: number) => api.put(`/users/admin/${id}/status`),
// };
//
// export const trafficApi = {
//   track: (path: string) => api.post('/traffic/track', { path }).catch(() => {}),
//   getStats: (days?: number) => api.get('/traffic/stats', { params: { days } }),
// };
//
// export const uploadApi = {
//   uploadImage: (file: File) => {
//     const formData = new FormData();
//     formData.append('file', file);
//     return api.post('/upload/image', formData, {
//       headers: { 'Content-Type': 'multipart/form-data' },
//     });
//   },
// };
//
// export const contactApi = {
//   submit: (data: { name: string; email: string; message: string }) => api.post('/contact', data),
//   getAll: (params?: { page?: number; size?: number }) => api.get('/contact', { params }),
//   markAsRead: (id: number) => api.put(`/contact/${id}/read`),
//   delete: (id: number) => api.delete(`/contact/${id}`),
// };