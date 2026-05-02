import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DataTable from './DataTable';
import FormBuilder from './FormBuilder';
import SearchFilter from './SearchFilter';
import crudService from '../utils/crudService';

/**
 * Composant PageTemplate générique pour les pages CRUD
 */
export default function CRUDPageTemplate({
  title,
  icon,
  description,
  endpoint,
  fields = [],
  tableColumns = [],
  searchFields = [],
  filterOptions = [],
}) {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Charger les données
  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    setLoading(true);
    const result = await crudService.list(endpoint);
    if (result.success) {
      setItems(result.data);
    } else {
      setError(result.error || 'Erreur lors du chargement');
    }
    setLoading(false);
  };

  const handleSearch = async (query) => {
    if (!query) {
      loadItems();
      return;
    }
    const params = searchFields.reduce((acc, field) => ({ ...acc, [field]: query }), {});
    const result = await crudService.list(endpoint, params);
    if (result.success) {
      setItems(result.data);
    } else {
      setError(result.error || 'Erreur de recherche');
    }
  };

  const handleFilterChange = async (filters) => {
    const result = await crudService.list(endpoint, filters);
    if (result.success) {
      setItems(result.data);
    } else {
      setError(result.error || 'Erreur de filtre');
    }
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
      result = await crudService.update(endpoint, editingItem.id, formData);
    } else {
      result = await crudService.create(endpoint, formData);
    }

    if (result.success) {
      setSuccess(editingItem ? 'Élément modifié avec succès' : 'Élément créé avec succès');
      setShowForm(false);
      setEditingItem(null);
      loadItems();
    } else {
      setError(result.error || 'Une erreur est survenue');
    }
    setSubmitting(false);
  };

  const handleDelete = async (id) => {
    const result = await crudService.delete(endpoint, id);
    if (result.success) {
      setSuccess('Élément supprimé avec succès');
      loadItems();
    } else {
      setError(result.error || 'Erreur lors de la suppression');
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingItem(null);
  };

  return (
    <div className="py-5">
      <div className="container">
        {/* En-tête */}
        <div className="page-header">
          <h2>
            {icon && <i className={`${icon} text-primary me-2`}></i>}
            {title}
          </h2>
          {description && <p className="text-muted">{description}</p>}
        </div>

        {/* Messages */}
        {error && (
          <div className="alert alert-danger" role="alert">
            <i className="bi bi-exclamation-circle me-2"></i>{error}
            <button 
              onClick={() => setError(null)} 
              style={{ float: 'right', background: 'none', border: 'none', cursor: 'pointer' }}
            >
              ×
            </button>
          </div>
        )}
        {success && (
          <div className="alert alert-success" role="alert">
            <i className="bi bi-check-circle me-2"></i>{success}
            <button 
              onClick={() => setSuccess(null)} 
              style={{ float: 'right', background: 'none', border: 'none', cursor: 'pointer' }}
            >
              ×
            </button>
          </div>
        )}

        {/* Contenu */}
        {showForm ? (
          <FormBuilder
            title={editingItem ? `Modifier ${title}` : `Créer ${title}`}
            fields={fields}
            initialData={editingItem || {}}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isLoading={submitting}
            submitLabel={editingItem ? 'Modifier' : 'Créer'}
          />
        ) : (
          <div>
            {/* Bouton d'ajout */}
            <div style={{ marginBottom: '20px' }}>
              <button 
                onClick={() => setShowForm(true)} 
                className="btn-primary-custom"
              >
                <i className="bi bi-plus-circle"></i> Ajouter
              </button>
            </div>

            {/* Recherche et filtres */}
            <SearchFilter
              onSearch={handleSearch}
              onFilterChange={handleFilterChange}
              filters={filterOptions}
              searchPlaceholder="Rechercher..."
            />

            {/* Tableau */}
            <div className="card-custom">
              <div className="card-header-custom">
                <i className="bi bi-table text-primary me-2"></i>
                Liste ({items.length})
              </div>
              <div className="card-body-custom">
                <DataTable
                  columns={tableColumns}
                  data={items}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  isLoading={loading}
                  emptyMessage="Aucun élément trouvé"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
