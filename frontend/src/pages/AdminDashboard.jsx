import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import '../styles/admin.css';
import AdminRapportPDF from '../components/AdminRapportPDF';

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
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = () => {
    setLoading(true);
    api.get('/admin/stats/')
      .then(r => {
        setStats(r.data);
        setError(null);
      })
      .catch(err => {
        console.error("Erreur admin stats:", err);
        setError("Impossible de récupérer les statistiques du serveur.");
      })
      .finally(() => setLoading(false));
  };

  // Composant interne pour les cartes de stats
  const StatCard = ({ label, value, icon, colorClass }) => (
    <div className="admin-stat-card">
      <div className={`admin-stat-icon ${colorClass}`}>
        <i className={`bi bi-${icon}`}></i>
      </div>
      <div className="admin-stat-content">
        <div className="admin-stat-value">{value ?? 0}</div>
        <div className="admin-stat-label">{label}</div>
      </div>
    </div>
  );

  // Composant interne pour les liens rapides
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
            <p className="admin-loading-text">Chargement des données sécurisées...</p>
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
          <div>
            <h1>
              <i className="bi bi-speedometer2"></i> Dashboard Administrateur
            </h1>
            <p>Vue d'ensemble de la plateforme <strong>Service Market</strong></p>
          </div>
          <div className="admin-header-actions">
            <a href={`${process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000'}/admin/`} target="_blank" rel="noopener noreferrer" className="btn-primary-custom">
              <i className="bi bi-gear-fill"></i> Base de données Django
            </a>
            <Link to="/" className="btn-outline-primary-custom">
              <i className="bi bi-house"></i> Retour au site
            </Link>
          </div>
        </div>

        {error && (
          <div className="alert alert-danger mb-4 d-flex justify-content-between align-items-center">
            <span><i className="bi bi-exclamation-triangle-fill me-2"></i> {error}</span>
            <button onClick={fetchStats} className="btn btn-sm btn-outline-danger">Réessayer</button>
          </div>
        )}

        {/* Stats Grid */}
        <div className="admin-stats-grid">
          <StatCard label="Utilisateurs" value={stats.total_comptes} icon="people" colorClass="primary" />
          <StatCard label="Services actifs" value={stats.total_services} icon="briefcase" colorClass="warning" />
          <StatCard label="Réservations" value={stats.total_reservations} icon="calendar-check" colorClass="success" />
          <StatCard label="Prestataires" value={stats.total_prestataires} icon="person-badge" colorClass="danger" />
        </div>

        {/* Quick Links - TOUTES LES OPTIONS ICI */}
        <div className="admin-quick-links">
          <QuickLink to="/admin/all-comptes" icon="people" title="Gestion Comptes" description="Activer, bloquer ou supprimer" />

          <QuickLink to="/admin/all-ateliers" icon="geo-alt" title="Gérer Ateliers" description="Localisations prestataires" />
          <QuickLink to="/admin/all-reservations" icon="clock-history" title="Flux Réservations" description="Historique complet" />
          <QuickLink to="/admin/all-paiements" icon="credit-card" title="Paiements" description="Toutes les transactions" />
          <QuickLink to="/admin/evaluations" icon="star" title="Évaluations" description="Avis et notes clients" />
          <QuickLink to="/admin/all-categories" icon="tags" title="Catégories" description="Gérer types de services" />
        </div>

        {/* Recent Sections */}
        <div className="admin-recent-section">
          
          {/* Comptes Récents */}
          <div className="admin-card">
            <div className="admin-card-header">
              <h2 className="admin-card-title"><i className="bi bi-person-plus"></i> Inscriptions récentes</h2>
            </div>
            <div className="admin-card-body">
              {stats.comptes?.length > 0 ? (
                <div className="admin-table-wrapper">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Utilisateur</th>
                        <th>Type</th>
                        <th>Statut</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.comptes.slice(0, 5).map(c => (
                        <tr key={c.id}>
                          <td className="fw-bold">{(`${c.first_name || ''} ${c.last_name || ''}`).trim() || c.username}<br/><small className="text-muted">@{c.username}</small></td>
                          <td>
                            <span className={`admin-badge ${c.type_compte === 'prestataire' ? 'success' : 'info'}`}>
                              {c.type_compte || 'Standard'}
                            </span>
                          </td>
                          <td>
                            <i className={`bi bi-circle-fill ${c.is_active ? 'text-success' : 'text-danger'}`} style={{ fontSize: '0.7rem' }}></i>
                            {c.is_active ? ' Actif' : ' Bloqué'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : <p className="text-muted text-center py-4">Aucun utilisateur enregistré.</p>}
            </div>
          </div>

          {/* Services Récents */}
          <div className="admin-card">
            <div className="admin-card-header">
              <h2 className="admin-card-title"><i className="bi bi-stars"></i> Derniers Services</h2>
            </div>
            <div className="admin-card-body">
              {stats.services?.length > 0 ? (
                <div className="admin-table-wrapper">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Service</th>
                        <th>Prix</th>
                        <th>Prestataire</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.services.slice(0, 5).map(s => (
                        <tr key={s.id}>
                          <td className="fw-bold">{s.nom}</td>
                          <td className="text-primary">{s.prix} F</td>
                          <td>{(`${s.prestataire?.user?.first_name || ''} ${s.prestataire?.user?.last_name || ''}`.trim() || s.prestataire?.user?.username) ?? 'Inconnu'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : <p className="text-muted text-center py-4">Aucun service disponible.</p>}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}