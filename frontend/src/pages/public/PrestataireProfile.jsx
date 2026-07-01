import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';

const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Outfit:wght@600;700;800&display=swap');

@keyframes pp-up   { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
@keyframes pp-fade { from { opacity:0; } to { opacity:1; } }
@keyframes pp-shimmer {
  0%   { background-position:-200% 0; }
  100% { background-position: 200% 0; }
}

.pp-page {
  font-family: 'Plus Jakarta Sans', sans-serif;
  background: #f8fafc;
  min-height: 100vh;
  padding-bottom: 80px;
}

/* ── HERO BANNER ── */
.pp-hero {
  background: linear-gradient(135deg, #0c2340 0%, #0a3060 55%, #0284c7 100%);
  padding: 48px 0 80px;
  position: relative;
  overflow: hidden;
}

.pp-hero::before {
  content: '';
  position: absolute;
  top: -100px; right: -60px;
  width: 440px; height: 440px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(56,189,248,0.18) 0%, transparent 70%);
  filter: blur(60px);
  pointer-events: none;
}

.pp-hero::after {
  content: '';
  position: absolute;
  bottom: -80px; left: -40px;
  width: 320px; height: 320px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%);
  filter: blur(60px);
  pointer-events: none;
}

.pp-hero-inner {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: flex-start;
  gap: 28px;
  flex-wrap: wrap;
  animation: pp-up 0.55s cubic-bezier(0.22,1,0.36,1) both;
}

.pp-back-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: rgba(255,255,255,0.7);
  font-size: 0.85rem;
  font-weight: 600;
  text-decoration: none;
  margin-bottom: 20px;
  transition: color 0.2s;
}
.pp-back-btn:hover { color: white; }

.pp-avatar-hero {
  width: 100px;
  height: 100px;
  border-radius: 24px;
  border: 4px solid rgba(255,255,255,0.25);
  background: linear-gradient(135deg, #0284c7, #4f46e5);
  display: flex; align-items: center; justify-content: center;
  font-size: 2.2rem; font-weight: 800; color: white;
  flex-shrink: 0;
  overflow: hidden;
  box-shadow: 0 12px 32px rgba(0,0,0,0.25);
}

.pp-avatar-hero img { width: 100%; height: 100%; object-fit: cover; }

.pp-hero-meta { flex: 1; min-width: 200px; }

.pp-hero-name {
  font-family: 'Outfit', sans-serif;
  font-weight: 800;
  font-size: clamp(1.4rem, 3vw, 2rem);
  color: white;
  margin: 0 0 4px;
  letter-spacing: -0.02em;
}

.pp-hero-handle {
  color: rgba(255,255,255,0.55);
  font-size: 0.85rem;
  font-weight: 500;
  margin-bottom: 12px;
}

.pp-hero-tags {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 16px;
}

.pp-hero-tag {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 12px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 700;
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

.pp-hero-tag.spec {
  background: rgba(56,189,248,0.15);
  border: 1px solid rgba(56,189,248,0.25);
  color: #7dd3fc;
}

.pp-hero-tag.verified {
  background: rgba(16,185,129,0.12);
  border: 1px solid rgba(16,185,129,0.2);
  color: #6ee7b7;
}

.pp-hero-stats {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
}

.pp-hero-stat {
  display: flex;
  flex-direction: column;
}

.pp-hero-stat-val {
  font-family: 'Outfit', sans-serif;
  font-weight: 800;
  font-size: 1.25rem;
  color: white;
  line-height: 1;
}

.pp-hero-stat-lbl {
  font-size: 0.68rem;
  color: rgba(255,255,255,0.5);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-weight: 700;
  margin-top: 3px;
}

.pp-hero-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-self: center;
}

.pp-btn-wa {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 11px 20px;
  background: #25d366;
  color: white;
  border-radius: 12px;
  border: none;
  font-weight: 700;
  font-size: 0.88rem;
  text-decoration: none;
  transition: all 0.2s;
  box-shadow: 0 4px 12px rgba(37,211,102,0.25);
  white-space: nowrap;
}

.pp-btn-wa:hover {
  color: white;
  background: #1da851;
  transform: translateY(-1px);
  box-shadow: 0 8px 20px rgba(37,211,102,0.35);
}

/* ── MAIN CONTENT ── */
.pp-content {
  margin-top: -44px;
  position: relative;
  z-index: 10;
}

/* ── BIO CARD ── */
.pp-bio-card {
  background: white;
  border-radius: 24px;
  border: 1px solid #e2e8f0;
  padding: 24px;
  box-shadow: 0 8px 30px rgba(12,35,64,0.06);
  margin-bottom: 28px;
  animation: pp-up 0.5s cubic-bezier(0.22,1,0.36,1) 0.1s both;
}

.pp-bio-card h3 {
  font-family: 'Outfit', sans-serif;
  font-weight: 800;
  font-size: 1rem;
  color: #0c2340;
  margin: 0 0 10px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.pp-bio-text {
  color: #64748b;
  font-size: 0.92rem;
  line-height: 1.75;
  margin: 0;
}

/* ── SERVICES SECTION ── */
.pp-services-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 10px;
}

.pp-services-title {
  font-family: 'Outfit', sans-serif;
  font-weight: 800;
  font-size: 1.25rem;
  color: #0c2340;
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0;
}

.pp-services-badge {
  background: #e0f2fe;
  color: #0369a1;
  border-radius: 20px;
  padding: 3px 12px;
  font-size: 0.78rem;
  font-weight: 800;
}

.pp-search-wrap {
  position: relative;
}

.pp-search-icon {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  color: #94a3b8;
  font-size: 0.95rem;
  pointer-events: none;
}

.pp-search-input {
  padding: 10px 38px 10px 38px;
  border: 1.5px solid #e2e8f0;
  border-radius: 12px;
  font-size: 0.87rem;
  background: white;
  outline: none;
  transition: all 0.2s;
  color: #0c2340;
  font-family: inherit;
  min-width: 220px;
}

.pp-search-input:focus {
  border-color: #0284c7;
  box-shadow: 0 0 0 3px rgba(2,132,199,0.1);
}

/* ── SERVICE CARDS GRID ── */
.pp-services-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

@media (max-width: 640px) {
  .pp-services-grid { grid-template-columns: 1fr; gap: 14px; }
}

.pp-service-card {
  background: white;
  border-radius: 20px;
  border: 1px solid #e2e8f0;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.25,0.8,0.25,1);
  display: flex;
  flex-direction: column;
  animation: pp-up 0.5s cubic-bezier(0.22,1,0.36,1) both;
}

.pp-service-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 20px 40px rgba(2,132,199,0.12);
  border-color: #bae6fd;
}

