import { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';

export default function Reserver() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [service, setService] = useState(null);
  const [methode, setMethode] = useState('flooz');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [ussdInfo, setUssdInfo] = useState(null);

  useEffect(() => {
    api.get(`/services/${id}/`).then(res => setService(res.data)).catch(console.error).finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div style={{ textAlign:'center', padding:80 }}>
      <i className="bi bi-hourglass-split" style={{ fontSize:'3rem', color:'var(--primary-color)' }}></i>
    </div>
  );
  if (!service) return (
    <div className="container py-5">
      <div className="alert alert-danger">Service introuvable.</div>
    </div>
  );

  const prix = parseFloat(service.prix) || 0;
  const frais = Math.round(prix * 0.03);
  const total = prix + frais;
  const montantPrestataire = prix - frais;
  const prestPhone = service.prestataire?.telephone || service.prestataire?.user?.telephone || '90000000';
  const ref = `SM${Date.now()}`;

  const handlePayClick = (m) => {
    const ussd = m === 'flooz'
      ? `*155*1*${montantPrestataire}*228${prestPhone}*${ref}#`
      : `*145*1*${montantPrestataire}*228${prestPhone}*${ref}#`;
    setUssdInfo({ ussd, method: m });
    setMethode(m);
    if (/Android|iPhone/i.test(navigator.userAgent)) {
      window.location.href = 'tel:' + ussd;
    } else {
      navigator.clipboard.writeText(ussd).then(() =>
        alert('USSD copié dans le presse-papier ! Composez-le sur votre téléphone.')
      );
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/reservations/', {
        service: service.id,
        montant: total,
        paiement: {
          methode,
          montant_prestataire: montantPrestataire,
          montant_frais: frais,
          transaction_ref: ref,
          numero_prestataire: prestPhone,
          ussd_prestataire: ussdInfo?.ussd || ''
        }
      });
      navigate('/mes-reservations');
    } catch {
      alert('Erreur lors de la réservation. Veuillez réessayer.');
    } finally { setSubmitting(false); }
  };

  return (
    <div className="py-5">
      <div className="container">
        {/* Breadcrumb */}
        <ol className="breadcrumb">
          <li><Link to="/">Accueil</Link></li>
          <span className="breadcrumb-separator">›</span>
          <li><Link to="/services">Services</Link></li>
          <span className="breadcrumb-separator">›</span>
          <li><Link to={`/services/${id}`}>{service.nom}</Link></li>
          <span className="breadcrumb-separator">›</span>
          <li className="breadcrumb-active">Réservation</li>
        </ol>

        <div style={{ display:'flex', flexWrap:'wrap', gap:0, margin:'0 -12px' }}>

          {/* Form */}
          <div style={{ flex:'0 0 66.666%', maxWidth:'66.666%', padding:'0 12px' }}>
            <div className="form-custom">
              <h2 style={{ fontWeight:800, marginBottom:24 }}>
                <i className="bi bi-calendar-check text-primary me-2"></i>Réserver ce service
              </h2>

              {/* Service summary */}
              <div className="card-custom mb-4" style={{ padding:20 }}>
                <div style={{ display:'flex', alignItems:'center', gap:16 }}>
                  <div style={{
                    width:60, height:60, borderRadius:12, background:'var(--primary-light)',
                    display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0
                  }}>
                    <i className="bi bi-briefcase" style={{ fontSize:'1.6rem', color:'var(--primary-color)' }}></i>
                  </div>
                  <div>
                    <h5 style={{ fontWeight:700, marginBottom:4 }}>{service.nom}</h5>
                    <p className="text-muted" style={{ margin:0 }}>par {service.prestataire?.user?.username}</p>
                  </div>
                </div>
              </div>

              <form onSubmit={handleSubmit}>
                <h4 style={{ fontWeight:700, marginBottom:16 }}>
                  <i className="bi bi-credit-card me-2"></i>Informations de paiement
                </h4>

                <div className="mb-3">
                  <label className="form-label">Montant à payer</label>
                  <div className="input-group">
                    <span className="input-group-text"><i className="bi bi-currency-dollar"></i></span>
                    <input type="text" className="form-control" value={`${total} Fcfa`} readOnly />
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label">Méthode de paiement <span style={{ color:'#dc3545' }}>*</span></label>
                  <select className="form-select" value={methode} onChange={e => setMethode(e.target.value)}>
                    <option value="flooz">Flooz (Moov)</option>
                    <option value="tmoney">Mix by Yas (Togocel)</option>
                  </select>
                </div>

                <div style={{ display:'flex', flexWrap:'wrap', gap:0, margin:'0 -12px 24px' }}>
                  {[
                    ['Prestataire', prestPhone],
                    ['Référence', ref],
                    ['Montant prestataire', `${montantPrestataire} Fcfa`],
                  ].map(([label, val]) => (
                    <div key={label} style={{ flex:'0 0 33.333%', maxWidth:'33.333%', padding:'0 12px' }}>
                      <label className="form-label" style={{ fontSize:'0.82rem' }}>{label}</label>
                      <input type="text" className="form-control" value={val} readOnly />
                    </div>
                  ))}
                </div>

                {/* USSD buttons */}
                <div className="alert alert-success" style={{ borderRadius:10 }}>
                  <h5 style={{ fontWeight:700, marginBottom:8 }}>
                    <i className="bi bi-telephone-forward me-2 text-success"></i>Payer maintenant
                  </h5>
                  <p className="text-muted" style={{ marginBottom:16, fontSize:'0.9rem' }}>
                    Cliquez sur le bouton correspondant pour lancer l'appel USSD automatiquement (mobile uniquement).
                  </p>
                  <div style={{ display:'flex', gap:12 }}>
                    <button type="button" onClick={() => handlePayClick('flooz')} style={{
                      flex:1, background:'linear-gradient(135deg,#ffc107,#e0a800)', color:'#333',
                      border:'none', borderRadius:10, padding:'14px 20px', cursor:'pointer',
                      fontWeight:700, display:'flex', flexDirection:'column', alignItems:'center', gap:4
                    }}>
                      <span><i className="bi bi-phone me-2"></i>Payer Flooz</span>
                      <small style={{ fontWeight:400, fontSize:'0.82rem' }}>Prest: {montantPrestataire} FCFA</small>
                    </button>
                    <button type="button" onClick={() => handlePayClick('tmoney')} style={{
                      flex:1, background:'linear-gradient(135deg,#17a2b8,#138496)', color:'white',
                      border:'none', borderRadius:10, padding:'14px 20px', cursor:'pointer',
                      fontWeight:700, display:'flex', flexDirection:'column', alignItems:'center', gap:4
                    }}>
                      <span><i className="bi bi-phone me-2"></i>Payer Mix</span>
                      <small style={{ fontWeight:400, fontSize:'0.82rem' }}>Prest: {montantPrestataire} FCFA</small>
                    </button>
                  </div>
                  {ussdInfo && (
                    <div style={{ marginTop:16, padding:'12px 16px', background:'rgba(0,0,0,0.05)', borderRadius:8 }}>
                      <p style={{ margin:0, fontSize:'0.85rem' }}>
                        <strong>USSD généré:</strong>{' '}
                        <code style={{ background:'white', padding:'2px 8px', borderRadius:4 }}>{ussdInfo.ussd}</code>
                      </p>
                      <small className="text-muted">Copiez et composez manuellement si l'appel auto ne fonctionne pas.</small>
                    </div>
                  )}
                </div>

                <div style={{ display:'flex', flexDirection:'column', gap:12, marginTop:24 }}>
                  <button type="submit" className="btn-primary-custom" disabled={submitting}
                    style={{ justifyContent:'center', padding:'14px', fontSize:'1rem' }}>
                    {submitting ? 'Confirmation...' : <><i className="bi bi-check-circle"></i> Confirmer &amp; Enregistrer Paiement</>}
                  </button>
                  <Link to={`/services/${id}`} className="btn-secondary-custom"
                    style={{ justifyContent:'center', padding:'12px' }}>
                    Annuler
                  </Link>
                </div>
              </form>
            </div>
          </div>

          {/* Sidebar summary */}
          <div style={{ flex:'0 0 33.333%', maxWidth:'33.333%', padding:'0 12px' }}>
            <div className="dashboard-card mb-3">
              <h5 style={{ fontWeight:700, marginBottom:16 }}>
                <i className="bi bi-receipt me-2"></i>Récapitulatif
              </h5>
              {[['Service', service.nom], ['Prestataire', service.prestataire?.user?.username]].map(([label, val]) => (
                <div key={label} style={{ display:'flex', justifyContent:'space-between', marginBottom:8, fontSize:'0.9rem' }}>
                  <span className="text-muted">{label}</span>
                  <span style={{ fontWeight:600 }}>{val}</span>
                </div>
              ))}
              <hr />
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:8, fontSize:'0.9rem' }}>
                <span className="text-muted">Prix</span>
                <span style={{ fontWeight:700, color:'var(--primary-color)' }}>{prix} Fcfa</span>
              </div>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:8, fontSize:'0.9rem' }}>
                <span className="text-muted">Frais de service (3%)</span>
                <span>{frais} Fcfa</span>
              </div>
              <hr />
              <div style={{ display:'flex', justifyContent:'space-between' }}>
                <span style={{ fontWeight:800 }}>Total</span>
                <span style={{ fontWeight:800, color:'var(--primary-color)', fontSize:'1.2rem' }}>{total} Fcfa</span>
              </div>
            </div>

            <div className="dashboard-card">
              <h5 style={{ fontWeight:700, marginBottom:8 }}>
                <i className="bi bi-question-circle text-primary me-2"></i>Besoin d'aide ?
              </h5>
              <p className="text-muted" style={{ fontSize:'0.85rem', marginBottom:14 }}>
                Contactez-nous sur WhatsApp pour toute question.
              </p>
              <a href={`https://wa.me/22897430290?text=${encodeURIComponent(`Bonjour, j'ai une question sur la réservation du service ${service.nom}`)}`}
                target="_blank" rel="noreferrer" className="btn-whatsapp"
                style={{ justifyContent:'center', width:'100%', display:'flex' }}>
                <i className="bi bi-whatsapp"></i> Contacter le support
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}