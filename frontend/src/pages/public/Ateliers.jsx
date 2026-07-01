import { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Geolocation } from '@capacitor/geolocation';
import api from '../../api/axios';
import GoogleMapAtelierPicker from '../../components/GoogleMapAtelierPicker';
import LeafletGPSInterne from '../../components/LeafletGPSInterne';

const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Outfit:wght@600;700;800&display=swap');

@keyframes at-up   { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
@keyframes at-fade { from { opacity:0; } to { opacity:1; } }
@keyframes at-shimmer {
  0%   { background-position:-200% 0; }
  100% { background-position: 200% 0; }
}
@keyframes at-spin { to { transform: rotate(360deg); } }

.at-page {
  font-family: 'Plus Jakarta Sans', sans-serif;
  background: #f8fafc;
  min-height: 100vh;
  padding-bottom: 80px;
}

/* ── COMPACT HEADER ── */
.at-compact-header {
  background: linear-gradient(135deg, #0c2340 0%, #0a3060 50%, #0369a1 100%);
  padding: 36px 0 28px;
  color: white;
  position: relative;
  overflow: hidden;
}
.at-compact-header-orb {
  position: absolute;
  top: -120px; right: -80px;
  width: 450px; height: 450px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(56,189,248,0.15) 0%, transparent 70%);
  filter: blur(50px);
  pointer-events: none;
}
.at-compact-header-inner {
  position: relative;
  z-index: 2;
  animation: at-up 0.5s cubic-bezier(0.22,1,0.36,1) both;
}
.at-compact-title {
  font-family: 'Outfit', sans-serif;
  font-weight: 800;
  font-size: 2.2rem;
  margin: 0 0 6px;
  letter-spacing: -0.025em;
  line-height: 1.2;
}
.at-compact-title .highlight {
  background: linear-gradient(90deg, #38bdf8, #818cf8);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
.at-compact-sub {
  color: rgba(255,255,255,0.7);
  font-size: 0.95rem;
  margin: 0;
  max-width: 480px;
}
.at-compact-kpis {
  display: flex;
  gap: 16px;
}
.at-compact-kpi {
  display: flex;
  flex-direction: column;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 14px;
  padding: 6px 14px;
  min-width: 90px;
  align-items: center;
}
.at-compact-kpi-val {
  font-family: 'Outfit', sans-serif;
  font-weight: 800;
  font-size: 1.2rem;
  color: #38bdf8;
  line-height: 1;
}
.at-compact-kpi-lbl {
  font-size: 0.62rem;
  color: rgba(255,255,255,0.5);
  text-transform: uppercase;
  font-weight: 700;
  margin-top: 3px;
  letter-spacing: 0.04em;
}

/* ── FILTER CARD ── */
.at-filter-card {
  background: white;
  border-radius: 20px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 12px 36px rgba(12,35,64,0.05);
  padding: 20px;
  margin-top: 24px;
  margin-bottom: 24px;
  position: relative;
  z-index: 5;
  animation: at-up 0.6s cubic-bezier(0.22,1,0.36,1) 0.1s both;
}

.at-search-wrap {
  position: relative;
  margin-bottom: 16px;
}

.at-search-icon {
  position: absolute;
  left: 18px; top: 50%;
  transform: translateY(-50%);
  color: #94a3b8; font-size: 1rem;
  pointer-events: none;
}

.at-search-input {
  width: 100%;
  padding: 14px 44px 14px 48px;
  border: 1.5px solid #e2e8f0;
  border-radius: 16px;
  font-size: 0.92rem;
  background: #f8fafc;
  outline: none;
  transition: all 0.2s;
  color: #0c2340;
  font-family: inherit;
}

.at-search-input:focus {
  border-color: #0284c7;
  background: white;
  box-shadow: 0 0 0 4px rgba(2,132,199,0.1);
}

.at-search-clear {
  position: absolute;
  right: 14px; top: 50%;
  transform: translateY(-50%);
  background: #e2e8f0; border: none;
  border-radius: 8px; width: 26px; height: 26px;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; color: #64748b; font-size: 0.8rem;
  transition: all 0.15s;
}

.at-search-clear:hover { background: #cbd5e1; color: #0c2340; }

/* chips */
.at-chips {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding-bottom: 6px;
  margin-bottom: 16px;
  scrollbar-width: none;
}
.at-chips::-webkit-scrollbar { display: none; }

.at-chip {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 16px;
  border-radius: 30px;
  border: 1.5px solid #e2e8f0;
  background: white;
  color: #64748b;
  font-weight: 600;
  font-size: 0.82rem;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
  font-family: inherit;
}

.at-chip:hover { border-color: #0284c7; color: #0284c7; transform: translateY(-1px); }

.at-chip.active {
  background: linear-gradient(135deg, #0284c7, #0369a1);
  border-color: #0284c7;
  color: white;
  box-shadow: 0 6px 16px rgba(2,132,199,0.25);
}

/* secondary filters row */
.at-filters-row {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.at-select {
  padding: 8px 14px;
  border: 1.5px solid #e2e8f0;
  border-radius: 12px;
  font-size: 0.83rem;
  background: #f8fafc;
  color: #374151;
  cursor: pointer;
  outline: none;
  font-family: inherit;
  font-weight: 600;
  transition: border-color 0.15s;
}

.at-select:focus { border-color: #0284c7; }

.at-toggle-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  user-select: none;
  font-size: 0.83rem;
  color: #374151;
  font-weight: 600;
}

.at-toggle-track {
  width: 44px; height: 24px;
  border-radius: 12px;
  position: relative;
  transition: background 0.2s;
  flex-shrink: 0;
}

.at-toggle-thumb {
  position: absolute;
  top: 3px;
  width: 18px; height: 18px;
  border-radius: 50%;
  background: white;
  transition: left 0.2s;
  box-shadow: 0 1px 4px rgba(0,0,0,0.2);
}

.at-btn-locate {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 8px 16px;
  border: 1.5px solid #bae6fd;
  background: #f0f9ff;
  color: #0284c7;
  border-radius: 12px;
  font-weight: 700;
  font-size: 0.83rem;
  cursor: pointer;
  transition: all 0.2s;
  font-family: inherit;
}

.at-btn-locate:hover {
  background: #e0f2fe;
  border-color: #0284c7;
  box-shadow: 0 4px 12px rgba(2,132,199,0.12);
}

.at-btn-reset {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 0.8rem;
  color: #94a3b8;
  background: none; border: none;
  cursor: pointer;
  font-family: inherit;
  font-weight: 600;
  padding: 4px 8px;
  border-radius: 8px;
  transition: all 0.15s;
}
.at-btn-reset:hover { color: #ef4444; background: #fef2f2; }

.at-count-badge {
  background: #e0f2fe;
  color: #0284c7;
  border-radius: 20px;
  padding: 4px 12px;
  font-size: 0.8rem;
  font-weight: 800;
}

/* ── MAP + LIST LAYOUT ── */
.at-layout {
  display: flex;
  gap: 16px;
  align-items: flex-start;
  animation: at-up 0.55s cubic-bezier(0.22,1,0.36,1) 0.15s both;
}

@media (max-width: 768px) {
  .at-layout { flex-direction: column; }
  .at-map-wrap { width: 100% !important; flex: none !important; height: 35vh !important; position: static !important; }
  .at-list-wrap { width: 100% !important; max-width: 100% !important; max-height: none !important; overflow-y: visible !important; }
}

.at-map-wrap {
  flex: 2;
  border-radius: 20px;
  overflow: hidden;
  border: 1px solid #e2e8f0;
  box-shadow: 0 4px 20px rgba(0,0,0,0.05);
  height: min(460px, 52vh);
  position: sticky;
  top: 80px;
}

.at-list-wrap {
  flex: 1;
  min-width: 280px;
  max-width: 340px;
  max-height: min(560px, 56vh);
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 10px;
  scrollbar-width: thin;
  scrollbar-color: #e2e8f0 transparent;
}

.at-list-wrap::-webkit-scrollbar { width: 4px; }
.at-list-wrap::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 2px; }

/* ── ATELIER LIST CARD ── */
.at-item {
  background: white;
  border-radius: 16px;
  padding: 14px;
  cursor: pointer;
  border: 2px solid #e2e8f0;
  transition: all 0.2s;
}

.at-item:hover {
  border-color: #93c5fd;
  box-shadow: 0 6px 20px rgba(2,132,199,0.08);
}

.at-item.selected {
  border-color: #0284c7;
  box-shadow: 0 6px 20px rgba(2,132,199,0.12);
  background: #f0f9ff;
}

.at-item-header {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  margin-bottom: 8px;
}

.at-item-icon {
  width: 40px; height: 40px;
  border-radius: 10px;
  background: linear-gradient(135deg, #0284c7, #0369a1);
  display: flex; align-items: center; justify-content: center;
  color: white; font-size: 1rem;
  flex-shrink: 0;
  box-shadow: 0 4px 8px rgba(2,132,199,0.2);
}

.at-item-icon.inactive {
  background: linear-gradient(135deg, #94a3b8, #64748b);
  box-shadow: none;
}

.at-item-info { flex: 1; min-width: 0; }

.at-item-name {
  font-weight: 800;
  font-size: 0.9rem;
  color: #0c2340;
  margin-bottom: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.at-item-addr {
  font-size: 0.75rem;
  color: #64748b;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.at-item-status {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 0.68rem;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 20px;
  flex-shrink: 0;
}

.at-item-status.active { background: #ecfdf5; color: #047857; }
.at-item-status.inactive { background: #fef2f2; color: #b91c1c; }

.at-item-desc {
  font-size: 0.77rem;
  color: #94a3b8;
  margin-bottom: 10px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.at-item-actions {
  display: flex;
  gap: 6px;
}

.at-btn-call {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 5px 12px;
  border-radius: 8px;
  background: #f0fdf4;
  color: #16a34a;
  font-size: 0.72rem;
  font-weight: 700;
  text-decoration: none;
  border: 1px solid rgba(22,163,74,0.15);
  transition: all 0.15s;
}

.at-btn-call:hover { background: #dcfce7; color: #15803d; }

.at-btn-gps {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 5px 12px;
  border-radius: 8px;
  background: linear-gradient(135deg, #0284c7, #0369a1);
  color: white;
  font-size: 0.72rem;
  font-weight: 700;
  border: none;
  cursor: pointer;
  margin-left: auto;
  transition: all 0.15s;
  font-family: inherit;
  box-shadow: 0 2px 6px rgba(2,132,199,0.2);
}

.at-btn-gps:hover { transform: translateY(-1px); box-shadow: 0 4px 10px rgba(2,132,199,0.3); }

/* ── EMPTY STATE ── */
.at-empty {
  text-align: center;
  padding: 40px 20px;
  background: white;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
}

/* ── LOADING ── */
.at-spinner {
  width: 44px; height: 44px;
  border: 4px solid #e2e8f0;
  border-top-color: #0284c7;
  border-radius: 50%;
  animation: at-spin 0.8s linear infinite;
}

/* ── RESPONSIVE HERO ── */
@media (max-width: 640px) {
  .at-hero { padding: 24px 0 16px !important; }
  .at-hero-sub, .at-hero-eyebrow, .at-hero-kpis { display: none !important; }
  .at-filter-card { padding: 12px; border-radius: 18px; margin-bottom: 16px; }
  .at-search-input {
    padding: 10px 36px 10px 38px !important;
    font-size: 0.82rem !important;
    border-radius: 12px !important;
  }
  .at-search-icon {
    left: 14px !important;
    font-size: 0.85rem !important;
  }
  .at-search-clear {
    right: 10px !important;
    width: 22px !important;
    height: 22px !important;
  }
  .at-chip {
    padding: 6px 12px !important;
    font-size: 0.76rem !important;
  }
  .at-select {
    padding: 8px 10px !important;
    font-size: 0.78rem !important;
    border-radius: 10px !important;
  }
  .at-filters-row {
    gap: 8px !important;
  }
  .at-toggle-label {
    font-size: 0.78rem !important;
  }
  .at-btn-locate {
    padding: 8px 10px !important;
    font-size: 0.78rem !important;
    border-radius: 10px !important;
  }
}
`;

// ─── CarteAteliers ─────────────────────────────────────────────
export function CarteAteliers() {
  const [ateliers, setAteliers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [catFiltre, setCatFiltre] = useState('all');
  const [filtreVille, setFiltreVille] = useState('all');
  const [filtreActif, setFiltreActif] = useState(true);
  const [sortBy, setSortBy] = useState('nom');
  const [gpsAtelier, setGpsAtelier] = useState(null);
  const [selectedAtelier, setSelectedAtelier] = useState(null);
  const [center, setCenter] = useState({ lat: 6.125580, lng: 1.232456 });
  const [googleZoom, setGoogleZoom] = useState(7);


  useEffect(() => {
    Promise.all([
      api.get('/ateliers/'),
      api.get('/categories/'),
    ]).then(([aRes, cRes]) => {
      setAteliers(aRes.data);
      setCategories(cRes.data);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const villes = useMemo(() =>
    ['all', ...new Set(ateliers.map(a => {
      const parts = a.adresse?.split(',');
      return parts?.[parts.length - 1]?.trim() || '';
    }).filter(Boolean))],
    [ateliers]
  );

  const ateliersFiltres = useMemo(() =>
    ateliers.filter(a => {
      const q = search.toLowerCase();
      const matchSearch = !q ||
        a.nom?.toLowerCase().includes(q) ||
        a.adresse?.toLowerCase().includes(q) ||
        a.prestataire?.user?.username?.toLowerCase().includes(q) ||
        a.description?.toLowerCase().includes(q);

      const matchCat = catFiltre === 'all' ||
        String(a.prestataire?.specialite?.toLowerCase()).includes(catFiltre.toLowerCase()) ||
        String(a.description?.toLowerCase()).includes(catFiltre.toLowerCase()) ||
        categories.find(c => String(c.id) === catFiltre)?.nom?.toLowerCase() === a.prestataire?.specialite?.toLowerCase();

      const matchVille = filtreVille === 'all' || a.adresse?.toLowerCase().includes(filtreVille.toLowerCase());
      const matchActif = !filtreActif || a.est_actif;
      return matchSearch && matchCat && matchVille && matchActif;
    }).sort((a, b) => {
      if (sortBy === 'nom') return a.nom.localeCompare(b.nom);
      if (sortBy === 'recents') return new Date(b.date_creation) - new Date(a.date_creation);
      return 0;
    }),
    [ateliers, search, catFiltre, filtreVille, filtreActif, sortBy, categories]
  );

  const zoomToAtelier = useCallback((a) => {
    setSelectedAtelier(a);
    if (a.latitude && a.longitude) {
      setCenter({ lat: parseFloat(a.latitude), lng: parseFloat(a.longitude) });
      setGoogleZoom(16);
    }
  }, []);

  const handleUseCurrentPosition = async () => {
    try {
      const coordinates = await Geolocation.getCurrentPosition();
      setCenter({ lat: coordinates.coords.latitude, lng: coordinates.coords.longitude });
      setGoogleZoom(13);
      setSelectedAtelier(null);
    } catch {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          pos => { setCenter({ lat: pos.coords.latitude, lng: pos.coords.longitude }); setGoogleZoom(13); setSelectedAtelier(null); },
          err => alert('Erreur de localisation : ' + err.message)
        );
      }
    }
  };

  const locateMe = handleUseCurrentPosition;

  const resetFilters = () => {
    setSearch(''); setCatFiltre('all'); setFiltreVille('all');
    setFiltreActif(true); setSortBy('nom');
  };

  const hasFilters = search || catFiltre !== 'all' || filtreVille !== 'all' || !filtreActif;

  if (loading) return (
    <>
      <style>{STYLES}</style>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 360, gap: 16 }}>
        <div className="at-spinner" />
        <p style={{ color: '#94a3b8', fontSize: '0.9rem', fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 600 }}>
          Chargement des ateliers…
        </p>
      </div>
    </>
  );

  return (
    <>
      <style>{STYLES}</style>
      <div className="at-page">

        {/* ── COMPACT HEADER ── */}
        <div className="at-compact-header">
          <div className="at-compact-header-orb" />
          <div className="container at-compact-header-inner">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
              <div>
                <h1 className="at-compact-title">
                  Carte des <span className="highlight">Ateliers</span>
                </h1>
                <p className="at-compact-sub">
                  Localisez les ateliers de vos artisans au Togo et obtenez leur itinéraire GPS.
                </p>
              </div>
              <div className="at-compact-kpis">
                <div className="at-compact-kpi">
                  <span className="at-compact-kpi-val">{ateliers.filter(a => a.est_actif).length}</span>
                  <span className="at-compact-kpi-lbl">Ateliers</span>
                </div>
                <div className="at-compact-kpi">
                  <span className="at-compact-kpi-val">{villes.length - 1}</span>
                  <span className="at-compact-kpi-lbl">Villes</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {gpsAtelier && <LeafletGPSInterne atelier={gpsAtelier} onClose={() => setGpsAtelier(null)} />}

        <div className="container">

          {/* ── FILTER CARD ── */}
          <div className="at-filter-card">
            {/* Search */}
            <div className="at-search-wrap">
              <i className="bi bi-search at-search-icon" />
              <input
                type="text"
                placeholder="Rechercher un atelier, une adresse, un artisan…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="at-search-input"
              />
              {search && (
                <button onClick={() => setSearch('')} className="at-search-clear">
                  <i className="bi bi-x" />
                </button>
              )}
            </div>

            {/* Category chips */}
            <div className="at-chips">
              <button
                onClick={() => setCatFiltre('all')}
                className={`at-chip ${catFiltre === 'all' ? 'active' : ''}`}
              >
                ✦ Toutes catégories
              </button>
              {categories.map(c => (
                <button
                  key={c.id}
                  onClick={() => setCatFiltre(String(c.id))}
                  className={`at-chip ${catFiltre === String(c.id) ? 'active' : ''}`}
                >
                  {c.icone && <i className={`bi ${c.icone}`} />}
                  {c.nom}
                </button>
              ))}
            </div>

            {/* Secondary filters */}
            <div className="at-filters-row">
              <select
                value={filtreVille}
                onChange={e => setFiltreVille(e.target.value)}
                className="at-select"
              >
                {villes.map(v => (
                  <option key={v} value={v}>{v === 'all' ? 'Toutes les villes' : v}</option>
                ))}
              </select>

              <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="at-select">
                <option value="nom">Nom A–Z</option>
                <option value="recents">Plus récents</option>
              </select>

              <label className="at-toggle-label">
                <div
                  className="at-toggle-track"
                  onClick={() => setFiltreActif(v => !v)}
                  style={{ background: filtreActif ? '#0284c7' : '#cbd5e1', cursor: 'pointer' }}
                >
                  <div
                    className="at-toggle-thumb"
                    style={{ left: filtreActif ? 22 : 3 }}
                  />
                </div>
                Actifs uniquement
              </label>

              <button onClick={locateMe} className="at-btn-locate">
                <i className="bi bi-crosshair2" /> Ma position
              </button>

              <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
                {hasFilters && (
                  <button onClick={resetFilters} className="at-btn-reset">
                    <i className="bi bi-x-circle" /> Reset
                  </button>
                )}
                <span className="at-count-badge">{ateliersFiltres.length}</span>
              </div>
            </div>
          </div>

          {/* ── MAP + LIST ── */}
          <div className="at-layout">

            {/* MAP */}
            <div className="at-map-wrap">
              <GoogleMapAtelierPicker
                ateliers={ateliersFiltres}
                selectedAtelier={selectedAtelier}
                onSelectAtelier={zoomToAtelier}
                zoom={googleZoom}
                searchLatLng={center}
                mapHeight="100%"
              />
            </div>

            {/* LIST */}
            <div className="at-list-wrap">
              {ateliersFiltres.length === 0 ? (
                <div className="at-empty">
                  <div style={{ fontSize: '2rem', marginBottom: 10 }}>📍</div>
                  <p style={{ fontWeight: 700, color: '#0c2340', fontSize: '0.9rem', margin: '0 0 6px', fontFamily: "'Outfit',sans-serif" }}>
                    Aucun atelier trouvé
                  </p>
                  <p style={{ color: '#94a3b8', fontSize: '0.8rem', margin: 0 }}>
                    Essayez de modifier vos filtres.
                  </p>
                </div>
              ) : ateliersFiltres.map((a, idx) => {
                const isSelected = selectedAtelier?.id === a.id;
                return (
                  <div
                    key={a.id}
                    onClick={() => zoomToAtelier(a)}
                    className={`at-item ${isSelected ? 'selected' : ''}`}
                    style={{ animationDelay: `${idx * 0.03}s`, animation: 'at-up 0.4s cubic-bezier(0.22,1,0.36,1) both' }}
                  >
                    <div className="at-item-header">
                      <div className={`at-item-icon ${!a.est_actif ? 'inactive' : ''}`}>
                        <i className="bi bi-shop" />
                      </div>
                      <div className="at-item-info">
                        <div className="at-item-name">{a.nom}</div>
                        <div className="at-item-addr">{a.adresse}</div>
                      </div>
                      <span className={`at-item-status ${a.est_actif ? 'active' : 'inactive'}`}>
                        <i className={`bi bi-circle-fill`} style={{ fontSize: '0.5rem' }} />
                        {a.est_actif ? 'Ouvert' : 'Fermé'}
                      </span>
                    </div>

                    {a.description && (
                      <div className="at-item-desc">{a.description}</div>
                    )}

                    <div className="at-item-actions">
                      {a.telephone && (
                        <a
                          href={`tel:${a.telephone}`}
                          onClick={e => e.stopPropagation()}
                          className="at-btn-call"
                        >
                          <i className="bi bi-telephone-fill" /> Appeler
                        </a>
                      )}
                      <button
                        onClick={e => { e.stopPropagation(); setGpsAtelier(a); }}
                        className="at-btn-gps"
                      >
                        <i className="bi bi-navigation-fill" /> GPS
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// ─── AjouterAtelier ────────────────────────────────────────────
const FORM_STYLES = `
.atf-page {
  font-family: 'Plus Jakarta Sans', sans-serif;
  background: #f8fafc;
  min-height: 100vh;
  padding-bottom: 80px;
}

.atf-hero {
  background: linear-gradient(135deg, #0c2340 0%, #0369a1 100%);
  padding: 40px 0 56px;
  color: white;
  position: relative;
  overflow: hidden;
  margin-bottom: -36px;
}

.atf-hero::before {
  content: '';
  position: absolute;
  top: -80px; right: -60px;
  width: 360px; height: 360px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(56,189,248,0.15) 0%, transparent 70%);
  filter: blur(60px);
  pointer-events: none;
}

.atf-hero-inner {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  gap: 16px;
  animation: at-up 0.5s cubic-bezier(0.22,1,0.36,1) both;
}

.atf-hero-icon {
  width: 52px; height: 52px;
  border-radius: 16px;
  background: rgba(255,255,255,0.12);
  border: 1px solid rgba(255,255,255,0.2);
  display: flex; align-items: center; justify-content: center;
  font-size: 1.4rem;
  flex-shrink: 0;
}

.atf-hero-title {
  font-family: 'Outfit', sans-serif;
  font-weight: 800;
  font-size: 1.6rem;
  margin: 0 0 4px;
  color: white;
  letter-spacing: -0.01em;
}

.atf-hero-sub {
  color: rgba(255,255,255,0.65);
  font-size: 0.87rem;
  margin: 0;
}

.atf-form-card {
  background: white;
  border-radius: 24px;
  border: 1px solid #e2e8f0;
  padding: 28px;
  box-shadow: 0 8px 30px rgba(12,35,64,0.06);
  position: relative;
  z-index: 5;
  animation: at-up 0.5s cubic-bezier(0.22,1,0.36,1) 0.1s both;
}

.atf-field-label {
  font-weight: 700;
  font-size: 0.83rem;
  color: #374151;
  margin-bottom: 6px;
  display: block;
  letter-spacing: 0.01em;
}

.atf-input {
  width: 100%;
  padding: 12px 16px;
  border: 1.5px solid #e2e8f0;
  border-radius: 14px;
  font-size: 0.9rem;
  background: #f8fafc;
  outline: none;
  transition: all 0.2s;
  color: #0c2340;
  font-family: inherit;
}

.atf-input:focus {
  border-color: #0284c7;
  background: white;
  box-shadow: 0 0 0 4px rgba(2,132,199,0.1);
}

.atf-error {
  color: #ef4444;
  font-size: 0.78rem;
  margin-top: 5px;
  display: flex;
  align-items: center;
  gap: 5px;
}

.atf-info-card {
  background: #f0f9ff;
  border-radius: 20px;
  border: 1px solid #bae6fd;
  padding: 22px;
  position: sticky;
  top: 80px;
  animation: at-up 0.5s cubic-bezier(0.22,1,0.36,1) 0.2s both;
}

.atf-info-title {
  font-weight: 800;
  color: #0c2340;
  margin-bottom: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.92rem;
}

.atf-btn-back {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 11px 20px;
  background: #f1f5f9;
  border: 1.5px solid #e2e8f0;
  color: #475569;
  border-radius: 14px;
  font-weight: 700;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s;
  font-family: inherit;
}

.atf-btn-back:hover { background: #e2e8f0; color: #0c2340; }

.atf-btn-submit {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 11px 28px;
  background: linear-gradient(135deg, #0284c7, #0369a1);
  color: white;
  border-radius: 14px;
  border: none;
  font-weight: 700;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 4px 12px rgba(2,132,199,0.25);
  font-family: inherit;
}

.atf-btn-submit:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 8px 20px rgba(2,132,199,0.35);
}

.atf-btn-submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .atf-wrap { flex-direction: column !important; }
  .atf-info-card { position: static !important; }
}
`;

export function AjouterAtelier() {
  const [form, setForm] = useState({
    nom: '', adresse: '', latitude: '', longitude: '',
    telephone: '', description: '', est_actif: true,
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const mapRef = useRef(null);
  const markerRef = useRef(null);

  const set = f => e =>
    setForm(p => ({ ...p, [f]: e.type === 'checkbox' ? e.target.checked : e.target.value }));

  const handleUseCurrentPosition = async () => {
    let lat = null;
    let lng = null;
    try {
      const coordinates = await Geolocation.getCurrentPosition();
      lat = coordinates.coords.latitude;
      lng = coordinates.coords.longitude;
    } catch {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          pos => {
            const lat2 = pos.coords.latitude;
            const lng2 = pos.coords.longitude;
            setForm(p => ({ ...p, latitude: lat2.toFixed(6), longitude: lng2.toFixed(6) }));
            if (mapRef.current) {
              const latlng = [lat2, lng2];
              mapRef.current.setView(latlng, 15);
              if (markerRef.current) {
                markerRef.current.setLatLng(latlng);
              } else {
                markerRef.current = window.L.marker(latlng).addTo(mapRef.current);
              }
            }
          },
          err => alert('Erreur de localisation : ' + err.message)
        );
        return;
      } else {
        alert("La géolocalisation n'est pas supportée par votre appareil.");
        return;
      }
    }
    if (lat && lng) {
      setForm(p => ({ ...p, latitude: lat.toFixed(6), longitude: lng.toFixed(6) }));
      if (mapRef.current) {
        const latlng = [lat, lng];
        mapRef.current.setView(latlng, 15);
        if (markerRef.current) {
          markerRef.current.setLatLng(latlng);
        } else {
          markerRef.current = window.L.marker(latlng).addTo(mapRef.current);
        }
      }
    }
  };

  useEffect(() => {
    if (!window.L) return;
    const existing = document.getElementById('map-ajouter');
    if (existing && existing._leaflet_id) return;
    const map = window.L.map('map-ajouter').setView([6.125580, 1.232456], 7);
    window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap' }).addTo(map);
    mapRef.current = map;
    
    if (form.latitude && form.longitude) {
      const latlng = [parseFloat(form.latitude), parseFloat(form.longitude)];
      map.setView(latlng, 14);
      markerRef.current = window.L.marker(latlng).addTo(map);
    }

    map.on('click', e => {
      const { lat, lng } = e.latlng;
      setForm(p => ({ ...p, latitude: lat.toFixed(6), longitude: lng.toFixed(6) }));
      if (markerRef.current) markerRef.current.setLatLng(e.latlng);
      else markerRef.current = window.L.marker(e.latlng).addTo(map);
    });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true); setErrors({});
    try { await api.post('/ateliers/', form); navigate('/mes-ateliers'); }
    catch (err) { setErrors(err.response?.data || {}); }
    finally { setLoading(false); }
  };

  const VILLES = [
    ['Lomé', '6.1256, 1.2325'],
    ['Kpalimé', '6.9000, 0.6333'],
    ['Sokodé', '8.5667, 0.9833'],
    ['Kara', '9.5500, 1.1667'],
    ['Dapaong', '10.7833, 0.0333'],
  ];

  return (
    <>
      <style>{STYLES}{FORM_STYLES}</style>
      <div className="atf-page">

        {/* HERO */}
        <div className="at-hero atf-hero" style={{ padding: '40px 0 56px' }}>
          <div className="container">
            <div className="atf-hero-inner">
              <div className="atf-hero-icon"><i className="bi bi-plus-circle-fill" /></div>
              <div>
                <h2 className="atf-hero-title">Ajouter un Atelier</h2>
                <p className="atf-hero-sub">Référencez votre atelier pour être visible des clients</p>
              </div>
            </div>
          </div>
        </div>

        <div className="container" style={{ position: 'relative', zIndex: 5 }}>
          <div className="atf-wrap" style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>

            {/* FORM */}
            <div style={{ flex: 2 }}>
              <div className="atf-form-card">
                <form onSubmit={handleSubmit}>
                  {/* Nom */}
                  <div style={{ marginBottom: 18 }}>
                    <label className="atf-field-label">Nom de l'atelier *</label>
                    <input type="text" value={form.nom} onChange={set('nom')} required className="atf-input" placeholder="Ex: Atelier Mensah Électricité" />
                    {errors.nom && <div className="atf-error"><i className="bi bi-exclamation-circle" />{errors.nom}</div>}
                  </div>

                  {/* Adresse */}
                  <div style={{ marginBottom: 18 }}>
                    <label className="atf-field-label">Adresse *</label>
                    <textarea value={form.adresse} onChange={set('adresse')} required rows={2} className="atf-input" style={{ resize: 'vertical' }} placeholder="Ex: Quartier Bè, près du marché, Lomé" />
                  </div>

                  {/* Lat/Lng and Geoloc Button */}
                  <div style={{ marginBottom: 18 }}>
                    <button
                      type="button"
                      onClick={handleUseCurrentPosition}
                      style={{
                        width: '100%',
                        padding: '12px',
                        borderRadius: '12px',
                        border: '1.5px solid #bae6fd',
                        background: '#f0f9ff',
                        color: '#0284c7',
                        fontWeight: '800',
                        fontSize: '0.88rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        marginBottom: '14px',
                        fontFamily: 'inherit'
                      }}
                      onMouseOver={e => e.currentTarget.style.background = '#e0f2fe'}
                      onMouseOut={e => e.currentTarget.style.background = '#f0f9ff'}
                    >
                      <i className="bi bi-geo-alt-fill" /> Utiliser ma position actuelle
                    </button>
                    <div style={{ display: 'flex', gap: 14 }}>
                      <div style={{ flex: 1 }}>
                        <label className="atf-field-label">Latitude</label>
                        <input type="number" readOnly value={form.latitude} className="atf-input" style={{ background: '#f1f5f9', cursor: 'not-allowed' }} placeholder="Auto-détectée" />
                      </div>
                      <div style={{ flex: 1 }}>
                        <label className="atf-field-label">Longitude</label>
                        <input type="number" readOnly value={form.longitude} className="atf-input" style={{ background: '#f1f5f9', cursor: 'not-allowed' }} placeholder="Auto-détectée" />
                      </div>
                    </div>
                  </div>

                  {/* Map */}
                  <div style={{ marginBottom: 18 }}>
                    <label className="atf-field-label">
                      <i className="bi bi-map" style={{ color: '#0284c7' }} /> Cliquez sur la carte pour positionner l'atelier
                    </label>
                    <div id="map-ajouter" style={{ height: 280, borderRadius: 16, overflow: 'hidden', border: '1.5px solid #e2e8f0' }} />
                    {form.latitude && form.longitude && (
                      <div style={{ marginTop: 8, fontSize: '0.8rem', color: '#16a34a', display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600 }}>
                        <i className="bi bi-check-circle-fill" /> Position sélectionnée : {form.latitude}, {form.longitude}
                      </div>
                    )}
                  </div>

                  {/* Téléphone */}
                  <div style={{ marginBottom: 18 }}>
                    <label className="atf-field-label">Téléphone</label>
                    <input type="text" value={form.telephone} onChange={set('telephone')} className="atf-input" placeholder="Ex: 90 00 00 00" />
                  </div>

                  {/* Description */}
                  <div style={{ marginBottom: 20 }}>
                    <label className="atf-field-label">Services proposés</label>
                    <textarea value={form.description} onChange={set('description')} rows={3} className="atf-input" style={{ resize: 'vertical' }} placeholder="Ex: Plomberie, électricité, réparation générale…" />
                  </div>

                  {/* Toggle actif */}
                  <label style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', marginBottom: 24, padding: '14px 16px', background: form.est_actif ? '#f0fdf4' : '#f8fafc', border: `1.5px solid ${form.est_actif ? '#bbf7d0' : '#e2e8f0'}`, borderRadius: 14, transition: 'all 0.2s' }}>
                    <div
                      onClick={() => setForm(p => ({ ...p, est_actif: !p.est_actif }))}
                      style={{ width: 44, height: 24, borderRadius: 12, background: form.est_actif ? '#16a34a' : '#cbd5e1', position: 'relative', flexShrink: 0, cursor: 'pointer', transition: 'background 0.2s' }}
                    >
                      <div style={{ position: 'absolute', top: 3, left: form.est_actif ? 22 : 3, width: 18, height: 18, borderRadius: '50%', background: 'white', transition: 'left 0.2s', boxShadow: '0 1px 4px rgba(0,0,0,0.2)' }} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.88rem', color: form.est_actif ? '#15803d' : '#374151' }}>
                        {form.est_actif ? '✓ Atelier actif' : 'Atelier inactif'}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: 2 }}>
                        {form.est_actif ? 'Visible par les clients sur la carte' : 'Masqué de la carte clients'}
                      </div>
                    </div>
                  </label>

                  {/* Buttons */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                    <button type="button" onClick={() => navigate('/mes-ateliers')} className="atf-btn-back">
                      <i className="bi bi-arrow-left" /> Retour
                    </button>
                    <button type="submit" disabled={loading} className="atf-btn-submit">
                      {loading
                        ? <><i className="bi bi-hourglass-split" /> Enregistrement…</>
                        : <><i className="bi bi-check-circle-fill" /> Enregistrer l'atelier</>
                      }
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* INFO CARD */}
            <div style={{ flex: 1, minWidth: 220 }}>
              <div className="atf-info-card">
                <div className="atf-info-title">
                  <i className="bi bi-info-circle-fill" style={{ color: '#0284c7' }} />
                  Trouver les coordonnées GPS
                </div>
                <ol style={{ paddingLeft: 18, lineHeight: 2.1, fontSize: '0.84rem', color: '#475569', marginBottom: 20 }}>
                  <li>Ouvrez <strong>Google Maps</strong></li>
                  <li>Naviguez vers l'emplacement</li>
                  <li>Appuyez longtemps sur le point</li>
                  <li>Copiez les coordonnées</li>
                </ol>
                <div style={{ fontWeight: 800, color: '#0c2340', marginBottom: 12, fontSize: '0.88rem' }}>Villes principales du Togo</div>
                {VILLES.map(([v, c]) => (
                  <div
                    key={v}
                    style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '7px 0', borderBottom: '1px solid #e0f2fe' }}
                    onClick={() => {
                      const [lat, lng] = c.split(',').map(s => s.trim());
                      setForm(p => ({ ...p, latitude: lat, longitude: lng }));
                    }}
                  >
                    <span style={{ fontWeight: 700, color: '#0c2340', fontSize: '0.84rem', cursor: 'pointer' }}>{v}</span>
                    <span style={{ color: '#64748b', fontFamily: 'monospace', fontSize: '0.75rem' }}>{c}</span>
                  </div>
                ))}
                <div style={{ marginTop: 12, fontSize: '0.75rem', color: '#94a3b8', fontStyle: 'italic' }}>
                  Cliquez sur une ville pour préremplir les coordonnées.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
