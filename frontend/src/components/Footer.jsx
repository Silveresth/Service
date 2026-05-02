import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="footer-custom">
      <div className="container">
        {/* ✅ FIX: footer-grid au lieu de .row/.col-* mal supportées */}
        <div className="footer-grid">

          {/* About */}
          <div>
            <h5><i className="bi bi-briefcase-fill me-2"></i>Service Market</h5>
            <p style={{ color: 'rgba(255,255,255,0.5)', lineHeight: 1.7, marginBottom: 16 }}>
              Votre marketplace de confiance pour trouver les meilleurs prestataires
              de services au Togo. Qualité, fiabilité et satisfaction garantis.
            </p>
            <div style={{ display: 'flex', gap: 8 }}>
              {[
                { icon: 'facebook', color: '#1877f2' },
                { icon: 'instagram', color: '#e4405f' },
                { icon: 'linkedin', color: '#0a66c2' },
                { icon: 'twitter-x', color: '#000000' }
              ].map(social => (
                <a key={social.icon} href="#" className="social-icon" style={{ background: 'rgba(255,255,255,0.1)', color: social.color }}>
                  <i className={`bi bi-${social.icon}`}></i>
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h5>Liens rapides</h5>
            <ul>
              {[
                ['/', 'Accueil'],
                ['/services', 'Services'],
                ['/prestataires', 'Prestataires'],
                ['/register', 'Inscription'],
              ].map(([to, label]) => (
                <li key={to}>
                  <Link to={to}><i className="bi bi-chevron-right" style={{ fontSize: '0.7rem', marginRight: 6 }}></i>{label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h5>Nos services</h5>
            <ul>
              {['Plomberie', 'Électricité', 'Ménage', 'Jardinage', 'Dépannage'].map(s => (
                <li key={s}><a href="#"><i className="bi bi-chevron-right" style={{ fontSize: '0.7rem', marginRight: 6 }}></i>{s}</a></li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h5>Contact</h5>
            <ul>
              {[
                { icon: 'geo-alt-fill', text: 'Lomé, Togo', color: '#ef4444' },
                { icon: 'telephone-fill', text: '+228 90 00 00 00', color: '#10b981' },
                { icon: 'envelope-fill', text: 'contact@servicemarket.tg', color: '#0284c7' },
                { icon: 'whatsapp', text: '+228 90 00 00 00', color: '#25D366' },
              ].map(item => (
                <li key={item.icon} style={{ color: 'rgba(255,255,255,0.5)', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <i className={`bi bi-${item.icon}`} style={{ flexShrink: 0, color: item.color }}></i> {item.text}
                </li>
              ))}
            </ul>
          </div>

        </div>

        <div className="footer-bottom">
          <p>© 2024 Service Market. Tous droits réservés. Créé avec <i className="bi bi-heart-fill" style={{ color: '#e74c3c', margin: '0 4px' }}></i> au Togo</p>
        </div>
      </div>
    </footer>
  );
}
