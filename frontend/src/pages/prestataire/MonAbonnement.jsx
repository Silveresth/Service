import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';

const STYLE = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Outfit:wght@600;700;800&display=swap');

.sub-container {
  font-family: 'Plus Jakarta Sans', sans-serif;
  background: #f8fafc;
  min-height: 100vh;
  padding: 40px 0 80px;
}

.sub-header {
  margin-bottom: 36px;
  text-align: center;
}

.sub-header h2 {
  font-family: 'Outfit', sans-serif;
  font-weight: 800;
  font-size: 2.2rem;
  color: #0c2340;
  margin: 0 0 10px;
}

.sub-header p {
  color: #64748b;
  font-size: 1rem;
  max-width: 500px;
  margin: 0 auto;
}

/* CURRENT PLAN BANNER */
.sub-current-card {
  background: white;
  border-radius: 24px;
  border: 1.5px solid #e2e8f0;
  padding: 30px;
  max-width: 800px;
  margin: 0 auto 40px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 24px;
  box-shadow: 0 10px 30px rgba(12, 35, 64, 0.03);
}

.sub-current-info {
  display: flex;
  align-items: center;
  gap: 20px;
}

.sub-current-icon {
  width: 64px;
  height: 64px;
  border-radius: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
}

.sub-current-title {
  font-size: 0.8rem;
  font-weight: 700;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin: 0 0 4px;
}

.sub-current-plan-name {
  font-family: 'Outfit', sans-serif;
  font-weight: 800;
  font-size: 1.6rem;
  color: #0c2340;
  margin: 0 0 6px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.sub-current-expiry {
  color: #64748b;
  font-size: 0.85rem;
  margin: 0;
  font-weight: 500;
}

.sub-current-balance {
  text-align: right;
}

@media (max-width: 768px) {
  .sub-current-card { flex-direction: column; align-items: stretch; text-align: center; }
  .sub-current-info { flex-direction: column; }
  .sub-current-balance { text-align: center; border-top: 1.5px solid #f1f5f9; padding-top: 20px; }
}

.sub-balance-lbl {
  font-size: 0.8rem;
  color: #94a3b8;
  font-weight: 700;
  text-transform: uppercase;
  margin-bottom: 4px;
}

.sub-balance-val {
  font-family: 'Outfit', sans-serif;
  font-weight: 800;
  font-size: 1.5rem;
  color: #0d9488;
}

/* CARDS GRID */
.sub-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 28px;
  max-width: 1000px;
  margin: 0 auto;
}

.sub-card {
  background: white;
  border-radius: 28px;
  border: 1.5px solid #e2e8f0;
  padding: 36px 30px;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.02);
  transition: all 0.25s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.sub-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 20px 40px rgba(12, 35, 64, 0.06);
}

.sub-card.pro {
  border-color: #bbf7d0;
  box-shadow: 0 10px 30px rgba(34, 197, 94, 0.03);
}
.sub-card.pro:hover {
  border-color: #22c55e;
  box-shadow: 0 20px 40px rgba(34, 197, 94, 0.08);
}

.sub-card.prestige {
  border-color: #fde68a;
  box-shadow: 0 10px 30px rgba(217, 119, 6, 0.03);
}
.sub-card.prestige:hover {
  border-color: #fbbf24;
  box-shadow: 0 20px 40px rgba(217, 119, 6, 0.09);
}

.sub-badge-pop {
  position: absolute;
  top: 18px;
  right: 18px;
  background: #fef3c7;
  color: #d97706;
  font-size: 0.68rem;
  font-weight: 800;
  padding: 4px 10px;
  border-radius: 20px;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.sub-card-title {
  font-family: 'Outfit', sans-serif;
  font-weight: 800;
  font-size: 1.4rem;
  color: #0c2340;
  margin: 0 0 14px;
}

.sub-card-price {
  font-family: 'Outfit', sans-serif;
  font-weight: 900;
  font-size: 2.2rem;
  color: #0c2340;
  margin: 0 0 24px;
  display: flex;
  align-items: baseline;
  gap: 6px;
}

.sub-card-price span {
  font-size: 0.9rem;
  font-weight: 700;
  color: #64748b;
}

.sub-features-list {
  list-style: none;
  padding: 0;
  margin: 0 0 32px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  flex-grow: 1;
}

.sub-feature-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  font-size: 0.88rem;
  color: #475569;
  line-height: 1.4;
}

