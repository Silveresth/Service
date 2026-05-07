import React, { useState } from 'react';
import axios from '../api/axios';

// Budgets prédéfinis
const BUDGET_OPTIONS = [
  { label: '< 5 000 F', value: 5000 },
  { label: '< 10 000 F', value: 10000 },
  { label: '< 20 000 F', value: 20000 },
  { label: 'Pas de limite', value: 999999 },
];

const SmartMatchButton = ({ onMatches, setMatches, setShowModal, categories = [] }) => {
  const [step, setStep]               = useState('idle');    // idle | form | loading | done | error
  const [loadingStep, setLoadingStep] = useState(0);
  const [error, setError]             = useState('');




  // Prefs utilisateur
  const [selectedCat, setSelectedCat] = useState('');        // nom catégorie ou ''
  const [selectedBudget, setSelectedBudget] = useState(20000);

  // Mini filtres (ceux affichés dans la vue "idle")
  const [distanceMax, setDistanceMax] = useState(20); // km
  const [mieuxNote, setMieuxNote] = useState(false);

  const toggleMieuxNote = () => setMieuxNote(v => !v);
  // ── Géoloc ──────────────────────────────────────────────────
  const getCurrentLocation = () =>
    new Promise((resolve, reject) => {
      if (!navigator.geolocation) { reject('Géolocalisation non supportée.'); return; }
      navigator.geolocation.getCurrentPosition(
        pos => resolve({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
        err => reject(err.message)
      );
    });

  // ── Lancer le matching ───────────────────────────────────────
  const handleSearch = async () => {
    setStep('loading');
    setError('');
    setLoadingStep(1);

    try {
      const pos = await getCurrentLocation();
      setLoadingStep(2);

      const response = await axios.post('/smart-match/match/', {
        lat: pos.lat,
        lon: pos.lon,
        budget_max: selectedBudget,
        categories: selectedCat ? [selectedCat] : [],
        distance_max: distanceMax,
        mieux_note: mieuxNote,
      });

      setLoadingStep(3);
      const matches = response.data.top_matches || [];
      setMatches(matches);
      onMatches?.(matches);

      if (matches.length > 0) {
        setStep('done');
        setTimeout(() => { setShowModal?.(true); setStep('idle'); }, 600);
      } else {
        setError('Aucun prestataire trouvé avec ces critères. Essayez un budget plus élevé ou une autre catégorie.');
        setStep('error');
      }
    } catch (err) {
      const msg =
        typeof err === 'string' && err.toLowerCase().includes('geoloc')
          ? 'Localisation refusée. Activez-la dans votre navigateur.'
          : err?.response?.status === 404
          ? 'Service indisponible.'
          : 'Erreur réseau. Vérifiez votre connexion.';
      setError(msg);
      setStep('error');
    }
  };

  // ── Reset ────────────────────────────────────────────────────
  const reset = () => { setStep('idle'); setError(''); setLoadingStep(0); };

  // ════════════════════════════════════════════════════════════
  // IDLE — bouton principal
  // ════════════════════════════════════════════════════════════
  if (step === 'idle') return (
    <div style={{ width: '100%' }}>
      <button
        onClick={() => setStep('form')}
        style={{
          width: '100%', padding: 0, background: 'none',
          border: 'none', cursor: 'pointer', outline: 'none',
        }}
      >
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12,
          padding: '14px 14px', background: '#ffffff',
          borderRadius: 14, border: '2px solid #0c2340',
          boxShadow: '6px 6px 0 rgba(2,132,199,0.18), 0 10px 30px rgba(2,132,199,0.10)',
          transition: 'all .18s', textAlign: 'left',
        }}>
          {/* Icône */}
          <div style={{
            width: 38, height: 38, flexShrink: 0, borderRadius: 12,
            background: '#0c2340', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
                fill="white" strokeWidth="0"/>
            </svg>
          </div>
          {/* Texte */}
          <div style={{ flex: 1 }}>
            <p style={{ margin: 0, fontWeight: 800, fontSize: '0.9rem', color: '#1a1535', lineHeight: 1.2 }}>
              Trouver mon prestataire idéal
            </p>
            <p style={{ margin: '2px 0 0', fontSize: '0.72rem', color: '#9e98c0', lineHeight: 1.2 }}>
              IA · Géolocalisation · Budget
            </p>
          </div>
          {/* Badge + flèche */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
            <span style={{
              padding: '4px 10px', borderRadius: 20, background: '#f0eeff',
              color: '#6352d2', fontSize: '0.73rem', fontWeight: 700,
            }}>IA</span>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
              <path d="M5 12H19M13 6L19 12L13 18" stroke="#6352d2" strokeWidth="2.2"
                strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>
      </button>

      {/* Pills features (compact) */}
      <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
        <button
          type="button"
          onClick={() => setDistanceMax(20)}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '6px 12px', borderRadius: 999,
            background: distanceMax === 20 ? '#0c2340' : 'rgba(255,255,255,0.18)',
            border: distanceMax === 20 ? '2px solid #ffffff' : '1px solid rgba(255,255,255,0.28)',
            color: distanceMax === 20 ? '#ffffff' : 'rgba(255,255,255,0.92)',
            fontSize: '0.72rem', fontWeight: 800,
            boxShadow: distanceMax === 20 ? '3px 3px 0 rgba(255,255,255,0.18)' : 'none',
            backdropFilter: 'blur(4px)',
            cursor: 'pointer',
          }}
        >
          <span style={{ fontSize: 10, lineHeight: 1 }}>📍</span>20 km
        </button>

        <button
          type="button"
          onClick={toggleMieuxNote}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '6px 12px', borderRadius: 999,
            background: mieuxNote ? '#0c2340' : 'rgba(255,255,255,0.18)',
            border: mieuxNote ? '2px solid #ffffff' : '1px solid rgba(255,255,255,0.28)',
            color: mieuxNote ? '#ffffff' : 'rgba(255,255,255,0.92)',
            fontSize: '0.72rem', fontWeight: 800,
            boxShadow: mieuxNote ? '3px 3px 0 rgba(255,255,255,0.18)' : 'none',
            backdropFilter: 'blur(4px)',
            cursor: 'pointer',
          }}
        >
          <span style={{ fontSize: 10, lineHeight: 1 }}>⭐</span>Mieux noté
        </button>

        <button
          type="button"
          onClick={() => setStep('form')}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '6px 12px', borderRadius: 999,
            background: 'rgba(255,255,255,0.18)',
            border: '1px solid rgba(255,255,255,0.28)',
            color: 'rgba(255,255,255,0.92)',
            fontSize: '0.72rem', fontWeight: 800,
            boxShadow: 'none',
            backdropFilter: 'blur(4px)',
            cursor: 'pointer',
          }}
        >
          <span style={{ fontSize: 10, lineHeight: 1 }}>💰</span>Budget
        </button>
      </div>
    </div>
  );

  // ════════════════════════════════════════════════════════════
  // FORM — formulaire catégorie + budget
  // ════════════════════════════════════════════════════════════
  if (step === 'form') return (
    <div style={{
      background: '#ffffff', borderRadius: 18,
      border: '1.5px solid #ede9ff',
      boxShadow: '0 8px 32px rgba(99,82,210,0.12)',
      overflow: 'hidden',
      animation: 'smSlideIn .22s cubic-bezier(0.4,0,0.2,1)',
    }}>
      <style>{`
        @keyframes smSlideIn { from { opacity:0; transform:translateY(-8px); } to { opacity:1; transform:translateY(0); } }
        .sm-cat-btn { transition: all .15s; cursor:pointer; }
        .sm-cat-btn:hover { border-color:#6352d2 !important; background:#f5f3ff !important; }
        .sm-budget-btn { transition: all .15s; cursor:pointer; }
        .sm-budget-btn:hover { border-color:#6352d2 !important; color:#6352d2 !important; }
      `}</style>

      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg,#6352d2,#8b5cf6)',
        padding: '16px 20px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: '1.2rem' }}>🎯</span>
          <div>
            <p style={{ margin: 0, color: '#fff', fontWeight: 800, fontSize: '0.95rem' }}>
              Personnalisez votre recherche
            </p>
            <p style={{ margin: 0, color: 'rgba(255,255,255,0.75)', fontSize: '0.75rem' }}>
              L'IA trouvera le meilleur match pour vous
            </p>
          </div>
        </div>
        <button onClick={reset} style={{
          background: 'rgba(255,255,255,0.15)', border: 'none',
          borderRadius: 8, width: 30, height: 30, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', fontSize: '1rem',
        }}>✕</button>
      </div>

      <div style={{ padding: '20px' }}>

        {/* Catégorie */}
        <div style={{ marginBottom: 20 }}>
          <p style={{
            margin: '0 0 10px', fontWeight: 700, fontSize: '0.82rem',
            color: '#6352d2', textTransform: 'uppercase', letterSpacing: '0.06em',
          }}>
            📂 Type de service recherché
          </p>

          {/* Option "Tout" */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            <button
              className="sm-cat-btn"
              onClick={() => setSelectedCat('')}
              style={{
                padding: '8px 14px', borderRadius: 50,
                border: `1.5px solid ${selectedCat === '' ? '#6352d2' : '#e5e7eb'}`,
                background: selectedCat === '' ? '#6352d2' : '#f9fafb',
                color: selectedCat === '' ? '#fff' : '#374151',
                fontWeight: 600, fontSize: '0.82rem',
              }}
            >
              ✨ Tous les services
            </button>

            {categories.map(cat => (
              <button
                key={cat.id}
                className="sm-cat-btn"
                onClick={() => setSelectedCat(cat.nom)}
                style={{
                  padding: '8px 14px', borderRadius: 50,
                  border: `1.5px solid ${selectedCat === cat.nom ? '#6352d2' : '#e5e7eb'}`,
                  background: selectedCat === cat.nom ? '#6352d2' : '#f9fafb',
                  color: selectedCat === cat.nom ? '#fff' : '#374151',
                  fontWeight: 600, fontSize: '0.82rem',
                  display: 'flex', alignItems: 'center', gap: 5,
                }}
              >
                {cat.icone && <i className={`bi ${cat.icone}`} style={{ fontSize: '0.8rem' }}></i>}
                {cat.nom}
              </button>
            ))}
          </div>
        </div>

        {/* Budget */}
        <div style={{ marginBottom: 20 }}>
          <p style={{
            margin: '0 0 10px', fontWeight: 700, fontSize: '0.82rem',
            color: '#6352d2', textTransform: 'uppercase', letterSpacing: '0.06em',
          }}>
            💰 Budget maximum
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
            {BUDGET_OPTIONS.map(opt => (
              <button
                key={opt.value}
                className="sm-budget-btn"
                onClick={() => setSelectedBudget(opt.value)}
                style={{
                  padding: '10px 8px', borderRadius: 10, textAlign: 'center',
                  border: `1.5px solid ${selectedBudget === opt.value ? '#6352d2' : '#e5e7eb'}`,
                  background: selectedBudget === opt.value ? '#f5f3ff' : '#f9fafb',
                  color: selectedBudget === opt.value ? '#6352d2' : '#374151',
                  fontWeight: selectedBudget === opt.value ? 700 : 500,
                  fontSize: '0.85rem',
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Résumé + Bouton lancer */}
        <div style={{
          background: '#f5f3ff', borderRadius: 10, padding: '10px 14px',
          marginBottom: 16, fontSize: '0.8rem', color: '#6352d2',
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <span>🔍</span>
          <span>
            Recherche&nbsp;: <strong>{selectedCat || 'tous services'}</strong>
            &nbsp;·&nbsp;budget max&nbsp;: <strong>
              {selectedBudget === 999999 ? 'illimité' : `${selectedBudget.toLocaleString()} F`}
            </strong>
          </span>
        </div>

        <button
          onClick={handleSearch}
          style={{
            width: '100%', padding: '14px', borderRadius: 12,
            background: 'linear-gradient(135deg,#6352d2,#8b5cf6)',
            border: 'none', color: '#fff', fontWeight: 800,
            fontSize: '0.95rem', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            boxShadow: '0 4px 16px rgba(99,82,210,0.35)',
            transition: 'all .2s',
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
              fill="white"/>
          </svg>
          Lancer le Smart Matching IA
        </button>
      </div>
    </div>
  );

  // ════════════════════════════════════════════════════════════
  // LOADING
  // ════════════════════════════════════════════════════════════
  if (step === 'loading') return (
    <div style={{
      background: '#ffffff', borderRadius: 18,
      border: '1.5px solid #ede9ff',
      boxShadow: '0 8px 32px rgba(99,82,210,0.12)',
      overflow: 'hidden',
    }}>
      <style>{`
        @keyframes smShimmer { 0%{left:-60%} 100%{left:110%} }
        @keyframes smSpin { to{transform:rotate(360deg)} }
      `}</style>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 16,
        padding: '18px 22px', position: 'relative', overflow: 'hidden',
      }}>
        <span style={{
          position: 'absolute', top: 0, left: '-60%',
          width: '50%', height: '100%',
          background: 'linear-gradient(90deg,transparent,rgba(99,82,210,0.07),transparent)',
          animation: 'smShimmer 1.4s infinite', pointerEvents: 'none',
        }}/>
        <div style={{
          width: 48, height: 48, flexShrink: 0, borderRadius: 13,
          background: '#f3f0ff', display: 'flex',
          alignItems: 'center', justifyContent: 'center',
        }}>
          <span style={{
            width: 22, height: 22, border: '2.5px solid #d3cbf7',
            borderTop: '2.5px solid #6352d2', borderRadius: '50%',
            display: 'inline-block', animation: 'smSpin .85s linear infinite',
          }}/>
        </div>
        <div style={{ flex: 1 }}>
          <p style={{ margin: 0, fontWeight: 700, fontSize: '0.95rem', color: '#1a1535' }}>
            {['Localisation en cours…', 'Analyse des prestataires…', 'Calcul des meilleurs profils…'][loadingStep - 1] || 'Analyse…'}
          </p>
          <p style={{ margin: '3px 0 0', fontSize: '0.78rem', color: '#9e98c0' }}>
            Étape {loadingStep} sur 3
          </p>
        </div>
      </div>
      {/* Barre de progression */}
      <div style={{ height: 4, background: '#f0eeff' }}>
        <div style={{
          height: '100%', background: 'linear-gradient(90deg,#6352d2,#8b5cf6)',
          width: `${Math.round((loadingStep / 3) * 100)}%`,
          borderRadius: '0 4px 4px 0',
          transition: 'width .7s cubic-bezier(0.4,0,0.2,1)',
        }}/>
      </div>
      {/* Steps indicator */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 32, padding: '12px 20px' }}>
        {['Position', 'Analyse', 'Matching'].map((label, i) => (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            <div style={{
              width: 8, height: 8, borderRadius: '50%',
              background: i < loadingStep ? '#6352d2' : '#e5e7eb',
              transition: 'background .4s',
            }}/>
            <span style={{
              fontSize: '0.68rem',
              color: i < loadingStep ? '#6352d2' : '#9ca3af',
              fontWeight: i + 1 === loadingStep ? 700 : 400,
            }}>{label}</span>
          </div>
        ))}
      </div>
    </div>
  );

  // ════════════════════════════════════════════════════════════
  // DONE (flash de succès avant ouverture modal)
  // ════════════════════════════════════════════════════════════
  if (step === 'done') return (
    <div style={{
      background: '#f0fdf4', borderRadius: 18,
      border: '1.5px solid #bbf7d0',
      padding: '18px 22px',
      display: 'flex', alignItems: 'center', gap: 14,
    }}>
      <div style={{
        width: 48, height: 48, borderRadius: 13, flexShrink: 0,
        background: '#22c55e', display: 'flex',
        alignItems: 'center', justifyContent: 'center',
      }}>
        <span style={{ color: '#fff', fontSize: '1.4rem' }}>✓</span>
      </div>
      <div>
        <p style={{ margin: 0, fontWeight: 700, color: '#15803d' }}>Matches trouvés !</p>
        <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: '#16a34a' }}>Ouverture des résultats…</p>
      </div>
    </div>
  );

  // ════════════════════════════════════════════════════════════
  // ERROR
  // ════════════════════════════════════════════════════════════
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{
        background: '#fff5f5', border: '1px solid #fecaca',
        borderRadius: 14, padding: '14px 16px',
        display: 'flex', alignItems: 'flex-start', gap: 10,
      }}>
        <span style={{ fontSize: '1.1rem', flexShrink: 0 }}>⚠️</span>
        <p style={{ margin: 0, fontSize: '0.85rem', color: '#b91c1c', lineHeight: 1.5 }}>{error}</p>
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={() => setStep('form')} style={{
          flex: 1, padding: '10px', borderRadius: 10,
          border: '1.5px solid #6352d2', background: '#f5f3ff',
          color: '#6352d2', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer',
        }}>
          ← Modifier les critères
        </button>
        <button onClick={reset} style={{
          padding: '10px 16px', borderRadius: 10,
          border: '1px solid #e5e7eb', background: '#f9fafb',
          color: '#6b7280', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer',
        }}>
          Annuler
        </button>
      </div>
    </div>
  );
};

export default SmartMatchButton;
