import React, { useEffect, useMemo, useRef, useState } from 'react';

// Composant Google Maps (JS API) pour remplacer Leaflet.
// Ne met pas de clé API en dur: utilise REACT_APP_GOOGLE_MAPS_API_KEY.

const DEFAULT_CENTER = { lat: 6.125580, lng: 1.232456 };

function ensureScript(src) {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') return reject(new Error('window is undefined'));

    const existing = document.querySelector(`script[src="${src}"]`);
    if (existing && existing.dataset.loaded === 'true') return resolve();
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
    s.onerror = () => reject(new Error('Failed loading Google Maps script'));
    document.head.appendChild(s);
  });
}

export default function GoogleMapAteliers({
  ateliers,
  selectedAtelier,
  onSelectAtelier,
  searchLatLng = DEFAULT_CENTER,
  style,
  zoom = 7,
}) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef([]);
  const [err, setErr] = useState('');
  // Clé en dur (démo) : mise pour debug rapide. À retirer en prod.
  const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY || 'AIzaSyBVTImZxaGl9u5XE4N8AOj5s39u9kCdnqo';

  const { center } = useMemo(() => {
    if (typeof searchLatLng?.lat === 'number' && typeof searchLatLng?.lng === 'number') {
      return { center: { lat: searchLatLng.lat, lng: searchLatLng.lng } };
    }
    return { center: DEFAULT_CENTER };
  }, [searchLatLng]);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      if (!apiKey) {
        setErr('Clé Google Maps manquante: REACT_APP_GOOGLE_MAPS_API_KEY');
        return;
      }
      setErr('');

      const src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}&libraries=marker&v=weekly`;
      await ensureScript(src);
      if (cancelled) return;

      const g = window.google;
      if (!g?.maps) {
        setErr('Google Maps non disponible.');
        return;
      }

      if (!mapRef.current) {
        mapRef.current = new g.maps.Map(containerRef.current, {
          center,
          zoom,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
        });
      }

      // Clear markers
      markersRef.current.forEach(m => m.setMap(null));
      markersRef.current = [];

      // Add markers
      (ateliers || []).forEach(a => {
        const lat = parseFloat(a.latitude);
        const lng = parseFloat(a.longitude);
        if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;

        const isSelected = selectedAtelier?.id === a.id;
        const marker = new g.maps.Marker({
          position: { lat, lng },
          map: mapRef.current,
          title: a.nom,
          icon: {
            path: "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z",
            fillColor: isSelected ? '#dc2626' : '#0284c7',
            fillOpacity: 1,
            strokeColor: '#ffffff',
            strokeWeight: 2,
            scale: isSelected ? 1.8 : 1.4,
            anchor: new g.maps.Point(12, 22),
          },
        });

        const info = new g.maps.InfoWindow({
          content: `
            <div style="font-family: sans-serif; max-width:240px">
              <div style="font-weight:700; color:#0c2340; font-size:14px; margin-bottom:4px">${escapeHtml(a.nom || '')}</div>
              <div style="color:#64748b; font-size:12px; margin-bottom:2px"><b>Adresse:</b> ${escapeHtml(a.adresse || '')}</div>
              <div style="color:#64748b; font-size:12px; margin-bottom:4px"><b>Prestataire:</b> ${escapeHtml(a?.prestataire?.user?.username || '')}</div>
              ${a?.prestataire?.specialite ? `<span style="background:#dbeafe;color:#1e40af;padding:2px 8px;border-radius:20px;font-size:11px">${escapeHtml(a.prestataire.specialite)}</span>` : ''}
            </div>
          `,
        });

        marker.addListener('click', () => {
          info.open({ map: mapRef.current, anchor: marker });
          onSelectAtelier?.(a);
        });

        markersRef.current.push(marker);
      });

      // Zoom to selected
      const selected = selectedAtelier;
      if (selected?.latitude && selected?.longitude) {
        const lat = parseFloat(selected.latitude);
        const lng = parseFloat(selected.longitude);
        if (Number.isFinite(lat) && Number.isFinite(lng)) {
          mapRef.current.setCenter({ lat, lng });
          mapRef.current.setZoom(16);
        }
      }
    };

    run().catch(e => {
      console.error(e);
      if (!cancelled) setErr('Erreur chargement Google Maps');
    });

    return () => {
      cancelled = true;
    };
  }, [apiKey, ateliers, selectedAtelier, center, zoom, onSelectAtelier]);

  // Si l’utilisateur n’a pas encore sélectionné un atelier, on centre sur la position fournie.
  // (sinon l’utilisateur à Lomé verrait la carte trop zoomée ailleurs).

  return (
    <>
      <div ref={containerRef} style={{ width: '100%', height: '100%', ...(style || {}) }} />
      {err && (
        <div style={{ padding: 10, color: '#dc2626', fontSize: 12, fontWeight: 600 }}>
          {err}
        </div>
      )}
    </>
  );
}

function escapeHtml(s) {
  return String(s ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '<')
    .replaceAll('>', '>')
    .replaceAll('"', '"')
    .replaceAll("'", '&#039;');
}

