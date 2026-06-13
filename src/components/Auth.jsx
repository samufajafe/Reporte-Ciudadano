import { useState } from 'react';
import { getUsers, saveUser } from '../mockData';

export default function Auth({ onLoginSuccess }) {
  const [activeTab, setActiveTab] = useState('citizen'); // 'citizen' | 'municipal'
  const [isRegister, setIsRegister] = useState(false);
  
  // Form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const users = getUsers();
      const user = users.find(
        (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
      );

      if (!user) {
        setError('Credenciales incorrectas. Verifique su correo y contraseña.');
        return;
      }

      // Role check for municipal tab
      if (activeTab === 'municipal' && user.role === 'ciudadano') {
        setError('Acceso denegado. Este panel es exclusivo para personal municipal.');
        return;
      }
      if (activeTab === 'citizen' && user.role !== 'ciudadano') {
        setError('Por favor use la pestaña de Acceso Municipal para iniciar sesión con su cuenta municipal.');
        return;
      }

      onLoginSuccess(user);
    } catch (err) {
      setError('Ocurrió un error al intentar iniciar sesión.');
    }
  };

  const handleRegister = (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!name || !email || !password) {
      setError('Por favor complete todos los campos.');
      return;
    }

    try {
      const newUser = {
        email,
        password,
        name,
        role: 'ciudadano'
      };

      saveUser(newUser);
      setSuccess('¡Registro exitoso! Ya puede iniciar sesión.');
      setIsRegister(false);
      setPassword('');
    } catch (err) {
      setError(err.message || 'Error al registrar el usuario.');
    }
  };

  const autofillDemo = (role) => {
    if (role === 'autoridad') {
      setEmail('autoridad@municipal.go.cr');
      setPassword('autoridad123');
      setActiveTab('municipal');
      setIsRegister(false);
    } else if (role === 'campo') {
      setEmail('campo@municipal.go.cr');
      setPassword('campo123');
      setActiveTab('municipal');
      setIsRegister(false);
    } else if (role === 'poc_ciudadano') {
      setEmail('ciudadano@ejemplo.com');
      setPassword('ciudadano123');
      setActiveTab('citizen');
      setIsRegister(false);
    }
  };

  return (
    <div className="auth-container animate-fade-in">
      <div className="auth-card">
        <div className="auth-header">
          <div className="brand-logo">🏛️</div>
          <h2>Reporte Ciudadano</h2>
          <p className="subtitle">Plataforma de Atención y Resolución de Problemas Comunitarios</p>
        </div>

        <div className="auth-tabs">
          <button
            type="button"
            className={`tab-btn ${activeTab === 'citizen' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('citizen');
              setIsRegister(false);
              setError('');
              setSuccess('');
            }}
          >
            👤 Ciudadanos
          </button>
          <button
            type="button"
            className={`tab-btn ${activeTab === 'municipal' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('municipal');
              setIsRegister(false);
              setError('');
              setSuccess('');
            }}
          >
            💼 Municipalidad
          </button>
        </div>

        <div className="auth-body">
          {error && <div className="alert alert-danger">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}

          {isRegister ? (
            <form onSubmit={handleRegister} className="auth-form">
              <h3>Crear Cuenta de Ciudadano</h3>
              <p className="form-helper">Regístrese para reportar incidencias comunitarias y seguir sus casos.</p>
              
              <div className="form-group">
                <label htmlFor="reg-name">Nombre Completo</label>
                <input
                  id="reg-name"
                  type="text"
                  placeholder="Ej. Juan Pérez"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="reg-email">Correo Electrónico</label>
                <input
                  id="reg-email"
                  type="email"
                  placeholder="juan.perez@ejemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="reg-password">Contraseña</label>
                <input
                  id="reg-password"
                  type="password"
                  placeholder="Mínimo 6 caracteres"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <button type="submit" className="btn btn-primary btn-block">
                Registrarme
              </button>

              <p className="toggle-auth">
                ¿Ya tiene una cuenta?{' '}
                <button type="button" onClick={() => setIsRegister(false)}>
                  Inicie Sesión
                </button>
              </p>
            </form>
          ) : (
            <form onSubmit={handleLogin} className="auth-form">
              <h3>
                {activeTab === 'citizen' ? 'Iniciar Sesión (Ciudadanos)' : 'Acceso Personal Municipal'}
              </h3>
              <p className="form-helper">
                {activeTab === 'citizen'
                  ? 'Ingrese a su panel para enviar reportes urbanos.'
                  : 'Use sus credenciales autorizadas por la Municipalidad.'}
              </p>

              <div className="form-group">
                <label htmlFor="login-email">Correo Electrónico</label>
                <input
                  id="login-email"
                  type="email"
                  placeholder="ejemplo@correo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="login-password">Contraseña</label>
                <input
                  id="login-password"
                  type="password"
                  placeholder="Ingrese su contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <button type="submit" className="btn btn-primary btn-block">
                Ingresar a la Plataforma
              </button>

              {activeTab === 'citizen' && (
                <p className="toggle-auth">
                  ¿No tiene una cuenta?{' '}
                  <button type="button" onClick={() => setIsRegister(true)}>
                    Regístrese aquí
                  </button>
                </p>
              )}
            </form>
          )}
        </div>

        <div className="demo-credentials">
          <p className="demo-title">📌 Credenciales de prueba rápida:</p>
          <div className="demo-buttons">
            <button
              type="button"
              className="demo-badge"
              onClick={() => autofillDemo('autoridad')}
            >
              🔑 Autoridad Municipal
            </button>
            <button
              type="button"
              className="demo-badge"
              onClick={() => autofillDemo('campo')}
            >
              🔑 Personal de Campo
            </button>
            <button
              type="button"
              className="demo-badge"
              onClick={() => autofillDemo('poc_ciudadano')}
              style={{ border: '1px solid var(--primary)', color: 'var(--primary)', fontWeight: 'bold' }}
            >
              🚀 Ciudadano PoC
            </button>
          </div>
        </div>
        <p className="auth-footer-text" style={{ textAlign: 'center', fontSize: '11px', color: 'var(--text-muted)', marginTop: '24px', marginBottom: '0', opacity: '0.7' }}>
          © 2026 Municipalidad de Reporte Ciudadano.
        </p>
      </div>
    </div>
  );
}
