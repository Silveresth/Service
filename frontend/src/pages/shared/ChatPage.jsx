import { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';

const CHAT_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Outfit:wght@600;700;800&display=swap');

  @keyframes ch-fadeIn {
    from { opacity: 0; transform: translateY(8px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  @keyframes ch-bubblePop {
    from { opacity: 0; transform: scale(0.95) translateY(4px); }
    to   { opacity: 1; transform: scale(1) translateY(0); }
  }

  @keyframes ch-pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }

  .ch-page-wrapper {
    font-family: 'Plus Jakarta Sans', sans-serif;
    min-height: calc(100vh - 64px);
    background: linear-gradient(135deg, #f0f4f8 0%, #e2e8f0 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 32px 16px;
  }

  .ch-page {
    display: flex; 
    flex-direction: column;
    height: 680px; 
    max-height: 85vh;
    background: white;
    width: 100%;
    max-width: 520px;
    margin: 0 auto;
    border: 1px solid #e2e8f0;
    border-radius: 24px;
    box-shadow: 0 25px 50px -12px rgba(12, 35, 64, 0.15);
    overflow: hidden;
    animation: ch-fadeIn 0.5s cubic-bezier(0.22, 1, 0.36, 1) both;
  }

  /* ── Header ── */
  .ch-header {
    background: linear-gradient(135deg, #0c2340 0%, #0284c7 100%);
    padding: 18px 20px;
    display: flex; 
    align-items: center; 
    gap: 14px;
    flex-shrink: 0;
    box-shadow: 0 4px 20px rgba(12, 35, 64, 0.15);
    position: relative; 
    z-index: 10;
  }

  .ch-back {
    color: white; 
    text-decoration: none; 
    font-size: 1.1rem;
    width: 38px; 
    height: 38px; 
    border-radius: 12px;
    background: rgba(255, 255, 255, 0.12); 
    border: 1px solid rgba(255, 255, 255, 0.15);
    display: flex; 
    align-items: center; 
    justify-content: center;
    transition: all 0.2s; 
    flex-shrink: 0;
  }

  .ch-back:hover { 
    background: rgba(255, 255, 255, 0.22); 
    color: white; 
    transform: translateX(-1px);
  }

  .ch-avatar {
    width: 44px; 
    height: 44px; 
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.15); 
    border: 2px solid rgba(255, 255, 255, 0.25);
    display: flex; 
    align-items: center; 
    justify-content: center;
    font-weight: 800; 
    font-size: 1.1rem; 
    color: white; 
    flex-shrink: 0;
    box-shadow: 0 4px 10px rgba(0,0,0,0.1);
  }

  .ch-header-info { 
    flex: 1; 
    min-width: 0; 
  }

  .ch-header-name { 
    font-family: 'Outfit', sans-serif;
    font-weight: 700; 
    color: white; 
    font-size: 1.05rem; 
    white-space: nowrap; 
    overflow: hidden; 
    text-overflow: ellipsis; 
  }

  .ch-header-sub  { 
    font-size: 0.75rem; 
    color: rgba(255, 255, 255, 0.8); 
    display: flex; 
    align-items: center; 
    gap: 8px; 
  }

  .ch-status-dot {
    width: 7px; 
    height: 7px; 
    border-radius: 50%;
    display: inline-block; 
    flex-shrink: 0;
  }

  .ch-status-dot.connected {
    background: #4ade80;
    box-shadow: 0 0 8px #4ade80;
  }
  
  .ch-status-dot.connecting {
    background: #fef08a;
    animation: ch-pulse 1.5s infinite;
  }

  .ch-status-dot.disconnected {
    background: #f87171;
  }

  .ch-status-pill {
    display: flex; 
    align-items: center; 
    gap: 6px;
    font-weight: 600;
  }

  /* ── Service info bar ── */
  .ch-service-bar {
    background: #f0f9ff; 
    border-bottom: 1px solid #e0f2fe;
    padding: 10px 20px;
    display: flex; 
    align-items: center; 
    gap: 10px;
    font-size: 0.82rem; 
    color: #0369a1; 
    font-weight: 700;
    flex-shrink: 0;
  }

  .ch-service-bar i { font-size: 0.95rem; color: #0284c7; }

  .ch-service-price {
    margin-left: auto;
    font-family: 'Outfit', sans-serif;
    font-weight: 800;
    color: #0284c7;
    font-size: 0.9rem;
    background: #e0f2fe;
    padding: 2px 10px;
    border-radius: 20px;
  }

  /* ── Messages area ── */
  .ch-messages {
    flex: 1; 
    overflow-y: auto; 
    padding: 24px 20px;
    display: flex; 
    flex-direction: column; 
    gap: 14px;
    background: #f8fafc;
    scrollbar-width: thin; 
    scrollbar-color: #cbd5e1 transparent;
  }

  .ch-messages::-webkit-scrollbar { width: 4px; }
  .ch-messages::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }

  /* Empty state */
  .ch-empty {
    flex: 1; 
    display: flex; 
    flex-direction: column; 
    align-items: center; 
    justify-content: center;
    color: #94a3b8; 
    text-align: center; 
    padding: 40px 20px;
  }

  .ch-empty-icon {
    width: 68px;
    height: 68px;
    border-radius: 20px;
    background: #e0f2fe;
    color: #0284c7;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 2.2rem;
    margin-bottom: 16px;
  }

  .ch-empty h4 { 
    font-family: 'Outfit', sans-serif;
    font-weight: 700; 
    color: #475569; 
    margin-bottom: 6px; 
    font-size: 1.1rem;
  }

  .ch-empty p { 
    font-size: 0.85rem; 
    margin: 0; 
    max-width: 240px;
    line-height: 1.5;
  }

  /* Date separator */
  .ch-date-sep {
    display: flex; 
    align-items: center; 
    gap: 12px;
    font-size: 0.72rem; 
    color: #94a3b8; 
    font-weight: 700; 
    margin: 12px 0;
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  .ch-date-sep::before, .ch-date-sep::after { 
    content: ''; 
    flex: 1; 
    height: 1px; 
    background: #e2e8f0; 
  }

  /* Message bubble */
  .ch-msg-row { 
    display: flex; 
    align-items: flex-end; 
    gap: 8px; 
  }

  .ch-msg-row.me { justify-content: flex-end; }
  .ch-msg-row.other { justify-content: flex-start; }

  .ch-msg-mini-avatar {
    width: 32px; 
    height: 32px; 
    border-radius: 50%; 
    flex-shrink: 0;
    background: #e2e8f0; 
    color: #475569;
    display: flex; 
    align-items: center; 
    justify-content: center;
    font-weight: 800; 
    font-size: 0.8rem; 
    margin-bottom: 2px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  }

  .ch-bubble {
    max-width: 75%; 
    padding: 12px 16px; 
    border-radius: 20px;
    font-size: 0.92rem; 
    line-height: 1.6;
    word-break: break-word; 
    position: relative;
    box-shadow: 0 2px 8px rgba(12, 35, 64, 0.04);
    animation: ch-bubblePop 0.25s cubic-bezier(0.22, 1, 0.36, 1) both;
  }

  .ch-bubble.me {
    background: linear-gradient(135deg, #0284c7 0%, #4f46e5 100%);
    color: white; 
    border-radius: 20px 20px 4px 20px;
    box-shadow: 0 4px 15px rgba(2, 132, 199, 0.25);
  }

  .ch-bubble.other {
    background: white; 
    color: #0c2340;
    border: 1.5px solid #e2e8f0; 
    border-radius: 20px 20px 20px 4px;
  }

  .ch-bubble-time {
    font-size: 0.65rem; 
    margin-top: 6px; 
    display: block;
    opacity: 0.7; 
    text-align: right;
    font-weight: 500;
  }

  .ch-bubble.other .ch-bubble-time { 
    color: #94a3b8;
    text-align: left; 
  }

  /* ── Input area ── */
  .ch-input-area {
    background: white; 
    border-top: 1.5px solid #f1f5f9;
    padding: 16px 20px; 
    flex-shrink: 0;
  }

  .ch-input-row { 
    display: flex; 
    gap: 12px; 
    align-items: flex-end; 
  }

  .ch-input-wrap {
    flex: 1; 
    display: flex; 
    align-items: center;
    background: #f8fafc; 
    border: 1.5px solid #e2e8f0;
    border-radius: 18px; 
    overflow: hidden; 
    padding: 6px 16px;
    transition: all 0.25s ease;
    max-width: 100%;
  }

  .ch-input-wrap:focus-within { 
    border-color: #0284c7; 
    box-shadow: 0 0 0 4px rgba(2, 132, 199, 0.12); 
    background: white; 
  }

  .ch-input {
    flex: 1; 
    border: none; 
    background: transparent;
    padding: 6px 0; 
    font-size: 0.92rem; 
    color: #0c2340;
    outline: none; 
    font-family: inherit; 
    resize: none;
    max-height: 120px; 
    overflow-y: auto;
    line-height: 1.5;
  }

  .ch-input::placeholder { color: #94a3b8; }
  .ch-input:disabled { cursor: not-allowed; }

  .ch-send-btn {
    width: 44px; 
    height: 44px; 
    border-radius: 16px; 
    border: none;
    background: linear-gradient(135deg, #0284c7 0%, #4f46e5 100%);
    color: white; 
    cursor: pointer; 
    flex-shrink: 0;
    display: flex; 
    align-items: center; 
    justify-content: center; 
    font-size: 1.05rem;
    box-shadow: 0 4px 12px rgba(2, 132, 199, 0.25);
    transition: all 0.25s;
  }

  .ch-send-btn:hover:not(:disabled) { 
    transform: translateY(-1.5px); 
    box-shadow: 0 6px 18px rgba(2, 132, 199, 0.35); 
  }

  .ch-send-btn:disabled { 
    opacity: 0.45; 
    cursor: not-allowed; 
    transform: none; 
    box-shadow: none; 
  }

  /* Offline banner */
  .ch-offline-banner {
    background: #fffbe5; 
    border-bottom: 1px solid #fef3c7;
    padding: 8px 16px; 
    text-align: center;
    font-size: 0.8rem; 
    color: #b45309; 
    font-weight: 600;
    display: flex; 
    align-items: center; 
    justify-content: center; 
    gap: 8px;
    flex-shrink: 0;
  }

  @media(max-width: 520px) {
    .ch-page-wrapper {
      padding: 0;
      background: white;
    }
    .ch-page {
      height: 100vh;
      max-height: 100vh;
      border-radius: 0;
      border: none;
    }
  }

  @media(max-width:480px) {
    .ch-bubble { max-width: 82%; }
    .ch-messages { padding: 16px 12px; }
  }
`;

const fmtTime = d => d ? new Date(d).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : '';
const fmtDate = d => {
  if (!d) return '';
  const dt = new Date(d);
  const today = new Date();
  if (dt.toDateString() === today.toDateString()) return 'Aujourd\'hui';
  const yesterday = new Date(); yesterday.setDate(today.getDate() - 1);
  if (dt.toDateString() === yesterday.toDateString()) return 'Hier';
  return dt.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' });
};

export default function ChatPage() {
  const { id }   = useParams();
  const { user } = useAuth();

  const [reservation, setReservation] = useState(null);
  const [messages, setMessages]       = useState([]);
  const [loading, setLoading]         = useState(true);
  const [wsStatus, setWsStatus]       = useState('connecting');
  const [input, setInput]             = useState('');
  const wsRef  = useRef(null);
  const endRef = useRef(null);

  useEffect(() => {
    api.get(`/reservations/${id}/`).then(r => setReservation(r.data)).catch(() => setReservation(null));
    api.get(`/reservations/${id}/messages/`).then(r => {
      const normalized = (r.data || []).map(m => ({
        ...m,
        message: m.message || m.contenu || '',
        sender: m.sender?.username || m.sender || '',
        is_me: (m.sender?.username || m.sender) === user?.username,
      }));
      setMessages(normalized);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [id, user?.username]);

  useEffect(() => {
    if (endRef.current) endRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (!id || !user) return;
    const token = localStorage.getItem('token');
    const proto = window.location.protocol === 'https:' ? 'wss' : 'ws';
    let base = process.env.REACT_APP_BACKEND_WS;
    if (!base) {
      const apiUrl = process.env.REACT_APP_API_URL;
      if (apiUrl) {
        base = apiUrl.replace(/^http/, 'ws').replace(/\/$/, '');
      } else {
        base = process.env.NODE_ENV === 'development'
          ? `${proto}://${window.location.hostname}:8000`
          : `wss://apk-back.onrender.com`;
      }
    }
    const ws    = new WebSocket(`${base}/ws/chat/${id}/?token=${token}`);

    ws.onopen  = () => setWsStatus('connected');
    ws.onclose = () => setWsStatus('disconnected');
    ws.onerror = () => setWsStatus('error');
    ws.onmessage = e => {
      try {
        const data = JSON.parse(e.data);
        if (data.type === 'chat_message') {
          setMessages(prev => {
            const isDup = prev.some(m =>
              m.message === data.message &&
              m.sender === data.sender &&
              Math.abs(new Date(m.timestamp) - new Date(data.timestamp)) < 2000
            );
            return isDup ? prev : [...prev, { ...data, is_me: data.sender === user?.username }];
          });
        }
      } catch { }
    };

    wsRef.current = ws;
    return () => ws.close();
  }, [id, user]);

  const sendMessage = () => {
    if (!input.trim() || wsRef.current?.readyState !== 1) return;
    wsRef.current.send(JSON.stringify({ type: 'chat_message', message: input.trim() }));
    setInput('');
  };

  const handleKey = e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } };

  const isConnected = wsStatus === 'connected';
  const otherUser = user?.type_compte === 'client'
    ? reservation?.service?.prestataire?.user
    : reservation?.client?.user;
  const otherInit = otherUser?.first_name?.[0] || otherUser?.username?.[0] || '?';

  const groupedMessages = [];
  let lastDate = '';
  messages.forEach((m, i) => {
    const d = fmtDate(m.timestamp);
    if (d !== lastDate) { groupedMessages.push({ type: 'date', label: d, key: `d-${i}` }); lastDate = d; }
    groupedMessages.push({ type: 'msg', data: m, key: `m-${i}` });
  });

  if (loading) return (
    <>
      <style>{`@keyframes ch-spin{to{transform:rotate(360deg)}}`}</style>
      <div style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, background: '#f8fafc' }}>
        <div style={{ width: 44, height: 44, border: '4px solid #e2e8f0', borderTopColor: '#0284c7', borderRadius: '50%', animation: 'ch-spin .8s linear infinite' }}></div>
        <p style={{ color: '#64748b', fontWeight: 600, fontSize: '0.9rem' }}>Chargement de la messagerie…</p>
      </div>
    </>
  );

  return (
    <>
      <style>{CHAT_STYLES}</style>
      <div className="ch-page-wrapper">
        <div className="ch-page">

          {/* Header */}
          <div className="ch-header">
            <Link to="/mes-reservations" className="ch-back">
              <i className="bi bi-chevron-left"></i>
            </Link>

            <div className="ch-avatar">{otherInit?.toUpperCase()}</div>

            <div className="ch-header-info">
              <div className="ch-header-name">
                {otherUser?.first_name ? `${otherUser.first_name} ${otherUser.last_name || ''}`.trim() : otherUser?.username || 'Utilisateur'}
              </div>
              <div className="ch-header-sub">
                <div className="ch-status-pill">
                  <span className={`ch-status-dot ${isConnected ? 'connected' : wsStatus === 'connecting' ? 'connecting' : 'disconnected'}`}></span>
                  {isConnected ? 'En ligne' : wsStatus === 'connecting' ? 'Connexion en cours...' : 'Hors ligne'}
                </div>
              </div>
            </div>
          </div>

          {/* Service bar */}
          {reservation?.service?.nom && (
            <div className="ch-service-bar">
              <i className="bi bi-briefcase"></i>
              <span>{reservation.service.nom}</span>
              <span className="ch-service-price">
                {Number(reservation.montant).toLocaleString()} FCFA
              </span>
            </div>
          )}

          {/* Offline warning */}
          {!isConnected && wsStatus !== 'connecting' && (
            <div className="ch-offline-banner">
              <i className="bi bi-wifi-off"></i>
              Connexion interrompue. Vos messages s'enverront dès votre reconnexion.
            </div>
          )}

          {/* Messages */}
          <div className="ch-messages">
            {groupedMessages.length === 0 ? (
              <div className="ch-empty">
                <div className="ch-empty-icon">
                  <i className="bi bi-chat-square-dots-fill"></i>
                </div>
                <h4>Aucun message</h4>
                <p>N'hésitez pas à lancer la discussion avec {otherUser?.first_name || otherUser?.username || 'votre artisan'}.</p>
              </div>
            ) : groupedMessages.map(item => {
              if (item.type === 'date') return (
                <div key={item.key} className="ch-date-sep">{item.label}</div>
              );
              const m = item.data;
              return (
                <div key={item.key} className={`ch-msg-row ${m.is_me ? 'me' : 'other'}`}>
                  {!m.is_me && (
                    <div className="ch-msg-mini-avatar">{otherInit?.toUpperCase()}</div>
                  )}
                  <div className={`ch-bubble ${m.is_me ? 'me' : 'other'}`}>
                    {m.message}
                    <span className="ch-bubble-time">{fmtTime(m.timestamp)}</span>
                  </div>
                </div>
              );
            })}
            <div ref={endRef}></div>
          </div>

          {/* Input */}
          <div className="ch-input-area">
            <div className="ch-input-row">
              <div className="ch-input-wrap">
                <textarea
                  className="ch-input"
                  placeholder={isConnected ? 'Écrivez votre message…' : 'Connexion...'}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKey}
                  disabled={!isConnected}
                  rows={1}
                />
              </div>
              <button className="ch-send-btn" onClick={sendMessage} disabled={!input.trim() || !isConnected}>
                <i className="bi bi-send-fill"></i>
              </button>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}