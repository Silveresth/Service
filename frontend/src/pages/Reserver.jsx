import { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const JOURS   = ['Dim','Lun','Mar','Mer','Jeu','Ven','Sam'];
const MOIS    = ['Jan','Fév','Mar','Avr','Mai','Juin','Juil','Aoû','Sep','Oct','Nov','Déc'];
const CRENEAUX = ['08:00','09:00','10:00','11:00','14:00','15:00','16:00','17:00','18:00'];

function buildCalendar(year, month) {
  const first = new Date(year, month, 1);
  const days  = [];
  const start = new Date(first);
  start.setDate(start.getDate() - first.getDay());
  for (let i = 0; i < 42; i++) { days.push(new Date(start)); start.setDate(start.getDate() + 1); }
  return days;
}
const formatDate   = (d) => d ? `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}` : '';
const formatDateFr = (d) => d ? `${JOURS[d.getDay()]} ${d.getDate()} ${MOIS[d.getMonth()]} ${d.getFullYear()}` : '-';

const ETAPES = [
  { key: 'calendrier', label: 'Date & Heure', icon: 'bi-calendar3' },
  { key: 'details',    label: 'Détails',      icon: 'bi-geo-alt' },
  { key: 'recap',      label: 'Récap.',       icon: 'bi-receipt' },
];

export default function Reserver() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user }  = useAuth();

  const [service, setService]                         = useState(null);
  const [reservationsExistantes, setReservationsExistantes] = useState([]);
  const [loading, setLoading]                         = useState(true);
  const [etape, setEtape]                             = useState('calendrier');
  const [showRecapMobile, setShowRecapMobile]         = useState(false);

  const today = new Date();
  const [calYear, setCalYear]     = useState(today.getFullYear());
  const [calMonth, setCalMonth]   = useState(today.getMonth());
  const [selectedDate, setSelectedDate]   = useState(null);
  const [selectedHeure, setSelectedHeure] = useState('');
  const [lieu, setLieu]           = useState('');
  const [notes, setNotes]         = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg]   = useState('');

  useEffect(() => {
    Promise.all([
      api.get(`/services/${id}/`),
      api.get(`/reservations/?service=${id}`).catch(() => ({ data: [] })),
    ]).then(([sRes, rRes]) => {
      setService(sRes.data);
      setReservationsExistantes(rRes.data || []);
    }).catch(console.error).finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div style={{ textAlign: 'center', padding: 80 }}>
      <i className="bi bi-hourglass-split" style={{ fontSize: '3rem', color: 'var(--primary-color)' }}></i>
      <p className="mt-3 text-muted">Chargement...</p>
    </div>
  );
  if (!service) return <div className="container py-5"><div className="alert alert-danger">Service introuvable.</div></div>;

  const prix  = parseFloat(service.prix) || 0;
  const frais = Math.round(prix * 0.03);
  const total = prix; // Le client paie le prix exact, les 3% sont déduits côté prestataire
  const montantPrestataire = prix - frais;

  const creneauxBloques = selectedDate
    ? reservationsExistantes
        .filter(r => r.date_debut?.startsWith(formatDate(selectedDate)) && ['en_attente','en_attente_paiement','confirmee'].includes(r.statut))
        .map(r => r.date_debut?.split('T')[1]?.slice(0,5))
    : [];

  const isDayPast = (d) => { const t = new Date(); t.setHours(0,0,0,0); return d < t; };

  const envoyerDemande = async () => {
    if (!lieu.trim()) { setErrorMsg('Veuillez préciser le lieu.'); return; }
    setErrorMsg(''); setSubmitting(true);
    try {
      await api.post('/reservations/reserver/', {
        service_id: service.id,
        date_debut: selectedDate && selectedHeure ? `${formatDate(selectedDate)}T${selectedHeure}:00` : null,
        lieu: lieu.trim(),
        notes: notes.trim(),
      });
      setEtape('demande_envoyee');
    } catch (err) {
      setErrorMsg(err.response?.data?.error || 'Erreur. Réessayez.');
    } finally { setSubmitting(false); }
  };

  const etapeIdx = ETAPES.findIndex(e => e.key === etape);

  /* ── Barre de progression étapes ── */
  const ProgressBar = () => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 28, gap: 0 }}>
      {ETAPES.map((e, i) => (
        <div key={e.key} style={{ display: 'flex', alignItems: 'center' }}>
          <div
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
              cursor: i < etapeIdx ? 'pointer' : 'default' }}
            onClick={() => i < etapeIdx && setEtape(e.key)}
          >
            <div style={{
              width: 36, height: 36, borderRadius: '50%',
              background: i < etapeIdx ? '#22c55e' : i === etapeIdx ? 'var(--primary-color)' : '#e2e8f0',
              color: i <= etapeIdx ? 'white' : '#94a3b8',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.95rem',
              boxShadow: i === etapeIdx ? '0 0 0 4px rgba(2,132,199,0.2)' : 'none',
            }}>
              {i < etapeIdx ? <i className="bi bi-check-lg"></i> : <i className={e.icon}></i>}
            </div>
            <span style={{ fontSize: '0.7rem', fontWeight: 600,
              color: i <= etapeIdx ? 'var(--primary-color)' : '#94a3b8' }}>
              {e.label}
            </span>
          </div>
          {i < ETAPES.length - 1 && (
            <div style={{ width: 60, height: 2, margin: '0 4px', marginBottom: 18,
              background: i < etapeIdx ? '#22c55e' : '#e2e8f0' }}></div>
          )}
        </div>
      ))}
    </div>
  );

  /* ── Mini récap flottant mobile ── */
  const MiniRecap = () => (
    <div style={{
      background: '#f0f8ff', border: '1px solid var(--border-color)',
      borderRadius: 10, padding: '10px 14px', marginBottom: 20,
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      cursor: 'pointer',
    }} onClick={() => setShowRecapMobile(!showRecapMobile)}>
      <div style={{ fontSize: '0.85rem' }}>
        <strong>{service.nom}</strong>
        {selectedDate && <span className="ms-2 text-muted">{formatDateFr(selectedDate)} {selectedHeure}</span>}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontWeight: 800, color: 'var(--primary-color)' }}>{total} F</span>
        <i className={`bi bi-chevron-${showRecapMobile ? 'up' : 'down'}`} style={{ color: '#94a3b8' }}></i>
      </div>
    </div>
  );

  /* ── Succès ── */
  if (etape === 'demande_envoyee') return (
    <div className="container py-5" style={{ maxWidth: 600, textAlign: 'center' }}>
      <div className="dashboard-card" style={{ padding: 40 }}>
        <div style={{ fontSize: '3.5rem', marginBottom: 16, color: '#22c55e' }}>
          <i className="bi bi-check-circle-fill"></i>
        </div>
        <h4 style={{ fontWeight: 800, color: '#166534', marginBottom: 8 }}>Demande envoyée !</h4>
        <p className="text-muted" style={{ marginBottom: 24 }}>
          Votre demande a été transmise au prestataire.<br />
          <strong>Il dispose de 24h pour confirmer.</strong>
        </p>
        <div style={{ background: '#f8fafc', borderRadius: 10, padding: 16, textAlign: 'left', marginBottom: 24 }}>
          {[['Service', service.nom], ['Date', formatDateFr(selectedDate)], ['Heure', selectedHeure], ['Lieu', lieu || '-'], ['Notes', notes || '-']].map(([k, v]) => (
            <div key={k} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: '0.9rem' }}>
              <span className="text-muted">{k}</span>
              <span style={{ fontWeight: 600 }}>{v}</span>
            </div>
          ))}
        </div>
        <button className="btn-primary-custom w-100" style={{ justifyContent: 'center' }}
          onClick={() => navigate('/mes-reservations')}>
          <i className="bi bi-calendar-check me-2"></i>Voir mes réservations
        </button>
      </div>
    </div>
  );

  return (
    <div style={{ background: '#f8fafb', minHeight: '70vh' }} className="py-5">
      <div className="container">

        {/* Breadcrumb */}
        <ol className="breadcrumb" style={{ marginBottom: 20 }}>
          <li><Link to="/">Accueil</Link></li>
          <span className="breadcrumb-separator">›</span>
          <li><Link to="/services">Services</Link></li>
          <span className="breadcrumb-separator">›</span>
          <li className="breadcrumb-active">{service.nom}</li>
        </ol>

        {/* Layout desktop: 2 colonnes | mobile: 1 colonne */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, alignItems: 'flex-start' }}>

          {/* ── Colonne principale ── */}
          <div style={{ flex: '1 1 0', minWidth: 0 }}>
            <div className="form-custom">

              {/* Header service */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24,
                padding: 14, background: '#f0f8ff', borderRadius: 12,
                border: '1px solid var(--border-color)', flexWrap: 'wrap',
              }}>
                <div style={{
                  width: 48, height: 48, borderRadius: 10, background: 'var(--primary-light)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  <i className="bi bi-briefcase" style={{ fontSize: '1.4rem', color: 'var(--primary-color)' }}></i>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h5 style={{ fontWeight: 700, marginBottom: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {service.nom}
                  </h5>
                  <span className="text-muted" style={{ fontSize: '0.85rem' }}>
                    <i className="bi bi-person me-1"></i>{(`${service.prestataire?.user?.first_name || ''} ${service.prestataire?.user?.last_name || ''}`.trim() || service.prestataire?.user?.username)}
                    {service.categorie && <span className="badge-category ms-2">{service.categorie.nom}</span>}
                  </span>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontWeight: 800, fontSize: '1.2rem', color: 'var(--primary-color)' }}>{prix} F</div>
                  <small className="text-muted">par intervention</small>
                </div>
              </div>

              {/* Mini récap mobile (au-dessus de la progress bar) */}
              <div className="d-md-none" style={{ display: 'block' }}>
                <MiniRecap />
                {showRecapMobile && (
                  <div style={{ background: 'white', border: '1px solid var(--border-color)', borderRadius: 10, padding: 14, marginTop: -8, marginBottom: 16 }}>
                    {[
                      ['Service', service.nom],
                      ['Prestataire', (`${service.prestataire?.user?.first_name || ''} ${service.prestataire?.user?.last_name || ''}`.trim() || service.prestataire?.user?.username)],
                      selectedDate && ['Date', formatDateFr(selectedDate)],
                      selectedHeure && ['Heure', selectedHeure],
                      lieu && ['Lieu', lieu],
                    ].filter(Boolean).map(([k, v]) => (
                      <div key={k} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: '0.85rem' }}>
                        <span className="text-muted">{k}</span>
                        <span style={{ fontWeight: 600 }}>{v}</span>
                      </div>
                    ))}
                    <hr />
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                      <span className="text-muted">Prix</span><span>{prix} F</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                      <span className="text-muted">Frais plateforme (déduits)</span><span>{frais} F</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, marginTop: 4 }}>
                      <span>Total à payer</span><span style={{ color: 'var(--primary-color)' }}>{total} F</span>
                    </div>
                  </div>
                )}
              </div>

              <ProgressBar />

              {/* ══ ÉTAPE 1 : CALENDRIER ══ */}
              {etape === 'calendrier' && (
                <div>
                  <h4 style={{ fontWeight: 700, marginBottom: 20 }}>
                    <i className="bi bi-calendar3 me-2 text-primary"></i>Date & Créneau
                  </h4>

                  {/* Navigation mois */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                    <button className="btn-outline-primary-custom btn-sm-custom"
                      onClick={() => { if (calMonth === 0) { setCalMonth(11); setCalYear(y => y-1); } else setCalMonth(m => m-1); }}>
                      <i className="bi bi-chevron-left"></i>
                    </button>
                    <h5 style={{ fontWeight: 700, color: 'var(--primary-color)', margin: 0 }}>
                      {MOIS[calMonth]} {calYear}
                    </h5>
                    <button className="btn-outline-primary-custom btn-sm-custom"
                      onClick={() => { if (calMonth === 11) { setCalMonth(0); setCalYear(y => y+1); } else setCalMonth(m => m+1); }}>
                      <i className="bi bi-chevron-right"></i>
                    </button>
                  </div>

                  {/* Calendrier */}
                  <div style={{ border: '1px solid var(--border-color)', borderRadius: 12, overflow: 'hidden', marginBottom: 20 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', background: 'var(--primary-color)' }}>
                      {['Di','Lu','Ma','Me','Je','Ve','Sa'].map(j => (
                        <div key={j} style={{ textAlign: 'center', padding: '8px 0', color: 'white', fontWeight: 600, fontSize: '0.75rem' }}>{j}</div>
                      ))}
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)' }}>
                      {buildCalendar(calYear, calMonth).map((d, i) => {
                        const isCurrentMonth = d.getMonth() === calMonth;
                        const isPast = isDayPast(d);
                        const isSelected = selectedDate && formatDate(d) === formatDate(selectedDate);
                        const isToday = formatDate(d) === formatDate(today);
                        return (
                          <div key={i}
                            onClick={() => { if (!isPast && isCurrentMonth) { setSelectedDate(d); setSelectedHeure(''); }}}
                            style={{
                              textAlign: 'center', padding: '8px 0', fontSize: '0.85rem',
                              cursor: isPast || !isCurrentMonth ? 'default' : 'pointer',
                              background: isSelected ? 'var(--primary-color)' : isToday ? '#e0f2fe' : 'white',
                              color: isSelected ? 'white' : !isCurrentMonth || isPast ? '#cbd5e1' : 'var(--text-dark)',
                              fontWeight: isSelected || isToday ? 700 : 400,
                              borderBottom: '1px solid #f1f5f9', borderRight: '1px solid #f1f5f9',
                            }}>
                            {d.getDate()}
                            {isToday && !isSelected && (
                              <div style={{ width: 4, height: 4, background: 'var(--primary-color)', borderRadius: '50%', margin: '2px auto 0' }}></div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Créneaux */}
                  {selectedDate && (
                    <div>
                      <h5 style={{ fontWeight: 700, marginBottom: 12 }}>
                        <i className="bi bi-clock me-2 text-primary"></i>
                        Créneaux — {formatDateFr(selectedDate)}
                      </h5>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, marginBottom: 20 }}>
                        {CRENEAUX.map(h => {
                          const blocked = creneauxBloques.includes(h);
                          const sel = selectedHeure === h;
                          return (
                            <button key={h} disabled={blocked} onClick={() => setSelectedHeure(h)} style={{
                              padding: '10px 6px', borderRadius: 10, textAlign: 'center',
                              border: sel ? '2px solid var(--primary-color)' : '1.5px solid #e2e8f0',
                              background: blocked ? '#f1f5f9' : sel ? 'var(--primary-light)' : 'white',
                              color: blocked ? '#94a3b8' : sel ? 'var(--primary-color)' : '#0c2340',
                              fontWeight: sel ? 700 : 500, fontSize: '0.88rem',
                              cursor: blocked ? 'not-allowed' : 'pointer',
                              textDecoration: blocked ? 'line-through' : 'none',
                            }}>
                              <i className={`bi ${blocked ? 'bi-lock' : 'bi-clock'} me-1`}></i>{h}
                              {blocked && <div style={{ fontSize: '0.62rem', color: '#ef4444' }}>Réservé</div>}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
                    <button className="btn-primary-custom" style={{ padding: '12px 28px' }}
                      disabled={!selectedDate || !selectedHeure}
                      onClick={() => setEtape('details')}>
                      Continuer <i className="bi bi-arrow-right ms-2"></i>
                    </button>
                  </div>
                </div>
              )}

              {/* ══ ÉTAPE 2 : DÉTAILS ══ */}
              {etape === 'details' && (
                <div>
                  <h4 style={{ fontWeight: 700, marginBottom: 20 }}>
                    <i className="bi bi-geo-alt me-2 text-primary"></i>Détails
                  </h4>

                  <div style={{ padding: 14, background: '#f0fdf4', borderRadius: 10, border: '1px solid #bbf7d0', marginBottom: 20 }}>
                    <i className="bi bi-calendar-check text-success me-2"></i>
                    <strong>{formatDateFr(selectedDate)}</strong>
                    <span className="ms-3"><i className="bi bi-clock text-success me-2"></i><strong>{selectedHeure}</strong></span>
                  </div>

                  <div className="mb-4">
                    <label className="form-label">
                      <i className="bi bi-geo-alt me-2"></i>Lieu d'intervention <span style={{ color: '#dc3545' }}>*</span>
                    </label>
                    <input type="text" className="form-control"
                      placeholder="Ex : Quartier Tokoin, Rue 12, Lomé"
                      value={lieu} onChange={e => setLieu(e.target.value)} />
                    <small className="text-muted">Précisez l'adresse exacte pour le prestataire.</small>
                  </div>

                  <div className="mb-4">
                    <label className="form-label">
                      <i className="bi bi-chat-text me-2"></i>Notes (optionnel)
                    </label>
                    <textarea className="form-control" rows={4}
                      placeholder="Décrivez votre besoin, problèmes spécifiques..."
                      value={notes} onChange={e => setNotes(e.target.value)} />
                  </div>

                  <div style={{ padding: 14, background: '#fffbeb', borderRadius: 10, border: '1px solid #fde68a', marginBottom: 20, fontSize: '0.88rem' }}>
                    <i className="bi bi-info-circle text-warning me-2"></i>
                    Le prestataire a <strong>24h</strong> pour confirmer. Vous recevrez une notification.
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                    <button onClick={() => setEtape('calendrier')} className="btn-secondary-custom">
                      <i className="bi bi-arrow-left me-2"></i>Retour
                    </button>
                    <button className="btn-primary-custom" style={{ padding: '12px 28px' }}
                      disabled={!lieu.trim()} onClick={() => setEtape('recap')}>
                      Continuer <i className="bi bi-arrow-right ms-2"></i>
                    </button>
                  </div>
                </div>
              )}

              {/* ══ ÉTAPE 3 : RÉCAPITULATIF ══ */}
              {etape === 'recap' && (
                <div>
                  <h4 style={{ fontWeight: 700, marginBottom: 20 }}>
                    <i className="bi bi-receipt me-2 text-primary"></i>Récapitulatif
                  </h4>

                  <div style={{ background: '#f8fafc', borderRadius: 10, padding: 18, marginBottom: 20 }}>
                    {[
                      ['Service', service.nom],
                      ['Prestataire', (`${service.prestataire?.user?.first_name || ''} ${service.prestataire?.user?.last_name || ''}`.trim() || service.prestataire?.user?.username)],
                      ['Date', formatDateFr(selectedDate)],
                      ['Heure', selectedHeure],
                      ['Lieu', lieu],
                      ['Notes', notes || '-'],
                    ].map(([k, v]) => (
                      <div key={k} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: '0.9rem' }}>
                        <span className="text-muted">{k}</span>
                        <span style={{ fontWeight: 600, maxWidth: 220, textAlign: 'right', wordBreak: 'break-word' }}>{v}</span>
                      </div>
                    ))}
                    <hr />
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: '0.9rem' }}>
                      <span className="text-muted">Prix</span>
                      <span style={{ fontWeight: 700, color: 'var(--primary-color)' }}>{prix} Fcfa</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: '0.9rem' }}>
                      <span className="text-muted">Frais plateforme (déduits)</span><span>{frais} Fcfa</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800 }}>
                      <span>Total estimé</span>
                      <span style={{ color: 'var(--primary-color)', fontSize: '1.1rem' }}>{total} Fcfa</span>
                    </div>
                  </div>

                  <div className="alert alert-info" style={{ borderRadius: 10, fontSize: '0.88rem' }}>
                    <i className="bi bi-info-circle me-2"></i><strong>Prochaines étapes :</strong>
                    <ol style={{ margin: '8px 0 0', paddingLeft: 20 }}>
                      <li>Le prestataire reçoit votre demande</li>
                      <li>Il confirme sous 24h</li>
                      <li>Vous procédez au paiement</li>
                      <li>Un chat s'ouvre pour coordonner</li>
                    </ol>
                  </div>

                  {errorMsg && (
                    <div className="alert alert-danger" style={{ borderRadius: 8, marginTop: 16 }}>
                      <i className="bi bi-exclamation-triangle me-2"></i>{errorMsg}
                    </div>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 20, gap: 12 }}>
                    <button onClick={() => setEtape('details')} className="btn-secondary-custom">
                      <i className="bi bi-arrow-left me-2"></i>Retour
                    </button>
                    <button className="btn-primary-custom" disabled={submitting}
                      style={{ flex: 1, justifyContent: 'center', padding: '14px', fontSize: '1rem' }}
                      onClick={envoyerDemande}>
                      {submitting
                        ? <><span className="spinner-border spinner-border-sm me-2"></span>Envoi…</>
                        : <><i className="bi bi-send-check me-2"></i>Envoyer la demande</>}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ── Sidebar récap (desktop uniquement) ── */}
          <div style={{ flex: '0 0 280px', width: 280, display: 'none' }} className="reserver-sidebar">
            <div className="dashboard-card mb-3">
              <h5 style={{ fontWeight: 700, marginBottom: 14 }}>
                <i className="bi bi-receipt me-2"></i>Récapitulatif
              </h5>
              {[
                ['Service', service.nom],
                ['Prestataire', (`${service.prestataire?.user?.first_name || ''} ${service.prestataire?.user?.last_name || ''}`.trim() || service.prestataire?.user?.username)],
                ...(selectedDate ? [['Date', formatDateFr(selectedDate)]] : []),
                ...(selectedHeure ? [['Heure', selectedHeure]] : []),
                ...(lieu ? [['Lieu', lieu]] : []),
              ].map(([label, val]) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: '0.88rem' }}>
                  <span className="text-muted">{label}</span>
                  <span style={{ fontWeight: 600, maxWidth: 150, textAlign: 'right', wordBreak: 'break-word' }}>{val}</span>
                </div>
              ))}
              <hr />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: '0.88rem' }}>
                <span className="text-muted">Prix</span>
                <span style={{ fontWeight: 700, color: 'var(--primary-color)' }}>{prix} Fcfa</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: '0.88rem' }}>
                <span className="text-muted">Frais plateforme (déduits)</span><span>{frais} Fcfa</span>
              </div>
              <hr />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800 }}>
                <span>Total</span>
                <span style={{ color: 'var(--primary-color)', fontSize: '1.1rem' }}>{total} Fcfa</span>
              </div>
            </div>

            <div className="dashboard-card">
              <h5 style={{ fontWeight: 700, marginBottom: 8 }}>
                <i className="bi bi-question-circle text-primary me-2"></i>Besoin d'aide ?
              </h5>
              <p className="text-muted" style={{ fontSize: '0.85rem', marginBottom: 14 }}>
                Contactez notre support WhatsApp.
              </p>
              <a href={`https://wa.me/22897430290?text=${encodeURIComponent(`Question sur la réservation de ${service.nom}`)}`}
                target="_blank" rel="noreferrer" className="btn-whatsapp"
                style={{ justifyContent: 'center', width: '100%', display: 'flex' }}>
                <i className="bi bi-whatsapp"></i> Support WhatsApp
              </a>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}