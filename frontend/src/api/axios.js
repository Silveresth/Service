import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NODE_ENV === 'development' 
    ? '/api/'  // Use CRA proxy in development
    : (process.env.REACT_APP_API_URL 
       ? `${process.env.REACT_APP_API_URL.replace(/\/$/, '')}/api/` 
       : 'http://192.168.100.19:8000/api/'),
});

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;