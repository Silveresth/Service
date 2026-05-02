import { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api from '../api/axios';

export default function ModifierAtelier() {
  const { id } = useParams();
  const [form, setForm] = useState({ nom:'', adresse:'', latitude:'', longitude:'', telephone:'', description:'', est_actif:true });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const navigate = useNavigate();
  const set = f => e => setForm(p => ({ ...p, [f]: e.type==='checkbox' ? e.target.checked : e.target.value }));

  useEffect(() => {
    api.get(`/ateliers/${id}/`).then(res => {
      const a = res.data;
      setForm({
        nom: a.nom || '',
        adresse: a.adresse || '',
        latitude: a.latitude || '',
        longitude: a.longitude || '',
        telephone: a.telephone || '',
        description: a.description || '',
        est_actif: a.est_actif !== false,
      });
    }).catch(err => {
      console.error(err);
      alert('Erreur lors du chargement de l\'atelier');
      navigate('/mes-ateliers');
    }).finally(() => setFetchLoading(false));
  }, [id, navigate]);

  useEffect(() => {
    if (!window.L || fetchLoading) return;
    const existing = document.getElementById('map-modifier');
    if (existing && existing._leaflet_id) return;
    const map = window.L.map('map-modifier').setView([parseFloat(form.latitude)||6.125580, parseFloat(form.longitude)||1.232456], 14);
    window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution:'© OpenStreetMap' }).addTo(map);
    let marker = null;
    if (form.latitude && form.longitude) {
      marker = window.L.marker([parseFloat(form.latitude), parseFloat(form.longitude)]).addTo(map);
    }
    map.on('click', e => {
      const { lat, lng } = e.latlng;
      setForm(p => ({ ...p, latitude: lat.toFixed(6), longitude: lng.toFixed(6) }));
      if (marker) marker.setLatLng(e.latlng);
      else marker = window.L.marker(e.latlng).addTo(map);
    });
  }, [fetchLoading]);

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true); setErrors({});
    try { await api.patch(`/ateliers/${id}/`, form); navigate('/mes-ateliers'); }
    catch (err) { setErrors(err.response?.data || {}); }
    finally { setLoading(false); }
  };

  if (fetchLoading) return (
    <div style={{ textAlign:'center', padding:80 }}>
      <i className="bi bi-hourglass-split" style={{ fontSize:'3rem', color:'var(--primary-color)' }}></i>
    </div>
  );

  return (
    <div className="py-5">
      <div className="container">
        <div className="page-header">
          <h2><i className="bi bi-pencil-square text-primary me-2"></i>Modifier l'Atelier</h2>
          <p className="text-muted">Mettez à jour les informations de votre atelier</p>
        </div>
        <div style={{ display:'flex', gap:24 }}>
          <div style={{ flex:2 }}>
            <div className="card-custom">
              <div className="card-body-custom">
                <form onSubmit={handleSubmit}>
                  <div className="mb-3"><label className="form-label">Nom de l'atelier</label>
                    <input type="text" className="form-control" value={form.nom} onChange={set('nom')} required />
                    {errors.nom && <div className="error-text">{errors.nom}</div>}
                  </div>
                  <div className="mb-3"><label className="form-label">Adresse</label>
                    <textarea className="form-control" value={form.adresse} onChange={set('adresse')} required />
                  </div>
                  <div style={{ display:'flex', gap:12, marginBottom:16 }}>
                    <div style={{ flex:1 }}>
                      <label className="form-label">Latitude</label>
                      <input type="number" step="0.000001" className="form-control" value={form.latitude} onChange={set('latitude')} placeholder="6.125580" />
                    </div>
                    <div style={{ flex:1 }}>
                      <label className="form-label">Longitude</label>
                      <input type="number" step="0.000001" className="form-control" value={form.longitude} onChange={set('longitude')} placeholder="1.232456" />
                    </div>
                  </div>
                  <div className="mb-3"><label className="form-label">Sélectionner sur la carte</label>
                    <div id="map-modifier" style={{ height:280, borderRadius:8 }}></div>
                    <small>Cliquez sur la carte pour modifier la position</small>
                  </div>
                  <div className="mb-3"><label className="form-label">Téléphone</label>
                    <input type="text" className="form-control" value={form.telephone} onChange={set('telephone')} />
                  </div>
                  <div className="mb-3"><label className="form-label">Description</label>
                    <textarea className="form-control" value={form.description} onChange={set('description')} placeholder="Ex: Plomberie, électricité, réparation..." />
                  </div>
                  <div className="form-check mb-3">
                    <input type="checkbox" checked={form.est_actif} onChange={set('est_actif')} />
                    <label>Atelier actif (visible par les clients)</label>
                  </div>
                  <div style={{ display:'flex', justifyContent:'space-between' }}>
                    <button type="button" onClick={() => navigate('/mes-ateliers')} className="btn-secondary-custom">
                      <i className="bi bi-arrow-left"></i> Retour
                    </button>
                    <button type="submit" className="btn-primary-custom" disabled={loading}>
                      {loading ? 'Enregistrement...' : <><i className="bi bi-check-circle"></i> Enregistrer</>}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
          <div style={{ flex:1 }}>
            <div className="card-custom" style={{ background:'#f8fafb' }}>
              <div className="card-body-custom">
                <h5 style={{ marginBottom:12 }}><i className="bi bi-info-circle me-2"></i>Coordonnées</h5>
                <ul style={{ paddingLeft:20, lineHeight:1.9, fontSize:'0.9rem' }}>
                  <li>Ouvrez Google Maps</li><li>Allez à l'emplacement</li>
                  <li>Appuyez longtemps sur le point</li><li>Copiez les coordonnées</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

