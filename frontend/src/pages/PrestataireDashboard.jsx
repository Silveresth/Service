import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const COLORS = ['#0284c7','#10b981','#f59e0b','#ef4444','#8b5cf6'];

const BADGES = [
  { level: 'Platine', min: 10, color: '#6366f1', bg: '#ede9fe', icon: 'bi-gem',         ring: 'rgba(99,102,241,0.3)' },
  { level: 'Or',      min: 5,  color: '#d97706', bg: '#fef3c7', icon: 'bi-trophy-fill', ring: 'rgba(217,119,6,0.3)' },
  { level: 'Bronze',  min: 0,  color: '#92400e', bg: '#fde8d8', icon: 'bi-award-fill',  ring: 'rgba(146,64,14,0.25)' },
];

function getBadge(n) { return BADGES.find(b => (n || 0) >= b.min) || BADGES[2]; }
function getPoints(stats) { return ((stats?.total_reservations || 0) * 10) + ((stats?.services_count || 0) * 5); }

const STATUT_LABEL = {
  en_attente:          { label: 'En attente',  color: '#d97706', bg: '#fef3c7', icon: 'clock-fill' },
  en_attente_paiement: { label: 'À payer',     color: '#2563eb', bg: '#dbeafe', icon: 'credit-card-fill' },
  confirmee:           { label: 'Confirmée',   color: '#059669', bg: '#d1fae5', icon: 'check-circle-fill' },
  terminee:            { label: 'Terminée',    color: '#059669', bg: '#d1fae5', icon: 'flag-fill' },
  annulee:             { label: 'Annulée',     color: '#dc2626', bg: '#fee2e2', icon: 'x-circle-fill' },
};

const fmt = d => d ? new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—';

