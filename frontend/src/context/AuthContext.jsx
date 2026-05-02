import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext();

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // ✅ FIX: Récupérer le vrai utilisateur depuis l'API au lieu d'un mock
      api.get('/auth/me/')
        .then(res => setUser(res.data))
        .catch(() => {
          // Token invalide ou expiré : on nettoie
          localStorage.removeItem('token');
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  // ✅ FIX: login reçoit { access, refresh, user } depuis le backend
  const login = (data) => {
    if (data.access) {
      localStorage.setItem('token', data.access);
      setUser(data.user);
    } else {
      // Compatibilité si on passe directement l'objet user
      setUser(data);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('token');
  };

  const updateUser = (data) => {
    setUser(prev => prev ? { ...prev, ...data } : data);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
}