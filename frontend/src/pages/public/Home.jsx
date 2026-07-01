import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';

const ANIM = `
@keyframes fadeUp  { from{opacity:0;transform:translateY(30px)} to{opacity:1;transform:translateY(0)} }
@keyframes float   { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
@keyframes pulse2  { 0%,100%{opacity:1} 50%{opacity:.6} }
@keyframes shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
.hcat { transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1); }
.hcat:hover { transform: translateY(-8px); box-shadow: 0 20px 35px rgba(2, 132, 199, 0.18) !important; border-color: #38bdf8 !important; }
@keyframes bounceIcon {
  0%, 100% { transform: translateY(0) scale(1); }
  50% { transform: translateY(-6px) scale(1.18) rotate(8deg); }
}
.hcat:hover i {
  display: inline-block;
  animation: bounceIcon 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) both;
}
@keyframes pulseGlow {
  0% { box-shadow: 0 0 0 0 rgba(2, 132, 199, 0.45); }
  70% { box-shadow: 0 0 0 15px rgba(2, 132, 199, 0); }
  100% { box-shadow: 0 0 0 0 rgba(2, 132, 199, 0); }
}
.btn-primary-custom {
  animation: pulseGlow 2.5s infinite;
}
@keyframes shine {
  100% { left: 125%; }
}
.hsvc {
  position: relative;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}
.hsvc::after {
  content: '';
  position: absolute;
  top: 0; left: -75%;
  width: 50%; height: 100%;
  background: linear-gradient(to right, rgba(255,255,255,0) 0%, rgba(255,255,255,0.3) 100%);
  transform: skewX(-25deg);
  transition: none;
}
.hsvc:hover::after {
  animation: shine 0.8s ease-in-out;
}
.hsvc:hover { transform: translateY(-6px); box-shadow: 0 20px 40px rgba(2, 132, 199, 0.15) !important; border-color: #7dd3fc !important; }
.hcta-link { transition: all 0.2s ease; }
.hcta-link:hover { transform: translateY(-2px); box-shadow: 0 10px 25px rgba(2, 132, 199, 0.3) !important; }
.skeleton { background: linear-gradient(90deg, #e0f2fe 25%, #bae6fd 50%, #e0f2fe 75%); background-size: 200% 100%; animation: shimmer 1.4s infinite; border-radius: 12px; }

/* Styles pour le FAQ */
.faq-item { border-bottom: 1.5px solid #e2e8f0; padding: 18px 0; cursor: pointer; transition: all 0.2s; }
.faq-question { display: flex; justify-content: space-between; align-items: center; font-weight: 700; color: #0c2340; font-size: 1.05rem; }
.faq-answer { max-height: 0; overflow: hidden; transition: max-height 0.3s ease, margin-top 0.3s ease; color: #64748b; font-size: 0.92rem; line-height: 1.6; }
.faq-answer.open { max-height: 150px; margin-top: 10px; }
.faq-icon { transition: transform 0.3s; color: #0284c7; font-size: 1.1rem; }
.faq-icon.open { transform: rotate(180deg); }

/* Hero section adjustments */
.hero-section { transition: padding 0.3s; }
@media (max-width: 991px) {
  .hero-right-visual { display: none !important; }
}
@media (max-width: 768px) {
  .hero-section { padding: 48px 0 56px !important; }
  .hero-stats { display: none !important; }
}

/* Category adjustments */
.home-cats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 18px;
}
.hcat-icon-box {
  margin: 0 auto 16px;
  width: 62px;
  height: 62px;
  border-radius: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
}
.hcat-icon-box i {
  font-size: 1.75rem;
}
.hcat-label {
  font-weight: 800;
  color: #0c2340;
  font-size: 0.92rem;
}
@media (max-width: 576px) {
  .home-cats-grid {
    grid-template-columns: repeat(3, 1fr) !important;
    gap: 8px !important;
  }
  .hcat {
    padding: 12px 6px !important;
    border-radius: 14px !important;
  }
  .hcat-icon-box {
    width: 44px !important;
    height: 44px !important;
    border-radius: 12px !important;
    margin-bottom: 8px !important;
  }
  .hcat-icon-box i {
    font-size: 1.2rem !important;
  }
  .hcat-label {
    font-size: 0.72rem !important;
  }
}

/* Comment ça marche adjustments */
.how-it-works-section { transition: padding 0.3s; }
.how-step-icon { transition: all 0.3s; }
.how-step-num { transition: all 0.3s; }
@media (max-width: 768px) {
  .how-it-works-section { padding: 48px 0 !important; }
  .how-step-card { padding: 12px 10px !important; }
  .how-step-icon { width: 62px !important; height: 62px !important; }
  .how-step-icon i { font-size: 1.5rem !important; }
  .how-step-num { width: 22px !important; height: 22px !important; font-size: 0.65rem !important; }
  .how-step-title { font-size: 1rem !important; }
  .how-step-desc { font-size: 0.8rem !important; }
}

.pro-service-card { transition: all 0.25s cubic-bezier(0.25, 0.8, 0.25, 1); }
.pro-service-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 35px rgba(2,132,199,0.35) !important;
  background: #111e3b !important;
}
.pro-slider-track::-webkit-scrollbar { display: none; }
`;

