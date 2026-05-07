import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';

/* ─── InputField défini HORS du composant parent ───────────────────
   Si défini à l'intérieur, React recrée la fonction à chaque render,
   démonte/remonte l'<input> et perd le focus après chaque frappe.
──────────────────────────────────────────────────────────────────── */
function InputField({ label, name, type = 'text', placeholder, icon, value, onChange, error }) {
  return (
    <div className="regp-field-group">
      <label className="regp-label" htmlFor={`regp-${name}`}>
        <i className={`bi bi-${icon}`}></i> {label}
      </label>
      <div className={`regp-input-wrap${error ? ' has-error' : ''}`}>
        <input
          id={`regp-${name}`}
          type={type}
          className="regp-input"
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          autoComplete="off"
        />
      </div>
      {error && (
        <span className="regp-error-msg">
          <i className="bi bi-exclamation-circle"></i> {error}
        </span>
      )}
    </div>
  );
}

const REGP_STYLES = `
  .regp-page {
    min-height: 100vh;
    background: linear-gradient(135deg, #064e3b 0%, #059669 60%, #d1fae5 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 40px 16px;
  }
  .regp-card {
    background: #fff;
    border-radius: 24px;
    box-shadow: 0 20px 60px rgba(5,150,105,0.22);
    width: 100%;
    max-width: 580px;
    overflow: hidden;
  }
  .regp-card-header {
    background: linear-gradient(135deg, #064e3b, #059669);
    padding: 32px 36px 24px;
    text-align: center;
    color: white;
  }
  .regp-card-header .regp-icon {
    width: 68px; height: 68px;
    background: rgba(255,255,255,0.15);
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    margin: 0 auto 14px;
    font-size: 1.9rem;
    border: 2px solid rgba(255,255,255,0.25);
  }
  .regp-card-header h2 { font-size: 1.5rem; font-weight: 800; margin: 0 0 6px; }
  .regp-card-header p  { margin: 0; opacity: .8; font-size: .9rem; }

  .regp-tabs {
    display: flex;
    border-bottom: 2px solid #e2e8f0;
    background: #f8fafc;
  }
  .regp-tab {
    flex: 1; padding: 14px; text-align: center;
    font-weight: 600; font-size: .88rem; cursor: pointer;
    border: none; background: none; color: #64748b;
    transition: all .2s; text-decoration: none;
    display: flex; align-items: center; justify-content: center; gap: 6px;
  }
  .regp-tab.active {
    color: #059669; background: white;
    border-bottom: 3px solid #059669;
  }
  .regp-tab:hover:not(.active) { background: #f1f5f9; color: #374151; }

  .regp-body { padding: 28px 36px 32px; }

  .regp-global-error {
    background: #fef2f2; border: 1px solid #fecaca;
    color: #dc2626; border-radius: 10px;
    padding: 12px 16px; font-size: .875rem;
    margin-bottom: 20px; display: flex; align-items: center; gap: 8px;
  }

  .regp-section-title {
    font-size: .78rem; font-weight: 700; color: #6b7280;
    text-transform: uppercase; letter-spacing: .06em;
    margin: 20px 0 12px;
    display: flex; align-items: center; gap: 8px;
  }
  .regp-section-title::before, .regp-section-title::after {
    content: ''; flex: 1; height: 1px; background: #e5e7eb;
  }

  .regp-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0 16px; }
  .regp-field-group { margin-bottom: 16px; }

  .regp-label {
    display: block; font-size: .82rem; font-weight: 600;
    color: #374151; margin-bottom: 6px;
  }
  .regp-label i { margin-right: 5px; color: #059669; }

  .regp-input-wrap {
    border: 1.5px solid #d1d5db;
    border-radius: 10px; background: #f9fafb;
    transition: border .2s, box-shadow .2s;
    display: flex; align-items: center;
  }
  .regp-input-wrap:focus-within {
    border-color: #059669;
    box-shadow: 0 0 0 3px rgba(5,150,105,0.12);
    background: #fff;
  }
  .regp-input-wrap.has-error { border-color: #f87171; }
  .regp-input-wrap.has-error:focus-within {
    box-shadow: 0 0 0 3px rgba(248,113,113,0.15);
  }

  .regp-input {
    flex: 1; border: none; background: transparent;
    padding: 11px 14px; font-size: .9rem; color: #0c2340;
    outline: none; min-width: 0; border-radius: 10px;
  }
  .regp-input::placeholder { color: #9ca3af; }

  .regp-eye-btn {
    background: none; border: none; cursor: pointer;
    padding: 0 12px; color: #9ca3af; font-size: .95rem;
    transition: color .2s; flex-shrink: 0;
  }
  .regp-eye-btn:hover { color: #059669; }

  .regp-error-msg {
    display: block; color: #dc2626; font-size: .78rem; margin-top: 5px;
  }

  .regp-payment-note {
    background: #f0fdf4; border: 1px solid #bbf7d0;
    border-radius: 10px; padding: 10px 14px;
    font-size: .8rem; color: #166534; margin-bottom: 4px;
    display: flex; align-items: flex-start; gap: 8px;
  }
  .regp-payment-note i { color: #16a34a; margin-top: 1px; flex-shrink: 0; }

  .regp-terms {
    display: flex; align-items: flex-start; gap: 10px;
    margin: 6px 0 4px;
  }
  .regp-terms input[type=checkbox] {
    margin-top: 3px; width: 16px; height: 16px;
    accent-color: #059669; cursor: pointer; flex-shrink: 0;
  }
  .regp-terms label {
    font-size: .84rem; color: #374151; cursor: pointer; line-height: 1.55;
  }
  .regp-terms label a { color: #059669; font-weight: 600; text-decoration: none; }
  .regp-terms label a:hover { text-decoration: underline; }
  .regp-terms-error { color: #dc2626; font-size: .78rem; display: block; margin-bottom: 12px; }

  .regp-submit-btn {
    width: 100%; padding: 13px;
    background: linear-gradient(135deg, #059669, #047857);
    color: white; border: none; border-radius: 12px;
    font-size: .95rem; font-weight: 700; cursor: pointer;
    transition: all .2s; display: flex; align-items: center;
    justify-content: center; gap: 8px;
    box-shadow: 0 4px 15px rgba(5,150,105,0.28);
    margin-top: 16px;
  }
  .regp-submit-btn:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 6px 20px rgba(5,150,105,0.4);
  }
  .regp-submit-btn:disabled { opacity: .7; cursor: not-allowed; transform: none; }

  .regp-footer {
    text-align: center; margin-top: 20px;
    padding-top: 20px; border-top: 1px solid #e2e8f0;
    font-size: .85rem; color: #64748b;
  }
  .regp-footer a { color: #059669; font-weight: 600; text-decoration: none; }
  .regp-footer a:hover { text-decoration: underline; }

  @media (max-width: 540px) {
    .regp-grid { grid-template-columns: 1fr; }
    .regp-body { padding: 20px 18px 24px; }
    .regp-card-header { padding: 24px 18px 18px; }
  }
`;

