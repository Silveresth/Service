import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { App as CapApp } from '@capacitor/app';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Chatbot from './components/Chatbot';
import OfflineBanner from './components/OfflineBanner';
import SplashScreen from './components/SplashScreen';
import Home from './pages/Home';
import Services from './pages/Services';
import Servicedetail from './pages/Servicedetail';
import { CarteAteliers, AjouterAtelier } from './pages/Ateliers';
import Prestataires from './pages/Prestataires';
import Dashboard from './pages/Dashboard';
import MonCompte from './pages/MonCompte';
import AdminDashboard from './pages/AdminDashboard';
import MesReservations from './pages/MesReservations';
import MesAteliers from './pages/MesAteliers';
import ModifierService from './pages/ModifierService';
import ModifierAtelier from './pages/ModifierAtelier';
import Reserver from './pages/Reserver';
import Evaluer from './pages/Evaluer';
import ChatPage from './pages/ChatPage';
import RegisterPrestataire from './pages/RegisterPresataire';
import Login from './pages/Login';
import Register from './pages/Register';
import PrestataireDashboard from './pages/PrestataireDashboard';
import PrestataireAjouterService from './pages/PrestataireAjouterService';
import PrestataireMesServices from './pages/PrestataireMesServices';
import ServicesCRUD from './pages/ServicesCRUD';
import CategoriesCRUD from './pages/CategoriesCRUD';
import ReservationsCRUD from './pages/ReservationsCRUD';
import EvaluationsCRUD from './pages/EvaluationsCRUD';
import AteliersCRUD from './pages/AteliersCRUD';
import PrestatairesCRUD from './pages/PrestatairesCRUD';
import AdminAllAteliers from './pages/AdminAllAteliers';
import AdminAllReservations from './pages/AdminAllReservations';
import AdminAllComptes from './pages/AdminAllComptes';
import AdminEvaluations from './pages/AdminEvaluations';
import AdminAllPaiements from './pages/AdminAllPaiements';
import AdminAllCategories from './pages/AdminAllCategories';
import AdminAllServices from './pages/AdminAllServices';
import PrivateRoute from './components/PrivateRoute';

import './App.css';
import './styles/global.css';
import './styles/admin.css';

function AppContent() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    let backButtonListener;
    
    const setupListener = async () => {
      backButtonListener = await CapApp.addListener('backButton', ({ canGoBack }) => {
        if (location.pathname === '/' || location.pathname === '/home') {
          CapApp.exitApp();
        } else if (canGoBack) {
          navigate(-1);
        } else {
          // Fallback if canGoBack is false but we're not on home
          navigate('/');
        }
      });
    };

    setupListener();

    return () => {
      if (backButtonListener) {
        backButtonListener.remove();
      }
    };
  }, [navigate, location]);

  return (
    <div className="App">
      <Navbar />
      <OfflineBanner />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/services" element={<Services />} />
          <Route path="/services/:id" element={<Servicedetail />} />
          <Route path="/ateliers" element={<CarteAteliers />} />
          <Route path="/prestataires" element={<Prestataires />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/mon-compte" element={<MonCompte />} />
          <Route path="/admin-dashboard" element={<PrivateRoute adminOnly><AdminDashboard /></PrivateRoute>} />
          <Route path="/admin/dashboard" element={<PrivateRoute adminOnly><AdminDashboard /></PrivateRoute>} />
          <Route path="/mes-reservations" element={<MesReservations />} />
          <Route path="/mes-ateliers" element={<MesAteliers />} />
          <Route path="/modifier-service/:id" element={<ModifierService />} />
          <Route path="/modifier-atelier/:id" element={<ModifierAtelier />} />
          <Route path="/reserver/:id" element={<Reserver />} />
          <Route path="/evaluer/:id" element={<Evaluer />} />
          <Route path="/chat/:id" element={<ChatPage />} />
          <Route path="/ajouter-atelier" element={<AjouterAtelier />} />
          <Route path="/register-prestataire" element={<RegisterPrestataire />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/prestataire-dashboard" element={<PrestataireDashboard />} />
          <Route path="/prestataire-ajouter-service" element={<PrestataireAjouterService />} />
          <Route path="/prestataire-mes-services" element={<PrestataireMesServices />} />
          <Route path="/admin/services" element={<PrivateRoute adminOnly><ServicesCRUD /></PrivateRoute>} />
          <Route path="/admin/categories" element={<PrivateRoute adminOnly><CategoriesCRUD /></PrivateRoute>} />
          <Route path="/admin/reservations" element={<PrivateRoute adminOnly><ReservationsCRUD /></PrivateRoute>} />
          <Route path="/admin/crud-evaluations" element={<PrivateRoute adminOnly><EvaluationsCRUD /></PrivateRoute>} />
          <Route path="/admin/ateliers" element={<PrivateRoute adminOnly><AteliersCRUD /></PrivateRoute>} />
          <Route path="/admin/prestataires" element={<PrivateRoute adminOnly><PrestatairesCRUD /></PrivateRoute>} />
          <Route path="/admin/all-ateliers" element={<PrivateRoute adminOnly><AdminAllAteliers /></PrivateRoute>} />
          <Route path="/admin/all-reservations" element={<PrivateRoute adminOnly><AdminAllReservations /></PrivateRoute>} />
          <Route path="/admin/all-comptes" element={<PrivateRoute adminOnly><AdminAllComptes /></PrivateRoute>} />
          <Route path="/admin/all-evaluations" element={<PrivateRoute adminOnly><AdminEvaluations /></PrivateRoute>} />
          <Route path="/admin/evaluations" element={<PrivateRoute adminOnly><AdminEvaluations /></PrivateRoute>} />
          <Route path="/admin/all-paiements" element={<PrivateRoute adminOnly><AdminAllPaiements /></PrivateRoute>} />
          <Route path="/admin/all-categories" element={<PrivateRoute adminOnly><AdminAllCategories /></PrivateRoute>} />
          <Route path="/admin/All-services" element={<PrivateRoute adminOnly><AdminAllServices /></PrivateRoute>} />
          <Route path="/inscription-client" element={<Register />} />
          <Route path="/inscription-prestataire" element={<RegisterPrestataire />} />
        </Routes>
      </main>
      <Footer />
      <Chatbot />
    </div>
  );
}

function App() {
  const [showSplash, setShowSplash] = useState(() => {
    return !sessionStorage.getItem('splashShown');
  });

  const handleSplashFinish = () => {
    setShowSplash(false);
    sessionStorage.setItem('splashShown', '1');
  };

  if (showSplash) {
    return <SplashScreen onFinish={handleSplashFinish} />;
  }

  return (
    <HashRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AppContent />
    </HashRouter>
  );
}

export default App;
