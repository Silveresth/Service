import '../../styles/services.css';
import { useEffect, useState, useRef, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../../api/axios';
import SmartMatchButton from '../../components/SmartMatchButton';

const PRIX_TRANCHES = [
  { id: 'all',        label: 'Tous les prix' },
  { id: '0-5000',    label: '< 5 000 F' },
  { id: '5000-20000', label: '5k – 20k' },
  { id: '20000-50000',label: '20k – 50k' },
  { id: '50000+',    label: '> 50 000 F' },
];

const TRIS = [
  { id: 'pertinence', label: '✦ Pertinence' },
  { id: 'prix_asc',   label: '↑ Prix croissant' },
  { id: 'prix_desc',  label: '↓ Prix décroissant' },
  { id: 'nom_asc',    label: 'A–Z Nom' },
  { id: 'note_desc',  label: '★ Mieux notés' },
];

const GRADIENTS = [
  'linear-gradient(135deg, #0f172a 0%, #0284c7 100%)',
  'linear-gradient(135deg, #0c2340 0%, #4f46e5 100%)',
  'linear-gradient(135deg, #0f172a 0%, #059669 100%)',
  'linear-gradient(135deg, #1e1b4b 0%, #db2777 100%)',
  'linear-gradient(135deg, #1a0a2e 0%, #7c3aed 100%)',
  'linear-gradient(135deg, #0c2340 0%, #d97706 100%)',
];



function SkeletonCard() {
  return (
    <div style={{ background: 'white', borderRadius: 24, overflow: 'hidden', border: '1px solid #e2e8f0' }}>
      <div className="sv-skeleton" style={{ height: 190 }} />
      <div style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <div className="sv-skeleton" style={{ width: '40%', height: 11 }} />
          <div className="sv-skeleton" style={{ width: '20%', height: 11 }} />
        </div>
        <div className="sv-skeleton" style={{ width: '85%', height: 18 }} />
        <div className="sv-skeleton" style={{ width: '100%', height: 11 }} />
        <div className="sv-skeleton" style={{ width: '70%', height: 11 }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8, paddingTop: 12, borderTop: '1px solid #f1f5f9' }}>
          <div className="sv-skeleton" style={{ width: '30%', height: 20 }} />
          <div className="sv-skeleton" style={{ width: '28%', height: 38, borderRadius: 14 }} />
        </div>
      </div>
    </div>
  );
}

const RANK_CFG = [
  { emoji: '🥇', label: 'Meilleur match', scoreColor: '#0284c7', scoreBg: '#dbeafe', cardBg: '#f8fbff', border: '#bfdbfe' },
  { emoji: '🥈', label: '2ᵉ choix',       scoreColor: '#7c3aed', scoreBg: '#ede9fe', cardBg: '#fafafa',  border: '#e5e7eb' },
  { emoji: '🥉', label: '3ᵉ choix',       scoreColor: '#b45309', scoreBg: '#fef3c7', cardBg: '#fafafa',  border: '#e5e7eb' },
];

