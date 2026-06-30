import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import './Chatbot.css';

const QUICK_ACTIONS = [
  '🔧 Plombier',
  '⚡ Électricien',
  '🔨 Menuisier',
  '🧹 Ménage',
  '🖥️ Informatique',
  '🚗 Mécanicien',
];

const WELCOME_MSG = {
  role: 'assistant',
  content: 'Bonjour ! Je suis SM-Assistant 🤖\n\nJe peux vous aider à trouver le bon prestataire, vous renseigner sur les services disponibles, ou vous guider dans votre réservation. Que cherchez-vous ?',
  isWelcome: true,
};

const renderFormatting = (text) => {
  const parts = text.split('**');
  return parts.map((part, index) => {
    const isBold = index % 2 === 1;
    const lines = part.split('\n');
    const content = lines.map((line, lineIdx) => (
      <React.Fragment key={lineIdx}>
        {line}
        {lineIdx < lines.length - 1 && <br />}
      </React.Fragment>
    ));

    return isBold ? <strong key={index}>{content}</strong> : <span key={index}>{content}</span>;
  });
};

const renderMessageContent = (content) => {
  if (!content) return null;
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  const parts = [];
  let lastIndex = 0;
  let match;

  while ((match = linkRegex.exec(content)) !== null) {
    const textBefore = content.substring(lastIndex, match.index);
    if (textBefore) {
      parts.push(...renderFormatting(textBefore));
    }

    const label = match[1];
    const url = match[2];

    if (url.startsWith('/')) {
      parts.push(
        <Link key={match.index} to={url} className="cb-link">
          {label}
        </Link>
      );
    } else {
      parts.push(
        <a key={match.index} href={url} target="_blank" rel="noopener noreferrer" className="cb-link">
          {label}
        </a>
      );
    }

    lastIndex = linkRegex.lastIndex;
  }

  const textAfter = content.substring(lastIndex);
  if (textAfter) {
    parts.push(...renderFormatting(textAfter));
  }

  return parts.length > 0 ? parts : renderFormatting(content);
};

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([WELCOME_MSG]);
  const [loading, setLoading] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      setTimeout(scrollToBottom, 50);
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [messages, isOpen]);

  const getTime = () => {
    const now = new Date();
    return now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');
  };

  const handleSendMessage = async (e, overrideText) => {
    e?.preventDefault?.();
    const text = ((overrideText ?? message) || '').trim();
    if (!text) return;

    const userMsg = { role: 'user', content: text, time: getTime() };
    setMessages(prev => [...prev, userMsg]);
    setMessage('');
    setLoading(true);
    setHasInteracted(true);

    try {
      const response = await api.post('chatbot/', { message: text });
      const reply = response.data?.reply || response.data?.message || '';
      if (!reply.trim()) {
        throw new Error('Réponse chatbot vide');
      }
      setMessages(prev => [...prev, { role: 'assistant', content: reply, time: getTime() }]);
    } catch (error) {
      console.error('Chatbot error:', error);
      let errorMsg = 'Désolé, je rencontre une erreur technique. Veuillez réessayer.';
      if (error.response?.status === 401) {
        errorMsg = '🔒 Veuillez vous connecter pour utiliser le chatbot.';
      } else if (error.response?.data?.error) {
        errorMsg = error.response.data.error;
      }
      setMessages(prev => [...prev, { role: 'assistant', content: errorMsg, isError: true, time: getTime() }]);
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const handleQuickAction = (action) => {
    if (loading) return; // éviter double requête/chargement infini

    setHasInteracted(true);
    setMessage(action);

    // Appel immédiat avec le texte, sans re-setMessage double
    handleSendMessage({
      preventDefault: () => {},
      target: { value: action },
    }, action);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="cb-wrapper">
      {!isOpen && (
        <button className="cb-toggle" onClick={() => setIsOpen(true)}>
          <i className="bi bi-chat-dots-fill" />
          <span className="cb-label">Assistant</span>
        </button>
      )}

      {isOpen && (
        <div className="cb-container">
          {/* ── HEADER ── */}
          <div className="cb-header">
            <div className="cb-header-orb" />
            <div className="cb-header-avatar">
              <i className="bi bi-robot" />
            </div>
            <div className="cb-header-info">
              <h3 className="cb-header-title">SM-Assistant</h3>
              <div className="cb-header-sub">
                <span className="cb-header-dot" />
                En ligne
              </div>
            </div>
            <button className="cb-close" onClick={() => setIsOpen(false)} aria-label="Fermer">
              <i className="bi bi-x-lg" />
            </button>
          </div>

          {/* ── MESSAGES ── */}
          <div className="cb-messages">
            {messages.map((msg, idx) => (
              msg.isWelcome ? (
                <div key={idx} className="cb-welcome">
                  <div className="cb-welcome-icon">
                    <i className="bi bi-stars" />
                  </div>
                  <h4>Bienvenue 👋</h4>
                  <p>{renderMessageContent(msg.content)}</p>
                </div>
              ) : msg.isError ? (
                <div key={idx} className="cb-error">
                  <i className="bi bi-exclamation-triangle-fill" />
                  <span>{msg.content}</span>
                </div>
              ) : (
                <div key={idx} className={`cb-bubble ${msg.role}`}>
                  {renderMessageContent(msg.content)}
                  {msg.time && <div className="cb-bubble-time">{msg.time}</div>}
                </div>
              )
            ))}

            {!hasInteracted && (
              <div className="cb-quick-actions">
                {QUICK_ACTIONS.map((action, i) => (
                  <button
                    key={i}
                    className="cb-quick-btn"
                    onClick={() => handleQuickAction(action)}
                  >
                    {action}
                  </button>
                ))}
              </div>
            )}

            {loading && (
              <div className="cb-typing">
                <span className="cb-typing-dot" />
                <span className="cb-typing-dot" />
                <span className="cb-typing-dot" />
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* ── INPUT ── */}
          <form className="cb-input-wrap" onSubmit={handleSendMessage}>
            <textarea
              ref={inputRef}
              className="cb-input-field"
              placeholder="Posez votre question..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={loading}
              rows={1}
            />
            <button
              type="submit"
              className="cb-send-btn"
              disabled={loading || !message.trim()}
            >
              <i className="bi bi-send-fill" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
