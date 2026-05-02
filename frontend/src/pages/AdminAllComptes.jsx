import { useState, useEffect } from 'react';
import api from '../api/axios';
import ConfirmModal from '../components/ConfirmModal';

export default function AdminAllComptes() {
  const [comptes, setComptes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteModal, setDeleteModal] = useState(null);

  useEffect(() => {
    loadComptes();
  }, []);

  const loadComptes = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/admin/all_comptes/');
      setComptes(res.data || []);
    } catch (err) {
      console.error('Error loading comptes:', err);
      setError(err.response?.data?.detail || 'Erreur lors du chargement des comptes');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteModal) return;
    try {
      await api.delete(`/admin/delete-user/?id=${deleteModal.id}`);
      setComptes(prev => prev.filter(c => c.id !== deleteModal.id));
      setDeleteModal(null);
    } catch (err) {
      alert(err.response?.data?.detail || err.response?.data?.error || 'Erreur lors de la suppression');
    }
  };

  if (loading) {
    return (
      <div className="admin-page">
        <div className="admin-container">
          <div className="admin-loading">
            <div className="admin-loading-spinner"></div>
            <p className="admin-loading-text">Chargement des comptes...</p>
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
              <i className="bi bi-people"></i>
              Tous les Comptes
            </h1>
            <p>Gérez tous les comptes utilisateurs du système</p>
          </div>
          <div className="admin-alert admin-alert-danger">
            <i className="bi bi-exclamation-triangle"></i>
            <span>{error}</span>
            <button onClick={loadComptes} className="btn btn-sm btn-outline-danger ms-auto">
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
            <i className="bi bi-people"></i>
            Tous les Comptes
          </h1>
          <p>Gérez tous les comptes utilisateurs du système</p>
        </div>

        <div className="admin-card">
          <div className="admin-card-header">
            <h2 className="admin-card-title">
              <i className="bi bi-list-ul"></i> Comptes ({comptes.length})
            </h2>
          </div>
          <div className="admin-card-body">
            {comptes.length === 0 ? (
              <div className="admin-empty">
                <div className="admin-empty-icon">
                  <i className="bi bi-person-slash"></i>
                </div>
                <p className="admin-empty-title">Aucun compte</p>
                <p className="admin-empty-text">Aucun compte trouvé dans le système</p>
              </div>
            ) : (
              <div className="admin-table-wrapper">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Nom d'utilisateur</th>
                      <th>Email</th>
                      <th>Type</th>
                      <th>Admin</th>
                      <th>Date d'inscription</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {comptes.map(c => (
                      <tr key={c.id}>
                        <td><strong>#{c.id}</strong></td>
                        <td><strong>{c.username}</strong></td>
                        <td>{c.email || '-'}</td>
                        <td>
                          <span className={`admin-badge ${c.type_compte === 'prestataire' ? 'info' : c.type_compte === 'admin' ? 'warning' : 'success'}`}>
                            {c.type_compte || 'client'}
                          </span>
                        </td>
                        <td>
                          {c.is_staff || c.is_superuser ? (
                            <span className="admin-badge warning">Oui</span>
                          ) : (
                            <span className="admin-badge secondary">Non</span>
                          )}
                        </td>
                        <td>{c.date_joined ? new Date(c.date_joined).toLocaleDateString('fr-FR') : '-'}</td>
                        <td>
                          <div className="table-actions">
                            {(c.is_staff || c.is_superuser) ? (
                              <span title="Impossible de supprimer un administrateur" style={{ color: '#94a3b8', fontSize: '0.8rem' }}>
                                <i className="bi bi-lock"></i>
                              </span>
                            ) : (
                              <button 
                                className="table-action-btn delete" 
                                onClick={() => setDeleteModal({ id: c.id, name: c.username })}
                                title="Supprimer"
                              >
                                <i className="bi bi-trash"></i>
                              </button>
                            )}
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
            title="Supprimer le compte"
            message={`Êtes-vous sûr de vouloir supprimer le compte "${deleteModal.name}"? Cette action est irréversible et supprimera également toutes les données associées.`}
            onConfirm={handleDelete}
            onCancel={() => setDeleteModal(null)}
          />
        )}
      </div>
    </div>
  );
}
