import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell, BarChart, Bar
} from 'recharts';
import api from '../api/axios';
import '../styles/admin.css';

const COLORS = ['#0284c7','#10b981','#f59e0b','#8b5cf6','#ef4444'];

// ── Animated counter ──
function AnimatedNumber({ value, duration = 1200 }) {
  const [display, setDisplay] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    const start = performance.now();
    const end = Number(value) || 0;
    const step = (ts) => {
      const progress = Math.min((ts - start) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(ease * end));
      if (progress < 1) ref.current = requestAnimationFrame(step);
    };
    ref.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(ref.current);
  }, [value, duration]);
  return <span>{display.toLocaleString()}</span>;
}

const MOIS = ['Jan','Fév','Mar','Avr','Mai','Juin','Juil','Aoû','Sep','Oct','Nov','Déc'];

const QUICK_LINKS = [
  { to:'/admin/all-comptes',       icon:'people-fill',      label:'Comptes',       desc:'Gérer les utilisateurs',    color:'#0284c7', bg:'#e0f2fe' },
  { to:'/admin/all-services',     icon:'briefcase-fill',   label:'Services',      desc:'Tous les services',         color:'#10b981', bg:'#d1fae5' },
  { to:'/admin/all-reservations', icon:'calendar-check',   label:'Réservations',  desc:'Historique complet',        color:'#f59e0b', bg:'#fef3c7' },
  { to:'/admin/all-paiements',    icon:'credit-card-fill', label:'Paiements',     desc:'Toutes les transactions',   color:'#8b5cf6', bg:'#ede9fe' },
  { to:'/admin/all-evaluations',  icon:'star-fill',        label:'Évaluations',   desc:'Avis et notes clients',     color:'#ec4899', bg:'#fce7f3' },
  { to:'/admin/all-categories',   icon:'tags-fill',        label:'Catégories',    desc:'Types de services',         color:'#6366f1', bg:'#e0e7ff' },
  { to:'/admin/all-ateliers',     icon:'geo-alt-fill',     label:'Ateliers',      desc:'Localisations',             color:'#14b8a6', bg:'#ccfbf1' },
];


