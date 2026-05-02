import { useState, useEffect } from 'react';
import api from '../api/axios';
import ConfirmModal from '../components/ConfirmModal';

export default function AdminAllReservations() {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteModal, setDeleteModal] = useState(null);

  useEffect(() => {
    loadReservations();
  }, []);

  const loadReservations = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/admin/all_reservations/');
      setReservations(res.data || []);
    } catch (err) {
      console.error('Error loading reservations:', err);
      setError(err.response?.data?.detail || 'Erreur lors du chargement des réservations');
    } finally {
      setLoading(false);
    }
  };

const handleDelete = async () => {
    if (!deleteModal) return;
    try {
      await api.delete(`/admin/delete-reservation/?id=${deleteModal.id}`);
      setReservations(prev => prev.filter(r => r.id !== deleteModal.id));
      setDeleteModal(null);
    } catch (err) {
      alert(err.response?.data?.detail || 'Erreur lors de la suppression');
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'confirmee':
      case 'terminee':
        return 'success';
      case 'payee':
      case 'en_attente':
        return 'warning';
      case 'annulee':
        return 'danger';
      default:
        return 'secondary';
    }
  };

  if (loading) {
    return (
      <div className="admin-page">
        <div className="admin-container">
          <div className="admin-loading">
            <div className="admin-loading-spinner"></div>
            <p className="admin-loading-text">Chargement des réservations...</p>
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
              <i className="bi bi-calendar-check"></i>
              Toutes les Réservations
            </h1>
            <p>Gérez toutes les réservations du système</p>
          </div>
          <div className="admin-alert admin-alert-danger">
            <i className="bi bi-exclamation-triangle"></i>
            <span>{error}</span>
            <button onClick={loadReservations} className="btn btn-sm btn-outline-danger ms-auto">
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
            <i className="bi bi-calendar-check"></i>
            Toutes les Réservations
          </h1>
          <p>Gérez toutes les réservations du système</p>
        </div>

        <div className="admin-card">
          <div className="admin-card-header">
            <h2 className="admin-card-title">
              <i className="bi bi-list-ul"></i> Réservations ({reservations.length})
            </h2>
          </div>
          <div className="admin-card-body">
            {reservations.length === 0 ? (
              <div className="admin-empty">
                <div className="admin-empty-icon">
                  <i className="bi bi-calendar-x"></i>
                </div>
                <p className="admin-empty-title">Aucune réservation</p>
                <p className="admin-empty-text">Aucune réservation trouvée dans le système</p>
              </div>
            ) : (
              <div className="admin-table-wrapper">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Service</th>
                      <th>Prestataire</th>
                      <th>Client</th>
                      <th>Date</th>
                      <th>Montant</th>
                      <th>Statut</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reservations.map(r => (
                      <tr key={r.id}>
                        <td><strong>{r.service?.nom || '-'}</strong></td>
                        <td>{r.service?.prestataire?.user?.username || '-'}</td>
                        <td>{r.client?.user?.username || '-'}</td>
                        <td>{r.date_res ? new Date(r.date_res).toLocaleDateString('fr-FR') : '-'}</td>
                        <td><strong>{r.montant} F</strong></td>
                        <td>
                          <span className={`admin-badge ${getStatusBadgeClass(r.statut)}`}>
                            {r.statut}
                          </span>
                        </td>
                        <td>
                          <div className="table-actions">
                            <button 
                              className="table-action-btn delete" 
                              onClick={() => setDeleteModal({ id: r.id, name: r.service?.nom })}
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
            title="Supprimer la réservation"
            message={`Êtes-vous sûr de vouloir supprimer la réservation "${deleteModal.name}"? Cette action est irréversible.`}
            onConfirm={handleDelete}
            onCancel={() => setDeleteModal(null)}
          />
        )}
      </div>
    </div>
  );
}
