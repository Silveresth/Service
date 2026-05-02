import { useState, useEffect } from 'react';
import DataTable from '../components/DataTable';
import FormBuilder from '../components/FormBuilder';
import SearchFilter from '../components/SearchFilter';
import crudService from '../utils/crudService';

export default function AteliersCRUD() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    loadAteliers();
  }, []);

  const loadAteliers = async () => {
    setLoading(true);
    const result = await crudService.action('ateliers', null, 'mes_ateliers', 'get');
    if (result.success) {
      setItems(result.data);
    } else if (result.status === 403) {
      setError("Vous devez être prestataire pour créer des ateliers");
    } else {
      setError(result.error);
    }
    setLoading(false);
  };

  const handleSearch = async (query) => {
    if (!query) {
      loadAteliers();
      return;
    }
    const result = await crudService.list('ateliers', { search: query });
    if (result.success) setItems(result.data);
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setShowForm(true);
  };

  const handleSubmit = async (formData) => {
    setSubmitting(true);
    setError(null);
    setSuccess(null);

    let result;
    if (editingItem) {
      result = await crudService.update('ateliers', editingItem.id, formData);
    } else {
      result = await crudService.create('ateliers', formData);
    }

    if (result.success) {
      setSuccess(editingItem ? 'Atelier modifié' : 'Atelier créé');
      setShowForm(false);
      setEditingItem(null);
      loadAteliers();
    } else {
      setError(result.error?.detail || 'Erreur');
    }
    setSubmitting(false);
  };

  const handleDelete = async (id) => {
    const result = await crudService.delete('ateliers', id);
    if (result.success) {
      setSuccess('Atelier supprimé');
      loadAteliers();
    } else {
      setError(result.error?.detail || 'Erreur de suppression');
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingItem(null);
  };

  const columns = [
    { label: 'Nom', key: 'nom', width: '25%', type: 'truncate' },
    { label: 'Adresse', key: 'adresse', width: '30%', type: 'truncate' },
    { label: 'Téléphone', key: 'telephone', width: '15%' },
    { 
      label: 'Actif', 
      key: 'est_actif', 
      width: '15%',
      render: (item) => (
        <span className={`badge ${item.est_actif ? 'badge-success' : 'badge-secondary'}`}>
          {item.est_actif ? 'Actif' : 'Inactif'}
        </span>
      )
    },
  ];

  const fields = [
    { name: 'nom', label: 'Nom de l\'atelier', type: 'text', required: true },
    { name: 'adresse', label: 'Adresse complète', type: 'textarea', required: true },
    { name: 'telephone', label: 'Numéro de téléphone', type: 'text', required: true, pattern: '^[0-9]{8,15}$' },
    { name: 'latitude', label: 'Latitude (ex: 6.125580)', type: 'number', required: true },
    { name: 'longitude', label: 'Longitude (ex: 1.232456)', type: 'number', required: true },
    { name: 'description', label: 'Description (optionnel)', type: 'textarea', required: false },
    { 
      name: 'est_actif', 
      label: 'Atelier actif', 
      type: 'select',
      options: [
        { value: 'true', label: 'Oui' },
        { value: 'false', label: 'Non' }
      ]
    },
  ];

  return (
    <div className="py-5">
      <div className="container">
        <div className="page-header">
          <h2><i className="bi bi-shop text-primary me-2"></i>Gestion des Ateliers</h2>
          <p className="text-muted">Créer, modifier et gérer vos ateliers</p>
        </div>

        {error && <div className="alert alert-danger"><i className="bi bi-exclamation-circle me-2"></i>{error}</div>}
        {success && <div className="alert alert-success"><i className="bi bi-check-circle me-2"></i>{success}</div>}

        {showForm ? (
          <FormBuilder
            title={editingItem ? 'Modifier un atelier' : 'Créer un atelier'}
            fields={fields}
            initialData={editingItem || {}}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isLoading={submitting}
          />
        ) : (
          <div>
            <div style={{ marginBottom: '20px' }}>
              <button onClick={() => setShowForm(true)} className="btn-primary-custom">
                <i className="bi bi-plus-circle"></i> Ajouter un atelier
              </button>
            </div>

            <SearchFilter onSearch={handleSearch} />

            <div className="card-custom">
              <div className="card-header-custom">
                <i className="bi bi-list-ul text-primary me-2"></i>Ateliers ({items.length})
              </div>
              <div className="card-body-custom">
                <DataTable
                  columns={columns}
                  data={items}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  isLoading={loading}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
