import { useEffect, useState } from 'react';

const SPLASH_CSS = `
@keyframes splashFadeIn {
  from { opacity: 0; }
  to   { opacity: 1; }
}
@keyframes splashZoomIn {
  from { transform: scale(0.6); opacity: 0; }
  to   { transform: scale(1);   opacity: 1; }
}
@keyframes splashPulse {
  0%, 100% { transform: scale(1); }
  50%      { transform: scale(1.08); }
}
`;

export default function SplashScreen({ onFinish }) {
  const [phase, setPhase] = useState('enter');

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('loading'), 400);
    const t2 = setTimeout(() => setPhase('exit'), 1600);
    const t3 = setTimeout(() => onFinish(), 2000);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [onFinish]);

  return (
    <>
      <style>{SPLASH_CSS}</style>
      <div style={{
        position: 'fixed', inset: 0, zIndex: 100000,
        background: 'linear-gradient(135deg, #0c2340 0%, #0a3d6b 50%, #0284c7 100%)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        transition: 'opacity 0.4s ease',
        opacity: phase === 'exit' ? 0 : 1,
      }}>
        <div style={{
          width: 100, height: 100, borderRadius: 24,
          background: 'rgba(255,255,255,0.12)',
          border: '2px solid rgba(255,255,255,0.25)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          animation: phase === 'enter' ? 'splashZoomIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)' : 'splashPulse 1.5s infinite',
          marginBottom: 28,
          backdropFilter: 'blur(8px)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
        }}>
          <img src="/SM.jpg" alt="SM" style={{ width: 64, height: 64, borderRadius: 16, objectFit: 'cover' }} />
        </div>

        <h1 style={{
          color: '#fff', fontWeight: 900, fontSize: '1.4rem',
          margin: '0 0 4px', letterSpacing: '-0.02em',
          fontFamily: "'Plus Jakarta Sans', sans-serif",
        }}>
          Service Market
        </h1>
        <p style={{
          color: 'rgba(255,255,255,0.6)', fontSize: '0.82rem',
          margin: '0 0 40px', fontWeight: 500,
        }}>
          Trouvez le meilleur prestataire
        </p>

        <div style={{
          width: 160, height: 3, borderRadius: 3,
          background: 'rgba(255,255,255,0.15)',
          overflow: 'hidden',
        }}>
          <div style={{
            height: '100%', borderRadius: 3,
            background: 'linear-gradient(90deg, #7dd3fc, #38bdf8)',
            width: phase === 'loading' ? '100%' : '0%',
            transition: 'width 1.2s cubic-bezier(0.4, 0, 0.2, 1)',
            transitionDelay: phase === 'loading' ? '0.1s' : '0s',
          }} />
        </div>

        <p style={{
          position: 'absolute', bottom: 32,
          color: 'rgba(255,255,255,0.25)', fontSize: '0.7rem',
          letterSpacing: '0.1em',
        }}>
          v2.0.0
        </p>
      </div>
    </>
  );
}