const CATS = [
  { label: 'Plomberie', icon: 'droplet-fill', color: '#0ea5e9', bg: '#e0f9ff' },
  { label: 'Électricité', icon: 'lightning-charge-fill', color: '#f59e0b', bg: '#fef3c7' },
  { label: 'Ménage', icon: 'house-fill', color: '#10b981', bg: '#d1fae5' },
  { label: 'Jardinage', icon: 'flower1', color: '#ec4899', bg: '#fce7f3' },
  { label: 'Peinture', icon: 'palette-fill', color: '#8b5cf6', bg: '#ede9fe' },
  { label: 'Déménagement', icon: 'truck', color: '#6366f1', bg: '#e0e7ff' },
];

const STEPS = [
  { n: '01', icon: 'search', color: '#0284c7', bg: '#e0f2fe', title: 'Recherchez', desc: "Parcourez notre catalogue ou localisez un atelier près de chez vous en quelques secondes." },
  { n: '02', icon: 'calendar-check', color: '#10b981', bg: '#d1fae5', title: 'Réservez', desc: "Choisissez le créneau de votre choix, échangez en direct et validez la commande." },
  { n: '03', icon: 'credit-card', color: '#8b5cf6', bg: '#ede9fe', title: 'Payez & Profitez', desc: "Payez en toute sécurité via T-money ou Flooz. Laissez une note après le service." },
];

const TESTIMONIALS = [
  { name: 'Koffi Mensah', role: 'Client (Lomé)', text: "J'ai trouvé un électricien certifié en moins de 15 minutes pour dépanner mon compteur. Service client réactif et prestataire très professionnel !", rating: 5, avatar: 'KM' },
  { name: 'Abla Lawson', role: 'Prestataire Coiffure (Kara)', text: "Depuis que j'ai inscrit mon salon de coiffure sur Service Market, mon carnet de rendez-vous est toujours plein. L'application est vraiment simple à utiliser.", rating: 5, avatar: 'AL' },
  { name: 'Folly Amegan', role: 'Client (Kpalimé)', text: "Très pratique pour trouver des artisans de confiance au Togo. Le système de géolocalisation sur carte m'a permis de trouver un plombier juste dans mon quartier.", rating: 4, avatar: 'FA' }
];

const FAQS = [
  { q: "Comment fonctionne la réservation ?", a: "C'est simple ! Recherchez le service souhaité, choisissez un prestataire, sélectionnez la date de rendez-vous, puis effectuez le paiement en ligne sécurisé par Flooz ou T-Money." },
  { q: "Les prestataires sont-ils vérifiés ?", a: "Oui, tous les profils de nos prestataires passent par une vérification administrative stricte. Nous exigeons une pièce d'identité valide et vérifions leurs compétences et avis précédents." },
  { q: "Quels sont les moyens de paiement acceptés ?", a: "Nous acceptons les paiements mobiles locaux largement utilisés au Togo, notamment T-Money (TMix) et Moov Money (Flooz)." },
  { q: "Que faire en cas de problème avec une prestation ?", a: "Notre service client est à votre disposition 24/7. Vous pouvez le contacter via le chatbot intégré ou directement par e-mail/téléphone pour signaler tout incident et réclamer un remboursement." }
];

const getInitials = (name) => {
  if (!name) return 'C';
  const clean = name.trim();
  const parts = clean.split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return clean.substring(0, 2).toUpperCase();
};

