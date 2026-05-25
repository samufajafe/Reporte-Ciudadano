import { useState, useEffect } from 'react';
import { getReports, getUsers, assignReport, CATEGORIES, PRIORITIES, STATUSES } from '../mockData';

export default function AuthorityDashboard({ user, onLogout }) {
  const [reports, setReports] = useState([]);
  const [fieldStaff, setFieldStaff] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  
  // Filters
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [assignmentStaff, setAssignmentStaff] = useState('');
  
  // Notification states
  const [actionSuccess, setActionSuccess] = useState('');
  const [actionError, setActionError] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setReports(getReports());
    const users = getUsers();
    const staff = users.filter((u) => u.role === 'personal_campo');
    setFieldStaff(staff);
    if (staff.length > 0) {
      setAssignmentStaff(staff[0].email);
    }
  };

  const handleAssign = (e) => {
    e.preventDefault();
    if (!selectedReport || !assignmentStaff) return;
    
    setActionSuccess('');
    setActionError('');

    try {
      const updated = assignReport(selectedReport.id, assignmentStaff);
      setActionSuccess(`Reporte asignado exitosamente a ${assignmentStaff}`);
      
      // Update local state lists
      setSelectedReport(updated);
      loadData();
      
      setTimeout(() => {
        setActionSuccess('');
      }, 3000);
    } catch (err) {
      setActionError('Error al asignar el reporte. Inténtelo de nuevo.');
    }
  };

  // Metrics calculations
  const totalCount = reports.length;
  const pendingCount = reports.filter((r) => r.status === 'pending').length;
  const assignedCount = reports.filter((r) => r.status === 'assigned' || r.status === 'in_progress').length;
  const resolvedCount = reports.filter((r) => r.status === 'resolved').length;

  // Filter logic
  const filteredReports = reports.filter((r) => {
    const matchStatus = statusFilter === 'all' || r.status === statusFilter;
    const matchCategory = categoryFilter === 'all' || r.category === categoryFilter;
    return matchStatus && matchCategory;
  });

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

  const getStaffName = (email) => {
    const staff = fieldStaff.find((s) => s.email === email);
    return staff ? staff.name : email;
  };

  return (
    <div className="dashboard-container authority-theme animate-fade-in">
      <header className="dashboard-header">
        <div className="header-user-info">
          <span className="avatar">🏛️</span>
          <div>
            <h3>{user.name}</h3>
            <span className="user-role-badge authority">Autoridad Municipal</span>
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
        {/* Metrics Row */}
        <section className="metrics-row">
          <div className="metric-card card">
            <span className="metric-icon blue">📁</span>
            <div className="metric-details">
              <h4>Total Reportes</h4>
              <span className="metric-val">{totalCount}</span>
            </div>
          </div>
          <div className="metric-card card">
            <span className="metric-icon yellow">⏳</span>
            <div className="metric-details">
              <h4>Pendientes</h4>
              <span className="metric-val">{pendingCount}</span>
            </div>
          </div>
          <div className="metric-card card">
            <span className="metric-icon purple">🔧</span>
            <div className="metric-details">
              <h4>En Atención</h4>
              <span className="metric-val">{assignedCount}</span>
            </div>
          </div>
          <div className="metric-card card">
            <span className="metric-icon green">✅</span>
            <div className="metric-details">
              <h4>Resueltos</h4>
              <span className="metric-val">{resolvedCount}</span>
            </div>
          </div>
        </section>

        {/* Filters and View Controls */}
        <section className="filter-bar card">
          <div className="filter-group">
            <label htmlFor="filter-status">Filtrar por Estado:</label>
            <select
              id="filter-status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">Todos los Estados</option>
              {STATUSES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="filter-cat">Filtrar por Categoría:</label>
            <select
              id="filter-cat"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="all">Todas las Categorías</option>
              {CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.icon} {c.label}
                </option>
              ))}
            </select>
          </div>
        </section>

        <div className="dashboard-grid">
          {/* Main Reports Table */}
          <section className="reports-list-section card">
            <div className="card-header">
              <h3>Bandeja de Entrada General</h3>
              <p>Visualización y asignación de todos los reportes recibidos.</p>
            </div>

            {filteredReports.length === 0 ? (
              <div className="empty-state">
                <span className="empty-icon">🔍</span>
                <p>No se encontraron reportes con los filtros seleccionados.</p>
              </div>
            ) : (
              <div className="reports-table-wrapper">
                <table className="reports-table">
                  <thead>
                    <tr>
                      <th>Código</th>
                      <th>Incidencia</th>
                      <th>Categoría</th>
                      <th>Urgencia</th>
                      <th>Estado</th>
                      <th>Asignado a</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredReports.map((rep) => (
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
                        <td>{getPriorityBadge(rep.priority)}</td>
                        <td>{getStatusBadge(rep.status)}</td>
                        <td>
                          {rep.assignedTo ? (
                            <span className="assigned-user-tag">👷 {getStaffName(rep.assignedTo)}</span>
                          ) : (
                            <span className="unassigned-tag">Sin Asignar</span>
                          )}
                        </td>
                        <td>
                          <button
                            type="button"
                            className="btn btn-secondary btn-xs"
                            onClick={() => setSelectedReport(rep)}
                          >
                            🔎 Gestionar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          {/* Management Panel */}
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
                    <strong>Reportado por:</strong>
                    <span>{selectedReport.citizenEmail}</span>
                  </div>
                  <div className="meta-item">
                    <strong>Fecha:</strong>
                    <span>{new Date(selectedReport.createdAt).toLocaleString()}</span>
                  </div>
                  <div className="meta-item">
                    <strong>Prioridad:</strong>
                    <span>{getPriorityBadge(selectedReport.priority)}</span>
                  </div>
                </div>

                {/* Evidence photos in Authority view */}
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

                {/* Map preview in Authority view */}
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
                  <h4>Descripción Ciudadana</h4>
                  <p className="description-box">{selectedReport.description}</p>
                </div>

                <div className="detail-section">
                  <h4>Ubicación</h4>
                  <p className="location-box">📍 {selectedReport.location}</p>
                </div>

                {/* Assignment Box */}
                <div className="detail-section assignment-box">
                  <h4>Asignar Atención de Campo</h4>
                  <form onSubmit={handleAssign} className="assign-form">
                    <div className="form-group">
                      <label htmlFor="staff-select">Seleccionar Operario:</label>
                      <select
                        id="staff-select"
                        value={assignmentStaff}
                        onChange={(e) => setAssignmentStaff(e.target.value)}
                      >
                        {fieldStaff.map((staff) => (
                          <option key={staff.email} value={staff.email}>
                            👷 {staff.name} ({staff.department})
                          </option>
                        ))}
                      </select>
                    </div>
                    <button type="submit" className="btn btn-primary btn-block">
                      Asignar y Notificar
                    </button>
                  </form>
                </div>

                {selectedReport.notes && (
                  <div className="detail-section municipal-notes">
                    <h4>Notas de Trabajo del Operario</h4>
                    <p className="notes-box">💬 "{selectedReport.notes}"</p>
                  </div>
                )}

                <div className="detail-section">
                  <h4>Historial de Estado</h4>
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
