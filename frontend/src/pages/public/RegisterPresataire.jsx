import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../api/axios';

/* ─── InputField hors du parent ─── */
function InputField({ label, name, type = 'text', placeholder, icon, value, onChange, error }) {
  return (
    <div className="rp-field">
      <label className="rp-label" htmlFor={`rp-${name}`}>{label}</label>
      <div className={`rp-input-wrap${error ? ' error' : ''}`}>
        <i className={`bi bi-${icon} rp-icon`}></i>
        <input id={`rp-${name}`} type={type} className="rp-input"
          placeholder={placeholder} value={value} onChange={onChange} autoComplete="off" />
      </div>
      {error && <span className="rp-err"><i className="bi bi-exclamation-circle-fill"></i> {error}</span>}
    </div>
  );
}

const RP_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Outfit:wght@600;800&display=swap');

  @keyframes rp-glowMove {
    0%, 100% { transform: translate(0, 0) scale(1); }
    50% { transform: translate(50px, -50px) scale(1.2); }
  }

  @keyframes rp-glowMove2 {
    0%, 100% { transform: translate(0, 0) scale(1.2); }
    50% { transform: translate(-50px, 50px) scale(0.9); }
  }

  .rp-page {
    font-family: 'Plus Jakarta Sans', sans-serif;
    min-height: 100vh;
    background: #040d12;
    display: flex; 
    align-items: center; 
    justify-content: center;
    padding: 60px 16px; 
    position: relative; 
    overflow: hidden;
  }

  .rp-glow-1 {
    position: absolute;
    top: -10%;
    right: -10%;
    width: 500px;
    height: 500px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(16, 185, 129, 0.15) 0%, transparent 70%);
    filter: blur(80px);
    animation: rp-glowMove 15s ease-in-out infinite;
    pointer-events: none;
  }

  .rp-glow-2 {
    position: absolute;
    bottom: -10%;
    left: -10%;
    width: 550px;
    height: 550px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(5, 150, 105, 0.12) 0%, transparent 70%);
    filter: blur(90px);
    animation: rp-glowMove2 18s ease-in-out infinite;
    pointer-events: none;
  }

  .rp-card {
    background: rgba(255, 255, 255, 0.02); 
    backdrop-filter: blur(24px);
    -webkit-backdrop-filter: blur(24px);
    border: 1px solid rgba(255, 255, 255, 0.05);
    border-radius: 32px;
    box-shadow: 0 30px 60px rgba(0, 0, 0, 0.5);
    width: 100%; 
    max-width: 580px;
    overflow: hidden; 
    position: relative; 
    z-index: 1;
    animation: rp-in 0.5s cubic-bezier(0.22, 1, 0.36, 1) both;
  }

  @keyframes rp-in {
    from { opacity: 0; transform: translateY(24px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  /* Header */
  .rp-header {
    background: linear-gradient(135deg, rgba(4, 13, 18, 0.85), rgba(5, 150, 105, 0.35));
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    padding: 36px 40px 28px; 
    color: white; 
    text-align: center;
    position: relative; 
  }

  .rp-header-icon {
    width: 68px; 
    height: 68px; 
    border-radius: 20px;
    background: linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(5, 150, 105, 0.2) 100%);
    border: 1.5px solid rgba(255, 255, 255, 0.1);
    display: flex; 
    align-items: center; 
    justify-content: center;
    margin: 0 auto 16px; 
    font-size: 1.8rem;
    color: #34d399;
  }

  .rp-header h2 {
    font-family: 'Outfit', sans-serif;
    font-size: 1.6rem; 
    font-weight: 800; 
    margin: 0 0 6px;
    letter-spacing: -0.01em;
  }

  .rp-header p { 
    margin: 0; 
    color: #94a3b8; 
    font-size: 0.88rem; 
  }

  /* Type tabs */
  .rp-type-tabs { 
    display: flex; 
    background: rgba(0, 0, 0, 0.2);
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  }

  .rp-type-tab {
    flex: 1; 
    padding: 16px 12px; 
    text-align: center;
    font-weight: 700; 
    font-size: 0.85rem; 
    cursor: pointer;
    border: none; 
    background: none; 
    color: #475569;
    transition: all 0.25s; 
    text-decoration: none;
    display: flex; 
    align-items: center; 
    justify-content: center; 
    gap: 8px;
    font-family: inherit;
  }

  .rp-type-tab.active { 
    color: #34d399; 
    background: rgba(255, 255, 255, 0.02); 
    border-bottom: 3px solid #10b981; 
  }

  .rp-type-tab:hover:not(.active) { 
    background: rgba(255, 255, 255, 0.04); 
    color: #94a3b8; 
  }

  /* Progress */
  .rp-progress { padding: 24px 40px 0; }
  
  .rp-progress-steps { display: flex; gap: 6px; margin-bottom: 8px; }
  
  .rp-progress-seg {
    flex: 1; 
    height: 6px; 
    border-radius: 3px;
    background: #1e293b; 
    transition: background 0.35s ease;
  }

  .rp-progress-seg.done { background: #10b981; }
  
  .rp-progress-seg.active { 
    background: linear-gradient(90deg, #10b981, #34d399); 
    box-shadow: 0 0 8px rgba(16, 185, 129, 0.4);
  }

  .rp-progress-label { 
    font-size: 0.75rem; 
    color: #64748b; 
    font-weight: 700; 
    text-align: right; 
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  /* Body */
  .rp-body { padding: 24px 40px 36px; }

  .rp-step-title {
    font-family: 'Outfit', sans-serif;
    font-size: 1.05rem; 
    font-weight: 700; 
    color: #fff;
    margin: 0 0 24px; 
    display: flex; 
    align-items: center; 
    gap: 10px;
  }

  .rp-step-title i { 
    color: #34d399; 
    font-size: 1.2rem; 
  }

  /* Fields */
  .rp-field { margin-bottom: 20px; }
  
  .rp-label {
    display: block; 
    font-size: 0.75rem; 
    font-weight: 700;
    color: #94a3b8; 
    margin-bottom: 8px; 
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .rp-input-wrap {
    display: flex; 
    align-items: center;
    border: 1.5px solid #1e293b; 
    border-radius: 16px;
    background: #0b1219; 
    transition: all 0.25s ease;
  }

  .rp-input-wrap:focus-within {
    border-color: #10b981;
    box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.15);
    background: #0f1c16;
  }

  .rp-input-wrap.error { border-color: #ef4444; }
  .rp-input-wrap.error:focus-within { box-shadow: 0 0 0 4px rgba(239, 68, 68, 0.15); }

  .rp-icon { 
    padding: 0 0 0 16px; 
    color: #475569; 
    font-size: 1.05rem; 
    flex-shrink: 0; 
    transition: color 0.25s; 
  }

  .rp-input-wrap:focus-within .rp-icon { color: #34d399; }

  .rp-input {
    flex: 1; 
    border: none; 
    background: transparent;
    padding: 14px 16px; 
    font-size: 0.95rem; 
    color: #f1f5f9;
    outline: none; 
    min-width: 0; 
    font-family: inherit;
  }

  .rp-input::placeholder { color: #475569; }

  .rp-eye {
    background: none; 
    border: none; 
    cursor: pointer;
    padding: 0 16px; 
    color: #475569; 
    font-size: 1.05rem;
    transition: color 0.2s; 
    flex-shrink: 0;
  }

  .rp-eye:hover { color: #34d399; }

  .rp-err {
    display: flex; 
    align-items: center; 
    gap: 6px;
    color: #fca5a5; 
    font-size: 0.78rem; 
    margin-top: 6px; 
    font-weight: 600;
  }

  .rp-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0 16px; }
  @media (max-width: 500px) { .rp-grid { grid-template-columns: 1fr; } }

  /* Global error */
  .rp-global-error {
    background: rgba(239, 68, 68, 0.1); 
    border: 1px solid rgba(239, 68, 68, 0.2); 
    border-radius: 16px;
    padding: 14px 18px; 
    color: #fca5a5; 
    font-size: 0.9rem;
    display: flex; 
    align-items: center; 
    gap: 10px; 
    margin-bottom: 24px;
    animation: rp-shake 0.4s ease;
  }

  @keyframes rp-shake {
    0%, 100% { transform: translateX(0); }
    20%, 60% { transform: translateX(-4px); }
    40%, 80% { transform: translateX(4px); }
  }

  /* Info box */
  .rp-info-box {
    background: rgba(16, 185, 129, 0.08); 
    border: 1px solid rgba(16, 185, 129, 0.2); 
    border-radius: 16px;
    padding: 14px 18px; 
    font-size: 0.85rem; 
    color: #a7f3d0;
    display: flex; 
    align-items: flex-start; 
    gap: 10px; 
    margin-bottom: 20px;
    line-height: 1.5;
  }

  .rp-info-box i { color: #34d399; margin-top: 1px; flex-shrink: 0; font-size: 1.1rem; }

  /* Payment selector */
  .rp-pay-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 8px; }
  
  .rp-pay-card {
    border: 1.5px solid #1e293b; 
    border-radius: 16px;
    padding: 18px 14px; 
    text-align: center; 
    background: rgba(255, 255, 255, 0.01);
    transition: all 0.25s ease;
  }

  .rp-pay-card.active-flooz {
    border-color: #10b981;
    background: rgba(16, 185, 129, 0.05);
  }

  .rp-pay-card.active-tmoney {
    border-color: #3b82f6;
    background: rgba(59, 130, 246, 0.05);
  }

  .rp-pay-card i { font-size: 1.8rem; display: block; margin-bottom: 8px; }
  .rp-pay-card span { font-size: 0.85rem; font-weight: 700; color: #f1f5f9; }

  /* Terms */
  .rp-terms {
    display: flex; 
    align-items: flex-start; 
    gap: 12px;
    margin: 8px 0 20px; 
    font-size: 0.88rem; 
    color: #94a3b8; 
    line-height: 1.6;
  }

  .rp-terms input[type=checkbox] {
    margin-top: 4px; 
    width: 18px; 
    height: 18px;
    accent-color: #10b981; 
    cursor: pointer; 
    flex-shrink: 0;
  }

  .rp-terms a { color: #34d399; font-weight: 700; text-decoration: none; }
  .rp-terms a:hover { text-decoration: underline; }

  /* Nav */
  .rp-nav { display: flex; gap: 12px; margin-top: 12px; }
  
  .rp-btn-back {
    padding: 14px 24px; 
    border-radius: 16px;
    border: 1.5px solid #1e293b; 
    background: transparent;
    color: #94a3b8; 
    font-weight: 700; 
    font-size: 0.95rem;
    cursor: pointer; 
    font-family: inherit;
    display: flex; 
    align-items: center; 
    gap: 8px; 
    transition: all 0.25s;
  }

  .rp-btn-back:hover { 
    border-color: #10b981; 
    color: #34d399; 
    background: rgba(16, 185, 129, 0.05); 
  }

  .rp-btn-next {
    flex: 1; 
    padding: 15px 24px; 
    border-radius: 16px;
    background: linear-gradient(135deg, #10b981, #059669);
    color: white; 
    border: none; 
    font-weight: 700; 
    font-size: 0.95rem;
    cursor: pointer; 
    font-family: inherit;
    display: flex; 
    align-items: center; 
    justify-content: center; 
    gap: 8px;
    box-shadow: 0 8px 20px rgba(16, 185, 129, 0.25); 
    transition: all 0.25s;
  }

  .rp-btn-next:hover:not(:disabled) { 
    transform: translateY(-1.5px); 
    box-shadow: 0 10px 25px rgba(16, 185, 129, 0.4); 
  }

  .rp-btn-next:disabled { 
    opacity: 0.6; 
    cursor: not-allowed; 
    transform: none; 
  }

  .rp-footer {
    text-align: center; 
    margin-top: 24px; 
    padding-top: 20px;
    border-top: 1px solid #1e293b; 
    font-size: 0.88rem; 
    color: #64748b;
  }

  .rp-footer a { color: #34d399; font-weight: 700; text-decoration: none; }
  .rp-footer a:hover { text-decoration: underline; }

  .rp-spinner {
    width: 18px; 
    height: 18px;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-top-color: white; 
    border-radius: 50%;
    animation: rp-spin 0.7s linear infinite; 
    display: inline-block;
  }

  @keyframes rp-spin { to { transform: rotate(360deg); } }

  .rp-step { animation: rp-step-in 0.35s cubic-bezier(0.22, 1, 0.36, 1); }
  @keyframes rp-step-in {
    from { opacity: 0; transform: translateX(16px); }
    to   { opacity: 1; transform: translateX(0); }
  }

  @media (max-width: 560px) {
    .rp-body { padding: 20px 20px 28px; }
    .rp-header { padding: 28px 20px 24px; }
    .rp-progress { padding: 20px 20px 0; }
    .rp-pay-grid { grid-template-columns: 1fr; }
  }
`;

const STEPS = [
  { title: 'Identité',   icon: 'bi-person-fill' },
  { title: 'Profil pro', icon: 'bi-briefcase-fill' },
  { title: 'Paiement',   icon: 'bi-phone-fill' },
  { title: 'Sécurité',   icon: 'bi-shield-lock-fill' },
];

export default function RegisterPrestataire() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    first_name: '', last_name: '', username: '', email: '',
    telephone: '', adresse: '', specialite: '', bio: '',
    numero_flooz: '', numero_mix: '', password: '', password_confirm: ''
  });
  const [errors, setErrors]         = useState({});
  const [globalError, setGlobalError] = useState('');
  const [loading, setLoading]       = useState(false);
  const [terms, setTerms]           = useState(false);
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  const [showPwd, setShowPwd]       = useState(false);
  const [showPwd2, setShowPwd2]     = useState(false);
  const navigate = useNavigate();

  const set = (field) => (e) => {
    setForm(p => ({ ...p, [field]: e.target.value }));
    setErrors(p => ({ ...p, [field]: null }));
  };

  const validateStep = () => {
    const errs = {};
    if (step === 0) {
      if (!form.first_name.trim()) errs.first_name = 'Prénom requis.';
      if (!form.last_name.trim())  errs.last_name  = 'Nom requis.';
      if (!form.username.trim())   errs.username   = "Nom d'utilisateur requis.";
      if (!form.email.trim())      errs.email      = 'Email requis.';
    }
    if (step === 1) {
      if (!form.specialite.trim()) errs.specialite = 'Spécialité requise.';
    }
    if (step === 3) {
      if (!form.password)          errs.password   = 'Mot de passe requis.';
      if (form.password.length > 0 && form.password.length < 8) errs.password = 'Minimum 8 caractères.';
      if (form.password !== form.password_confirm) errs.password_confirm = 'Mots de passe différents.';
      if (!terms) errs.terms = "Acceptez les conditions.";
    }
    return errs;
  };

  const nextStep = () => {
    const errs = validateStep();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    if (step < STEPS.length - 1) { setStep(s => s + 1); return; }
    handleSubmit();
  };

  useEffect(() => {
    let mounted = true;
    const loadCategories = async () => {
      try {
        setCategoriesLoading(true);
        const res = await api.get('/categories/');
        if (!mounted) return;
        setCategories(Array.isArray(res.data) ? res.data : []);
      } catch (e) {
        if (!mounted) return;
        setCategories([]);
      } finally {
        if (mounted) setCategoriesLoading(false);
      }
    };
    loadCategories();
    return () => { mounted = false; };
  }, []);

  const handleSubmit = async () => {
    setGlobalError(''); setLoading(true);
    try {
      const { password_confirm, ...payload } = form;
      await api.post('/auth/register/', { ...payload, type_compte: 'prestataire' });
      navigate('/login');
    } catch (err) {
      const data = err.response?.data || {};
      if (data.non_field_errors) {
        setGlobalError(Array.isArray(data.non_field_errors) ? data.non_field_errors[0] : data.non_field_errors);
      } else if (typeof data === 'string') {
        setGlobalError(data);
      } else {
        setErrors(data);
      }
      setStep(0);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{RP_STYLES}</style>
      <div className="rp-page">
        <div className="rp-glow-1"></div>
        <div className="rp-glow-2"></div>
        
        <div className="rp-card">
          {/* Header */}
          <div className="rp-header">
            <div className="rp-header-icon"><i className="bi bi-briefcase-fill"></i></div>
            <h2>Devenir Prestataire</h2>
            <p>Proposez vos services sur Service Market</p>
          </div>

          {/* Type tabs */}
          <div className="rp-type-tabs">
            <Link to="/inscription-client" className="rp-type-tab">
              <i className="bi bi-person-fill"></i> Compte Client
            </Link>
            <span className="rp-type-tab active">
              <i className="bi bi-briefcase-fill"></i> Compte Prestataire
            </span>
          </div>

          {/* Progress */}
          <div className="rp-progress">
            <div className="rp-progress-steps">
              {STEPS.map((s, i) => (
                <div key={i} className={`rp-progress-seg ${i < step ? 'done' : i === step ? 'active' : ''}`}></div>
              ))}
            </div>
            <div className="rp-progress-label">Étape {step + 1} sur {STEPS.length} — {STEPS[step].title}</div>
          </div>

          {/* Body */}
          <div className="rp-body">
            {globalError && (
              <div className="rp-global-error">
                <i className="bi bi-exclamation-triangle-fill"></i> {globalError}
              </div>
            )}

            {/* ── Step 0 : Identité ── */}
            {step === 0 && (
              <div className="rp-step">
                <div className="rp-step-title"><i className="bi bi-person-fill"></i> Informations personnelles</div>
                <div className="rp-grid">
                  <InputField label="Prénom" name="first_name" placeholder="Jean" icon="person" value={form.first_name} onChange={set('first_name')} error={errors.first_name} />
                  <InputField label="Nom" name="last_name" placeholder="Dupont" icon="person-badge" value={form.last_name} onChange={set('last_name')} error={errors.last_name} />
                </div>
                <InputField label="Nom d'utilisateur" name="username" placeholder="jean_dupont" icon="at" value={form.username} onChange={set('username')} error={errors.username} />
                <InputField label="Adresse email" name="email" type="email" placeholder="jean@exemple.com" icon="envelope" value={form.email} onChange={set('email')} error={errors.email} />
                <div className="rp-grid">
                  <InputField label="Téléphone" name="telephone" type="tel" placeholder="+228 90 00 00 00" icon="telephone" value={form.telephone} onChange={set('telephone')} error={errors.telephone} />
                  <InputField label="Adresse" name="adresse" placeholder="Lomé, Togo" icon="geo-alt" value={form.adresse} onChange={set('adresse')} error={errors.adresse} />
                </div>
              </div>
            )}

            {/* ── Step 1 : Profil pro ── */}
            {step === 1 && (
              <div className="rp-step">
                <div className="rp-step-title"><i className="bi bi-briefcase-fill"></i> Profil professionnel</div>
                <div className="rp-field">
                  <label className="rp-label" htmlFor="rp-specialite">Spécialité *</label>
                  <div className={`rp-input-wrap${errors.specialite ? ' error' : ''}`}>
                    <i className="bi bi-tools rp-icon"></i>
                    <select
                      id="rp-specialite"
                      className="rp-input"
                      value={form.specialite}
                      onChange={set('specialite')}
                      style={{ background: 'transparent', color: '#f1f5f9' }}
                    >
                      <option value="" style={{ background: '#0b1219', color: '#475569' }}>
                        {categoriesLoading ? 'Chargement...' : 'Choisir une spécialité...'}
                      </option>
                      {(categories || []).map(c => (
                        <option key={c.id ?? c.nom} value={c.nom} style={{ background: '#0b1219', color: '#f1f5f9' }}>
                          {c.nom}
                        </option>
                      ))}
                      <option value="autre" style={{ background: '#0b1219', color: '#f1f5f9' }}>Autre</option>
                    </select>
                  </div>
                  {errors.specialite && (
                    <span className="rp-err"><i className="bi bi-exclamation-circle-fill"></i> {errors.specialite}</span>
                  )}
                </div>

                <div className="rp-field">
                  <label className="rp-label">Biographie (optionnel)</label>
                  <textarea 
                    className="rp-input" 
                    style={{ 
                      border: '1.5px solid #1e293b', 
                      borderRadius: 16, 
                      padding: '14px 16px', 
                      width: '100%', 
                      resize: 'vertical', 
                      background: '#0b1219', 
                      fontFamily: 'inherit',
                      color: '#f1f5f9',
                      outline: 'none',
                      transition: 'all 0.25s ease'
                    }}
                    rows={4} 
                    placeholder="Décrivez votre expérience, vos compétences, vos certifications..."
                    value={form.bio} 
                    onChange={e => setForm(p => ({ ...p, bio: e.target.value }))}
                    onFocus={e => { 
                      e.target.style.borderColor = '#10b981'; 
                      e.target.style.boxShadow = '0 0 0 4px rgba(16, 185, 129, 0.15)'; 
                      e.target.style.background = '#0f1c16'; 
                    }}
                    onBlur={e => { 
                      e.target.style.borderColor = '#1e293b'; 
                      e.target.style.boxShadow = 'none'; 
                      e.target.style.background = '#0b1219'; 
                    }} 
                  />
                </div>

                <div className="rp-info-box">
                  <i className="bi bi-patch-check-fill"></i>
                  <div>Un profil détaillé augmente vos chances d'être choisi. Les clients vérifient la spécialité et la bio avant de réserver.</div>
                </div>
              </div>
            )}

            {/* ── Step 2 : Paiement ── */}
            {step === 2 && (
              <div className="rp-step">
                <div className="rp-step-title"><i className="bi bi-phone-fill"></i> Coordonnées de paiement</div>
                <div className="rp-info-box">
                  <i className="bi bi-info-circle-fill"></i>
                  <div>Ces numéros servent à recevoir vos paiements via Mobile Money. Renseignez au moins l'un d'eux.</div>
                </div>

                <div className="rp-pay-grid">
                  <div className={`rp-pay-card ${form.numero_flooz ? 'active-flooz' : ''}`}>
                    <i className="bi bi-phone-fill" style={{ color: '#10b981' }}></i>
                    <span>Flooz (Moov)</span>
                  </div>
                  <div className={`rp-pay-card ${form.numero_mix ? 'active-tmoney' : ''}`}>
                    <i className="bi bi-phone-fill" style={{ color: '#3b82f6' }}></i>
                    <span>TMoney (Togocel)</span>
                  </div>
                </div>

                <div style={{ marginTop: 18 }}>
                  <div className="rp-grid">
                    <InputField label="Numéro Flooz (Moov)" name="numero_flooz" type="tel" placeholder="+228 99 00 00 00" icon="phone" value={form.numero_flooz} onChange={set('numero_flooz')} error={errors.numero_flooz} />
                    <InputField label="Numéro TMoney (Togocel)" name="numero_mix" type="tel" placeholder="+228 90 00 00 00" icon="phone" value={form.numero_mix} onChange={set('numero_mix')} error={errors.numero_mix} />
                  </div>
                </div>
              </div>
            )}

            {/* ── Step 3 : Sécurité ── */}
            {step === 3 && (
              <div className="rp-step">
                <div className="rp-step-title"><i className="bi bi-shield-lock-fill"></i> Sécurité du compte</div>

                <div className="rp-field">
                  <label className="rp-label" htmlFor="rp-password">Mot de passe</label>
                  <div className={`rp-input-wrap${errors.password ? ' error' : ''}`}>
                    <i className="bi bi-lock-fill rp-icon"></i>
                    <input id="rp-password" type={showPwd ? 'text' : 'password'} className="rp-input"
                      placeholder="Minimum 8 caractères" value={form.password}
                      onChange={set('password')} autoComplete="new-password" />
                    <button type="button" className="rp-eye" onClick={() => setShowPwd(v => !v)}>
                      <i className={`bi bi-eye${showPwd ? '-slash' : ''}`}></i>
                    </button>
                  </div>
                  {errors.password && <span className="rp-err"><i className="bi bi-exclamation-circle-fill"></i> {errors.password}</span>}
                </div>

                <div className="rp-field">
                  <label className="rp-label" htmlFor="rp-password2">Confirmer le mot de passe</label>
                  <div className={`rp-input-wrap${errors.password_confirm ? ' error' : ''}`}>
                    <i className="bi bi-lock-fill rp-icon"></i>
                    <input id="rp-password2" type={showPwd2 ? 'text' : 'password'} className="rp-input"
                      placeholder="Répétez votre mot de passe" value={form.password_confirm}
                      onChange={set('password_confirm')} autoComplete="new-password" />
                    <button type="button" className="rp-eye" onClick={() => setShowPwd2(v => !v)}>
                      <i className={`bi bi-eye${showPwd2 ? '-slash' : ''}`}></i>
                    </button>
                  </div>
                  {errors.password_confirm && <span className="rp-err"><i className="bi bi-exclamation-circle-fill"></i> {errors.password_confirm}</span>}
                </div>

                <div className="rp-terms">
                  <input type="checkbox" id="rp-terms" checked={terms}
                    onChange={e => { setTerms(e.target.checked); setErrors(p => ({ ...p, terms: null })); }} />
                  <label htmlFor="rp-terms">
                    J'accepte les <a href="#terms" onClick={e => e.preventDefault()}>conditions d'utilisation</a> et la <a href="#privacy" onClick={e => e.preventDefault()}>politique de confidentialité</a> de Service Market.
                  </label>
                </div>
                {errors.terms && <span className="rp-err" style={{ marginBottom: 12, display: 'flex' }}><i className="bi bi-exclamation-circle-fill"></i> {errors.terms}</span>}
              </div>
            )}

            {/* Navigation */}
            <div className="rp-nav">
              {step > 0 && (
                <button className="rp-btn-back" onClick={() => setStep(s => s - 1)}>
                  <i className="bi bi-arrow-left"></i> Retour
                </button>
              )}
              <button className="rp-btn-next" onClick={nextStep} disabled={loading}>
                {loading
                  ? <><span className="rp-spinner"></span> Création…</>
                  : step < STEPS.length - 1
                    ? <>Continuer <i className="bi bi-arrow-right"></i></>
                    : <><i className="bi bi-check-circle-fill"></i> Créer mon compte pro</>
                }
              </button>
            </div>

            <div className="rp-footer">
              Déjà inscrit ? <Link to="/login">Se connecter</Link>
              {' · '}
              <Link to="/inscription-client">Compte client</Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}