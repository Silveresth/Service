import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import GoogleMapAteliers from '../../components/GoogleMapAteliers';

const STYLE = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Outfit:wght@600;700;800&display=swap');

.ma-container {
  font-family: 'Plus Jakarta Sans', sans-serif;
  background: #f8fafc;
  min-height: 100vh;
  padding: 40px 0 80px;
}

.ma-header {
  margin-bottom: 32px;
}

.ma-title-wrap {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 20px;
  margin-bottom: 24px;
}

.ma-title-box h2 {
  font-family: 'Outfit', sans-serif;
  font-weight: 800;
  font-size: 2.2rem;
  color: #0c2340;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 12px;
}

.ma-title-box p {
  color: #64748b;
  margin: 6px 0 0;
  font-size: 0.95rem;
}

.ma-btn-add {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  border-radius: 14px;
  background: linear-gradient(135deg, #0284c7, #0369a1);
  color: white;
  font-weight: 700;
  font-size: 0.92rem;
  text-decoration: none;
  box-shadow: 0 10px 20px rgba(2, 132, 199, 0.2);
  transition: all 0.2s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.ma-btn-add:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 24px rgba(2, 132, 199, 0.3);
  color: white;
}

/* KPI CARD ROW */
.ma-kpi-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 20px;
  margin-bottom: 32px;
}

.ma-kpi-card {
  background: white;
  border-radius: 20px;
  border: 1.5px solid #e2e8f0;
  padding: 22px;
  display: flex;
  align-items: center;
  gap: 18px;
  box-shadow: 0 4px 12px rgba(12, 35, 64, 0.02);
  transition: transform 0.2s;
}

.ma-kpi-card:hover {
  transform: translateY(-2px);
}

.ma-kpi-icon {
  width: 52px;
  height: 52px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  flex-shrink: 0;
}

.ma-kpi-val {
  font-family: 'Outfit', sans-serif;
  font-weight: 800;
  font-size: 1.8rem;
  color: #0c2340;
  line-height: 1.1;
}

.ma-kpi-lbl {
  color: #64748b;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  margin-top: 3px;
}

/* SEARCH ROW */
.ma-search-row {
  background: white;
  border-radius: 18px;
  border: 1.5px solid #e2e8f0;
  padding: 16px;
  margin-bottom: 24px;
  display: flex;
  gap: 16px;
  align-items: center;
  flex-wrap: wrap;
}

.ma-search-box {
  position: relative;
  flex: 1;
  min-width: 240px;
}

.ma-search-box i {
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: #94a3b8;
  font-size: 1.05rem;
}

.ma-search-input {
  width: 100%;
  padding: 11px 16px 11px 44px;
  border-radius: 12px;
  border: 1.5px solid #e2e8f0;
  outline: none;
  font-family: inherit;
  font-size: 0.9rem;
  background: #f8fafc;
  transition: all 0.2s;
}

.ma-search-input:focus {
  border-color: #0284c7;
  background: white;
  box-shadow: 0 0 0 3px rgba(2, 132, 199, 0.1);
}

.ma-filter-select {
  padding: 11px 16px;
  border-radius: 12px;
  border: 1.5px solid #e2e8f0;
  outline: none;
  font-family: inherit;
  font-size: 0.88rem;
  background: #f8fafc;
  font-weight: 600;
  color: #475569;
  cursor: pointer;
  min-width: 160px;
}

.ma-filter-select:focus {
  border-color: #0284c7;
}

/* CARDS GRID */
.ma-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
  margin-bottom: 36px;
}

.ma-card {
  background: white;
  border-radius: 22px;
  border: 1.5px solid #e2e8f0;
  padding: 24px;
  position: relative;
  display: flex;
  flex-direction: column;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.02);
  transition: all 0.25s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.ma-card:hover {
  border-color: #0284c7;
  transform: translateY(-4px);
  box-shadow: 0 12px 28px rgba(2, 132, 199, 0.06);
}

.ma-card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 14px;
}

.ma-card-icon {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.4rem;
  flex-shrink: 0;
}

