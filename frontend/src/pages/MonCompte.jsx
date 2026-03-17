import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function MonCompte() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  if (!user) return null;
  const handleLogout = () => { logout(); navigate('/'); };
  const typeBadge = { prestataire:{ cls:'badge-success', label:'Prestataire' }, client:{ cls:'badge-primary', label:'Client' }, admin:{ cls:'badge-warning', label:'Admin' } }[user.type_compte] || { cls:'badge-secondary', label:user.type_compte };
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
              <hr />
              <div style={{ display:'flex', gap:12, marginBottom:0 }}>
                <div style={{ flex:1 }}><Field label="Prénom" value={user.first_name} /></div>
                <div style={{ flex:1 }}><Field label="Nom" value={user.last_name} /></div>
              </div>
              <Field label="Email" value={user.email} icon="envelope" />
              <Field label="Téléphone" value={user.telephone} icon="telephone" />
              <Field label="Adresse" value={user.adresse} icon="geo-alt" />
              <hr />
              <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                {user.type_compte === 'prestataire' && <Link to="/dashboard" className="btn-primary-custom" style={{ justifyContent:'center', padding:'12px' }}><i className="bi bi-speedometer2"></i> Mon Dashboard</Link>}
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