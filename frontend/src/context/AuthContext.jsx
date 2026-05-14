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
      // Récupérer le vrai utilisateur depuis l'API
      api.get('/auth/me/')
        .then(res => setUser(res.data))
        .catch(() => {
          // Token invalide/expiré : on nettoie (axios fera le refresh si possible)
          localStorage.removeItem('token');
          localStorage.removeItem('refresh_token');
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  // login reçoit { access, refresh, user } depuis le backend
  const login = (data) => {
    // backend: { access, refresh, user }
    if (data?.access) {
      localStorage.setItem('token', data.access);

      if (data?.refresh) {
        localStorage.setItem('refresh_token', data.refresh);
      }

      // setUser(data.user) peut être null si backend renvoie user non présent
      if (data.user) setUser(data.user);
      else {
        // fallback: recharger le user via /auth/me/
        api.get('/auth/me/')
          .then(res => setUser(res.data))
          .catch(() => setUser(null));
      }
    } else {
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