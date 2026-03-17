import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Services from './pages/Services';
import Servicedetail from './pages/Servicedetail';
import { CarteAteliers, AjouterAtelier } from './pages/Ateliers';
import Prestataires from './pages/Prestataires';
import Dashboard from './pages/Dashboard';
import MonCompte from './pages/MonCompte';
import { AjouterService } from './pages/AjouterService';
import AdminDashboard from './pages/AdminDashboard';
import MesReservations from './pages/MesReservations';
import MesAteliers from './pages/MesAteliers';
import MesServices from './pages/MesServices';
import ModifierService from './pages/ModifierService';
import ModifierAtelier from './pages/ModifierAtelier';
import Reserver from './pages/Reserver';
import Evaluer from './pages/Evaluer';
import ChatPage from './pages/ChatPage';
import RegisterPrestataire from './pages/RegisterPresataire';
import Login from './pages/Login';
import Register from './pages/Register';

// Pages CRUD Admin
import ServicesCRUD from './pages/ServicesCRUD';
import CategoriesCRUD from './pages/CategoriesCRUD';
import ReservationsCRUD from './pages/ReservationsCRUD';
import EvaluationsCRUD from './pages/EvaluationsCRUD';
import AteliersCRUD from './pages/AteliersCRUD';
import PrestatairesCRUD from './pages/PrestatairesCRUD';

// Pages Admin All (list views)
import AdminAllServices from './pages/AdminAllServices';
import AdminAllAteliers from './pages/AdminAllAteliers';
import AdminAllReservations from './pages/AdminAllReservations';
import AdminAllComptes from './pages/AdminAllComptes';
import AdminEvaluations from './pages/AdminEvaluations';

import './App.css';
import './styles/global.css';
import './styles/admin.css';

function App() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <div className="App">
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/services" element={<Services />} />
            <Route path="/services/:id" element={<Servicedetail />} />
            <Route path="/ateliers" element={<CarteAteliers />} />
            <Route path="/prestataires" element={<Prestataires />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/mon-compte" element={<MonCompte />} />
            <Route path="/ajouter-service" element={<AjouterService />} />
            <Route path="/admin-dashboard" element={<AdminDashboard />} />
            <Route path="/mes-reservations" element={<MesReservations />} />
            <Route path="/mes-ateliers" element={<MesAteliers />} />
            <Route path="/mes-services" element={<MesServices />} />
            <Route path="/modifier-service/:id" element={<ModifierService />} />
            <Route path="/modifier-atelier/:id" element={<ModifierAtelier />} />
            <Route path="/reserver/:id" element={<Reserver />} />
            <Route path="/evaluer/:id" element={<Evaluer />} />
            <Route path="/chat/:id" element={<ChatPage />} />
            <Route path="/ajouter-atelier" element={<AjouterAtelier />} />
            <Route path="/register-prestataire" element={<RegisterPrestataire />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

{/* Routes CRUD Admin */}
            <Route path="/admin/services" element={<ServicesCRUD />} />
            <Route path="/admin/categories" element={<CategoriesCRUD />} />
            <Route path="/admin/reservations" element={<ReservationsCRUD />} />
            <Route path="/admin/crud-evaluations" element={<EvaluationsCRUD />} />
            <Route path="/admin/ateliers" element={<AteliersCRUD />} />
            <Route path="/admin/prestataires" element={<PrestatairesCRUD />} />

{/* Routes Admin All (list views) */}
            <Route path="/admin/all-services" element={<AdminAllServices />} />
            <Route path="/admin/all-ateliers" element={<AdminAllAteliers />} />
            <Route path="/admin/all-reservations" element={<AdminAllReservations />} />
            <Route path="/admin/all-comptes" element={<AdminAllComptes />} />
            <Route path="/admin/all-evaluations" element={<AdminEvaluations />} />
            <Route path="/admin/evaluations" element={<AdminEvaluations />} />

            {/* Aliases pour les anciens liens */}
            <Route path="/inscription-client" element={<Register />} />
<Route path="/inscription-prestataire" element={<RegisterPrestataire />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;
