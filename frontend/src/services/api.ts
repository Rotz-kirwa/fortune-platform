import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const authAPI = {
  register: (userData: { name: string; email: string; password: string }) =>
    api.post('/users/register', userData),
  login: (credentials: { email: string; password: string }) =>
    api.post('/users/login', credentials),
};

// Orders API
export const ordersAPI = {
  create: (orderData: { customer_name: string; product: string; amount: number }) =>
    api.post('/orders', orderData),
  getAll: () => api.get('/orders'),
  getById: (id: string) => api.get(`/orders/${id}`),
  updateStatus: (id: string, status: string) =>
    api.put(`/orders/${id}/status`, { status }),
};

// Payments API
export const paymentsAPI = {
  create: (paymentData: { order_id: number; amount: number; method: string }) =>
    api.post('/pay', paymentData),
  getAll: () => api.get('/pay'),
  stkPush: (data: { amount: number; phoneNumber: string; accountReference?: string }) =>
    api.post('/pay/stk', data),
};

// Investment API
export const investmentAPI = {
  getPlans: () => api.get('/investments/plans'),
  createPendingInvestment: (data: { plan_id: number; amount: number; phone_number: string; checkout_request_id: string }) =>
    api.post('/investments/pending', data),
  createInvestment: (data: { plan_id: number; amount: number; checkout_request_id: string }) =>
    api.post('/investments', data),
  getMyInvestments: () => api.get('/investments/my-investments'),
  getDashboardStats: () => api.get('/investments/dashboard-stats'),
  getPortfolioGrowth: () => api.get('/investments/portfolio-growth'),
};

export default api;