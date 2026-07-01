import api from '../api/axios';

export async function smartMatchRequest(payload) {
  // Utilisation de l'instance axios 'api' partagée qui injecte le token et gère les erreurs
  const res = await api.post('/smart-match/match/', payload);
  return res.data;
}

