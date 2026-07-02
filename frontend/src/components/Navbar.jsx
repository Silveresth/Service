import { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const NAVBAR_STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Outfit:wght@600;700;800&display=swap');

@keyframes nb-fadeDown {
  from { opacity: 0; transform: translateY(-8px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes nb-slideIn {
  from { opacity: 0; transform: translateX(-12px); }
  to   { opacity: 1; transform: translateX(0); }
}
@keyframes nb-pulse-dot {
  0%, 100% { transform: scale(1); opacity: 1; }
  50%       { transform: scale(1.4); opacity: 0.7; }
}

/* ── Root navbar ── */
.nb-root {
  position: sticky;
  top: 0;
  z-index: 200;
  font-family: 'Plus Jakarta Sans', sans-serif;
}

.nb-bar {
  background: rgba(6, 13, 25, 0.92);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.35);
  padding-top: env(safe-area-inset-top, 0px);
  padding-left: env(safe-area-inset-left, 0px);
  padding-right: env(safe-area-inset-right, 0px);
  transition: background 0.3s;
}

.nb-inner {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 24px;
  height: 64px;
  display: flex;
  align-items: center;
  gap: 0;
}

/* ── Logo ── */
.nb-logo {
  display: flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
  flex-shrink: 0;
  margin-right: 32px;
}

.nb-logo-img {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  object-fit: cover;
  border: 1.5px solid rgba(56, 189, 248, 0.3);
  box-shadow: 0 0 12px rgba(56, 189, 248, 0.15);
}

.nb-logo-text {
  font-family: 'Outfit', sans-serif;
  font-weight: 800;
  font-size: 1.05rem;
  color: white;
  letter-spacing: -0.01em;
  white-space: nowrap;
}

.nb-logo-text span {
  color: #38bdf8;
}

/* ── Nav links — center zone ── */
.nb-links {
  display: flex;
  align-items: center;
  gap: 2px;
  flex: 1;
  list-style: none;
  margin: 0;
  padding: 0;
}

.nb-link {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 8px 14px;
  border-radius: 10px;
  color: rgba(255, 255, 255, 0.65);
  text-decoration: none;
  font-weight: 600;
  font-size: 0.875rem;
  transition: all 0.2s ease;
  white-space: nowrap;
  position: relative;
}

.nb-link i {
  font-size: 1rem;
  transition: color 0.2s;
}

.nb-link:hover {
  color: white;
  background: rgba(255, 255, 255, 0.07);
}

.nb-link.active {
  color: #38bdf8;
  background: rgba(56, 189, 248, 0.08);
}

.nb-link.active::after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 50%;
  transform: translateX(-50%);
  width: 24px;
  height: 2px;
  background: #38bdf8;
  border-radius: 2px;
}

/* ── Actions right ── */
.nb-actions {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-left: auto;
  flex-shrink: 0;
}

/* ── Bell button ── */
.nb-bell-btn {
  position: relative;
  width: 40px;
  height: 40px;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.04);
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
  transition: all 0.2s;
}

.nb-bell-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border-color: rgba(255, 255, 255, 0.15);
}

.nb-notif-dot {
  position: absolute;
  top: 7px;
  right: 7px;
  width: 8px;
  height: 8px;
  background: #ef4444;
  border-radius: 50%;
  border: 1.5px solid #060d19;
  animation: nb-pulse-dot 2s infinite;
}

.nb-notif-count {
  position: absolute;
  top: 4px;
  right: 4px;
  background: #ef4444;
  color: white;
  border-radius: 10px;
  min-width: 18px;
  height: 18px;
  font-size: 0.62rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 4px;
  border: 1.5px solid #060d19;
  line-height: 1;
}

/* ── Notifications dropdown ── */
.nb-notif-panel {
  position: absolute;
  top: calc(100% + 12px);
  right: 0;
  width: 340px;
  background: #0f172a;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 18px;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
  overflow: hidden;
  animation: nb-fadeDown 0.2s cubic-bezier(0.22, 1, 0.36, 1) both;
  z-index: 9999;
}

.nb-notif-head {
  padding: 16px 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.nb-notif-head-title {
  font-weight: 800;
  font-size: 0.9rem;
  color: #f1f5f9;
}

.nb-notif-badge-count {
  background: rgba(56, 189, 248, 0.15);
  color: #38bdf8;
  border-radius: 20px;
  padding: 2px 10px;
  font-size: 0.72rem;
  font-weight: 700;
}

.nb-notif-list {
  max-height: 340px;
  overflow-y: auto;
}

.nb-notif-list::-webkit-scrollbar { width: 4px; }
.nb-notif-list::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 2px; }

