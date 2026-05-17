import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';

const ANIM = `
@keyframes fadeUp  { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
@keyframes float   { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
@keyframes pulse2  { 0%,100%{opacity:1} 50%{opacity:.5} }
@keyframes shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
.hcat  { transition:transform .2s,box-shadow .2s; }
.hcat:hover  { transform:translateY(-6px); box-shadow:0 16px 40px rgba(2,132,199,.22) !important; }
.hsvc  { transition:transform .2s,box-shadow .2s; }
.hsvc:hover  { transform:translateY(-4px); box-shadow:0 16px 44px rgba(2,132,199,.18) !important; }
.hcta-link:hover { transform:translateY(-2px); box-shadow:0 12px 40px rgba(0,0,0,.25) !important; }
.hcta-link { transition:transform .2s,box-shadow .2s; }
.skeleton { background:linear-gradient(90deg,#e0f2fe 25%,#bae6fd 50%,#e0f2fe 75%); background-size:200% 100%; animation:shimmer 1.4s infinite; border-radius:12px; }
`;

const CATS = [
  { label:'Plomberie',    icon:'droplet-fill',          color:'#0ea5e9', bg:'#e0f9ff' },
  { label:'Électricité',  icon:'lightning-charge-fill',  color:'#f59e0b', bg:'#fef3c7' },
  { label:'Ménage',       icon:'house-fill',             color:'#10b981', bg:'#d1fae5' },
  { label:'Jardinage',    icon:'flower1',                color:'#ec4899', bg:'#fce7f3' },
  { label:'Peinture',     icon:'palette-fill',           color:'#8b5cf6', bg:'#ede9fe' },
  { label:'Déménagement', icon:'truck',                  color:'#6366f1', bg:'#e0e7ff' },
];

const STEPS = [
  { n:'01', icon:'search',         color:'#0284c7', bg:'#e0f2fe', title:'Recherchez',  desc:'Parcourez notre catalogue et trouvez le service qu\'il vous faut.' },
  { n:'02', icon:'calendar-check', color:'#10b981', bg:'#d1fae5', title:'Réservez',    desc:'Choisissez votre prestataire et réservez en ligne en quelques clics.' },
  { n:'03', icon:'check-circle',   color:'#8b5cf6', bg:'#ede9fe', title:'Profitez',    desc:'Recevez le service à domicile et évaluez votre expérience.' },
];

