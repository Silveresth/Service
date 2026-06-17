import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Geolocation } from '@capacitor/geolocation';

// Google Maps (marker + polyline) GPS “simple” (sans Driving Directions API)
// - démarre via geolocation
// - trace une ligne entre position user et destination
// - calcule distance + bearing pour l’UI

const DEFAULT_CENTER = { lat: 6.125580, lng: 1.232456 };

function haversine(lat1, lng1, lat2, lng2) {
  const R = 6371000;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function calcBearing(lat1, lng1, lat2, lng2) {
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const y = Math.sin(dLng) * Math.cos(lat2 * Math.PI / 180);
  const x = Math.cos(lat1 * Math.PI / 180) * Math.sin(lat2 * Math.PI / 180) - Math.sin(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.cos(dLng);
  let b = Math.atan2(y, x) * 180 / Math.PI;
  return (b + 360) % 360;
}

function directionLabel(b) {
  if (b < 22.5 || b >= 337.5) return 'Nord ↑';
  if (b < 67.5) return 'Nord-Est ↗';
  if (b < 112.5) return 'Est →';
  if (b < 157.5) return 'Sud-Est ↘';
  if (b < 202.5) return 'Sud ↓';
  if (b < 247.5) return 'Sud-Ouest ↙';
  if (b < 292.5) return 'Ouest ←';
  return 'Nord-Ouest ↖';
}

function formatDist(m) {
  if (m < 1000) return `${Math.round(m)} m`;
  return `${(m / 1000).toFixed(1)} km`;
}

let googleMapsScriptPromise = null;

function ensureScript(src) {
  // Singleton: évite de charger l’API plusieurs fois quand la modale s’ouvre/ferme.
  if (googleMapsScriptPromise) return googleMapsScriptPromise;

  googleMapsScriptPromise = new Promise((resolve, reject) => {
    if (typeof window === 'undefined') return reject(new Error('window is undefined'));

    const existing = document.querySelector(`script[src="${src}"]`);
    if (existing && existing.dataset.loaded === 'true') {
      resolve();
      return;
    }

    if (existing) {
      existing.addEventListener('load', () => resolve());
      existing.addEventListener('error', () => reject(new Error('Failed loading Google Maps script')));
      return;
    }

    const s = document.createElement('script');
    s.src = src;
    s.async = true;
    s.defer = true;
    s.onload = () => {
      s.dataset.loaded = 'true';
      resolve();
    };
    s.onerror = () => {
      googleMapsScriptPromise = null;
      reject(new Error('Failed loading Google Maps script'));
    };
    document.head.appendChild(s);
  });

  return googleMapsScriptPromise;
}


export default function GoogleGPSInterne({ atelier, onClose }) {

  const [navStarted, setNavStarted] = useState(false);
  const [userPos, setUserPos] = useState(null);
  const [distance, setDistance] = useState(null);
  const [bearing, setBearing] = useState(null);
  const [errGps, setErrGps] = useState('');

  const mapRef = useRef(null);
  const containerRef = useRef(null);
  const destMarkerRef = useRef(null);
  const userMarkerRef = useRef(null);
  const routePolylineRef = useRef(null);
  const watchIdRef = useRef(null);

  // Clé : ne pas mettre en dur en prod
  const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY || 'AlzaSyBVTImZxaGl9u5XE4N8AOj5s39u9kCdnqo';


  const destLat = parseFloat(atelier?.latitude);
  const destLng = parseFloat(atelier?.longitude);

  const center = useMemo(() => {
    if (Number.isFinite(destLat) && Number.isFinite(destLng)) return { lat: destLat, lng: destLng };
    return DEFAULT_CENTER;
  }, [destLat, destLng]);

  const arrived = distance !== null && distance < 50;

  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      setErrGps('');
      if (!apiKey) {
        setErrGps('Clé Google Maps manquante: REACT_APP_GOOGLE_MAPS_API_KEY');
        return;
      }

      const src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}&libraries=marker&v=weekly`;
      await ensureScript(src);
      if (cancelled) return;

      if (!window.google?.maps) {
        setErrGps('Google Maps non disponible.');
        return;
      }

      if (!containerRef.current) return;

      mapRef.current = new window.google.maps.Map(containerRef.current, {
        center,
        zoom: 14,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
      });

      // Dest marker
      const destIcon = {
        path: window.google.maps.SymbolPath.CIRCLE,
        fillColor: '#ef4444',
        fillOpacity: 1,
        strokeColor: 'white',
        strokeWeight: 3,
        scale: 10,
      };

      destMarkerRef.current = new window.google.maps.Marker({
        position: center,
        map: mapRef.current,
        icon: destIcon,
        title: atelier?.nom,
      });

      // petite info
      if (atelier?.adresse || atelier?.nom) {
        const info = new window.google.maps.InfoWindow({
          content: `<div style="font-family:sans-serif;max-width:240px"><div style="font-weight:700;color:#0c2340;font-size:14px;margin-bottom:4px">${atelier?.nom || ''}</div><div style="color:#64748b;font-size:12px">${atelier?.adresse || ''}</div></div>`,
        });
        destMarkerRef.current.addListener('click', () => info.open({ map: mapRef.current, anchor: destMarkerRef.current }));
      }

      // UI init
      mapRef.current.setCenter(center);
    };

    init().catch((e) => {
      console.error(e);
      if (!cancelled) setErrGps('Erreur chargement Google Maps');
    });

    return () => {
      cancelled = true;
    };
  }, [apiKey, center, atelier?.nom, atelier?.adresse]);

  const startNavigation = async () => {
    if (!Number.isFinite(destLat) || !Number.isFinite(destLng)) {
      setErrGps('Destination GPS invalide.');
      return;
    }

    setNavStarted(true);
    setErrGps('');

    try {
      const waitId = await Geolocation.watchPosition(
        { enableHighAccuracy: true, timeout: 15000 },
        (pos, err) => {
          if (err) {
            console.error('Google GPS Watch Error:', err);
            setErrGps(err.message);
            return;
          }
          if (!pos) return;

          const { latitude: lat, longitude: lng } = pos.coords;
          setUserPos({ lat, lng });

          const dist = haversine(lat, lng, destLat, destLng);
          const b = calcBearing(lat, lng, destLat, destLng);
          setDistance(dist);
          setBearing(b);

          if (!mapRef.current) return;

          // user marker
          const userIcon = {
            path: window.google.maps.SymbolPath.CIRCLE,
            fillColor: '#0284c7',
            fillOpacity: 1,
            strokeColor: 'white',
            strokeWeight: 3,
            scale: 7,
          };

          if (userMarkerRef.current) {
            userMarkerRef.current.setPosition({ lat, lng });
          } else {
            userMarkerRef.current = new window.google.maps.Marker({
              position: { lat, lng },
              map: mapRef.current,
              icon: userIcon,
              title: 'Vous êtes ici',
            });
          }

          // polyline
          if (routePolylineRef.current) routePolylineRef.current.setMap(null);
          routePolylineRef.current = new window.google.maps.Polyline({
            path: [
              { lat, lng },
              { lat: destLat, lng: destLng },
            ],
            strokeColor: '#0284c7',
            strokeOpacity: 0.7,
            strokeWeight: 4,
            geodesic: true,
          });
          routePolylineRef.current.setMap(mapRef.current);

          // fit bounds
          const bounds = new window.google.maps.LatLngBounds();
          bounds.extend({ lat, lng });
          bounds.extend({ lat: destLat, lng: destLng });
          mapRef.current.fitBounds(bounds, 40);
        }
      );
      watchIdRef.current = waitId;
    } catch (e) {
      console.warn('Capacitor Google GPS Watch failed, fallback to Web API:', e);
      // Fallback
      if (navigator.geolocation) {
        watchIdRef.current = navigator.geolocation.watchPosition(
          (pos) => {
             // ... logic userPos, distance, bearing, markers ...
             const { latitude: lat, longitude: lng } = pos.coords;
             setUserPos({ lat, lng });
             if (mapRef.current) mapRef.current.setCenter({ lat, lng });
          },
          (err) => { setErrGps(err.message); },
          { enableHighAccuracy: true, timeout: 15000 }
        );
      }
    }
  };

  const stopNavigation = () => {
    if (watchIdRef.current) {
      if (typeof watchIdRef.current === 'string') Geolocation.clearWatch({ id: watchIdRef.current });
      else navigator.geolocation.clearWatch(watchIdRef.current);
    }

    setNavStarted(false);
    setUserPos(null);
    setDistance(null);
    setBearing(null);
    setErrGps('');

    if (userMarkerRef.current) userMarkerRef.current.setMap(null);
    if (routePolylineRef.current) routePolylineRef.current.setMap(null);

    userMarkerRef.current = null;
    routePolylineRef.current = null;
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
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.7)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div style={{ background: 'white', borderRadius: 16, width: 'min(94vw,760px)', maxHeight: '92vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <div style={{ background: 'var(--primary-color)', padding: '14px 20px', color: 'white', display: 'flex', alignItems: 'center', gap: 12 }}>
          <i className="bi bi-compass" style={{ fontSize: '1.4rem' }}></i>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: '1rem' }}>GPS – {atelier?.nom}</div>
            <div style={{ fontSize: '0.8rem', opacity: 0.85 }}>{atelier?.adresse}</div>
          </div>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', borderRadius: 8, padding: '6px 12px', cursor: 'pointer', fontWeight: 600 }}>
            <i className="bi bi-x-lg"></i>
          </button>
        </div>

        {/* Infos navigation */}
        {navStarted && (
          <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid #e2e8f0' }}>
            {[
              { icon: 'bi-geo-arrow', label: 'Distance', val: distance !== null ? formatDist(distance) : '…' },
              { icon: 'bi-compass', label: 'Direction', val: bearing !== null ? directionLabel(bearing) : '…' },
              { icon: 'bi-person-walking', label: 'Statut', val: arrived ? '✓ Arrivé !' : 'En route' },
            ].map((item, i) => (
              <div key={i} style={{ flex: 1, textAlign: 'center', padding: '12px 8px', background: i === 2 && arrived ? '#f0fdf4' : 'white', borderRight: i < 2 ? '1px solid #e2e8f0' : 'none' }}>
                <i className={item.icon} style={{ fontSize: '1.2rem', color: i === 2 && arrived ? '#22c55e' : 'var(--primary-color)', display: 'block', marginBottom: 4 }}></i>
                <div style={{ fontSize: '0.95rem', fontWeight: 700, color: i === 2 && arrived ? '#166534' : '#0c2340' }}>{item.val}</div>
                <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{item.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Carte */}
        <div ref={containerRef} style={{ flex: 1, minHeight: 320 }} />

        {/* Contrôles */}
        <div style={{ padding: '14px 20px', borderTop: '1px solid #e2e8f0', display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {errGps && (
            <div style={{ width: '100%', fontSize: '0.85rem', color: '#ef4444', marginBottom: 6 }}>
              <i className="bi bi-exclamation-triangle me-1"></i>
              {errGps}
            </div>
          )}

          {!navStarted ? (
            <button onClick={startNavigation} className="btn-primary-custom" style={{ flex: 1, justifyContent: 'center', padding: '12px' }}>
              <i className="bi bi-compass me-2"></i>Démarrer la navigation GPS
            </button>
          ) : (
            <button onClick={stopNavigation} className="btn-secondary-custom" style={{ flex: 1, justifyContent: 'center', padding: '12px' }}>
              <i className="bi bi-stop-circle me-2"></i>Arrêter le GPS
            </button>
          )}

          <a href={`tel:${atelier?.telephone}`} className="btn-outline-primary-custom" style={{ justifyContent: 'center', padding: '12px 16px', borderColor: '#22c55e', color: '#22c55e' }}>
            <i className="bi bi-telephone"></i>
          </a>
          <a href={`https://wa.me/228${atelier?.telephone}`} target="_blank" rel="noreferrer" className="btn-whatsapp" style={{ padding: '12px 16px' }}>
            <i className="bi bi-whatsapp"></i>
          </a>
        </div>
      </div>
    </div>
  );
}

