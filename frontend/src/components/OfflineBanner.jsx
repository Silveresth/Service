import { usePWA } from '../hooks/usePWA';

export default function OfflineBanner() {
  const { isOffline } = usePWA();
  if (!isOffline) return null;
  return (
    <div style={{
      position: 'fixed', bottom: 16, left: '50%', transform: 'translateX(-50%)',
      background: '#0c2340', color: '#fff', borderRadius: 12,
      padding: '10px 20px', zIndex: 9999,
      display: 'flex', alignItems: 'center', gap: 10,
      boxShadow: '0 4px 20px rgba(0,0,0,.3)', fontSize: '.88rem', fontWeight: 600,
      maxWidth: '90vw', whiteSpace: 'nowrap'
    }}>
      <span>📶</span>
      Mode hors-ligne — Contenu en cache disponible
    </div>
  );
}
