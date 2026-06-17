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
  .services-grid-container {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 20px;
  }
  @media (max-width: 640px) {
    .services-grid-container {
      grid-template-columns: repeat(2, 1fr);
      gap: 10px;
    }
    .svc-card h5 { font-size: 0.85rem !important; }
    .svc-card p { display: none; }
    .svc-card .price { font-size: 0.9rem !important; }
    .svc-card .btn-voir { padding: 6px 10px !important; font-size: 0.75rem !important; }
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
  const RANK_CONFIG = [
    { emoji: '🥇', label: 'Meilleur match', scoreColor: '#0284c7', scoreBg: '#e0f2fe', cardBg: '#f8fbff', border: '#bae6fd' },
    { emoji: '🥈', label: '2ᵉ choix',        scoreColor: '#7c3aed', scoreBg: '#f5f3ff', cardBg: '#fafafa',  border: '#e2e8f0' },
    { emoji: '🥉', label: '3ᵉ choix',        scoreColor: '#b45309', scoreBg: '#fef3c7', cardBg: '#fafafa',  border: '#e2e8f0' },
  ];

  const SmartMatchModal = () => (
    <div
      className="modal-backdrop"
      onClick={closeModal}
      style={{
        position: 'fixed', inset: 0, zIndex: 10000,
        background: 'rgba(12,35,64,0.6)', backdropFilter: 'blur(5px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 16,
      }}
    >
      <div
        className="modal-box"
        onClick={e => e.stopPropagation()}
        style={{
          background: '#fff', borderRadius: 22, width: '100%', maxWidth: 460,
          boxShadow: '0 32px 80px rgba(0,0,0,.25)', overflow: 'hidden',
          display: 'flex', flexDirection: 'column',
          maxHeight: '92vh',
        }}
      >
        {/* ── Header ── */}
        <div style={{
          background: 'linear-gradient(135deg, #0c2340 0%, #0284c7 100%)',
          padding: '18px 20px',
          display: 'flex', alignItems: 'center', gap: 12,
          flexShrink: 0,
        }}>
          <div style={{
            width: 44, height: 44, borderRadius: 13, flexShrink: 0,
            background: 'rgba(255,255,255,.15)',
            border: '1.5px solid rgba(255,255,255,.25)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <i className="bi bi-stars" style={{ color: '#fff', fontSize: '1.3rem' }} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h3 style={{ margin: 0, color: '#fff', fontWeight: 800, fontSize: '1rem', lineHeight: 1.2 }}>
              {matches.length} prestataire{matches.length > 1 ? 's' : ''} recommandé{matches.length > 1 ? 's' : ''}
            </h3>
            <p style={{ margin: '3px 0 0', color: 'rgba(255,255,255,.7)', fontSize: '0.77rem' }}>
              Classés par pertinence · distance · budget
            </p>
          </div>
          <button onClick={closeModal} style={{
            background: 'rgba(255,255,255,.15)', border: '1.5px solid rgba(255,255,255,.25)',
            borderRadius: 10, width: 34, height: 34,
            cursor: 'pointer', color: '#fff', flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem',
          }}>
            <i className="bi bi-x-lg" />
          </button>
        </div>

        {/* ── Liste des matches ── */}
        <div style={{ overflowY: 'auto', padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {matches.slice(0, 3).map((match, idx) => {
            const cfg = RANK_CONFIG[idx] || RANK_CONFIG[2];
            const score = Math.round((match.similarity || 0) * 100);
            const isTop = idx === 0;

            return (
              <div key={match.service_id} style={{
                background: cfg.cardBg,
                border: `1.5px solid ${cfg.border}`,
                borderRadius: 16, overflow: 'hidden',
              }}>
                {/* Ligne principale */}
                <div style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
                  {/* Médaille + score */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0, gap: 4 }}>
                    <span style={{ fontSize: '1.4rem', lineHeight: 1 }}>{cfg.emoji}</span>
                    <span style={{
                      fontSize: '0.72rem', fontWeight: 800,
                      color: cfg.scoreColor, background: cfg.scoreBg,
                      padding: '2px 7px', borderRadius: 20,
                      whiteSpace: 'nowrap',
                    }}>
                      {score}%
                    </span>
                  </div>

                  {/* Infos service */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#0c2340', lineHeight: 1.2, marginBottom: 2 }}>
                      {match.nom}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <i className="bi bi-person" style={{ flexShrink: 0 }} />
                      {match.prestataire}
                      {match.note_moyenne > 0 && (
                        <span style={{ marginLeft: 4, color: '#f59e0b', fontWeight: 700, fontSize: '0.76rem' }}>
                          ⭐ {match.note_moyenne?.toFixed(1)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Prix */}
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#0c2340' }}>
                      {match.prix?.toLocaleString()}
                    </div>
                    <div style={{ fontSize: '0.68rem', color: '#94a3b8', fontWeight: 600 }}>Fcfa</div>
                  </div>
                </div>

                {/* Barre de score */}
                <div style={{ margin: '0 16px', height: 4, background: '#e2e8f0', borderRadius: 4, marginBottom: 4 }}>
                  <div style={{
                    height: '100%', width: `${score}%`,
                    background: `linear-gradient(90deg, ${cfg.scoreColor}88, ${cfg.scoreColor})`,
                    borderRadius: 4, transition: 'width .6s ease',
                  }} />
                </div>

                {/* Tags info + bouton */}
                <div style={{ padding: '8px 16px 12px', display: 'flex', alignItems: 'center', gap: 8 }}>
                  {match.distance != null && (
                    <span style={{
                      padding: '3px 9px', borderRadius: 20, fontSize: '0.74rem', fontWeight: 600,
                      background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0',
                      display: 'flex', alignItems: 'center', gap: 4,
                    }}>
                      <i className="bi bi-geo-alt-fill" style={{ fontSize: '0.68rem' }} />
                      {match.distance.toFixed(1)} km
                    </span>
                  )}
                  {match.categorie && (
                    <span style={{
                      padding: '3px 9px', borderRadius: 20, fontSize: '0.74rem', fontWeight: 600,
                      background: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe',
                    }}>
                      {match.categorie}
                    </span>
                  )}
                  <Link
                    to={`/services/${match.service_id}`}
                    onClick={closeModal}
                    style={{
                      marginLeft: 'auto',
                      padding: '7px 16px', borderRadius: 10, textDecoration: 'none',
                      background: isTop ? 'linear-gradient(135deg, #0c2340, #0284c7)' : '#f1f5f9',
                      color: isTop ? '#fff' : '#475569',
                      fontWeight: 700, fontSize: '0.82rem',
                      display: 'flex', alignItems: 'center', gap: 6,
                      boxShadow: isTop ? '0 3px 10px rgba(2,132,199,.3)' : 'none',
                      transition: 'all .15s',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    <i className="bi bi-calendar-check" />
                    Réserver
                  </Link>
                </div>
              </div>
            );
          })}

          {/* Note de bas */}
          <p style={{
            margin: '4px 0 0', textAlign: 'center',
            fontSize: '0.73rem', color: '#94a3b8',
          }}>
            <i className="bi bi-info-circle me-1" />
            Score calculé selon proximité, budget et disponibilité
          </p>
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
            gap: 16, marginBottom: 20, flexWrap: 'wrap',
            animation: 'fadeUp .4s ease',
          }}>
            <div>
              <h2 style={{ fontWeight: 800, fontSize: '1.5rem', color: '#0c2340', margin: 0 }}>
                Nos Services
              </h2>
              <p style={{ margin: '2px 0 0', color: '#64748b', fontSize: '0.85rem' }}>
                <strong style={{ color: '#0284c7' }}>{servicesFiltres.length}</strong> services disponibles
              </p>
            </div>

            <div style={{ width: '100%', maxWidth: 360 }}>
              <SmartMatchButton
                onMatches={handleSmartMatches}
                setMatches={setMatches}
                setShowModal={setShowModal}
                categories={categories}
              />
            </div>
          </div>

          {/* ── BARRE DE RECHERCHE ET FILTRES (Style Ateliers) ── */}
          <div style={{
            background: 'white', borderRadius: 16,
            padding: '16px 20px', marginBottom: 24,
            border: '1px solid #e2e8f0',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            animation: 'fadeUp .45s ease',
          }}>
            {/* Barre de recherche */}
            <div style={{ position: 'relative', marginBottom: 14 }}>
              <i className="bi bi-search" style={{
                position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
                color: '#94a3b8', fontSize: '0.95rem', pointerEvents: 'none',
              }} />
              <input
                type="text"
                placeholder="Rechercher un service, catégorie, prestataire…"
                value={inputVal}
                onChange={e => setInputVal(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') { applySearch(inputVal); setShowSugg(false); }
                }}
                onFocus={() => suggestions.length > 0 && setShowSugg(true)}
                style={{
                  width: '100%', padding: '10px 40px',
                  border: '1.5px solid #e2e8f0', borderRadius: 12,
                  fontSize: '0.9rem', background: '#f8fafc',
                  outline: 'none', transition: 'border-color 0.15s',
                }}
              />
              {inputVal && (
                <button onClick={() => { setInputVal(''); applySearch(''); }} style={{
                  position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                  background: '#e2e8f0', border: 'none', borderRadius: 6,
                  width: 22, height: 22, display: 'flex', alignItems: 'center',
                  justifyContent: 'center', cursor: 'pointer', color: '#64748b', fontSize: '0.75rem',
                }}>
                  <i className="bi bi-x" />
                </button>
              )}
              
              {/* Suggestions */}
              {showSugg && suggestions.length > 0 && (
                <div style={{
                  position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 100,
                  background: '#fff', borderRadius: 12, marginTop: 4,
                  border: '1.5px solid #e0f2fe',
                  boxShadow: '0 8px 32px rgba(2,132,199,.12)',
                  overflow: 'hidden',
                }}>
                  {suggestions.map((s, i) => (
                    <div key={i} onClick={() => applySearch(s.label)} style={{
                        padding: '10px 14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10,
                        borderBottom: i < suggestions.length - 1 ? '1px solid #f1f5f9' : 'none',
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = '#f0f9ff'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <i className="bi bi-search" style={{ color: '#94a3b8', fontSize: '0.85rem' }} />
                      <span style={{ flex: 1, fontSize: '0.88rem', color: '#0c2340' }}>{s.label}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Pills de Catégories */}
            <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 10, marginBottom: 14, scrollbarWidth: 'none' }}>
              <button
                onClick={() => setCatFiltre('all')}
                style={{
                  padding: '5px 14px', borderRadius: 20, border: '1.5px solid', cursor: 'pointer',
                  fontSize: '0.8rem', fontWeight: catFiltre === 'all' ? 700 : 500, whiteSpace: 'nowrap',
                  borderColor: catFiltre === 'all' ? '#0284c7' : '#e2e8f0',
                  background: catFiltre === 'all' ? '#0284c7' : 'white',
                  color: catFiltre === 'all' ? 'white' : '#64748b',
                }}
              >
                Tous
              </button>
              {categories.map(c => (
                <button
                  key={c.id}
                  onClick={() => setCatFiltre(String(c.id))}
                  style={{
                    padding: '5px 12px', borderRadius: 20, border: '1.5px solid', cursor: 'pointer',
                    fontSize: '0.8rem', fontWeight: catFiltre === String(c.id) ? 700 : 500,
                    whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 5,
                    borderColor: catFiltre === String(c.id) ? '#0284c7' : '#e2e8f0',
                    background: catFiltre === String(c.id) ? '#0284c7' : 'white',
                    color: catFiltre === String(c.id) ? 'white' : '#64748b',
                  }}
                >
                  {c.icone && <i className={`bi ${c.icone}`} style={{ fontSize: '0.8rem' }} />}
                  {c.nom}
                </button>
              ))}
            </div>

            {/* Filtres secondaires */}
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
              <select value={triBy} onChange={e => setTriBy(e.target.value)} style={{
                padding: '7px 12px', border: '1.5px solid #e2e8f0',
                borderRadius: 10, fontSize: '0.83rem', background: '#f8fafc',
                color: '#374151', cursor: 'pointer', outline: 'none',
              }}>
                {TRIS.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
              </select>

              <select value={prixTranche} onChange={e => setPrixTranche(e.target.value)} style={{
                padding: '7px 12px', border: '1.5px solid #e2e8f0',
                borderRadius: 10, fontSize: '0.83rem', background: '#f8fafc',
                color: '#374151', cursor: 'pointer', outline: 'none',
              }}>
                <option value="all">Tous les prix</option>
                {PRIX_TRANCHES.slice(1).map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
              </select>

              <label style={{ display: 'flex', alignItems: 'center', gap: 7, cursor: 'pointer', userSelect: 'none' }}>
                <input type="checkbox" checked={dispoOnly} onChange={e => setDispoOnly(e.target.checked)}
                  style={{ accentColor: '#0284c7', width: 16, height: 16 }} />
                <span style={{ fontSize: '0.83rem', color: '#64748b', fontWeight: 500 }}>Disponibles</span>
              </label>

              {(catFiltre !== 'all' || dispoOnly || prixTranche !== 'all' || triBy !== 'pertinence') && (
                <button onClick={resetFilters} style={{
                  marginLeft: 'auto', fontSize: '0.8rem', color: '#94a3b8',
                  background: 'none', border: 'none', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 4, padding: '4px 8px',
                }}>
                  <i className="bi bi-x-circle" /> Réinitialiser
                </button>
              )}
            </div>
          </div>

          {/* ── COMPTEUR ── */}
          <div style={{ marginBottom: 16 }}>
            <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0 }}>
              {query && <><i className="bi bi-search me-1"></i>Résultats pour <strong style={{ color: '#0c2340' }}>"{query}"</strong> · </>}
              <strong style={{ color: '#0284c7' }}>{servicesFiltres.length}</strong> service(s) trouvé(s)
            </p>
          </div>

          {/* ── GRILLE DE SERVICES ── */}
          {servicesFiltres.length > 0 ? (
            <div className="services-grid-container">
              {servicesFiltres.map((service, idx) => {
                const isMatch = matchIds.has(service.id);
                return (
                  <div
                    key={service.id}
                    className="svc-card"
                    style={{
                      background: '#fff', borderRadius: 16, overflow: 'hidden',
                      border: '1.5px solid',
                      borderColor: isMatch ? '#10b981' : '#e2e8f0',
                      boxShadow: isMatch
                        ? '0 0 0 3px #10b981, 0 8px 30px rgba(16,185,129,.2)'
                        : '0 4px 15px rgba(0,0,0,0.03)',
                      animationDelay: `${idx * 0.05}s`,
                      position: 'relative',
                      display: 'flex',
                      flexDirection: 'column',
                    }}
                  >
                    {/* Image */}
                    <div style={{
                      height: 140, overflow: 'hidden', position: 'relative',
                      background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      {service.image_url ? (
                        <img src={service.image_url} alt={service.nom} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <i className={`bi ${service.categorie?.icone || 'bi-briefcase'}`} style={{ fontSize: '2.5rem', color: '#cbd5e1' }} />
                      )}
                      {isMatch && (
                        <div style={{ position: 'absolute', top: 8, right: 8, background: '#10b981', color: '#fff', padding: '2px 8px', borderRadius: 20, fontSize: '0.65rem', fontWeight: 800 }}>IA Match</div>
                      )}
                    </div>

                    {/* Contenu */}
                    <div style={{ padding: '12px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                        <span style={{ fontSize: '0.65rem', fontWeight: 700, color: '#0284c7', textTransform: 'uppercase' }}>{service.categorie?.nom}</span>
                        {service.note_avg && <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#f59e0b' }}>★ {parseFloat(service.note_avg).toFixed(1)}</span>}
                      </div>
                      
                      <h5 style={{ margin: '0 0 6px', fontWeight: 800, fontSize: '0.9rem', color: '#0c2340', lineHeight: 1.2, height: '2.4em', overflow: 'hidden' }}>
                        {service.nom}
                      </h5>

                      {/* Bio / Prestataire (très compact) */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                        <div style={{ width: 18, height: 18, borderRadius: '50%', background: '#0c2340', color: '#fff', fontSize: '0.6rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                          {service.prestataire?.user?.username?.[0].toUpperCase()}
                        </div>
                        <span style={{ fontSize: '0.7rem', color: '#64748b' }}>{service.prestataire?.user?.username}</span>
                      </div>

                      <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#0c2340' }}>
                          {parseFloat(service.prix).toLocaleString()} <span style={{ fontSize: '0.65rem', fontWeight: 600 }}>F</span>
                        </div>
                        <Link to={`/services/${service.id}`} className="btn-voir" style={{
                            padding: '6px 12px', borderRadius: 8, textDecoration: 'none',
                            background: '#0c2340', color: '#fff', fontWeight: 700, fontSize: '0.75rem',
                          }}>
                          Détails
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