import axios from 'axios';

const API_URL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.PROD ? 'https://vulnscan-backend-4oz4.onrender.com/api' : '/api');

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken) {
        try {
          const { data } = await axios.post(`${API_URL}/auth/refresh`, {}, {
            headers: { Authorization: `Bearer ${refreshToken}` },
          });
          localStorage.setItem('access_token', data.access_token);
          original.headers.Authorization = `Bearer ${data.access_token}`;
          return api(original);
        } catch {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;

export const authAPI = {
  register: (data: { username: string; email: string; password: string }) =>
    api.post('/auth/register', data),
  login: (data: { email: string; password: string; remember_me?: boolean }) =>
    api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  me: () => api.get('/auth/me'),
  forgotPassword: (email: string) => api.post('/auth/forgot-password', { email }),
  /** OTP Step 1: request a 6-digit OTP to be sent to the registered email */
  sendOTP: (email: string) => api.post('/auth/send-otp', { email }),
  /** OTP Step 2: verify the OTP; returns { session_token } on success */
  verifyOTP: (email: string, otp: string) => api.post('/auth/verify-otp', { email, otp }),
  /** Reset with OTP session token (Step 3) or legacy URL token */
  resetPassword: (tokenOrSession: string, password: string, isSession = false) =>
    api.post('/auth/reset-password', isSession
      ? { session_token: tokenOrSession, password }
      : { token: tokenOrSession, password }),
  verifyEmail: (token: string) => api.post('/auth/verify-email', { token }),
  changePassword: (current_password: string, new_password: string) =>
    api.post('/auth/change-password', { current_password, new_password }),
};

export const scanAPI = {
  start: (data: { url: string; domain?: string; ip_address?: string }) =>
    api.post('/scan/start', data),
  status: (scanId: number) => api.get(`/scan/${scanId}/status`),
  logs: (scanId: number) => api.get(`/scan/${scanId}/logs`),
  active: () => api.get('/scan/active'),
};

export const dashboardAPI = {
  stats: () => api.get('/dashboard/stats'),
  analytics: () => api.get('/dashboard/analytics'),
};

export const historyAPI = {
  list: (page = 1, perPage = 10, status?: string) =>
    api.get('/history/', { params: { page, per_page: perPage, status } }),
  detail: (scanId: number) => api.get(`/history/${scanId}`),
  delete: (scanId: number) => api.delete(`/history/${scanId}`),
};

export const reportsAPI = {
  generate: (scanId: number, format: string) =>
    api.post(`/reports/generate/${scanId}`, { format }),
  download: (reportId: number) =>
    api.get(`/reports/download/${reportId}`, { responseType: 'blob' }),
  list: (scanId: number) => api.get(`/reports/scan/${scanId}`),
};

export const profileAPI = {
  get: () => api.get('/profile/'),
  update: (data: { username?: string; email?: string }) => api.put('/profile/', data),
  notifications: () => api.get('/profile/notifications'),
  markRead: (id: number) => api.put(`/profile/notifications/${id}/read`),
  markAllRead: () => api.put('/profile/notifications/read-all'),
};

export const adminAPI = {
  users: (page = 1) => api.get('/admin/users', { params: { page } }),
  deleteUser: (id: number) => api.delete(`/admin/users/${id}`),
  suspendUser: (id: number) => api.put(`/admin/users/${id}/suspend`),
  scans: (page = 1) => api.get('/admin/scans', { params: { page } }),
  analytics: () => api.get('/admin/analytics'),
  logs: (page = 1) => api.get('/admin/logs', { params: { page } }),
};
