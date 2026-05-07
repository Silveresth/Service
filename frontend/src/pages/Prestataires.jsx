import { useEffect, useState } from 'react';
import api from '../api/axios';

export default function Prestataires() {
  const [prestataires, setPrestataires] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [specialiteFiltre, setSpecialiteFiltre] = useState('all');

  useEffect(() => {
    api.get('/prestataires/')
      .then(r => setPrestataires(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const specialites = ['all', ...new Set(prestataires.map(p => p.specialite).filter(Boolean))];

  const filtres = prestataires.filter(p => {
    const q = search.toLowerCase();
    const matchSearch = !q ||
      p.user?.username?.toLowerCase().includes(q) ||
      p.user?.first_name?.toLowerCase().includes(q) ||
      p.user?.last_name?.toLowerCase().includes(q) ||
      p.specialite?.toLowerCase().includes(q);
    const matchSpec = specialiteFiltre === 'all' || p.specialite === specialiteFiltre;
    return matchSearch && matchSpec;
  });

  const getBadge = (p) => {
    const count = p.services_count || 0;
    if (count >= 10) return { label: 'Platine', color: '#6366f1', bg: '#ede9fe', icon: 'bi-gem' };
    if (count >= 5)  return { label: 'Or',      color: '#d97706', bg: '#fef3c7', icon: 'bi-trophy-fill' };
    return                  { label: 'Bronze',  color: '#92400e', bg: '#fde8d8', icon: 'bi-award-fill' };
  };

  if (loading) return (
    <div style={{ minHeight: '70vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
      <div style={{ width:44, height:44, borderRadius:'50%', border:'4px solid #e0f2fe', borderTopColor:'#0284c7', animation:'spin .8s linear infinite' }}></div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <p style={{ color:'#64748b', fontWeight:500 }}>Chargement des prestataires…</p>
    </div>
  );

  return (
    <>
      <style>{`
        .prest-hero{background:linear-gradient(135deg,#0c2340 0%,#0e3a6e 60%,#0284c7 100%);padding:48px 20px 56px;text-align:center;color:#fff;position:relative;overflow:hidden}
        .prest-hero::before{content:'';position:absolute;inset:0;background:url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Ccircle cx='30' cy='30' r='20'/%3E%3C/g%3E%3C/svg%3E");pointer-events:none}
        .prest-hero h1{font-size:clamp(1.6rem,4vw,2.4rem);font-weight:800;margin-bottom:8px}
        .prest-hero p{font-size:.95rem;opacity:.85;margin:0}
        .prest-badge-count{display:inline-flex;align-items:center;gap:6px;background:rgba(255,255,255,.15);backdrop-filter:blur(8px);border:1px solid rgba(255,255,255,.2);border-radius:50px;padding:6px 16px;font-size:.85rem;font-weight:700;margin-top:12px}
        .prest-search-wrap{max-width:520px;margin:-28px auto 0;position:relative;z-index:10;padding:0 16px}
        .prest-search-inner{display:flex;align-items:center;background:#fff;border-radius:14px;box-shadow:0 8px 30px rgba(2,132,199,.18);border:1.5px solid #bae6fd;overflow:hidden}
        .prest-search-inner input{flex:1;border:none;outline:none;padding:14px 16px;font-size:.95rem;background:transparent;color:#0c2340}
        .prest-search-inner .ico{padding:0 14px;color:#0284c7;font-size:1.1rem}
        .prest-search-inner button{background:none;border:none;cursor:pointer;padding:0 14px;color:#94a3b8;font-size:1rem}
        .prest-chips{display:flex;gap:8px;overflow-x:auto;padding:24px 16px 0;max-width:960px;margin:0 auto;scrollbar-width:none}
        .prest-chips::-webkit-scrollbar{display:none}
        .prest-chip{flex-shrink:0;padding:7px 18px;border-radius:50px;border:1.5px solid #bae6fd;background:#fff;color:#0369a1;font-weight:600;font-size:.82rem;cursor:pointer;transition:all .2s;white-space:nowrap}
        .prest-chip.active,.prest-chip:hover{background:#0284c7;color:#fff;border-color:#0284c7}
        .prest-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(270px,1fr));gap:20px;max-width:1200px;margin:28px auto 0;padding:0 16px 56px}
        @media(max-width:480px){.prest-grid{grid-template-columns:1fr}}
        .prest-card{background:#fff;border-radius:20px;box-shadow:0 4px 20px rgba(2,132,199,.07);border:1.5px solid #e0f2fe;overflow:hidden;display:flex;flex-direction:column;transition:transform .22s,box-shadow .22s}
        .prest-card:hover{transform:translateY(-5px);box-shadow:0 12px 35px rgba(2,132,199,.18);border-color:#7dd3fc}
        .prest-card-top{background:linear-gradient(135deg,#e0f2fe,#f0f9ff);padding:28px 20px 20px;display:flex;flex-direction:column;align-items:center;position:relative}
        .prest-avatar{width:84px;height:84px;border-radius:50%;background:linear-gradient(135deg,#0284c7,#0369a1);display:flex;align-items:center;justify-content:center;font-size:2rem;font-weight:800;color:#fff;border:4px solid #fff;box-shadow:0 6px 20px rgba(2,132,199,.25);overflow:hidden;position:relative}
        .prest-avatar img{width:100%;height:100%;object-fit:cover}
        .prest-online{position:absolute;bottom:4px;right:4px;width:18px;height:18px;border-radius:50%;background:#22c55e;border:3px solid #fff}
        .prest-fidel-badge{position:absolute;top:12px;right:12px;display:inline-flex;align-items:center;gap:4px;padding:4px 10px;border-radius:50px;font-size:.72rem;font-weight:700}
        .prest-name{font-size:1.05rem;font-weight:800;color:#0c2340;margin:12px 0 2px;text-align:center}
        .prest-username{color:#64748b;font-size:.8rem;margin-bottom:8px}
        .prest-verified{display:inline-flex;align-items:center;gap:5px;background:#f0fdf4;color:#166534;border-radius:50px;padding:3px 12px;font-size:.75rem;font-weight:600}
        .prest-card-body{padding:16px 18px;flex:1;display:flex;flex-direction:column;gap:10px}
        .prest-spec{display:inline-flex;align-items:center;gap:6px;background:#e0f2fe;color:#0369a1;border-radius:50px;padding:4px 14px;font-size:.8rem;font-weight:600;width:fit-content}
        .prest-bio{color:#64748b;font-size:.83rem;line-height:1.6;flex:1}
        .prest-stats{display:flex;gap:12px;padding:10px 0;border-top:1px solid #f1f5f9;border-bottom:1px solid #f1f5f9}
        .prest-stat{display:flex;flex-direction:column;align-items:center;flex:1}
        .prest-stat-val{font-weight:800;font-size:.95rem;color:#0c2340}
        .prest-stat-lbl{font-size:.7rem;color:#94a3b8;text-transform:uppercase;letter-spacing:.04em}
        .prest-card-footer{padding:14px 18px}
        .btn-prest-wa{display:flex;align-items:center;justify-content:center;gap:8px;width:100%;padding:11px;background:#25D366;color:#fff;border-radius:12px;border:none;font-weight:700;font-size:.88rem;text-decoration:none;transition:all .2s;cursor:pointer}
        .btn-prest-wa:hover{background:#1da350;color:#fff;transform:translateY(-1px)}
        .prest-empty{text-align:center;padding:60px 20px;color:#94a3b8;grid-column:1/-1}
        .prest-empty i{font-size:3.5rem;display:block;margin-bottom:12px;color:#cbd5e1}
      `}</style>

      <div className="prest-hero">
        <h1><i className="bi bi-people-fill me-2"></i>Nos Prestataires</h1>
        <p>Des professionnels qualifiés, vérifiés et disponibles</p>
        <div className="prest-badge-count">
          <i className="bi bi-patch-check-fill" style={{color:'#7dd3fc'}}></i>
          {prestataires.length} prestataires vérifiés
        </div>
      </div>

      <div className="prest-search-wrap">
        <div className="prest-search-inner">
          <span className="ico"><i className="bi bi-search"></i></span>
          <input
            type="text"
            placeholder="Rechercher par nom, spécialité…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && <button onClick={() => setSearch('')}><i className="bi bi-x-lg"></i></button>}
        </div>
      </div>

      <div className="prest-chips">
        {specialites.map(s => (
          <button
            key={s}
            className={`prest-chip ${specialiteFiltre === s ? 'active' : ''}`}
            onClick={() => setSpecialiteFiltre(s)}
          >
            {s === 'all' ? '✦ Tous' : s}
          </button>
        ))}
      </div>

      <div className="prest-grid">
        {filtres.length === 0 ? (
          <div className="prest-empty">
            <i className="bi bi-people"></i>
            <h5>Aucun prestataire trouvé</h5>
            <p style={{fontSize:'.88rem'}}>Essayez d'autres termes ou réinitialisez les filtres.</p>
            {(search || specialiteFiltre !== 'all') && (
              <button onClick={() => { setSearch(''); setSpecialiteFiltre('all'); }}
                style={{marginTop:12,padding:'9px 22px',background:'#0284c7',color:'#fff',border:'none',borderRadius:10,fontWeight:700,cursor:'pointer'}}>
                Réinitialiser
              </button>
            )}
          </div>
        ) : filtres.map(p => {
          const badge = getBadge(p);
          const nom = `${p.user?.first_name||''} ${p.user?.last_name||''}`.trim() || p.user?.username;
          return (
            <div key={p.user?.id} className="prest-card">
              <div className="prest-card-top">
                <div className="prest-fidel-badge" style={{background:badge.bg,color:badge.color}}>
                  <i className={`bi ${badge.icon}`}></i> {badge.label}
                </div>
                <div className="prest-avatar">
                  {p.photo
                    ? <img src={p.photo} alt={nom}/>
                    : <span>{(p.user?.username?.[0]||'?').toUpperCase()}</span>
                  }
                  <div className="prest-online"></div>
                </div>
                <div className="prest-name">{nom}</div>
                <div className="prest-username">@{p.user?.username}</div>
                <span className="prest-verified">
                  <i className="bi bi-patch-check-fill" style={{color:'#22c55e'}}></i>
                  Prestataire vérifié
                </span>
              </div>
              <div className="prest-card-body">
                {p.specialite && (
                  <div><span className="prest-spec"><i className="bi bi-tools"></i>{p.specialite}</span></div>
                )}
                <p className="prest-bio">
                  {p.bio || `Professionnel en ${p.specialite||'services'} avec expérience confirmée.`}
                </p>
                <div className="prest-stats">
                  <div className="prest-stat">
                    <span className="prest-stat-val">{p.services_count||0}</span>
                    <span className="prest-stat-lbl">Services</span>
                  </div>
                  <div className="prest-stat">
                    <span className="prest-stat-val">{p.avg_note ? `${Number(p.avg_note).toFixed(1)}★`:'—'}</span>
                    <span className="prest-stat-lbl">Note</span>
                  </div>
                  <div className="prest-stat">
                    <span className="prest-stat-val">{p.reservations_count||0}</span>
                    <span className="prest-stat-lbl">Missions</span>
                  </div>
                </div>
              </div>
              <div className="prest-card-footer">

              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