.nb-notif-item {
  padding: 14px 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.04);
  cursor: pointer;
  display: flex;
  gap: 12px;
  transition: background 0.15s;
}

.nb-notif-item:hover { background: rgba(255, 255, 255, 0.03); }
.nb-notif-item:last-child { border-bottom: none; }

.nb-notif-dot-read {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-top: 5px;
  flex-shrink: 0;
}

.nb-notif-item.unread .nb-notif-dot-read { background: #0284c7; }
.nb-notif-item.read .nb-notif-dot-read { background: transparent; }

.nb-notif-msg {
  font-size: 0.84rem;
  color: #cbd5e1;
  line-height: 1.5;
}

.nb-notif-item.unread .nb-notif-msg { color: #f1f5f9; font-weight: 600; }

.nb-notif-date {
  font-size: 0.7rem;
  color: #475569;
  margin-top: 4px;
}

.nb-notif-empty {
  padding: 32px 20px;
  text-align: center;
  color: #475569;
}

.nb-notif-empty i {
  font-size: 1.8rem;
  display: block;
  margin-bottom: 10px;
  color: #334155;
}

.nb-notif-footer {
  padding: 10px 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  display: flex;
  justify-content: space-between;
  background: #0b0f19;
}

.nb-notif-action-btn {
  background: none;
  border: none;
  font-size: 0.75rem;
  font-weight: 700;
  color: #38bdf8;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 6px;
  transition: all 0.15s;
}

.nb-notif-action-btn:hover {
  background: rgba(56, 189, 248, 0.1);
}

.nb-notif-action-btn.delete {
  color: #f43f5e;
}

.nb-notif-action-btn.delete:hover {
  background: rgba(244, 63, 94, 0.1);
}

/* ── User menu button ── */
.nb-user-btn {
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 4px 10px 4px 4px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.04);
  cursor: pointer;
  transition: all 0.2s;
  color: white;
}

.nb-user-btn:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.15);
}

