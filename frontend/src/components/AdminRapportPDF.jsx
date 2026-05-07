import { useState } from 'react';
import api from '../api/axios';

export default function AdminRapportPDF() {
  const now = new Date();
  const [mois, setMois] = useState(now.getMonth() + 1);
  const [annee, setAnnee] = useState(now.getFullYear());
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  const moisNoms = ['','Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'];

  const downloadPDF = async () => {
    setLoading(true);
    setMsg('');
    try {
      const response = await api.get('/admin/rapport-pdf/', {
        params: { mois, annee },
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.download = `rapport_servicemarket_${annee}_${String(mois).padStart(2,'0')}.pdf`;
      link.click();
      window.URL.revokeObjectURL(url);
      setMsg(`✅ Rapport ${moisNoms[mois]} ${annee} téléchargé !`);
    } catch (err) {
      setMsg('❌ Erreur lors de la génération du rapport.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      background:'#fff', borderRadius:16,
      border:'1.5px solid #e0f2fe',
      boxShadow:'0 4px 20px rgba(2,132,199,.08)',
      padding:'20px 24px',
      maxWidth: 420,
    }}>
      <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:16 }}>
        <div style={{ width:42, height:42, borderRadius:12, background:'#fee2e2', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.3rem' }}>
          📊
        </div>
        <div>
          <div style={{ fontWeight:800, color:'#0c2340', fontSize:'1rem' }}>Rapport PDF mensuel</div>
          <div style={{ fontSize:'.78rem', color:'#64748b' }}>Statistiques complètes à télécharger</div>
        </div>
      </div>

      <div style={{ display:'flex', gap:10, marginBottom:14 }}>
        <div style={{ flex:1 }}>
          <label style={{ fontSize:'.78rem', color:'#64748b', fontWeight:600, display:'block', marginBottom:4 }}>Mois</label>
          <select
            value={mois}
            onChange={e => setMois(Number(e.target.value))}
            style={{ width:'100%', border:'1.5px solid #bae6fd', borderRadius:10, padding:'8px 10px', fontSize:'.88rem', color:'#0c2340', outline:'none' }}
          >
            {moisNoms.slice(1).map((m, i) => (
              <option key={i+1} value={i+1}>{m}</option>
            ))}
          </select>
        </div>
        <div style={{ flex:1 }}>
          <label style={{ fontSize:'.78rem', color:'#64748b', fontWeight:600, display:'block', marginBottom:4 }}>Année</label>
          <select
            value={annee}
            onChange={e => setAnnee(Number(e.target.value))}
            style={{ width:'100%', border:'1.5px solid #bae6fd', borderRadius:10, padding:'8px 10px', fontSize:'.88rem', color:'#0c2340', outline:'none' }}
          >
            {[2024, 2025, 2026].map(a => <option key={a} value={a}>{a}</option>)}
          </select>
        </div>
      </div>

      <button
        onClick={downloadPDF}
        disabled={loading}
        style={{
          width:'100%', padding:'11px', border:'none', borderRadius:12,
          background: loading ? '#94a3b8' : '#0284c7',
          color:'#fff', fontWeight:700, fontSize:'.9rem', cursor: loading ? 'not-allowed' : 'pointer',
          display:'flex', alignItems:'center', justifyContent:'center', gap:8, transition:'all .2s'
        }}
      >
        {loading ? (
          <><span style={{ width:16, height:16, borderRadius:'50%', border:'2px solid rgba(255,255,255,.4)', borderTopColor:'#fff', animation:'spin .7s linear infinite', display:'inline-block' }}></span> Génération…</>
        ) : (
          <><i className="bi bi-file-earmark-pdf-fill"></i> Télécharger le rapport</>
        )}
      </button>

      {msg && (
        <div style={{ marginTop:10, fontSize:'.82rem', color: msg.startsWith('✅') ? '#166534' : '#b91c1c', textAlign:'center', fontWeight:600 }}>
          {msg}
        </div>
      )}
    </div>
  );
}
