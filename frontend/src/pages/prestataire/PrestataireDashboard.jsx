import '../../styles/prestatairedashboard.css';
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';

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
  const [retraitHistory, setRetraitHistory] = useState([]);
  const [portfolioItems, setPortfolioItems] = useState([]);
  const [portfolioFiles, setPortfolioFiles] = useState([]);
  const [portfolioDesc, setPortfolioDesc]   = useState('');
  const [portfolioUploading, setPortfolioUploading] = useState(false);
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
      api.get('/retraits/').catch(() => ({ data: [] })),
    ]).then(([s, r, rt]) => {
      setStats(s.data);
      setRes((r.data || []).slice(0, 6));
      setRetraitHistory(rt.data || []);
      setPortfolioItems(s.data.portfolio || []);
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

  const [showRetrait, setShowRetrait] = useState(false);
  const [retraitAmount, setRetraitAmount] = useState('');
  const [retraitMethode, setRetraitMethode] = useState('flooz');
  const [retraitNumero, setRetraitNumero] = useState('');
  const [retraitLoading, setRetraitLoading] = useState(false);

  const handleRetrait = async (e) => {
    e.preventDefault();
    if (!retraitAmount || Number(retraitAmount) <= 0) return showToast('Montant invalide.');
    if (Number(retraitAmount) > (stats?.solde || 0)) return showToast('Solde insuffisant.');
    
    setRetraitLoading(true);
    try {
      await api.post('/retraits/', {
        montant: retraitAmount,
        methode: retraitMethode,
        numero_paiement: retraitNumero
      });
      showToast('Demande de retrait envoyée !');
      setShowRetrait(false);
      // Rafraîchir les stats pour voir le nouveau solde
      const s = await api.get('/prestataires/stats/');
      setStats(s.data);
      const rt = await api.get('/retraits/');
      setRetraitHistory(rt.data || []);
    } catch (err) {
      showToast(err.response?.data?.detail || 'Erreur lors du retrait.');
    } finally {
      setRetraitLoading(false);
    }
  };

  const handlePortfolioAdd = async (e) => {
    e.preventDefault();
    if (portfolioFiles.length === 0) return showToast('Veuillez sélectionner au moins une image.');
    setPortfolioUploading(true);
    const data = new FormData();
    portfolioFiles.forEach(file => {
      data.append('uploaded_portfolio', file);
    });
    data.append('description', portfolioDesc);

    try {
      const res = await api.post('/prestataires/ajouter_portfolio/', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      showToast('Images ajoutées avec succès au portfolio !');
      setPortfolioItems(prev => [...prev, ...(res.data.portfolio || [])]);
      setPortfolioFiles([]);
      setPortfolioDesc('');
      // Reset input element
      const fileInput = document.getElementById('portfolio-file-input');
      if (fileInput) fileInput.value = '';
    } catch {
      showToast("Erreur lors de l'ajout au portfolio.");
    } finally {
      setPortfolioUploading(false);
    }
  };

  const handlePortfolioDelete = async (id) => {
    try {
      await api.post('/prestataires/supprimer_portfolio/', { portfolio_id: id });
      setPortfolioItems(prev => prev.filter(item => item.id !== id));
      showToast('Réalisation supprimée du portfolio.');
    } catch {
      showToast('Erreur lors de la suppression.');
    }
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
    { lbl: 'Solde disponible', val: `${(stats.solde || 0).toLocaleString()} F`, icon: 'wallet2', bg: '#f0fdf4', ic: '#22c55e', trend: 'Demander retrait', trendClass: 'up', action: () => setShowRetrait(true) },
    { lbl: 'Taux acceptation',  val: `${(stats.acceptance_rate || 0).toFixed(1)}%`,       icon: 'graph-up-arrow',    bg: '#e0f2fe', ic: '#0284c7', trend: '+4.2%',            trendClass: 'up' },
    { lbl: 'Note moyenne',      val: stats.avg_note ? `${stats.avg_note.toFixed(1)} ★` : '—', icon: 'star-fill', bg: '#fef3c7', ic: '#d97706', trend: `(${stats.nb_notes || 0} avis)`, trendClass: 'neutral' },
    { lbl: 'Points fidélité',   val: `${points} pts`,                                    icon: 'gem',               bg: '#ede9fe', ic: '#6366f1', trend: `Niveau ${badge.level}`, trendClass: 'neutral' },
  ];

  return (
    <>
      

      <div className="pd-page">

        {/* ── Hero ── */}
        <div className="pd-hero">
          <div className="pd-hero-blob1"></div>
          <div className="pd-hero-blob2"></div>
          <div className="pd-hero-inner">

            <div className="pd-greeting">
              <div className="pd-greeting-text">
                <h1>{getGreeting()}, {user?.first_name || user?.username} 👋</h1>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 8, flexWrap: 'wrap' }}>
                  <p style={{ margin: 0 }}>Voici votre tableau de bord prestataire — {now.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
                  
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(255, 255, 255, 0.1)', padding: '4px 10px', borderRadius: 20, border: '1px solid rgba(255,255,255,0.15)' }}>
                    <span style={{
                      width: 8, height: 8, borderRadius: '50%',
                      background: stats.statut_activite === 'disponible' ? '#22c55e' : stats.statut_activite === 'occupe' ? '#f59e0b' : '#94a3b8',
                      boxShadow: stats.statut_activite === 'disponible' ? '0 0 8px #22c55e' : stats.statut_activite === 'occupe' ? '0 0 8px #f59e0b' : 'none'
                    }} />
                    <select
                      value={stats.statut_activite || 'disponible'}
                      onChange={async (e) => {
                        const nextStatut = e.target.value;
                        try {
                          await api.post('/prestataires/modifier_statut/', { statut_activite: nextStatut });
                          setStats(p => ({ ...p, statut_activite: nextStatut }));
                          showToast('Statut de disponibilité mis à jour !');
                        } catch {
                          showToast('Erreur lors de la mise à jour du statut.');
                        }
                      }}
                      style={{
                        background: 'none', border: 'none', color: 'white',
                        fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer',
                        outline: 'none', paddingRight: 4
                      }}
                    >
                      <option value="disponible" style={{ color: '#0f172a' }}>Disponible immédiatement</option>
                      <option value="occupe" style={{ color: '#0f172a' }}>Occupé / En chantier</option>
                      <option value="hors_ligne" style={{ color: '#0f172a' }}>Hors ligne</option>
                    </select>
                  </div>
                </div>
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
                <div 
                  className={`pd-metric-trend ${m.trendClass}`} 
                  onClick={m.action} 
                  style={{ cursor: m.action ? 'pointer' : 'default', textDecoration: m.action ? 'underline' : 'none' }}
                >
                  {m.trend}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Modal Retrait */}
        {showRetrait && (
          <div style={{ position:'fixed', top:0, left:0, right:0, bottom:0, background:'rgba(0,0,0,0.5)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}>
            <div style={{ background:'white', borderRadius:20, padding:24, maxWidth:400, width:'100%', boxShadow:'0 20px 40px rgba(0,0,0,0.2)' }}>
              <h2 style={{ fontSize:'1.2rem', fontWeight:800, color:'#0c2340', marginBottom:6 }}>Demander un retrait</h2>
              <p style={{ fontSize:'.85rem', color:'#64748b', marginBottom:20 }}>Votre solde actuel est de <strong>{(stats?.solde || 0).toLocaleString()} F</strong></p>
              
              <form onSubmit={handleRetrait}>
                <div style={{ marginBottom:14 }}>
                  <label style={{ display:'block', fontSize:'.8rem', fontWeight:600, color:'#64748b', marginBottom:4 }}>Montant (FCFA)</label>
                  <input type="number" required value={retraitAmount} onChange={e => setRetraitAmount(e.target.value)} 
                         style={{ width:'100%', padding:12, borderRadius:10, border:'1.5px solid #e0f2fe', outline:'none' }} placeholder="Ex: 5000" />
                </div>
                
                <div style={{ marginBottom:14 }}>
                  <label style={{ display:'block', fontSize:'.8rem', fontWeight:600, color:'#64748b', marginBottom:4 }}>Méthode de paiement</label>
                  <select value={retraitMethode} onChange={e => setRetraitMethode(e.target.value)}
                          style={{ width:'100%', padding:12, borderRadius:10, border:'1.5px solid #e0f2fe', outline:'none' }}>
                    <option value="flooz">Flooz</option>
                    <option value="tmoney">T-Money / Mix</option>
                  </select>
                </div>

                <div style={{ marginBottom:20 }}>
                  <label style={{ display:'block', fontSize:'.8rem', fontWeight:600, color:'#64748b', marginBottom:4 }}>Numéro de paiement</label>
                  <input type="text" required value={retraitNumero} onChange={e => setRetraitNumero(e.target.value)} 
                         style={{ width:'100%', padding:12, borderRadius:10, border:'1.5px solid #e0f2fe', outline:'none' }} placeholder="Ex: 97430290" />
                </div>

                <div style={{ display:'flex', gap:10 }}>
                  <button type="button" onClick={() => setShowRetrait(false)} style={{ flex:1, padding:12, borderRadius:10, border:'none', background:'#f1f5f9', color:'#64748b', fontWeight:700 }}>Annuler</button>
                  <button type="submit" disabled={retraitLoading} style={{ flex:1, padding:12, borderRadius:10, border:'none', background:'#0284c7', color:'white', fontWeight:700 }}>
                    {retraitLoading ? 'Envoi...' : 'Confirmer'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

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

        {/* ── Historique des retraits ── */}
        <div className="pd-reservations" style={{ marginTop: 28 }}>
          <div className="pd-res-card">
            <div className="pd-res-head">
              <h3><i className="bi bi-cash-stack"></i> Historique des retraits</h3>
            </div>

            {retraitHistory.length === 0 ? (
              <div className="pd-res-empty" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '32px 16px', gap: 8 }}>
                <i className="bi bi-wallet" style={{ fontSize: '2.2rem', color: '#cbd5e1' }}></i>
                <p style={{ margin: 0, color: '#64748b', fontSize: '0.88rem' }}>Aucun retrait effectué pour le moment.</p>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table className="pd-res-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Montant</th>
                      <th>Méthode</th>
                      <th>Numéro</th>
                      <th>Statut</th>
                      <th>Notes Admin</th>
                    </tr>
                  </thead>
                  <tbody>
                    {retraitHistory.map(r => {
                      let badgeBg = '#fef3c7';
                      let badgeColor = '#d97706';
                      let badgeIcon = 'clock-fill';
                      let label = 'En attente';
                      if (r.statut === 'validee') {
                        badgeBg = '#d1fae5';
                        badgeColor = '#065f46';
                        badgeIcon = 'check-circle-fill';
                        label = 'Validée';
                      } else if (r.statut === 'rejetee') {
                        badgeBg = '#fee2e2';
                        badgeColor = '#991b1b';
                        badgeIcon = 'x-circle-fill';
                        label = 'Rejetée';
                      }

                      return (
                        <tr key={r.id}>
                          <td style={{ color: '#64748b', whiteSpace: 'nowrap' }}>
                            {fmt(r.date_demande)}
                          </td>
                          <td className="pd-res-amount" style={{ fontWeight: 700, color: '#0c2340' }}>
                            {Number(r.montant || 0).toLocaleString()} F
                          </td>
                          <td style={{ textTransform: 'uppercase', fontSize: '0.8rem', fontWeight: 600, color: '#475569' }}>
                            {r.methode}
                          </td>
                          <td style={{ fontStyle: 'italic', color: '#64748b' }}>
                            {r.numero_paiement}
                          </td>
                          <td>
                            <span className="pd-status-badge" style={{ background: badgeBg, color: badgeColor }}>
                              <i className={`bi bi-${badgeIcon}`}></i> {label}
                            </span>
                          </td>
                          <td style={{ color: '#64748b', fontSize: '0.8rem', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={r.notes_admin}>
                            {r.notes_admin || '—'}
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

        {/* ── Gestion du Portfolio ── */}
        <div className="pd-reservations" style={{ marginTop: 28 }}>
          <div className="pd-res-card">
            <div className="pd-res-head" style={{ justifyContent: 'space-between', display: 'flex', alignItems: 'center' }}>
              <h3><i className="bi bi-images"></i> Mon Portfolio de Réalisations</h3>
              <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>
                {portfolioItems.length} photo{portfolioItems.length > 1 ? 's' : ''} publique{portfolioItems.length > 1 ? 's' : ''}
              </span>
            </div>

            <div style={{ padding: '20px' }}>
              {/* Formulaire d'ajout */}
              <form onSubmit={handlePortfolioAdd} style={{ background: '#f8fafc', borderRadius: 16, padding: 18, border: '1px solid #e2e8f0', marginBottom: 20 }}>
                <h4 style={{ margin: '0 0 12px', fontSize: '0.88rem', fontWeight: 700, color: '#0c2340' }}>Ajouter des réalisations au portfolio</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14, alignItems: 'end' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: 6 }}>Sélectionner des images</label>
                    <input type="file" id="portfolio-file-input" multiple accept="image/*" onChange={(e) => setPortfolioFiles(Array.from(e.target.files))} style={{ fontSize: '0.8rem', width: '100%' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: 6 }}>Description courte (optionnel)</label>
                    <input type="text" placeholder="Ex: Pose de carrelage salon" value={portfolioDesc} onChange={(e) => setPortfolioDesc(e.target.value)} style={{ padding: '8px 12px', borderRadius: 10, border: '1px solid #cbd5e1', fontSize: '0.8rem', width: '100%', outline: 'none' }} />
                  </div>
                </div>
                <button type="submit" disabled={portfolioUploading} style={{ marginTop: 14, padding: '8px 16px', background: 'linear-gradient(135deg,#0284c7,#0369a1)', color: 'white', border: 'none', borderRadius: 10, fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                  {portfolioUploading ? 'Téléversement...' : <><i className="bi bi-cloud-arrow-up-fill"></i> Ajouter au portfolio</>}
                </button>
              </form>

              {/* Galerie actuelle */}
              {portfolioItems.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '30px 10px', border: '2px dashed #cbd5e1', borderRadius: 16 }}>
                  <i className="bi bi-camera" style={{ fontSize: '2rem', color: '#94a3b8', display: 'block', marginBottom: 8 }} />
                  <span style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 600 }}>Votre portfolio est vide. Ajoutez vos premières photos de réalisations ci-dessus !</span>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 14 }}>
                  {portfolioItems.map(item => (
                    <div key={item.id} style={{ position: 'relative', borderRadius: 14, overflow: 'hidden', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.03)', background: 'white' }}>
                      <div style={{ width: '100%', height: 110 }}>
                        <img src={item.image_url} alt={item.description} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                      {item.description && (
                        <div style={{ padding: '6px 8px', fontSize: '0.68rem', fontWeight: 600, color: '#475569', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={item.description}>
                          {item.description}
                        </div>
                      )}
                      <button type="button" onClick={() => handlePortfolioDelete(item.id)} style={{ position: 'absolute', top: 6, right: 6, background: 'rgba(239, 68, 68, 0.95)', border: 'none', color: 'white', width: 22, height: 22, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '0.75rem', boxShadow: '0 2px 6px rgba(0,0,0,0.15)', padding: 0 }}>
                        <i className="bi bi-trash-fill" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
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