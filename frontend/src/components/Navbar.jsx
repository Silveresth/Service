import { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

// ─── Composant Chat flottant ─────────────────────────────────────
function ChatFlottant({ user, onClose }) {
  const [conversations, setConversations] = useState([]);
  const [activeConv, setActiveConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loadingConvs, setLoadingConvs] = useState(true);
  const wsRef = useRef(null);
  const endRef = useRef(null);

  useEffect(() => {
    api.get('/reservations/').then(res => {
      const convs = (res.data || []).filter(r => r.statut === 'confirmee');
      setConversations(convs);
    }).catch(() => {}).finally(() => setLoadingConvs(false));
  }, []);

  useEffect(() => {
    if (endRef.current) endRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const openConv = (reservation) => {
    setActiveConv(reservation);
    setMessages([]);
    api.get(`/reservations/${reservation.id}/messages/`).then(r => {
      const normalized = (r.data || []).map(m => ({
        ...m,
        message: m.message || m.contenu || '',
        is_me: m.sender?.username === user?.username,
      }));
      setMessages(normalized);
    }).catch(() => {});
    if (wsRef.current) wsRef.current.close();
    const token = localStorage.getItem('token');
    const proto = window.location.protocol === 'https:' ? 'wss' : 'ws';
    const apiBaseUrl = process.env.REACT_APP_API_URL || 'http://192.168.100.19:8000/api/';
    const backendHost = apiBaseUrl.replace('/api/', '').replace(/\/$/, '');
    const backendWs = backendHost.replace(/^http/, proto);
    const ws = new WebSocket(`${backendWs}/ws/chat/${reservation.id}/?token=${token}`);
    ws.onopen = () => {
      console.log('[WS Chat] Connexion ouverte pour réservation', reservation.id);
    };
    ws.onerror = (err) => {
      console.error('[WS Chat] Erreur WebSocket:', err);
    };
    ws.onmessage = e => {
      try {
        const d = JSON.parse(e.data);
        if (d.type === 'chat_message') {
          setMessages(prev => {
            const isDup = prev.some(m =>
              m.message === d.message &&
              m.sender === d.sender &&
              Math.abs(new Date(m.timestamp || Date.now()) - new Date(d.timestamp || Date.now())) < 2000
            );
            if (isDup) return prev;
            return [...prev, { ...d, is_me: d.sender === user?.username }];
          });
        }
      } catch { }
    };
    wsRef.current = ws;
  };

  useEffect(() => () => { if (wsRef.current) wsRef.current.close(); }, []);

  const sendMsg = () => {
    if (!input.trim() || !activeConv) return;
    const msg = input.trim();
    setInput('');
    const ws = wsRef.current;
    if (!ws) return;
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: 'chat_message', message: msg }));
    } else if (ws.readyState === WebSocket.CONNECTING) {
      // Attendre l'ouverture puis envoyer
      const prevOnOpen = ws.onopen;
      ws.onopen = (e) => {
        if (prevOnOpen) prevOnOpen(e);
        ws.send(JSON.stringify({ type: 'chat_message', message: msg }));
      };
    }
  };

  return (
    <div style={{ position: 'fixed', bottom: 80, right: 20, width: 340, maxHeight: 520, background: 'white', borderRadius: 16, boxShadow: '0 8px 32px rgba(0,0,0,0.18)', zIndex: 9000, display: 'flex', flexDirection: 'column', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
      <div style={{ background: 'linear-gradient(135deg,#0c2340,#0284c7)', padding: '12px 16px', color: 'white', display: 'flex', alignItems: 'center', gap: 10 }}>
        <i className="bi bi-chat-dots-fill" style={{ fontSize: '1.1rem' }}></i>
        <span style={{ fontWeight: 700, flex: 1 }}>{activeConv ? `Chat – ${activeConv.service?.nom}` : 'Mes conversations'}</span>
        {activeConv && <button onClick={() => { setActiveConv(null); if (wsRef.current) wsRef.current.close(); }} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', borderRadius: 6, padding: '3px 8px', cursor: 'pointer' }}>← Retour</button>}
        <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', borderRadius: 6, padding: '3px 8px', cursor: 'pointer' }}>✕</button>
      </div>
      {!activeConv ? (
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {loadingConvs && <div style={{ textAlign: 'center', padding: 32, color: '#94a3b8' }}><i className="bi bi-hourglass-split"></i></div>}
          {!loadingConvs && conversations.length === 0 && (
            <div style={{ textAlign: 'center', padding: 32, color: '#94a3b8' }}>
              <i className="bi bi-chat-square-text" style={{ fontSize: '2rem', display: 'block', marginBottom: 8 }}></i>
              <p style={{ fontSize: '0.85rem' }}>Aucune conversation active</p>
              <p style={{ fontSize: '0.78rem' }}>Les chats s'ouvrent après confirmation de réservation</p>
            </div>
          )}
          {conversations.map(r => (
            <div key={r.id} onClick={() => openConv(r)} style={{ padding: '12px 16px', cursor: 'pointer', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: 10 }}
              onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
              onMouseLeave={e => e.currentTarget.style.background = 'white'}>
              <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span style={{ fontWeight: 700, color: 'var(--primary-color)', fontSize: '0.9rem' }}>
                  {r.service?.prestataire?.user?.username?.[0]?.toUpperCase() || '?'}
                </span>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: '0.88rem', color: '#0c2340', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.service?.nom}</div>
                <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                  {r.service?.prestataire?.user?.username}
                  <span style={{ marginLeft: 8, background: '#f0fdf4', color: '#166534', padding: '1px 6px', borderRadius: 20, fontSize: '0.7rem' }}>Confirmée</span>
                </div>
              </div>
              <i className="bi bi-chevron-right" style={{ color: '#94a3b8', fontSize: '0.8rem' }}></i>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <div style={{ flex: 1, overflowY: 'auto', padding: 12, display: 'flex', flexDirection: 'column', gap: 8, background: '#f8fafc' }}>
            {messages.length === 0 && (
              <div style={{ textAlign: 'center', color: '#94a3b8', fontSize: '0.82rem', marginTop: 30 }}>
                <i className="bi bi-chat-square-dots" style={{ fontSize: '1.5rem', display: 'block', marginBottom: 6 }}></i>
                Démarrez la conversation
              </div>
            )}
            {messages.map((m, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: m.is_me || m.sender === user?.username ? 'flex-end' : 'flex-start' }}>
                <div style={{
                  maxWidth: '80%', padding: '7px 11px', borderRadius: 10, fontSize: '0.83rem',
                  background: m.is_me || m.sender === user?.username ? 'var(--primary-color)' : 'white',
                  color: m.is_me || m.sender === user?.username ? 'white' : '#0c2340',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                }}>
                  {m.message}
                  <div style={{ fontSize: '0.68rem', opacity: 0.65, marginTop: 2 }}>
                    {m.sender} · {m.timestamp ? new Date(m.timestamp).toLocaleTimeString('fr', { hour: '2-digit', minute: '2-digit' }) : ''}
                  </div>
                </div>
              </div>
            ))}
            <div ref={endRef}></div>
          </div>
          <div style={{ display: 'flex', gap: 8, padding: '8px 12px', borderTop: '1px solid #e2e8f0', background: 'white' }}>
            <a href={`https://wa.me/228${activeConv?.service?.prestataire?.user?.telephone || ''}?text=${encodeURIComponent(`Re: ${activeConv?.service?.nom}`)}`}
              target="_blank" rel="noreferrer" title="Continuer sur WhatsApp"
              style={{ background: '#25D366', color: 'white', border: 'none', borderRadius: 8, padding: '6px 10px', display: 'flex', alignItems: 'center', textDecoration: 'none', flexShrink: 0 }}>
              <i className="bi bi-whatsapp" style={{ fontSize: '1rem' }}></i>
            </a>
            <input type="text" placeholder="Message..." value={input} onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendMsg()}
              style={{ flex: 1, border: '1px solid #e2e8f0', borderRadius: 8, padding: '6px 10px', fontSize: '0.85rem', outline: 'none' }} />
            <button onClick={sendMsg} style={{ background: 'var(--primary-color)', color: 'white', border: 'none', borderRadius: 8, padding: '6px 12px', cursor: 'pointer', flexShrink: 0 }}>
              <i className="bi bi-send-fill"></i>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Navbar principale ───────────────────────────────────────────
export default function Navbar() {
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef(null);
  const notifRef = useRef(null);
  const wsNotifRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();

  // ✅ FIX : Fermer le menu mobile à chaque changement de route
  useEffect(() => {
    setMenuOpen(false);
    setDropdownOpen(false);
    setNotifOpen(false);
  }, [location.pathname]);

  // Fermer dropdowns ET menu mobile au clic extérieur
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
      // Fermer le menu mobile si le clic est hors du nav
      setMenuOpen(false);
    };
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, []);

  // Notifications en temps réel via WebSocket
  useEffect(() => {
    if (!user) return;
    const token = localStorage.getItem('token');
    const proto = window.location.protocol === 'https:' ? 'wss' : 'ws';
    const apiBaseUrl = process.env.REACT_APP_API_URL || 'http://192.168.100.19:8000/api/';
    const backendHost = apiBaseUrl.replace('/api/', '').replace(/\/$/, '');
    const backendWs = backendHost.replace(/^http/, proto);
    const wsProtocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
    const ws = new WebSocket(`${wsProtocol}://${window.location.host}/ws/notifications/`);

    ws.onmessage = (e) => {
      const data = JSON.parse(e.data);
      if (data.type === 'notification') {
        setNotifications(prev => [data, ...prev].slice(0, 20));
        setUnreadCount(c => c + 1);
        showToast(data.message, data.level || 'info');
      }
    };

    ws.onerror = () => {};
    wsNotifRef.current = ws;

    api.get('/notifications/').then(r => {
      setNotifications(r.data || []);
      setUnreadCount((r.data || []).filter(n => !n.lue).length);
    }).catch(() => {});

    return () => ws.close();
  }, [user]);

  const showToast = (msg, level) => {
    const toast = document.createElement('div');
    toast.style.cssText = `position:fixed;top:72px;right:20px;z-index:9999;background:${level === 'success' ? '#22c55e' : level === 'error' ? '#ef4444' : '#0284c7'};color:white;padding:12px 20px;border-radius:10px;font-size:0.88rem;font-weight:600;max-width:320px;box-shadow:0 4px 20px rgba(0,0,0,0.2);animation:slideInRight 0.3s ease`;
    toast.innerHTML = `<i class="bi bi-bell-fill" style="margin-right:8px"></i>${msg}`;
    document.body.appendChild(toast);
    setTimeout(() => { toast.style.opacity = '0'; toast.style.transition = 'opacity 0.4s'; setTimeout(() => toast.remove(), 400); }, 4000);
  };

  const markAllRead = () => {
    setUnreadCount(0);
    setNotifications(prev => prev.map(n => ({ ...n, lue: true })));
    api.post('/notifications/lire_tout/').catch(() => {});
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    setDropdownOpen(false);
    setMenuOpen(false);
  };

  const isActive = (path) => location.pathname === path ? 'active' : '';

  return (
    <>
      <style>{`
        @keyframes slideInRight { from { transform:translateX(100%); opacity:0; } to { transform:translateX(0); opacity:1; } }
        @keyframes pulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.15)} }
      `}</style>

      <nav className="navbar-custom sticky-top" onClick={(e) => e.stopPropagation()}>
        <div className="navbar-inner">

          {/* Logo */}
          <Link to="/" className="navbar-brand">
            <img src="/SM.jpg" alt="Services Market" style={{ height: 38, width: 38, borderRadius: 8, objectFit: 'cover' }} />
            <span>Services Market</span>
          </Link>

          {/* ✅ Liens de navigation — centre sur PC */}
          <ul className={`navbar-links ${menuOpen ? 'open' : ''}`} onClick={() => setMenuOpen(false)}>
            <li><Link to="/" className={`nav-link ${isActive('/')}`}><i className="bi bi-house-door"></i> Accueil</Link></li>
            <li><Link to="/services" className={`nav-link ${isActive('/services')}`}><i className="bi bi-grid-3x3-gap"></i> Services</Link></li>
            <li><Link to="/prestataires" className={`nav-link ${isActive('/prestataires')}`}><i className="bi bi-people"></i> Prestataires</Link></li>
            <li><Link to="/ateliers" className={`nav-link ${isActive('/ateliers')}`}><i className="bi bi-geo-alt"></i> Ateliers</Link></li>
          </ul>

          {/* ✅ Actions droite */}
          <div className="navbar-actions">
            {user && (
              /* Notifications */
              <div style={{ position: 'relative' }} ref={notifRef}>
                <button
                  onClick={() => { setNotifOpen(!notifOpen); setChatOpen(false); }}
                  className="navbar-icon-btn"
                  aria-label="Notifications"
                >
                  <i className="bi bi-bell" style={{ fontSize: '1.15rem' }}></i>
                  {unreadCount > 0 && (
                    <span className="notif-badge" style={{ animation: 'pulse 1.5s infinite' }}>
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>

                {notifOpen && (
                  <div className="notif-dropdown">
                    <div className="notif-header">
                      <span style={{ fontWeight: 700, color: '#0c2340', fontSize: '0.9rem' }}>
                        <i className="bi bi-bell-fill text-primary me-2"></i>Notifications
                      </span>
                      {unreadCount > 0 && (
                        <button onClick={markAllRead} style={{ background: 'none', border: 'none', color: 'var(--primary-color)', fontSize: '0.78rem', cursor: 'pointer', fontWeight: 600 }}>
                          Tout marquer lu
                        </button>
                      )}
                    </div>
                    <div style={{ maxHeight: 320, overflowY: 'auto' }}>
                      {notifications.length === 0 && (
                        <div style={{ textAlign: 'center', padding: 32, color: '#94a3b8' }}>
                          <i className="bi bi-bell-slash" style={{ fontSize: '2rem', display: 'block', marginBottom: 8 }}></i>
                          <p style={{ fontSize: '0.85rem' }}>Aucune notification</p>
                        </div>
                      )}
                      {notifications.map((n, i) => (
                        <div key={i} style={{
                          padding: '10px 16px', borderBottom: '1px solid #f8f9fa',
                          background: n.lue ? 'white' : '#f0f8ff',
                          display: 'flex', gap: 10, alignItems: 'flex-start',
                        }}>
                          <div style={{
                            width: 32, height: 32, borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                            background: n.type === 'reservation' ? '#dbeafe' : n.type === 'chat' ? '#dcfce7' : n.type === 'paiement' ? '#fef9c3' : '#f0f4ff'
                          }}>
                            <i className={`bi ${n.type === 'reservation' ? 'bi-calendar-check' : n.type === 'chat' ? 'bi-chat-dots' : n.type === 'paiement' ? 'bi-credit-card' : 'bi-bell'}`}
                              style={{ fontSize: '0.85rem', color: n.type === 'reservation' ? '#1d4ed8' : n.type === 'chat' ? '#16a34a' : n.type === 'paiement' ? '#d97706' : '#0284c7' }}></i>
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ margin: 0, fontSize: '0.83rem', color: '#0c2340', fontWeight: n.lue ? 400 : 600 }}>{n.message}</p>
                            <p style={{ margin: 0, fontSize: '0.72rem', color: '#94a3b8', marginTop: 2 }}>
                              {n.created_at ? new Date(n.created_at).toLocaleString('fr', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : "À l'instant"}
                            </p>
                          </div>
                          {!n.lue && <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#0284c7', flexShrink: 0, marginTop: 4 }}></div>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Menu utilisateur */}
            {user ? (
              <div className="dropdown" ref={dropdownRef}>
                <button onClick={(e) => { e.stopPropagation(); setDropdownOpen(!dropdownOpen); }} className="nav-link"
                  style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px' }}>
                  <div className="avatar" style={{ width: 32, height: 32, fontSize: '0.85rem' }}>
                    {user.username?.[0]?.toUpperCase()}
                  </div>
                  <span className="username-label">{user.username}</span>
                  <i className="bi bi-chevron-down" style={{ fontSize: '0.7rem' }}></i>
                </button>
                {dropdownOpen && (
                  <ul className="dropdown-menu">
                    {user.type_compte === 'client' && (
                      <li><Link className="dropdown-item" to="/mes-reservations" onClick={() => setDropdownOpen(false)}>
                        <i className="bi bi-calendar-check"></i> Mes réservations
                      </Link></li>
                    )}
{user.type_compte === 'prestataire' && (
                      <>
                        <li><Link className="dropdown-item" to="/prestataire-dashboard" onClick={() => setDropdownOpen(false)}>
                          <i className="bi bi-speedometer2"></i> Analytics Dashboard
                        </Link></li>



                        <li><Link className="dropdown-item" to="/mes-reservations" onClick={() => setDropdownOpen(false)}>
                          <i className="bi bi-calendar-check"></i> Mes réservations
                        </Link></li>
                      </>
                    )}
                    {user.is_staff && (<>
                      <li><hr className="dropdown-divider" /></li>
                      <li><Link className="dropdown-item" to="/admin-dashboard" onClick={() => setDropdownOpen(false)}>
                        <i className="bi bi-shield-check"></i> Dashboard Admin
                      </Link></li>

                      <li><Link className="dropdown-item" to="/admin/all-reservations" onClick={() => setDropdownOpen(false)}>
                        <i className="bi bi-calendar-check"></i> Toutes Réservations
                      </Link></li>
                      <li><Link className="dropdown-item" to="/admin/evaluations" onClick={() => setDropdownOpen(false)}>
                        <i className="bi bi-star"></i> Toutes Évaluations
                      </Link></li>
                      <li><Link className="dropdown-item" to="/admin/all-paiements" onClick={() => setDropdownOpen(false)}>
                        <i className="bi bi-credit-card"></i> Tous les Paiements
                      </Link></li>
                      <li><Link className="dropdown-item" to="/admin/all-ateliers" onClick={() => setDropdownOpen(false)}>
                        <i className="bi bi-geo-alt"></i> Tous Ateliers
                      </Link></li>
                    </>)}
                    <li><hr className="dropdown-divider" /></li>
                    <li><Link className="dropdown-item" to="/mon-compte" onClick={() => setDropdownOpen(false)}>
                      <i className="bi bi-person-gear"></i> Mon compte
                    </Link></li>
                    <li>
                      <button className="dropdown-item" onClick={handleLogout}
                        style={{ width: '100%', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', color: '#dc3545' }}>
                        <i className="bi bi-box-arrow-right"></i> Déconnexion
                      </button>
                    </li>
                  </ul>
                )}
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Link to="/login" className="btn-outline-primary-custom" style={{ padding: '8px 16px', fontSize: '0.9rem' }}>
                  <i className="bi bi-box-arrow-in-right"></i> Connexion
                </Link>
                <Link to="/register" className="btn-primary-custom" style={{ padding: '8px 16px', fontSize: '0.9rem' }}>
                  <i className="bi bi-person-plus"></i> <span className="username-label">S'inscrire</span>
                </Link>
              </div>
            )}

            {/* ✅ Hamburger — mobile uniquement */}
            <button
              onClick={(e) => { e.stopPropagation(); setMenuOpen(prev => !prev); }}
              className="navbar-toggler"
              aria-label="Menu"
              aria-expanded={menuOpen}
            >
              <i className={`bi bi-${menuOpen ? 'x-lg' : 'list'}`}></i>
            </button>
          </div>
        </div>
      </nav>

      {false && chatOpen && user && <ChatFlottant user={user} onClose={() => setChatOpen(false)} />}
    </>
  );
}
