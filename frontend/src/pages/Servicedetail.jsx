import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function ServiceDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [service, setService] = useState(null);
  const [others, setOthers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get(`/services/${id}/`), api.get('/services/')])
      .then(([sRes, allRes]) => {
        setService(sRes.data);
        setOthers(allRes.data.filter(s => s.id !== parseInt(id)).slice(0,3));
      }).catch(console.error).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div style={{ textAlign:'center', padding:80 }}><i className="bi bi-hourglass-split" style={{ fontSize:'3rem', color:'var(--primary-color)' }}></i></div>;
  if (!service) return <div className="container py-5"><div className="alert alert-danger">Service introuvable.</div></div>;

  const phone = service.prestataire?.user?.telephone || '90000000';
  const waMsg = `Bonjour, je suis intéressé(e) par le service '${service.nom}' affiché sur Service Market.`;

  return (
    <div className="py-5">
      <div className="container">
        <ol className="breadcrumb">
          <li><Link to="/">Accueil</Link></li>
          <span className="breadcrumb-separator">›</span>
          <li><Link to="/services">Services</Link></li>
          <span className="breadcrumb-separator">›</span>
          <li className="breadcrumb-active">{service.nom}</li>
        </ol>
        <div style={{ display:'flex', flexWrap:'wrap', gap:0, margin:'0 -12px' }}>
          <div style={{ flex:'0 0 50%', maxWidth:'50%', padding:'0 12px' }}>
            <div className="card-custom" style={{ padding:'60px 40px', textAlign:'center' }}>
              <i className="bi bi-briefcase-fill text-primary" style={{ fontSize:'8rem', opacity:0.7 }}></i>
            </div>
          </div>
          <div style={{ flex:'0 0 50%', maxWidth:'50%', padding:'0 12px' }}>
            <div style={{ marginBottom:16, display:'flex', gap:10, alignItems:'center' }}>
              <span className="badge-category">{service.categorie?.nom || 'Service'}</span>
              <span className={`badge ${service.disponibilite ? 'badge-success' : 'badge-secondary'}`}>
                {service.disponibilite ? 'Disponible' : 'Indisponible'}
              </span>
            </div>
            <h1 style={{ fontSize:'2rem', fontWeight:800, marginBottom:16 }}>{service.nom}</h1>
            <div style={{ display:'flex', alignItems:'center', marginBottom:24 }}>
              <div className="avatar me-3">{service.prestataire?.user?.username?.[0]?.toUpperCase()}</div>
              <div>
                <p style={{ margin:0, fontWeight:700 }}>Prestataire</p>
                <p className="text-muted" style={{ margin:0 }}>{service.prestataire?.user?.username}</p>
              </div>
            </div>
            <p style={{ fontSize:'1.05rem', lineHeight:1.7, marginBottom:24 }}>{service.description}</p>
            <div style={{ marginBottom:24 }}>
              <p className="text-muted" style={{ fontSize:'0.85rem', margin:0 }}>Prix du service</p>
              <h2 style={{ color:'var(--primary-color)', fontWeight:800, margin:0 }}>{service.prix} Fcfa</h2>
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
              {!user ? (
                <Link to={`/login`} className="btn-primary-custom" style={{ justifyContent:'center', padding:'14px' }}>
                  <i className="bi bi-box-arrow-in-right"></i> Connectez-vous pour réserver
                </Link>
              ) : user.type_compte === 'client' ? (
                service.disponibilite ? (
                  <Link to={`/reserver/${service.id}`} className="btn-primary-custom" style={{ justifyContent:'center', padding:'14px' }}>
                    <i className="bi bi-calendar-check"></i> Réserver maintenant
                  </Link>
                ) : (
                  <button disabled className="btn-secondary-custom" style={{ justifyContent:'center', padding:'14px', cursor:'not-allowed' }}>
                    <i className="bi bi-x-circle"></i> Service indisponible
                  </button>
                )
              ) : (
                <div className="alert alert-warning"><i className="bi bi-exclamation-triangle"></i> Seul un client peut réserver.</div>
              )}
              <a href={`https://wa.me/228${phone}?text=${encodeURIComponent(waMsg)}`}
                target="_blank" rel="noreferrer" className="btn-whatsapp" style={{ justifyContent:'center', padding:'14px' }}>
                <i className="bi bi-whatsapp"></i> Contacter sur WhatsApp
              </a>
            </div>
          </div>
        </div>
        <div className="card-custom mt-5" style={{ padding:32 }}>
          <h4 style={{ marginBottom:24 }}><i className="bi bi-info-circle text-primary me-2"></i>Informations supplémentaires</h4>
          <div style={{ display:'flex', flexWrap:'wrap' }}>
            <div style={{ flex:'0 0 50%', maxWidth:'50%' }}>
              {[['check-circle text-success','Service effectué par un professionnel vérifié'],['shield-check text-success','Paiement sécurisé'],['clock-history text-success','Intervention rapide']].map(([ic,tx]) => (
                <div key={tx} style={{ display:'flex', alignItems:'center', gap:10, marginBottom:14 }}><i className={`bi bi-${ic}`}></i> {tx}</div>
              ))}
            </div>
            <div style={{ flex:'0 0 50%', maxWidth:'50%' }}>
              {[['star text-warning','Évaluation des clients'],['arrow-repeat text-primary','Service après-vente'],['chat-dots text-info','Support disponible 7j/7']].map(([ic,tx]) => (
                <div key={tx} style={{ display:'flex', alignItems:'center', gap:10, marginBottom:14 }}><i className={`bi bi-${ic}`}></i> {tx}</div>
              ))}
            </div>
          </div>
        </div>
        {others.length > 0 && (
          <div className="mt-5">
            <h3 className="mb-4"><i className="bi bi-grid-3x3-gap text-primary me-2"></i>Autres services similaires</h3>
            <div style={{ display:'flex', flexWrap:'wrap', margin:'0 -12px' }}>
              {others.map(s => (
                <div key={s.id} style={{ flex:'0 0 33.333%', maxWidth:'33.333%', padding:'0 12px 24px' }}>
                  <div className="card-custom">
                    <div className="card-body-custom">
                      <h5 style={{ fontWeight:700 }}>{s.nom}</h5>
                      <p className="text-muted" style={{ fontSize:'0.9rem' }}>{s.description?.split(' ').slice(0,10).join(' ')}...</p>
                      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                        <span className="price">{s.prix} Fcfa</span>
                        <Link to={`/services/${s.id}`} className="btn-outline-primary-custom btn-sm-custom">Voir</Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}