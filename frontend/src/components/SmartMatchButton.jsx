import React, { useState } from 'react';
import { Geolocation } from '@capacitor/geolocation';
import useSmartMatch from '../hooks/useSmartMatch';

const BUDGET_OPTIONS = [
  { label: '< 5 000 F', value: 5000 },
  { label: '< 10 000 F', value: 10000 },
  { label: '< 20 000 F', value: 20000 },
  { label: 'Sans limite', value: 999999 },
];

const SmartMatchButton = ({ onMatches, setMatches, setShowModal, categories = [] }) => {
  const { runMatch } = useSmartMatch();
  const [step, setStep] = useState('idle');
  const [loadingStep, setLoadingStep] = useState(0);
  const [error, setError] = useState('');
  const [selectedCat, setSelectedCat] = useState('');
  const [selectedBudget, setSelectedBudget] = useState(20000);
  const [budgetCustom, setBudgetCustom] = useState(false);
  const [budgetMaxValue, setBudgetMaxValue] = useState(20000);

  const [distanceMax, setDistanceMax] = useState(20);

  const [mieuxNote, setMieuxNote] = useState(false);

  const getCurrentLocation = async () => {
    try {
      // Tenter d'utiliser Capacitor (natif mobile)
      const coordinates = await Geolocation.getCurrentPosition();
      return { lat: coordinates.coords.latitude, lon: coordinates.coords.longitude };
    } catch (e) {
      console.warn('Capacitor Geolocation error in SmartMatch, falling back to Web API:', e);
      // Fallback Web API
      return new Promise((resolve, reject) => {
        if (!navigator.geolocation) { reject('Géolocalisation non supportée.'); return; }
        navigator.geolocation.getCurrentPosition(
          pos => resolve({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
          err => reject(err.message)
        );
      });
    }
  };

  const handleSearch = async () => {
    setStep('loading');
    setError('');
    setLoadingStep(1);
    try {
      const pos = await getCurrentLocation();
      setLoadingStep(2);
      const { matches, raw } = await runMatch({
        lat: pos.lat,
        lon: pos.lon,
        budget_max: selectedBudget,
        categories: selectedCat ? [selectedCat] : [],
        distance_max: distanceMax,
        mieux_note: mieuxNote,
        debug: true,
      });

      // Si réponse vide, afficher debug en console
      if (!matches || matches.length === 0) {
        console.warn('[smartmatch] backend returned empty matches:', raw);
      }
      setLoadingStep(3);
      const matchesFinal = matches || [];
      setMatches(matchesFinal);
      onMatches?.(matchesFinal);
      if (matchesFinal.length > 0) {
        setStep('done');
        setTimeout(() => { setShowModal?.(true); setStep('idle'); }, 700);
      } else {
        setError('Aucun prestataire trouvé. Élargissez votre budget ou changez de catégorie.');
        setStep('error');
      }
    } catch (err) {
      const msg = typeof err === 'string' && err.toLowerCase().includes('geoloc')
        ? 'Localisation refusée. Activez-la dans votre navigateur.'
        : 'Erreur réseau. Vérifiez votre connexion.';
      setError(msg);
      setStep('error');
    }
  };

  const reset = () => { setStep('idle'); setError(''); setLoadingStep(0); };

  // ── STYLES PARTAGÉS ──────────────────────────────────────
  const css = `
    @keyframes smPulse { 0%,100%{opacity:1} 50%{opacity:.6} }
    @keyframes smSpin { to{transform:rotate(360deg)} }
    @keyframes smSlide { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
    @keyframes smBar { from{width:0} }
    .sm-chip { transition:all .15s; cursor:pointer; }
    .sm-chip:hover { transform:translateY(-1px); box-shadow:0 4px 12px rgba(2,132,199,.2); }
    .sm-launch:hover { transform:translateY(-1px); box-shadow:0 6px 20px rgba(2,132,199,.4) !important; }
    .sm-launch:active { transform:translateY(0); }
  `;

  // ── IDLE ─────────────────────────────────────────────────
  if (step === 'idle') return (
    <div style={{ animation: 'smSlide .2s ease' }}>
      <style>{css}</style>

      {/* Bouton principal compact */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        background: 'linear-gradient(135deg, #0c2340 0%, #0284c7 100%)',
        borderRadius: 14, padding: '12px 16px',
        boxShadow: '0 4px 20px rgba(2,132,199,.25)',
        cursor: 'pointer', transition: 'all .2s',
      }}
        onClick={() => setStep('form')}
        onMouseEnter={e => e.currentTarget.style.boxShadow = '0 8px 30px rgba(2,132,199,.4)'}
        onMouseLeave={e => e.currentTarget.style.boxShadow = '0 4px 20px rgba(2,132,199,.25)'}
      >
        {/* Icône animée */}
        <div style={{
          width: 36, height: 36, borderRadius: 10, flexShrink: 0,
          background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(6px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          border: '1px solid rgba(255,255,255,0.2)',
        }}>
          <i className="bi bi-stars" style={{ color: '#fff', fontSize: '1.1rem' }} />
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ margin: 0, color: '#fff', fontWeight: 800, fontSize: '0.88rem', lineHeight: 1.2 }}>
            Smart Matching IA
          </p>
          <p style={{ margin: '2px 0 0', color: 'rgba(255,255,255,0.7)', fontSize: '0.72rem', lineHeight: 1.2 }}>
            Trouvez votre prestataire idéal
          </p>
        </div>

        {/* Pills rapides */}
        <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
          <span
            className="sm-chip"
            onClick={e => { e.stopPropagation(); setMieuxNote(v => !v); }}
            style={{
              padding: '4px 10px', borderRadius: 20, fontSize: '0.7rem', fontWeight: 700,
              background: mieuxNote ? '#f59e0b' : 'rgba(255,255,255,0.15)',
              color: '#fff', border: '1px solid rgba(255,255,255,0.2)',
            }}
          >
            ⭐ Top
          </span>
          <span style={{
            padding: '4px 10px', borderRadius: 20, fontSize: '0.7rem', fontWeight: 700,
            background: 'rgba(255,255,255,0.15)', color: '#fff',
            border: '1px solid rgba(255,255,255,0.2)',
          }}>
            Configurer →
          </span>
        </div>
      </div>
    </div>
  );

  // ── FORM ─────────────────────────────────────────────────
  if (step === 'form') return (
    <div style={{
      background: '#fff', borderRadius: 16,
      border: '1px solid #e0f2fe',
      boxShadow: '0 8px 32px rgba(2,132,199,.12)',
      overflow: 'hidden',
      animation: 'smSlide .2s ease',
    }}>
      <style>{css}</style>

      {/* Header compact */}
      <div style={{
        background: 'linear-gradient(135deg, #0c2340, #0284c7)',
        padding: '12px 16px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <i className="bi bi-stars" style={{ color: '#fff', fontSize: '1rem' }} />
          <span style={{ color: '#fff', fontWeight: 800, fontSize: '0.9rem' }}>
            Personnaliser ma recherche
          </span>
        </div>
        <button onClick={reset} style={{
          background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: 8,
          width: 28, height: 28, cursor: 'pointer', color: '#fff', fontSize: '0.85rem',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>✕</button>
      </div>

      <div style={{ padding: '14px 16px' }}>

        {/* Catégorie — scrollable horizontal */}
        <p style={{
          margin: '0 0 8px', fontSize: '0.75rem', fontWeight: 700,
          color: '#0284c7', textTransform: 'uppercase', letterSpacing: '0.05em',
        }}>
          <i className="bi bi-grid-3x3-gap me-1" />Service recherché
        </p>
        <div style={{
          display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 8,
          scrollbarWidth: 'none', msOverflowStyle: 'none',
        }}>
          {[{ id: '', nom: '✨ Tous', icone: null }, ...categories].map((cat, i) => (
            <button
              key={i}
              className="sm-chip"
              onClick={() => setSelectedCat(cat.id === '' ? '' : cat.nom)}
              style={{
                padding: '6px 12px', borderRadius: 20, border: '1.5px solid',
                borderColor: (cat.id === '' ? selectedCat === '' : selectedCat === cat.nom)
                  ? '#0284c7' : '#e2e8f0',
                background: (cat.id === '' ? selectedCat === '' : selectedCat === cat.nom)
                  ? '#0284c7' : '#f8fafc',
                color: (cat.id === '' ? selectedCat === '' : selectedCat === cat.nom)
                  ? '#fff' : '#475569',
                fontWeight: 600, fontSize: '0.78rem', whiteSpace: 'nowrap', flexShrink: 0,
                display: 'flex', alignItems: 'center', gap: 4,
              }}
            >
              {cat.icone && <i className={`bi ${cat.icone}`} style={{ fontSize: '0.75rem' }} />}
              {cat.nom}
            </button>
          ))}
        </div>

        {/* Budget — boutons + personnalisable (option B) */}
        <p style={{
          margin: '12px 0 8px', fontSize: '0.75rem', fontWeight: 700,
          color: '#0284c7', textTransform: 'uppercase', letterSpacing: '0.05em',
        }}>
          <i className="bi bi-cash-coin me-1" />Budget maximum
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
          {BUDGET_OPTIONS.map(opt => (
            <button
              key={opt.value}
              className="sm-chip"
              onClick={() => {
                setBudgetCustom(false);
                setSelectedBudget(opt.value);
                setBudgetMaxValue(opt.value);
              }}
              style={{
                padding: '8px', borderRadius: 10, border: '1.5px solid',
                borderColor: selectedBudget === opt.value && !budgetCustom ? '#0284c7' : '#e2e8f0',
                background: selectedBudget === opt.value && !budgetCustom ? '#e0f2fe' : '#f8fafc',
                color: selectedBudget === opt.value && !budgetCustom ? '#0284c7' : '#475569',
                fontWeight: selectedBudget === opt.value && !budgetCustom ? 700 : 500,
                fontSize: '0.82rem', textAlign: 'center',
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <div style={{
          marginTop: 8,
          padding: '10px 12px', borderRadius: 10,
          border: '1.5px dashed #bae6fd',
          background: '#f0f9ff',
        }}>
          <label style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            gap: 10,
            cursor: 'pointer',
          }}>
            <span style={{ fontWeight: 800, color: '#0369a1', fontSize: '0.82rem' }}>
              Personnaliser le budget
            </span>
            <input
              type="checkbox"
              checked={budgetCustom}
              onChange={(e) => {
                const next = e.target.checked;
                setBudgetCustom(next);
                if (next) {
                  setSelectedBudget(budgetMaxValue);
                }
              }}
              style={{ accentColor: '#0284c7' }}
            />
          </label>

          <div style={{ marginTop: 8, opacity: budgetCustom ? 1 : 0.6 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontWeight: 900, color: '#0284c7', fontSize: '0.82rem' }}>
                {budgetCustom ? budgetMaxValue.toLocaleString() : selectedBudget.toLocaleString()} F
              </span>
              <span style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 700 }}>1 000 → 200 000</span>
            </div>
            <input
              type="range"
              min={1000}
              max={200000}
              step={1000}
              value={budgetMaxValue}
              disabled={!budgetCustom}
              onChange={(e) => {
                const v = Number(e.target.value);
                setBudgetMaxValue(v);
                setSelectedBudget(v);
              }}
              style={{ width: '100%', accentColor: '#0284c7' }}
            />
          </div>
        </div>


        {/* Distance — personnalisable */}
        <p style={{
          margin: '12px 0 8px', fontSize: '0.75rem', fontWeight: 700,
          color: '#0284c7', textTransform: 'uppercase', letterSpacing: '0.05em',
        }}>
          <i className="bi bi-arrows-collapse me-1" />Distance maximale
        </p>
        <div style={{
          padding: '10px 12px', borderRadius: 10,
          border: '1.5px solid #e2e8f0',
          background: '#f8fafc',
        }}>
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            marginBottom: 6,
          }}>
            <span style={{ fontWeight: 800, color: '#0369a1', fontSize: '0.82rem' }}>
              {distanceMax} km
            </span>
            <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 700 }}>
              Ajustez la zone
            </span>
          </div>
          <input
            type="range"
            min={1}
            max={80}
            step={1}
            value={distanceMax}
            onChange={(e) => setDistanceMax(Number(e.target.value))}
            style={{ width: '100%', accentColor: '#0284c7' }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
            <span style={{ fontSize: '0.68rem', color: '#94a3b8', fontWeight: 700 }}>1 km</span>
            <span style={{ fontSize: '0.68rem', color: '#94a3b8', fontWeight: 700 }}>80 km</span>
          </div>
        </div>

        {/* Option mieux noté */}
        <label style={{
          display: 'flex', alignItems: 'center', gap: 8, marginTop: 12,
          cursor: 'pointer', fontSize: '0.82rem', color: '#475569',
          padding: '8px 12px', borderRadius: 10,
          background: mieuxNote ? '#fef3c7' : '#f8fafc',
          border: `1.5px solid ${mieuxNote ? '#f59e0b' : '#e2e8f0'}`,
          transition: 'all .15s',
        }}>

          <input
            type="checkbox" checked={mieuxNote}
            onChange={e => setMieuxNote(e.target.checked)}
            style={{ accentColor: '#f59e0b' }}
          />
          <span style={{ fontWeight: mieuxNote ? 700 : 500, color: mieuxNote ? '#92400e' : '#475569' }}>
            ⭐ Privilégier les mieux notés
          </span>
        </label>

        {/* Récapitulatif */}
        <div style={{
          marginTop: 12, padding: '8px 12px', borderRadius: 10,
          background: '#f0f9ff', border: '1px solid #bae6fd',
          fontSize: '0.78rem', color: '#0369a1',
        }}>
          <i className="bi bi-search me-1" />
          <strong>{selectedCat || 'Tous services'}</strong>
          {' · '}Budget : <strong>{selectedBudget === 999999 ? 'illimité' : `${selectedBudget.toLocaleString()} F`}</strong>
          {mieuxNote && ' · ⭐ Mieux notés'}
        </div>

        {/* Bouton lancer */}
        <button
          className="sm-launch"
          onClick={handleSearch}
          style={{
            width: '100%', marginTop: 12, padding: '12px',
            borderRadius: 12, border: 'none',
            background: 'linear-gradient(135deg, #0c2340, #0284c7)',
            color: '#fff', fontWeight: 800, fontSize: '0.9rem',
            cursor: 'pointer', transition: 'all .2s',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            boxShadow: '0 4px 16px rgba(2,132,199,.35)',
          }}
        >
          <i className="bi bi-stars" />
          Lancer le matching
        </button>
      </div>
    </div>
  );

  // ── LOADING ───────────────────────────────────────────────
  if (step === 'loading') return (
    <div style={{
      background: '#fff', borderRadius: 16,
      border: '1px solid #e0f2fe',
      overflow: 'hidden', animation: 'smSlide .2s ease',
    }}>
      <style>{css}</style>
      <div style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{
          width: 40, height: 40, borderRadius: 12, flexShrink: 0,
          background: '#e0f2fe', display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <span style={{
            width: 20, height: 20, border: '2.5px solid #bae6fd',
            borderTop: '2.5px solid #0284c7', borderRadius: '50%',
            display: 'inline-block', animation: 'smSpin .8s linear infinite',
          }} />
        </div>
        <div style={{ flex: 1 }}>
          <p style={{ margin: 0, fontWeight: 700, fontSize: '0.88rem', color: '#0c2340' }}>
            {['Localisation en cours…', 'Analyse des prestataires…', 'Calcul des meilleurs profils…'][loadingStep - 1] || 'Analyse…'}
          </p>
          <p style={{ margin: '2px 0 0', fontSize: '0.73rem', color: '#94a3b8' }}>
            Étape {loadingStep} / 3
          </p>
        </div>
      </div>
      {/* Barre de progression */}
      <div style={{ height: 3, background: '#e0f2fe' }}>
        <div style={{
          height: '100%',
          background: 'linear-gradient(90deg, #0c2340, #0284c7)',
          width: `${Math.round((loadingStep / 3) * 100)}%`,
          borderRadius: '0 3px 3px 0',
          transition: 'width .6s ease',
          animation: 'smBar .4s ease',
        }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', gap: 24, padding: '10px 16px' }}>
        {['Position', 'Analyse', 'Match'].map((label, i) => (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
            <div style={{
              width: 7, height: 7, borderRadius: '50%',
              background: i < loadingStep ? '#0284c7' : '#e2e8f0',
              transition: 'background .3s',
            }} />
            <span style={{
              fontSize: '0.65rem',
              color: i < loadingStep ? '#0284c7' : '#94a3b8',
              fontWeight: i + 1 === loadingStep ? 700 : 400,
            }}>{label}</span>
          </div>
        ))}
      </div>
    </div>
  );

  // ── DONE ─────────────────────────────────────────────────
  if (step === 'done') return (
    <div style={{
      background: '#f0fdf4', borderRadius: 16,
      border: '1.5px solid #bbf7d0', padding: '14px 16px',
      display: 'flex', alignItems: 'center', gap: 12,
      animation: 'smSlide .2s ease',
    }}>
      <style>{css}</style>
      <div style={{
        width: 40, height: 40, borderRadius: 12, flexShrink: 0,
        background: '#22c55e', display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <i className="bi bi-check-lg" style={{ color: '#fff', fontSize: '1.2rem' }} />
      </div>
      <div>
        <p style={{ margin: 0, fontWeight: 700, color: '#15803d', fontSize: '0.88rem' }}>Matches trouvés !</p>
        <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: '#16a34a' }}>Ouverture des résultats…</p>
      </div>
    </div>
  );

  // ── ERROR ─────────────────────────────────────────────────
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, animation: 'smSlide .2s ease' }}>
      <style>{css}</style>
      <div style={{
        background: '#fff5f5', border: '1px solid #fecaca',
        borderRadius: 12, padding: '12px 14px',
        display: 'flex', alignItems: 'flex-start', gap: 8,
      }}>
        <i className="bi bi-exclamation-triangle" style={{ color: '#ef4444', flexShrink: 0, marginTop: 1 }} />
        <p style={{ margin: 0, fontSize: '0.82rem', color: '#b91c1c', lineHeight: 1.5 }}>{error}</p>
      </div>
      <div style={{ display: 'flex', gap: 6 }}>
        <button onClick={() => setStep('form')} style={{
          flex: 1, padding: '9px', borderRadius: 10,
          border: '1.5px solid #0284c7', background: '#e0f2fe',
          color: '#0284c7', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer',
        }}>
          ← Modifier
        </button>
        <button onClick={reset} style={{
          padding: '9px 14px', borderRadius: 10,
          border: '1px solid #e2e8f0', background: '#f8fafc',
          color: '#64748b', fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer',
        }}>
          Annuler
        </button>
      </div>
    </div>
  );
};

export default SmartMatchButton;

