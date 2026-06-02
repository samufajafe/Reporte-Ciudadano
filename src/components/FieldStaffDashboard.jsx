import { useState, useEffect } from 'react';
import { getReports, updateReportStatus, CATEGORIES, PRIORITIES, STATUSES, getNotifications, markNotificationRead, markAllNotificationsRead, resolveReportByFieldStaff, reportImpossibilityByFieldStaff } from '../mockData';

export default function FieldStaffDashboard({ user, onLogout }) {
  const [reports, setReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  
  // Status update states
  const [newStatus, setNewStatus] = useState('in_progress');
  const [note, setNote] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');
  const [actionError, setActionError] = useState('');
  
  // Resolution evidence states
  const [resolutionImages, setResolutionImages] = useState([]);
  
  // Impossibility states
  const [showImpossibilityForm, setShowImpossibilityForm] = useState(false);
  const [impossibilityReason, setImpossibilityReason] = useState('');

  // Notification states
  const [notifications, setNotifications] = useState([]);
  const [zoomedImage, setZoomedImage] = useState(null);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);

  useEffect(() => {
    loadReports();
    loadNotifications();

    const interval = setInterval(() => {
      loadReports();
      loadNotifications();
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
    const all = getReports();
    const found = all.find(r => r.id === notif.reportId);
    if (found && found.assignedTo === user.email) {
      setSelectedReport(found);
    }
  };

  const handleMarkAllRead = () => {
    markAllNotificationsRead(user.email);
    loadNotifications();
  };

  const loadReports = () => {
    const all = getReports();
    // Filter strictly to display only reports assigned to this specific field staff email
    const assigned = all.filter((r) => r.assignedTo === user.email);
    setReports(assigned);
  };

  const handleResolutionImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setActionError('');
    if (resolutionImages.length + files.length > 5) {
      setActionError('No puede adjuntar más de 5 fotografías de resolución.');
      return;
    }

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setResolutionImages((prev) => {
          if (prev.length >= 5) return prev;
          return [...prev, reader.result];
        });
      };
      reader.readAsDataURL(file);
    });
  };

  const removeResolutionImage = (idx) => {
    setResolutionImages((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleUpdateStatus = (e) => {
    e.preventDefault();
    if (!selectedReport) return;

    setActionSuccess('');
    setActionError('');

    if (newStatus === 'resolved') {
      if (resolutionImages.length === 0) {
        setActionError('Debe adjuntar al menos una fotografía de evidencia de la resolución.');
        return;
      }
      try {
        const updated = resolveReportByFieldStaff(selectedReport.id, note, resolutionImages);
        setActionSuccess('¡El reporte ha sido marcado como Resuelto y enviado a revisión!');
        setNote('');
        setResolutionImages([]);
        setSelectedReport(updated);
        loadReports();
        setTimeout(() => setActionSuccess(''), 3000);
      } catch (err) {
        setActionError(err.message || 'Error al resolver el reporte.');
      }
    } else {
      try {
        const updated = updateReportStatus(selectedReport.id, newStatus, note);
        setActionSuccess('¡El estado de la incidencia ha sido actualizado exitosamente!');
        setNote('');
        setSelectedReport(updated);
        loadReports();
        setTimeout(() => setActionSuccess(''), 3000);
      } catch (err) {
        setActionError(err.message || 'Ocurrió un error al actualizar el estado de la incidencia.');
      }
    }
  };

  const handleImpossibilitySubmit = (e) => {
    e.preventDefault();
    if (!selectedReport || !impossibilityReason.trim()) return;

    setActionSuccess('');
    setActionError('');

    try {
      const updated = reportImpossibilityByFieldStaff(selectedReport.id, impossibilityReason);
      setActionSuccess('Se ha notificado la imposibilidad de resolución a la autoridad.');
      setImpossibilityReason('');
      setShowImpossibilityForm(false);
      setSelectedReport(updated);
      loadReports();
      setTimeout(() => setActionSuccess(''), 3000);
    } catch (err) {
      setActionError(err.message || 'Error al reportar imposibilidad.');
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
    <div className="dashboard-container field-staff-theme animate-fade-in">
      <header className="dashboard-header">
        <div className="header-user-info">
          <span className="avatar">👷</span>
          <div>
            <h3>{user.name}</h3>
            <span className="user-role-badge staff">Personal de Campo</span>
          </div>
        </div>
        <div className="header-actions" style={{ display: 'flex', alignItems: 'center', gap: '10px', position: 'relative' }}>
          {/* Notification Bell */}
          <div style={{ position: 'relative' }}>
            <button
              type="button"
              onClick={() => setShowNotifDropdown(!showNotifDropdown)}
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
                <span style={{
                  position: 'absolute',
                  top: '-4px',
                  right: '-4px',
                  background: '#ef4444',
                  color: 'white',
                  borderRadius: '50%',
                  width: '20px',
                  height: '20px',
                  fontSize: '11px',
                  fontWeight: 'bold',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {notifications.filter(n => !n.read).length}
                </span>
              )}
            </button>

            {showNotifDropdown && (
              <div className="card" style={{
                position: 'absolute',
                top: '50px',
                right: '0',
                width: '320px',
                maxHeight: '400px',
                overflowY: 'auto',
                zIndex: 1000,
                boxShadow: '0 10px 25px rgba(0,0,0,0.15)'
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px 16px',
                  borderBottom: '1px solid var(--border)'
                }}>
                  <strong style={{ fontSize: '14px' }}>Mis Notificaciones</strong>
                  {notifications.filter(n => !n.read).length > 0 && (
                    <button
                      type="button"
                      onClick={handleMarkAllRead}
                      style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: '12px', cursor: 'pointer', fontWeight: '600' }}
                    >
                      Marcar todo leídos
                    </button>
                  )}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {notifications.length === 0 ? (
                    <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>
                      No tienes notificaciones
                    </div>
                  ) : (
                    notifications.map(n => {
                      const details = n.reportDetails;
                      return (
                        <div
                          key={n.id}
                          onClick={() => handleNotificationClick(n)}
                          style={{
                            padding: '12px 16px',
                            borderBottom: '1px solid var(--border)',
                            cursor: 'pointer',
                            backgroundColor: !n.read ? 'rgba(59, 130, 246, 0.05)' : 'transparent',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '8px',
                            textAlign: 'left',
                            transition: 'background-color 0.2s'
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--text-muted)' }}>
                            <strong style={{ color: !n.read ? 'var(--primary)' : 'var(--text-muted)' }}>
                              {!n.read ? '🔵 NUEVA ASIGNACIÓN' : '✓ Leído'}
                            </strong>
                            <span>{new Date(n.date).toLocaleDateString('es-CR')}</span>
                          </div>
                          
                          <div style={{ fontSize: '12px', fontWeight: !n.read ? '600' : '400', color: 'var(--text-main)' }}>
                            {n.reportTitle}
                          </div>
                          
                          {details && (
                            <div style={{
                              fontSize: '11px',
                              backgroundColor: 'var(--bg-main)',
                              padding: '8px',
                              borderRadius: '4px',
                              border: '1px solid var(--border)',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '4px',
                              color: 'var(--text-muted)'
                            }}>
                              <div><strong>Categoría:</strong> {getCategoryIcon(details.category)}</div>
                              {details.description && (
                                <div style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                  <strong>Descripción:</strong> {details.description}
                                </div>
                              )}
                              <div><strong>Ubicación:</strong> 📍 {details.location}</div>
                              {details.estimatedDate && (
                                <div><strong>Fecha Est. Atención:</strong> 📅 {new Date(details.estimatedDate + 'T12:00:00').toLocaleDateString('es-CR')}</div>
                              )}
                              {details.images && details.images.length > 0 && (
                                <div style={{ display: 'flex', gap: '4px', marginTop: '4px', flexWrap: 'wrap' }}>
                                  {details.images.slice(0, 3).map((img, idx) => (
                                    <img 
                                      key={idx} 
                                      src={img} 
                                      alt="preview" 
                                      style={{ width: '32px', height: '24px', objectFit: 'cover', borderRadius: '2px', border: '1px solid var(--border)' }} 
                                    />
                                  ))}
                                  {details.images.length > 3 && (
                                    <span style={{ fontSize: '9px', display: 'flex', alignItems: 'center', color: 'var(--primary)' }}>
                                      +{details.images.length - 3} más
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>

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
        <section className="welcome-banner staff-banner">
          <div className="welcome-text">
            <h2>Panel de Trabajo y Asignaciones</h2>
            <p>
              Revisa y atiende las incidencias del cantón asignadas a tu cuenta. Mantén actualizado el estado para informar a la ciudadanía.
            </p>
          </div>
        </section>

        <div className="dashboard-grid">
          {/* Assigned Reports List */}
          <section className="reports-list-section card">
            <div className="card-header">
              <h3>Mis Reportes Asignados</h3>
              <p>Lista de casos pendientes de resolución por tu parte.</p>
            </div>

            {reports.length === 0 ? (
              <div className="empty-state">
                <span className="empty-icon">👷🎉</span>
                <p>Excelente. No tienes incidencias asignadas pendientes por el momento.</p>
              </div>
            ) : (
              <div className="reports-table-wrapper">
                <table className="reports-table">
                  <thead>
                    <tr>
                      <th>Código</th>
                      <th>Incidencia / Ubicación</th>
                      <th>Categoría</th>
                      <th>Urgencia</th>
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
                        <td data-label="Código"><span className="code-tag">{rep.id}</span></td>
                        <td data-label="Incidencia">
                          <div className="table-report-info">
                            <strong>{rep.title}</strong>
                            <span className="text-muted truncate-text">📍 {rep.location}</span>
                          </div>
                        </td>
                        <td data-label="Categoría">{getCategoryIcon(rep.category)}</td>
                        <td data-label="Urgencia">{getPriorityBadge(rep.priority)}</td>
                        <td data-label="Estado">{getStatusBadge(rep.status)}</td>
                        <td data-label="Acciones">
                          <button
                            type="button"
                            className="btn btn-secondary btn-xs"
                            onClick={() => {
                              setSelectedReport(rep);
                              setNewStatus(rep.status === 'received' || rep.status === 'assigned' ? 'in_progress' : rep.status);
                            }}
                          >
                            🔧 Atender
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

        {/* Action and Resolution Details Drawer Overlay */}
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
                {actionSuccess && <div className="alert alert-success">{actionSuccess}</div>}
                {actionError && <div className="alert alert-danger">{actionError}</div>}

                <div className="detail-meta">
                  <div className="meta-item">
                    <strong>Ubicación:</strong>
                    <span>📍 {selectedReport.location}</span>
                  </div>
                  <div className="meta-item">
                    <strong>Prioridad:</strong>
                    <span>{getPriorityBadge(selectedReport.priority)}</span>
                  </div>
                  <div className="meta-item">
                    <strong>Estado actual:</strong>
                    <span>{getStatusBadge(selectedReport.status)}</span>
                  </div>
                  {selectedReport.estimatedDate && (
                    <div className="meta-item">
                      <strong>📅 Fecha Estimada de Atención:</strong>
                      <span style={{ color: 'var(--primary)', fontWeight: '600' }}>
                        {new Date(selectedReport.estimatedDate + 'T12:00:00').toLocaleDateString('es-CR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                      </span>
                    </div>
                  )}
                </div>

                {/* Evidence photos in Field Staff view */}
                {selectedReport.images && selectedReport.images.length > 0 && (
                  <div className="detail-section">
                    <h4>Evidencias Fotográficas Cargadas</h4>
                    <div className="detail-images-gallery">
                      {selectedReport.images.map((img, idx) => (
                        <div key={idx} className="gallery-img-container" style={{ cursor: 'zoom-in' }} onClick={() => setZoomedImage(img)}>
                          <img src={img} alt={`Evidencia ${idx}`} className="gallery-img" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Map preview in Field Staff view */}
                {selectedReport.coordinates && (
                  <div className="detail-section">
                    <h4>Geolocalización en Mapa</h4>
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
                  <h4>Reporte del Ciudadano</h4>
                  <p className="description-box">{selectedReport.description}</p>
                </div>

                {/* Progress Update Form */}
                {['resolved', 'closed', 'rejected'].includes(selectedReport.status) ? (
                  <div className="alert alert-info" style={{ marginTop: '20px', textAlign: 'left' }}>
                    <strong>ℹ️ Estado: {STATUSES.find(s => s.value === selectedReport.status)?.label || selectedReport.status}</strong>
                    <p style={{ margin: '5px 0 0 0', fontSize: '13px', lineHeight: '1.4' }}>
                      {selectedReport.status === 'resolved' 
                        ? 'Este reporte ha sido marcado como Resuelto y está en espera de la revisión y cierre formal por parte de la autoridad municipal.'
                        : 'Este reporte está cerrado o rechazado y no admite modificaciones.'}
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="detail-section update-status-box">
                      <h4>Actualizar Estado de la Incidencia</h4>
                      <form onSubmit={handleUpdateStatus} className="status-update-form">
                        <div className="form-group">
                          <label htmlFor="new-status-select">Nuevo Estado de Trabajo:</label>
                          <select
                            id="new-status-select"
                            value={newStatus}
                            onChange={(e) => setNewStatus(e.target.value)}
                          >
                            <option value="assigned">Asignado (Sin Empezar)</option>
                            <option value="in_progress">👷 En Progreso / Ejecución</option>
                            <option value="resolved">✅ Resuelto / Solucionado</option>
                          </select>
                        </div>

                        {newStatus === 'resolved' && (
                          <div className="form-group" style={{ borderTop: '1px solid var(--border)', paddingTop: '15px', marginTop: '15px' }}>
                            <label>Fotos de Evidencia de Resolución <span style={{ color: 'var(--danger)' }}>*</span></label>
                            <p className="form-helper" style={{ margin: '0 0 10px 0' }}>Cargue entre 1 y 5 fotografías que demuestren el trabajo finalizado.</p>
                            <div className="image-upload-zone" style={{ padding: '15px', border: '1px dashed var(--border)', borderRadius: '4px', textAlign: 'center', cursor: 'pointer', background: 'var(--bg-main)' }}>
                              <input
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={handleResolutionImageChange}
                                style={{ display: 'none' }}
                                id="resolution-photos"
                              />
                              <label htmlFor="resolution-photos" style={{ cursor: 'pointer', display: 'block', fontSize: '13px', color: 'var(--text-muted)' }}>
                                📷 Seleccionar fotos de resolución
                              </label>
                            </div>
                            {resolutionImages.length > 0 && (
                              <div style={{ display: 'flex', gap: '8px', marginTop: '10px', flexWrap: 'wrap' }}>
                                {resolutionImages.map((img, idx) => (
                                  <div key={idx} style={{ position: 'relative', width: '60px', height: '45px', borderRadius: '4px', overflow: 'hidden', border: '1px solid var(--border)' }}>
                                    <img src={img} alt="resolucion" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    <button
                                      type="button"
                                      onClick={() => removeResolutionImage(idx)}
                                      style={{ position: 'absolute', top: 0, right: 0, background: 'rgba(239, 68, 68, 0.8)', color: 'white', border: 'none', width: '16px', height: '16px', fontSize: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                                    >
                                      ✖
                                    </button>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}

                        <div className="form-group">
                          <label htmlFor="status-note">Notas de Trabajo / Bitácora:</label>
                          <textarea
                            id="status-note"
                            rows="3"
                            placeholder="Describe las acciones realizadas para solucionar el problema (materiales, personal, avance)..."
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            required
                          ></textarea>
                        </div>

                        <button type="submit" className="btn btn-primary btn-block">
                          Guardar Avance
                        </button>
                      </form>
                    </div>

                    {!showImpossibilityForm ? (
                      <button
                        type="button"
                        className="btn btn-secondary btn-block"
                        onClick={() => {
                          setShowImpossibilityForm(true);
                          setImpossibilityReason('');
                        }}
                        style={{ marginTop: '15px', borderColor: 'var(--danger)', color: 'var(--danger)', background: 'transparent' }}
                      >
                        ⚠️ Declarar Imposibilidad de Resolución
                      </button>
                    ) : (
                      <div className="detail-section update-status-box animate-fade-in" style={{ border: '1px solid rgba(239, 68, 68, 0.3)', backgroundColor: 'rgba(239, 68, 68, 0.03)', marginTop: '15px' }}>
                        <h4 style={{ color: 'var(--danger)' }}>Declarar Imposibilidad de Resolución</h4>
                        <form onSubmit={handleImpossibilitySubmit} className="status-update-form">
                          <div className="form-group">
                            <label htmlFor="impossibility-reason">Motivo Detallado de la Imposibilidad:</label>
                            <textarea
                              id="impossibility-reason"
                              rows="3"
                              placeholder="Explique detalladamente por qué no se puede resolver esta incidencia (ej. requiere maquinaria pesada, es propiedad privada, etc.)..."
                              value={impossibilityReason}
                              onChange={(e) => setImpossibilityReason(e.target.value)}
                              required
                            ></textarea>
                          </div>
                          <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                            <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setShowImpossibilityForm(false)}>
                              Cancelar
                            </button>
                            <button type="submit" className="btn btn-primary" style={{ flex: 1, backgroundColor: 'var(--danger)', borderColor: 'var(--danger)' }}>
                              Notificar a Autoridad
                            </button>
                          </div>
                        </form>
                      </div>
                    )}
                  </>
                )}

                <div className="detail-section">
                  <h4>Línea de Tiempo y Avances</h4>
                  <div className="timeline">
                    {selectedReport.history.map((h, i) => (
                      <div key={i} className="timeline-item">
                        <div className="timeline-badge"></div>
                        <div className="timeline-content">
                          <span className="timeline-date">{new Date(h.date).toLocaleString()}</span>
                          <p><strong>{getStatusBadge(h.status)}</strong>: {h.note}</p>
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
