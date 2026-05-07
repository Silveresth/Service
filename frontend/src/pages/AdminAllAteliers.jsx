import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import '../styles/admin.css';
import DataTable from '../components/DataTable';

export default function AdminAllAteliers() {
  const [ateliers, setAteliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);

  useEffect(() => {
    api.get('/admin/all_ateliers/')
      .then(res => setAteliers(res.data || []))
      .catch(err => setError('Erreur chargement ateliers'))
      .finally(() => setLoading(false));
  }, []);

  const deleteSelected = () => {
    if (selectedIds.length === 0) return;
    if (!window.confirm(`Supprimer ${selectedIds.length} atelier(s)?`)) return;
    
    Promise.all(selectedIds.map(id => api.delete('/admin/delete-atelier/', { data: { id } })))
      .then(() => setAteliers(ateliers.filter(a => !selectedIds.includes(a.id))))
      .finally(() => setSelectedIds([]));
  };

  const columns = [
    { key: 'nom', label: 'Atelier', render: a => <strong>{a.nom}</strong> },
    { key: 'adresse', label: 'Adresse', render: a => a.adresse.substring(0, 50) + '...' },
    { key: 'prestataire', label: 'Prestataire', render: a => a.prestataire?.user?.username || 'N/A' },
    { key: 'latitude', label: 'Coordonnées', render: a => `${a.latitude}, ${a.longitude}` },
    { key: 'est_actif', label: 'Statut', render: a => (
      <span className={`admin-badge ${a.est_actif ? 'success' : 'secondary'}`}>
        {a.est_actif ? 'Actif' : 'Inactif'}
      </span>
    )},
    { key: 'actions', label: 'Actions', render: a => (
      <div className="table-actions">

        <button onClick={() => {
          if (window.confirm('Supprimer cet atelier?')) {
            api.delete('/admin/delete-atelier/', { data: { id: a.id } })
              .then(() => setAteliers(ateliers.filter(item => item.id !== a.id)));
          }
        }} className="table-action-btn delete" title="Supprimer">
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
          <p className="admin-loading-text">Chargement des ateliers...</p>
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
            <h1><i className="bi bi-geo-alt"></i> Tous les Ateliers ({ateliers.length})</h1>
            <p>Gérez les ateliers et localisations prestataires</p>
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
              <i className="bi bi-list-ul"></i> Liste des ateliers
            </h2>
          </div>
          <div className="admin-card-body">
            <div className="admin-table-wrapper">
              <DataTable
                data={ateliers}
                columns={columns}
                selectedIds={selectedIds}
                onSelectionChange={setSelectedIds}
                searchPlaceholder="Rechercher atelier..."
                emptyMessage="Aucun atelier trouvé"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

