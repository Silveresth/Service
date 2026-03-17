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
            <div style={{ display: 'flex', gap: 12 }}>
              {['facebook', 'instagram', 'linkedin', 'twitter-x'].map(icon => (
                <a key={icon} href="#" style={{ fontSize: '1.2rem' }}>
                  <i className={`bi bi-${icon}`}></i>
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
                  <Link to={to}>{label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h5>Nos services</h5>
            <ul>
              {['Plomberie', 'Électricité', 'Ménage', 'Jardinage', 'Dépannage'].map(s => (
                <li key={s}><a href="#">{s}</a></li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h5>Contact</h5>
            <ul>
              {[
                ['geo-alt', 'Lomé, Togo'],
                ['telephone', '+228 90 00 00 00'],
                ['envelope', 'contact@servicemarket.tg'],
                ['whatsapp', '+228 90 00 00 00'],
              ].map(([icon, text]) => (
                <li key={icon} style={{ color: 'rgba(255,255,255,0.5)', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <i className={`bi bi-${icon}`} style={{ flexShrink: 0 }}></i> {text}
                </li>
              ))}
            </ul>
          </div>

        </div>

        <div className="footer-bottom">
          <p>© 2024 Service Market. Tous droits réservés. Créé avec <i className="bi bi-heart-fill" style={{ color: '#e74c3c' }}></i> au Togo</p>
        </div>
      </div>
    </footer>
  );
}