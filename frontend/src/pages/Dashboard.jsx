import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const { user } = useAuth();
  const [services, setServices] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [ateliers, setAteliers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/services/mes_services/').catch(() => ({ data: [] })),
      api.get('/reservations/').catch(() => ({ data: [] })),
      api.get('/ateliers/mes_ateliers/').catch(() => ({ data: [] })),
    ]).then(([sR, rR, aR]) => {
      setServices(sR.data); setReservations(rR.data); setAteliers(aR.data);
    }).finally(() => setLoading(false));
  }, []);

  const totalRevenus = reservations.reduce((s, r) => s + (parseFloat(r.montant) || 0), 0);

  const Stat = ({ label, value, icon, type='primary' }) => (
    <div style={{ flex:'0 0 25%', maxWidth:'25%', padding:'0 12px 24px' }}>
      <div className="dashboard-card">
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <div>
            <p className="text-muted mb-1" style={{ fontSize:'0.85rem' }}>{label}</p>
            <h3 style={{ fontWeight:800, margin:0 }}>{value}</h3>
          </div>
          <div className={`icon-box ${type}`}><i className={`bi bi-${icon}`}></i></div>
        </div>
      </div>
    </div>
  );

  if (loading) return <div style={{ textAlign:'center', padding:80 }}><i className="bi bi-hourglass-split" style={{ fontSize:'3rem', color:'var(--primary-color)' }}></i></div>;

  return (
    <div className="py-5">
      <div className="container">
        <div className="page-header">
          <h2><i className="bi bi-speedometer2 text-primary me-2"></i>Dashboard Prestataire</h2>
          <p className="text-muted">Bienvenue, {user?.username} !</p>
        </div>
        <div className="dashboard-stat-grid" style={{ display:'flex', flexWrap:'wrap', margin:'0 -12px', marginBottom:24 }}>
          <Stat label="Mes Services" value={services.length} icon="briefcase" type="primary" />
          <Stat label="Réservations" value={reservations.length} icon="calendar-check" type="accent" />
          <Stat label="Revenus" value={`${totalRevenus} Fcfa`} icon="currency-dollar" type="secondary" />
          <Stat label="Mes Ateliers" value={ateliers.length} icon="geo-alt" type="primary" />
        </div>
        <div style={{ display:'flex', gap:12, flexWrap:'wrap', marginBottom:24 }}>
          <Link to="/ajouter-service" className="btn-primary-custom"><i className="bi bi-plus-circle"></i> Ajouter un service</Link>
          <Link to="/mes-services" className="btn-outline-primary-custom"><i className="bi bi-briefcase"></i> Mes services</Link>
          <Link to="/services" className="btn-outline-primary-custom"><i className="bi bi-eye"></i> Voir tous les services</Link>
          <Link to="/mes-ateliers" className="btn-outline-primary-custom" style={{ borderColor:'#28a745', color:'#28a745' }}><i className="bi bi-geo-alt"></i> Gérer mes ateliers</Link>
          <Link to="/ateliers" className="btn-outline-primary-custom" style={{ borderColor:'#17a2b8', color:'#17a2b8' }}><i className="bi bi-map"></i> Carte</Link>
        </div>
        <div className="card-custom mb-4">
          <div className="card-header-custom"><i className="bi bi-list-ul text-primary"></i> Mes Services</div>
          <div className="card-body-custom">
            {services.length > 0 ? (
              <div className="table-responsive">
                <table className="table-custom" style={{ width:'100%' }}>
                  <thead><tr><th>Service</th><th>Catégorie</th><th>Prix</th><th>Dispo</th><th>Action</th></tr></thead>
                  <tbody>
                    {services.map(s => (
                      <tr key={s.id}>
                        <td><strong>{s.nom}</strong><br /><small className="text-muted">{s.description?.split(' ').slice(0,8).join(' ')}...</small></td>
                        <td>{s.categorie?.nom || '-'}</td>
                        <td>{s.prix} Fcfa</td>
                        <td><span className={`badge ${s.disponibilite ? 'badge-success' : 'badge-secondary'}`}>{s.disponibilite ? 'Oui' : 'Non'}</span></td>
                        <td><Link to={`/services/${s.id}`} className="btn-outline-primary-custom btn-sm-custom"><i className="bi bi-eye"></i></Link></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="empty-state">
                <i className="bi bi-inbox"></i><h4>Aucun service</h4>
                <Link to="/ajouter-service" className="btn-primary-custom"><i className="bi bi-plus-circle"></i> Créer mon premier service</Link>
              </div>
            )}
          </div>
        </div>
        {reservations.length > 0 && (
          <div className="card-custom">
            <div className="card-header-custom"><i className="bi bi-calendar-check text-primary"></i> Réservations récentes</div>
            <div className="card-body-custom">
              <div className="table-responsive">
                <table className="table-custom" style={{ width:'100%' }}>
                  <thead><tr><th>Client</th><th>Service</th><th>Date</th><th>Montant</th><th>Statut</th></tr></thead>
                  <tbody>
                    {reservations.map(r => (
                      <tr key={r.id}>
                        <td>{r.client?.user?.username || '-'}</td>
                        <td>{r.service?.nom || '-'}</td>
                        <td>{r.date_res ? new Date(r.date_res).toLocaleDateString('fr-FR') : '-'}</td>
                        <td>{r.montant} Fcfa</td>
                        <td><span className={`badge ${r.statut==='Confirmé'?'badge-success':r.statut==='En attente'?'badge-warning':'badge-secondary'}`}>{r.statut}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}