import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const STATUT_LABEL = {
  'en_attente': 'En attente',
  'en_attente_paiement': 'À payer',
  'confirmee': 'Confirmée',
  'annulee': 'Annulée',
  'terminee': 'Terminée',
};
const STATUT_CLASS = {
  'confirmee': 'badge-success',
  'terminee': 'badge-success',
  'en_attente': 'badge-warning',
  'en_attente_paiement': 'badge-info',
  'annulee': 'badge-danger',
};
const STATUT_ICON = {
  'confirmee': 'bi-check-circle-fill',
  'terminee': 'bi-flag-fill',
  'en_attente': 'bi-clock-fill',
  'en_attente_paiement': 'bi-credit-card-fill',
  'annulee': 'bi-x-circle-fill',
};
const STATUT_COLOR = {
  'confirmee': '#059669', 'terminee': '#059669',
  'en_attente': '#d97706', 'en_attente_paiement': '#2563eb', 'annulee': '#dc2626',
};
const STATUT_BG = {
  'confirmee': '#d1fae5', 'terminee': '#d1fae5',
  'en_attente': '#fef9c3', 'en_attente_paiement': '#dbeafe', 'annulee': '#fee2e2',
};

const TABS = [
  { key: 'toutes',               label: 'Toutes',     icon: 'bi-list-ul' },
  { key: 'en_attente',           label: 'En attente', icon: 'bi-clock' },
  { key: 'en_attente_paiement',  label: 'À payer',    icon: 'bi-credit-card' },
  { key: 'confirmee',            label: 'Confirmées', icon: 'bi-check-circle' },
  { key: 'terminee',             label: 'Terminées',  icon: 'bi-flag' },
  { key: 'annulee',              label: 'Annulées',   icon: 'bi-x-circle' },
];

const fmt = (d) => d
  ? new Date(d).toLocaleString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
  : '-';

