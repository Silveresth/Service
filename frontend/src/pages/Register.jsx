import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';

/* ─── InputField hors du parent (évite la perte de focus) ─── */
function InputField({ label, name, type = 'text', placeholder, icon, value, onChange, error, accent = '#0284c7' }) {
  return (
    <div className="rf-field">
      <label className="rf-label" htmlFor={`rf-${name}`}>{label}</label>
      <div className={`rf-input-wrap${error ? ' error' : ''}`}>
        <i className={`bi bi-${icon} rf-icon`} style={{ '--accent': accent }}></i>
        <input
          id={`rf-${name}`}
          type={type}
          className="rf-input"
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          autoComplete={type === 'password' ? 'new-password' : 'off'}
        />
      </div>
      {error && <span className="rf-err"><i className="bi bi-exclamation-circle-fill"></i> {error}</span>}
    </div>
  );
}

const RF_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&display=swap');

  .rf-page {
    min-height: 100vh;
    background: linear-gradient(145deg, #0c2340 0%, #0a3d6b 40%, #0284c7 100%);
    display: flex; align-items: center; justify-content: center;
    padding: 40px 16px;
    position: relative; overflow: hidden;
  }
  .rf-page::before {
    content: ''; position: absolute;
    width: 500px; height: 500px; border-radius: 50%;
    border: 1px solid rgba(255,255,255,0.05);
    top: -200px; right: -150px;
  }
  .rf-page::after {
    content: ''; position: absolute;
    width: 350px; height: 350px; border-radius: 50%;
    border: 1px solid rgba(255,255,255,0.06);
    bottom: -120px; left: -100px;
  }

  .rf-card {
    background: white; border-radius: 24px;
    box-shadow: 0 28px 70px rgba(0,0,0,0.3);
    width: 100%; max-width: 560px;
    overflow: hidden; position: relative; z-index: 1;
    animation: rf-in 0.4s cubic-bezier(0.22,1,0.36,1) both;
  }
  @keyframes rf-in {
    from { opacity: 0; transform: translateY(24px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  /* Header */
  .rf-header {
    background: linear-gradient(135deg, #0c2340, #0284c7);
    padding: 32px 36px 28px; color: white; text-align: center;
    position: relative; overflow: hidden;
  }
  .rf-header::after {
    content: ''; position: absolute;
    width: 180px; height: 180px; border-radius: 50%;
    background: rgba(255,255,255,0.05);
    bottom: -60px; right: -40px;
  }
  .rf-header-icon {
    width: 72px; height: 72px; border-radius: 50%;
    background: rgba(255,255,255,0.12);
    border: 2px solid rgba(255,255,255,0.22);
    display: flex; align-items: center; justify-content: center;
    margin: 0 auto 16px; font-size: 2rem;
    position: relative; z-index: 1;
  }
  .rf-header h2 {
    font-family: 'Syne', sans-serif;
    font-size: 1.5rem; font-weight: 800; margin: 0 0 6px;
    position: relative; z-index: 1;
  }
  .rf-header p { margin: 0; opacity: 0.78; font-size: 0.88rem; position: relative; z-index: 1; }

  /* Type tabs */
  .rf-type-tabs { display: flex; border-bottom: 1.5px solid #e2e8f0; background: #f8fafc; }
  .rf-type-tab {
    flex: 1; padding: 14px 12px;
    text-align: center; font-weight: 700; font-size: 0.85rem;
    cursor: pointer; border: none; background: none;
    color: #64748b; transition: all 0.2s;
    text-decoration: none;
    display: flex; align-items: center; justify-content: center; gap: 7px;
    font-family: inherit;
  }
  .rf-type-tab.active { color: #0284c7; background: white; border-bottom: 3px solid #0284c7; }
  .rf-type-tab:hover:not(.active) { background: #f1f5f9; color: #374151; }

  /* Progress bar */
  .rf-progress { padding: 20px 36px 0; }
  .rf-progress-track {
    height: 4px; background: #e2e8f0; border-radius: 2px; overflow: hidden; margin-bottom: 6px;
  }
  .rf-progress-fill {
    height: 100%; border-radius: 2px;
    background: linear-gradient(90deg, #0284c7, #38bdf8);
    transition: width 0.4s ease;
  }
  .rf-progress-label { font-size: 0.72rem; color: #94a3b8; font-weight: 600; text-align: right; }

  /* Body */
  .rf-body { padding: 24px 36px 32px; }

  /* Step header */
  .rf-step-title {
    font-family: 'Syne', sans-serif;
    font-size: 1rem; font-weight: 800; color: #0c2340;
    margin: 0 0 20px; display: flex; align-items: center; gap: 10px;
  }
  .rf-step-title i { color: #0284c7; font-size: 1.1rem; }

  /* Fields */
  .rf-field { margin-bottom: 18px; }
  .rf-label {
    display: block; font-size: 0.8rem; font-weight: 700;
    color: #374151; margin-bottom: 7px; letter-spacing: 0.02em;
  }
  .rf-input-wrap {
    display: flex; align-items: center;
    border: 1.5px solid #e2e8f0; border-radius: 12px;
    background: #fafbfc;
    transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
  }
  .rf-input-wrap:focus-within {
    border-color: #0284c7;
    box-shadow: 0 0 0 4px rgba(2,132,199,0.10);
    background: white;
  }
  .rf-input-wrap.error { border-color: #f87171; }
  .rf-input-wrap.error:focus-within { box-shadow: 0 0 0 4px rgba(248,113,113,0.12); }
  .rf-icon {
    padding: 0 0 0 14px; color: #94a3b8; font-size: 0.95rem;
    flex-shrink: 0; transition: color 0.2s;
  }
  .rf-input-wrap:focus-within .rf-icon { color: #0284c7; }
  .rf-input {
    flex: 1; border: none; background: transparent;
    padding: 12px 14px; font-size: 0.9rem; color: #0c2340;
    outline: none; min-width: 0; font-family: inherit;
  }
  .rf-input::placeholder { color: #9ca3af; }
  .rf-eye {
    background: none; border: none; cursor: pointer;
    padding: 0 14px; color: #94a3b8; font-size: 0.9rem;
    transition: color 0.2s; flex-shrink: 0;
  }
  .rf-eye:hover { color: #0284c7; }
  .rf-err {
    display: flex; align-items: center; gap: 5px;
    color: #dc2626; font-size: 0.75rem; margin-top: 5px; font-weight: 600;
  }

  .rf-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0 16px; }
  @media (max-width: 500px) { .rf-grid { grid-template-columns: 1fr; } }

  /* Global error */
  .rf-global-error {
    background: #fef2f2; border: 1px solid #fecaca; border-radius: 12px;
    padding: 12px 16px; color: #dc2626; font-size: 0.85rem;
    display: flex; align-items: center; gap: 8px; margin-bottom: 18px;
    animation: rf-shake 0.35s ease;
  }
  @keyframes rf-shake {
    0%,100% { transform: translateX(0); }
    25%      { transform: translateX(-4px); }
    75%      { transform: translateX(4px); }
  }

  /* Terms */
  .rf-terms {
    display: flex; align-items: flex-start; gap: 10px;
    margin: 4px 0 14px; font-size: 0.84rem; color: #374151; line-height: 1.55;
  }
  .rf-terms input[type=checkbox] {
    margin-top: 3px; width: 17px; height: 17px;
    accent-color: #0284c7; cursor: pointer; flex-shrink: 0;
  }
  .rf-terms a { color: #0284c7; font-weight: 700; text-decoration: none; }
  .rf-terms a:hover { text-decoration: underline; }

  /* Nav buttons */
  .rf-nav { display: flex; gap: 10px; margin-top: 6px; }
  .rf-btn-back {
    padding: 12px 20px; border-radius: 12px;
    border: 1.5px solid #e2e8f0; background: white;
    color: #64748b; font-weight: 700; font-size: 0.88rem;
    cursor: pointer; font-family: inherit;
    display: flex; align-items: center; gap: 7px;
    transition: all 0.2s;
  }
  .rf-btn-back:hover { border-color: #0284c7; color: #0284c7; background: #e0f2fe; }
  .rf-btn-next {
    flex: 1; padding: 13px 20px; border-radius: 12px;
    background: linear-gradient(135deg, #0284c7, #0369a1);
    color: white; border: none; font-weight: 700; font-size: 0.9rem;
    cursor: pointer; font-family: inherit;
    display: flex; align-items: center; justify-content: center; gap: 8px;
    box-shadow: 0 4px 16px rgba(2,132,199,0.28);
    transition: all 0.2s;
  }
  .rf-btn-next:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 7px 22px rgba(2,132,199,0.38); }
  .rf-btn-next:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }

  /* Footer */
  .rf-footer {
    text-align: center; margin-top: 20px; padding-top: 18px;
    border-top: 1px solid #f1f5f9;
    font-size: 0.84rem; color: #64748b;
  }
  .rf-footer a { color: #0284c7; font-weight: 700; text-decoration: none; }
  .rf-footer a:hover { text-decoration: underline; }

  /* Spinner */
  .rf-spinner {
    width: 16px; height: 16px;
    border: 2px solid rgba(255,255,255,0.35);
    border-top-color: white; border-radius: 50%;
    animation: rf-spin 0.7s linear infinite; display: inline-block;
  }
  @keyframes rf-spin { to { transform: rotate(360deg); } }

  /* Step transitions */
  .rf-step { animation: rf-step-in 0.25s ease; }
  @keyframes rf-step-in {
    from { opacity: 0; transform: translateX(12px); }
    to   { opacity: 1; transform: translateX(0); }
  }

  @media (max-width: 560px) {
    .rf-body { padding: 20px 20px 24px; }
    .rf-header { padding: 24px 20px 20px; }
    .rf-progress { padding: 16px 20px 0; }
  }
`;

const STEPS = [
  { title: 'Identité', icon: 'bi-person-fill' },
  { title: 'Contact',  icon: 'bi-telephone-fill' },
  { title: 'Sécurité', icon: 'bi-shield-lock-fill' },
];

export default function Register() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    first_name: '', last_name: '', username: '',
    email: '', telephone: '', adresse: '',
    password: '', password_confirm: ''
  });
  const [errors, setErrors]         = useState({});
  const [globalError, setGlobalError] = useState('');
  const [loading, setLoading]       = useState(false);
  const [terms, setTerms]           = useState(false);
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
    }
    if (step === 1) {
      if (!form.email.trim())      errs.email      = 'Email requis.';
    }
    if (step === 2) {
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

  const handleSubmit = async () => {
    setGlobalError(''); setLoading(true);
    try {
      const { password_confirm, ...payload } = form;
      await api.post('/auth/register/', { ...payload, type_compte: 'client' });
      navigate('/login');
    } catch (err) {
      const data = err.response?.data || {};
      let msg = '';
      if (data.non_field_errors) {
        msg = Array.isArray(data.non_field_errors) ? data.non_field_errors[0] : data.non_field_errors;
      } else if (typeof data === 'string') {
        msg = data;
      } else {
        // Collect all field errors into one message
        const fieldErrors = Object.entries(data).map(([k, v]) => `${k}: ${Array.isArray(v) ? v[0] : v}`).join(' | ');
        msg = fieldErrors || 'Une erreur est survenue. Vérifiez vos informations.';
        setErrors(data);
      }
      setGlobalError(msg || 'Erreur de connexion au serveur. Réessayez.');
      // Don't reset to step 0 — stay on current step so user sees the error
    } finally { setLoading(false); }
  };

  const pct = Math.round(((step) / STEPS.length) * 100);

  return (
    <>
      <style>{RF_STYLES}</style>
      <div className="rf-page">
        <div className="rf-card">

          {/* Header */}
          <div className="rf-header">
            <div className="rf-header-icon"><i className="bi bi-person-plus-fill"></i></div>
            <h2>Créer un compte</h2>
            <p>Rejoignez Service Market en quelques étapes</p>
          </div>

          {/* Type tabs */}
          <div className="rf-type-tabs">
            <span className="rf-type-tab active">
              <i className="bi bi-person-fill"></i> Compte Client
            </span>
            <Link to="/inscription-prestataire" className="rf-type-tab">
              <i className="bi bi-briefcase-fill"></i> Compte Prestataire
            </Link>
          </div>

          {/* Progress */}
          <div className="rf-progress">
            <div className="rf-progress-track">
              <div className="rf-progress-fill" style={{ width: `${pct + 33}%` }}></div>
            </div>
            <div className="rf-progress-label">Étape {step + 1} sur {STEPS.length} — {STEPS[step].title}</div>
          </div>

          {/* Body */}
          <div className="rf-body">
            {globalError && (
              <div className="rf-global-error">
                <i className="bi bi-exclamation-triangle-fill"></i> {globalError}
              </div>
            )}

            {/* ── Step 0 : Identité ── */}
            {step === 0 && (
              <div className="rf-step">
                <div className="rf-step-title"><i className="bi bi-person-fill"></i> Informations personnelles</div>
                <div className="rf-grid">
                  <InputField label="Prénom" name="first_name" placeholder="Jean" icon="person" value={form.first_name} onChange={set('first_name')} error={errors.first_name} />
                  <InputField label="Nom" name="last_name" placeholder="Dupont" icon="person-badge" value={form.last_name} onChange={set('last_name')} error={errors.last_name} />
                </div>
                <InputField label="Nom d'utilisateur" name="username" placeholder="jean_dupont" icon="at" value={form.username} onChange={set('username')} error={errors.username} />
              </div>
            )}

            {/* ── Step 1 : Contact ── */}
            {step === 1 && (
              <div className="rf-step">
                <div className="rf-step-title"><i className="bi bi-telephone-fill"></i> Coordonnées</div>
                <InputField label="Adresse email" name="email" type="email" placeholder="jean@exemple.com" icon="envelope" value={form.email} onChange={set('email')} error={errors.email} />
                <div className="rf-grid">
                  <InputField label="Téléphone" name="telephone" type="tel" placeholder="+228 90 00 00 00" icon="telephone" value={form.telephone} onChange={set('telephone')} error={errors.telephone} />
                  <InputField label="Adresse" name="adresse" placeholder="Lomé, Togo" icon="geo-alt" value={form.adresse} onChange={set('adresse')} error={errors.adresse} />
                </div>
              </div>
            )}

            {/* ── Step 2 : Sécurité ── */}
            {step === 2 && (
              <div className="rf-step">
                <div className="rf-step-title"><i className="bi bi-shield-lock-fill"></i> Sécurité du compte</div>

                {/* Mot de passe */}
                <div className="rf-field">
                  <label className="rf-label" htmlFor="rf-password">Mot de passe</label>
                  <div className={`rf-input-wrap${errors.password ? ' error' : ''}`}>
                    <i className="bi bi-lock-fill rf-icon"></i>
                    <input id="rf-password" type={showPwd ? 'text' : 'password'} className="rf-input"
                      placeholder="Minimum 8 caractères" value={form.password}
                      onChange={set('password')} autoComplete="new-password" />
                    <button type="button" className="rf-eye" onClick={() => setShowPwd(v => !v)}>
                      <i className={`bi bi-eye${showPwd ? '-slash' : ''}`}></i>
                    </button>
                  </div>
                  {errors.password && <span className="rf-err"><i className="bi bi-exclamation-circle-fill"></i> {errors.password}</span>}
                </div>

                {/* Confirmation */}
                <div className="rf-field">
                  <label className="rf-label" htmlFor="rf-password2">Confirmer le mot de passe</label>
                  <div className={`rf-input-wrap${errors.password_confirm ? ' error' : ''}`}>
                    <i className="bi bi-lock-fill rf-icon"></i>
                    <input id="rf-password2" type={showPwd2 ? 'text' : 'password'} className="rf-input"
                      placeholder="Répétez votre mot de passe" value={form.password_confirm}
                      onChange={set('password_confirm')} autoComplete="new-password" />
                    <button type="button" className="rf-eye" onClick={() => setShowPwd2(v => !v)}>
                      <i className={`bi bi-eye${showPwd2 ? '-slash' : ''}`}></i>
                    </button>
                  </div>
                  {errors.password_confirm && <span className="rf-err"><i className="bi bi-exclamation-circle-fill"></i> {errors.password_confirm}</span>}
                </div>

                {/* CGU */}
                <div className="rf-terms">
                  <input type="checkbox" id="rf-terms" checked={terms}
                    onChange={e => { setTerms(e.target.checked); setErrors(p => ({ ...p, terms: null })); }} />
                  <label htmlFor="rf-terms">
                    J'accepte les <a href="#terms" onClick={e => e.preventDefault()}>conditions d'utilisation</a> et la <a href="#privacy" onClick={e => e.preventDefault()}>politique de confidentialité</a>.
                  </label>
                </div>
                {errors.terms && <span className="rf-err" style={{ marginBottom: 12, display: 'flex' }}><i className="bi bi-exclamation-circle-fill"></i> {errors.terms}</span>}
              </div>
            )}

            {/* Navigation */}
            <div className="rf-nav">
              {step > 0 && (
                <button className="rf-btn-back" onClick={() => setStep(s => s - 1)}>
                  <i className="bi bi-arrow-left"></i> Retour
                </button>
              )}
              <button className="rf-btn-next" onClick={nextStep} disabled={loading}>
                {loading
                  ? <><span className="rf-spinner"></span> Création…</>
                  : step < STEPS.length - 1
                    ? <>Continuer <i className="bi bi-arrow-right"></i></>
                    : <><i className="bi bi-check-circle-fill"></i> Créer mon compte</>
                }
              </button>
            </div>

            <div className="rf-footer">
              Déjà inscrit ? <Link to="/login">Se connecter</Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}