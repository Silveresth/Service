import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const COLORS = ['#0284c7','#10b981','#f59e0b','#ef4444','#8b5cf6'];

// ── Badge fidélité ──
const BADGES = [
  { level: 'Platine', min: 10, color: '#6366f1', bg: '#ede9fe', icon: 'bi-gem',         ring: '#a5b4fc' },
  { level: 'Or',      min: 5,  color: '#d97706', bg: '#fef3c7', icon: 'bi-trophy-fill', ring: '#fcd34d' },
  { level: 'Bronze',  min: 0,  color: '#92400e', bg: '#fde8d8', icon: 'bi-award-fill',  ring: '#fca5a5' },
];

function getBadge(servicesCount) {
  return BADGES.find(b => (servicesCount || 0) >= b.min) || BADGES[2];
}

function getPoints(stats) {
  return ((stats?.total_reservations || 0) * 10) + ((stats?.services_count || 0) * 5);
}

export default function PrestataireDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/prestataires/stats/').then(res => {
      setStats(res.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) return (
    <div style={{ minHeight:'80vh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:16 }}>
      <div style={{ width:48, height:48, borderRadius:'50%', border:'4px solid #e0f2fe', borderTopColor:'#0284c7', animation:'spin .8s linear infinite' }}></div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <p style={{ color:'#64748b' }}>Chargement analytics…</p>
    </div>
  );

  if (!stats) return (
    <div className="container py-5 text-center">
      <i className="bi bi-exclamation-triangle-fill text-warning fs-1 mb-3 d-block"></i>
      <h5>Impossible de charger les statistiques.</h5>
    </div>
  );

  const badge = getBadge(stats.services_count);
  const points = getPoints(stats);
  const nextBadge = BADGES.find(b => b.min > (stats.services_count || 0));
  const progressPct = nextBadge
    ? Math.min(100, Math.round(((stats.services_count || 0) / nextBadge.min) * 100))
    : 100;

  const labels = stats.monthly_labels || ['Jan','Fév','Mar','Avr','Mai','Juin'];
  const monthlyData = (stats.revenue_monthly || []).map((revenue, index) => ({
    month: labels[index] || `M${index+1}`,
    revenue: Number(revenue) || 0
  }));

  const pieData = (stats.top_services || []).slice(0,5).map((s, i) => ({
    name: s.nom?.substring(0,18) || `Service ${i+1}`,
    value: Number(s.revenue) || 0,
    fill: COLORS[i % COLORS.length]
  }));

  return (
    <>
      <style>{`
        .pdash-page { background:#f0f8ff; min-height:100vh; }
        /* Hero banner */
        .pdash-hero {
          background: linear-gradient(135deg,#0c2340,#0e3a6e,#0284c7);
          padding: 28px 20px 48px; color:#fff; position:relative; overflow:hidden;
        }
        .pdash-hero::before {
          content:''; position:absolute; inset:0;
          background: radial-gradient(circle at 80% 50%, rgba(255,255,255,.06) 0%, transparent 60%);
        }
        .pdash-hero-inner { max-width:1200px; margin:0 auto; position:relative; z-index:1; }
        .pdash-greeting { font-size:clamp(1.3rem,3vw,1.8rem); font-weight:800; margin-bottom:4px; }
        .pdash-sub { font-size:.9rem; opacity:.8; margin:0; }

        /* Badge fidélité card */
        .pdash-loyalty-card {
          background: rgba(255,255,255,.12); backdrop-filter:blur(12px);
          border:1px solid rgba(255,255,255,.2); border-radius:16px;
          padding:16px 20px; margin-top:20px;
          display:flex; align-items:center; gap:16px; flex-wrap:wrap;
        }
        .pdash-badge-icon {
          width:56px; height:56px; border-radius:50%;
          display:flex; align-items:center; justify-content:center;
          font-size:1.6rem; flex-shrink:0;
        }
        .pdash-loyalty-info { flex:1; min-width:160px; }
        .pdash-loyalty-title { font-weight:800; font-size:1rem; margin-bottom:4px; }
        .pdash-pts { font-size:.82rem; opacity:.85; }
        .pdash-progress-bar { height:6px; background:rgba(255,255,255,.2); border-radius:50px; margin-top:8px; overflow:hidden; }
        .pdash-progress-fill { height:100%; border-radius:50px; background:#fff; transition:width .6s ease; }

        /* Quick actions */
        .pdash-actions {
          display:grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap:16px; max-width:1200px; margin:-28px auto 0;
          padding:0 16px; position:relative; z-index:2;
        }
        @media(max-width:480px){ .pdash-actions{grid-template-columns:repeat(2,1fr)} }
        .pdash-action-card {
          background:#fff; border-radius:16px;
          box-shadow:0 4px 20px rgba(2,132,199,.1); border:1.5px solid #e0f2fe;
          padding:20px 16px; text-align:center; text-decoration:none; color:inherit;
          display:flex; flex-direction:column; align-items:center; gap:8px;
          transition:all .22s;
        }
        .pdash-action-card:hover { transform:translateY(-4px); box-shadow:0 10px 30px rgba(2,132,199,.18); border-color:#7dd3fc; color:inherit; }
        .pdash-action-icon { width:52px; height:52px; border-radius:14px; display:flex; align-items:center; justify-content:center; font-size:1.4rem; }
        .pdash-action-title { font-weight:700; font-size:.88rem; color:#0c2340; }
        .pdash-action-count { background:#e0f2fe; color:#0284c7; border-radius:50px; padding:2px 10px; font-weight:800; font-size:.8rem; }

        /* Metrics */
        .pdash-metrics {
          display:grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap:16px; max-width:1200px; margin:24px auto 0;
          padding:0 16px;
        }
        .pdash-metric {
          background:#fff; border-radius:16px;
          box-shadow:0 4px 20px rgba(2,132,199,.07); border:1.5px solid #e0f2fe;
          padding:18px; display:flex; align-items:center; gap:14px;
        }
        .pdash-metric-icon { width:48px; height:48px; border-radius:12px; display:flex; align-items:center; justify-content:center; font-size:1.3rem; flex-shrink:0; }
        .pdash-metric-lbl { font-size:.78rem; color:#64748b; font-weight:500; }
        .pdash-metric-val { font-weight:800; font-size:1.15rem; color:#0c2340; margin-bottom:2px; }
        .pdash-metric-trend { font-size:.75rem; font-weight:600; }

        /* Charts */
        .pdash-charts {
          display:grid;
          grid-template-columns: 2fr 1fr;
          gap:16px; max-width:1200px; margin:24px auto 0;
          padding:0 16px 48px;
        }
        @media(max-width:768px){ .pdash-charts{grid-template-columns:1fr} }
        .pdash-chart-card {
          background:#fff; border-radius:16px;
          box-shadow:0 4px 20px rgba(2,132,199,.07); border:1.5px solid #e0f2fe;
          overflow:hidden;
        }
        .pdash-chart-header {
          padding:16px 20px; border-bottom:1px solid #f1f5f9;
          font-weight:700; font-size:.95rem; color:#0c2340;
          display:flex; align-items:center; gap:8px;
        }
      `}</style>

      <div className="pdash-page">
        {/* Hero */}
        <div className="pdash-hero">
          <div className="pdash-hero-inner">
            <div className="pdash-greeting">
              👋 Bonjour, {user?.first_name || user?.username} !
            </div>
            <p className="pdash-sub">Voici votre tableau de bord prestataire</p>

            {/* Fidélité */}
            <div className="pdash-loyalty-card">
              <div className="pdash-badge-icon" style={{ background: badge.bg }}>
                <i className={`bi ${badge.icon}`} style={{ color: badge.color }}></i>
              </div>
              <div className="pdash-loyalty-info">
                <div className="pdash-loyalty-title">
                  Niveau {badge.level}
                  {badge.level === 'Platine' && ' 🏆'}
                </div>
                <div className="pdash-pts">
                  <strong>{points} pts</strong> accumulés &nbsp;·&nbsp;
                  {nextBadge ? `${nextBadge.min - (stats.services_count||0)} services pour niveau ${nextBadge.level}` : 'Niveau maximum atteint !'}
                </div>
                <div className="pdash-progress-bar">
                  <div className="pdash-progress-fill" style={{ width: `${progressPct}%` }}></div>
                </div>
              </div>
              <div style={{ fontSize:'.78rem', opacity:.8, flexShrink:0 }}>
                <i className="bi bi-info-circle me-1"></i>
                10 pts/réservation
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="pdash-actions">
          {[
            { to:'/prestataire-mes-services', icon:'list-check', title:'Mes Services', color:'#e0f2fe', iconColor:'#0284c7', count:stats.services_count||0 },
            { to:'/prestataire-ajouter-service', icon:'plus-circle-fill', title:'Ajouter Service', color:'#f0fdf4', iconColor:'#22c55e', count:'+' },
            { to:'/mes-reservations', icon:'calendar-check-fill', title:'Réservations', color:'#fef3c7', iconColor:'#d97706', count:stats.total_reservations||0 },
            { to:'/mes-ateliers', icon:'geo-alt-fill', title:'Ateliers', color:'#fce7f3', iconColor:'#ec4899', count:stats.ateliers_count||2 },
          ].map(a => (
            <Link key={a.to} to={a.to} className="pdash-action-card">
              <div className="pdash-action-icon" style={{ background:a.color }}>
                <i className={`bi bi-${a.icon}`} style={{ color:a.iconColor }}></i>
              </div>
              <span className="pdash-action-title">{a.title}</span>
              <span className="pdash-action-count">{a.count}</span>
            </Link>
          ))}
        </div>

        {/* Metrics */}
        <div className="pdash-metrics">
          {[
            { lbl:'Revenus totaux', val:`${(stats.total_revenue||0).toLocaleString()} FCFA`, icon:'currency-exchange', bg:'#f0fdf4', ic:'#22c55e', trend:'+12.5%' },
            { lbl:'Taux acceptation', val:`${(stats.acceptance_rate||0).toFixed(1)}%`, icon:'graph-up-arrow', bg:'#e0f2fe', ic:'#0284c7', trend:'+4.2%' },
            { lbl:'Note moyenne', val:stats.avg_note ? `${stats.avg_note.toFixed(1)} ★` : '—', icon:'star-fill', bg:'#fef3c7', ic:'#d97706', trend:`(${stats.nb_notes||0} avis)` },
            { lbl:'Services actifs', val:stats.services_count||0, icon:'briefcase-fill', bg:'#fce7f3', ic:'#ec4899', trend:`${points} pts fidélité` },
          ].map((m, i) => (
            <div key={i} className="pdash-metric">
              <div className="pdash-metric-icon" style={{ background:m.bg }}>
                <i className={`bi bi-${m.icon}`} style={{ color:m.ic }}></i>
              </div>
              <div>
                <div className="pdash-metric-lbl">{m.lbl}</div>
                <div className="pdash-metric-val">{m.val}</div>
                <div className="pdash-metric-trend" style={{ color:m.trend.startsWith('+')?'#22c55e':'#64748b' }}>{m.trend}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Charts */}
        <div className="pdash-charts">
          <div className="pdash-chart-card">
            <div className="pdash-chart-header">
              <i className="bi bi-graph-up" style={{ color:'#0284c7' }}></i>
              Évolution revenus (6 mois)
            </div>
            <div style={{ padding:'8px 0' }}>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={monthlyData} margin={{ top:10, right:20, left:0, bottom:0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="month" fontSize={12} tick={{ fill:'#64748b' }} />
                  <YAxis fontSize={12} tick={{ fill:'#64748b' }} />
                  <Tooltip formatter={v => [`${v.toLocaleString()} FCFA`,'Revenus']} contentStyle={{ borderRadius:10, border:'1px solid #e0f2fe' }} />
                  <Line type="monotone" dataKey="revenue" stroke="#0284c7" strokeWidth={3}
                    dot={{ fill:'#0284c7', r:4 }} activeDot={{ r:7 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="pdash-chart-card">
            <div className="pdash-chart-header">
              <i className="bi bi-pie-chart-fill" style={{ color:'#f59e0b' }}></i>
              Top Services
            </div>
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie data={pieData} dataKey="value" nameKey="name"
                    cx="50%" cy="50%" outerRadius={90} innerRadius={45}
                    label={({ name, percent }) => `${(percent*100).toFixed(0)}%`}
                    labelLine={false}>
                    {pieData.map((entry, i) => (
                      <Cell key={i} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip formatter={v => [`${v.toLocaleString()} FCFA`]} contentStyle={{ borderRadius:10 }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ padding:40, textAlign:'center', color:'#94a3b8' }}>
                <i className="bi bi-pie-chart" style={{ fontSize:'2rem', display:'block', marginBottom:8 }}></i>
                Aucune donnée
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}