import { useState, useEffect } from 'react';
import api from '../api/axios';
import ConfirmModal from '../components/ConfirmModal';

export default function AdminAllAteliers() {
  const [ateliers, setAteliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteModal, setDeleteModal] = useState(null);

  useEffect(() => {
    loadAteliers();
  }, []);

  const loadAteliers = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/admin/all_ateliers/');
      setAteliers(res.data || []);
    } catch (err) {
      console.error('Error loading ateliers:', err);
      setError(err.response?.data?.detail || 'Erreur lors du chargement des ateliers');
    } finally {
      setLoading(false);
    }
  };

const handleDelete = async () => {
    if (!deleteModal) return;
    try {
      await api.delete(`/admin/delete-atelier/?id=${deleteModal.id}`);
      setAteliers(prev => prev.filter(a => a.id !== deleteModal.id));
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
            <p className="admin-loading-text">Chargement des ateliers...</p>
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
              <i className="bi bi-geo-alt"></i>
              Tous les Ateliers
            </h1>
            <p>Gérez tous les ateliers du système</p>
          </div>
          <div className="admin-alert admin-alert-danger">
            <i className="bi bi-exclamation-triangle"></i>
            <span>{error}</span>
            <button onClick={loadAteliers} className="btn btn-sm btn-outline-danger ms-auto">
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
            <i className="bi bi-geo-alt"></i>
            Tous les Ateliers
          </h1>
          <p>Gérez tous les ateliers du système</p>
        </div>

        <div className="admin-card">
          <div className="admin-card-header">
            <h2 className="admin-card-title">
              <i className="bi bi-list-ul"></i> Ateliers ({ateliers.length})
            </h2>
          </div>
          <div className="admin-card-body">
            {ateliers.length === 0 ? (
              <div className="admin-empty">
                <div className="admin-empty-icon">
                  <i className="bi bi-building"></i>
                </div>
                <p className="admin-empty-title">Aucun atelier</p>
                <p className="admin-empty-text">Aucun atelier trouvé dans le système</p>
              </div>
            ) : (
              <div className="admin-table-wrapper">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Nom</th>
                      <th>Prestataire</th>
                      <th>Adresse</th>
                      <th>Statut</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ateliers.map(a => (
                      <tr key={a.id}>
                        <td><strong>{a.nom}</strong></td>
                        <td>{a.prestataire?.user?.username || '-'}</td>
                        <td>{a.adresse || '-'}</td>
                        <td>
                          <span className={`admin-badge ${a.est_actif ? 'success' : 'secondary'}`}>
                            {a.est_actif ? 'Actif' : 'Inactif'}
                          </span>
                        </td>
                        <td>
                          <div className="table-actions">
                            <button 
                              className="table-action-btn delete" 
                              onClick={() => setDeleteModal({ id: a.id, name: a.nom })}
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
            title="Supprimer l'atelier"
            message={`Êtes-vous sûr de vouloir supprimer l'atelier "${deleteModal.name}"? Cette action est irréversible.`}
            onConfirm={handleDelete}
            onCancel={() => setDeleteModal(null)}
          />
        )}
      </div>
    </div>
  );
}
