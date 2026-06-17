import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Geolocation } from '@capacitor/geolocation';

const DEFAULT_CENTER = { lat: 6.125580, lng: 1.232456 };

function parseCoord(v) {
  const n = typeof v === 'string' ? parseFloat(v) : v;
  return Number.isFinite(n) ? n : null;
}

function ensureScript(src, id) {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') return reject(new Error('window is undefined'));
    if (id) {
      const existing = document.getElementById(id);
      if (existing && existing.dataset.loaded === 'true') return resolve();
    }
    const existingBySrc = src ? document.querySelector(`script[src="${src}"]`) : null;
    if (existingBySrc && existingBySrc.dataset.loaded === 'true') return resolve();
    const s = document.createElement('script');
    if (id) s.id = id;
    if (src) s.src = src;
    s.async = true; s.defer = true;
    s.onload = () => { s.dataset.loaded = 'true'; resolve(); };
    s.onerror = () => reject(new Error(`Failed to load script: ${src || id}`));
    document.head.appendChild(s);
  });
}

function ensureStyle(href, id) {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') return reject(new Error('window is undefined'));
    if (id) { const existing = document.getElementById(id); if (existing) return resolve(); }
    const existingByHref = href ? document.querySelector(`link[href="${href}"]`) : null;
    if (existingByHref) return resolve();
    const l = document.createElement('link');
    if (id) l.id = id; l.rel = 'stylesheet'; l.href = href;
    l.onload = () => resolve();
    l.onerror = () => reject(new Error(`Failed to load css: ${href || id}`));
    document.head.appendChild(l);
  });
}

