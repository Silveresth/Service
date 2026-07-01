import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Geolocation } from '@capacitor/geolocation';
import api from '../../api/axios';

export default function ModifierAtelier() {
  const { id } = useParams();
  const [form, setForm] = useState({ nom:'', adresse:'', latitude:'', longitude:'', telephone:'', description:'', est_actif:true });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const navigate = useNavigate();
  const set = f => e => setForm(p => ({ ...p, [f]: e.type==='checkbox' ? e.target.checked : e.target.value }));

  const mapRef = useRef(null);
  const markerRef = useRef(null);

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

  const handleUseCurrentPosition = async () => {
    let lat = null;
    let lng = null;
    try {
      const coordinates = await Geolocation.getCurrentPosition();
      lat = coordinates.coords.latitude;
      lng = coordinates.coords.longitude;
    } catch {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          pos => {
            const lat2 = pos.coords.latitude;
            const lng2 = pos.coords.longitude;
            setForm(p => ({ ...p, latitude: lat2.toFixed(6), longitude: lng2.toFixed(6) }));
            if (mapRef.current) {
              const latlng = [lat2, lng2];
              mapRef.current.setView(latlng, 15);
              if (markerRef.current) {
                markerRef.current.setLatLng(latlng);
              } else {
                markerRef.current = window.L.marker(latlng).addTo(mapRef.current);
              }
            }
          },
          err => alert('Erreur de localisation : ' + err.message)
        );
        return;
      } else {
        alert("La géolocalisation n'est pas supportée par votre appareil.");
        return;
      }
    }
    if (lat && lng) {
      setForm(p => ({ ...p, latitude: lat.toFixed(6), longitude: lng.toFixed(6) }));
      if (mapRef.current) {
        const latlng = [lat, lng];
        mapRef.current.setView(latlng, 15);
        if (markerRef.current) {
          markerRef.current.setLatLng(latlng);
        } else {
          markerRef.current = window.L.marker(latlng).addTo(mapRef.current);
        }
      }
    }
  };

  useEffect(() => {
    if (!window.L || fetchLoading) return;
    const existing = document.getElementById('map-modifier');
    if (existing && existing._leaflet_id) return;
    const map = window.L.map('map-modifier').setView([parseFloat(form.latitude)||6.125580, parseFloat(form.longitude)||1.232456], 14);
    window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution:'© OpenStreetMap' }).addTo(map);
    mapRef.current = map;

    if (form.latitude && form.longitude) {
      markerRef.current = window.L.marker([parseFloat(form.latitude), parseFloat(form.longitude)]).addTo(map);
    }
    map.on('click', e => {
      const { lat, lng } = e.latlng;
      setForm(p => ({ ...p, latitude: lat.toFixed(6), longitude: lng.toFixed(6) }));
      if (markerRef.current) markerRef.current.setLatLng(e.latlng);
      else markerRef.current = window.L.marker(e.latlng).addTo(map);
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
                  <div style={{ marginBottom: 16 }}>
                    <button
                      type="button"
                      onClick={handleUseCurrentPosition}
                      style={{
                        width: '100%',
                        padding: '10px',
                        borderRadius: '10px',
                        border: '1.5px solid #bae6fd',
                        background: '#f0f9ff',
                        color: '#0284c7',
                        fontWeight: '800',
                        fontSize: '0.85rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        marginBottom: '12px',
                        fontFamily: 'inherit'
                      }}
                    >
                      <i className="bi bi-geo-alt-fill" /> Utiliser ma position actuelle
                    </button>
                    <div style={{ display: 'flex', gap: 12 }}>
                      <div style={{ flex: 1 }}>
                        <label className="form-label">Latitude</label>
                        <input type="number" readOnly value={form.latitude} className="form-control" style={{ background: '#f1f5f9', cursor: 'not-allowed' }} placeholder="Auto-détectée" />
                      </div>
                      <div style={{ flex: 1 }}>
                        <label className="form-label">Longitude</label>
                        <input type="number" readOnly value={form.longitude} className="form-control" style={{ background: '#f1f5f9', cursor: 'not-allowed' }} placeholder="Auto-détectée" />
                      </div>
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

