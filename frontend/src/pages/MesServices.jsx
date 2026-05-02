import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';

export default function MesServices() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteModal, setDeleteModal] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/services/mes_services/')
      .then(r => setServices(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id) => {
    try {
      await api.delete(`/services/${id}/`);
      setServices(prev => prev.filter(s => s.id !== id));
      setDeleteModal(null);
    } catch {
      alert('Erreur lors de la suppression');
    }
  };

  if (loading) return (
    <div style={{ textAlign:'center', padding:80 }}>
      <i className="bi bi-hourglass-split" style={{ fontSize:'3rem', color:'var(--primary-color)' }}></i>
    </div>
  );

  return (
    <div className="py-5">
      <div className="container">
        <div className="page-header">
          <h2><i className="bi bi-briefcase text-primary me-2"></i>Mes Services</h2>
          <p className="text-muted">Gérez vos services proposés</p>
        </div>
        <div style={{ display:'flex', gap:12, marginBottom:24 }}>
          <Link to="/ajouter-service" className="btn-primary-custom">
            <i className="bi bi-plus-circle"></i> Ajouter un service
          </Link>
          <Link to="/dashboard" className="btn-outline-primary-custom">
            <i className="bi bi-speedometer2"></i> Dashboard
          </Link>
        </div>
        <div className="card-custom">
          <div className="card-header-custom"><i className="bi bi-list-ul text-primary"></i> Mes Services ({services.length})</div>
          <div className="card-body-custom">
            {services.length > 0 ? (
              <div className="table-responsive">
                <table className="table-custom" style={{ width:'100%' }}>
                  <thead>
                    <tr><th>Service</th><th>Catégorie</th><th>Prix</th><th>Dispo</th><th>Actions</th></tr>
                  </thead>
                  <tbody>
                    {services.map(s => (
                      <tr key={s.id}>
                        <td>
                          <strong>{s.nom}</strong><br />
                          <small className="text-muted">{s.description?.split(' ').slice(0,8).join(' ')}...</small>
                        </td>
                        <td>{s.categorie?.nom || '-'}</td>
                        <td>{s.prix} Fcfa</td>
                        <td>
                          <span className={`badge ${s.disponibilite ? 'badge-success' : 'badge-secondary'}`}>
                            {s.disponibilite ? 'Oui' : 'Non'}
                          </span>
                        </td>
                        <td style={{ display:'flex', gap:6 }}>
                          <button onClick={() => navigate(`/modifier-service/${s.id}`)} className="btn-outline-primary-custom btn-sm-custom">
                            <i className="bi bi-pencil"></i>
                          </button>
                          <button onClick={() => setDeleteModal(s)} className="btn-outline-danger-custom btn-sm-custom">
                            <i className="bi bi-trash"></i>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="empty-state">
                <i className="bi bi-inbox"></i><h4>Aucun service</h4>
                <Link to="/ajouter-service" className="btn-primary-custom">
                  <i className="bi bi-plus-circle"></i> Créer mon premier service
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {deleteModal && (
        <div className="modal-overlay" onClick={() => setDeleteModal(null)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header-custom">
              <h5 style={{ margin:0 }}>Confirmer la suppression</h5>
              <button onClick={() => setDeleteModal(null)} style={{ background:'none', border:'none', fontSize:'1.2rem', cursor:'pointer' }}>×</button>
            </div>
            <div className="modal-body-custom">
              <p>Êtes-vous sûr de vouloir supprimer <strong>{deleteModal.nom}</strong> ?</p>
              <div className="alert alert-warning"><i className="bi bi-info-circle"></i> Cette action est irréversible.</div>
            </div>
            <div className="modal-footer-custom">
              <button onClick={() => setDeleteModal(null)} className="btn-secondary-custom">Annuler</button>
              <button onClick={() => handleDelete(deleteModal.id)} className="btn-danger-custom">
                <i className="bi bi-trash"></i> Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

