import { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const dropdownRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
    setDropdownOpen(false);
  };

  const isActive = (path) => location.pathname === path ? 'active' : '';

  return (
    <nav className="navbar-custom sticky-top">
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link to="/" className="navbar-brand">
          <i className="bi bi-briefcase-fill"></i> Service Market
        </Link>

        {/* Hamburger */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          style={{ display: 'none', background: 'none', border: 'none', color: 'white', fontSize: '1.4rem', cursor: 'pointer' }}
          className="navbar-toggler"
        >
          <i className={`bi bi-${menuOpen ? 'x' : 'list'}`}></i>
        </button>

        {/* Main links */}
        <ul className={`navbar-links ${menuOpen ? 'open' : ''}`} style={{
          display: 'flex', gap: '4px', alignItems: 'center', listStyle: 'none', margin: 0, padding: 0
        }}>
          <li><Link to="/" className={`nav-link ${isActive('/')}`}><i className="bi bi-house-door"></i> Accueil</Link></li>
          <li><Link to="/services" className={`nav-link ${isActive('/services')}`}><i className="bi bi-grid-3x3-gap"></i> Services</Link></li>
          <li><Link to="/prestataires" className={`nav-link ${isActive('/prestataires')}`}><i className="bi bi-people"></i> Prestataires</Link></li>
          <li><Link to="/ateliers" className={`nav-link ${isActive('/ateliers')}`}><i className="bi bi-geo-alt"></i> Ateliers</Link></li>
        </ul>

        {/* User menu */}
        <ul style={{ display: 'flex', gap: '8px', alignItems: 'center', listStyle: 'none', margin: 0, padding: 0 }}>
          {user ? (
            <li className="dropdown" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="nav-link"
                style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <div className="avatar" style={{ width: 32, height: 32, fontSize: '0.85rem' }}>
                  {user.username?.[0]?.toUpperCase()}
                </div>
                {user.username}
                <i className="bi bi-chevron-down" style={{ fontSize: '0.7rem' }}></i>
              </button>
              {dropdownOpen && (
                <ul className="dropdown-menu">
                  {user.type_compte === 'client' && (
                    <li><Link className="dropdown-item" to="/mes-reservations" onClick={() => setDropdownOpen(false)}>
                      <i className="bi bi-calendar-check"></i> Mes réservations
                    </Link></li>
                  )}
                  {user.type_compte === 'prestataire' && (<>
                    <li><Link className="dropdown-item" to="/dashboard" onClick={() => setDropdownOpen(false)}>
                      <i className="bi bi-speedometer2"></i> Dashboard
                    </Link></li>
                    <li><Link className="dropdown-item" to="/ajouter-service" onClick={() => setDropdownOpen(false)}>
                      <i className="bi bi-plus-circle"></i> Ajouter service
                    </Link></li>
                    <li><Link className="dropdown-item" to="/mes-ateliers" onClick={() => setDropdownOpen(false)}>
                      <i className="bi bi-geo-alt"></i> Mes ateliers
                    </Link></li>
                  </>)}
                  {(user.is_staff || user.type_compte === 'admin') && (
                    <li><Link className="dropdown-item" to="/admin-dashboard" onClick={() => setDropdownOpen(false)}>
                      <i className="bi bi-speedometer2"></i> Admin Dashboard
                    </Link></li>
                  )}
                  <li><Link className="dropdown-item" to="/mon-compte" onClick={() => setDropdownOpen(false)}>
                    <i className="bi bi-person"></i> Mon compte
                  </Link></li>
                  <li><div className="dropdown-divider"></div></li>
                  <li><button className="dropdown-item danger" onClick={handleLogout} style={{ width: '100%', background: 'none', border: 'none' }}>
                    <i className="bi bi-box-arrow-right"></i> Déconnexion
                  </button></li>
                </ul>
              )}
            </li>
          ) : (<>
            <li><Link to="/login" className="nav-link"><i className="bi bi-box-arrow-in-right"></i> Connexion</Link></li>
            <li><Link to="/inscription-client" className="btn-primary-custom" style={{ padding: '8px 16px', fontSize: '0.9rem' }}>
              <i className="bi bi-person-plus"></i> S'inscrire
            </Link></li>
          </>)}
        </ul>
      </div>
    </nav>
  );
}