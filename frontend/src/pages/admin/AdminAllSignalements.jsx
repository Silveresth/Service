import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import ConfirmModal from '../../components/ConfirmModal';

export default function AdminAllSignalements() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteModal, setDeleteModal] = useState(null);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/signalements/');
      setReports(res.data || []);
    } catch (err) {
      console.error('Error loading reports:', err);
      setError(err.response?.data?.detail || 'Erreur lors du chargement des signalements');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteModal) return;
    try {
      await api.delete(`/signalements/${deleteModal.id}/`);
      setReports(prev => prev.filter(r => r.id !== deleteModal.id));
      setDeleteModal(null);
    } catch (err) {
      alert(err.response?.data?.detail || err.response?.data?.error || 'Erreur lors de la suppression');
    }
  };

  if (loading) {
    return (
      <div className="admin-page">
        <div className="admin-container">
          <div className="admin-loading">
            <div className="admin-loading-spinner"></div>
            <p className="admin-loading-text">Chargement des signalements...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-page">
        <div className="admin-container">
          <div className="admin-header">
            <h1>
              <i className="bi bi-exclamation-octagon-fill" style={{ color: '#ef4444' }}></i>
              Signalements clients
            </h1>
            <p>Gérez les plaintes et signalements d'abus envers les prestataires</p>
          </div>
          <div className="admin-alert admin-alert-danger">
            <i className="bi bi-exclamation-triangle"></i>
            <span>{error}</span>
            <button onClick={loadReports} className="btn btn-sm btn-outline-danger ms-auto">
              Réessayer
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="admin-container">
        
        <div className="admin-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h1>
              <i className="bi bi-exclamation-octagon-fill" style={{ color: '#ef4444', marginRight: 10 }}></i>
              Signalements clients
            </h1>
            <p>Historique des signalements et des justificatifs d'abus sur la plateforme</p>
          </div>
          <Link to="/admin-dashboard" className="btn btn-outline-secondary" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <i className="bi bi-arrow-left" /> Dashboard Admin
          </Link>
        </div>

        <div className="admin-card">
          <div className="admin-card-header">
            <h2 className="admin-card-title">
              <i className="bi bi-list-ul"></i> Signalements reçus ({reports.length})
            </h2>
          </div>
          <div className="admin-card-body">
            {reports.length === 0 ? (
              <div className="admin-empty">
                <div className="admin-empty-icon" style={{ background: '#f0fdf4', color: '#16a34a' }}>
                  <i className="bi bi-shield-check"></i>
                </div>
                <p className="admin-empty-title">Aucun signalement</p>
                <p className="admin-empty-text">Tout est calme sur la plateforme ! Aucun prestataire n'a été signalé.</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Signalé par (Client)</th>
                      <th>Prestataire visé</th>
                      <th>Motif</th>
                      <th>Justification / Détails</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reports.map(r => (
                      <tr key={r.id}>
                        <td style={{ whiteSpace: 'nowrap' }}>
                          {new Date(r.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td>
                          <strong>{r.client_username}</strong>
                        </td>
                        <td>
                          <Link to={`/prestataire/${r.prestataire}`} style={{ textDecoration: 'none', color: '#0284c7', fontWeight: 700 }}>
                            {r.prestataire_nom} (@{r.prestataire_username})
                          </Link>
                        </td>
                        <td>
                          <span className="badge bg-danger" style={{ fontSize: '0.72rem', padding: '4px 8px' }}>{r.motif}</span>
                        </td>
                        <td>
                          <div style={{ maxWidth: 320, fontSize: '0.82rem', color: '#475569', wordBreak: 'break-word', lineHeight: 1.4 }}>
                            {r.justification}
                          </div>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: 6 }}>
                            <button
                              onClick={() => setDeleteModal(r)}
                              className="btn btn-icon btn-outline-danger"
                              title="Archiver / Supprimer le signalement"
                              style={{ padding: '4px 8px', borderRadius: 8 }}
                            >
                              <i className="bi bi-trash"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

      </div>

      <ConfirmModal
        show={!!deleteModal}
        title="Supprimer le signalement"
        message={`Voulez-vous vraiment supprimer et classer ce signalement ?`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteModal(null)}
      />
    </div>
  );
}