const PD_STYLES = `
  /* Police uniformisée : Plus Jakarta Sans */

  .pd-page { background: #f0f8ff; min-height: 100vh; padding-bottom: 60px; }

  /* ── Hero ── */
  .pd-hero {
    background: linear-gradient(135deg, #0c2340 0%, #0e3a6e 45%, #0284c7 100%);
    padding: 32px 0 60px; color: white; position: relative; overflow: hidden;
  }
  .pd-hero-blob1 {
    position: absolute; width: 400px; height: 400px; border-radius: 50%;
    border: 1px solid rgba(255,255,255,0.06); top: -150px; right: -100px;
  }
  .pd-hero-blob2 {
    position: absolute; width: 250px; height: 250px; border-radius: 50%;
    background: radial-gradient(circle, rgba(56,189,248,0.10) 0%, transparent 70%);
    bottom: 0; left: 20%;
    animation: pd-pulse 4s ease-in-out infinite;
  }
  @keyframes pd-pulse { 0%,100%{transform:scale(1);opacity:.6} 50%{transform:scale(1.15);opacity:1} }

  .pd-hero::after {
    content: ''; position: absolute; bottom: -2px; left: 0; right: 0;
    height: 40px; background: #f0f8ff;
    clip-path: ellipse(55% 100% at 50% 100%);
  }
  .pd-hero-inner { max-width: 1200px; margin: 0 auto; padding: 0 24px; position: relative; z-index: 1; }

  /* Greeting */
  .pd-greeting { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; flex-wrap: wrap; }
  .pd-greeting-text h1 {
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: clamp(1.4rem, 3vw, 2rem); font-weight: 800; margin: 0 0 4px;

  }
  .pd-greeting-text p { margin: 0; opacity: 0.78; font-size: 0.9rem; }
  .pd-greeting-time {
    background: rgba(255,255,255,0.12); border: 1px solid rgba(255,255,255,0.18);
    border-radius: 12px; padding: 10px 16px; font-size: 0.82rem;
    backdrop-filter: blur(8px); white-space: nowrap; flex-shrink: 0;
    display: flex; align-items: center; gap: 8px;
  }

  /* Badge card */
  .pd-badge-card {
    background: rgba(255,255,255,0.10); backdrop-filter: blur(10px);
    border: 1px solid rgba(255,255,255,0.18); border-radius: 18px;
    padding: 20px 24px; margin-top: 24px;
    display: flex; align-items: center; gap: 18px; flex-wrap: wrap;
  }
  .pd-badge-ring {
    width: 60px; height: 60px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-size: 1.7rem; flex-shrink: 0;
    box-shadow: 0 0 0 4px rgba(255,255,255,0.15), 0 0 20px rgba(255,255,255,0.1);
  }
  .pd-badge-info { flex: 1; min-width: 140px; }
  .pd-badge-level { font-family: 'Plus Jakarta Sans', sans-serif; font-weight: 800; font-size: 1.05rem; margin-bottom: 3px; }


  .pd-badge-pts { font-size: 0.82rem; opacity: 0.8; margin-bottom: 8px; }
  .pd-prog-track { height: 6px; background: rgba(255,255,255,0.18); border-radius: 3px; overflow: hidden; }
  .pd-prog-fill { height: 100%; border-radius: 3px; background: white; transition: width 0.8s cubic-bezier(0.22,1,0.36,1); }
  .pd-badge-next { font-size: 0.75rem; opacity: 0.7; margin-top: 5px; }
  .pd-badge-pts-pill {
    background: rgba(255,255,255,0.15); border-radius: 50px;
    padding: 6px 14px; font-size: 0.8rem; font-weight: 700;
    flex-shrink: 0; border: 1px solid rgba(255,255,255,0.2);
    display: flex; align-items: center; gap: 7px;
  }

  /* ── Quick actions (float above hero) ── */
  .pd-actions {
    max-width: 1200px; margin: -30px auto 0;
    padding: 0 24px; position: relative; z-index: 3;
    display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 14px;
  }
  @media (max-width: 480px) { .pd-actions { grid-template-columns: repeat(2,1fr); } }

  .pd-action {
    background: white; border-radius: 18px;
    border: 1.5px solid #e0f2fe;
    box-shadow: 0 6px 24px rgba(2,132,199,0.10);
    padding: 20px 16px; text-align: center;
    text-decoration: none; color: inherit;
    display: flex; flex-direction: column; align-items: center; gap: 8px;
    transition: all 0.22s;
  }
  .pd-action:hover {
    transform: translateY(-5px);
    box-shadow: 0 14px 36px rgba(2,132,199,0.18);
    border-color: #7dd3fc; color: inherit;
  }
  .pd-action-icon {
    width: 52px; height: 52px; border-radius: 14px;
    display: flex; align-items: center; justify-content: center; font-size: 1.4rem;
  }
  .pd-action-title { font-weight: 700; font-size: 0.87rem; color: #0c2340; }
  .pd-action-badge {
    background: #e0f2fe; color: #0284c7;
    border-radius: 50px; padding: 2px 10px;
    font-weight: 800; font-size: 0.78rem;
  }

  /* ── Metrics ── */
  .pd-metrics {
    max-width: 1200px; margin: 22px auto 0; padding: 0 24px;
    display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 14px;
  }
  .pd-metric {
    background: white; border-radius: 16px;
    border: 1.5px solid #e0f2fe;
    box-shadow: 0 4px 18px rgba(2,132,199,0.07);
    padding: 18px 20px; display: flex; align-items: center; gap: 14px;
    transition: transform 0.2s, box-shadow 0.2s;
  }
  .pd-metric:hover { transform: translateY(-2px); box-shadow: 0 8px 28px rgba(2,132,199,0.13); }
  .pd-metric-ico {
    width: 50px; height: 50px; border-radius: 14px;
    display: flex; align-items: center; justify-content: center;
    font-size: 1.3rem; flex-shrink: 0;
  }
  .pd-metric-lbl { font-size: 0.76rem; color: #64748b; font-weight: 500; margin-bottom: 3px; }
  .pd-metric-val { font-family: 'Plus Jakarta Sans', sans-serif; font-weight: 800; font-size: 1.2rem; color: #0c2340; }

  .pd-metric-trend { font-size: 0.73rem; font-weight: 700; margin-top: 2px; }
  .pd-metric-trend.up   { color: #22c55e; }
  .pd-metric-trend.neutral { color: #94a3b8; }

  /* ── Charts layout ── */
  .pd-charts {
    max-width: 1200px; margin: 22px auto 0; padding: 0 24px;
    display: grid; grid-template-columns: 2fr 1fr; gap: 16px;
  }
  @media (max-width: 820px) { .pd-charts { grid-template-columns: 1fr; } }

  .pd-chart-card {
    background: white; border-radius: 18px;
    border: 1.5px solid #e0f2fe;
    box-shadow: 0 4px 18px rgba(2,132,199,0.07);
    overflow: hidden;
  }
  .pd-chart-head {
    padding: 16px 22px; border-bottom: 1px solid #f1f5f9;
    display: flex; align-items: center; justify-content: space-between;
  }
  .pd-chart-head h3 {
    font-family: 'Plus Jakarta Sans', sans-serif;

    font-size: 0.95rem; font-weight: 800; color: #0c2340;
    margin: 0; display: flex; align-items: center; gap: 8px;
  }
  .pd-chart-head i { color: #0284c7; }
  .pd-chart-pill {
    background: #e0f2fe; color: #0284c7;
    font-size: 0.72rem; font-weight: 700; border-radius: 50px;
    padding: 3px 10px;
  }

  /* ── Recent reservations ── */
  .pd-reservations {
    max-width: 1200px; margin: 22px auto 0; padding: 0 24px;
  }
  .pd-res-card {
    background: white; border-radius: 18px;
    border: 1.5px solid #e0f2fe;
    box-shadow: 0 4px 18px rgba(2,132,199,0.07);
    overflow: hidden;
  }
  .pd-res-head {
    padding: 16px 22px; border-bottom: 1px solid #f1f5f9;
    display: flex; align-items: center; justify-content: space-between;
  }
  .pd-res-head h3 {
    font-family: 'Plus Jakarta Sans', sans-serif;

    font-size: 0.95rem; font-weight: 800; color: #0c2340;
    margin: 0; display: flex; align-items: center; gap: 8px;
  }
  .pd-res-head i { color: #0284c7; }
  .pd-res-link {
    font-size: 0.8rem; font-weight: 700; color: #0284c7;
    text-decoration: none; display: flex; align-items: center; gap: 5px;
  }
  .pd-res-link:hover { color: #0369a1; }

  .pd-res-table { width: 100%; border-collapse: collapse; }
  .pd-res-table th {
    padding: 10px 16px; text-align: left;
    font-size: 0.72rem; font-weight: 700; color: #94a3b8;
    text-transform: uppercase; letter-spacing: 0.06em;
    background: #f8faff; border-bottom: 1px solid #f1f5f9;
  }
  .pd-res-table td {
    padding: 13px 16px; border-bottom: 1px solid #f8faff;
    font-size: 0.86rem; color: #374151; vertical-align: middle;
  }
  .pd-res-table tr:last-child td { border-bottom: none; }
  .pd-res-table tr:hover td { background: #f8faff; }

  .pd-res-client { display: flex; align-items: center; gap: 10px; }
  .pd-res-avatar {
    width: 36px; height: 36px; border-radius: 50%;
    background: linear-gradient(135deg, #0284c7, #38bdf8);
    display: flex; align-items: center; justify-content: center;
    color: white; font-weight: 700; font-size: 0.85rem; flex-shrink: 0;
  }
  .pd-res-client-name { font-weight: 700; color: #0c2340; font-size: 0.87rem; }
  .pd-res-client-date { font-size: 0.74rem; color: #94a3b8; margin-top: 1px; }

  .pd-status-badge {
    display: inline-flex; align-items: center; gap: 5px;
    padding: 4px 10px; border-radius: 50px;
    font-size: 0.73rem; font-weight: 700; white-space: nowrap;
  }

  .pd-res-amount { font-family: 'Plus Jakarta Sans', sans-serif; font-weight: 800; color: #0284c7; }


  .pd-confirm-btn {
    display: inline-flex; align-items: center; gap: 5px;
    padding: 6px 12px; border-radius: 8px;
    background: #d1fae5; color: #065f46;
    font-size: 0.78rem; font-weight: 700; border: none;
    cursor: pointer; font-family: inherit;
    transition: all 0.18s;
  }
  .pd-confirm-btn:hover { background: #a7f3d0; }

  .pd-res-empty {
    text-align: center; padding: 40px 24px; color: #94a3b8;
  }
  .pd-res-empty i { font-size: 2.2rem; display: block; margin-bottom: 8px; color: #bae6fd; }

  /* ── Top services ── */
  .pd-pie-legend { padding: 12px 20px 16px; }
  .pd-pie-item {
    display: flex; align-items: center; gap: 10px;
    padding: 7px 0; border-bottom: 1px solid #f8faff; font-size: 0.84rem;
  }
  .pd-pie-item:last-child { border-bottom: none; }
  .pd-pie-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }
  .pd-pie-name { flex: 1; color: #374151; font-weight: 600; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .pd-pie-rev { font-weight: 800; color: #0c2340; font-size: 0.82rem; }

  /* ── Toast ── */
  .pd-toast {
    position: fixed; bottom: 28px; left: 50%; transform: translateX(-50%);
    background: linear-gradient(135deg, #059669, #047857);
    color: white; border-radius: 14px; padding: 12px 22px;
    font-weight: 700; font-size: 0.87rem;
    z-index: 9999; box-shadow: 0 8px 28px rgba(0,0,0,0.22);
    display: flex; align-items: center; gap: 9px; white-space: nowrap;
    animation: pd-toast-up 0.3s ease;
  }
  @keyframes pd-toast-up {
    from { opacity: 0; transform: translateX(-50%) translateY(12px); }
    to   { opacity: 1; transform: translateX(-50%) translateY(0); }
  }

  /* ── Spinner ── */
  .pd-spinner {
    width: 44px; height: 44px; border-radius: 50%;
    border: 4px solid #e0f2fe; border-top-color: #0284c7;
    animation: pd-spin .8s linear infinite; margin: 0 auto 16px;
  }
  @keyframes pd-spin { to { transform: rotate(360deg); } }

  /* ── Custom tooltip ── */
  .pd-tt {
    background: white; border: 1.5px solid #e0f2fe;
    border-radius: 12px; padding: 10px 14px;
    box-shadow: 0 8px 24px rgba(2,132,199,0.14);
  }
  .pd-tt-label { font-size: 0.75rem; color: #94a3b8; font-weight: 600; margin-bottom: 4px; }
  .pd-tt-val { font-family: 'Plus Jakarta Sans', sans-serif; font-weight: 800; color: #0284c7; font-size: 0.95rem; }

`;

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="pd-tt">
      <div className="pd-tt-label">{label}</div>
      <div className="pd-tt-val">{Number(payload[0]?.value || 0).toLocaleString()} FCFA</div>
    </div>
  );
};

