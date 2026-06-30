import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import GoogleLoginButton from '../../components/GoogleLoginButton';

const LOGIN_STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Outfit:wght@600;800&display=swap');

@keyframes login-fadeUp {
  from { opacity: 0; transform: translateY(24px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes login-glowMove {
  0%, 100% { transform: translate(0, 0) scale(1); }
  50% { transform: translate(40px, -60px) scale(1.2); }
}

@keyframes login-glowMove2 {
  0%, 100% { transform: translate(0, 0) scale(1.2); }
  50% { transform: translate(-50px, 40px) scale(0.9); }
}

.login-container {
  font-family: 'Plus Jakarta Sans', sans-serif;
  min-height: 100vh;
  display: grid;
  grid-template-columns: 1.1fr 0.9fr;
  background: #060d19;
  position: relative;
  overflow: hidden;
}

/* --- PANNEAU GAUCHE --- */
.login-left-pane {
  background: linear-gradient(135deg, #091322 0%, #030712 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 60px;
  position: relative;
  overflow: hidden;
  border-right: 1px solid rgba(255, 255, 255, 0.05);
}

.glow-orb-1 {
  position: absolute;
  top: 10%;
  left: 15%;
  width: 350px;
  height: 350px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(2, 132, 199, 0.25) 0%, transparent 70%);
  filter: blur(60px);
  animation: login-glowMove 12s ease-in-out infinite;
  pointer-events: none;
}

.glow-orb-2 {
  position: absolute;
  bottom: 10%;
  right: 15%;
  width: 400px;
  height: 400px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(139, 92, 246, 0.2) 0%, transparent 70%);
  filter: blur(80px);
  animation: login-glowMove2 15s ease-in-out infinite;
  pointer-events: none;
}

.login-glass-card {
  background: rgba(255, 255, 255, 0.02);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 32px;
  padding: 48px;
  width: 100%;
  max-width: 480px;
  text-align: center;
  position: relative;
  z-index: 2;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
}

.login-logo-circle {
  width: 88px;
  height: 88px;
  border-radius: 24px;
  background: linear-gradient(135deg, rgba(2, 132, 199, 0.2) 0%, rgba(139, 92, 246, 0.2) 100%);
  border: 1.5px solid rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 32px;
  box-shadow: 0 12px 24px rgba(0,0,0,0.2);
}

.login-logo-circle i {
  font-size: 2.6rem;
  background: linear-gradient(135deg, #38bdf8, #a78bfa);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.login-left-title {
  font-family: 'Outfit', sans-serif;
  color: #fff;
  font-weight: 800;
  font-size: 2.2rem;
  margin-bottom: 16px;
  letter-spacing: -0.02em;
}

.login-left-desc {
  color: #94a3b8;
  line-height: 1.7;
  font-size: 0.98rem;
  max-width: 360px;
  margin: 0 auto 40px;
}

.login-stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  padding-top: 32px;
}

.login-stat-num {
  color: #fff;
  font-weight: 800;
  font-size: 1.5rem;
  font-family: 'Outfit', sans-serif;
  background: linear-gradient(135deg, #38bdf8, #818cf8);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.login-stat-label {
  color: #64748b;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-top: 4px;
}

/* --- PANNEAU DROIT --- */
.login-right-pane {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 60px 40px;
  background: #030712;
  position: relative;
  z-index: 2;
}

.login-form-box {
  width: 100%;
  max-width: 400px;
  animation: login-fadeUp 0.6s cubic-bezier(0.22, 1, 0.36, 1) both;
}

.login-mobile-logo {
  display: none;
  text-align: center;
  margin-bottom: 36px;
}

.login-right-title {
  font-family: 'Outfit', sans-serif;
  font-weight: 800;
  color: #fff;
  font-size: 1.8rem;
  margin: 0 0 8px;
  letter-spacing: -0.01em;
}

.login-right-desc {
  color: #64748b;
  font-size: 0.92rem;
  margin-bottom: 32px;
}

.login-input-group {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.login-field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.login-field-label {
  font-weight: 700;
  font-size: 0.75rem;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.login-input-wrapper {
  display: flex;
  align-items: center;
  background: #0b1329;
  border: 1.5px solid #1e293b;
  border-radius: 16px;
  overflow: hidden;
  transition: all 0.25s ease;
}

.login-input-wrapper:focus-within {
  border-color: #0284c7;
  box-shadow: 0 0 0 4px rgba(2, 132, 199, 0.15);
  background: #0f172a;
}

.login-input-icon {
  padding: 0 14px 0 18px;
  color: #475569;
  font-size: 1.1rem;
  transition: color 0.25s;
}

.login-input-wrapper:focus-within .login-input-icon {
  color: #38bdf8;
}

.login-input-field {
  flex: 1;
  padding: 15px 16px 15px 0;
  border: none;
  outline: none;
  font-size: 0.95rem;
  color: #f1f5f9;
  background: transparent;
  font-family: inherit;
}

.login-input-field::placeholder {
  color: #475569;
}

.login-pw-toggle {
  padding: 0 18px;
  background: none;
  border: none;
  cursor: pointer;
  color: #475569;
  font-size: 1.1rem;
  display: flex;
  align-items: center;
  transition: color 0.2s;
}

.login-pw-toggle:hover {
  color: #38bdf8;
}

.login-submit-btn {
  width: 100%;
  padding: 16px;
  border-radius: 16px;
  border: none;
  background: linear-gradient(135deg, #0284c7 0%, #4f46e5 100%);
  color: #fff;
  font-weight: 700;
  font-size: 0.98rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  box-shadow: 0 10px 25px rgba(2, 132, 199, 0.25);
  transition: all 0.25s;
  font-family: inherit;
  margin-top: 10px;
}

.login-submit-btn:hover:not(:disabled) {
  transform: translateY(-1.5px);
  box-shadow: 0 12px 30px rgba(2, 132, 199, 0.4);
}

.login-submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.login-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: login-spin 0.7s linear infinite;
  display: inline-block;
}

@keyframes login-spin {
  to { transform: rotate(360deg); }
}

.login-divider {
  display: flex;
  align-items: center;
  gap: 16px;
  margin: 32px 0 24px;
}

.login-divider-line {
  flex: 1;
  height: 1px;
  background: #1e293b;
}

.login-divider-text {
  color: #475569;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

/* --- BOUTONS CHOIX INSCRIPTION --- */
.login-register-options {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.login-register-link {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 13px;
  border-radius: 14px;
  text-decoration: none;
  font-weight: 700;
  font-size: 0.88rem;
  transition: all 0.2s;
  font-family: inherit;
}

.login-register-link.client {
  border: 1.5px solid rgba(2, 132, 199, 0.3);
  color: #38bdf8;
  background: rgba(2, 132, 199, 0.05);
}

.login-register-link.client:hover {
  background: #0284c7;
  color: #fff;
  border-color: #0284c7;
  box-shadow: 0 8px 20px rgba(2, 132, 199, 0.25);
}

.login-register-link.provider {
  border: 1.5px solid rgba(16, 185, 129, 0.3);
  color: #34d399;
  background: rgba(16, 185, 129, 0.05);
}

.login-register-link.provider:hover {
  background: #10b981;
  color: #fff;
  border-color: #10b981;
  box-shadow: 0 8px 20px rgba(16, 185, 129, 0.25);
}

.login-back-home {
  text-align: center;
  margin-top: 24px;
}

.login-back-home-link {
  color: #475569;
  font-size: 0.88rem;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  transition: color 0.2s;
}

.login-back-home-link:hover {
  color: #38bdf8;
}

/* --- RESPONSIVE --- */
@media (max-width: 900px) {
  .login-container {
    grid-template-columns: 1fr;
  }
  .login-left-pane {
    display: none;
  }
  .login-right-pane {
    background: #060d19;
    padding: 60px 24px;
  }
  .login-mobile-logo {
    display: block;
  }
}
`;

export default function Login() {
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [info, setInfo] = useState(location.state?.info || '');

  const redirectAfterLogin = (data) => {
    login(data);
    const type = data?.user?.type_compte;
    if (data?.user?.is_staff || type === 'admin') {
      navigate('/admin-dashboard');
    } else if (type === 'prestataire') {
      navigate('/prestataire-dashboard');
    } else {
      navigate('/services');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setInfo('');
    try {
      const res = await api.post('/auth/login/', form);
      redirectAfterLogin(res.data);
    } catch (err) {
      setError("Nom d'utilisateur ou mot de passe incorrect.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{LOGIN_STYLES}</style>
      <div className="login-container">
        {/* --- PANNEAU GAUCHE (DESKTOP ILLUSTRATION) --- */}
        <div className="login-left-pane">
          <div className="glow-orb-1"></div>
          <div className="glow-orb-2"></div>
          
          <div className="login-glass-card">
            <div className="login-logo-circle">
              <i className="bi bi-briefcase-fill" />
            </div>
            <h2 className="login-left-title">Services Market</h2>
            <p className="login-left-desc">
              La plateforme moderne de mise en relation entre clients et artisans de confiance au Togo.
            </p>

            <div className="login-stats-grid">
              <div>
                <div className="login-stat-num">500+</div>
                <div className="login-stat-label">Artisans</div>
              </div>
              <div>
                <div className="login-stat-num">1k+</div>
                <div className="login-stat-label">Services</div>
              </div>
              <div>
                <div className="login-stat-num">98%</div>
                <div className="login-stat-label">Satisfaction</div>
              </div>
            </div>
          </div>
        </div>

        {/* --- PANNEAU DROIT (FORMULAIRE) --- */}
        <div className="login-right-pane">
          <div className="login-form-box">
            
            {/* Logo Mobile uniquement */}
            <div className="login-mobile-logo">
              <div className="login-logo-circle" style={{ width: 64, height: 64, borderRadius: 18, marginBottom: 16 }}>
                <i className="bi bi-briefcase-fill" style={{ fontSize: '1.8rem' }} />
              </div>
            </div>

            <h3 className="login-right-title">Connexion</h3>
            <p className="login-right-desc">Heureux de vous revoir ! Entrez vos accès pour continuer.</p>

            {/* Message d'information (ex: après inscription) */}
            {info && (
              <div style={{
                background: 'rgba(56, 189, 248, 0.1)',
                border: '1px solid rgba(56, 189, 248, 0.25)',
                borderRadius: '16px',
                padding: '14px 18px',
                marginBottom: '24px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                color: '#7dd3fc',
                fontSize: '0.9rem',
                animation: 'login-fadeUp 0.3s ease'
              }}>
                <i className="bi bi-info-circle-fill" style={{ color: '#38bdf8', fontSize: '1.1rem' }} />
                <span>{info}</span>
              </div>
            )}

            {/* Message d'erreur */}
            {error && (
              <div style={{
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.2)',
                borderRadius: '16px',
                padding: '14px 18px',
                marginBottom: '24px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                color: '#fca5a5',
                fontSize: '0.9rem',
                animation: 'login-fadeUp 0.3s ease'
              }}>
                <i className="bi bi-exclamation-circle-fill" style={{ color: '#ef4444', fontSize: '1.1rem' }} />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="login-input-group">
              {/* Username */}
              <div className="login-field">
                <label className="login-field-label">Nom d'utilisateur</label>
                <div className="login-input-wrapper">
                  <i className="bi bi-person login-input-icon" />
                  <input
                    type="text"
                    required
                    placeholder="Ex: jean_dupont"
                    value={form.username}
                    onChange={e => setForm({ ...form, username: e.target.value })}
                    className="login-input-field"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="login-field">
                <label className="login-field-label">Mot de passe</label>
                <div className="login-input-wrapper">
                  <i className="bi bi-lock login-input-icon" />
                  <input
                    type={showPw ? 'text' : 'password'}
                    required
                    placeholder="Votre mot de passe"
                    value={form.password}
                    onChange={e => setForm({ ...form, password: e.target.value })}
                    className="login-input-field"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(!showPw)}
                    className="login-pw-toggle"
                  >
                    <i className={`bi bi-eye${showPw ? '-slash' : ''}`} />
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="login-submit-btn"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="login-spinner" />
                    Connexion en cours...
                  </>
                ) : (
                  <>
                    <i className="bi bi-box-arrow-in-right" />
                    Se connecter
                  </>
                )}
              </button>
            </form>

            {/* Connexion Google */}
            <div className="login-divider">
              <div className="login-divider-line" />
              <span className="login-divider-text">ou</span>
              <div className="login-divider-line" />
            </div>
            <GoogleLoginButton
              onSuccess={redirectAfterLogin}
              onError={(msg) => setError(msg)}
            />

            {/* Séparateur */}
            <div className="login-divider">
              <div className="login-divider-line" />
              <span className="login-divider-text">Nouveau sur la plateforme ?</span>
              <div className="login-divider-line" />
            </div>

            {/* Boutons d'inscription */}
            <div className="login-register-options">
              <Link to="/inscription-client" className="login-register-link client">
                <i className="bi bi-person-plus" /> Espace Client
              </Link>
              <Link to="/inscription-prestataire" className="login-register-link provider">
                <i className="bi bi-briefcase" /> Espace Pro
              </Link>
            </div>

            {/* Retour à l'accueil */}
            <div className="login-back-home">
              <Link to="/" className="login-back-home-link">
                <i className="bi bi-arrow-left" /> Retour à l'accueil
              </Link>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}