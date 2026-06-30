import axios from 'axios';

const BASE_URL = process.env.REACT_APP_API_URL
  ? `${process.env.REACT_APP_API_URL.replace(/\/$/, '')}/api/`
  : (process.env.NODE_ENV === 'development'
     ? '/api/'
     : 'https://apk-back.onrender.com/api/');

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
      // On utilise /#/login pour HashRouter (obligatoire pour Capacitor)
      window.location.href = '/#/login';
    }

    // Filet de sécurité global : en cas d'erreur serveur (5xx), le corps de la
    // réponse n'est pas fiable (souvent une page HTML d'erreur, pas du JSON).
    // On le remplace ici par un message générique structuré, afin qu'AUCUN
    // composant (même ceux qui n'utilisent pas crudService, ex: Login/Register)
    // ne puisse jamais afficher du HTML brut à l'utilisateur.
    if (error.response && error.response.status >= 500) {
      const isHtmlOrNonJson =
        typeof error.response.data === 'string' ||
        !error.response.data ||
        typeof error.response.data !== 'object';
      if (isHtmlOrNonJson) {
        error.response.data = {
          detail: 'Le serveur a rencontré un problème. Merci de réessayer dans quelques instants.',
        };
      }
    }

    return Promise.reject(error);
  }
);

export default api;