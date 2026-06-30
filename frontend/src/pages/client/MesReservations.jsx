import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';

const STATUT = {
  en_attente:          { label:'En attente',  color:'#d97706', bg:'#fef3c7', border:'#fde68a', icon:'clock-fill' },
  en_attente_paiement: { label:'À payer',     color:'#2563eb', bg:'#dbeafe', border:'#bfdbfe', icon:'credit-card-fill' },
  confirmee:           { label:'Confirmée',   color:'#059669', bg:'#d1fae5', border:'#a7f3d0', icon:'check-circle-fill' },
  terminee:            { label:'Terminée',    color:'#059669', bg:'#d1fae5', border:'#a7f3d0', icon:'flag-fill' },
  annulee:             { label:'Annulée',     color:'#dc2626', bg:'#fee2e2', border:'#fecaca', icon:'x-circle-fill' },
};

const TABS = [
  { key:'toutes',              label:'Toutes',     icon:'list-ul' },
  { key:'en_attente',          label:'En attente', icon:'clock' },
  { key:'en_attente_paiement', label:'À payer',    icon:'credit-card' },
  { key:'confirmee',           label:'Confirmées', icon:'check-circle' },
  { key:'terminee',            label:'Terminées',  icon:'flag' },
  { key:'annulee',             label:'Annulées',   icon:'x-circle' },
];

