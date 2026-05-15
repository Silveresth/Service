import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';

const CATEGORIES = [
  { label: 'Plomberie', icon: 'droplet-fill', color: '#0ea5e9', q: 'plomberie' },
  { label: 'Électricité', icon: 'lightning-charge-fill', color: '#f59e0b', q: 'electricite' },
  { label: 'Ménage', icon: 'house-fill', color: '#10b981', q: 'menage' },
  { label: 'Jardinage', icon: 'flower1', color: '#ec4899', q: 'jardinage' },
  { label: 'Peinture', icon: 'palette-fill', color: '#8b5cf6', q: 'peinture' },
  { label: 'Déménagement', icon: 'truck', color: '#6366f1', q: 'deplacement' },
];

export default function Home() {
  const [services, setServices] = useState([]);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/services/').then(res => setServices(res.data.slice(0, 6))).catch(console.error);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/services${search ? `?q=${search}` : ''}`);
  };

  return (
    <>
      {/* ── Hero ── */}
      <section className="hero-section" style={{
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
        padding: '80px 0 100px', position: 'relative', overflow: 'hidden'
      }}>
        <div style={{ position: 'absolute', top: -80, right: -80, width: 400, height: 400, borderRadius: '50%', background: 'rgba(0,168,89,0.08)', pointerEvents: 'none' }}></div>
        <div style={{ position: 'absolute', bottom: -120, left: -60, width: 300, height: 300, borderRadius: '50%', background: 'rgba(0,168,89,0.06)', pointerEvents: 'none' }}></div>

        <div className="container" style={{ position: 'relative' }}>
          <div className="row" style={{ alignItems: 'center' }}>
            <div className="col-lg-8 col-12" style={{ padding: '0 12px' }}>
              <h1 className="hero-title" style={{ color: 'white', fontWeight: 800, lineHeight: 1.2, marginBottom: 20 }}>
                Trouvez le meilleur prestataire pour vos services
              </h1>
              <p className="hero-subtitle" style={{ color: 'rgba(255,255,255,0.7)', marginBottom: 32 }}>
                Des professionnels qualifiés près de chez vous. Qualité garantie, paiement sécurisé.
              </p>

              {/* Search */}
              <form onSubmit={handleSearch} className="hero-search">
                <input
                  type="text" value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="Rechercher un service (plomberie, électricité, ménage...)"
                  style={{ flex: 1, padding: '16px 20px', border: 'none', outline: 'none', fontSize: '1rem', fontFamily: 'inherit' }}
                />
                <button type="submit" className="hero-search-btn">
                  <i className="bi bi-search d-sm-none"></i>
                  <span className="d-none d-sm-inline">Rechercher</span>
                </button>
              </form>

              {/* Stats */}
              <div className="hero-stats">
                {[['500+', 'Prestataires'], ['1000+', 'Services'], ['98%', 'Satisfaction']].map(([num, label]) => (
                  <div key={label}>
                    <span style={{ color: 'white', fontWeight: 800, fontSize: '1.3rem' }}>{num}</span>
                    <span style={{ color: 'rgba(255,255,255,0.5)', marginLeft: 6 }}>{label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="col-lg-4 hide-mobile" style={{ padding: '0 12px', textAlign: 'right' }}>
              <i className="bi bi-briefcase-fill" style={{ fontSize: '14rem', color: 'rgba(255,255,255,0.07)' }}></i>
            </div>
          </div>
        </div>
      </section>

      {/* ── Categories ── */}
      <section className="py-5">
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <h2 style={{ fontWeight: 800 }}><i className="bi bi-grid-3x3-gap text-primary me-2"></i>Catégories populaires</h2>
            <p className="text-muted">Choisissez parmi nos catégories de services</p>
          </div>
<div className="home-cat-grid" style={{ display: 'flex', flexWrap: 'wrap', gap: 0, margin: '0 -12px' }}>
            {CATEGORIES.map(cat => (
              <div key={cat.q} style={{ padding: '0 12px 24px' }}>
                <Link to={`/services?q=${cat.q}`} style={{ textDecoration: 'none' }}>
                  <div className="card-custom" style={{ textAlign: 'center', padding: '28px 16px', cursor: 'pointer' }}>
                    <div style={{
                      margin: '0 auto 14px', width: 56, height: 56, borderRadius: 14,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: `linear-gradient(135deg, ${cat.color}22, ${cat.color}44)`,
                      border: `2px solid ${cat.color}33`
                    }}>
                      <i className={`bi bi-${cat.icon}`} style={{ fontSize: '1.5rem', color: cat.color }}></i>
                    </div>
                    <h6 style={{ fontWeight: 700, color: 'var(--text-dark)', margin: 0 }}>{cat.label}</h6>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Popular Services ── */}
      <section className="py-5" style={{ background: '#f8fafb' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <h2 style={{ fontWeight: 800 }}><i className="bi bi-star text-primary me-2"></i>Services populaires</h2>
            <p className="text-muted">Découvrez nos services les plus demandés</p>
          </div>
          {services.length > 0 ? (
            <>
              <div className="home-service-grid" style={{ display: 'flex', flexWrap: 'wrap', margin: '0 -12px' }}>
                {services.map(service => (
                  <div key={service.id} style={{ padding: '0 12px 24px' }}>
                    <div className="card-custom service-card" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                      <div className="service-card-img">
                        <i className="bi bi-briefcase" style={{ fontSize: '3.5rem', color: 'var(--primary-color)', opacity: 0.6 }}></i>
                      </div>
                      <div className="card-body-custom" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                        <span className="badge-category" style={{ marginBottom: 8, display: 'inline-block' }}>
                          {service.categorie?.nom || 'Service'}
                        </span>
                        <h5 style={{ fontWeight: 700, marginBottom: 8 }}>{service.nom}</h5>
                        <p className="text-muted" style={{ fontSize: '0.9rem', flex: 1, lineHeight: 1.6 }}>
                          {service.description?.split(' ').slice(0, 15).join(' ')}
                          {service.description?.split(' ').length > 15 ? '...' : ''}
                        </p>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
                          <span className="price">{service.prix} Fcfa</span>
                          <Link to={`/services/${service.id}`} className="btn-primary-custom btn-sm-custom">
                            Voir détails
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ textAlign: 'center', marginTop: 40 }}>
                <Link to="/services" className="btn-secondary-custom me-3">
                  <i className="bi bi-grid-3x3-gap me-1"></i> Services
                </Link>
              </div>
            </>
          ) : (
            <div className="empty-state">
              <i className="bi bi-inbox"></i>
              <p>Aucun service disponible pour le moment.</p>
            </div>
          )}
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="py-5">
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <h2 style={{ fontWeight: 800 }}><i className="bi bi-question-circle text-primary me-2"></i>Comment ça marche</h2>
            <p className="text-muted">Trouvez et réservez un service en 3 étapes simples</p>
          </div>
<div className="home-step-grid" style={{ display: 'flex', flexWrap: 'wrap', margin: '0 -12px' }}>
            {[
              { icon: 'magnifying-glass', color: '#0284c7', title: '1. Recherchez', desc: "Parcourez notre catalogue de services et trouvez celui qu'il vous faut." },
              { icon: 'calendar-check', color: '#10b981', title: '2. Réservez', desc: 'Choisissez votre prestataire et réservez directement en ligne.' },
              { icon: 'check-circle', color: '#8b5cf6', title: '3. Profitez', desc: 'Recevez le service et évaluez votre expérience.' },
            ].map((step, idx) => (
              <div key={step.title} style={{ padding: '0 12px 24px', textAlign: 'center' }}>
                <div style={{
                  margin: '0 auto 24px', width: 80, height: 80, borderRadius: 20,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: `linear-gradient(135deg, ${step.color}, ${step.color}cc)`,
                  boxShadow: `0 8px 24px ${step.color}44`,
                  fontSize: '2rem', color: 'white'
                }}>
                  <i className={`bi bi-${step.icon}`}></i>
                </div>
                <h4 style={{ fontWeight: 800, marginBottom: 12 }}>{step.title}</h4>
                <p className="text-muted">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ background: 'linear-gradient(135deg,#00a859,#007a40)', padding: '60px 0' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <h2 style={{ color: 'white', fontWeight: 800, marginBottom: 12 }}>Vous êtes prestataire de services ?</h2>
          <p style={{ color: 'rgba(255,255,255,0.8)', marginBottom: 32, fontSize: '1.05rem' }}>
            Rejoignez notre plateforme et trouvez de nouveaux clients facilement.
          </p>
          {/* ✅ FIX: Lien corrigé vers /register-prestataire */}
<Link to="/inscription-prestataire" style={{
            background: 'white', color: 'var(--primary-dark)', padding: '14px 32px',
            borderRadius: 10, fontWeight: 800, textDecoration: 'none',
            display: 'inline-flex', alignItems: 'center', gap: 10, fontSize: '1rem'
          }}>
            <i className="bi bi-person-plus"></i> Devenir prestataire
          </Link>
        </div>
      </section>
    </>
  );
}