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
    setError(null); // Réinitialiser l'erreur avant chargement
    try {
      const result = await crudService.list('evaluations');
      if (result.success) {
        // Sécurité : s'assurer que result.data est bien un tableau
        setItems(Array.isArray(result.data) ? result.data : []);
      } else {
        setError(result.error || "Impossible de charger les évaluations.");
      }
    } catch (err) {
      setError("Erreur réseau lors de la récupération des données.");
    }
    setLoading(false);
  };

  const handleSearch = async (query) => {
    if (!query) {
      loadEvaluations();
      return;
    }
    const result = await crudService.list('evaluations', { search: query });
    if (result.success) setItems(Array.isArray(result.data) ? result.data : []);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cette évaluation ?")) {
      const result = await crudService.delete('evaluations', id);
      if (result.success) {
        setSuccess('Évaluation supprimée avec succès');
        loadEvaluations();
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(result.error?.detail || 'Erreur lors de la suppression');
      }
    }
  };

  // Correction : Gestion des cas où note n'est pas un nombre
  const renderStars = (note) => {
    const val = parseInt(note) || 0;
    return (
      <div style={{ color: '#ffc107', whiteSpace: 'nowrap' }}>
        {'★'.repeat(val)}{'☆'.repeat(5 - val)}
        <span className="ms-1 text-muted">({val}/5)</span>
      </div>
    );
  };


const columns = [
  { 
    label: 'SERVICE', 
    key: 'service_nom', 
    render: (item) => item.service_nom || 'Service inconnu' 
  },
  { 
    label: 'PRESTATAIRE', 
    key: 'prestataire_nom', 
    render: (item) => (
      <div className="d-flex align-items-center">
        <span className="badge bg-light-primary text-primary me-2">P</span>
        {item.prestataire_nom || 'Non assigné'}
      </div>
    )
  },
  { 
    label: 'CLIENT', 
    key: 'client_nom', 
    render: (item) => (
      <div className="d-flex align-items-center">
        <span className="badge bg-light-success text-success me-2">C</span>
        {item.client_nom || 'Anonyme'}
      </div>
    )
  },
  // ... tes colonnes Note, Commentaire et Date restent identiques
];


  // Calcul des stats sécurisé (vérifie si items est vide)
  const averageNote = items.length > 0 
    ? (items.reduce((sum, e) => sum + (parseInt(e.note) || 0), 0) / items.length).toFixed(1) 
    : "0.0";

  return (
    <div className="py-4">
      <div className="container">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h2 className="mb-1"><i className="bi bi-star-fill text-warning me-2"></i>Modération des Évaluations</h2>
            <p className="text-muted mb-0">Visualisez les retours clients sur vos services</p>
          </div>
          <button className="btn btn-outline-primary btn-sm" onClick={loadEvaluations}>
             <i className="bi bi-arrow-clockwise me-1"></i> Actualiser
          </button>
        </div>

        {error && <div className="alert alert-danger fade show"><i className="bi bi-exclamation-triangle me-2"></i>{error}</div>}
        {success && <div className="alert alert-success fade show"><i className="bi bi-check-all me-2"></i>{success}</div>}

        <div className="mb-4">
          <SearchFilter onSearch={handleSearch} placeholder="Rechercher par commentaire..." />
        </div>

        <div className="card shadow-sm border-0">
          <div className="card-header bg-white py-3">
             <h5 className="mb-0 text-dark">Liste des Évaluations ({items.length})</h5>
          </div>
          <div className="card-body p-0">
            <DataTable
              columns={columns}
              data={items}
              onDelete={handleDelete}
              isLoading={loading}
              emptyMessage="Aucune évaluation trouvée."
            />
          </div>
        </div>

        {/* Section Statistiques */}
        {!loading && items.length > 0 && (
          <div className="row g-3 mt-4">
            <div className="col-md-4">
              <div className="card border-0 shadow-sm text-center p-3">
                <span className="text-muted small text-uppercase">Note Moyenne</span>
                <h3 className="text-primary mb-0">{averageNote}/5</h3>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card border-0 shadow-sm text-center p-3">
                <span className="text-muted small text-uppercase">Total Avis</span>
                <h3 className="text-primary mb-0">{items.length}</h3>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card border-0 shadow-sm text-center p-3">
                <span className="text-muted small text-uppercase">Commentaires</span>
                <h3 className="text-primary mb-0">{items.filter(e => e.commentaire).length}</h3>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}