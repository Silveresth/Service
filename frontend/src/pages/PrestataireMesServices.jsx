import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

export default function PrestataireMesServices() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    api.get('/services/mes_services/').then(res => {
      setServices(res.data || []);
      setLoading(false);
    }).catch(() => { setError('Erreur chargement services'); setLoading(false); });
  }, []);

  const toggleService = (id, cur) => {
    api.patch(`/services/${id}/`, { disponibilite: !cur })
      .then(() => setServices(services.map(s => s.id === id ? {...s, disponibilite: !cur} : s)))
      .catch(console.error);
  };

  const deleteService = (id) => {
    if (!window.confirm('Supprimer ce service ?')) return;
    api.delete(`/services/${id}/`).then(() => setServices(services.filter(s => s.id !== id)));
  };

  const filtered = services.filter(s =>
    !search || s.nom?.toLowerCase().includes(search.toLowerCase()) ||
    s.categorie?.nom?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return (
    <div style={{ minHeight:'70vh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:16 }}>
      <div style={{ width:44, height:44, borderRadius:'50%', border:'4px solid #e0f2fe', borderTopColor:'#0284c7', animation:'spin .8s linear infinite' }}></div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <p style={{ color:'#64748b' }}>Chargement de vos services…</p>
    </div>
  );

  return (
    <>
      <style>{`
        .pmserv-page { background:#f0f8ff; min-height:100vh; padding-bottom:48px; }
        .pmserv-header { background:linear-gradient(135deg,#0c2340,#0284c7); padding:28px 20px; color:#fff; }
        .pmserv-header-inner { max-width:1100px; margin:0 auto; display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:14px; }
        .pmserv-header h1 { font-size:clamp(1.2rem,3vw,1.6rem); font-weight:800; margin:0; }
        .pmserv-header p { margin:4px 0 0; opacity:.8; font-size:.88rem; }
        .pmserv-btn-add { background:#fff; color:#0284c7; border:none; border-radius:12px; padding:10px 20px; font-weight:700; font-size:.88rem; display:flex; align-items:center; gap:7px; text-decoration:none; transition:all .2s; }
        .pmserv-btn-add:hover { background:#e0f2fe; color:#0284c7; }

        .pmserv-search-wrap { max-width:1100px; margin:20px auto 0; padding:0 16px; }
        .pmserv-search-inner { display:flex; align-items:center; background:#fff; border-radius:12px; border:1.5px solid #bae6fd; overflow:hidden; }
        .pmserv-search-inner .ico { padding:0 14px; color:#0284c7; font-size:1rem; }
        .pmserv-search-inner input { flex:1; border:none; outline:none; padding:12px 0; font-size:.9rem; background:transparent; }

        .pmserv-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(280px,1fr)); gap:18px; max-width:1100px; margin:20px auto 0; padding:0 16px; }
        @media(max-width:480px){ .pmserv-grid{grid-template-columns:1fr} }

        .pmserv-card { background:#fff; border-radius:18px; border:1.5px solid #e0f2fe; box-shadow:0 4px 18px rgba(2,132,199,.08); overflow:hidden; display:flex; flex-direction:column; transition:all .22s; }
        .pmserv-card:hover { transform:translateY(-4px); box-shadow:0 10px 30px rgba(2,132,199,.16); border-color:#7dd3fc; }
        .pmserv-card-img { height:150px; background:linear-gradient(135deg,#e0f2fe,#bae6fd); display:flex; align-items:center; justify-content:center; position:relative; overflow:hidden; }
        .pmserv-card-img img { width:100%; height:100%; object-fit:cover; }
        .pmserv-card-img .no-img { font-size:3rem; color:#7dd3fc; }
        .pmserv-status-badge { position:absolute; top:10px; right:10px; padding:4px 12px; border-radius:50px; font-size:.72rem; font-weight:700; }
        .pmserv-card-body { padding:16px; flex:1; display:flex; flex-direction:column; gap:8px; }
        .pmserv-name { font-weight:800; color:#0c2340; font-size:1rem; }
        .pmserv-cat { display:inline-flex; align-items:center; gap:5px; background:#e0f2fe; color:#0369a1; border-radius:50px; padding:3px 10px; font-size:.75rem; font-weight:600; }
        .pmserv-price { font-weight:700; color:#0284c7; font-size:1.1rem; }
        .pmserv-note { color:#64748b; font-size:.82rem; }
        .pmserv-card-footer { padding:12px 16px; border-top:1px solid #f1f5f9; display:flex; gap:8px; }
        .pmserv-btn-toggle { flex:1; padding:8px; border:none; border-radius:10px; font-weight:600; font-size:.82rem; cursor:pointer; transition:all .18s; }
        .pmserv-btn-edit { display:flex; align-items:center; gap:5px; padding:8px 14px; background:#e0f2fe; color:#0284c7; border-radius:10px; border:none; font-weight:600; font-size:.82rem; text-decoration:none; transition:all .18s; }
        .pmserv-btn-edit:hover { background:#bae6fd; color:#0284c7; }
        .pmserv-btn-del { padding:8px 12px; background:#fee2e2; color:#ef4444; border-radius:10px; border:none; cursor:pointer; transition:all .18s; }
        .pmserv-btn-del:hover { background:#fecaca; }
        .pmserv-empty { text-align:center; padding:60px 20px; color:#94a3b8; grid-column:1/-1; }
        .pmserv-empty i { font-size:3rem; display:block; margin-bottom:12px; color:#cbd5e1; }
      `}</style>

      <div className="pmserv-page">
        <div className="pmserv-header">
          <div className="pmserv-header-inner">
            <div>
              <h1><i className="bi bi-briefcase-fill me-2"></i>Mes Services ({services.length})</h1>
              <p>Gérez vos services et leur disponibilité</p>
            </div>
            <Link to="/prestataire-ajouter-service" className="pmserv-btn-add">
              <i className="bi bi-plus-circle-fill"></i> Ajouter un service
            </Link>
          </div>
        </div>

        <div className="pmserv-search-wrap">
          <div className="pmserv-search-inner">
            <span className="ico"><i className="bi bi-search"></i></span>
            <input
              type="text"
              placeholder="Rechercher parmi vos services…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        {error && <div className="alert alert-danger mx-3 mt-3">{error}</div>}

        <div className="pmserv-grid">
          {filtered.length === 0 ? (
            <div className="pmserv-empty">
              <i className="bi bi-briefcase"></i>
              <h5>{search ? 'Aucun résultat' : 'Aucun service publié'}</h5>
              <p style={{ fontSize:'.85rem' }}>{search ? 'Essayez d\'autres termes.' : 'Commencez par ajouter votre premier service.'}</p>
              {!search && (
                <Link to="/prestataire-ajouter-service" style={{ marginTop:12, display:'inline-flex', alignItems:'center', gap:7, padding:'10px 22px', background:'#0284c7', color:'#fff', borderRadius:12, textDecoration:'none', fontWeight:700 }}>
                  <i className="bi bi-plus-circle"></i> Publier un service
                </Link>
              )}
            </div>
          ) : filtered.map(s => (
            <div key={s.id} className="pmserv-card">
              <div className="pmserv-card-img">
                {s.image
                  ? <img src={s.image} alt={s.nom} />
                  : <i className="bi bi-image no-img"></i>
                }
                <span className="pmserv-status-badge" style={{
                  background: s.disponibilite ? '#f0fdf4' : '#fef3c7',
                  color: s.disponibilite ? '#166534' : '#92400e'
                }}>
                  <i className={`bi bi-${s.disponibilite ? 'check-circle-fill' : 'pause-circle-fill'} me-1`}></i>
                  {s.disponibilite ? 'Actif' : 'Inactif'}
                </span>
              </div>
              <div className="pmserv-card-body">
                <div className="pmserv-name">{s.nom}</div>
                {s.categorie && (
                  <div>
                    <span className="pmserv-cat">
                      <i className={`bi bi-${s.categorie.icone || 'tag'}`}></i>
                      {s.categorie.nom}
                    </span>
                  </div>
                )}
                <div className="pmserv-price">{Number(s.prix).toLocaleString()} FCFA</div>
                {s.note_avg && (
                  <div className="pmserv-note">
                    {'★'.repeat(Math.round(s.note_avg))}{'☆'.repeat(5-Math.round(s.note_avg))} {Number(s.note_avg).toFixed(1)}/5 ({s.nb_notes} avis)
                  </div>
                )}
              </div>
              <div className="pmserv-card-footer">
                <button
                  className="pmserv-btn-toggle"
                  style={{
                    background: s.disponibilite ? '#fee2e2' : '#f0fdf4',
                    color: s.disponibilite ? '#ef4444' : '#166534'
                  }}
                  onClick={() => toggleService(s.id, s.disponibilite)}
                >
                  <i className={`bi bi-${s.disponibilite ? 'pause' : 'play'}-fill me-1`}></i>
                  {s.disponibilite ? 'Désactiver' : 'Activer'}
                </button>
                <Link to={`/modifier-service/${s.id}`} className="pmserv-btn-edit">
                  <i className="bi bi-pencil"></i> Éditer
                </Link>
                <button className="pmserv-btn-del" onClick={() => deleteService(s.id)}>
                  <i className="bi bi-trash"></i>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
