import { useState, useEffect } from 'react';
import { initStorage } from './mockData';
import Auth from './components/Auth';
import CitizenDashboard from './components/CitizenDashboard';
import AuthorityDashboard from './components/AuthorityDashboard';
import FieldStaffDashboard from './components/FieldStaffDashboard';
import './App.css';

function App() {
  const [currentUser, setCurrentUser] = useState(null);

  // Initialize simulated DB on load
  useEffect(() => {
    initStorage();
    
    // Check if user session is saved in local state
    const savedUser = sessionStorage.getItem('rc_session');
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    }
  }, []);

  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    sessionStorage.setItem('rc_session', JSON.stringify(user));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    sessionStorage.removeItem('rc_session');
  };

  const renderDashboard = () => {
    if (!currentUser) {
      return <Auth onLoginSuccess={handleLoginSuccess} />;
    }

    switch (currentUser.role) {
      case 'ciudadano':
        return <CitizenDashboard user={currentUser} onLogout={handleLogout} />;
      case 'autoridad':
        return <AuthorityDashboard user={currentUser} onLogout={handleLogout} />;
      case 'personal_campo':
        return <FieldStaffDashboard user={currentUser} onLogout={handleLogout} />;
      default:
        return (
          <div className="card text-center" style={{ margin: '40px auto', maxWidth: '500px', padding: '30px' }}>
            <h2>⚠️ Error de Acceso</h2>
            <p>El rol de usuario "{currentUser.role}" no tiene un panel asignado en el sistema.</p>
            <button type="button" className="btn btn-primary" onClick={handleLogout}>
              Volver al Inicio
            </button>
          </div>
        );
    }
  };

  return (
    <>
      <nav className="main-navbar">
        <div className="navbar-brand">
          <span className="brand-logo-small">🏛️</span>
          <span>Gobierno Local - Reporte Ciudadano</span>
        </div>
        {currentUser && (
          <div className="navbar-user">
            <span className="navbar-user-name">📍 {currentUser.name}</span>
            <button
              type="button"
              className="navbar-logout-link"
              onClick={handleLogout}
            >
              Cerrar Sesión
            </button>
          </div>
        )}
      </nav>
      
      <div className={`app-main-content ${!currentUser ? 'auth-layout' : ''}`}>
        {renderDashboard()}
      </div>

      {currentUser && (
        <footer className="main-footer">
          <p>© 2026 Municipalidad de Reporte Ciudadano. Todos los derechos reservados.</p>
          <p className="footer-sub">Diseñado para la Transparencia y Eficiencia en la Gestión de Servicios Comunitarios.</p>
        </footer>
      )}
    </>
  );
}

export default App;
