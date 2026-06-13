import { useState, useEffect, useRef } from 'react';
import { getReports, createReport, CATEGORIES, PRIORITIES, STATUSES, updateUserProfile, getNotifications, markNotificationRead, markAllNotificationsRead } from '../mockData';
import { MapSelector, MapPreview } from './MapComponents';

// Fallback data in case the public API has CORS issues or is offline
const FALLBACK_GEOGRAPHY = {
  provincias: [
    { id: '1', nombre: 'San José' },
    { id: '2', nombre: 'Alajuela' },
    { id: '3', nombre: 'Cartago' },
    { id: '4', nombre: 'Heredia' },
    { id: '5', nombre: 'Guanacaste' },
    { id: '6', nombre: 'Puntarenas' },
    { id: '7', nombre: 'Limón' }
  ],
  cantones: {
    '1': [
      { id: '101', nombre: 'San José' },
      { id: '102', nombre: 'Escazú' },
      { id: '103', nombre: 'Desamparados' }
    ],
    '2': [
      { id: '201', nombre: 'Alajuela' },
      { id: '202', nombre: 'San Ramón' }
    ],
    '3': [
      { id: '301', nombre: 'Cartago' },
      { id: '302', nombre: 'Paraíso' }
    ],
    '4': [
      { id: '401', nombre: 'Heredia' },
      { id: '402', nombre: 'Barva' }
    ],
    '5': [
      { id: '501', nombre: 'Liberia' },
      { id: '502', nombre: 'Nicoya' }
    ],
    '6': [
      { id: '601', nombre: 'Puntarenas' },
      { id: '602', nombre: 'Esparza' }
    ],
    '7': [
      { id: '701', nombre: 'Limón' },
      { id: '702', nombre: 'Pococí' }
    ]
  },
  distritos: {
    '101': [
      { id: '10101', nombre: 'Carmen' },
      { id: '10102', nombre: 'Merced' }
    ],
    '102': [
      { id: '10201', nombre: 'Escazú Centro' },
      { id: '10202', nombre: 'San Antonio' },
      { id: '10203', nombre: 'San Rafael' }
    ],
    '103': [
      { id: '10301', nombre: 'Desamparados Centro' }
    ],
    '201': [
      { id: '20101', nombre: 'Alajuela Centro' },
      { id: '20102', nombre: 'San José' }
    ],
    '202': [
      { id: '20201', nombre: 'San Ramón Centro' }
    ],
    '301': [
      { id: '30101', nombre: 'Oriental' },
      { id: '30102', nombre: 'Occidental' }
    ],
    '302': [
      { id: '30201', nombre: 'Paraíso Centro' }
    ],
    '401': [
      { id: '40101', nombre: 'Heredia Centro' },
      { id: '40102', nombre: 'Mercedes' }
    ],
    '402': [
      { id: '40201', nombre: 'Barva Centro' }
    ],
    '501': [
      { id: '50101', nombre: 'Liberia Centro' }
    ],
    '502': [
      { id: '50201', nombre: 'Nicoya Centro' }
    ],
    '601': [
      { id: '60101', nombre: 'Puntarenas Centro' }
    ],
    '602': [
      { id: '60201', nombre: 'Esparza Centro' }
    ],
    '701': [
      { id: '70101', nombre: 'Limón Centro' }
    ],
    '702': [
      { id: '70201', nombre: 'Guápiles' }
    ]
  }
};

