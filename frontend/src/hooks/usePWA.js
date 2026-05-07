import { useEffect, useState } from 'react';

export function usePWA() {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [swReady, setSwReady] = useState(false);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then(reg => { setSwReady(true); })
        .catch(err => console.warn('[PWA] Erreur SW', err));
    }
    const onOnline  = () => setIsOffline(false);
    const onOffline = () => setIsOffline(true);
    window.addEventListener('online',  onOnline);
    window.addEventListener('offline', onOffline);
    return () => {
      window.removeEventListener('online',  onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, []);

  return { isOffline, swReady };
}