.ma-card-title {
  font-family: 'Outfit', sans-serif;
  font-weight: 800;
  font-size: 1.15rem;
  color: #0c2340;
  margin: 0;
  line-height: 1.3;
}

.ma-status-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 5px 12px;
  border-radius: 30px;
  font-size: 0.72rem;
  font-weight: 800;
  text-transform: uppercase;
}

.ma-status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  display: inline-block;
}

.ma-card-desc {
  color: #64748b;
  font-size: 0.84rem;
  line-height: 1.6;
  margin: 0 0 18px;
  flex-grow: 1;
}

.ma-card-details {
  border-top: 1.5px solid #f1f5f9;
  padding-top: 16px;
  margin-bottom: 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.ma-detail-item {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 0.82rem;
  color: #475569;
}

.ma-detail-item i {
  color: #0284c7;
  font-size: 0.95rem;
}

.ma-detail-link {
  color: inherit;
  text-decoration: none;
  font-weight: 600;
  transition: color 0.15s;
}

.ma-detail-link:hover {
  color: #0284c7;
  text-decoration: underline;
}

.ma-card-actions {
  display: flex;
  gap: 10px;
  margin-top: auto;
}

.ma-btn-action {
  flex: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 10px 14px;
  border-radius: 12px;
  font-weight: 700;
  font-size: 0.8rem;
  text-decoration: none;
  border: 1.5px solid #e2e8f0;
  background: white;
  color: #475569;
  cursor: pointer;
  transition: all 0.2s;
}

.ma-btn-action:hover {
  border-color: #0284c7;
  color: #0284c7;
  background: #f0f9ff;
}

.ma-btn-action-delete {
  border-color: #fca5a5;
  color: #dc2626;
  background: #fff5f5;
}

.ma-btn-action-delete:hover {
  background: #fee2e2;
  border-color: #ef4444;
  color: #b91c1c;
}

/* MAP PREVIEW CARD */
.ma-map-card {
  background: white;
  border-radius: 24px;
  border: 1.5px solid #e2e8f0;
  padding: 24px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.02);
}

.ma-map-title {
  font-family: 'Outfit', sans-serif;
  font-weight: 800;
  font-size: 1.25rem;
  color: #0c2340;
  margin: 0 0 16px;
  display: flex;
  align-items: center;
  gap: 10px;
}

/* EMPTY STATE */
.ma-empty {
  text-align: center;
  padding: 60px 24px;
  background: white;
  border-radius: 24px;
  border: 2px dashed #cbd5e1;
}

.ma-empty-icon {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background: #f0f9ff;
  color: #0284c7;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.2rem;
  margin: 0 auto 20px;
}

.ma-empty h4 {
  font-family: 'Outfit', sans-serif;
  font-weight: 800;
  font-size: 1.3rem;
  color: #0c2340;
  margin: 0 0 8px;
}

.ma-empty p {
  color: #64748b;
  max-width: 380px;
  margin: 0 auto 24px;
  font-size: 0.9rem;
  line-height: 1.6;
}

/* MODAL REDESIGN */
.ma-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(12, 35, 64, 0.4);
  backdrop-filter: blur(8px);
  z-index: 999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  animation: fadeIn 0.25s ease-out;
}

