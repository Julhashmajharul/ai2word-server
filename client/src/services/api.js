import axios from 'axios';
import { auth } from '../config/firebase';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:5000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Attach Firebase ID token to every request
api.interceptors.request.use(async (config) => {
  const user = auth.currentUser;
  if (user) {
    const token = await user.getIdToken();
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Auth ──
export const authAPI = {
  signup: (data) => api.post('/api/auth/signup', data),
  googleAuth: (data) => api.post('/api/auth/google', data),
  getProfile: () => api.get('/api/auth/me'),
  updateProfile: (data) => api.put('/api/auth/profile', data),
  savePageSetup: (data) => api.put('/api/auth/page-setup', data),
};

// ── Credits ──
export const creditsAPI = {
  getBalance: () => api.get('/api/credits'),
  deduct: (wordCount) => api.post('/api/credits/deduct', { word_count: wordCount }),
};

// ── History ──
export const historyAPI = {
  getAll: () => api.get('/api/history'),
  delete: (id) => api.delete(`/api/history/${id}`),
};

// ── Plans ──
export const plansAPI = {
  getAll: () => api.get('/api/plans'),
  subscribe: (planId) => api.post('/api/subscribe', { plan: planId }),
};

// ── Convert (Word export) ──
export const convertAPI = {
  toWord: async (markdown, settings) => {
    const response = await api.post('/convert', { markdown, settings }, {
      responseType: 'blob',
    });
    return response.data;
  },
};

export default api;
