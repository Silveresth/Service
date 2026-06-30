import { useState, useEffect } from 'react';
import DataTable from '../components/DataTable';
import FormBuilder from '../components/FormBuilder';
import SearchFilter from '../components/SearchFilter';
import crudService from '../utils/crudService';

export default function ServicesCRUD() {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [servicesResult, categoriesResult] = await Promise.all([
      crudService.action('services', null, 'mes_services', 'get'),
      crudService.list('categories'),
    ]);

    if (servicesResult.success) setItems(servicesResult.data);
    if (categoriesResult.success) setCategories(categoriesResult.data);
    if (!servicesResult.success) setError(typeof servicesResult.error === 'string' ? servicesResult.error : servicesResult.error || 'Erreur chargement services');
    setLoading(false);
  };

  const handleSearch = async (query) => {
    if (!query) {
      loadData();
      return;
    }
    const result = await crudService.list('services', { search: query });
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
      result = await crudService.update('services', editingItem.id, formData);
    } else {
      result = await crudService.create('services', formData);
    }

    if (result.success) {
      setSuccess(editingItem ? 'Service modifié' : 'Service créé');
      setShowForm(false);
      setEditingItem(null);
      loadData();
    } else {
      setError(typeof result.error === 'string' ? result.error : result.error?.detail || result.error || 'Erreur');
    }
    setSubmitting(false);
  };

  const handleDelete = async (id) => {
    const result = await crudService.delete('services', id);
    if (result.success) {
      setSuccess('Service supprimé');
      loadData();
    } else {
      setError(typeof result.error === 'string' ? result.error : result.error?.detail || result.error || 'Erreur de suppression');
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingItem(null);
  };

  const columns = [
    { label: 'Service', key: 'nom', width: '30%', type: 'truncate' },
    { label: 'Catégorie', path: 'categorie.nom', width: '20%' },
    { label: 'Prix (FCFA)', key: 'prix', width: '15%', type: 'number' },
    { 
      label: 'Disponibilité', 
      key: 'disponibilite', 
      width: '15%',
      render: (item) => (
        <span className={`badge ${item.disponibilite ? 'badge-success' : 'badge-secondary'}`}>
          {item.disponibilite ? 'Disponible' : 'Indisponible'}
        </span>
      )
    },
  ];

  const fields = [
    { name: 'nom', label: 'Nom du service', type: 'text', required: true },
    { name: 'description', label: 'Description', type: 'textarea', required: true },
    { name: 'categorie_id', label: 'Catégorie', type: 'select', required: true, options: categories },
    { name: 'prix', label: 'Prix (FCFA)', type: 'number', required: true },
    { 
      name: 'disponibilite', 
      label: 'Disponible', 
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
          <h2><i className="bi bi-briefcase text-primary me-2"></i>Gestion des Services</h2>
          <p className="text-muted">Créer, modifier et supprimer vos services</p>
        </div>

        {error && <div className="alert alert-danger"><i className="bi bi-exclamation-circle me-2"></i>{error}</div>}
        {success && <div className="alert alert-success"><i className="bi bi-check-circle me-2"></i>{success}</div>}

        {showForm ? (
          <FormBuilder
            title={editingItem ? 'Modifier un service' : 'Créer un service'}
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
                <i className="bi bi-plus-circle"></i> Ajouter un service
              </button>
            </div>

            <SearchFilter onSearch={handleSearch} />

            <div className="card-custom">
              <div className="card-header-custom">
                <i className="bi bi-list-ul text-primary me-2"></i>Services ({items.length})
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