.ma-modal-box {
  background: white;
  border-radius: 24px;
  width: 100%;
  max-width: 480px;
  box-shadow: 0 25px 50px -12px rgba(12, 35, 64, 0.25);
  border: 1px solid rgba(255,255,255,0.8);
  overflow: hidden;
  animation: slideUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.ma-modal-header {
  padding: 20px 24px;
  border-bottom: 1.5px solid #f1f5f9;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.ma-modal-header h5 {
  font-family: 'Outfit', sans-serif;
  font-weight: 800;
  font-size: 1.15rem;
  color: #0c2340;
  margin: 0;
}

.ma-modal-close {
  background: #f1f5f9;
  border: none;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #64748b;
  font-size: 1.1rem;
  transition: all 0.15s;
}

.ma-modal-close:hover {
  background: #e2e8f0;
  color: #0c2340;
}

.ma-modal-body {
  padding: 24px;
}

.ma-modal-body p {
  margin: 0 0 16px;
  color: #475569;
  font-size: 0.92rem;
  line-height: 1.6;
}

.ma-modal-alert {
  padding: 12px 16px;
  border-radius: 12px;
  background: #fffbeb;
  border: 1.5px solid #fef3c7;
  color: #b45309;
  font-size: 0.8rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 8px;
}

.ma-modal-footer {
  padding: 16px 24px;
  background: #f8fafc;
  border-top: 1.5px solid #f1f5f9;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.ma-btn-modal-cancel {
  padding: 10px 18px;
  border-radius: 10px;
  border: 1.5px solid #cbd5e1;
  background: white;
  color: #475569;
  font-weight: 700;
  font-size: 0.84rem;
  cursor: pointer;
  transition: all 0.15s;
}

.ma-btn-modal-cancel:hover {
  background: #f1f5f9;
  color: #0c2340;
}

.ma-btn-modal-delete {
  padding: 10px 18px;
  border-radius: 10px;
  border: none;
  background: #dc2626;
  color: white;
  font-weight: 700;
  font-size: 0.84rem;
  cursor: pointer;
  transition: all 0.15s;
  box-shadow: 0 4px 12px rgba(220, 38, 38, 0.2);
}

.ma-btn-modal-delete:hover {
  background: #b91c1c;
  box-shadow: 0 6px 16px rgba(220, 38, 38, 0.3);
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

/* Toast message */
.ma-toast {
  position: fixed;
  bottom: 24px;
  right: 24px;
  background: #0c2340;
  color: white;
  padding: 12px 24px;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0,0,0,0.15);
  font-weight: 700;
  font-size: 0.85rem;
  z-index: 1000;
  display: flex;
  align-items: center;
  gap: 8px;
  animation: slideUp 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) both;
}

