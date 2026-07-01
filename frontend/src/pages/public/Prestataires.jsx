import '../../styles/prestataires.css';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';



function SkeletonCard() {
  return (
    <div style={{ background: 'white', borderRadius: 24, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
      <div className="pr2-skeleton" style={{ height: 72 }} />
      <div style={{ padding: '0 20px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, marginTop: -28 }}>
        <div className="pr2-skeleton" style={{ width: 72, height: 72, borderRadius: '50%', border: '4px solid white' }} />
        <div className="pr2-skeleton" style={{ width: 120, height: 16 }} />
        <div className="pr2-skeleton" style={{ width: 80, height: 12 }} />
        <div className="pr2-skeleton" style={{ width: '100%', height: 10 }} />
        <div className="pr2-skeleton" style={{ width: '80%', height: 10 }} />
        <div className="pr2-skeleton" style={{ width: '100%', height: 40, borderRadius: 14, marginTop: 8 }} />
      </div>
    </div>
  );
}

export default function Prestataires() {
  const [prestataires, setPrestataires] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [specialiteFiltre, setSpecialiteFiltre] = useState('all');

  useEffect(() => {
    api.get('/prestataires/')
      .then(r => setPrestataires(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const specialites = ['all', ...new Set(prestataires.map(p => p.specialite).filter(Boolean))];

  const filtres = prestataires.filter(p => {
    const q = search.toLowerCase();
    const matchSearch = !q ||
      p.user?.username?.toLowerCase().includes(q) ||
      p.user?.first_name?.toLowerCase().includes(q) ||
      p.user?.last_name?.toLowerCase().includes(q) ||
      p.specialite?.toLowerCase().includes(q) ||
      p.bio?.toLowerCase().includes(q);
    const matchSpec = specialiteFiltre === 'all' || p.specialite === specialiteFiltre;
    return matchSearch && matchSpec;
  });

  const getBadge = (p) => {
    const n = p.services_count || 0;
    if (n >= 10) return { label: 'Platine', color: '#6366f1', bg: 'rgba(99,102,241,0.15)', icon: 'bi-gem' };
    if (n >= 5)  return { label: 'Or',      color: '#d97706', bg: 'rgba(217,119,6,0.15)',  icon: 'bi-trophy-fill' };
    return              { label: 'Bronze',  color: '#b45309', bg: 'rgba(180,83,9,0.22)',   icon: 'bi-award-fill' };
  };

  const getNom = (p) =>
    `${p.user?.first_name || ''} ${p.user?.last_name || ''}`.trim() || p.user?.username || 'Artisan';

  const getNoteStars = (note) => {
    if (!note) return '—';
    return '★'.repeat(Math.round(note)) + '☆'.repeat(5 - Math.round(note));
  };

  return (
    <>
      
      <div className="pr2-page">

        {/* ── HERO ── */}
        <div className="pr2-hero">
          <div className="container pr2-hero-inner">
            <div className="pr2-hero-eyebrow">
              <i className="bi bi-patch-check-fill" style={{ color: '#38bdf8' }} />
              Artisans certifiés au Togo
            </div>
            <h1 className="pr2-hero-title">Trouvez le bon expert<br />pour chaque besoin</h1>
            <p className="pr2-hero-sub">
              Des prestataires qualifiés, évalués par des clients réels,
              disponibles à Lomé, Kara, Kpalimé et partout au Togo.
            </p>
            <div className="pr2-hero-stats">
              <div className="pr2-hero-stat">
                <span className="pr2-hero-stat-val">{prestataires.length || '—'}</span>
                <span className="pr2-hero-stat-lbl">Artisans actifs</span>
              </div>
              <div className="pr2-hero-stat">
                <span className="pr2-hero-stat-val">{specialites.length - 1 || '—'}</span>
                <span className="pr2-hero-stat-lbl">Métiers</span>
              </div>
              <div className="pr2-hero-stat">
                <span className="pr2-hero-stat-val">98%</span>
                <span className="pr2-hero-stat-lbl">Satisfaction</span>
              </div>
            </div>
          </div>
        </div>

        <div className="container">

          {/* ── FILTER CARD ── */}
          <div className="pr2-filter-card">
            <div className="pr2-search-wrap">
              <i className="bi bi-search pr2-search-icon" />
              <input
                type="text"
                placeholder="Rechercher un artisan, une spécialité (ex: plombier, électricien)…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pr2-search-input"
              />
              {search && (
                <button onClick={() => setSearch('')} className="pr2-search-clear">
                  <i className="bi bi-x" />
                </button>
              )}
            </div>
            <div className="pr2-chips">
              {specialites.map(s => (
                <button
                  key={s}
                  className={`pr2-chip ${specialiteFiltre === s ? 'active' : ''}`}
                  onClick={() => setSpecialiteFiltre(s)}
                >
                  {s === 'all' ? '✦ Tous les métiers' : s}
                </button>
              ))}
            </div>
          </div>

          {/* ── RESULTS BAR ── */}
          {!loading && (
            <div className="pr2-results-bar">
              <p className="pr2-results-count">
                <strong>{filtres.length}</strong> prestataire{filtres.length !== 1 ? 's' : ''} trouvé{filtres.length !== 1 ? 's' : ''}
                {(search || specialiteFiltre !== 'all') && (
                  <span style={{ marginLeft: 8, color: '#0284c7', cursor: 'pointer', fontWeight: 700 }}
                    onClick={() => { setSearch(''); setSpecialiteFiltre('all'); }}>
                    — Effacer les filtres
                  </span>
                )}
              </p>
            </div>
          )}

          {/* ── GRID ── */}
          <div className="pr2-grid">
            {loading
              ? Array(6).fill(0).map((_, i) => <SkeletonCard key={i} />)
              : filtres.length === 0
                ? (
                  <div className="pr2-empty">
                    <div style={{ width: 72, height: 72, borderRadius: 20, background: '#e0f2fe', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: '2rem', color: '#0284c7' }}>
                      <i className="bi bi-people" />
                    </div>
                    <h5 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, color: '#0c2340', fontSize: '1.3rem', marginBottom: 8 }}>
                      Aucun prestataire trouvé
                    </h5>
                    <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: 20 }}>
                      Essayez de modifier vos critères de recherche.
                    </p>
                    {(search || specialiteFiltre !== 'all') && (
                      <button
                        onClick={() => { setSearch(''); setSpecialiteFiltre('all'); }}
                        style={{ padding: '11px 24px', background: 'linear-gradient(135deg,#0284c7,#0369a1)', color: 'white', border: 'none', borderRadius: 14, fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem' }}
                      >
                        Réinitialiser les filtres
                      </button>
                    )}
                  </div>
                )
                : filtres.map((p, idx) => {
                  const badge = getBadge(p);
                  const nom = getNom(p);
                  const userId = p.user?.id;
                  return (
                    <div
                      key={userId}
                      className="pr2-card"
                      style={{ animationDelay: `${idx * 0.04}s` }}
                    >
                      {/* Banner */}
                      <div className="pr2-card-banner">
                        <span
                          className="pr2-badge-level"
                          style={{ color: badge.color, background: badge.bg, border: `1px solid ${badge.color}40` }}
                        >
                          <i className={`bi ${badge.icon}`} /> {badge.label}
                        </span>
                      </div>

                      {/* Avatar */}
                      <div className="pr2-avatar-wrap">
                        <div className="pr2-avatar">
                          {p.avatar_url
                            ? <img src={p.avatar_url} alt={nom} />
                            : nom[0].toUpperCase()
                          }
                          <span className="pr2-online-dot" style={{
                            background: p.statut_activite === 'occupe' ? '#f59e0b' : p.statut_activite === 'hors_ligne' ? '#94a3b8' : '#22c55e',
                            boxShadow: p.statut_activite === 'occupe' ? '0 0 0 2px white, 0 0 8px #f59e0b' : p.statut_activite === 'hors_ligne' ? '0 0 0 2px white' : '0 0 0 2px white, 0 0 8px #22c55e'
                          }} title={p.statut_activite === 'occupe' ? 'Occupé' : p.statut_activite === 'hors_ligne' ? 'Hors ligne' : 'Disponible immédiatement'} />
                        </div>
                      </div>

                      {/* Body */}
                      <div className="pr2-card-body">
                        <h4 className="pr2-name" style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center', flexWrap: 'wrap' }}>
                          {nom}
                          {p.type_abonnement === 'pro' && (
                            <i className="bi bi-patch-check-fill" style={{ color: '#22c55e', fontSize: '0.98rem' }} title="Prestataire PRO" />
                          )}
                          {p.type_abonnement === 'prestige' && (
                            <i className="bi bi-gem" style={{ color: '#fbbf24', fontSize: '0.98rem' }} title="Prestataire PRESTIGE" />
                          )}
                        </h4>
                        <span className="pr2-handle">@{p.user?.username || 'artisan'}</span>

                        <span className="pr2-verified">
                          <i className="bi bi-shield-check-fill" style={{ color: '#10b981' }} />
                          Identité vérifiée
                        </span>

                        {p.specialite && (
                          <span className="pr2-spec-tag">
                            <i className="bi bi-tools" style={{ fontSize: '0.75rem' }} /> {p.specialite}
                          </span>
                        )}

                        <p className="pr2-bio">
                          {p.bio || "Aucune description de profil pour le moment. Contactez cet artisan pour discuter de vos besoins."}
                        </p>

                        <div className="pr2-stats" style={{ display: 'flex', width: '100%', background: '#f8fafc', borderRadius: '16px', padding: '8px 0', marginBottom: '16px' }}>
                          <div className="pr2-stat" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '6px 0' }}>
                            <span className="pr2-stat-val" style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: '0.98rem', color: '#0c2340' }}>{p.services_count || 0}</span>
                            <span className="pr2-stat-lbl" style={{ fontSize: '0.65rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700, marginTop: '2px' }}>Services</span>
                          </div>
                          <div className="pr2-stat" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '6px 0', borderLeft: '1.5px solid #e2e8f0', borderRight: '1.5px solid #e2e8f0' }}>
                            <span className="pr2-stat-val" style={{ display: 'flex', alignItems: 'center', gap: 3, fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: '0.98rem', color: '#0c2340' }}>
                              <i className="bi bi-star-fill" style={{ color: '#f59e0b', fontSize: '0.8rem' }} />
                              {p.note_moyenne ? p.note_moyenne.toFixed(1) : '—'}
                            </span>
                            <span className="pr2-stat-lbl" style={{ fontSize: '0.65rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700, marginTop: '2px' }}>Note</span>
                          </div>
                          <div className="pr2-stat" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '6px 0' }}>
                            <span className="pr2-stat-val" style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: '0.98rem', color: '#0c2340' }}>{p.reservations_count || 0}</span>
                            <span className="pr2-stat-lbl" style={{ fontSize: '0.65rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700, marginTop: '2px' }}>RDV</span>
                          </div>
                        </div>
                      </div>

                      {/* Footer */}
                      <div className="pr2-card-footer">
                        <Link
                          to={`/prestataire/${p.id}`}
                          className="pr2-btn-detail"
                        >
                          <i className="bi bi-person-lines-fill" />
Voir son profil & services
                        </Link>

                        {p.telephone && (
                          <a
                            href={`https://wa.me/228${p.telephone}?text=${encodeURIComponent("Bonjour, j'ai trouvé votre profil sur Service Market et je souhaite discuter de vos prestations.")}`}
                            target="_blank"
                            rel="noreferrer"
                            className="pr2-btn-wa"
                          >
                            <i className="bi bi-whatsapp" /> WhatsApp
                          </a>
                        )}
                      </div>
                    </div>
                  );
                })
            }
          </div>
        </div>
      </div>
    </>
  );
}