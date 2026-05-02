import { useState, useEffect } from 'react';
import DataTable from '../components/DataTable';
import FormBuilder from '../components/FormBuilder';
import SearchFilter from '../components/SearchFilter';
import crudService from '../utils/crudService';

export default function PrestatairesCRUD() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    loadPrestataires();
  }, []);

  const loadPrestataires = async () => {
    setLoading(true);
    const result = await crudService.list('prestataires', {});
    if (result.success) {
      setItems(result.data);
    } else {
      setError(result.error || "Erreur de chargement");
    }
    setLoading(false);
  };

  const handleSearch = async (query) => {
    if (!query) {
      loadPrestataires();
      return;
    }
    const result = await crudService.list('prestataires', { search: query });
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
      result = await crudService.update('prestataires', editingItem.id, formData);
    } else {
      result = await crudService.create('prestataires', formData);
    }

    if (result.success) {
      setSuccess(editingItem ? 'Prestataire modifié' : 'Prestataire créé');
      setShowForm(false);
      setEditingItem(null);
      loadPrestataires();
    } else {
      setError(result.error?.detail || 'Erreur');
    }
    setSubmitting(false);
  };

  const handleDelete = async (id) => {
    const result = await crudService.delete('prestataires', id);
    if (result.success) {
      setSuccess('Prestataire supprimé');
      loadPrestataires();
    } else {
      setError(result.error?.detail || 'Erreur de suppression');
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingItem(null);
  };

  const columns = [
    { 
      label: 'Nom utilisateur', 
      key: 'username',
      width: '20%',
      render: (item) => item.user?.username || item.username || '-'
    },
    { 
      label: 'Email', 
      key: 'email',
      width: '25%',
      render: (item) => item.user?.email || item.email || '-'
    },
    { label: 'Spécialité', key: 'specialite', width: '20%' },
    { 
      label: 'Téléphone', 
      key: 'telephone',
      width: '15%',
      render: (item) => item.user?.telephone || item.telephone || '-'
    },
    { 
      label: 'Statut', 
      key: 'is_active',
      width: '10%',
      render: (item) => (
        <span className={`badge ${item.user?.is_active || item.is_active ? 'badge-success' : 'badge-secondary'}`}>
          {item.user?.is_active || item.is_active ? 'Actif' : 'Inactif'}
        </span>
      )
    },
  ];

  const fields = [
    { name: 'username', label: "Nom d'utilisateur", type: 'text', required: true },
    { name: 'email', label: 'Email', type: 'email', required: true },
    { name: 'telephone', label: 'Téléphone', type: 'text', required: true, pattern: '^[0-9]{8,15}$' },
    { name: 'specialite', label: 'Spécialité', type: 'text', required: true, placeholder: 'Ex: Plomberie, Electricité, Menuiserie' },
    { name: 'numero_flooz', label: 'Numéro Flooz (*155#)', type: 'text', required: false, placeholder: 'Ex: 97430290' },
    { name: 'numero_mix', label: 'Numéro Mix by Yas (*145#)', type: 'text', required: false, placeholder: 'Ex: 93354922' },
    { 
      name: 'is_active', 
      label: 'Compte actif', 
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
          <h2><i className="bi bi-person-badge text-primary me-2"></i>Gestion des Prestataires</h2>
          <p className="text-muted">Créer, modifier et gérer les prestataires de services</p>
        </div>

        {error && <div className="alert alert-danger"><i className="bi bi-exclamation-circle me-2"></i>{error}</div>}
        {success && <div className="alert alert-success"><i className="bi bi-check-circle me-2"></i>{success}</div>}

        {showForm ? (
          <FormBuilder
            title={editingItem ? 'Modifier un prestataire' : 'Créer un prestataire'}
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
                <i className="bi bi-plus-circle"></i> Ajouter un prestataire
              </button>
            </div>

            <SearchFilter onSearch={handleSearch} />

            <div className="card-custom">
              <div className="card-header-custom">
                <i className="bi bi-list-ul text-primary me-2"></i>Prestataires ({items.length})
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
