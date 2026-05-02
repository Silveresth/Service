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

  if (loading) return (
    <div style={{ textAlign:'center', padding:80 }}>
      <i className="bi bi-hourglass-split" style={{ fontSize:'3rem', color:'var(--primary-color)' }}></i>
      <p className="mt-3 text-muted">Chargement...</p>
    </div>
  );

  return (
    <div className="py-5" style={{ background:'#f8fafb', minHeight:'70vh' }}>
      <div className="container">

        {/* ── Header ── */}
        <div className="page-header" style={{ marginBottom:28 }}>
          <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:8, flexWrap:'wrap' }}>
            <div style={{
              width:48, height:48, borderRadius:14,
              background:'linear-gradient(135deg, var(--primary-color), #0369a1)',
              display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0
            }}>
              <i className="bi bi-people-fill" style={{ fontSize:'1.4rem', color:'white' }}></i>
            </div>
            <div>
              <h2 style={{ fontWeight:800, fontSize:'1.5rem', marginBottom:2 }}>Nos Prestataires</h2>
              <p className="text-muted" style={{ fontSize:'0.88rem', margin:0 }}>
                Découvrez <strong style={{ color:'var(--primary-color)' }}>{prestataires.length}</strong> professionnels qualifiés
              </p>
            </div>
          </div>
        </div>

        {/* ── Search + Filters ── */}
        <div style={{ marginBottom:24 }}>
          <div className="search-bar-modern mb-3">
            <i className="bi bi-search search-icon"></i>
            <input
              type="text"
              placeholder="Rechercher par nom, spécialité..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            {search && (
              <button onClick={() => setSearch('')} className="search-clear-btn">
                <i className="bi bi-x-lg"></i>
              </button>
            )}
          </div>

          {/* Filtres spécialités */}
          <div style={{ display:'flex', gap:8, overflowX:'auto', paddingBottom:8, msOverflowStyle:'none', scrollbarWidth:'none' }}>
            {specialites.map(s => (
              <button key={s} onClick={() => setSpecialiteFiltre(s)} style={{
                padding:'6px 14px', borderRadius:20, border:'1.5px solid', cursor:'pointer', fontSize:'0.82rem',
                borderColor: specialiteFiltre===s ? 'var(--primary-color)' : '#e2e8f0',
                background: specialiteFiltre===s ? 'var(--primary-color)' : 'white',
                color: specialiteFiltre===s ? 'white' : '#64748b',
                fontWeight: specialiteFiltre===s ? 700 : 500,
                whiteSpace:'nowrap', flexShrink:0, transition:'all 0.15s',
              }}>
                {s === 'all' ? 'Toutes' : s}
              </button>
            ))}
          </div>
        </div>

        {/* ── Grid ── */}
        {filtres.length > 0 ? (
          <div className="prestataires-grid" style={{ display:'flex', flexWrap:'wrap', margin:'0 -12px' }}>
            {filtres.map(p => (
              <div key={p.user?.id} style={{ padding:'0 12px 24px', display:'flex' }}>
                <div className="card-custom" style={{
                  textAlign:'center', padding:'32px 24px', flex:1,
                  display:'flex', flexDirection:'column', alignItems:'center'
                }}>
                  {/* Avatar avec photo-like */}
                  <div style={{
                    width:90, height:90, borderRadius:'50%',
                    background:'linear-gradient(135deg, #e0f2fe, #bae6fd)',
                    display:'flex', alignItems:'center', justifyContent:'center',
                    marginBottom:16, border:'3px solid white',
                    boxShadow:'0 4px 15px rgba(2,132,199,0.2)', position:'relative'
                  }}>
                    <span style={{ fontWeight:800, fontSize:'2rem', color:'var(--primary-color)' }}>
                      {p.user?.username?.[0]?.toUpperCase()}
                    </span>
                    <div style={{
                      position:'absolute', bottom:2, right:2,
                      width:22, height:22, borderRadius:'50%', background:'#22c55e',
                      border:'3px solid white'
                    }}></div>
                  </div>

                  <h5 style={{ fontWeight:800, marginBottom:4, fontSize:'1.05rem' }}>
                    {p.user?.first_name} {p.user?.last_name}
                  </h5>
                  <p className="text-muted" style={{ fontSize:'0.85rem', marginBottom:10 }}>
                    @{p.user?.username}
                  </p>

                  <span style={{
                    background:'#f0fdf4', color:'#166534',
                    padding:'4px 12px', borderRadius:20, fontSize:'0.78rem', fontWeight:600, marginBottom:12,
                    display:'inline-flex', alignItems:'center', gap:5
                  }}>
                    <i className="bi bi-patch-check-fill" style={{ color:'#22c55e' }}></i>
                    Prestataire vérifié
                  </span>

                  {p.specialite && (
                    <span style={{
                      background:'#e0f2fe', color:'#0369a1',
                      padding:'4px 14px', borderRadius:20, fontSize:'0.8rem', fontWeight:600, marginBottom:12
                    }}>
                      {p.specialite}
                    </span>
                  )}

                  <p style={{ color:'#64748b', fontSize:'0.82rem', marginBottom:16, lineHeight:1.6, flex:1 }}>
                    {p.bio || `Professionnel en ${p.specialite || 'services'} avec expérience confirmée.`}
                  </p>

                  <a href={`https://wa.me/228${p.user?.telephone || '90000000'}?text=Bonjour, je suis intéressé(e) par vos services.`}
                    target="_blank" rel="noreferrer"
                    className="btn-whatsapp btn-sm-custom mt-auto"
                    style={{ display:'inline-flex', width:'100%', justifyContent:'center' }}>
                    <i className="bi bi-whatsapp"></i> Contacter
                  </a>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <i className="bi bi-people"></i>
            <h4>Aucun prestataire</h4>
            <p>Aucun résultat pour cette recherche.</p>
            {search && <button onClick={() => { setSearch(''); setSpecialiteFiltre('all'); }} className="btn-primary-custom">Réinitialiser</button>}
          </div>
        )}
      </div>
    </div>
  );
}

