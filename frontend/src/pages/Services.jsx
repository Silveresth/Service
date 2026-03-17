import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../api/axios';

export default function Services() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');

  useEffect(() => {
    const q = searchParams.get('q') || '';
    api.get(`/services/${q ? `?search=${q}` : ''}`)
      .then(res => setServices(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [searchParams]);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearchParams(query ? { q: query } : {});
  };

  if (loading) return <div style={{ textAlign:'center', padding:'80px 20px' }}>
    <i className="bi bi-hourglass-split" style={{ fontSize:'3rem', color:'var(--primary-color)' }}></i>
    <p className="mt-3 text-muted">Chargement...</p>
  </div>;

  return (
    <div className="py-5" style={{ background:'#f8fafb', minHeight:'70vh' }}>
      <div className="container">
        <div className="page-header">
          <h1><i className="bi bi-grid-3x3-gap text-primary me-2"></i>Nos Services</h1>
          <p className="text-muted">Parcourez notre catalogue de services</p>
        </div>
        <div className="mb-4">
          <form onSubmit={handleSearch} className="search-box">
            <input type="text" className="form-control" placeholder="Rechercher un service..."
              value={query} onChange={e => setQuery(e.target.value)} />
            <button type="submit" className="btn-primary-custom" style={{ flexShrink:0 }}>
              <i className="bi bi-search"></i> Rechercher
            </button>
            {searchParams.get('q') && (
              <button type="button" className="btn-secondary-custom btn-sm-custom"
                onClick={() => { setQuery(''); setSearchParams({}); }}>
                <i className="bi bi-x-lg"></i>
              </button>
            )}
          </form>
        </div>
        <p className="text-muted mb-3" style={{ fontSize:'0.9rem' }}>
          {searchParams.get('q') && <>Résultats pour "<strong>{searchParams.get('q')}</strong>" — </>}
          <strong>{services.length}</strong> service(s) trouvé(s)
        </p>
        {services.length > 0 ? (
          <div style={{ display:'flex', flexWrap:'wrap', margin:'0 -12px' }}>
            {services.map(service => (
              <div key={service.id} style={{ flex:'0 0 33.333%', maxWidth:'33.333%', padding:'0 12px 24px' }}>
                <div className="card-custom" style={{ height:'100%', display:'flex', flexDirection:'column' }}>
                  <div className="service-card-img">
                    <i className="bi bi-briefcase" style={{ fontSize:'3.5rem', color:'var(--primary-color)', opacity:0.6 }}></i>
                  </div>
                  <div className="card-body-custom" style={{ flex:1, display:'flex', flexDirection:'column' }}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
                      <span className="badge-category">{service.categorie?.nom || 'Service'}</span>
                      <span className={`badge ${service.disponibilite ? 'badge-success' : 'badge-secondary'}`}>
                        {service.disponibilite ? 'Disponible' : 'Indisponible'}
                      </span>
                    </div>
                    <h5 style={{ fontWeight:700, marginBottom:8 }}>{service.nom}</h5>
                    <p className="text-muted" style={{ fontSize:'0.9rem', flex:1, lineHeight:1.6 }}>
                      {service.description?.split(' ').slice(0,20).join(' ')}
                      {service.description?.split(' ').length > 20 ? '...' : ''}
                    </p>
                    <div style={{ display:'flex', alignItems:'center', marginBottom:12 }}>
                      <div className="avatar me-2" style={{ width:28, height:28, fontSize:'0.75rem' }}>
                        {service.prestataire?.user?.username?.[0]?.toUpperCase()}
                      </div>
                      <small className="text-muted">{service.prestataire?.user?.username}</small>
                    </div>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                      <span className="price">{service.prix} Fcfa</span>
                      <Link to={`/services/${service.id}`} className="btn-primary-custom btn-sm-custom">Voir détails</Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <i className="bi bi-inbox"></i>
            <h4>Aucun service trouvé</h4>
            <p>Essayez avec d'autres mots-clés.</p>
            <button onClick={() => { setQuery(''); setSearchParams({}); }} className="btn-primary-custom">
              Voir tous les services
            </button>
          </div>
        )}
      </div>
    </div>
  );
}