export default function LeafletGPSInterne({ atelier, onClose }) {
  const [leafletErr, setLeafletErr] = useState('');
  const [navStarted, setNavStarted] = useState(false);
  const [routeSummary, setRouteSummary] = useState(null);
  const [mapReady, setMapReady] = useState(false);

  const mapRef = useRef(null);
  const containerRef = useRef(null);
  const leafletRoutingRef = useRef(null);
  const watchIdRef = useRef(null);
  const destMarkerRef = useRef(null);

  const dest = useMemo(() => {
    const lat = parseCoord(atelier?.latitude);
    const lng = parseCoord(atelier?.longitude);
    return lat !== null && lng !== null ? { lat, lng } : null;
  }, [atelier?.latitude, atelier?.longitude]);

  const center = useMemo(() => dest || DEFAULT_CENTER, [dest]);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLeafletErr('');
      try {
        await ensureStyle('https://unpkg.com/leaflet@1.9.4/dist/leaflet.css', 'leaflet-css-v1');
        await ensureStyle('https://unpkg.com/leaflet-routing-machine@3.2.12/dist/leaflet-routing-machine.css', 'lrm-css-v1');
        await ensureScript('https://unpkg.com/leaflet@1.9.4/dist/leaflet.js', 'leaflet-js-v1');
        await ensureScript('https://unpkg.com/leaflet-routing-machine@3.2.12/dist/leaflet-routing-machine.js', 'lrm-js-v1');
        if (cancelled) return;
        if (!window.L?.map) { setLeafletErr('Leaflet introuvable.'); return; }
        if (!containerRef.current) return;
        if (!mapRef.current) {
          const map = window.L.map(containerRef.current).setView([center.lat, center.lng], 14);
          window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
          }).addTo(map);

          // Marqueur destination stylé
          if (dest) {
            const destIcon = window.L.divIcon({
              html: `<div style="background:#0284c7;width:36px;height:36px;border-radius:50%;border:3px solid white;box-shadow:0 4px 12px rgba(2,132,199,0.45);display:flex;align-items:center;justify-content:center">
                <svg width="16" height="16" fill="white" viewBox="0 0 16 16"><path d="M8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10zm0-7a3 3 0 1 1 0-6 3 3 0 0 1 0 6z"/></svg>
              </div>`,
              iconSize: [36, 36], iconAnchor: [18, 36], className: ''
            });
            destMarkerRef.current = window.L.marker([dest.lat, dest.lng], { icon: destIcon })
              .addTo(map)
              .bindPopup(`<strong style="color:#0c2340">${atelier?.nom}</strong><br><small>${atelier?.adresse || ''}</small>`)
              .openPopup();
          }

          mapRef.current = map;
          setMapReady(true);
        }
      } catch (e) {
        console.error(e);
        if (!cancelled) setLeafletErr('Erreur de chargement de la carte');
      }
    };
    load();
    return () => { cancelled = true; };
  }, [center.lat, center.lng]);

  const startNavigation = async () => {
    if (!dest) { setLeafletErr('Coordonnées de destination invalides.'); return; }
    if (!mapRef.current) { setLeafletErr('Carte non prête, attendez un instant.'); return; }
    setLeafletErr('');
    setNavStarted(true);

    try {
      const waitId = await Geolocation.watchPosition(
        { enableHighAccuracy: true, timeout: 15000 },
        (pos, err) => {
          if (err) {
            console.error('GPS Watch Error:', err);
            let msg = 'Erreur GPS inconnue';
            if (err.code === 1) msg = 'Permission GPS refusée. Activez la géolocalisation.';
            else if (err.code === 2) msg = 'Position indisponible. GPS activé ?';
            else if (err.code === 3) msg = 'Délai dépassé. Placez-vous à l\'air libre.';
            setLeafletErr(msg);
            return;
          }
          if (!pos) return;

          const user = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          try {
            if (leafletRoutingRef.current) { leafletRoutingRef.current.remove(); leafletRoutingRef.current = null; }
            leafletRoutingRef.current = window.L.Routing.control({
              waypoints: [window.L.latLng(user.lat, user.lng), window.L.latLng(dest.lat, dest.lng)],
              router: window.L.Routing.osrmv1({ serviceUrl: 'https://router.project-osrm.org/route/v1' }),
              lineOptions: { styles: [{ color: '#0284c7', opacity: 0.9, weight: 5 }] },
              addWaypoints: false,
              draggableWaypoints: false,
              show: false,
              createMarker: () => null,
            }).addTo(mapRef.current);

            leafletRoutingRef.current.on('routesfound', (e) => {
              const route = e?.routes?.[0];
              if (!route) return;
              setRouteSummary({
                distanceKm: route?.summary?.totalDistance ? route.summary.totalDistance / 1000 : null,
                durationMin: route?.summary?.totalTime ? route.summary.totalTime / 60 : null,
              });
            });
          } catch (err) {
            console.error(err);
            setLeafletErr('Erreur de calcul d\'itinéraire.');
          }
          mapRef.current.setView([user.lat, user.lng], 14);
        }
      );
      watchIdRef.current = waitId;
    } catch (e) {
      console.warn('Capacitor watchPosition failed, fallback to Web API:', e);
      // Fallback
      if (navigator.geolocation) {
        watchIdRef.current = navigator.geolocation.watchPosition(
          (pos) => {
            const user = { lat: pos.coords.latitude, lng: pos.coords.longitude };
            // ... (logique identique)
            mapRef.current.setView([user.lat, user.lng], 14);
          },
          (err) => { setLeafletErr(err.message); },
          { enableHighAccuracy: true, timeout: 15000 }
        );
      }
    }
  };

  const stopNavigation = () => {
    if (watchIdRef.current) {
      if (typeof watchIdRef.current === 'string') {
        Geolocation.clearWatch({ id: watchIdRef.current });
      } else {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    }
    setNavStarted(false);
    setRouteSummary(null);
    setLeafletErr('');
    if (leafletRoutingRef.current) {
      try { leafletRoutingRef.current.remove(); } catch (_) {}
      leafletRoutingRef.current = null;
    }
  };

  useEffect(() => {
    return () => { 
      if (watchIdRef.current) {
        if (typeof watchIdRef.current === 'string') Geolocation.clearWatch({ id: watchIdRef.current });
        else navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'rgba(12,35,64,0.75)',
      backdropFilter: 'blur(4px)',
      zIndex: 9999, display: 'flex',
      alignItems: 'center', justifyContent: 'center',
      padding: 16,
    }}>
      <div style={{
        background: 'white',
        borderRadius: 20,
        width: 'min(96vw, 720px)',
        maxHeight: '90vh',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 24px 64px rgba(0,0,0,0.35)',
      }}>

        {/* ── Header ── */}
        <div style={{
          background: 'linear-gradient(135deg, #0c2340 0%, #0284c7 100%)',
          padding: '16px 20px',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
        }}>
          <div style={{
            width: 42, height: 42, borderRadius: 12,
            background: 'rgba(255,255,255,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            <i className="bi bi-compass-fill" style={{ fontSize: '1.3rem' }} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 700, fontSize: '1rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {atelier?.nom}
            </div>
            <div style={{ fontSize: '0.78rem', opacity: 0.8, display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
              <i className="bi bi-geo-alt" />
              <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{atelier?.adresse}</span>
            </div>
          </div>
          <button onClick={onClose} style={{
            background: 'rgba(255,255,255,0.15)',
            border: '1.5px solid rgba(255,255,255,0.25)',
            color: 'white', borderRadius: 10,
            width: 36, height: 36,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', flexShrink: 0,
            transition: 'background 0.15s',
          }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.25)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
          >
            <i className="bi bi-x-lg" style={{ fontSize: '0.95rem' }} />
          </button>
        </div>

        {/* ── Stats de navigation (inline, pas en overlay) ── */}
        {navStarted && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            borderBottom: '1px solid #e2e8f0',
          }}>
            {[
              {
                icon: 'bi-arrows-expand',
                label: 'Distance',
                val: routeSummary?.distanceKm != null ? `${routeSummary.distanceKm.toFixed(1)} km` : '…',
                color: '#0284c7',
                bg: '#f0f9ff',
              },
              {
                icon: 'bi-clock',
                label: 'Durée estimée',
                val: routeSummary?.durationMin != null ? `${Math.round(routeSummary.durationMin)} min` : '…',
                color: '#7c3aed',
                bg: '#faf5ff',
              },
            ].map((item, i) => (
              <div key={i} style={{
                padding: '12px 16px',
                background: item.bg,
                borderRight: i === 0 ? '1px solid #e2e8f0' : 'none',
                display: 'flex', alignItems: 'center', gap: 12,
              }}>
                <div style={{
                  width: 38, height: 38, borderRadius: 10,
                  background: item.color + '18',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <i className={item.icon} style={{ fontSize: '1.1rem', color: item.color }} />
                </div>
                <div>
                  <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0c2340', lineHeight: 1.1 }}>{item.val}</div>
                  <div style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 600, marginTop: 2 }}>{item.label}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Carte ── */}
        <div style={{ position: 'relative', flex: 1 }}>
          {!mapReady && (
            <div style={{
              position: 'absolute', inset: 0,
              background: '#f8fafc',
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              gap: 12, zIndex: 1,
            }}>
              <div style={{
                width: 44, height: 44, borderRadius: '50%',
                border: '3px solid #e2e8f0',
                borderTopColor: '#0284c7',
                animation: 'spin 0.8s linear infinite',
              }} />
              <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Chargement de la carte…</span>
              <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
            </div>
          )}
          <div ref={containerRef} style={{ height: 300 }} />
        </div>

        {/* ── Bas : erreur + actions ── */}
        <div style={{ padding: '14px 16px', borderTop: '1px solid #e2e8f0', background: '#fafafa' }}>
          {leafletErr && (
            <div style={{
              marginBottom: 10, padding: '9px 12px',
              background: '#fff1f2', border: '1px solid #fecdd3',
              borderRadius: 10, fontSize: '0.82rem', color: '#be123c',
              display: 'flex', alignItems: 'center', gap: 8,
            }}>
              <i className="bi bi-exclamation-circle-fill" style={{ flexShrink: 0 }} />
              {leafletErr}
            </div>
          )}

          <div style={{ display: 'flex', gap: 8 }}>
            {/* Bouton GPS principal */}
            {!navStarted ? (
              <button onClick={startNavigation} style={{
                flex: 1, padding: '11px 16px',
                background: 'linear-gradient(135deg, #0284c7, #0369a1)',
                color: 'white', border: 'none', borderRadius: 12,
                fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                boxShadow: '0 4px 12px rgba(2,132,199,0.3)',
                transition: 'transform 0.15s, box-shadow 0.15s',
              }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 16px rgba(2,132,199,0.4)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 4px 12px rgba(2,132,199,0.3)'; }}
              >
                <i className="bi bi-compass-fill" />
                Démarrer la navigation
              </button>
            ) : (
              <button onClick={stopNavigation} style={{
                flex: 1, padding: '11px 16px',
                background: '#f1f5f9',
                color: '#475569', border: '1.5px solid #e2e8f0',
                borderRadius: 12, fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                transition: 'background 0.15s',
              }}
                onMouseEnter={e => e.currentTarget.style.background = '#e2e8f0'}
                onMouseLeave={e => e.currentTarget.style.background = '#f1f5f9'}
              >
                <i className="bi bi-stop-circle-fill" style={{ color: '#ef4444' }} />
                Arrêter le GPS
              </button>
            )}

            {/* Appel */}
            <a href={`tel:${atelier?.telephone}`} style={{
              width: 46, height: 46, borderRadius: 12, flexShrink: 0,
              background: '#f0fdf4', border: '1.5px solid #bbf7d0',
              color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.1rem', textDecoration: 'none', transition: 'background 0.15s',
            }}
              title="Appeler"
              onMouseEnter={e => e.currentTarget.style.background = '#dcfce7'}
              onMouseLeave={e => e.currentTarget.style.background = '#f0fdf4'}
            >
              <i className="bi bi-telephone-fill" />
            </a>

            {/* WhatsApp */}
            <a href={`https://wa.me/228${atelier?.telephone}`} target="_blank" rel="noreferrer" style={{
              width: 46, height: 46, borderRadius: 12, flexShrink: 0,
              background: '#25D366', border: 'none',
              color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.1rem', textDecoration: 'none', transition: 'background 0.15s',
            }}
              title="WhatsApp"
              onMouseEnter={e => e.currentTarget.style.background = '#1da851'}
              onMouseLeave={e => e.currentTarget.style.background = '#25D366'}
            >
              <i className="bi bi-whatsapp" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}