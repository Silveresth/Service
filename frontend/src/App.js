import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
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
import Reserver from './pages/Reserver';
import Evaluer from './pages/Evaluer';
import RegisterPrestataire from './pages/RegisterPresataire';
import Login from './pages/Login';
import Register from './pages/Register';
import './App.css';
import './styles/global.css';

function App() {
  return (
    <Router>
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
            <Route path="/reserver/:id" element={<Reserver />} />
            <Route path="/evaluer/:id" element={<Evaluer />} />
            <Route path="/ajouter-atelier" element={<AjouterAtelier />} />
            <Route path="/register-prestataire" element={<RegisterPrestataire />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            {/* Aliases pour les anciens liens */}
            <Route path="/inscription-client" element={<Register />} />
            <Route path="/inscription-prestataire" element={<RegisterPrestataire />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;