export default function MesReservations() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [activeTab, setActiveTab]       = useState('toutes');
  const [expandedId, setExpandedId]     = useState(null);
  const [deleteModal, setDeleteModal]   = useState(null);
  const [payModal, setPayModal]         = useState(null);
  const [payPhone, setPayPhone]         = useState('');
  const [payMethode, setPayMethode]     = useState('moov');
  const [paySubmitting, setPaySubmitting] = useState(false);
  const [payError, setPayError]         = useState('');

  useEffect(() => {
    api.get('/reservations/')
      .then(res => setReservations(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id) => {
    try {
      await api.delete(`/reservations/${id}/`);
      setReservations(prev => prev.filter(r => r.id !== id));
      setDeleteModal(null);
    } catch { alert("Erreur lors de l'annulation"); }
  };

  const handleUpdateStatus = async (id, statut) => {
    try {
      await api.patch(`/reservations/${id}/`, { statut });
      setReservations(prev => prev.map(r => r.id === id ? { ...r, statut } : r));
    } catch (err) {
      alert(err.response?.data?.error || 'Erreur lors de la mise à jour');
    }
  };

  const initierPaiement = async (reservation) => {
    if (!payPhone || payPhone.length < 8) { setPayError('Numéro invalide (8 chiffres).'); return; }
    setPayError(''); setPaySubmitting(true);
    try {
      const payRes = await api.post('/paiement/initier/', {
        service_id: reservation.service.id,
        reservation_id: reservation.id,
        phone_number: payPhone,
        network: payMethode === 'moov' ? 'Flooz' : 'T-Money',
        montant: reservation.montant,
      });
      if (payRes.data.simulation) {
        setReservations(prev => prev.map(r =>
          r.id === reservation.id ? { ...r, statut: 'confirmee', paiement: { statut: 'confirme' } } : r
        ));
        setPayModal(null);
        alert('Paiement confirmé ! Le chat est maintenant ouvert.');
      } else {
        alert('Notification envoyée. Validez le paiement sur votre téléphone.');
        setPayModal(null);
      }
    } catch (err) {
      setPayError(err.response?.data?.error || 'Erreur lors du paiement.');
    } finally { setPaySubmitting(false); }
  };

  const filtered = activeTab === 'toutes'
    ? reservations
    : reservations.filter(r => r.statut === activeTab);

  const countByTab = (key) => key === 'toutes'
    ? reservations.length
    : reservations.filter(r => r.statut === key).length;

  if (loading) return (
    <div style={{ textAlign: 'center', padding: 80 }}>
      <i className="bi bi-hourglass-split" style={{ fontSize: '3rem', color: 'var(--primary-color)' }}></i>
      <p className="mt-3 text-muted">Chargement...</p>
    </div>
  );

  return (
    <div className="py-5">
      <div className="container">

        {/* ── Header ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
          <div className="avatar" style={{ background: 'var(--primary-color)', flexShrink: 0 }}>
            {user?.username?.[0]?.toUpperCase()}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h2 style={{ fontWeight: 800, fontSize: '1.4rem', marginBottom: 2 }}>
              <i className="bi bi-calendar-check text-primary me-2"></i>Mes Réservations
            </h2>
            <span className="text-muted" style={{ fontSize: '0.85rem' }}>
              {user?.username} · {user?.type_compte}
            </span>
          </div>
          <Link to="/mon-compte" className="btn-outline-primary-custom btn-sm-custom" style={{ flexShrink: 0 }}>
            <i className="bi bi-person"></i>
            <span className="hide-mobile ms-1">Mon compte</span>
          </Link>
        </div>

        {/* ── Onglets ── */}
        <div style={{
          display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 8,
          marginBottom: 20, msOverflowStyle: 'none', scrollbarWidth: 'none',
        }}>
          {TABS.filter(t => t.key === 'toutes' || countByTab(t.key) > 0).map(tab => {
            const count = countByTab(tab.key);
            const active = activeTab === tab.key;
            return (
              <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '8px 14px', borderRadius: 50, border: 'none', cursor: 'pointer',
                background: active ? 'var(--primary-color)' : 'white',
                color: active ? 'white' : 'var(--text-muted)',
                fontWeight: active ? 700 : 500, fontSize: '0.85rem',
                whiteSpace: 'nowrap', flexShrink: 0,
                boxShadow: active ? '0 4px 12px rgba(2,132,199,0.3)' : '0 1px 4px rgba(0,0,0,0.08)',
                transition: 'all 0.2s',
              }}>
                <i className={tab.icon}></i>
                {tab.label}
                {count > 0 && (
                  <span style={{
                    background: active ? 'rgba(255,255,255,0.25)' : '#e0f2fe',
                    color: active ? 'white' : 'var(--primary-color)',
                    borderRadius: 20, padding: '1px 7px', fontSize: '0.72rem', fontWeight: 700,
                  }}>{count}</span>
                )}
              </button>
            );
          })}
        </div>

        {/* ── Liste ── */}
        {filtered.length === 0 ? (
          <div className="empty-state">
            <i className="bi bi-calendar-x"></i>
            <h4>Aucune réservation</h4>
            <p>
              {activeTab === 'toutes'
                ? "Vous n'avez pas encore de réservations."
                : `Aucune réservation dans cet onglet.`}
            </p>
            {activeTab === 'toutes' && (
              <Link to="/services" className="btn-primary-custom">
                <i className="bi bi-grid-3x3-gap"></i> Parcourir les services
              </Link>
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {filtered.map(r => {
              const expanded = expandedId === r.id;
              return (
                <div key={r.id} className="card-custom" style={{ overflow: 'hidden' }}>

                  {/* ── Ligne résumé (toujours visible) ── */}
                  <div
                    onClick={() => setExpandedId(expanded ? null : r.id)}
                    style={{
                      padding: '14px 16px', display: 'flex', alignItems: 'center',
                      gap: 12, cursor: 'pointer',
                      background: expanded ? '#f0f8ff' : 'white',
                      transition: 'background 0.2s',
                    }}
                  >
                    {/* Icône statut */}
                    <div style={{
                      width: 42, height: 42, borderRadius: 10, flexShrink: 0,
                      background: STATUT_BG[r.statut] || '#f1f5f9',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <i className={`bi ${STATUT_ICON[r.statut] || 'bi-circle'}`}
                        style={{ fontSize: '1.1rem', color: STATUT_COLOR[r.statut] || '#64748b' }}></i>
                    </div>

                    {/* Info principale */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontWeight: 700, fontSize: '0.95rem', marginBottom: 3,
                        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                      }}>
                        {r.service?.nom || 'Service'}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        <i className="bi bi-person me-1"></i>
                        {user?.type_compte === 'client'
                          ? r.service?.prestataire?.user?.username || '-'
                          : r.client?.user?.username || r.client}
                        {r.date_debut && (
                          <span className="ms-2">
                            <i className="bi bi-calendar2 me-1"></i>{fmt(r.date_debut)}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Badge + montant + chevron */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, flexShrink: 0 }}>
                      <span className={`badge ${STATUT_CLASS[r.statut] || 'badge-secondary'}`}
                        style={{ fontSize: '0.7rem' }}>
                        {STATUT_LABEL[r.statut] || r.statut}
                      </span>
                      <span style={{ fontWeight: 800, color: 'var(--primary-color)', fontSize: '0.85rem' }}>
                        {r.montant} F
                      </span>
                    </div>
                    <i className={`bi bi-chevron-${expanded ? 'up' : 'down'}`}
                      style={{ color: '#94a3b8', fontSize: '0.8rem', flexShrink: 0 }}></i>
                  </div>

                  {/* ── Détails expandés ── */}
                  {expanded && (
                    <div style={{ borderTop: '1px solid var(--border-color)', padding: 16 }}>

                      {/* Grille d'infos */}
                      <div style={{
                        display: 'grid', gridTemplateColumns: '1fr 1fr',
                        gap: '10px 20px', marginBottom: 16,
                      }}>
                        {[
                          ['Date réservation', fmt(r.date_res)],
                          ['Intervention', fmt(r.date_debut)],
                          r.lieu    && ['Lieu', r.lieu],
                          r.notes   && ['Notes', r.notes],
                          r.paiement?.methode && ['Méthode paiement', r.paiement.methode],
                          r.paiement?.transaction_ref && ['Référence', r.paiement.transaction_ref],
                        ].filter(Boolean).map(([k, v]) => (
                          <div key={k} style={{ fontSize: '0.82rem' }}>
                            <div style={{ color: 'var(--text-muted)', marginBottom: 2 }}>{k}</div>
                            <div style={{ fontWeight: 600, wordBreak: 'break-word' }}>{v}</div>
                          </div>
                        ))}
                        <div style={{ fontSize: '0.82rem' }}>
                          <div style={{ color: 'var(--text-muted)', marginBottom: 2 }}>Total</div>
                          <div style={{ fontWeight: 800, color: 'var(--primary-color)', fontSize: '1rem' }}>
                            {r.montant} FCFA
                          </div>
                        </div>
                      </div>

                      {/* Boutons actions */}
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>

                        <Link to={`/services/${r.service?.id || r.service}`}
                          className="btn-outline-primary-custom btn-sm-custom">
                          <i className="bi bi-eye"></i> Voir service
                        </Link>

                        {user?.type_compte === 'client' && r.statut === 'en_attente_paiement' && (
                          <button
                            onClick={() => { setPayModal(r); setPayPhone(''); setPayError(''); }}
                            className="btn-primary-custom btn-sm-custom"
                            style={{ background: 'linear-gradient(135deg,#ffc107,#e0a800)', color: '#333' }}>
                            <i className="bi bi-credit-card"></i> Payer {r.montant} FCFA
                          </button>
                        )}

                        {r.statut === 'confirmee' && (
                          <Link to={`/chat/${r.id}`} className="btn-primary-custom btn-sm-custom">
                            <i className="bi bi-chat-dots"></i> Chat
                          </Link>
                        )}

{/* Bouton pour marquer comme terminé (client uniquement si confirmé) */}
                        {user?.type_compte === 'client' && r.statut === 'confirmee' && (
                          <button onClick={() => handleUpdateStatus(r.id, 'terminee')}
                            className="btn-outline-primary-custom btn-sm-custom"
                            style={{ borderColor: '#059669', color: '#059669' }}>
                            <i className="bi bi-flag"></i> Terminer
                          </button>
                        )}

                        {/* Bouton évaluer - visible si confirmé ou terminé et pas encore évalué */}
                        {user?.type_compte === 'client' && !r.evaluation && ['confirmee', 'terminee'].includes(r.statut) && (
                          <Link to={`/evaluer/${r.id}`} className="btn-primary-custom btn-sm-custom"
                            style={{ background: 'linear-gradient(135deg,#ffc107,#e0a800)', color: '#333' }}>
                            <i className="bi bi-star"></i> Évaluer
                          </Link>
                        )}

                        {r.evaluation && (
                          <span className="badge badge-warning" style={{ padding: '8px 12px' }}>
                            <i className="bi bi-star-fill me-1"></i>{r.evaluation.note}/5
                          </span>
                        )}

                        {user?.type_compte === 'prestataire' && r.statut === 'en_attente' && (
                          <button onClick={() => handleUpdateStatus(r.id, 'en_attente_paiement')}
                            className="btn-primary-custom btn-sm-custom"
                            style={{ background: 'linear-gradient(135deg,#28a745,#1e7e34)' }}>
                            <i className="bi bi-check-circle"></i> Confirmer
                          </button>
                        )}

                        {user?.type_compte === 'prestataire' && ['en_attente', 'en_attente_paiement'].includes(r.statut) && (
                          <button onClick={() => handleUpdateStatus(r.id, 'annulee')}
                            className="btn-outline-danger-custom btn-sm-custom">
                            <i className="bi bi-x-circle"></i> Refuser
                          </button>
                        )}

                        {user?.type_compte === 'client' && ['en_attente', 'en_attente_paiement'].includes(r.statut) && (
                          <button onClick={() => setDeleteModal(r)}
                            className="btn-outline-danger-custom btn-sm-custom">
                            <i className="bi bi-trash"></i> Annuler
                          </button>
                        )}

                        {r.paiement?.ussd_prestataire && (
                          <button
                            onClick={() => navigator.clipboard.writeText(r.paiement.ussd_prestataire)
                              .then(() => alert('USSD copié !'))}
                            className="btn-primary-custom btn-sm-custom"
                            style={{ background: 'linear-gradient(135deg,#28a745,#1e7e34)' }}>
                            <i className="bi bi-copy"></i> Copier USSD
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Modal annulation ── */}
      {deleteModal && (
        <div className="modal-overlay" onClick={() => setDeleteModal(null)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header-custom">
              <h5 style={{ margin: 0 }}>Confirmer l'annulation</h5>
              <button onClick={() => setDeleteModal(null)}
                style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer' }}>×</button>
            </div>
            <div className="modal-body-custom">
              <p>Annuler la réservation pour <strong>{deleteModal.service?.nom}</strong> ?</p>
              <div className="alert alert-warning">
                <i className="bi bi-info-circle me-2"></i>Cette action est irréversible.
              </div>
            </div>
            <div className="modal-footer-custom">
              <button onClick={() => setDeleteModal(null)} className="btn-secondary-custom">Retour</button>
              <button onClick={() => handleDelete(deleteModal.id)} className="btn-danger-custom">
                <i className="bi bi-trash"></i> Confirmer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal paiement ── */}
      {payModal && (
        <div className="modal-overlay" onClick={() => setPayModal(null)}>
          <div className="modal-box" onClick={e => e.stopPropagation()} style={{ maxWidth: 420 }}>
            <div className="modal-header-custom">
              <h5 style={{ margin: 0 }}><i className="bi bi-credit-card me-2"></i>Paiement</h5>
              <button onClick={() => setPayModal(null)}
                style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer' }}>×</button>
            </div>
            <div className="modal-body-custom">
              <p className="text-muted" style={{ fontSize: '0.9rem' }}>
                <strong>{payModal.service?.nom}</strong> — <strong>{payModal.montant} FCFA</strong>
              </p>
              <div className="mb-3">
                <label className="form-label">Opérateur</label>
                <div style={{ display: 'flex', gap: 12 }}>
                  {[
                    { key: 'moov', label: 'Moov Money', sub: 'Flooz', color: '#ffc107', bg: '#fff8e1' },
                    { key: 'tmoney', label: 'T-Money', sub: 'Togocom', color: '#17a2b8', bg: '#e8f6f8' },
                  ].map(op => (
                    <button key={op.key} type="button" onClick={() => setPayMethode(op.key)} style={{
                      flex: 1, border: `2px solid ${payMethode === op.key ? op.color : '#dee2e6'}`,
                      borderRadius: 12, padding: '12px 8px', cursor: 'pointer',
                      background: payMethode === op.key ? op.bg : 'white',
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                    }}>
                      <strong style={{ fontSize: '0.9rem' }}>{op.label}</strong>
                      <small className="text-muted">{op.sub}</small>
                    </button>
                  ))}
                </div>
              </div>
              <div className="mb-3">
                <label className="form-label">Numéro +228</label>
                <div className="input-group">
                  <span className="input-group-text"><i className="bi bi-phone"></i>&nbsp;+228</span>
                  <input type="tel" className="form-control"
                    placeholder={payMethode === 'moov' ? 'Ex: 90000000' : 'Ex: 91000000'}
                    value={payPhone}
                    onChange={e => setPayPhone(e.target.value.replace(/\D/g, '').slice(0, 8))}
                    maxLength={8} />
                </div>
              </div>
              {payError && (
                <div className="alert alert-danger">
                  <i className="bi bi-exclamation-triangle me-2"></i>{payError}
                </div>
              )}
            </div>
            <div className="modal-footer-custom">
              <button onClick={() => setPayModal(null)} className="btn-secondary-custom">Annuler</button>
              <button onClick={() => initierPaiement(payModal)} className="btn-primary-custom"
                disabled={paySubmitting || payPhone.length < 8}>
                {paySubmitting
                  ? <><span className="spinner-border spinner-border-sm me-2"></span>…</>
                  : <><i className="bi bi-shield-check me-2"></i>Payer</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
