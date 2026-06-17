import { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

export default function Navbar() {
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef(null);
  const notifRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    setMenuOpen(false);
    setDropdownOpen(false);
    setNotifOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setDropdownOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
    };
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, []);

  useEffect(() => {
    if (!user) return;
    
    // Charger les notifications initiales
    api.get('/notifications/').then(r => {
      setNotifications(r.data || []);
      setUnreadCount((r.data || []).filter(n => !n.lue).length);
    }).catch(() => {});

    // Connexion WebSocket pour les notifications temps réel
    const token = localStorage.getItem('token');
    const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
    const host = window.location.host === 'localhost:3000' ? 'localhost:8000' : window.location.host;
    const wsUrl = `${protocol}://${host}/ws/notifications/?token=${token}`;
    
    const ws = new WebSocket(wsUrl);

    ws.onmessage = (e) => {
      const data = JSON.parse(e.data);
      if (data.type === 'notification') {
        // Ajouter la nouvelle notification en haut de la liste
        const newNotif = {
          id: Date.now(), // Fallback ID pour la UI avant refresh
          message: data.message,
          type: data.notif_type,
          lue: false,
          created_at: data.created_at || new Date().toISOString()
        };
        setNotifications(prev => [newNotif, ...prev]);
        setUnreadCount(prev => prev + 1);

        // Optionnel: petit feedback sonore ou toast
        if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
          new Notification("Service Market", { body: data.message });
        }
      }
    };

    ws.onclose = () => {
      console.log("Notification WebSocket closed. Retrying in 5s...");
      // Reconnexion automatique optionnelle ici
    };

    return () => ws.close();
  }, [user]);

  const handleLogout = () => { logout(); navigate('/'); };

  const isActive = (path) => location.pathname === path ? 'active' : '';

  const markAsRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/`, { lue: true });
      setNotifications(notifications.map(n => n.id === id ? { ...n, lue: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (e) {}
  };

  return (
    <nav className="navbar-custom sticky-top">
      <div className="navbar-inner">
        <Link to="/" className="navbar-brand">
          <img src="/SM.jpg" alt="SM" style={{ height: 34, width: 34, borderRadius: 8, objectFit: 'cover' }} />
          <span className="brand-text">Services Market</span>
        </Link>

        <div className="navbar-links-wrapper">
          <ul className="navbar-links">
            <li><Link to="/" className={`nav-link ${isActive('/')}`}><i className="bi bi-house-door"></i> <span>Accueil</span></Link></li>
            <li><Link to="/services" className={`nav-link ${isActive('/services')}`}><i className="bi bi-grid-3x3-gap"></i> <span>Services</span></Link></li>
            <li><Link to="/prestataires" className={`nav-link ${isActive('/prestataires')}`}><i className="bi bi-people"></i> <span>Prestataires</span></Link></li>
            <li><Link to="/ateliers" className={`nav-link ${isActive('/ateliers')}`}><i className="bi bi-geo-alt"></i> <span>Ateliers</span></Link></li>
          </ul>
        </div>

        <div className="navbar-actions">
          {user && (
            <div style={{ position: 'relative' }} ref={notifRef}>
              <button onClick={() => setNotifOpen(!notifOpen)} className="navbar-icon-btn">
                <i className="bi bi-bell" style={{ fontSize: '1.2rem' }}></i>
                {unreadCount > 0 && (
                  <span className="notif-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
                )}
              </button>
              {notifOpen && (
                <div className="notif-dropdown">
                  <div className="notif-header">
                    <span style={{ fontWeight: 700 }}>Notifications</span>
                    <span className="badge badge-primary">{unreadCount}</span>
                  </div>
                  <div className="notif-list" style={{ maxHeight: '350px', overflowY: 'auto' }}>
                    {notifications.length === 0 ? (
                      <div style={{ padding: '24px', textAlign: 'center', color: '#94a3b8' }}>
                        <i className="bi bi-bell-slash" style={{ fontSize: '1.5rem', display: 'block', marginBottom: 8 }}></i>
                        Aucune notification
                      </div>
                    ) : (
                      notifications.map(n => (
                        <div key={n.id} 
                             className={`notif-item ${!n.lue ? 'unread' : ''}`}
                             onClick={() => markAsRead(n.id)}
                             style={{ padding: '14px 16px', borderBottom: '1px solid #f1f5f9', cursor: 'pointer', background: n.lue ? 'white' : '#f0f9ff' }}>
                          <div style={{ display: 'flex', gap: 10 }}>
                            <div style={{ width: 8, height: 8, borderRadius: '50%', background: n.lue ? 'transparent' : '#0284c7', marginTop: 6, flexShrink: 0 }}></div>
                            <div>
                              <div style={{ fontSize: '0.85rem', color: '#0c2340', fontWeight: n.lue ? 400 : 600, lineHeight: 1.4 }}>{n.message}</div>
                              <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: 4 }}>
                                {new Date(n.date_creation).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {user ? (
            <div className="dropdown" ref={dropdownRef}>
              <button onClick={() => setDropdownOpen(!dropdownOpen)} style={{ background:'none', border:'none', cursor:'pointer', display:'flex', alignItems:'center', gap:8, padding:'4px 8px' }}>
                <div className="avatar" style={{ width:32, height:32, fontSize:'0.85rem' }}>{user.username?.[0]?.toUpperCase()}</div>
                <span className="username-label" style={{ color:'#fff', fontSize:'0.85rem', fontWeight: 500 }}>{user.username}</span>
              </button>
              {dropdownOpen && (
                <ul className="dropdown-menu">
                  <li><Link className="dropdown-item" to="/mon-compte"><i className="bi bi-person-gear"></i> Mon profil</Link></li>
                  <li><Link className="dropdown-item" to="/mes-reservations"><i className="bi bi-calendar-check"></i> Mes réservations</Link></li>
                  {(user.is_prestataire || user.type_utilisateur === 'prestataire' || user.is_staff) && (
                    <li><Link className="dropdown-item" to="/prestataire-dashboard"><i className="bi bi-speedometer2"></i> Tableau de bord Pro</Link></li>
                  )}
                  {user.is_staff && <li><Link className="dropdown-item" to="/admin-dashboard"><i className="bi bi-shield-check"></i> Administration</Link></li>}
                  <li><hr className="dropdown-divider" /></li>
                  <li><button className="dropdown-item danger" onClick={handleLogout}><i className="bi bi-box-arrow-right"></i> Déconnexion</button></li>
                </ul>
              )}
            </div>
          ) : (
            <div style={{ display:'flex', gap:6 }}>
              <Link to="/login" className="btn-outline-primary-custom" style={{ padding:'6px 12px', fontSize:'0.75rem' }}>Login</Link>
              <Link to="/register" className="btn-primary-custom" style={{ padding:'6px 12px', fontSize:'0.75rem' }}>Sign Up</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

