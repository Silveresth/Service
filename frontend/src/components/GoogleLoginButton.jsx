import { useEffect, useRef, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { GoogleAuth } from '@codetrix-studio/capacitor-google-auth';
import api from '../api/axios';

const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID;

/**
 * Bouton "Se connecter avec Google".
 *
 * Gère le flux Web classique via Google Identity Services
 * ET le flux Mobile natif via le plugin Capacitor Google Auth.
 */
export default function GoogleLoginButton({ onSuccess, onError, typeCompte = 'client' }) {
  const buttonRef = useRef(null);
  const [scriptReady, setScriptReady] = useState(false);
  const [nativeLoading, setNativeLoading] = useState(false);
  const isNative = Capacitor.isNativePlatform();

  useEffect(() => {
    if (isNative) {
      // Initialise Capacitor Google Auth sur mobile
      try {
        GoogleAuth.initialize({
          clientId: GOOGLE_CLIENT_ID,
          scopes: ['profile', 'email'],
          grantOfflineAccess: true,
        });
      } catch (e) {
        console.warn("GoogleAuth.initialize error:", e);
      }
      return;
    }

    // Le script web est chargé en async dans index.html, on attend qu'il soit prêt.
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
  }, [onError, isNative]);

  useEffect(() => {
    if (isNative || !scriptReady) return;

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
  }, [scriptReady, onSuccess, onError, typeCompte, isNative]);

  const handleNativeGoogleSignIn = async () => {
    setNativeLoading(true);
    onError?.(null);
    try {
      const user = await GoogleAuth.signIn();
      const idToken = user?.authentication?.idToken || user?.idToken;
      if (!idToken) {
        onError?.("Impossible de récupérer le token Google.");
        setNativeLoading(false);
        return;
      }
      
      const res = await api.post('/auth/google/', {
        id_token: idToken,
        type_compte: typeCompte,
      });
      onSuccess?.(res.data);
    } catch (err) {
      console.error("Native Google login error:", err);
      if (err.message?.includes('cancel') || err.message?.includes('user cancelled') || err.message?.includes('12501')) {
        setNativeLoading(false);
        return;
      }
      const msg = err.response?.data?.error || 'La connexion Google a échoué.';
      onError?.(msg);
    } finally {
      setNativeLoading(false);
    }
  };

  if (isNative) {
    return (
      <button
        onClick={handleNativeGoogleSignIn}
        disabled={nativeLoading}
        style={{
          width: '100%',
          maxWidth: 320,
          height: 44,
          borderRadius: 20,
          border: '1.5px solid rgba(255,255,255,0.08)',
          background: 'rgba(255,255,255,0.04)',
          color: 'white',
          fontWeight: 700,
          fontSize: '0.88rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 10,
          cursor: 'pointer',
          fontFamily: 'inherit',
          transition: 'all 0.2s',
          margin: '0 auto',
        }}
        onMouseOver={e => {
          e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
          e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)';
        }}
        onMouseOut={e => {
          e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
          e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
        }}
      >
        <svg width="18" height="18" viewBox="0 0 18 18" style={{ flexShrink: 0 }}>
          <path
            fill="#4285F4"
            d="M17.64 9.2c0-.63-.06-1.25-.16-1.84H9v3.47h4.84a4.14 4.14 0 0 1-1.8 2.71v2.26h2.91c1.7-1.56 2.69-3.86 2.69-6.6z"
          />
          <path
            fill="#34A853"
            d="M9 18c2.43 0 4.47-.8 5.96-2.2l-2.91-2.26c-.8.54-1.83.86-3.05.86-2.34 0-4.32-1.58-5.03-3.7H1.02v2.33A9 9 0 0 0 9 18z"
          />
          <path
            fill="#FBBC05"
            d="M3.97 10.7a5.4 5.4 0 0 1 0-3.4V4.97H1.02a9 9 0 0 0 0 8.06l2.95-2.33z"
          />
          <path
            fill="#EA4335"
            d="M9 3.58c1.32 0 2.5.45 3.44 1.35L15 2.1A9 9 0 0 0 1.02 4.97l2.95 2.33c.7-2.12 2.69-3.72 5.03-3.72z"
          />
        </svg>
        {nativeLoading ? "Connexion..." : "Se connecter avec Google"}
      </button>
    );
  }

  return <div ref={buttonRef} style={{ display: 'flex', justifyContent: 'center' }} />;
}
