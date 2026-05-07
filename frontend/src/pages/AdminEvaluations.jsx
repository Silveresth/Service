import { useState, useEffect } from 'react';
import api from '../api/axios';
import ConfirmModal from '../components/ConfirmModal';

export default function AdminEvaluations() {
  const [evaluations, setEvaluations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteModal, setDeleteModal] = useState(null);
  const [deleteError, setDeleteError] = useState('');

  useEffect(() => { loadEvaluations(); }, []);

  const loadEvaluations = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/admin/all_evaluations/');
      const data = res.data?.results ?? res.data ?? [];
      setEvaluations(Array.isArray(data) ? data : []);
    } catch {
      try {
        const res2 = await api.get('/evaluations/');
        const data = res2.data?.results ?? res2.data ?? [];
        setEvaluations(Array.isArray(data) ? data : []);
      } catch (err2) {
        setError(err2.response?.data?.detail || 'Erreur lors du chargement');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteModal) return;
    setDeleteError('');
    try {
      await api.delete(`/admin/delete-evaluation/?id=${deleteModal.id}`);
      setEvaluations(prev => prev.filter(e => e.id !== deleteModal.id));
      setDeleteModal(null);
    } catch {
      try {
        await api.delete(`/evaluations/${deleteModal.id}/`);
        setEvaluations(prev => prev.filter(e => e.id !== deleteModal.id));
        setDeleteModal(null);
      } catch (err2) {
        setDeleteError(err2.response?.data?.detail || 'Erreur lors de la suppression');
      }
    }
  };

  const getServiceNom = (e) =>
    (typeof e?.service_nom === 'string' && e.service_nom ? e.service_nom : null)
    || '-';

  // Backend: EvaluationSerializer renvoie { client: <string>, prestataire: <string> }
  const getClientNom = (e) =>
    (typeof e?.client === 'string' && e.client ? e.client : null)
    || '-';

  const getPrestataireNom = (e) =>
    (typeof e?.prestataire === 'string' && e.prestataire ? e.prestataire : null)
    || '-';




  const renderStars = (note) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
      {[1,2,3,4,5].map(s => (
        <i key={s} className={`bi bi-star${s <= note ? '-fill' : ''}`}
          style={{ color: s <= note ? '#f59e0b' : '#d1d5db', fontSize: '0.85rem' }} />
      ))}
      <span style={{ fontWeight: 700, color: '#f59e0b', fontSize: '0.82rem', marginLeft: 4 }}>{note}/5</span>
    </div>
  );

  if (loading) return (
    <div className="admin-page"><div className="admin-container">
      <div className="admin-loading">
        <div className="admin-loading-spinner"></div>
        <p className="admin-loading-text">Chargement des évaluations...</p>
      </div>
    </div></div>
  );

  if (error) return (
    <div className="admin-page"><div className="admin-container">
      <div className="admin-header"><h1><i className="bi bi-star"></i> Toutes les Évaluations</h1></div>
      <div className="admin-alert admin-alert-danger">
        <i className="bi bi-exclamation-triangle"></i>
        <span>{error}</span>
        <button onClick={loadEvaluations} className="btn btn-sm btn-outline-danger ms-auto">Réessayer</button>
      </div>
    </div></div>
  );

  const avgNote = evaluations.length
    ? (evaluations.reduce((s, e) => s + (e.note || 0), 0) / evaluations.length).toFixed(1)
    : null;
  const withComment = evaluations.filter(e => e.commentaire?.trim()).length;

  return (
    <div className="admin-page">
      <div className="admin-container">

        <div className="admin-header">
          <h1><i className="bi bi-star-fill" style={{ color: '#f59e0b' }}></i> Toutes les Évaluations</h1>
          <p>{evaluations.length} évaluation{evaluations.length !== 1 ? 's' : ''} au total</p>
        </div>

        {evaluations.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 14, marginBottom: 24 }}>
            {[
              { label: 'Total', value: evaluations.length, icon: 'bi-list-ul', color: '#0284c7' },
              { label: 'Note moyenne', value: avgNote ? `${avgNote}/5` : '—', icon: 'bi-star-half', color: '#f59e0b' },
              { label: 'Avec commentaire', value: withComment, icon: 'bi-chat-text', color: '#16a34a' },
            ].map(s => (
              <div key={s.label} className="admin-card" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: `${s.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <i className={`bi ${s.icon}`} style={{ color: s.color, fontSize: '1.2rem' }}></i>
                </div>
                <div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 900, color: s.color, lineHeight: 1 }}>{s.value}</div>
                  <div style={{ fontSize: '0.78rem', color: '#6b7280', marginTop: 2 }}>{s.label}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="admin-card">
          <div className="admin-card-header">
            <h2 className="admin-card-title">
              <i className="bi bi-table"></i> Liste des évaluations ({evaluations.length})
            </h2>
          </div>
          <div className="admin-card-body">
            {deleteError && (
              <div className="admin-alert admin-alert-danger" style={{ marginBottom: 16 }}>
                <i className="bi bi-exclamation-triangle"></i> {deleteError}
              </div>
            )}

            {evaluations.length === 0 ? (
              <div className="admin-empty">
                <div className="admin-empty-icon"><i className="bi bi-star"></i></div>
                <p className="admin-empty-title">Aucune évaluation</p>
                <p className="admin-empty-text">Aucune évaluation n'a encore été soumise.</p>
              </div>
            ) : (
              <div className="admin-table-wrapper">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>#</th><th>Service</th><th>Prestataire</th><th>Client</th>
                      <th>Note</th><th>Commentaire</th><th>Date</th><th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {evaluations.map((e, idx) => {
                      const serviceNom     = getServiceNom(e);
                      const clientNom      = getClientNom(e);
                      const prestataireNom = getPrestataireNom(e);

                      return (
                        <tr key={e.id}>
                          <td style={{ color: '#9ca3af', fontSize: '0.8rem' }}>{idx + 1}</td>
                          <td><strong style={{ color: '#0c2340' }}>{serviceNom}</strong></td>
                          <td>
                            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              <span style={{ width:28, height:28, borderRadius:'50%', background:'#e0f2fe', color:'#0284c7',
                                display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, fontSize:'0.75rem', flexShrink:0 }}>
                                {prestataireNom !== '-' ? prestataireNom[0].toUpperCase() : 'P'}
                              </span>
                              {prestataireNom}
                            </span>
                          </td>
                          <td>
                            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              <span style={{ width:28, height:28, borderRadius:'50%', background:'#f0fdf4', color:'#16a34a',
                                display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, fontSize:'0.75rem', flexShrink:0 }}>
                                {clientNom !== '-' ? clientNom[0].toUpperCase() : 'C'}
                              </span>
                              {clientNom}
                            </span>
                          </td>
                          <td>{renderStars(e.note || 0)}</td>
                          <td>
                            <span style={{ color: e.commentaire ? '#374151' : '#9ca3af',
                              fontStyle: e.commentaire ? 'normal' : 'italic', fontSize: '0.85rem',
                              display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                              overflow: 'hidden', maxWidth: 220 }}>
                              {e.commentaire || 'Aucun commentaire'}
                            </span>
                          </td>
                          <td style={{ fontSize: '0.8rem', color: '#6b7280', whiteSpace: 'nowrap' }}>
                            {(e.date_eval || e.created_at)
                              ? new Date(e.date_eval || e.created_at).toLocaleDateString('fr-FR',
                                  { day: '2-digit', month: 'short', year: 'numeric' })
                              : '-'}
                          </td>
                          <td>
                            <div className="table-actions">
                              <button className="table-action-btn delete"
                                onClick={() => setDeleteModal({ id: e.id, name: serviceNom })} title="Supprimer">
                                <i className="bi bi-trash"></i>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {deleteModal && (
        <ConfirmModal
          title="Supprimer l'évaluation"
          message={`Supprimer l'évaluation pour "${deleteModal.name}" ? Cette action est irréversible.`}
          onConfirm={handleDelete}
          onCancel={() => { setDeleteModal(null); setDeleteError(''); }}
        />
      )}
    </div>
  );
}
