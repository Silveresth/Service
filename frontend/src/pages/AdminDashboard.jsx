import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import '../styles/admin.css';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ 
    services: [], 
    comptes: [], 
    total_comptes: 0, 
    total_services: 0, 
    total_reservations: 0, 
    total_prestataires: 0 
  });
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    api.get('/admin/stats/')
      .then(r => setStats(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const StatCard = ({ label, value, icon, colorClass }) => (
    <div className="admin-stat-card">
      <div className={`admin-stat-icon ${colorClass}`}>
        <i className={`bi bi-${icon}`}></i>
      </div>
      <div className="admin-stat-content">
        <div className="admin-stat-value">{value}</div>
        <div className="admin-stat-label">{label}</div>
      </div>
    </div>
  );

  const QuickLink = ({ to, icon, title, description }) => (
    <Link to={to} className="admin-quick-link">
      <div className="admin-quick-link-icon">
        <i className={`bi bi-${icon}`}></i>
      </div>
      <div className="admin-quick-link-content">
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
    </Link>
  );

  if (loading) {
    return (
      <div className="admin-page">
        <div className="admin-container">
          <div className="admin-loading">
            <div className="admin-loading-spinner"></div>
            <p className="admin-loading-text">Chargement des statistiques...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="admin-container">
        {/* Header */}
        <div className="admin-header">
          <h1>
            <i className="bi bi-speedometer2"></i>
            Dashboard Administrateur
          </h1>
          <p>Gérez la plateforme Service Market</p>
          <div className="admin-header-actions">
            <a href="/admin/" className="btn-primary-custom">
              <i className="bi bi-gear"></i> Administration Django
            </a>
            <Link to="/" className="btn-outline-primary-custom">
              <i className="bi bi-house"></i> Voir le site
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="admin-stats-grid">
          <StatCard label="Total Comptes" value={stats.total_comptes} icon="people" colorClass="primary" />
          <StatCard label="Services" value={stats.total_services} icon="briefcase" colorClass="warning" />
          <StatCard label="Réservations" value={stats.total_reservations} icon="calendar-check" colorClass="success" />
          <StatCard label="Prestataires" value={stats.total_prestataires} icon="person-badge" colorClass="danger" />
        </div>

{/* Quick Links */}
        <div className="admin-quick-links">
          <QuickLink to="/admin/all-comptes" icon="people" title="Tous les Comptes" description="Gérer et supprimer les comptes" />
          <QuickLink to="/admin/all-services" icon="briefcase" title="Tous les Services" description="Gérer et supprimer les services" />
          <QuickLink to="/admin/all-reservations" icon="calendar-check" title="Toutes Réservations" description="Gérer toutes les réservations" />
          <QuickLink to="/admin/evaluations" icon="star" title="Évaluations" description="Surveiller les prestataires" />
          <QuickLink to="/admin/all-ateliers" icon="geo-alt" title="Tous les Ateliers" description="Gérer et supprimer les ateliers" />
        </div>

        {/* Recent Sections */}
        <div className="admin-recent-section">
          {/* Recent Accounts */}
          <div className="admin-card">
            <div className="admin-card-header">
              <h2 className="admin-card-title">
                <i className="bi bi-people"></i> Comptes récents
              </h2>
            </div>
            <div className="admin-card-body">
              {stats.comptes?.length > 0 ? (
                <div className="admin-table-wrapper">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Utilisateur</th>
                        <th>Type</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.comptes.slice(0, 5).map(c => (
                        <tr key={c.id}>
                          <td><strong>{c.username}</strong></td>
                          <td>
                            <span className={`admin-badge ${c.type_compte === 'prestataire' ? 'success' : c.type_compte === 'client' ? 'info' : 'warning'}`}>
                              {c.type_compte || 'admin'}
                            </span>
                          </td>
                          <td>
                            <span className={`admin-badge ${c.is_active ? 'success' : 'danger'}`}>
                              {c.is_active ? 'Actif' : 'Inactif'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="admin-empty">
                  <div className="admin-empty-icon">
                    <i className="bi bi-people"></i>
                  </div>
                  <p className="admin-empty-title">Aucun compte</p>
                  <p className="admin-empty-text">Aucun compte récent</p>
                </div>
              )}
            </div>
          </div>

          {/* Recent Services */}
          <div className="admin-card">
            <div className="admin-card-header">
              <h2 className="admin-card-title">
                <i className="bi bi-briefcase"></i> Services récents
              </h2>
            </div>
            <div className="admin-card-body">
              {stats.services?.length > 0 ? (
                <div className="admin-table-wrapper">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Service</th>
                        <th>Prestataire</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.services.slice(0, 5).map(s => (
                        <tr key={s.id}>
                          <td><strong>{s.nom}</strong></td>
                          <td>{s.prestataire?.user?.username || '-'}</td>
                          <td>
                            <span className={`admin-badge ${s.disponibilite ? 'success' : 'secondary'}`}>
                              {s.disponibilite ? 'Actif' : 'Inactif'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="admin-empty">
                  <div className="admin-empty-icon">
                    <i className="bi bi-briefcase"></i>
                  </div>
                  <p className="admin-empty-title">Aucun service</p>
                  <p className="admin-empty-text">Aucun service récent</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
