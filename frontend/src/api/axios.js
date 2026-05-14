import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NODE_ENV === 'development'
    ? '/api/' // CRA proxy en dev
    : (process.env.REACT_APP_API_URL
      ? `${process.env.REACT_APP_API_URL.replace(/\/$/, '')}/api/`
      : 'http://192.168.100.19:8000/api/'),
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
