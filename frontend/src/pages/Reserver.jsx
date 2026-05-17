import { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const JOURS    = ['Dim','Lun','Mar','Mer','Jeu','Ven','Sam'];
const MOIS     = ['Jan','Fév','Mar','Avr','Mai','Juin','Juil','Aoû','Sep','Oct','Nov','Déc'];
const CRENEAUX = ['08:00','09:00','10:00','11:00','14:00','15:00','16:00','17:00','18:00'];

function buildCalendar(year, month) {
  const first = new Date(year, month, 1);
  const days  = [];
  const start = new Date(first);
  start.setDate(start.getDate() - first.getDay());
  for (let i = 0; i < 42; i++) { days.push(new Date(start)); start.setDate(start.getDate() + 1); }
  return days;
}
const fmtDate   = d => d ? `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}` : '';
const fmtDateFr = d => d ? `${JOURS[d.getDay()]} ${d.getDate()} ${MOIS[d.getMonth()]} ${d.getFullYear()}` : '-';

const ETAPES = [
  { key:'calendrier', label:'Date & Heure', icon:'calendar3'   },
  { key:'details',    label:'Détails',      icon:'geo-alt'     },
  { key:'recap',      label:'Récapitulatif',icon:'receipt'     },
];

const CSS = `
@keyframes fadeUp  { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
@keyframes fadeIn  { from{opacity:0} to{opacity:1} }
@keyframes spin    { to{transform:rotate(360deg)} }
@keyframes success { 0%{transform:scale(.8);opacity:0} 60%{transform:scale(1.1)} 100%{transform:scale(1);opacity:1} }
.rv-day    { transition:all .15s; }
.rv-day:hover:not(:disabled) { background:#e0f2fe !important; color:#0284c7 !important; transform:scale(1.05); }
.rv-slot   { transition:all .15s; }
.rv-slot:hover:not(:disabled) { transform:translateY(-1px); }
.rv-input-wrap:focus-within { border-color:#0284c7 !important; box-shadow:0 0 0 3px rgba(2,132,199,.15) !important; }
`;

export default function Reserver() {
  const { id }    = useParams();
  const navigate  = useNavigate();
  const { user }  = useAuth();

  const [service,     setService]   = useState(null);
  const [existantes,  setExistantes]= useState([]);
  const [loading,     setLoading]   = useState(true);
  const [etape,       setEtape]     = useState('calendrier');

  const today = new Date();
  const [calYear,  setCalYear]   = useState(today.getFullYear());
  const [calMonth, setCalMonth]  = useState(today.getMonth());
  const [selDate,  setSelDate]   = useState(null);
  const [selHeure, setSelHeure]  = useState('');
  const [lieu,     setLieu]      = useState('');
  const [notes,    setNotes]     = useState('');
  const [submitting,setSubmitting]=useState(false);
  const [errorMsg, setErrorMsg]  = useState('');

  useEffect(() => {
    Promise.all([
      api.get(`/services/${id}/`),
      api.get(`/reservations/?service=${id}`).catch(()=>({data:[]})),
    ]).then(([s,r]) => { setService(s.data); setExistantes(r.data||[]); })
    .catch(console.error).finally(()=>setLoading(false));
  }, [id]);

  if (loading) return (
    <div style={{ minHeight:'60vh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:14, background:'#f0f8ff' }}>
      <div style={{ width:48, height:48, borderRadius:'50%', border:'4px solid #e0f2fe', borderTopColor:'#0284c7', animation:'spin .8s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <p style={{ color:'#64748b' }}>Chargement…</p>
    </div>
  );
  if (!service) return <div className="container py-5"><div className="alert alert-danger">Service introuvable.</div></div>;

  const prix  = parseFloat(service.prix) || 0;
  const frais = Math.round(prix * 0.03);
  const total = prix;

  const bloques = selDate
    ? existantes.filter(r=>r.date_debut?.startsWith(fmtDate(selDate))&&['en_attente','en_attente_paiement','confirmee'].includes(r.statut)).map(r=>r.date_debut?.split('T')[1]?.slice(0,5))
    : [];

  const isPast = d => { const t=new Date(); t.setHours(0,0,0,0); return d<t; };

  const envoyer = async () => {
    if (!lieu.trim()) { setErrorMsg('Veuillez préciser le lieu.'); return; }
    setErrorMsg(''); setSubmitting(true);
    try {
      await api.post('/reservations/reserver/', { service_id:service.id, date_debut:selDate&&selHeure?`${fmtDate(selDate)}T${selHeure}:00`:null, lieu:lieu.trim(), notes:notes.trim() });
      setEtape('succes');
    } catch(err) { setErrorMsg(err.response?.data?.error||'Erreur. Réessayez.'); }
    finally { setSubmitting(false); }
  };

  const etapeIdx = ETAPES.findIndex(e=>e.key===etape);
  const days     = buildCalendar(calYear, calMonth);

  /* ── SUCCÈS ─────────────────────────────────── */
  if (etape === 'succes') return (
    <>
      <style>{CSS}</style>
      <div style={{ minHeight:'70vh', display:'flex', alignItems:'center', justifyContent:'center', padding:24, background:'#f0f8ff' }}>
        <div style={{ background:'#fff', borderRadius:24, padding:'48px 40px', maxWidth:520, width:'100%', textAlign:'center', boxShadow:'0 16px 60px rgba(2,132,199,.12)', animation:'fadeUp .4s ease' }}>
          <div style={{ width:80, height:80, borderRadius:'50%', background:'#d1fae5', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 20px', animation:'success .5s ease' }}>
            <i className="bi bi-check-circle-fill" style={{ fontSize:'2.5rem', color:'#059669' }} />
          </div>
          <h3 style={{ fontWeight:900, color:'#0c2340', marginBottom:8 }}>Demande envoyée !</h3>
          <p style={{ color:'#64748b', marginBottom:28, lineHeight:1.7 }}>
            Votre demande a été transmise au prestataire.<br />
            <strong style={{ color:'#0c2340' }}>Il dispose de 24h pour confirmer.</strong>
          </p>
          <div style={{ background:'#f0f9ff', border:'1px solid #bae6fd', borderRadius:14, padding:'16px 18px', textAlign:'left', marginBottom:28 }}>
            {[['Service',service.nom],['Date',fmtDateFr(selDate)],['Heure',selHeure||'Non précisée'],['Lieu',lieu||'-']].map(([k,v])=>(
              <div key={k} style={{ display:'flex', justifyContent:'space-between', marginBottom:8, fontSize:'0.9rem' }}>
                <span style={{ color:'#64748b' }}>{k}</span>
                <span style={{ fontWeight:700, color:'#0c2340', maxWidth:200, textAlign:'right', wordBreak:'break-word' }}>{v}</span>
              </div>
            ))}
          </div>
          <button onClick={()=>navigate('/mes-reservations')} style={{ width:'100%', padding:'14px', borderRadius:12, border:'none', background:'linear-gradient(135deg,#0c2340,#0284c7)', color:'#fff', fontWeight:800, fontSize:'1rem', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:8, boxShadow:'0 4px 16px rgba(2,132,199,.35)' }}>
            <i className="bi bi-calendar-check" />Voir mes réservations
          </button>
        </div>
      </div>
    </>
  );

  return (
    <>
      <style>{CSS}</style>
      <div style={{ background:'#f0f8ff', minHeight:'70vh', paddingBottom:60 }}>
        <div className="container" style={{ paddingTop:32 }}>

          {/* Breadcrumb */}
          <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:24, fontSize:'0.85rem', color:'#64748b' }}>
            <Link to="/" style={{ color:'#0284c7', textDecoration:'none' }}>Accueil</Link>
            <i className="bi bi-chevron-right" style={{ fontSize:'0.7rem' }} />
            <Link to="/services" style={{ color:'#0284c7', textDecoration:'none' }}>Services</Link>
            <i className="bi bi-chevron-right" style={{ fontSize:'0.7rem' }} />
            <span style={{ color:'#0c2340', fontWeight:600 }}>{service.nom}</span>
          </div>

          <div style={{ display:'flex', gap:24, alignItems:'flex-start', flexWrap:'wrap' }}>

            {/* ── FORMULAIRE PRINCIPAL ── */}
            <div style={{ flex:'1 1 0', minWidth:280 }}>
              <div style={{ background:'#fff', borderRadius:20, boxShadow:'0 4px 24px rgba(2,132,199,.08)', overflow:'hidden', animation:'fadeUp .4s ease' }}>

                {/* Header service */}
                <div style={{ background:'linear-gradient(135deg,#0c2340,#0284c7)', padding:'20px 24px', display:'flex', alignItems:'center', gap:14 }}>
                  <div style={{ width:52, height:52, borderRadius:14, background:'rgba(255,255,255,.15)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, overflow:'hidden' }}>
                    {service.image_url
                      ? <img src={service.image_url} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                      : <i className="bi bi-briefcase" style={{ fontSize:'1.5rem', color:'#fff' }} />
                    }
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <h5 style={{ margin:0, color:'#fff', fontWeight:800, fontSize:'1rem', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{service.nom}</h5>
                    <p style={{ margin:'3px 0 0', color:'rgba(255,255,255,.7)', fontSize:'0.82rem' }}>par {service.prestataire?.user?.username}</p>
                  </div>
                  <div style={{ textAlign:'right', flexShrink:0 }}>
                    <div style={{ color:'#fff', fontWeight:900, fontSize:'1.1rem' }}>{prix.toLocaleString()} F</div>
                    <div style={{ color:'rgba(255,255,255,.6)', fontSize:'0.72rem' }}>Fcfa</div>
                  </div>
                </div>

                {/* Stepper */}
                <div style={{ padding:'20px 24px 0', borderBottom:'1px solid #f1f5f9' }}>
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:0, marginBottom:20 }}>
                    {ETAPES.map((e,i) => (
                      <div key={e.key} style={{ display:'flex', alignItems:'center' }}>
                        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:4, cursor:i<etapeIdx?'pointer':'default' }} onClick={()=>i<etapeIdx&&setEtape(e.key)}>
                          <div style={{ width:38, height:38, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.9rem', transition:'all .3s',
                            background: i<etapeIdx ? '#10b981' : i===etapeIdx ? '#0284c7' : '#f1f5f9',
                            color: i<=etapeIdx ? '#fff' : '#94a3b8',
                            boxShadow: i===etapeIdx ? '0 0 0 4px rgba(2,132,199,.2)' : 'none',
                          }}>
                            {i<etapeIdx ? <i className="bi bi-check-lg" /> : <i className={`bi bi-${e.icon}`} />}
                          </div>
                          <span style={{ fontSize:'0.68rem', fontWeight:600, color:i<=etapeIdx?'#0284c7':'#94a3b8', whiteSpace:'nowrap' }}>{e.label}</span>
                        </div>
                        {i<ETAPES.length-1 && <div style={{ width:50, height:2, margin:'0 4px', marginBottom:18, background:i<etapeIdx?'#10b981':'#e2e8f0', transition:'background .3s' }} />}
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ padding:'24px' }}>

                  {/* ── ÉTAPE 1 : CALENDRIER ── */}
                  {etape === 'calendrier' && (
                    <div style={{ animation:'fadeUp .3s ease' }}>
                      {/* Navigation mois */}
                      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
                        <button onClick={()=>{ if(calMonth===0){setCalMonth(11);setCalYear(y=>y-1);}else setCalMonth(m=>m-1); }} style={{ width:34, height:34, borderRadius:10, border:'1.5px solid #e2e8f0', background:'#f8fafc', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', color:'#64748b' }}>
                          <i className="bi bi-chevron-left" />
                        </button>
                        <span style={{ fontWeight:800, color:'#0c2340', fontSize:'0.95rem' }}>{MOIS[calMonth]} {calYear}</span>
                        <button onClick={()=>{ if(calMonth===11){setCalMonth(0);setCalYear(y=>y+1);}else setCalMonth(m=>m+1); }} style={{ width:34, height:34, borderRadius:10, border:'1.5px solid #e2e8f0', background:'#f8fafc', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', color:'#64748b' }}>
                          <i className="bi bi-chevron-right" />
                        </button>
                      </div>

                      {/* Grille calendrier */}
                      <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:4, marginBottom:20 }}>
                        {JOURS.map(j => (
                          <div key={j} style={{ textAlign:'center', fontSize:'0.72rem', fontWeight:700, color:'#94a3b8', padding:'6px 0' }}>{j}</div>
                        ))}
                        {days.map((d,i) => {
                          const isToday   = d.toDateString()===today.toDateString();
                          const isSel     = selDate && d.toDateString()===selDate.toDateString();
                          const isOther   = d.getMonth()!==calMonth;
                          const disabled  = isPast(d);
                          return (
                            <button key={i} disabled={disabled} onClick={()=>{setSelDate(d);setSelHeure('');}}
                              className="rv-day"
                              style={{ padding:'8px 4px', borderRadius:10, border:`1.5px solid ${isSel?'#0284c7':isToday?'#bae6fd':'transparent'}`, textAlign:'center', fontSize:'0.85rem', cursor:disabled?'not-allowed':'pointer', fontWeight:isSel||isToday?700:400,
                                background: isSel?'#0284c7':isToday?'#e0f2fe':'transparent',
                                color: disabled?'#cbd5e1':isSel?'#fff':isOther?'#c4c9d4':'#0c2340',
                                opacity:isOther?0.4:1,
                              }}>
                              {d.getDate()}
                            </button>
                          );
                        })}
                      </div>

                      {/* Créneaux */}
                      {selDate && (
                        <div>
                          <p style={{ fontWeight:700, fontSize:'0.82rem', color:'#0284c7', textTransform:'uppercase', letterSpacing:'.05em', marginBottom:10 }}>
                            <i className="bi bi-clock me-1" />Créneaux disponibles — {fmtDateFr(selDate)}
                          </p>
                          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(80px,1fr))', gap:8 }}>
                            {CRENEAUX.map(h => {
                              const blocked = bloques.includes(h);
                              const sel     = selHeure===h;
                              return (
                                <button key={h} disabled={blocked} onClick={()=>setSelHeure(h)} className="rv-slot"
                                  style={{ padding:'10px 6px', borderRadius:10, textAlign:'center', border:`1.5px solid ${sel?'#0284c7':blocked?'#f1f5f9':'#e2e8f0'}`, background:blocked?'#f8fafc':sel?'#0284c7':'#fff', color:blocked?'#cbd5e1':sel?'#fff':'#0c2340', fontWeight:sel?700:400, fontSize:'0.85rem', cursor:blocked?'not-allowed':'pointer' }}>
                                  {h}
                                  {blocked && <div style={{ fontSize:'0.6rem', color:'#ef4444', marginTop:2 }}>Réservé</div>}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      <div style={{ display:'flex', justifyContent:'flex-end', marginTop:20 }}>
                        <button disabled={!selDate||!selHeure} onClick={()=>setEtape('details')} style={{ padding:'12px 28px', borderRadius:12, border:'none', background: !selDate||!selHeure?'#e2e8f0':'linear-gradient(135deg,#0c2340,#0284c7)', color: !selDate||!selHeure?'#94a3b8':'#fff', fontWeight:800, fontSize:'0.9rem', cursor:!selDate||!selHeure?'not-allowed':'pointer', display:'flex', alignItems:'center', gap:8 }}>
                          Continuer <i className="bi bi-arrow-right" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* ── ÉTAPE 2 : DÉTAILS ── */}
                  {etape === 'details' && (
                    <div style={{ animation:'fadeUp .3s ease' }}>
                      {/* Résumé date sélectionnée */}
                      <div style={{ background:'#f0fdf4', border:'1px solid #bbf7d0', borderRadius:12, padding:'12px 16px', marginBottom:20, display:'flex', alignItems:'center', gap:12 }}>
                        <i className="bi bi-calendar-check" style={{ color:'#10b981', fontSize:'1.2rem', flexShrink:0 }} />
                        <div>
                          <div style={{ fontWeight:700, color:'#065f46', fontSize:'0.9rem' }}>{fmtDateFr(selDate)}</div>
                          <div style={{ color:'#16a34a', fontSize:'0.82rem' }}><i className="bi bi-clock me-1" />{selHeure}</div>
                        </div>
                      </div>

                      <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
                        <div>
                          <label style={{ display:'block', fontWeight:700, fontSize:'0.78rem', color:'#374151', marginBottom:7, textTransform:'uppercase', letterSpacing:'.04em' }}>
                            <i className="bi bi-geo-alt me-1 text-primary" />Lieu d'intervention *
                          </label>
                          <div className="rv-input-wrap" style={{ border:'1.5px solid #e2e8f0', borderRadius:12, overflow:'hidden', background:'#f8fafc', transition:'border-color .2s,box-shadow .2s' }}>
                            <input type="text" value={lieu} onChange={e=>setLieu(e.target.value)} placeholder="Ex : Quartier Tokoin, Rue 12, Lomé"
                              style={{ width:'100%', padding:'13px 16px', border:'none', outline:'none', fontSize:'0.92rem', color:'#0c2340', background:'transparent', boxSizing:'border-box' }} />
                          </div>
                          <p style={{ margin:'5px 0 0', fontSize:'0.78rem', color:'#94a3b8' }}>Précisez l'adresse exacte pour le prestataire.</p>
                        </div>

                        <div>
                          <label style={{ display:'block', fontWeight:700, fontSize:'0.78rem', color:'#374151', marginBottom:7, textTransform:'uppercase', letterSpacing:'.04em' }}>
                            <i className="bi bi-chat-text me-1" />Notes (optionnel)
                          </label>
                          <textarea value={notes} onChange={e=>setNotes(e.target.value)} rows={4} placeholder="Décrivez votre besoin, problèmes spécifiques..."
                            style={{ width:'100%', border:'1.5px solid #e2e8f0', borderRadius:12, padding:'12px 16px', fontSize:'0.9rem', outline:'none', resize:'vertical', fontFamily:'inherit', color:'#0c2340', background:'#f8fafc', boxSizing:'border-box', transition:'border-color .2s' }}
                            onFocus={e=>e.target.style.borderColor='#0284c7'} onBlur={e=>e.target.style.borderColor='#e2e8f0'} />
                        </div>

                        <div style={{ background:'#fffbeb', border:'1px solid #fde68a', borderRadius:12, padding:'12px 14px', fontSize:'0.85rem', color:'#92400e', display:'flex', alignItems:'flex-start', gap:8 }}>
                          <i className="bi bi-info-circle" style={{ flexShrink:0, marginTop:1 }} />
                          Le prestataire a <strong>24h</strong> pour confirmer. Vous recevrez une notification.
                        </div>
                      </div>

                      <div style={{ display:'flex', justifyContent:'space-between', gap:12, marginTop:20 }}>
                        <button onClick={()=>setEtape('calendrier')} style={{ padding:'12px 20px', borderRadius:12, border:'1.5px solid #e2e8f0', background:'#f8fafc', color:'#64748b', fontWeight:700, fontSize:'0.88rem', cursor:'pointer', display:'flex', alignItems:'center', gap:6 }}>
                          <i className="bi bi-arrow-left" />Retour
                        </button>
                        <button disabled={!lieu.trim()} onClick={()=>setEtape('recap')} style={{ padding:'12px 28px', borderRadius:12, border:'none', background:!lieu.trim()?'#e2e8f0':'linear-gradient(135deg,#0c2340,#0284c7)', color:!lieu.trim()?'#94a3b8':'#fff', fontWeight:800, fontSize:'0.9rem', cursor:!lieu.trim()?'not-allowed':'pointer', display:'flex', alignItems:'center', gap:8 }}>
                          Continuer <i className="bi bi-arrow-right" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* ── ÉTAPE 3 : RECAP ── */}
                  {etape === 'recap' && (
                    <div style={{ animation:'fadeUp .3s ease' }}>
                      <div style={{ background:'#f8fafc', borderRadius:14, padding:'18px 20px', marginBottom:20 }}>
                        {[
                          ['Service',    service.nom],
                          ['Prestataire',service.prestataire?.user?.username],
                          ['Date',       fmtDateFr(selDate)],
                          ['Heure',      selHeure],
                          ['Lieu',       lieu],
                          ['Notes',      notes || '-'],
                        ].map(([k,v]) => (
                          <div key={k} style={{ display:'flex', justifyContent:'space-between', marginBottom:10, fontSize:'0.9rem' }}>
                            <span style={{ color:'#64748b' }}>{k}</span>
                            <span style={{ fontWeight:600, color:'#0c2340', maxWidth:220, textAlign:'right', wordBreak:'break-word' }}>{v}</span>
                          </div>
                        ))}
                        <div style={{ height:1, background:'#e2e8f0', margin:'12px 0' }} />
                        <div style={{ display:'flex', justifyContent:'space-between', fontSize:'0.9rem', marginBottom:6 }}>
                          <span style={{ color:'#64748b' }}>Prix</span>
                          <span style={{ fontWeight:700, color:'#0284c7' }}>{prix.toLocaleString()} Fcfa</span>
                        </div>
                        <div style={{ display:'flex', justifyContent:'space-between', fontSize:'0.85rem' }}>
                          <span style={{ color:'#94a3b8' }}>Frais plateforme (déduits)</span>
                          <span style={{ color:'#94a3b8' }}>{frais} Fcfa</span>
                        </div>
                        <div style={{ height:1, background:'#e2e8f0', margin:'12px 0' }} />
                        <div style={{ display:'flex', justifyContent:'space-between', fontWeight:900 }}>
                          <span style={{ color:'#0c2340' }}>Total à payer</span>
                          <span style={{ color:'#0284c7', fontSize:'1.1rem' }}>{total.toLocaleString()} Fcfa</span>
                        </div>
                      </div>

                      <div style={{ background:'#f0f9ff', border:'1px solid #bae6fd', borderRadius:12, padding:'14px 16px', marginBottom:20, fontSize:'0.85rem', color:'#0369a1' }}>
                        <p style={{ margin:'0 0 8px', fontWeight:700 }}><i className="bi bi-info-circle me-1" />Prochaines étapes :</p>
                        {['Le prestataire reçoit votre demande','Il confirme sous 24h','Vous procédez au paiement','Un chat s\'ouvre pour coordonner'].map((s,i)=>(
                          <div key={i} style={{ display:'flex', alignItems:'center', gap:8, marginBottom:i<3?6:0, fontSize:'0.83rem' }}>
                            <span style={{ width:20, height:20, borderRadius:'50%', background:'#0284c7', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, fontSize:'0.7rem', flexShrink:0 }}>{i+1}</span>
                            {s}
                          </div>
                        ))}
                      </div>

                      {errorMsg && (
                        <div style={{ background:'#fef2f2', border:'1px solid #fecaca', borderRadius:10, padding:'12px 14px', marginBottom:16, display:'flex', alignItems:'center', gap:8 }}>
                          <i className="bi bi-exclamation-triangle" style={{ color:'#ef4444', flexShrink:0 }} />
                          <span style={{ color:'#b91c1c', fontSize:'0.85rem', fontWeight:600 }}>{errorMsg}</span>
                        </div>
                      )}

                      <div style={{ display:'flex', gap:12 }}>
                        <button onClick={()=>setEtape('details')} style={{ padding:'12px 20px', borderRadius:12, border:'1.5px solid #e2e8f0', background:'#f8fafc', color:'#64748b', fontWeight:700, fontSize:'0.88rem', cursor:'pointer', display:'flex', alignItems:'center', gap:6, flexShrink:0 }}>
                          <i className="bi bi-arrow-left" />Retour
                        </button>
                        <button disabled={submitting} onClick={envoyer} style={{ flex:1, padding:'14px', borderRadius:12, border:'none', background:'linear-gradient(135deg,#0c2340,#0284c7)', color:'#fff', fontWeight:800, fontSize:'0.95rem', cursor:submitting?'not-allowed':'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:8, boxShadow:'0 4px 16px rgba(2,132,199,.35)', opacity:submitting?0.75:1 }}>
                          {submitting
                            ? <><span style={{ width:18, height:18, border:'2.5px solid rgba(255,255,255,.4)', borderTop:'2.5px solid #fff', borderRadius:'50%', animation:'spin .7s linear infinite', display:'inline-block' }} />Envoi…</>
                            : <><i className="bi bi-send-check" />Envoyer la demande</>
                          }
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* ── SIDEBAR DESKTOP ── */}
            <div style={{ width:260, flexShrink:0 }}>
              <div style={{ background:'#fff', borderRadius:18, padding:'20px', boxShadow:'0 4px 20px rgba(2,132,199,.08)', marginBottom:16 }}>
                <h5 style={{ fontWeight:800, color:'#0c2340', marginBottom:14, display:'flex', alignItems:'center', gap:8, fontSize:'0.95rem' }}>
                  <i className="bi bi-receipt" style={{ color:'#0284c7' }} />Récapitulatif
                </h5>
                {[
                  ['Service',service.nom],
                  ...(selDate?[['Date',fmtDateFr(selDate)]]:[] ),
                  ...(selHeure?[['Heure',selHeure]]:[]),
                  ...(lieu?[['Lieu',lieu]]:[]),
                ].map(([k,v])=>(
                  <div key={k} style={{ display:'flex', justifyContent:'space-between', marginBottom:8, fontSize:'0.85rem' }}>
                    <span style={{ color:'#64748b' }}>{k}</span>
                    <span style={{ fontWeight:600, color:'#0c2340', maxWidth:130, textAlign:'right', wordBreak:'break-word', fontSize:'0.82rem' }}>{v}</span>
                  </div>
                ))}
                <div style={{ height:1, background:'#f1f5f9', margin:'12px 0' }} />
                <div style={{ display:'flex', justifyContent:'space-between', fontWeight:900 }}>
                  <span style={{ fontSize:'0.85rem', color:'#0c2340' }}>Total</span>
                  <span style={{ color:'#0284c7', fontSize:'1rem' }}>{total.toLocaleString()} F</span>
                </div>
              </div>

              <div style={{ background:'#fff', borderRadius:18, padding:'18px', boxShadow:'0 4px 20px rgba(2,132,199,.08)' }}>
                <h6 style={{ fontWeight:700, marginBottom:10, color:'#0c2340', fontSize:'0.88rem' }}>
                  <i className="bi bi-shield-check me-2 text-success" />Nos garanties
                </h6>
                {[['shield-check','Paiement sécurisé','#10b981'],['clock','Réponse sous 24h','#0284c7'],['patch-check','Prestataire vérifié','#8b5cf6']].map(([ic,lbl,col])=>(
                  <div key={lbl} style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8, fontSize:'0.82rem', color:'#64748b' }}>
                    <i className={`bi bi-${ic}`} style={{ color:col, flexShrink:0 }} />{lbl}
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