@media (max-width: 576px) {
  .ma-container { padding: 24px 0 60px; }
  .ma-title-box h2 { font-size: 1.7rem; }
  .ma-search-row { gap: 10px; padding: 12px; }
  .ma-search-input { font-size: 0.85rem; }
  .ma-filter-select { font-size: 0.82rem; min-width: 100%; }
}
`;

export default function MesAteliers() {
  const [ateliers, setAteliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteModal, setDeleteModal] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [toastMessage, setToastMessage] = useState('');

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  useEffect(() => {
    api.get('/ateliers/mes_ateliers/')
      .then(r => setAteliers(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id) => {
    try {
      await api.delete(`/ateliers/${id}/`);
      setAteliers(p => p.filter(a => a.id !== id));
      setDeleteModal(null);
      triggerToast('Atelier supprimé avec succès.');
    } catch {
      triggerToast('Erreur lors de la suppression.');
    }
  };

  const copyToClipboard = (lat, lng) => {
    navigator.clipboard.writeText(`${lat}, ${lng}`);
    triggerToast('Coordonnées copiées dans le presse-papiers.');
  };

  // Real-time search and filter logic
  const filteredAteliers = useMemo(() => {
    return ateliers.filter(a => {
      const matchesSearch = !searchQuery || 
        a.nom.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.adresse.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === 'all' || 
        (statusFilter === 'active' && a.est_actif) ||
        (statusFilter === 'inactive' && !a.est_actif);

      return matchesSearch && matchesStatus;
    });
  }, [ateliers, searchQuery, statusFilter]);

  const activeCount = useMemo(() => ateliers.filter(a => a.est_actif).length, [ateliers]);
  const inactiveCount = ateliers.length - activeCount;

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f8fafc' }}>
        <i className="bi bi-hourglass-split" style={{ fontSize: '3rem', color: '#0284c7', animation: 'spinRing 1.5s linear infinite' }} />
      </div>
    );
  }

  return (
    <>
      <style>{STYLE}</style>
      <div className="ma-container">
        <div className="container">
          
          {/* HEADER */}
          <div className="ma-header">
            <div className="ma-title-wrap">
              <div className="ma-title-box">
                <h2>
                  <i className="bi bi-shop text-primary" /> Mes Ateliers
                </h2>
                <p>Gérez vos ateliers, adresses et localisations GPS pour vos clients</p>
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                <Link to="/ajouter-atelier" className="ma-btn-add">
                  <i className="bi bi-plus-circle-fill" /> Ajouter un atelier
                </Link>
                <Link to="/ateliers" className="ma-btn-add" style={{ background: '#0c2340', boxShadow: '0 10px 20px rgba(12,35,64,0.15)' }}>
                  <i className="bi bi-map-fill" /> Carte publique
                </Link>
              </div>
            </div>
          </div>

          {/* KPI CARDS */}
          <div className="ma-kpi-grid">
            <div className="ma-kpi-card">
              <div className="ma-kpi-icon" style={{ background: '#f0fdfa', color: '#0d9488' }}>
                <i className="bi bi-shop" />
              </div>
              <div>
                <div className="ma-kpi-val">{ateliers.length}</div>
                <div className="ma-kpi-lbl">Total Ateliers</div>
              </div>
            </div>
            <div className="ma-kpi-card">
              <div className="ma-kpi-icon" style={{ background: '#f0fdf4', color: '#16a34a' }}>
                <i className="bi bi-check-circle" />
              </div>
              <div>
                <div className="ma-kpi-val">{activeCount}</div>
                <div className="ma-kpi-lbl">Actifs sur Carte</div>
              </div>
            </div>
            <div className="ma-kpi-card">
              <div className="ma-kpi-icon" style={{ background: '#f8fafc', color: '#64748b' }}>
                <i className="bi bi-eye-slash" />
              </div>
              <div>
                <div className="ma-kpi-val">{inactiveCount}</div>
                <div className="ma-kpi-lbl">Inactifs (Masqués)</div>
              </div>
            </div>
          </div>

          {/* SEARCH ROW */}
          <div className="ma-search-row">
            <div className="ma-search-box">
              <i className="bi bi-search" />
              <input 
                type="text" 
                placeholder="Rechercher par nom ou adresse..." 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="ma-search-input"
              />
            </div>
            <select 
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="ma-filter-select"
            >
              <option value="all">Tous les statuts</option>
              <option value="active">Actif (Visible)</option>
              <option value="inactive">Inactif (Masqué)</option>
            </select>
          </div>

          {/* LIST/GRID SECTION */}
          {filteredAteliers.length > 0 ? (
            <div className="ma-grid">
              {filteredAteliers.map(a => (
                <div className="ma-card" key={a.id}>
                  
                  <div className="ma-card-header">
                    <div className="ma-title-box">
                      <h5 className="ma-card-title">{a.nom}</h5>
                    </div>
                    <span className="ma-status-badge" style={{ 
                      background: a.est_actif ? '#f0fdf4' : '#f1f5f9', 
                      color: a.est_actif ? '#16a34a' : '#475569' 
                    }}>
                      <span className="ma-status-dot" style={{ background: a.est_actif ? '#16a34a' : '#94a3b8' }} />
                      {a.est_actif ? 'Actif' : 'Inactif'}
                    </span>
                  </div>

                  {a.description ? (
                    <p className="ma-card-desc">
                      {a.description.split(' ').slice(0, 16).join(' ')}
                      {a.description.split(' ').length > 16 ? '...' : ''}
                    </p>
                  ) : (
                    <p className="ma-card-desc" style={{ fontStyle: 'italic', color: '#94a3b8' }}>
                      Aucune description spécifiée.
                    </p>
                  )}

                  <div className="ma-card-details">
                    <div className="ma-detail-item">
                      <i className="bi bi-geo-alt-fill" />
                      <span>{a.adresse}</span>
                    </div>
                    {a.telephone && (
                      <div className="ma-detail-item">
                        <i className="bi bi-telephone-fill" />
                        <a href={`tel:${a.telephone}`} className="ma-detail-link">{a.telephone}</a>
                      </div>
                    )}
                    <div className="ma-detail-item">
                      <i className="bi bi-pin-angle-fill" />
                      <button 
                        onClick={() => copyToClipboard(a.latitude, a.longitude)}
                        style={{ background: 'none', border: 'none', padding: 0, font: 'inherit', color: 'inherit', display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontWeight: 600 }}
                        title="Copier les coordonnées GPS"
                      >
                        {a.latitude.slice(0, 8)}, {a.longitude.slice(0, 8)}
                        <i className="bi bi-clipboard" style={{ fontSize: '0.8rem', color: '#94a3b8' }} />
                      </button>
                    </div>
                  </div>

                  <div className="ma-card-actions">
                    <Link to={`/modifier-atelier/${a.id}`} className="ma-btn-action">
                      <i className="bi bi-pencil-fill" /> Modifier
                    </Link>
                    <a 
                      href={`https://www.google.com/maps/dir/?api=1&destination=${a.latitude},${a.longitude}`} 
                      target="_blank" 
                      rel="noreferrer"
                      className="ma-btn-action"
                    >
                      <i className="bi bi-navigation-fill" style={{ color: '#16a34a' }} /> GPS
                    </a>
                    <button 
                      onClick={() => setDeleteModal(a)} 
                      className="ma-btn-action ma-btn-action-delete"
                    >
                      <i className="bi bi-trash-fill" />
                    </button>
                  </div>

                </div>
              ))}
            </div>
          ) : (
            <div className="ma-empty">
              <div className="ma-empty-icon">
                <i className="bi bi-shop" />
              </div>
              <h4>Aucun atelier trouvé</h4>
              <p>
                {searchQuery || statusFilter !== 'all' 
                  ? 'Modifiez vos filtres de recherche pour afficher vos autres ateliers.'
                  : 'Ajoutez votre premier atelier professionnel pour être géolocalisé par les clients.'}
              </p>
              <Link to="/ajouter-atelier" className="ma-btn-add">
                <i className="bi bi-plus-circle-fill" /> Ajouter mon premier atelier
              </Link>
            </div>
          )}

          {/* MAP SUMMARY */}
          {filteredAteliers.length > 0 && (
            <div className="ma-map-card">
              <h5 className="ma-map-title">
                <i className="bi bi-map-fill" style={{ color: '#0284c7' }} /> Vos ateliers sur la carte
              </h5>
              <div style={{ height: 360, borderRadius: 16, overflow: 'hidden', border: '1.5px solid #e2e8f0' }}>
                <GoogleMapAteliers 
                  ateliers={filteredAteliers} 
                  selectedAtelier={null} 
                  onSelectAtelier={() => {}} 
                  zoom={7} 
                  searchLatLng={{ lat: 6.125580, lng: 1.232456 }} 
                  style={{ height: '100%', width: '100%' }} 
                />
              </div>
            </div>
          )}

        </div>
      </div>

      {/* TOAST MESSAGE */}
      {toastMessage && (
        <div className="ma-toast">
          <i className="bi bi-info-circle-fill" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* DELETE MODAL */}
      {deleteModal && (
        <div className="ma-modal-overlay" onClick={() => setDeleteModal(null)}>
          <div className="ma-modal-box" onClick={e => e.stopPropagation()}>
            
            <div className="ma-modal-header">
              <h5>Supprimer l'atelier</h5>
              <button className="ma-modal-close" onClick={() => setDeleteModal(null)}>×</button>
            </div>

            <div className="ma-modal-body">
              <p>
                Êtes-vous sûr de vouloir supprimer l'atelier <strong>{deleteModal.nom}</strong> ?
              </p>
              <div className="ma-modal-alert">
                <i className="bi bi-exclamation-triangle-fill" />
                <span>Cette action est définitive et masquera l'atelier de la carte.</span>
              </div>
            </div>

            <div className="ma-modal-footer">
              <button onClick={() => setDeleteModal(null)} className="ma-btn-modal-cancel">
                Annuler
              </button>
              <button onClick={() => handleDelete(deleteModal.id)} className="ma-btn-modal-delete">
                Supprimer
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
}