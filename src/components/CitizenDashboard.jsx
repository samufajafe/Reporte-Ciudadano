import { useState, useEffect, useRef } from 'react';
import { getReports, createReport, CATEGORIES, PRIORITIES, STATUSES } from '../mockData';

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
    ]
  },
  distritos: {
    '102': [
      { id: '10201', nombre: 'Escazú Centro' },
      { id: '10202', nombre: 'San Antonio' },
      { id: '10203', nombre: 'San Rafael' }
    ],
    '101': [
      { id: '10101', nombre: 'Carmen' },
      { id: '10102', nombre: 'Merced' }
    ]
  }
};

export default function CitizenDashboard({ user, onLogout }) {
  const [reports, setReports] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);

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

  const mapRef = useRef(null);

  useEffect(() => {
    loadReports();
  }, []);

  // Fetch Provincias when Form opens
  useEffect(() => {
    if (showForm) {
      fetchProvincias();
    }
  }, [showForm]);

  // Fetch Cantones when Provincia changes
  useEffect(() => {
    if (selectedProvincia) {
      fetchCantones(selectedProvincia);
    } else {
      setCantones([]);
      setDistritos([]);
      setSelectedCanton('');
      setSelectedDistrito('');
    }
  }, [selectedProvincia]);

  // Fetch Distritos when Canton changes
  useEffect(() => {
    if (selectedCanton) {
      fetchDistritos(selectedCanton);
    } else {
      setDistritos([]);
      setSelectedDistrito('');
    }
  }, [selectedCanton]);

  const loadReports = () => {
    const all = getReports();
    const filtered = all.filter((r) => r.citizenEmail === user.email);
    setReports(filtered);
  };

  // --- API Geographic Fetching ---
  const fetchProvincias = async () => {
    setIsLoadingGeo(true);
    try {
      const response = await fetch('https://api-geo-cr.vercel.app/provincias');
      if (!response.ok) throw new Error('API down');
      const json = await response.json();
      
      // Map API fields (idProvincia, descripcion) to unified structure ({ id, nombre })
      const mapped = (json.data || []).map(p => ({
        id: String(p.idProvincia),
        nombre: p.descripcion
      }));

      setProvincias(mapped);
      if (mapped.length > 0) {
        setSelectedProvincia(mapped[0].id);
      }
    } catch (error) {
      console.warn('Using local fallback for Provincias:', error);
      setProvincias(FALLBACK_GEOGRAPHY.provincias);
      setSelectedProvincia(FALLBACK_GEOGRAPHY.provincias[0].id);
    } finally {
      setIsLoadingGeo(false);
    }
  };

  const fetchCantones = async (provinciaId) => {
    setIsLoadingGeo(true);
    try {
      const response = await fetch(`https://api-geo-cr.vercel.app/provincias/${provinciaId}/cantones`);
      if (!response.ok) throw new Error('API down');
      const json = await response.json();
      
      const mapped = (json.data || []).map(c => ({
        id: String(c.idCanton),
        nombre: c.descripcion
      }));

      setCantones(mapped);
      if (mapped.length > 0) {
        setSelectedCanton(mapped[0].id);
      }
    } catch (error) {
      console.warn('Using local fallback for Cantones:', error);
      const fallbackList = FALLBACK_GEOGRAPHY.cantones[provinciaId] || [];
      setCantones(fallbackList);
      if (fallbackList.length > 0) {
        setSelectedCanton(fallbackList[0].id);
      }
    } finally {
      setIsLoadingGeo(false);
    }
  };

  const fetchDistritos = async (cantonId) => {
    setIsLoadingGeo(true);
    try {
      const response = await fetch(`https://api-geo-cr.vercel.app/cantones/${cantonId}/distritos`);
      if (!response.ok) throw new Error('API down');
      const json = await response.json();
      
      const mapped = (json.data || []).map(d => ({
        id: String(d.idDistrito),
        nombre: d.descripcion
      }));

      setDistritos(mapped);
      if (mapped.length > 0) {
        setSelectedDistrito(mapped[0].id);
      }
    } catch (error) {
      console.warn('Using local fallback for Distritos:', error);
      const fallbackList = FALLBACK_GEOGRAPHY.distritos[cantonId] || [];
      setDistritos(fallbackList);
      if (fallbackList.length > 0) {
        setSelectedDistrito(fallbackList[0].id);
      }
    } finally {
      setIsLoadingGeo(false);
    }
  };

  // Image Upload helper (Base64)
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImages((prev) => [...prev, reader.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeUploadedImage = (indexToRemove) => {
    setUploadedImages((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  // Simulated Map Actions
  const handleMapClick = (e) => {
    if (!mapRef.current) return;
    const rect = mapRef.current.getBoundingClientRect();
    const x = Math.round(((e.clientX - rect.left) / rect.width) * 100);
    const y = Math.round(((e.clientY - rect.top) / rect.height) * 100);
    setMapCoordinates({ x, y });
    
    // Auto-fill address using selected CR divisions
    const provName = provincias.find(p => p.id === selectedProvincia)?.nombre || '';
    const cantName = cantones.find(c => c.id === selectedCanton)?.nombre || '';
    const distName = distritos.find(d => d.id === selectedDistrito)?.nombre || '';
    
    const locationPrefix = [provName, cantName, distName].filter(Boolean).join(', ');
    setLocation(`${locationPrefix} - Calle Vecinal (Cerca de Cuadrante ${x}x${y})`);
  };

  const handleUseGPS = () => {
    const randomX = Math.floor(Math.random() * 60) + 20;
    const randomY = Math.floor(Math.random() * 60) + 20;
    setMapCoordinates({ x: randomX, y: randomY });

    const provName = provincias.find(p => p.id === selectedProvincia)?.nombre || '';
    const cantName = cantones.find(c => c.id === selectedCanton)?.nombre || '';
    const distName = distritos.find(d => d.id === selectedDistrito)?.nombre || '';
    const locationPrefix = [provName, cantName, distName].filter(Boolean).join(', ');

    setLocation(`📍 GPS: ${locationPrefix} - Lat: 9.93${randomY}, Lng: -84.08${randomX}`);
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
    if (!description.trim()) {
      setFormError('La Descripción del reporte es obligatoria.');
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

      createReport(newReportData);
      setFormSuccess('¡El reporte ha sido enviado exitosamente a la municipalidad!');
      
      // Reset Form
      setTitle('');
      setDescription('');
      setLocation('');
      setCategory('vias');
      setPriority('medium');
      setUploadedImages([]);
      setMapCoordinates(null);
      
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
        <div className="header-actions">
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
              <h3>Crear Nuevo Reporte (API Geo-CR Integrada)</h3>
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
                    onChange={(e) => setSelectedProvincia(e.target.value)}
                    disabled={isLoadingGeo && provincias.length === 0}
                  >
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
                    onChange={(e) => setSelectedCanton(e.target.value)}
                    disabled={cantones.length === 0}
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
                    disabled={distritos.length === 0}
                  >
                    <option value="">Seleccione Distrito...</option>
                    {distritos.map((d) => (
                      <option key={d.id} value={d.id}>{d.nombre}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="rep-desc">Descripción Detallada <span style={{ color: 'var(--danger)' }}>*</span></label>
                <textarea
                  id="rep-desc"
                  rows="3"
                  placeholder="Explique el problema de manera concisa para ayudar a las autoridades a comprenderlo."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
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

              {/* Coordinates & Mock Map */}
              <div className="form-row">
                <div className="form-group flex-1">
                  <label>Ubicación Geográfica Exacta <span style={{ color: 'var(--danger)' }}>*</span></label>
                  <p className="form-helper" style={{ margin: '0 0 10px 0' }}>Haga clic sobre el plano interactivo para colocar el marcador o use el botón GPS.</p>
                  
                  <div className="map-mock-container" ref={mapRef} onClick={handleMapClick}>
                    <div className="map-grid-bg">
                      <div className="map-street h-street-1"></div>
                      <div className="map-street h-street-2"></div>
                      <div className="map-street v-street-1"></div>
                      <div className="map-street v-street-2"></div>
                      <div className="map-neighborhood block-a">Parque</div>
                      <div className="map-neighborhood block-b">Zona Residencial</div>
                      <div className="map-neighborhood block-c">Municipalidad</div>
                    </div>
                    {mapCoordinates && (
                      <div
                        className="map-marker-pin"
                        style={{ left: `${mapCoordinates.x}%`, top: `${mapCoordinates.y}%` }}
                      >
                        📍
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm btn-gps"
                    onClick={handleUseGPS}
                    style={{ marginTop: '10px', width: '100%' }}
                  >
                    🛰️ Usar GPS del Dispositivo (Simulado)
                  </button>
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
                  <div style={{ marginTop: '20px' }}>
                    <label htmlFor="rep-prio-sug">Urgencia Sugerida</label>
                    <select
                      id="rep-prio-sug"
                      value={priority}
                      onChange={(e) => setPriority(e.target.value)}
                    >
                      {PRIORITIES.map((p) => (
                        <option key={p.value} value={p.value}>
                          {p.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  {mapCoordinates && (
                    <div className="coordinates-display card" style={{ marginTop: '16px', padding: '10px', background: 'var(--bg-main)' }}>
                      <strong>Coordenadas del Pin:</strong>
                      <code style={{ fontSize: '12px', display: 'block', marginTop: '4px' }}>
                        X: {mapCoordinates.x}%, Y: {mapCoordinates.y}% (Guardado)
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
                    {reports.map((rep) => (
                      <tr
                        key={rep.id}
                        className={selectedReport?.id === rep.id ? 'row-selected' : ''}
                      >
                        <td><span className="code-tag">{rep.id}</span></td>
                        <td>
                          <div className="table-report-info">
                            <strong>{rep.title}</strong>
                            <span className="text-muted truncate-text">{rep.location}</span>
                          </div>
                        </td>
                        <td>{getCategoryIcon(rep.category)}</td>
                        <td>{new Date(rep.createdAt).toLocaleDateString()}</td>
                        <td>
                          {rep.images && rep.images.length > 0 ? (
                            <span style={{ fontSize: '13px', color: 'var(--primary)', fontWeight: '600' }}>
                              📸 {rep.images.length} foto(s)
                            </span>
                          ) : (
                            <span className="text-muted">Sin fotos</span>
                          )}
                        </td>
                        <td>{getStatusBadge(rep.status)}</td>
                        <td>
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

          {selectedReport && (
            <section className="report-detail-section card animate-fade-in">
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
                        <div key={idx} className="gallery-img-container">
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
                    <div className="map-mock-container static-preview">
                      <div className="map-grid-bg">
                        <div className="map-street h-street-1"></div>
                        <div className="map-street h-street-2"></div>
                        <div className="map-street v-street-1"></div>
                        <div className="map-street v-street-2"></div>
                        <div className="map-neighborhood block-a">Parque</div>
                        <div className="map-neighborhood block-b">Zona Residencial</div>
                        <div className="map-neighborhood block-c">Municipalidad</div>
                      </div>
                      <div
                        className="map-marker-pin animate-pulse"
                        style={{ left: `${selectedReport.coordinates.x}%`, top: `${selectedReport.coordinates.y}%` }}
                      >
                        📍
                      </div>
                    </div>
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
                          <p>
                            <strong>{getStatusBadge(h.status)}</strong>: {h.note}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          )}
        </div>
      </main>
    </div>
  );
}
