import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';

/* ─── InputField défini HORS du composant parent ───────────────────
   Si défini à l'intérieur, React recrée la fonction à chaque render,
   démonte/remonte l'<input> et perd le focus après chaque frappe.
──────────────────────────────────────────────────────────────────── */
function InputField({ label, name, type = 'text', placeholder, icon, value, onChange, error }) {
  return (
    <div className="reg-field-group">
      <label className="reg-label" htmlFor={`reg-${name}`}>
        <i className={`bi bi-${icon}`}></i> {label}
      </label>
      <div className={`reg-input-wrap${error ? ' has-error' : ''}`}>
        <input
          id={`reg-${name}`}
          type={type}
          className="reg-input"
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          autoComplete={type === 'password' ? 'new-password' : 'off'}
        />
      </div>
      {error && (
        <span className="reg-error-msg">
          <i className="bi bi-exclamation-circle"></i> {error}
        </span>
      )}
    </div>
  );
}

const REG_STYLES = `
  .reg-page {
    min-height: 100vh;
    background: linear-gradient(135deg, #0c2340 0%, #0284c7 60%, #e0f2fe 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 40px 16px;
  }
  .reg-card {
    background: #fff;
    border-radius: 24px;
    box-shadow: 0 20px 60px rgba(2,132,199,0.22);
    width: 100%;
    max-width: 540px;
    overflow: hidden;
  }
  .reg-card-header {
    background: linear-gradient(135deg, #0c2340, #0284c7);
    padding: 32px 36px 24px;
    text-align: center;
    color: white;
  }
  .reg-card-header .reg-icon {
    width: 68px; height: 68px;
    background: rgba(255,255,255,0.15);
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    margin: 0 auto 14px;
    font-size: 1.9rem;
    border: 2px solid rgba(255,255,255,0.25);
  }
  .reg-card-header h2 { font-size: 1.5rem; font-weight: 800; margin: 0 0 6px; }
  .reg-card-header p  { margin: 0; opacity: .8; font-size: .9rem; }

  .reg-tabs {
    display: flex;
    border-bottom: 2px solid #e2e8f0;
    background: #f8fafc;
  }
  .reg-tab {
    flex: 1; padding: 14px; text-align: center;
    font-weight: 600; font-size: .88rem; cursor: pointer;
    border: none; background: none; color: #64748b;
    transition: all .2s; text-decoration: none;
    display: flex; align-items: center; justify-content: center; gap: 6px;
  }
  .reg-tab.active {
    color: #0284c7; background: white;
    border-bottom: 3px solid #0284c7;
  }
  .reg-tab:hover:not(.active) { background: #f1f5f9; color: #374151; }

  .reg-body { padding: 28px 36px 32px; }

  .reg-global-error {
    background: #fef2f2; border: 1px solid #fecaca;
    color: #dc2626; border-radius: 10px;
    padding: 12px 16px; font-size: .875rem;
    margin-bottom: 20px; display: flex; align-items: center; gap: 8px;
  }
  .reg-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0 16px; }
  .reg-field-group { margin-bottom: 16px; }

  .reg-label {
    display: block; font-size: .82rem; font-weight: 600;
    color: #374151; margin-bottom: 6px;
  }
  .reg-label i { margin-right: 5px; color: #0284c7; }

  .reg-input-wrap {
    border: 1.5px solid #d1d5db;
    border-radius: 10px; background: #f9fafb;
    transition: border .2s, box-shadow .2s;
    display: flex; align-items: center;
  }
  .reg-input-wrap:focus-within {
    border-color: #0284c7;
    box-shadow: 0 0 0 3px rgba(2,132,199,0.12);
    background: #fff;
  }
  .reg-input-wrap.has-error { border-color: #f87171; }
  .reg-input-wrap.has-error:focus-within {
    box-shadow: 0 0 0 3px rgba(248,113,113,0.15);
  }

  .reg-input {
    flex: 1; border: none; background: transparent;
    padding: 11px 14px; font-size: .9rem; color: #0c2340;
    outline: none; min-width: 0; border-radius: 10px;
  }
  .reg-input::placeholder { color: #9ca3af; }

  .reg-eye-btn {
    background: none; border: none; cursor: pointer;
    padding: 0 12px; color: #9ca3af; font-size: .95rem;
    transition: color .2s; flex-shrink: 0;
  }
  .reg-eye-btn:hover { color: #0284c7; }

  .reg-error-msg {
    display: block; color: #dc2626; font-size: .78rem; margin-top: 5px;
  }

  .reg-terms {
    display: flex; align-items: flex-start; gap: 10px;
    margin: 6px 0 4px;
  }
  .reg-terms input[type=checkbox] {
    margin-top: 3px; width: 16px; height: 16px;
    accent-color: #0284c7; cursor: pointer; flex-shrink: 0;
  }
  .reg-terms label {
    font-size: .84rem; color: #374151; cursor: pointer; line-height: 1.55;
  }
  .reg-terms label a { color: #0284c7; font-weight: 600; text-decoration: none; }
  .reg-terms label a:hover { text-decoration: underline; }
  .reg-terms-error { color: #dc2626; font-size: .78rem; display: block; margin-bottom: 12px; }

  .reg-submit-btn {
    width: 100%; padding: 13px;
    background: linear-gradient(135deg, #0284c7, #0369a1);
    color: white; border: none; border-radius: 12px;
    font-size: .95rem; font-weight: 700; cursor: pointer;
    transition: all .2s; display: flex; align-items: center;
    justify-content: center; gap: 8px;
    box-shadow: 0 4px 15px rgba(2,132,199,0.28);
    margin-top: 16px;
  }
  .reg-submit-btn:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 6px 20px rgba(2,132,199,0.4);
  }
  .reg-submit-btn:disabled { opacity: .7; cursor: not-allowed; transform: none; }

  .reg-footer {
    text-align: center; margin-top: 20px;
    padding-top: 20px; border-top: 1px solid #e2e8f0;
    font-size: .85rem; color: #64748b;
  }
  .reg-footer a { color: #0284c7; font-weight: 600; text-decoration: none; }
  .reg-footer a:hover { text-decoration: underline; }

  @media (max-width: 540px) {
    .reg-grid { grid-template-columns: 1fr; }
    .reg-body { padding: 20px 18px 24px; }
    .reg-card-header { padding: 24px 18px 18px; }
  }
`;

