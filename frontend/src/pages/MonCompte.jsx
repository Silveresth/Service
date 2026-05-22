import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const MC_STYLES = `
  /* Police uniformisée: Plus Jakarta Sans */

  .mc-page {

  /* Hero */
  .mc-hero {
    background: linear-gradient(135deg, #0c2340 0%, #0a3d6b 50%, #0284c7 100%);
    padding: 40px 0 70px; color: white; position: relative; overflow: hidden;
  }
  .mc-hero::after {
    content: ''; position: absolute; bottom: -2px; left: 0; right: 0;
    height: 40px; background: #f0f8ff;
    clip-path: ellipse(55% 100% at 50% 100%);
  }
  .mc-hero-deco {
    position: absolute; border-radius: 50%;
    border: 1px solid rgba(255,255,255,0.06); pointer-events: none;
  }
  .mc-hero-inner {
    max-width: 720px; margin: 0 auto; padding: 0 24px;
    position: relative; z-index: 1; text-align: center;
  }
  .mc-avatar {
    width: 88px; height: 88px; border-radius: 50%;
    background: rgba(255,255,255,0.14);
    border: 3px solid rgba(255,255,255,0.28);
    display: flex; align-items: center; justify-content: center;
    font-size: 2rem; font-weight: 800;

    margin: 0 auto 16px; color: white;
    box-shadow: 0 8px 28px rgba(0,0,0,0.2);
  }
  .mc-username {
    font-family: 'Plus Jakarta Sans', sans-serif; font-weight: 800;
    font-size: 1.6rem; margin: 0 0 8px;

  }

  .mc-type-badge {
    display: inline-flex; align-items: center; gap: 7px;
    padding: 5px 16px; border-radius: 50px;
    font-size: 0.82rem; font-weight: 700;
    border: 1px solid rgba(255,255,255,0.25);
    background: rgba(255,255,255,0.12);
    backdrop-filter: blur(6px);
  }

  /* Layout */
  .mc-layout {
    max-width: 720px; margin: -36px auto 0;
    padding: 0 24px; position: relative; z-index: 2;
    display: flex; flex-direction: column; gap: 16px;
  }

  /* Cards */
  .mc-card {
    background: white; border-radius: 20px;
    border: 1.5px solid #e0f2fe;
    box-shadow: 0 4px 20px rgba(2,132,199,0.08);
    overflow: hidden;
    animation: mc-in 0.35s ease both;
  }
  @keyframes mc-in { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }

  .mc-card-header {
    padding: 18px 22px;
    border-bottom: 1px solid #f1f5f9;
    display: flex; align-items: center; justify-content: space-between;
  }
  .mc-card-title {
    font-family: 'Plus Jakarta Sans', sans-serif; font-weight: 800; font-size: 0.95rem;

    color: #0c2340; margin: 0;
    display: flex; align-items: center; gap: 10px;
  }
  .mc-card-title i { color: #0284c7; }
  .mc-card-body { padding: 22px; }

  /* Info rows (read mode) */
  .mc-info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
  @media(max-width:500px) { .mc-info-grid { grid-template-columns: 1fr; } }
  .mc-info-item { background: #f8faff; border-radius: 12px; padding: 12px 16px; border: 1px solid #f1f5f9; }
  .mc-info-lbl { font-size: 0.68rem; text-transform: uppercase; letter-spacing: .06em; color: #94a3b8; font-weight: 700; margin-bottom: 4px; }
  .mc-info-val { font-size: 0.9rem; font-weight: 600; color: #0c2340; display: flex; align-items: center; gap: 8px; }
  .mc-info-val i { color: #0284c7; font-size: 0.85rem; }

  /* Edit form */
  .mc-field { margin-bottom: 16px; }
  .mc-label { display: block; font-size: 0.8rem; font-weight: 700; color: #374151; margin-bottom: 7px; letter-spacing: .02em; }
  .mc-input-wrap {
    display: flex; align-items: center;
    border: 1.5px solid #e2e8f0; border-radius: 12px; background: #fafbfc;
    transition: border-color .2s, box-shadow .2s, background .2s;
  }
  .mc-input-wrap:focus-within {
    border-color: #0284c7; background: white;
    box-shadow: 0 0 0 4px rgba(2,132,199,0.10);
  }
  .mc-input-icon { padding: 0 0 0 14px; color: #94a3b8; font-size: 0.95rem; flex-shrink: 0; transition: color .2s; }
  .mc-input-wrap:focus-within .mc-input-icon { color: #0284c7; }
  .mc-input {
    flex: 1; border: none; background: transparent;
    padding: 12px 14px; font-size: 0.9rem; color: #0c2340;
    outline: none; min-width: 0; font-family: inherit;
  }
  .mc-textarea {
    width: 100%; border: 1.5px solid #e2e8f0; border-radius: 12px;
    padding: 12px 14px; font-size: 0.9rem; color: #0c2340;
    background: #fafbfc; outline: none; resize: vertical; font-family: inherit;
    transition: border-color .2s, box-shadow .2s;
  }
  .mc-textarea:focus { border-color: #0284c7; box-shadow: 0 0 0 4px rgba(2,132,199,0.10); background: white; }
  .mc-grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
  @media(max-width:500px) { .mc-grid2 { grid-template-columns: 1fr; } }

  /* Alert */
  .mc-success {
    background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px;
    padding: 11px 16px; color: #166534; font-size: 0.86rem;
    display: flex; align-items: center; gap: 9px; margin-bottom: 18px;
    animation: mc-in .3s ease;
  }
  .mc-error {
    background: #fef2f2; border: 1px solid #fecaca; border-radius: 12px;
    padding: 11px 16px; color: #dc2626; font-size: 0.86rem;
    display: flex; align-items: center; gap: 9px; margin-bottom: 18px;
  }

  /* Buttons */
  .mc-btn {
    display: inline-flex; align-items: center; justify-content: center; gap: 8px;
    padding: 11px 20px; border-radius: 12px; border: none;
    font-size: 0.88rem; font-weight: 700; font-family: inherit;
    cursor: pointer; text-decoration: none; transition: all .2s;
  }
  .mc-btn-primary {
    background: linear-gradient(135deg,#0284c7,#0369a1); color: white;
    box-shadow: 0 4px 14px rgba(2,132,199,0.28);
  }
  .mc-btn-primary:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 7px 20px rgba(2,132,199,0.38); color: white; }
  .mc-btn-outline {
    border: 1.5px solid #e2e8f0; background: white; color: #64748b;
  }
  .mc-btn-outline:hover { border-color: #0284c7; color: #0284c7; background: #e0f2fe; }
  .mc-btn-danger { background: #fee2e2; color: #dc2626; border: 1.5px solid #fecaca; }
  .mc-btn-danger:hover { background: #fecaca; }
  .mc-btn:disabled { opacity: 0.6; cursor: not-allowed; transform: none !important; }
  .mc-btn-full { width: 100%; }

  /* Nav links section */
  .mc-nav-list { display: flex; flex-direction: column; gap: 8px; }
  .mc-nav-item {
    display: flex; align-items: center; gap: 12px;
    padding: 13px 16px; border-radius: 12px;
    text-decoration: none; font-weight: 700; font-size: 0.88rem;
    transition: all .2s; border: 1.5px solid transparent;
  }
  .mc-nav-item.primary { background: linear-gradient(135deg,#0284c7,#0369a1); color: white; box-shadow: 0 4px 14px rgba(2,132,199,0.25); }
  .mc-nav-item.primary:hover { transform: translateY(-1px); box-shadow: 0 7px 20px rgba(2,132,199,0.35); color: white; }
  .mc-nav-item.outline { background: white; color: #64748b; border-color: #e2e8f0; }
  .mc-nav-item.outline:hover { border-color: #0284c7; color: #0284c7; background: #e0f2fe; }
  .mc-nav-item.danger { background: #fee2e2; color: #dc2626; border-color: #fecaca; cursor: pointer; }
  .mc-nav-item.danger:hover { background: #fecaca; }
  .mc-nav-item i { font-size: 1.1rem; flex-shrink: 0; }
  .mc-nav-item span { flex: 1; }
  .mc-nav-item .mc-nav-arrow { opacity: 0.5; margin-left: auto; font-size: 0.85rem; }

  /* Collapsible password */
  .mc-collapse { overflow: hidden; transition: max-height .3s ease; }
  .mc-collapse.closed { max-height: 0; }
  .mc-collapse.open { max-height: 600px; }

  /* Eye toggle */
  .mc-eye { background: none; border: none; cursor: pointer; padding: 0 14px; color: #94a3b8; transition: color .2s; }
  .mc-eye:hover { color: #0284c7; }

  /* Spinner */
  .mc-spinner { width: 16px; height: 16px; border: 2px solid rgba(255,255,255,0.4); border-top-color: white; border-radius: 50%; animation: mc-spin .7s linear infinite; display: inline-block; }
  @keyframes mc-spin { to { transform: rotate(360deg); } }

  @media(max-width:560px) {
    .mc-card-body { padding: 16px; }
    .mc-hero { padding: 32px 0 60px; }
  }
`;

