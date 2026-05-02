import { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function ChatPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [reservation, setReservation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [wsStatus, setWsStatus] = useState('connecting');
  const wsRef = useRef(null);
  const endRef = useRef(null);

  // Charger la réservation et l'historique
  useEffect(() => {
    api.get(`/reservations/${id}/`).then(r => {
      setReservation(r.data);
    }).catch(() => setReservation(null));

    api.get(`/reservations/${id}/messages/`).then(r => {
      const normalized = (r.data || []).map(m => ({
        ...m,
        message: m.message || m.contenu || '',
        // sender peut être un objet (API REST) ou une string (WebSocket) — normaliser en string
        sender: m.sender?.username || m.sender || '',
        is_me: (m.sender?.username || m.sender) === user?.username,
      }));
      setMessages(normalized);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [id, user?.username]);

  // Scroll auto
  useEffect(() => {
    if (endRef.current) endRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // WebSocket
  useEffect(() => {
    if (!id || !user) return;
    const token = localStorage.getItem('token');
    const proto = window.location.protocol === 'https:' ? 'wss' : 'ws';
    // REACT_APP_BACKEND_WS doit être défini dans .env (ex: mondomaine.ngrok.io)
    // En local: ws://localhost:8000 | En prod/ngrok: wss://mondomaine.ngrok.io
    const backendWs = process.env.REACT_APP_BACKEND_WS
      ? `${process.env.REACT_APP_BACKEND_WS}`
      : `${proto}://${window.location.hostname}:8000`;
    const wsUrl = `${backendWs}/ws/chat/${id}/?token=${token}`;

    const ws = new WebSocket(wsUrl);

    ws.onopen = () => setWsStatus('connected');
    ws.onclose = () => setWsStatus('disconnected');
    ws.onerror = () => setWsStatus('error');

    ws.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        if (data.type === 'chat_message') {
          setMessages(prev => {
            // Éviter les doublons (même contenu + même sender dans les 2 dernières secondes)
            const isDup = prev.some(m =>
              m.message === data.message &&
              m.sender === data.sender &&
              Math.abs(new Date(m.timestamp) - new Date(data.timestamp)) < 2000
            );
            if (isDup) return prev;
            return [...prev, {
              ...data,
              is_me: data.sender === user?.username,
            }];
          });
        }
      } catch { /* ignore */ }
    };

    wsRef.current = ws;
    return () => ws.close();
  }, [id, user]);

  const sendMessage = () => {
    if (!input.trim() || !wsRef.current) return;
    const msg = input.trim();
    setInput('');
    if (wsRef.current.readyState === 1) {
      wsRef.current.send(JSON.stringify({ type: 'chat_message', message: msg }));
    }
  };

  if (loading) return (
    <div className="container py-5" style={{ textAlign: 'center' }}>
      <i className="bi bi-hourglass-split" style={{ fontSize: '2rem', color: 'var(--primary-color)' }}></i>
      <p className="mt-2 text-muted">Chargement du chat…</p>
    </div>
  );

  const otherUser = user?.type_compte === 'client'
    ? reservation?.service?.prestataire?.user
    : reservation?.client?.user;

  return (
    <div className="container py-4 chat-page-container" style={{ maxWidth: 800, display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16, padding: '12px 16px', background: 'linear-gradient(135deg,#0c2340,#0284c7)', borderRadius: 12, color: 'white' }}>
        <Link to="/mes-reservations" style={{ color: 'white', textDecoration: 'none', fontSize: '1.2rem' }}>
          <i className="bi bi-arrow-left"></i>
        </Link>
        <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
          {otherUser?.username?.[0]?.toUpperCase() || '?'}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700 }}>{otherUser?.username || 'Utilisateur'}</div>
          <div style={{ fontSize: '0.78rem', opacity: 0.85 }}>
            {reservation?.service?.nom}
            <span style={{ marginLeft: 8, padding: '1px 6px', borderRadius: 20, background: wsStatus === 'connected' ? '#22c55e' : '#ef4444', fontSize: '0.65rem' }}>
              {wsStatus === 'connected' ? 'En ligne' : wsStatus === 'connecting' ? 'Connexion…' : 'Hors ligne'}
            </span>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: 16, background: '#f8fafc', borderRadius: 12, border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
        {messages.length === 0 && (
          <div style={{ textAlign: 'center', color: '#94a3b8', marginTop: 40 }}>
            <i className="bi bi-chat-square-dots" style={{ fontSize: '2rem', display: 'block', marginBottom: 8 }}></i>
            <p style={{ fontSize: '0.9rem' }}>Aucun message pour l'instant</p>
            <p style={{ fontSize: '0.8rem' }}>Démarrez la conversation avec {otherUser?.username || 'le prestataire'}</p>
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: m.is_me ? 'flex-end' : 'flex-start' }}>
            <div style={{
              maxWidth: '75%', padding: '10px 14px', borderRadius: 12, fontSize: '0.9rem',
              background: m.is_me ? 'var(--primary-color)' : 'white',
              color: m.is_me ? 'white' : '#0c2340',
              boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
              wordBreak: 'break-word',
            }}>
              {m.message}
              <div style={{ fontSize: '0.7rem', opacity: 0.65, marginTop: 4, textAlign: m.is_me ? 'right' : 'left' }}>
                {m.sender} · {m.timestamp ? new Date(m.timestamp).toLocaleTimeString('fr', { hour: '2-digit', minute: '2-digit' }) : ''}
              </div>
            </div>
          </div>
        ))}
        <div ref={endRef}></div>
      </div>

      {/* Input */}
      <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
        <input
          type="text"
          placeholder="Écrivez un message…"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && sendMessage()}
          disabled={wsStatus !== 'connected'}
          style={{ flex: 1, border: '1px solid #e2e8f0', borderRadius: 10, padding: '10px 14px', fontSize: '0.95rem', outline: 'none' }}
        />
        <button
          onClick={sendMessage}
          disabled={!input.trim() || wsStatus !== 'connected'}
          style={{
            background: 'var(--primary-color)', color: 'white', border: 'none', borderRadius: 10,
            padding: '10px 18px', cursor: 'pointer', fontSize: '1rem', opacity: (!input.trim() || wsStatus !== 'connected') ? 0.6 : 1,
          }}
        >
          <i className="bi bi-send-fill"></i>
        </button>
      </div>
    </div>
  );
}