export default function Register() {
  const [form, setForm] = useState({
    first_name: '', last_name: '', username: '',
    email: '', telephone: '', adresse: '',
    password: '', password_confirm: ''
  });
  const [errors, setErrors]       = useState({});
  const [globalError, setGlobalError] = useState('');
  const [loading, setLoading]     = useState(false);
  const [terms, setTerms]         = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm,  setShowConfirm]  = useState(false);
  const navigate = useNavigate();

  const updateField = (field) => (e) => {
    const value = e.target.value;
    setForm(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: null }));
  };

  const validate = () => {
    const errs = {};
    if (!form.first_name.trim())  errs.first_name      = 'Le prénom est requis.';
    if (!form.last_name.trim())   errs.last_name        = 'Le nom est requis.';
    if (!form.username.trim())    errs.username         = "Le nom d'utilisateur est requis.";
    if (!form.email.trim())       errs.email            = "L'email est requis.";
    if (!form.password)           errs.password         = 'Le mot de passe est requis.';
    if (form.password.length > 0 && form.password.length < 8)
                                  errs.password         = 'Minimum 8 caractères.';
    if (form.password !== form.password_confirm)
                                  errs.password_confirm = 'Les mots de passe ne correspondent pas.';
    if (!terms)                   errs.terms            = "Veuillez accepter les conditions d'utilisation.";
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGlobalError('');
    const localErrors = validate();
    if (Object.keys(localErrors).length > 0) { setErrors(localErrors); return; }
    setLoading(true);
    setErrors({});
    try {
      const { password_confirm, ...payload } = form;
      await api.post('/auth/register/', { ...payload, type_compte: 'client' });
      navigate('/login');
    } catch (err) {
      const data = err.response?.data || {};
      if (data.non_field_errors) setGlobalError(Array.isArray(data.non_field_errors) ? data.non_field_errors[0] : data.non_field_errors);
      else if (typeof data === 'string') setGlobalError(data);
      else setErrors(data);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{REG_STYLES}</style>

      <div className="reg-page">
        <div className="reg-card">

          <div className="reg-card-header">
            <div className="reg-icon"><i className="bi bi-person-plus-fill"></i></div>
            <h2>Créer un compte</h2>
            <p>Rejoignez Service Market en quelques étapes</p>
          </div>

          <div className="reg-tabs">
            <span className="reg-tab active">
              <i className="bi bi-person-fill"></i> Compte Client
            </span>
            <Link to="/register-prestataire" className="reg-tab">
              <i className="bi bi-briefcase-fill"></i> Compte Prestataire
            </Link>
          </div>

          <div className="reg-body">
            {globalError && (
              <div className="reg-global-error">
                <i className="bi bi-exclamation-triangle-fill"></i> {globalError}
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate>
              <div className="reg-grid">
                <InputField label="Prénom"      name="first_name" placeholder="Jean"            icon="person"       value={form.first_name} onChange={updateField('first_name')} error={errors.first_name} />
                <InputField label="Nom"         name="last_name"  placeholder="Dupont"          icon="person-badge" value={form.last_name}  onChange={updateField('last_name')}  error={errors.last_name}  />
              </div>
              <InputField label="Nom d'utilisateur" name="username"  placeholder="jean_dupont"      icon="at"           value={form.username}   onChange={updateField('username')}   error={errors.username}   />
              <InputField label="Adresse email"      name="email"     placeholder="jean@exemple.com" icon="envelope" type="email" value={form.email} onChange={updateField('email')} error={errors.email} />
              <div className="reg-grid">
                <InputField label="Téléphone" name="telephone" placeholder="+228 90 00 00 00" icon="telephone" type="tel" value={form.telephone} onChange={updateField('telephone')} error={errors.telephone} />
                <InputField label="Adresse"   name="adresse"   placeholder="Lomé, Togo"       icon="geo-alt"              value={form.adresse}   onChange={updateField('adresse')}   error={errors.adresse}   />
              </div>

              {/* Mot de passe */}
              <div className="reg-field-group">
                <label className="reg-label" htmlFor="reg-password">
                  <i className="bi bi-lock"></i> Mot de passe
                </label>
                <div className={`reg-input-wrap${errors.password ? ' has-error' : ''}`}>
                  <input
                    id="reg-password"
                    type={showPassword ? 'text' : 'password'}
                    className="reg-input"
                    placeholder="Min. 8 caractères"
                    value={form.password}
                    onChange={updateField('password')}
                    autoComplete="new-password"
                  />
                  <button type="button" className="reg-eye-btn" onClick={() => setShowPassword(v => !v)}>
                    <i className={`bi bi-eye${showPassword ? '-slash' : ''}`}></i>
                  </button>
                </div>
                {errors.password && <span className="reg-error-msg"><i className="bi bi-exclamation-circle"></i> {errors.password}</span>}
              </div>

              {/* Confirmation */}
              <div className="reg-field-group">
                <label className="reg-label" htmlFor="reg-password-confirm">
                  <i className="bi bi-lock-fill"></i> Confirmer le mot de passe
                </label>
                <div className={`reg-input-wrap${errors.password_confirm ? ' has-error' : ''}`}>
                  <input
                    id="reg-password-confirm"
                    type={showConfirm ? 'text' : 'password'}
                    className="reg-input"
                    placeholder="Répétez votre mot de passe"
                    value={form.password_confirm}
                    onChange={updateField('password_confirm')}
                    autoComplete="new-password"
                  />
                  <button type="button" className="reg-eye-btn" onClick={() => setShowConfirm(v => !v)}>
                    <i className={`bi bi-eye${showConfirm ? '-slash' : ''}`}></i>
                  </button>
                </div>
                {errors.password_confirm && <span className="reg-error-msg"><i className="bi bi-exclamation-circle"></i> {errors.password_confirm}</span>}
              </div>

              {/* CGU */}
              <div className="reg-terms">
                <input
                  type="checkbox" id="reg-terms" checked={terms}
                  onChange={e => { setTerms(e.target.checked); setErrors(p => ({ ...p, terms: null })); }}
                />
                <label htmlFor="reg-terms">
                  J'accepte les{' '}
                  <a href="#terms" onClick={e => e.preventDefault()}>conditions d'utilisation</a>{' '}
                  et la{' '}
                  <a href="#privacy" onClick={e => e.preventDefault()}>politique de confidentialité</a>.
                </label>
              </div>
              {errors.terms && <span className="reg-terms-error"><i className="bi bi-exclamation-circle"></i> {errors.terms}</span>}

              <button type="submit" className="reg-submit-btn" disabled={loading}>
                {loading
                  ? <><i className="bi bi-hourglass-split"></i> Création en cours...</>
                  : <><i className="bi bi-check-circle-fill"></i> Créer mon compte client</>
                }
              </button>
            </form>

            <div className="reg-footer">
              Déjà inscrit ?{' '}<Link to="/login">Se connecter</Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