.nb-avatar {
  width: 32px;
  height: 32px;
  border-radius: 9px;
  background: linear-gradient(135deg, #0284c7, #4f46e5);
  color: white;
  font-weight: 800;
  font-size: 0.82rem;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  letter-spacing: 0.01em;
}

.nb-username {
  font-weight: 600;
  font-size: 0.84rem;
  color: rgba(255, 255, 255, 0.9);
  max-width: 110px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.nb-chevron {
  font-size: 0.7rem;
  color: rgba(255, 255, 255, 0.4);
  transition: transform 0.2s;
}

.nb-chevron.open { transform: rotate(180deg); }

/* ── User dropdown ── */
.nb-user-panel {
  position: absolute;
  top: calc(100% + 12px);
  right: 0;
  width: 240px;
  background: #0f172a;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 18px;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
  overflow: hidden;
  animation: nb-fadeDown 0.2s cubic-bezier(0.22, 1, 0.36, 1) both;
  z-index: 9999;
}

.nb-user-panel-head {
  padding: 16px 18px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  display: flex;
  align-items: center;
  gap: 12px;
}

.nb-user-panel-avatar {
  width: 42px;
  height: 42px;
  border-radius: 12px;
  background: linear-gradient(135deg, #0284c7, #4f46e5);
  color: white;
  font-weight: 800;
  font-size: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(2, 132, 199, 0.25);
}

.nb-user-panel-name {
  font-weight: 700;
  font-size: 0.88rem;
  color: #f1f5f9;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.nb-user-panel-role {
  font-size: 0.72rem;
  color: #475569;
  margin-top: 2px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.nb-panel-links {
  padding: 8px;
  list-style: none;
  margin: 0;
}

.nb-panel-link {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 10px;
  color: #94a3b8;
  text-decoration: none;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
  border: none;
  background: none;
  font-family: inherit;
  width: 100%;
  text-align: left;
}

.nb-panel-link i {
  font-size: 0.95rem;
  width: 20px;
  text-align: center;
  flex-shrink: 0;
}

.nb-panel-link:hover {
  background: rgba(255, 255, 255, 0.05);
  color: #f1f5f9;
}

.nb-panel-divider {
  height: 1px;
  background: rgba(255, 255, 255, 0.06);
  margin: 4px 0;
}

.nb-panel-link.danger { color: #fca5a5; }
.nb-panel-link.danger:hover { background: rgba(239, 68, 68, 0.08); color: #ef4444; }

/* ── Auth buttons (not logged in) ── */
.nb-auth-login {
  padding: 8px 16px;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: transparent;
  color: rgba(255, 255, 255, 0.8);
  font-weight: 600;
  font-size: 0.85rem;
  text-decoration: none;
  transition: all 0.2s;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.nb-auth-login:hover {
  background: rgba(255, 255, 255, 0.07);
  color: white;
  border-color: rgba(255, 255, 255, 0.2);
}

.nb-auth-register {
  padding: 8px 18px;
  border-radius: 10px;
  border: none;
  background: linear-gradient(135deg, #0284c7, #4f46e5);
  color: white;
  font-weight: 700;
  font-size: 0.85rem;
  text-decoration: none;
  transition: all 0.2s;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  box-shadow: 0 4px 12px rgba(2, 132, 199, 0.25);
}

.nb-auth-register:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 18px rgba(2, 132, 199, 0.4);
  color: white;
}

/* ── Hamburger ── */
.nb-hamburger {
  display: none;
  width: 40px;
  height: 40px;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.04);
  color: white;
  font-size: 1.15rem;
  cursor: pointer;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.2s;
  margin-left: 8px;
}

.nb-hamburger:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.15);
}

/* ── Mobile drawer ── */
.nb-drawer-overlay {
  display: none;
  position: fixed;
  top: calc(64px + env(safe-area-inset-top, 0px));
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  z-index: 190;
  backdrop-filter: blur(4px);
}

.nb-drawer {
  position: fixed;
  top: calc(64px + env(safe-area-inset-top, 0px));
  left: 0;
  right: 0;
  background: #0a1220;
  border-bottom: 1px solid rgba(255, 255, 255, 0.07);
  z-index: 195;
  padding: 12px 16px 20px;
  animation: nb-fadeDown 0.22s cubic-bezier(0.22, 1, 0.36, 1) both;
}

.nb-drawer-links {
  list-style: none;
  margin: 0 0 12px;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.nb-drawer-link {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-radius: 12px;
  color: rgba(255, 255, 255, 0.7);
  text-decoration: none;
  font-weight: 600;
  font-size: 0.95rem;
  transition: all 0.15s;
  animation: nb-slideIn 0.25s cubic-bezier(0.22, 1, 0.36, 1) both;
}

.nb-drawer-link i {
  font-size: 1.1rem;
  width: 24px;
  text-align: center;
}

.nb-drawer-link:hover,
.nb-drawer-link.active {
  background: rgba(56, 189, 248, 0.07);
  color: #38bdf8;
}

.nb-drawer-divider {
  height: 1px;
  background: rgba(255, 255, 255, 0.06);
  margin: 8px 0;
}

.nb-drawer-auth {
  display: flex;
  gap: 8px;
  padding: 4px 0;
}

.nb-drawer-auth a {
  flex: 1;
  justify-content: center;
  text-align: center;
}

/* ── Responsive ── */
@media (max-width: 900px) {
  .nb-links { display: none; }
  .nb-logo-text { display: none; }
  .nb-hamburger { display: flex; }
  .nb-username { display: none; }
}

@media (max-width: 600px) {
  .nb-inner { padding: 0 16px; }
  .nb-logo { margin-right: 16px; }
  .nb-auth-login { padding: 7px 12px; font-size: 0.82rem; }
  .nb-auth-register { padding: 7px 14px; font-size: 0.82rem; }
  .nb-notif-panel,
  .nb-user-panel {
    position: fixed;
    top: calc(64px + env(safe-area-inset-top, 0px));
    right: 12px;
    left: 12px;
    width: auto;
    max-width: none;
  }
}

@media (max-width: 500px) {
  .nb-actions .nb-auth-text { display: none; }
  .nb-actions .nb-auth-login,
  .nb-actions .nb-auth-register {
    padding: 8px 10px;
    font-size: 0.88rem;
  }
  .nb-inner { padding: 0 12px; }
}
`;

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
    api.get('/notifications/').then(r => {
      setNotifications(r.data || []);
      setUnreadCount((r.data || []).filter(n => !n.lue).length);
    }).catch(() => {});

    const token = localStorage.getItem('token');
    const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
    let base = process.env.REACT_APP_BACKEND_WS;
    if (!base) {
      const apiUrl = process.env.REACT_APP_API_URL;
      if (apiUrl) {
        base = apiUrl.replace(/^http/, 'ws').replace(/\/$/, '');
      } else {
        const host = window.location.host.includes('localhost:')
          ? 'localhost:8000'
          : window.location.host;
        base = `${protocol}://${host}`;
      }
    }
    const ws = new WebSocket(`${base}/ws/notifications/?token=${token}`);

    ws.onmessage = (e) => {
      const data = JSON.parse(e.data);
      if (data.type === 'notification') {
        const newNotif = { id: Date.now(), message: data.message, type: data.notif_type, lue: false, created_at: data.created_at || new Date().toISOString() };
        setNotifications(prev => [newNotif, ...prev]);
        setUnreadCount(prev => prev + 1);
        if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
          new Notification('Service Market', { body: data.message });
        }
      }
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

  const markAllAsRead = async () => {
    try {
      await api.post('/notifications/lire_tout/');
      setNotifications(notifications.map(n => ({ ...n, lue: true })));
      setUnreadCount(0);
    } catch (e) {}
  };

  const deleteAllNotifications = async () => {
    try {
      await api.post('/notifications/supprimer_tout/');
      setNotifications([]);
      setUnreadCount(0);
    } catch (e) {}
  };

  const getRoleLabel = () => {
    if (!user) return '';
    if (user.is_staff) return 'Administrateur';
    if (user.type_compte === 'prestataire') return 'Prestataire';
    return 'Client';
  };

  const NAV_LINKS = [
    { to: '/', icon: 'bi-house-door', label: 'Accueil' },
    { to: '/services', icon: 'bi-grid-3x3-gap', label: 'Services' },
    { to: '/prestataires', icon: 'bi-people', label: 'Prestataires' },
    { to: '/ateliers', icon: 'bi-geo-alt', label: 'Ateliers' },
  ];

  return (
    <>
      <style>{NAVBAR_STYLES}</style>

      <nav className="nb-root">
        <div className="nb-bar">
          <div className="nb-inner">
            {/* Logo */}
            <Link to="/" className="nb-logo">
              <img src="/SM.jpg" alt="SM" className="nb-logo-img" />
              <span className="nb-logo-text">Services <span>Market</span></span>
            </Link>

            {/* Desktop nav links */}
            <ul className="nb-links">
              {NAV_LINKS.map(link => (
                <li key={link.to}>
                  <Link to={link.to} className={`nb-link ${isActive(link.to)}`}>
                    <i className={link.icon} />
                    <span>{link.label}</span>
                  </Link>
                </li>
              ))}
            </ul>

            {/* Right actions */}
            <div className="nb-actions">
              {/* Bell */}
              {user && (
                <div style={{ position: 'relative' }} ref={notifRef}>
                  <button
                    className="nb-bell-btn"
                    onClick={() => setNotifOpen(!notifOpen)}
                    aria-label="Notifications"
                  >
                    <i className="bi bi-bell" />
                    {unreadCount > 0 && (
                      unreadCount > 9
                        ? <span className="nb-notif-count">9+</span>
                        : <span className="nb-notif-count">{unreadCount}</span>
                    )}
                    {unreadCount > 0 && unreadCount <= 9 && (
                      <span className="nb-notif-dot" style={{ display: 'none' }} />
                    )}
                  </button>

                  {notifOpen && (
                    <div className="nb-notif-panel">
                      <div className="nb-notif-head">
                        <span className="nb-notif-head-title">Notifications</span>
                        {unreadCount > 0 && (
                          <span className="nb-notif-badge-count">{unreadCount} non lues</span>
                        )}
                      </div>
                      <div className="nb-notif-list">
                        {notifications.length === 0 ? (
                          <div className="nb-notif-empty">
                            <i className="bi bi-bell-slash" />
                            Aucune notification
                          </div>
                        ) : notifications.map(n => (
                          <div
                            key={n.id}
                            className={`nb-notif-item ${n.lue ? 'read' : 'unread'}`}
                            onClick={() => markAsRead(n.id)}
                          >
                            <div className="nb-notif-dot-read" />
                            <div>
                              <div className="nb-notif-msg">{n.message}</div>
                              <div className="nb-notif-date">
                                {new Date(n.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      {notifications.length > 0 && (
                        <div className="nb-notif-footer">
                          <button onClick={markAllAsRead} className="nb-notif-action-btn">
                            Tout lire
                          </button>
                          <button onClick={deleteAllNotifications} className="nb-notif-action-btn delete">
                            Tout supprimer
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* User menu */}
              {user ? (
                <div style={{ position: 'relative' }} ref={dropdownRef}>
                  <button
                    className="nb-user-btn"
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                  >
                    <div className="nb-avatar">{user.username?.[0]?.toUpperCase()}</div>
                    <span className="nb-username">{user.username}</span>
                    <i className={`bi bi-chevron-down nb-chevron ${dropdownOpen ? 'open' : ''}`} />
                  </button>

                  {dropdownOpen && (
                    <div className="nb-user-panel">
                      <div className="nb-user-panel-head">
                        <div className="nb-user-panel-avatar">{user.username?.[0]?.toUpperCase()}</div>
                        <div>
                          <div className="nb-user-panel-name">{user.username}</div>
                          <div className="nb-user-panel-role">{getRoleLabel()}</div>
                        </div>
                      </div>

                      <ul className="nb-panel-links">
                        <li>
                          <Link className="nb-panel-link" to="/mon-compte">
                            <i className="bi bi-person-gear" /> Mon profil
                          </Link>
                        </li>

                        {user.type_compte === 'client' && (
                          <li>
                            <Link className="nb-panel-link" to="/mes-reservations">
                              <i className="bi bi-calendar-check" /> Mes réservations
                            </Link>
                          </li>
                        )}

                        {user.type_compte === 'prestataire' && (
                          <li>
                            <Link className="nb-panel-link" to="/prestataire-dashboard">
                              <i className="bi bi-speedometer2" /> Tableau de bord Pro
                            </Link>
                          </li>
                        )}
                        {user.is_staff && (
                          <li>
                            <Link className="nb-panel-link" to="/admin-dashboard">
                              <i className="bi bi-shield-check" /> Administration
                            </Link>
                          </li>
                        )}
                        <li><div className="nb-panel-divider" /></li>
                        <li>
                          <button className="nb-panel-link danger" onClick={handleLogout}>
                            <i className="bi bi-box-arrow-right" /> Déconnexion
                          </button>
                        </li>
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <Link to="/login" className="nb-auth-login">
                    <i className="bi bi-box-arrow-in-right" /> <span className="nb-auth-text">Connexion</span>
                  </Link>
                  <Link to="/register" className="nb-auth-register">
                    <i className="bi bi-person-plus" /> <span className="nb-auth-text">S'inscrire</span>
                  </Link>
                </div>
              )}

              {/* Hamburger */}
              <button
                className="nb-hamburger"
                onClick={() => setMenuOpen(!menuOpen)}
                aria-label="Menu"
              >
                <i className={`bi bi-${menuOpen ? 'x-lg' : 'list'}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile drawer */}
        {menuOpen && (
          <>
            <div className="nb-drawer-overlay" onClick={() => setMenuOpen(false)} style={{ display: 'block' }} />
            <div className="nb-drawer">
              <ul className="nb-drawer-links">
                {NAV_LINKS.map((link, i) => (
                  <li key={link.to}>
                    <Link
                      to={link.to}
                      className={`nb-drawer-link ${isActive(link.to)}`}
                      style={{ animationDelay: `${i * 0.04}s` }}
                    >
                      <i className={link.icon} />
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>

              {user && (
                <>
                  <div className="nb-drawer-divider" />
                  <ul className="nb-drawer-links" style={{ marginBottom: 0 }}>
                    <li>
                      <Link to="/mon-compte" className="nb-drawer-link" style={{ animationDelay: '0.16s' }}>
                        <i className="bi bi-person-gear" /> Mon profil
                      </Link>
                    </li>

                    {user.type_compte === 'client' && (
                      <li>
                        <Link to="/mes-reservations" className="nb-drawer-link" style={{ animationDelay: '0.2s' }}>
                          <i className="bi bi-calendar-check" /> Mes réservations
                        </Link>
                      </li>
                    )}

                    {user.type_compte === 'prestataire' && (
                      <li>
                        <Link to="/prestataire-dashboard" className="nb-drawer-link" style={{ animationDelay: '0.24s' }}>
                          <i className="bi bi-speedometer2" /> Tableau de bord Pro
                        </Link>
                      </li>
                    )}
                    <li>
                      <button
                        className="nb-drawer-link"
                        onClick={handleLogout}
                        style={{ background: 'none', border: 'none', width: '100%', textAlign: 'left', cursor: 'pointer', color: '#fca5a5', animationDelay: '0.32s', fontFamily: 'inherit', fontWeight: 600, fontSize: '0.95rem' }}
                      >
                        <i className="bi bi-box-arrow-right" /> Déconnexion
                      </button>
                    </li>
                  </ul>
                </>
              )}

              {!user && (
                <>
                  <div className="nb-drawer-divider" />
                  <div className="nb-drawer-auth">
                    <Link to="/login" className="nb-auth-login" style={{ flex: 1, justifyContent: 'center' }}>
                      <i className="bi bi-box-arrow-in-right" /> Connexion
                    </Link>
                    <Link to="/register" className="nb-auth-register" style={{ flex: 1, justifyContent: 'center' }}>
                      <i className="bi bi-person-plus" /> S'inscrire
                    </Link>
                  </div>
                </>
              )}
            </div>
          </>
        )}
      </nav>
    </>
  );
}
