import api from '../api/axios';

/**
 * Service CRUD générique pour gérer les opérations Create, Read, Update, Delete
 */
const GENERIC_SERVER_ERROR = 'Le serveur a rencontré un problème. Merci de réessayer dans quelques instants.';
const GENERIC_NETWORK_ERROR = 'Impossible de contacter le serveur. Vérifiez votre connexion.';

/**
 * Extrait un message d'erreur affichable à partir de la réponse API.
 * IMPORTANT : ne jamais renvoyer un message non-JSON (HTML, texte brut) tel quel,
 * car en cas d'erreur 500 le serveur renvoie souvent une page HTML d'erreur
 * (ex: "<!doctype html>...Server Error (500)...") qu'il ne faut jamais afficher
 * directement à l'utilisateur.
 */
function getErrorMessage(error, status) {
  // Pas de réponse du serveur du tout (réseau coupé, CORS, timeout définitif)
  if (!status) return GENERIC_NETWORK_ERROR;

  // Erreur serveur (500, 502, 503, 504...) : le corps n'est pas fiable
  // (souvent du HTML), on ne l'utilise jamais comme message.
  if (status >= 500) return GENERIC_SERVER_ERROR;

  // À partir d'ici, status est un 4xx : on peut tenter d'extraire un message utile,
  // mais uniquement si c'est bien un objet JSON structuré (jamais une string brute).
  if (!error || typeof error === 'string') {
    return 'Une erreur est survenue. Vérifiez vos informations.';
  }

  if (error.detail) return error.detail;

  if (error.error) {
    if (typeof error.error === 'string') return error.error;
    return (
      error.error.message ||
      error.error.non_field_errors?.[0] ||
      Object.values(error.error)[0] ||
      'Erreur de validation'
    );
  }

  if (error.message) return error.message;
  if (error.non_field_errors?.[0]) return error.non_field_errors[0];

  const firstValue = Object.values(error)[0];
  if (typeof firstValue === 'string') return firstValue;
  if (Array.isArray(firstValue) && typeof firstValue[0] === 'string') return firstValue[0];

  return 'Une erreur est survenue. Vérifiez vos informations.';
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
        error: getErrorMessage(error.response?.data, error.response?.status),
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
        error: getErrorMessage(error.response?.data, error.response?.status),
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
        error: getErrorMessage(error.response?.data, error.response?.status),
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
        error: getErrorMessage(error.response?.data, error.response?.status),
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
        error: getErrorMessage(error.response?.data, error.response?.status),
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
        error: getErrorMessage(error.response?.data, error.response?.status),
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
        error: getErrorMessage(error.response?.data, error.response?.status),
        status: error.response?.status,
      };
    }
  },
};

export default crudService;
