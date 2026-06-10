import { useState, useCallback } from 'react';
import { smartMatchRequest } from '../utils/smartMatchApi';

export default function useSmartMatch() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const runMatch = useCallback(async (payload) => {
    setLoading(true);
    setError('');
    try {
      const data = await smartMatchRequest(payload);
      const top_matches = data?.top_matches || [];
      return { matches: top_matches, raw: data };
    } catch (e) {
      const msg =
        e?.response?.data?.message ||
        e?.response?.data?.detail ||
        e?.response?.status
          ? `Erreur ${e.response.status}: ${e?.response?.data?.message || e?.message || 'Requête smart-match échouée'}`
          : e?.message ||
        'Erreur réseau. Réessayez.';

      // Ajout debug utile pour diagnostiquer l’erreur (voir console)
      console.error('[smartmatch] request failed:', {
        message: msg,
        responseData: e?.response?.data,
        responseStatus: e?.response?.status,
      });

      setError(msg);
      return { matches: [], raw: null, debug: e?.response?.data || null };
    } finally {
      setLoading(false);
    }
  }, []);

  return { runMatch, loading, error };
}