.sub-feature-item i {
  color: #10b981;
  font-size: 1.1rem;
}

.sub-btn-buy {
  width: 100%;
  padding: 14px 20px;
  border-radius: 14px;
  border: none;
  font-weight: 800;
  font-size: 0.92rem;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.sub-btn-buy-gratuit {
  background: #f1f5f9;
  color: #64748b;
}
.sub-btn-buy-gratuit:hover {
  background: #e2e8f0;
  color: #0c2340;
}

.sub-btn-buy-pro {
  background: linear-gradient(135deg, #22c55e, #15803d);
  color: white;
  box-shadow: 0 6px 16px rgba(34, 197, 94, 0.25);
}
.sub-btn-buy-pro:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(34, 197, 94, 0.35);
}

.sub-btn-buy-prestige {
  background: linear-gradient(135deg, #fbbf24, #d97706);
  color: white;
  box-shadow: 0 6px 16px rgba(217, 119, 6, 0.25);
}
.sub-btn-buy-prestige:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(217, 119, 6, 0.35);
}

.sub-btn-active {
  background: #f0fdf4 !important;
  color: #16a34a !important;
  border: 1.5px solid #bbf7d0 !important;
  box-shadow: none !important;
  cursor: default !important;
  font-weight: 800;
}

/* TRANSACTION MODAL */
.sub-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(12, 35, 64, 0.4);
  backdrop-filter: blur(8px);
  z-index: 999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.sub-modal-box {
  background: white;
  border-radius: 24px;
  width: 100%;
  max-width: 460px;
  box-shadow: 0 25px 50px -12px rgba(12, 35, 64, 0.25);
  border: 1px solid rgba(255,255,255,0.8);
  overflow: hidden;
  animation: slideUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.sub-modal-header {
  padding: 20px 24px;
  border-bottom: 1.5px solid #f1f5f9;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.sub-modal-header h5 {
  font-family: 'Outfit', sans-serif;
  font-weight: 800;
  font-size: 1.15rem;
  color: #0c2340;
  margin: 0;
}

.sub-modal-close {
  background: #f1f5f9;
  border: none;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #64748b;
  font-size: 1.1rem;
}

.sub-modal-body {
  padding: 24px;
}

.sub-receipt-item {
  display: flex;
  justify-content: space-between;
  padding: 10px 0;
  border-bottom: 1px dashed #e2e8f0;
  font-size: 0.88rem;
  color: #475569;
}

.sub-receipt-total {
  display: flex;
  justify-content: space-between;
  padding: 14px 0 0;
  font-weight: 800;
  color: #0c2340;
  font-size: 1rem;
}

.sub-modal-alert {
  padding: 12px 16px;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 18px;
}

.sub-modal-footer {
  padding: 16px 24px;
  background: #f8fafc;
  border-top: 1.5px solid #f1f5f9;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.sub-btn-modal-cancel {
  padding: 10px 18px;
  border-radius: 10px;
  border: 1.5px solid #cbd5e1;
  background: white;
  color: #475569;
  font-weight: 700;
  font-size: 0.84rem;
  cursor: pointer;
}

.sub-btn-modal-confirm {
  padding: 10px 18px;
  border-radius: 10px;
  border: none;
  background: #0284c7;
  color: white;
  font-weight: 700;
  font-size: 0.84rem;
  cursor: pointer;
}

.sub-toast {
  position: fixed;
  bottom: 24px;
  right: 24px;
  background: #0c2340;
  color: white;
  padding: 12px 24px;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0,0,0,0.15);
  font-weight: 700;
  font-size: 0.85rem;
  z-index: 1000;
  display: flex;
  align-items: center;
  gap: 8px;
  animation: slideUp 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) both;
}

