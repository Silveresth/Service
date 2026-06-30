import { useEffect, useRef, useState } from 'react';
import api from '../api/axios';

const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID;

/**
 * Bouton "Se connecter avec Google".
 *
 * Utilise le script Google Identity Services (chargé dans public/index.html),
 * donc aucune dépendance npm supplémentaire n'est nécessaire.
 *
 * Flux :
 * 1. L'utilisateur clique sur le bouton officiel rendu par Google.
 * 2. Google renvoie un "credential" (id_token) au callback.
 * 3. On envoie ce token à notre backend (POST /api/auth/google/).
 * 4. Le backend vérifie le token, crée/retrouve le compte, et renvoie
 *    {access, refresh, user} — exactement comme le login classique.
 *
 * Props :
 * - onSuccess(data) : appelé avec la réponse backend en cas de succès
 * - onError(message) : appelé avec un message d'erreur en cas d'échec
 * - typeCompte : 'client' | 'prestataire' (utilisé seulement à la création du compte)
 */
export default function GoogleLoginButton({ onSuccess, onError, typeCompte = 'client' }) {
  const buttonRef = useRef(null);
  const [scriptReady, setScriptReady] = useState(false);

  useEffect(() => {
    // Le script est chargé en async dans index.html, on attend qu'il soit prêt.
    let attempts = 0;
    const interval = setInterval(() => {
      attempts += 1;
      if (window.google?.accounts?.id) {
        setScriptReady(true);
        clearInterval(interval);
      } else if (attempts > 40) {
        // ~10s max d'attente
        clearInterval(interval);
        onError?.("Impossible de charger le service de connexion Google. Vérifiez votre connexion.");
      }
    }, 250);
    return () => clearInterval(interval);
  }, [onError]);

  useEffect(() => {
    if (!scriptReady) return;

    if (!GOOGLE_CLIENT_ID || GOOGLE_CLIENT_ID.includes('REMPLACE_PAR_TON_CLIENT_ID')) {
      onError?.("La connexion Google n'est pas configurée (Client ID manquant).");
      return;
    }

    const handleCredentialResponse = async (response) => {
      try {
        const res = await api.post('/auth/google/', {
          id_token: response.credential,
          type_compte: typeCompte,
        });
        onSuccess?.(res.data);
      } catch (err) {
        const status = err.response?.status;
        const data = err.response?.data;
        if (!status || status >= 500) {
          onError?.('Le serveur a rencontré un problème. Merci de réessayer dans quelques instants.');
          return;
        }
        const msg = (data && typeof data === 'object' && data.error) || 'Connexion Google impossible.';
        onError?.(msg);
      }
    };

    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: handleCredentialResponse,
    });

    if (buttonRef.current) {
      window.google.accounts.id.renderButton(buttonRef.current, {
        theme: 'outline',
        size: 'large',
        width: 320,
        text: 'continue_with',
        locale: 'fr',
      });
    }
  }, [scriptReady, onSuccess, onError, typeCompte]);

  return <div ref={buttonRef} style={{ display: 'flex', justifyContent: 'center' }} />;
}
