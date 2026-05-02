import { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';

const LABELS = ['', 'Très mauvais 😞', 'Mauvais 😕', 'Correct 😐', 'Bien 😊', 'Excellent 🌟'];
const BG_STARS = ['', '#fef2f2', '#fff7ed', '#fefce8', '#f0fdf4', '#fffbeb'];
const COLOR_STARS = ['', '#dc2626', '#ea580c', '#ca8a04', '#16a34a', '#d97706'];

export default function Evaluer() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [reservation, setReservation] = useState(null);
  const [note, setNote] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [commentaire, setCommentaire] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get(`/reservations/${id}/`).then(res => {
      const data = res.data;
      if (data.evaluation) {
        navigate('/mes-reservations');
        return;
      }
      setReservation(data);
    }).catch(console.error).finally(() => setLoading(false));
  }, [id, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (note === 0) { setError('Veuillez sélectionner une note.'); return; }
    if (!commentaire.trim()) { setError('Veuillez écrire un commentaire.'); return; }
    setSubmitting(true); setError('');
    try {
      await api.post(`/reservations/${id}/evaluer/`, { note, commentaire });
      navigate('/mes-reservations');
    } catch (err) {
      const msg = err.response?.data?.error || err.response?.data?.detail || 'Erreur lors de la soumission. Réessayez.';
      setError(typeof msg === 'string' ? msg : 'Erreur lors de la soumission. Réessayez.');
    } finally { setSubmitting(false); }
  };

  if (loading) return (
    <div style={{ textAlign:'center', padding:80 }}>
      <i className="bi bi-hourglass-split" style={{ fontSize:'3rem', color:'var(--primary-color)' }}></i>
    </div>
  );
  if (!reservation) return (
    <div className="container py-5"><div className="alert alert-danger">Réservation introuvable.</div></div>
  );

  const displayNote = hovered || note;

  return (
    <div className="py-5" style={{ background:'#f8fafb', minHeight:'100vh' }}>
      <div className="container" style={{ maxWidth:640 }}>

        {/* ── Header ── */}
        <div style={{ textAlign:'center', marginBottom:28 }}>
          <div style={{
            width:64, height:64, borderRadius:'50%',
            background:'linear-gradient(135deg, #ffc107, #e0a800)',
            display:'flex', alignItems:'center', justifyContent:'center',
            margin:'0 auto 16px', boxShadow:'0 8px 24px rgba(255,193,7,0.3)'
          }}>
            <i className="bi bi-star-fill" style={{ fontSize:'1.8rem', color:'white' }}></i>
          </div>
          <h2 style={{ fontWeight:800, fontSize:'1.5rem', marginBottom:6 }}>Évaluer ce service</h2>
          <p className="text-muted" style={{ fontSize:'0.9rem' }}>Votre avis nous aide à améliorer nos services</p>
        </div>

        {/* ── Service Info Card ── */}
        <div className="card-custom" style={{ padding:20, marginBottom:24, display:'flex', gap:16, alignItems:'center', flexWrap:'wrap' }}>
          <div style={{
            width:56, height:56, borderRadius:14,
            background:'linear-gradient(135deg, var(--primary-light), #bae6fd)',
            display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0
          }}>
            <i className={`bi ${reservation.service?.categorie?.icone || 'bi-briefcase'}`}
              style={{ fontSize:'1.5rem', color:'var(--primary-color)' }}></i>
          </div>
          <div style={{ flex:1, minWidth:0 }}>
            <h5 style={{ fontWeight:700, marginBottom:4, fontSize:'1rem', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
              {reservation.service?.nom}
            </h5>
            <p style={{ margin:0, fontSize:'0.82rem', color:'#64748b' }}>
              <i className="bi bi-calendar me-1"></i>
              {reservation.date_res ? new Date(reservation.date_res).toLocaleDateString('fr-FR') : '-'}
              <span className="ms-2"><i className="bi bi-currency-dollar me-1"></i>{reservation.montant} Fcfa</span>
            </p>
          </div>
        </div>

        {/* ── Form Card ── */}
        <div className="card-custom" style={{ padding:'32px 28px' }}>
          <form onSubmit={handleSubmit}>
            {error && (
              <div className="alert alert-danger" style={{ marginBottom:20 }}>
                <i className="bi bi-exclamation-triangle-fill me-2"></i>{String(error)}
              </div>
            )}

            {/* Star Rating */}
            <div style={{ marginBottom:28 }}>
              <label className="form-label" style={{ fontSize:'1rem', fontWeight:700, display:'block', marginBottom:12 }}>
                Quelle note donnez-vous ?
              </label>
              <div style={{
                display:'flex', gap:'clamp(4px, 2vw, 12px)',
                justifyContent:'center',
                padding:'16px 12px',
                borderRadius:16,
                background: note > 0 ? BG_STARS[note] : '#f8fafc',
                border: `2px solid ${note > 0 ? COLOR_STARS[note] + '30' : '#e2e8f0'}`,
                transition:'all 0.3s'
              }}>
                {[1,2,3,4,5].map(star => (
                  <button
                    key={star} type="button"
                    onClick={() => setNote(star)}
                    onMouseEnter={() => setHovered(star)}
                    onMouseLeave={() => setHovered(0)}
                    style={{
                      background:'none', border:'none', cursor:'pointer', padding:'4px',
                      transition:'transform 0.15s',
                      transform: star <= displayNote ? 'scale(1.2)' : 'scale(1)'
                    }}
                  >
                    <i
                      className={`bi bi-star${star <= displayNote ? '-fill' : ''}`}
                      style={{
                        fontSize:'clamp(1.8rem, 5vw, 2.6rem)',
                        color: star <= displayNote ? '#ffc107' : '#dee2e6',
                        transition:'color 0.15s, filter 0.2s',
                        filter: star <= displayNote ? 'drop-shadow(0 2px 4px rgba(255,193,7,0.4))' : 'none'
                      }}
                    ></i>
                  </button>
                ))}
              </div>
              {note > 0 && (
                <p style={{
                  marginTop:12, textAlign:'center', fontWeight:700, fontSize:'1rem',
                  color: COLOR_STARS[note]
                }}>
                  {LABELS[note]}
                </p>
              )}
            </div>

            {/* Comment */}
            <div style={{ marginBottom:28 }}>
              <label className="form-label" style={{ fontSize:'1rem', fontWeight:700, display:'block', marginBottom:10 }}>
                Votre commentaire
              </label>
              <textarea
                className="form-control"
                rows={4}
                placeholder="Partagez votre expérience, la qualité du service, la ponctualité..."
                value={commentaire}
                onChange={e => setCommentaire(e.target.value)}
                required
                style={{ fontSize:'0.95rem', borderRadius:12 }}
              />
            </div>

            {/* Actions */}
            <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
              <button type="submit" className="btn-primary-custom" disabled={submitting}
                style={{ justifyContent:'center', padding:'14px', fontSize:'1rem' }}>
                {submitting
                  ? <><span className="spinner-border spinner-border-sm me-2"></span>Envoi en cours...</>
                  : <><i className="bi bi-send"></i> Publier mon avis</>}
              </button>
              <Link to="/mes-reservations" className="btn-secondary-custom"
                style={{ justifyContent:'center', padding:'12px', fontSize:'0.95rem' }}>
                <i className="bi bi-arrow-left me-2"></i>Annuler
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

