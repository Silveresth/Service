import axios from 'axios';

const BASE_URL = process.env.REACT_APP_API_URL
  ? `${process.env.REACT_APP_API_URL.replace(/\/$/, '')}/api/`
  : (process.env.NODE_ENV === 'development'
     ? '/api/'
     : 'http://192.168.100.19:8000/api/');

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 60000, // 60 secondes - pour le cold start Render
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
  async error => {
    const config = error.config;
    // Retry automatique une fois si timeout ou erreur réseau (cold start)
    if ((error.code === 'ECONNABORTED' || !error.response) && !config._retry) {
      config._retry = true;
      config.timeout = 90000; // 90s pour le retry
      return api(config);
    }
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;