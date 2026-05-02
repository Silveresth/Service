import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

// ─── Types de services pour les filtres ──────────────────────────
const TYPES_SERVICES = [
  { id:'all',         label:'Tous',             icon:'bi-grid-3x3-gap' },
  { id:'plomberie',   label:'Plomberie',        icon:'bi-droplet' },
  { id:'electricite', label:'Électricité',      icon:'bi-lightning' },
  { id:'mecanique',   label:'Mécanique',        icon:'bi-gear' },
  { id:'menuiserie',  label:'Menuiserie',       icon:'bi-tools' },
  { id:'peinture',    label:'Peinture',         icon:'bi-palette' },
  { id:'informatique',label:'Informatique',     icon:'bi-laptop' },
  { id:'climatisation',label:'Climatisation',  icon:'bi-thermometer' },
  { id:'jardinage',   label:'Jardinage',        icon:'bi-tree' },
  { id:'maconnerie',  label:'Maçonnerie',       icon:'bi-building' },
  { id:'autre',       label:'Autre',            icon:'bi-three-dots' },
];

// ─── GPS Navigation intégré ────────────────────────────────────
function GPSInterne({ atelier, onClose }) {
  const mapRef = useRef(null);
  const leafletMap = useRef(null);
  const markerUser = useRef(null);
  const routeLayer = useRef(null);
  const watchId = useRef(null);
  const [userPos, setUserPos] = useState(null);
  const [navStarted, setNavStarted] = useState(false);
  const [distance, setDistance] = useState(null);
  const [bearing, setBearing] = useState(null);
  const [errGps, setErrGps] = useState('');

  const destLat = parseFloat(atelier.latitude);
  const destLng = parseFloat(atelier.longitude);

  // Calcul distance haversine
  function haversine(lat1, lng1, lat2, lng2) {
    const R = 6371000;
    const dLat = (lat2-lat1) * Math.PI/180;
    const dLng = (lng2-lng1) * Math.PI/180;
    const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLng/2)**2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  }

  function calcBearing(lat1, lng1, lat2, lng2) {
    const dLng = (lng2-lng1) * Math.PI/180;
    const y = Math.sin(dLng) * Math.cos(lat2*Math.PI/180);
    const x = Math.cos(lat1*Math.PI/180)*Math.sin(lat2*Math.PI/180) - Math.sin(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.cos(dLng);
    let b = Math.atan2(y, x) * 180/Math.PI;
    return (b + 360) % 360;
  }

  function directionLabel(b) {
    if (b < 22.5 || b >= 337.5) return 'Nord ↑';
    if (b < 67.5)  return 'Nord-Est ↗';
    if (b < 112.5) return 'Est →';
    if (b < 157.5) return 'Sud-Est ↘';
    if (b < 202.5) return 'Sud ↓';
    if (b < 247.5) return 'Sud-Ouest ↙';
    if (b < 292.5) return 'Ouest ←';
    return 'Nord-Ouest ↖';
  }

  function formatDist(m) {
    if (m < 1000) return `${Math.round(m)} m`;
    return `${(m/1000).toFixed(1)} km`;
  }

  useEffect(() => {
    if (!mapRef.current || leafletMap.current) return;
    const L = window.L;
    if (!L) return;

    const map = L.map(mapRef.current).setView([destLat, destLng], 14);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution:'© OpenStreetMap' }).addTo(map);

    // Marqueur destination
    const destIcon = L.divIcon({
      html: `<div style="background:#ef4444;width:30px;height:30px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3)"></div>`,
      iconSize:[30,30], iconAnchor:[15,30], className:''
    });
    L.marker([destLat, destLng], { icon: destIcon }).addTo(map)
      .bindPopup(`<strong>${atelier.nom}</strong><br>${atelier.adresse}`).openPopup();

    leafletMap.current = map;
  }, []);

