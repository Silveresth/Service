import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

export default function MesAteliers() {
  const [ateliers, setAteliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteModal, setDeleteModal] = useState(null);

  useEffect(() => {
    api.get('/ateliers/mes_ateliers/').then(r => setAteliers(r.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!loading && ateliers.length > 0 && window.L) {
      const existing = document.getElementById('map-mes-ateliers');
      if (existing && existing._leaflet_id) return;
      const map = window.L.map('map-mes-ateliers').setView([6.125580, 1.232456], 7);
      window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution:'© OpenStreetMap' }).addTo(map);
      const bounds = [];
      ateliers.forEach(a => {
        if (a.latitude && a.longitude) {
          window.L.marker([a.latitude, a.longitude]).addTo(map).bindPopup(`<b>${a.nom}</b><br>${a.adresse}`);
          bounds.push([parseFloat(a.latitude), parseFloat(a.longitude)]);
        }
      });
      if (bounds.length > 0) map.fitBounds(bounds, { padding:[50,50] });
    }
  }, [loading, ateliers]);

  const handleDelete = async (id) => {
    try { await api.delete(`/ateliers/${id}/`); setAteliers(p => p.filter(a => a.id !== id)); setDeleteModal(null); }
    catch { alert('Erreur lors de la suppression'); }
  };

  if (loading) return <div style={{ textAlign:'center', padding:80 }}><i className="bi bi-hourglass-split" style={{ fontSize:'3rem', color:'var(--primary-color)' }}></i></div>;

  return (
    <div className="py-5">
      <div className="container">
        <div className="page-header">
          <h2><i className="bi bi-geo-alt text-primary me-2"></i>Mes Ateliers</h2>
          <p className="text-muted">Gérez vos ateliers et localisations</p>
        </div>
        <div style={{ display:'flex', gap:12, marginBottom:24 }}>
          <Link to="/ajouter-atelier" className="btn-primary-custom"><i className="bi bi-plus-circle"></i> Ajouter un atelier</Link>
          <Link to="/ateliers" className="btn-outline-primary-custom"><i className="bi bi-map"></i> Voir sur la carte</Link>
        </div>
        <div className="card-custom mb-4">
          <div className="card-header-custom"><i className="bi bi-list-ul text-primary"></i> Mes Ateliers ({ateliers.length})</div>
          <div className="card-body-custom">
            {ateliers.length > 0 ? (
              <div className="table-responsive">
                <table className="table-custom" style={{ width:'100%' }}>
                  <thead><tr><th>Nom</th><th>Adresse</th><th>Téléphone</th><th>Coordonnées</th><th>Statut</th><th>Actions</th></tr></thead>
                  <tbody>
                    {ateliers.map(a => (
                      <tr key={a.id}>
                        <td><strong>{a.nom}</strong>{a.description && <><br /><small className="text-muted">{a.description.split(' ').slice(0,8).join(' ')}...</small></>}</td>
                        <td>{a.adresse}</td>
                        <td><a href={`tel:${a.telephone}`}>{a.telephone}</a></td>
                        <td><small className="text-muted">{a.latitude}, {a.longitude}</small></td>
                        <td><span className={`badge ${a.est_actif?'badge-success':'badge-secondary'}`}>{a.est_actif?'Actif':'Inactif'}</span></td>
                        <td style={{ display:'flex', gap:6 }}>
                          <a href={`https://www.google.com/maps/dir/?api=1&destination=${a.latitude},${a.longitude}`} target="_blank" rel="noreferrer"
                            className="btn-outline-primary-custom btn-sm-custom" style={{ borderColor:'#28a745', color:'#28a745' }}>
                            <i className="bi bi-sign-turn-right"></i>
                          </a>
                          <button onClick={() => setDeleteModal(a)} className="btn-outline-danger-custom btn-sm-custom">
                            <i className="bi bi-trash"></i>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="empty-state">
                <i className="bi bi-geo-alt"></i><h4>Aucun atelier</h4>
                <p>Ajoutez votre premier atelier pour que les clients puissent vous localiser.</p>
                <Link to="/ajouter-atelier" className="btn-primary-custom"><i className="bi bi-plus-circle"></i> Ajouter mon premier atelier</Link>
              </div>
            )}
          </div>
        </div>
        {ateliers.length > 0 && (
          <div className="card-custom">
            <div className="card-header-custom"><i className="bi bi-map text-primary"></i> Aperçu sur carte</div>
            <div className="card-body-custom">
              <div id="map-mes-ateliers" style={{ height:300, borderRadius:8 }}></div>
            </div>
          </div>
        )}
      </div>
      {deleteModal && (
        <div className="modal-overlay" onClick={() => setDeleteModal(null)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header-custom">
              <h5 style={{ margin:0 }}>Confirmer la suppression</h5>
              <button onClick={() => setDeleteModal(null)} style={{ background:'none', border:'none', fontSize:'1.2rem', cursor:'pointer' }}>×</button>
            </div>
            <div className="modal-body-custom">
              <p>Êtes-vous sûr de vouloir supprimer <strong>{deleteModal.nom}</strong> ?</p>
              <div className="alert alert-warning"><i className="bi bi-info-circle"></i> Cette action est irréversible.</div>
            </div>
            <div className="modal-footer-custom">
              <button onClick={() => setDeleteModal(null)} className="btn-secondary-custom">Annuler</button>
              <button onClick={() => handleDelete(deleteModal.id)} className="btn-danger-custom"><i className="bi bi-trash"></i> Supprimer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}