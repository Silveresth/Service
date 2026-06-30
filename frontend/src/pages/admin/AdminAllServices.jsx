import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import '../styles/admin.css';
import DataTable from '../components/DataTable';
import ConfirmModal from '../components/ConfirmModal';

export default function AdminAllServices() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [deleteModal, setDeleteModal] = useState(null);

  useEffect(() => {
    api.get('/admin/all_services/')
      .then(res => {
        setServices(res.data || []);
      })
      .catch(err => setError('Erreur chargement services'))
      .finally(() => setLoading(false));
  }, []);

  const deleteSelected = () => {
    if (selectedIds.length === 0) return;
    setDeleteModal({
      title: 'Confirmer suppression multiple',
      message: `Êtes-vous sûr de vouloir supprimer ${selectedIds.length} service(s) ? Cette action est irréversible.`,
      onConfirm: () => {
        Promise.all(selectedIds.map(id => api.delete(`/admin/delete-service/`, { data: { id } })))
          .then(() => {
            setServices(services.filter(s => !selectedIds.includes(s.id)));
            setSelectedIds([]);
            setDeleteModal(null);
          })
          .catch(err => {
            console.error('Erreur suppression:', err);
            alert('Erreur lors de la suppression');
            setDeleteModal(null);
          });
      },
      onCancel: () => setDeleteModal(null)
    });
  };

  const handleSingleDeleteConfirm = () => {
    if (!deleteModal) return;
    api.delete('/admin/delete-service/', { data: { id: deleteModal.id } })
      .then(() => {
        setServices(services.filter(s => s.id !== deleteModal.id));
        setDeleteModal(null);
      })
      .catch(err => {
        console.error('Erreur suppression:', err);
        alert('Erreur lors de la suppression');
        setDeleteModal(null);
      });
  };

  const columns = [
    { key: 'nom', label: 'Service', render: s => <strong>{s.nom}</strong> },
    { key: 'prix', label: 'Prix', render: s => `${s.prix} FCFA` },
    { key: 'prestataire_nom', label: 'Prestataire', render: s => s.prestataire_nom || 'N/A' },
    { key: 'categorie', label: 'Catégorie', render: s => s.categorie?.nom || '-' },
    { key: 'disponibilite', label: 'Statut', render: s => (
      <span className={`admin-badge ${s.disponibilite ? 'success' : 'secondary'}`}>
        {s.disponibilite ? 'Actif' : 'Inactif'}
      </span>
    )},
    { key: 'actions', label: 'Actions', render: s => (
        <div className="table-actions">

          <button onClick={() => setDeleteModal({
            title: 'Confirmer suppression',
            message: `Êtes-vous sûr de vouloir supprimer "${s.nom}" ? Cette action est irréversible.`,
            id: s.id,
            onConfirm: handleSingleDeleteConfirm,
            onCancel: () => setDeleteModal(null)
          })} className="table-action-btn delete" title="Supprimer">
            <i className="bi bi-trash"></i>
          </button>
        </div>
    )}
  ];

  if (loading) return (
    <div className="admin-page">
      <div className="admin-container">
        <div className="admin-loading">
          <div className="admin-loading-spinner"></div>
          <p className="admin-loading-text">Chargement des services...</p>
        </div>
      </div>
    </div>
  );
  if (error) return (
    <div className="admin-page">
      <div className="admin-container">
        <div className="admin-alert admin-alert-danger">
          <i className="bi bi-exclamation-triangle me-2"></i>
          {error}
          <button onClick={() => window.location.reload()} className="btn btn-sm btn-outline-danger ms-auto">
            Réessayer
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="admin-page">
      <div className="admin-container">
        {/* Header */}
        <div className="admin-header">
          <div>
            <h1><i className="bi bi-briefcase"></i> Tous les Services ({services.length})</h1>
            <p>Gérez tous les services de la plateforme</p>
          </div>
          <div className="admin-header-actions">
            {selectedIds.length > 0 && (
              <button onClick={deleteSelected} className="btn-danger-custom me-2">
                <i className="bi bi-trash"></i> Supprimer ({selectedIds.length})
              </button>
            )}
          </div>
        </div>

        {/* Table Card */}
        <div className="admin-card">
          <div className="admin-card-header">
            <h2 className="admin-card-title">
              <i className="bi bi-list-ul"></i> Liste des services
            </h2>
          </div>
          <div className="admin-card-body">
            <div className="admin-table-wrapper">
              <DataTable
                data={services}
                columns={columns}
                selectedIds={selectedIds}
                onSelectionChange={setSelectedIds}
                searchPlaceholder="Rechercher service..."
                emptyMessage="Aucun service trouvé"
              />
            </div>
          </div>
        </div>
        {deleteModal && (
          <ConfirmModal
            title={deleteModal.title}
            message={deleteModal.message}
            onConfirm={deleteModal.onConfirm || handleSingleDeleteConfirm}
            onCancel={() => setDeleteModal(null)}
          />
        )}
      </div>
    </div>
  );
}

