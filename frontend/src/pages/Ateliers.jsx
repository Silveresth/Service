import { useEffect, useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import GoogleMapAtelierPicker from '../components/GoogleMapAtelierPicker';
import LeafletGPSInterne from '../components/LeafletGPSInterne';

// ─── Types de services ────────────────────────────────────────
const TYPES_SERVICES = [
  { id: 'all',          label: 'Tous',          icon: 'bi-grid-3x3-gap-fill' },
  { id: 'plomberie',    label: 'Plomberie',     icon: 'bi-droplet-fill' },
  { id: 'electricite',  label: 'Électricité',   icon: 'bi-lightning-fill' },
  { id: 'mecanique',    label: 'Mécanique',     icon: 'bi-gear-fill' },
  { id: 'menuiserie',   label: 'Menuiserie',    icon: 'bi-tools' },
  { id: 'peinture',     label: 'Peinture',      icon: 'bi-palette-fill' },
  { id: 'informatique', label: 'Informatique',  icon: 'bi-laptop' },
  { id: 'climatisation',label: 'Climatisation', icon: 'bi-thermometer-half' },
  { id: 'jardinage',    label: 'Jardinage',     icon: 'bi-tree-fill' },
  { id: 'maconnerie',   label: 'Maçonnerie',    icon: 'bi-building' },
  { id: 'autre',        label: 'Autre',         icon: 'bi-three-dots' },
];

// ─── CarteAteliers ────────────────────────────────────────────
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
  const [center, setCenter] = useState({ lat: 6.125580, lng: 1.232456 });
  const [googleZoom, setGoogleZoom] = useState(7);

  useEffect(() => {
    api.get('/ateliers/')
      .then(r => setAteliers(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const villes = useMemo(() =>
    ['all', ...new Set(ateliers.map(a => {
      const parts = a.adresse?.split(',');
      return parts?.[parts.length - 1]?.trim() || '';
    }).filter(Boolean))],
    [ateliers]
  );

  const ateliersFiltres = useMemo(() => ateliers.filter(a => {
    const q = search.toLowerCase();
    const matchSearch = !q ||
      a.nom?.toLowerCase().includes(q) ||
      a.adresse?.toLowerCase().includes(q) ||
      a.prestataire?.user?.username?.toLowerCase().includes(q) ||
      a.description?.toLowerCase().includes(q);
    const matchType = filtreType === 'all' ||
      a.prestataire?.specialite?.toLowerCase().includes(filtreType) ||
      a.description?.toLowerCase().includes(filtreType);
    const matchVille = filtreVille === 'all' || a.adresse?.toLowerCase().includes(filtreVille);
    const matchActif = !filtreActif || a.est_actif;
    return matchSearch && matchType && matchVille && matchActif;
  }).sort((a, b) => {
    if (sortBy === 'nom') return a.nom.localeCompare(b.nom);
    if (sortBy === 'recents') return new Date(b.date_creation) - new Date(a.date_creation);
    return 0;
  }), [ateliers, search, filtreType, filtreVille, filtreActif, sortBy]);

  const zoomToAtelier = useCallback((a) => {
    setSelectedAtelier(a);
    if (a.latitude && a.longitude) {
      setCenter({ lat: parseFloat(a.latitude), lng: parseFloat(a.longitude) });
      setGoogleZoom(16);
    }
  }, []);

  const locateMe = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(pos => {
      setCenter({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      setGoogleZoom(13);
      setSelectedAtelier(null);
    });
  };

  const resetFilters = () => {
    setSearch(''); setFiltreType('all'); setFiltreVille('all');
    setFiltreActif(true); setSortBy('nom');
  };

  if (loading) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 320, gap: 16 }}>
      <div style={{
        width: 52, height: 52, borderRadius: '50%',
        border: '4px solid #e2e8f0', borderTopColor: '#0284c7',
        animation: 'spin 0.8s linear infinite',
      }} />
      <span style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Chargement des ateliers…</span>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  );

  return (
    <div style={{ padding: '32px 0 48px' }}>
      {gpsAtelier && <LeafletGPSInterne atelier={gpsAtelier} onClose={() => setGpsAtelier(null)} />}

      <div className="container">

        {/* ── En-tête de page ── */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 6 }}>
            <div style={{
              width: 48, height: 48, borderRadius: 14,
              background: 'linear-gradient(135deg, #0284c7, #0369a1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(2,132,199,0.3)',
            }}>
              <i className="bi bi-geo-alt-fill" style={{ fontSize: '1.4rem', color: 'white' }} />
            </div>
            <div>
              <h2 style={{ margin: 0, fontWeight: 800, fontSize: '1.5rem', color: '#0c2340' }}>
                Carte des Ateliers
              </h2>
              <p style={{ margin: 0, color: '#64748b', fontSize: '0.88rem' }}>
                {ateliers.length} ateliers · Naviguez directement vers eux
              </p>
            </div>
          </div>
        </div>

        {/* ── Filtres ── */}
        <div style={{
          background: 'white', borderRadius: 16,
          padding: '16px 20px', marginBottom: 20,
          border: '1px solid #e2e8f0',
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
        }}>
          {/* Barre de recherche */}
          <div style={{ position: 'relative', marginBottom: 14 }}>
            <i className="bi bi-search" style={{
              position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
              color: '#94a3b8', fontSize: '0.95rem', pointerEvents: 'none',
            }} />
            <input
              type="text"
              placeholder="Rechercher un atelier, adresse, prestataire…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                width: '100%', padding: '10px 40px 10px 40px',
                border: '1.5px solid #e2e8f0', borderRadius: 12,
                fontSize: '0.9rem', background: '#f8fafc',
                outline: 'none', transition: 'border-color 0.15s',
              }}
              onFocus={e => e.target.style.borderColor = '#0284c7'}
              onBlur={e => e.target.style.borderColor = '#e2e8f0'}
            />
            {search && (
              <button onClick={() => setSearch('')} style={{
                position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                background: '#e2e8f0', border: 'none', borderRadius: 6,
                width: 22, height: 22, display: 'flex', alignItems: 'center',
                justifyContent: 'center', cursor: 'pointer', color: '#64748b', fontSize: '0.75rem',
              }}>
                <i className="bi bi-x" />
              </button>
            )}
          </div>

          {/* Pills de types */}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14 }}>
            {TYPES_SERVICES.map(t => {
              const active = filtreType === t.id;
              return (
                <button key={t.id} onClick={() => setFiltreType(t.id)} style={{
                  padding: '5px 13px', borderRadius: 20,
                  border: `1.5px solid ${active ? '#0284c7' : '#e2e8f0'}`,
                  background: active ? '#0284c7' : 'white',
                  color: active ? 'white' : '#64748b',
                  fontWeight: active ? 700 : 500, fontSize: '0.8rem',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5,
                  transition: 'all 0.12s', whiteSpace: 'nowrap', flexShrink: 0,
                  boxShadow: active ? '0 2px 8px rgba(2,132,199,0.25)' : 'none',
                }}>
                  <i className={t.icon} style={{ fontSize: '0.78rem' }} />
                  {t.label}
                </button>
              );
            })}
          </div>

          {/* Ligne de filtres secondaires */}
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            <select value={filtreVille} onChange={e => setFiltreVille(e.target.value)} style={{
              padding: '7px 12px', border: '1.5px solid #e2e8f0',
              borderRadius: 10, fontSize: '0.83rem', background: '#f8fafc',
              color: '#374151', cursor: 'pointer', outline: 'none',
            }}>
              {villes.slice(0, 8).map(v => (
                <option key={v} value={v}>{v === 'all' ? 'Toutes les villes' : v}</option>
              ))}
            </select>

            <select value={sortBy} onChange={e => setSortBy(e.target.value)} style={{
              padding: '7px 12px', border: '1.5px solid #e2e8f0',
              borderRadius: 10, fontSize: '0.83rem', background: '#f8fafc',
              color: '#374151', cursor: 'pointer', outline: 'none',
            }}>
              <option value="nom">Nom A–Z</option>
              <option value="recents">Plus récents</option>
            </select>

            <label style={{ display: 'flex', alignItems: 'center', gap: 7, cursor: 'pointer', userSelect: 'none' }}>
              <div
                onClick={() => setFiltreActif(!filtreActif)}
                style={{
                  width: 36, height: 20, borderRadius: 10, position: 'relative',
                  background: filtreActif ? '#0284c7' : '#cbd5e1',
                  transition: 'background 0.2s', cursor: 'pointer', flexShrink: 0,
                }}
              >
                <div style={{
                  position: 'absolute', top: 2,
                  left: filtreActif ? 18 : 2,
                  width: 16, height: 16, borderRadius: '50%',
                  background: 'white', transition: 'left 0.2s',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                }} />
              </div>
              <span style={{ fontSize: '0.83rem', color: '#64748b', fontWeight: 500 }}>Actifs</span>
            </label>

            <button onClick={locateMe} style={{
              padding: '7px 14px', borderRadius: 10,
              border: '1.5px solid #bae6fd', background: '#f0f9ff',
              color: '#0284c7', fontWeight: 600, fontSize: '0.83rem',
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
              transition: 'background 0.15s',
            }}
              onMouseEnter={e => e.currentTarget.style.background = '#e0f2fe'}
              onMouseLeave={e => e.currentTarget.style.background = '#f0f9ff'}
            >
              <i className="bi bi-crosshair2" /> Ma position
            </button>

            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
              {(search || filtreType !== 'all' || filtreVille !== 'all' || !filtreActif) && (
                <button onClick={resetFilters} style={{
                  fontSize: '0.8rem', color: '#94a3b8',
                  background: 'none', border: 'none', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 4,
                  padding: '4px 8px', borderRadius: 6,
                  transition: 'color 0.15s',
                }}
                  onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
                  onMouseLeave={e => e.currentTarget.style.color = '#94a3b8'}
                >
                  <i className="bi bi-x-circle" /> Réinitialiser
                </button>
              )}
              <span style={{
                background: '#f0f9ff', color: '#0284c7',
                fontWeight: 700, fontSize: '0.8rem',
                padding: '4px 10px', borderRadius: 20,
                border: '1px solid #bae6fd',
              }}>
                {ateliersFiltres.length} résultat{ateliersFiltres.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
        </div>

        {/* ── Carte + Liste ── */}
        <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>

          {/* Carte */}
          <div style={{
            flex: 2, borderRadius: 16, overflow: 'hidden',
            border: '1px solid #e2e8f0',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
          }}>
            <GoogleMapAtelierPicker
              ateliers={ateliersFiltres}
              selectedAtelier={selectedAtelier}
              onSelectAtelier={zoomToAtelier}
              zoom={googleZoom}
              searchLatLng={center}
              mapHeight={'min(420px, 50vh)'}
            />
          </div>

          {/* Liste */}
          <div style={{
            flex: 1, minWidth: 270, maxWidth: 340,
            maxHeight: 'min(520px, 52vh)',
            overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8,
          }}>
            {ateliersFiltres.length === 0 ? (
              <div style={{
                textAlign: 'center', padding: '40px 20px',
                background: 'white', borderRadius: 16,
                border: '1px solid #e2e8f0', color: '#94a3b8',
              }}>
                <i className="bi bi-shop" style={{ fontSize: '2.5rem', display: 'block', marginBottom: 12 }} />
                <div style={{ fontWeight: 600, color: '#475569', marginBottom: 4 }}>Aucun atelier trouvé</div>
                <div style={{ fontSize: '0.82rem' }}>Modifiez vos filtres pour voir plus de résultats.</div>
              </div>
            ) : (
              ateliersFiltres.map(a => {
                const isSelected = selectedAtelier?.id === a.id;
                return (
                  <div
                    key={a.id}
                    onClick={() => zoomToAtelier(a)}
                    style={{
                      background: 'white', borderRadius: 14, padding: '12px 14px',
                      cursor: 'pointer', transition: 'all 0.15s',
                      border: `2px solid ${isSelected ? '#0284c7' : '#e2e8f0'}`,
                      boxShadow: isSelected
                        ? '0 4px 16px rgba(2,132,199,0.15)'
                        : '0 1px 4px rgba(0,0,0,0.04)',
                      transform: isSelected ? 'translateY(-1px)' : 'none',
                    }}
                    onMouseEnter={e => { if (!isSelected) e.currentTarget.style.borderColor = '#bae6fd'; }}
                    onMouseLeave={e => { if (!isSelected) e.currentTarget.style.borderColor = '#e2e8f0'; }}
                  >
                    {/* Ligne titre + badge */}
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 5, gap: 6 }}>
                      <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#0c2340', flex: 1, lineHeight: 1.3 }}>
                        {a.nom}
                      </div>
                      {a.est_actif && (
                        <span style={{
                          background: '#f0fdf4', color: '#16a34a',
                          padding: '2px 8px', borderRadius: 20,
                          fontSize: '0.68rem', fontWeight: 700, flexShrink: 0,
                          border: '1px solid #bbf7d0',
                        }}>
                          ● Actif
                        </span>
                      )}
                    </div>

                    {/* Adresse */}
                    <div style={{ fontSize: '0.78rem', color: '#64748b', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <i className="bi bi-geo-alt" style={{ flexShrink: 0 }} />
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {a.adresse}
                      </span>
                    </div>

                    {/* Prestataire + spécialité */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                      <i className="bi bi-person" style={{ fontSize: '0.78rem', color: '#94a3b8' }} />
                      <span style={{ fontSize: '0.78rem', color: '#64748b' }}>{a.prestataire?.user?.username}</span>
                      {a.prestataire?.specialite && (
                        <span style={{
                          background: '#eff6ff', color: '#2563eb',
                          padding: '1px 7px', borderRadius: 10,
                          fontSize: '0.68rem', fontWeight: 600,
                        }}>
                          {a.prestataire.specialite}
                        </span>
                      )}
                    </div>

                    {/* Description */}
                    {a.description && (
                      <p style={{ fontSize: '0.76rem', color: '#94a3b8', margin: '4px 0 8px', lineHeight: 1.4 }}>
                        {a.description.slice(0, 70)}{a.description.length > 70 ? '…' : ''}
                      </p>
                    )}

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                      <a href={`tel:${a.telephone}`}
                        onClick={e => e.stopPropagation()}
                        style={{
                          padding: '5px 10px', borderRadius: 8,
                          background: '#f0fdf4', border: '1px solid #bbf7d0',
                          color: '#16a34a', fontSize: '0.78rem', fontWeight: 600,
                          display: 'flex', alignItems: 'center', gap: 5, textDecoration: 'none',
                          transition: 'background 0.15s',
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = '#dcfce7'}
                        onMouseLeave={e => e.currentTarget.style.background = '#f0fdf4'}
                      >
                        <i className="bi bi-telephone-fill" /> Appeler
                      </a>
                      <a href={`https://wa.me/228${a.telephone}`}
                        target="_blank" rel="noreferrer"
                        onClick={e => e.stopPropagation()}
                        style={{
                          padding: '5px 10px', borderRadius: 8,
                          background: '#25D366', border: 'none',
                          color: 'white', fontSize: '0.78rem', fontWeight: 600,
                          display: 'flex', alignItems: 'center', gap: 5, textDecoration: 'none',
                          transition: 'background 0.15s',
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = '#1da851'}
                        onMouseLeave={e => e.currentTarget.style.background = '#25D366'}
                      >
                        <i className="bi bi-whatsapp" /> WA
                      </a>
                      <button
                        onClick={e => { e.stopPropagation(); setGpsAtelier(a); }}
                        style={{
                          marginLeft: 'auto', padding: '5px 12px', borderRadius: 8,
                          background: 'linear-gradient(135deg, #0284c7, #0369a1)',
                          border: 'none', color: 'white',
                          fontSize: '0.78rem', fontWeight: 700,
                          display: 'flex', alignItems: 'center', gap: 5, cursor: 'pointer',
                          boxShadow: '0 2px 6px rgba(2,132,199,0.3)',
                          transition: 'transform 0.12s, box-shadow 0.12s',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 4px 10px rgba(2,132,199,0.4)'; }}
                        onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 2px 6px rgba(2,132,199,0.3)'; }}
                      >
                        <i className="bi bi-compass-fill" /> GPS
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── AjouterAtelier ────────────────────────────────────────────
export function AjouterAtelier() {
  const [form, setForm] = useState({ nom: '', adresse: '', latitude: '', longitude: '', telephone: '', description: '', est_actif: true });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const set = f => e => setForm(p => ({ ...p, [f]: e.type === 'checkbox' ? e.target.checked : e.target.value }));

  useEffect(() => {
    if (!window.L) return;
    const existing = document.getElementById('map-ajouter');
    if (existing && existing._leaflet_id) return;
    const map = window.L.map('map-ajouter').setView([6.125580, 1.232456], 7);
    window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap' }).addTo(map);
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
    <div style={{ padding: '32px 0 48px' }}>
      <div className="container">
        <div style={{ marginBottom: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 6 }}>
            <div style={{
              width: 48, height: 48, borderRadius: 14,
              background: 'linear-gradient(135deg, #0284c7, #0369a1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(2,132,199,0.3)',
            }}>
              <i className="bi bi-plus-circle-fill" style={{ fontSize: '1.4rem', color: 'white' }} />
            </div>
            <div>
              <h2 style={{ margin: 0, fontWeight: 800, fontSize: '1.5rem', color: '#0c2340' }}>Ajouter un Atelier</h2>
              <p style={{ margin: 0, color: '#64748b', fontSize: '0.88rem' }}>Référencez votre atelier pour être visible des clients</p>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 20 }}>
          <div style={{ flex: 2 }}>
            <div style={{ background: 'white', borderRadius: 16, padding: '24px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
              <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ fontWeight: 600, fontSize: '0.85rem', color: '#374151', marginBottom: 6, display: 'block' }}>Nom de l'atelier *</label>
                  <input type="text" className="form-control" value={form.nom} onChange={set('nom')} required />
                  {errors.nom && <div style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: 4 }}>{errors.nom}</div>}
                </div>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ fontWeight: 600, fontSize: '0.85rem', color: '#374151', marginBottom: 6, display: 'block' }}>Adresse *</label>
                  <textarea className="form-control" value={form.adresse} onChange={set('adresse')} required />
                </div>
                <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontWeight: 600, fontSize: '0.85rem', color: '#374151', marginBottom: 6, display: 'block' }}>Latitude</label>
                    <input type="number" step="0.000001" className="form-control" value={form.latitude} onChange={set('latitude')} placeholder="6.125580" />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontWeight: 600, fontSize: '0.85rem', color: '#374151', marginBottom: 6, display: 'block' }}>Longitude</label>
                    <input type="number" step="0.000001" className="form-control" value={form.longitude} onChange={set('longitude')} placeholder="1.232456" />
                  </div>
                </div>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ fontWeight: 600, fontSize: '0.85rem', color: '#374151', marginBottom: 6, display: 'block' }}>
                    Cliquez sur la carte pour positionner l'atelier
                  </label>
                  <div id="map-ajouter" style={{ height: 280, borderRadius: 12, overflow: 'hidden', border: '1.5px solid #e2e8f0' }} />
                  {(form.latitude && form.longitude) && (
                    <div style={{ marginTop: 6, fontSize: '0.8rem', color: '#16a34a', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <i className="bi bi-check-circle-fill" /> Position sélectionnée : {form.latitude}, {form.longitude}
                    </div>
                  )}
                </div>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ fontWeight: 600, fontSize: '0.85rem', color: '#374151', marginBottom: 6, display: 'block' }}>Téléphone</label>
                  <input type="text" className="form-control" value={form.telephone} onChange={set('telephone')} />
                </div>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ fontWeight: 600, fontSize: '0.85rem', color: '#374151', marginBottom: 6, display: 'block' }}>Services proposés</label>
                  <textarea className="form-control" value={form.description} onChange={set('description')} placeholder="Ex: Plomberie, électricité, réparation générale…" />
                </div>
                <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', marginBottom: 20 }}>
                  <div
                    onClick={() => setForm(p => ({ ...p, est_actif: !p.est_actif }))}
                    style={{
                      width: 44, height: 24, borderRadius: 12, position: 'relative',
                      background: form.est_actif ? '#0284c7' : '#cbd5e1',
                      transition: 'background 0.2s', cursor: 'pointer', flexShrink: 0,
                    }}
                  >
                    <div style={{
                      position: 'absolute', top: 3,
                      left: form.est_actif ? 22 : 3,
                      width: 18, height: 18, borderRadius: '50%',
                      background: 'white', transition: 'left 0.2s',
                      boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
                    }} />
                  </div>
                  <span style={{ fontSize: '0.88rem', fontWeight: 600, color: '#374151' }}>
                    {form.est_actif ? 'Atelier actif (visible des clients)' : 'Atelier inactif (masqué)'}
                  </span>
                </label>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                  <button type="button" onClick={() => navigate('/mes-ateliers')} style={{
                    padding: '10px 20px', borderRadius: 12,
                    background: '#f1f5f9', border: '1.5px solid #e2e8f0',
                    color: '#475569', fontWeight: 600, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.9rem',
                  }}>
                    <i className="bi bi-arrow-left" /> Retour
                  </button>
                  <button type="submit" disabled={loading} style={{
                    padding: '10px 24px', borderRadius: 12,
                    background: loading ? '#94a3b8' : 'linear-gradient(135deg, #0284c7, #0369a1)',
                    border: 'none', color: 'white', fontWeight: 700,
                    cursor: loading ? 'not-allowed' : 'pointer',
                    display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.9rem',
                    boxShadow: loading ? 'none' : '0 4px 12px rgba(2,132,199,0.3)',
                  }}>
                    {loading
                      ? <><i className="bi bi-hourglass-split" /> Enregistrement…</>
                      : <><i className="bi bi-check-circle-fill" /> Enregistrer l'atelier</>
                    }
                  </button>
                </div>
              </form>
            </div>
          </div>

          <div style={{ flex: 1, minWidth: 220 }}>
            <div style={{
              background: '#f0f9ff', borderRadius: 16, padding: '20px',
              border: '1px solid #bae6fd', position: 'sticky', top: 80,
            }}>
              <div style={{ fontWeight: 700, color: '#0c2340', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                <i className="bi bi-info-circle-fill" style={{ color: '#0284c7' }} />
                Trouver les coordonnées
              </div>
              <ol style={{ paddingLeft: 18, lineHeight: 2, fontSize: '0.85rem', color: '#475569', marginBottom: 16 }}>
                <li>Ouvrez Google Maps</li>
                <li>Allez à l'emplacement</li>
                <li>Appuyez longtemps sur le point</li>
                <li>Copiez les coordonnées affichées</li>
              </ol>
              <div style={{ fontWeight: 700, color: '#0c2340', marginBottom: 10, fontSize: '0.88rem' }}>Villes du Togo</div>
              {[['Lomé', '6.1256, 1.2325'], ['Kpalimé', '6.9000, 0.6333'], ['Sokodé', '8.5667, 0.9833'], ['Kara', '9.5500, 1.1667'], ['Dapaong', '10.7833, 0.0333']].map(([v, c]) => (
                <div key={v} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '6px 0', borderBottom: '1px solid #e0f2fe', fontSize: '0.83rem',
                }}>
                  <span style={{ fontWeight: 600, color: '#0c2340' }}>{v}</span>
                  <span style={{ color: '#64748b', fontFamily: 'monospace', fontSize: '0.78rem' }}>{c}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}