const TYPE_INFO = {
  prestataire: { label: 'Prestataire', icon: 'bi-briefcase-fill', color: '#22c55e' },
  client:      { label: 'Client',       icon: 'bi-person-fill',   color: '#38bdf8' },
  admin:       { label: 'Admin',        icon: 'bi-shield-fill',   color: '#f59e0b' },
};

function FieldWrap({ label, icon, children }) {
  return (
    <div className="mc-field">
      <label className="mc-label">{label}</label>
      <div className="mc-input-wrap">
        {icon && <i className={`bi bi-${icon} mc-input-icon`}></i>}
        {children}
      </div>
    </div>
  );
}

export default function MonCompte() {
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();

  const [editMode, setEditMode]     = useState(false);
  const [showPwd, setShowPwd]       = useState(false);
  const [showPwdEye, setShowPwdEye] = useState({ cur: false, nw: false, cf: false });

  const [form, setForm] = useState({ first_name: '', last_name: '', email: '', telephone: '', adresse: '' });
  const [pwdForm, setPwdForm] = useState({ current_password: '', new_password: '', confirm_password: '' });

  const [success, setSuccess] = useState('');
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) setForm({ first_name: user.first_name || '', last_name: user.last_name || '', email: user.email || '', telephone: user.telephone || '', adresse: user.adresse || '' });
  }, [user]);

  if (!user) return null;

  const typeInfo = TYPE_INFO[user.type_compte] || TYPE_INFO.client;

  const setF  = f => e => setForm(p => ({ ...p, [f]: e.target.value }));
  const setPF = f => e => setPwdForm(p => ({ ...p, [f]: e.target.value }));

  const notify = (msg, isError = false) => {
    if (isError) { setError(msg); setSuccess(''); }
    else { setSuccess(msg); setError(''); }
    setTimeout(() => { setSuccess(''); setError(''); }, 4000);
  };

  const handleSubmit = async e => {
    e.preventDefault(); setLoading(true);
    try {
      const res = await api.patch('/comptes/me/', form);
      updateUser(res.data); setEditMode(false);
      notify('Profil mis à jour avec succès !');
    } catch (err) { notify(err.response?.data?.non_field_errors || 'Erreur lors de la mise à jour.', true); }
    finally { setLoading(false); }
  };

  const handlePwdSubmit = async e => {
    e.preventDefault();
    if (pwdForm.new_password !== pwdForm.confirm_password) { notify('Les mots de passe ne correspondent pas.', true); return; }
    setLoading(true);
    try {
      await api.post('/auth/password_change/', { old_password: pwdForm.current_password, new_password: pwdForm.new_password });
      setPwdForm({ current_password: '', new_password: '', confirm_password: '' });
      setShowPwd(false);
      notify('Mot de passe modifié avec succès !');
    } catch { notify('Mot de passe actuel incorrect.', true); }
    finally { setLoading(false); }
  };

  const initials = (user.first_name?.[0] || user.username?.[0] || '?').toUpperCase();

  return (
    <>
      <style>{MC_STYLES}</style>
      <div className="mc-page">

        {/* Hero */}
        <div className="mc-hero">
          <div className="mc-hero-deco" style={{ width: 320, height: 320, top: -100, right: -80 }}></div>
          <div className="mc-hero-deco" style={{ width: 200, height: 200, bottom: -60, left: '20%' }}></div>
          <div className="mc-hero-inner">
            <div className="mc-avatar">{initials}</div>
            <h1 className="mc-username">{user.username}</h1>
            <span className="mc-type-badge">
              <i className={`bi ${typeInfo.icon}`} style={{ color: typeInfo.color }}></i>
              {typeInfo.label}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="mc-layout">

          {/* Alerts */}
          {success && <div className="mc-success"><i className="bi bi-check-circle-fill"></i> {success}</div>}
          {error   && <div className="mc-error"><i className="bi bi-exclamation-triangle-fill"></i> {error}</div>}

          {/* Profile card */}
          <div className="mc-card">
            <div className="mc-card-header">
              <h2 className="mc-card-title"><i className="bi bi-person-fill"></i> Informations personnelles</h2>
              {!editMode && (
                <button className="mc-btn mc-btn-outline" onClick={() => setEditMode(true)} style={{ padding: '8px 16px', fontSize: '0.82rem' }}>
                  <i className="bi bi-pencil-square"></i> Modifier
                </button>
              )}
            </div>
            <div className="mc-card-body">
              {!editMode ? (
                <div className="mc-info-grid">
                  {[
                    { lbl: 'Prénom',    val: user.first_name  || '—', icon: 'person' },
                    { lbl: 'Nom',       val: user.last_name   || '—', icon: 'person-badge' },
                    { lbl: 'Email',     val: user.email       || '—', icon: 'envelope' },
                    { lbl: 'Téléphone', val: user.telephone   || '—', icon: 'telephone' },
                    { lbl: 'Adresse',   val: user.adresse     || '—', icon: 'geo-alt' },
                    { lbl: 'Compte créé', val: user.date_joined ? new Date(user.date_joined).toLocaleDateString('fr-FR') : '—', icon: 'calendar3' },
                  ].map(item => (
                    <div key={item.lbl} className="mc-info-item">
                      <div className="mc-info-lbl">{item.lbl}</div>
                      <div className="mc-info-val"><i className={`bi bi-${item.icon}`}></i> {item.val}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  <div className="mc-grid2">
                    <FieldWrap label="Prénom" icon="person">
                      <input type="text" className="mc-input" placeholder="Jean" value={form.first_name} onChange={setF('first_name')} />
                    </FieldWrap>
                    <FieldWrap label="Nom" icon="person-badge">
                      <input type="text" className="mc-input" placeholder="Dupont" value={form.last_name} onChange={setF('last_name')} />
                    </FieldWrap>
                  </div>
                  <FieldWrap label="Email" icon="envelope">
                    <input type="email" className="mc-input" value={form.email} onChange={setF('email')} />
                  </FieldWrap>
                  <div className="mc-grid2">
                    <FieldWrap label="Téléphone" icon="telephone">
                      <input type="tel" className="mc-input" placeholder="+228 90 00 00 00" value={form.telephone} onChange={setF('telephone')} />
                    </FieldWrap>
                    <FieldWrap label="Adresse" icon="geo-alt">
                      <input type="text" className="mc-input" placeholder="Lomé, Togo" value={form.adresse} onChange={setF('adresse')} />
                    </FieldWrap>
                  </div>
                  <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                    <button type="button" className="mc-btn mc-btn-outline" style={{ flex: 1 }} onClick={() => setEditMode(false)}>
                      <i className="bi bi-x-circle"></i> Annuler
                    </button>
                    <button type="submit" className="mc-btn mc-btn-primary" style={{ flex: 1 }} disabled={loading}>
                      {loading ? <><span className="mc-spinner"></span> Enregistrement…</> : <><i className="bi bi-check-circle-fill"></i> Enregistrer</>}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>

          {/* Password card */}
          <div className="mc-card">
            <div className="mc-card-header">
              <h2 className="mc-card-title"><i className="bi bi-shield-lock-fill"></i> Sécurité</h2>
              <button className="mc-btn mc-btn-outline" onClick={() => setShowPwd(v => !v)} style={{ padding: '8px 16px', fontSize: '0.82rem' }}>
                <i className={`bi bi-${showPwd ? 'eye-slash' : 'key'}`}></i> {showPwd ? 'Masquer' : 'Changer le mot de passe'}
              </button>
            </div>

            <div className={`mc-collapse ${showPwd ? 'open' : 'closed'}`}>
              <div className="mc-card-body" style={{ borderTop: '1px solid #f1f5f9' }}>
                <form onSubmit={handlePwdSubmit}>
                  {[
                    { f: 'current_password', label: 'Mot de passe actuel',   key: 'cur', ph: '••••••••' },
                    { f: 'new_password',     label: 'Nouveau mot de passe',  key: 'nw',  ph: 'Minimum 8 caractères' },
                    { f: 'confirm_password', label: 'Confirmer',             key: 'cf',  ph: 'Répétez le nouveau mot de passe' },
                  ].map(({ f, label, key, ph }) => (
                    <div key={f} className="mc-field">
                      <label className="mc-label">{label}</label>
                      <div className="mc-input-wrap">
                        <i className="bi bi-lock-fill mc-input-icon"></i>
                        <input type={showPwdEye[key] ? 'text' : 'password'} className="mc-input"
                          placeholder={ph} value={pwdForm[f]} onChange={setPF(f)} required />
                        <button type="button" className="mc-eye" onClick={() => setShowPwdEye(p => ({ ...p, [key]: !p[key] }))}>
                          <i className={`bi bi-eye${showPwdEye[key] ? '-slash' : ''}`}></i>
                        </button>
                      </div>
                    </div>
                  ))}
                  <button type="submit" className="mc-btn mc-btn-primary mc-btn-full" disabled={loading}>
                    {loading ? <><span className="mc-spinner"></span> Modification…</> : <><i className="bi bi-check-circle-fill"></i> Changer le mot de passe</>}
                  </button>
                </form>
              </div>
            </div>
          </div>

          {/* Navigation card */}
          <div className="mc-card">
            <div className="mc-card-header">
              <h2 className="mc-card-title"><i className="bi bi-grid-fill"></i> Navigation rapide</h2>
            </div>
            <div className="mc-card-body">
              <div className="mc-nav-list">
                {user.type_compte === 'prestataire' && (
                  <>
                    <Link to="/prestataire-dashboard" className="mc-nav-item primary">
                      <i className="bi bi-speedometer2"></i><span>Tableau de bord</span><i className="bi bi-arrow-right mc-nav-arrow"></i>
                    </Link>
                    <Link to="/prestataire-mes-services" className="mc-nav-item outline">
                      <i className="bi bi-briefcase"></i><span>Mes services</span><i className="bi bi-arrow-right mc-nav-arrow"></i>
                    </Link>
                  </>
                )}
                {user.type_compte === 'client' && (
                  <Link to="/mes-reservations" className="mc-nav-item primary">
                    <i className="bi bi-calendar-check"></i><span>Mes réservations</span><i className="bi bi-arrow-right mc-nav-arrow"></i>
                  </Link>
                )}
                {(user.is_staff || user.type_compte === 'admin') && (
                  <Link to="/admin-dashboard" className="mc-nav-item outline">
                    <i className="bi bi-shield-fill"></i><span>Admin Dashboard</span><i className="bi bi-arrow-right mc-nav-arrow"></i>
                  </Link>
                )}
                <Link to="/services" className="mc-nav-item outline">
                  <i className="bi bi-search"></i><span>Découvrir les services</span><i className="bi bi-arrow-right mc-nav-arrow"></i>
                </Link>
                <button className="mc-nav-item danger" onClick={() => { logout(); navigate('/'); }}>
                  <i className="bi bi-box-arrow-right"></i><span>Se déconnecter</span>
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}