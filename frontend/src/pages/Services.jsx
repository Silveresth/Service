import { useEffect, useState, useRef, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../api/axios';
import SmartMatchButton from '../components/SmartMatchButton';

const PRIX_TRANCHES = [
  { id: 'all', label: 'Tous' },
  { id: '0-5000', label: '< 5k' },
  { id: '5000-20000', label: '5k–20k' },
  { id: '20000-50000', label: '20k–50k' },
  { id: '50000+', label: '> 50k' },
];

const TRIS = [
  { id: 'pertinence', label: 'Pertinence' },
  { id: 'prix_asc', label: 'Prix ↑' },
  { id: 'prix_desc', label: 'Prix ↓' },
  { id: 'nom_asc', label: 'Nom A–Z' },
];

const ANIMATIONS = `
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes fadeIn {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
  @keyframes matchPulse {
    0%, 100% { box-shadow: 0 0 0 3px #10b981, 0 12px 40px rgba(16,185,129,.3); }
    50%       { box-shadow: 0 0 0 6px rgba(16,185,129,.3), 0 12px 40px rgba(16,185,129,.5); }
  }
  @keyframes shimmer {
    0%   { background-position: -200% 0; }
    100% { background-position:  200% 0; }
  }
  .svc-card {
    transition: transform .22s ease, box-shadow .22s ease;
    animation: fadeUp .4s ease both;
  }
  .svc-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 16px 48px rgba(2,132,199,.18) !important;
  }
  .cat-pill { transition: all .15s; }
  .cat-pill:hover { transform: translateY(-1px); }
  .search-clear { transition: opacity .15s; }
  .modal-backdrop {
    animation: fadeIn .2s ease;
  }
  .modal-box {
    animation: fadeUp .25s ease;
  }
  .skeleton {
    background: linear-gradient(90deg, #f0f7ff 25%, #e0f2fe 50%, #f0f7ff 75%);
    background-size: 200% 100%;
    animation: shimmer 1.4s infinite;
    border-radius: 12px;
  }
`;

export default function Services() {
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();

  const [matches, setMatches] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [matchIds, setMatchIds] = useState(new Set());

  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [inputVal, setInputVal] = useState(searchParams.get('q') || '');
  const [catFiltre, setCatFiltre] = useState('all');
  const [dispoOnly, setDispoOnly] = useState(false);
  const [prixTranche, setPrixTranche] = useState('all');
  const [triBy, setTriBy] = useState('pertinence');
  const [showFilters, setShowFilters] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [showSugg, setShowSugg] = useState(false);
  const debounceRef = useRef(null);

  useEffect(() => {
    Promise.all([
      api.get(`/services/${query ? `?search=${query}` : ''}`),
      api.get('/categories/')
    ]).then(([sRes, cRes]) => {
      setServices(sRes.data);
      setCategories(cRes.data);
    }).catch(console.error).finally(() => setLoading(false));
  }, [query]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (inputVal.length < 2) { setSuggestions([]); return; }
    debounceRef.current = setTimeout(() => {
      const lower = inputVal.toLowerCase();
      const sugg = services
        .filter(s => s.nom?.toLowerCase().includes(lower) || s.categorie?.nom?.toLowerCase().includes(lower))
        .slice(0, 5).map(s => ({ label: s.nom, cat: s.categorie?.nom, id: s.id }));
      setSuggestions(sugg);
      setShowSugg(sugg.length > 0);
    }, 200);
  }, [inputVal, services]);

  const applySearch = (val) => {
    setQuery(val); setInputVal(val);
    setShowSugg(false);
    setSearchParams(val ? { q: val } : {});
  };

  const handleSmartMatches = useCallback((newMatches) => {
    if (!newMatches.length) return;
    setMatches(newMatches);
    setMatchIds(new Set(newMatches.map(m => m.service_id)));
    setShowModal(true);
  }, []);

  const closeModal = () => { setShowModal(false); setMatches([]); };

  const servicesFiltres = services.filter(s => {
    const matchCat = catFiltre === 'all' || String(s.categorie?.id) === catFiltre || s.categorie?.nom === catFiltre;
    const matchDispo = !dispoOnly || s.disponibilite;
    const prix = parseFloat(s.prix) || 0;
    let matchPrix = true;
    if (prixTranche === '0-5000') matchPrix = prix < 5000;
    else if (prixTranche === '5000-20000') matchPrix = prix >= 5000 && prix <= 20000;
    else if (prixTranche === '20000-50000') matchPrix = prix > 20000 && prix <= 50000;
    else if (prixTranche === '50000+') matchPrix = prix > 50000;
    return matchCat && matchDispo && matchPrix;
  }).sort((a, b) => {
    if (triBy === 'prix_asc') return parseFloat(a.prix) - parseFloat(b.prix);
    if (triBy === 'prix_desc') return parseFloat(b.prix) - parseFloat(a.prix);
    if (triBy === 'nom_asc') return a.nom.localeCompare(b.nom);
    return 0;
  });

  const hasActiveFilters = catFiltre !== 'all' || dispoOnly || prixTranche !== 'all';
  const resetFilters = () => { setCatFiltre('all'); setDispoOnly(false); setPrixTranche('all'); setTriBy('pertinence'); };

  // ── MODAL SMART MATCH ──────────────────────────────────────
  const SmartMatchModal = () => (
    <div
      className="modal-backdrop"
      onClick={closeModal}
      style={{
        position: 'fixed', inset: 0, zIndex: 10000,
        background: 'rgba(12,35,64,0.55)', backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 20,
      }}
    >
      <div
        className="modal-box"
        onClick={e => e.stopPropagation()}
        style={{
          background: '#fff', borderRadius: 20, width: '100%', maxWidth: 480,
          boxShadow: '0 24px 80px rgba(0,0,0,.2)', overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #0c2340, #0284c7)',
          padding: '20px 24px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 42, height: 42, borderRadius: 12,
              background: 'rgba(255,255,255,.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <i className="bi bi-stars" style={{ color: '#fff', fontSize: '1.3rem' }} />
            </div>
            <div>
              <h3 style={{ margin: 0, color: '#fff', fontWeight: 800, fontSize: '1.1rem' }}>
                {matches.length} match{matches.length > 1 ? 'es' : ''} IA trouvé{matches.length > 1 ? 's' : ''} !
              </h3>
              <p style={{ margin: 0, color: 'rgba(255,255,255,.75)', fontSize: '0.8rem' }}>
                Prestataires parfaits à proximité
              </p>
            </div>
          </div>
          <button onClick={closeModal} style={{
            background: 'rgba(255,255,255,.15)', border: 'none', borderRadius: 10,
            width: 32, height: 32, cursor: 'pointer', color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem',
          }}>✕</button>
        </div>

        {/* Cards */}
        <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: 12, maxHeight: 420, overflowY: 'auto' }}>
          {matches.slice(0, 3).map((match, idx) => (
            <div key={match.service_id} style={{
              padding: '16px', borderRadius: 16,
              background: idx === 0 ? 'linear-gradient(135deg, #f0f9ff, #e0f2fe)' : '#f8fafc',
              border: `1.5px solid ${idx === 0 ? '#bae6fd' : '#e2e8f0'}`,
              display: 'flex', flexDirection: 'column', gap: 12,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                {/* Rang */}
                <div style={{
                  width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                  background: idx === 0
                    ? 'linear-gradient(135deg, #0c2340, #0284c7)'
                    : 'linear-gradient(135deg, #475569, #64748b)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fff', fontWeight: 900, fontSize: '1.1rem',
                }}>
                  {idx === 0 ? '🥇' : idx === 1 ? '🥈' : '🥉'}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                    <h4 style={{ margin: 0, fontWeight: 800, fontSize: '1rem', color: '#0c2340' }}>
                      {match.nom}
                    </h4>
                    <span style={{
                      padding: '3px 8px', borderRadius: 20, fontSize: '0.72rem', fontWeight: 700,
                      background: '#0284c7', color: '#fff',
                    }}>
                      {Math.round(match.similarity * 100)}%
                    </span>
                  </div>
                  <p style={{ margin: '3px 0 0', color: '#64748b', fontSize: '0.82rem' }}>
                    par <strong>{match.prestataire}</strong>
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <span style={{
                  padding: '4px 10px', borderRadius: 20, fontSize: '0.78rem', fontWeight: 700,
                  background: '#0c2340', color: '#fff',
                }}>
                  {match.prix?.toLocaleString()} Fcfa
                </span>
                {match.distance && (
                  <span style={{
                    padding: '4px 10px', borderRadius: 20, fontSize: '0.78rem', fontWeight: 600,
                    background: '#f0fdf4', color: '#166534', border: '1px solid #bbf7d0',
                  }}>
                    <i className="bi bi-geo-alt me-1" />{match.distance?.toFixed(1)} km
                  </span>
                )}
              </div>

              <Link
                to={`/services/${match.service_id}`}
                onClick={closeModal}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  padding: '10px', borderRadius: 10, textDecoration: 'none',
                  background: idx === 0
                    ? 'linear-gradient(135deg, #0c2340, #0284c7)'
                    : '#f1f5f9',
                  color: idx === 0 ? '#fff' : '#475569',
                  fontWeight: 700, fontSize: '0.85rem', transition: 'all .15s',
                }}
              >
                <i className="bi bi-calendar-check" />
                Réserver
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // ── SKELETON LOADING ───────────────────────────────────────
  if (loading) return (
    <>
      <style>{ANIMATIONS}</style>
      <div style={{ background: '#f0f8ff', minHeight: '70vh', padding: '32px 0' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 24 }}>
            {[...Array(6)].map((_, i) => (
              <div key={i} style={{ borderRadius: 16, overflow: 'hidden', background: '#fff', boxShadow: '0 4px 20px rgba(2,132,199,.07)' }}>
                <div className="skeleton" style={{ height: 180 }} />
                <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div className="skeleton" style={{ height: 14, width: '60%' }} />
                  <div className="skeleton" style={{ height: 20, width: '80%' }} />
                  <div className="skeleton" style={{ height: 14, width: '90%' }} />
                  <div className="skeleton" style={{ height: 14, width: '70%' }} />
                  <div className="skeleton" style={{ height: 38 }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );

  return (
    <>
      <style>{ANIMATIONS}</style>
      {showModal && <SmartMatchModal />}

      <div style={{ background: '#f0f8ff', minHeight: '70vh', paddingBottom: 60 }}>
        <div className="container" style={{ paddingTop: 32 }}>

          {/* ── EN-TÊTE ── */}
          <div style={{
            display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
            gap: 16, marginBottom: 24, flexWrap: 'wrap',
            animation: 'fadeUp .4s ease',
          }}>
            <div>
              <h2 style={{ fontWeight: 800, fontSize: '1.6rem', color: '#0c2340', margin: 0 }}>
                Nos Services
              </h2>
              <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '0.88rem' }}>
                <strong style={{ color: '#0284c7' }}>{servicesFiltres.length}</strong> service(s)
                {matches.length > 0 && (
                  <span style={{ marginLeft: 8, color: '#10b981', fontWeight: 600 }}>
                    · ✨ {matches.length} match{matches.length > 1 ? 'es' : ''} IA
                  </span>
                )}
              </p>
            </div>

            {/* Smart Match — compact, dans le header */}
            <div style={{ width: '100%', maxWidth: 380 }}>
              <SmartMatchButton
                onMatches={handleSmartMatches}
                setMatches={setMatches}
                setShowModal={setShowModal}
                categories={categories}
              />
            </div>
          </div>

          {/* ── BARRE DE RECHERCHE ── */}
          <div style={{ marginBottom: 16, position: 'relative', animation: 'fadeUp .45s ease' }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: '#fff', borderRadius: 14,
              border: '1.5px solid #e2e8f0', padding: '8px 12px',
              boxShadow: '0 2px 12px rgba(2,132,199,.06)',
              transition: 'border-color .2s, box-shadow .2s',
            }}
              onFocusCapture={e => {
                e.currentTarget.style.borderColor = '#0284c7';
                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(2,132,199,.1)';
              }}
              onBlurCapture={e => {
                e.currentTarget.style.borderColor = '#e2e8f0';
                e.currentTarget.style.boxShadow = '0 2px 12px rgba(2,132,199,.06)';
              }}
            >
              <i className="bi bi-search" style={{ color: '#94a3b8', fontSize: '1rem', flexShrink: 0 }} />
              <input
                type="text"
                placeholder="Rechercher un service, catégorie, prestataire…"
                value={inputVal}
                onChange={e => setInputVal(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') { applySearch(inputVal); setShowSugg(false); }
                  if (e.key === 'Escape') setShowSugg(false);
                }}
                onFocus={() => suggestions.length > 0 && setShowSugg(true)}
                onBlur={() => setTimeout(() => setShowSugg(false), 150)}
                style={{
                  flex: 1, border: 'none', outline: 'none',
                  fontSize: '0.9rem', color: '#0c2340', background: 'transparent',
                }}
              />
              {inputVal && (
                <button
                  className="search-clear"
                  onClick={() => { setInputVal(''); applySearch(''); }}
                  style={{
                    background: '#f1f5f9', border: 'none', borderRadius: 6,
                    width: 24, height: 24, cursor: 'pointer', color: '#64748b',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem',
                  }}
                >✕</button>
              )}
              <button
                onClick={() => applySearch(inputVal)}
                style={{
                  padding: '7px 14px', borderRadius: 10, border: 'none',
                  background: '#0c2340', color: '#fff',
                  fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer', flexShrink: 0,
                }}
              >
                Rechercher
              </button>
            </div>

            {/* Suggestions */}
            {showSugg && suggestions.length > 0 && (
              <div style={{
                position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 100,
                background: '#fff', borderRadius: 14, marginTop: 4,
                border: '1.5px solid #e0f2fe',
                boxShadow: '0 8px 32px rgba(2,132,199,.12)',
                overflow: 'hidden',
              }}>
                {suggestions.map((s, i) => (
                  <div
                    key={i}
                    onClick={() => applySearch(s.label)}
                    style={{
                      padding: '10px 14px', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', gap: 10,
                      borderBottom: i < suggestions.length - 1 ? '1px solid #f1f5f9' : 'none',
                      transition: 'background .1s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = '#f0f9ff'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <i className="bi bi-search" style={{ color: '#94a3b8', fontSize: '0.85rem' }} />
                    <span style={{ flex: 1, fontSize: '0.88rem', color: '#0c2340' }}>{s.label}</span>
                    {s.cat && (
                      <span style={{
                        padding: '2px 8px', borderRadius: 20, fontSize: '0.72rem',
                        background: '#e0f2fe', color: '#0284c7', fontWeight: 600,
                      }}>{s.cat}</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── FILTRES CATÉGORIES ── */}
          <div style={{
            display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 8, marginBottom: 12,
            scrollbarWidth: 'none', animation: 'fadeUp .5s ease',
          }}>
            <button
              className="cat-pill"
              onClick={() => setCatFiltre('all')}
              style={{
                padding: '6px 14px', borderRadius: 20, border: '1.5px solid', cursor: 'pointer',
                fontSize: '0.82rem', fontWeight: catFiltre === 'all' ? 700 : 500, whiteSpace: 'nowrap', flexShrink: 0,
                borderColor: catFiltre === 'all' ? '#0284c7' : '#e2e8f0',
                background: catFiltre === 'all' ? '#0284c7' : '#fff',
                color: catFiltre === 'all' ? '#fff' : '#64748b',
              }}
            >
              <i className="bi bi-grid me-1" />Tous
            </button>
            {categories.map(c => (
              <button
                key={c.id}
                className="cat-pill"
                onClick={() => setCatFiltre(String(c.id))}
                style={{
                  padding: '6px 12px', borderRadius: 20, border: '1.5px solid', cursor: 'pointer',
                  fontSize: '0.78rem', fontWeight: catFiltre === String(c.id) ? 700 : 500,
                  whiteSpace: 'nowrap', flexShrink: 0,
                  borderColor: catFiltre === String(c.id) ? '#0284c7' : '#e2e8f0',
                  background: catFiltre === String(c.id) ? '#0284c7' : '#fff',
                  color: catFiltre === String(c.id) ? '#fff' : '#64748b',
                  display: 'flex', alignItems: 'center', gap: 4,
                }}
              >
                {c.icone && <i className={`bi ${c.icone}`} style={{ fontSize: '0.75rem' }} />}
                {c.nom}
              </button>
            ))}
            <button
              className="cat-pill"
              onClick={() => setShowFilters(!showFilters)}
              style={{
                marginLeft: 'auto', padding: '6px 12px', borderRadius: 20, border: '1.5px solid',
                cursor: 'pointer', fontSize: '0.78rem', whiteSpace: 'nowrap', flexShrink: 0,
                borderColor: hasActiveFilters ? '#0284c7' : '#e2e8f0',
                background: hasActiveFilters ? '#e0f2fe' : '#fff',
                color: hasActiveFilters ? '#0284c7' : '#64748b',
                fontWeight: hasActiveFilters ? 700 : 500,
                display: 'flex', alignItems: 'center', gap: 5,
              }}
            >
              <i className="bi bi-sliders" />
              Filtres
              {hasActiveFilters && (
                <span style={{
                  width: 18, height: 18, borderRadius: '50%',
                  background: '#0284c7', color: '#fff',
                  fontSize: '0.68rem', fontWeight: 700,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {[catFiltre !== 'all', dispoOnly, prixTranche !== 'all'].filter(Boolean).length}
                </span>
              )}
            </button>
          </div>

          {/* Filtres avancés */}
          {showFilters && (
            <div style={{
              background: '#fff', borderRadius: 14, padding: '16px 20px',
              border: '1.5px solid #e0f2fe', marginBottom: 16,
              animation: 'fadeUp .2s ease',
              boxShadow: '0 4px 20px rgba(2,132,199,.07)',
            }}>
              <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', alignItems: 'flex-end' }}>
                <div>
                  <p style={{ margin: '0 0 8px', fontSize: '0.75rem', fontWeight: 700, color: '#0284c7', textTransform: 'uppercase' }}>
                    Prix
                  </p>
                  <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                    {PRIX_TRANCHES.map(p => (
                      <button key={p.id} onClick={() => setPrixTranche(p.id)} style={{
                        padding: '5px 11px', borderRadius: 8, border: '1.5px solid', cursor: 'pointer',
                        fontSize: '0.78rem', fontWeight: prixTranche === p.id ? 700 : 400,
                        borderColor: prixTranche === p.id ? '#0284c7' : '#e2e8f0',
                        background: prixTranche === p.id ? '#e0f2fe' : '#f8fafc',
                        color: prixTranche === p.id ? '#0284c7' : '#64748b',
                      }}>{p.label}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <p style={{ margin: '0 0 8px', fontSize: '0.75rem', fontWeight: 700, color: '#0284c7', textTransform: 'uppercase' }}>
                    Trier par
                  </p>
                  <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                    {TRIS.map(t => (
                      <button key={t.id} onClick={() => setTriBy(t.id)} style={{
                        padding: '5px 11px', borderRadius: 8, border: '1.5px solid', cursor: 'pointer',
                        fontSize: '0.78rem', fontWeight: triBy === t.id ? 700 : 400,
                        borderColor: triBy === t.id ? '#0284c7' : '#e2e8f0',
                        background: triBy === t.id ? '#e0f2fe' : '#f8fafc',
                        color: triBy === t.id ? '#0284c7' : '#64748b',
                      }}>{t.label}</button>
                    ))}
                  </div>
                </div>
                <label style={{ display: 'flex', alignItems: 'center', gap: 7, cursor: 'pointer', fontSize: '0.83rem', color: '#475569' }}>
                  <input type="checkbox" checked={dispoOnly} onChange={e => setDispoOnly(e.target.checked)}
                    style={{ accentColor: '#0284c7', width: 15, height: 15 }} />
                  Disponibles seulement
                </label>
                {hasActiveFilters && (
                  <button onClick={resetFilters} style={{
                    marginLeft: 'auto', background: 'none', border: '1.5px solid #ef4444',
                    color: '#ef4444', padding: '6px 12px', borderRadius: 8,
                    cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600,
                  }}>
                    <i className="bi bi-x-circle me-1" />Réinitialiser
                  </button>
                )}
              </div>
            </div>
          )}

          {/* ── COMPTEUR + TRI ── */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            marginBottom: 20, flexWrap: 'wrap', gap: 8,
          }}>
            <p style={{ fontSize: '0.88rem', color: '#64748b', margin: 0 }}>
              {query && <><strong style={{ color: '#0c2340' }}>"{query}"</strong> — </>}
              <strong style={{ color: '#0284c7' }}>{servicesFiltres.length}</strong> résultat(s)
            </p>
            <select
              value={triBy} onChange={e => setTriBy(e.target.value)}
              style={{
                border: '1.5px solid #e2e8f0', borderRadius: 8, padding: '5px 10px',
                fontSize: '0.82rem', color: '#475569', background: '#fff', cursor: 'pointer',
              }}
            >
              {TRIS.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
            </select>
          </div>

          {/* ── GRILLE DE SERVICES ── */}
          {servicesFiltres.length > 0 ? (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: 20,
            }}>
              {servicesFiltres.map((service, idx) => {
                const isMatch = matchIds.has(service.id);
                return (
                  <div
                    key={service.id}
                    className="svc-card"
                    style={{
                      background: '#fff', borderRadius: 16, overflow: 'hidden',
                      border: '1.5px solid',
                      borderColor: isMatch ? '#10b981' : '#e8f4fd',
                      boxShadow: isMatch
                        ? '0 0 0 3px #10b981, 0 8px 30px rgba(16,185,129,.2)'
                        : '0 4px 20px rgba(2,132,199,.07)',
                      animationDelay: `${idx * 0.05}s`,
                      position: 'relative',
                    }}
                  >
                    {/* Badge IA Match */}
                    {isMatch && (
                      <div style={{
                        position: 'absolute', top: 10, right: 10, zIndex: 10,
                        background: 'linear-gradient(135deg, #10b981, #059669)',
                        color: '#fff', padding: '4px 10px', borderRadius: 20,
                        fontSize: '0.72rem', fontWeight: 800,
                        boxShadow: '0 4px 12px rgba(16,185,129,.4)',
                        display: 'flex', alignItems: 'center', gap: 4,
                      }}>
                        <i className="bi bi-stars" style={{ fontSize: '0.7rem' }} />
                        Match #{Array.from(matchIds).indexOf(service.id) + 1}
                      </div>
                    )}

                    {/* Image */}
                    <div style={{
                      height: 170, overflow: 'hidden', position: 'relative',
                      background: 'linear-gradient(135deg, #e0f2fe, #f0f9ff)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      {service.image_url ? (
                        <img
                          src={service.image_url} alt={service.nom}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      ) : (
                        <i className={`bi ${service.categorie?.icone || 'bi-briefcase'}`}
                          style={{ fontSize: '3.5rem', color: '#0284c7', opacity: 0.5 }} />
                      )}
                    </div>

                    {/* Contenu */}
                    <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{
                          padding: '3px 10px', borderRadius: 20, fontSize: '0.72rem', fontWeight: 700,
                          background: '#e0f2fe', color: '#0284c7',
                        }}>
                          {service.categorie?.nom || 'Service'}
                        </span>
                        <span style={{
                          fontSize: '0.72rem', fontWeight: 600,
                          color: service.disponibilite ? '#10b981' : '#94a3b8',
                          display: 'flex', alignItems: 'center', gap: 4,
                        }}>
                          <span style={{
                            width: 6, height: 6, borderRadius: '50%',
                            background: service.disponibilite ? '#10b981' : '#cbd5e1',
                            display: 'inline-block',
                          }} />
                          {service.disponibilite ? 'Disponible' : 'Indisponible'}
                        </span>
                      </div>

                      <h5 style={{ margin: 0, fontWeight: 800, fontSize: '1rem', color: '#0c2340', lineHeight: 1.3 }}>
                        {service.nom}
                      </h5>

                      <p style={{ margin: 0, color: '#64748b', fontSize: '0.83rem', lineHeight: 1.5 }}>
                        {service.description?.split(' ').slice(0, 18).join(' ')}
                        {service.description?.split(' ').length > 18 ? '…' : ''}
                      </p>

                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <div style={{
                            width: 26, height: 26, borderRadius: '50%', flexShrink: 0,
                            background: 'linear-gradient(135deg, #0c2340, #0284c7)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: '#fff', fontWeight: 700, fontSize: '0.72rem',
                          }}>
                            {service.prestataire?.user?.username?.[0]?.toUpperCase()}
                          </div>
                          <small style={{ color: '#64748b', fontSize: '0.78rem' }}>
                            {service.prestataire?.user?.username}
                          </small>
                        </div>
                        {service.note_avg && (
                          <span style={{ color: '#f59e0b', fontWeight: 700, fontSize: '0.82rem' }}>
                            ★ {parseFloat(service.note_avg).toFixed(1)}
                            <span style={{ color: '#94a3b8', fontWeight: 400, fontSize: '0.72rem' }}>
                              {' '}({service.nb_notes || 0})
                            </span>
                          </span>
                        )}
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 }}>
                        <span style={{ fontWeight: 800, fontSize: '1rem', color: '#0c2340' }}>
                          {parseFloat(service.prix).toLocaleString()} <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b' }}>Fcfa</span>
                        </span>
                        <Link
                          to={`/services/${service.id}`}
                          style={{
                            padding: '8px 16px', borderRadius: 10, textDecoration: 'none',
                            background: 'linear-gradient(135deg, #0c2340, #0284c7)',
                            color: '#fff', fontWeight: 700, fontSize: '0.82rem',
                            transition: 'all .15s',
                            display: 'flex', alignItems: 'center', gap: 5,
                          }}
                          onMouseEnter={e => e.currentTarget.style.opacity = '.85'}
                          onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                        >
                          Voir <i className="bi bi-arrow-right" />
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{
              textAlign: 'center', padding: '60px 20px',
              animation: 'fadeUp .4s ease',
            }}>
              <div style={{
                width: 72, height: 72, borderRadius: 20, margin: '0 auto 16px',
                background: '#e0f2fe', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <i className="bi bi-inbox" style={{ fontSize: '2.2rem', color: '#0284c7' }} />
              </div>
              <h4 style={{ fontWeight: 800, color: '#0c2340', marginBottom: 8 }}>Aucun service trouvé</h4>
              <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: 20 }}>
                Essayez avec d'autres mots-clés ou modifiez les filtres.
              </p>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
                {query && (
                  <button onClick={() => applySearch('')} style={{
                    padding: '10px 20px', borderRadius: 10, border: 'none',
                    background: '#0284c7', color: '#fff', fontWeight: 700, cursor: 'pointer',
                  }}>
                    Voir tous les services
                  </button>
                )}
                {hasActiveFilters && (
                  <button onClick={resetFilters} style={{
                    padding: '10px 20px', borderRadius: 10,
                    border: '1.5px solid #0284c7', background: '#fff',
                    color: '#0284c7', fontWeight: 700, cursor: 'pointer',
                  }}>
                    Réinitialiser les filtres
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}