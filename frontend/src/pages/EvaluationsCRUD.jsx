import { useState, useEffect } from 'react';
import DataTable from '../components/DataTable';
import SearchFilter from '../components/SearchFilter';
import crudService from '../utils/crudService';

export default function EvaluationsCRUD() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    loadEvaluations();
  }, []);

  const loadEvaluations = async () => {
    setLoading(true);
    const result = await crudService.list('evaluations');
    if (result.success) {
      setItems(result.data);
    } else {
      setError(result.error);
    }
    setLoading(false);
  };

  const handleSearch = async (query) => {
    if (!query) {
      loadEvaluations();
      return;
    }
    const result = await crudService.list('evaluations', { search: query });
    if (result.success) setItems(result.data);
  };

  const handleDelete = async (id) => {
    const result = await crudService.delete('evaluations', id);
    if (result.success) {
      setSuccess('Évaluation supprimée');
      loadEvaluations();
    } else {
      setError(result.error?.detail || 'Erreur de suppression');
    }
  };

  const renderStars = (note) => {
    return (
      <span style={{ color: '#ffc107' }}>
        {'⭐'.repeat(note)}{note}/5
      </span>
    );
  };

  const columns = [
    { 
      label: 'Note', 
      key: 'note', 
      width: '15%',
      render: (item) => renderStars(item.note)
    },
    { 
      label: 'Commentaire', 
      key: 'commentaire', 
      width: '50%',
      type: 'truncate',
      render: (item) => item.commentaire || '—'
    },
    { 
      label: 'Date', 
      key: 'date_eval', 
      width: '20%',
      render: (item) => new Date(item.date_eval).toLocaleDateString('fr-FR')
    },
  ];

  return (
    <div className="py-5">
      <div className="container">
        <div className="page-header">
          <h2><i className="bi bi-star text-primary me-2"></i>Gestion des Évaluations</h2>
          <p className="text-muted">Consulter et gérer les évaluations des services</p>
        </div>

        {error && <div className="alert alert-danger"><i className="bi bi-exclamation-circle me-2"></i>{error}</div>}
        {success && <div className="alert alert-success"><i className="bi bi-check-circle me-2"></i>{success}</div>}

        <SearchFilter onSearch={handleSearch} />

        <div className="card-custom">
          <div className="card-header-custom">
            <i className="bi bi-list-ul text-primary me-2"></i>Évaluations ({items.length})
          </div>
          <div className="card-body-custom">
            <DataTable
              columns={columns}
              data={items}
              onDelete={handleDelete}
              isLoading={loading}
            />
          </div>
        </div>

        {/* Statistiques */}
        {items.length > 0 && (
          <div style={{ marginTop: '20px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
            <div className="card-custom" style={{ padding: '15px' }}>
              <strong>Moyenne des notes:</strong>
              <div style={{ fontSize: '2rem', color: 'var(--primary-color)' }}>
                {(items.reduce((sum, e) => sum + e.note, 0) / items.length).toFixed(1)}/5
              </div>
            </div>
            <div className="card-custom" style={{ padding: '15px' }}>
              <strong>Total d'évaluations:</strong>
              <div style={{ fontSize: '2rem', color: 'var(--primary-color)' }}>
                {items.length}
              </div>
            </div>
            <div className="card-custom" style={{ padding: '15px' }}>
              <strong>Avec commentaire:</strong>
              <div style={{ fontSize: '2rem', color: 'var(--primary-color)' }}>
                {items.filter(e => e.commentaire).length}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
