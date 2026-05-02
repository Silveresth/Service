import { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api from '../api/axios';

export default function ModifierService() {
  const { id } = useParams();
  const [form, setForm] = useState({ nom: '', categorie_id: '', description: '', prix: '', disponibilite: true });
  const [categories, setCategories] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([
      api.get('/categories/').then(res => setCategories(res.data)),
      api.get(`/services/${id}/`).then(res => {
        const s = res.data;
        setForm({
          nom: s.nom || '',
          categorie_id: s.categorie?.id || '',
          description: s.description || '',
          prix: s.prix || '',
          disponibilite: s.disponibilite !== false,
        });
      })
    ]).catch(err => {
      console.error(err);
      alert('Erreur lors du chargement du service');
      navigate('/mes-services');
    }).finally(() => setFetchLoading(false));
  }, [id, navigate]);

  const set = f => e => setForm({ ...form, [f]: e.type === 'checkbox' ? e.target.checked : e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true); setErrors({});
    try {
      const payload = { ...form };
      if (!payload.categorie_id) delete payload.categorie_id;
      await api.patch(`/services/${id}/`, payload);
      navigate('/mes-services');
    } catch (err) {
      setErrors(err.response?.data || {});
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) return (
    <div style={{ textAlign:'center', padding:80 }}>
      <i className="bi bi-hourglass-split" style={{ fontSize:'3rem', color:'var(--primary-color)' }}></i>
    </div>
  );

  return (
    <div className="py-5">
      <div className="container">
        <div style={{ display:'flex', justifyContent:'center' }}>
          <div style={{ width:'100%', maxWidth: 700 }}>
            <div className="form-custom">
              <div style={{ textAlign:'center', marginBottom: 24 }}>
                <i className="bi bi-pencil-square text-primary" style={{ fontSize: '3rem' }}></i>
                <h2 style={{ fontWeight: 800, marginTop: 12 }}>Modifier le service</h2>
                <p className="text-muted">Mettez à jour votre offre de service</p>
              </div>
              <form onSubmit={handleSubmit}>
                {errors.non_field_errors && <div className="alert alert-danger">{errors.non_field_errors}</div>}
                <div className="mb-3">
                  <label className="form-label">Nom du service</label>
                  <input type="text" className="form-control" value={form.nom} onChange={set('nom')} required />
                  {errors.nom && <div className="error-text">{errors.nom}</div>}
                </div>
                <div className="mb-3">
                  <label className="form-label">Catégorie</label>
                  <select className="form-select" value={form.categorie_id} onChange={set('categorie_id')}>
                    <option value="">-- Aucune catégorie --</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.nom}</option>
                    ))}
                  </select>
                </div>
                <div className="mb-3">
                  <label className="form-label">Description</label>
                  <textarea className="form-control" value={form.description} onChange={set('description')} required />
                  {errors.description && <div className="error-text">{errors.description}</div>}
                </div>
                <div style={{ display:'flex', gap: 12, marginBottom: 16 }}>
                  <div style={{ flex: 1 }}>
                    <label className="form-label">Prix (Fcfa)</label>
                    <input type="number" className="form-control" value={form.prix} onChange={set('prix')} required />
                    {errors.prix && <div className="error-text">{errors.prix}</div>}
                  </div>
                  <div style={{ flex: 1 }}>
                    <label className="form-label">Disponibilité</label>
                    <div className="form-check" style={{ marginTop: 8 }}>
                      <input type="checkbox" checked={form.disponibilite} onChange={set('disponibilite')} />
                      <label>Service disponible</label>
                    </div>
                  </div>
                </div>
                <div style={{ display:'flex', flexDirection:'column', gap: 12 }}>
                  <button type="submit" className="btn-primary-custom" disabled={loading}
                    style={{ justifyContent:'center', padding:'14px', fontSize:'1rem' }}>
                    {loading ? 'Enregistrement...' : <><i className="bi bi-check-circle"></i> Enregistrer les modifications</>}
                  </button>
                  <Link to="/mes-services" className="btn-secondary-custom" style={{ justifyContent:'center', padding:'12px' }}>Annuler</Link>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

