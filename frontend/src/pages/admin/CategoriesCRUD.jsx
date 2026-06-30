import { useState, useEffect } from 'react';
import DataTable from '../components/DataTable';
import FormBuilder from '../components/FormBuilder';
import SearchFilter from '../components/SearchFilter';
import crudService from '../utils/crudService';

export default function CategoriesCRUD() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    setLoading(true);
    const result = await crudService.list('categories');
    if (result.success) {
      setItems(result.data);
    } else {
      setError(typeof result.error === 'string' ? result.error : result.error || 'Erreur chargement');
    }
    setLoading(false);
  };

  const handleSearch = async (query) => {
    if (!query) {
      loadCategories();
      return;
    }
    const result = await crudService.list('categories', { search: query });
    if (result.success) setItems(result.data);
    else setError(typeof result.error === 'string' ? result.error : result.error || 'Erreur recherche');
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
      result = await crudService.update('categories', editingItem.id, formData);
    } else {
      result = await crudService.create('categories', formData);
    }

    if (result.success) {
      setSuccess(editingItem ? 'Catégorie modifiée' : 'Catégorie créée');
      setShowForm(false);
      setEditingItem(null);
      loadCategories();
    } else {
      setError(typeof result.error === 'string' ? result.error : result.error?.nom?.[0] || result.error?.detail || result.error || 'Erreur');
    }
    setSubmitting(false);
  };

  const handleDelete = async (id) => {
    const result = await crudService.delete('categories', id);
    if (result.success) {
      setSuccess('Catégorie supprimée');
      loadCategories();
    } else {
      setError(typeof result.error === 'string' ? result.error : result.error?.detail || result.error || 'Erreur de suppression');
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingItem(null);
  };

  const columns = [
    { label: 'Nom', key: 'nom', width: '60%' },
    { label: 'Icône', key: 'icone', width: '40%' },
  ];

  const fields = [
    { name: 'nom', label: 'Nom de la catégorie', type: 'text', required: true, placeholder: 'Ex: Plomberie' },
    { name: 'icone', label: 'Icône Bootstrap (ex: bi-lightbulb)', type: 'text', required: true, placeholder: 'Ex: bi-lightbulb' },
  ];

  return (
    <div className="py-5">
      <div className="container">
        <div className="page-header">
          <h2><i className="bi bi-tags text-primary me-2"></i>Gestion des Catégories</h2>
          <p className="text-muted">Créer, modifier et supprimer les catégories de services</p>
        </div>

{error && <div className="alert alert-danger"><i className="bi bi-exclamation-circle me-2"></i>{String(error)}</div>}
        {success && <div className="alert alert-success"><i className="bi bi-check-circle me-2"></i>{success}</div>}

        {showForm ? (
          <FormBuilder
            title={editingItem ? 'Modifier une catégorie' : 'Créer une catégorie'}
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
                <i className="bi bi-plus-circle"></i> Ajouter une catégorie
              </button>
            </div>

            <SearchFilter onSearch={handleSearch} />

            <div className="card-custom">
              <div className="card-header-custom">
                <i className="bi bi-list-ul text-primary me-2"></i>Catégories ({items.length})
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
