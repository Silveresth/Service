import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function MesReservations() {
  const { user } = useAuth();
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/reservations/').then(res => setReservations(res.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  const copyUSSD = (ussd) => navigator.clipboard.writeText(ussd).then(() => alert('USSD copié !'));

  const statutClass = (s) => {
    if (s === 'Confirmé') return 'badge-success';
    if (s === 'En attente') return 'badge-warning';
    return 'badge-secondary';
  };

  if (loading) return (
    <div style={{ textAlign:'center', padding:80 }}>
      <i className="bi bi-hourglass-split" style={{ fontSize:'3rem', color:'var(--primary-color)' }}></i>
    </div>
  );

  return (
    <div className="py-5">
      <div className="container">
        <div style={{ display:'flex', flexWrap:'wrap', gap:0, margin:'0 -12px' }}>

          {/* Sidebar */}
          <div style={{ flex:'0 0 25%', maxWidth:'25%', padding:'0 12px 24px' }}>
            <div className="card-custom" style={{ padding:24 }}>
              <div style={{ textAlign:'center', marginBottom:24 }}>
                <div className="avatar avatar-lg" style={{ margin:'0 auto 12px' }}>
                  {user?.username?.[0]?.toUpperCase()}
                </div>
                <h5 style={{ fontWeight:700, marginBottom:6 }}>{user?.username}</h5>
                <span className="badge badge-success">{user?.type_compte || 'Client'}</span>
              </div>
              <nav style={{ display:'flex', flexDirection:'column', gap:4 }}>
                {[
                  { to:'/mes-reservations', icon:'calendar-check', label:'Mes réservations', active:true },
                  { to:'/mon-compte', icon:'person', label:'Mon compte' },
                  { to:'/', icon:'house', label:"Retour à l'accueil" },
                ].map(item => (
                  <Link key={item.to} to={item.to} style={{
                    display:'flex', alignItems:'center', gap:10, padding:'10px 14px',
                    borderRadius:8, textDecoration:'none', fontWeight:500, fontSize:'0.9rem',
                    background: item.active ? 'var(--primary-light)' : 'transparent',
                    color: item.active ? 'var(--primary-dark)' : 'var(--text-dark)',
                    transition:'all 0.2s'
                  }}>
                    <i className={`bi bi-${item.icon}`}></i> {item.label}
                  </Link>
                ))}
              </nav>
            </div>
          </div>

          {/* Main content */}
          <div style={{ flex:'0 0 75%', maxWidth:'75%', padding:'0 12px' }}>
            <h2 style={{ fontWeight:800, marginBottom:24 }}>
              <i className="bi bi-calendar-check text-primary me-2"></i>Mes Réservations
            </h2>

            {reservations.length > 0 ? (
              <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
                {reservations.map(r => (
                  <div key={r.id} className="card-custom" style={{ padding:24 }}>
                    {/* Header */}
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:16 }}>
                      <div>
                        <h5 style={{ fontWeight:700, marginBottom:4 }}>{r.service?.nom || r.service}</h5>
                        <p className="text-muted" style={{ margin:0, fontSize:'0.9rem' }}>
                          <i className="bi bi-person me-1"></i>
                          {user?.type_compte === 'client'
                            ? `Prestataire: ${r.service?.prestataire?.user?.username || '-'}`
                            : `Client: ${r.client?.user?.username || r.client}`}
                        </p>
                      </div>
                      <span className={`badge ${statutClass(r.statut)}`} style={{ fontSize:'0.85rem', padding:'6px 14px' }}>
                        {r.statut}
                      </span>
                    </div>

                    <div style={{ display:'flex', flexWrap:'wrap', gap:0 }}>
                      {/* Left */}
                      <div style={{ flex:'0 0 50%', maxWidth:'50%' }}>
                        <p style={{ marginBottom:6, fontSize:'0.9rem' }}>
                          <strong>Date:</strong>{' '}
                          {r.date_res ? new Date(r.date_res).toLocaleString('fr-FR') : '-'}
                        </p>
                        {r.paiement && (<>
                          <p style={{ marginBottom:4, fontSize:'0.9rem' }}>
                            <strong>Méthode:</strong> {r.paiement.methode}
                          </p>
                          <p style={{ marginBottom:4, fontSize:'0.83rem', color:'var(--text-muted)' }}>
                            <strong>Référence:</strong> {r.paiement.transaction_ref}
                          </p>
                          <p style={{ marginBottom:4, fontSize:'0.83rem', color:'var(--text-muted)' }}>
                            <strong>Prestataire:</strong> {r.paiement.montant_prestataire} FCFA ({r.paiement.numero_prestataire})
                          </p>
                          <p style={{ marginBottom:4, fontSize:'0.83rem', color:'var(--text-muted)' }}>
                            <strong>Frais:</strong> {r.paiement.montant_frais} FCFA ({r.paiement.numero_admin})
                          </p>
                          {r.paiement.ussd_prestataire && (
                            <details style={{ marginBottom:8 }}>
                              <summary style={{ cursor:'pointer', color:'var(--primary-color)', fontSize:'0.85rem' }}>
                                USSD Prestataire
                              </summary>
                              <code style={{ display:'block', background:'#f8fafb', padding:'6px 10px', borderRadius:6, marginTop:6, fontSize:'0.83rem' }}>
                                {r.paiement.ussd_prestataire}
                              </code>
                            </details>
                          )}
                        </>)}
                        <p style={{ marginBottom:0 }}>
                          <strong>Total:</strong>{' '}
                          <span style={{ color:'var(--primary-color)', fontWeight:800 }}>{r.montant} FCFA</span>
                        </p>
                      </div>

                      {/* Right actions */}
                      <div style={{ flex:'0 0 50%', maxWidth:'50%', display:'flex', flexDirection:'column', alignItems:'flex-end', justifyContent:'flex-end', gap:8 }}>
                        <Link to={`/services/${r.service?.id || r.service}`} className="btn-outline-primary-custom btn-sm-custom">
                          <i className="bi bi-eye"></i> Voir service
                        </Link>
                        {r.paiement?.ussd_prestataire && (
                          <button onClick={() => copyUSSD(r.paiement.ussd_prestataire)}
                            className="btn-primary-custom btn-sm-custom"
                            style={{ background:'linear-gradient(135deg,#28a745,#1e7e34)' }}>
                            <i className="bi bi-copy"></i> Copier USSD Prest
                          </button>
                        )}
                        {user?.type_compte === 'client' && !r.evaluation ? (
                          <Link to={`/evaluer/${r.id}`} className="btn-primary-custom btn-sm-custom"
                            style={{ background:'linear-gradient(135deg,#ffc107,#e0a800)', color:'#333' }}>
                            <i className="bi bi-star"></i> Évaluer
                          </Link>
                        ) : r.evaluation ? (
                          <span className="badge badge-warning" style={{ padding:'8px 12px' }}>
                            <i className="bi bi-star-fill me-1"></i>{r.evaluation.note}/5
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <i className="bi bi-calendar-x"></i>
                <h4>Aucune réservation</h4>
                <p>Vous n'avez pas encore de réservations.</p>
                <Link to="/services" className="btn-primary-custom">
                  <i className="bi bi-grid-3x3-gap"></i> Parcourir les services
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}