const startNavigation = () => {
    if (!navigator.geolocation) { 
      setErrGps("GPS non disponible sur cet appareil."); 
      return; 
    }
    
    // Vérifier si HTTPS (requis pour GPS sur mobile)
    const isHTTPS = window.location.protocol === 'https:' || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    
    // Show warning for non-HTTPS before starting on mobile
    if (!isHTTPS && /Mobi|Android/i.test(navigator.userAgent)) {
      setErrGps("ATTENTION: Le GPS fonctionne mieux en HTTPS. Lancez quand même...");
    }
    
    setNavStarted(true);
    setErrGps(''); // Reset erreur
    
    const geoOptions = { 
      enableHighAccuracy: true, 
      maximumAge: 5000, 
      timeout: 15000 
    };
    
    watchId.current = navigator.geolocation.watchPosition(
      pos => {
        const { latitude: lat, longitude: lng } = pos.coords;
        setUserPos({ lat, lng });
        setErrGps(''); // Clear any error
        const dist = haversine(lat, lng, destLat, destLng);
        const b    = calcBearing(lat, lng, destLat, destLng);
        setDistance(dist);
        setBearing(b);

        const L = window.L;
        const map = leafletMap.current;
        if (!L || !map) return;

        // Icône utilisateur
        const userIcon = L.divIcon({
          html: `<div style="background:#0284c7;width:20px;height:20px;border-radius:50%;border:3px solid white;box-shadow:0 2px 6px rgba(2,132,199,0.5)"></div>`,
          iconSize:[20,20], iconAnchor:[10,10], className:''
        });
        if (markerUser.current) markerUser.current.setLatLng([lat,lng]);
        else markerUser.current = L.marker([lat,lng], { icon: userIcon }).addTo(map).bindPopup('Vous êtes ici');

        // Ligne de route
        if (routeLayer.current) map.removeLayer(routeLayer.current);
        routeLayer.current = L.polyline([[lat,lng],[destLat,destLng]], {
          color:'#0284c7', weight:4, dashArray:'10,8', opacity:0.7
        }).addTo(map);

        // Centrer entre user et dest
        const bounds = L.latLngBounds([[lat,lng],[destLat,destLng]]);
        map.fitBounds(bounds, { padding:[40,40] });
      },
      err => {
        // Meilleure gestion des erreurs GPS mobile
        let msg = 'Erreur GPS inconnue';
        if (err.code === 1) {
          msg = 'Permission GPS refusée. Veuillez autoriser la géolocalisation dans les paramètres du navigateur.';
        } else if (err.code === 2) {
          msg = 'Position indisponible. Vérifiez que le GPS est activé.';
        } else if (err.code === 3) {
          msg = 'Délai dépassé. Réessayez dans un espace ouvert.';
        }
        setErrGps(msg);
        console.warn('GPS Error:', err.code, err.message);
      },
      geoOptions
    );
  };

  const stopNavigation = () => {
    if (watchId.current) navigator.geolocation.clearWatch(watchId.current);
    setNavStarted(false);
    setUserPos(null);
    if (markerUser.current && leafletMap.current) leafletMap.current.removeLayer(markerUser.current);
    if (routeLayer.current && leafletMap.current) leafletMap.current.removeLayer(routeLayer.current);
    markerUser.current = null; routeLayer.current = null;
  };

  useEffect(() => () => { if(watchId.current) navigator.geolocation.clearWatch(watchId.current); }, []);

  const arrived = distance !== null && distance < 50;

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.7)', zIndex:9999, display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ background:'white', borderRadius:16, width:'min(94vw,760px)', maxHeight:'92vh', overflow:'hidden', display:'flex', flexDirection:'column' }}>
        {/* Header */}
        <div style={{ background:'var(--primary-color)', padding:'14px 20px', color:'white', display:'flex', alignItems:'center', gap:12 }}>
          <i className="bi bi-compass" style={{ fontSize:'1.4rem' }}></i>
          <div style={{ flex:1 }}>
            <div style={{ fontWeight:700, fontSize:'1rem' }}>GPS – {atelier.nom}</div>
            <div style={{ fontSize:'0.8rem', opacity:0.85 }}>{atelier.adresse}</div>
          </div>
          <button onClick={onClose} style={{ background:'rgba(255,255,255,0.2)', border:'none', color:'white', borderRadius:8, padding:'6px 12px', cursor:'pointer', fontWeight:600 }}>
            <i className="bi bi-x-lg"></i>
          </button>
        </div>

        {/* Infos navigation */}
        {navStarted && (
          <div style={{ display:'flex', gap:0, borderBottom:'1px solid #e2e8f0' }}>
            {[
              { icon:'bi-geo-arrow', label:'Distance', val: distance !== null ? formatDist(distance) : '…' },
              { icon:'bi-compass', label:'Direction', val: bearing !== null ? directionLabel(bearing) : '…' },
              { icon:'bi-person-walking', label:'Statut', val: arrived ? '✓ Arrivé !' : 'En route' },
            ].map((item, i) => (
              <div key={i} style={{ flex:1, textAlign:'center', padding:'12px 8px', background: i===2 && arrived ? '#f0fdf4' : 'white', borderRight: i<2 ? '1px solid #e2e8f0' : 'none' }}>
                <i className={`${item.icon}`} style={{ fontSize:'1.2rem', color: i===2 && arrived ? '#22c55e' : 'var(--primary-color)', display:'block', marginBottom:4 }}></i>
                <div style={{ fontSize:'0.95rem', fontWeight:700, color: i===2 && arrived ? '#166534' : '#0c2340' }}>{item.val}</div>
                <div style={{ fontSize:'0.7rem', color:'#94a3b8' }}>{item.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Carte */}
        <div ref={mapRef} style={{ flex:1, minHeight:320 }}></div>

        {/* Contrôles */}
        <div style={{ padding:'14px 20px', borderTop:'1px solid #e2e8f0', display:'flex', gap:10, flexWrap:'wrap' }}>
          {errGps && <div style={{ width:'100%', fontSize:'0.85rem', color:'#ef4444', marginBottom:6 }}><i className="bi bi-exclamation-triangle me-1"></i>{errGps}</div>}
          {!navStarted ? (
            <button onClick={startNavigation} className="btn-primary-custom" style={{ flex:1, justifyContent:'center', padding:'12px' }}>
              <i className="bi bi-compass me-2"></i>Démarrer la navigation GPS
            </button>
          ) : (
            <button onClick={stopNavigation} className="btn-secondary-custom" style={{ flex:1, justifyContent:'center', padding:'12px' }}>
              <i className="bi bi-stop-circle me-2"></i>Arrêter le GPS
            </button>
          )}
          <a href={`tel:${atelier.telephone}`} className="btn-outline-primary-custom" style={{ justifyContent:'center', padding:'12px 16px', borderColor:'#22c55e', color:'#22c55e' }}>
            <i className="bi bi-telephone"></i>
          </a>
          <a href={`https://wa.me/228${atelier.telephone}`} target="_blank" rel="noreferrer" className="btn-whatsapp" style={{ padding:'12px 16px' }}>
            <i className="bi bi-whatsapp"></i>
          </a>
        </div>
      </div>
    </div>
  );
}

// ─── Composante principale CarteAteliers ──────────────────────
export function CarteAteliers() {
  const [ateliers, setAteliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filtreType, setFiltreType] = useState('all');
  const [filtreVille, setFiltreVille] = useState('all');
  const [filtreActif, setFiltreActif] = useState(true);
  const [sortBy, setSortBy] = useState('nom');
const [gpsAtelier, setGpsAtelier] = useState(null);
  const [selectedAtelier, setSelectedAtelier] = useState(null);
  const [showFiltersMobile, setShowFiltersMobile] = useState(false);
  const mapRef = useRef(null);
  const leafletMap = useRef(null);
  const markersRef = useRef([]);

  useEffect(() => {
    api.get('/ateliers/').then(r => setAteliers(r.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  // Initialisation carte
  useEffect(() => {
    if (loading || !window.L || leafletMap.current) return;
    const map = window.L.map('carte-ateliers').setView([6.125580, 1.232456], 7);
    window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution:'© OpenStreetMap' }).addTo(map);
    leafletMap.current = map;
  }, [loading]);

  // Mise à jour marqueurs selon filtres
  const ateliersFiltres = ateliers.filter(a => {
    const q = search.toLowerCase();
    const matchSearch = !q || a.nom?.toLowerCase().includes(q) || a.adresse?.toLowerCase().includes(q) || a.prestataire?.user?.username?.toLowerCase().includes(q) || a.description?.toLowerCase().includes(q);
    const matchType = filtreType === 'all' || a.prestataire?.specialite?.toLowerCase().includes(filtreType) || a.description?.toLowerCase().includes(filtreType);
    const matchVille = filtreVille === 'all' || a.adresse?.toLowerCase().includes(filtreVille);
    const matchActif = !filtreActif || a.est_actif;
    return matchSearch && matchType && matchVille && matchActif;
  }).sort((a, b) => {
    if (sortBy === 'nom') return a.nom.localeCompare(b.nom);
    if (sortBy === 'recents') return new Date(b.date_creation) - new Date(a.date_creation);
    return 0;
  });

  useEffect(() => {
    const L = window.L;
    const map = leafletMap.current;
    if (!L || !map) return;
    markersRef.current.forEach(m => map.removeLayer(m));
    markersRef.current = [];
    ateliersFiltres.forEach(a => {
      if (a.latitude && a.longitude) {
        const isSelected = selectedAtelier?.id === a.id;
        const icon = L.divIcon({
          html: `<div style="background:${isSelected?'#ef4444':'#0284c7'};width:${isSelected?'36px':'28px'};height:${isSelected?'36px':'28px'};border-radius:50%;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;transition:all 0.2s">
            <i class="bi bi-shop" style="color:white;font-size:${isSelected?'16px':'13px'}"></i></div>`,
          iconSize:[isSelected?36:28,isSelected?36:28], iconAnchor:[(isSelected?36:28)/2,(isSelected?36:28)/2], className:''
        });
        const marker = L.marker([parseFloat(a.latitude), parseFloat(a.longitude)], { icon })
          .addTo(map)
          .bindPopup(`
            <div style="min-width:200px;font-family:sans-serif">
              <h6 style="margin:0 0 6px;font-weight:700;color:#0c2340">${a.nom}</h6>
              <p style="margin:2px 0;font-size:0.82rem;color:#64748b"><i class="bi bi-geo-alt"></i> ${a.adresse}</p>
              <p style="margin:2px 0;font-size:0.82rem"><i class="bi bi-person"></i> ${a.prestataire?.user?.username||''}</p>
              ${a.prestataire?.specialite?`<span style="background:#dbeafe;color:#1e40af;padding:2px 8px;border-radius:20px;font-size:0.75rem">${a.prestataire.specialite}</span>`:''}
              <div style="margin-top:10px;display:flex;gap:6px;flex-wrap:wrap">
                <a href="tel:${a.telephone}" style="background:#22c55e;color:white;padding:4px 10px;border-radius:6px;text-decoration:none;font-size:0.8rem"><i class="bi bi-telephone"></i> Appeler</a>
                <a href="https://wa.me/228${a.telephone}" target="_blank" style="background:#25D366;color:white;padding:4px 10px;border-radius:6px;text-decoration:none;font-size:0.8rem"><i class="bi bi-whatsapp"></i></a>
              </div>
            </div>
          `);
        marker.on('click', () => setSelectedAtelier(a));
        markersRef.current.push(marker);
      }
    });
  }, [ateliersFiltres, selectedAtelier]);

  const zoomToAtelier = (a) => {
    setSelectedAtelier(a);
    if (leafletMap.current && a.latitude && a.longitude) {
      leafletMap.current.setView([parseFloat(a.latitude), parseFloat(a.longitude)], 16, { animate:true });
    }
  };

  const locateMe = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(pos => {
      if (leafletMap.current) {
        leafletMap.current.setView([pos.coords.latitude, pos.coords.longitude], 13);
        const L = window.L;
        L.circleMarker([pos.coords.latitude, pos.coords.longitude], { radius:10, color:'#0284c7', fillColor:'#0284c7', fillOpacity:0.4, weight:3 }).addTo(leafletMap.current);
      }
    });
  };

  const villes = ['all', ...new Set(ateliers.map(a => {
    const parts = a.adresse?.split(',');
    return parts?.[parts.length-1]?.trim() || '';
  }).filter(Boolean))];

  if (loading) return <div style={{ textAlign:'center', padding:80 }}><i className="bi bi-hourglass-split" style={{ fontSize:'3rem', color:'var(--primary-color)' }}></i></div>;

  return (
    <div className="py-5">
      {gpsAtelier && <GPSInterne atelier={gpsAtelier} onClose={() => setGpsAtelier(null)} />}
      <div className="container">
        <div className="page-header">
          <h2><i className="bi bi-geo-alt text-primary me-2"></i>Carte des Ateliers</h2>
          <p className="text-muted">Découvrez les ateliers et naviguez directement vers eux</p>
        </div>

        {/* ── Barre de recherche et filtres ── */}
<div className="card-custom mb-4" style={{ padding:20 }}>
          {/* Recherche principale */}
          <div className="search-bar-modern mb-3">
            <i className="bi bi-search search-icon"></i>
            <input
              type="text"
              placeholder="Rechercher un atelier, une adresse, un prestataire..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            {search && (
              <button onClick={() => setSearch('')} className="search-clear-btn">
                <i className="bi bi-x-lg"></i>
              </button>
            )}
          </div>

          {/* Toggle Filters Mobile */}
          <button onClick={() => setShowFiltersMobile(!showFiltersMobile)} className="btn-outline-primary-custom w-100 mb-3 d-lg-none">
            <i className={`bi bi-${showFiltersMobile ? 'dash' : 'plus'}-lg me-2`}></i>
            {showFiltersMobile ? 'Masquer filtres' : 'Filtres avancés'} ({ateliersFiltres.length})
          </button>

          {/* Filters Panel */}
          <div className={showFiltersMobile ? 'd-block' : 'd-none d-lg-block'}>
            {/* Filtres par type de service */}
            <div style={{ marginBottom:16 }}>
              <div style={{ fontSize:'0.85rem', fontWeight:600, color:'#64748b', marginBottom:8 }}>
                <i className="bi bi-funnel me-1"></i>Type de service
              </div>
              <div className="filter-pills-scroll" style={{ display:'flex', gap:8, flexWrap:'wrap', overflowX:'auto', WebkitOverflowScrolling:'touch' }}>
                {TYPES_SERVICES.map(t => (
                  <button key={t.id} onClick={() => setFiltreType(t.id)} className="filter-pill" style={{
                    padding:'6px 14px', borderRadius:20, border:'1.5px solid',
                    borderColor: filtreType===t.id ? 'var(--primary-color)' : '#e2e8f0',
                    background: filtreType===t.id ? 'var(--primary-color)' : 'white',
                    color: filtreType===t.id ? 'white' : '#64748b',
                    fontWeight: filtreType===t.id ? 600 : 400, fontSize:'0.82rem',
                    cursor:'pointer', display:'flex', alignItems:'center', gap:5, transition:'all 0.15s',
                    whiteSpace:'nowrap', flexShrink:0,
                  }}>
                    <i className={t.icon} style={{ fontSize:'0.8rem' }}></i>{t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Filtres secondaires */}
            <div style={{ display:'flex', gap:12, alignItems:'end', flexWrap:'wrap' }}>
              <div style={{ display:'flex', alignItems:'center', gap:8, flex:1, minWidth:160 }}>
                <label style={{ fontSize:'0.85rem', color:'#64748b', fontWeight:500, whiteSpace:'nowrap' }}>Ville :</label>
                <select className="form-control" style={{ flex:1, padding:'6px 10px', fontSize:'0.85rem' }}
                  value={filtreVille} onChange={e => setFiltreVille(e.target.value)}>
                  {villes.slice(0,6).map(v => <option key={v} value={v}>{v === 'all' ? 'Toutes les villes' : v}</option>)}
                </select>
              </div>
              <div style={{ display:'flex', alignItems:'center', gap:8, flex:1, minWidth:160 }}>
                <label style={{ fontSize:'0.85rem', color:'#64748b', fontWeight:500, whiteSpace:'nowrap' }}>Trier par :</label>
                <select className="form-control" style={{ flex:1, padding:'6px 10px', fontSize:'0.85rem' }}
                  value={sortBy} onChange={e => setSortBy(e.target.value)}>
                  <option value="nom">Nom A-Z</option>
                  <option value="recents">Plus récents</option>
                </select>
              </div>
              <label style={{ display:'flex', alignItems:'center', gap:6, cursor:'pointer', fontSize:'0.85rem', color:'#64748b', whiteSpace:'nowrap' }}>
                <input type="checkbox" checked={filtreActif} onChange={e => setFiltreActif(e.target.checked)} />
                Actifs seulement
              </label>
              <button onClick={locateMe} className="btn-outline-primary-custom btn-sm-custom" style={{ marginLeft:'auto', whiteSpace:'nowrap' }}>
                <i className="bi bi-crosshair"></i> Ma position
              </button>
              <span style={{ fontSize:'0.85rem', color:'#94a3b8', whiteSpace:'nowrap' }}>
                <strong style={{ color:'var(--primary-color)' }}>{ateliersFiltres.length}</strong> atelier(s)
              </span>
            </div>
          </div>
        </div>

        {/* ── Carte + Liste ── */}
<div className="ateliers-layout" style={{ display:'flex', gap:20 }}>
          {/* Carte */}
          <div style={{ flex:2 }}>
<div id="carte-ateliers" className="ateliers-map" style={{ height:'min(400px, 45vh)', borderRadius:12, border:'1px solid var(--border-color)' }}></div>

          </div>

          {/* Liste */}
<div className="ateliers-liste" style={{ flex:1, maxHeight:'min(560px, 50vh)', overflowY:'auto', display:'flex', flexDirection:'column', gap:12 }}>
            {ateliersFiltres.length === 0 && (
              <div className="empty-state"><i className="bi bi-shop"></i><p>Aucun atelier pour ces filtres.</p></div>
            )}
            {ateliersFiltres.map(a => (
              <div key={a.id}
                className="card-custom"
                style={{ padding:14, cursor:'pointer', border: selectedAtelier?.id===a.id ? '2px solid var(--primary-color)' : '1px solid var(--border-color)', transition:'all 0.15s' }}
                onClick={() => zoomToAtelier(a)}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:6 }}>
                  <h6 style={{ fontWeight:700, marginBottom:0, color:'#0c2340', flex:1 }}>{a.nom}</h6>
                  {a.est_actif && <span style={{ background:'#f0fdf4', color:'#166534', padding:'2px 8px', borderRadius:20, fontSize:'0.7rem', fontWeight:600, flexShrink:0 }}>● Actif</span>}
                </div>
                <p className="text-muted" style={{ fontSize:'0.82rem', margin:'2px 0' }}>
                  <i className="bi bi-geo-alt me-1"></i>{a.adresse}
                </p>
                <p style={{ fontSize:'0.82rem', margin:'2px 0' }}>
                  <i className="bi bi-person me-1"></i>{a.prestataire?.user?.username}
                  {a.prestataire?.specialite && <span className="badge badge-info ms-2" style={{ fontSize:'0.7rem' }}>{a.prestataire.specialite}</span>}
                </p>
                {a.description && (
                  <p className="text-muted" style={{ fontSize:'0.78rem', marginTop:4, marginBottom:0 }}>
                    {a.description.slice(0, 80)}{a.description.length > 80 ? '…' : ''}
                  </p>
                )}
                <div style={{ display:'flex', gap:6, marginTop:10, flexWrap:'wrap' }}>
                  <a href={`tel:${a.telephone}`} onClick={e => e.stopPropagation()}
                    className="btn-outline-primary-custom btn-sm-custom" style={{ borderColor:'#22c55e', color:'#22c55e', fontSize:'0.78rem', padding:'4px 10px' }}>
                    <i className="bi bi-telephone"></i> Appeler
                  </a>
                  <a href={`https://wa.me/228${a.telephone}`} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()}
                    className="btn-whatsapp btn-sm-custom" style={{ fontSize:'0.78rem', padding:'4px 10px' }}>
                    <i className="bi bi-whatsapp"></i> WA
                  </a>
                  <button onClick={e => { e.stopPropagation(); setGpsAtelier(a); }}
                    className="btn-primary-custom btn-sm-custom"
                    style={{ fontSize:'0.78rem', padding:'4px 12px', background:'linear-gradient(135deg,#0284c7,#0369a1)' }}>
                    <i className="bi bi-compass me-1"></i>GPS
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── AjouterAtelier ────────────────────────────────────────────
export function AjouterAtelier() {
  const [form, setForm] = useState({ nom:'', adresse:'', latitude:'', longitude:'', telephone:'', description:'', est_actif:true });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const set = f => e => setForm(p => ({ ...p, [f]: e.type==='checkbox' ? e.target.checked : e.target.value }));

  useEffect(() => {
    if (!window.L) return;
    const existing = document.getElementById('map-ajouter');
    if (existing && existing._leaflet_id) return;
    const map = window.L.map('map-ajouter').setView([6.125580, 1.232456], 7);
    window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution:'© OpenStreetMap' }).addTo(map);
    let marker = null;
    map.on('click', e => {
      const { lat, lng } = e.latlng;
      setForm(p => ({ ...p, latitude: lat.toFixed(6), longitude: lng.toFixed(6) }));
      if (marker) marker.setLatLng(e.latlng);
      else marker = window.L.marker(e.latlng).addTo(map);
    });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true); setErrors({});
    try { await api.post('/ateliers/', form); navigate('/mes-ateliers'); }
    catch (err) { setErrors(err.response?.data || {}); }
    finally { setLoading(false); }
  };

  return (
    <div className="py-5">
      <div className="container">
        <div className="page-header">
          <h2><i className="bi bi-geo-alt text-primary me-2"></i>Ajouter un Atelier</h2>
          <p className="text-muted">Ajoutez un nouvel atelier pour votre activité</p>
        </div>
        <div style={{ display:'flex', gap:24 }}>
          <div style={{ flex:2 }}>
            <div className="card-custom">
              <div className="card-body-custom">
                <form onSubmit={handleSubmit}>
                  <div className="mb-3"><label className="form-label">Nom de l'atelier</label>
                    <input type="text" className="form-control" value={form.nom} onChange={set('nom')} required />
                    {errors.nom && <div className="error-text">{errors.nom}</div>}
                  </div>
                  <div className="mb-3"><label className="form-label">Adresse</label>
                    <textarea className="form-control" value={form.adresse} onChange={set('adresse')} required />
                  </div>
                  <div style={{ display:'flex', gap:12, marginBottom:16 }}>
                    <div style={{ flex:1 }}>
                      <label className="form-label">Latitude</label>
                      <input type="number" step="0.000001" className="form-control" value={form.latitude} onChange={set('latitude')} placeholder="6.125580" />
                    </div>
                    <div style={{ flex:1 }}>
                      <label className="form-label">Longitude</label>
                      <input type="number" step="0.000001" className="form-control" value={form.longitude} onChange={set('longitude')} placeholder="1.232456" />
                    </div>
                  </div>
                  <div className="mb-3"><label className="form-label">Sélectionner sur la carte</label>
                    <div id="map-ajouter" style={{ height:280, borderRadius:8 }}></div>
                    <small>Cliquez sur la carte pour sélectionner la position</small>
                  </div>
                  <div className="mb-3"><label className="form-label">Téléphone</label>
                    <input type="text" className="form-control" value={form.telephone} onChange={set('telephone')} />
                  </div>
                  <div className="mb-3"><label className="form-label">Description (types de services proposés)</label>
                    <textarea className="form-control" value={form.description} onChange={set('description')} placeholder="Ex: Plomberie, électricité, réparation..." />
                  </div>
                  <div className="form-check mb-3">
                    <input type="checkbox" checked={form.est_actif} onChange={set('est_actif')} />
                    <label>Atelier actif (visible par les clients)</label>
                  </div>
                  <div style={{ display:'flex', justifyContent:'space-between' }}>
                    <button type="button" onClick={() => navigate('/mes-ateliers')} className="btn-secondary-custom">
                      <i className="bi bi-arrow-left"></i> Retour
                    </button>
                    <button type="submit" className="btn-primary-custom" disabled={loading}>
                      {loading ? 'Enregistrement...' : <><i className="bi bi-check-circle"></i> Enregistrer</>}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
          <div style={{ flex:1 }}>
            <div className="card-custom" style={{ background:'#f8fafb' }}>
              <div className="card-body-custom">
                <h5 style={{ marginBottom:12 }}><i className="bi bi-info-circle me-2"></i>Coordonnées</h5>
                <ul style={{ paddingLeft:20, lineHeight:1.9, fontSize:'0.9rem' }}>
                  <li>Ouvrez Google Maps</li><li>Allez à l'emplacement</li>
                  <li>Appuyez longtemps sur le point</li><li>Copiez les coordonnées</li>
                </ul>
                <hr />
                <h5 style={{ marginBottom:10 }}>Villes du Togo</h5>
                {[['Lomé','6.1256, 1.2325'],['Kpalimé','6.9000, 0.6333'],['Sokodé','8.5667, 0.9833'],['Kara','9.5500, 1.1667'],['Dapaong','10.7833, 0.0333']].map(([v,c]) => (
                  <div key={v} style={{ marginBottom:6, fontSize:'0.85rem' }}><strong>{v}:</strong> <span className="text-muted">{c}</span></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}