import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const ANIM = `
@keyframes fadeUp   { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
@keyframes fadeIn   { from{opacity:0} to{opacity:1} }
@keyframes float    { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
@keyframes spinRing { to{transform:rotate(360deg)} }
.login-input-wrap { transition:border-color .2s,box-shadow .2s; }
.login-input-wrap:focus-within { border-color:#0284c7 !important; box-shadow:0 0 0 3px rgba(2,132,199,.15) !important; }
.login-btn:hover { opacity:.9; transform:translateY(-1px); box-shadow:0 8px 24px rgba(2,132,199,.4) !important; }
.login-btn { transition:all .2s; }
.login-link:hover { color:#0284c7; }
.login-link { transition:color .15s; }
`;

export default function Login() {
  const [form,    setForm]    = useState({ username:'', password:'' });
  const [error,   setError]   = useState('');
  const [loading, setLoading] = useState(false);
  const [showPw,  setShowPw]  = useState(false);
  const { login } = useAuth();
  const navigate  = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const res = await api.post('/auth/login/', form);
      login(res.data);
      const type = res.data?.user?.type_compte;
      if (res.data?.user?.is_staff || type === 'admin') navigate('/admin-dashboard');
      else if (type === 'prestataire') navigate('/prestataire-dashboard');
      else if (type === 'client') navigate('/services');
      else navigate('/services');
    } catch {
      setError("Nom d'utilisateur ou mot de passe incorrect.");
    } finally { setLoading(false); }
  };

  return (
    <>
      <style>{ANIM}</style>
      <div style={{ minHeight:'100vh', display:'grid', gridTemplateColumns:'1fr 1fr', background:'#f0f8ff' }}>

        {/* ── Panneau gauche (illustration) ── */}
        <div style={{
          background:'linear-gradient(135deg,#0c2340 0%,#0a3060 60%,#0284c7 100%)',
          display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
          padding:'60px 48px', position:'relative', overflow:'hidden',
        }} className="login-left">
          {/* Cercles déco */}
          <div style={{ position:'absolute', top:-80, right:-80, width:320, height:320, borderRadius:'50%', background:'rgba(255,255,255,.05)', pointerEvents:'none' }} />
          <div style={{ position:'absolute', bottom:-60, left:-60, width:220, height:220, borderRadius:'50%', background:'rgba(255,255,255,.03)', pointerEvents:'none' }} />

          {/* Illustration centrale */}
          <div style={{ animation:'float 4s ease-in-out infinite', marginBottom:40, position:'relative', zIndex:1 }}>
            <div style={{ width:160, height:160, borderRadius:'50%', background:'rgba(255,255,255,.08)', border:'2px solid rgba(255,255,255,.12)', display:'flex', alignItems:'center', justifyContent:'center', backdropFilter:'blur(8px)' }}>
              <div style={{ width:120, height:120, borderRadius:'50%', background:'rgba(255,255,255,.1)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                <i className="bi bi-briefcase-fill" style={{ fontSize:'4rem', color:'rgba(255,255,255,.85)' }} />
              </div>
            </div>
          </div>

          <h2 style={{ color:'#fff', fontWeight:900, fontSize:'1.8rem', textAlign:'center', marginBottom:12, position:'relative', zIndex:1 }}>
            Service Market
          </h2>
          <p style={{ color:'rgba(255,255,255,.7)', textAlign:'center', lineHeight:1.7, fontSize:'0.95rem', maxWidth:320, position:'relative', zIndex:1, marginBottom:40 }}>
            La plateforme de mise en relation entre clients et prestataires de services au Togo.
          </p>

          {/* Stats */}
          <div style={{ display:'flex', gap:32, position:'relative', zIndex:1 }}>
            {[['500+','Prestataires'],['1k+','Services'],['98%','Satisfaction']].map(([n,l]) => (
              <div key={l} style={{ textAlign:'center' }}>
                <div style={{ color:'#fff', fontWeight:900, fontSize:'1.4rem' }}>{n}</div>
                <div style={{ color:'rgba(255,255,255,.5)', fontSize:'0.75rem', marginTop:2 }}>{l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Panneau droit (formulaire) ── */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'center', padding:'40px 24px' }}>
          <div style={{ width:'100%', maxWidth:420, animation:'fadeUp .5s ease' }}>

            {/* Logo mobile */}
            <div style={{ textAlign:'center', marginBottom:36 }}>
              <div style={{ width:56, height:56, borderRadius:16, background:'linear-gradient(135deg,#0c2340,#0284c7)', display:'inline-flex', alignItems:'center', justifyContent:'center', marginBottom:12 }}>
                <i className="bi bi-briefcase-fill" style={{ color:'#fff', fontSize:'1.6rem' }} />
              </div>
              <h3 style={{ fontWeight:900, color:'#0c2340', margin:'0 0 6px' }}>Connexion</h3>
              <p style={{ color:'#64748b', fontSize:'0.88rem', margin:0 }}>Bienvenue ! Connectez-vous à votre compte</p>
            </div>

            {/* Erreur */}
            {error && (
              <div style={{ background:'#fef2f2', border:'1.5px solid #fecaca', borderRadius:12, padding:'12px 16px', marginBottom:20, display:'flex', alignItems:'center', gap:10, animation:'fadeIn .2s ease' }}>
                <i className="bi bi-exclamation-circle-fill" style={{ color:'#ef4444', flexShrink:0 }} />
                <span style={{ color:'#b91c1c', fontSize:'0.88rem', fontWeight:500 }}>{error}</span>
              </div>
            )}

            <div style={{ display:'flex', flexDirection:'column', gap:18 }}>
              {/* Username */}
              <div>
                <label style={{ display:'block', fontWeight:700, fontSize:'0.82rem', color:'#374151', marginBottom:8, textTransform:'uppercase', letterSpacing:'.04em' }}>
                  Nom d'utilisateur
                </label>
                <div className="login-input-wrap" style={{ display:'flex', alignItems:'center', background:'#fff', border:'1.5px solid #e2e8f0', borderRadius:12, overflow:'hidden', boxShadow:'0 2px 8px rgba(0,0,0,.04)' }}>
                  <div style={{ padding:'0 14px', display:'flex', alignItems:'center', flexShrink:0 }}>
                    <i className="bi bi-person" style={{ color:'#94a3b8', fontSize:'1rem' }} />
                  </div>
                  <input type="text" required placeholder="Votre nom d'utilisateur"
                    value={form.username} onChange={e => setForm({...form, username:e.target.value})}
                    style={{ flex:1, padding:'13px 8px 13px 0', border:'none', outline:'none', fontSize:'0.92rem', color:'#0c2340', background:'transparent' }} />
                </div>
              </div>

              {/* Password */}
              <div>
                <label style={{ display:'block', fontWeight:700, fontSize:'0.82rem', color:'#374151', marginBottom:8, textTransform:'uppercase', letterSpacing:'.04em' }}>
                  Mot de passe
                </label>
                <div className="login-input-wrap" style={{ display:'flex', alignItems:'center', background:'#fff', border:'1.5px solid #e2e8f0', borderRadius:12, overflow:'hidden', boxShadow:'0 2px 8px rgba(0,0,0,.04)' }}>
                  <div style={{ padding:'0 14px', display:'flex', alignItems:'center', flexShrink:0 }}>
                    <i className="bi bi-lock" style={{ color:'#94a3b8', fontSize:'1rem' }} />
                  </div>
                  <input type={showPw ? 'text' : 'password'} required placeholder="Votre mot de passe"
                    value={form.password} onChange={e => setForm({...form, password:e.target.value})}
                    style={{ flex:1, padding:'13px 8px', border:'none', outline:'none', fontSize:'0.92rem', color:'#0c2340', background:'transparent' }} />
                  <button type="button" onClick={() => setShowPw(v => !v)} style={{ padding:'0 14px', background:'none', border:'none', cursor:'pointer', color:'#94a3b8', fontSize:'0.95rem', display:'flex', alignItems:'center' }}>
                    <i className={`bi bi-eye${showPw ? '-slash' : ''}`} />
                  </button>
                </div>
              </div>

              {/* Bouton */}
              <button type="button" onClick={handleSubmit} className="login-btn" disabled={loading} style={{ width:'100%', padding:'14px', borderRadius:12, border:'none', background:'linear-gradient(135deg,#0c2340,#0284c7)', color:'#fff', fontWeight:800, fontSize:'0.95rem', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:10, boxShadow:'0 4px 18px rgba(2,132,199,.35)', marginTop:4 }}>
                {loading ? (
                  <>
                    <span style={{ width:18, height:18, border:'2.5px solid rgba(255,255,255,.3)', borderTopColor:'#fff', borderRadius:'50%', animation:'spinRing .7s linear infinite', display:'inline-block', flexShrink:0 }} />
                    Connexion…
                  </>
                ) : (
                  <><i className="bi bi-box-arrow-in-right" /> Se connecter</>
                )}
              </button>
            </div>

            {/* Séparateur */}
            <div style={{ display:'flex', alignItems:'center', gap:12, margin:'24px 0' }}>
              <div style={{ flex:1, height:1, background:'#e2e8f0' }} />
              <span style={{ color:'#94a3b8', fontSize:'0.78rem' }}>Pas encore de compte ?</span>
              <div style={{ flex:1, height:1, background:'#e2e8f0' }} />
            </div>

            {/* Inscription */}
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
              <Link to="/inscription-client" style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8, padding:'12px', borderRadius:12, border:'1.5px solid #0284c7', color:'#0284c7', textDecoration:'none', fontWeight:700, fontSize:'0.84rem', background:'#f0f9ff', transition:'all .15s' }}
                onMouseEnter={e => { e.currentTarget.style.background='#0284c7'; e.currentTarget.style.color='#fff'; }}
                onMouseLeave={e => { e.currentTarget.style.background='#f0f9ff'; e.currentTarget.style.color='#0284c7'; }}>
                <i className="bi bi-person-plus" /> Client
              </Link>
              <Link to="/inscription-prestataire" style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8, padding:'12px', borderRadius:12, border:'1.5px solid #10b981', color:'#10b981', textDecoration:'none', fontWeight:700, fontSize:'0.84rem', background:'#f0fdf4', transition:'all .15s' }}
                onMouseEnter={e => { e.currentTarget.style.background='#10b981'; e.currentTarget.style.color='#fff'; }}
                onMouseLeave={e => { e.currentTarget.style.background='#f0fdf4'; e.currentTarget.style.color='#10b981'; }}>
                <i className="bi bi-briefcase" /> Prestataire
              </Link>
            </div>

            <div style={{ textAlign:'center', marginTop:20 }}>
              <Link to="/" className="login-link" style={{ color:'#94a3b8', fontSize:'0.85rem', textDecoration:'none', display:'inline-flex', alignItems:'center', gap:5 }}>
                <i className="bi bi-arrow-left" /> Retour à l'accueil
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Responsive : cacher le panneau gauche sur mobile */}
      <style>{`
        @media(max-width:768px){
          .login-left { display:none !important; }
          div[style*="grid-template-columns: 1fr 1fr"] { grid-template-columns:1fr !important; }
        }
      `}</style>
    </>
  );
}