export default function Home() {
  const [services, setServices] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState('');
  const [focused,  setFocused]  = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/services/').then(r => setServices(r.data.slice(0, 6))).catch(console.error).finally(() => setLoading(false));
  }, []);

  return (
    <>
      <style>{ANIM}</style>

      {/* ── HERO ── */}
      <section style={{ background:'linear-gradient(135deg,#0c2340 0%,#0a3060 55%,#0284c7 100%)', padding:'80px 0 110px', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', top:-100, right:-100, width:500, height:500, borderRadius:'50%', background:'rgba(2,132,199,.1)', pointerEvents:'none' }} />
        <div style={{ position:'absolute', bottom:-80, left:-60, width:300, height:300, borderRadius:'50%', background:'rgba(255,255,255,.03)', pointerEvents:'none' }} />

        <div className="container" style={{ position:'relative', zIndex:1, animation:'fadeUp .6s ease' }}>
          {/* Badge */}
          <div style={{ display:'inline-flex', alignItems:'center', gap:8, background:'rgba(255,255,255,.1)', border:'1px solid rgba(255,255,255,.2)', borderRadius:30, padding:'6px 16px', marginBottom:24, backdropFilter:'blur(8px)' }}>
            <span style={{ width:8, height:8, borderRadius:'50%', background:'#4ade80', animation:'pulse2 2s infinite', display:'inline-block' }} />
            <span style={{ color:'rgba(255,255,255,.9)', fontSize:'0.82rem', fontWeight:600 }}>Plateforme de services #1 au Togo</span>
          </div>

          <h1 style={{ color:'#fff', fontWeight:900, fontSize:'clamp(1.9rem,5vw,3rem)', lineHeight:1.15, marginBottom:20, maxWidth:620 }}>
            Trouvez le meilleur <span style={{ color:'#7dd3fc' }}>prestataire</span> pour vos services
          </h1>
          <p style={{ color:'rgba(255,255,255,.72)', marginBottom:36, fontSize:'1.05rem', lineHeight:1.7, maxWidth:520 }}>
            Des professionnels qualifiés près de chez vous. Qualité garantie, paiement sécurisé, réponse sous 24h.
          </p>

          {/* Recherche */}
          <form onSubmit={e => { e.preventDefault(); navigate(`/services${search ? `?q=${encodeURIComponent(search)}` : ''}`); }}
            style={{ maxWidth:580 }}>
            <div style={{ display:'flex', background:'#fff', borderRadius:16, overflow:'hidden', boxShadow: focused ? '0 0 0 4px rgba(2,132,199,.35),0 8px 32px rgba(0,0,0,.2)' : '0 8px 32px rgba(0,0,0,.2)', transition:'box-shadow .2s' }}>
              <div style={{ padding:'0 14px', display:'flex', alignItems:'center', flexShrink:0 }}>
                <i className="bi bi-search" style={{ color:'#94a3b8', fontSize:'1.1rem' }} />
              </div>
              <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
                placeholder="plomberie, électricité, ménage..."
                style={{ flex:1, padding:'15px 8px', border:'none', outline:'none', fontSize:'0.95rem', color:'#0c2340' }} />
              <button type="submit" style={{ padding:'12px 24px', background:'linear-gradient(135deg,#0c2340,#0284c7)', border:'none', color:'#fff', fontWeight:800, fontSize:'0.9rem', cursor:'pointer', margin:6, borderRadius:10 }}>
                Rechercher
              </button>
            </div>
          </form>

          {/* Tags */}
          <div style={{ display:'flex', gap:8, marginTop:16, flexWrap:'wrap' }}>
            {['Plomberie','Électricité','Ménage','Peinture'].map(t => (
              <button key={t} onClick={() => navigate(`/services?q=${t.toLowerCase()}`)} style={{ padding:'5px 14px', borderRadius:20, border:'1px solid rgba(255,255,255,.25)', background:'rgba(255,255,255,.1)', color:'rgba(255,255,255,.85)', fontSize:'0.8rem', cursor:'pointer', transition:'all .15s' }}
                onMouseEnter={e => e.currentTarget.style.background='rgba(255,255,255,.2)'}
                onMouseLeave={e => e.currentTarget.style.background='rgba(255,255,255,.1)'}>
                {t}
              </button>
            ))}
          </div>

          {/* Stats */}
          <div style={{ display:'flex', gap:36, marginTop:44, flexWrap:'wrap' }}>
            {[['500+','Prestataires'],['1k+','Services'],['98%','Satisfaction']].map(([n, l], i) => (
              <div key={l} style={{ animation:`fadeUp .5s ease ${.2+i*.15}s both` }}>
                <div style={{ color:'#fff', fontWeight:900, fontSize:'1.7rem', lineHeight:1 }}>{n}</div>
                <div style={{ color:'rgba(255,255,255,.55)', fontSize:'0.8rem', marginTop:3 }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CATÉGORIES ── */}
      <section style={{ padding:'64px 0', background:'#fff' }}>
        <div className="container">
          <div style={{ textAlign:'center', marginBottom:44 }}>
            <span style={{ display:'inline-block', padding:'4px 14px', borderRadius:20, background:'#e0f2fe', color:'#0284c7', fontSize:'0.75rem', fontWeight:700, marginBottom:10, textTransform:'uppercase', letterSpacing:'.08em' }}>Catégories</span>
            <h2 style={{ fontWeight:900, fontSize:'clamp(1.4rem,3vw,2rem)', color:'#0c2340', margin:0 }}>Catégories populaires</h2>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(155px,1fr))', gap:14 }}>
            {CATS.map((c, i) => (
              <Link key={c.label} to={`/services?q=${c.label.toLowerCase()}`} style={{ textDecoration:'none' }}>
                <div className="hcat" style={{ textAlign:'center', padding:'26px 14px', borderRadius:18, border:'1.5px solid #f1f5f9', background:'#fff', boxShadow:'0 4px 14px rgba(2,132,199,.06)', animation:`fadeUp .5s ease ${i*.07}s both` }}>
                  <div style={{ margin:'0 auto 12px', width:58, height:58, borderRadius:16, background:c.bg, display:'flex', alignItems:'center', justifyContent:'center' }}>
                    <i className={`bi bi-${c.icon}`} style={{ fontSize:'1.6rem', color:c.color }} />
                  </div>
                  <span style={{ fontWeight:700, color:'#0c2340', fontSize:'0.88rem' }}>{c.label}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── SERVICES POPULAIRES ── */}
      <section style={{ padding:'64px 0', background:'#f0f8ff' }}>
        <div className="container">
          <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'space-between', marginBottom:36, flexWrap:'wrap', gap:12 }}>
            <div>
              <span style={{ display:'inline-block', padding:'4px 14px', borderRadius:20, background:'#dbeafe', color:'#1d4ed8', fontSize:'0.75rem', fontWeight:700, marginBottom:8, textTransform:'uppercase', letterSpacing:'.08em' }}>Populaires</span>
              <h2 style={{ fontWeight:900, fontSize:'clamp(1.3rem,3vw,1.9rem)', color:'#0c2340', margin:0 }}>Services les plus demandés</h2>
            </div>
            <Link to="/services" style={{ padding:'10px 20px', borderRadius:12, border:'1.5px solid #0284c7', color:'#0284c7', textDecoration:'none', fontWeight:700, fontSize:'0.88rem', display:'flex', alignItems:'center', gap:6, transition:'all .15s' }}
              onMouseEnter={e => { e.currentTarget.style.background='#0284c7'; e.currentTarget.style.color='#fff'; }}
              onMouseLeave={e => { e.currentTarget.style.background='transparent'; e.currentTarget.style.color='#0284c7'; }}>
              Voir tout <i className="bi bi-arrow-right" />
            </Link>
          </div>

          {loading ? (
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(255px,1fr))', gap:18 }}>
              {[...Array(6)].map((_,i) => (
                <div key={i} style={{ borderRadius:18, overflow:'hidden', background:'#fff' }}>
                  <div className="skeleton" style={{ height:165 }} />
                  <div style={{ padding:14, display:'flex', flexDirection:'column', gap:9 }}>
                    <div className="skeleton" style={{ height:13, width:'55%' }} />
                    <div className="skeleton" style={{ height:18, width:'80%' }} />
                    <div className="skeleton" style={{ height:13, width:'90%' }} />
                    <div className="skeleton" style={{ height:34 }} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(255px,1fr))', gap:18 }}>
              {services.map((s, i) => (
                <div key={s.id} className="hsvc" style={{ background:'#fff', borderRadius:18, overflow:'hidden', border:'1.5px solid #e8f4fd', boxShadow:'0 4px 14px rgba(2,132,199,.07)', display:'flex', flexDirection:'column', animation:`fadeUp .5s ease ${i*.07}s both` }}>
                  <div style={{ height:165, overflow:'hidden', background:'linear-gradient(135deg,#e0f2fe,#f0f9ff)', display:'flex', alignItems:'center', justifyContent:'center', position:'relative', flexShrink:0 }}>
                    {s.image_url ? <img src={s.image_url} alt={s.nom} style={{ width:'100%', height:'100%', objectFit:'cover' }} /> : <i className={`bi ${s.categorie?.icone||'bi-briefcase'}`} style={{ fontSize:'3.2rem', color:'#0284c7', opacity:.4 }} />}
                    <div style={{ position:'absolute', top:10, left:10, background:'rgba(12,35,64,.75)', backdropFilter:'blur(6px)', color:'#fff', padding:'3px 9px', borderRadius:20, fontSize:'0.7rem', fontWeight:700 }}>
                      {s.categorie?.nom || 'Service'}
                    </div>
                  </div>
                  <div style={{ padding:'13px 15px', flex:1, display:'flex', flexDirection:'column', gap:7 }}>
                    <h5 style={{ margin:0, fontWeight:800, fontSize:'0.96rem', color:'#0c2340', lineHeight:1.3 }}>{s.nom}</h5>
                    <p style={{ margin:0, color:'#64748b', fontSize:'0.8rem', lineHeight:1.6, flex:1 }}>
                      {s.description?.split(' ').slice(0,15).join(' ')}{s.description?.split(' ').length > 15 ? '…' : ''}
                    </p>
                    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginTop:4 }}>
                      <span style={{ fontWeight:900, fontSize:'1rem', color:'#0c2340' }}>
                        {parseFloat(s.prix).toLocaleString()} <span style={{ fontSize:'0.7rem', fontWeight:600, color:'#64748b' }}>Fcfa</span>
                      </span>
                      <Link to={`/services/${s.id}`} style={{ padding:'7px 14px', borderRadius:10, textDecoration:'none', background:'linear-gradient(135deg,#0c2340,#0284c7)', color:'#fff', fontWeight:700, fontSize:'0.78rem', display:'flex', alignItems:'center', gap:4 }}>
                        Voir <i className="bi bi-arrow-right" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── COMMENT ÇA MARCHE ── */}
      <section style={{ padding:'72px 0', background:'#fff' }}>
        <div className="container">
          <div style={{ textAlign:'center', marginBottom:52 }}>
            <span style={{ display:'inline-block', padding:'4px 14px', borderRadius:20, background:'#ede9fe', color:'#7c3aed', fontSize:'0.75rem', fontWeight:700, marginBottom:10, textTransform:'uppercase', letterSpacing:'.08em' }}>Simple</span>
            <h2 style={{ fontWeight:900, fontSize:'clamp(1.4rem,3vw,2rem)', color:'#0c2340', margin:0 }}>Comment ça marche</h2>
            <p style={{ color:'#64748b', marginTop:8, fontSize:'0.95rem' }}>Trouvez et réservez un service en 3 étapes</p>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(240px,1fr))', gap:24 }}>
            {STEPS.map((step, i) => (
              <div key={step.title} style={{ textAlign:'center', padding:'32px 20px', animation:`fadeUp .5s ease ${i*.15}s both` }}>
                <div style={{ position:'relative', display:'inline-block', marginBottom:22 }}>
                  <div style={{ width:76, height:76, borderRadius:'50%', background:step.bg, display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto' }}>
                    <i className={`bi bi-${step.icon}`} style={{ fontSize:'1.9rem', color:step.color }} />
                  </div>
                  <div style={{ position:'absolute', top:-3, right:-3, width:24, height:24, borderRadius:'50%', background:step.color, color:'#fff', fontWeight:900, fontSize:'0.68rem', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:`0 4px 12px ${step.color}55` }}>
                    {step.n}
                  </div>
                </div>
                <h4 style={{ fontWeight:800, color:'#0c2340', marginBottom:8, fontSize:'1.05rem' }}>{step.title}</h4>
                <p style={{ color:'#64748b', lineHeight:1.7, fontSize:'0.88rem', margin:0 }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA PRESTATAIRE ── */}
      <section style={{ background:'linear-gradient(135deg,#0c2340 0%,#0284c7 100%)', padding:'72px 0', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', top:-60, right:-60, width:300, height:300, borderRadius:'50%', background:'rgba(255,255,255,.05)', pointerEvents:'none' }} />
        <div className="container" style={{ textAlign:'center', position:'relative', zIndex:1 }}>
          <div style={{ display:'inline-flex', alignItems:'center', gap:8, background:'rgba(255,255,255,.1)', border:'1px solid rgba(255,255,255,.2)', borderRadius:30, padding:'6px 16px', marginBottom:22 }}>
            <i className="bi bi-briefcase" style={{ color:'#7dd3fc', fontSize:'0.9rem' }} />
            <span style={{ color:'rgba(255,255,255,.9)', fontSize:'0.82rem', fontWeight:600 }}>Pour les prestataires</span>
          </div>
          <h2 style={{ color:'#fff', fontWeight:900, marginBottom:14, fontSize:'clamp(1.4rem,3vw,2.1rem)' }}>Vous êtes prestataire de services ?</h2>
          <p style={{ color:'rgba(255,255,255,.75)', marginBottom:36, fontSize:'1rem', maxWidth:500, margin:'0 auto 36px' }}>
            Rejoignez notre plateforme et développez votre activité. Gérez vos réservations simplement.
          </p>
          <Link to="/inscription-prestataire" className="hcta-link" style={{ background:'#fff', color:'#0c2340', padding:'14px 34px', borderRadius:14, fontWeight:900, textDecoration:'none', display:'inline-flex', alignItems:'center', gap:10, fontSize:'0.98rem', boxShadow:'0 8px 28px rgba(0,0,0,.2)' }}>
            <i className="bi bi-person-plus-fill" /> Devenir prestataire
          </Link>
        </div>
      </section>
    </>
  );
}