import { useState, useEffect } from 'react';
import DataTable from '../components/DataTable';
import SearchFilter from '../components/SearchFilter';
import ConfirmModal from '../components/ConfirmModal';
import crudService from '../utils/crudService';

export default function ReservationsCRUD() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [statusModal, setStatusModal] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    loadReservations();
  }, []);

  const loadReservations = async () => {
    setLoading(true);
    const result = await crudService.list('reservations');
    if (result.success) {
      setItems(result.data);
    } else {
      setError(result.error);
    }
    setLoading(false);
  };

  const handleSearch = async (query) => {
    if (!query) {
      loadReservations();
      return;
    }
    const result = await crudService.list('reservations', { search: query });
    if (result.success) setItems(result.data);
  };

  const handleStatusChange = (item) => {
    setStatusModal(item);
    setNewStatus(item.statut || 'pending');
  };

  const handleUpdateStatus = async () => {
    setUpdating(true);
    const result = await crudService.update('reservations', statusModal.id, { statut: newStatus });
    if (result.success) {
      setSuccess('Statut mis à jour');
      loadReservations();
      setStatusModal(null);
    } else {
      setError(result.error?.detail || 'Erreur de mise à jour');
    }
    setUpdating(false);
  };

  const handleDelete = async (id) => {
    const result = await crudService.delete('reservations', id);
    if (result.success) {
      setSuccess('Réservation supprimée');
      loadReservations();
    } else {
      setError(result.error?.detail || 'Erreur de suppression');
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      'pending': 'badge-warning',
      'confirme': 'badge-success',
      'completed': 'badge-info',
      'cancelled': 'badge-danger',
      'echoue': 'badge-danger'
    };
    return (
      <span className={`badge ${statusMap[status] || 'badge-secondary'}`}>
        {status}
      </span>
    );
  };

  const columns = [
    { label: 'Service', path: 'service.nom', width: '25%', type: 'truncate' },
    { label: 'Client', path: 'client.user.username', width: '20%' },
    { label: 'Montant (FCFA)', key: 'montant', width: '15%', type: 'number' },
    { 
      label: 'Statut', 
      key: 'statut', 
      width: '20%',
      render: (item) => getStatusBadge(item.statut)
    },
    { 
      label: 'Évaluation', 
      key: 'evaluation', 
      width: '15%',
      render: (item) => (
        item.evaluation ? (
          <span className="badge badge-info">
            {item.evaluation.note}⭐
          </span>
        ) : (
          <span className="text-muted">—</span>
        )
      )
    },
  ];

  return (
    <div className="py-5">
      <div className="container">
        <div className="page-header">
          <h2><i className="bi bi-calendar-check text-primary me-2"></i>Gestion des Réservations</h2>
          <p className="text-muted">Suivre et gérer toutes les réservations</p>
        </div>

        {error && <div className="alert alert-danger"><i className="bi bi-exclamation-circle me-2"></i>{error}</div>}
        {success && <div className="alert alert-success"><i className="bi bi-check-circle me-2"></i>{success}</div>}

        <SearchFilter onSearch={handleSearch} />

        <div className="card-custom">
          <div className="card-header-custom">
            <i className="bi bi-list-ul text-primary me-2"></i>Réservations ({items.length})
          </div>
          <div className="card-body-custom">
            <DataTable
              columns={columns}
              data={items}
              onDelete={handleDelete}
              onAction={(item, action) => {
                if (action === 'status') handleStatusChange(item);
              }}
              actions={[
                { key: 'status', label: 'Changer statut', icon: 'pencil', color: 'warning' }
              ]}
              isLoading={loading}
            />
          </div>
        </div>

        {statusModal && (
          <ConfirmModal
            title="Changer le statut"
            message={
              <div>
                <select 
                  value={newStatus} 
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="form-control-custom"
                >
                  <option value="pending">En attente</option>
                  <option value="confirme">Confirmée</option>
                  <option value="completed">Complétée</option>
                  <option value="cancelled">Annulée</option>
                </select>
              </div>
            }
            onConfirm={handleUpdateStatus}
            onCancel={() => setStatusModal(null)}
            isLoading={updating}
          />
        )}
      </div>
    </div>
  );
}
