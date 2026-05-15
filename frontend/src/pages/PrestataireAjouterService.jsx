import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';

export default function PrestataireAjouterService() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nom: '',
    description: '',
    prix: '',
    disponibilite: true,
    categorie_id: '',
    image: null,
    model_3d: null
  });


  const [categories, setCategories] = useState([]);
  const [previews, setPreviews] = useState({ image: null, modelName: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/categories/')
      .then(res => setCategories(res.data))
      .catch(() => setError('Erreur de chargement des catégories'));
  }, []);

  const handleFileChange = (e, field) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, [field]: file });
      if (field === 'image') {
        setPreviews({ ...previews, image: URL.createObjectURL(file) });
      } else {
        setPreviews({ ...previews, modelName: file.name });
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const data = new FormData();
    Object.keys(formData).forEach((key) => {
      if (formData[key] !== null && formData[key] !== '') data.append(key, formData[key]);
    });


    try {
      await api.post('/services/', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      navigate('/mes-services');
    } catch (err) {
      setError(err.response?.data?.detail || 'Erreur lors de la création');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ backgroundColor: '#f4f7f6', minHeight: '100vh', padding: '40px 10px' }}>
      <div className="container" style={{ maxWidth: '850px' }}>
        
        <div style={{ 
          backgroundColor: '#fff', 
          borderRadius: '20px', 
          boxShadow: '0 10px 40px rgba(0,0,0,0.1)', 
          overflow: 'hidden',
          border: 'none'
        }}>
          
          {/* --- ENTÊTE FIXÉ --- */}
          <div style={{ 
            background: 'linear-gradient(135deg, #0d6efd 0%, #003d99 100%)', 
            padding: '35px', 
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            gap: '20px'
          }}>
            <div style={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.25)', 
              width: '55px', 
              height: '55px', 
              borderRadius: '15px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              fontSize: '22px',
              color: '#fff',
              backdropFilter: 'blur(4px)'
            }}>
              <i className="bi bi-plus-lg"></i>
            </div>
            <div style={{ zIndex: 2 }}>
              <h2 style={{ color: '#fff', margin: 0, fontWeight: '700', fontSize: '22px' }}>Créer un nouveau service</h2>
              <p style={{ color: 'rgba(255,255,255,0.9)', margin: '4px 0 0 0', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <i className="bi bi-lightning-charge-fill"></i> Mode Prestataire
              </p>
            </div>
            {/* Décoration subtile */}
            <i className="bi bi-rocket-takeoff" style={{ 
              position: 'absolute', right: '15px', top: '10px', fontSize: '90px', 
              color: 'rgba(255,255,255,0.06)', transform: 'rotate(-10deg)' 
            }}></i>
          </div>

          <div style={{ padding: '40px' }}>
            {error && <div className="alert alert-danger mb-4">{error}</div>}

            <form onSubmit={handleSubmit}>
              <div className="row g-4">
                {/* Ligne 1 : Nom et Catégorie */}
                <div className="col-md-7">
                  <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px', color: '#444', fontSize: '14px' }}>NOM DU SERVICE</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder="Ex: Réparation Climatisation"
                    style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ced4da', backgroundColor: '#fcfcfc' }}
                    value={formData.nom} 
                    onChange={e => setFormData({...formData, nom: e.target.value})} 
                    required 
                  />
                </div>

                <div className="col-md-5">
                  <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px', color: '#444', fontSize: '14px' }}>CATÉGORIE</label>
                  <select 
                    className="form-select" 
                    style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ced4da', backgroundColor: '#fcfcfc' }}
                    value={formData.categorie_id} 
                    onChange={e => setFormData({...formData, categorie_id: e.target.value})} 
                    required
                  >
                    <option value="">Sélectionner...</option>
                    {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.nom}</option>)}
                  </select>

                </div>

                {/* Description */}
                <div className="col-12">
                  <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px', color: '#444', fontSize: '14px' }}>DESCRIPTION DÉTAILLÉE</label>
                  <textarea 
                    className="form-control" 
                    rows="3" 
                    placeholder="Détaillez votre prestation..." 
                    style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ced4da', backgroundColor: '#fcfcfc' }}
                    value={formData.description} 
                    onChange={e => setFormData({...formData, description: e.target.value})}
                  ></textarea>
                </div>

                {/* Prix et Switch */}
                <div className="col-md-6">
                  <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px', color: '#444', fontSize: '14px' }}>TARIF DE BASE (FCFA)</label>
                  <div className="input-group">
                    <span className="input-group-text bg-white" style={{ border: '1px solid #ced4da', color: '#0d6efd', fontWeight: 'bold' }}>F</span>
                    <input 
                      type="number" 
                      className="form-control" 
                      style={{ padding: '12px', border: '1px solid #ced4da', backgroundColor: '#fcfcfc' }}
                      value={formData.prix} 
                      onChange={e => setFormData({...formData, prix: e.target.value})} 
                      required 
                    />
                  </div>
                </div>

                <div className="col-md-6 d-flex align-items-end">
                  <div style={{ 
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
                    width: '100%', padding: '12px 20px', backgroundColor: '#f8f9fa', 
                    borderRadius: '8px', border: '1px solid #e9ecef' 
                  }}>
                    <span style={{ fontWeight: '600', fontSize: '15px' }}><i className="bi bi-eye text-primary me-2"></i> Visible en ligne</span>
                    <input 
                      type="checkbox" 
                      style={{ width: '40px', height: '20px', cursor: 'pointer' }}
                      checked={formData.disponibilite} 
                      onChange={e => setFormData({...formData, disponibilite: e.target.checked})} 
                    />
                  </div>
                </div>

                {/* Uploads */}
                <div className="col-md-6">
                  <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px', color: '#444', fontSize: '14px' }}>PHOTO DU SERVICE</label>
                  <div 
                    onClick={() => document.getElementById('imageInput').click()}
                    style={{ border: '2px dashed #ddd', borderRadius: '12px', padding: '25px', textAlign: 'center', cursor: 'pointer', backgroundColor: '#fcfcfc' }}
                  >
                    <input type="file" id="imageInput" hidden accept="image/*" onChange={(e) => handleFileChange(e, 'image')} />
                    {previews.image ? <img src={previews.image} alt="Preview" style={{ maxHeight: '100px', borderRadius: '5px' }} /> : <><i className="bi bi-cloud-arrow-up fs-2 text-primary"></i><p className="small text-muted mb-0">Ajouter une image</p></>}
                  </div>
                </div>

                <div className="col-md-6">
                  <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px', color: '#444', fontSize: '14px' }}>MODÈLE 3D (GLB)</label>
                  <div 
                    onClick={() => document.getElementById('modelInput').click()}
                    style={{ border: '2px dashed #ddd', borderRadius: '12px', padding: '25px', textAlign: 'center', cursor: 'pointer', backgroundColor: '#fcfcfc' }}
                  >
                    <input type="file" id="modelInput" hidden accept=".glb,.gltf" onChange={(e) => handleFileChange(e, 'model_3d')} />
                    <i className={`bi bi-box-seam fs-2 ${previews.modelName ? 'text-success' : 'text-muted'}`}></i>
                    <p className="small text-muted mb-0">{previews.modelName || 'Format .GLB uniquement'}</p>
                  </div>
                </div>
              </div>

              {/* --- BOUTONS CORRIGÉS --- */}
              <div style={{ marginTop: '45px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <button 
                  type="submit" 
                  disabled={loading}
                  style={{
                    width: '100%', padding: '15px', backgroundColor: '#0d6efd', color: '#fff', 
                    border: 'none', borderRadius: '10px', fontSize: '16px', fontWeight: '600', 
                    cursor: 'pointer', boxShadow: '0 4px 15px rgba(13, 110, 253, 0.3)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px'
                  }}
                >
                  {loading ? 'Publication...' : <><i className="bi bi-check-circle-fill"></i> Confirmer et Publier</>}
                </button>

                <Link 
                  to="/mes-services" 
                  style={{
                    width: '100%', padding: '15px', backgroundColor: '#6c757d', color: '#fff', 
                    borderRadius: '10px', fontSize: '16px', fontWeight: '600', 
                    textDecoration: 'none', textAlign: 'center', display: 'block'
                  }}
                >
                  Annuler
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}