export default function Home() {
  const [services, setServices] = useState([]);
  const [allServices, setAllServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openFaq, setOpenFaq] = useState(null);
  const [testimonials, setTestimonials] = useState(TESTIMONIALS);
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  const proServices = useMemo(() => {
    return allServices.filter(s => 
      s.prestataire && 
      (s.prestataire.type_abonnement === 'pro' || s.prestataire.type_abonnement === 'prestige')
    );
  }, [allServices]);

  useEffect(() => {
    if (testimonials.length <= 1) return;
    const timer = setInterval(() => {
      setActiveTestimonial(prev => (prev + 1) % testimonials.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [testimonials.length]);

  useEffect(() => {
    api.get('/services/')
      .then(r => {
        setAllServices(r.data);
        setServices(r.data.slice(0, 6));
      })
      .catch(console.error)
      .finally(() => setLoading(false));

    api.get('/evaluations/')
      .then(r => {
        if (r.data && r.data.length > 0) {
          const mapped = r.data.map(evalItem => ({
            name: evalItem.client || 'Client anonyme',
            role: evalItem.service_nom ? `Client (${evalItem.service_nom})` : 'Client',
            text: evalItem.commentaire || 'Aucun commentaire laissé.',
            rating: evalItem.note || 5,
            avatar: getInitials(evalItem.client || 'Client anonyme')
          }));
          
          if (mapped.length < 3) {
            const combined = [...mapped, ...TESTIMONIALS.slice(mapped.length)];
            setTestimonials(combined);
          } else {
            setTestimonials(mapped.slice(0, 6));
          }
        }
      })
      .catch(console.error);
  }, []);

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <>
      <style>{ANIM}</style>

      {/* ── HERO SECTION (CONCEPTION PREMIUM 2 COLONNES) ── */}
      <section className="hero-section" style={{ 
        background: 'linear-gradient(135deg, #0c2340 0%, #0a3060 55%, #0284c7 100%)', 
        padding: 'clamp(50px, 8vw, 100px) 0', 
        position: 'relative', 
        overflow: 'hidden' 
      }}>
        {/* Cercles de fond luminescents */}
        <div style={{ position: 'absolute', top: -150, right: -150, width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(2,132,199,0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -100, left: -100, width: 450, height: 450, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.05) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div className="container" style={{ position: 'relative', zIndex: 1, animation: 'fadeUp .7s cubic-bezier(0.22, 1, 0.36, 1)' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', margin: '0 -15px' }}>
            
            {/* Colonne gauche (Texte) */}
            <div style={{ flex: '0 0 100%', maxWidth: '100%', padding: '0 15px', marginBottom: 40 }} className="col-lg-6-custom">
              {/* Badge animé */}
              <div style={{ 
                display: 'inline-flex', 
                alignItems: 'center', 
                gap: 8, 
                background: 'rgba(255,255,255,0.1)', 
                border: '1px solid rgba(255,255,255,0.2)', 
                borderRadius: 50, 
                padding: '6px 16px', 
                marginBottom: 26, 
                backdropFilter: 'blur(10px)' 
              }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#4ade80', animation: 'pulse2 2s infinite', display: 'inline-block' }} />
                <span style={{ color: 'rgba(255,255,255,0.95)', fontSize: '0.82rem', fontWeight: 700, letterSpacing: '0.03em' }}>
                  Plateforme certifiée de services au Togo
                </span>
              </div>

              <h1 style={{ 
                color: '#fff', 
                fontWeight: 900, 
                fontSize: 'clamp(2.2rem, 5vw, 3.4rem)', 
                lineHeight: 1.15, 
                marginBottom: 22, 
                fontFamily: "'Plus Jakarta Sans', sans-serif" 
              }}>
                Trouvez le meilleur <span style={{ color: '#38bdf8', background: 'linear-gradient(to right, #38bdf8, #60a5fa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>prestataire</span> pour vos besoins quotidiens.
              </h1>
              
              <p style={{ 
                color: 'rgba(255, 255, 255, 0.8)', 
                marginBottom: 36, 
                fontSize: 'clamp(1rem, 2vw, 1.12rem)', 
                lineHeight: 1.7, 
                maxWidth: 560 
              }}>
                Ménage, plomberie, électricité, jardinage et bien plus encore. Commandes fiables, tarifs transparents et prestataires locaux vérifiés.
              </p>

              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                <Link to="/services" className="btn-primary-custom" style={{ 
                  padding: '14px 32px', 
                  borderRadius: 14, 
                  fontWeight: 800, 
                  fontSize: '0.98rem',
                  boxShadow: '0 8px 25px rgba(2, 132, 199, 0.3)'
                }}>
                  <i className="bi bi-search" style={{ marginRight: 6 }}></i> Voir les services
                </Link>
                <Link to="/ateliers" className="btn-outline-primary-custom" style={{ 
                  padding: '14px 32px', 
                  borderRadius: 14, 
                  fontWeight: 800, 
                  fontSize: '0.98rem',
                  color: '#fff', 
                  borderColor: 'rgba(255,255,255,0.4)',
                  background: 'rgba(255,255,255,0.05)',
                  backdropFilter: 'blur(5px)'
                }}>
                  <i className="bi bi-map" style={{ marginRight: 6 }}></i> Explorer la carte
                </Link>
              </div>

              {/* Statistiques clés */}
              <div className="hero-stats" style={{ display: 'flex', gap: 40, marginTop: 48, flexWrap: 'wrap', borderTop: '1px solid rgba(255,255,255,0.12)', paddingTop: 28 }}>
                {[['500+', 'Artisans Vérifiés'], ['2k+', 'Prestations Réalisées'], ['98.4%', 'Clients Satisfaits']].map(([n, l]) => (
                  <div key={l}>
                    <div style={{ color: '#fff', fontWeight: 900, fontSize: '1.9rem', lineHeight: 1.1 }}>{n}</div>
                    <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.82rem', fontWeight: 600, marginTop: 4 }}>{l}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Colonne droite (Visuel Hero) */}
            <div style={{ flex: '0 0 100%', maxWidth: '100%', padding: '0 15px' }} className="col-lg-6-custom hero-right-visual">
              <div style={{ position: 'relative', width: '100%', maxWidth: 480, margin: '0 auto', animation: 'float 6s ease-in-out infinite' }}>
                {/* Cadre de l'image principale */}
                <div style={{ 
                  borderRadius: 28, 
                  overflow: 'hidden', 
                  border: '6px solid rgba(255,255,255,0.1)', 
                  boxShadow: '0 30px 60px rgba(0,0,0,0.3)',
                  aspectRatio: '1/1',
                  background: '#0c2340'
                }}>
                  <img src="/hero_marketplace.jpg" alt="Prestataires Togo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>

                {/* Badge Flottant 1 (Avis) */}
                <div className="badge-floating-1" style={{ 
                  position: 'absolute', 
                  top: '15%', 
                  right: '-8%', 
                  background: 'rgba(12, 35, 64, 0.85)', 
                  border: '1.5px solid rgba(255,255,255,0.2)', 
                  borderRadius: 18, 
                  padding: '12px 18px', 
                  boxShadow: '0 15px 30px rgba(0,0,0,0.2)',
                  backdropFilter: 'blur(12px)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12
                }}>
                  <div style={{ background: '#fef08a', width: 38, height: 38, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem' }}>⭐</div>
                  <div>
                    <div style={{ color: '#fff', fontWeight: 800, fontSize: '0.88rem' }}>4.9/5 Général</div>
                    <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.72rem', fontWeight: 600 }}>Plus de 800 avis</div>
                  </div>
                </div>

                {/* Badge Flottant 2 (Sécurité) */}
                <div className="badge-floating-2" style={{ 
                  position: 'absolute', 
                  bottom: '12%', 
                  left: '-10%', 
                  background: 'rgba(255, 255, 255, 0.9)', 
                  border: '1.5px solid #bae6fd', 
                  borderRadius: 18, 
                  padding: '12px 18px', 
                  boxShadow: '0 15px 30px rgba(2,132,199,0.15)',
                  backdropFilter: 'blur(8px)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12
                }}>
                  <div style={{ background: '#d1fae5', width: 38, height: 38, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><i className="bi bi-shield-check" style={{ color: '#10b981', fontSize: '1.2rem' }}></i></div>
                  <div>
                    <div style={{ color: '#0c2340', fontWeight: 800, fontSize: '0.88rem' }}>Profils Vérifiés</div>
                    <div style={{ color: '#64748b', fontSize: '0.72rem', fontWeight: 600 }}>Identités 100% sûres</div>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>

        {/* Media Queries injectés dynamiquement pour la mise en page responsive */}
        <style>{`
          .col-lg-6-custom { flex: 0 0 100%; maxWidth: 100%; }
          @media (min-width: 992px) {
            .col-lg-6-custom { flex: 0 0 50% !important; maxWidth: 50% !important; }
          }
          @media (max-width: 768px) {
            .badge-floating-1 { right: 0px !important; top: 10% !important; transform: scale(0.9); transform-origin: right top; }
            .badge-floating-2 { left: 0px !important; bottom: 10% !important; transform: scale(0.9); transform-origin: left bottom; }
          }
          @media (max-width: 480px) {
            .badge-floating-1 { right: -6px !important; top: 8% !important; transform: scale(0.78); transform-origin: right top; }
            .badge-floating-2 { left: -6px !important; bottom: 8% !important; transform: scale(0.78); transform-origin: left bottom; }
          }

          .home-services-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
            gap: 24px;
          }
          .hsvc-img-box {
            height: 180px;
          }
          .hsvc-body {
            padding: 20px 22px;
            gap: 10px;
          }
          .hsvc-title {
            font-size: 1.05rem;
          }
          .hsvc-desc {
            display: block;
          }
          .hsvc-price {
            font-size: 1.12rem;
          }
          .hsvc-btn {
            padding: 10px 18px;
            font-size: 0.8rem;
            border-radius: 12px;
          }

          @media (max-width: 576px) {
            .home-services-grid {
              grid-template-columns: repeat(2, 1fr) !important;
              gap: 10px !important;
            }
            .hsvc-img-box {
              height: 110px !important;
            }
            .hsvc-body {
              padding: 10px 12px !important;
              gap: 6px !important;
            }
            .hsvc-title {
              font-size: 0.85rem !important;
            }
            .hsvc-desc {
              display: none !important;
            }
            .hsvc-price {
              font-size: 0.95rem !important;
            }
            .hsvc-btn {
              padding: 8px 10px !important;
              font-size: 0.72rem !important;
              border-radius: 8px !important;
            }
          }
        `}</style>
      </section>

      {/* ── SECTION PRO & PRESTIGE SERVICES (SHOWCASE) ── */}
      {proServices.length > 0 && (
        <section style={{ padding: '40px 0 50px', background: '#0c2340', color: '#fff', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: -50, left: '20%', width: 250, height: 250, borderRadius: '50%', background: 'radial-gradient(circle, rgba(2,132,199,0.2) 0%, transparent 70%)', pointerEvents: 'none' }} />
          
          <div className="container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28, flexWrap: 'wrap', gap: 16 }}>
              <div>
                <span style={{ display: 'inline-block', padding: '4px 14px', borderRadius: 20, background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)', color: '#38bdf8', fontSize: '0.72rem', fontWeight: 800, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '.08em' }}>
                  Sélection Premium
                </span>
                <h2 style={{ fontWeight: 900, fontSize: 'clamp(1.5rem, 3vw, 2.1rem)', color: '#fff', margin: 0, fontFamily: "'Outfit', sans-serif" }}>
                  Nos Prestataires Certifiés PRO
                </h2>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button 
                  onClick={() => {
                    const el = document.getElementById('pro-services-slider');
                    if (el) el.scrollBy({ left: -300, behavior: 'smooth' });
                  }}
                  style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,0.08)', border: 'none', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                >
                  <i className="bi bi-chevron-left" />
                </button>
                <button 
                  onClick={() => {
                    const el = document.getElementById('pro-services-slider');
                    if (el) el.scrollBy({ left: 300, behavior: 'smooth' });
                  }}
                  style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,0.08)', border: 'none', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                >
                  <i className="bi bi-chevron-right" />
                </button>
              </div>
            </div>

            <div 
              id="pro-services-slider"
              style={{
                display: 'flex',
                gap: 20,
                overflowX: 'auto',
                paddingBottom: 16,
                scrollbarWidth: 'none',
                msOverflowStyle: 'none'
              }}
              className="pro-slider-track"
            >
              {proServices.map(s => {
                const isPres = s.prestataire?.type_abonnement === 'prestige';
                const color = isPres ? '#fbbf24' : '#22c55e';
                const bgGrad = isPres 
                  ? 'linear-gradient(135deg, #fbbf24 0%, #d97706 100%)'
                  : 'linear-gradient(135deg, #22c55e 0%, #15803d 100%)';
                  
                return (
                  <Link 
                    key={s.id} 
                    to={`/services/${s.id}`} 
                    style={{ textDecoration: 'none', flexShrink: 0, width: 280 }}
                  >
                    <div 
                      style={{
                        background: '#0f172a',
                        borderRadius: 20,
                        border: `1.5px solid ${isPres ? 'rgba(251,191,36,0.3)' : 'rgba(34,197,94,0.3)'}`,
                        padding: 16,
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 12,
                        transition: 'all 0.25s',
                        boxShadow: `0 8px 24px rgba(0,0,0,0.2)`
                      }}
                      className="pro-service-card"
                    >
                      <div style={{ height: 140, borderRadius: 14, overflow: 'hidden', background: '#1e293b', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                        {s.image_url ? (
                          <img src={s.image_url} alt={s.nom} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <i className={`bi ${s.categorie?.icone || 'bi-briefcase'}`} style={{ fontSize: '2.5rem', color: '#64748b', opacity: 0.5 }} />
                        )}
                        <span style={{ position: 'absolute', top: 10, left: 10, background: bgGrad, color: 'white', padding: '3px 9px', borderRadius: 20, fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.02em', border: '1px solid rgba(255,255,255,0.2)' }}>
                          {isPres ? 'Prestige' : 'Pro'}
                        </span>
                      </div>

                      <div>
                        <h4 style={{ margin: '0 0 6px', fontWeight: 800, fontSize: '0.95rem', color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {s.nom}
                        </h4>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.78rem', color: '#94a3b8' }}>
                          <i className="bi bi-person-fill" style={{ color }} />
                          <span style={{ color: '#f8fafc' }}>{s.prestataire?.user?.first_name || s.prestataire?.user?.username}</span>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 12, marginTop: 'auto' }}>
                        <div>
                          <div style={{ fontSize: '0.62rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>À partir de</div>
                          <span style={{ fontWeight: 800, color: '#38bdf8', fontSize: '0.98rem' }}>
                            {parseFloat(s.prix).toLocaleString()} <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#64748b' }}>F</span>
                          </span>
                        </div>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color, display: 'inline-flex', alignItems: 'center', gap: 4, marginLeft: 'auto' }}>
                          Réserver <i className="bi bi-arrow-right" />
                        </span>
                      </div>

                    </div>
                  </Link>
                );
              })}
            </div>

          </div>
        </section>
      )}

      {/* ── CATÉGORIES ── */}
      <section style={{ padding: '80px 0', background: '#fff' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 54 }}>
            <span style={{ display: 'inline-block', padding: '4px 14px', borderRadius: 20, background: '#e0f2fe', color: '#0284c7', fontSize: '0.75rem', fontWeight: 800, marginBottom: 10, textTransform: 'uppercase', letterSpacing: '.08em' }}>Secteurs</span>
            <h2 style={{ fontWeight: 900, fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', color: '#0c2340', margin: 0, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Catégories les plus recherchées</h2>
            <p style={{ color: '#64748b', marginTop: 8, fontSize: '0.95rem' }}>Accédez directement à nos services qualifiés par catégorie</p>
          </div>
          
          <div className="home-cats-grid">
            {CATS.map((c, i) => (
              <Link key={c.label} to={`/services?q=${c.label.toLowerCase()}`} style={{ textDecoration: 'none' }}>
                <div className="hcat" style={{ animation: `fadeUp .5s ease ${i * 0.06}s both` }}>
                  <div className="hcat-icon-box" style={{ background: c.bg, boxShadow: `0 8px 20px ${c.color}20` }}>
                    <i className={`bi bi-${c.icon}`} style={{ color: c.color }} />
                  </div>
                  <span className="hcat-label">{c.label}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── SERVICES POPULAIRES ── */}
      <section style={{ padding: '80px 0', background: '#f8fafc' }}>
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 44, flexWrap: 'wrap', gap: 16 }}>
            <div>
              <span style={{ display: 'inline-block', padding: '4px 14px', borderRadius: 20, background: '#dbeafe', color: '#1d4ed8', fontSize: '0.75rem', fontWeight: 800, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '.08em' }}>Recommandations</span>
              <h2 style={{ fontWeight: 900, fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', color: '#0c2340', margin: 0, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Services les plus demandés</h2>
            </div>
            <Link to="/services" className="hcta-link" style={{ 
              padding: '11px 24px', 
              borderRadius: 14, 
              border: '2px solid #0284c7', 
              color: '#0284c7', 
              textDecoration: 'none', 
              fontWeight: 800, 
              fontSize: '0.9rem', 
              display: 'flex', 
              alignItems: 'center', 
              gap: 8, 
              background: '#fff',
              boxShadow: '0 4px 12px rgba(2,132,199,0.06)'
            }}>
              Voir tout le catalogue <i className="bi bi-arrow-right" />
            </Link>
          </div>

          {loading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 24 }}>
              {[...Array(6)].map((_, i) => (
                <div key={i} style={{ borderRadius: 22, overflow: 'hidden', background: '#fff' }}>
                  <div className="skeleton" style={{ height: 180 }} />
                  <div style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div className="skeleton" style={{ height: 14, width: '45%' }} />
                    <div className="skeleton" style={{ height: 20, width: '80%' }} />
                    <div className="skeleton" style={{ height: 14, width: '90%' }} />
                    <div className="skeleton" style={{ height: 38 }} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="home-services-grid">
              {services.map((s, i) => (
                <div key={s.id} className="hsvc" style={{ 
                  background: '#fff', 
                  borderRadius: 22, 
                  overflow: 'hidden', 
                  border: '1px solid #e2e8f0', 
                  boxShadow: '0 10px 25px rgba(2,132,199,0.04)', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  animation: `fadeUp .5s ease ${i * 0.08}s both` 
                }}>
                  {/* Image & Badge */}
                  <div className="hsvc-img-box" style={{ overflow: 'hidden', background: 'linear-gradient(135deg, #e0f2fe, #f0f9ff)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', flexShrink: 0 }}>
                    {s.image_url ? (
                      <img src={s.image_url} alt={s.nom} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <i className={`bi ${s.categorie?.icone || 'bi-briefcase'}`} style={{ fontSize: '3.6rem', color: '#0284c7', opacity: 0.35 }} />
                    )}
                    <div style={{ position: 'absolute', top: 12, left: 12, background: 'rgba(12, 35, 64, 0.85)', backdropFilter: 'blur(8px)', color: '#fff', padding: '4px 10px', borderRadius: 20, fontSize: '0.72rem', fontWeight: 800, border: '1px solid rgba(255,255,255,0.1)' }}>
                      {s.categorie?.nom || 'Général'}
                    </div>
                  </div>

                  {/* Détails du Service */}
                  <div className="hsvc-body" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <h5 className="hsvc-title" style={{ margin: 0, fontWeight: 800, color: '#0c2340', lineHeight: 1.35 }}>{s.nom}</h5>
                    <p className="hsvc-desc" style={{ margin: 0, color: '#64748b', fontSize: '0.85rem', lineHeight: 1.6, flex: 1 }}>
                      {s.description?.split(' ').slice(0, 16).join(' ')}{s.description?.split(' ').length > 16 ? '…' : ''}
                    </p>
                    
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1.5px solid #f1f5f9', paddingTop: 14, marginTop: 4 }}>
                      <div>
                        <div style={{ fontSize: '0.68rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>À partir de</div>
                        <span className="hsvc-price" style={{ fontWeight: 900, color: '#0284c7' }}>
                          {parseFloat(s.prix).toLocaleString()} <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b' }}>FCFA</span>
                        </span>
                      </div>
                      <Link to={`/services/${s.id}`} className="hsvc-btn" style={{ 
                        textDecoration: 'none', 
                        background: 'linear-gradient(135deg, #0c2340, #0284c7)', 
                        color: '#fff', 
                        fontWeight: 800, 
                        display: 'inline-flex', 
                        alignItems: 'center', 
                        gap: 6,
                        boxShadow: '0 4px 12px rgba(12,35,64,0.15)'
                      }}>
                        Réserver <i className="bi bi-arrow-right" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── COMMENT ÇA MARCHE ── */}
      <section className="how-it-works-section" style={{ padding: '80px 0', background: '#fff' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 54 }}>
            <span style={{ display: 'inline-block', padding: '4px 14px', borderRadius: 20, background: '#ede9fe', color: '#7c3aed', fontSize: '0.75rem', fontWeight: 800, marginBottom: 10, textTransform: 'uppercase', letterSpacing: '.08em' }}>Simplicité</span>
            <h2 style={{ fontWeight: 900, fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', color: '#0c2340', margin: 0, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Comment fonctionne Service Market ?</h2>
            <p style={{ color: '#64748b', marginTop: 8, fontSize: '0.95rem' }}>Une mise en relation rapide et sécurisée en 3 étapes</p>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 32 }}>
            {STEPS.map((step, i) => (
              <div key={step.title} className="how-step-card" style={{ textAlign: 'center', padding: '24px 16px', animation: `fadeUp .5s ease ${i * 0.12}s both` }}>
                <div style={{ position: 'relative', display: 'inline-block', marginBottom: 24 }}>
                  <div className="how-step-icon" style={{ width: 84, height: 84, borderRadius: '50%', background: step.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto', boxShadow: `0 8px 24px ${step.color}15` }}>
                    <i className={`bi bi-${step.icon}`} style={{ fontSize: '2.1rem', color: step.color }} />
                  </div>
                  <div className="how-step-num" style={{ position: 'absolute', top: -4, right: -4, width: 26, height: 26, borderRadius: '50%', background: step.color, color: '#fff', fontWeight: 900, fontSize: '0.72rem', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 4px 12px ${step.color}44` }}>
                    {step.n}
                  </div>
                </div>
                <h4 className="how-step-title" style={{ fontWeight: 800, color: '#0c2340', marginBottom: 10, fontSize: '1.15rem' }}>{step.title}</h4>
                <p className="how-step-desc" style={{ color: '#64748b', lineHeight: 1.7, fontSize: '0.9rem', margin: 0 }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── NOUVELLE SECTION : TEMOIGNAGES CLIENTS (CARROUSEL DYNAMIQUE) ── */}
      <section style={{ padding: '80px 0', background: '#f8fafc', borderTop: '1px solid #e2e8f0' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <span style={{ display: 'inline-block', padding: '4px 14px', borderRadius: 20, background: '#fdf2f8', color: '#db2777', fontSize: '0.75rem', fontWeight: 800, marginBottom: 10, textTransform: 'uppercase', letterSpacing: '.08em' }}>Confiance</span>
            <h2 style={{ fontWeight: 900, fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', color: '#0c2340', margin: 0, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Ce que disent nos utilisateurs</h2>
            <p style={{ color: '#64748b', marginTop: 8, fontSize: '0.95rem' }}>Découvrez l'avis des clients et artisans qui utilisent notre plateforme au Togo</p>
          </div>

          <div style={{ maxWidth: 680, margin: '0 auto', position: 'relative', padding: '0 44px' }}>
            {testimonials.length > 0 && (
              <div key={activeTestimonial} style={{ 
                background: '#fff', 
                borderRadius: 24, 
                padding: '36px 32px', 
                boxShadow: '0 12px 35px rgba(2, 132, 199, 0.06)',
                border: '1.5px solid #e2e8f0',
                display: 'flex',
                flexDirection: 'column',
                gap: 20,
                minHeight: 220,
                animation: 'fadeUp 0.4s ease both'
              }}>
                <div style={{ display: 'flex', gap: 3, justifyContent: 'center' }}>
                  {[...Array(5)].map((_, starIdx) => (
                    <i key={starIdx} className="bi bi-star-fill" style={{ color: starIdx < testimonials[activeTestimonial]?.rating ? '#f59e0b' : '#cbd5e1', fontSize: '1.05rem' }} />
                  ))}
                </div>
                
                <p style={{ color: '#334155', fontSize: '1.05rem', lineHeight: 1.7, flex: 1, margin: 0, fontStyle: 'italic', textAlign: 'center' }}>
                  "{testimonials[activeTestimonial]?.text}"
                </p>

                <div style={{ display: 'flex', alignItems: 'center', gap: 14, borderTop: '1px solid #f1f5f9', paddingTop: 18, justifyContent: 'center' }}>
                  <div style={{ 
                    width: 46, 
                    height: 46, 
                    borderRadius: '50%', 
                    background: 'linear-gradient(135deg, #0284c7, #0369a1)', 
                    color: '#fff', 
                    fontWeight: 800, 
                    fontSize: '0.92rem', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    boxShadow: '0 4px 10px rgba(2,132,199,0.2)'
                  }}>
                    {testimonials[activeTestimonial]?.avatar}
                  </div>
                  <div style={{ textAlign: 'left' }}>
                    <h5 style={{ margin: 0, fontWeight: 800, color: '#0c2340', fontSize: '0.95rem' }}>{testimonials[activeTestimonial]?.name}</h5>
                    <span style={{ color: '#94a3b8', fontSize: '0.78rem', fontWeight: 600 }}>{testimonials[activeTestimonial]?.role}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Arrows */}
            <button 
              onClick={() => setActiveTestimonial(prev => (prev - 1 + testimonials.length) % testimonials.length)}
              style={{
                position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)',
                width: 40, height: 40, borderRadius: '50%', background: '#fff', border: '1.5px solid #e2e8f0',
                display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                boxShadow: '0 4px 10px rgba(0,0,0,0.05)', color: '#64748b', fontSize: '1.1rem', transition: 'all 0.2s',
              }}
              onMouseOver={e => e.currentTarget.style.color = '#0284c7'}
              onMouseOut={e => e.currentTarget.style.color = '#64748b'}
            >
              <i className="bi bi-chevron-left" />
            </button>
            <button 
              onClick={() => setActiveTestimonial(prev => (prev + 1) % testimonials.length)}
              style={{
                position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)',
                width: 40, height: 40, borderRadius: '50%', background: '#fff', border: '1.5px solid #e2e8f0',
                display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                boxShadow: '0 4px 10px rgba(0,0,0,0.05)', color: '#64748b', fontSize: '1.1rem', transition: 'all 0.2s',
              }}
              onMouseOver={e => e.currentTarget.style.color = '#0284c7'}
              onMouseOut={e => e.currentTarget.style.color = '#64748b'}
            >
              <i className="bi bi-chevron-right" />
            </button>

            {/* Dots */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 20 }}>
              {testimonials.map((_, dotIdx) => (
                <button
                  key={dotIdx}
                  onClick={() => setActiveTestimonial(dotIdx)}
                  style={{
                    width: activeTestimonial === dotIdx ? 24 : 8,
                    height: 8,
                    borderRadius: 4,
                    background: activeTestimonial === dotIdx ? '#0284c7' : '#cbd5e1',
                    border: 'none',
                    padding: 0,
                    cursor: 'pointer',
                    transition: 'all 0.3s'
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── NOUVELLE SECTION : FAQ ACCORDEON INTERACTIVE (REMPLIT L'ESPACE VIDE) ── */}
      <section style={{ padding: '80px 0', background: '#fff' }}>
        <div className="container" style={{ maxWidth: 760 }}>
          <div style={{ textAlign: 'center', marginBottom: 44 }}>
            <span style={{ display: 'inline-block', padding: '4px 14px', borderRadius: 20, background: '#ecfdf5', color: '#059669', fontSize: '0.75rem', fontWeight: 800, marginBottom: 10, textTransform: 'uppercase', letterSpacing: '.08em' }}>Questions</span>
            <h2 style={{ fontWeight: 900, fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', color: '#0c2340', margin: 0, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Foire aux Questions</h2>
            <p style={{ color: '#64748b', marginTop: 8, fontSize: '0.95rem' }}>Tout ce que vous devez savoir pour démarrer</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {FAQS.map((faq, idx) => (
              <div key={idx} className="faq-item" onClick={() => toggleFaq(idx)}>
                <div className="faq-question">
                  <span>{faq.q}</span>
                  <i className={`bi bi-chevron-down faq-icon ${openFaq === idx ? 'open' : ''}`} />
                </div>
                <div className={`faq-answer ${openFaq === idx ? 'open' : ''}`}>
                  {faq.a}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA PRESTATAIRE BANNER (REFAIT HAUT DE GAMME) ── */}
      <section style={{ 
        background: 'linear-gradient(135deg, #0c2340 0%, #0284c7 100%)', 
        padding: '80px 0', 
        position: 'relative', 
        overflow: 'hidden' 
      }}>
        {/* Bulle de fond */}
        <div style={{ position: 'absolute', bottom: -100, right: -100, width: 400, height: 400, borderRadius: '50%', background: 'rgba(255,255,255,0.06)', pointerEvents: 'none' }} />
        
        <div className="container" style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <div style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: 8, 
            background: 'rgba(255,255,255,0.12)', 
            border: '1px solid rgba(255,255,255,0.2)', 
            borderRadius: 50, 
            padding: '6px 16px', 
            marginBottom: 24 
          }}>
            <i className="bi bi-briefcase" style={{ color: '#7dd3fc', fontSize: '0.9rem' }} />
            <span style={{ color: '#fff', fontSize: '0.82rem', fontWeight: 700, letterSpacing: '0.02em' }}>Développez votre activité</span>
          </div>

          <h2 style={{ 
            color: '#fff', 
            fontWeight: 900, 
            fontSize: 'clamp(1.6rem, 4vw, 2.5rem)', 
            lineHeight: 1.25, 
            marginBottom: 16, 
            maxWidth: 700, 
            margin: '0 auto 16px' 
          }}>
            Vous proposez des services au Togo ? Rejoignez l'aventure !
          </h2>
          
          <p style={{ 
            color: 'rgba(255,255,255,0.8)', 
            marginBottom: 40, 
            fontSize: '1.05rem', 
            maxWidth: 580, 
            margin: '0 auto 40px',
            lineHeight: 1.6
          }}>
            Inscrivez-vous gratuitement, trouvez de nouveaux clients à Lomé, Kara ou Kpalimé, et augmentez vos revenus simplement.
          </p>

          <Link to="/inscription-prestataire" className="hcta-link" style={{ 
            background: '#fff', 
            color: '#0c2340', 
            padding: '16px 36px', 
            borderRadius: 16, 
            fontWeight: 900, 
            textDecoration: 'none', 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: 10, 
            fontSize: '1rem', 
            boxShadow: '0 10px 30px rgba(0,0,0,0.2)' 
          }}>
            <i className="bi bi-person-plus-fill" /> Créer mon profil prestataire
          </Link>
        </div>
      </section>
    </>
  );
}
