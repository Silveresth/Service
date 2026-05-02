import React from 'react';
import ReactDOM from 'react-dom/client';
import { AuthProvider } from './context/AuthContext';
import AppQueryProvider from './lib/QueryClientProvider'; // Importe ton nouveau provider
import './index.css';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    {/* On enveloppe tout avec React Query */}
    <AppQueryProvider>
      <AuthProvider>
        <App />
      </AuthProvider>
    </AppQueryProvider>
  </React.StrictMode>
);