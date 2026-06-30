import { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const ANIM = `
@keyframes fadeUp  { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
@keyframes fadeIn  { from{opacity:0;transform:scale(.96)} to{opacity:1;transform:scale(1)} }
@keyframes spinRing{ to{transform:rotate(360deg)} }
@keyframes barFill { from{width:0} }
.sd-tab    { transition:all .2s; }
.sd-btn    { transition:all .15s; }
.sd-btn:hover { transform:translateY(-1px); }
.sd-star   { transition:color .1s,transform .1s; }
`;

function StarRating({ value, onChange, size='1.4rem', readOnly=false }) {
  const [hovered, setHovered] = useState(0);
  const display = readOnly ? value : (hovered || value);
  return (
    <div style={{ display:'flex', gap:3 }}>
      {[1,2,3,4,5].map(s => (
        <span key={s} className="sd-star"
          onClick={() => !readOnly && onChange?.(s)}
          onMouseEnter={() => !readOnly && setHovered(s)}
          onMouseLeave={() => !readOnly && setHovered(0)}
          style={{ fontSize:size, cursor:readOnly?'default':'pointer', color:s<=display?'#f59e0b':'#e2e8f0', display:'inline-block', transform:(!readOnly&&s<=display&&!readOnly)?'scale(1.15)':'scale(1)' }}>
          ★
        </span>
      ))}
    </div>
  );
}

function EvalModal({ reservationId, onClose, onSubmitted }) {
  const [note, setNote]     = useState(0);
  const [comm, setComm]     = useState('');
  const [sub,  setSub]      = useState(false);
  const [err,  setErr]      = useState('');

  const submit = async () => {
    if (!note) { setErr('Sélectionnez une note.'); return; }
    setSub(true); setErr('');
    try {
      await api.post(`/reservations/${reservationId}/evaluer/`, { note, commentaire:comm });
      onSubmitted(); onClose();
    } catch(e) { setErr(e.response?.data?.error || 'Erreur lors de l\'envoi.'); }
    finally { setSub(false); }
  };

  const labels = ['','Très mauvais 😞','Mauvais 😕','Moyen 😐','Bien 😊','Excellent 🌟'];

  return (
    <div onClick={e => e.target===e.currentTarget && onClose()} style={{ position:'fixed', inset:0, background:'rgba(12,35,64,.55)', backdropFilter:'blur(4px)', zIndex:9000, display:'flex', alignItems:'center', justifyContent:'center', padding:16, animation:'fadeIn .2s ease' }}>
      <div style={{ background:'#fff', borderRadius:20, width:'min(480px,96vw)', padding:28, boxShadow:'0 24px 60px rgba(0,0,0,.2)', animation:'fadeIn .25s ease' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:22 }}>
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            <div style={{ width:44, height:44, borderRadius:12, background:'#fffbeb', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <i className="bi bi-star-fill" style={{ color:'#f59e0b', fontSize:'1.2rem' }} />
            </div>
            <h4 style={{ fontWeight:800, color:'#0c2340', margin:0 }}>Évaluer ce service</h4>
          </div>
          <button onClick={onClose} style={{ background:'#f1f5f9', border:'none', borderRadius:8, width:32, height:32, cursor:'pointer', color:'#64748b', display:'flex', alignItems:'center', justifyContent:'center' }}>✕</button>
        </div>

        <div style={{ textAlign:'center', marginBottom:24 }}>
          <p style={{ color:'#64748b', marginBottom:14, fontSize:'0.9rem' }}>Quelle note donnez-vous à ce service ?</p>
          <StarRating value={note} onChange={setNote} size="2.4rem" />
          {note > 0 && <div style={{ marginTop:10, fontWeight:700, color:'#f59e0b', fontSize:'0.9rem', animation:'fadeUp .2s ease' }}>{labels[note]}</div>}
        </div>

        <div style={{ marginBottom:20 }}>
          <label style={{ fontWeight:700, fontSize:'0.78rem', color:'#374151', display:'block', marginBottom:8, textTransform:'uppercase', letterSpacing:'.04em' }}>
            Commentaire (optionnel)
          </label>
          <textarea value={comm} onChange={e => setComm(e.target.value)} rows={4}
            placeholder="Partagez votre expérience, qualité du service, ponctualité..."
            style={{ width:'100%', border:'1.5px solid #e2e8f0', borderRadius:12, padding:'11px 14px', fontSize:'0.88rem', resize:'vertical', outline:'none', fontFamily:'inherit', boxSizing:'border-box', transition:'border-color .2s' }}
            onFocus={e => e.target.style.borderColor='#0284c7'}
            onBlur={e => e.target.style.borderColor='#e2e8f0'} />
        </div>

        {err && <div style={{ background:'#fef2f2', border:'1px solid #fecaca', borderRadius:10, padding:'10px 14px', marginBottom:16, color:'#b91c1c', fontSize:'0.85rem', display:'flex', gap:8 }}><i className="bi bi-exclamation-triangle-fill" />{err}</div>}

        <div style={{ display:'flex', gap:10 }}>
          <button onClick={onClose} style={{ flex:1, padding:'12px', borderRadius:12, border:'1.5px solid #e2e8f0', background:'#f8fafc', color:'#64748b', fontWeight:700, cursor:'pointer', fontSize:'0.88rem' }}>Annuler</button>
          <button onClick={submit} disabled={sub||!note} style={{ flex:1, padding:'12px', borderRadius:12, border:'none', background: !note ? '#e2e8f0' : 'linear-gradient(135deg,#0c2340,#0284c7)', color: !note ? '#94a3b8' : '#fff', fontWeight:800, cursor: !note ? 'not-allowed' : 'pointer', fontSize:'0.9rem', display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
            {sub ? <><span style={{ width:16, height:16, border:'2.5px solid rgba(255,255,255,.3)', borderTopColor:'#fff', borderRadius:'50%', animation:'spinRing .7s linear infinite', display:'inline-block' }} />Envoi…</> : <><i className="bi bi-send" />Publier</>}
          </button>
        </div>
      </div>
    </div>
  );
}

function EvalCard({ ev }) {
  const nom = typeof ev.client === 'string' ? ev.client : (ev.client?.user?.first_name ? `${ev.client.user.first_name} ${ev.client.user.last_name}`.trim() : ev.client?.user?.username || 'Utilisateur');
  const initials = nom?.[0]?.toUpperCase() || '?';
  const date = new Date(ev.date_eval || ev.created_at || Date.now());
  return (
    <div style={{ background:'#fff', border:'1.5px solid #f1f5f9', borderRadius:16, padding:'18px 20px', boxShadow:'0 2px 10px rgba(0,0,0,.04)', animation:'fadeUp .4s ease' }}>
      <div style={{ display:'flex', alignItems:'flex-start', gap:12, marginBottom:ev.commentaire?10:0 }}>
        <div style={{ width:40, height:40, borderRadius:'50%', background:'linear-gradient(135deg,#0c2340,#0284c7)', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, fontSize:'0.9rem', flexShrink:0 }}>
          {initials}
        </div>
        <div style={{ flex:1 }}>
          <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:4, flexWrap:'wrap' }}>
            <span style={{ fontWeight:700, fontSize:'0.9rem', color:'#1e293b' }}>{nom}</span>
            <span style={{ fontSize:'0.75rem', color:'#94a3b8' }}>{date.toLocaleDateString('fr-FR',{day:'numeric',month:'long',year:'numeric'})}</span>
          </div>
          <StarRating value={ev.note} readOnly size='.9rem' />
        </div>
        <div style={{ background:'#fffbeb', border:'1px solid #fde68a', borderRadius:8, padding:'3px 10px', fontWeight:800, color:'#d97706', fontSize:'0.88rem', flexShrink:0 }}>
          {ev.note}/5
        </div>
      </div>
      {ev.commentaire && <p style={{ color:'#64748b', fontSize:'0.87rem', lineHeight:1.7, margin:0, paddingLeft:52 }}>{ev.commentaire}</p>}
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
    <div style={{ minHeight:'70vh', display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', gap:16 }}>
      <div style={{ width:44, height:44, borderRadius:'50%', border:'4px solid #e0f2fe', borderTopColor:'#0284c7', animation:'spinRing .8s linear infinite' }} />
      <style>{`@keyframes spinRing{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
  if (!service) return <div className="container py-5"><div className="alert alert-danger">Service introuvable.</div></div>;

  const avgNote = evaluations.length ? (evaluations.reduce((a,e) => a+e.note, 0)/evaluations.length).toFixed(1) : null;
  const prix    = parseFloat(service.prix) || 0;
  const noteDist = [5,4,3,2,1].map(n => ({ n, count:evaluations.filter(e=>e.note===n).length, pct:evaluations.length?Math.round(evaluations.filter(e=>e.note===n).length/evaluations.length*100):0 }));

  const TABS = [
    { id:'description', label:'Description',            icon:'file-text' },
    { id:'prestataire', label:'Prestataire',            icon:'person-badge' },
    { id:'evaluations', label:`Avis (${evaluations.length})`, icon:'star' },
  ];

  return (
    <>
      <style>{ANIM}</style>
      {showEval && <EvalModal reservationId={eligibleId} onClose={() => setShowEval(false)} onSubmitted={fetchData} />}

      <div style={{ background:'#f0f8ff', minHeight:'100vh' }}>

        {/* ── HERO ── */}
        <div style={{ background:'linear-gradient(135deg,#0c2340 0%,#1e3a5f 50%,#0284c7 100%)', paddingTop:36, paddingBottom:60, position:'relative', overflow:'hidden' }}>
          <div style={{ position:'absolute', top:-60, right:-60, width:260, height:260, borderRadius:'50%', background:'rgba(255,255,255,.04)', pointerEvents:'none' }} />
          <div style={{ position:'absolute', bottom:-40, left:'20%', width:180, height:180, borderRadius:'50%', background:'rgba(255,255,255,.03)', pointerEvents:'none' }} />

          <div className="container" style={{ position:'relative', zIndex:1 }}>
            {/* Breadcrumb */}
            <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:22, fontSize:'0.82rem', flexWrap:'wrap' }}>
              <Link to="/"        style={{ color:'rgba(255,255,255,.55)', textDecoration:'none' }}>Accueil</Link>
              <i className="bi bi-chevron-right" style={{ color:'rgba(255,255,255,.3)', fontSize:'0.65rem' }} />
              <Link to="/services" style={{ color:'rgba(255,255,255,.55)', textDecoration:'none' }}>Services</Link>
              <i className="bi bi-chevron-right" style={{ color:'rgba(255,255,255,.3)', fontSize:'0.65rem' }} />
              <span style={{ color:'rgba(255,255,255,.9)' }}>{service.nom}</span>
            </div>

            <div style={{ display:'flex', gap:24, alignItems:'flex-start', flexWrap:'wrap' }}>
              {/* Image / Icône */}
              <div style={{ flexShrink:0 }}>
                {service.image_url ? (
                  <img src={service.image_url} alt={service.nom} style={{ width:130, height:130, borderRadius:20, objectFit:'cover', border:'3px solid rgba(255,255,255,.25)', boxShadow:'0 8px 32px rgba(0,0,0,.3)' }} />
                ) : (
                  <div style={{ width:90, height:90, borderRadius:20, background:'rgba(255,255,255,.1)', backdropFilter:'blur(8px)', display:'flex', alignItems:'center', justifyContent:'center', border:'1px solid rgba(255,255,255,.2)' }}>
                    <i className={`bi ${service.categorie?.icone||'bi-briefcase'}`} style={{ fontSize:'2.8rem', color:'#fff' }} />
                  </div>
                )}
              </div>

              <div style={{ flex:1, minWidth:240 }}>
                <div style={{ display:'flex', gap:8, marginBottom:12, flexWrap:'wrap' }}>
                  {service.categorie?.nom && (
                    <span style={{ background:'rgba(255,255,255,.14)', color:'#fff', padding:'4px 14px', borderRadius:20, fontSize:'0.78rem', fontWeight:600, border:'1px solid rgba(255,255,255,.22)', backdropFilter:'blur(4px)' }}>
                      <i className={`bi ${service.categorie.icone||'bi-tag'} me-1`} />{service.categorie.nom}
                    </span>
                  )}
                  <span style={{ background: service.disponibilite?'rgba(34,197,94,.2)':'rgba(148,163,184,.2)', color:service.disponibilite?'#4ade80':'#94a3b8', padding:'4px 14px', borderRadius:20, fontSize:'0.78rem', fontWeight:700, border:`1px solid ${service.disponibilite?'rgba(34,197,94,.4)':'rgba(148,163,184,.3)'}` }}>
                    {service.disponibilite ? '● Disponible' : '○ Indisponible'}
                  </span>
                </div>

                <h1 style={{ color:'#fff', fontWeight:900, fontSize:'clamp(1.4rem,4vw,2rem)', marginBottom:10, lineHeight:1.2 }}>{service.nom}</h1>

                {avgNote && (
                  <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:14 }}>
                    <StarRating value={Math.round(parseFloat(avgNote))} readOnly size='1rem' />
                    <span style={{ color:'rgba(255,255,255,.9)', fontWeight:700 }}>{avgNote}</span>
                    <span style={{ color:'rgba(255,255,255,.5)', fontSize:'0.82rem' }}>({evaluations.length} avis)</span>
                  </div>
                )}

                <div style={{ display:'flex', alignItems:'baseline', gap:6 }}>
                  <span style={{ color:'rgba(255,255,255,.6)', fontSize:'0.88rem' }}>À partir de</span>
                  <span style={{ color:'#fff', fontWeight:900, fontSize:'2rem', lineHeight:1 }}>{prix.toLocaleString()}</span>
                  <span style={{ color:'rgba(255,255,255,.7)', fontSize:'0.95rem' }}>Fcfa</span>
                </div>
              </div>

              {/* CTA card */}
              <div style={{ background:'#fff', borderRadius:18, padding:20, width:220, flexShrink:0, boxShadow:'0 8px 32px rgba(0,0,0,.25)' }}>
                <div style={{ fontWeight:900, fontSize:'1.4rem', color:'#0284c7', marginBottom:3 }}>{prix.toLocaleString()} Fcfa</div>
                <div style={{ fontSize:'0.75rem', color:'#94a3b8', marginBottom:16 }}>3% de frais déduits du prestataire</div>

                {user ? (
                  service.disponibilite ? (
                    <Link to={`/reserver/${service.id}`} className="sd-btn" style={{ display:'flex', justifyContent:'center', alignItems:'center', gap:8, padding:'12px', borderRadius:12, background:'linear-gradient(135deg,#0c2340,#0284c7)', color:'#fff', fontWeight:800, textDecoration:'none', marginBottom:10, fontSize:'0.92rem', boxShadow:'0 4px 16px rgba(2,132,199,.35)' }}>
                      <i className="bi bi-calendar-check" /> Réserver
                    </Link>
                  ) : (
                    <div style={{ textAlign:'center', color:'#94a3b8', fontSize:'0.85rem', marginBottom:10, padding:'12px', background:'#f8fafc', borderRadius:10 }}>Service indisponible</div>
                  )
                ) : (
                  <Link to="/login" className="sd-btn" style={{ display:'flex', justifyContent:'center', alignItems:'center', gap:8, padding:'12px', borderRadius:12, background:'linear-gradient(135deg,#0c2340,#0284c7)', color:'#fff', fontWeight:800, textDecoration:'none', marginBottom:10, fontSize:'0.88rem' }}>
                    <i className="bi bi-box-arrow-in-right" /> Connexion requise
                  </Link>
                )}

                {user?.type_compte === 'client' && eligibleId && (
                  <button onClick={() => setShowEval(true)} className="sd-btn" style={{ width:'100%', padding:'10px', borderRadius:12, border:'1.5px solid #e2e8f0', background:'#f8fafc', color:'#64748b', fontWeight:700, cursor:'pointer', fontSize:'0.85rem', display:'flex', alignItems:'center', justifyContent:'center', gap:7 }}>
                    <i className="bi bi-star" /> Évaluer
                  </button>
                )}

                <div style={{ marginTop:14, paddingTop:12, borderTop:'1px solid #f1f5f9' }}>
                  <div style={{ fontSize:'0.72rem', color:'#94a3b8', textAlign:'center', display:'flex', alignItems:'center', justifyContent:'center', gap:5 }}>
                    <i className="bi bi-shield-check" style={{ color:'#10b981' }} /> Paiement sécurisé PayGate
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── CONTENU ── */}
        <div className="container" style={{ paddingTop:28, paddingBottom:60 }}>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 280px', gap:20, alignItems:'start' }}>

            {/* Main */}
            <div>
              {/* Tabs */}
              <div style={{ background:'#fff', borderRadius:14, padding:'4px', marginBottom:20, border:'1.5px solid #e0f2fe', display:'flex', gap:4, boxShadow:'0 2px 10px rgba(2,132,199,.06)' }}>
                {TABS.map(tab => (
                  <button key={tab.id} className="sd-tab" onClick={() => setActiveTab(tab.id)} style={{ flex:1, padding:'10px 12px', border:'none', cursor:'pointer', fontSize:'0.84rem', fontWeight: activeTab===tab.id ? 700 : 500, color: activeTab===tab.id ? '#fff' : '#64748b', background: activeTab===tab.id ? 'linear-gradient(135deg,#0c2340,#0284c7)' : 'transparent', borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center', gap:6 }}>
                    <i className={`bi bi-${tab.icon}`} />{tab.label}
                  </button>
                ))}
              </div>

              {/* Description */}
              {activeTab === 'description' && (
                <div style={{ animation:'fadeUp .3s ease' }}>
                  <div style={{ background:'#fff', borderRadius:16, padding:24, marginBottom:16, border:'1.5px solid #e0f2fe', boxShadow:'0 2px 10px rgba(2,132,199,.05)' }}>
                    <h4 style={{ fontWeight:800, color:'#0c2340', marginBottom:14 }}>À propos de ce service</h4>
                    <p style={{ color:'#64748b', lineHeight:1.9, fontSize:'0.95rem', margin:0 }}>
                      {service.description || 'Aucune description disponible.'}
                    </p>
                  </div>
                  <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(155px,1fr))', gap:10 }}>
                    {[
                      { icon:'clock',         label:'Durée estimée',  val:'1h – 3h',                color:'#0284c7' },
                      { icon:'geo-alt',        label:'Zone couverte',  val:'Tout le Togo',           color:'#10b981' },
                      { icon:'shield-check',   label:'Garantie',       val:'Satisfaction garantie',  color:'#8b5cf6' },
                      { icon:'bell',           label:'Réponse',        val:'Sous 24h',               color:'#ea580c' },
                    ].map(info => (
                      <div key={info.label} style={{ background:'#fff', border:'1.5px solid #f1f5f9', borderRadius:14, padding:'14px 16px', borderTop:`3px solid ${info.color}` }}>
                        <i className={`bi bi-${info.icon}`} style={{ color:info.color, fontSize:'1.2rem', display:'block', marginBottom:8 }} />
                        <div style={{ fontSize:'0.7rem', color:'#94a3b8', marginBottom:2 }}>{info.label}</div>
                        <div style={{ fontWeight:700, fontSize:'0.8rem', color:'#1e293b' }}>{info.val}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Prestataire */}
              {activeTab === 'prestataire' && (
                <div style={{ background:'#fff', borderRadius:16, padding:24, border:'1.5px solid #e0f2fe', boxShadow:'0 2px 10px rgba(2,132,199,.05)', animation:'fadeUp .3s ease' }}>
                  <h4 style={{ fontWeight:800, color:'#0c2340', marginBottom:20 }}>À propos du prestataire</h4>
                  <div style={{ display:'flex', gap:18, alignItems:'flex-start', flexWrap:'wrap' }}>
                    <div style={{ width:68, height:68, borderRadius:'50%', background:'linear-gradient(135deg,#0c2340,#0284c7)', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, fontSize:'1.7rem', flexShrink:0 }}>
                      {(service.prestataire?.user?.first_name?.[0] || service.prestataire?.user?.username?.[0] || 'P').toUpperCase()}
                    </div>
                    <div style={{ flex:1 }}>
                      <h5 style={{ fontWeight:800, color:'#0c2340', marginBottom:6 }}>
                        {`${service.prestataire?.user?.first_name||''} ${service.prestataire?.user?.last_name||''}`.trim() || service.prestataire?.user?.username}
                      </h5>
                      {service.prestataire?.specialite && (
                        <span style={{ background:'#e0f2fe', color:'#0369a1', padding:'3px 12px', borderRadius:20, fontSize:'0.78rem', fontWeight:600, display:'inline-block', marginBottom:12 }}>
                          {service.prestataire.specialite}
                        </span>
                      )}
                      <div style={{ display:'flex', gap:10, flexWrap:'wrap', marginTop:12 }}>
                        {service.prestataire?.telephone && (
                          <a href={`tel:${service.prestataire.telephone}`} style={{ background:'#f0fdf4', color:'#16a34a', border:'1px solid #bbf7d0', borderRadius:10, padding:'8px 14px', textDecoration:'none', fontSize:'0.83rem', fontWeight:600, display:'flex', gap:6, alignItems:'center' }}>
                            <i className="bi bi-telephone-fill" /> Appeler
                          </a>
                        )}
                        {service.prestataire?.telephone && (
                          <a href={`https://wa.me/228${service.prestataire.telephone}?text=${encodeURIComponent(`Bonjour, je suis intéressé par votre service : ${service.nom}`)}`} target="_blank" rel="noreferrer"
                            style={{ background:'#22c55e', color:'#fff', border:'none', borderRadius:10, padding:'8px 14px', textDecoration:'none', fontSize:'0.83rem', fontWeight:600, display:'flex', gap:6, alignItems:'center' }}>
                            <i className="bi bi-whatsapp" /> WhatsApp
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Évaluations */}
              {activeTab === 'evaluations' && (
                <div style={{ animation:'fadeUp .3s ease' }}>
                  {evaluations.length > 0 && (
                    <div style={{ background:'#fff', borderRadius:16, padding:24, marginBottom:20, border:'1.5px solid #e0f2fe', boxShadow:'0 2px 10px rgba(2,132,199,.05)', display:'flex', gap:28, flexWrap:'wrap', alignItems:'center' }}>
                      <div style={{ textAlign:'center', flexShrink:0 }}>
                        <div style={{ fontSize:'3.8rem', fontWeight:900, color:'#f59e0b', lineHeight:1 }}>{avgNote}</div>
                        <StarRating value={Math.round(parseFloat(avgNote))} readOnly size='1rem' />
                        <div style={{ color:'#94a3b8', fontSize:'0.78rem', marginTop:5 }}>{evaluations.length} avis</div>
                      </div>
                      <div style={{ flex:1, minWidth:180 }}>
                        {noteDist.map(d => (
                          <div key={d.n} style={{ display:'flex', alignItems:'center', gap:8, marginBottom:7 }}>
                            <span style={{ fontSize:'0.78rem', color:'#64748b', width:8 }}>{d.n}</span>
                            <i className="bi bi-star-fill" style={{ color:'#f59e0b', fontSize:'0.65rem', flexShrink:0 }} />
                            <div style={{ flex:1, height:7, background:'#f1f5f9', borderRadius:20, overflow:'hidden' }}>
                              <div style={{ height:'100%', background:'linear-gradient(90deg,#fbbf24,#f59e0b)', borderRadius:20, width:`${d.pct}%`, animation:'barFill .7s ease' }} />
                            </div>
                            <span style={{ fontSize:'0.75rem', color:'#94a3b8', width:20, textAlign:'right' }}>{d.count}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
                    <h5 style={{ fontWeight:800, color:'#0c2340', margin:0, fontSize:'0.95rem' }}>
                      {evaluations.length === 0 ? 'Aucun avis pour l\'instant' : 'Avis des clients'}
                    </h5>
                    {user?.type_compte === 'client' && eligibleId && (
                      <button onClick={() => setShowEval(true)} style={{ padding:'8px 16px', borderRadius:10, border:'none', background:'linear-gradient(135deg,#0c2340,#0284c7)', color:'#fff', fontWeight:700, fontSize:'0.82rem', cursor:'pointer', display:'flex', alignItems:'center', gap:6 }}>
                        <i className="bi bi-star" /> Laisser un avis
                      </button>
                    )}
                  </div>

                  {evaluations.length === 0 ? (
                    <div style={{ textAlign:'center', padding:'50px 20px', color:'#94a3b8' }}>
                      <i className="bi bi-star" style={{ fontSize:'3rem', display:'block', marginBottom:12, color:'#e2e8f0' }} />
                      <p>Soyez le premier à évaluer ce service !</p>
                    </div>
                  ) : (
                    <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                      {evaluations.map((ev,i) => <EvalCard key={i} ev={ev} />)}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
              <div style={{ background:'#fff', borderRadius:16, padding:20, border:'1.5px solid #e0f2fe', boxShadow:'0 4px 16px rgba(2,132,199,.07)' }}>
                <div style={{ fontWeight:900, fontSize:'1.5rem', color:'#0284c7', marginBottom:3 }}>{prix.toLocaleString()} Fcfa</div>
                <div style={{ fontSize:'0.75rem', color:'#94a3b8', marginBottom:16 }}>Frais de service +3% (déduits)</div>
                {user && service.disponibilite ? (
                  <Link to={`/reserver/${service.id}`} className="sd-btn" style={{ display:'flex', justifyContent:'center', alignItems:'center', gap:8, padding:'12px', borderRadius:12, background:'linear-gradient(135deg,#0c2340,#0284c7)', color:'#fff', fontWeight:800, textDecoration:'none', marginBottom:10, fontSize:'0.9rem', boxShadow:'0 4px 14px rgba(2,132,199,.3)' }}>
                    <i className="bi bi-calendar-check" /> Réserver maintenant
                  </Link>
                ) : !user ? (
                  <Link to="/login" className="sd-btn" style={{ display:'flex', justifyContent:'center', alignItems:'center', gap:8, padding:'12px', borderRadius:12, background:'linear-gradient(135deg,#0c2340,#0284c7)', color:'#fff', fontWeight:800, textDecoration:'none', marginBottom:10 }}>
                    <i className="bi bi-box-arrow-in-right" /> Se connecter
                  </Link>
                ) : (
                  <div style={{ background:'#f8fafc', borderRadius:10, padding:12, textAlign:'center', color:'#94a3b8', fontSize:'0.85rem', marginBottom:10 }}>Indisponible</div>
                )}
                {user?.type_compte === 'client' && eligibleId && (
                  <button onClick={() => setShowEval(true)} className="sd-btn" style={{ width:'100%', padding:'10px', borderRadius:12, border:'1.5px solid #e2e8f0', background:'#f8fafc', color:'#64748b', fontWeight:700, cursor:'pointer', fontSize:'0.83rem', display:'flex', alignItems:'center', justifyContent:'center', gap:6 }}>
                    <i className="bi bi-star" /> Évaluer ce service
                  </button>
                )}
              </div>

              {service.prestataire?.telephone && (
                <div style={{ background:'#fff', borderRadius:16, padding:16, border:'1.5px solid #e0f2fe', boxShadow:'0 4px 16px rgba(2,132,199,.07)' }}>
                  <h6 style={{ fontWeight:800, marginBottom:12, color:'#0c2340', fontSize:'0.88rem' }}>Contacter le prestataire</h6>
                  <a href={`tel:${service.prestataire.telephone}`} style={{ display:'flex', gap:8, alignItems:'center', padding:'10px 14px', background:'#f0fdf4', color:'#16a34a', border:'1px solid #bbf7d0', borderRadius:10, textDecoration:'none', fontWeight:600, fontSize:'0.83rem', marginBottom:8 }}>
                    <i className="bi bi-telephone-fill" /> Appeler
                  </a>
                  <a href={`https://wa.me/228${service.prestataire.telephone}?text=${encodeURIComponent(`Bonjour, je suis intéressé par : ${service.nom}`)}`} target="_blank" rel="noreferrer"
                    style={{ display:'flex', justifyContent:'center', alignItems:'center', gap:8, padding:'10px', background:'#22c55e', color:'#fff', borderRadius:10, textDecoration:'none', fontWeight:700, fontSize:'0.83rem' }}>
                    <i className="bi bi-whatsapp" /> WhatsApp
                  </a>
                </div>
              )}

              <div style={{ background:'#fff', borderRadius:16, padding:16, border:'1.5px solid #e0f2fe', boxShadow:'0 4px 16px rgba(2,132,199,.07)' }}>
                <h6 style={{ fontWeight:800, marginBottom:12, color:'#0c2340', fontSize:'0.88rem' }}>Nos garanties</h6>
                {[
                  { icon:'shield-check',          color:'#16a34a', label:'Paiement sécurisé' },
                  { icon:'clock-history',          color:'#0284c7', label:'Réponse sous 24h' },
                  { icon:'patch-check',            color:'#8b5cf6', label:'Prestataire vérifié' },
                  { icon:'arrow-counterclockwise', color:'#ea580c', label:'Remboursement possible' },
                ].map(g => (
                  <div key={g.label} style={{ display:'flex', gap:10, alignItems:'center', marginBottom:9, fontSize:'0.82rem', color:'#64748b' }}>
                    <i className={`bi bi-${g.icon}`} style={{ color:g.color, fontSize:'0.95rem', flexShrink:0 }} />{g.label}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`@media(max-width:900px){ div[style*="grid-template-columns: 1fr 280px"]{ grid-template-columns:1fr !important; } }`}</style>
    </>
  );
}