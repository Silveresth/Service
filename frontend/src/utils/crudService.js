import api from '../api/axios';

/**
 * Service CRUD générique pour gérer les opérations Create, Read, Update, Delete
 */
function getErrorMessage(error) {
  if (typeof error === 'string') return error;
  if (error?.detail) return error.detail;
  if (error?.error) {
    if (typeof error.error === 'string') return error.error;
    return error.error.message || error.error.non_field_errors?.[0] || Object.values(error.error)[0] || 'Erreur de validation';
  }
  if (error?.message) return error.message;
  if (error?.non_field_errors?.[0]) return error.non_field_errors[0];
  const firstValue = Object.values(error || {})[0];
  return typeof firstValue === 'string' ? firstValue : 'Une erreur est survenue';
}

export const crudService = {
  /**
   * Récupérer tous les éléments avec filtres optionnels
   */
  async list(endpoint, params = {}) {
    try {
      const response = await api.get(`/${endpoint}/`, { params });
      return { success: true, data: response.data, status: response.status };
    } catch (error) {
      return {
        success: false,
        error: getErrorMessage(error.response?.data || error),
        status: error.response?.status,
      };
    }
  },

  /**
   * Récupérer un élément par ID
   */
  async get(endpoint, id) {
    try {
      const response = await api.get(`/${endpoint}/${id}/`);
      return { success: true, data: response.data, status: response.status };
    } catch (error) {
      return {
        success: false,
        error: getErrorMessage(error.response?.data || error),
        status: error.response?.status,
      };
    }
  },

  /**
   * Créer un nouvel élément
   */
  async create(endpoint, data) {
    try {
      const response = await api.post(`/${endpoint}/`, data);
      return { success: true, data: response.data, status: response.status };
    } catch (error) {
      return {
        success: false,
        error: getErrorMessage(error.response?.data || error),
        status: error.response?.status,
      };
    }
  },

  /**
   * Mettre à jour un élément
   */
  async update(endpoint, id, data) {
    try {
      const response = await api.patch(`/${endpoint}/${id}/`, data);
      return { success: true, data: response.data, status: response.status };
    } catch (error) {
      return {
        success: false,
        error: getErrorMessage(error.response?.data || error),
        status: error.response?.status,
      };
    }
  },

  /**
   * Remplacer complètement un élément
   */
  async put(endpoint, id, data) {
    try {
      const response = await api.put(`/${endpoint}/${id}/`, data);
      return { success: true, data: response.data, status: response.status };
    } catch (error) {
      return {
        success: false,
        error: getErrorMessage(error.response?.data || error),
        status: error.response?.status,
      };
    }
  },

  /**
   * Supprimer un élément
   */
  async delete(endpoint, id) {
    try {
      const response = await api.delete(`/${endpoint}/${id}/`);
      return { success: true, data: response.data, status: response.status };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || error.message,
        status: error.response?.status,
      };
    }
  },

  /**
   * Appeler une action personnalisée
   */
  async action(endpoint, id, action, method = 'post', data = null) {
    try {
      const url = id ? `/${endpoint}/${id}/${action}/` : `/${endpoint}/${action}/`;
      const response = await api[method](url, data);
      return { success: true, data: response.data, status: response.status };
    } catch (error) {
      return {
        success: false,
        error: getErrorMessage(error.response?.data || error),
        status: error.response?.status,
      };
    }
  },
};

export default crudService;
