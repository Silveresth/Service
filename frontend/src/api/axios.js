import axios from 'axios';

const normalizeApiBase = (raw) => {
  // Backend is mounted at /api/ in Django (see service_market/service_market/urls.py)
  // So: production baseURL should become `${backendOrigin}/api/`.
  if (!raw) return '/api/';

  const trimmed = String(raw).replace(/\/$/, '');

  // If someone already provided a full backend base including /api, keep it.
  if (trimmed.endsWith('/api')) return `${trimmed}/`;

  return `${trimmed}/api/`;
};


const api = axios.create({
  // In production, REACT_APP_API_URL must be the backend origin only (no /api)
  // Example: https://backend-sm.onrender.com
  baseURL: process.env.NODE_ENV === 'production'
    ? normalizeApiBase(process.env.REACT_APP_API_URL)
    : '/api/',
});


let isRefreshing = false;
let refreshQueue = [];

const subscribeTokenRefresh = (cb) => {
  refreshQueue.push(cb);
};

const onRefreshed = (newToken) => {
  refreshQueue.forEach((cb) => cb(newToken));
  refreshQueue = [];
};

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error.response?.status;
    const originalRequest = error.config;

    if (!originalRequest) return Promise.reject(error);

    // Évite boucle infinie
    if (status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = localStorage.getItem('refresh_token');
      if (!refreshToken) {
        localStorage.removeItem('token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve) => {
          subscribeTokenRefresh((newToken) => {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            resolve(api(originalRequest));
          });
        });
      }

      isRefreshing = true;
      try {
        const res = await api.post('/auth/token/refresh/', { refresh: refreshToken });

        const newAccessToken = res.data?.access;
        if (!newAccessToken) throw new Error('No access token returned by refresh');

        localStorage.setItem('token', newAccessToken);
        onRefreshed(newAccessToken);

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (e) {
        localStorage.removeItem('token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
        return Promise.reject(e);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);


export default api;
