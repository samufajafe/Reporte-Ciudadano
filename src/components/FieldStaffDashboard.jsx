import { useState, useEffect } from 'react';
import { getReports, updateReportStatus, CATEGORIES, PRIORITIES, STATUSES } from '../mockData';

export default function FieldStaffDashboard({ user, onLogout }) {
  const [reports, setReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  
  // Status update states
  const [newStatus, setNewStatus] = useState('in_progress');
  const [note, setNote] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');
  const [actionError, setActionError] = useState('');

  useEffect(() => {
    loadReports();
  }, []);

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
                              setNewStatus(rep.status === 'pending' || rep.status === 'assigned' ? 'in_progress' : rep.status);
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
