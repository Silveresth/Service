import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const res = await api.post('/auth/login/', form);
      login(res.data);
      const type = res.data?.user?.type_compte;
      const isAdmin = !!res.data?.user?.is_staff || type === 'admin';
      if (isAdmin) navigate('/admin-dashboard');
      else if (type === 'prestataire') navigate('/prestataire-dashboard');
      else navigate('/services');
    } catch (err) {
      console.error('LOGIN_ERROR:', err?.response?.data);
      setError(err?.response?.data?.error || "Nom d'utilisateur ou mot de passe incorrect.");
    } finally { setLoading(false); }

  };


  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <i className="bi bi-briefcase-fill" style={{ fontSize: '2.5rem' }}></i>
          <h2>Service Market</h2>
          <p>Connectez-vous à votre compte</p>
        </div>
        <div className="auth-body">
          <form onSubmit={handleSubmit}>
            {error && <div className="alert alert-danger"><i className="bi bi-exclamation-triangle"></i> {error}</div>}
            <div className="mb-3">
              <label className="form-label">Nom d'utilisateur</label>
              <div className="input-group">
                <span className="input-group-text"><i className="bi bi-person"></i></span>
                <input type="text" className="form-control" placeholder="Votre nom d'utilisateur" required
                  value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} />
              </div>
            </div>
            <div className="mb-3">
              <label className="form-label">Mot de passe</label>
              <div className="input-group">
                <span className="input-group-text"><i className="bi bi-lock"></i></span>
                <input type="password" className="form-control" placeholder="Votre mot de passe" required
                  value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
              </div>
            </div>
            <button type="submit" className="btn-primary-custom w-100 mb-3" disabled={loading}
              style={{ justifyContent: 'center', padding: '12px' }}>
              {loading ? <><i className="bi bi-hourglass-split"></i> Connexion...</> : <><i className="bi bi-box-arrow-in-right"></i> Se connecter</>}
            </button>
          </form>
          <hr />
          <div className="text-center">
            <p className="text-muted mb-2">Vous n'avez pas de compte ?</p>
            <div className="d-flex gap-2 justify-content-center">
              <Link to="/inscription-client" className="btn-outline-primary-custom btn-sm-custom">
                <i className="bi bi-person-plus"></i> Inscription Client
              </Link>
              <Link to="/inscription-prestataire" className="btn-outline-primary-custom btn-sm-custom"
                style={{ borderColor: '#28a745', color: '#28a745' }}>
                <i className="bi bi-briefcase"></i> Prestataire
              </Link>
            </div>
          </div>
          <div className="text-center mt-3">
            <Link to="/" style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textDecoration: 'none' }}>
              <i className="bi bi-arrow-left me-1"></i>Retour à l'accueil
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}