export default function AdminDashboard() {
  const [stats, setStats]   = useState({ services:[], comptes:[], total_comptes:0, total_services:0, total_reservations:0, total_prestataires:0 });
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState(null);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfMsg, setPdfMsg]         = useState('');
  const [mois, setMois]     = useState(new Date().getMonth() + 1);
  const [annee, setAnnee]   = useState(new Date().getFullYear());

  useEffect(() => { fetchStats(); }, []);

  const fetchStats = () => {
    setLoading(true);
    api.get('/admin/stats/')
      .then(r => { setStats(r.data); setError(null); })
      .catch(() => setError('Impossible de récupérer les statistiques.'))
      .finally(() => setLoading(false));
  };

  const downloadPDF = async () => {
    setPdfLoading(true); setPdfMsg('');
    try {
      const res = await api.get('/admin/rapport-pdf/', { params:{ mois, annee }, responseType:'blob' });
      const url = URL.createObjectURL(new Blob([res.data], { type:'application/pdf' }));
      const a = document.createElement('a');
      a.href = url;
      a.download = `rapport_${annee}_${String(mois).padStart(2,'0')}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      setPdfMsg('✅ Rapport téléchargé !');
    } catch {
      setPdfMsg('❌ Erreur de génération. Vérifiez que reportlab est installé.');
    } finally { setPdfLoading(false); }
  };

  // Données charts
  const revenueData = (stats.revenue_monthly || Array(6).fill(0)).map((v, i) => ({
    month: MOIS[i], revenue: Number(v) || 0,
  }));

  const pieData = (stats.top_services || []).slice(0,5).map((s, i) => ({
    name: (s.nom || `Service ${i+1}`).substring(0,16),
    value: Number(s.revenue ?? s.prix ?? 0) || (i+1)*1000,
    fill: COLORS[i],
  }));

  const barData = [
    { name:'Comptes',       value: stats.total_comptes || 0 },
    { name:'Services',      value: stats.total_services || 0 },
    { name:'Réservations',  value: stats.total_reservations || 0 },
    { name:'Prestataires',  value: stats.total_prestataires || 0 },
  ];

  if (loading) return (
    <div className="admin-page">
      <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', minHeight:'60vh', gap:16 }}>
        <div className="admin-loading-spinner"></div>
        <p style={{ color:'#64748b', fontWeight:500 }}>Chargement du dashboard…</p>
      </div>
    </div>
  );

  return (
    <>
      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
        @keyframes shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.6} }
        .adash-fade { animation: fadeUp .4s ease both; }
        .adash-fade:nth-child(1){animation-delay:.05s} .adash-fade:nth-child(2){animation-delay:.1s}
        .adash-fade:nth-child(3){animation-delay:.15s} .adash-fade:nth-child(4){animation-delay:.2s}

        /* Hero */
        .adash-hero {
          background: linear-gradient(135deg, #0c2340 0%, #0e3a6e 60%, #0284c7 100%);
          padding: 32px 24px 56px; color:#fff; position:relative; overflow:hidden;
          margin-bottom:-32px;
        }
        .adash-hero::before {
          content:''; position:absolute; top:-60px; right:-60px;
          width:280px; height:280px; border-radius:50%;
          background:rgba(255,255,255,.04); pointer-events:none;
        }
        .adash-hero::after {
          content:''; position:absolute; bottom:-80px; left:-40px;
          width:200px; height:200px; border-radius:50%;
          background:rgba(255,255,255,.03); pointer-events:none;
        }
        .adash-hero-inner { max-width:1400px; margin:0 auto; display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:16px; position:relative; z-index:1; }
        .adash-hero h1 { font-size:clamp(1.4rem,3vw,2rem); font-weight:800; margin:0 0 4px; }
        .adash-hero p  { font-size:.88rem; opacity:.75; margin:0; }
        .adash-hero-btns { display:flex; gap:10px; flex-wrap:wrap; }
        .adash-btn-white {
          background:#fff; color:#0284c7; border:none; border-radius:12px;
          padding:10px 18px; font-weight:700; font-size:.85rem;
          cursor:pointer; display:flex; align-items:center; gap:7px;
          text-decoration:none; transition:all .2s; white-space:nowrap;
        }
        .adash-btn-white:hover { background:#e0f2fe; color:#0284c7; transform:translateY(-1px); }

        /* Stat cards */
        .adash-stats {
          display:grid; grid-template-columns:repeat(4,1fr);
          gap:16px; max-width:1400px; margin:0 auto;
          padding:0 24px; position:relative; z-index:2;
        }
        @media(max-width:900px){ .adash-stats{grid-template-columns:repeat(2,1fr)} }
        @media(max-width:480px){ .adash-stats{grid-template-columns:1fr; padding:0 12px} }

        .adash-stat {
          background:#fff; border-radius:20px;
          box-shadow:0 4px 24px rgba(2,132,199,.1); border:1.5px solid #e0f2fe;
          padding:20px; display:flex; align-items:center; gap:14px;
          transition:all .25s; cursor:default;
        }
        .adash-stat:hover { transform:translateY(-4px); box-shadow:0 12px 32px rgba(2,132,199,.18); border-color:#7dd3fc; }
        .adash-stat-icon { width:52px; height:52px; border-radius:14px; display:flex; align-items:center; justify-content:center; font-size:1.4rem; flex-shrink:0; }
        .adash-stat-val  { font-size:1.6rem; font-weight:800; color:#0c2340; line-height:1; }
        .adash-stat-lbl  { font-size:.78rem; color:#64748b; margin-top:3px; font-weight:500; }
        .adash-stat-trend{ font-size:.72rem; font-weight:600; margin-top:4px; }

        /* Section wrapper */
        .adash-section { max-width:1400px; margin:24px auto 0; padding:0 24px; }
        @media(max-width:480px){ .adash-section{padding:0 12px} }
        .adash-section-title {
          font-size:.7rem; font-weight:700; text-transform:uppercase;
          letter-spacing:.1em; color:#0284c7; margin-bottom:14px;
          display:flex; align-items:center; gap:8px;
        }
        .adash-section-title::after { content:''; flex:1; height:1px; background:#e0f2fe; }

        /* Quick links */
        .adash-quick {
          display:grid; grid-template-columns:repeat(auto-fill, minmax(180px,1fr));
          gap:12px;
        }
        .adash-quick-card {
          background:#fff; border-radius:16px; border:1.5px solid #e0f2fe;
          box-shadow:0 2px 12px rgba(2,132,199,.06);
          padding:16px; text-decoration:none; color:inherit;
          display:flex; flex-direction:column; align-items:center; gap:10px;
          text-align:center; transition:all .22s;
        }
        .adash-quick-card:hover { transform:translateY(-4px); box-shadow:0 10px 28px rgba(2,132,199,.16); border-color:#7dd3fc; color:inherit; }
        .adash-quick-icon { width:48px; height:48px; border-radius:14px; display:flex; align-items:center; justify-content:center; font-size:1.3rem; }
        .adash-quick-label { font-weight:700; font-size:.85rem; color:#0c2340; }
        .adash-quick-desc  { font-size:.72rem; color:#94a3b8; margin-top:-4px; }

        /* Charts grid */
        .adash-charts { display:grid; grid-template-columns:2fr 1fr; gap:16px; }
        @media(max-width:768px){ .adash-charts{grid-template-columns:1fr} }

        .adash-chart-card {
          background:#fff; border-radius:16px; border:1.5px solid #e0f2fe;
          box-shadow:0 4px 20px rgba(2,132,199,.07); overflow:hidden;
        }
        .adash-chart-header {
          padding:14px 18px; border-bottom:1px solid #f1f5f9;
          font-weight:700; font-size:.9rem; color:#0c2340;
          display:flex; align-items:center; gap:8px;
        }

        /* PDF card */
        .adash-pdf {
          background: linear-gradient(135deg, #0c2340, #0284c7);
          border-radius:20px; padding:24px; color:#fff;
          display:flex; align-items:center; gap:20px; flex-wrap:wrap;
        }
        .adash-pdf-icon { font-size:2.5rem; flex-shrink:0; }
        .adash-pdf-title { font-weight:800; font-size:1.05rem; margin-bottom:4px; }
        .adash-pdf-sub   { font-size:.8rem; opacity:.8; }
        .adash-pdf-controls { display:flex; gap:8px; align-items:center; margin-top:12px; flex-wrap:wrap; }
        .adash-pdf-select {
          background:rgba(255,255,255,.15); border:1px solid rgba(255,255,255,.25);
          color:#fff; border-radius:10px; padding:7px 12px; font-size:.82rem;
          outline:none; cursor:pointer;
        }
        .adash-pdf-select option { color:#0c2340; background:#fff; }
        .adash-pdf-btn {
          background:#fff; color:#0284c7; border:none; border-radius:10px;
          padding:8px 18px; font-weight:700; font-size:.85rem;
          cursor:pointer; display:flex; align-items:center; gap:7px;
          transition:all .2s; white-space:nowrap;
        }
        .adash-pdf-btn:hover { background:#e0f2fe; }
        .adash-pdf-btn:disabled { background:rgba(255,255,255,.4); cursor:not-allowed; }

        /* Recent tables */
        .adash-recent { display:grid; grid-template-columns:1fr 1fr; gap:16px; }
        @media(max-width:768px){ .adash-recent{grid-template-columns:1fr} }
        .adash-table-card { background:#fff; border-radius:16px; border:1.5px solid #e0f2fe; box-shadow:0 4px 20px rgba(2,132,199,.07); overflow:hidden; }
        .adash-table-head { padding:14px 18px; border-bottom:1px solid #f1f5f9; font-weight:700; font-size:.9rem; color:#0c2340; display:flex; align-items:center; gap:8px; }
        table.adash-tbl { width:100%; border-collapse:collapse; font-size:.83rem; }
        table.adash-tbl th { padding:10px 16px; background:#f8fafc; color:#64748b; font-weight:600; font-size:.72rem; text-transform:uppercase; letter-spacing:.05em; text-align:left; }
        table.adash-tbl td { padding:11px 16px; border-top:1px solid #f1f5f9; color:#0c2340; vertical-align:middle; }
        table.adash-tbl tr:hover td { background:#f0f9ff; }

        .adash-spinner { width:16px; height:16px; border:2px solid rgba(2,132,199,.2); border-top-color:#0284c7; border-radius:50%; animation:spin .7s linear infinite; display:inline-block; }
        @keyframes spin { to{transform:rotate(360deg)} }
      `}</style>

      <div className="admin-page" style={{ padding:0, paddingBottom:48 }}>

        {/* ── Hero ── */}
        <div className="adash-hero">
          <div className="adash-hero-inner">
            <div>
              <h1>⚡ Dashboard Admin</h1>
              <p>Vue d'ensemble en temps réel — Service Market Togo</p>
            </div>
            <div className="adash-hero-btns">
              <a href={'http://127.0.0.1:8000/admin/login/?next=/admin/'} target="_blank" rel="noopener noreferrer" className="adash-btn-white">
                <i className="bi bi-gear-fill"></i> Django Admin
              </a>
              <Link to="/" className="adash-btn-white" style={{ background:'rgba(255,255,255,.15)', color:'#fff', border:'1px solid rgba(255,255,255,.25)' }}>
                <i className="bi bi-house"></i> Site
              </Link>
            </div>
          </div>
        </div>

        {/* ── Stats cards ── */}
        <div className="adash-stats" style={{ marginTop:32 }}>
          {[
            { label:'Utilisateurs',   value:stats.total_comptes,      icon:'people-fill',    bg:'#e0f2fe', ic:'#0284c7', trend:'+12%' },
            { label:'Services actifs',value:stats.total_services,     icon:'briefcase-fill', bg:'#d1fae5', ic:'#10b981', trend:'+8%' },
            { label:'Réservations',   value:stats.total_reservations, icon:'calendar-check-fill', bg:'#fef3c7', ic:'#d97706', trend:'+24%' },
            { label:'Prestataires',   value:stats.total_prestataires, icon:'person-badge-fill',   bg:'#ede9fe', ic:'#8b5cf6', trend:'+5%' },
          ].map((s,i) => (
            <div key={i} className="adash-stat adash-fade">
              <div className="adash-stat-icon" style={{ background:s.bg }}>
                <i className={`bi bi-${s.icon}`} style={{ color:s.ic }}></i>
              </div>
              <div>
                <div className="adash-stat-val"><AnimatedNumber value={s.value} /></div>
                <div className="adash-stat-lbl">{s.label}</div>
                <div className="adash-stat-trend" style={{ color:'#22c55e' }}>{s.trend} ce mois</div>
              </div>
            </div>
          ))}
        </div>

        {/* ── Quick links ── */}
        <div className="adash-section" style={{ marginTop:32 }}>
          <div className="adash-section-title"><i className="bi bi-grid-fill"></i>Accès rapide</div>
          <div className="adash-quick">
            {QUICK_LINKS.map((q,i) => (
              <Link key={i} to={q.to} className="adash-quick-card adash-fade">
                <div className="adash-quick-icon" style={{ background:q.bg }}>
                  <i className={`bi bi-${q.icon}`} style={{ color:q.color }}></i>
                </div>
                <div className="adash-quick-label">{q.label}</div>
                <div className="adash-quick-desc">{q.desc}</div>
              </Link>
            ))}
          </div>
        </div>

        {/* ── Charts ── */}
        <div className="adash-section" style={{ marginTop:28 }}>
          <div className="adash-section-title"><i className="bi bi-bar-chart-fill"></i>Analytiques</div>
          <div className="adash-charts">
            {/* Area chart revenus */}
            <div className="adash-chart-card">
              <div className="adash-chart-header">
                <i className="bi bi-graph-up" style={{ color:'#0284c7' }}></i>
                Évolution revenus (6 mois)
              </div>
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={revenueData} margin={{ top:10, right:20, left:0, bottom:0 }}>
                  <defs>
                    <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#0284c7" stopOpacity={0.15}/>
                      <stop offset="95%" stopColor="#0284c7" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9"/>
                  <XAxis dataKey="month" fontSize={11} tick={{ fill:'#94a3b8' }} axisLine={false} tickLine={false}/>
                  <YAxis fontSize={11} tick={{ fill:'#94a3b8' }} axisLine={false} tickLine={false}/>
                  <Tooltip formatter={v => [`${Number(v).toLocaleString()} FCFA`,'Revenus']} contentStyle={{ borderRadius:10, border:'1px solid #e0f2fe', fontSize:'.82rem' }}/>
                  <Area type="monotone" dataKey="revenue" stroke="#0284c7" strokeWidth={2.5} fill="url(#revGrad)" dot={{ fill:'#0284c7', r:3 }} activeDot={{ r:6 }}/>
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Pie top services */}
            <div className="adash-chart-card">
              <div className="adash-chart-header">
                <i className="bi bi-pie-chart-fill" style={{ color:'#f59e0b' }}></i>
                Top services
              </div>
              {pieData.length > 0 ? (
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie data={pieData} dataKey="value" cx="50%" cy="50%" outerRadius={85} innerRadius={40}
                      label={({ percent }) => `${(percent*100).toFixed(0)}%`} labelLine={false}>
                      {pieData.map((e,i) => <Cell key={i} fill={e.fill}/>)}
                    </Pie>
                    <Tooltip formatter={v => [`${Number(v).toLocaleString()} FCFA`]} contentStyle={{ borderRadius:10, fontSize:'.82rem' }}/>
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div style={{ padding:40, textAlign:'center', color:'#94a3b8' }}>
                  <i className="bi bi-pie-chart" style={{ fontSize:'2.5rem', display:'block', marginBottom:8 }}></i>
                  Pas encore de données
                </div>
              )}
            </div>
          </div>

          {/* Bar chart global */}
          <div className="adash-chart-card" style={{ marginTop:16 }}>
            <div className="adash-chart-header">
              <i className="bi bi-bar-chart-fill" style={{ color:'#10b981' }}></i>
              Vue globale de la plateforme
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={barData} margin={{ top:10, right:20, left:0, bottom:0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9"/>
                <XAxis dataKey="name" fontSize={11} tick={{ fill:'#94a3b8' }} axisLine={false} tickLine={false}/>
                <YAxis fontSize={11} tick={{ fill:'#94a3b8' }} axisLine={false} tickLine={false}/>
                <Tooltip contentStyle={{ borderRadius:10, border:'1px solid #e0f2fe', fontSize:'.82rem' }}/>
                <Bar dataKey="value" radius={[6,6,0,0]}>
                  {barData.map((e,i) => <Cell key={i} fill={COLORS[i % COLORS.length]}/>)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ── Rapport PDF ── */}
        <div className="adash-section" style={{ marginTop:28 }}>
          <div className="adash-section-title"><i className="bi bi-file-earmark-pdf-fill"></i>Rapport mensuel</div>
          <div className="adash-pdf">
            <div className="adash-pdf-icon">📊</div>
            <div style={{ flex:1 }}>
              <div className="adash-pdf-title">Télécharger le rapport PDF</div>
              <div className="adash-pdf-sub">Statistiques complètes, revenus et activité de la plateforme</div>
              <div className="adash-pdf-controls">
                <select className="adash-pdf-select" value={mois} onChange={e => setMois(Number(e.target.value))}>
                  {['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre']
                    .map((m,i) => <option key={i+1} value={i+1}>{m}</option>)}
                </select>
                <select className="adash-pdf-select" value={annee} onChange={e => setAnnee(Number(e.target.value))}>
                  {[2024,2025,2026].map(a => <option key={a} value={a}>{a}</option>)}
                </select>
                <button className="adash-pdf-btn" onClick={downloadPDF} disabled={pdfLoading}>
                  {pdfLoading
                    ? <><span className="adash-spinner"></span> Génération…</>
                    : <><i className="bi bi-download"></i> Télécharger PDF</>
                  }
                </button>
                {pdfMsg && <span style={{ fontSize:'.8rem', fontWeight:600, opacity:.9 }}>{pdfMsg}</span>}
              </div>
            </div>
          </div>
        </div>

        {/* ── Tableaux récents ── */}
        <div className="adash-section" style={{ marginTop:28 }}>
          <div className="adash-section-title"><i className="bi bi-clock-history"></i>Activité récente</div>
          <div className="adash-recent">
            {/* Derniers comptes */}
            <div className="adash-table-card">
              <div className="adash-table-head">
                <i className="bi bi-person-plus" style={{ color:'#0284c7' }}></i>
                Inscriptions récentes
              </div>
              <div style={{ overflowX:'auto' }}>
                <table className="adash-tbl">
                  <thead><tr><th>Utilisateur</th><th>Type</th><th>Statut</th></tr></thead>
                  <tbody>
                    {(stats.comptes || []).slice(0,6).map(c => (
                      <tr key={c.id}>
                        <td>
                          <div style={{ fontWeight:700 }}>{(`${c.first_name||''} ${c.last_name||''}`).trim() || c.username}</div>
                          <div style={{ fontSize:'.72rem', color:'#94a3b8' }}>@{c.username}</div>
                        </td>
                        <td>
                          <span style={{
                            background: c.type_compte==='prestataire' ? '#d1fae5' : '#e0f2fe',
                            color: c.type_compte==='prestataire' ? '#065f46' : '#0369a1',
                            borderRadius:50, padding:'3px 10px', fontSize:'.72rem', fontWeight:700
                          }}>
                            {c.type_compte || 'client'}
                          </span>
                        </td>
                        <td>
                          <i className={`bi bi-circle-fill`} style={{ fontSize:'.5rem', color: c.is_active ? '#22c55e' : '#ef4444', marginRight:5 }}></i>
                          <span style={{ fontSize:'.8rem' }}>{c.is_active ? 'Actif' : 'Bloqué'}</span>
                        </td>
                      </tr>
                    ))}
                    {(!stats.comptes || stats.comptes.length === 0) && (
                      <tr><td colSpan={3} style={{ textAlign:'center', color:'#94a3b8', padding:24 }}>Aucune donnée</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Derniers services */}
            <div className="adash-table-card">
              <div className="adash-table-head">
                <i className="bi bi-stars" style={{ color:'#f59e0b' }}></i>
                Derniers services publiés
              </div>
              <div style={{ overflowX:'auto' }}>
                <table className="adash-tbl">
                  <thead><tr><th>Service</th><th>Prix</th><th>Prestataire</th></tr></thead>
                  <tbody>
                    {(stats.services || []).slice(0,6).map(s => (
                      <tr key={s.id}>
                        <td style={{ fontWeight:700 }}>{s.nom}</td>
                        <td style={{ color:'#0284c7', fontWeight:700 }}>{Number(s.prix).toLocaleString()} F</td>
                        <td style={{ fontSize:'.8rem', color:'#64748b' }}>
                          {(`${s.prestataire?.user?.first_name||''} ${s.prestataire?.user?.last_name||''}`).trim() || s.prestataire?.user?.username || '—'}
                        </td>
                      </tr>
                    ))}
                    {(!stats.services || stats.services.length === 0) && (
                      <tr><td colSpan={3} style={{ textAlign:'center', color:'#94a3b8', padding:24 }}>Aucun service</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="adash-section" style={{ marginTop:16 }}>
            <div style={{ background:'#fee2e2', color:'#991b1b', borderRadius:12, padding:'12px 16px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
              <span><i className="bi bi-exclamation-triangle-fill me-2"></i>{error}</span>
              <button onClick={fetchStats} style={{ background:'#ef4444', color:'#fff', border:'none', borderRadius:8, padding:'6px 14px', fontWeight:700, cursor:'pointer' }}>Réessayer</button>
            </div>
          </div>
        )}

      </div>
    </>
  );
}