import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

const PMS_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&display=swap');

  .pms-page { background: #f0f8ff; min-height: 100vh; padding-bottom: 60px; }

  /* Hero */
  .pms-hero {
    background: linear-gradient(135deg, #0c2340 0%, #0a3d6b 50%, #0284c7 100%);
    padding: 28px 0 48px; color: white; position: relative; overflow: hidden;
  }
  .pms-hero::after {
    content: ''; position: absolute; bottom: -2px; left: 0; right: 0;
    height: 36px; background: #f0f8ff;
    clip-path: ellipse(55% 100% at 50% 100%);
  }
  .pms-hero-deco {
    position: absolute; border-radius: 50%;
    border: 1px solid rgba(255,255,255,0.06); pointer-events: none;
  }
  .pms-hero-inner {
    max-width: 1100px; margin: 0 auto; padding: 0 24px;
    position: relative; z-index: 1;
    display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 16px;
  }
  .pms-hero-title {
    font-family: 'Syne', sans-serif; font-weight: 800;
    font-size: clamp(1.2rem,3vw,1.6rem); margin: 0 0 4px;
    display: flex; align-items: center; gap: 12px;
  }
  .pms-hero-sub { font-size: 0.86rem; opacity: 0.75; margin: 0; }
  .pms-btn-add {
    display: inline-flex; align-items: center; gap: 8px;
    background: white; color: #0284c7; border: none;
    border-radius: 12px; padding: 11px 20px;
    font-weight: 800; font-size: 0.88rem; font-family: inherit;
    text-decoration: none; cursor: pointer; transition: all .2s;
    box-shadow: 0 4px 14px rgba(0,0,0,0.15);
  }
  .pms-btn-add:hover { background: #e0f2fe; transform: translateY(-1px); color: #0284c7; }

  /* Search */
  .pms-search-wrap { max-width: 1100px; margin: -18px auto 0; padding: 0 24px; position: relative; z-index: 2; }
  .pms-search {
    display: flex; align-items: center;
    background: white; border-radius: 14px;
    border: 1.5px solid #bae6fd;
    box-shadow: 0 4px 16px rgba(2,132,199,0.10);
    overflow: hidden;
  }
  .pms-search-icon { padding: 0 14px; color: #0284c7; font-size: 1rem; }
  .pms-search input {
    flex: 1; border: none; outline: none;
    padding: 13px 0; font-size: 0.9rem; background: transparent; font-family: inherit;
  }
  .pms-search-clear {
    padding: 0 14px; color: #94a3b8; cursor: pointer; font-size: 0.85rem;
    background: none; border: none;
  }
  .pms-search-clear:hover { color: #ef4444; }

  /* Stats bar */
  .pms-stats { max-width: 1100px; margin: 16px auto 0; padding: 0 24px; display: flex; gap: 12px; flex-wrap: wrap; }
  .pms-stat {
    background: white; border-radius: 12px; padding: 10px 18px;
    border: 1.5px solid #e0f2fe; font-size: 0.83rem; font-weight: 700;
    display: flex; align-items: center; gap: 8px; color: #374151;
    box-shadow: 0 2px 8px rgba(2,132,199,0.07);
  }
  .pms-stat i { font-size: 0.95rem; }

  /* Grid */
  .pms-grid {
    display: grid; grid-template-columns: repeat(auto-fill, minmax(290px, 1fr));
    gap: 18px; max-width: 1100px; margin: 20px auto 0; padding: 0 24px;
  }
  @media(max-width:480px) { .pms-grid { grid-template-columns: 1fr; } }

  /* Card */
  .pms-card {
    background: white; border-radius: 18px;
    border: 1.5px solid #e0f2fe;
    box-shadow: 0 4px 16px rgba(2,132,199,0.08);
    overflow: hidden; display: flex; flex-direction: column;
    transition: all .22s;
  }
  .pms-card:hover { transform: translateY(-4px); box-shadow: 0 10px 32px rgba(2,132,199,0.16); border-color: #7dd3fc; }

  /* Thumbnail */
  .pms-thumb {
    height: 160px;
    background: linear-gradient(135deg, #e0f2fe, #bae6fd);
    display: flex; align-items: center; justify-content: center;
    position: relative; overflow: hidden;
  }
  .pms-thumb img { width: 100%; height: 100%; object-fit: cover; }
  /* Make the placeholder icon more prominent/visible */
  .pms-thumb-icon {
    font-size: 3.2rem;
    color: #0369a1;
    text-shadow: 0 2px 10px rgba(2,132,199,.22);
    filter: drop-shadow(0 6px 18px rgba(0,0,0,.08));
    background: rgba(255,255,255,.55);
    border: 1.5px solid rgba(186,230,253,.95);
    width: 74px; height: 74px;
    border-radius: 22px;
    display: flex; align-items: center; justify-content: center;
  }

  .pms-status-badge {
    position: absolute; top: 10px; right: 10px;
    padding: 4px 12px; border-radius: 50px; font-size: 0.71rem; font-weight: 800;
    display: flex; align-items: center; gap: 5px;
    backdrop-filter: blur(4px);
  }
  .pms-status-badge.active   { background: rgba(240,253,244,0.92); color: #166534; }
  .pms-status-badge.inactive { background: rgba(254,243,199,0.92); color: #92400e; }

  /* Body */
  .pms-body { padding: 16px; flex: 1; display: flex; flex-direction: column; gap: 8px; }
  .pms-name { font-family: 'Syne',sans-serif; font-weight: 800; color: #0c2340; font-size: 1rem; line-height: 1.3; }
  .pms-cat {
    display: inline-flex; align-items: center; gap: 5px;
    background: #e0f2fe; color: #0369a1;
    border-radius: 50px; padding: 3px 10px; font-size: 0.73rem; font-weight: 700;
    width: fit-content;
  }
  .pms-meta { display: flex; align-items: center; justify-content: space-between; margin-top: 4px; }
  .pms-price { font-family: 'Syne',sans-serif; font-weight: 800; color: #0284c7; font-size: 1.05rem; }
  .pms-rating { font-size: 0.8rem; color: #64748b; display: flex; align-items: center; gap: 5px; }
  .pms-rating i { color: #f59e0b; }

  /* Footer */
  .pms-footer {
    padding: 12px 16px; border-top: 1px solid #f1f5f9;
    display: flex; gap: 8px;
  }
  .pms-btn {
    padding: 8px 12px; border-radius: 10px; border: none;
    font-weight: 700; font-size: 0.8rem; cursor: pointer;
    font-family: inherit; display: flex; align-items: center; gap: 5px;
    text-decoration: none; transition: all .18s;
  }
  .pms-btn-toggle { flex: 1; justify-content: center; }
  .pms-btn-toggle.on  { background: #fee2e2; color: #ef4444; }
  .pms-btn-toggle.off { background: #f0fdf4; color: #166534; }
  .pms-btn-toggle:hover { filter: brightness(0.95); }
  .pms-btn-edit { background: #e0f2fe; color: #0284c7; }
  .pms-btn-edit:hover { background: #bae6fd; color: #0284c7; }
  .pms-btn-del { background: #fee2e2; color: #ef4444; }
  .pms-btn-del:hover { background: #fecaca; }
  .pms-btn-view { background: #f1f5f9; color: #64748b; }
  .pms-btn-view:hover { background: #e2e8f0; }

  /* Empty */
  .pms-empty {
    text-align: center; padding: 64px 24px; color: #94a3b8;
    background: white; border-radius: 18px; border: 1.5px dashed #bae6fd;
    grid-column: 1 / -1;
  }
  .pms-empty i { font-size: 3rem; display: block; margin-bottom: 12px; color: #bae6fd; }
  .pms-empty h5 { font-weight: 800; color: #64748b; margin-bottom: 6px; }
  .pms-empty p { font-size: 0.85rem; margin: 0 0 16px; }

  /* Toast */
  .pms-toast {
    position: fixed; bottom: 28px; left: 50%; transform: translateX(-50%);
    background: #0c2340; color: white; border-radius: 14px;
    padding: 12px 22px; font-weight: 700; font-size: 0.86rem;
    z-index: 9999; box-shadow: 0 8px 28px rgba(0,0,0,0.25);
    display: flex; align-items: center; gap: 9px; white-space: nowrap;
    animation: pms-toast-up .3s ease;
  }
  @keyframes pms-toast-up { from{opacity:0;transform:translateX(-50%) translateY(10px)} to{opacity:1;transform:translateX(-50%) translateY(0)} }
  .pms-toast.success { background: linear-gradient(135deg,#059669,#047857); }
  .pms-toast.warn    { background: linear-gradient(135deg,#d97706,#b45309); }

  /* Spinner */
  .pms-spin { width: 44px; height: 44px; border: 4px solid #e0f2fe; border-top-color: #0284c7; border-radius: 50%; animation: pms-s .8s linear infinite; margin: 0 auto; }
  @keyframes pms-s { to { transform: rotate(360deg); } }
`;

export default function PrestataireMesServices() {
  const [services, setServices] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');
  const [toast, setToast]       = useState(null);

  useEffect(() => {
    api.get('/services/mes_services/')
      .then(r => setServices(r.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const toggleService = (id, cur) => {
    api.patch(`/services/${id}/`, { disponibilite: !cur })
      .then(() => {
        setServices(prev => prev.map(s => s.id === id ? { ...s, disponibilite: !cur } : s));
        showToast(cur ? 'Service désactivé.' : 'Service activé !', cur ? 'warn' : 'success');
      })
      .catch(console.error);
  };

  const deleteService = (id) => {
    if (!window.confirm('Supprimer ce service définitivement ?')) return;
    api.delete(`/services/${id}/`)
      .then(() => { setServices(prev => prev.filter(s => s.id !== id)); showToast('Service supprimé.', 'warn'); })
      .catch(console.error);
  };

  const filtered = services.filter(s =>
    !search ||
    s.nom?.toLowerCase().includes(search.toLowerCase()) ||
    s.categorie?.nom?.toLowerCase().includes(search.toLowerCase())
  );

  const actifs   = services.filter(s => s.disponibilite).length;
  const inactifs = services.filter(s => !s.disponibilite).length;

  if (loading) return (
    <>
      <style>{PMS_STYLES}</style>
      <div style={{ minHeight: '70vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
        <div className="pms-spin"></div>
        <p style={{ color: '#64748b' }}>Chargement de vos services…</p>
      </div>
    </>
  );

  return (
    <>
      <style>{PMS_STYLES}</style>
      <div className="pms-page">

        {/* Hero */}
        <div className="pms-hero">
          <div className="pms-hero-deco" style={{ width: 300, height: 300, top: -100, right: -80 }}></div>
          <div className="pms-hero-inner">
            <div>
              <h1 className="pms-hero-title">
                <i className="bi bi-briefcase-fill"></i> Mes Services
              </h1>
              <p className="pms-hero-sub">{services.length} service{services.length > 1 ? 's' : ''} publiés</p>
            </div>
            <Link to="/prestataire-ajouter-service" className="pms-btn-add">
              <i className="bi bi-plus-circle-fill"></i> Ajouter un service
            </Link>
          </div>
        </div>

        {/* Search */}
        <div className="pms-search-wrap">
          <div className="pms-search">
            <span className="pms-search-icon"><i className="bi bi-search"></i></span>
            <input type="text" placeholder="Rechercher parmi vos services…"
              value={search} onChange={e => setSearch(e.target.value)} />
            {search && (
              <button className="pms-search-clear" onClick={() => setSearch('')}>
                <i className="bi bi-x-lg"></i>
              </button>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="pms-stats">
          <div className="pms-stat"><i className="bi bi-briefcase-fill" style={{ color: '#0284c7' }}></i> {services.length} total</div>
          <div className="pms-stat"><i className="bi bi-check-circle-fill" style={{ color: '#22c55e' }}></i> {actifs} actifs</div>
          {inactifs > 0 && <div className="pms-stat"><i className="bi bi-pause-circle-fill" style={{ color: '#d97706' }}></i> {inactifs} inactifs</div>}
        </div>

        {/* Grid */}
        <div className="pms-grid">
          {filtered.length === 0 ? (
            <div className="pms-empty">
              <i className="bi bi-briefcase"></i>
              <h5>{search ? 'Aucun résultat' : 'Aucun service publié'}</h5>
              <p>{search ? 'Essayez d\'autres termes.' : 'Publiez votre premier service pour commencer.'}</p>
              {!search && (
                <Link to="/prestataire-ajouter-service" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '11px 24px', background: 'linear-gradient(135deg,#0284c7,#0369a1)', color: 'white', borderRadius: 12, textDecoration: 'none', fontWeight: 800, boxShadow: '0 4px 14px rgba(2,132,199,0.28)' }}>
                  <i className="bi bi-plus-circle-fill"></i> Publier un service
                </Link>
              )}
            </div>
          ) : filtered.map(s => (
            <div key={s.id} className="pms-card">
              <div className="pms-thumb">
                {s.image ? <img src={s.image} alt={s.nom} /> : <i className="bi bi-image pms-thumb-icon"></i>}
                <span className={`pms-status-badge ${s.disponibilite ? 'active' : 'inactive'}`}>
                  <i className={`bi bi-${s.disponibilite ? 'check-circle-fill' : 'pause-circle-fill'}`}></i>
                  {s.disponibilite ? 'Actif' : 'Inactif'}
                </span>
              </div>

              <div className="pms-body">
                <div className="pms-name">{s.nom}</div>
                {s.categorie && (
                  <div><span className="pms-cat"><i className={`bi bi-${s.categorie.icone || 'tag'}`}></i> {s.categorie.nom}</span></div>
                )}
                <div className="pms-meta">
                  <span className="pms-price">{Number(s.prix).toLocaleString()} F</span>
                  {s.note_avg ? (
                    <span className="pms-rating"><i className="bi bi-star-fill"></i> {Number(s.note_avg).toFixed(1)} ({s.nb_notes})</span>
                  ) : (
                    <span className="pms-rating" style={{ color: '#cbd5e1' }}>Aucun avis</span>
                  )}
                </div>
              </div>

              <div className="pms-footer">
                <button
                  className={`pms-btn pms-btn-toggle ${s.disponibilite ? 'on' : 'off'}`}
                  onClick={() => toggleService(s.id, s.disponibilite)}>
                  <i className={`bi bi-${s.disponibilite ? 'pause' : 'play'}-fill`}></i>
                  {s.disponibilite ? 'Désactiver' : 'Activer'}
                </button>
                <Link to={`/modifier-service/${s.id}`} className="pms-btn pms-btn-edit">
                  <i className="bi bi-pencil"></i> Éditer
                </Link>
                <Link to={`/services/${s.id}`} className="pms-btn pms-btn-view">
                  <i className="bi bi-eye"></i>
                </Link>
                <button className="pms-btn pms-btn-del" onClick={() => deleteService(s.id)}>
                  <i className="bi bi-trash"></i>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className={`pms-toast ${toast.type}`}>
          <i className={`bi ${toast.type === 'success' ? 'bi-check-circle-fill' : 'bi-exclamation-triangle-fill'}`}></i>
          {toast.msg}
        </div>
      )}
    </>
  );
}