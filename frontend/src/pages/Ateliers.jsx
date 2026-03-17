import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

export function CarteAteliers() {
  const [ateliers, setAteliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [coords, setCoords] = useState({ lat:'', lng:'', radius:'10' });
  const mapRef = useRef(null);

  useEffect(() => { api.get('/ateliers/').then(r => setAteliers(r.data)).catch(console.error).finally(() => setLoading(false)); }, []);

  useEffect(() => {
    if (!loading && window.L && !mapRef.current) {
      const map = window.L.map('carte-ateliers').setView([6.125580, 1.232456], 7);
      mapRef.current = map;
      window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution:'© OpenStreetMap' }).addTo(map);
      ateliers.forEach(a => {
        if (a.latitude && a.longitude) {
          window.L.marker([parseFloat(a.latitude), parseFloat(a.longitude)]).addTo(map)
            .bindPopup(`<div style="min-width:180px"><h6>${a.nom}</h6><p style="margin:4px 0">${a.adresse}</p><p style="margin:4px 0">Tél: ${a.telephone}</p></div>`);
        }
      });
    }
  }, [loading, ateliers]);

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(pos => {
        setCoords({ ...coords, lat: pos.coords.latitude.toFixed(6), lng: pos.coords.longitude.toFixed(6) });
        if (mapRef.current) mapRef.current.setView([pos.coords.latitude, pos.coords.longitude], 12);
      });
    }
  };

  if (loading) return <div style={{ textAlign:'center', padding:80 }}><i className="bi bi-hourglass-split" style={{ fontSize:'3rem', color:'var(--primary-color)' }}></i></div>;

  return (
    <div className="py-5">
      <div className="container">
        <div className="page-header">
          <h2><i className="bi bi-geo-alt text-primary me-2"></i>Carte des Ateliers</h2>
          <p className="text-muted">Découvrez les ateliers des prestataires près de chez vous</p>
        </div>
        <div className="card-custom mb-4">
          <div className="card-body-custom">
            <h5 style={{ marginBottom:16 }}><i className="bi bi-search me-2"></i>Recherche par proximité</h5>
            <div style={{ display:'flex', gap:12, alignItems:'flex-end', flexWrap:'wrap' }}>
              <div style={{ flex:1, minWidth:140 }}>
                <label className="form-label">Latitude</label>
                <input type="number" step="0.000001" className="form-control" placeholder="6.125580"
                  value={coords.lat} onChange={e => setCoords({...coords, lat:e.target.value})} />
              </div>
              <div style={{ flex:1, minWidth:140 }}>
                <label className="form-label">Longitude</label>
                <input type="number" step="0.000001" className="form-control" placeholder="1.232456"
                  value={coords.lng} onChange={e => setCoords({...coords, lng:e.target.value})} />
              </div>
              <div style={{ flex:1, minWidth:120 }}>
                <label className="form-label">Rayon (km)</label>
                <input type="number" className="form-control" value={coords.radius}
                  onChange={e => setCoords({...coords, radius:e.target.value})} />
              </div>
              <button className="btn-primary-custom" style={{ flexShrink:0 }}><i className="bi bi-search"></i> Rechercher</button>
            </div>
            <button onClick={getCurrentLocation} className="btn-outline-primary-custom btn-sm-custom mt-3">
              <i className="bi bi-crosshair"></i> Utiliser ma position actuelle
            </button>
          </div>
        </div>
        <div style={{ display:'flex', gap:24 }}>
          <div style={{ flex:2 }}>
            <div id="carte-ateliers" style={{ height:500, borderRadius:10 }}></div>
          </div>
          <div style={{ flex:1, maxHeight:500, overflowY:'auto' }}>
            <h5 style={{ marginBottom:16 }}><i className="bi bi-shop me-2"></i>Tous les ateliers ({ateliers.length})</h5>
            {ateliers.length > 0 ? ateliers.map(a => (
              <div key={a.id} className="card-custom mb-3" style={{ padding:16 }}>
                <h6 style={{ fontWeight:700, marginBottom:4 }}>{a.nom}</h6>
                <p className="text-muted" style={{ fontSize:'0.85rem', margin:'2px 0' }}>{a.adresse}</p>
                <p style={{ fontSize:'0.85rem', margin:'2px 0' }}>
                  <i className="bi bi-person me-1"></i>{a.prestataire?.user?.username}
                  {a.prestataire?.specialite && <span className="badge badge-info ms-2">{a.prestataire.specialite}</span>}
                </p>
                <div style={{ display:'flex', gap:6, marginTop:10, flexWrap:'wrap' }}>
                  <a href={`tel:${a.telephone}`} className="btn-outline-primary-custom btn-sm-custom" style={{ borderColor:'#28a745', color:'#28a745' }}>
                    <i className="bi bi-telephone"></i> Appeler
                  </a>
                  <a href={`https://wa.me/228${a.telephone}`} target="_blank" rel="noreferrer" className="btn-whatsapp btn-sm-custom">
                    <i className="bi bi-whatsapp"></i> WhatsApp
                  </a>
                  <a href={`https://www.google.com/maps/dir/?api=1&destination=${a.latitude},${a.longitude}`} target="_blank" rel="noreferrer"
                    className="btn-outline-primary-custom btn-sm-custom">
                    <i className="bi bi-sign-turn-right"></i> Itinéraire
                  </a>
                </div>
              </div>
            )) : <div className="empty-state"><i className="bi bi-shop"></i><p>Aucun atelier disponible.</p></div>}
          </div>
        </div>
      </div>
    </div>
  );
}

