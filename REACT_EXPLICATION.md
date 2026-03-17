# Guide React pour Débutants - Configuration Routes & Pages (Service Market)

## 1. Structure du Projet React
```
frontend/
├── public/           # Fichiers statiques (index.html)
├── src/
│   ├── App.js        # Routes principales + Layout (Navbar/Footer)
│   ├── pages/        # Composants pages (/Home.jsx, /Services.jsx...)
│   ├── components/   # Réutilisables (Navbar.jsx, Footer.jsx)
│   ├── context/      # États globaux (AuthContext pour user/login)
│   ├── api/          # Axios config pour backend
│   └── styles/       # CSS global
├── package.json      # Dépendances + scripts (npm start)
└── TODO.md           # Progrès
```

## 2. Lancement Projet
```
cd frontend
npm install          # Installe libs (react-router-dom, axios, leaflet...)
npm start            # Lance sur http://localhost:3000
```

**Proxy backend:** Dans `package.json` `"proxy": "http://localhost:8000"` → API calls sans CORS (`axios.get('/api/services/')`).

## 3. Configuration Routes (react-router-dom)
Dans **App.js** : Fichier central qui définit TOUTES les routes.

```jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';     // Page d'accueil
import Services from './pages/Services';  // Liste services

function App() {
  return (
    <Router>  {/* Active routing */}
      <div>
        <Navbar />  {/* Menu haut fixe */}
        <main>      {/* Contenu pages */}
          <Routes>  {/* Switch routes */}
            <Route path="/" element={<Home />} />           {/* / → Home */}
            <Route path="/services" element={<Services />} /> {/* /services → Services */}
            <Route path="/services/:id" element={<ServiceDetail />} /> {/* /services/123 */}
            {/* + toutes vos pages */}
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}
```

- `path="/"` = URL racine.
- `path="/services/:id"` = paramètre dynamique (id service).
- `element={<Composant />}` = page affichée.

## 4. Créer une Nouvelle Page
1. `src/pages/MaNouvellePage.jsx` :
```jsx
import React from 'react';

export default function MaNouvellePage() {
  return (
    <div>
      <h1>Ma Page</h1>
      <p>Contenu...</p>
    </div>
  );
}
```

2. Ajouter dans App.js Routes :
```jsx
<Route path="/ma-page" element={<MaNouvellePage />} />
```

3. Naviguer : `<Link to="/ma-page">Aller</Link>` (dans Navbar ou page).

## 5. Navigation (Navbar.jsx)
Utilisez `<Link to="...">` ou `useNavigate()` hook :
```jsx
import { Link, useNavigate } from 'react-router-dom';

<Link to="/services">Services</Link>  {/* Simple lien */}

const navigate = useNavigate();
navigate('/login');  // Programmatique (après login)
```

Navbar utilise `useAuth()` context pour menu user (login/logout, dashboard client/prestataire).

## 6. États Globaux (AuthContext)
`context/AuthContext.jsx` gère user connecté partout :
- `user` : objet {username, type_compte='client/prestataire/admin'}
- `login()`, `logout()`

Utilisez dans pages : `const { user } = useAuth();`

## 7. API Backend (api/axios.js)
```jsx
import axios from 'axios';
const api = axios.create({ baseURL: '/api' });  // Proxy auto
export default api;
```
Utilisez : `api.get('/services/').then(res => ...)`.

## 8. Ajout Page Typique (ex: Nouvelle page Réservation)
1. Créer `src/pages/Reserver.jsx` avec formulaire.
2. Ajouter `<Route path="/reserver/:serviceId" element={<Reserver />} />`.
3. Lien dans Services : `<Link to={\`/reserver/\${service.id}\`}>Réserver</Link>`.
4. Dans Reserver : `const {serviceId} = useParams();` pour récupérer id.

## 9. Bonnes Pratiques
- Chaque page = composant autonome (.jsx).
- CSS : `styles/global.css` + modules si besoin.
- Test : `npm start`, naviguez liens.
- Erreurs : Console browser (F12).

Questions ? Demandez pour page spécifique ! 🚀
