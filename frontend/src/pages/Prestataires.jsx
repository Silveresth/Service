import { useEffect, useState } from 'react';
import api from '../api/axios';

export default function Prestataires() {
  const [prestataires, setPrestataires] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { api.get('/prestataires/').then(r => setPrestataires(r.data)).catch(console.error).finally(() => setLoading(false)); }, []);
  if (loading) return <div style={{ textAlign:'center', padding:80 }}><i className="bi bi-hourglass-split" style={{ fontSize:'3rem', color:'var(--primary-color)' }}></i></div>;
  return (
    <div className="py-5" style={{ background:'#f8fafb', minHeight:'70vh' }}>
      <div className="container">
        <div style={{ textAlign:'center', marginBottom:40 }}>
          <h1><i className="bi bi-people text-primary me-2"></i>Nos Prestataires</h1>
          <p className="text-muted">Découvrez les professionnels qui vous entourent</p>
        </div>
        {prestataires.length > 0 ? (
          <div style={{ display:'flex', flexWrap:'wrap', margin:'0 -12px' }}>
            {prestataires.map(p => (
              <div key={p.user?.id} style={{ flex:'0 0 33.333%', maxWidth:'33.333%', padding:'0 12px 24px' }}>
                <div className="card-custom" style={{ textAlign:'center', padding:32 }}>
                  <div className="avatar avatar-lg" style={{ margin:'0 auto 16px' }}>
                    {p.user?.username?.[0]?.toUpperCase()}
                  </div>
                  <h5 style={{ fontWeight:700 }}>{p.user?.first_name} {p.user?.last_name}</h5>
                  <p className="text-muted">{p.user?.username}</p>
                  <span className="badge badge-success mb-3"><i className="bi bi-check-circle me-1"></i>Prestataire vérifié</span>
                  <p><strong>Spécialité:</strong> {p.specialite}</p>
                  <a href={`https://wa.me/228${p.user?.telephone || '90000000'}?text=Bonjour, je suis intéressé(e) par vos services.`}
                    target="_blank" rel="noreferrer" className="btn-whatsapp btn-sm-custom mt-3" style={{ display:'inline-flex' }}>
                    <i className="bi bi-whatsapp"></i> Contacter
                  </a>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state"><i className="bi bi-people"></i><h4>Aucun prestataire</h4><p>Aucun prestataire disponible.</p></div>
        )}
      </div>
    </div>
  );
}