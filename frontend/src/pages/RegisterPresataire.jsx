import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';

export default function RegisterPrestataire() {
  const [form, setForm] = useState({ first_name:'', last_name:'', username:'', email:'', telephone:'', adresse:'', numero_flooz:'', numero_mix:'', specialite:'', password:'' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [terms, setTerms] = useState(false);
  const navigate = useNavigate();
  const set = f => e => setForm({ ...form, [f]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!terms) return alert("Veuillez accepter les conditions");
    setLoading(true); setErrors({});
    try {
      await api.post('/auth/register/', { ...form, type_compte: 'prestataire' });
      navigate('/login');
    } catch (err) { setErrors(err.response?.data || {}); }
    finally { setLoading(false); }
  };

  const Field = ({ name, label, type='text', icon, hint }) => (
    <div className="mb-3">
      <label className="form-label">{label}</label>
      <div className="input-group">
        <span className="input-group-text"><i className={`bi bi-${icon}`}></i></span>
        <input type={type} className="form-control" value={form[name]} onChange={set(name)} />
      </div>
      {hint && <small>{hint}</small>}
      {errors[name] && <div className="error-text">{errors[name]}</div>}
    </div>
  );

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header bg-success">
          <i className="bi bi-briefcase-fill" style={{ fontSize: '2.5rem' }}></i>
          <h2>Devenir prestataire</h2>
          <p>Rejoignez notre réseau de professionnels</p>
        </div>
        <div className="auth-body">
          <form onSubmit={handleSubmit}>
            {errors.non_field_errors && <div className="alert alert-danger">{errors.non_field_errors}</div>}
            <div style={{ display:'flex', gap:12, marginBottom:16 }}>
              <div style={{ flex:1 }}>
                <label className="form-label">Prénom</label>
                <input type="text" className="form-control" value={form.first_name} onChange={set('first_name')} />
              </div>
              <div style={{ flex:1 }}>
                <label className="form-label">Nom</label>
                <input type="text" className="form-control" value={form.last_name} onChange={set('last_name')} />
              </div>
            </div>
            <div className="mb-3">
              <label className="form-label">Nom d'utilisateur</label>
              <div className="input-group">
                <span className="input-group-text"><i className="bi bi-at"></i></span>
                <input type="text" className="form-control" value={form.username} onChange={set('username')} />
              </div>
              {errors.username && <div className="error-text">{errors.username}</div>}
            </div>
            <Field name="email" label="Email" type="email" icon="envelope" />
            <Field name="telephone" label="Téléphone" icon="telephone" hint="Numéro WhatsApp pour les contacts" />
            <Field name="adresse" label="Adresse" icon="geo-alt" />
            <Field name="numero_flooz" label="Numéro Flooz" icon="phone" />
            <Field name="numero_mix" label="Numéro Mix by Yas" icon="phone" />
            <Field name="specialite" label="Spécialité" icon="gear" />
            <Field name="password" label="Mot de passe" type="password" icon="lock" />
            <div className="form-check mb-3">
              <input type="checkbox" checked={terms} onChange={e => setTerms(e.target.checked)} />
              <label>J'accepte les <a href="#">conditions d'utilisation</a></label>
            </div>
            <button type="submit" className="btn-primary-custom w-100 mb-3" disabled={loading}
              style={{ justifyContent:'center', padding:'12px', background:'linear-gradient(135deg,#28a745,#1e7e34)' }}>
              {loading ? 'Création...' : <><i className="bi bi-check-circle"></i> Créer mon compte prestataire</>}
            </button>
          </form>
          <hr />
          <div className="text-center">
            <p className="text-muted mb-2">Vous êtes client ?</p>
            <Link to="/inscription-client" className="btn-outline-primary-custom btn-sm-custom">
              <i className="bi bi-person-plus"></i> Créer un compte client
            </Link>
          </div>
          <div className="text-center mt-3">
            <p className="text-muted mb-0" style={{ fontSize:'0.9rem' }}>
              Déjà inscrit ? <Link to="/login">Se connecter</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}