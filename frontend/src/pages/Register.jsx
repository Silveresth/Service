import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';

export default function Register() {
  const [form, setForm] = useState({ first_name:'', last_name:'', username:'', email:'', telephone:'', adresse:'', password:'' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [terms, setTerms] = useState(false);
  const navigate = useNavigate();
  const set = f => e => setForm({ ...form, [f]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!terms) return alert("Veuillez accepter les conditions d'utilisation");
    setLoading(true); setErrors({});
    try {
      await api.post('/auth/register/', { ...form, type_compte: 'client' });
      navigate('/login');
    } catch (err) { setErrors(err.response?.data || {}); }
    finally { setLoading(false); }
  };

  const Field = ({ name, label, type='text', icon }) => (
    <div className="mb-3">
      <label className="form-label">{label}</label>
      <div className="input-group">
        <span className="input-group-text"><i className={`bi bi-${icon}`}></i></span>
        <input type={type} className="form-control" value={form[name]} onChange={set(name)} />
      </div>
      {errors[name] && <div className="error-text">{errors[name]}</div>}
    </div>
  );

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <i className="bi bi-person-plus-fill" style={{ fontSize: '2.5rem' }}></i>
          <h2>Créer un compte client</h2>
          <p>Rejoignez Service Market</p>
        </div>
        <div className="auth-body">
          <form onSubmit={handleSubmit}>
            {errors.non_field_errors && <div className="alert alert-danger">{errors.non_field_errors}</div>}
            <div style={{ display:'flex', gap:12, marginBottom:0 }}>
              <div style={{ flex:1 }}>
                <label className="form-label">Prénom</label>
                <input type="text" className="form-control" value={form.first_name} onChange={set('first_name')} />
                {errors.first_name && <div className="error-text">{errors.first_name}</div>}
              </div>
              <div style={{ flex:1 }}>
                <label className="form-label">Nom</label>
                <input type="text" className="form-control" value={form.last_name} onChange={set('last_name')} />
              </div>
            </div>
            <div className="mb-3 mt-3">
              <label className="form-label">Nom d'utilisateur</label>
              <div className="input-group">
                <span className="input-group-text"><i className="bi bi-at"></i></span>
                <input type="text" className="form-control" value={form.username} onChange={set('username')} />
              </div>
              {errors.username && <div className="error-text">{errors.username}</div>}
            </div>
            <Field name="email" label="Email" type="email" icon="envelope" />
            <Field name="telephone" label="Téléphone" icon="telephone" />
            <Field name="adresse" label="Adresse" icon="geo-alt" />
            <Field name="password" label="Mot de passe" type="password" icon="lock" />
            <div className="form-check mb-3">
              <input type="checkbox" checked={terms} onChange={e => setTerms(e.target.checked)} />
              <label>J'accepte les <a href="#">conditions d'utilisation</a></label>
            </div>
            <button type="submit" className="btn-primary-custom w-100 mb-3" disabled={loading}
              style={{ justifyContent: 'center', padding: '12px' }}>
              {loading ? 'Création...' : <><i className="bi bi-check-circle"></i> Créer mon compte</>}
            </button>
          </form>
          <hr />
          <div className="text-center">
            <p className="text-muted mb-2">Vous êtes prestataire ?</p>
            <Link to="/inscription-prestataire" className="btn-outline-primary-custom btn-sm-custom"
              style={{ borderColor: '#28a745', color: '#28a745' }}>
              <i className="bi bi-briefcase"></i> Créer un compte prestataire
            </Link>
          </div>
          <div className="text-center mt-3">
            <p className="text-muted mb-0" style={{ fontSize: '0.9rem' }}>
              Déjà inscrit ? <Link to="/login">Se connecter</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}