import { useState, useEffect } from 'react';
import api from '../api/axios';
import ConfirmModal from '../components/ConfirmModal';

const ICONE_SUGGESTIONS = [
  'bi-lightbulb', 'bi-tools', 'bi-house', 'bi-car-front', 'bi-camera',
  'bi-scissors', 'bi-laptop', 'bi-heart-pulse', 'bi-brush', 'bi-wrench',
  'bi-music-note', 'bi-tree', 'bi-book', 'bi-bicycle', 'bi-shield-check',
  'bi-people', 'bi-star', 'bi-flower1', 'bi-cup-hot', 'bi-hammer',
];

export default function AdminAllCategories() {
  const [categories, setCategories]   = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState(null);
  const [deleteModal, setDeleteModal] = useState(null);
  const [showForm, setShowForm]       = useState(false);
  const [saving, setSaving]           = useState(false);
  const [formError, setFormError]     = useState('');
  const [form, setForm]               = useState({ nom: '', icone: '' });

  useEffect(() => { loadCategories(); }, []);

  const loadCategories = async () => {
    setLoading(true); setError(null);
    try {
      const res = await api.get('/categories/');
      setCategories(res.data || []);
    } catch (err) {
      setError(err.response?.data?.detail || 'Erreur lors du chargement des catégories');
    } finally { setLoading(false); }
  };

  const handleAdd = async () => {
    if (!form.nom.trim()) { setFormError('Le nom est obligatoire.'); return; }
    if (!form.icone.trim()) { setFormError("L'icône est obligatoire."); return; }
    setSaving(true); setFormError('');
    try {
      const res = await api.post('/categories/', form);
      setCategories(prev => [...prev, res.data]);
      setForm({ nom: '', icone: '' });
      setShowForm(false);
    } catch (err) {
      setFormError(err.response?.data?.detail || err.response?.data?.nom?.[0] || 'Erreur lors de la création');
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!deleteModal) return;
    try {
      await api.delete(`/categories/${deleteModal.id}/`);
      setCategories(prev => prev.filter(c => c.id !== deleteModal.id));
      setDeleteModal(null);
    } catch (err) {
      alert(err.response?.data?.detail || 'Erreur lors de la suppression');
    }
  };

  if (loading) return (
    <div className="admin-page"><div className="admin-container">
      <div className="admin-loading">
        <div className="admin-loading-spinner"></div>
        <p className="admin-loading-text">Chargement des catégories...</p>
      </div>
    </div></div>
  );

  if (error) return (
    <div className="admin-page"><div className="admin-container">
      <div className="admin-header">
        <h1><i className="bi bi-tag"></i> Toutes les Catégories</h1>
        <p>Gérez les catégories de services</p>
      </div>
      <div className="admin-alert admin-alert-danger">
        <i className="bi bi-exclamation-triangle"></i>
        <span>{error}</span>
        <button onClick={loadCategories} className="btn btn-sm btn-outline-danger ms-auto">
          Réessayer
        </button>
      </div>
    </div></div>
  );

  return (
    <div className="admin-page">
      <div className="admin-container">

        {/* ── En-tête ── */}
        <div className="admin-header">
          <h1><i className="bi bi-tag"></i> Toutes les Catégories</h1>
          <p>Gérez les catégories de services de la plateforme</p>
        </div>

        {/* ── Bouton ajouter ── */}
        <div style={{ marginBottom: 20 }}>
          <button
            className="btn-primary-custom"
            onClick={() => { setShowForm(v => !v); setFormError(''); setForm({ nom: '', icone: '' }); }}
          >
            <i className={`bi ${showForm ? 'bi-x-lg' : 'bi-plus-lg'} me-2`}></i>
            {showForm ? 'Annuler' : 'Ajouter une catégorie'}
          </button>
        </div>

        {/* ── Formulaire d'ajout ── */}
        {showForm && (
          <div className="admin-card" style={{ marginBottom: 24 }}>
            <div className="admin-card-header">
              <h2 className="admin-card-title">
                <i className="bi bi-plus-circle"></i> Nouvelle catégorie
              </h2>
            </div>
            <div className="admin-card-body">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>

                <div>
                  <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: '0.88rem' }}>
                    Nom <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Ex: Plomberie, Électricité…"
                    value={form.nom}
                    onChange={e => setForm(f => ({ ...f, nom: e.target.value }))}
                    style={{ borderRadius: 10, border: '1.5px solid #e2e8f0', padding: '10px 14px' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: '0.88rem' }}>
                    Icône Bootstrap <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Ex: bi-tools"
                      value={form.icone}
                      onChange={e => setForm(f => ({ ...f, icone: e.target.value }))}
                      style={{ borderRadius: 10, border: '1.5px solid #e2e8f0', padding: '10px 14px' }}
                    />
                    {form.icone && (
                      <i className={`bi ${form.icone}`} style={{ fontSize: '1.4rem', color: 'var(--primary-color)', flexShrink: 0 }}></i>
                    )}
                  </div>
                </div>
              </div>

              {/* Suggestions d'icônes */}
              <div style={{ marginBottom: 16 }}>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 8 }}>
                  Suggestions d'icônes (cliquer pour sélectionner) :
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {ICONE_SUGGESTIONS.map(ic => (
                    <button
                      key={ic}
                      type="button"
                      onClick={() => setForm(f => ({ ...f, icone: ic }))}
                      title={ic}
                      style={{
                        width: 40, height: 40, borderRadius: 8, border: '1.5px solid',
                        borderColor: form.icone === ic ? 'var(--primary-color)' : '#e2e8f0',
                        background: form.icone === ic ? '#e0f2fe' : 'white',
                        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        transition: 'all 0.15s',
                      }}
                    >
                      <i className={`bi ${ic}`} style={{ fontSize: '1.1rem', color: form.icone === ic ? 'var(--primary-color)' : '#64748b' }}></i>
                    </button>
                  ))}
                </div>
              </div>

              {formError && (
                <div className="admin-alert admin-alert-danger" style={{ marginBottom: 12 }}>
                  <i className="bi bi-exclamation-triangle"></i>
                  <span>{formError}</span>
                </div>
              )}

              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  className="btn-primary-custom"
                  onClick={handleAdd}
                  disabled={saving}
                >
                  {saving
                    ? <><span className="spinner-border spinner-border-sm me-2"></span>Enregistrement…</>
                    : <><i className="bi bi-check-lg me-2"></i>Créer la catégorie</>}
                </button>
                <button
                  className="btn-secondary-custom"
                  onClick={() => { setShowForm(false); setFormError(''); }}
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Tableau ── */}
        <div className="admin-card">
          <div className="admin-card-header">
            <h2 className="admin-card-title">
              <i className="bi bi-list-ul"></i> Catégories ({categories.length})
            </h2>
          </div>
          <div className="admin-card-body">
            {categories.length === 0 ? (
              <div className="admin-empty">
                <div className="admin-empty-icon"><i className="bi bi-tag"></i></div>
                <p className="admin-empty-title">Aucune catégorie</p>
                <p className="admin-empty-text">Ajoutez une catégorie pour commencer</p>
              </div>
            ) : (
              <div className="admin-table-wrapper">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Icône</th>
                      <th>Nom</th>
                      <th>Classe icône</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categories.map(c => (
                      <tr key={c.id}>
                        <td style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>#{c.id}</td>
                        <td>
                          <div style={{
                            width: 38, height: 38, borderRadius: 10,
                            background: '#e0f2fe', display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}>
                            <i className={`bi ${c.icone}`} style={{ fontSize: '1.1rem', color: 'var(--primary-color)' }}></i>
                          </div>
                        </td>
                        <td><strong>{c.nom}</strong></td>
                        <td>
                          <code style={{ background: '#f1f5f9', padding: '2px 8px', borderRadius: 6, fontSize: '0.8rem' }}>
                            {c.icone}
                          </code>
                        </td>
                        <td>
                          <div className="table-actions">
                            <button
                              className="table-action-btn delete"
                              onClick={() => setDeleteModal({ id: c.id, name: c.nom })}
                              title="Supprimer"
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

        {deleteModal && (
          <ConfirmModal
            title="Supprimer la catégorie"
            message={`Êtes-vous sûr de vouloir supprimer la catégorie "${deleteModal.name}" ? Les services liés perdront leur catégorie.`}
            onConfirm={handleDelete}
            onCancel={() => setDeleteModal(null)}
          />
        )}
      </div>
    </div>
  );
}
