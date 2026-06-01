import { useState, useEffect } from 'react';
import { getReports, updateReportStatus, CATEGORIES, PRIORITIES, STATUSES, getNotifications, markNotificationRead, markAllNotificationsRead } from '../mockData';

export default function FieldStaffDashboard({ user, onLogout }) {
  const [reports, setReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  
  // Status update states
  const [newStatus, setNewStatus] = useState('in_progress');
  const [note, setNote] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');
  const [actionError, setActionError] = useState('');

  // Notification states
  const [notifications, setNotifications] = useState([]);
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

  const handleUpdateStatus = (e) => {
    e.preventDefault();
    if (!selectedReport) return;

    setActionSuccess('');
    setActionError('');

    try {
      const updated = updateReportStatus(selectedReport.id, newStatus, note);
      setActionSuccess('¡El estado de la incidencia ha sido actualizado exitosamente!');
      
      // Clear notes input and update local lists
      setNote('');
      setSelectedReport(updated);
      loadReports();

      setTimeout(() => {
        setActionSuccess('');
      }, 3000);
    } catch (err) {
      setActionError('Ocurrió un error al actualizar el estado de la incidencia.');
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
                        <td><span className="code-tag">{rep.id}</span></td>
                        <td>
                          <div className="table-report-info">
                            <strong>{rep.title}</strong>
                            <span className="text-muted truncate-text">📍 {rep.location}</span>
                          </div>
                        </td>
                        <td>{getCategoryIcon(rep.category)}</td>
                        <td>{getPriorityBadge(rep.priority)}</td>
                        <td>{getStatusBadge(rep.status)}</td>
                        <td>
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

          {/* Action and Resolution Details */}
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
                        <div key={idx} className="gallery-img-container">
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
          )}
        </div>
      </main>
    </div>
  );
}