export default function Services() {
  const [services,    setServices]    = useState([]);
  const [categories,  setCategories]  = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();

  const [matches,    setMatches]    = useState([]);
  const [showModal,  setShowModal]  = useState(false);
  const [matchIds,   setMatchIds]   = useState(new Set());

  const [query,      setQuery]      = useState(searchParams.get('q') || '');
  const [inputVal,   setInputVal]   = useState(searchParams.get('q') || '');
  const [catFiltre,  setCatFiltre]  = useState('all');
  const [dispoOnly,  setDispoOnly]  = useState(false);
  const [prixTranche,setPrixTranche]= useState('all');
  const [triBy,      setTriBy]      = useState('pertinence');
  const [suggestions,setSuggestions]= useState([]);
  const [showSugg,   setShowSugg]   = useState(false);
  const debounceRef = useRef(null);
  const searchWrapRef = useRef(null);

  /* ── fetch ── */
  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.get(`/services/${query ? `?search=${encodeURIComponent(query)}` : ''}`),
      api.get('/categories/'),
    ]).then(([sRes, cRes]) => {
      setServices(sRes.data);
      setCategories(cRes.data);
    }).catch(console.error).finally(() => setLoading(false));
  }, [query]);

  /* ── suggestions autocomplete ── */
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (inputVal.length < 2) { setSuggestions([]); return; }
    debounceRef.current = setTimeout(() => {
      const lower = inputVal.toLowerCase();
      const sugg = services
        .filter(s => s.nom?.toLowerCase().includes(lower) || s.categorie?.nom?.toLowerCase().includes(lower))
        .slice(0, 6)
        .map(s => ({ label: s.nom, cat: s.categorie?.nom, id: s.id }));
      setSuggestions(sugg);
      setShowSugg(sugg.length > 0);
    }, 200);
  }, [inputVal, services]);

  /* ── close suggestions on outside click ── */
  useEffect(() => {
    const handler = (e) => {
      if (searchWrapRef.current && !searchWrapRef.current.contains(e.target)) setShowSugg(false);
    };
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, []);

  const applySearch = (val) => {
    setQuery(val); setInputVal(val); setShowSugg(false);
    setSearchParams(val ? { q: val } : {});
  };

  const handleSmartMatches = useCallback((newMatches) => {
    if (!newMatches.length) return;
    setMatches(newMatches);
    setMatchIds(new Set(newMatches.map(m => m.service_id)));
    setShowModal(true);
  }, []);

  /* ── filter + sort ── */
  const servicesFiltres = services.filter(s => {
    const matchCat = catFiltre === 'all' ||
      String(s.categorie?.id) === catFiltre ||
      s.categorie?.nom === catFiltre;
    const matchDispo = !dispoOnly || s.disponibilite;
    const prix = parseFloat(s.prix) || 0;
    let matchPrix = true;
    if (prixTranche === '0-5000')     matchPrix = prix < 5000;
    else if (prixTranche === '5000-20000')  matchPrix = prix >= 5000 && prix <= 20000;
    else if (prixTranche === '20000-50000') matchPrix = prix > 20000 && prix <= 50000;
    else if (prixTranche === '50000+')     matchPrix = prix > 50000;
    return matchCat && matchDispo && matchPrix;
  }).sort((a, b) => {
    if (triBy === 'prix_asc')  return parseFloat(a.prix || 0) - parseFloat(b.prix || 0);
    if (triBy === 'prix_desc') return parseFloat(b.prix || 0) - parseFloat(a.prix || 0);
    if (triBy === 'nom_asc')   return a.nom.localeCompare(b.nom);
    if (triBy === 'note_desc') return (parseFloat(b.note_avg) || 0) - (parseFloat(a.note_avg) || 0);
    return 0;
  });

  const hasActiveFilters = catFiltre !== 'all' || dispoOnly || prixTranche !== 'all' || triBy !== 'pertinence';
  const resetFilters = () => {
    setCatFiltre('all'); setDispoOnly(false);
    setPrixTranche('all'); setTriBy('pertinence');
  };

  /* ── Smart Match Modal ── */
  const SmartMatchModal = () => (
    <div className="sv-modal-backdrop" onClick={() => setShowModal(false)}>
      <div className="sv-modal-box" onClick={e => e.stopPropagation()}>

        {/* head */}
        <div className="sv-modal-head">
          <div className="sv-modal-head-icon">
            <i className="bi bi-stars" style={{ color: 'white' }} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h3 style={{ margin: 0, color: 'white', fontWeight: 800, fontSize: '1.08rem', lineHeight: 1.2 }}>
              {matches.length} recommandation{matches.length > 1 ? 's' : ''} IA
            </h3>
            <p style={{ margin: '3px 0 0', color: 'rgba(255,255,255,0.62)', fontSize: '0.77rem' }}>
              Classées par pertinence · distance · budget
            </p>
          </div>
          <button className="sv-modal-close" onClick={() => setShowModal(false)}>
            <i className="bi bi-x-lg" />
          </button>
        </div>

        {/* body */}
        <div className="sv-modal-body">
          {matches.slice(0, 3).map((match, idx) => {
            const cfg = RANK_CFG[idx] || RANK_CFG[2];
            const score = Math.round((match.similarity || 0) * 100);
            const isTop = idx === 0;
            return (
              <div
                key={match.service_id}
                className="sv-match-card"
                style={{ background: cfg.cardBg, border: `1.5px solid ${cfg.border}` }}
              >
                <div className="sv-match-body">
                  <div className="sv-match-rank">
                    <span className="sv-match-emoji">{cfg.emoji}</span>
                    <span
                      className="sv-match-score"
                      style={{ color: cfg.scoreColor, background: cfg.scoreBg }}
                    >
                      {score}%
                    </span>
                  </div>
                  <div className="sv-match-info">
                    <div className="sv-match-nom">{match.nom}</div>
                    <div className="sv-match-prest">
                      <i className="bi bi-person" />
                      {match.prestataire}
                      {match.note_moyenne > 0 && (
                        <span style={{ color: '#f59e0b', fontWeight: 700, marginLeft: 4 }}>
                          ★ {match.note_moyenne.toFixed(1)}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="sv-match-prix">
                    <div className="sv-match-prix-val">{(match.prix || 0).toLocaleString()}</div>
                    <div className="sv-match-prix-unit">FCFA</div>
                  </div>
                </div>

                <div className="sv-match-bar-wrap">
                  <div
                    className="sv-match-bar-fill"
                    style={{
                      width: `${score}%`,
                      background: `linear-gradient(90deg, ${cfg.scoreColor}80, ${cfg.scoreColor})`,
                    }}
                  />
                </div>

                <div className="sv-match-footer">
                  {match.distance != null && (
                    <span className="sv-match-tag" style={{ background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0' }}>
                      <i className="bi bi-geo-alt-fill" style={{ fontSize: '0.68rem' }} />
                      {match.distance.toFixed(1)} km
                    </span>
                  )}
                  {match.categorie && (
                    <span className="sv-match-tag" style={{ background: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe' }}>
                      {match.categorie}
                    </span>
                  )}
                  <Link
                    to={`/services/${match.service_id}`}
                    onClick={() => setShowModal(false)}
                    className="sv-match-btn"
                    style={{
                      background: isTop ? 'linear-gradient(135deg,#0c2340,#0284c7)' : '#f1f5f9',
                      color: isTop ? 'white' : '#475569',
                      boxShadow: isTop ? '0 4px 14px rgba(2,132,199,0.3)' : 'none',
                    }}
                  >
                    <i className="bi bi-calendar-plus" />
                    Réserver
                  </Link>
                </div>
              </div>
            );
          })}

          <p style={{ textAlign: 'center', fontSize: '0.74rem', color: '#94a3b8', margin: '4px 0 0', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
            <i className="bi bi-info-circle" />
            Algorithme combinant distance, budget et notations clients
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <>
      
      {showModal && <SmartMatchModal />}

      <div className="sv-page">

        {/* ── COMPACT HEADER ── */}
        <div className="sv-compact-header">
          <div className="sv-compact-header-orb" />
          <div className="container sv-compact-header-inner">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
              <div>
                <h1 className="sv-compact-title">
                  Catalogue des <span className="highlight">Services</span>
                </h1>
                <p className="sv-compact-sub">
                  Trouvez et réservez instantanément des professionnels certifiés au Togo.
                </p>
              </div>
              <div className="sv-compact-kpis">
                <div className="sv-compact-kpi">
                  <span className="sv-compact-kpi-val">{services.length || '—'}</span>
                  <span className="sv-compact-kpi-lbl">Services</span>
                </div>
                <div className="sv-compact-kpi">
                  <span className="sv-compact-kpi-val">{categories.length || '—'}</span>
                  <span className="sv-compact-kpi-lbl">Catégories</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="container">

          {/* ── FILTER CARD ── */}
          <div className="sv-filter-card">

            {/* Search + SmartMatch */}
            <div className="sv-search-row">
              <div className="sv-search-wrap" ref={searchWrapRef}>
                <i className="bi bi-search sv-search-icon-left" />
                <input
                  type="text"
                  placeholder="Que cherchez-vous ? (plombier, ménage, électricité…)"
                  value={inputVal}
                  className="sv-search-input"
                  onChange={e => { setInputVal(e.target.value); }}
                  onKeyDown={e => { if (e.key === 'Enter') applySearch(inputVal); }}
                  onFocus={() => suggestions.length > 0 && setShowSugg(true)}
                />
                {inputVal && (
                  <button className="sv-search-clear" onClick={() => applySearch('')}>
                    <i className="bi bi-x" />
                  </button>
                )}
                {showSugg && suggestions.length > 0 && (
                  <div className="sv-suggestions">
                    {suggestions.map((s, i) => (
                      <div key={i} className="sv-sugg-item" onClick={() => applySearch(s.label)}>
                        <i className="bi bi-search" style={{ color: '#94a3b8', fontSize: '0.85rem', flexShrink: 0 }} />
                        <span style={{ fontWeight: 600, color: '#0c2340' }}>{s.label}</span>
                        {s.cat && <span className="sv-sugg-cat">{s.cat}</span>}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <SmartMatchButton
                onMatches={handleSmartMatches}
                setMatches={setMatches}
                setShowModal={setShowModal}
                categories={categories}
              />
            </div>

            {/* Category chips */}
            <div className="sv-chips">
              <button
                className={`sv-chip ${catFiltre === 'all' ? 'active' : ''}`}
                onClick={() => setCatFiltre('all')}
              >
                ✦ Tout voir
              </button>
              {categories.map(c => (
                <button
                  key={c.id}
                  className={`sv-chip ${catFiltre === String(c.id) ? 'active' : ''}`}
                  onClick={() => setCatFiltre(String(c.id))}
                >
                  {c.icone && <i className={`bi ${c.icone}`} />}
                  {c.nom}
                </button>
              ))}
            </div>

            {/* Secondary filters */}
            <div className="sv-sec-filters">
              <select value={triBy} onChange={e => setTriBy(e.target.value)} className="sv-select">
                {TRIS.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
              </select>

              <select value={prixTranche} onChange={e => setPrixTranche(e.target.value)} className="sv-select">
                {PRIX_TRANCHES.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
              </select>

              <label className={`sv-toggle-label ${dispoOnly ? 'on' : ''}`}>
                <input
                  type="checkbox"
                  checked={dispoOnly}
                  onChange={e => setDispoOnly(e.target.checked)}
                />
                <span className="sv-toggle-dot">
                  {dispoOnly && <i className="bi bi-check" />}
                </span>
                Disponibles
              </label>

              {hasActiveFilters && (
                <button className="sv-reset-btn" onClick={resetFilters}>
                  <i className="bi bi-x-circle-fill" /> Réinitialiser
                </button>
              )}
            </div>
          </div>

          {/* ── RESULTS BAR ── */}
          {!loading && (
            <div className="sv-results-bar">
              <p className="sv-results-txt">
                {query && (
                  <>Résultats pour <span className="sv-query">"{query}"</span> · </>
                )}
                <strong>{servicesFiltres.length}</strong> service{servicesFiltres.length !== 1 ? 's' : ''} trouvé{servicesFiltres.length !== 1 ? 's' : ''}
                {(query || hasActiveFilters) && (
                  <span
                    style={{ marginLeft: 10, color: '#0284c7', cursor: 'pointer', fontWeight: 700 }}
                    onClick={() => { applySearch(''); resetFilters(); }}
                  >
                    — Tout effacer
                  </span>
                )}
              </p>
              <span className="sv-view-count">{servicesFiltres.length} résultats</span>
            </div>
          )}

          {/* ── GRID ── */}
          <div className="sv-grid">
            {loading
              ? Array(8).fill(0).map((_, i) => <SkeletonCard key={i} />)
              : servicesFiltres.length === 0
                ? (
                  <div className="sv-empty">
                    <div className="sv-empty-icon">
                      <i className="bi bi-inbox" />
                    </div>
                    <h3 style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 800, color: '#0c2340', fontSize: '1.4rem', margin: '0 0 10px' }}>
                      Aucun service trouvé
                    </h3>
                    <p style={{ color: '#64748b', fontSize: '0.92rem', marginBottom: 24 }}>
                      Essayez de modifier vos filtres ou simplifier vos termes de recherche.
                    </p>
                    <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                      {query && (
                        <button
                          onClick={() => applySearch('')}
                          style={{ padding: '11px 24px', background: 'linear-gradient(135deg,#0c2340,#0284c7)', color: 'white', border: 'none', borderRadius: 14, fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem', boxShadow: '0 4px 14px rgba(2,132,199,0.2)', fontFamily: 'inherit' }}
                        >
                          Voir tout le catalogue
                        </button>
                      )}
                      {hasActiveFilters && (
                        <button
                          onClick={resetFilters}
                          style={{ padding: '11px 24px', background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: 14, fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem', fontFamily: 'inherit' }}
                        >
                          Réinitialiser les filtres
                        </button>
                      )}
                    </div>
                  </div>
                )
                : servicesFiltres.map((svc, idx) => {
                  const isMatch = matchIds.has(svc.id);
                  const gradIdx = (svc.id || 0) % GRADIENTS.length;
                  const abonneTier = svc.prestataire?.type_abonnement || 'gratuit';
                  const isPremium = abonneTier === 'pro' || abonneTier === 'prestige';
                  return (
                    <div
                      key={svc.id}
                      className={`sv-card ${abonneTier !== 'gratuit' ? `sv-premium-${abonneTier}` : ''} ${isMatch ? 'sv-matched-highlight' : ''}`}
                      style={{ animationDelay: `${Math.min(idx, 8) * 0.045}s` }}
                    >
                      {isMatch && (
                        <div className="sv-match-banner">
                          <i className="bi bi-stars" /> IA RECOMMANDÉ
                        </div>
                      )}

                      {/* Image */}
                      <div className="sv-card-img">
                        {svc.image_url
                          ? <img src={svc.image_url} alt={svc.nom} />
                          : (
                            <div
                              className="sv-card-img-placeholder"
                              style={{ background: GRADIENTS[gradIdx] }}
                            >
                              <i className={`bi ${svc.categorie?.icone || 'bi-briefcase'}`} />
                            </div>
                          )
                        }

                        {isPremium && (
                          <span className={`sv-tier-badge badge-${abonneTier}`}>
                            {abonneTier === 'prestige' ? (
                              <><i className="bi bi-gem" /> Prestige</>
                            ) : (
                              <><i className="bi bi-patch-check-fill" /> Pro</>
                            )}
                          </span>
                        )}
                      </div>

                      {/* Body */}
                      <div className="sv-card-body">
                        {/* Provider information */}
                        <div className="sv-provider-row">
                          <div className="sv-provider-avatar-container">
                            {svc.prestataire?.photo_url ? (
                              <img src={svc.prestataire.photo_url} alt="" className="sv-provider-avatar" />
                            ) : (
                              <div className="sv-provider-avatar-text">
                                {(svc.prestataire_nom || svc.prestataire?.user?.first_name || svc.prestataire?.user?.username || 'P')[0].toUpperCase()}
                              </div>
                            )}
                            {svc.disponibilite && (
                              <span className="sv-provider-status-dot" title="Disponible" />
                            )}
                          </div>
                          
                          <span className="sv-provider-name-text">
                            {svc.prestataire_nom || svc.prestataire?.user?.first_name || svc.prestataire?.user?.username || 'Prestataire'}
                          </span>

                          {svc.note_avg && (
                            <span className="sv-card-rating-badge">
                              <i className="bi bi-star-fill" /> {parseFloat(svc.note_avg).toFixed(1)}
                            </span>
                          )}
                        </div>

                        {/* Category text above title */}
                        <div className="sv-card-category-text">
                          {svc.categorie?.nom || 'Général'}
                        </div>

                        <h4 className="sv-card-title">{svc.nom}</h4>
                        <p className="sv-card-desc">
                          {svc.description || 'Aucune description disponible pour ce service.'}
                        </p>

                        <div className="sv-card-footer">
                          <div>
                            <div className="sv-price-lbl">Tarif indicatif</div>
                            {svc.prix
                              ? <div className="sv-price-val">
                                  {parseFloat(svc.prix).toLocaleString('fr-FR')}
                                  <small> FCFA</small>
                                </div>
                              : <div className="sv-price-devis">Sur devis</div>
                            }
                          </div>
                          <Link to={`/services/${svc.id}`} className="sv-btn-detail">
                            Réserver <i className="bi bi-arrow-right-short" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })
            }
          </div>
        </div>
      </div>
    </>
  );
}
