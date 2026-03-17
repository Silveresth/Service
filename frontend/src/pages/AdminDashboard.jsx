import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ services:[], comptes:[], total_comptes:0, total_services:0, total_reservations:0, total_prestataires:0 });
  const [loading, setLoading] = useState(true);
  useEffect(() => { api.get('/admin/stats/').then(r => setStats(r.data)).catch(console.error).finally(() => setLoading(false)); }, []);

  const Stat = ({ label, value, icon, color }) => (
    <div style={{ flex:'0 0 25%', maxWidth:'25%', padding:'0 12px 24px' }}>
      <div className="dashboard-card">
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <div><p className="text-muted mb-1" style={{ fontSize:'0.85rem' }}>{label}</p><h3 style={{ fontWeight:800, margin:0 }}>{value}</h3></div>
          <div className="icon-box" style={{ background:color+'1a', color }}><i className={`bi bi-${icon}`}></i></div>
        </div>
      </div>
    </div>
  );

  if (loading) return <div style={{ textAlign:'center', padding:80 }}><i className="bi bi-hourglass-split" style={{ fontSize:'3rem', color:'var(--primary-color)' }}></i></div>;
  return (
    <div className="py-5">
      <div className="container">
        <div className="page-header">
          <h2><i className="bi bi-speedometer2 text-primary me-2"></i>Dashboard Administrateur</h2>
          <p className="text-muted">Gérez la plateforme Service Market.</p>
        </div>
        <div style={{ display:'flex', flexWrap:'wrap', margin:'0 -12px', marginBottom:24 }}>
          <Stat label="Total Comptes" value={stats.total_comptes} icon="people" color="#00a859" />
          <Stat label="Services" value={stats.total_services} icon="briefcase" color="#FF6B35" />
          <Stat label="Réservations" value={stats.total_reservations} icon="calendar-check" color="#1a1a2e" />
          <Stat label="Prestataires" value={stats.total_prestataires} icon="person-badge" color="#FF6B35" />
        </div>
        <div style={{ display:'flex', gap:12, marginBottom:24 }}>
          <a href="/admin/" className="btn-primary-custom"><i className="bi bi-gear"></i> Administration Django</a>
          <Link to="/" className="btn-outline-primary-custom"><i className="bi bi-house"></i> Voir le site</Link>
        </div>
        <div style={{ display:'flex', flexWrap:'wrap', margin:'0 -12px' }}>
          <div style={{ flex:'0 0 50%', maxWidth:'50%', padding:'0 12px 24px' }}>
            <div className="card-custom">
              <div className="card-header-custom"><i className="bi bi-briefcase text-primary"></i> Tous les Services</div>
              <div className="card-body-custom">
                {stats.services?.length > 0 ? (
                  <div className="table-responsive">
                    <table className="table-custom" style={{ width:'100%' }}>
                      <thead><tr><th>Nom</th><th>Prestataire</th><th>Prix</th><th>Status</th></tr></thead>
                      <tbody>
                        {stats.services.map(s => (
                          <tr key={s.id}>
                            <td>{s.nom}</td><td>{s.prestataire?.user?.username}</td><td>{s.prix} Fcfa</td>
                            <td><span className={`badge ${s.disponibilite?'badge-success':'badge-secondary'}`}>{s.disponibilite?'Actif':'Inactif'}</span></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : <p className="text-muted text-center">Aucun service.</p>}
              </div>
            </div>
          </div>
          <div style={{ flex:'0 0 50%', maxWidth:'50%', padding:'0 12px 24px' }}>
            <div className="card-custom">
              <div className="card-header-custom"><i className="bi bi-people text-primary"></i> Comptes récents</div>
              <div className="card-body-custom">
                {stats.comptes?.length > 0 ? (
                  <div className="table-responsive">
                    <table className="table-custom" style={{ width:'100%' }}>
                      <thead><tr><th>Utilisateur</th><th>Email</th><th>Type</th><th>Status</th></tr></thead>
                      <tbody>
                        {stats.comptes.map(c => (
                          <tr key={c.id}>
                            <td>{c.username}</td><td style={{ fontSize:'0.82rem' }}>{c.email}</td>
                            <td><span className={`badge ${c.type_compte==='prestataire'?'badge-success':c.type_compte==='client'?'badge-primary':'badge-warning'}`}>{c.type_compte||'admin'}</span></td>
                            <td><span className={`badge ${c.is_active?'badge-success':'badge-danger'}`}>{c.is_active?'Actif':'Inactif'}</span></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : <p className="text-muted text-center">Aucun compte.</p>}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}