import React, { useState, useEffect, useRef } from 'react';
import api from '../api/axios';
import './Chatbot.css';

const Chatbot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([
        { role: 'assistant', content: 'Bonjour ! Je suis SM-Assistant. Comment puis-je vous aider à trouver un prestataire aujourd\'hui ?' }
    ]);
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }

    useEffect(() => {
        if (isOpen) {
            scrollToBottom();
        }
    }, [messages, isOpen]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!message.trim()) return;

        const userMsg = { role: 'user', content: message };
        setMessages(prev => [...prev, userMsg]);
        setMessage('');
        setLoading(true);

        try {
            const response = await api.post('chatbot/', { message });
            setMessages(prev => [...prev, { role: 'assistant', content: response.data.reply }]);
        } catch (error) {
            console.error("Chatbot error:", error);
            let errorMsg = "Désolé, je rencontre une erreur technique.";
            if (error.response?.status === 401) {
                errorMsg = "Veuillez vous connecter pour utiliser le chatbot.";
            } else if (error.response?.data?.error) {
                errorMsg = error.response.data.error;
            }
            setMessages(prev => [...prev, { role: 'assistant', content: errorMsg }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="chatbot-wrapper">
            {!isOpen && (
                <button className="chatbot-toggle" onClick={() => setIsOpen(true)}>
                    <i className="bi bi-chat-dots-fill"></i>
                    <span>Besoin d'aide ?</span>
                </button>
            )}

            {isOpen && (
                <div className="chatbot-container">
                    <div className="chatbot-header">
                        <div className="chatbot-title">
                            <i className="bi bi-robot me-2"></i>
                            SM-Assistant
                        </div>
                        <button className="btn-close btn-close-white" onClick={() => setIsOpen(false)} aria-label="Close"></button>
                    </div>

                    <div className="chatbot-messages">
                        {messages.map((msg, index) => (
                            <div key={index} className={`message-bubble ${msg.role}`}>
                                {msg.content}
                            </div>
                        ))}
                        {loading && <div className="message-bubble assistant loading">Réflexion...</div>}
                        <div ref={messagesEndRef} />
                    </div>

                    <form className="chatbot-input" onSubmit={handleSendMessage}>
                        <input
                            type="text"
                            placeholder="Posez votre question..."
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            disabled={loading}
                        />
                        <button type="submit" disabled={loading || !message.trim()}>
                            <i className="bi bi-send-fill"></i>
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
};

export default Chatbot;