const fmt = d => d ? new Date(d).toLocaleString('fr-FR',{day:'2-digit',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'}) : '—';

export default function MesReservations() {
  const { user } = useAuth();
  const [reservations,  setReservations]  = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [activeTab,     setActiveTab]     = useState('toutes');
  const [expanded,      setExpanded]      = useState(null);
  const [payModal,      setPayModal]      = useState(null);
  const [payPhone,      setPayPhone]      = useState('');
  const [payMethode,    setPayMethode]    = useState('moov');
  const [paySubmitting, setPaySubmitting] = useState(false);
  const [payError,      setPayError]      = useState('');
  const [toast,         setToast]         = useState(null);

  useEffect(() => {
    api.get('/reservations/').then(r => setReservations(r.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  const showToast = (msg, type='success') => { setToast({msg,type}); setTimeout(() => setToast(null), 3500); };

  const handleCancel = async (id) => {
    try {
      await api.patch(`/reservations/${id}/`, { statut:'annulee' });
      setReservations(prev => prev.map(r => r.id===id ? {...r,statut:'annulee'} : r));
      showToast('Réservation annulée.');
    } catch { showToast('Erreur lors de l\'annulation.','error'); }
  };

  const handleTerminer = async (id) => {
    try {
      await api.patch(`/reservations/${id}/`, { statut:'terminee' });
      setReservations(prev => prev.map(r => r.id===id ? {...r,statut:'terminee'} : r));
      showToast('Service marqué comme terminé !');
    } catch { showToast('Erreur.','error'); }
  };

  const handlePay = async () => {
    if (!payPhone) { setPayError('Entrez votre numéro.'); return; }
    setPaySubmitting(true); setPayError('');
    try {
      await api.post('/paiement/initier/', { reservation_id:payModal.id, phone_number:payPhone, network:payMethode, montant:payModal.montant });
      setReservations(prev => prev.map(r => r.id===payModal.id ? {...r,statut:'confirmee'} : r));
      setPayModal(null);
      showToast('Paiement confirmé ! 🎉');
    } catch(e) { setPayError(e.response?.data?.error || 'Erreur de paiement.'); }
    finally { setPaySubmitting(false); }
  };

  const filtered = activeTab === 'toutes' ? reservations : reservations.filter(r => r.statut === activeTab);
  const counts   = Object.fromEntries(TABS.map(t => [t.key, t.key==='toutes' ? reservations.length : reservations.filter(r=>r.statut===t.key).length]));

  if (loading) return (
    <div style={{ minHeight:'70vh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:16 }}>
      <div style={{ width:44, height:44, borderRadius:'50%', border:'4px solid #e0f2fe', borderTopColor:'#0284c7', animation:'spin .8s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <p style={{ color:'#64748b', fontWeight:500 }}>Chargement des réservations…</p>
    </div>
  );

  return (
    <>
      <style>{`
        @keyframes fadeUp  { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin    { to{transform:rotate(360deg)} }
        @keyframes toastIn { from{opacity:0;transform:translateX(-50%) translateY(12px)} to{opacity:1;transform:translateX(-50%) translateY(0)} }
        @keyframes spinRing{ to{transform:rotate(360deg)} }
        .mr-card  { transition:box-shadow .2s; }
        .mr-card:hover { box-shadow:0 10px 32px rgba(2,132,199,.14) !important; }
        .mr-tab   { transition:all .2s; }
        .mr-btn   { transition:all .15s; }
      `}</style>

      <div style={{ background:'#f0f8ff', minHeight:'100vh', paddingBottom:60 }}>

        {/* Hero */}
        <div style={{ background:'linear-gradient(135deg,#0c2340,#0284c7)', padding:'32px 0 56px', color:'#fff' }}>
          <div className="container">
            <div style={{ display:'flex', alignItems:'center', gap:16 }}>
              <div style={{ width:52, height:52, borderRadius:14, background:'rgba(255,255,255,.12)', backdropFilter:'blur(6px)', display:'flex', alignItems:'center', justifyContent:'center', border:'1px solid rgba(255,255,255,.2)' }}>
                <i className="bi bi-calendar-check-fill" style={{ fontSize:'1.5rem' }} />
              </div>
              <div>
                <h1 style={{ fontWeight:900, fontSize:'1.5rem', margin:'0 0 3px' }}>Mes Réservations</h1>
                <p style={{ opacity:.75, margin:0, fontSize:'0.85rem' }}>
                  {reservations.length} réservation{reservations.length > 1 ? 's' : ''} au total
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs flottants */}
        <div style={{ position:'sticky', top:0, zIndex:50, background:'transparent', paddingTop:0 }}>
          <div style={{ maxWidth:900, margin:'-20px auto 0', padding:'0 16px' }}>
            <div style={{ display:'flex', gap:6, overflowX:'auto', paddingBottom:4, scrollbarWidth:'none' }}>
              {TABS.map(t => (
                <button key={t.key} className="mr-tab" onClick={() => setActiveTab(t.key)}
                  style={{ flexShrink:0, padding:'8px 14px', borderRadius:50, background: activeTab===t.key ? '#0284c7' : '#fff', border:'1.5px solid', borderColor: activeTab===t.key ? '#0284c7' : '#e0f2fe', color: activeTab===t.key ? '#fff' : '#64748b', fontSize:'.78rem', fontWeight:600, cursor:'pointer', display:'flex', alignItems:'center', gap:6, whiteSpace:'nowrap', boxShadow:'0 2px 10px rgba(2,132,199,.1)' }}>
                  <i className={`bi bi-${t.icon}`} />
                  {t.label}
                  <span style={{ background: activeTab===t.key ? 'rgba(255,255,255,.2)' : '#e0f2fe', color: activeTab===t.key ? '#fff' : '#0284c7', borderRadius:50, padding:'1px 7px', fontSize:'.7rem', fontWeight:700 }}>
                    {counts[t.key]}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Liste */}
        <div style={{ maxWidth:900, margin:'20px auto 0', padding:'0 16px', display:'flex', flexDirection:'column', gap:14 }}>
          {filtered.length === 0 ? (
            <div style={{ textAlign:'center', padding:'70px 20px', animation:'fadeUp .4s ease' }}>
              <div style={{ width:72, height:72, borderRadius:20, background:'#e0f2fe', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 16px' }}>
                <i className="bi bi-calendar-x" style={{ fontSize:'2.2rem', color:'#0284c7' }} />
              </div>
              <h4 style={{ fontWeight:800, color:'#0c2340', marginBottom:8 }}>Aucune réservation</h4>
              <p style={{ color:'#94a3b8' }}>
                {activeTab !== 'toutes' ? `Aucune réservation "${STATUT[activeTab]?.label?.toLowerCase()}"` : 'Vous n\'avez pas encore de réservation.'}
              </p>
              <Link to="/services" style={{ display:'inline-flex', alignItems:'center', gap:8, marginTop:16, padding:'11px 24px', borderRadius:12, background:'linear-gradient(135deg,#0c2340,#0284c7)', color:'#fff', textDecoration:'none', fontWeight:700, fontSize:'0.88rem' }}>
                <i className="bi bi-search" /> Voir les services
              </Link>
            </div>
          ) : filtered.map((r, idx) => {
            const s = STATUT[r.statut] || STATUT.en_attente;
            const isOpen = expanded === r.id;
            return (
              <div key={r.id} className="mr-card" style={{ background:'#fff', borderRadius:18, border:`1.5px solid ${isOpen ? '#bae6fd' : '#e0f2fe'}`, boxShadow:'0 4px 18px rgba(2,132,199,.07)', overflow:'hidden', animation:`fadeUp .4s ease ${idx*.05}s both` }}>

                {/* En-tête card */}
                <div onClick={() => setExpanded(isOpen ? null : r.id)} style={{ padding:'16px 18px', display:'flex', alignItems:'center', gap:14, cursor:'pointer' }}>

                  {/* Image service */}
                  <div style={{ width:56, height:56, borderRadius:14, overflow:'hidden', background:'linear-gradient(135deg,#e0f2fe,#f0f9ff)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                    {r.service?.image_url ? <img src={r.service.image_url} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} /> : <i className="bi bi-briefcase" style={{ fontSize:'1.5rem', color:'#7dd3fc' }} />}
                  </div>

                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontWeight:800, color:'#0c2340', fontSize:'.95rem', marginBottom:3, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                      {r.service?.nom || 'Service'}
                    </div>
                    <div style={{ fontSize:'.78rem', color:'#64748b', display:'flex', gap:10, flexWrap:'wrap', marginBottom:5 }}>
                      <span><i className="bi bi-person me-1" />{r.service?.prestataire?.user?.username || '—'}</span>
                      <span><i className="bi bi-clock me-1" />{fmt(r.date_res || r.created_at)}</span>
                    </div>
                    <span style={{ display:'inline-flex', alignItems:'center', gap:5, padding:'3px 10px', borderRadius:50, fontSize:'.72rem', fontWeight:700, background:s.bg, color:s.color, border:`1px solid ${s.border}` }}>
                      <i className={`bi bi-${s.icon}`} style={{ fontSize:'.7rem' }} />{s.label}
                    </span>
                  </div>

                  <div style={{ textAlign:'right', flexShrink:0 }}>
                    <div style={{ fontWeight:900, color:'#0284c7', fontSize:'1rem', whiteSpace:'nowrap' }}>
                      {Number(r.montant).toLocaleString()} F
                    </div>
                    <i className={`bi bi-chevron-down`} style={{ color:'#94a3b8', fontSize:'.85rem', transition:'transform .2s', transform: isOpen ? 'rotate(180deg)' : 'rotate(0)' }} />
                  </div>
                </div>

                {/* Corps expandé */}
                {isOpen && (
                  <div style={{ padding:'0 18px 18px', borderTop:'1px solid #f1f5f9', animation:'fadeUp .2s ease' }}>
                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, margin:'14px 0' }}>
                      {[
                        { lbl:'Date réservation', val:fmt(r.date_res || r.created_at) },
                        { lbl:'Date prestation',  val:r.date_debut ? fmt(r.date_debut) : 'Non définie' },
                        { lbl:'Lieu',             val:r.lieu || 'Non précisé' },
                        { lbl:'Notes',            val:r.notes || 'Aucune note' },
                      ].map((d,i) => (
                        <div key={i} style={{ background:'#f8faff', borderRadius:10, padding:'10px 12px' }}>
                          <div style={{ fontSize:'.68rem', color:'#94a3b8', textTransform:'uppercase', letterSpacing:'.05em', marginBottom:2 }}>{d.lbl}</div>
                          <div style={{ fontSize:'.85rem', fontWeight:600, color:'#0c2340' }}>{d.val}</div>
                        </div>
                      ))}
                    </div>

                    {r.statut === 'confirmee' && user?.type_compte === 'client' && (
                      <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 12, padding: '10px 14px', fontSize: '0.8rem', color: '#166534', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                        <i className="bi bi-shield-fill-check" style={{ color: '#22c55e', fontSize: '1rem' }}></i>
                        <span><strong>Tiers de confiance :</strong> Votre paiement de {Number(r.montant).toLocaleString()} F est bloqué en séquestre. Le prestataire ne sera crédité que lorsque vous cliquerez sur le bouton <strong>"Terminé"</strong>.</span>
                      </div>
                    )}

                    {r.statut === 'confirmee' && user?.type_compte === 'prestataire' && (
                      <div style={{ background: '#fffbeb', border: '1px solid #fef3c7', borderRadius: 12, padding: '10px 14px', fontSize: '0.8rem', color: '#b45309', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                        <i className="bi bi-lock-fill" style={{ color: '#f59e0b', fontSize: '1rem' }}></i>
                        <span><strong>Fonds en séquestre :</strong> Le paiement de {Number(r.montant).toLocaleString()} F est sécurisé par la plateforme. Il sera ajouté à votre solde dès que le client aura marqué la prestation comme <strong>"Terminée"</strong>.</span>
                      </div>
                    )}

                    {/* Actions */}
                    <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginTop:4 }}>
                      {r.statut === 'en_attente_paiement' && user?.type_compte === 'client' && (
                        <button className="mr-btn" onClick={() => { setPayModal(r); setPayError(''); setPayPhone(''); }}
                          style={{ padding:'9px 16px', borderRadius:10, border:'none', background:'linear-gradient(135deg,#0c2340,#0284c7)', color:'#fff', fontWeight:700, fontSize:'.82rem', cursor:'pointer', display:'flex', alignItems:'center', gap:6 }}>
                          <i className="bi bi-credit-card-fill" /> Payer maintenant
                        </button>
                      )}
                      {r.statut === 'confirmee' && (
                        <>
                          <button className="mr-btn" onClick={() => handleTerminer(r.id)}
                            style={{ padding:'9px 16px', borderRadius:10, border:'none', background:'#d1fae5', color:'#065f46', fontWeight:700, fontSize:'.82rem', cursor:'pointer', display:'flex', alignItems:'center', gap:6 }}>
                            <i className="bi bi-flag-fill" /> Terminé
                          </button>
                          <Link to={`/chat/${r.id}`} style={{ padding:'9px 16px', borderRadius:10, background:'#e0f2fe', color:'#0284c7', fontWeight:700, fontSize:'.82rem', textDecoration:'none', display:'flex', alignItems:'center', gap:6 }}>
                            <i className="bi bi-chat-dots-fill" /> Chat
                          </Link>
                        </>
                      )}
                      {r.statut === 'terminee' && !r.evaluation_id && (
                        <Link to={`/evaluer/${r.id}`} style={{ padding:'9px 16px', borderRadius:10, background:'#fef3c7', color:'#d97706', fontWeight:700, fontSize:'.82rem', textDecoration:'none', display:'flex', alignItems:'center', gap:6 }}>
                          <i className="bi bi-star-fill" /> Évaluer
                        </Link>
                      )}
                      {r.statut === 'en_attente' && user?.type_compte === 'prestataire' && (
                        <button className="mr-btn" onClick={async () => {
                          try {
                            await api.patch(`/reservations/${r.id}/`, { statut: 'en_attente_paiement' });
                            setReservations(prev => prev.map(x => x.id===r.id ? {...x, statut:'en_attente_paiement'} : x));
                            showToast('Réservation confirmée !');
                          } catch(e) { showToast(e.response?.data?.error || 'Erreur de confirmation.', 'error'); }
                        }}
                          style={{ padding:'9px 16px', borderRadius:10, border:'none', background:'#d1fae5', color:'#065f46', fontWeight:700, fontSize:'.82rem', cursor:'pointer', display:'flex', alignItems:'center', gap:6 }}>
                          <i className="bi bi-check-circle-fill" /> Confirmer
                        </button>
                      )}

                      {['en_attente','en_attente_paiement'].includes(r.statut) && user?.type_compte === 'prestataire' && (
                        <button className="mr-btn" onClick={() => handleCancel(r.id)}
                          style={{ padding:'9px 16px', borderRadius:10, border:'none', background:'#fee2e2', color:'#dc2626', fontWeight:700, fontSize:'.82rem', cursor:'pointer', display:'flex', alignItems:'center', gap:6 }}>
                          <i className="bi bi-x-circle" /> Annuler
                        </button>
                      )}

                      {['en_attente','en_attente_paiement'].includes(r.statut) && user?.type_compte === 'client' && (
                        <button className="mr-btn" onClick={() => handleCancel(r.id)}
                          style={{ padding:'9px 16px', borderRadius:10, border:'none', background:'#fee2e2', color:'#dc2626', fontWeight:700, fontSize:'.82rem', cursor:'pointer', display:'flex', alignItems:'center', gap:6 }}>
                          <i className="bi bi-x-circle" /> Annuler
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal paiement */}
      {payModal && (
        <div onClick={e => e.target===e.currentTarget && setPayModal(null)}
          style={{ position:'fixed', inset:0, background:'rgba(12,35,64,.55)', backdropFilter:'blur(4px)', zIndex:9999, display:'flex', alignItems:'center', justifyContent:'center', padding:16, animation:'fadeUp .2s ease' }}>
          <div style={{ background:'#fff', borderRadius:20, padding:28, maxWidth:420, width:'100%', boxShadow:'0 20px 60px rgba(0,0,0,.2)', animation:'fadeUp .25s ease' }}>

            {/* Header modal */}
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20 }}>
              <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                <div style={{ width:44, height:44, borderRadius:12, background:'#e0f2fe', display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <i className="bi bi-credit-card-fill" style={{ color:'#0284c7', fontSize:'1.2rem' }} />
                </div>
                <div>
                  <h4 style={{ margin:0, fontWeight:800, color:'#0c2340', fontSize:'1rem' }}>Paiement Mobile</h4>
                  <p style={{ margin:0, color:'#64748b', fontSize:'0.78rem' }}>Paiement sécurisé PayGate</p>
                </div>
              </div>
              <button onClick={() => setPayModal(null)} style={{ background:'#f1f5f9', border:'none', borderRadius:8, width:32, height:32, cursor:'pointer', color:'#64748b', display:'flex', alignItems:'center', justifyContent:'center' }}>✕</button>
            </div>

            {/* Résumé */}
            <div style={{ background:'#f0f9ff', border:'1px solid #bae6fd', borderRadius:12, padding:'12px 16px', marginBottom:18 }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <span style={{ color:'#0369a1', fontSize:'0.85rem' }}>{payModal.service?.nom}</span>
                <span style={{ fontWeight:900, color:'#0c2340', fontSize:'1.05rem' }}>{Number(payModal.montant).toLocaleString()} Fcfa</span>
              </div>
            </div>

            {/* Méthode */}
            <div style={{ marginBottom:12 }}>
              <label style={{ display:'block', fontWeight:700, fontSize:'0.78rem', color:'#374151', marginBottom:8, textTransform:'uppercase', letterSpacing:'.04em' }}>Méthode de paiement</label>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
                {[{val:'moov',label:'Flooz'},{val:'flooz',label:'Mix By Yas'}].map(m => (
                  <button key={m.val} onClick={() => setPayMethode(m.val)} style={{ padding:'10px', borderRadius:10, border:`1.5px solid ${payMethode===m.val ? '#0284c7' : '#e2e8f0'}`, background: payMethode===m.val ? '#e0f2fe' : '#f8fafc', color: payMethode===m.val ? '#0284c7' : '#475569', fontWeight: payMethode===m.val ? 700 : 500, fontSize:'0.85rem', cursor:'pointer' }}>
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Numéro */}
            <div style={{ marginBottom:payError ? 8 : 18 }}>
              <label style={{ display:'block', fontWeight:700, fontSize:'0.78rem', color:'#374151', marginBottom:8, textTransform:'uppercase', letterSpacing:'.04em' }}>Numéro de téléphone</label>
              <div style={{ display:'flex', alignItems:'center', background:'#fff', border:'1.5px solid #e2e8f0', borderRadius:10, overflow:'hidden', transition:'border-color .2s' }}
                onFocusCapture={e => e.currentTarget.style.borderColor='#0284c7'}
                onBlurCapture={e => e.currentTarget.style.borderColor='#e2e8f0'}>
                <span style={{ padding:'0 12px', color:'#94a3b8', fontSize:'0.88rem', borderRight:'1px solid #e2e8f0', lineHeight:'46px' }}>+228</span>
                <input type="tel" placeholder="90 12 34 56" value={payPhone} onChange={e => setPayPhone(e.target.value)}
                  style={{ flex:1, padding:'12px 12px', border:'none', outline:'none', fontSize:'0.92rem', color:'#0c2340' }} />
              </div>
            </div>

            {payError && <div style={{ color:'#dc2626', fontSize:'.82rem', fontWeight:600, marginBottom:14, display:'flex', alignItems:'center', gap:6 }}><i className="bi bi-exclamation-circle" />{payError}</div>}

            <div style={{ display:'flex', gap:10 }}>
              <button onClick={handlePay} disabled={paySubmitting}
                style={{ flex:1, padding:'13px', borderRadius:12, border:'none', background:'linear-gradient(135deg,#0c2340,#0284c7)', color:'#fff', fontWeight:800, fontSize:'0.9rem', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
                {paySubmitting ? <><span style={{ width:16, height:16, border:'2.5px solid rgba(255,255,255,.3)', borderTopColor:'#fff', borderRadius:'50%', animation:'spinRing .7s linear infinite', display:'inline-block' }} />Traitement…</> : <><i className="bi bi-check-circle-fill" /> Confirmer</>}
              </button>
              <button onClick={() => setPayModal(null)} style={{ padding:'13px 16px', borderRadius:12, border:'1.5px solid #e2e8f0', background:'#f8fafc', color:'#64748b', fontWeight:700, fontSize:'0.88rem', cursor:'pointer' }}>
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div style={{ position:'fixed', bottom:24, left:'50%', transform:'translateX(-50%)', background: toast.type==='error' ? '#dc2626' : '#0c2340', color:'#fff', borderRadius:14, padding:'12px 24px', fontWeight:600, fontSize:'.88rem', zIndex:10000, boxShadow:'0 8px 28px rgba(0,0,0,.25)', animation:'toastIn .3s ease', whiteSpace:'nowrap' }}>
          {toast.type === 'success' ? '✅ ' : '❌ '}{toast.msg}
        </div>
      )}
    </>
  );
}