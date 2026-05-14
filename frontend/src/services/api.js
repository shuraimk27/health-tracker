import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: { 'Content-Type': 'application/json' }
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const registerUser = (data) => api.post('/auth/register', data);
export const loginUser = (data) => api.post('/auth/login', data);
export const getHealthEntries = () => api.get('/health');
export const addHealthEntry = (data) => api.post('/health', data);
export const getHealthStats = () => api.get('/health/stats');
export const deleteHealthEntry = (id) => api.delete(`/health/${id}`);

export default api;