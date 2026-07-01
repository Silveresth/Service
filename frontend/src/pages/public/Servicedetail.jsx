import '../../styles/servicedetail.css';
import { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';



function StarRating({ value, onChange, size = '1.4rem', readOnly = false }) {
  const [hovered, setHovered] = useState(0);
  const display = readOnly ? value : (hovered || value);
  return (
    <div style={{ display: 'flex', gap: 4 }}>
      {[1, 2, 3, 4, 5].map(s => (
        <span
          key={s}
          onClick={() => !readOnly && onChange?.(s)}
          onMouseEnter={() => !readOnly && setHovered(s)}
          onMouseLeave={() => !readOnly && setHovered(0)}
          style={{
            fontSize: size,
            cursor: readOnly ? 'default' : 'pointer',
            color: s <= display ? '#f59e0b' : '#e2e8f0',
            display: 'inline-block',
            transition: 'color 0.15s, transform 0.15s',
            transform: (!readOnly && s <= display) ? 'scale(1.2)' : 'scale(1)'
          }}
        >
          ★
        </span>
      ))}
    </div>
  );
}

function EvalModal({ reservationId, onClose, onSubmitted }) {
  const [note, setNote] = useState(0);
  const [comm, setComm] = useState('');
  const [sub, setSub] = useState(false);
  const [err, setErr] = useState('');

  const submit = async () => {
    if (!note) { setErr('Veuillez sélectionner une note.'); return; }
    setSub(true);
    setErr('');
    try {
      await api.post(`/reservations/${reservationId}/evaluer/`, { note, commentaire: comm });
      onSubmitted();
      onClose();
    } catch (e) {
      setErr(e.response?.data?.error || 'Une erreur est survenue lors de l\'envoi.');
    } finally {
      setSub(false);
    }
  };

  const labels = ['', 'Très déçu 😞', 'Déçu 😕', 'Moyen 😐', 'Satisfait 😊', 'Excellent ! 🌟'];

  return (
    <div className="sd-modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="sd-modal-box">
        <div className="sd-modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 44, height: 44, borderRadius: 14, background: '#fffbeb', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1.5px solid #fde68a' }}>
              <i className="bi bi-star-fill" style={{ color: '#f59e0b', fontSize: '1.2rem' }} />
            </div>
            <h4 style={{ fontWeight: 800, color: '#0c2340', margin: 0, fontFamily: 'Outfit, sans-serif' }}>Laisser un avis</h4>
          </div>
          <button onClick={onClose} className="sd-modal-close-btn">✕</button>
        </div>

        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <p style={{ color: '#64748b', marginBottom: 12, fontSize: '0.9rem', fontWeight: 500 }}>Quelle note donnez-vous à ce service ?</p>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <StarRating value={note} onChange={setNote} size="2.4rem" />
          </div>
          {note > 0 && <div style={{ marginTop: 10, fontWeight: 800, color: '#f59e0b', fontSize: '0.95rem', animation: 'sd-fadeUp 0.2s ease' }}>{labels[note]}</div>}
        </div>

        <div style={{ marginBottom: 24 }}>
          <label style={{ fontWeight: 700, fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '.05em' }}>
            Votre commentaire
          </label>
          <textarea
            value={comm}
            onChange={e => setComm(e.target.value)}
            rows={4}
            placeholder="Partagez votre expérience sur la qualité, la ponctualité ou l'accueil du prestataire..."
            style={{
              width: '100%',
              border: '1.5px solid #e2e8f0',
              borderRadius: 16,
              padding: '14px 16px',
              fontSize: '0.9rem',
              resize: 'vertical',
              outline: 'none',
              fontFamily: 'inherit',
              boxSizing: 'border-box',
              background: '#f8fafc',
              transition: 'all 0.2s'
            }}
            onFocus={e => { e.target.style.borderColor = '#0284c7'; e.target.style.background = 'white'; }}
            onBlur={e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.background = '#f8fafc'; }}
          />
        </div>

        {err && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.08)',
            border: '1px solid rgba(239, 68, 68, 0.15)',
            borderRadius: '14px',
            padding: '12px 16px',
            marginBottom: '20px',
            color: '#ef4444',
            fontSize: '0.85rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <i className="bi bi-exclamation-triangle-fill" />
            <span>{err}</span>
          </div>
        )}

        <div style={{ display: 'flex', gap: 12 }}>
          <button onClick={onClose} style={{ flex: 1, padding: '14px', borderRadius: 16, border: '1.5px solid #e2e8f0', background: 'transparent', color: '#64748b', fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem', fontFamily: 'inherit' }}>Annuler</button>
          <button
            onClick={submit}
            disabled={sub || !note}
            style={{
              flex: 1,
              padding: '14px',
              borderRadius: 16,
              border: 'none',
              background: !note ? '#cbd5e1' : 'linear-gradient(135deg, #0c2340, #0284c7)',
              color: !note ? '#94a3b8' : '#fff',
              fontWeight: 800,
              cursor: !note ? 'not-allowed' : 'pointer',
              fontSize: '0.9rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              fontFamily: 'inherit'
            }}
          >
            {sub ? (
              <>
                <span className="rf-spinner" style={{ width: 16, height: 16 }}></span>
                Envoi...
              </>
            ) : (
              <>
                <i className="bi bi-send" />
                Publier
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function EvalCard({ ev }) {
  const nom = typeof ev.client === 'string' 
    ? ev.client 
    : (ev.client?.user?.first_name ? `${ev.client.user.first_name} ${ev.client.user.last_name}`.trim() : ev.client?.user?.username || 'Utilisateur');
  const initials = nom?.[0]?.toUpperCase() || '?';
  const date = new Date(ev.date_eval || ev.created_at || Date.now());
  
  return (
    <div className="sd-review-card">
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div className="sd-review-avatar">{initials}</div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 2 }}>
            <span className="sd-review-name">{nom}</span>
            <span className="sd-review-date">• {date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
          </div>
          <StarRating value={ev.note} readOnly size='0.85rem' />
        </div>
        <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '10px', padding: '4px 10px', fontWeight: 800, color: '#d97706', fontSize: '0.8rem' }}>
          {ev.note}/5
        </div>
      </div>
      {ev.commentaire && <p className="sd-review-text">{ev.commentaire}</p>}
    </div>
  );
}

export default function ServiceDetail() {
  const { id }   = useParams();
  const { user } = useAuth();
  const navigate  = useNavigate();

  const [service,     setService]    = useState(null);
  const [evaluations, setEvals]      = useState([]);
  const [loading,     setLoading]    = useState(true);
  const [showEval,    setShowEval]   = useState(false);
  const [activeTab,   setActiveTab]  = useState('description');
  const [eligibleId,  setEligibleId] = useState(null);

  const fetchData = () => {
    Promise.all([
      api.get(`/services/${id}/`),
      api.get(`/evaluations/?service=${id}`).catch(() => ({ data:[] })),
      user ? api.get('/reservations/').catch(() => ({ data:[] })) : Promise.resolve({ data:[] })
    ]).then(([sRes, eRes, rRes]) => {
      setService(sRes.data);
      const evals = eRes.data?.results ?? eRes.data ?? [];
      setEvals(Array.isArray(evals) ? evals : []);
      const reservations = Array.isArray(rRes.data) ? rRes.data : (rRes.data?.results ?? []);
      const eligible = reservations.find(r =>
        (r.service?.id === parseInt(id) || r.service === parseInt(id)) &&
        ['confirmee','terminee'].includes(r.statut) && !r.evaluation
      );
      setEligibleId(eligible?.id || null);
    }).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(fetchData, [id]);

  if (loading) return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16, background: '#f8fafc' }}>
      <div style={{ width: 44, height: 44, borderRadius: '50%', border: '4px solid #e2e8f0', borderTopColor: '#0284c7', animation: 'sd-spin .8s linear infinite' }} />
      <span style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: 600 }}>Chargement du service...</span>
    </div>
  );

  if (!service) return (
    <div className="container py-5">
      <div className="alert alert-danger" style={{ borderRadius: 16, border: 'none', background: '#fef2f2', color: '#dc2626', padding: '16px 20px', fontWeight: 600 }}>
        <i className="bi bi-exclamation-octagon-fill" style={{ marginRight: 8 }} />
        Service introuvable.
      </div>
    </div>
  );

  const avgNote = evaluations.length ? (evaluations.reduce((a,e) => a+e.note, 0)/evaluations.length).toFixed(1) : null;
  const prix    = parseFloat(service.prix) || 0;
  const noteDist = [5,4,3,2,1].map(n => ({ 
    n, 
    count: evaluations.filter(e=>e.note===n).length, 
    pct: evaluations.length ? Math.round(evaluations.filter(e=>e.note===n).length/evaluations.length*100) : 0 
  }));

  const TABS = [
    { id: 'description', label: 'Description', icon: 'file-text' },
    { id: 'prestataire', label: 'Prestataire', icon: 'person-badge' },
    { id: 'evaluations', label: `Avis (${evaluations.length})`, icon: 'star' },
  ];

  // Calculer une couleur de gradient abstraite et élégante si le service n'a pas d'image
  const gradients = [
    'linear-gradient(135deg, #0f172a 0%, #0284c7 100%)',
    'linear-gradient(135deg, #0c2340 0%, #4f46e5 100%)',
    'linear-gradient(135deg, #0f172a 0%, #10b981 100%)',
    'linear-gradient(135deg, #1e1b4b 0%, #db2777 100%)',
    'linear-gradient(135deg, #180828 0%, #7c3aed 100%)',
  ];
  const gradIdx = (service.id || 0) % gradients.length;

  return (
    <>
      
      {showEval && <EvalModal reservationId={eligibleId} onClose={() => setShowEval(false)} onSubmitted={fetchData} />}

      <div className="sd-page">
        {/* --- HERO BANNER --- */}
        <div className="sd-hero">
          <div className="container">
            
            {/* Breadcrumb */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24, fontSize: '0.8rem', flexWrap: 'wrap' }}>
              <Link to="/" style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none', fontWeight: 600 }}>Accueil</Link>
              <i className="bi bi-chevron-right" style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.65rem' }} />
              <Link to="/services" style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none', fontWeight: 600 }}>Services</Link>
              <i className="bi bi-chevron-right" style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.65rem' }} />
              <span style={{ color: 'rgba(255,255,255,0.95)', fontWeight: 600 }}>{service.nom}</span>
            </div>

            <div className="sd-hero-content">
              {/* Image / Gradient Placeholder + Mini-slide animé (5 visuels) */}
              <div className="sd-hero-img-box">
                <div className="sd-mini-slide">
                  {(() => {
                    const urls = [
                      service?.image_url,
                      ...(service?.images || []).map(img => img.image_url)
                    ].filter(Boolean);

                    // Si aucune image multiple, on garde l'ancien rendu (1 image ou gradient)
                    if (!urls.length) {
                      return service.image_url ? (
                        <img src={service.image_url} alt={service.nom} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <div style={{ width: '100%', height: '100%', background: gradients[gradIdx], display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <i className={`bi ${service.categorie?.icone || 'bi-briefcase'}`} style={{ fontSize: '3rem', color: 'white', opacity: 0.9 }} />
                        </div>
                      );
                    }

                    return (
                      <>
                        <div className="sd-mini-slide-track" style={{ ['--sd-count']: urls.length }}>
                          {urls.map((u, idx) => (
                            <div key={`${u}-${idx}`} className="sd-mini-slide-item">
                              <img src={u} alt={`${service.nom} - image ${idx + 1}`} />
                              <div className="sd-mini-slide-overlay" />
                            </div>
                          ))}
                        </div>
                        <div className="sd-mini-slide-dots" aria-hidden>
                          {urls.map((_, i) => (
                            <span key={i} className="sd-mini-dot" />
                          ))}
                        </div>
                      </>
                    );
                  })()}
                </div>
              </div>

              <div className="sd-hero-info">
                <div className="sd-badge-container">
                  {service.categorie?.nom && (
                    <span className="sd-badge">
                      <i className={`bi ${service.categorie.icone || 'bi-tag'} me-1`} /> {service.categorie.nom}
                    </span>
                  )}
                  <span className={`sd-badge ${service.disponibilite ? 'available' : 'unavailable'}`}>
                    {service.disponibilite ? '● Disponible' : '○ Indisponible'}
                  </span>
                </div>

                <h1 className="sd-title">{service.nom}</h1>

                {avgNote && (
                  <div className="sd-hero-rating">
                    <StarRating value={Math.round(parseFloat(avgNote))} readOnly size='0.95rem' />
                    <span style={{ color: 'white', fontWeight: 800, marginLeft: 4 }}>{avgNote}</span>
                    <span style={{ color: 'rgba(255,255,255,0.5)', fontWeight: 500 }}>({evaluations.length} avis)</span>
                  </div>
                )}

                <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 4 }}>
                  <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.88rem', fontWeight: 600 }}>À partir de</span>
                  <span style={{ color: '#fff', fontWeight: 900, fontSize: '2.2rem', lineHeight: 1, fontFamily: 'Outfit, sans-serif' }}>
                    {prix.toLocaleString()}
                  </span>
                  <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem', fontWeight: 700 }}>FCFA</span>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* --- MAIN LAYOUT --- */}
        <div className="container">
          <div className="sd-main-grid">
            
            {/* Colonne principale (gauche) */}
            <div>
              {/* Barre d'onglets (Tabs) */}
              <div className="sd-tabs-bar">
                {TABS.map(tab => (
                  <button 
                    key={tab.id} 
                    className={`sd-tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                    onClick={() => setActiveTab(tab.id)}
                  >
                    <i className={`bi bi-${tab.icon}`} />
                    <span className="sd-tab-text">{tab.label}</span>
                  </button>
                ))}
              </div>

              {/* Onglet Description */}
              {activeTab === 'description' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  <div className="sd-content-box">
                    <h4 className="sd-box-title">À propos de ce service</h4>
                    <p style={{ color: '#475569', lineHeight: 1.85, fontSize: '0.95rem', margin: 0, whiteSpace: 'pre-line' }}>
                      {service.description || 'Aucune description disponible pour ce service.'}
                    </p>
                  </div>

                  <div className="sd-info-grid">
                    {[
                      { icon: 'clock',         label: 'Durée moyenne', val: '1h à 3h',              color: '#0284c7', bg: 'rgba(2, 132, 199, 0.05)' },
                      { icon: 'geo-alt',        label: 'Zone d\'action', val: 'Tout le Togo',        color: '#10b981', bg: 'rgba(16, 185, 129, 0.05)' },
                      { icon: 'shield-check',   label: 'Garantie Pro',  val: 'Satisfaction assurée', color: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.05)' },
                      { icon: 'bell',           label: 'Temps de réponse', val: 'Sous 24h',          color: '#ea580c', bg: 'rgba(234, 88, 12, 0.05)' },
                    ].map(info => (
                      <div key={info.label} className="sd-info-card" style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                        <div style={{ 
                          width: 42, height: 42, borderRadius: 12, background: info.bg, 
                          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                        }}>
                          <i className={`bi bi-${info.icon}`} style={{ color: info.color, fontSize: '1.2rem' }} />
                        </div>
                        <div>
                          <div style={{ fontSize: '0.72rem', color: '#64748b', marginBottom: 2, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.03em' }}>{info.label}</div>
                          <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#0c2340' }}>{info.val}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Onglet Prestataire */}
              {activeTab === 'prestataire' && (
                <div className="sd-content-box">
                  <h4 className="sd-box-title">À propos du prestataire</h4>
                  <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start', flexWrap: 'wrap' }}>
                    <div style={{ 
                      width: 76, height: 76, borderRadius: '50%', 
                      background: 'linear-gradient(135deg, #0c2340 0%, #0284c7 100%)', 
                      color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', 
                      fontWeight: 800, fontSize: '1.8rem', flexShrink: 0,
                      boxShadow: '0 8px 20px rgba(2, 132, 199, 0.2)',
                      overflow: 'hidden'
                    }}>
                      {service.prestataire?.photo_url ? (
                        <img src={service.prestataire.photo_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        (service.prestataire?.user?.first_name?.[0] || service.prestataire?.user?.username?.[0] || 'P').toUpperCase()
                      )}
                    </div>
                    
                    <div style={{ flex: 1, minWidth: 200 }}>
                      <h5 style={{ fontWeight: 800, color: '#0c2340', fontSize: '1.15rem', margin: '0 0 6px', display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                        {`${service.prestataire?.user?.first_name || ''} ${service.prestataire?.user?.last_name || ''}`.trim() || service.prestataire?.user?.username}
                        {service.prestataire?.type_abonnement === 'pro' && (
                          <span style={{ fontSize: '0.68rem', background: '#22c55e', color: 'white', padding: '3px 8px', borderRadius: 20, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.02em', border: '1px solid rgba(255,255,255,0.2)', display: 'inline-flex', alignItems: 'center' }}>
                            <i className="bi bi-patch-check-fill" style={{ marginRight: 4 }} /> PRO
                          </span>
                        )}
                        {service.prestataire?.type_abonnement === 'prestige' && (
                          <span style={{ fontSize: '0.68rem', background: 'linear-gradient(135deg, #fbbf24, #d97706)', color: 'white', padding: '3px 8px', borderRadius: 20, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.02em', border: '1px solid rgba(255,255,255,0.2)', display: 'inline-flex', alignItems: 'center', boxShadow: '0 2px 6px rgba(217,119,6,0.2)' }}>
                            <i className="bi bi-gem" style={{ marginRight: 4 }} /> PRESTIGE
                          </span>
                        )}
                      </h5>
                      
                      {service.prestataire?.specialite && (
                        <span style={{ background: '#e0f2fe', color: '#0369a1', padding: '4px 14px', borderRadius: 30, fontSize: '0.78rem', fontWeight: 700, display: 'inline-block', marginBottom: 16 }}>
                          {service.prestataire.specialite}
                        </span>
                      )}

                      {service.prestataire?.bio && (
                        <p style={{ color: '#475569', fontSize: '0.92rem', lineHeight: 1.7, margin: '0 0 20px' }}>
                          {service.prestataire.bio}
                        </p>
                      )}
                      
                      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                        {service.prestataire?.id && (
                          <Link 
                            to={`/prestataire/${service.prestataire.id}`} 
                            className="sd-contact-btn profile"
                            style={{ width: 'auto', margin: 0, padding: '10px 20px' }}
                          >
                            <i className="bi bi-person-badge" /> Voir le profil
                          </Link>
                        )}
                        {service.prestataire?.telephone && (
                          <a href={`tel:${service.prestataire.telephone}`} className="sd-contact-btn phone" style={{ width: 'auto', margin: 0, padding: '10px 20px' }}>
                            <i className="bi bi-telephone-fill" /> Appeler l'artisan
                          </a>
                        )}
                        {service.prestataire?.telephone && (
                          <a 
                            href={`https://wa.me/228${service.prestataire.telephone}?text=${encodeURIComponent(`Bonjour, je vous contacte depuis Service Market pour votre service : ${service.nom}`)}`} 
                            target="_blank" 
                            rel="noreferrer"
                            className="sd-contact-btn whatsapp"
                            style={{ width: 'auto', margin: 0, padding: '10px 20px' }}
                          >
                            <i className="bi bi-whatsapp" /> WhatsApp
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Onglet Évaluations */}
              {activeTab === 'evaluations' && (
                <div style={{ animation: 'sd-fadeUp 0.4s ease' }}>
                  {/* Summary card */}
                  {evaluations.length > 0 && (
                    <div className="sd-rating-summary">
                      <div style={{ textAlign: 'center', flexShrink: 0, paddingRight: 8 }}>
                        <div className="sd-rating-big-num">{avgNote}</div>
                        <div style={{ display: 'flex', justifyContent: 'center', margin: '4px 0 6px' }}>
                          <StarRating value={Math.round(parseFloat(avgNote))} readOnly size='1.05rem' />
                        </div>
                        <div style={{ color: '#94a3b8', fontSize: '0.8rem', fontWeight: 600 }}>{evaluations.length} évaluation{evaluations.length > 1 ? 's' : ''}</div>
                      </div>
                      
                      <div style={{ flex: 1, minWidth: 200 }}>
                        {noteDist.map(d => (
                          <div key={d.n} className="sd-rating-progress-row">
                            <span style={{ fontWeight: 700, width: 8 }}>{d.n}</span>
                            <i className="bi bi-star-fill" style={{ color: '#f59e0b', fontSize: '0.65rem' }} />
                            <div className="sd-rating-progress-bar-track">
                              <div className="sd-rating-progress-bar-fill" style={{ width: `${d.pct}%`, backgroundColor: '#f59e0b' }} />
                            </div>
                            <span style={{ width: 24, textAlign: 'right', fontWeight: 600 }}>{d.count}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Liste des avis */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                    <h5 style={{ fontWeight: 800, color: '#0c2340', margin: 0, fontSize: '1.05rem', fontFamily: 'Outfit, sans-serif' }}>
                      {evaluations.length === 0 ? 'Aucun avis disponible' : 'Retours des clients'}
                    </h5>
                    
                    {user?.type_compte === 'client' && eligibleId && (
                      <button onClick={() => setShowEval(true)} className="sd-cta-btn" style={{ width: 'auto', padding: '8px 18px', fontSize: '0.82rem', borderRadius: 12, margin: 0, boxShadow: 'none' }}>
                        <i className="bi bi-star" /> Laisser un avis
                      </button>
                    )}
                  </div>

                  {evaluations.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '50px 20px', color: '#94a3b8', background: 'white', borderRadius: 24, border: '1px solid #e2e8f0' }}>
                      <i className="bi bi-star" style={{ fontSize: '3.2rem', display: 'block', marginBottom: 12, color: '#cbd5e1' }} />
                      <p style={{ margin: 0, fontWeight: 500 }}>Soyez le premier à évaluer ce service après votre réservation !</p>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                      {evaluations.map((ev, i) => <EvalCard key={i} ev={ev} />)}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Sidebar (droite) */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Carte principale de commande */}
              <div className="sd-sidebar-card">
                <div className="sd-price-box">
                  <div className="sd-price-label">Tarif de base</div>
                  <div className="sd-price-val">
                    {prix.toLocaleString()} <span>FCFA</span>
                  </div>
                </div>

                {user ? (
                  service.disponibilite ? (
                    <Link to={`/reserver/${service.id}`} className="sd-cta-btn">
                      <i className="bi bi-calendar-check" /> Réserver maintenant
                    </Link>
                  ) : (
                    <div style={{ background: '#f1f5f9', borderRadius: 16, padding: '14px', textAlign: 'center', color: '#94a3b8', fontSize: '0.9rem', fontWeight: 700 }}>
                      Artisan non disponible
                    </div>
                  )
                ) : (
                  <Link to="/login" className="sd-cta-btn">
                    <i className="bi bi-box-arrow-in-right" /> Se connecter
                  </Link>
                )}

                {user?.type_compte === 'client' && eligibleId && (
                  <button onClick={() => setShowEval(true)} className="sd-contact-btn phone" style={{ marginTop: 12 }}>
                    <i className="bi bi-star" /> Évaluer la prestation
                  </button>
                )}

                <div style={{ marginTop: 18, paddingTop: 16, borderTop: '1px solid #f1f5f9' }}>
                  <div style={{ fontSize: '0.72rem', color: '#94a3b8', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontWeight: 600 }}>
                    <i className="bi bi-shield-lock-fill" style={{ color: '#10b981', fontSize: '0.85rem' }} /> Paiement sécurisé avec PayGate
                  </div>
                </div>
              </div>

              {/* Contacts directs */}
              {service.prestataire?.telephone && (
                <div className="sd-sidebar-card" style={{ padding: '20px 24px' }}>
                  <h5 style={{ fontWeight: 800, color: '#0c2340', fontSize: '0.9rem', margin: '0 0 14px', fontFamily: 'Outfit, sans-serif' }}>
                    Besoin de précisions ?
                  </h5>
                  <a href={`tel:${service.prestataire.telephone}`} className="sd-contact-btn phone" style={{ margin: '0 0 8px 0' }}>
                    <i className="bi bi-telephone-fill" /> Appeler le prestataire
                  </a>
                  <a 
                    href={`https://wa.me/228${service.prestataire.telephone}?text=${encodeURIComponent(`Bonjour, je viens de voir votre service "${service.nom}" sur Service Market...`)}`} 
                    target="_blank" 
                    rel="noreferrer"
                    className="sd-contact-btn whatsapp"
                    style={{ margin: 0 }}
                  >
                    <i className="bi bi-whatsapp" /> Contacter sur WhatsApp
                  </a>
                </div>
              )}

              {/* Garanties */}
              <div className="sd-sidebar-card" style={{ padding: '20px 24px' }}>
                <h5 style={{ fontWeight: 800, color: '#0c2340', fontSize: '0.9rem', margin: '0 0 14px', fontFamily: 'Outfit, sans-serif' }}>
                  Nos engagements
                </h5>
                {[
                  { icon: 'shield-fill-check',    color: '#10b981', label: 'Transaction sécurisée' },
                  { icon: 'chat-left-text-fill',  color: '#0284c7', label: 'Assistance client en ligne' },
                  { icon: 'patch-check-fill',     color: '#8b5cf6', label: 'Prestataires togolais qualifiés' },
                  { icon: 'arrow-counterclockwise', color: '#ea580c', label: 'Remboursement si non-conformité' },
                ].map(g => (
                  <div key={g.label} style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 12, fontSize: '0.82rem', color: '#475569', fontWeight: 500 }}>
                    <i className={`bi bi-${g.icon}`} style={{ color: g.color, fontSize: '1rem', flexShrink: 0 }} />
                    <span>{g.label}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}