export default function PrestataireDashboard() {
  const { user } = useAuth();
  const [stats, setStats]           = useState(null);
  const [reservations, setRes]      = useState([]);
  const [loading, setLoading]       = useState(true);
  const [toast, setToast]           = useState('');
  const [now, setNow]               = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    Promise.all([
      api.get('/prestataires/stats/'),
      api.get('/reservations/').catch(() => ({ data: [] })),
    ]).then(([s, r]) => {
      setStats(s.data);
      setRes((r.data || []).slice(0, 6));
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const confirmerRes = async (id) => {
    try {
      await api.patch(`/reservations/${id}/`, { statut: 'confirmee' });
      setRes(prev => prev.map(r => r.id === id ? { ...r, statut: 'confirmee' } : r));
      showToast('Réservation confirmée !');
    } catch { showToast('Erreur de confirmation.'); }
  };

  const getGreeting = () => {
    const h = now.getHours();
    if (h < 12) return 'Bonjour';
    if (h < 18) return 'Bon après-midi';
    return 'Bonsoir';
  };

  if (loading) return (
    <div style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
      <style>{`.pd-spinner{width:44px;height:44px;border-radius:50%;border:4px solid #e0f2fe;border-top-color:#0284c7;animation:pd-spin .8s linear infinite}@keyframes pd-spin{to{transform:rotate(360deg)}}`}</style>
      <div className="pd-spinner"></div>
      <p style={{ color: '#64748b', fontWeight: 600 }}>Chargement du tableau de bord…</p>
    </div>
  );

  if (!stats) return (
    <div style={{ padding: 60, textAlign: 'center' }}>
      <i className="bi bi-exclamation-triangle-fill" style={{ fontSize: '2.5rem', color: '#f59e0b', display: 'block', marginBottom: 12 }}></i>
      <p style={{ color: '#64748b' }}>Impossible de charger les statistiques.</p>
    </div>
  );

  const badge      = getBadge(stats.services_count);
  const points     = getPoints(stats);
  const nextBadge  = BADGES.find(b => b.min > (stats.services_count || 0));
  const progPct    = nextBadge ? Math.min(100, Math.round(((stats.services_count || 0) / nextBadge.min) * 100)) : 100;

  const labels      = stats.monthly_labels || ['Jan','Fév','Mar','Avr','Mai','Juin'];
  const monthlyData = (stats.revenue_monthly || []).map((rev, i) => ({
    month: labels[i] || `M${i + 1}`,
    revenue: Number(rev) || 0,
  }));

  const pieData = (stats.top_services || []).slice(0, 5).map((s, i) => ({
    name: (s.nom || `Service ${i + 1}`).substring(0, 20),
    value: Number(s.revenue) || 0,
    fill: COLORS[i % COLORS.length],
  }));

  const QUICK = [
    { to: '/prestataire-mes-services',      icon: 'list-check',       title: 'Mes Services',    color: '#e0f2fe', ic: '#0284c7', count: stats.services_count || 0 },
    { to: '/prestataire-ajouter-service',   icon: 'plus-circle-fill', title: 'Ajouter Service', color: '#f0fdf4', ic: '#22c55e', count: '+' },
    { to: '/mes-reservations',              icon: 'calendar-check-fill', title: 'Réservations',  color: '#fef3c7', ic: '#d97706', count: stats.total_reservations || 0 },
    { to: '/mes-ateliers',                  icon: 'geo-alt-fill',     title: 'Ateliers',         color: '#fce7f3', ic: '#ec4899', count: stats.ateliers_count || 0 },
  ];

  const METRICS = [
    { lbl: 'Revenus totaux',    val: `${(stats.total_revenue || 0).toLocaleString()} F`, icon: 'currency-exchange', bg: '#f0fdf4', ic: '#22c55e', trend: '+12.5%',            trendClass: 'up' },
    { lbl: 'Taux acceptation',  val: `${(stats.acceptance_rate || 0).toFixed(1)}%`,       icon: 'graph-up-arrow',    bg: '#e0f2fe', ic: '#0284c7', trend: '+4.2%',            trendClass: 'up' },
    { lbl: 'Note moyenne',      val: stats.avg_note ? `${stats.avg_note.toFixed(1)} ★` : '—', icon: 'star-fill', bg: '#fef3c7', ic: '#d97706', trend: `(${stats.nb_notes || 0} avis)`, trendClass: 'neutral' },
    { lbl: 'Points fidélité',   val: `${points} pts`,                                    icon: 'gem',               bg: '#ede9fe', ic: '#6366f1', trend: `Niveau ${badge.level}`, trendClass: 'neutral' },
  ];

  return (
    <>
      <style>{PD_STYLES}</style>

      <div className="pd-page">

        {/* ── Hero ── */}
        <div className="pd-hero">
          <div className="pd-hero-blob1"></div>
          <div className="pd-hero-blob2"></div>
          <div className="pd-hero-inner">

            <div className="pd-greeting">
              <div className="pd-greeting-text">
                <h1>{getGreeting()}, {user?.first_name || user?.username} 👋</h1>
                <p>Voici votre tableau de bord prestataire — {now.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
              </div>
              <div className="pd-greeting-time">
                <i className="bi bi-clock-fill" style={{ color: '#38bdf8' }}></i>
                {now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>

            {/* Badge fidélité */}
            <div className="pd-badge-card">
              <div className="pd-badge-ring" style={{ background: badge.bg, boxShadow: `0 0 0 6px ${badge.ring}` }}>
                <i className={`bi ${badge.icon}`} style={{ color: badge.color }}></i>
              </div>
              <div className="pd-badge-info">
                <div className="pd-badge-level">
                  Niveau {badge.level}{badge.level === 'Platine' && ' 🏆'}
                </div>
                <div className="pd-badge-pts">
                  <strong>{points} pts</strong> accumulés
                </div>
                <div className="pd-prog-track">
                  <div className="pd-prog-fill" style={{ width: `${progPct}%` }}></div>
                </div>
                <div className="pd-badge-next">
                  {nextBadge
                    ? `${nextBadge.min - (stats.services_count || 0)} service(s) pour atteindre le niveau ${nextBadge.level}`
                    : '🎉 Niveau maximum atteint !'}
                </div>
              </div>
              <div className="pd-badge-pts-pill">
                <i className="bi bi-lightning-fill" style={{ color: '#fde68a' }}></i>
                10 pts / réservation
              </div>
            </div>
          </div>
        </div>

        {/* ── Quick Actions ── */}
        <div className="pd-actions">
          {QUICK.map(a => (
            <Link key={a.to} to={a.to} className="pd-action">
              <div className="pd-action-icon" style={{ background: a.color }}>
                <i className={`bi bi-${a.icon}`} style={{ color: a.ic }}></i>
              </div>
              <span className="pd-action-title">{a.title}</span>
              <span className="pd-action-badge">{a.count}</span>
            </Link>
          ))}
        </div>

        {/* ── Metrics ── */}
        <div className="pd-metrics">
          {METRICS.map((m, i) => (
            <div key={i} className="pd-metric">
              <div className="pd-metric-ico" style={{ background: m.bg }}>
                <i className={`bi bi-${m.icon}`} style={{ color: m.ic }}></i>
              </div>
              <div>
                <div className="pd-metric-lbl">{m.lbl}</div>
                <div className="pd-metric-val">{m.val}</div>
                <div className={`pd-metric-trend ${m.trendClass}`}>{m.trend}</div>
              </div>
            </div>
          ))}
        </div>

        {/* ── Charts ── */}
        <div className="pd-charts">

          {/* Area chart — revenus */}
          <div className="pd-chart-card">
            <div className="pd-chart-head">
              <h3><i className="bi bi-graph-up"></i> Évolution des revenus</h3>
              <span className="pd-chart-pill">6 derniers mois</span>
            </div>
            <div style={{ padding: '8px 4px 4px' }}>
              <ResponsiveContainer width="100%" height={270}>
                <AreaChart data={monthlyData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#0284c7" stopOpacity={0.18} />
                      <stop offset="95%" stopColor="#0284c7" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="month" fontSize={12} tick={{ fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <YAxis fontSize={11} tick={{ fill: '#94a3b8' }} axisLine={false} tickLine={false} width={55}
                    tickFormatter={v => v >= 1000 ? `${(v/1000).toFixed(0)}k` : v} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="revenue" stroke="#0284c7" strokeWidth={3}
                    fill="url(#revGrad)"
                    dot={{ fill: '#0284c7', r: 4, strokeWidth: 2, stroke: 'white' }}
                    activeDot={{ r: 7, stroke: '#0284c7', strokeWidth: 2, fill: 'white' }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Pie + legend — top services */}
          <div className="pd-chart-card">
            <div className="pd-chart-head">
              <h3><i className="bi bi-pie-chart-fill" style={{ color: '#f59e0b' }}></i> Top Services</h3>
            </div>
            {pieData.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie data={pieData} dataKey="value" nameKey="name"
                      cx="50%" cy="50%" outerRadius={76} innerRadius={38}
                      paddingAngle={3} startAngle={90} endAngle={-270}>
                      {pieData.map((e, i) => <Cell key={i} fill={e.fill} />)}
                    </Pie>
                    <Tooltip formatter={v => [`${Number(v).toLocaleString()} FCFA`]} contentStyle={{ borderRadius: 10, border: '1px solid #e0f2fe' }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="pd-pie-legend">
                  {pieData.map((e, i) => (
                    <div key={i} className="pd-pie-item">
                      <div className="pd-pie-dot" style={{ background: e.fill }}></div>
                      <span className="pd-pie-name">{e.name}</span>
                      <span className="pd-pie-rev">{e.value.toLocaleString()} F</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div style={{ padding: 40, textAlign: 'center', color: '#94a3b8' }}>
                <i className="bi bi-pie-chart" style={{ fontSize: '2.2rem', display: 'block', marginBottom: 10, color: '#bae6fd' }}></i>
                <p style={{ margin: 0, fontSize: '0.87rem' }}>Aucune donnée disponible</p>
              </div>
            )}
          </div>
        </div>

        {/* ── Recent Reservations ── */}
        <div className="pd-reservations">
          <div className="pd-res-card">
            <div className="pd-res-head">
              <h3><i className="bi bi-calendar-check-fill"></i> Réservations récentes</h3>
              <Link to="/mes-reservations" className="pd-res-link">
                Voir tout <i className="bi bi-arrow-right"></i>
              </Link>
            </div>

            {reservations.length === 0 ? (
              <div className="pd-res-empty">
                <i className="bi bi-calendar-x"></i>
                <p>Aucune réservation récente.</p>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table className="pd-res-table">
                  <thead>
                    <tr>
                      <th>Client</th>
                      <th>Service</th>
                      <th>Date</th>
                      <th>Montant</th>
                      <th>Statut</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {reservations.map(r => {
                      const s = STATUT_LABEL[r.statut] || STATUT_LABEL.en_attente;
                      const clientNom = `${r.client?.first_name || ''} ${r.client?.last_name || ''}`.trim() || r.client?.username || 'Client';
                      const initials  = clientNom.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
                      return (
                        <tr key={r.id}>
                          <td>
                            <div className="pd-res-client">
                              <div className="pd-res-avatar">{initials}</div>
                              <div>
                                <div className="pd-res-client-name">{clientNom}</div>
                                <div className="pd-res-client-date">{fmt(r.created_at)}</div>
                              </div>
                            </div>
                          </td>
                          <td style={{ fontWeight: 600, color: '#0c2340', maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {r.service?.nom || '—'}
                          </td>
                          <td style={{ color: '#64748b', whiteSpace: 'nowrap' }}>
                            {r.date_debut ? fmt(r.date_debut) : '—'}
                          </td>
                          <td className="pd-res-amount">
                            {Number(r.montant || 0).toLocaleString()} F
                          </td>
                          <td>
                            <span className="pd-status-badge" style={{ background: s.bg, color: s.color }}>
                              <i className={`bi bi-${s.icon}`}></i> {s.label}
                            </span>
                          </td>
                          <td>
                            {r.statut === 'en_attente' && (
                              <button className="pd-confirm-btn" onClick={() => confirmerRes(r.id)}>
                                <i className="bi bi-check-lg"></i> Confirmer
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Toast */}
      {toast && (
        <div className="pd-toast">
          <i className="bi bi-check-circle-fill"></i> {toast}
        </div>
      )}
    </>
  );
}