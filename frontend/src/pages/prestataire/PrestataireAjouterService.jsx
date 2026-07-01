import { useState, useEffect } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import api from '../../api/axios';

const PAS_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&display=swap');

  .pas-page, .pas-page * {
    box-sizing: border-box;
  }

  .pas-page {
    background: #f0f8ff; min-height: 100vh; padding-bottom: 60px;
  }

  /* Hero */
  .pas-hero {
    background: linear-gradient(135deg, #0c2340 0%, #0a3d6b 50%, #0284c7 100%);
    padding: 28px 0 52px; color: white; position: relative; overflow: hidden;
  }
  .pas-hero::after {
    content: ''; position: absolute; bottom: -2px; left: 0; right: 0;
    height: 36px; background: #f0f8ff;
    clip-path: ellipse(55% 100% at 50% 100%);
  }
  .pas-hero-inner {
    max-width: 800px; margin: 0 auto; padding: 0 16px;
    position: relative; z-index: 1;
  }
  @media (max-width: 640px) {
    .pas-hero { padding: 20px 0 40px; }
    .pas-hero-inner { padding: 0 12px; }
  }
  .pas-hero-deco {
    position: absolute; border-radius: 50%;
    border: 1px solid rgba(255,255,255,0.06); pointer-events: none;
  }
  .pas-hero-top { display: flex; align-items: center; gap: 16px; }
  .pas-hero-icon {
    width: 58px; height: 58px; border-radius: 16px; flex-shrink: 0;
    background: rgba(255,255,255,0.12); border: 1px solid rgba(255,255,255,0.2);
    display: flex; align-items: center; justify-content: center; font-size: 1.6rem;
    backdrop-filter: blur(6px);
  }
  .pas-hero-title {
    font-family: 'Syne', sans-serif; font-weight: 800;
    font-size: clamp(1.1rem,3vw,1.5rem); margin: 0 0 4px;
  }
  .pas-hero-sub { font-size: 0.84rem; opacity: 0.75; margin: 0; }

  /* Content */
  .pas-content {
    width: 100%; max-width: 800px; margin: -24px auto 0;
    padding: 0 16px; position: relative; z-index: 2;
  }
  @media (max-width: 640px) {
    .pas-content { margin: -16px auto 0; padding: 0 12px; }
    .pas-card { border-radius: 16px; }
  }

  /* Section card */
  .pas-card {
    background: white; border-radius: 20px;
    border: 1.5px solid #e0f2fe;
    box-shadow: 0 4px 20px rgba(2,132,199,0.08);
    overflow: hidden; margin-bottom: 16px;
    animation: pas-in .35s ease;
    width: 100%;
  }
  @keyframes pas-in { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }

  .pas-section-head {
    padding: 16px 22px; border-bottom: 1px solid #f1f5f9;
    display: flex; align-items: center; gap: 10px;
  }
  .pas-section-num {
    width: 28px; height: 28px; border-radius: 50%;
    background: linear-gradient(135deg,#0284c7,#0369a1);
    color: white; font-weight: 800; font-size: 0.82rem;
    display: flex; align-items: center; justify-content: center; flex-shrink: 0;
  }
  .pas-section-title { font-family: 'Syne',sans-serif; font-weight: 800; font-size: 0.93rem; color: #0c2340; }
  .pas-section-sub { font-size: 0.75rem; color: #94a3b8; margin-left: auto; }
  .pas-card-body { padding: 22px; }

  /* Fields */
  .pas-field { margin-bottom: 18px; }
  .pas-label { display: block; font-size: 0.8rem; font-weight: 700; color: #374151; margin-bottom: 7px; letter-spacing: .02em; }
  .pas-optional { color: #94a3b8; font-weight: 500; }
  .pas-required { color: #ef4444; }

  .pas-input-wrap {
    display: flex; align-items: center; width: 100%;
    border: 1.5px solid #e2e8f0; border-radius: 12px; background: #fafbfc;
    transition: border-color .2s, box-shadow .2s, background .2s;
  }
  .pas-input-wrap:focus-within {
    border-color: #0284c7; background: white;
    box-shadow: 0 0 0 4px rgba(2,132,199,0.10);
  }
  .pas-icon { padding: 0 0 0 14px; color: #94a3b8; font-size: 0.95rem; flex-shrink: 0; transition: color .2s; }
  .pas-input-wrap:focus-within .pas-icon { color: #0284c7; }
  .pas-input {
    flex: 1; border: none; background: transparent;
    padding: 12px 14px; font-size: 0.9rem; color: #0c2340;
    outline: none; font-family: inherit; min-width: 0;
  }
  .pas-input::placeholder { color: #9ca3af; }
  .pas-suffix { padding: 0 14px; color: #64748b; font-weight: 700; font-size: 0.88rem; flex-shrink: 0; }

  .pas-textarea {
    width: 100%; border: 1.5px solid #e2e8f0; border-radius: 12px;
    padding: 12px 14px; font-size: 0.9rem; color: #0c2340;
    background: #fafbfc; outline: none; resize: vertical; font-family: inherit;
    transition: border-color .2s, box-shadow .2s;
  }
  .pas-textarea:focus { border-color: #0284c7; box-shadow: 0 0 0 4px rgba(2,132,199,0.10); background: white; }

  .pas-select {
    width: 100%; border: 1.5px solid #e2e8f0; border-radius: 12px;
    padding: 12px 14px; font-size: 0.9rem; color: #0c2340;
    background: #fafbfc; outline: none; font-family: inherit; cursor: pointer;
    transition: border-color .2s, box-shadow .2s;
    appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24'%3E%3Cpath fill='%2394a3b8' d='M7 10l5 5 5-5z'/%3E%3C/svg%3E");
    background-repeat: no-repeat; background-position: right 14px center;
  }
  .pas-select:focus { border-color: #0284c7; box-shadow: 0 0 0 4px rgba(2,132,199,0.10); }

  .pas-grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
  @media(max-width:500px) { .pas-grid2 { grid-template-columns: 1fr; } }

  /* Upload zones */
  .pas-upload-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
  @media(max-width:500px) { .pas-upload-grid { grid-template-columns: 1fr; } }

  .pas-upload-zone {
    border: 2px dashed #bae6fd; border-radius: 14px;
    padding: 24px 16px; text-align: center; cursor: pointer;
    background: #f8fbff; transition: all .2s;
    display: flex; flex-direction: column; align-items: center; gap: 8px;
  }
  .pas-upload-zone:hover, .pas-upload-zone.active {
    border-color: #0284c7; background: #e0f2fe;
  }
  .pas-upload-icon { font-size: 2rem; }
  .pas-upload-label { font-weight: 700; font-size: 0.84rem; color: #374151; }
  .pas-upload-hint { font-size: 0.72rem; color: #94a3b8; }
  .pas-upload-preview { max-height: 80px; border-radius: 8px; object-fit: cover; }

  /* Toggle switch */
  .pas-toggle-wrap {
    display: flex; align-items: center; justify-content: space-between;
    background: #f8fbff; border: 1.5px solid #e0f2fe; border-radius: 12px; padding: 14px 18px;
  }
  .pas-toggle-label { font-weight: 700; font-size: 0.9rem; color: #0c2340; display: flex; align-items: center; gap: 9px; }
  .pas-toggle-label i { color: #0284c7; }
  .pas-toggle-desc { font-size: 0.75rem; color: #94a3b8; margin-top: 2px; }
  .pas-switch { position: relative; width: 46px; height: 26px; flex-shrink: 0; }
  .pas-switch input { opacity: 0; width: 0; height: 0; position: absolute; }
  .pas-slider {
    position: absolute; inset: 0; background: #e2e8f0; border-radius: 50px;
    cursor: pointer; transition: background .25s;
  }
  .pas-slider::before {
    content: ''; position: absolute;
    height: 20px; width: 20px; left: 3px; bottom: 3px;
    background: white; border-radius: 50%;
    transition: transform .25s; box-shadow: 0 1px 4px rgba(0,0,0,0.15);
  }
  .pas-switch input:checked + .pas-slider { background: #0284c7; }
  .pas-switch input:checked + .pas-slider::before { transform: translateX(20px); }

  /* Error */
  .pas-error {
    background: #fef2f2; border: 1px solid #fecaca; border-radius: 12px;
    padding: 12px 16px; color: #dc2626; font-size: 0.86rem;
    display: flex; gap: 8px; align-items: center; margin-bottom: 16px;
  }

  /* Submit */
  .pas-submit-wrap { display: flex; flex-direction: column; gap: 10px; }
  .pas-btn-submit {
    width: 100%; padding: 14px; border-radius: 14px; border: none;
    background: linear-gradient(135deg,#0284c7,#0369a1);
    color: white; font-size: 0.95rem; font-weight: 800; font-family: inherit;
    cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 9px;
    box-shadow: 0 5px 18px rgba(2,132,199,0.32); transition: all .2s;
  }
  .pas-btn-submit:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 8px 24px rgba(2,132,199,0.42); }
  .pas-btn-submit:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
  .pas-btn-cancel {
    display: flex; align-items: center; justify-content: center; gap: 8px;
    padding: 12px; border-radius: 12px; border: 1.5px solid #e2e8f0;
    background: white; color: #64748b; font-weight: 700; font-size: 0.9rem;
    text-decoration: none; transition: all .2s;
  }
  .pas-btn-cancel:hover { border-color: #94a3b8; color: #374151; background: #f8fafc; }

  /* Spinner */
  .pas-spinner { width: 18px; height: 18px; border: 2px solid rgba(255,255,255,0.4); border-top-color: white; border-radius: 50%; animation: pas-spin .7s linear infinite; display: inline-block; }
  @keyframes pas-spin { to { transform: rotate(360deg); } }

  @media(max-width:560px) {
    .pas-card-body { padding: 12px; }
    .pas-hero { padding: 24px 0 44px; }
  }
`;

export default function PrestataireAjouterService() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('edit') || id;

  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({
    nom: '', description: '', prix: '', categorie: '', disponibilite: true,
  });
  const [imageFile, setImageFile]   = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [clearImage, setClearImage] = useState(false);

  const [model3dFile, setModel3dFile] = useState(null);
  const [model3dFileName, setModel3dFileName] = useState('');
  const [model3dPreviewUrl, setModel3dPreviewUrl] = useState('');
  const [clearModel3D, setClearModel3D] = useState(false);

  const [galleryFiles, setGalleryFiles] = useState([]);
  const [existingGallery, setExistingGallery] = useState([]);
  const [deletedGalleryIds, setDeletedGalleryIds] = useState([]);

  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState('');


  useEffect(() => {
    api.get('/categories/').then(r => setCategories(r.data)).catch(() => setError('Erreur chargement catégories.'));
  }, []);

  useEffect(() => {
    if (!editId) return;
    api.get(`/services/${editId}/`).then(res => {
      const s = res.data;
      setForm({
        nom: s.nom || '',
        description: s.description || '',
        prix: s.prix || '',
        categorie: s.categorie?.id || '',
        disponibilite: s.disponibilite !== false,
      });

      if (s.image_url) {
        setImagePreview(s.image_url);
      } else {
        setImagePreview(null);
      }

      if (s.model_3d_url) {
        setModel3dPreviewUrl(s.model_3d_url);
      } else {
        setModel3dPreviewUrl('');
      }

      if (s.images) {
        setExistingGallery(s.images);
      } else {
        setExistingGallery([]);
      }
    }).catch(() => setError('Erreur lors du chargement du service à modifier.'));
  }, [editId]);


  const set = f => e => setForm(p => ({ ...p, [f]: e.target.value }));

  const handleImage = e => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setClearImage(false);
    }
  };

  const handleModel3D = e => {
    const file = e.target.files[0];
    if (file) {
      setModel3dFile(file);
      setModel3dFileName(file.name);
      setClearModel3D(false);
    }
  };

  const handleMultipleImages = e => {
    const files = Array.from(e.target.files);
    setGalleryFiles(prev => [...prev, ...files]);
  };

  const removeGalleryFile = idx => {
    setGalleryFiles(prev => prev.filter((_, i) => i !== idx));
  };

  const removeExistingGalleryImage = id => {
    setDeletedGalleryIds(prev => [...prev, id]);
    setExistingGallery(prev => prev.filter(item => item.id !== id));
  };


  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.nom.trim() || !form.prix || !form.categorie) { setError('Nom, prix et catégorie sont obligatoires.'); return; }
    setLoading(true); setError('');

    // If there are deleted images, call API to delete them
    if (editId) {
      for (const imgId of deletedGalleryIds) {
        try {
          await api.post(`/services/${editId}/supprimer_image/`, { image_id: imgId });
        } catch (err) {
          console.error("Error deleting image from gallery:", err);
        }
      }
    }

    const data = new FormData();
    Object.entries(form).forEach(([k, v]) => {
      if (k === 'categorie') {
        data.append('categorie_id', v);
      } else {
        data.append(k, v);
      }
    });

    if (clearImage) {
      data.append('image', '');
    } else if (imageFile) {
      data.append('image', imageFile);
    }

    if (clearModel3D) {
      data.append('model_3d', '');
    } else if (model3dFile) {
      data.append('model_3d', model3dFile);
    }

    // Append new gallery images
    galleryFiles.forEach(file => {
      data.append('uploaded_images', file);
    });

    try {
      if (editId) {
        await api.patch(`/services/${editId}/`, data, { headers: { 'Content-Type': 'multipart/form-data' } });
      } else {
        await api.post('/services/', data, { headers: { 'Content-Type': 'multipart/form-data' } });
      }
      navigate('/prestataire-mes-services');
    } catch (err) {
      setError(err.response?.data?.detail || JSON.stringify(err.response?.data) || 'Erreur lors de la publication.');
    } finally { setLoading(false); }
  };


  return (
    <>
      <style>{PAS_STYLES}</style>
      <div className="pas-page">

        {/* Hero */}
        <div className="pas-hero">
          <div className="pas-hero-deco" style={{ width: 280, height: 280, top: -80, right: -70 }}></div>
          <div className="pas-hero-inner">
            <div className="pas-hero-top">
              <div className="pas-hero-icon"><i className="bi bi-plus-circle-fill"></i></div>
              <div>
                <h1 className="pas-hero-title">{editId ? 'Modifier le service' : 'Créer un nouveau service'}</h1>
                <p className="pas-hero-sub"><i className="bi bi-lightning-charge-fill me-1"></i>Mode Prestataire · Remplissez les informations ci-dessous</p>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="pas-content">
          <form onSubmit={handleSubmit}>

            {error && (
              <div className="pas-error">
                <i className="bi bi-exclamation-triangle-fill"></i> {error}
              </div>
            )}

            {/* Section 1 : Infos de base */}
            <div className="pas-card">
              <div className="pas-section-head">
                <div className="pas-section-num">1</div>
                <span className="pas-section-title">Informations du service</span>
              </div>
              <div className="pas-card-body">
                <div className="pas-grid2">
                  <div className="pas-field" style={{ gridColumn: '1 / -1' }}>
                    <label className="pas-label">Nom du service <span className="pas-required">*</span></label>
                    <div className="pas-input-wrap">
                      <i className="bi bi-briefcase-fill pas-icon"></i>
                      <input type="text" className="pas-input" placeholder="Ex: Réparation climatisation, Coiffure à domicile…"
                        value={form.nom} onChange={set('nom')} required />
                    </div>
                  </div>

                  <div className="pas-field">
                    <label className="pas-label">Catégorie <span className="pas-required">*</span></label>
                    <select className="pas-select" value={form.categorie} onChange={set('categorie')} required>
                      <option value="">Sélectionner une catégorie…</option>
                      {categories.map(c => <option key={c.id} value={c.id}>{c.nom}</option>)}
                    </select>
                  </div>

                  <div className="pas-field">
                    <label className="pas-label">Prix de base <span className="pas-required">*</span></label>
                    <div className="pas-input-wrap">
                      <i className="bi bi-currency-exchange pas-icon"></i>
                      <input type="number" className="pas-input" placeholder="15000" min="0"
                        value={form.prix} onChange={set('prix')} required />
                      <span className="pas-suffix">FCFA</span>
                    </div>
                  </div>

                  <div className="pas-field" style={{ gridColumn: '1 / -1' }}>
                    <label className="pas-label">Description détaillée <span className="pas-optional">(recommandé)</span></label>
                    <textarea className="pas-textarea" rows={4}
                      placeholder="Décrivez votre service en détail : ce qui est inclus, votre expérience, conditions spéciales…"
                      value={form.description} onChange={set('description')} />
                  </div>
                </div>
              </div>
            </div>

            {/* Section 2 : Médias */}
            <div className="pas-card">
              <div className="pas-section-head">
                <div className="pas-section-num">2</div>
                <span className="pas-section-title">Photos & Médias</span>
                <span className="pas-section-sub">Optionnel</span>
              </div>
              <div className="pas-card-body">
                <div className="pas-upload-grid">
                  {/* Image */}
                  <div>
                    <label className="pas-label" style={{ textAlign: 'center' }}>Photo du service</label>
                    <div className="pas-upload-zone" onClick={() => document.getElementById('pas-img').click()} style={{ alignItems: 'center' }}>
                      <input type="file" id="pas-img" hidden accept="image/*" onChange={handleImage} />
                      {imagePreview
                        ? <img src={imagePreview} alt="Aperçu" className="pas-upload-preview" style={{ margin: '0 auto' }} />
                        : <>
                          <i className="bi bi-cloud-arrow-up-fill pas-upload-icon" style={{ color: '#7dd3fc' }}></i>
                          <span className="pas-upload-label">Ajouter une image</span>
                          <span className="pas-upload-hint">JPG, PNG, WEBP</span>
                        </>
                      }
                    </div>
                    {imagePreview && (
                      <button type="button" onClick={() => { setImageFile(null); setImagePreview(null); setClearImage(true); }}
                        style={{ fontSize: '0.75rem', color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', marginTop: 6, display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'center', width: '100%' }}>
                        <i className="bi bi-x-circle"></i> Supprimer
                      </button>
                    )}
                  </div>

                  {/* Modèle 3D */}
                  <div>
                    <label className="pas-label" style={{ textAlign: 'center' }}>Modèle 3D (AR Preview)</label>
                    <div className="pas-upload-zone" onClick={() => document.getElementById('pas-model3d').click()} style={{ alignItems: 'center' }}>
                      <input type="file" id="pas-model3d" hidden accept=".gltf,.glb" onChange={handleModel3D} />
                      {model3dFileName || model3dPreviewUrl
                        ? <div style={{ textAlign: 'center' }}>
                            <i className="bi bi-box-seam-fill pas-upload-icon" style={{ color: '#a855f7' }}></i>
                            <span className="pas-upload-label" style={{ display: 'block', fontSize: '0.8rem', maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {model3dFileName || "Modèle 3D existant"}
                            </span>
                          </div>
                        : <>
                          <i className="bi bi-box-seam pas-upload-icon" style={{ color: '#c084fc' }}></i>
                          <span className="pas-upload-label">Ajouter modèle 3D</span>
                          <span className="pas-upload-hint">GLTF, GLB (Optionnel)</span>
                        </>
                      }
                    </div>
                    {(model3dFileName || model3dPreviewUrl) && (
                      <button type="button" onClick={() => { setModel3dFile(null); setModel3dFileName(''); setModel3dPreviewUrl(''); setClearModel3D(true); }}
                        style={{ fontSize: '0.75rem', color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', marginTop: 6, display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'center', width: '100%' }}>
                        <i className="bi bi-x-circle"></i> Supprimer
                      </button>
                    )}
                  </div>
                </div>

                <div style={{ marginTop: 24, borderTop: '1px solid #f1f5f9', paddingTop: 18 }}>
                  <label className="pas-label" style={{ fontWeight: 700 }}>Galerie de photos du service (Optionnel)</label>
                  <p style={{ fontSize: '0.78rem', color: '#64748b', margin: '4px 0 12px' }}>
                    Ajoutez d'autres photos sous différents angles pour mieux présenter votre réalisation.
                  </p>
                  
                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
                    {/* Add button */}
                    <div onClick={() => document.getElementById('pas-gallery-input').click()} style={{
                      width: 80, height: 80, border: '2px dashed #cbd5e1', borderRadius: 12,
                      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                      cursor: 'pointer', color: '#64748b'
                    }}>
                      <input type="file" id="pas-gallery-input" hidden multiple accept="image/*" onChange={handleMultipleImages} />
                      <i className="bi bi-plus-lg" style={{ fontSize: '1.4rem' }} />
                      <span style={{ fontSize: '0.65rem', fontWeight: 700 }}>Ajouter</span>
                    </div>

                    {/* Existing uploaded gallery images */}
                    {existingGallery.map(img => (
                      <div key={img.id} style={{ position: 'relative', width: 80, height: 80, borderRadius: 12, overflow: 'hidden', border: '1px solid #e2e8f0' }}>
                        <img src={img.image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        <button type="button" onClick={() => removeExistingGalleryImage(img.id)} style={{
                          position: 'absolute', top: 4, right: 4, width: 18, height: 18, borderRadius: '50%',
                          background: 'rgba(239, 68, 68, 0.9)', color: 'white', border: 'none',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '0.7rem'
                        }}>
                          <i className="bi bi-x" />
                        </button>
                      </div>
                    ))}

                    {/* New selected files */}
                    {galleryFiles.map((file, idx) => (
                      <div key={idx} style={{ position: 'relative', width: 80, height: 80, borderRadius: 12, overflow: 'hidden', border: '1px solid #e2e8f0' }}>
                        <img src={URL.createObjectURL(file)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        <button type="button" onClick={() => removeGalleryFile(idx)} style={{
                          position: 'absolute', top: 4, right: 4, width: 18, height: 18, borderRadius: '50%',
                          background: 'rgba(239, 68, 68, 0.9)', color: 'white', border: 'none',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '0.7rem'
                        }}>
                          <i className="bi bi-x" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ marginTop: 12, background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 10, padding: '10px 14px', fontSize: '0.8rem', color: '#166534', display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                  <i className="bi bi-info-circle-fill" style={{ flexShrink: 0, marginTop: 1 }}></i>
                  <span>Les services avec une photo reçoivent <strong>+60% de clics</strong>. Choisissez une image claire et représentative.</span>
                </div>
              </div>
            </div>

            {/* Section 3 : Visibilité */}
            <div className="pas-card">
              <div className="pas-section-head">
                <div className="pas-section-num">3</div>
                <span className="pas-section-title">Visibilité</span>
              </div>
              <div className="pas-card-body">
                <div className="pas-toggle-wrap">
                  <div>
                    <div className="pas-toggle-label">
                      <i className="bi bi-eye-fill"></i> Visible en ligne
                    </div>
                    <div className="pas-toggle-desc">
                      {form.disponibilite ? 'Votre service est visible et réservable par les clients.' : 'Votre service est masqué pour le moment.'}
                    </div>
                  </div>
                  <label className="pas-switch">
                    <input type="checkbox" checked={form.disponibilite}
                      onChange={e => setForm(p => ({ ...p, disponibilite: e.target.checked }))} />
                    <span className="pas-slider"></span>
                  </label>
                </div>
              </div>
            </div>

            {/* Submit */}
            <div className="pas-submit-wrap">
              <button type="submit" className="pas-btn-submit" disabled={loading}>
                {loading
                  ? <><span className="pas-spinner"></span> Publication en cours…</>
                  : <><i className="bi bi-check-circle-fill"></i> Confirmer et Publier</>
                }
              </button>
              <Link to="/prestataire-mes-services" className="pas-btn-cancel">
                <i className="bi bi-arrow-left"></i> Annuler et revenir
              </Link>
            </div>

          </form>
        </div>
      </div>
    </>
  );
}