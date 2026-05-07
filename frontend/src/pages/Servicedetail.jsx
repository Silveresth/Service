import { useEffect, useState, useRef } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

/* ─────────────────────────────────────────────
   Star Rating Component
───────────────────────────────────────────── */
function StarRating({ value, onChange, size = '1.5rem', readOnly = false }) {
  const [hovered, setHovered] = useState(0);
  const display = readOnly ? value : (hovered || value);
  return (
    <div style={{ display:'flex', gap:4 }}>
      {[1,2,3,4,5].map(s => (
        <span key={s}
          onClick={() => !readOnly && onChange && onChange(s)}
          onMouseEnter={() => !readOnly && setHovered(s)}
          onMouseLeave={() => !readOnly && setHovered(0)}
          style={{ fontSize:size, cursor:readOnly?'default':'pointer', color: s<=display?'#f59e0b':'#e2e8f0', transition:'color 0.15s, transform 0.1s', transform: (!readOnly && s<=display)?'scale(1.15)':'scale(1)', display:'inline-block' }}>
          ★
        </span>
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────
   Evaluation Form Modal
───────────────────────────────────────────── */
function EvalForm({ reservationId, onClose, onSubmitted }) {
  const [note, setNote]       = useState(0);
  const [comm, setComm]       = useState('');
  const [submitting, setSub]  = useState(false);
  const [error, setError]     = useState('');

  const handleSubmit = async () => {
    if (!note) { setError('Veuillez sélectionner une note.'); return; }
    if (!reservationId) { setError('Impossible de soumettre : aucune réservation éligible trouvée.'); return; }
    setSub(true); setError('');
    try {
      await api.post(`/reservations/${reservationId}/evaluer/`, { note, commentaire: comm });
      onSubmitted();
      onClose();
    } catch(e) {
      setError(e.response?.data?.error || e.response?.data?.detail || 'Erreur lors de l\'envoi.');
    } finally { setSub(false); }
  };

  return (
    <div style={{ position:'fixed',inset:0,background:'rgba(0,0,0,0.6)',zIndex:9000,display:'flex',alignItems:'center',justifyContent:'center',padding:16 }}>
      <div style={{ background:'white',borderRadius:20,width:'min(480px,96vw)',padding:32,boxShadow:'0 24px 60px rgba(0,0,0,0.3)',animation:'fadeIn 0.2s ease' }}>
        <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:20 }}>
          <h3 style={{ fontWeight:800,color:'#0c2340',margin:0 }}>Évaluer ce service</h3>
          <button onClick={onClose} style={{ background:'#f1f5f9',border:'none',color:'#64748b',borderRadius:8,padding:'6px 10px',cursor:'pointer',fontSize:'1rem' }}>
            <i className="bi bi-x-lg"></i>
          </button>
        </div>

        <div style={{ marginBottom:24, textAlign:'center' }}>
          <p style={{ color:'#64748b',marginBottom:14,fontSize:'0.9rem' }}>Quelle note donnez-vous à ce service ?</p>
          <StarRating value={note} onChange={setNote} size="2.5rem" />
          {note > 0 && (
            <div style={{ marginTop:10,fontWeight:600,color:'#f59e0b',fontSize:'0.9rem' }}>
              {['','Très mauvais 😞','Mauvais 😕','Moyen 😐','Bien 😊','Excellent 🌟'][note]}
            </div>
          )}
        </div>

        <div style={{ marginBottom:20 }}>
          <label style={{ fontWeight:600,fontSize:'0.9rem',color:'#374151',display:'block',marginBottom:8 }}>
            Commentaire (optionnel)
          </label>
          <textarea value={comm} onChange={e=>setComm(e.target.value)} rows={4}
            placeholder="Partagez votre expérience, décrivez la qualité du service, la ponctualité du prestataire..."
            style={{ width:'100%',border:'1.5px solid #e2e8f0',borderRadius:10,padding:'10px 14px',fontSize:'0.88rem',resize:'vertical',outline:'none',fontFamily:'inherit' }}
            onFocus={e=>e.target.style.borderColor='var(--primary-color)'}
            onBlur={e=>e.target.style.borderColor='#e2e8f0'} />
        </div>

        {error && (
          <div style={{ background:'#fef2f2',border:'1px solid #fecaca',borderRadius:8,padding:'10px 14px',marginBottom:16,color:'#991b1b',fontSize:'0.85rem',display:'flex',gap:8 }}>
            <i className="bi bi-exclamation-triangle-fill"></i> {error}
          </div>
        )}

        <div style={{ display:'flex',gap:12 }}>
          <button onClick={onClose} className="btn-secondary-custom" style={{ flex:1,justifyContent:'center' }}>Annuler</button>
          <button onClick={handleSubmit} disabled={submitting||!note} className="btn-primary-custom"
            style={{ flex:1,justifyContent:'center',padding:'12px',opacity:(!note||submitting)?0.5:1 }}>
            {submitting ? <><span className="spinner-border spinner-border-sm me-2"></span>Envoi…</> : <><i className="bi bi-send me-2"></i>Publier</>}
          </button>
        </div>
      </div>
      <style>{`@keyframes fadeIn{from{opacity:0;transform:scale(0.95)}to{opacity:1;transform:scale(1)}}`}</style>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Evaluation Card
───────────────────────────────────────────── */
function EvalCard({ ev }) {
  // EvaluationSerializer retourne client comme string (nom), pas comme objet
  const clientNom = typeof ev.client === 'string' ? ev.client
    : ((`${ev.client?.user?.first_name || ''} ${ev.client?.user?.last_name || ''}`.trim() || ev.client?.user?.username || ev.client?.username || 'Utilisateur'));
  const initials = clientNom?.[0]?.toUpperCase() || '?';
  const date = new Date(ev.date_eval || ev.created_at || Date.now());
  return (
    <div style={{ background:'white',border:'1.5px solid #f1f5f9',borderRadius:14,padding:'18px 20px',boxShadow:'0 2px 8px rgba(0,0,0,0.04)' }}>
      <div style={{ display:'flex',alignItems:'flex-start',gap:12,marginBottom:10 }}>
        <div style={{ width:38,height:38,borderRadius:'50%',background:'linear-gradient(135deg,var(--primary-color),#0369a1)',color:'white',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700,fontSize:'0.9rem',flexShrink:0 }}>
          {initials}
        </div>
        <div style={{ flex:1 }}>
          <div style={{ display:'flex',alignItems:'center',gap:10,marginBottom:3 }}>
            <span style={{ fontWeight:700,fontSize:'0.9rem',color:'#1e293b' }}>{clientNom}</span>
            <span style={{ fontSize:'0.75rem',color:'#94a3b8' }}>
              {date.toLocaleDateString('fr-FR',{day:'numeric',month:'long',year:'numeric'})}
            </span>
          </div>
          <StarRating value={ev.note} readOnly size='0.9rem' />
        </div>
        <div style={{ background:'#fffbeb',border:'1px solid #fde68a',borderRadius:8,padding:'3px 10px',fontWeight:800,color:'#d97706',fontSize:'0.9rem',flexShrink:0 }}>
          {ev.note}/5
        </div>
      </div>
      {ev.commentaire && (
        <p style={{ color:'#64748b',fontSize:'0.87rem',lineHeight:1.7,margin:0,paddingLeft:50 }}>{ev.commentaire}</p>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────
   Main : ServiceDetail
───────────────────────────────────────────── */
export default function ServiceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [service,      setService]     = useState(null);
  const [evaluations,  setEvaluations] = useState([]);
  const [loading,      setLoading]     = useState(true);
  const [showEvalForm, setShowEvalForm]= useState(false);
  const [activeTab,    setActiveTab]   = useState('description');
  const [eligibleReservationId, setEligibleReservationId] = useState(null);

  const fetchData = () => {
    const evalPromise = api.get(`/evaluations/?service=${id}`).catch(() => ({ data: [] }));
    const servicePromise = api.get(`/services/${id}/`);
    // Charger les réservations du client pour trouver celle éligible à l'évaluation
    const reservationPromise = user
      ? api.get('/reservations/').catch(() => ({ data: [] }))
      : Promise.resolve({ data: [] });

    Promise.all([servicePromise, evalPromise, reservationPromise])
      .then(([sRes, eRes, rRes]) => {
        setService(sRes.data);
        const rawEvals = eRes.data?.results ?? eRes.data ?? [];
        setEvaluations(Array.isArray(rawEvals) ? rawEvals : []);
        // Trouver une réservation confirmée ou terminée pour ce service sans évaluation
        const reservations = Array.isArray(rRes.data) ? rRes.data : (rRes.data?.results ?? []);
        const eligible = reservations.find(r =>
          (r.service?.id === parseInt(id) || r.service === parseInt(id)) &&
          ['confirmee', 'terminee'].includes(r.statut) &&
          !r.evaluation
        );
        setEligibleReservationId(eligible?.id || null);
      }).catch(console.error).finally(() => setLoading(false));
  };
  useEffect(fetchData, [id]);

  if (loading) return (
    <div style={{ textAlign:'center', padding:'80px 20px' }}>
      <div style={{ width:50,height:50,border:'4px solid #e2e8f0',borderTopColor:'var(--primary-color)',borderRadius:'50%',animation:'spin 0.8s linear infinite',margin:'0 auto 16px' }}></div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
  if (!service) return <div className="container py-5"><div className="alert alert-danger">Service introuvable.</div></div>;

  const avgNote = evaluations.length ? (evaluations.reduce((a,e)=>a+e.note,0)/evaluations.length).toFixed(1) : null;
  const prix = parseFloat(service.prix)||0;

  // Distribution des notes
  const noteDist = [5,4,3,2,1].map(n => ({
    n, count: evaluations.filter(e=>e.note===n).length,
    pct: evaluations.length ? Math.round(evaluations.filter(e=>e.note===n).length/evaluations.length*100) : 0
  }));

  const TABS = [
    { id:'description', label:'Description', icon:'bi-file-text' },
    { id:'prestataire', label:'Prestataire', icon:'bi-person-badge' },
    { id:'evaluations', label:`Avis (${evaluations.length})`, icon:'bi-star' },
  ];

  return (
    <div style={{ background:'#f8fafb', minHeight:'100vh' }}>
      {showEvalForm && <EvalForm reservationId={eligibleReservationId} onClose={()=>setShowEvalForm(false)} onSubmitted={fetchData} />}

      {/* ── Hero ── */}
      <div style={{ background:'linear-gradient(135deg,#0c2340 0%,#1e3a5f 50%,var(--primary-color) 100%)', paddingTop:40, paddingBottom:50, position:'relative', overflow:'hidden' }}>
        {/* Decoration */}
        <div style={{ position:'absolute',top:-60,right:-60,width:260,height:260,borderRadius:'50%',background:'rgba(255,255,255,0.04)' }}></div>
        <div style={{ position:'absolute',bottom:-40,left:'20%',width:180,height:180,borderRadius:'50%',background:'rgba(255,255,255,0.03)' }}></div>

        <div className="container" style={{ position:'relative',zIndex:1 }}>
          {/* Breadcrumb */}
          <div style={{ display:'flex',alignItems:'center',gap:6,marginBottom:24,fontSize:'0.85rem' }}>
            <Link to="/" style={{ color:'rgba(255,255,255,0.6)',textDecoration:'none' }}>Accueil</Link>
            <i className="bi bi-chevron-right" style={{ color:'rgba(255,255,255,0.4)',fontSize:'0.7rem' }}></i>
            <Link to="/services" style={{ color:'rgba(255,255,255,0.6)',textDecoration:'none' }}>Services</Link>
            <i className="bi bi-chevron-right" style={{ color:'rgba(255,255,255,0.4)',fontSize:'0.7rem' }}></i>
            <span style={{ color:'rgba(255,255,255,0.9)' }}>{service.nom}</span>
          </div>

<div className="service-detail-hero flex-column flex-md-row gap-3 gap-md-4" style={{ alignItems:'flex-start' }}>
            {/* Icon or Image */}
            {service.image_url ? (
              <img src={service.image_url} alt={service.nom} style={{ width:140,height:140,borderRadius:20,objectFit:'cover',border:'3px solid rgba(255,255,255,0.3)' }} />
            ) : (
              <div style={{ width:90,height:90,borderRadius:20,background:'rgba(255,255,255,0.12)',backdropFilter:'blur(10px)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,border:'1px solid rgba(255,255,255,0.2)' }}>
                <i className={`bi ${service.categorie?.icone||'bi-briefcase'}`} style={{ fontSize:'3rem',color:'white' }}></i>
              </div>
            )}

            <div style={{ flex:1 }}>
              {/* Category + availability */}
              <div style={{ display:'flex',gap:10,marginBottom:12,flexWrap:'wrap' }}>
                {service.categorie?.nom && (
                  <span style={{ background:'rgba(255,255,255,0.15)',color:'white',padding:'4px 14px',borderRadius:20,fontSize:'0.8rem',fontWeight:600,border:'1px solid rgba(255,255,255,0.25)' }}>
                    <i className={`bi ${service.categorie.icone||'bi-tag'} me-2`}></i>{service.categorie.nom}
                  </span>
                )}
                <span style={{ background:service.disponibilite?'rgba(34,197,94,0.2)':'rgba(148,163,184,0.2)', color:service.disponibilite?'#4ade80':'#94a3b8', padding:'4px 14px',borderRadius:20,fontSize:'0.8rem',fontWeight:700,border:`1px solid ${service.disponibilite?'rgba(34,197,94,0.4)':'rgba(148,163,184,0.3)'}` }}>
                  {service.disponibilite?'● Disponible maintenant':'○ Indisponible'}
                </span>
              </div>

              <h1 style={{ color:'white',fontWeight:900,fontSize:'2rem',marginBottom:10,lineHeight:1.2 }}>{service.nom}</h1>

              {/* Rating summary */}
              {avgNote && (
                <div style={{ display:'flex',alignItems:'center',gap:10,marginBottom:16 }}>
                  <StarRating value={Math.round(parseFloat(avgNote))} readOnly size='1rem' />
                  <span style={{ color:'rgba(255,255,255,0.9)',fontWeight:700,fontSize:'1rem' }}>{avgNote}</span>
                  <span style={{ color:'rgba(255,255,255,0.5)',fontSize:'0.85rem' }}>({evaluations.length} avis)</span>
                </div>
              )}

              {/* Price */}
              <div style={{ display:'flex',alignItems:'baseline',gap:6 }}>
                <span style={{ color:'rgba(255,255,255,0.6)',fontSize:'0.9rem' }}>À partir de</span>
                <span style={{ color:'white',fontWeight:900,fontSize:'2.2rem',lineHeight:1 }}>{prix.toLocaleString()}</span>
                <span style={{ color:'rgba(255,255,255,0.7)',fontSize:'1rem' }}>Fcfa</span>
              </div>
            </div>

            {/* CTA block */}
            <div className="service-detail-cta" style={{ background:'white',borderRadius:16,padding:20,width:220,flexShrink:0,boxShadow:'0 8px 30px rgba(0,0,0,0.2)' }}>
              <div style={{ fontWeight:800,fontSize:'1.4rem',color:'var(--primary-color)',marginBottom:2 }}>{prix.toLocaleString()} Fcfa</div>
              <div style={{ fontSize:'0.78rem',color:'#94a3b8',marginBottom:16 }}>3% de frais déduits du montant prestataire</div>

              {user ? (
                service.disponibilite ? (
                  <Link to={`/reserver/${service.id}`} className="btn-primary-custom"
                    style={{ display:'flex',justifyContent:'center',padding:'12px',fontWeight:700,marginBottom:10,fontSize:'0.95rem' }}>
                    <i className="bi bi-calendar-check me-2"></i>Réserver
                  </Link>
                ) : (
                  <div style={{ textAlign:'center',color:'#94a3b8',fontSize:'0.85rem',marginBottom:10,padding:'12px',background:'#f8fafc',borderRadius:10 }}>
                    Service indisponible
                  </div>
                )
              ) : (
                <Link to="/login" className="btn-primary-custom" style={{ display:'flex',justifyContent:'center',padding:'12px',fontWeight:700,marginBottom:10 }}>
                  <i className="bi bi-box-arrow-in-right me-2"></i>Connexion requise
                </Link>
              )}

              {user && user.type_compte === 'client' && eligibleReservationId && (
                <button onClick={() => setShowEvalForm(true)}
                  className="btn-secondary-custom" style={{ width:'100%',justifyContent:'center',padding:'10px',fontSize:'0.88rem' }}>
                  <i className="bi bi-star me-2"></i>Évaluer ce service
                </button>
              )}

              <div style={{ marginTop:14,padding:'10px 0',borderTop:'1px solid #f1f5f9' }}>
                <div style={{ display:'flex',justifyContent:'space-between',fontSize:'0.8rem',color:'#94a3b8',marginBottom:6 }}>
                  <span>Total estimé</span>
                  <strong style={{ color:'#1e293b' }}>{prix.toLocaleString()} Fcfa</strong>
                </div>
                <div style={{ fontSize:'0.72rem',color:'#94a3b8',textAlign:'center' }}>
                  <i className="bi bi-shield-check me-1 text-success"></i>Paiement sécurisé PayGate
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Tabs + Content ── */}
      <div className="container" style={{ paddingTop:32, paddingBottom:60 }}>
<div className="service-detail-layout flex-column flex-lg-row gap-3 gap-lg-4" style={{ alignItems:'flex-start' }}>
          {/* Main */}
<div className="flex-grow-1 w-100 w-md-auto" style={{ minWidth:0 }}>
            {/* Tab bar */}
            <div className="service-detail-tabs" style={{ display:'flex',gap:0,borderBottom:'2px solid #e2e8f0',marginBottom:24 }}>
              {TABS.map(tab => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                  style={{ padding:'12px 20px',border:'none',cursor:'pointer',fontSize:'0.88rem',fontWeight:activeTab===tab.id?700:400,
                    color:activeTab===tab.id?'var(--primary-color)':'#64748b',
                    background:'none',borderBottom:`3px solid ${activeTab===tab.id?'var(--primary-color)':'transparent'}`,
                    marginBottom:-2,transition:'all 0.2s',display:'flex',gap:6,alignItems:'center' }}>
                  <i className={`bi ${tab.icon}`}></i> {tab.label}
                </button>
              ))}
            </div>

            {/* Description tab */}
            {activeTab === 'description' && (
              <div>
                <div className="card-custom" style={{ padding:24,marginBottom:16 }}>
                  <h4 style={{ fontWeight:700,color:'#0c2340',marginBottom:16 }}>À propos de ce service</h4>
                  <p style={{ color:'#64748b',lineHeight:1.9,fontSize:'0.95rem',marginBottom:0 }}>
                    {service.description || 'Aucune description disponible pour ce service.'}
                  </p>
                </div>

                {/* Key info cards */}
                <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(160px,1fr))',gap:12 }}>
                  {[
                    { icon:'bi-clock', label:'Durée estimée', val:'1h – 3h', color:'#0284c7' },
                    { icon:'bi-geo-alt', label:'Zone couverte', val:'Tout le Togo', color:'#16a34a' },
                    { icon:'bi-shield-check', label:'Garantie', val:'Satisfaction garantie', color:'#7c3aed' },
                    { icon:'bi-bell', label:'Réponse', val:'Sous 24h', color:'#ea580c' },
                  ].map(info => (
                    <div key={info.label} style={{ background:'white',border:'1.5px solid #f1f5f9',borderRadius:12,padding:'14px 16px',borderTop:`3px solid ${info.color}` }}>
                      <i className={`bi ${info.icon}`} style={{ color:info.color,fontSize:'1.3rem',display:'block',marginBottom:8 }}></i>
                      <div style={{ fontSize:'0.72rem',color:'#94a3b8',marginBottom:2 }}>{info.label}</div>
                      <div style={{ fontWeight:700,fontSize:'0.82rem',color:'#1e293b' }}>{info.val}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Prestataire tab */}
            {activeTab === 'prestataire' && (
              <div className="card-custom" style={{ padding:24 }}>
                <h4 style={{ fontWeight:700,color:'#0c2340',marginBottom:20 }}>À propos du prestataire</h4>
                <div style={{ display:'flex',gap:20,alignItems:'flex-start',flexWrap:'wrap' }}>
                  <div style={{ width:70,height:70,borderRadius:'50%',background:'linear-gradient(135deg,var(--primary-color),#0369a1)',color:'white',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700,fontSize:'1.8rem',flexShrink:0 }}>
                    {((service.prestataire?.user?.first_name?.[0] || service.prestataire?.user?.username?.[0] || 'P').toUpperCase())}
                  </div>
                  <div style={{ flex:1 }}>
                    <h5 style={{ fontWeight:800,color:'#0c2340',marginBottom:4 }}>{(`${service.prestataire?.user?.first_name || ''} ${service.prestataire?.user?.last_name || ''}`.trim() || service.prestataire?.user?.username)}</h5>
                    {service.prestataire?.specialite && (
                      <span style={{ background:'#e0f2fe',color:'#0369a1',padding:'3px 12px',borderRadius:20,fontSize:'0.8rem',fontWeight:600 }}>
                        {service.prestataire.specialite}
                      </span>
                    )}
                    {service.prestataire?.bio && (
                      <p style={{ color:'#64748b',marginTop:12,lineHeight:1.7,fontSize:'0.9rem' }}>{service.prestataire.bio}</p>
                    )}
                    <div style={{ display:'flex',gap:10,marginTop:14,flexWrap:'wrap' }}>
                      {service.prestataire?.telephone && (
                        <a href={`tel:${service.prestataire.telephone}`}
                          style={{ background:'#f0fdf4',color:'#16a34a',border:'1px solid #bbf7d0',borderRadius:10,padding:'8px 14px',textDecoration:'none',fontSize:'0.85rem',fontWeight:600,display:'flex',gap:6,alignItems:'center' }}>
                          <i className="bi bi-telephone-fill"></i> Appeler
                        </a>
                      )}
                      {service.prestataire?.telephone && (
                        <a href={`https://wa.me/228${service.prestataire.telephone}?text=${encodeURIComponent(`Bonjour, je suis intéressé par votre service : ${service.nom}`)}`}
                          target="_blank" rel="noreferrer"
                          className="btn-whatsapp" style={{ padding:'8px 16px',fontSize:'0.85rem' }}>
                          <i className="bi bi-whatsapp"></i> WhatsApp
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Evaluations tab */}
            {activeTab === 'evaluations' && (
              <div>
                {/* Rating summary */}
                {evaluations.length > 0 && (
                  <div className="card-custom" style={{ padding:24,marginBottom:20,display:'flex',gap:28,flexWrap:'wrap',alignItems:'center' }}>
                    <div style={{ textAlign:'center',flexShrink:0 }}>
                      <div style={{ fontSize:'4rem',fontWeight:900,color:'#f59e0b',lineHeight:1 }}>{avgNote}</div>
                      <StarRating value={Math.round(parseFloat(avgNote))} readOnly size='1.1rem' />
                      <div style={{ color:'#94a3b8',fontSize:'0.8rem',marginTop:4 }}>{evaluations.length} avis</div>
                    </div>
                    <div style={{ flex:1,minWidth:200 }}>
                      {noteDist.map(d => (
                        <div key={d.n} style={{ display:'flex',alignItems:'center',gap:10,marginBottom:8 }}>
                          <span style={{ fontSize:'0.8rem',color:'#64748b',width:8,textAlign:'right',flexShrink:0 }}>{d.n}</span>
                          <i className="bi bi-star-fill" style={{ color:'#f59e0b',fontSize:'0.7rem',flexShrink:0 }}></i>
                          <div style={{ flex:1,height:8,background:'#f1f5f9',borderRadius:20,overflow:'hidden' }}>
                            <div style={{ height:'100%',background:'#f59e0b',borderRadius:20,width:`${d.pct}%`,transition:'width 0.5s' }}></div>
                          </div>
                          <span style={{ fontSize:'0.78rem',color:'#94a3b8',width:30,textAlign:'right',flexShrink:0 }}>{d.count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Eval CTA */}
                <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16 }}>
                  <h5 style={{ fontWeight:700,color:'#0c2340',margin:0 }}>
                    {evaluations.length===0 ? 'Aucun avis pour l\'instant' : 'Avis des clients'}
                  </h5>
                  {user && user.type_compte === 'client' && eligibleReservationId && (
                    <button onClick={() => setShowEvalForm(true)} className="btn-primary-custom btn-sm-custom">
                      <i className="bi bi-star me-1"></i> Laisser un avis
                    </button>
                  )}
                </div>

                {evaluations.length===0 ? (
                  <div style={{ textAlign:'center',padding:'40px 20px',color:'#94a3b8' }}>
                    <i className="bi bi-star" style={{ fontSize:'3rem',display:'block',marginBottom:12,color:'#e2e8f0' }}></i>
                    <p>Soyez le premier à évaluer ce service !</p>
                  </div>
                ) : (
                  <div style={{ display:'flex',flexDirection:'column',gap:12 }}>
                    {evaluations.map((ev,i) => <EvalCard key={i} ev={ev} />)}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="service-detail-sidebar" style={{ width:260, flexShrink:0, display:'flex', flexDirection:'column', gap:14 }}>
            {/* Reserve CTA (sticky) */}
            <div className="card-custom" style={{ padding:20 }}>
              <div style={{ fontWeight:900,fontSize:'1.5rem',color:'var(--primary-color)',marginBottom:4 }}>{prix.toLocaleString()} Fcfa</div>
              <div style={{ fontSize:'0.78rem',color:'#94a3b8',marginBottom:16 }}>Frais de service +3%</div>
              {user && service.disponibilite ? (
                <Link to={`/reserver/${service.id}`} className="btn-primary-custom"
                  style={{ display:'flex',justifyContent:'center',padding:'12px',marginBottom:10,fontWeight:700 }}>
                  <i className="bi bi-calendar-check me-2"></i>Réserver maintenant
                </Link>
              ) : !user ? (
                <Link to="/login" className="btn-primary-custom" style={{ display:'flex',justifyContent:'center',padding:'12px',marginBottom:10 }}>
                  <i className="bi bi-box-arrow-in-right me-2"></i>Se connecter
                </Link>
              ) : (
                <div style={{ background:'#f8fafc',borderRadius:10,padding:12,textAlign:'center',color:'#94a3b8',fontSize:'0.85rem',marginBottom:10 }}>Indisponible actuellement</div>
              )}
              {user && user.type_compte === 'client' && eligibleReservationId && (
                <button onClick={() => setShowEvalForm(true)} className="btn-secondary-custom" style={{ width:'100%',justifyContent:'center',padding:'10px' }}>
                  <i className="bi bi-star me-2"></i>Évaluer ce service
                </button>
              )}
            </div>

            {/* Contact prestataire */}
            {service.prestataire?.telephone && (
              <div className="card-custom" style={{ padding:18 }}>
                <h6 style={{ fontWeight:700,marginBottom:12,color:'#0c2340' }}>Contacter le prestataire</h6>
                <a href={`tel:${service.prestataire.telephone}`}
                  style={{ display:'flex',gap:8,alignItems:'center',padding:'10px 14px',background:'#f0fdf4',color:'#16a34a',border:'1px solid #bbf7d0',borderRadius:10,textDecoration:'none',fontWeight:600,fontSize:'0.85rem',marginBottom:8 }}>
                  <i className="bi bi-telephone-fill"></i> Appeler
                </a>
                <a href={`https://wa.me/228${service.prestataire.telephone}?text=${encodeURIComponent(`Bonjour, je suis intéressé par votre service : ${service.nom}`)}`}
                  target="_blank" rel="noreferrer" className="btn-whatsapp" style={{ display:'flex',justifyContent:'center',padding:'10px',fontWeight:600 }}>
                  <i className="bi bi-whatsapp me-2"></i>WhatsApp
                </a>
              </div>
            )}

            {/* Trust indicators */}
            <div className="card-custom" style={{ padding:18 }}>
              <h6 style={{ fontWeight:700,marginBottom:12,color:'#0c2340' }}>Nos garanties</h6>
              {[
                { icon:'bi-shield-check', label:'Paiement sécurisé', color:'#16a34a' },
                { icon:'bi-clock-history', label:'Réponse sous 24h', color:'#0284c7' },
                { icon:'bi-patch-check', label:'Prestataire vérifié', color:'#7c3aed' },
                { icon:'bi-arrow-counterclockwise', label:'Remboursement possible', color:'#ea580c' },
              ].map(g => (
                <div key={g.label} style={{ display:'flex',gap:10,alignItems:'center',marginBottom:10,fontSize:'0.82rem',color:'#64748b' }}>
                  <i className={`bi ${g.icon}`} style={{ color:g.color,fontSize:'1rem',flexShrink:0 }}></i>
                  {g.label}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}