export default function RegisterPrestataire() {
  const [form, setForm] = useState({
    first_name: '', last_name: '', username: '', email: '',
    telephone: '', adresse: '', numero_flooz: '', numero_mix: '',
    specialite: '', password: '', password_confirm: ''
  });
  const [errors, setErrors]           = useState({});
  const [globalError, setGlobalError] = useState('');
  const [loading, setLoading]         = useState(false);
  const [terms, setTerms]             = useState(false);
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
    if (!form.specialite.trim())  errs.specialite       = 'La spécialité est requise.';
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
      await api.post('/auth/register/', { ...payload, type_compte: 'prestataire' });
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
      <style>{REGP_STYLES}</style>

      <div className="regp-page">
        <div className="regp-card">

          <div className="regp-card-header">
            <div className="regp-icon"><i className="bi bi-briefcase-fill"></i></div>
            <h2>Devenir Prestataire</h2>
            <p>Proposez vos services sur Service Market</p>
          </div>

          <div className="regp-tabs">
            <Link to="/register" className="regp-tab">
              <i className="bi bi-person-fill"></i> Compte Client
            </Link>
            <span className="regp-tab active">
              <i className="bi bi-briefcase-fill"></i> Compte Prestataire
            </span>
          </div>

          <div className="regp-body">
            {globalError && (
              <div className="regp-global-error">
                <i className="bi bi-exclamation-triangle-fill"></i> {globalError}
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate>

              <div className="regp-section-title">Informations personnelles</div>
              <div className="regp-grid">
                <InputField label="Prénom" name="first_name" placeholder="Jean"   icon="person"       value={form.first_name} onChange={updateField('first_name')} error={errors.first_name} />
                <InputField label="Nom"    name="last_name"  placeholder="Dupont" icon="person-badge" value={form.last_name}  onChange={updateField('last_name')}  error={errors.last_name}  />
              </div>
              <InputField label="Nom d'utilisateur" name="username"  placeholder="jean_dupont"      icon="at"       value={form.username}  onChange={updateField('username')}  error={errors.username}  />
              <InputField label="Adresse email"      name="email"     placeholder="jean@exemple.com" icon="envelope" type="email" value={form.email} onChange={updateField('email')} error={errors.email} />
              <div className="regp-grid">
                <InputField label="Téléphone" name="telephone" placeholder="+228 90 00 00 00" icon="telephone" type="tel" value={form.telephone} onChange={updateField('telephone')} error={errors.telephone} />
                <InputField label="Adresse"   name="adresse"   placeholder="Lomé, Togo"       icon="geo-alt"              value={form.adresse}   onChange={updateField('adresse')}   error={errors.adresse}   />
              </div>

              <div className="regp-section-title">Profil Professionnel</div>
              <InputField label="Spécialité" name="specialite" placeholder="Ex: Plomberie, Électricité, Coiffure..." icon="tools" value={form.specialite} onChange={updateField('specialite')} error={errors.specialite} />

              <div className="regp-section-title">Coordonnées de Paiement Mobile</div>
              <div className="regp-payment-note">
                <i className="bi bi-info-circle-fill"></i>
                Ces numéros servent à recevoir vos paiements via Mobile Money. Vous pouvez n'en renseigner qu'un seul.
              </div>
              <div className="regp-grid">
                <InputField label="Flooz (Moov)"     name="numero_flooz" placeholder="+228 99 00 00 00" icon="phone" type="tel" value={form.numero_flooz} onChange={updateField('numero_flooz')} error={errors.numero_flooz} />
                <InputField label="TMoney (Togocel)"  name="numero_mix"   placeholder="+228 90 00 00 00" icon="phone" type="tel" value={form.numero_mix}   onChange={updateField('numero_mix')}   error={errors.numero_mix}   />
              </div>

              <div className="regp-section-title">Sécurité du Compte</div>

              {/* Mot de passe */}
              <div className="regp-field-group">
                <label className="regp-label" htmlFor="regp-password">
                  <i className="bi bi-lock"></i> Mot de passe
                </label>
                <div className={`regp-input-wrap${errors.password ? ' has-error' : ''}`}>
                  <input
                    id="regp-password"
                    type={showPassword ? 'text' : 'password'}
                    className="regp-input"
                    placeholder="Min. 8 caractères"
                    value={form.password}
                    onChange={updateField('password')}
                    autoComplete="new-password"
                  />
                  <button type="button" className="regp-eye-btn" onClick={() => setShowPassword(v => !v)}>
                    <i className={`bi bi-eye${showPassword ? '-slash' : ''}`}></i>
                  </button>
                </div>
                {errors.password && <span className="regp-error-msg"><i className="bi bi-exclamation-circle"></i> {errors.password}</span>}
              </div>

              {/* Confirmation */}
              <div className="regp-field-group">
                <label className="regp-label" htmlFor="regp-password-confirm">
                  <i className="bi bi-lock-fill"></i> Confirmer le mot de passe
                </label>
                <div className={`regp-input-wrap${errors.password_confirm ? ' has-error' : ''}`}>
                  <input
                    id="regp-password-confirm"
                    type={showConfirm ? 'text' : 'password'}
                    className="regp-input"
                    placeholder="Répétez votre mot de passe"
                    value={form.password_confirm}
                    onChange={updateField('password_confirm')}
                    autoComplete="new-password"
                  />
                  <button type="button" className="regp-eye-btn" onClick={() => setShowConfirm(v => !v)}>
                    <i className={`bi bi-eye${showConfirm ? '-slash' : ''}`}></i>
                  </button>
                </div>
                {errors.password_confirm && <span className="regp-error-msg"><i className="bi bi-exclamation-circle"></i> {errors.password_confirm}</span>}
              </div>

              {/* CGU */}
              <div className="regp-terms">
                <input
                  type="checkbox" id="regp-terms" checked={terms}
                  onChange={e => { setTerms(e.target.checked); setErrors(p => ({ ...p, terms: null })); }}
                />
                <label htmlFor="regp-terms">
                  J'accepte les{' '}
                  <a href="#terms" onClick={e => e.preventDefault()}>conditions d'utilisation</a>{' '}
                  et la{' '}
                  <a href="#privacy" onClick={e => e.preventDefault()}>politique de confidentialité</a>{' '}
                  de Service Market.
                </label>
              </div>
              {errors.terms && <span className="regp-terms-error"><i className="bi bi-exclamation-circle"></i> {errors.terms}</span>}

              <button type="submit" className="regp-submit-btn" disabled={loading}>
                {loading
                  ? <><i className="bi bi-hourglass-split"></i> Création en cours...</>
                  : <><i className="bi bi-check-circle-fill"></i> Créer mon compte prestataire</>
                }
              </button>
            </form>

            <div className="regp-footer">
              Déjà inscrit ?{' '}<Link to="/login">Se connecter</Link>
              {' · '}
              <Link to="/register">Créer un compte client</Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