.pp-svc-img {
  height: 160px;
  background: linear-gradient(135deg, #e0f2fe, #bae6fd);
  overflow: hidden;
  position: relative;
}

.pp-svc-img img {
  width: 100%; height: 100%;
  object-fit: cover;
  transition: transform 0.4s ease;
}

.pp-service-card:hover .pp-svc-img img { transform: scale(1.05); }

.pp-svc-img-placeholder {
  width: 100%; height: 100%;
  display: flex; align-items: center; justify-content: center;
  background: linear-gradient(135deg, #e0f2fe 0%, #c7d2fe 100%);
  font-size: 2.5rem;
  color: #0284c7;
}

.pp-svc-cat-badge {
  position: absolute;
  top: 10px; left: 10px;
  background: rgba(255,255,255,0.9);
  backdrop-filter: blur(8px);
  border-radius: 20px;
  padding: 3px 10px;
  font-size: 0.7rem;
  font-weight: 700;
  color: #0369a1;
}

.pp-svc-body {
  padding: 16px;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.pp-svc-name {
  font-family: 'Outfit', sans-serif;
  font-weight: 800;
  font-size: 1rem;
  color: #0c2340;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.pp-svc-desc {
  color: #64748b;
  font-size: 0.83rem;
  line-height: 1.6;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  flex: 1;
}

.pp-svc-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 8px;
  border-top: 1px solid #f1f5f9;
}

.pp-svc-price {
  font-family: 'Outfit', sans-serif;
  font-weight: 800;
  font-size: 1.05rem;
  color: #0c2340;
}

.pp-svc-price span {
  font-size: 0.72rem;
  color: #94a3b8;
  font-weight: 600;
  font-family: 'Plus Jakarta Sans', sans-serif;
}

.pp-svc-rating {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.82rem;
  font-weight: 700;
  color: #d97706;
}

.pp-svc-footer {
  padding: 0 16px 16px;
}

.pp-btn-reserver {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 11px;
  background: linear-gradient(135deg, #0284c7, #0369a1);
  color: white;
  border-radius: 12px;
  border: none;
  font-weight: 700;
  font-size: 0.88rem;
  text-decoration: none;
  transition: all 0.2s;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(2,132,199,0.2);
  font-family: inherit;
}

.pp-btn-reserver:hover {
  color: white;
  transform: translateY(-1px);
  box-shadow: 0 8px 20px rgba(2,132,199,0.35);
}

/* ── SKELETON ── */
.pp-skeleton {
  background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%);
  background-size: 200% 100%;
  animation: pp-shimmer 1.4s infinite;
  border-radius: 8px;
}

/* ── EMPTY ── */
.pp-empty {
  grid-column: 1/-1;
  text-align: center;
  padding: 60px 24px;
  background: white;
  border-radius: 20px;
  border: 1px solid #e2e8f0;
}

/* ── AVIS SECTION ── */
.pp-reviews-section {
  margin-top: 36px;
  animation: pp-up 0.5s cubic-bezier(0.22,1,0.36,1) 0.2s both;
}

.pp-review-card {
  background: white;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  padding: 18px;
  transition: all 0.2s;
}

.pp-review-card:hover {
  box-shadow: 0 8px 24px rgba(0,0,0,0.05);
  border-color: #bae6fd;
}

.pp-review-stars {
  color: #f59e0b;
  font-size: 0.9rem;
  letter-spacing: 1px;
}

.pp-review-text {
  font-size: 0.88rem;
  color: #475569;
  line-height: 1.65;
  margin: 8px 0;
}

.pp-review-author {
  font-size: 0.78rem;
  color: #94a3b8;
  font-weight: 600;
}

/* ── RESPONSIVE ── */
@media (max-width: 768px) {
  .pp-hero { padding: 36px 0 64px; }
  .pp-hero-inner { flex-direction: column; gap: 16px; }
  .pp-avatar-hero { width: 80px; height: 80px; border-radius: 20px; font-size: 1.8rem; }
  .pp-hero-actions { flex-direction: row; align-self: flex-start; }
  .pp-bio-card { padding: 18px; }
  .pp-services-header { flex-direction: column; align-items: flex-start; }
  .pp-search-input { min-width: 100%; width: 100%; }
  .pp-search-wrap { width: 100%; }
}
`;

function SkeletonServiceCard() {
  return (
    <div style={{ background: 'white', borderRadius: 20, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
      <div className="pp-skeleton" style={{ height: 160 }} />
      <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div className="pp-skeleton" style={{ width: '70%', height: 16 }} />
        <div className="pp-skeleton" style={{ width: '100%', height: 10 }} />
        <div className="pp-skeleton" style={{ width: '85%', height: 10 }} />
        <div className="pp-skeleton" style={{ width: '100%', height: 40, borderRadius: 12, marginTop: 6 }} />
      </div>
    </div>
  );
}

export default function PrestataireProfile() {
  const { id } = useParams();
  const { user } = useAuth();
  
  const [prestataire, setPrestataire] = useState(null);
  const [services, setServices] = useState([]);
  const [avis, setAvis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('services');
  
  const [isFavori, setIsFavori] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportMotif, setReportMotif] = useState('Qualité de service décevante');
  const [reportJustification, setReportJustification] = useState('');
  const [submittingReport, setSubmittingReport] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    if (user && user.type_compte === 'client' && prestataire) {
      api.get('/favoris/')
        .then(res => {
          const found = res.data.some(f => f.prestataire === prestataire.id);
          setIsFavori(found);
        })
        .catch(console.error);
    }
  }, [user, prestataire]);

  const toggleFavori = async () => {
    if (!prestataire) return;
    try {
      const res = await api.post('/favoris/toggle/', { prestataire: prestataire.id });
      setIsFavori(res.data.status === 'added');
      setToastMessage(res.data.message);
      setTimeout(() => setToastMessage(''), 3000);
    } catch (err) {
      alert("Erreur lors de la mise à jour des favoris.");
    }
  };

  const handleReport = async (e) => {
    e.preventDefault();
    if (!reportJustification.trim()) {
      alert("Veuillez fournir une justification.");
      return;
    }
    setSubmittingReport(true);
    try {
      await api.post('/signalements/', {
        prestataire: prestataire.id,
        motif: reportMotif,
        justification: reportJustification
      });
      setShowReportModal(false);
      setReportJustification('');
      setToastMessage("Signalement envoyé avec succès !");
      setTimeout(() => setToastMessage(''), 3000);
    } catch (err) {
      alert(err.response?.data?.error || "Erreur lors de l'envoi du signalement.");
    } finally {
      setSubmittingReport(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.get(`/prestataires/${id}/`),
      api.get(`/services/?prestataire=${id}`),
      api.get(`/evaluations/?prestataire=${id}`).catch(() => ({ data: [] })),
    ]).then(([pRes, sRes, aRes]) => {
      setPrestataire(pRes.data);
      setServices(sRes.data);
      setAvis(aRes.data);
    }).catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  const filteredServices = services.filter(s => {
    const q = search.toLowerCase();
    return !q || s.nom?.toLowerCase().includes(q) || s.description?.toLowerCase().includes(q) || s.categorie?.nom?.toLowerCase().includes(q);
  });

  const getNom = (p) =>
    p ? `${p.user?.first_name || ''} ${p.user?.last_name || ''}`.trim() || p.user?.username || 'Artisan' : '';

  const noteGlobale = avis.length
    ? (avis.reduce((acc, a) => acc + (a.note || 0), 0) / avis.length).toFixed(1)
    : null;

  if (loading) {
    return (
      <>
        <style>{STYLES}</style>
        <div className="pp-page">
          <div style={{ height: 240 }} className="pp-skeleton" />
          <div className="container" style={{ marginTop: -40, position: 'relative', zIndex: 10 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 20 }}>
              {Array(4).fill(0).map((_, i) => <SkeletonServiceCard key={i} />)}
            </div>
          </div>
        </div>
      </>
    );
  }

  if (!prestataire) {
    return (
      <>
        <style>{STYLES}</style>
        <div className="pp-page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
          <div style={{ textAlign: 'center', padding: 40 }}>
            <div style={{ fontSize: '3rem', marginBottom: 16 }}>😕</div>
            <h3 style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 800, color: '#0c2340', marginBottom: 8 }}>Prestataire introuvable</h3>
            <p style={{ color: '#64748b', marginBottom: 20 }}>Ce profil n'existe pas ou a été supprimé.</p>
            <Link to="/prestataires" style={{ padding: '11px 24px', background: 'linear-gradient(135deg,#0284c7,#0369a1)', color: 'white', borderRadius: 14, textDecoration: 'none', fontWeight: 700, fontSize: '0.9rem' }}>
              Retour aux prestataires
            </Link>
          </div>
        </div>
      </>
    );
  }

  const nom = getNom(prestataire);
  const badge = (() => {
    const n = prestataire.services_count || services.length;
    if (n >= 10) return { label: 'Platine', color: '#6366f1', icon: 'bi-gem' };
    if (n >= 5)  return { label: 'Or',      color: '#d97706', icon: 'bi-trophy-fill' };
    return              { label: 'Bronze',  color: '#b45309', icon: 'bi-award-fill' };
  })();

  const TABS = [
    { key: 'services', icon: 'bi-grid-3x3-gap', label: `Services (${services.length})` },
    { key: 'portfolio', icon: 'bi-images', label: `Portfolio (${prestataire.portfolio?.length || 0})` },
    { key: 'avis',     icon: 'bi-star',           label: `Avis (${avis.length})` },
    { key: 'infos',    icon: 'bi-person-badge',    label: 'Informations' },
  ];

  return (
    <>
      <style>{STYLES}</style>
      <div className="pp-page">

        {/* ── HERO ── */}
        <div className="pp-hero">
          <div className="container">
            <Link to="/prestataires" className="pp-back-btn">
              <i className="bi bi-arrow-left" /> Retour aux prestataires
            </Link>

            <div className="pp-hero-inner">
              {/* Avatar */}
              <div className="pp-avatar-hero">
                {prestataire.avatar_url
                  ? <img src={prestataire.avatar_url} alt={nom} />
                  : nom[0]?.toUpperCase()
                }
              </div>

              {/* Meta */}
              <div className="pp-hero-meta">
                <h1 className="pp-hero-name">{nom}</h1>
                <p className="pp-hero-handle">@{prestataire.user?.username || 'artisan'}</p>

                <div className="pp-hero-tags">
                  {prestataire.specialite && (
                    <span className="pp-hero-tag spec">
                      <i className="bi bi-tools" /> {prestataire.specialite}
                    </span>
                  )}
                  <span className="pp-hero-tag verified">
                    <i className="bi bi-shield-check-fill" /> Identité vérifiée
                  </span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '5px 12px', borderRadius: 20, fontSize: '0.75rem', fontWeight: 700, background: `rgba(255,255,255,0.1)`, border: '1px solid rgba(255,255,255,0.2)', color: 'white', backdropFilter: 'blur(8px)' }}>
                    <i className={`bi ${badge.icon}`} style={{ color: badge.color }} /> {badge.label}
                  </span>
                </div>

                <div className="pp-hero-stats">
                  <div className="pp-hero-stat">
                    <span className="pp-hero-stat-val">{services.length}</span>
                    <span className="pp-hero-stat-lbl">Services</span>
                  </div>
                  <div className="pp-hero-stat">
                    <span className="pp-hero-stat-val">{noteGlobale || '—'}</span>
                    <span className="pp-hero-stat-lbl">Note moy.</span>
                  </div>
                  <div className="pp-hero-stat">
                    <span className="pp-hero-stat-val">{prestataire.reservations_count || 0}</span>
                    <span className="pp-hero-stat-lbl">Réservations</span>
                  </div>
                  <div className="pp-hero-stat">
                    <span className="pp-hero-stat-val">{avis.length}</span>
                    <span className="pp-hero-stat-lbl">Avis</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="pp-hero-actions" style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap', marginTop: 16 }}>
                {prestataire.telephone && (
                  <a
                    href={`https://wa.me/228${prestataire.telephone}?text=${encodeURIComponent("Bonjour, j'ai trouvé votre profil sur Service Market et je souhaite discuter de vos prestations.")}`}
                    target="_blank"
                    rel="noreferrer"
                    className="pp-btn-wa"
                    style={{ margin: 0 }}
                  >
                    <i className="bi bi-whatsapp" style={{ marginRight: 6 }} /> Contacter
                  </a>
                )}
                {user && user.type_compte === 'client' && (
                  <>
                    <button
                      onClick={toggleFavori}
                      style={{
                        background: isFavori ? '#f43f5e' : 'rgba(255, 255, 255, 0.1)',
                        border: isFavori ? 'none' : '1px solid rgba(255,255,255,0.3)',
                        color: 'white',
                        padding: '12px 20px',
                        borderRadius: 14,
                        fontWeight: 800,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        transition: 'all 0.2s',
                        fontFamily: 'inherit'
                      }}
                    >
                      <i className={`bi ${isFavori ? 'bi-heart-fill' : 'bi-heart'}`} />
                      {isFavori ? 'Favori' : 'Favori'}
                    </button>
                    <button
                      onClick={() => setShowReportModal(true)}
                      style={{
                        background: 'rgba(239, 68, 68, 0.15)',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        color: '#f87171',
                        padding: '12px 20px',
                        borderRadius: 14,
                        fontWeight: 800,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        transition: 'all 0.2s',
                        fontFamily: 'inherit'
                      }}
                    >
                      <i className="bi bi-exclamation-triangle" />
                      Signaler
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── MAIN CONTENT ── */}
        <div className="pp-content">
          <div className="container">

            {/* TABS */}
            <div style={{ background: 'white', borderRadius: 24, border: '1px solid #e2e8f0', padding: '6px', display: 'inline-flex', gap: 4, marginBottom: 24, boxShadow: '0 4px 16px rgba(12,35,64,0.06)', flexWrap: 'wrap' }}>
              {TABS.map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  style={{
                    padding: '10px 20px',
                    borderRadius: 18,
                    border: 'none',
                    background: activeTab === tab.key
                      ? 'linear-gradient(135deg, #0284c7, #0369a1)'
                      : 'transparent',
                    color: activeTab === tab.key ? 'white' : '#64748b',
                    fontWeight: 700,
                    fontSize: '0.87rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    transition: 'all 0.2s',
                    boxShadow: activeTab === tab.key ? '0 4px 12px rgba(2,132,199,0.25)' : 'none',
                    fontFamily: 'inherit',
                    whiteSpace: 'nowrap',
                  }}
                >
                  <i className={tab.icon} />
                  {tab.label}
                </button>
              ))}
            </div>

            {/* ── TAB: SERVICES ── */}
            {activeTab === 'services' && (
              <>
                <div className="pp-services-header">
                  <h2 className="pp-services-title">
                    Services proposés
                    <span className="pp-services-badge">{services.length}</span>
                  </h2>
                  {services.length > 3 && (
                    <div className="pp-search-wrap">
                      <i className="bi bi-search pp-search-icon" />
                      <input
                        type="text"
                        placeholder="Filtrer les services…"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="pp-search-input"
                      />
                    </div>
                  )}
                </div>

                <div className="pp-services-grid">
                  {filteredServices.length === 0 ? (
                    <div className="pp-empty">
                      <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>🔧</div>
                      <h4 style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 800, color: '#0c2340', marginBottom: 6 }}>
                        {search ? 'Aucun service correspondant' : 'Aucun service publié'}
                      </h4>
                      <p style={{ color: '#64748b', fontSize: '0.88rem' }}>
                        {search ? 'Essayez d\'autres mots-clés.' : 'Ce prestataire n\'a pas encore publié de service.'}
                      </p>
                    </div>
                  ) : filteredServices.map((s, idx) => (
                    <div
                      key={s.id}
                      className="pp-service-card"
                      style={{ animationDelay: `${idx * 0.05}s` }}
                    >
                      <div className="pp-svc-img">
                        {s.image_url
                          ? <img src={s.image_url} alt={s.nom} />
                          : (
                            <div className="pp-svc-img-placeholder">
                              <i className="bi bi-tools" />
                            </div>
                          )
                        }
                        {s.categorie?.nom && (
                          <span className="pp-svc-cat-badge">{s.categorie.nom}</span>
                        )}
                      </div>

                      <div className="pp-svc-body">
                        <h4 className="pp-svc-name">{s.nom}</h4>
                        <p className="pp-svc-desc">{s.description || 'Aucune description.'}</p>
                        <div className="pp-svc-meta">
                          <div className="pp-svc-price">
                            {s.prix ? (
                              <>{Number(s.prix).toLocaleString('fr-FR')} <span>FCFA</span></>
                            ) : (
                              <span style={{ color: '#0284c7', fontWeight: 800, fontSize: '0.88rem' }}>Sur devis</span>
                            )}
                          </div>
                          {s.note_moyenne ? (
                            <div className="pp-svc-rating">
                              <i className="bi bi-star-fill" />
                              {Number(s.note_moyenne).toFixed(1)}
                            </div>
                          ) : null}
                        </div>
                      </div>

                      <div className="pp-svc-footer">
                        <Link to={`/reserver/${s.id}`} className="pp-btn-reserver">
                          <i className="bi bi-calendar-plus" /> Réserver ce service
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* ── TAB: PORTFOLIO ── */}
            {activeTab === 'portfolio' && (
              <div style={{ animation: 'pp-up 0.4s cubic-bezier(0.22,1,0.36,1) both' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
                  {(!prestataire.portfolio || prestataire.portfolio.length === 0) ? (
                    <div className="pp-empty" style={{ gridColumn: '1 / -1', padding: '40px 20px', textAlign: 'center', background: 'white', borderRadius: 24, border: '1px solid #e2e8f0' }}>
                      <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>📷</div>
                      <h4 style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 800, color: '#0c2340', marginBottom: 6 }}>Aucune réalisation</h4>
                      <p style={{ color: '#64748b', fontSize: '0.88rem' }}>Ce prestataire n'a pas encore ajouté de photos à son portfolio.</p>
                    </div>
                  ) : prestataire.portfolio.map((item, idx) => (
                    <div key={item.id} style={{ background: 'white', borderRadius: 20, border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 4px 16px rgba(12,35,64,0.04)', display: 'flex', flexDirection: 'column' }}>
                      <div style={{ width: '100%', height: 160, overflow: 'hidden', background: '#f8fafc' }}>
                        <img src={item.image_url} alt={item.description} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                      {item.description && (
                        <div style={{ padding: '12px 14px', fontSize: '0.82rem', color: '#475569', fontWeight: 600, borderTop: '1px solid #f1f5f9' }}>
                          {item.description}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── TAB: AVIS ── */}
            {activeTab === 'avis' && (
              <div className="pp-reviews-section">
                {noteGlobale && (
                  <div style={{ background: 'white', borderRadius: 20, border: '1px solid #e2e8f0', padding: '20px 24px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap', boxShadow: '0 4px 16px rgba(12,35,64,0.05)' }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 800, fontSize: '3rem', color: '#0c2340', lineHeight: 1 }}>{noteGlobale}</div>
                      <div style={{ color: '#f59e0b', fontSize: '1.1rem', margin: '4px 0' }}>{'★'.repeat(Math.round(noteGlobale))}</div>
                      <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600 }}>{avis.length} avis</div>
                    </div>
                    <div style={{ flex: 1, minWidth: 160 }}>
                      {[5, 4, 3, 2, 1].map(n => {
                        const count = avis.filter(a => Math.round(a.note) === n).length;
                        const pct = avis.length ? (count / avis.length) * 100 : 0;
                        return (
                          <div key={n} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 5 }}>
                            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', width: 16, textAlign: 'right' }}>{n}</span>
                            <i className="bi bi-star-fill" style={{ fontSize: '0.7rem', color: '#f59e0b' }} />
                            <div style={{ flex: 1, height: 8, background: '#f1f5f9', borderRadius: 4, overflow: 'hidden' }}>
                              <div style={{ width: `${pct}%`, height: '100%', background: '#f59e0b', borderRadius: 4, transition: 'width 0.6s ease' }} />
                            </div>
                            <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 600, width: 20 }}>{count}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {avis.length === 0 ? (
                    <div className="pp-empty" style={{ gridColumn: 'unset' }}>
                      <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>⭐</div>
                      <h4 style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 800, color: '#0c2340', marginBottom: 6 }}>Aucun avis pour l'instant</h4>
                      <p style={{ color: '#64748b', fontSize: '0.88rem' }}>Soyez le premier à donner votre avis après votre réservation.</p>
                    </div>
                  ) : avis.map((a, idx) => (
                    <div
                      key={a.id}
                      className="pp-review-card"
                      style={{ animationDelay: `${idx * 0.04}s`, animation: 'pp-up 0.4s cubic-bezier(0.22,1,0.36,1) both' }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                        <div style={{ width: 40, height: 40, borderRadius: 12, background: 'linear-gradient(135deg,#0284c7,#4f46e5)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, fontSize: '0.9rem', flexShrink: 0 }}>
                          {a.client?.username?.[0]?.toUpperCase() || 'C'}
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#0c2340' }}>{a.client?.username || 'Client'}</div>
                          <div className="pp-review-stars">{'★'.repeat(a.note || 0)}{'☆'.repeat(5 - (a.note || 0))}</div>
                        </div>
                        <span style={{ marginLeft: 'auto', fontSize: '0.72rem', color: '#94a3b8' }}>
                          {new Date(a.created_at || a.date_creation).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </span>
                      </div>
                      {a.commentaire && <p className="pp-review-text">{a.commentaire}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── TAB: INFOS ── */}
            {activeTab === 'infos' && (
              <div style={{ animation: 'pp-up 0.4s cubic-bezier(0.22,1,0.36,1) both' }}>
                <div className="pp-bio-card">
                  <h3><i className="bi bi-person-lines-fill" style={{ color: '#0284c7' }} /> À propos</h3>
                  <p className="pp-bio-text">
                    {prestataire.bio || "Ce prestataire n'a pas encore rédigé de présentation."}
                  </p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16 }}>
                  {[
                    { icon: 'bi-tools', label: 'Spécialité', value: prestataire.specialite || 'Non renseignée' },
                    { icon: 'bi-telephone', label: 'Téléphone', value: prestataire.telephone || 'Non renseigné' },
                    { icon: 'bi-geo-alt', label: 'Ville', value: prestataire.ville || 'Non renseignée' },
                    { icon: 'bi-calendar3', label: 'Membre depuis', value: prestataire.user?.date_joined ? new Date(prestataire.user.date_joined).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }) : 'N/A' },
                    { icon: 'bi-star-fill', label: 'Note globale', value: noteGlobale ? `${noteGlobale}/5` : 'Pas encore noté' },
                    { icon: 'bi-grid-3x3-gap', label: 'Services publiés', value: services.length },
                  ].map((item, i) => (
                    <div key={i} style={{ background: 'white', borderRadius: 16, border: '1px solid #e2e8f0', padding: '16px 18px', display: 'flex', gap: 12, alignItems: 'center' }}>
                      <div style={{ width: 40, height: 40, borderRadius: 10, background: '#e0f2fe', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0284c7', fontSize: '1rem', flexShrink: 0 }}>
                        <i className={item.icon} />
                      </div>
                      <div>
                        <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 2 }}>{item.label}</div>
                        <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#0c2340' }}>{item.value}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>
      </div>

      {/* TOAST MESSAGE */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          background: '#0c2340',
          color: 'white',
          padding: '12px 24px',
          borderRadius: 12,
          boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
          fontWeight: 700,
          fontSize: '0.85rem',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          animation: 'pp-up 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) both'
        }}>
          <i className="bi bi-info-circle-fill" style={{ color: '#0284c7' }} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* REPORT MODAL */}
      {showReportModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(12, 35, 64, 0.4)',
          backdropFilter: 'blur(8px)',
          zIndex: 999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 20
        }} onClick={() => setShowReportModal(false)}>
          <div style={{
            background: 'white',
            borderRadius: 24,
            width: '100%',
            maxWidth: 460,
            boxShadow: '0 25px 50px -12px rgba(12, 35, 64, 0.25)',
            border: '1px solid rgba(255,255,255,0.8)',
            overflow: 'hidden'
          }} onClick={e => e.stopPropagation()}>
            
            <div style={{ padding: '20px 24px', borderBottom: '1.5px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h5 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: '1.15rem', color: '#0c2340', margin: 0 }}>
                Signaler ce prestataire
              </h5>
              <button style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748b', fontSize: '1.1rem' }} onClick={() => setShowReportModal(false)}>×</button>
            </div>

            <form onSubmit={handleReport}>
              <div style={{ padding: 24 }}>
                <p style={{ fontSize: '0.88rem', color: '#475569', margin: '0 0 20px' }}>
                  Votre signalement sera directement transmis à l'équipe de modération de Service Market pour vérification.
                </p>

                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: 6 }}>
                    Motif du signalement
                  </label>
                  <select
                    value={reportMotif}
                    onChange={e => setReportMotif(e.target.value)}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1.5px solid #cbd5e1', fontSize: '0.9rem', outline: 'none', background: 'white' }}
                  >
                    <option value="Qualité de service décevante">Qualité de service décevante</option>
                    <option value="Comportement inapproprié">Comportement inapproprié</option>
                    <option value="Prix non conforme">Prix non conforme</option>
                    <option value="Arnaque ou fraude">Arnaque ou fraude</option>
                    <option value="Autre">Autre</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: 6 }}>
                    Justification / Détails
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Veuillez décrire précisément les faits et ajouter toute précision utile..."
                    value={reportJustification}
                    onChange={e => setReportJustification(e.target.value)}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1.5px solid #cbd5e1', fontSize: '0.9rem', outline: 'none', resize: 'vertical' }}
                    required
                  />
                </div>
              </div>

              <div style={{ padding: '16px 24px', background: '#f8fafc', borderTop: '1.5px solid #f1f5f9', display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                <button type="button" style={{ padding: '10px 18px', borderRadius: 10, border: '1.5px solid #cbd5e1', background: 'white', color: '#475569', fontWeight: 700, fontSize: '0.84rem', cursor: 'pointer' }} onClick={() => setShowReportModal(false)} disabled={submittingReport}>
                  Annuler
                </button>
                <button 
                  type="submit" 
                  disabled={submittingReport || !reportJustification.trim()}
                  style={{
                    padding: '10px 18px',
                    borderRadius: 10,
                    border: 'none',
                    background: '#ef4444',
                    color: 'white',
                    fontWeight: 700,
                    fontSize: '0.84rem',
                    cursor: 'pointer',
                    opacity: (submittingReport || !reportJustification.trim()) ? 0.5 : 1
                  }}
                >
                  {submittingReport ? 'Envoi...' : 'Envoyer le signalement'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}
    </>
  );
}
