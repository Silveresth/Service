import { useEffect, useState, useRef, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../api/axios';
import SmartMatchButton from '../components/SmartMatchButton';

const PRIX_TRANCHES = [
  { id:'all', label:'Tous les prix' },
  { id:'0-5000', label:'< 5 000 Fcfa' },
  { id:'5000-20000', label:'5 000 – 20 000' },
  { id:'20000-50000', label:'20 000 – 50 000' },
  { id:'50000+', label:'> 50 000 Fcfa' },
];

const TRIS = [
  { id:'pertinence', label:'Pertinence' },
  { id:'prix_asc', label:'Prix ↑' },
  { id:'prix_desc', label:'Prix ↓' },
  { id:'nom_asc', label:'Nom A-Z' },
];

export default function Services() {
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();

  // Smart Match state
  const [matches, setMatches] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [matchIds, setMatchIds] = useState(new Set());
  const [showConfetti, setShowConfetti] = useState(false);

  const [query, setQuery]       = useState(searchParams.get('q') || '');
  const [inputVal, setInputVal] = useState(searchParams.get('q') || '');
  const [catFiltre, setCatFiltre] = useState('all');
  const [dispoOnly, setDispoOnly] = useState(false);
  const [prixTranche, setPrixTranche] = useState('all');
  const [triBy, setTriBy] = useState('pertinence');
  const [showFilters, setShowFilters] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [showSugg, setShowSugg] = useState(false);
  const debounceRef = useRef(null);

  // Load data
  useEffect(() => {
    Promise.all([
      api.get(`/services/${query ? `?search=${query}` : ''}`),
      api.get('/categories/')
    ]).then(([sRes, cRes]) => {
      setServices(sRes.data);
      setCategories(cRes.data);
    }).catch(console.error).finally(() => setLoading(false));
  }, [query]);

  // Search suggestions
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (inputVal.length < 2) { setSuggestions([]); return; }
    debounceRef.current = setTimeout(() => {
      const lower = inputVal.toLowerCase();
      const sugg = services
        .filter(s => s.nom?.toLowerCase().includes(lower) || s.categorie?.nom?.toLowerCase().includes(lower))
        .slice(0, 5)
        .map(s => ({ label: s.nom, cat: s.categorie?.nom, id: s.id }));
      setSuggestions(sugg);
      setShowSugg(sugg.length > 0);
    }, 200);
  }, [inputVal, services]);

  const applySearch = (val) => {
    setQuery(val);
    setInputVal(val);
    setShowSugg(false);
    setSearchParams(val ? { q: val } : {});
  };

  // Smart Match handlers
  const handleSmartMatches = useCallback((newMatches) => {
    if (newMatches.length === 0) return;
    setMatches(newMatches);
    const ids = new Set(newMatches.map(m => m.service_id));
    setMatchIds(ids);
    setShowModal(true);
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 4000);
  }, []);

  const closeModal = () => {
    setShowModal(false);
    setMatches([]);
  };

  const servicesFiltres = services.filter(s => {
    const matchCat  = catFiltre === 'all' || String(s.categorie?.id) === catFiltre || s.categorie?.nom === catFiltre;
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

  const resetFilters = () => {
    setCatFiltre('all'); setDispoOnly(false); setPrixTranche('all'); setTriBy('pertinence');
  };

  // Modal JSX
  const SmartMatchModal = () => (
    <div className="modal-overlay" style={{ zIndex: 10000 }} onClick={closeModal}>
      <div className="smart-match-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header-custom">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: 40, height: 40, borderRadius: '12px',
              background: 'linear-gradient(135deg, #10b981, #059669)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <i className="bi bi-check-circle-fill" style={{ fontSize: '1.3rem', color: 'white' }} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontWeight: 800, fontSize: '1.2rem' }}>🎯 Matches IA trouvés !</h3>
              <p style={{ margin: 0, color: '#10b981', fontSize: '0.9rem', fontWeight: 600 }}>
                {matches.length} prestataire(s) parfait(s) à proximité
              </p>
            </div>
          </div>
          <button onClick={closeModal} style={{
            background: 'none', border: 'none', fontSize: '1.4rem',
            color: '#94a3b8', cursor: 'pointer', padding: '4px'
          }}>
            <i className="bi bi-x-lg" />
          </button>
        </div>

        <div className="modal-body-custom">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxHeight: '400px', overflowY: 'auto' }}>
            {matches.slice(0, 3).map((match) => (
              <div key={match.service_id} className="match-card" style={{
                padding: '20px',
                background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                borderRadius: '16px',
                border: '1px solid #e2e8f0',
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                transition: 'all 0.2s'
              }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                  <div style={{
                    width: 60, height: 60, borderRadius: '14px',
                    background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <i className="bi bi-star-fill" style={{ fontSize: '1.6rem', color: 'white' }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800 }}>{match.nom}</h4>
                      <span style={{
                        background: '#10b981', color: 'white',
                        padding: '4px 10px', borderRadius: '20px',
                        fontSize: '0.8rem', fontWeight: 700
                      }}>
                        {Math.round(match.similarity * 100)}% match
                      </span>
                    </div>
                    <p style={{ margin: '4px 0 12px', color: '#64748b', fontSize: '0.95rem' }}>
                      Prestataire: <strong>{match.prestataire}</strong>
                    </p>
                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                      <span style={{
                        background: '#dbeafe', color: '#1e40af', padding: '4px 10px',
                        borderRadius: '12px', fontSize: '0.8rem', fontWeight: 600
                      }}>
                        {match.prix?.toLocaleString()} Fcfa
                      </span>
                      {match.distance && (
                        <span style={{
                          background: '#f0fdf4', color: '#166534', padding: '4px 10px',
                          borderRadius: '12px', fontSize: '0.8rem', fontWeight: 600,
                          display: 'flex', alignItems: 'center', gap: '4px'
                        }}>
                          <i className="bi bi-geo-alt" style={{ fontSize: '0.85rem' }} />
                          {match.distance?.toFixed(1)} km
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <Link
                  to={`/services/${match.service_id}`}
                  style={{
                    width: '100%', marginTop: '16px', display: 'block',
                    textAlign: 'center', textDecoration: 'none'
                  }}
                  className="btn-primary-custom"
                >
                  <i className="bi bi-arrow-right" /> Réserver maintenant
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) return (
    <div style={{ textAlign:'center', padding:'80px 20px' }}>
      <i className="bi bi-hourglass-split" style={{ fontSize:'3rem', color:'var(--primary-color)' }}></i>
      <p className="mt-3 text-muted">Chargement...</p>
    </div>
  );

  return (
    <>
      {showModal && <SmartMatchModal />}

      <div className="py-5" style={{ background:'#f8fafb', minHeight:'70vh' }}>
        <div className="container">
          {/* Header avec Smart Match */}
          <div className="page-header" style={{ marginBottom:24 }}>
            <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:8, flexWrap:'wrap' }}>
              <div style={{
                width:48, height:48, borderRadius:14,
                background:'linear-gradient(135deg, var(--primary-color), #0369a1)',
                display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0
              }}>
                <i className="bi bi-grid-3x3-gap-fill" style={{ fontSize:'1.4rem', color:'white' }}></i>
              </div>
              <div>
                <h2 style={{ fontWeight:800, fontSize:'1.5rem', marginBottom:2 }}>Nos Services</h2>
                <p className="text-muted" style={{ fontSize:'0.88rem', margin:0 }}>
                  <strong style={{ color:'var(--primary-color)' }}>{servicesFiltres.length}</strong> service(s) disponible(s)
                  {matches.length > 0 && (
                    <span style={{ color: '#10b981', fontWeight: 600, marginLeft: 8 }}>
                      ✨ <strong>{matches.length}</strong> match{matches.length > 1 ? 'es' : ''} IA !
                    </span>
                  )}
                </p>
              </div>
            </div>

            {/* Smart Match IA Button */}
            <div style={{
              background:'linear-gradient(135deg,#10b981,#059669)',
              borderRadius:16, padding:20, marginBottom:20,
              boxShadow:'0 10px 40px rgba(16,185,129,0.3)',
              position: 'relative', overflow: 'hidden'
            }}>

              <h4 style={{ color:'white', marginBottom:12, fontWeight:700, fontSize:'1.2rem' }}>
                <i className="bi bi-cpu me-2"></i>Smart Matching IA
              </h4>
              <p style={{ color:'rgba(255,255,255,0.9)', marginBottom:16, fontSize:'0.95rem' }}>
                Trouvez le prestataire parfait selon votre localisation, budget et besoins !
              </p>
              <SmartMatchButton
                onMatches={handleSmartMatches}
                setMatches={setMatches}
                setShowModal={setShowModal}
                categories={categories}
              />
            </div>
          </div>

          {/* Search bar */}
          <div style={{ marginBottom:20, position:'relative' }}>
            <div className="search-bar-modern">
              <i className="bi bi-search search-icon"></i>
              <input
                type="text"
                placeholder="Rechercher un service, une catégorie, un prestataire..."
                value={inputVal}
                onChange={e => setInputVal(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') { applySearch(inputVal); setShowSugg(false); }
                  if (e.key === 'Escape') setShowSugg(false);
                }}
                onFocus={() => suggestions.length > 0 && setShowSugg(true)}
                onBlur={() => setTimeout(() => setShowSugg(false), 150)}
              />
              {inputVal && (
                <button onClick={() => { setInputVal(''); applySearch(''); }} className="search-clear-btn">
                  <i className="bi bi-x-lg"></i>
                </button>
              )}
              <button onClick={() => applySearch(inputVal)} className="search-btn-pill">
                <i className="bi bi-search"></i> <span className="hide-mobile">Rechercher</span>
              </button>
            </div>

            {showSugg && suggestions.length > 0 && (
              <div className="search-suggestions">
                {suggestions.map((s, i) => (
                  <div key={i} onClick={() => applySearch(s.label)} className="search-suggestion-item"
                    style={{ borderBottom: i < suggestions.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
                    <i className="bi bi-search"></i>
                    <span>{s.label}</span>
                    {s.cat && <span className="sugg-cat">{s.cat}</span>}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Category filters */}
          <div style={{ display:'flex', gap:8, overflowX:'auto', paddingBottom:8, marginBottom:16, msOverflowStyle:'none', scrollbarWidth:'none' }}>
            <button onClick={() => setCatFiltre('all')} style={{
              padding:'6px 16px', borderRadius:20, border:'1.5px solid', cursor:'pointer', fontSize:'0.85rem',
              fontWeight: catFiltre === 'all' ? 700 : 400,
              borderColor: catFiltre === 'all' ? 'var(--primary-color)' : '#e2e8f0',
              background: catFiltre === 'all' ? 'var(--primary-color)' : 'white',
              color: catFiltre === 'all' ? 'white' : '#64748b',
              whiteSpace:'nowrap', flexShrink:0, transition:'all 0.15s',
            }}>
              <i className="bi bi-grid me-1"></i>Tous
            </button>
            {categories.map(c => (
              <button key={c.id} onClick={() => setCatFiltre(String(c.id))} style={{
                padding:'6px 14px', borderRadius:20, border:'1.5px solid', cursor:'pointer', fontSize:'0.82rem',
                fontWeight: catFiltre === String(c.id) ? 700 : 400,
                borderColor: catFiltre === String(c.id) ? 'var(--primary-color)' : '#e2e8f0',
                background: catFiltre === String(c.id) ? 'var(--primary-color)' : 'white',
                color: catFiltre === String(c.id) ? 'white' : '#64748b',
                display:'flex', alignItems:'center', gap:5, transition:'all 0.15s',
                whiteSpace:'nowrap', flexShrink:0,
              }}>
                {c.icone && <i className={`bi ${c.icone}`} style={{ fontSize:'0.8rem' }}></i>}
                {c.nom}
              </button>
            ))}
            <button onClick={() => setShowFilters(!showFilters)} style={{
              marginLeft:'auto', padding:'6px 14px', borderRadius:20, border:'1.5px solid', cursor:'pointer', fontSize:'0.82rem',
              borderColor: hasActiveFilters ? 'var(--primary-color)' : '#e2e8f0',
              background: hasActiveFilters ? '#e0f2fe' : 'white',
              color: hasActiveFilters ? 'var(--primary-color)' : '#64748b',
              display:'flex', alignItems:'center', gap:6,
              fontWeight: hasActiveFilters ? 600 : 400,
              whiteSpace:'nowrap', flexShrink:0,
            }}>
              <i className="bi bi-sliders"></i><span className="hide-mobile">Filtres</span>
              {hasActiveFilters && (
                <span style={{
                  background:'var(--primary-color)', color:'white', borderRadius:'50%',
                  width:18, height:18, fontSize:'0.7rem',
                  display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700
                }}>
                  {[catFiltre !== 'all', dispoOnly, prixTranche !== 'all'].filter(Boolean).length}
                </span>
              )}
            </button>
          </div>

          {showFilters && (
            <div className="card-custom mb-4" style={{ padding:20 }}>
              <div style={{ display:'flex', gap:24, flexWrap:'wrap', alignItems:'flex-end' }}>
                <div>
                  <label style={{ fontSize:'0.82rem', fontWeight:600, color:'#64748b', display:'block', marginBottom:6 }}>Fourchette de prix</label>
                  <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                    {PRIX_TRANCHES.map(p => (
                      <button key={p.id} onClick={() => setPrixTranche(p.id)} style={{
                        padding:'5px 12px', borderRadius:8, border:'1.5px solid', cursor:'pointer', fontSize:'0.8rem',
                        borderColor: prixTranche === p.id ? 'var(--primary-color)' : '#e2e8f0',
                        background: prixTranche === p.id ? 'var(--primary-light)' : 'white',
                        color: prixTranche === p.id ? 'var(--primary-color)' : '#64748b',
                        fontWeight: prixTranche === p.id ? 600 : 400,
                      }}>{p.label}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <label style={{ fontSize:'0.82rem', fontWeight:600, color:'#64748b', display:'block', marginBottom:6 }}>Trier par</label>
                  <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                    {TRIS.map(t => (
                      <button key={t.id} onClick={() => setTriBy(t.id)} style={{
                        padding:'5px 12px', borderRadius:8, border:'1.5px solid', cursor:'pointer', fontSize:'0.8rem',
                        borderColor: triBy === t.id ? 'var(--primary-color)' : '#e2e8f0',
                        background: triBy === t.id ? 'var(--primary-light)' : 'white',
                        color: triBy === t.id ? 'var(--primary-color)' : '#64748b',
                        fontWeight: triBy === t.id ? 600 : 400,
                      }}>{t.label}</button>
                    ))}
                  </div>
                </div>
                <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
                  <label style={{ fontSize:'0.82rem', fontWeight:600, color:'#64748b' }}>Disponibilité</label>
                  <label style={{ display:'flex', alignItems:'center', gap:8, cursor:'pointer', fontSize:'0.85rem', color:'#64748b' }}>
                    <input type="checkbox" checked={dispoOnly} onChange={e => setDispoOnly(e.target.checked)} />
                    Disponibles seulement
                  </label>
                </div>
                {hasActiveFilters && (
                  <button onClick={resetFilters} style={{
                    marginLeft:'auto', background:'none', border:'1.5px solid #ef4444',
                    color:'#ef4444', padding:'6px 14px', borderRadius:8,
                    cursor:'pointer', fontSize:'0.82rem', fontWeight:600, alignSelf:'flex-end'
                  }}>
                    <i className="bi bi-x-circle me-1"></i>Réinitialiser
                  </button>
                )}
              </div>
            </div>
          )}

          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20, flexWrap:'wrap', gap:8 }}>
            <p className="text-muted" style={{ fontSize:'0.9rem', margin:0 }}>
              {query && <>Résultats pour "<strong style={{ color:'#0c2340' }}>{query}</strong>" — </>}
              <strong style={{ color:'var(--primary-color)' }}>{servicesFiltres.length}</strong> service(s) trouvé(s)
            </p>
            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
              <span style={{ fontSize:'0.82rem', color:'#94a3b8' }}>Tri :</span>
              <select
                style={{ border:'1px solid #e2e8f0', borderRadius:8, padding:'4px 10px', fontSize:'0.82rem', color:'#64748b' }}
                value={triBy} onChange={e => setTriBy(e.target.value)}
              >
                {TRIS.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
              </select>
            </div>
          </div>

          {servicesFiltres.length > 0 ? (
            <div className="services-grid" style={{ display:'flex', flexWrap:'wrap', margin:'0 -12px' }}>
              {servicesFiltres.map(service => {
                const isMatch = matchIds.has(service.id);
                return (
                  <div key={service.id} style={{ padding:'0 12px 24px' }}>
                    <div className={`card-custom ${isMatch ? 'smart-match-highlight' : ''}`} style={{
                      height:'100%', display:'flex', flexDirection:'column', position:'relative',
                      ...(isMatch && {
                        boxShadow: '0 0 0 3px #10b981, 0 12px 40px rgba(16,185,129,0.3)',
                        borderColor: '#10b981'
                      })
                    }}>
                      {isMatch && (
                        <div style={{
                          position:'absolute', top:'12px', right:'12px',
                          background:'linear-gradient(135deg, #10b981, #059669)',
                          color:'white', padding:'6px 12px', borderRadius:'20px',
                          fontSize:'0.8rem', fontWeight:700,
                          boxShadow:'0 4px 15px rgba(16,185,129,0.4)',
                          zIndex:10, animation:'matchPulse 2s infinite'
                        }}>
                          <i className="bi bi-star-fill me-1" /> Match IA #{Array.from(matchIds).indexOf(service.id) + 1}
                        </div>
                      )}
                      <div className="service-card-img" style={{ position:'relative', overflow:'hidden' }}>
                        {service.image_url ? (
                          <img src={service.image_url} alt={service.nom} style={{ width:'100%', height:'100%', objectFit:'cover', borderRadius:12 }} />
                        ) : service.categorie?.icone ? (
                          <i className={`bi ${service.categorie.icone}`} style={{ fontSize:'3.5rem', color:'var(--primary-color)', opacity:0.6 }}></i>
                        ) : (
                          <i className="bi bi-briefcase" style={{ fontSize:'3.5rem', color:'var(--primary-color)', opacity:0.6 }}></i>
                        )}
                      </div>
                      <div className="card-body-custom" style={{ flex:1, display:'flex', flexDirection:'column' }}>
                        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
                          <span className="badge-category">{service.categorie?.nom || 'Service'}</span>
                          <span className={`badge ${service.disponibilite ? 'badge-success' : 'badge-secondary'}`}>
                            {service.disponibilite ? '● Disponible' : '○ Indisponible'}
                          </span>
                        </div>
                        <h5 style={{ fontWeight:700, marginBottom:8 }}>{service.nom}</h5>
                        <p className="text-muted" style={{ fontSize:'0.9rem', flex:1, lineHeight:1.6 }}>
                          {service.description?.split(' ').slice(0, 20).join(' ')}{service.description?.split(' ').length > 20 ? '...' : ''}
                        </p>
                        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
                          <div style={{ display:'flex', alignItems:'center' }}>
                            <div className="avatar me-2" style={{ width:28, height:28, fontSize:'0.75rem' }}>
                              {service.prestataire?.user?.username?.[0]?.toUpperCase()}
                            </div>
                            <small className="text-muted">{service.prestataire?.user?.username}</small>
                          </div>
                          {service.note_avg && (
                            <div style={{ display:'flex', alignItems:'center', gap:2 }}>
                              <span style={{ color:'#f59e0b', fontWeight:700, fontSize:'0.85rem' }}>★ {service.note_avg}</span>
                              <span style={{ color:'#94a3b8', fontSize:'0.7rem' }}>({service.nb_notes || 0})</span>
                            </div>
                          )}
                        </div>
                        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                          <span className="price">{service.prix} Fcfa</span>
                          <Link to={`/services/${service.id}`} className="btn-primary-custom btn-sm-custom">
                            Voir détails
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="empty-state">
              <i className="bi bi-inbox"></i>
              <h4>Aucun service trouvé</h4>
              <p>Essayez avec d'autres mots-clés ou modifiez les filtres.</p>
              <div style={{ display:'flex', gap:12, justifyContent:'center', flexWrap:'wrap' }}>
                {query && <button onClick={() => applySearch('')} className="btn-primary-custom">Voir tous les services</button>}
                {hasActiveFilters && <button onClick={resetFilters} className="btn-secondary-custom">Réinitialiser les filtres</button>}
              </div>
            </div>
          )}
        </div>
      </div>

    </>
  );
}
