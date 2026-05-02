import { useState, useEffect } from 'react';
import api from '../api/axios';
import ConfirmModal from '../components/ConfirmModal';

export default function AdminAllServices() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteModal, setDeleteModal] = useState(null);

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/admin/all_services/');
      setServices(res.data || []);
    } catch (err) {
      console.error('Error loading services:', err);
      setError(err.response?.data?.detail || 'Erreur lors du chargement des services');
    } finally {
      setLoading(false);
    }
  };

const handleDelete = async () => {
    if (!deleteModal) return;
    try {
      await api.delete(`/admin/delete-service/?id=${deleteModal.id}`);
      setServices(prev => prev.filter(s => s.id !== deleteModal.id));
      setDeleteModal(null);
    } catch (err) {
      alert(err.response?.data?.detail || 'Erreur lors de la suppression');
    }
  };

  if (loading) {
    return (
      <div className="admin-page">
        <div className="admin-container">
          <div className="admin-loading">
            <div className="admin-loading-spinner"></div>
            <p className="admin-loading-text">Chargement des services...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-page">
        <div className="admin-container">
          <div className="admin-header">
            <h1>
              <i className="bi bi-briefcase"></i>
              Tous les Services
            </h1>
            <p>Gérez tous les services du système</p>
          </div>
          <div className="admin-alert admin-alert-danger">
            <i className="bi bi-exclamation-triangle"></i>
            <span>{error}</span>
            <button onClick={loadServices} className="btn btn-sm btn-outline-danger ms-auto">
              Réessayer
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="admin-container">
        <div className="admin-header">
          <h1>
            <i className="bi bi-briefcase"></i>
            Tous les Services
          </h1>
          <p>Gérez tous les services du système</p>
        </div>

        <div className="admin-card">
          <div className="admin-card-header">
            <h2 className="admin-card-title">
              <i className="bi bi-list-ul"></i> Services ({services.length})
            </h2>
          </div>
          <div className="admin-card-body">
            {services.length === 0 ? (
              <div className="admin-empty">
                <div className="admin-empty-icon">
                  <i className="bi bi-inbox"></i>
                </div>
                <p className="admin-empty-title">Aucun service</p>
                <p className="admin-empty-text">Aucun service trouvé dans le système</p>
              </div>
            ) : (
              <div className="admin-table-wrapper">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Nom</th>
                      <th>Catégorie</th>
                      <th>Prestataire</th>
                      <th>Prix</th>
                      <th>Statut</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {services.map(s => (
                      <tr key={s.id}>
                        <td><strong>{s.nom}</strong></td>
                        <td><span className="admin-badge info">{s.categorie?.nom || '-'}</span></td>
                        <td>{s.prestataire?.user?.username || '-'}</td>
                        <td><strong>{s.prix} F</strong></td>
                        <td>
                          <span className={`admin-badge ${s.est_actif ? 'success' : 'secondary'}`}>
                            {s.est_actif ? 'Actif' : 'Inactif'}
                          </span>
                        </td>
                        <td>
                          <div className="table-actions">
                            <button 
                              className="table-action-btn delete" 
                              onClick={() => setDeleteModal({ id: s.id, name: s.nom })}
                              title="Supprimer"
                            >
                              <i className="bi bi-trash"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {deleteModal && (
          <ConfirmModal
            title="Supprimer le service"
            message={`Êtes-vous sûr de vouloir supprimer le service "${deleteModal.name}"? Cette action est irréversible.`}
            onConfirm={handleDelete}
            onCancel={() => setDeleteModal(null)}
          />
        )}
      </div>
    </div>
  );
}