@keyframes slideUp {
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}
`;

export default function MonAbonnement() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [buyModal, setBuyModal] = useState(null); // 'pro' or 'prestige' or 'gratuit'
  const [toastMessage, setToastMessage] = useState('');
  const navigate = useNavigate();

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  useEffect(() => {
    api.get('/prestataires/stats/')
      .then(r => setProfile(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleSubscribe = async (plan) => {
    setSubmitting(true);
    try {
      const res = await api.post('/prestataires/souscrire_abonnement/', { plan });
      setProfile(prev => ({
        ...prev,
        type_abonnement: res.data.type_abonnement,
        date_expiration_abonnement: res.data.date_expiration_abonnement,
        solde: res.data.solde
      }));
      setBuyModal(null);
      triggerToast(`Abonnement ${plan.toUpperCase()} activé avec succès !`);
    } catch (err) {
      alert(err.response?.data?.error || "Erreur de communication avec le serveur.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f8fafc' }}>
        <i className="bi bi-hourglass-split" style={{ fontSize: '3rem', color: '#0284c7', animation: 'spinRing 1.5s linear infinite' }} />
      </div>
    );
  }

  const isPro = profile.type_abonnement === 'pro';
  const isPrestige = profile.type_abonnement === 'prestige';
  const isGratuit = !isPro && !isPrestige;

  const currentPlanLabel = isPrestige ? 'Prestige' : isPro ? 'Pro' : 'Gratuit';
  const currentPlanColor = isPrestige ? '#d97706' : isPro ? '#16a34a' : '#64748b';
  const currentPlanBg = isPrestige ? '#fef3c7' : isPro ? '#f0fdf4' : '#f1f5f9';

  return (
    <>
      <style>{STYLE}</style>
      <div className="sub-container">
        <div className="container">
          
          <button 
            onClick={() => navigate('/dashboard')} 
            style={{ 
              background: 'none', border: 'none', color: '#64748b', fontWeight: 700, 
              fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', 
              gap: 8, marginBottom: 24, padding: 0 
            }}
          >
            <i className="bi bi-arrow-left" /> Retour au Dashboard
          </button>

          {/* HEADER */}
          <div className="sub-header">
            <h2>Abonnements Professionnels</h2>
            <p>Mettez en valeur vos services, réduisez vos commissions et augmentez vos limites.</p>
          </div>

          {/* CURRENT PLAN BANNER */}
          <div className="sub-current-card">
            <div className="sub-current-info">
              <div className="sub-current-icon" style={{ background: currentPlanBg, color: currentPlanColor }}>
                <i className={`bi ${isPrestige ? 'bi-gem' : isPro ? 'bi-patch-check-fill' : 'bi-award'}`} />
              </div>
              <div>
                <div className="sub-current-title">Votre forfait actuel</div>
                <h3 className="sub-current-plan-name">
                  {currentPlanLabel}
                  {isPrestige && <i className="bi bi-star-fill" style={{ color: '#fbbf24', fontSize: '1.1rem' }} />}
                  {isPro && <i className="bi bi-patch-check-fill" style={{ color: '#22c55e', fontSize: '1.1rem' }} />}
                </h3>
                {profile.date_expiration_abonnement && (
                  <p className="sub-current-expiry">
                    Expire le : <strong>{new Date(profile.date_expiration_abonnement).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</strong>
                  </p>
                )}
              </div>
            </div>
            <div className="sub-current-balance">
              <div className="sub-balance-lbl">Votre solde disponible</div>
              <div className="sub-balance-val">
                {profile.solde.toLocaleString()} <span style={{ fontSize: '0.8rem', fontWeight: 800 }}>FCFA</span>
              </div>
            </div>
          </div>

          {/* PLAN CARDS GRID */}
          <div className="sub-grid">
            
            {/* GRATUIT */}
            <div className="sub-card">
              <h4 className="sub-card-title">Gratuit</h4>
              <div className="sub-card-price">
                0 <span>FCFA / mois</span>
              </div>

              <ul className="sub-features-list">
                <li className="sub-feature-item">
                  <i className="bi bi-check-circle-fill" />
                  <span>Jusqu'à <strong>3 services</strong> actifs</span>
                </li>
                <li className="sub-feature-item">
                  <i className="bi bi-check-circle-fill" />
                  <span><strong>10%</strong> de commission par vente</span>
                </li>
                <li className="sub-feature-item">
                  <i className="bi bi-check-circle-fill" />
                  <span>Affichage carte standard</span>
                </li>
                <li className="sub-feature-item" style={{ opacity: 0.5 }}>
                  <i className="bi bi-x-circle" style={{ color: '#94a3b8' }} />
                  <span>Pas de mise en avant homepage</span>
                </li>
              </ul>

              <button className={`sub-btn-buy ${isGratuit ? 'sub-btn-active' : 'sub-btn-buy-gratuit'}`} disabled={isGratuit} onClick={() => setBuyModal('gratuit')}>
                {isGratuit ? '✓ Actif' : 'Choisir gratuit'}
              </button>
            </div>

            {/* PRO */}
            <div className="sub-card pro">
              <span className="sub-badge-pop" style={{ background: '#f0fdf4', color: '#16a34a' }}>Populaire</span>
              <h4 className="sub-card-title" style={{ color: '#15803d' }}>Professionnel</h4>
              <div className="sub-card-price">
                5 000 <span>FCFA / mois</span>
              </div>

              <ul className="sub-features-list">
                <li className="sub-feature-item">
                  <i className="bi bi-check-circle-fill" style={{ color: '#22c55e' }} />
                  <span>Jusqu'à <strong>10 services</strong> actifs</span>
                </li>
                <li className="sub-feature-item">
                  <i className="bi bi-check-circle-fill" style={{ color: '#22c55e' }} />
                  <span><strong>3%</strong> de commission seulement</span>
                </li>
                <li className="sub-feature-item">
                  <i className="bi bi-check-circle-fill" style={{ color: '#22c55e' }} />
                  <span>Badge vert <strong>PRO</strong> vérifié</span>
                </li>
                <li className="sub-feature-item">
                  <i className="bi bi-check-circle-fill" style={{ color: '#22c55e' }} />
                  <span>Mise en avant sur la <strong>homepage</strong></span>
                </li>
              </ul>

              <button className={`sub-btn-buy ${isPro ? 'sub-btn-active' : 'sub-btn-buy-pro'}`} disabled={isPro} onClick={() => setBuyModal('pro')}>
                {isPro ? '✓ Actif' : 'S\'abonner Pro'}
              </button>
            </div>

            {/* PRESTIGE */}
            <div className="sub-card prestige">
              <span className="sub-badge-pop">Prestige</span>
              <h4 className="sub-card-title" style={{ color: '#b45309' }}>Prestige</h4>
              <div className="sub-card-price">
                10 000 <span>FCFA / mois</span>
              </div>

              <ul className="sub-features-list">
                <li className="sub-feature-item">
                  <i className="bi bi-check-circle-fill" style={{ color: '#fbbf24' }} />
                  <span>Services <strong>illimités</strong></span>
                </li>
                <li className="sub-feature-item">
                  <i className="bi bi-check-circle-fill" style={{ color: '#fbbf24' }} />
                  <span><strong>0% de commission</strong> (100% pour vous)</span>
                </li>
                <li className="sub-feature-item">
                  <i className="bi bi-check-circle-fill" style={{ color: '#fbbf24' }} />
                  <span>Badge doré <strong>PRESTIGE</strong> premium</span>
                </li>
                <li className="sub-feature-item">
                  <i className="bi bi-check-circle-fill" style={{ color: '#fbbf24' }} />
                  <span>Mise en avant <strong>prioritaire</strong> max</span>
                </li>
              </ul>

              <button className={`sub-btn-buy ${isPrestige ? 'sub-btn-active' : 'sub-btn-buy-prestige'}`} disabled={isPrestige} onClick={() => setBuyModal('prestige')}>
                {isPrestige ? '✓ Actif' : 'S\'abonner Prestige'}
              </button>
            </div>

          </div>

        </div>
      </div>

      {/* TOAST MESSAGE */}
      {toastMessage && (
        <div className="sub-toast">
          <i className="bi bi-check-circle-fill" style={{ color: '#22c55e' }} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* TRANSACTION MODAL */}
      {buyModal && (
        <div className="sub-modal-overlay" onClick={() => setBuyModal(null)}>
          <div className="sub-modal-box" onClick={e => e.stopPropagation()}>
            
            <div className="sub-modal-header">
              <h5>Confirmer la transaction</h5>
              <button className="sub-modal-close" onClick={() => setBuyModal(null)}>×</button>
            </div>

            <div className="sub-modal-body">
              <p>
                Vous êtes sur le point de souscrire à la formule d'abonnement <strong>{buyModal.toUpperCase()}</strong> pour 30 jours.
              </p>

              <div style={{ background: '#f8fafc', padding: 18, borderRadius: 16, border: '1.5px solid #e2e8f0' }}>
                <div className="sub-receipt-item">
                  <span>Abonnement 30 jours</span>
                  <span>{buyModal === 'pro' ? '5 000' : buyModal === 'prestige' ? '10 000' : '0'} FCFA</span>
                </div>
                <div className="sub-receipt-total">
                  <span>Montant total débité</span>
                  <span>{buyModal === 'pro' ? '5 000' : buyModal === 'prestige' ? '10 000' : '0'} FCFA</span>
                </div>
              </div>

              {buyModal !== 'gratuit' && (
                <div className="sub-modal-alert" style={{
                  background: profile.solde >= (buyModal === 'pro' ? 5000 : 10000) ? '#f0fdf4' : '#fff5f5',
                  border: `1.5px solid ${profile.solde >= (buyModal === 'pro' ? 5000 : 10000) ? '#bbf7d0' : '#fca5a5'}`,
                  color: profile.solde >= (buyModal === 'pro' ? 5000 : 10000) ? '#16a34a' : '#dc2626'
                }}>
                  <i className={profile.solde >= (buyModal === 'pro' ? 5000 : 10000) ? 'bi bi-check-circle-fill' : 'bi-exclamation-triangle-fill'} />
                  <span>
                    {profile.solde >= (buyModal === 'pro' ? 5000 : 10000)
                      ? "Solde suffisant. Le montant sera déduit de votre solde disponible."
                      : "Solde insuffisant. Veuillez d'abord réaliser des prestations pour alimenter votre solde."}
                  </span>
                </div>
              )}
            </div>

            <div className="sub-modal-footer">
              <button className="sub-btn-modal-cancel" onClick={() => setBuyModal(null)} disabled={submitting}>
                Annuler
              </button>
              <button 
                className="sub-btn-modal-confirm" 
                onClick={() => handleSubscribe(buyModal)}
                disabled={submitting || (buyModal !== 'gratuit' && profile.solde < (buyModal === 'pro' ? 5000 : 10000))}
                style={{
                  background: buyModal === 'gratuit' ? '#64748b' : buyModal === 'pro' ? '#16a34a' : '#d97706',
                  opacity: (buyModal !== 'gratuit' && profile.solde < (buyModal === 'pro' ? 5000 : 10000)) ? 0.5 : 1
                }}
              >
                {submitting ? 'Traitement...' : 'Confirmer le débit'}
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
}
