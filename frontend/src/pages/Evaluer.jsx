import { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';

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
    api.get(`/reservations/${id}/`).then(res => setReservation(res.data)).catch(console.error).finally(() => setLoading(false));
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (note === 0) { setError('Veuillez sélectionner une note.'); return; }
    if (!commentaire.trim()) { setError('Veuillez écrire un commentaire.'); return; }
    setSubmitting(true); setError('');
    try {
      await api.post(`/reservations/${id}/evaluer/`, { note, commentaire });
      navigate('/mes-reservations');
    } catch {
      setError('Erreur lors de la soumission. Réessayez.');
    } finally { setSubmitting(false); }
  };

  if (loading) return (
    <div style={{ textAlign:'center', padding:80 }}>
      <i className="bi bi-hourglass-split" style={{ fontSize:'3rem', color:'var(--primary-color)' }}></i>
    </div>
  );
  if (!reservation) return (
    <div className="container py-5">
      <div className="alert alert-danger">Réservation introuvable.</div>
    </div>
  );

  const displayNote = hovered || note;
  const labels = ['', 'Très mauvais', 'Mauvais', 'Correct', 'Bien', 'Excellent !'];

  return (
    <div className="py-5">
      <div className="container">
        <div style={{ display:'flex', justifyContent:'center' }}>
          <div style={{ width:'100%', maxWidth:560 }}>
            <div className="form-custom">

              {/* Header */}
              <div style={{ textAlign:'center', marginBottom:32 }}>
                <i className="bi bi-star-fill" style={{ fontSize:'3rem', color:'#ffc107' }}></i>
                <h2 style={{ fontWeight:800, marginTop:16, marginBottom:6 }}>Évaluer ce service</h2>
                <p className="text-muted">Votre avis nous aide à améliorer nos services</p>
              </div>

              {/* Reservation info */}
              <div className="card-custom mb-4" style={{ padding:20 }}>
                <h5 style={{ fontWeight:700, marginBottom:8 }}>{reservation.service?.nom}</h5>
                <p className="text-muted" style={{ margin:'4px 0', fontSize:'0.9rem' }}>
                  <i className="bi bi-calendar me-1"></i>
                  Réservation du{' '}
                  {reservation.date_res ? new Date(reservation.date_res).toLocaleDateString('fr-FR') : '-'}
                </p>
                <p className="text-muted" style={{ margin:0, fontSize:'0.9rem' }}>
                  <i className="bi bi-currency-dollar me-1"></i>
                  Montant: <strong>{reservation.montant} Fcfa</strong>
                </p>
              </div>

              <form onSubmit={handleSubmit}>
                {error && (
                  <div className="alert alert-danger">
                    <i className="bi bi-exclamation-triangle"></i> {error}
                  </div>
                )}

                {/* Star rating */}
                <div className="mb-4">
                  <label className="form-label" style={{ fontSize:'1rem', fontWeight:700 }}>Note</label>
                  <div style={{ display:'flex', gap:8, marginTop:8 }}>
                    {[1,2,3,4,5].map(star => (
                      <button
                        key={star} type="button"
                        onClick={() => setNote(star)}
                        onMouseEnter={() => setHovered(star)}
                        onMouseLeave={() => setHovered(0)}
                        style={{
                          background:'none', border:'none', cursor:'pointer', padding:4,
                          transition:'transform 0.15s',
                          transform: star <= displayNote ? 'scale(1.15)' : 'scale(1)'
                        }}
                      >
                        <i
                          className={`bi bi-star${star <= displayNote ? '-fill' : ''}`}
                          style={{
                            fontSize:'2.2rem',
                            color: star <= displayNote ? '#ffc107' : '#dee2e6',
                            transition:'color 0.15s'
                          }}
                        ></i>
                      </button>
                    ))}
                  </div>
                  {note > 0 && (
                    <p style={{ marginTop:8, color:'var(--primary-color)', fontWeight:600, fontSize:'0.9rem' }}>
                      {labels[note]}
                    </p>
                  )}
                </div>

                {/* Comment */}
                <div className="mb-4">
                  <label className="form-label" style={{ fontSize:'1rem', fontWeight:700 }}>Votre commentaire</label>
                  <textarea
                    className="form-control"
                    rows={4}
                    placeholder="Partagez votre expérience avec ce service..."
                    value={commentaire}
                    onChange={e => setCommentaire(e.target.value)}
                    required
                    style={{ marginTop:6 }}
                  />
                </div>

                <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                  <button type="submit" className="btn-primary-custom" disabled={submitting}
                    style={{ justifyContent:'center', padding:'14px', fontSize:'1rem' }}>
                    {submitting
                      ? 'Envoi en cours...'
                      : <><i className="bi bi-send"></i> Soumettre l'évaluation</>}
                  </button>
                  <Link to="/mes-reservations" className="btn-secondary-custom"
                    style={{ justifyContent:'center', padding:'12px' }}>
                    Annuler
                  </Link>
                </div>
              </form>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}