import { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import api from '../../api/axios';

const JOURS = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
const MOIS = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
const CRENEAUX = ['08:00', '09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00', '18:00'];

function buildCalendar(year, month) {
  const first = new Date(year, month, 1);
  const days = [];
  const start = new Date(first);
  start.setDate(start.getDate() - first.getDay());
  for (let i = 0; i < 42; i++) {
    days.push(new Date(start));
    start.setDate(start.getDate() + 1);
  }
  return days;
}

const fmtDate = d => d ? `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}` : '';
const fmtDateFr = d => d ? `${JOURS[d.getDay()]} ${d.getDate()} ${MOIS[d.getMonth()]} ${d.getFullYear()}` : '-';

const ETAPES = [
  { key: 'calendrier', label: 'Date & Heure', icon: 'calendar3' },
  { key: 'details', label: 'Détails', icon: 'geo-alt' },
  { key: 'recap', label: 'Récapitulatif', icon: 'receipt' },
];

const CSS = `
@keyframes fadeUp  { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
@keyframes fadeIn  { from{opacity:0} to{opacity:1} }
@keyframes spin    { to{transform:rotate(360deg)} }
@keyframes success { 0%{transform:scale(.8);opacity:0} 60%{transform:scale(1.15)} 100%{transform:scale(1);opacity:1} }

.rv-day { transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1); }
.rv-day:hover:not(:disabled) { background: #bae6fd !important; color: #0369a1 !important; transform: scale(1.12); }

.rv-slot { transition: all 0.2s; }
.rv-slot:hover:not(:disabled) { transform: translateY(-2px); border-color: #0284c7 !important; box-shadow: 0 4px 12px rgba(2, 132, 199, 0.15); }

.rv-input-wrap { transition: all 0.2s; }
.rv-input-wrap:focus-within { border-color: #0284c7 !important; box-shadow: 0 0 0 4px rgba(2, 132, 199, 0.12) !important; background: #fff !important; }
`;

export default function Reserver() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [service, setService] = useState(null);
  const [existantes, setExistantes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [etape, setEtape] = useState('calendrier');

  const today = new Date();
  const [calYear, setCalYear] = useState(today.getFullYear());
  const [calMonth, setCalMonth] = useState(today.getMonth());
  const [selDate, setSelDate] = useState(null);
  const [selHeure, setSelHeure] = useState('');
  const [lieu, setLieu] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    Promise.all([
      api.get(`/services/${id}/`),
      api.get(`/reservations/?service=${id}`).catch(() => ({ data: [] })),
    ]).then(([s, r]) => {
      setService(s.data);
      setExistantes(r.data || []);
    })
      .catch(console.error).finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div style={{ minHeight: '70vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, background: '#f0f8ff' }}>
      <style>{`.rv-spinner{width:44px;height:44px;border-radius:50%;border:4px solid #e0f2fe;border-top-color:#0284c7;animation:spin .8s linear infinite}@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <div className="rv-spinner"></div>
      <p style={{ color: '#64748b', fontWeight: 600 }}>Chargement de la réservation…</p>
    </div>
  );

  if (!service) return (
    <div className="container py-5">
      <div style={{ background: '#fef2f2', border: '1.5px solid #fecaca', borderRadius: 16, padding: '20px 24px', color: '#b91c1c', display: 'flex', alignItems: 'center', gap: 12 }}>
        <i className="bi bi-exclamation-triangle-fill" style={{ fontSize: '1.5rem' }}></i>
        <div>
          <h4 style={{ margin: 0, fontWeight: 800 }}>Service Introuvable</h4>
          <p style={{ margin: 0, fontSize: '0.9rem', opacity: 0.9 }}>Ce service n'existe pas ou a été supprimé.</p>
        </div>
      </div>
    </div>
  );

  const prix = parseFloat(service.prix) || 0;
  const frais = Math.round(prix * 0.03);
  const total = prix;

  const bloques = selDate
    ? existantes
      .filter(
        (r) =>
          r.date_debut?.startsWith(fmtDate(selDate)) &&
          ['en_attente', 'en_attente_paiement', 'confirmee'].includes(r.statut),
      )
      .map((r) => r.date_debut?.split('T')[1]?.slice(0, 5))
    : [];

  const computeBlockedForSlot = (slotHHMM) => {
    if (!selDate) return false;
    const now = new Date();
    const isSameDay = selDate.toDateString() === now.toDateString();
    if (!isSameDay) return bloques.includes(slotHHMM);

    const [hh, mm] = slotHHMM.split(':').map(Number);
    const slotTime = new Date(selDate);
    slotTime.setHours(hh, mm, 0, 0);

    return bloques.includes(slotHHMM) || slotTime.getTime() <= now.getTime();
  };

  const isPast = d => {
    const t = new Date();
    t.setHours(0, 0, 0, 0);
    return d < t;
  };

  const envoyer = async () => {
    if (!lieu.trim()) {
      setErrorMsg('Veuillez préciser le lieu.');
      return;
    }
    setErrorMsg('');
    setSubmitting(true);
    try {
      await api.post('/reservations/reserver/', {
        service_id: service.id,
        date_debut: selDate && selHeure ? `${fmtDate(selDate)}T${selHeure}:00` : null,
        lieu: lieu.trim(),
        notes: notes.trim()
      });
      setEtape('succes');
    } catch (err) {
      setErrorMsg(err.response?.data?.error || 'Une erreur est survenue lors de l\'envoi.');
    } finally {
      setSubmitting(false);
    }
  };

  const etapeIdx = ETAPES.findIndex(e => e.key === etape);
  const days = buildCalendar(calYear, calMonth);

  // Groupement des créneaux
  const slotsMatin = CRENEAUX.filter(c => parseInt(c) < 12);
  const slotsApresMidi = CRENEAUX.filter(c => parseInt(c) >= 12);

  if (etape === 'succes') return (
    <>
      <style>{CSS}</style>
      <div style={{ minHeight: '75vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, background: '#f0f8ff' }}>
        <div style={{ background: '#fff', borderRadius: 26, padding: '48px 40px', maxWidth: 540, width: '100%', textAlign: 'center', boxShadow: '0 20px 50px rgba(2,132,199,0.12)', animation: 'fadeUp .5s ease' }}>
          <div style={{ width: 84, height: 84, borderRadius: '50%', background: '#d1fae5', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', animation: 'success .5s cubic-bezier(0.175, 0.885, 0.32, 1.275)' }}>
            <i className="bi bi-check-circle-fill" style={{ fontSize: '2.8rem', color: '#059669' }} />
          </div>
          <h3 style={{ fontWeight: 900, color: '#0c2340', marginBottom: 10, fontSize: '1.4rem' }}>Demande de réservation envoyée !</h3>
          <p style={{ color: '#64748b', marginBottom: 28, fontSize: '0.95rem', lineHeight: 1.6 }}>
            Votre demande a bien été envoyée à <strong style={{ color: '#0c2340' }}>{service.prestataire?.user?.username}</strong>. 
            Le prestataire a <strong style={{ color: '#0284c7' }}>24 heures</strong> pour valider ou rejeter la demande.
          </p>
          <div style={{ background: '#f8fafc', border: '1px solid #bae6fd', borderRadius: 16, padding: '18px 20px', textAlign: 'left', marginBottom: 32 }}>
            {[
              ['Service', service.nom],
              ['Date', fmtDateFr(selDate)],
              ['Heure', selHeure || 'Non précisée'],
              ['Lieu d\'intervention', lieu || '-']
            ].map(([k, v]) => (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10, fontSize: '0.88rem' }}>
                <span style={{ color: '#64748b', fontWeight: 500 }}>{k}</span>
                <span style={{ fontWeight: 700, color: '#0c2340', maxWidth: 220, textAlign: 'right', wordBreak: 'break-word' }}>{v}</span>
              </div>
            ))}
          </div>
          <button onClick={() => navigate('/mes-reservations')} style={{ 
            width: '100%', 
            padding: '15px', 
            borderRadius: 14, 
            border: 'none', 
            background: 'linear-gradient(135deg,#0c2340,#0284c7)', 
            color: '#fff', 
            fontWeight: 800, 
            fontSize: '0.98rem', 
            cursor: 'pointer', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            gap: 8, 
            boxShadow: '0 8px 24px rgba(2,132,199,0.3)' 
          }}>
            <i className="bi bi-calendar-check-fill" /> Accéder à mes réservations
          </button>
        </div>
      </div>
    </>
  );

  return (
    <>
      <style>{CSS}</style>
      <div style={{ background: '#f0f8ff', minHeight: '75vh', paddingBottom: 80 }}>
        <div className="container" style={{ paddingTop: 36 }}>

          {/* Breadcrumb Premium */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 28, fontSize: '0.85rem', color: '#64748b', fontWeight: 500 }}>
            <Link to="/" style={{ color: '#0284c7', textDecoration: 'none' }}>Accueil</Link>
            <i className="bi bi-chevron-right" style={{ fontSize: '0.7rem' }} />
            <Link to="/services" style={{ color: '#0284c7', textDecoration: 'none' }}>Services</Link>
            <i className="bi bi-chevron-right" style={{ fontSize: '0.7rem' }} />
            <span style={{ color: '#0c2340', fontWeight: 700 }}>Réservation</span>
          </div>

          <div style={{ display: 'flex', gap: 28, alignItems: 'flex-start', flexWrap: 'wrap' }}>

            {/* ── FORMULAIRE PRINCIPAL ── */}
            <div style={{ flex: '1 1 0', minWidth: 280 }}>
              <div style={{ background: '#fff', borderRadius: 24, boxShadow: '0 10px 30px rgba(2,132,199,0.06)', border: '1.5px solid #e0f2fe', overflow: 'hidden', animation: 'fadeUp .5s ease' }}>

                {/* Header Premium */}
                <div style={{ background: 'linear-gradient(135deg,#0c2340 0%, #0369a1 100%)', padding: '24px 28px', display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div style={{ width: 56, height: 56, borderRadius: 16, background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.2)' }}>
                    {service.image_url
                      ? <img src={service.image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : <i className="bi bi-briefcase-fill" style={{ fontSize: '1.6rem', color: '#fff' }} />
                    }
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h5 style={{ margin: 0, color: '#fff', fontWeight: 800, fontSize: '1.1rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{service.nom}</h5>
                    <p style={{ margin: '4px 0 0', color: 'rgba(255,255,255,0.75)', fontSize: '0.82rem', fontWeight: 600 }}>Par {service.prestataire?.user?.username}</p>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ color: '#fff', fontWeight: 900, fontSize: '1.25rem', lineHeight: 1.1 }}>{prix.toLocaleString()} F</div>
                    <div style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', marginTop: 2 }}>Fcfa</div>
                  </div>
                </div>

                {/* Stepper Premium */}
                <div style={{ padding: '24px 28px 0', borderBottom: '1.5px solid #f1f5f9' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0, marginBottom: 24 }}>
                    {ETAPES.map((e, i) => (
                      <div key={e.key} style={{ display: 'flex', alignItems: 'center' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, cursor: i < etapeIdx ? 'pointer' : 'default' }} onClick={() => i < etapeIdx && setEtape(e.key)}>
                          <div style={{ 
                            width: 40, 
                            height: 40, 
                            borderRadius: '50%', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center', 
                            fontSize: '0.95rem', 
                            transition: 'all .3s cubic-bezier(0.4, 0, 0.2, 1)',
                            background: i < etapeIdx ? '#10b981' : i === etapeIdx ? '#0284c7' : '#f1f5f9',
                            color: i <= etapeIdx ? '#fff' : '#94a3b8',
                            boxShadow: i === etapeIdx ? '0 0 0 4px rgba(2,132,199,0.2)' : 'none',
                          }}>
                            {i < etapeIdx ? <i className="bi bi-check-lg" style={{ fontSize: '1.1rem' }} /> : <i className={`bi bi-${e.icon}`} />}
                          </div>
                          <span style={{ fontSize: '0.72rem', fontWeight: 700, color: i <= etapeIdx ? '#0284c7' : '#94a3b8', whiteSpace: 'nowrap' }}>{e.label}</span>
                        </div>
                        {i < ETAPES.length - 1 && (
                          <div style={{ 
                            width: 'clamp(30px, 8vw, 60px)', 
                            height: 2.5, 
                            margin: '0 6px', 
                            marginBottom: 20, 
                            background: i < etapeIdx ? '#10b981' : '#e2e8f0', 
                            transition: 'background .3s' 
                          }} />
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ padding: '28px' }}>

                  {/* ── ÉTAPE 1 : CALENDRIER ── */}
                  {etape === 'calendrier' && (
                    <div style={{ animation: 'fadeUp .4s cubic-bezier(0.22, 1, 0.36, 1)' }}>
                      
                      {/* Navigation mois */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                        <button onClick={() => { if (calMonth === 0) { setCalMonth(11); setCalYear(y => y - 1); } else setCalMonth(m => m - 1); }} style={{ width: 38, height: 38, borderRadius: 12, border: '1.5px solid #e2e8f0', background: '#f8fafc', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', transition: 'all 0.2s' }} onMouseEnter={e => e.currentTarget.style.borderColor = '#94a3b8'} onMouseLeave={e => e.currentTarget.style.borderColor = '#e2e8f0'}>
                          <i className="bi bi-chevron-left" style={{ fontSize: '0.9rem' }} />
                        </button>
                        <span style={{ fontWeight: 800, color: '#0c2340', fontSize: '1.05rem' }}>{MOIS[calMonth]} {calYear}</span>
                        <button onClick={() => { if (calMonth === 11) { setCalMonth(0); setCalYear(y => y + 1); } else setCalMonth(m => m + 1); }} style={{ width: 38, height: 38, borderRadius: 12, border: '1.5px solid #e2e8f0', background: '#f8fafc', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', transition: 'all 0.2s' }} onMouseEnter={e => e.currentTarget.style.borderColor = '#94a3b8'} onMouseLeave={e => e.currentTarget.style.borderColor = '#e2e8f0'}>
                          <i className="bi bi-chevron-right" style={{ fontSize: '0.9rem' }} />
                        </button>
                      </div>

                      {/* Grille calendrier */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6, marginBottom: 26 }}>
                        {JOURS.map(j => (
                          <div key={j} style={{ textAlign: 'center', fontSize: '0.75rem', fontWeight: 800, color: '#94a3b8', padding: '6px 0', textTransform: 'uppercase' }}>{j}</div>
                        ))}
                        {days.map((d, i) => {
                          const isToday = d.toDateString() === today.toDateString();
                          const isSel = selDate && d.toDateString() === selDate.toDateString();
                          const isOther = d.getMonth() !== calMonth;
                          const disabled = isPast(d);
                          return (
                            <button key={i} disabled={disabled} onClick={() => { setSelDate(d); setSelHeure(''); }}
                              className="rv-day"
                              style={{ 
                                padding: '11px 4px', 
                                borderRadius: 12, 
                                border: '1.5px solid',
                                borderColor: isSel ? '#0284c7' : isToday ? '#93c5fd' : 'transparent',
                                textAlign: 'center', 
                                fontSize: '0.88rem', 
                                cursor: disabled ? 'not-allowed' : 'pointer', 
                                fontWeight: isSel || isToday ? 800 : 500,
                                background: isSel ? '#0284c7' : isToday ? '#e0f2fe' : 'transparent',
                                color: disabled ? '#cbd5e1' : isSel ? '#fff' : isOther ? '#94a3b8' : '#0c2340',
                                opacity: isOther && !isSel ? 0.45 : 1,
                              }}>
                              {d.getDate()}
                            </button>
                          );
                        })}
                      </div>

                      {/* Créneaux */}
                      {selDate && (
                        <div style={{ animation: 'fadeIn .3s ease' }}>
                          <p style={{ fontWeight: 800, fontSize: '0.82rem', color: '#0284c7', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 14 }}>
                            <i className="bi bi-clock-fill me-1" /> Créneaux d'intervention — {fmtDateFr(selDate)}
                          </p>
                          
                          {/* Matin */}
                          <div style={{ marginBottom: 16 }}>
                            <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', marginBottom: 8 }}><i className="bi bi-brightness-high me-1"></i> Matinée</div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(88px, 1fr))', gap: 10 }}>
                              {slotsMatin.map(h => {
                                const blocked = computeBlockedForSlot(h);
                                const sel = selHeure === h;
                                return (
                                  <button key={h} disabled={blocked} onClick={() => setSelHeure(h)} className="rv-slot"
                                    style={{ 
                                      padding: '11px 6px', 
                                      borderRadius: 12, 
                                      textAlign: 'center', 
                                      border: '1.5px solid',
                                      borderColor: sel ? '#0284c7' : blocked ? '#f1f5f9' : '#cbd5e1', 
                                      background: blocked ? '#f8fafc' : sel ? '#0284c7' : '#fff', 
                                      color: blocked ? '#cbd5e1' : sel ? '#fff' : '#0c2340', 
                                      fontWeight: sel ? 800 : 600, 
                                      fontSize: '0.88rem', 
                                      cursor: blocked ? 'not-allowed' : 'pointer' 
                                    }}>
                                    {h}
                                    {blocked && <div style={{ fontSize: '0.58rem', color: '#ef4444', fontWeight: 700, marginTop: 2 }}>Bloqué</div>}
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          {/* Après-midi */}
                          <div>
                            <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', marginBottom: 8 }}><i className="bi bi-moon-stars me-1"></i> Après-midi / Soirée</div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(88px, 1fr))', gap: 10 }}>
                              {slotsApresMidi.map(h => {
                                const blocked = computeBlockedForSlot(h);
                                const sel = selHeure === h;
                                return (
                                  <button key={h} disabled={blocked} onClick={() => setSelHeure(h)} className="rv-slot"
                                    style={{ 
                                      padding: '11px 6px', 
                                      borderRadius: 12, 
                                      textAlign: 'center', 
                                      border: '1.5px solid',
                                      borderColor: sel ? '#0284c7' : blocked ? '#f1f5f9' : '#cbd5e1', 
                                      background: blocked ? '#f8fafc' : sel ? '#0284c7' : '#fff', 
                                      color: blocked ? '#cbd5e1' : sel ? '#fff' : '#0c2340', 
                                      fontWeight: sel ? 800 : 600, 
                                      fontSize: '0.88rem', 
                                      cursor: blocked ? 'not-allowed' : 'pointer' 
                                    }}>
                                    {h}
                                    {blocked && <div style={{ fontSize: '0.58rem', color: '#ef4444', fontWeight: 700, marginTop: 2 }}>Bloqué</div>}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      )}

                      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 28, borderTop: '1.5px solid #f1f5f9', paddingTop: 20 }}>
                        <button disabled={!selDate || !selHeure} onClick={() => setEtape('details')} style={{ 
                          padding: '13px 32px', 
                          borderRadius: 14, 
                          border: 'none', 
                          background: !selDate || !selHeure ? '#e2e8f0' : 'linear-gradient(135deg,#0c2340,#0284c7)', 
                          color: !selDate || !selHeure ? '#94a3b8' : '#fff', 
                          fontWeight: 800, 
                          fontSize: '0.92rem', 
                          cursor: !selDate || !selHeure ? 'not-allowed' : 'pointer', 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: 8,
                          boxShadow: !selDate || !selHeure ? 'none' : '0 4px 14px rgba(2,132,199,0.25)'
                        }}>
                          Continuer <i className="bi bi-arrow-right" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* ── ÉTAPE 2 : DÉTAILS ── */}
                  {etape === 'details' && (
                    <div style={{ animation: 'fadeUp .4s ease' }}>
                      {/* Résumé date sélectionnée */}
                      <div style={{ background: '#ecfdf5', border: '1.5px solid #a7f3d0', borderRadius: 16, padding: '14px 18px', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 14 }}>
                        <div style={{ background: '#d1fae5', width: 40, height: 40, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><i className="bi bi-calendar-check-fill" style={{ color: '#059669', fontSize: '1.25rem' }} /></div>
                        <div>
                          <div style={{ fontWeight: 800, color: '#065f46', fontSize: '0.92rem' }}>{fmtDateFr(selDate)}</div>
                          <div style={{ color: '#059669', fontSize: '0.82rem', fontWeight: 700 }}><i className="bi bi-clock-fill me-1" />{selHeure}</div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                        <div>
                          <label style={{ display: 'block', fontWeight: 800, fontSize: '0.8rem', color: '#0c2340', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '.05em' }}>
                            <i className="bi bi-geo-alt-fill me-1 text-primary" /> Lieu d'intervention *
                          </label>
                          <div className="rv-input-wrap" style={{ border: '1.5px solid #cbd5e1', borderRadius: 14, overflow: 'hidden', background: '#f8fafc' }}>
                            <input type="text" value={lieu} onChange={e => setLieu(e.target.value)} placeholder="Ex : Quartier Tokoin, Rue 12, Lomé"
                              style={{ width: '100%', padding: '14px 16px', border: 'none', outline: 'none', fontSize: '0.92rem', color: '#0c2340', background: 'transparent', boxSizing: 'border-box' }} />
                          </div>
                          <p style={{ margin: '6px 0 0', fontSize: '0.78rem', color: '#94a3b8', fontWeight: 500 }}>Précisez le quartier, le numéro de rue ou des indications précises.</p>
                        </div>

                        <div>
                          <label style={{ display: 'block', fontWeight: 800, fontSize: '0.8rem', color: '#0c2340', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '.05em' }}>
                            <i className="bi bi-chat-left-text-fill me-1 text-primary" /> Notes ou consignes spécifiques (optionnel)
                          </label>
                          <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={4} placeholder="Détaillez votre besoin au prestataire (ex: matériel à ramener, pannes spécifiques, etc.)"
                            style={{ width: '100%', border: '1.5px solid #cbd5e1', borderRadius: 14, padding: '14px 16px', fontSize: '0.92rem', outline: 'none', resize: 'vertical', fontFamily: 'inherit', color: '#0c2340', background: '#f8fafc', boxSizing: 'border-box', transition: 'all 0.2s' }}
                            onFocus={e => { e.target.style.borderColor = '#0284c7'; e.target.style.background = '#fff'; }} onBlur={e => { e.target.style.borderColor = '#cbd5e1'; e.target.style.background = '#f8fafc'; }} />
                        </div>

                        <div style={{ background: '#fffbeb', border: '1px solid #fef3c7', borderRadius: 14, padding: '14px 16px', fontSize: '0.85rem', color: '#b45309', display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                          <i className="bi bi-info-circle-fill" style={{ flexShrink: 0, marginTop: 2, fontSize: '1.05rem' }} />
                          <div style={{ lineHeight: 1.5 }}>
                            <strong>Validation sous 24h :</strong> Le prestataire étudiera votre demande et validera le créneau. Si le créneau ne lui convient pas, il pourra vous contacter pour l'ajuster.
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginTop: 28, borderTop: '1.5px solid #f1f5f9', paddingTop: 20 }}>
                        <button onClick={() => setEtape('calendrier')} style={{ padding: '13px 24px', borderRadius: 14, border: '1.5px solid #cbd5e1', background: '#fff', color: '#64748b', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, transition: 'all 0.2s' }} onMouseEnter={e => e.currentTarget.style.borderColor = '#94a3b8'} onMouseLeave={e => e.currentTarget.style.borderColor = '#cbd5e1'}>
                          <i className="bi bi-arrow-left" /> Retour
                        </button>
                        <button disabled={!lieu.trim()} onClick={() => setEtape('recap')} style={{ 
                          padding: '13px 32px', 
                          borderRadius: 14, 
                          border: 'none', 
                          background: !lieu.trim() ? '#e2e8f0' : 'linear-gradient(135deg,#0c2340,#0284c7)', 
                          color: !lieu.trim() ? '#94a3b8' : '#fff', 
                          fontWeight: 800, 
                          fontSize: '0.92rem', 
                          cursor: !lieu.trim() ? 'not-allowed' : 'pointer', 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: 8,
                          boxShadow: !lieu.trim() ? 'none' : '0 4px 14px rgba(2,132,199,0.25)'
                        }}>
                          Continuer <i className="bi bi-arrow-right" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* ── ÉTAPE 3 : RECAP ── */}
                  {etape === 'recap' && (
                    <div style={{ animation: 'fadeUp .4s ease' }}>
                      <div style={{ background: '#f8fafc', borderRadius: 16, padding: '20px 22px', border: '1px solid #e2e8f0', marginBottom: 24 }}>
                        {[
                          ['Service', service.nom],
                          ['Prestataire', service.prestataire?.user?.username],
                          ['Date choisie', fmtDateFr(selDate)],
                          ['Heure choisie', selHeure],
                          ['Lieu de prestation', lieu],
                          ['Notes complémentaires', notes || 'Aucune note spécifique'],
                        ].map(([k, v]) => (
                          <div key={k} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, fontSize: '0.9rem' }}>
                            <span style={{ color: '#64748b', fontWeight: 500 }}>{k}</span>
                            <span style={{ fontWeight: 700, color: '#0c2340', maxWidth: 240, textAlign: 'right', wordBreak: 'break-word' }}>{v}</span>
                          </div>
                        ))}
                        <div style={{ height: 1.5, background: '#e2e8f0', margin: '14px 0' }} />
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.92rem', marginBottom: 8 }}>
                          <span style={{ color: '#64748b', fontWeight: 500 }}>Montant du service</span>
                          <span style={{ fontWeight: 700, color: '#0c2340' }}>{prix.toLocaleString()} FCFA</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                          <span style={{ color: '#94a3b8', fontWeight: 500 }}>Frais plateforme inclus (3%)</span>
                          <span style={{ color: '#94a3b8', fontWeight: 600 }}>({frais} FCFA)</span>
                        </div>
                        <div style={{ height: 1.5, background: '#e2e8f0', margin: '14px 0' }} />
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ color: '#0c2340', fontWeight: 800, fontSize: '0.95rem' }}>Total net</span>
                          <span style={{ color: '#0284c7', fontSize: '1.25rem', fontWeight: 900 }}>{total.toLocaleString()} FCFA</span>
                        </div>
                      </div>

                      <div style={{ background: '#f0f9ff', border: '1.5px solid #bae6fd', borderRadius: 16, padding: '16px 20px', marginBottom: 24 }}>
                        <p style={{ margin: '0 0 10px', fontWeight: 800, color: '#0284c7', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}><i className="bi bi-info-circle-fill me-1" /> Étapes de la commande :</p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                          {[
                            'Le prestataire reçoit la notification de commande.',
                            'Il valide la commande sous 24 heures.',
                            'Vous effectuez le paiement mobile (T-money ou Flooz) sécurisé.',
                            'Le chat s\'active pour finaliser les détails opérationnels.'
                          ].map((stepText, idx) => (
                            <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.85rem', color: '#0369a1' }}>
                              <span style={{ width: 22, height: 22, borderRadius: '50%', background: '#0284c7', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.72rem', flexShrink: 0 }}>{idx + 1}</span>
                              <span style={{ fontWeight: 600 }}>{stepText}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {errorMsg && (
                        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 12, padding: '12px 16px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
                          <i className="bi bi-exclamation-triangle-fill" style={{ color: '#ef4444', flexShrink: 0 }} />
                          <span style={{ color: '#b91c1c', fontSize: '0.88rem', fontWeight: 700 }}>{errorMsg}</span>
                        </div>
                      )}

                      <div style={{ display: 'flex', gap: 12 }}>
                        <button onClick={() => setEtape('details')} style={{ padding: '13px 20px', borderRadius: 14, border: '1.5px solid #cbd5e1', background: '#fff', color: '#64748b', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, transition: 'all 0.2s' }} onMouseEnter={e => e.currentTarget.style.borderColor = '#94a3b8'} onMouseLeave={e => e.currentTarget.style.borderColor = '#cbd5e1'}>
                          <i className="bi bi-arrow-left" /> Retour
                        </button>
                        <button disabled={submitting} onClick={envoyer} style={{ flex: 1, padding: '14px', borderRadius: 14, border: 'none', background: 'linear-gradient(135deg,#0c2340,#0284c7)', color: '#fff', fontWeight: 800, fontSize: '0.98rem', cursor: submitting ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: '0 8px 24px rgba(2,132,199,0.3)', opacity: submitting ? 0.75 : 1 }}>
                          {submitting ? (
                            <>
                              <span style={{ width: 18, height: 18, border: '2.5px solid rgba(255,255,255,.4)', borderTop: '2.5px solid #fff', borderRadius: '50%', animation: 'spin .7s linear infinite', display: 'inline-block' }} />
                              Envoi en cours…
                            </>
                          ) : (
                            <>
                              <i className="bi bi-send-check-fill" /> Confirmer & Envoyer la demande
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* ── SIDEBAR DESKTOP (PREMIUM AVEC GRAPHISMES & GARANTIES) ── */}
            <div style={{ width: 280, flexShrink: 0 }} className="rv-sidebar-custom">
              
              {/* Carte Récapitulatif Rapide */}
              <div style={{ background: '#fff', borderRadius: 24, padding: '24px 22px', border: '1.5px solid #e0f2fe', boxShadow: '0 10px 30px rgba(2,132,199,0.04)', marginBottom: 20 }}>
                <h5 style={{ fontWeight: 800, color: '#0c2340', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8, fontSize: '1rem', borderBottom: '1.5px solid #f1f5f9', paddingBottom: 10 }}>
                  <i className="bi bi-receipt" style={{ color: '#0284c7' }} /> Récapitulatif
                </h5>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {[
                    ['Service', service.nom],
                    ...(selDate ? [['Date', fmtDateFr(selDate)]] : []),
                    ...(selHeure ? [['Heure', selHeure]] : []),
                    ...(lieu ? [['Lieu', lieu]] : []),
                  ].map(([k, v]) => (
                    <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                      <span style={{ color: '#64748b', fontWeight: 500 }}>{k}</span>
                      <span style={{ fontWeight: 700, color: '#0c2340', maxWidth: 140, textAlign: 'right', wordBreak: 'break-word', fontSize: '0.82rem' }}>{v}</span>
                    </div>
                  ))}
                </div>
                <div style={{ height: 1.5, background: '#f1f5f9', margin: '14px 0' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: 900 }}>
                  <span style={{ fontSize: '0.88rem', color: '#0c2340' }}>Total</span>
                  <span style={{ color: '#0284c7', fontSize: '1.1rem' }}>{total.toLocaleString()} F</span>
                </div>
              </div>

              {/* Carte Garanties Sécurité */}
              <div style={{ background: '#fff', borderRadius: 24, padding: '24px 22px', border: '1.5px solid #e0f2fe', boxShadow: '0 10px 30px rgba(2,132,199,0.04)', marginBottom: 20 }}>
                <h6 style={{ fontWeight: 800, marginBottom: 16, color: '#0c2340', fontSize: '0.92rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <i className="bi bi-shield-check-fill text-success" style={{ fontSize: '1.1rem' }} /> Garanties & Sécurité
                </h6>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {[
                    ['shield-fill-check', 'Paiement Sécurisé', '#10b981', 'Fonds protégés jusqu\'à la fin du service.'],
                    ['clock-history', 'Réponse sous 24h', '#0284c7', 'Annulation automatique si le prestataire tarde.'],
                    ['patch-check-fill', 'Prestataire Vérifié', '#8b5cf6', 'Profil contrôlé et évalué par nos soins.']
                  ].map(([ic, lbl, col, desc]) => (
                    <div key={lbl} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                      <i className={`bi bi-${ic}`} style={{ color: col, fontSize: '1rem', marginTop: 2, flexShrink: 0 }} />
                      <div>
                        <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0c2340' }}>{lbl}</div>
                        <div style={{ fontSize: '0.75rem', color: '#94a3b8', lineHeight: 1.3, marginTop: 2 }}>{desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Carte d'aide / FAQ rapide (remplit l'espace vide) */}
              <div style={{ background: 'linear-gradient(135deg, #f0fdf4 0%, #d1fae5 100%)', borderRadius: 24, padding: '20px', border: '1.5px solid #a7f3d0' }}>
                <h6 style={{ fontWeight: 800, color: '#065f46', fontSize: '0.88rem', marginBottom: 8 }}><i className="bi bi-question-circle-fill me-2" /> Besoin d'aide ?</h6>
                <p style={{ fontSize: '0.78rem', color: '#047857', lineHeight: 1.5, margin: 0 }}>
                  Notre support client local est basé à Lomé et vous répond immédiatement via le bouton chat vert en bas à droite de votre écran.
                </p>
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* Style responsive pour masquer/adapter la sidebar */}
      <style>{`
        @media (max-width: 991px) {
          .rv-sidebar-custom { width: 100% !important; margin-top: 24px; }
          .rv-sidebar-custom div { margin-bottom: 16px !important; }
        }
      `}</style>
    </>
  );
}