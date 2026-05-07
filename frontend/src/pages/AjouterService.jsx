import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';

export function AjouterService() {
  const [form, setForm] = useState({ nom: '', categorie_id: '', description: '', prix: '', disponibilite: true });
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [categories, setCategories] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/categories/').then(res => setCategories(res.data)).catch(console.error);
  }, []);

  const set = f => e => setForm({ ...form, [f]: e.type === 'checkbox' ? e.target.checked : e.target.value });

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true); setErrors({});
    try {
      const payload = new FormData();
      Object.keys(form).forEach(key => {
        if (key === 'categorie_id' && !form[key]) return;
        payload.append(key, form[key]);
      });
      if (image) {
        payload.append('image', image);
      }
      await api.post('/services/', payload, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      navigate('/prestataire-dashboard');
    }
    catch (err) { setErrors(err.response?.data || {}); }
    finally { setLoading(false); }
  };

  return (
    <div className="py-5">
      <div className="container">
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <div style={{ width: '100%', maxWidth: 700 }}>
            <div className="form-custom">
              <div style={{ textAlign: 'center', marginBottom: 24 }}>
                <i className="bi bi-plus-circle-fill text-primary" style={{ fontSize: '3rem' }}></i>
                <h2 style={{ fontWeight: 800, marginTop: 12 }}>Ajouter un service</h2>
                <p className="text-muted">Créez une nouvelle offre de service</p>
              </div>
              <form onSubmit={handleSubmit}>
                {errors.non_field_errors && <div className="alert alert-danger">{errors.non_field_errors}</div>}
                <div className="mb-3">
                  <label className="form-label">Nom du service</label>
                  <input type="text" className="form-control" value={form.nom} onChange={set('nom')} required />
                  {errors.nom && <div className="error-text">{errors.nom}</div>}
                </div>
                {/* ✅ FIX: Sélecteur de catégorie basé sur les données réelles */}
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
<div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
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
                <div className="mb-3">
                  <label className="form-label">Image du service</label>
                  <input type="file" className="form-control" accept="image/*" onChange={handleImageChange} />
                  {errors.image && <div className="error-text">{errors.image}</div>}
                  {imagePreview && (
                    <div style={{ marginTop: 12, textAlign: 'center' }}>
                      <img src={imagePreview} alt="Aperçu" style={{ maxWidth: '100%', maxHeight: 200, borderRadius: 8 }} />
                    </div>
                  )}
                </div>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <button type="submit" className="btn-primary-custom" disabled={loading}
                    style={{ justifyContent: 'center', padding: '14px', fontSize: '1rem' }}>
                    {loading ? 'Création...' : <><i className="bi bi-check-circle"></i> Créer le service</>}
                  </button>
                  <Link to="/prestataire-dashboard" className="btn-secondary-custom" style={{ justifyContent: 'center', padding: '12px' }}>Annuler</Link>
                </div>

              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}