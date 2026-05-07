import { useState, useEffect } from 'react';
import api from '../api/axios';

const STATUT_COLOR = { confirme: '#16a34a', pending: '#d97706', echoue: '#dc2626' };
const STATUT_BG    = { confirme: '#f0fdf4', pending: '#fffbeb', echoue: '#fef2f2' };
const STATUT_LABEL = { confirme: 'Confirmé', pending: 'En attente', echoue: 'Échoué' };

export default function AdminAllPaiements() {
  const [paiements, setPaiements] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);
  const [search, setSearch]       = useState('');

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true); setError(null);
    try {
      const res = await api.get('/admin/all_paiements/');
      const data = res.data?.results ?? res.data ?? [];
      setPaiements(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.response?.data?.detail || 'Erreur lors du chargement des paiements');
    } finally { setLoading(false); }
  };

  const fmt = (d) => d
    ? new Date(d).toLocaleString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    : '-';

  const filtered = paiements.filter(p => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      p.transaction_ref?.toLowerCase().includes(q) ||
      p.service_nom?.toLowerCase().includes(q) ||
      p.client_nom?.toLowerCase().includes(q) ||
      p.prestataire_nom?.toLowerCase().includes(q) ||
      p.methode?.toLowerCase().includes(q)
    );
  });

  const totalConfirme = paiements.filter(p => p.statut === 'confirme')
    .reduce((s, p) => s + parseFloat(p.montant_total || 0), 0);
  // Si montant_frais est 0 (ancien paiement), on le recalcule à partir du montant_total
  const getFrais = (p) => parseFloat(p.montant_frais) || Math.round(parseFloat(p.montant_total || 0) * 0.03);
  const totalFrais = paiements.filter(p => p.statut === 'confirme')
    .reduce((s, p) => s + getFrais(p), 0);

  if (loading) return (
    <div className="admin-page"><div className="admin-container">
      <div className="admin-loading">
        <div className="admin-loading-spinner"></div>
        <p className="admin-loading-text">Chargement des paiements...</p>
      </div>
    </div></div>
  );

  if (error) return (
    <div className="admin-page"><div className="admin-container">
      <div className="admin-header"><h1><i className="bi bi-credit-card"></i> Tous les Paiements</h1></div>
      <div className="admin-alert admin-alert-danger">
        <i className="bi bi-exclamation-triangle"></i>
        <span>{error}</span>
        <button onClick={load} className="btn btn-sm btn-outline-danger ms-auto">Réessayer</button>
      </div>
    </div></div>
  );

  return (
    <div className="admin-page">
      <div className="admin-container">

        <div className="admin-header">
          <h1><i className="bi bi-credit-card-fill" style={{ color: '#0284c7' }}></i> Tous les Paiements</h1>
          <p>{paiements.length} paiement{paiements.length !== 1 ? 's' : ''} au total</p>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 14, marginBottom: 24 }}>
          {[
            { label: 'Total paiements', value: paiements.length, icon: 'bi-list-ul', color: '#0284c7' },
            { label: 'Confirmés', value: paiements.filter(p => p.statut === 'confirme').length, icon: 'bi-check-circle', color: '#16a34a' },
            { label: 'En attente', value: paiements.filter(p => p.statut === 'pending').length, icon: 'bi-clock', color: '#d97706' },
            { label: 'Volume confirmé', value: `${totalConfirme.toLocaleString()} F`, icon: 'bi-cash-stack', color: '#7c3aed' },
            { label: 'Frais collectés', value: `${totalFrais.toLocaleString()} F`, icon: 'bi-percent', color: '#ea580c' },
          ].map(s => (
            <div key={s.label} className="admin-card" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: `${s.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <i className={`bi ${s.icon}`} style={{ color: s.color, fontSize: '1.2rem' }}></i>
              </div>
              <div>
                <div style={{ fontSize: '1.3rem', fontWeight: 900, color: s.color, lineHeight: 1 }}>{s.value}</div>
                <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: 2 }}>{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Search */}
        <div className="admin-card" style={{ padding: '14px 20px', marginBottom: 16 }}>
          <div style={{ position: 'relative' }}>
            <i className="bi bi-search" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }}></i>
            <input
              type="text"
              placeholder="Rechercher par référence, service, client, prestataire..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ width: '100%', padding: '10px 14px 10px 36px', border: '1.5px solid #e5e7eb', borderRadius: 10, fontSize: '0.9rem', outline: 'none' }}
            />
          </div>
        </div>

        {/* Table */}
        <div className="admin-card">
          <div className="admin-card-header">
            <h2 className="admin-card-title">
              <i className="bi bi-table"></i> Liste des paiements ({filtered.length})
            </h2>
          </div>
          <div className="admin-card-body">
            {filtered.length === 0 ? (
              <div className="admin-empty">
                <div className="admin-empty-icon"><i className="bi bi-credit-card"></i></div>
                <p className="admin-empty-title">Aucun paiement trouvé</p>
              </div>
            ) : (
              <div className="admin-table-wrapper">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Référence</th>
                      <th>Service</th>
                      <th>Client</th>
                      <th>Prestataire</th>
                      <th>Méthode</th>
                      <th>Montant total</th>
                      <th>Frais (3%)</th>
                      <th>Statut</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((p, idx) => (
                      <tr key={p.id}>
                        <td style={{ color: '#9ca3af', fontSize: '0.8rem' }}>{idx + 1}</td>

                        <td>
                          <code style={{ fontSize: '0.78rem', background: '#f1f5f9', padding: '2px 6px', borderRadius: 4 }}>
                            {p.transaction_ref || p.tx_reference_paygate || `#${p.id}`}
                          </code>
                        </td>

                        <td>
                          <strong style={{ color: '#0c2340', fontSize: '0.88rem' }}>
                            {p.service_nom || '-'}
                          </strong>
                        </td>

                        <td>
                          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span style={{ width:26, height:26, borderRadius:'50%', background:'#dbeafe', color:'#1d4ed8',
                              display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, fontSize:'0.72rem', flexShrink:0 }}>
                              {p.client_nom?.[0]?.toUpperCase() || 'C'}
                            </span>
                            <span style={{ fontSize: '0.85rem' }}>{p.client_nom || '-'}</span>
                          </span>
                        </td>

                        <td>
                          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span style={{ width:26, height:26, borderRadius:'50%', background:'#e0f2fe', color:'#0284c7',
                              display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, fontSize:'0.72rem', flexShrink:0 }}>
                              {p.prestataire_nom?.[0]?.toUpperCase() || 'P'}
                            </span>
                            <span style={{ fontSize: '0.85rem' }}>{p.prestataire_nom || '-'}</span>
                          </span>
                        </td>

                        <td>
                          <span style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 6, padding: '3px 8px', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase' }}>
                            {p.methode || '-'}
                          </span>
                        </td>

                        <td>
                          <strong style={{ color: '#0c2340' }}>
                            {parseFloat(p.montant_total || 0).toLocaleString()} F
                          </strong>
                        </td>

                        <td style={{ color: '#ea580c', fontWeight: 600 }}>
                          {getFrais(p).toLocaleString()} F
                        </td>

                        <td>
                          <span style={{
                            background: STATUT_BG[p.statut] || '#f8fafc',
                            color: STATUT_COLOR[p.statut] || '#6b7280',
                            borderRadius: 20, padding: '4px 10px',
                            fontSize: '0.78rem', fontWeight: 700,
                            border: `1px solid ${STATUT_COLOR[p.statut] || '#e5e7eb'}30`,
                          }}>
                            {STATUT_LABEL[p.statut] || p.statut}
                          </span>
                        </td>

                        <td style={{ fontSize: '0.8rem', color: '#6b7280', whiteSpace: 'nowrap' }}>
                          {fmt(p.date_paiement)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}