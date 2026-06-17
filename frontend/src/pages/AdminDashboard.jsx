import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell, BarChart, Bar
} from 'recharts';
import api from '../api/axios';
import '../styles/admin.css';
import { jsPDF } from 'jspdf';

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

  const [retraits, setRetraits] = useState([]);

  useEffect(() => { 
    fetchStats();
    fetchRetraits();
  }, []);

  const fetchStats = () => {
    setLoading(true);
    api.get('/admin/stats/')
      .then(r => { setStats(r.data); setError(null); })
      .catch(() => setError('Impossible de récupérer les statistiques.'))
      .finally(() => setLoading(false));
  };

  const fetchRetraits = () => {
    api.get('/retraits/').then(r => setRetraits(r.data || [])).catch(() => {});
  };

  const validerRetrait = async (id) => {
    const note = prompt("Notes optionnelles pour le prestataire :");
    try {
      await api.post(`/retraits/${id}/valider/`, { notes_admin: note || '' });
      fetchRetraits();
      fetchStats();
    } catch { alert('Erreur lors de la validation.'); }
  };

  const rejeterRetrait = async (id) => {
    const note = prompt("Motif du rejet (obligatoire) :");
    if (!note) return;
    try {
      await api.post(`/retraits/${id}/rejeter/`, { notes_admin: note });
      fetchRetraits();
      fetchStats();
    } catch { alert('Erreur lors du rejet.'); }
  };

  const downloadPDF = () => {
    setPdfLoading(true); setPdfMsg('');
    try {
      const MOIS_LABELS = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'];
      const nomMois = MOIS_LABELS[mois - 1];
      const dateGen = new Date().toLocaleDateString('fr-FR', { day:'2-digit', month:'long', year:'numeric' });

      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const W = 210; const H = 297;
      const margin = 18;
      const contentW = W - margin * 2;

      // ── Helpers ──────────────────────────────────────────────
      const hex2rgb = hex => {
        const r = parseInt(hex.slice(1,3),16);
        const g = parseInt(hex.slice(3,5),16);
        const b = parseInt(hex.slice(5,7),16);
        return [r,g,b];
      };
      const setFill = (hex) => { const [r,g,b] = hex2rgb(hex); doc.setFillColor(r,g,b); };
      const setStroke = (hex) => { const [r,g,b] = hex2rgb(hex); doc.setDrawColor(r,g,b); };
      const setTextCol = (hex) => { const [r,g,b] = hex2rgb(hex); doc.setTextColor(r,g,b); };

      // ── PAGE 1 ── COVER ───────────────────────────────────────

      // Fond header dégradé (simulé par 2 rectangles)
      setFill('#0c2340'); doc.rect(0, 0, W, 68, 'F');
      setFill('#0284c7'); doc.rect(0, 52, W, 16, 'F');

      // Ligne accent
      setFill('#38bdf8'); doc.rect(0, 52, W, 2, 'F');

      // Logo / titre principal
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(22);
      setTextCol('#ffffff');
      doc.text('SERVICE MARKET TOGO', margin, 28);

      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      setTextCol('#93c5fd');
      doc.text('Plateforme de mise en relation prestataires & clients', margin, 36);

      // Badge "RAPPORT MENSUEL"
      setFill('#38bdf8');
      doc.roundedRect(margin, 43, 52, 8, 2, 2, 'F');
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      setTextCol('#0c2340');
      doc.text('RAPPORT MENSUEL', margin + 26, 48.2, { align: 'center' });

      // Mois / Année à droite
      doc.setFontSize(13);
      doc.setFont('helvetica', 'bold');
      setTextCol('#ffffff');
      doc.text(`${nomMois} ${annee}`, W - margin, 28, { align: 'right' });
      doc.setFontSize(8.5);
      doc.setFont('helvetica', 'normal');
      setTextCol('#93c5fd');
      doc.text(`Généré le ${dateGen}`, W - margin, 35, { align: 'right' });

      // ── KPI cards ─────────────────────────────────────────────
      const kpis = [
        { label: 'Utilisateurs',   value: stats.total_comptes,       icon: '👥', color: '#0284c7', bg: '#e0f2fe' },
        { label: 'Services actifs', value: stats.total_services,      icon: '💼', color: '#10b981', bg: '#d1fae5' },
        { label: 'Réservations',    value: stats.total_reservations,  icon: '📅', color: '#f59e0b', bg: '#fef3c7' },
        { label: 'Prestataires',    value: stats.total_prestataires,  icon: '🏆', color: '#8b5cf6', bg: '#ede9fe' },
      ];
      const cardW = (contentW - 12) / 4;
      const cardY = 76;
      kpis.forEach((k, i) => {
        const x = margin + i * (cardW + 4);
        // Card shadow (simulé)
        setFill('#e2e8f0'); doc.roundedRect(x + 0.5, cardY + 0.5, cardW, 32, 3, 3, 'F');
        // Card bg
        setFill('#ffffff'); doc.roundedRect(x, cardY, cardW, 32, 3, 3, 'F');
        // Left accent bar
        const [r,g,b] = hex2rgb(k.color);
        doc.setFillColor(r,g,b); doc.roundedRect(x, cardY, 2.5, 32, 1, 1, 'F');
        // Icon bg
        setFill(k.bg); doc.roundedRect(x + 5, cardY + 7, 12, 12, 2, 2, 'F');
        // Icon
        doc.setFontSize(8); doc.text(k.icon, x + 11, cardY + 15, { align: 'center' });
        // Value
        doc.setFont('helvetica', 'bold'); doc.setFontSize(16);
        setTextCol('#0c2340');
        doc.text(String(k.value ?? 0), x + cardW / 2 + 2, cardY + 14, { align: 'center' });
        // Label
        doc.setFont('helvetica', 'normal'); doc.setFontSize(7.5);
        setTextCol('#64748b');
        doc.text(k.label, x + cardW / 2 + 2, cardY + 22, { align: 'center' });
        // Trend
        doc.setFont('helvetica', 'bold'); doc.setFontSize(7);
        setTextCol('#22c55e');
        doc.text('+12% ce mois', x + cardW / 2 + 2, cardY + 28, { align: 'center' });
      });

      // ── Section revenus ───────────────────────────────────────
      const secY1 = cardY + 42;
      // Titre de section
      doc.setFont('helvetica', 'bold'); doc.setFontSize(8);
      setTextCol('#0284c7');
      doc.text('ÉVOLUTION DES REVENUS (6 MOIS)', margin, secY1);
      setStroke('#e0f2fe'); doc.setLineWidth(0.3);
      doc.line(margin + 72, secY1 - 1, W - margin, secY1 - 1);

      // Graphique à barres manuel
      const revenueData2 = (stats.revenue_monthly || Array(6).fill(0)).map((v, i) => ({
        month: MOIS[i], revenue: Number(v) || 0
      }));
      const chartY = secY1 + 6;
      const chartH2 = 38;
      const chartW2 = contentW;
      const maxRev = Math.max(...revenueData2.map(d => d.revenue), 1);
      const barW2 = (chartW2 - 20) / (revenueData2.length * 2 - 1);

      // Grille
      setStroke('#f1f5f9'); doc.setLineWidth(0.2);
      [0.25, 0.5, 0.75, 1].forEach(ratio => {
        const y = chartY + chartH2 - ratio * chartH2;
        doc.line(margin + 14, y, margin + chartW2, y);
        doc.setFont('helvetica', 'normal'); doc.setFontSize(6);
        setTextCol('#94a3b8');
        doc.text(`${Math.round(maxRev * ratio / 1000)}k`, margin + 12, y + 1.5, { align: 'right' });
      });

      revenueData2.forEach((d, i) => {
        const bH = (d.revenue / maxRev) * chartH2;
        const bX = margin + 14 + i * (barW2 * 2);
        const bY = chartY + chartH2 - bH;
        // Gradient simulé (2 teintes)
        setFill('#7dd3fc'); doc.roundedRect(bX, bY, barW2, bH, 1.5, 1.5, 'F');
        setFill('#0284c7'); doc.roundedRect(bX, bY, barW2, Math.min(bH, 4), 1.5, 1.5, 'F');
        // Valeur au-dessus si assez haute
        if (d.revenue > 0) {
          doc.setFont('helvetica', 'bold'); doc.setFontSize(5.5);
          setTextCol('#0284c7');
          doc.text(`${Math.round(d.revenue/1000)}k`, bX + barW2/2, bY - 1, { align: 'center' });
        }
        // Label mois
        doc.setFont('helvetica', 'normal'); doc.setFontSize(6);
        setTextCol('#64748b');
        doc.text(d.month, bX + barW2/2, chartY + chartH2 + 5, { align: 'center' });
      });

      // ── Section top services ──────────────────────────────────
      const secY2 = chartY + chartH2 + 14;
      doc.setFont('helvetica', 'bold'); doc.setFontSize(8);
      setTextCol('#0284c7');
      doc.text('TOP SERVICES DE LA PLATEFORME', margin, secY2);
      setStroke('#e0f2fe'); doc.setLineWidth(0.3);
      doc.line(margin + 72, secY2 - 1, W - margin, secY2 - 1);

      const topServices = (stats.top_services || stats.services || []).slice(0, 5);
      const maxVal = Math.max(...topServices.map(s => Number(s.revenue ?? s.prix ?? 0)), 1);
      topServices.forEach((s, i) => {
        const rowY = secY2 + 8 + i * 9;
        const val = Number(s.revenue ?? s.prix ?? 0);
        const pct = val / maxVal;
        const barMaxW = contentW - 60;

        // Rang badge
        const rankColors = ['#0284c7','#10b981','#f59e0b','#8b5cf6','#ec4899'];
        setFill(rankColors[i % rankColors.length]);
        doc.roundedRect(margin, rowY - 3.5, 6, 6, 1, 1, 'F');
        doc.setFont('helvetica', 'bold'); doc.setFontSize(6.5);
        setTextCol('#ffffff');
        doc.text(String(i + 1), margin + 3, rowY + 0.5, { align: 'center' });

        // Nom service
        doc.setFont('helvetica', 'normal'); doc.setFontSize(7.5);
        setTextCol('#0c2340');
        const nomTronc = (s.nom || `Service ${i+1}`).substring(0, 28);
        doc.text(nomTronc, margin + 9, rowY + 0.5);

        // Barre de progression
        setFill('#f1f5f9');
        doc.roundedRect(margin + 70, rowY - 2.5, barMaxW, 4.5, 1, 1, 'F');
        setFill(rankColors[i % rankColors.length] + '88');
        // Fallback: inline rgb
        const [r2,g2,b2] = hex2rgb(rankColors[i % rankColors.length]);
        doc.setFillColor(r2, g2, b2, 0.6);
        doc.roundedRect(margin + 70, rowY - 2.5, barMaxW * pct, 4.5, 1, 1, 'F');

        // Valeur
        doc.setFont('helvetica', 'bold'); doc.setFontSize(7);
        setTextCol(rankColors[i % rankColors.length]);
        doc.text(`${val.toLocaleString()} F`, W - margin, rowY + 0.5, { align: 'right' });
      });
      if (topServices.length === 0) {
        doc.setFont('helvetica', 'normal'); doc.setFontSize(8);
        setTextCol('#94a3b8');
        doc.text('Aucun service enregistré pour cette période.', margin, secY2 + 12);
      }

      // ── Section répartition ───────────────────────────────────
      const secY3 = secY2 + 10 + Math.max(topServices.length, 1) * 9;
      doc.setFont('helvetica', 'bold'); doc.setFontSize(8);
      setTextCol('#0284c7');
      doc.text('RÉPARTITION DE LA PLATEFORME', margin, secY3);
      setStroke('#e0f2fe'); doc.setLineWidth(0.3);
      doc.line(margin + 60, secY3 - 1, W - margin, secY3 - 1);

      const repart = [
        { label: 'Clients',       value: Math.max((stats.total_comptes || 0) - (stats.total_prestataires || 0), 0), color: '#0284c7' },
        { label: 'Prestataires',  value: stats.total_prestataires || 0,  color: '#10b981' },
        { label: 'Services actifs', value: stats.total_services || 0,   color: '#f59e0b' },
        { label: 'Réservations',  value: stats.total_reservations || 0, color: '#8b5cf6' },
      ];
      const total3 = repart.reduce((s, d) => s + d.value, 0) || 1;
      const repartW = (contentW - 8) / repart.length;
      repart.forEach((r, i) => {
        const x = margin + i * (repartW + 2.5);
        const y = secY3 + 5;
        const pct2 = Math.round((r.value / total3) * 100);
        // Card
        setFill('#f8fafc'); doc.roundedRect(x, y, repartW, 20, 2, 2, 'F');
        const [rr,gg,bb] = hex2rgb(r.color);
        doc.setFillColor(rr,gg,bb); doc.roundedRect(x, y, repartW, 2, 1, 1, 'F');
        // Pct
        doc.setFont('helvetica', 'bold'); doc.setFontSize(13);
        doc.setFillColor(rr,gg,bb); doc.setTextColor(rr,gg,bb);
        doc.text(`${pct2}%`, x + repartW/2, y + 11, { align: 'center' });
        // Label
        doc.setFont('helvetica', 'normal'); doc.setFontSize(6.5);
        setTextCol('#64748b');
        doc.text(r.label, x + repartW/2, y + 16.5, { align: 'center' });
        // Valeur brute
        doc.setFont('helvetica', 'bold'); doc.setFontSize(7);
        setTextCol('#0c2340');
        doc.text(String(r.value), x + repartW/2, y + 21, { align: 'center' });
      });

      // ── PAGE 2 — Tableaux détaillés ───────────────────────────
      doc.addPage();

      // Header page 2 (compact)
      setFill('#0c2340'); doc.rect(0, 0, W, 20, 'F');
      doc.setFont('helvetica', 'bold'); doc.setFontSize(11);
      setTextCol('#ffffff');
      doc.text('SERVICE MARKET TOGO', margin, 13);
      doc.setFont('helvetica', 'normal'); doc.setFontSize(8);
      setTextCol('#93c5fd');
      doc.text(`Rapport détaillé — ${nomMois} ${annee}`, W - margin, 13, { align: 'right' });
      setFill('#0284c7'); doc.rect(0, 18, W, 2, 'F');

      let curY = 30;

      // ── Table comptes ─────────────────────────────────────────
      doc.setFont('helvetica', 'bold'); doc.setFontSize(8);
      setTextCol('#0284c7');
      doc.text('INSCRIPTIONS RÉCENTES', margin, curY);
      setStroke('#e0f2fe'); doc.setLineWidth(0.3);
      doc.line(margin + 55, curY - 1, W - margin, curY - 1);
      curY += 5;

      // En-têtes tableau
      const th1 = ['#', 'Utilisateur', 'Email', 'Type', 'Statut'];
      const tw1 = [8, 45, 55, 28, 28];
      setFill('#f8fafc');
      doc.roundedRect(margin, curY, contentW, 8, 1.5, 1.5, 'F');
      setStroke('#e2e8f0'); doc.setLineWidth(0.2);
      doc.roundedRect(margin, curY, contentW, 8, 1.5, 1.5, 'S');

      doc.setFont('helvetica', 'bold'); doc.setFontSize(7);
      setTextCol('#64748b');
      let txX = margin + 3;
      th1.forEach((h, i) => { doc.text(h, txX, curY + 5); txX += tw1[i]; });
      curY += 9;

      const comptes = (stats.comptes || []).slice(0, 8);
      comptes.forEach((c, i) => {
        const rowBg = i % 2 === 0 ? '#ffffff' : '#f8fafc';
        setFill(rowBg); doc.rect(margin, curY, contentW, 7.5, 'F');
        doc.setFont('helvetica', 'normal'); doc.setFontSize(7);
        setTextCol('#0c2340');
        let cx = margin + 3;
        const nom = ((`${c.first_name||''} ${c.last_name||''}`).trim() || c.username || '—').substring(0, 22);
        const vals = [String(i+1), nom, (c.email||'—').substring(0,26), c.type_compte || 'client', c.is_active ? 'Actif' : 'Inactif'];
        vals.forEach((v, j) => {
          if (j === 3) {
            const bc = c.type_compte === 'prestataire' ? '#d1fae5' : '#e0f2fe';
            const tc = c.type_compte === 'prestataire' ? '#065f46' : '#0369a1';
            setFill(bc); doc.roundedRect(cx - 1, curY + 1.5, tw1[j] - 2, 5, 1, 1, 'F');
            setTextCol(tc); doc.setFont('helvetica', 'bold');
            doc.text(v, cx + (tw1[j]-4)/2, curY + 5, { align: 'center' });
            doc.setFont('helvetica', 'normal'); setTextCol('#0c2340');
          } else if (j === 4) {
            const dotCol = c.is_active ? '#22c55e' : '#ef4444';
            const [dr,dg,db] = hex2rgb(dotCol);
            doc.setFillColor(dr,dg,db); doc.circle(cx + 2, curY + 4, 1.5, 'F');
            setTextCol(dotCol); doc.setFont('helvetica', 'bold');
            doc.text(v, cx + 5.5, curY + 5.5);
            doc.setFont('helvetica', 'normal'); setTextCol('#0c2340');
          } else {
            doc.text(v, cx, curY + 5.5);
          }
          cx += tw1[j];
        });
        // Séparateur léger
        setStroke('#f1f5f9'); doc.setLineWidth(0.15);
        doc.line(margin, curY + 7.5, margin + contentW, curY + 7.5);
        curY += 7.5;
      });
      if (comptes.length === 0) {
        doc.setFont('helvetica', 'normal'); doc.setFontSize(8);
        setTextCol('#94a3b8');
        doc.text('Aucun compte enregistré.', margin + contentW/2, curY + 6, { align: 'center' });
        curY += 12;
      }
      curY += 10;

      // ── Table services ────────────────────────────────────────
      doc.setFont('helvetica', 'bold'); doc.setFontSize(8);
      setTextCol('#10b981');
      doc.text('SERVICES PUBLIÉS', margin, curY);
      setStroke('#d1fae5'); doc.setLineWidth(0.3);
      doc.line(margin + 40, curY - 1, W - margin, curY - 1);
      curY += 5;

      const th2 = ['#', 'Service', 'Catégorie', 'Prix (FCFA)', 'Prestataire'];
      const tw2 = [8, 52, 38, 32, 44];
      setFill('#f0fdf4'); doc.roundedRect(margin, curY, contentW, 8, 1.5, 1.5, 'F');
      setStroke('#d1fae5'); doc.roundedRect(margin, curY, contentW, 8, 1.5, 1.5, 'S');

      doc.setFont('helvetica', 'bold'); doc.setFontSize(7);
      setTextCol('#047857');
      txX = margin + 3;
      th2.forEach((h, i) => { doc.text(h, txX, curY + 5); txX += tw2[i]; });
      curY += 9;

      const services2 = (stats.services || []).slice(0, 8);
      services2.forEach((s, i) => {
        const rowBg = i % 2 === 0 ? '#ffffff' : '#f0fdf4';
        setFill(rowBg); doc.rect(margin, curY, contentW, 7.5, 'F');
        doc.setFont('helvetica', 'normal'); doc.setFontSize(7);
        setTextCol('#0c2340');
        let sx = margin + 3;
        const prest = ((`${s.prestataire?.user?.first_name||''} ${s.prestataire?.user?.last_name||''}`).trim() || s.prestataire?.user?.username || '—').substring(0, 20);
        const vals2 = [
          String(i+1),
          (s.nom||'—').substring(0, 24),
          (s.categorie?.nom||'—').substring(0, 16),
          Number(s.prix||0).toLocaleString(),
          prest,
        ];
        vals2.forEach((v, j) => {
          if (j === 3) {
            doc.setFont('helvetica', 'bold'); setTextCol('#0284c7');
            doc.text(v, sx, curY + 5.5);
            doc.setFont('helvetica', 'normal'); setTextCol('#0c2340');
          } else {
            doc.text(v, sx, curY + 5.5);
          }
          sx += tw2[j];
        });
        setStroke('#f1f5f9'); doc.setLineWidth(0.15);
        doc.line(margin, curY + 7.5, margin + contentW, curY + 7.5);
        curY += 7.5;
      });
      if (services2.length === 0) {
        doc.setFont('helvetica', 'normal'); doc.setFontSize(8);
        setTextCol('#94a3b8');
        doc.text('Aucun service enregistré.', margin + contentW/2, curY + 6, { align: 'center' });
        curY += 12;
      }

      // ── Footer ────────────────────────────────────────────────
      [1, 2].forEach(pNum => {
        doc.setPage(pNum);
        setFill('#f8fafc'); doc.rect(0, H - 12, W, 12, 'F');
        setStroke('#e2e8f0'); doc.setLineWidth(0.3);
        doc.line(0, H - 12, W, H - 12);
        doc.setFont('helvetica', 'normal'); doc.setFontSize(7);
        setTextCol('#94a3b8');
        doc.text('Service Market Togo — Plateforme de mise en relation', margin, H - 5);
        doc.text(`Rapport ${nomMois} ${annee} — Page ${pNum}/2`, W - margin, H - 5, { align: 'right' });
      });

      // ── Numérotation pages ────────────────────────────────────
      doc.save(`rapport_SM_${annee}_${String(mois).padStart(2,'0')}.pdf`);
      setPdfMsg('✅ Rapport téléchargé !');
    } catch(e) {
      console.error(e);
      setPdfMsg('❌ Erreur lors de la génération du PDF.');
    } finally {
      setPdfLoading(false);
    }
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
        @media(max-width:480px){ 
          .adash-stats{grid-template-columns:repeat(2,1fr); padding:0 10px; gap:10px} 
          .adash-stat { padding:12px 10px; gap:8px; border-radius:14px; }
          .adash-stat-icon { width:36px; height:36px; border-radius:10px; font-size:1rem; }
          .adash-stat-val { font-size:1.1rem; }
          .adash-stat-lbl { font-size:0.68rem; margin-top:1px; }
          .adash-stat-trend { font-size:0.62rem; margin-top:2px; }
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

        {/* ── Demandes de retrait ── */}
        <div className="adash-section" style={{ marginTop:28 }}>
          <div className="adash-section-title"><i className="bi bi-cash-stack"></i>Demandes de retrait</div>
          <div className="adash-table-card">
            <div className="adash-table-head">
              <i className="bi bi-clock-history" style={{ color:'#d97706' }}></i>
              Demandes en attente
            </div>
            <div style={{ overflowX:'auto' }}>
              <table className="adash-tbl">
                <thead>
                  <tr>
                    <th>Prestataire</th>
                    <th>Montant</th>
                    <th>Méthode</th>
                    <th>Numéro</th>
                    <th>Statut</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {retraits.filter(r => r.statut === 'en_attente').map(r => (
                    <tr key={r.id}>
                      <td style={{ fontWeight:700 }}>{r.prestataire_nom}</td>
                      <td style={{ color:'#0284c7', fontWeight:800 }}>{Number(r.montant).toLocaleString()} F</td>
                      <td style={{ textTransform:'uppercase', fontSize:'.75rem', fontWeight:600 }}>{r.methode}</td>
                      <td style={{ fontStyle:'italic' }}>{r.numero_paiement}</td>
                      <td>
                        <span style={{ background:'#fef3c7', color:'#d97706', padding:'3px 10px', borderRadius:50, fontSize:'.72rem', fontWeight:700 }}>
                          En attente
                        </span>
                      </td>
                      <td>
                        <div style={{ display:'flex', gap:6 }}>
                          <button onClick={() => validerRetrait(r.id)} style={{ padding:'4px 10px', background:'#d1fae5', color:'#065f46', border:'none', borderRadius:6, fontSize:'.75rem', fontWeight:700, cursor:'pointer' }}>Valider</button>
                          <button onClick={() => rejeterRetrait(r.id)} style={{ padding:'4px 10px', background:'#fee2e2', color:'#991b1b', border:'none', borderRadius:6, fontSize:'.75rem', fontWeight:700, cursor:'pointer' }}>Rejeter</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {retraits.filter(r => r.statut === 'en_attente').length === 0 && (
                    <tr><td colSpan={6} style={{ textAlign:'center', color:'#94a3b8', padding:24 }}>Aucune demande en attente</td></tr>
                  )}
                </tbody>
              </table>
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