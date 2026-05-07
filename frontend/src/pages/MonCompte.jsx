import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

export default function MonCompte() {
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({ first_name:'', last_name:'', email:'', telephone:'', adresse:'' });
  const [passwordForm, setPasswordForm] = useState({ current_password:'', new_password:'', confirm_password:'' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (user) {
      setForm({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
        telephone: user.telephone || '',
        adresse: user.adresse || '',
      });
    }
  }, [user]);

  if (!user) return null;

  const handleLogout = () => { logout(); navigate('/'); };

  const typeBadge = {
    prestataire:{ cls:'badge-success', label:'Prestataire' },
    client:{ cls:'badge-primary', label:'Client' },
    admin:{ cls:'badge-warning', label:'Admin' }
  }[user.type_compte] || { cls:'badge-secondary', label:user.type_compte };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e) => {
    setPasswordForm({ ...passwordForm, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    setSuccess('');
    try {
      const res = await api.patch('/comptes/me/', form);
      updateUser(res.data);
      setSuccess('Profil mis à jour avec succès');
      setEditMode(false);
    } catch (err) {
      setErrors(err.response?.data || {});
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setSuccess('');
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      setErrors({ password: 'Les mots de passe ne correspondent pas' });
      return;
    }
    setLoading(true);
    try {
      await api.post('/auth/password_change/', {
        old_password: passwordForm.current_password,
        new_password: passwordForm.new_password,
      });
      setSuccess('Mot de passe modifié avec succès');
      setPasswordForm({ current_password:'', new_password:'', confirm_password:'' });
      setShowPassword(false);
    } catch (err) {
      setErrors(err.response?.data || { password: 'Erreur lors du changement de mot de passe' });
    } finally {
      setLoading(false);
    }
  };

  const Field = ({ label, value, icon }) => (
    <div className="mb-3">
      <label className="form-label">{label}</label>
      <div className="input-group">
        {icon && <span className="input-group-text"><i className={`bi bi-${icon}`}></i></span>}
        <input type="text" className="form-control" value={value || 'Non défini'} readOnly />
      </div>
    </div>
  );

  return (
    <div className="py-5">
      <div className="container">
        <div style={{ display:'flex', justifyContent:'center' }}>
          <div style={{ width:'100%', maxWidth:600 }}>
            <div className="form-custom">
              <div style={{ textAlign:'center', marginBottom:24 }}>
                <div className="avatar avatar-lg" style={{ margin:'0 auto 16px', width:80, height:80, fontSize:'2rem' }}>
                  {user.username?.[0]?.toUpperCase()}
                </div>
                <h2 style={{ fontWeight:800 }}>{user.username}</h2>
                <span className={`badge ${typeBadge.cls}`} style={{ fontSize:'0.9rem', padding:'6px 14px' }}>{typeBadge.label}</span>
              </div>

              {success && <div className="alert alert-success"><i className="bi bi-check-circle me-2"></i>{success}</div>}
              {errors.non_field_errors && <div className="alert alert-danger">{errors.non_field_errors}</div>}

              {editMode ? (
                <form onSubmit={handleSubmit}>
                  <div style={{ display:'flex', gap:12, marginBottom:0 }}>
                    <div style={{ flex:1 }}>
                      <label className="form-label">Prénom</label>
                      <input type="text" className="form-control" name="first_name" value={form.first_name} onChange={handleChange} />
                      {errors.first_name && <div className="error-text">{errors.first_name}</div>}
                    </div>
                    <div style={{ flex:1 }}>
                      <label className="form-label">Nom</label>
                      <input type="text" className="form-control" name="last_name" value={form.last_name} onChange={handleChange} />
                      {errors.last_name && <div className="error-text">{errors.last_name}</div>}
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Email</label>
                    <input type="email" className="form-control" name="email" value={form.email} onChange={handleChange} />
                    {errors.email && <div className="error-text">{errors.email}</div>}
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Téléphone</label>
                    <input type="text" className="form-control" name="telephone" value={form.telephone} onChange={handleChange} />
                    {errors.telephone && <div className="error-text">{errors.telephone}</div>}
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Adresse</label>
                    <textarea className="form-control" name="adresse" value={form.adresse} onChange={handleChange} rows={2} />
                    {errors.adresse && <div className="error-text">{errors.adresse}</div>}
                  </div>
                  <div style={{ display:'flex', gap:12 }}>
                    <button type="button" onClick={() => setEditMode(false)} className="btn-secondary-custom" style={{ flex:1, justifyContent:'center' }}>
                      <i className="bi bi-x-circle"></i> Annuler
                    </button>
                    <button type="submit" className="btn-primary-custom" disabled={loading} style={{ flex:1, justifyContent:'center' }}>
                      {loading ? 'Enregistrement...' : <><i className="bi bi-check-circle"></i> Enregistrer</>}
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  <hr />
                  <div style={{ display:'flex', gap:12, marginBottom:0 }}>
                    <div style={{ flex:1 }}><Field label="Prénom" value={user.first_name} /></div>
                    <div style={{ flex:1 }}><Field label="Nom" value={user.last_name} /></div>
                  </div>
                  <Field label="Email" value={user.email} icon="envelope" />
                  <Field label="Téléphone" value={user.telephone} icon="telephone" />
                  <Field label="Adresse" value={user.adresse} icon="geo-alt" />
                  <hr />
                  <button onClick={() => setEditMode(true)} className="btn-primary-custom" style={{ justifyContent:'center', padding:'12px', width:'100%', marginBottom:12 }}>
                    <i className="bi bi-pencil-square"></i> Modifier mon profil
                  </button>
                </>
              )}

              {/* Changer mot de passe */}
              <div style={{ marginTop:24 }}>
                <button onClick={() => setShowPassword(!showPassword)} className="btn-outline-primary-custom" style={{ justifyContent:'center', padding:'10px', width:'100%' }}>
                  <i className={`bi bi-${showPassword ? 'eye-slash' : 'key'}`}></i> {showPassword ? 'Masquer' : 'Changer le mot de passe'}
                </button>
                {showPassword && (
                  <form onSubmit={handlePasswordSubmit} style={{ marginTop:16 }}>
                    {errors.password && <div className="alert alert-danger">{errors.password}</div>}
                    <div className="mb-3">
                      <label className="form-label">Mot de passe actuel</label>
                      <input type="password" className="form-control" name="current_password" value={passwordForm.current_password} onChange={handlePasswordChange} required />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Nouveau mot de passe</label>
                      <input type="password" className="form-control" name="new_password" value={passwordForm.new_password} onChange={handlePasswordChange} required />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Confirmer le nouveau mot de passe</label>
                      <input type="password" className="form-control" name="confirm_password" value={passwordForm.confirm_password} onChange={handlePasswordChange} required />
                    </div>
                    <button type="submit" className="btn-primary-custom" disabled={loading} style={{ justifyContent:'center', width:'100%' }}>
                      {loading ? 'Changement...' : <><i className="bi bi-check-circle"></i> Changer le mot de passe</>}
                    </button>
                  </form>
                )}
              </div>

              <hr />
              <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                {user.type_compte === 'prestataire' && <Link to="/prestataire-dashboard" className="btn-primary-custom" style={{ justifyContent:'center', padding:'12px' }}><i className="bi bi-speedometer2"></i> Analytics Dashboard</Link>}
                {user.type_compte === 'client' && <Link to="/mes-reservations" className="btn-primary-custom" style={{ justifyContent:'center', padding:'12px' }}><i className="bi bi-calendar-check"></i> Mes Réservations</Link>}
                {(user.is_staff || user.type_compte === 'admin') && <Link to="/admin-dashboard" className="btn-primary-custom" style={{ justifyContent:'center', padding:'12px' }}><i className="bi bi-speedometer2"></i> Admin Dashboard</Link>}
                <button onClick={handleLogout} className="btn-outline-danger-custom" style={{ justifyContent:'center', padding:'12px' }}>
                  <i className="bi bi-box-arrow-right"></i> Déconnexion
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

