import { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const CHAT_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&display=swap');

  .ch-page {
    display: flex; flex-direction: column;
    height: 100vh; max-height: 100vh;
    background: #f0f8ff;
    overflow: hidden;
  }

  /* ── Header ── */
  .ch-header {
    background: linear-gradient(135deg, #0c2340, #0284c7);
    padding: 14px 20px;
    display: flex; align-items: center; gap: 14px;
    flex-shrink: 0;
    box-shadow: 0 2px 16px rgba(0,0,0,0.2);
    position: relative; z-index: 10;
  }
  .ch-back {
    color: white; text-decoration: none; font-size: 1.1rem;
    width: 36px; height: 36px; border-radius: 10px;
    background: rgba(255,255,255,0.12); border: 1px solid rgba(255,255,255,0.18);
    display: flex; align-items: center; justify-content: center;
    transition: background .2s; flex-shrink: 0;
  }
  .ch-back:hover { background: rgba(255,255,255,0.22); color: white; }
  .ch-avatar {
    width: 44px; height: 44px; border-radius: 50%;
    background: rgba(255,255,255,0.14); border: 2px solid rgba(255,255,255,0.25);
    display: flex; align-items: center; justify-content: center;
    font-weight: 800; font-size: 1.1rem; color: white; flex-shrink: 0;
  }
  .ch-header-info { flex: 1; min-width: 0; }
  .ch-header-name { font-weight: 800; color: white; font-size: 0.95rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .ch-header-sub  { font-size: 0.75rem; opacity: 0.8; color: rgba(255,255,255,0.85); display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
  .ch-status-dot {
    width: 8px; height: 8px; border-radius: 50%;
    display: inline-block; flex-shrink: 0;
  }
  .ch-status-pill {
    padding: 2px 9px; border-radius: 50px; font-size: 0.68rem; font-weight: 700;
    display: inline-flex; align-items: center; gap: 5px;
  }

  /* ── Service info bar ── */
  .ch-service-bar {
    background: #e0f2fe; border-bottom: 1px solid #bae6fd;
    padding: 8px 20px;
    display: flex; align-items: center; gap: 10px;
    font-size: 0.8rem; color: #0369a1; font-weight: 600;
    flex-shrink: 0;
  }
  .ch-service-bar i { font-size: 0.9rem; }

  /* ── Messages area ── */
  .ch-messages {
    flex: 1; overflow-y: auto; padding: 20px 16px;
    display: flex; flex-direction: column; gap: 10px;
    scrollbar-width: thin; scrollbar-color: #bae6fd transparent;
  }
  .ch-messages::-webkit-scrollbar { width: 4px; }
  .ch-messages::-webkit-scrollbar-thumb { background: #bae6fd; border-radius: 4px; }

  /* Empty state */
  .ch-empty {
    flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center;
    color: #94a3b8; text-align: center; padding: 40px 20px;
  }
  .ch-empty i { font-size: 3rem; display: block; margin-bottom: 12px; color: #bae6fd; }
  .ch-empty h4 { font-weight: 700; color: #64748b; margin-bottom: 6px; }
  .ch-empty p { font-size: 0.85rem; margin: 0; }

  /* Date separator */
  .ch-date-sep {
    display: flex; align-items: center; gap: 10px;
    font-size: 0.72rem; color: #94a3b8; font-weight: 600; margin: 8px 0;
  }
  .ch-date-sep::before, .ch-date-sep::after { content: ''; flex: 1; height: 1px; background: #e2e8f0; }

  /* Message bubble */
  .ch-msg-row { display: flex; align-items: flex-end; gap: 8px; }
  .ch-msg-row.me { justify-content: flex-end; }
  .ch-msg-row.other { justify-content: flex-start; }

  .ch-msg-mini-avatar {
    width: 28px; height: 28px; border-radius: 50%; flex-shrink: 0;
    background: #e0f2fe; color: #0284c7;
    display: flex; align-items: center; justify-content: center;
    font-weight: 800; font-size: 0.72rem; margin-bottom: 2px;
  }

  .ch-bubble {
    max-width: 75%; padding: 10px 14px; border-radius: 16px;
    font-size: 0.9rem; line-height: 1.6;
    word-break: break-word; position: relative;
    animation: ch-pop .2s ease;
  }
  @keyframes ch-pop { from{opacity:0;transform:scale(.96)} to{opacity:1;transform:scale(1)} }
  .ch-bubble.me {
    background: linear-gradient(135deg, #0284c7, #0369a1);
    color: white; border-radius: 16px 16px 4px 16px;
    box-shadow: 0 2px 10px rgba(2,132,199,0.25);
  }
  .ch-bubble.other {
    background: white; color: #0c2340;
    border: 1.5px solid #f1f5f9; border-radius: 16px 16px 16px 4px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  }
  .ch-bubble-time {
    font-size: 0.66rem; margin-top: 4px; display: block;
    opacity: 0.65; text-align: right;
  }
  .ch-bubble.other .ch-bubble-time { text-align: left; }

  /* ── Input area ── */
  .ch-input-area {
    background: white; border-top: 1.5px solid #e0f2fe;
    padding: 12px 16px; flex-shrink: 0;
    box-shadow: 0 -2px 12px rgba(2,132,199,0.07);
  }
  .ch-input-row { display: flex; gap: 10px; align-items: flex-end; }
  .ch-input-wrap {
    flex: 1; display: flex; align-items: center;
    background: #f0f8ff; border: 1.5px solid #bae6fd;
    border-radius: 14px; overflow: hidden; padding: 4px 14px;
    transition: border-color .2s, box-shadow .2s;
  }
  .ch-input-wrap:focus-within { border-color: #0284c7; box-shadow: 0 0 0 4px rgba(2,132,199,0.10); background: white; }
  .ch-input {
    flex: 1; border: none; background: transparent;
    padding: 8px 0; font-size: 0.92rem; color: #0c2340;
    outline: none; font-family: inherit; resize: none;
    max-height: 100px; overflow-y: auto;
  }
  .ch-input::placeholder { color: #94a3b8; }
  .ch-input:disabled { cursor: not-allowed; }

  .ch-send-btn {
    width: 46px; height: 46px; border-radius: 14px; border: none;
    background: linear-gradient(135deg, #0284c7, #0369a1);
    color: white; cursor: pointer; flex-shrink: 0;
    display: flex; align-items: center; justify-content: center; font-size: 1rem;
    box-shadow: 0 4px 14px rgba(2,132,199,0.3);
    transition: all .2s;
  }
  .ch-send-btn:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 7px 20px rgba(2,132,199,0.4); }
  .ch-send-btn:disabled { opacity: 0.45; cursor: not-allowed; transform: none; box-shadow: none; }

  /* Offline banner */
  .ch-offline-banner {
    background: #fef3c7; border-bottom: 1px solid #fde68a;
    padding: 8px 16px; text-align: center;
    font-size: 0.8rem; color: #92400e; font-weight: 600;
    display: flex; align-items: center; justify-content: center; gap: 7px;
  }

  @media(max-width:480px) {
    .ch-bubble { max-width: 88%; }
    .ch-messages { padding: 14px 10px; }
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
    const base  = process.env.REACT_APP_BACKEND_WS || `${proto}://${window.location.hostname}:8000`;
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

  // Group messages by date
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
      <div style={{ minHeight: '70vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14 }}>
        <div style={{ width: 44, height: 44, border: '4px solid #e0f2fe', borderTopColor: '#0284c7', borderRadius: '50%', animation: 'ch-spin .8s linear infinite' }}></div>
        <p style={{ color: '#64748b' }}>Chargement du chat…</p>
      </div>
    </>
  );

  return (
    <>
      <style>{CHAT_STYLES}</style>
      <div className="ch-page">

        {/* Header */}
        <div className="ch-header">
          <Link to="/mes-reservations" className="ch-back">
            <i className="bi bi-arrow-left"></i>
          </Link>

          <div className="ch-avatar">{otherInit?.toUpperCase()}</div>

          <div className="ch-header-info">
            <div className="ch-header-name">{otherUser?.first_name ? `${otherUser.first_name} ${otherUser.last_name || ''}`.trim() : otherUser?.username || 'Utilisateur'}</div>
            <div className="ch-header-sub">
              <span className={`ch-status-pill`} style={{
                background: isConnected ? 'rgba(34,197,94,0.2)' : wsStatus === 'connecting' ? 'rgba(251,191,36,0.2)' : 'rgba(239,68,68,0.2)',
                color: isConnected ? '#86efac' : wsStatus === 'connecting' ? '#fde68a' : '#fca5a5',
              }}>
                <span className="ch-status-dot" style={{ background: isConnected ? '#22c55e' : wsStatus === 'connecting' ? '#f59e0b' : '#ef4444' }}></span>
                {isConnected ? 'En ligne' : wsStatus === 'connecting' ? 'Connexion…' : 'Hors ligne'}
              </span>
            </div>
          </div>
        </div>

        {/* Service bar */}
        {reservation?.service?.nom && (
          <div className="ch-service-bar">
            <i className="bi bi-briefcase-fill"></i>
            <span>{reservation.service.nom}</span>
            <span style={{ marginLeft: 'auto', fontWeight: 800, color: '#0284c7' }}>
              {Number(reservation.montant).toLocaleString()} Fcfa
            </span>
          </div>
        )}

        {/* Offline warning */}
        {!isConnected && wsStatus !== 'connecting' && (
          <div className="ch-offline-banner">
            <i className="bi bi-wifi-off"></i>
            Connexion interrompue. Les nouveaux messages ne seront pas reçus.
          </div>
        )}

        {/* Messages */}
        <div className="ch-messages">
          {groupedMessages.length === 0 ? (
            <div className="ch-empty">
              <i className="bi bi-chat-square-dots"></i>
              <h4>Aucun message</h4>
              <p>Démarrez la conversation avec {otherUser?.username || 'votre interlocuteur'}</p>
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
                placeholder={isConnected ? 'Écrivez un message… (Entrée pour envoyer)' : 'Connexion…'}
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
    </>
  );
}