export function AjouterAtelier() {
  const [form, setForm] = useState({ nom:'', adresse:'', latitude:'', longitude:'', telephone:'', description:'', est_actif:true });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const set = f => e => setForm(p => ({ ...p, [f]: e.type==='checkbox' ? e.target.checked : e.target.value }));

  useEffect(() => {
    if (!window.L) return;
    const existing = document.getElementById('map-ajouter');
    if (existing && existing._leaflet_id) return;
    const map = window.L.map('map-ajouter').setView([6.125580, 1.232456], 7);
    window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution:'© OpenStreetMap' }).addTo(map);
    let marker = null;
    map.on('click', e => {
      const { lat, lng } = e.latlng;
      setForm(p => ({ ...p, latitude: lat.toFixed(6), longitude: lng.toFixed(6) }));
      if (marker) marker.setLatLng(e.latlng);
      else marker = window.L.marker(e.latlng).addTo(map);
    });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true); setErrors({});
    try { await api.post('/ateliers/', form); navigate('/mes-ateliers'); }
    catch (err) { setErrors(err.response?.data || {}); }
    finally { setLoading(false); }
  };

  return (
    <div className="py-5">
      <div className="container">
        <div className="page-header">
          <h2><i className="bi bi-geo-alt text-primary me-2"></i>Ajouter un Atelier</h2>
          <p className="text-muted">Ajoutez un nouvel atelier pour votre activité</p>
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
                      <small>Ex: 6.125580 pour Lomé</small>
                    </div>
                    <div style={{ flex:1 }}>
                      <label className="form-label">Longitude</label>
                      <input type="number" step="0.000001" className="form-control" value={form.longitude} onChange={set('longitude')} placeholder="1.232456" />
                      <small>Ex: 1.232456 pour Lomé</small>
                    </div>
                  </div>
                  <div className="mb-3"><label className="form-label">Sélectionner sur la carte</label>
                    <div id="map-ajouter" style={{ height:280, borderRadius:8 }}></div>
                    <small>Cliquez sur la carte pour sélectionner la position</small>
                  </div>
                  <div className="mb-3"><label className="form-label">Téléphone</label>
                    <input type="text" className="form-control" value={form.telephone} onChange={set('telephone')} />
                  </div>
                  <div className="mb-3"><label className="form-label">Description</label>
                    <textarea className="form-control" value={form.description} onChange={set('description')} />
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
                      {loading ? 'Enregistrement...' : <><i className="bi bi-check-circle"></i> Enregistrer l'atelier</>}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
          <div style={{ flex:1 }}>
            <div className="card-custom" style={{ background:'#f8fafb' }}>
              <div className="card-body-custom">
                <h5 style={{ marginBottom:12 }}><i className="bi bi-info-circle me-2"></i>Comment obtenir les coordonnées ?</h5>
                <ol style={{ paddingLeft:20, lineHeight:1.9, fontSize:'0.9rem' }}>
                  <li>Ouvrez Google Maps</li>
                  <li>Allez à l'emplacement de votre atelier</li>
                  <li>Appuyez longtemps sur le point exact</li>
                  <li>Les coordonnées apparaîtront en haut</li>
                  <li>Copiez latitude et longitude ici</li>
                </ol>
                <hr />
                <h5 style={{ marginBottom:10 }}><i className="bi bi-geo me-2"></i>Villes du Togo :</h5>
                <ul style={{ listStyle:'none', padding:0, fontSize:'0.85rem' }}>
                  {[['Lomé','6.1256, 1.2325'],['Kpalimé','6.9000, 0.6333'],['Sokodé','8.5667, 0.9833'],['Kara','9.5500, 1.1667'],['Dapaong','10.7833, 0.0333']].map(([v,c]) => (
                    <li key={v} style={{ marginBottom:6 }}><strong>{v}:</strong> <span className="text-muted">{c}</span></li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}