import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../api/axios';

/* ─── InputField hors du parent (évite la perte de focus) ─── */
function InputField({ label, name, type = 'text', placeholder, icon, value, onChange, error }) {
  return (
    <div className="rf-field">
      <label className="rf-label" htmlFor={`rf-${name}`}>{label}</label>
      <div className={`rf-input-wrap${error ? ' error' : ''}`}>
        <i className={`bi bi-${icon} rf-icon`}></i>
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
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Outfit:wght@600;800&display=swap');

  @keyframes rf-glowMove {
    0%, 100% { transform: translate(0, 0) scale(1); }
    50% { transform: translate(60px, -40px) scale(1.15); }
  }

  @keyframes rf-glowMove2 {
    0%, 100% { transform: translate(0, 0) scale(1.2); }
    50% { transform: translate(-40px, 60px) scale(0.95); }
  }

  .rf-page {
    font-family: 'Plus Jakarta Sans', sans-serif;
    min-height: 100vh;
    background: #060d19;
    display: flex; 
    align-items: center; 
    justify-content: center;
    padding: 60px 16px;
    position: relative; 
    overflow: hidden;
  }

  .rf-glow-1 {
    position: absolute;
    top: -10%;
    right: -10%;
    width: 500px;
    height: 500px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(2, 132, 199, 0.2) 0%, transparent 70%);
    filter: blur(80px);
    animation: rf-glowMove 15s ease-in-out infinite;
    pointer-events: none;
  }

  .rf-glow-2 {
    position: absolute;
    bottom: -10%;
    left: -10%;
    width: 550px;
    height: 550px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, transparent 70%);
    filter: blur(90px);
    animation: rf-glowMove2 18s ease-in-out infinite;
    pointer-events: none;
  }

  .rf-card {
    background: rgba(255, 255, 255, 0.02); 
    backdrop-filter: blur(24px);
    -webkit-backdrop-filter: blur(24px);
    border: 1px solid rgba(255, 255, 255, 0.06);
    border-radius: 32px;
    box-shadow: 0 30px 60px rgba(0, 0, 0, 0.45);
    width: 100%; 
    max-width: 560px;
    overflow: hidden; 
    position: relative; 
    z-index: 1;
    animation: rf-in 0.5s cubic-bezier(0.22, 1, 0.36, 1) both;
  }

  @keyframes rf-in {
    from { opacity: 0; transform: translateY(24px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  /* Header */
  .rf-header {
    background: linear-gradient(135deg, rgba(9, 19, 34, 0.8), rgba(2, 132, 199, 0.4));
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    padding: 36px 40px 28px; 
    color: white; 
    text-align: center;
    position: relative; 
  }

  .rf-header-icon {
    width: 68px; 
    height: 68px; 
    border-radius: 20px;
    background: linear-gradient(135deg, rgba(2, 132, 199, 0.2) 0%, rgba(99, 102, 241, 0.2) 100%);
    border: 1.5px solid rgba(255, 255, 255, 0.1);
    display: flex; 
    align-items: center; 
    justify-content: center;
    margin: 0 auto 16px; 
    font-size: 1.8rem;
    color: #38bdf8;
  }

  .rf-header h2 {
    font-family: 'Outfit', sans-serif;
    font-size: 1.6rem; 
    font-weight: 800; 
    margin: 0 0 6px;
    letter-spacing: -0.01em;
  }

  .rf-header p { 
    margin: 0; 
    color: #94a3b8; 
    font-size: 0.88rem; 
  }

  /* Type tabs */
  .rf-type-tabs { 
    display: flex; 
    background: rgba(0, 0, 0, 0.2);
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  }

  .rf-type-tab {
    flex: 1; 
    padding: 16px 12px;
    text-align: center; 
    font-weight: 700; 
    font-size: 0.85rem;
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

  .rf-type-tab.active { 
    color: #38bdf8; 
    background: rgba(255, 255, 255, 0.02); 
    border-bottom: 3px solid #0284c7; 
  }

  .rf-type-tab:hover:not(.active) { 
    background: rgba(255, 255, 255, 0.04); 
    color: #94a3b8; 
  }

  /* Progress bar */
  .rf-progress { padding: 24px 40px 0; }
  
  .rf-progress-track {
    height: 6px; 
    background: #1e293b; 
    border-radius: 3px; 
    overflow: hidden; 
    margin-bottom: 8px;
  }

  .rf-progress-fill {
    height: 100%; 
    border-radius: 3px;
    background: linear-gradient(90deg, #0284c7, #818cf8);
    transition: width 0.4s cubic-bezier(0.22, 1, 0.36, 1);
  }

  .rf-progress-label { 
    font-size: 0.75rem; 
    color: #64748b; 
    font-weight: 700; 
    text-align: right; 
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  /* Body */
  .rf-body { padding: 24px 40px 36px; }

  /* Step header */
  .rf-step-title {
    font-family: 'Outfit', sans-serif;
    font-size: 1.05rem; 
    font-weight: 700; 
    color: #fff;
    margin: 0 0 24px; 
    display: flex; 
    align-items: center; 
    gap: 10px;
  }

  .rf-step-title i { 
    color: #38bdf8; 
    font-size: 1.2rem; 
  }

  /* Fields */
  .rf-field { margin-bottom: 20px; }
  
  .rf-label {
    display: block; 
    font-size: 0.75rem; 
    font-weight: 700;
    color: #94a3b8; 
    margin-bottom: 8px; 
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .rf-input-wrap {
    display: flex; 
    align-items: center;
    border: 1.5px solid #1e293b; 
    border-radius: 16px;
    background: #0b1329;
    transition: all 0.25s ease;
  }

  .rf-input-wrap:focus-within {
    border-color: #0284c7;
    box-shadow: 0 0 0 4px rgba(2, 132, 199, 0.15);
    background: #0f172a;
  }

  .rf-input-wrap.error { border-color: #ef4444; }
  .rf-input-wrap.error:focus-within { box-shadow: 0 0 0 4px rgba(239, 68, 68, 0.15); }
  
  .rf-icon {
    padding: 0 0 0 16px; 
    color: #475569; 
    font-size: 1.05rem;
    flex-shrink: 0; 
    transition: color 0.25s;
  }

  .rf-input-wrap:focus-within .rf-icon { color: #38bdf8; }

  .rf-input {
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

  .rf-input::placeholder { color: #475569; }

  .rf-eye {
    background: none; 
    border: none; 
    cursor: pointer;
    padding: 0 16px; 
    color: #475569; 
    font-size: 1.05rem;
    transition: color 0.2s; 
    flex-shrink: 0;
  }

  .rf-eye:hover { color: #38bdf8; }

  .rf-err {
    display: flex; 
    align-items: center; 
    gap: 6px;
    color: #fca5a5; 
    font-size: 0.78rem; 
    margin-top: 6px; 
    font-weight: 600;
  }

  .rf-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0 16px; }
  @media (max-width: 500px) { .rf-grid { grid-template-columns: 1fr; } }

  /* Global error */
  .rf-global-error {
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
    animation: rf-shake 0.4s ease;
  }

  @keyframes rf-shake {
    0%, 100% { transform: translateX(0); }
    20%, 60% { transform: translateX(-4px); }
    40%, 80% { transform: translateX(4px); }
  }

  /* Terms */
  .rf-terms {
    display: flex; 
    align-items: flex-start; 
    gap: 12px;
    margin: 8px 0 20px; 
    font-size: 0.88rem; 
    color: #94a3b8; 
    line-height: 1.6;
  }

  .rf-terms input[type=checkbox] {
    margin-top: 4px; 
    width: 18px; 
    height: 18px;
    accent-color: #0284c7; 
    cursor: pointer; 
    flex-shrink: 0;
  }

  .rf-terms a { color: #38bdf8; font-weight: 700; text-decoration: none; }
  .rf-terms a:hover { text-decoration: underline; }

  /* Nav buttons */
  .rf-nav { display: flex; gap: 12px; margin-top: 12px; }
  
  .rf-btn-back {
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

  .rf-btn-back:hover { 
    border-color: #0284c7; 
    color: #38bdf8; 
    background: rgba(2, 132, 199, 0.05); 
  }

  .rf-btn-next {
    flex: 1; 
    padding: 15px 24px; 
    border-radius: 16px;
    background: linear-gradient(135deg, #0284c7, #4f46e5);
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
    box-shadow: 0 8px 20px rgba(2, 132, 199, 0.25);
    transition: all 0.25s;
  }

  .rf-btn-next:hover:not(:disabled) { 
    transform: translateY(-1.5px); 
    box-shadow: 0 10px 25px rgba(2, 132, 199, 0.4); 
  }

  .rf-btn-next:disabled { 
    opacity: 0.6; 
    cursor: not-allowed; 
    transform: none; 
  }

  /* Footer */
  .rf-footer {
    text-align: center; 
    margin-top: 24px; 
    padding-top: 20px;
    border-top: 1px solid #1e293b;
    font-size: 0.88rem; 
    color: #64748b;
  }

  .rf-footer a { color: #38bdf8; font-weight: 700; text-decoration: none; }
  .rf-footer a:hover { text-decoration: underline; }

  /* Spinner */
  .rf-spinner {
    width: 18px; 
    height: 18px;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-top-color: white; 
    border-radius: 50%;
    animation: rf-spin 0.7s linear infinite; 
    display: inline-block;
  }

  @keyframes rf-spin { to { transform: rotate(360deg); } }

  /* Step transitions */
  .rf-step { animation: rf-step-in 0.35s cubic-bezier(0.22, 1, 0.36, 1); }
  @keyframes rf-step-in {
    from { opacity: 0; transform: translateX(16px); }
    to   { opacity: 1; transform: translateX(0); }
  }

  @media (max-width: 560px) {
    .rf-body { padding: 20px 20px 28px; }
    .rf-header { padding: 28px 20px 24px; }
    .rf-progress { padding: 20px 20px 0; }
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
      if (!form.email.trim()) {
        errs.email = 'Email requis.';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
        errs.email = 'Format d\'email invalide.';
      }
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
      const status = err.response?.status;
      const data = err.response?.data;

      // Erreur serveur ou timeout/pas de réponse : sur Render (plan gratuit),
      // le cold start peut faire dépasser le délai côté client alors que la
      // requête a fini de s'exécuter côté serveur (le compte est donc souvent
      // bien créé). On ne bloque pas l'utilisateur sur le formulaire : on le
      // redirige vers la connexion avec un message informatif, il lui suffit
      // de se connecter avec les identifiants qu'il vient de saisir.
      if (!status || status >= 500) {
        setLoading(false);
        navigate('/login', {
          state: {
            info: "Le serveur a mis du temps à répondre, mais votre compte a probablement été créé. Essayez de vous connecter avec les identifiants que vous venez de saisir.",
          },
        });
        return;
      }

      // Cas particulier : "nom d'utilisateur / email déjà pris". Comme on vient
      // de soumettre ces informations à l'instant, c'est très probablement le
      // signe que le compte a déjà été créé (ex: une tentative précédente a
      // réussi côté serveur malgré un timeout côté client). On redirige donc
      // aussi vers la connexion plutôt que de bloquer l'utilisateur ici.
      if (status === 400 && data && typeof data === 'object') {
        const text = JSON.stringify(data).toLowerCase();
        if (text.includes('déjà pris') || text.includes('déjà') || text.includes('existe déjà')) {
          setLoading(false);
          navigate('/login', {
            state: {
              info: "Il semble que ce compte existe déjà. Essayez de vous connecter avec les identifiants que vous venez de saisir.",
            },
          });
          return;
        }
      }

      // Si le corps n'est pas un objet JSON exploitable (ex: string), on ne l'affiche jamais.
      if (!data || typeof data !== 'object') {
        setGlobalError('Une erreur est survenue. Vérifiez vos informations.');
        setLoading(false);
        return;
      }

      let msg = '';
      if (data.non_field_errors) {
        msg = Array.isArray(data.non_field_errors) ? data.non_field_errors[0] : data.non_field_errors;
      } else if (data.detail) {
        msg = data.detail;
      } else {
        const fieldErrors = Object.entries(data).map(([k, v]) => `${k}: ${Array.isArray(v) ? v[0] : v}`).join(' | ');
        msg = fieldErrors || 'Une erreur est survenue. Vérifiez vos informations.';
        setErrors(data);
      }
      setGlobalError(msg || 'Une erreur est survenue. Vérifiez vos informations.');
    } finally { setLoading(false); }
  };

  const pct = Math.round(((step) / STEPS.length) * 100);

  return (
    <>
      <style>{RF_STYLES}</style>
      <div className="rf-page">
        <div className="rf-glow-1"></div>
        <div className="rf-glow-2"></div>
        
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
                  <InputField label="Téléphone" name="telephone" type="tel" placeholder="+22890000000" icon="telephone" value={form.telephone} onChange={set('telephone')} error={errors.telephone} />
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