export default function CitizenDashboard({ user, onLogout }) {
  const [reports, setReports] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);

  // Notifications and Profile states
  const [notifications, setNotifications] = useState([]);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(user.notificationsEnabled !== false);
  const [zoomedImage, setZoomedImage] = useState(null);

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('vias');
  const [location, setLocation] = useState('');
  const [priority, setPriority] = useState('medium');
  const [uploadedImages, setUploadedImages] = useState([]); // Array of Base64 strings
  const [mapCoordinates, setMapCoordinates] = useState(null); // {x: %, y: %}
  
  // CR Geographic API states
  const [provincias, setProvincias] = useState([]);
  const [cantones, setCantones] = useState([]);
  const [distritos, setDistritos] = useState([]);
  const [selectedProvincia, setSelectedProvincia] = useState('');
  const [selectedCanton, setSelectedCanton] = useState('');
  const [selectedDistrito, setSelectedDistrito] = useState('');
  const [isLoadingGeo, setIsLoadingGeo] = useState(false);

  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  // History Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  useEffect(() => {
    loadReports();
    loadNotifications();
    fetchProvincias();

    // Auto-reload to simulate real-time notification/status checks
    const interval = setInterval(() => {
      loadNotifications();
      loadReports();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadNotifications = () => {
    setNotifications(getNotifications(user.email));
  };

  const handleNotificationClick = (notif) => {
    markNotificationRead(notif.id);
    loadNotifications();
    setShowNotifDropdown(false);
    
    // Find and select the report
    const all = getReports();
    const foundReport = all.find(r => r.id === notif.reportId);
    if (foundReport) {
      setSelectedReport(foundReport);
      setShowForm(false);
    }
  };

  const handleMarkAllRead = () => {
    markAllNotificationsRead(user.email);
    loadNotifications();
  };

  const handleToggleNotifications = (e) => {
    const enabled = e.target.checked;
    setNotificationsEnabled(enabled);
    updateUserProfile(user.email, { notificationsEnabled: enabled });
  };

  // Fetch Provincias when Form opens
  useEffect(() => {
    if (showForm) {
      fetchProvincias();
    }
  }, [showForm]);

  const loadReports = () => {
    const all = getReports();
    const filtered = all.filter((r) => r.citizenEmail === user.email);
    // Sort descending by date
    const sorted = filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    setReports(sorted);
  };

  const filteredReports = reports.filter((rep) => {
    const matchesSearch = 
      rep.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (rep.description && rep.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
      rep.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rep.id.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesStatus = statusFilter === 'all' || rep.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || rep.category === categoryFilter;
    
    return matchesSearch && matchesStatus && matchesCategory;
  });

  // --- API Geographic Fetching ---
  const getCantonesList = async (provinciaId) => {
    if (!provinciaId) return [];
    // Swap Cartago (3) and Heredia (4) because the API has them swapped
    const apiProvinciaId = provinciaId === '3' ? '4' : (provinciaId === '4' ? '3' : provinciaId);
    try {
      const response = await fetch(`https://api-geo-cr.vercel.app/provincias/${apiProvinciaId}/cantones`);
      if (!response.ok) throw new Error('API down');
      const json = await response.json();
      return (json.data || []).map(c => ({
        id: String(c.idCanton),
        nombre: c.descripcion
      }));
    } catch (error) {
      console.warn('Using local fallback for Cantones:', error);
      return FALLBACK_GEOGRAPHY.cantones[provinciaId] || [];
    }
  };

  const getDistritosList = async (cantonId) => {
    if (!cantonId) return [];
    try {
      const response = await fetch(`https://api-geo-cr.vercel.app/cantones/${cantonId}/distritos`);
      if (!response.ok) throw new Error('API down');
      const json = await response.json();
      return (json.data || []).map(d => ({
        id: String(d.idDistrito),
        nombre: d.descripcion
      }));
    } catch (error) {
      console.warn('Using local fallback for Distritos:', error);
      return FALLBACK_GEOGRAPHY.distritos[cantonId] || [];
    }
  };

  const fetchProvincias = async () => {
    setIsLoadingGeo(true);
    try {
      const response = await fetch('https://api-geo-cr.vercel.app/provincias');
      if (!response.ok) throw new Error('API down');
      const json = await response.json();
      console.log('API Provinces response:', json.data);
      
      // Map API fields (idProvincia, descripcion) to unified structure ({ id, nombre })
      const mapped = (json.data || []).map(p => ({
        id: String(p.idProvincia),
        nombre: p.descripcion
      }));

      setProvincias(mapped);
    } catch (error) {
      console.warn('Using local fallback for Provincias:', error);
      setProvincias(FALLBACK_GEOGRAPHY.provincias);
    } finally {
      setIsLoadingGeo(false);
    }
  };

  const fetchCantones = async (provinciaId) => {
    setIsLoadingGeo(true);
    const list = await getCantonesList(provinciaId);
    setCantones(list);
    setIsLoadingGeo(false);
  };

  const fetchDistritos = async (cantonId) => {
    setIsLoadingGeo(true);
    const list = await getDistritosList(cantonId);
    setDistritos(list);
    setIsLoadingGeo(false);
  };

  // Image Upload helper (Base64)
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setFormError('');
    if (uploadedImages.length + files.length > 5) {
      setFormError('No puede adjuntar más de 5 fotografías en total.');
      return;
    }

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImages((prev) => {
          if (prev.length >= 5) return prev;
          return [...prev, reader.result];
        });
      };
      reader.readAsDataURL(file);
    });
  };

  const removeUploadedImage = (indexToRemove) => {
    setUploadedImages((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  // Real Map Selection Action
  const handleMapSelect = async (coords) => {
    setFormError('');
    setMapCoordinates(coords);
    
    const defaultDesc = `Calle Vecinal (Lat: ${coords.lat.toFixed(5)}, Lng: ${coords.lng.toFixed(5)})`;
    
    // Attempt reverse geocoding to auto-select Costa Rican geographic divisions
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${coords.lat}&lon=${coords.lng}`, {
        headers: { 'Accept-Language': 'es' }
      });
      if (res.ok) {
        const json = await res.json();
        const addr = json.address || {};
        
        const stateName = addr.state || '';
        const countyName = addr.county || addr.city || addr.town || '';
        const districtName = addr.suburb || addr.neighbourhood || addr.village || addr.city_district || addr.hamlet || '';
        
        const clean = str => str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
        const cleanDisplayName = name => {
          if (!name) return '';
          return name
            .replace(/Cantón de\s+/i, '')
            .replace(/Cantón\s+/i, '')
            .replace(/Distrito de\s+/i, '')
            .replace(/Distrito\s+/i, '')
            .trim();
        };
        
        // 1. Match Provincia
        const matchedProv = provincias.find(p => clean(p.nombre) === clean(stateName) || clean(stateName).includes(clean(p.nombre)) || clean(p.nombre).includes(clean(stateName)));
        if (matchedProv) {
          setSelectedProvincia(matchedProv.id);
          
          let matchedCanton = null;
          let matchedDistrito = null;

          // Fetch cantones (uses helper which falls back to local data if API is down)
          const mappedCantons = await getCantonesList(matchedProv.id);
          
          // 2. Match Cantón
          matchedCanton = mappedCantons.find(c => clean(c.nombre) === clean(countyName) || clean(countyName).includes(clean(c.nombre)) || clean(c.nombre).includes(clean(countyName)));
          if (!matchedCanton && countyName) {
            const cleanCantonName = cleanDisplayName(countyName);
            matchedCanton = {
              id: `custom-canton-${clean(cleanCantonName)}`,
              nombre: cleanCantonName
            };
            mappedCantons.push(matchedCanton);
          }
          
          setCantones(mappedCantons);
          
          if (matchedCanton) {
            setSelectedCanton(matchedCanton.id);
            
            // Fetch distritos (uses helper which falls back to local data if API is down)
            let mappedDistritos = [];
            if (!matchedCanton.id.startsWith('custom-canton-')) {
              mappedDistritos = await getDistritosList(matchedCanton.id);
            }
            
            // 3. Match Distrito
            matchedDistrito = mappedDistritos.find(d => clean(d.nombre) === clean(districtName) || clean(districtName).includes(clean(d.nombre)) || clean(d.nombre).includes(clean(districtName)));
            const resolvedDistName = districtName || countyName || matchedCanton.nombre;
            if (!matchedDistrito && resolvedDistName) {
              const cleanDistName = cleanDisplayName(resolvedDistName);
              matchedDistrito = {
                id: `custom-distrito-${clean(cleanDistName)}`,
                nombre: cleanDistName
              };
              mappedDistritos.push(matchedDistrito);
            }
            
            setDistritos(mappedDistritos);
            
            if (matchedDistrito) {
              setSelectedDistrito(matchedDistrito.id);
            }
          }
          
          // Generate customized address
          const cName = matchedCanton ? matchedCanton.nombre : countyName;
          const dName = matchedDistrito ? matchedDistrito.nombre : districtName;
          const names = [matchedProv.nombre, cName, dName].filter(Boolean).join(', ');
          setLocation(`${names} - ${defaultDesc}`);
          return;
        }
      }
    } catch (e) {
      console.warn('Reverse geocoding error:', e);
    }
    
    // Fallback if reverse geocoding matches fail
    const provName = provincias.find(p => p.id === selectedProvincia)?.nombre || '';
    const cantName = cantones.find(c => c.id === selectedCanton)?.nombre || '';
    const distName = distritos.find(d => d.id === selectedDistrito)?.nombre || '';
    const locationPrefix = [provName, cantName, distName].filter(Boolean).join(', ');
    setLocation(`${locationPrefix ? locationPrefix + ' - ' : ''}${defaultDesc}`);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    // Strict validation
    if (!title.trim()) {
      setFormError('El Título del reporte es obligatorio.');
      return;
    }
    if (!selectedProvincia || !selectedCanton || !selectedDistrito) {
      setFormError('Debe seleccionar la Provincia, Cantón y Distrito correspondientes.');
      return;
    }
    if (!location.trim()) {
      setFormError('La Ubicación/Dirección exacta es obligatoria.');
      return;
    }
    if (!mapCoordinates) {
      setFormError('Debe marcar la ubicación exacta del problema en el mapa haciendo clic o usando el GPS.');
      return;
    }
    if (uploadedImages.length === 0) {
      setFormError('Debe adjuntar al menos una foto como evidencia visual del problema.');
      return;
    }
    if (uploadedImages.length > 5) {
      setFormError('No puede adjuntar más de 5 fotografías como evidencia.');
      return;
    }

    try {
      const provName = provincias.find(p => p.id === selectedProvincia)?.nombre || '';
      const cantName = cantones.find(c => c.id === selectedCanton)?.nombre || '';
      const distName = distritos.find(d => d.id === selectedDistrito)?.nombre || '';

      const newReportData = {
        title,
        description,
        category,
        location: `${provName}, ${cantName}, ${distName} - ${location}`,
        priority,
        coordinates: mapCoordinates,
        images: uploadedImages,
        citizenEmail: user.email
      };

      const createdReport = createReport(newReportData);
      setFormSuccess(`¡El reporte ha sido enviado exitosamente a la municipalidad! Código de seguimiento: ${createdReport.id}`);
      
      // Reset Form
      setTitle('');
      setDescription('');
      setLocation('');
      setCategory('vias');
      setPriority('medium');
      setUploadedImages([]);
      setMapCoordinates(null);
      setSelectedProvincia('');
      setSelectedCanton('');
      setSelectedDistrito('');
      setCantones([]);
      setDistritos([]);
      
      loadReports();
      
      setTimeout(() => {
        setShowForm(false);
        setFormSuccess('');
      }, 2000);
    } catch (err) {
      setFormError('Error al guardar el reporte. Inténtelo de nuevo.');
    }
  };

  const getStatusBadge = (statusValue) => {
    const status = STATUSES.find((s) => s.value === statusValue) || { label: statusValue, color: '#333' };
    return (
      <span className="badge" style={{ backgroundColor: status.color + '20', color: status.color, border: `1px solid ${status.color}40` }}>
        ● {status.label}
      </span>
    );
  };

  const getPriorityBadge = (priorityValue) => {
    const priorityObj = PRIORITIES.find((p) => p.value === priorityValue) || { label: priorityValue, color: '#333' };
    return (
      <span className="badge priority-badge" style={{ backgroundColor: priorityObj.color + '15', color: priorityObj.color }}>
        {priorityObj.label}
      </span>
    );
  };

  const getCategoryIcon = (catId) => {
    const cat = CATEGORIES.find((c) => c.id === catId);
    return cat ? `${cat.icon} ${cat.label}` : catId;
  };

  return (
    <div className="dashboard-container animate-fade-in">
      <header className="dashboard-header">
        <div className="header-user-info">
          <span className="avatar">👤</span>
          <div>
            <h3>{user.name}</h3>
            <span className="user-role-badge citizen">Ciudadano</span>
          </div>
        </div>
        <div className="header-actions" style={{ display: 'flex', alignItems: 'center', gap: '10px', position: 'relative' }}>
          {/* Notification Bell */}
          <div className="notification-bell-container" style={{ position: 'relative' }}>
            <button
              type="button"
              className="btn-icon-badge"
              onClick={() => {
                setShowNotifDropdown(!showNotifDropdown);
                setShowProfileModal(false);
              }}
              style={{
                background: 'var(--bg-main)',
                border: '1px solid var(--border)',
                borderRadius: '50%',
                width: '40px',
                height: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '18px',
                cursor: 'pointer',
                position: 'relative',
                transition: 'all 0.2s'
              }}
            >
              🔔
              {notifications.filter(n => !n.read).length > 0 && (
                <span className="bell-badge" style={{
                  position: 'absolute',
                  top: '-4px',
                  right: '-4px',
                  background: 'var(--danger, #ef4444)',
                  color: 'white',
                  borderRadius: '50%',
                  width: '20px',
                  height: '20px',
                  fontSize: '11px',
                  fontWeight: 'bold',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.15)'
                }}>
                  {notifications.filter(n => !n.read).length}
                </span>
              )}
            </button>

            {showNotifDropdown && (
              <div className="notification-dropdown card" style={{
                animation: 'fade-in 0.2s ease'
              }}>
                <div className="dropdown-header" style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px 16px',
                  borderBottom: '1px solid var(--border)',
                  background: 'var(--bg-main)'
                }}>
                  <strong style={{ fontSize: '14px' }}>Notificaciones</strong>
                  {notifications.filter(n => !n.read).length > 0 && (
                    <button
                      type="button"
                      onClick={handleMarkAllRead}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--primary)',
                        fontSize: '12px',
                        cursor: 'pointer',
                        fontWeight: '600'
                      }}
                    >
                      Marcar todo leídos
                    </button>
                  )}
                </div>
                <div className="dropdown-body" style={{ padding: '8px 0' }}>
                  {notifications.length === 0 ? (
                    <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>
                      No tienes notificaciones
                    </div>
                  ) : (
                     notifications.map(n => (
                      <div
                        key={n.id}
                        onClick={() => handleNotificationClick(n)}
                        className={`notification-item ${!n.read ? 'unread' : ''}`}
                        style={{
                          padding: '12px 16px',
                          borderBottom: '1px solid var(--border)',
                          cursor: 'pointer',
                          backgroundColor: !n.read ? 'rgba(59, 130, 246, 0.05)' : 'transparent',
                          transition: 'background-color 0.2s',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '4px',
                          textAlign: 'left'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)' }}>
                          <strong>{n.newStatus.toUpperCase()}</strong>
                          <span>{new Date(n.date).toLocaleDateString()}</span>
                        </div>
                        <span style={{ fontSize: '13px', fontWeight: !n.read ? '600' : '400' }}>
                          El estado de "{n.reportTitle}" cambió.
                        </span>
                        {n.note && (
                          <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontStyle: 'italic', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            💬 {n.note}
                          </span>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Profile Gear */}
          <button
            type="button"
            className="btn-icon-badge"
            onClick={() => {
              setShowProfileModal(!showProfileModal);
              setShowNotifDropdown(false);
            }}
            style={{
              background: 'var(--bg-main)',
              border: '1px solid var(--border)',
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '18px',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            ⚙️
          </button>

          <button
            type="button"
            className="btn btn-secondary"
            onClick={onLogout}
          >
            Cerrar Sesión
          </button>
        </div>
      </header>

      <main className="dashboard-content">
        <section className="welcome-banner">
          <div className="welcome-text">
            <h2>Bienvenido a tu Portal Ciudadano</h2>
            <p>Reporta problemas del espacio público en tu vecindario con evidencias y ubicación en tiempo real.</p>
          </div>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => {
              setShowForm(!showForm);
              setSelectedReport(null);
            }}
          >
            {showForm ? '✖ Cancelar Reporte' : '➕ Reportar Incidencia'}
          </button>
        </section>

        {showForm ? (
          <section className="form-section card animate-slide-up">
            <div className="card-header">
              <h3>Crear Nuevo Reporte</h3>
              <p>Por favor complete los campos obligatorios indicados con <span style={{ color: 'var(--danger)', fontWeight: 'bold' }}>*</span></p>
            </div>
            
            {formError && <div className="alert alert-danger">{formError}</div>}
            {formSuccess && <div className="alert alert-success">{formSuccess}</div>}

            <form onSubmit={handleSubmit} className="report-form">
              <div className="form-row">
                <div className="form-group flex-2">
                  <label htmlFor="rep-title">Título del Reporte <span style={{ color: 'var(--danger)' }}>*</span></label>
                  <input
                    id="rep-title"
                    type="text"
                    placeholder="Ej. Baches profundos e inundación de calle"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group flex-1">
                  <label htmlFor="rep-category">Tipo de Problema <span style={{ color: 'var(--danger)' }}>*</span></label>
                  <select
                    id="rep-category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.icon} {c.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Costa Rica Geographic API dropdowns */}
              <div className="form-row" style={{ backgroundColor: 'var(--bg-main)', padding: '16px', borderRadius: 'var(--radius-sm)', marginBottom: '20px', border: '1px solid var(--border)' }}>
                <div className="form-group flex-1" style={{ marginBottom: 0 }}>
                  <label htmlFor="geo-prov">Provincia <span style={{ color: 'var(--danger)' }}>*</span></label>
                  <select
                    id="geo-prov"
                    value={selectedProvincia}
                    onChange={(e) => {
                      const val = e.target.value;
                      setSelectedProvincia(val);
                      setSelectedCanton('');
                      setSelectedDistrito('');
                      setCantones([]);
                      setDistritos([]);
                      if (val) {
                        fetchCantones(val);
                      }
                    }}
                    disabled={isLoadingGeo && provincias.length === 0}
                  >
                    <option value="">Seleccione Provincia...</option>
                    {provincias.map((p) => (
                      <option key={p.id} value={p.id}>{p.nombre}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group flex-1" style={{ marginBottom: 0 }}>
                  <label htmlFor="geo-cant">Cantón <span style={{ color: 'var(--danger)' }}>*</span></label>
                  <select
                    id="geo-cant"
                    value={selectedCanton}
                    onChange={(e) => {
                      const val = e.target.value;
                      setSelectedCanton(val);
                      setSelectedDistrito('');
                      setDistritos([]);
                      if (val) {
                        fetchDistritos(val);
                      }
                    }}
                    disabled={!selectedProvincia || cantones.length === 0}
                  >
                    <option value="">Seleccione Cantón...</option>
                    {cantones.map((c) => (
                      <option key={c.id} value={c.id}>{c.nombre}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group flex-1" style={{ marginBottom: 0 }}>
                  <label htmlFor="geo-dist">Distrito <span style={{ color: 'var(--danger)' }}>*</span></label>
                  <select
                    id="geo-dist"
                    value={selectedDistrito}
                    onChange={(e) => setSelectedDistrito(e.target.value)}
                    disabled={!selectedCanton || distritos.length === 0}
                  >
                    <option value="">Seleccione Distrito...</option>
                    {distritos.map((d) => (
                      <option key={d.id} value={d.id}>{d.nombre}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="rep-desc">Descripción Detallada <span className="optional-text" style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 'normal', marginLeft: '5px' }}>(Opcional)</span></label>
                <textarea
                  id="rep-desc"
                  rows="3"
                  placeholder="Explique el problema de manera concisa para ayudar a las autoridades a comprenderlo."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                ></textarea>
              </div>

              {/* Photo Upload Area */}
              <div className="form-group">
                <label>Adjuntar Fotos de Evidencia <span style={{ color: 'var(--danger)' }}>*</span></label>
                <p className="form-helper" style={{ margin: '0 0 10px 0' }}>Cargue imágenes reales del problema comunitario para sustentar su caso.</p>
                <div className="image-upload-zone">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageChange}
                    className="file-input-hidden"
                    id="evidence-photos"
                  />
                  <label htmlFor="evidence-photos" className="image-upload-label">
                    📷 Clic aquí para seleccionar imágenes de evidencia
                  </label>
                </div>
                
                {uploadedImages.length > 0 && (
                  <div className="image-previews-grid">
                    {uploadedImages.map((img, idx) => (
                      <div key={idx} className="preview-item">
                        <img src={img} alt={`Preview ${idx}`} />
                        <button
                          type="button"
                          className="btn-remove-preview"
                          onClick={() => removeUploadedImage(idx)}
                        >
                          ✖
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Coordinates & Leaflet Map */}
              <div className="form-row">
                <div className="form-group flex-1">
                   <label>Ubicación Geográfica Exacta <span style={{ color: 'var(--danger)' }}>*</span></label>
                   <p className="form-helper" style={{ margin: '0 0 10px 0' }}>Haga clic sobre el mapa para colocar el pin de la incidencia o usa el GPS.</p>
                   
                   <MapSelector
                     onSelectCoordinates={handleMapSelect}
                     initialCoordinates={mapCoordinates}
                     provinceName={provincias.find(p => p.id === selectedProvincia)?.nombre}
                   />
                </div>

                <div className="form-group flex-1">
                  <label htmlFor="rep-loc">Dirección Escrita / Puntos de Referencia <span style={{ color: 'var(--danger)' }}>*</span></label>
                  <input
                    id="rep-loc"
                    type="text"
                    placeholder="Ej. Calle 5, a 30 metros de la delegación"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    required
                  />
                  
                  {mapCoordinates && (
                    <div className="coordinates-display card" style={{ marginTop: '16px', padding: '10px', background: 'var(--bg-main)' }}>
                      <strong>Coordenadas del Pin:</strong>
                      <code style={{ fontSize: '12px', display: 'block', marginTop: '4px' }}>
                        {mapCoordinates.lat ? `Lat: ${mapCoordinates.lat.toFixed(5)}, Lng: ${mapCoordinates.lng.toFixed(5)}` : `X: ${mapCoordinates.x}%, Y: ${mapCoordinates.y}%`}
                      </code>
                    </div>
                  )}
                </div>
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowForm(false)}
                >
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  Enviar Reporte Oficial
                </button>
              </div>
            </form>
          </section>
        ) : null}

        <div className="dashboard-grid">
          <section className="reports-list-section card">
            <div className="card-header">
              <h3>Historial de tus Reportes</h3>
              <p>Seguimiento de incidencias con fotos y ubicación del mapa.</p>
            </div>

            {/* Filtros de búsqueda para historial */}
            {reports.length > 0 && (
              <div className="filter-bar" style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', padding: '16px', marginBottom: '16px', borderBottom: '1px solid var(--border)' }}>
                <div className="filter-group" style={{ flex: 2, minWidth: '200px', margin: 0 }}>
                  <label htmlFor="user-filter-search">Buscar Reporte:</label>
                  <input
                    id="user-filter-search"
                    type="text"
                    placeholder="Buscar por código, título, ubicación..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ width: '100%', padding: '8px', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)' }}
                  />
                </div>
                <div className="filter-group" style={{ flex: 1, minWidth: '150px', margin: 0 }}>
                  <label htmlFor="user-filter-status">Estado:</label>
                  <select
                    id="user-filter-status"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    style={{ width: '100%', padding: '8px', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)' }}
                  >
                    <option value="all">Todos los Estados</option>
                    {STATUSES.map((s) => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                </div>
                <div className="filter-group" style={{ flex: 1, minWidth: '150px', margin: 0 }}>
                  <label htmlFor="user-filter-cat">Categoría:</label>
                  <select
                    id="user-filter-cat"
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    style={{ width: '100%', padding: '8px', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)' }}
                  >
                    <option value="all">Todas las Categorías</option>
                    {CATEGORIES.map((c) => (
                      <option key={c.id} value={c.id}>{c.icon} {c.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {reports.length === 0 ? (
              <div className="empty-state">
                <span className="empty-icon">📁</span>
                <p>Aún no has registrado ningún reporte comunitario.</p>
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={() => setShowForm(true)}
                >
                  Crear mi primer reporte
                </button>
              </div>
            ) : filteredReports.length === 0 ? (
              <div className="empty-state">
                <span className="empty-icon">🔍</span>
                <p>No se encontraron reportes con los criterios de búsqueda seleccionados.</p>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => {
                    setSearchTerm('');
                    setStatusFilter('all');
                    setCategoryFilter('all');
                  }}
                >
                  Limpiar Filtros
                </button>
              </div>
            ) : (
              <div className="reports-table-wrapper">
                <table className="reports-table">
                  <thead>
                    <tr>
                      <th>Código</th>
                      <th>Incidencia</th>
                      <th>Categoría</th>
                      <th>Fecha</th>
                      <th>Evidencia</th>
                      <th>Estado</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredReports.map((rep) => (
                      <tr
                        key={rep.id}
                        className={selectedReport?.id === rep.id ? 'row-selected' : ''}
                      >
                        <td data-label="Código"><span className="code-tag">{rep.id}</span></td>
                        <td data-label="Incidencia">
                          <div className="table-report-info">
                            <strong>{rep.title}</strong>
                            <span className="text-muted truncate-text">{rep.location}</span>
                          </div>
                        </td>
                        <td data-label="Categoría">{getCategoryIcon(rep.category)}</td>
                        <td data-label="Fecha">{new Date(rep.createdAt).toLocaleDateString()}</td>
                        <td data-label="Evidencia">
                          {rep.images && rep.images.length > 0 ? (
                            <span style={{ fontSize: '13px', color: 'var(--primary)', fontWeight: '600' }}>
                              📸 {rep.images.length} foto(s)
                            </span>
                          ) : (
                            <span className="text-muted">Sin fotos</span>
                          )}
                        </td>
                        <td data-label="Estado">{getStatusBadge(rep.status)}</td>
                        <td data-label="Acciones">
                          <button
                            type="button"
                            className="btn btn-secondary btn-xs"
                            onClick={() => {
                              setSelectedReport(rep);
                              setShowForm(false);
                            }}
                          >
                            🔎 Detalle
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>

        {/* Detail Drawer Overlay */}
        {selectedReport && (
          <div className="drawer-overlay" onClick={() => setSelectedReport(null)}>
            <section className="report-detail-section card drawer-panel animate-fade-in" onClick={(e) => e.stopPropagation()}>
              <div className="card-header detail-header">
                <div>
                  <span className="code-tag">{selectedReport.id}</span>
                  <h3>{selectedReport.title}</h3>
                </div>
                <button
                  type="button"
                  className="close-btn"
                  onClick={() => setSelectedReport(null)}
                >
                  ✖
                </button>
              </div>

              <div className="detail-body">
                <div className="detail-meta">
                  <div className="meta-item">
                    <strong>Categoría:</strong>
                    <span>{getCategoryIcon(selectedReport.category)}</span>
                  </div>
                  <div className="meta-item">
                    <strong>Urgencia:</strong>
                    <span>{getPriorityBadge(selectedReport.priority)}</span>
                  </div>
                  <div className="meta-item">
                    <strong>Estado actual:</strong>
                    <span>{getStatusBadge(selectedReport.status)}</span>
                  </div>
                </div>

                {/* Evidence Photo Slideshow */}
                {selectedReport.images && selectedReport.images.length > 0 && (
                  <div className="detail-section">
                    <h4>Evidencias Fotográficas Adjuntas</h4>
                    <div className="detail-images-gallery">
                      {selectedReport.images.map((img, idx) => (
                        <div key={idx} className="gallery-img-container" style={{ cursor: 'zoom-in' }} onClick={() => setZoomedImage(img)}>
                          <img src={img} alt={`Evidencia ${idx}`} className="gallery-img" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Report Coordinates Map Preview */}
                {selectedReport.coordinates && (
                  <div className="detail-section">
                    <h4>Mapa de Ubicación Registrada</h4>
                    <MapPreview coordinates={selectedReport.coordinates} />
                  </div>
                )}

                <div className="detail-section">
                  <h4>Descripción del Ciudadano</h4>
                  <p className="description-box">{selectedReport.description}</p>
                </div>

                <div className="detail-section">
                  <h4>Ubicación Reportada</h4>
                  <p className="location-box">📍 {selectedReport.location}</p>
                </div>

                {selectedReport.notes && (
                  <div className="detail-section municipal-notes">
                    <h4>Notas del Personal de Campo</h4>
                    <p className="notes-box">💬 "{selectedReport.notes}"</p>
                  </div>
                )}

                {selectedReport.status === 'closed' && (
                  <div className="detail-section closure-evidence card" style={{ padding: '16px', backgroundColor: 'rgba(59, 130, 246, 0.05)', border: '1px solid rgba(59, 130, 246, 0.2)', marginBottom: '20px', textAlign: 'left' }}>
                    <h4 style={{ color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '8px', margin: '0 0 10px 0' }}>
                      🏛️ Evidencia de Cierre Municipal
                    </h4>
                    
                    {selectedReport.closureComment && (
                      <p style={{ fontSize: '13px', margin: '0 0 12px 0', lineHeight: '1.4' }}>
                        <strong>Comentario de la Autoridad:</strong> "{selectedReport.closureComment}"
                      </p>
                    )}
                    
                    {selectedReport.closureImage ? (
                      <div>
                        <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                          📸 Foto de resolución (Haz clic para ampliar):
                        </span>
                        <div className="closure-img-container" style={{ width: '120px', height: '90px', borderRadius: 'var(--radius-sm)', overflow: 'hidden', border: '1px solid var(--border)', cursor: 'zoom-in', transition: 'transform 0.2s' }} onClick={() => setZoomedImage(selectedReport.closureImage)}>
                          <img src={selectedReport.closureImage} alt="Evidencia de Cierre" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                      </div>
                    ) : (
                      <p style={{ fontSize: '12px', color: 'var(--danger)', fontStyle: 'italic', margin: 0 }}>
                        ⚠️ La autoridad municipal no adjuntó una fotografía de evidencia para el cierre de este caso.
                      </p>
                    )}
                  </div>
                )}

                <div className="detail-section">
                  <h4>Línea de Tiempo del Reporte</h4>
                  <div className="timeline">
                    {selectedReport.history.map((h, i) => (
                      <div key={i} className="timeline-item">
                        <div className="timeline-badge"></div>
                        <div className="timeline-content">
                          <span className="timeline-date">
                            {new Date(h.date).toLocaleString()}
                          </span>
                          <p style={{ textAlign: 'left' }}>
                            <strong>{getStatusBadge(h.status)}</strong>: {h.note}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          </div>
        )}
      </main>

      {/* Profile/Config Modal */}
      {showProfileModal && (
        <div className="modal-overlay" style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2000,
          animation: 'fade-in 0.2s ease'
        }}>
          <div className="modal-card card" style={{
            width: '450px',
            padding: '24px',
            backgroundColor: 'var(--bg-card, #ffffff)',
            borderRadius: 'var(--radius-md)',
            position: 'relative',
            boxShadow: '0 20px 40px rgba(0,0,0,0.25)',
            textAlign: 'left'
          }}>
            <button
              type="button"
              onClick={() => setShowProfileModal(false)}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: 'none',
                border: 'none',
                fontSize: '18px',
                cursor: 'pointer',
                color: 'var(--text-muted)'
              }}
            >
              ✖
            </button>
            <h3 style={{ marginBottom: '8px' }}>👤 Configuración del Perfil</h3>
            <p className="text-muted" style={{ marginBottom: '20px', fontSize: '13px' }}>Administra la configuración de tu cuenta y notificaciones.</p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="form-group">
                <label>Nombre Completo</label>
                <input type="text" value={user.name} disabled style={{ backgroundColor: 'var(--bg-main)', cursor: 'not-allowed' }} />
              </div>
              <div className="form-group">
                <label>Correo Electrónico</label>
                <input type="text" value={user.email} disabled style={{ backgroundColor: 'var(--bg-main)', cursor: 'not-allowed' }} />
              </div>
              
              <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '10px' }}>
                <input
                  type="checkbox"
                  id="notif-toggle"
                  checked={notificationsEnabled}
                  onChange={handleToggleNotifications}
                  style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                />
                <label htmlFor="notif-toggle" style={{ margin: 0, cursor: 'pointer', fontWeight: '500' }}>
                  Recibir notificaciones de cambios de estado
                </label>
              </div>
              <p className="form-helper" style={{ margin: '-10px 0 10px 32px' }}>
                Si se desactiva, no se registrarán alertas en el icono de campana cuando las autoridades actualicen tus reportes.
              </p>
            </div>
            
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => setShowProfileModal(false)}
              style={{ marginTop: '20px', width: '100%' }}
            >
              Cerrar y Aplicar
            </button>
          </div>
        </div>
      )}

      {/* Zoom Modal Overlay */}
      {zoomedImage && (
        <div className="modal-overlay" onClick={() => setZoomedImage(null)} style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.85)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 3000,
          cursor: 'zoom-out',
          animation: 'fade-in 0.2s ease'
        }}>
          <div className="zoom-image-container" style={{ position: 'relative', maxWidth: '90%', maxHeight: '90%' }}>
            <img src={zoomedImage} alt="Evidencia Ampliada" style={{
              width: '100%',
              height: 'auto',
              maxHeight: '80vh',
              objectFit: 'contain',
              borderRadius: 'var(--radius-sm)',
              boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
            }} />
            <button
              type="button"
              onClick={() => setZoomedImage(null)}
              style={{
                position: 'absolute',
                top: '-40px',
                right: '0',
                background: 'none',
                border: 'none',
                color: 'white',
                fontSize: '24px',
                cursor: 'pointer'
              }}
            >
              Cerrar ✖
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
