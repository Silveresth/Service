import { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import api from '../../api/axios';

const LABELS     = ['', 'Très mauvais 😞', 'Mauvais 😕', 'Correct 😐', 'Bien 😊', 'Excellent 🌟'];
const NOTE_COLORS = ['', '#dc2626', '#ea580c', '#ca8a04', '#16a34a', '#d97706'];
const NOTE_BGS    = ['', '#fef2f2', '#fff7ed', '#fefce8', '#f0fdf4', '#fffbeb'];

const EV_STYLES = `
  /* IMPORTANT: garder la police globale (ne pas importer Syne ici)
     sinon certaines pages ne respectent pas la police globale */

  .ev-page {

    background: #f0f8ff; min-height: 100vh;
    display: flex; flex-direction: column; align-items: center;
    padding: 0 0 60px;
  }

  /* Hero band */
  .ev-hero {
    width: 100%;
    background: linear-gradient(135deg, #0c2340 0%, #0a3d6b 50%, #0284c7 100%);
    padding: 32px 24px 56px; text-align: center; color: white;
    position: relative; overflow: hidden;
  }
  .ev-hero::after {
    content: ''; position: absolute; bottom: -2px; left: 0; right: 0;
    height: 36px; background: #f0f8ff;
    clip-path: ellipse(55% 100% at 50% 100%);
  }
  .ev-hero-deco {
    position: absolute; border-radius: 50%;
    border: 1px solid rgba(255,255,255,0.06); pointer-events: none;
  }
  .ev-hero-icon {
    width: 80px; height: 80px; border-radius: 50%;
    background: rgba(255,255,255,0.12); border: 2px solid rgba(255,255,255,0.2);
    display: flex; align-items: center; justify-content: center;
    font-size: 2.2rem; margin: 0 auto 18px;
    animation: ev-float 3s ease-in-out infinite;
    position: relative; z-index: 1;
  }
  @keyframes ev-float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
  .ev-hero-title {
    font-weight: 800;
    font-size: 1.7rem; margin: 0 0 6px; position: relative; z-index: 1;
  }
  .ev-hero-sub { font-size: 0.88rem; opacity: 0.75; margin: 0; position: relative; z-index: 1; }

  /* Content wrapper */
  .ev-content { width: 100%; max-width: 580px; padding: 0 20px; margin-top: -28px; position: relative; z-index: 2; }

  /* Card */
  .ev-card {
    background: white; border-radius: 20px;
    border: 1.5px solid #e0f2fe;
    box-shadow: 0 4px 24px rgba(2,132,199,0.10);
    overflow: hidden; margin-bottom: 14px;
    animation: ev-in .35s ease;
  }
  @keyframes ev-in { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }

  /* Service info */
  .ev-service {
    display: flex; align-items: center; gap: 16px; padding: 18px 22px;
    border-bottom: 1px solid #f1f5f9;
  }
  .ev-service-icon {
    width: 54px; height: 54px; border-radius: 14px; flex-shrink: 0;
    background: linear-gradient(135deg, #e0f2fe, #bae6fd);
    display: flex; align-items: center; justify-content: center;
    font-size: 1.4rem; color: #0284c7;
  }
  .ev-service-name { font-weight: 800; color: #0c2340; font-size: 0.95rem; margin-bottom: 3px; font-family: inherit; }
  .ev-service-meta { font-size: 0.78rem; color: #64748b; display: flex; gap: 12px; }

  /* Star section */
  .ev-stars-section { padding: 24px 22px 20px; }
  .ev-stars-label { font-weight: 800; font-size: 0.92rem; color: #0c2340; margin-bottom: 16px; display: block; }
  .ev-stars-row {
    display: flex; justify-content: center; gap: 10px;
    padding: 18px 12px; border-radius: 16px;
    transition: background .3s, border-color .3s;
    border: 2px solid;
  }
  .ev-star-btn {
    background: none; border: none; cursor: pointer; padding: 4px;
    transition: transform .15s; display: flex; align-items: center;
  }
  .ev-star-btn:hover { transform: scale(1.15); }
  .ev-star-btn i { font-size: clamp(2rem,8vw,2.8rem); transition: color .15s, filter .2s; }
  .ev-note-label {
    text-align: center; font-weight: 800; font-size: 1rem;
    margin-top: 12px; min-height: 24px; transition: color .2s;
  }

  /* Comment */
  .ev-comment-section { padding: 0 22px 22px; }
  .ev-comment-label { font-weight: 800; font-size: 0.92rem; color: #0c2340; margin-bottom: 10px; display: flex; align-items: center; justify-content: space-between; }
  .ev-comment-req { font-size: 0.72rem; color: #ef4444; font-weight: 700; }
  .ev-textarea {
    width: 100%; border: 1.5px solid #e2e8f0; border-radius: 12px;
    padding: 12px 14px; font-size: 0.9rem; color: #0c2340;
    background: #fafbfc; outline: none; resize: vertical; font-family: inherit;
    transition: border-color .2s, box-shadow .2s;
  }
  .ev-textarea:focus { border-color: #0284c7; box-shadow: 0 0 0 4px rgba(2,132,199,0.10); background: white; }
  .ev-char-count { font-size: 0.72rem; color: #94a3b8; text-align: right; margin-top: 5px; }

  /* Error */
  .ev-error {
    margin: 0 22px 16px; background: #fef2f2; border: 1px solid #fecaca;
    border-radius: 12px; padding: 11px 15px; color: #dc2626;
    font-size: 0.85rem; display: flex; gap: 8px; align-items: center;
    animation: ev-shake .35s ease;
  }
  @keyframes ev-shake { 0%,100%{transform:translateX(0)} 25%{transform:translateX(-4px)} 75%{transform:translateX(4px)} }

  /* Actions */
  .ev-actions { padding: 0 22px 22px; display: flex; flex-direction: column; gap: 10px; }
  .ev-btn-submit {
    width: 100%; padding: 14px; border-radius: 14px; border: none;
    font-weight: 800; font-size: 0.95rem; font-family: inherit;
    display: flex; align-items: center; justify-content: center; gap: 8px;
    cursor: pointer; transition: all .2s;
    box-shadow: 0 5px 18px rgba(2,132,199,0.3);
  }
  .ev-btn-submit:disabled { opacity: 0.5; cursor: not-allowed; box-shadow: none; }
  .ev-btn-cancel {
    display: flex; align-items: center; justify-content: center; gap: 8px;
    padding: 12px; border-radius: 12px; border: 1.5px solid #e2e8f0;
    background: white; color: #64748b; font-weight: 700; font-size: 0.88rem;
    text-decoration: none; transition: all .2s;
  }
  .ev-btn-cancel:hover { border-color: #94a3b8; color: #374151; }

  /* Success */
  .ev-success {
    text-align: center; padding: 40px 24px; width: 100%; max-width: 480px;
    animation: ev-in .4s ease;
  }
  .ev-success-icon {
    width: 88px; height: 88px; border-radius: 50%;
    background: linear-gradient(135deg,#22c55e,#16a34a); color: white;
    display: flex; align-items: center; justify-content: center;
    font-size: 2.5rem; margin: 40px auto 20px;
    box-shadow: 0 8px 28px rgba(34,197,94,0.35);
    animation: ev-pop .4s cubic-bezier(0.34,1.56,0.64,1);
  }
  @keyframes ev-pop { from{transform:scale(0.5);opacity:0} to{transform:scale(1);opacity:1} }

  /* Spinner */
  .ev-spinner { width: 17px; height: 17px; border: 2px solid rgba(255,255,255,0.4); border-top-color: white; border-radius: 50%; animation: ev-spin .7s linear infinite; display: inline-block; }
  @keyframes ev-spin { to { transform: rotate(360deg); } }

  @media(max-width:480px) {
    .ev-hero { padding: 24px 20px 48px; }
    .ev-stars-section, .ev-comment-section, .ev-actions { padding-left: 16px; padding-right: 16px; }
    .ev-error { margin-left: 16px; margin-right: 16px; }
  }
`;

export default function Evaluer() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [reservation, setReservation] = useState(null);
  const [loading, setLoading]         = useState(true);
  const [submitting, setSubmitting]   = useState(false);
  const [note, setNote]               = useState(0);
  const [hovered, setHovered]         = useState(0);
  const [commentaire, setCommentaire] = useState('');
  const [error, setError]             = useState('');
  const [done, setDone]               = useState(false);

  useEffect(() => {
    api.get(`/reservations/${id}/`).then(res => {
      if (res.data.evaluation) { navigate('/mes-reservations'); return; }
      setReservation(res.data);
    }).catch(console.error).finally(() => setLoading(false));
  }, [id, navigate]);

  const handleSubmit = async e => {
    e.preventDefault();
    if (note === 0)              { setError('Veuillez sélectionner une note.'); return; }
    if (!commentaire.trim())     { setError('Veuillez écrire un commentaire.'); return; }
    setSubmitting(true); setError('');
    try {
      await api.post(`/reservations/${id}/evaluer/`, { note, commentaire });
      setDone(true);
    } catch (err) {
      const msg = err.response?.data?.error || err.response?.data?.detail || 'Erreur lors de la soumission.';
      setError(typeof msg === 'string' ? msg : 'Erreur lors de la soumission.');
    } finally { setSubmitting(false); }
  };

  const displayNote = hovered || note;
  const noteColor   = displayNote ? NOTE_COLORS[displayNote] : '#cbd5e1';
  const noteBg      = displayNote ? NOTE_BGS[displayNote]    : '#f8fafc';
  const noteBorder  = displayNote ? NOTE_COLORS[displayNote] + '30' : '#e2e8f0';

  if (loading) return (
    <>
      <style>{`@keyframes ev-spin{to{transform:rotate(360deg)}}`}</style>
      <div style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 14 }}>
        <div style={{ width: 44, height: 44, border: '4px solid #e0f2fe', borderTopColor: '#0284c7', borderRadius: '50%', animation: 'ev-spin .8s linear infinite' }}></div>
      </div>
    </>
  );

  if (!reservation) return (
    <>
      <style>{EV_STYLES}</style>
      <div className="ev-page">
        <div className="ev-hero"></div>
        <div className="ev-content">
          <div className="ev-card" style={{ padding: 32, textAlign: 'center', color: '#ef4444' }}>
            <i className="bi bi-exclamation-triangle-fill" style={{ fontSize: '2rem', display: 'block', marginBottom: 10 }}></i>
            Réservation introuvable.
          </div>
        </div>
      </div>
    </>
  );

  if (done) return (
    <>
      <style>{EV_STYLES}</style>
      <div className="ev-page">
        <div className="ev-hero">
          <div className="ev-hero-deco" style={{ width: 250, height: 250, top: -80, right: -60 }}></div>
        </div>
        <div className="ev-success">
          <div className="ev-success-icon"><i className="bi bi-check-lg"></i></div>
          <h2 style={{ fontWeight: 800, color: '#0c2340', marginBottom: 8 }}>Avis publié !</h2>
          <p style={{ color: '#64748b', lineHeight: 1.7, marginBottom: 24 }}>
            Merci pour votre retour. Votre avis aide d'autres clients à choisir les meilleurs services.
          </p>
          <div style={{ display: 'flex', gap: 10, flexDirection: 'column' }}>
            <Link to="/services" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '12px 24px', background: 'linear-gradient(135deg,#0284c7,#0369a1)', color: 'white', borderRadius: 12, textDecoration: 'none', fontWeight: 800 }}>
              <i className="bi bi-search"></i> Découvrir d'autres services
            </Link>
            <Link to="/mes-reservations" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '12px 24px', background: 'white', color: '#64748b', borderRadius: 12, textDecoration: 'none', fontWeight: 700, border: '1.5px solid #e2e8f0' }}>
              <i className="bi bi-arrow-left"></i> Mes réservations
            </Link>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <>
      <style>{EV_STYLES}</style>
      <div className="ev-page">

        {/* Hero */}
        <div className="ev-hero">
          <div className="ev-hero-deco" style={{ width: 260, height: 260, top: -80, right: -60 }}></div>
          <div className="ev-hero-deco" style={{ width: 160, height: 160, bottom: -40, left: '25%' }}></div>
          <div className="ev-hero-icon"><i className="bi bi-star-fill" style={{ color: '#fbbf24' }}></i></div>
          <h1 className="ev-hero-title">Évaluer ce service</h1>
          <p className="ev-hero-sub">Votre avis aide toute la communauté</p>
        </div>

        <div className="ev-content">
          <form onSubmit={handleSubmit}>

            {/* Service info */}
            <div className="ev-card">
              <div className="ev-service">
                <div className="ev-service-icon">
                  <i className={`bi ${reservation.service?.categorie?.icone || 'bi-briefcase'}`}></i>
                </div>
                <div>
                  <div className="ev-service-name">{reservation.service?.nom || 'Service'}</div>
                  <div className="ev-service-meta">
                    <span><i className="bi bi-calendar me-1"></i>{reservation.date_res ? new Date(reservation.date_res).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : '—'}</span>
                    <span><i className="bi bi-currency-exchange me-1"></i>{Number(reservation.montant).toLocaleString()} Fcfa</span>
                  </div>
                </div>
              </div>

              {/* Stars */}
              <div className="ev-stars-section">
                <span className="ev-stars-label">Quelle note donnez-vous ? <span style={{ color: '#ef4444' }}>*</span></span>
                <div className="ev-stars-row" style={{ background: noteBg, borderColor: noteBorder }}>
                  {[1, 2, 3, 4, 5].map(s => (
                    <button key={s} type="button" className="ev-star-btn"
                      onClick={() => setNote(s)}
                      onMouseEnter={() => setHovered(s)}
                      onMouseLeave={() => setHovered(0)}>
                      <i className={`bi bi-star${s <= displayNote ? '-fill' : ''}`}
                        style={{
                          color: s <= displayNote ? noteColor : '#e2e8f0',
                          filter: s <= displayNote ? `drop-shadow(0 2px 4px ${noteColor}60)` : 'none',
                        }}></i>
                    </button>
                  ))}
                </div>
                <div className="ev-note-label" style={{ color: noteColor || '#94a3b8' }}>
                  {displayNote ? LABELS[displayNote] : 'Cliquez sur une étoile pour noter'}
                </div>
              </div>

              {/* Comment */}
              <div className="ev-comment-section">
                <div className="ev-comment-label">
                  Votre commentaire <span className="ev-comment-req">Obligatoire</span>
                </div>
                <textarea className="ev-textarea" rows={5} maxLength={500}
                  placeholder="Partagez votre expérience : ponctualité, qualité du travail, communication, résultat final…"
                  value={commentaire}
                  onChange={e => setCommentaire(e.target.value)} />
                <div className="ev-char-count">{commentaire.length}/500</div>
              </div>

              {error && (
                <div className="ev-error">
                  <i className="bi bi-exclamation-triangle-fill"></i> {error}
                </div>
              )}

              {/* Actions */}
              <div className="ev-actions">
                <button type="submit" className="ev-btn-submit" disabled={submitting || !note || !commentaire.trim()}
                  style={{
                    background: note ? `linear-gradient(135deg, ${NOTE_COLORS[note]}, ${NOTE_COLORS[note]}cc)` : '#e2e8f0',
                    color: note ? 'white' : '#94a3b8',
                  }}>
                  {submitting
                    ? <><span className="ev-spinner"></span> Envoi en cours…</>
                    : <><i className="bi bi-send-fill"></i> Publier mon avis</>
                  }
                </button>
                <Link to="/mes-reservations" className="ev-btn-cancel">
                  <i className="bi bi-arrow-left"></i> Annuler
                </Link>
              </div>
            </div>

          </form>
        </div>
      </div>
    </>
  );
}