import { useState, useEffect } from 'react';
import { getReports, getUsers, assignReport, closeReport, rejectReport, updateReportStatusByAuthority, CATEGORIES, PRIORITIES, STATUSES, getAuthorityAlerts, markAuthorityAlertRead, markAllAuthorityAlertsRead, disableReportAlerts, checkAndGenerateInactivityAlerts, returnReportToFieldStaff, updateReportPriority } from '../mockData';
import { MapPreview, AuthorityMap } from './MapComponents';

export default function AuthorityDashboard({ user, onLogout }) {
  const [reports, setReports] = useState([]);
  const [fieldStaff, setFieldStaff] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  
  // Filters
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [zoneFilter, setZoneFilter] = useState('all');
  const [assignmentStaff, setAssignmentStaff] = useState('');
  
  // Notification states
  const [actionSuccess, setActionSuccess] = useState('');
  const [actionError, setActionError] = useState('');

  // Closure Form states
  const [closureComment, setClosureComment] = useState('');
  const [closureImage, setClosureImage] = useState(null);

  // Assignment & Reassignment states
  const [estimatedDate, setEstimatedDate] = useState('');
  const [reassignReason, setReassignReason] = useState('');

  // Rejection states
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectForm, setShowRejectForm] = useState(false);

  // Manual Status Change states
  const [authorityStatusComment, setAuthorityStatusComment] = useState('');
  const [authorityNewStatus, setAuthorityNewStatus] = useState('');

  // Predefined Reject reasons
  const REJECT_REASONS = [
    { value: 'fuera_jurisdiccion', label: 'Ubicación fuera de la jurisdicción municipal' },
    { value: 'propiedad_privada', label: 'Incidencia en propiedad privada (no compete a la municipalidad)' },
    { value: 'servicio_no_municipal', label: 'No corresponde a un servicio de competencia municipal' },
    { value: 'falsa_alarma_duplicado', label: 'Reporte duplicado o falsa alarma' },
    { value: 'evidencia_insuficiente', label: 'Información o evidencia fotográfica insuficiente' },
    { value: 'otro', label: 'Otro (Especificar motivo...)' }
  ];

  const [selectedRejectReason, setSelectedRejectReason] = useState('fuera_jurisdiccion');
  const [customRejectReason, setCustomRejectReason] = useState('');
  const [manualClosureImage, setManualClosureImage] = useState(null);

  // Devolution/Return states
  const [showReturnForm, setShowReturnForm] = useState(false);
  const [returnReasonText, setReturnReasonText] = useState('');

  // Navigation tab state
  const [activeTab, setActiveTab] = useState('inbox');

  // Stats filters
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [statsCategoryFilter, setStatsCategoryFilter] = useState('all');
  const [statsZoneFilter, setStatsZoneFilter] = useState('all');

  // Heat map selection
  const [selectedCell, setSelectedCell] = useState(null);

  // Alerts of inactivity states
  const [alerts, setAlerts] = useState([]);
  const [showAlertDropdown, setShowAlertDropdown] = useState(false);
  const [zoomedImage, setZoomedImage] = useState(null);

  const handleReturnSubmit = (e) => {
    e.preventDefault();
    if (!selectedReport || !returnReasonText.trim()) return;

    setActionSuccess('');
    setActionError('');

    try {
      const updated = returnReportToFieldStaff(selectedReport.id, returnReasonText);
      setActionSuccess('El reporte ha sido devuelto al personal de campo para su revisión.');
      setReturnReasonText('');
      setShowReturnForm(false);
      setSelectedReport(updated);
      loadData();
      loadAlerts();
      setTimeout(() => setActionSuccess(''), 3000);
    } catch (err) {
      setActionError(err.message || 'Error al devolver el reporte al personal de campo.');
    }
  };

  // Dynamic Map Visual States
  const [showMarkers, setShowMarkers] = useState(true);
  const [showHeat, setShowHeat] = useState(true);
  const [heatRadius, setHeatRadius] = useState(25);
  const [heatBlur, setHeatBlur] = useState(15);

  // Priority assignment states & logic
  const [authorityNewPriority, setAuthorityNewPriority] = useState('medium');

  useEffect(() => {
    if (selectedReport) {
      setAuthorityNewPriority(selectedReport.priority || 'medium');
    }
  }, [selectedReport]);

  const handleAuthorityPriorityChange = (e) => {
    e.preventDefault();
    setActionError('');
    setActionSuccess('');
    try {
      const updated = updateReportPriority(selectedReport.id, authorityNewPriority);
      setActionSuccess('¡La prioridad del reporte ha sido actualizada exitosamente!');
      setSelectedReport(updated);
      loadData();
      setTimeout(() => setActionSuccess(''), 3000);
    } catch (err) {
      setActionError(err.message || 'Error al actualizar la prioridad.');
    }
  };

  useEffect(() => {
    loadData();
    loadAlerts();

    const interval = setInterval(() => {
      checkAndGenerateInactivityAlerts();
      loadAlerts();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const loadAlerts = () => {
    setAlerts(getAuthorityAlerts());
  };

  const handleAlertClick = (alertItem) => {
    markAuthorityAlertRead(alertItem.id);
    loadAlerts();
    setShowAlertDropdown(false);
    
    // Encontrar el reporte y seleccionarlo
    const all = getReports();
    const found = all.find(r => r.id === alertItem.reportId);
    if (found) {
      setSelectedReport(found);
      // Resetear estados secundarios
      setEstimatedDate(found.estimatedDate || '');
      setReassignReason('');
      setRejectReason('');
      setSelectedRejectReason('fuera_jurisdiccion');
      setCustomRejectReason('');
      setManualClosureImage(null);
      setShowRejectForm(false);
    }
  };

  const handleDisableAlertFromNotification = (e, reportId) => {
    e.stopPropagation();
    disableReportAlerts(reportId, true);
    loadData();
    loadAlerts();
  };

  const handleToggleReportAlerts = (reportId, currentValue) => {
    disableReportAlerts(reportId, !currentValue);
    loadData();
    loadAlerts();
    // Actualizar el reporte seleccionado para que refleje el cambio de alertDisabled
    const all = getReports();
    const updated = all.find(r => r.id === reportId);
    if (updated) {
      setSelectedReport(updated);
    }
  };

  const loadData = () => {
    const all = getReports();
    const sorted = all.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    setReports(sorted);
    const users = getUsers();
    const staff = users.filter((u) => u.role === 'personal_campo');
    setFieldStaff(staff);
    if (staff.length > 0) {
      setAssignmentStaff(staff[0].email);
    }
  };

  const handleAssign = (e) => {
    e.preventDefault();
    if (!selectedReport || !assignmentStaff || !estimatedDate) return;
    
    const isReassign = selectedReport.assignedTo && selectedReport.assignedTo.toLowerCase() !== assignmentStaff.toLowerCase();
    if (isReassign && !reassignReason.trim()) {
      setActionError('Debe ingresar un motivo para la reasignación.');
      return;
    }

    setActionSuccess('');
    setActionError('');

    try {
      const updated = assignReport(selectedReport.id, assignmentStaff, estimatedDate, reassignReason);
      setActionSuccess(isReassign ? `Reporte reasignado exitosamente a ${assignmentStaff}` : `Reporte asignado exitosamente a ${assignmentStaff}`);
      
      // Reset assignment inputs
      setEstimatedDate('');
      setReassignReason('');
      setSelectedReport(updated);
      loadData();
      
      setTimeout(() => {
        setActionSuccess('');
      }, 3000);
    } catch (err) {
      setActionError('Error al asignar el reporte. Inténtelo de nuevo.');
    }
  };

  const handleClosureImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setClosureImage(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleManualClosureImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setManualClosureImage(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleCloseReportSubmit = (e) => {
    e.preventDefault();
    if (!selectedReport) return;

    setActionSuccess('');
    setActionError('');

    try {
      const updated = closeReport(selectedReport.id, closureComment, closureImage);
      setActionSuccess(`Reporte cerrado y archivado exitosamente.`);
      
      setClosureComment('');
      setClosureImage(null);
      setSelectedReport(updated);
      loadData();

      setTimeout(() => {
        setActionSuccess('');
      }, 3000);
    } catch (err) {
      setActionError('Error al cerrar el reporte. Inténtelo de nuevo.');
    }
  };

  const handleReject = (e) => {
    e.preventDefault();
    const finalReason = selectedRejectReason === 'otro' 
      ? customRejectReason.trim() 
      : REJECT_REASONS.find(r => r.value === selectedRejectReason)?.label;
      
    if (!selectedReport || !finalReason) return;

    setActionSuccess('');
    setActionError('');

    try {
      const updated = rejectReport(selectedReport.id, finalReason);
      setActionSuccess(`Reporte rechazado con éxito.`);
      setSelectedRejectReason('fuera_jurisdiccion');
      setCustomRejectReason('');
      setShowRejectForm(false);
      setSelectedReport(updated);
      loadData();

      setTimeout(() => {
        setActionSuccess('');
      }, 3000);
    } catch (err) {
      setActionError('Error al rechazar el reporte.');
    }
  };

  const handleAuthorityStatusChange = (e) => {
    e.preventDefault();
    if (!selectedReport || !authorityNewStatus) return;

    setActionSuccess('');
    setActionError('');

    try {
      let updated;
      if (authorityNewStatus === 'closed') {
        updated = closeReport(selectedReport.id, authorityStatusComment || 'Caso Cerrado por la Autoridad Municipal', manualClosureImage);
        setManualClosureImage(null);
      } else {
        updated = updateReportStatusByAuthority(selectedReport.id, authorityNewStatus, authorityStatusComment);
      }
      setActionSuccess(`Estado del reporte actualizado exitosamente.`);
      setAuthorityStatusComment('');
      setAuthorityNewStatus('');
      setSelectedReport(updated);
      loadData();

      setTimeout(() => {
        setActionSuccess('');
      }, 3000);
    } catch (err) {
      setActionError('Error al actualizar el estado del reporte.');
    }
  };

  // Metrics calculations
  const totalCount = reports.length;
  const pendingCount = reports.filter((r) => r.status === 'received').length;
  const assignedCount = reports.filter((r) => r.status === 'assigned' || r.status === 'in_progress').length;
  const resolvedCount = reports.filter((r) => r.status === 'resolved').length;

  // Filter logic
  const filteredReports = reports.filter((r) => {
    const matchStatus = statusFilter === 'all' || r.status === statusFilter;
    const matchCategory = categoryFilter === 'all' || r.category === categoryFilter;
    const matchZone = zoneFilter === 'all' || (r.location && r.location.toLowerCase().includes(zoneFilter.toLowerCase()));
    return matchStatus && matchCategory && matchZone;
  });

  // STATS CALCULATIONS (Alcance 7)
  const filteredStatsReports = reports.filter(r => {
    const rDate = r.createdAt.split('T')[0];
    const matchDate = rDate >= startDate && rDate <= endDate;
    const matchCategory = statsCategoryFilter === 'all' || r.category === statsCategoryFilter;
    const matchZone = statsZoneFilter === 'all' || (r.location && r.location.toLowerCase().includes(statsZoneFilter.toLowerCase()));
    return matchDate && matchCategory && matchZone;
  });

  const statsResolved = filteredStatsReports.filter(r => ['resolved', 'closed'].includes(r.status));
  const statsInManagement = filteredStatsReports.filter(r => ['received', 'assigned', 'in_progress'].includes(r.status));
  const statsRejected = filteredStatsReports.filter(r => r.status === 'rejected');

  let totalResolutionTimeMs = 0;
  let resolvedCountWithTime = 0;
  statsResolved.forEach(r => {
    const resolvedEvent = r.history ? r.history.find(h => ['resolved', 'closed'].includes(h.status)) : null;
    const resDate = r.resolutionDate || (resolvedEvent ? resolvedEvent.date : null);
    if (resDate) {
      const creationDate = new Date(r.createdAt);
      const resolutionDateObj = new Date(resDate);
      const diff = resolutionDateObj - creationDate;
      if (diff > 0) {
        totalResolutionTimeMs += diff;
        resolvedCountWithTime++;
      }
    }
  });

  const avgResolutionTimeDays = resolvedCountWithTime > 0 
    ? (totalResolutionTimeMs / (1000 * 60 * 60 * 24)) 
    : 0;

  const categoryCounts = {};
  CATEGORIES.forEach(c => {
    categoryCounts[c.id] = 0;
  });
  filteredStatsReports.forEach(r => {
    if (categoryCounts[r.category] !== undefined) {
      categoryCounts[r.category]++;
    } else {
      categoryCounts[r.category] = 1;
    }
  });

  const sortedCategories = Object.keys(categoryCounts)
    .map(catId => {
      const catObj = CATEGORIES.find(c => c.id === catId);
      return {
        id: catId,
        label: catObj ? catObj.label : catId,
        icon: catObj ? catObj.icon : '📌',
        count: categoryCounts[catId]
      };
    })
    .sort((a, b) => b.count - a.count);

  // Heat map calculations
  const heatGrid = Array(5).fill(0).map(() => Array(5).fill(0));
  const cellReports = Array(5).fill(null).map(() => Array(5).fill(null).map(() => []));
  
  filteredStatsReports.forEach(r => {
    if (r.coordinates) {
      const col = Math.min(4, Math.floor(r.coordinates.x / 20));
      const row = Math.min(4, Math.floor(r.coordinates.y / 20));
      heatGrid[row][col]++;
      cellReports[row][col].push(r);
    }
  });

  let maxCount = 1;
  for (let r = 0; r < 5; r++) {
    for (let c = 0; c < 5; c++) {
      if (heatGrid[r][c] > maxCount) {
        maxCount = heatGrid[r][c];
      }
    }
  }

  const reportsInCell = selectedCell ? cellReports[selectedCell.row][selectedCell.col] : [];

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

        {/* Pestañas de navegación */}
        <div className="header-tabs" style={{ display: 'flex', gap: '12px', margin: '0 auto 0 40px' }}>
          <button
            type="button"
            className="btn"
            onClick={() => setActiveTab('inbox')}
            style={{
              margin: 0,
              padding: '8px 16px',
              fontSize: '13px',
              fontWeight: '600',
              borderRadius: '20px',
              border: '1px solid var(--border)',
              backgroundColor: activeTab === 'inbox' ? 'var(--primary)' : 'transparent',
              color: activeTab === 'inbox' ? 'white' : 'var(--text)',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            📥 Gestión de Casos
          </button>
          <button
            type="button"
            className="btn"
            onClick={() => setActiveTab('stats')}
            style={{
              margin: 0,
              padding: '8px 16px',
              fontSize: '13px',
              fontWeight: '600',
              borderRadius: '20px',
              border: '1px solid var(--border)',
              backgroundColor: activeTab === 'stats' ? 'var(--primary)' : 'transparent',
              color: activeTab === 'stats' ? 'white' : 'var(--text)',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            📊 Estadísticas y Mapa
          </button>
        </div>

        <div className="header-actions" style={{ display: 'flex', alignItems: 'center', gap: '10px', position: 'relative' }}>
          {/* Campana de Alertas de Inactividad */}
          <div style={{ position: 'relative' }}>
            <button
              type="button"
              onClick={() => setShowAlertDropdown(!showAlertDropdown)}
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
                transition: 'all 0.2s',
                zIndex: 10
              }}
              title="Alertas de inactividad de reportes"
            >
              🔔
              {alerts.filter(a => !a.read).length > 0 && (
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
                  {alerts.filter(a => !a.read).length}
                </span>
              )}
            </button>

            {showAlertDropdown && (
              <div className="notification-dropdown authority-dropdown card">
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px 16px',
                  borderBottom: '1px solid var(--border)'
                }}>
                  <strong style={{ fontSize: '13px', color: 'var(--text)' }}>🔔 Alertas y Notificaciones center</strong>
                  {alerts.filter(a => !a.read).length > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        markAllAuthorityAlertsRead();
                        loadAlerts();
                      }}
                      style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: '11px', cursor: 'pointer', fontWeight: '600' }}
                    >
                      Marcar todo leídos
                    </button>
                  )}
                </div>
                <div>
                  {alerts.length === 0 ? (
                    <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
                      No hay alertas ni notificaciones nuevas.
                    </div>
                  ) : (
                    alerts.map(a => {
                      const isResolved = a.type === 'resolved';
                      const isCannotResolve = a.type === 'cannot_resolve';
                      const isInactivity = a.type === 'inactivity' || (!isResolved && !isCannotResolve);
                      
                      let badgeColor = 'var(--danger)';
                      let badgeText = `⚠️ Sin actualizar: ${a.daysElapsed} días`;
                      if (isResolved) {
                        badgeColor = '#8b5cf6';
                        badgeText = '✅ RESOLUCIÓN (Revisión)';
                      } else if (isCannotResolve) {
                        badgeColor = '#f59e0b';
                        badgeText = '⚠️ IMPOSIBILIDAD';
                      }

                      return (
                        <div
                          key={a.id}
                          onClick={() => handleAlertClick(a)}
                          style={{
                            padding: '12px 16px',
                            borderBottom: '1px solid var(--border)',
                            cursor: 'pointer',
                            backgroundColor: !a.read 
                              ? (isResolved ? 'rgba(139, 92, 246, 0.05)' : isCannotResolve ? 'rgba(245, 158, 11, 0.05)' : 'rgba(239, 68, 68, 0.05)') 
                              : 'transparent',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '6px',
                            textAlign: 'left',
                            transition: 'background-color 0.2s'
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--text-muted)' }}>
                            <span style={{ color: badgeColor, fontWeight: 'bold' }}>
                              {badgeText}
                            </span>
                            <span>{new Date(a.date).toLocaleDateString()}</span>
                          </div>
                          <span style={{ fontSize: '12px', fontWeight: !a.read ? '600' : '400', color: 'var(--text)' }}>
                            {a.message || a.reportTitle}
                          </span>
                          <div style={{ display: 'flex', gap: '8px', fontSize: '11px', color: 'var(--text-muted)', flexWrap: 'wrap' }}>
                            <span><strong>Cat:</strong> {a.category}</span>
                            <span>•</span>
                            <span><strong>Zona:</strong> {a.zone}</span>
                          </div>
                          {isInactivity && (
                            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '4px' }}>
                              <button
                                type="button"
                                onClick={(e) => handleDisableAlertFromNotification(e, a.reportId)}
                                style={{
                                  background: 'rgba(0,0,0,0.05)',
                                  border: 'none',
                                  borderRadius: '4px',
                                  padding: '4px 8px',
                                  fontSize: '11px',
                                  cursor: 'pointer',
                                  color: 'var(--text-muted)'
                                }}
                                title="Dejar de recibir avisos de inactividad de este reporte"
                              >
                                🔕 Desactivar avisos
                              </button>
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
        {activeTab === 'inbox' ? (
          <>
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
              <h4>Recibidos</h4>
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
        <section className="filter-bar card" style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <div className="filter-group" style={{ flex: 1, minWidth: '200px' }}>
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

          <div className="filter-group" style={{ flex: 1, minWidth: '200px' }}>
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

          <div className="filter-group" style={{ flex: 1, minWidth: '200px' }}>
            <label htmlFor="filter-zone">Filtrar por Provincia:</label>
            <select
              id="filter-zone"
              value={zoneFilter}
              onChange={(e) => setZoneFilter(e.target.value)}
            >
              <option value="all">Todas las Provincias</option>
              <option value="San José">San José</option>
              <option value="Alajuela">Alajuela</option>
              <option value="Cartago">Cartago</option>
              <option value="Heredia">Heredia</option>
              <option value="Guanacaste">Guanacaste</option>
              <option value="Puntarenas">Puntarenas</option>
              <option value="Limón">Limón</option>
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
                      <th>Fecha de Envío</th>
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
                        className={`${selectedReport?.id === rep.id ? 'row-selected' : ''} ${rep.status === 'received' ? 'row-new-received' : ''} ${rep.status === 'resolved' ? 'row-resolved-review' : ''}`}
                        style={
                          rep.status === 'received' 
                            ? { borderLeft: '4px solid #10b981' } 
                            : rep.status === 'resolved' 
                              ? { borderLeft: '4px solid #8b5cf6', backgroundColor: 'rgba(139, 92, 246, 0.02)' } 
                              : {}
                        }
                      >
                        <td data-label="Código">
                          <span className="code-tag">{rep.id}</span>
                          {rep.status === 'received' && (
                            <span style={{ fontSize: '10px', background: 'rgba(16,185,129,0.15)', color: '#10b981', padding: '2px 6px', borderRadius: '4px', marginLeft: '6px', fontWeight: 'bold' }}>
                              Nuevo 🟢
                            </span>
                          )}
                          {rep.status === 'resolved' && (
                            <span style={{ fontSize: '10px', background: 'rgba(139,92,246,0.15)', color: '#8b5cf6', padding: '2px 6px', borderRadius: '4px', marginLeft: '6px', fontWeight: 'bold' }}>
                              Revisión 🧪
                            </span>
                          )}
                        </td>
                        <td data-label="Incidencia">
                          <div className="table-report-info">
                            <strong style={rep.status === 'received' ? { fontWeight: '800', color: 'var(--primary)' } : {}}>{rep.title}</strong>
                            <span className="text-muted truncate-text">{rep.location}</span>
                          </div>
                        </td>
                        <td data-label="Categoría">{getCategoryIcon(rep.category)}</td>
                        <td data-label="Fecha">{new Date(rep.createdAt).toLocaleDateString('es-CR')}</td>
                        <td data-label="Urgencia">{getPriorityBadge(rep.priority)}</td>
                        <td data-label="Estado">{getStatusBadge(rep.status)}</td>
                        <td data-label="Asignado a">
                          {rep.assignedTo ? (
                            <span className="assigned-user-tag">👷 {getStaffName(rep.assignedTo)}</span>
                          ) : (
                            rep.status === 'rejected' ? (
                              <span style={{ color: 'var(--danger)', fontSize: '12px', fontWeight: '600' }}>Rechazado</span>
                            ) : (
                              <span className="unassigned-tag">Sin Asignar</span>
                            )
                          )}
                        </td>
                        <td data-label="Acciones">
                          <button
                            type="button"
                            className="btn btn-secondary btn-xs"
                            onClick={() => {
                              setSelectedReport(rep);
                              setClosureComment('');
                              setClosureImage(null);
                              setEstimatedDate(rep.estimatedDate || '');
                              setReassignReason('');
                              setRejectReason('');
                              setSelectedRejectReason('fuera_jurisdiccion');
                              setCustomRejectReason('');
                              setManualClosureImage(null);
                              setShowRejectForm(false);
                            }}
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
        </div>

        {/* Management Panel Drawer Overlay */}
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

                {['closed', 'rejected'].includes(selectedReport.status) && (
                  <div className="alert alert-info" style={{ marginBottom: '20px', textAlign: 'left' }}>
                    <strong>🔒 Reporte Finalizado</strong>
                    <p style={{ margin: '5px 0 0 0', fontSize: '13px', lineHeight: '1.4' }}>
                      Este reporte se encuentra en estado <strong>{STATUSES.find(s => s.value === selectedReport.status)?.label || selectedReport.status}</strong>. No admite modificaciones ni reasignaciones adicionales.
                    </p>
                  </div>
                )}

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
                  <div className="meta-item" style={{ gridColumn: 'span 2', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border)', paddingTop: '10px', marginTop: '5px' }}>
                    <strong>🔔 Alertas de inactividad:</strong>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '12px', color: selectedReport.alertDisabled ? 'var(--text-muted)' : 'var(--danger)', fontWeight: '600' }}>
                        {selectedReport.alertDisabled ? 'Desactivadas' : 'Activas'}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleToggleReportAlerts(selectedReport.id, selectedReport.alertDisabled)}
                        className={`btn ${selectedReport.alertDisabled ? 'btn-secondary' : 'btn-primary'}`}
                        style={{ padding: '4px 8px', fontSize: '11px', margin: 0, height: 'auto', backgroundColor: selectedReport.alertDisabled ? 'var(--border)' : 'rgba(239, 68, 68, 0.1)', color: selectedReport.alertDisabled ? 'var(--text)' : 'var(--danger)', border: selectedReport.alertDisabled ? '1px solid var(--border)' : '1px solid rgba(239, 68, 68, 0.3)' }}
                      >
                        {selectedReport.alertDisabled ? '🔔 Activar' : '🔕 Desactivar'}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Evidence photos in Authority view */}
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

                {/* Map preview in Authority view */}
                {selectedReport.coordinates && (
                  <div className="detail-section">
                    <h4>Geolocalización en Mapa</h4>
                    <MapPreview coordinates={selectedReport.coordinates} />
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

                {/* Control de alertas de inactividad (visible si no está cerrado ni rechazado) */}
                {selectedReport.status !== 'closed' && selectedReport.status !== 'rejected' && (
                  <div className="detail-section" style={{
                    padding: '12px 16px',
                    backgroundColor: selectedReport.alertDisabled ? 'rgba(107, 114, 128, 0.05)' : 'rgba(239, 68, 68, 0.05)',
                    border: `1px solid ${selectedReport.alertDisabled ? 'rgba(107, 114, 128, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`,
                    borderRadius: 'var(--radius-sm)',
                    marginBottom: '20px',
                    textAlign: 'left',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '12px'
                  }}>
                    <div>
                      <strong style={{ fontSize: '13px' }}>
                        {selectedReport.alertDisabled ? '🔕 Alertas de inactividad desactivadas' : '🔔 Alertas de inactividad activas'}
                      </strong>
                      <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
                        {selectedReport.alertDisabled
                          ? 'No se generarán avisos aunque este reporte permanezca sin actualización por más de 3 días.'
                          : 'Recibirás un aviso si este reporte lleva más de 3 días sin actualización de estado.'}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleToggleReportAlerts(selectedReport.id, selectedReport.alertDisabled)}
                      className="btn btn-secondary btn-sm"
                      style={{
                        whiteSpace: 'nowrap',
                        fontSize: '11px',
                        padding: '6px 12px',
                        borderColor: selectedReport.alertDisabled ? 'var(--primary)' : 'var(--text-muted)',
                        color: selectedReport.alertDisabled ? 'var(--primary)' : 'var(--text-muted)'
                      }}
                    >
                      {selectedReport.alertDisabled ? '🔔 Reactivar' : '🔕 Desactivar'}
                    </button>
                  </div>
                )}

                {/* Rejection Details (if rejected) */}
                {selectedReport.status === 'rejected' && (
                  <div className="detail-section rejection-details card" style={{ padding: '16px', backgroundColor: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: 'var(--radius-sm)', marginBottom: '20px', textAlign: 'left' }}>
                    <h4 style={{ color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: '8px', margin: '0 0 10px 0' }}>
                      🚫 Reporte Rechazado
                    </h4>
                    <p style={{ fontSize: '13px', margin: '0 0 6px 0', lineHeight: '1.4' }}>
                      Este reporte ha sido desestimado por la autoridad municipal.
                    </p>
                    {selectedReport.rejectReason && (
                      <p style={{ fontSize: '13px', margin: 0, fontWeight: 'bold', color: 'var(--danger)' }}>
                        Motivo: "{selectedReport.rejectReason}"
                      </p>
                    )}
                  </div>
                )}

                {/* Reject Report Trigger Button (Only if not closed or rejected) */}
                {selectedReport.status !== 'closed' && selectedReport.status !== 'rejected' && !showRejectForm && (
                  <button
                    type="button"
                    className="btn btn-secondary btn-block"
                    onClick={() => setShowRejectForm(true)}
                    style={{ marginBottom: '20px', borderColor: 'var(--danger)', color: 'var(--danger)', background: 'transparent' }}
                  >
                    🚫 Rechazar Reporte (No Válido)
                  </button>
                )}

                {/* Rejection Form Box */}
                {showRejectForm && (
                  <div className="detail-section rejection-form-box" style={{ padding: '16px', backgroundColor: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: 'var(--radius-sm)', marginBottom: '20px', textAlign: 'left' }}>
                    <h4 style={{ color: 'var(--danger)', margin: '0 0 10px 0' }}>🚫 Rechazar Incidencia</h4>
                    <form onSubmit={handleReject} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label htmlFor="reject-reason-select">Seleccione Motivo de Rechazo:</label>
                        <select
                          id="reject-reason-select"
                          value={selectedRejectReason}
                          onChange={(e) => setSelectedRejectReason(e.target.value)}
                          style={{ width: '100%', padding: '8px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}
                        >
                          {REJECT_REASONS.map((r) => (
                            <option key={r.value} value={r.value}>{r.label}</option>
                          ))}
                        </select>
                      </div>
                      {selectedRejectReason === 'otro' && (
                        <div className="form-group" style={{ marginBottom: 0 }}>
                          <label htmlFor="reject-note">Motivo de Rechazo Personalizado (Será notificado al ciudadano):</label>
                          <textarea
                            id="reject-note"
                            rows="3"
                            placeholder="Describa detalladamente el motivo de rechazo..."
                            value={customRejectReason}
                            onChange={(e) => setCustomRejectReason(e.target.value)}
                            required
                            style={{ width: '100%' }}
                          ></textarea>
                        </div>
                      )}
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button type="submit" className="btn btn-primary" style={{ flex: 1, backgroundColor: 'var(--danger)', borderColor: 'var(--danger)', color: 'white' }}>
                          Confirmar Rechazo
                        </button>
                        <button type="button" className="btn btn-secondary" onClick={() => setShowRejectForm(false)} style={{ flex: 1 }}>
                          Cancelar
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {/* Assignment & Reassignment Box (Only if received, assigned, or in_progress, and NOT showing reject form) */}
                {(selectedReport.status === 'received' || selectedReport.status === 'assigned' || selectedReport.status === 'in_progress') && !showRejectForm && (
                  <div className="detail-section assignment-box" style={{ padding: '16px', backgroundColor: 'var(--bg-main)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', marginBottom: '20px', textAlign: 'left' }}>
                    <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '0 0 10px 0' }}>
                      {selectedReport.assignedTo ? '🔄 Reasignar Atención de Campo' : '👷 Asignar Atención de Campo'}
                    </h4>
                    {selectedReport.assignedTo && (
                      <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '10px' }}>
                        Actualmente asignado a: <strong>{getStaffName(selectedReport.assignedTo)}</strong>
                      </p>
                    )}
                    <form onSubmit={handleAssign} className="assign-form" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <div className="form-group" style={{ marginBottom: 0 }}>
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

                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label htmlFor="est-date">Fecha Estimada de Atención:</label>
                        <input
                          id="est-date"
                          type="date"
                          value={estimatedDate}
                          onChange={(e) => setEstimatedDate(e.target.value)}
                          onClick={(e) => {
                            try {
                              e.target.showPicker();
                            } catch (err) {
                              console.warn('Native picker not supported:', err);
                            }
                          }}
                          required
                          style={{ width: '100%', padding: '6px', cursor: 'pointer' }}
                        />
                      </div>

                      {/* Motivo de reasignación (sólo si ya tiene asignado otro operario) */}
                      {selectedReport.assignedTo && selectedReport.assignedTo.toLowerCase() !== assignmentStaff.toLowerCase() && (
                        <div className="form-group" style={{ marginBottom: 0 }}>
                          <label htmlFor="reassign-reason">Motivo de Reasignación (Obligatorio):</label>
                          <input
                            id="reassign-reason"
                            type="text"
                            placeholder="Ej. El operario anterior se encuentra incapacitado."
                            value={reassignReason}
                            onChange={(e) => setReassignReason(e.target.value)}
                            required
                            style={{ width: '100%' }}
                          />
                        </div>
                      )}

                      <button type="submit" className="btn btn-primary btn-block">
                        {selectedReport.assignedTo ? 'Confirmar Reasignación' : 'Asignar y Notificar'}
                      </button>
                    </form>
                  </div>
                )}

                {/* Manual Status Changer (Only if not closed or rejected) */}
                {selectedReport.status !== 'closed' && selectedReport.status !== 'rejected' && !showRejectForm && (
                  <div className="detail-section manual-status-box" style={{ padding: '16px', backgroundColor: 'var(--bg-main)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', marginBottom: '20px', textAlign: 'left' }}>
                    <h4 style={{ fontSize: '14px', margin: '0 0 8px 0' }}>⚙️ Cambiar Estado Manuelmente</h4>
                    <form onSubmit={handleAuthorityStatusChange} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <select
                          value={authorityNewStatus}
                          onChange={(e) => setAuthorityNewStatus(e.target.value)}
                          required
                          style={{ width: '100%', padding: '6px' }}
                        >
                          <option value="">Seleccionar Estado...</option>
                          <option value="in_progress">En gestión (En Progreso)</option>
                          <option value="resolved">Resuelto</option>
                          <option value="closed">Cerrado y Archivado</option>
                        </select>
                      </div>
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <input
                          type="text"
                          placeholder={authorityNewStatus === 'closed' ? "Comentario de cierre obligatorio..." : "Comentario sobre el avance..."}
                          value={authorityStatusComment}
                          onChange={(e) => setAuthorityStatusComment(e.target.value)}
                          required={authorityNewStatus === 'closed'}
                          style={{ width: '100%', padding: '6px' }}
                        />
                      </div>
                      {authorityNewStatus === 'closed' && (
                        <div className="form-group" style={{ marginBottom: 0 }}>
                          <label style={{ fontSize: '12px', display: 'block', marginBottom: '4px' }}>Foto de Evidencia de Cierre (Opcional):</label>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleManualClosureImageChange}
                            style={{ display: 'block', marginTop: '6px', fontSize: '12px' }}
                          />
                          {manualClosureImage && (
                            <div style={{ marginTop: '10px', width: '100px', height: '75px', borderRadius: 'var(--radius-sm)', overflow: 'hidden', border: '1px solid var(--border)' }}>
                              <img src={manualClosureImage} alt="Preview Cierre" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            </div>
                          )}
                        </div>
                      )}
                      <button type="submit" className="btn btn-secondary btn-sm" style={{ width: '100%' }}>
                        Actualizar Estado
                      </button>
                    </form>
                  </div>
                )}

                {/* Priority Changer (Only if not closed or rejected) */}
                {selectedReport.status !== 'closed' && selectedReport.status !== 'rejected' && !showRejectForm && (
                  <div className="detail-section manual-status-box" style={{ padding: '16px', backgroundColor: 'var(--bg-main)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', marginBottom: '20px', textAlign: 'left' }}>
                    <h4 style={{ fontSize: '14px', margin: '0 0 8px 0' }}>⚡ Asignar Prioridad (Urgencia)</h4>
                    <form onSubmit={handleAuthorityPriorityChange} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <select
                          value={authorityNewPriority}
                          onChange={(e) => setAuthorityNewPriority(e.target.value)}
                          required
                          style={{ width: '100%', padding: '6px' }}
                        >
                          {PRIORITIES.map((p) => (
                            <option key={p.value} value={p.value}>{p.label}</option>
                          ))}
                        </select>
                      </div>
                      <button type="submit" className="btn btn-secondary btn-sm" style={{ width: '100%' }}>
                        Actualizar Prioridad
                      </button>
                    </form>
                  </div>
                )}

                {/* Closure Form Box (Only if resolved, and NOT showing reject form) */}
                {selectedReport.status === 'resolved' && !showRejectForm && (
                  <div className="detail-section closure-box" style={{ padding: '16px', backgroundColor: 'rgba(139, 92, 246, 0.05)', border: '1px solid rgba(139, 92, 246, 0.2)', borderRadius: 'var(--radius-sm)', marginBottom: '20px', textAlign: 'left' }}>
                    <h4 style={{ color: '#8b5cf6', display: 'flex', alignItems: 'center', gap: '8px', margin: '0 0 10px 0' }}>
                      🧪 Revisión de Resolución de Campo
                    </h4>
                    
                    {/* Operario evidence and notes */}
                    <div style={{ backgroundColor: 'var(--bg-main)', border: '1px solid var(--border)', padding: '12px', borderRadius: 'var(--radius-sm)', marginBottom: '16px' }}>
                      <strong style={{ fontSize: '13px', display: 'block', marginBottom: '4px' }}>Comentario de Resolución del Operario:</strong>
                      <p style={{ margin: '0 0 10px 0', fontSize: '13px', fontStyle: 'italic', color: 'var(--text-main)' }}>
                        "{selectedReport.resolutionComment || 'Sin comentario descriptivo'}"
                      </p>
                      {selectedReport.resolutionImages && selectedReport.resolutionImages.length > 0 && (
                        <div>
                          <strong style={{ fontSize: '12px', display: 'block', marginBottom: '6px' }}>Evidencia Fotográfica de la Resolución:</strong>
                          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                            {selectedReport.resolutionImages.map((img, idx) => (
                              <div key={idx} style={{ width: '80px', height: '60px', borderRadius: '4px', overflow: 'hidden', border: '1px solid var(--border)', cursor: 'zoom-in' }} onClick={() => setZoomedImage(img)}>
                                <img src={img} alt={`Resolución ${idx}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {!showReturnForm ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <div style={{ borderTop: '1px solid var(--border)', paddingTop: '15px' }}>
                          <h4 style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: '8px', margin: '0 0 10px 0' }}>
                            ✅ Cerrar y Archivar Reporte Solucionado
                          </h4>
                          <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '12px' }}>
                            Si la resolución es satisfactoria, ingrese el comentario de cierre para el ciudadano y guarde el caso.
                          </p>
                          <form onSubmit={handleCloseReportSubmit} className="closure-form" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <div className="form-group" style={{ marginBottom: 0 }}>
                              <label htmlFor="closure-note">Comentario de Cierre para el Ciudadano:</label>
                              <textarea
                                id="closure-note"
                                rows="3"
                                placeholder="Ej. Se reparó la tubería y se asfaltó la acera dañada. El servicio quedó restablecido."
                                value={closureComment}
                                onChange={(e) => setClosureComment(e.target.value)}
                                required
                                style={{ width: '100%' }}
                              ></textarea>
                            </div>
                            
                            <div className="form-group" style={{ marginBottom: 0 }}>
                              <label>Foto de Evidencia de Cierre (Opcional):</label>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={handleClosureImageChange}
                                style={{ display: 'block', marginTop: '6px' }}
                              />
                              {closureImage && (
                                <div style={{ marginTop: '10px', width: '100px', height: '75px', borderRadius: 'var(--radius-sm)', overflow: 'hidden', border: '1px solid var(--border)' }}>
                                  <img src={closureImage} alt="Preview Cierre" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                </div>
                              )}
                            </div>

                            <button type="submit" className="btn btn-primary btn-block" style={{ backgroundColor: '#10b981', borderColor: '#10b981', color: '#ffffff', marginTop: '8px' }}>
                              🔒 Cerrar Caso Definitivamente
                            </button>
                          </form>
                        </div>

                        <button 
                          type="button" 
                          className="btn btn-secondary btn-block" 
                          onClick={() => {
                            setShowReturnForm(true);
                            setReturnReasonText('');
                          }}
                          style={{ borderColor: 'var(--danger)', color: 'var(--danger)', background: 'transparent', marginTop: '10px' }}
                        >
                          ❌ Devolver a Personal de Campo
                        </button>
                      </div>
                    ) : (
                      <div style={{ borderTop: '1px solid var(--border)', paddingTop: '15px' }} className="animate-fade-in">
                        <h4 style={{ color: 'var(--danger)', margin: '0 0 10px 0' }}>❌ Devolver Reporte para Correcciones</h4>
                        <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '12px' }}>
                          Indique detalladamente al personal de campo qué aspectos no son satisfactorios para que vuelvan a atender la incidencia.
                        </p>
                        <form onSubmit={handleReturnSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                          <div className="form-group" style={{ marginBottom: 0 }}>
                            <label htmlFor="return-reason-text">Motivo de Devolución:</label>
                            <textarea
                              id="return-reason-text"
                              rows="3"
                              placeholder="Ej. La tapa de la alcantarilla no quedó bien nivelada y representa un riesgo para los peatones. Favor corregir."
                              value={returnReasonText}
                              onChange={(e) => setReturnReasonText(e.target.value)}
                              required
                              style={{ width: '100%' }}
                            ></textarea>
                          </div>
                          <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                            <button type="submit" className="btn btn-primary" style={{ flex: 1, backgroundColor: 'var(--danger)', borderColor: 'var(--danger)', color: 'white' }}>
                              Confirmar Devolución
                            </button>
                            <button type="button" className="btn btn-secondary" onClick={() => setShowReturnForm(false)} style={{ flex: 1 }}>
                              Cancelar
                            </button>
                          </div>
                        </form>
                      </div>
                    )}
                  </div>
                )}

                {/* Closure Details (If closed) */}
                {selectedReport.status === 'closed' && (
                  <div className="detail-section closure-evidence-view" style={{ padding: '16px', backgroundColor: 'var(--bg-main)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', marginBottom: '20px', textAlign: 'left' }}>
                    <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '0 0 10px 0' }}>
                      🏛️ Reporte Cerrado y Archivado
                    </h4>
                    
                    {selectedReport.closureComment && (
                      <p style={{ fontSize: '13px', margin: '0 0 12px 0', lineHeight: '1.4' }}>
                        <strong>Comentario de Cierre:</strong> "{selectedReport.closureComment}"
                      </p>
                    )}
                    
                    {selectedReport.closureImage ? (
                      <div>
                        <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                          📸 Foto de evidencia de resolución:
                        </span>
                        <div className="closure-img-view" style={{ width: '150px', height: '112px', borderRadius: 'var(--radius-sm)', overflow: 'hidden', border: '1px solid var(--border)', cursor: 'zoom-in' }} onClick={() => setZoomedImage(selectedReport.closureImage)}>
                          <img src={selectedReport.closureImage} alt="Evidencia Cierre" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                      </div>
                    ) : (
                      <p style={{ fontSize: '12px', color: 'var(--danger)', fontStyle: 'italic', margin: 0 }}>
                        ⚠️ No se adjuntó fotografía de evidencia para el cierre de este caso.
                      </p>
                    )}
                  </div>
                )}

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
          </div>
        )}
        </>
        ) : (
          <>
            {/* Filter Bar for Stats */}
            <section className="filter-bar card animate-fade-in" style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '20px', textAlign: 'left' }}>
              <div className="filter-group" style={{ flex: 1, minWidth: '150px' }}>
                <label htmlFor="stats-start-date">Fecha de Inicio:</label>
                <input
                  id="stats-start-date"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  onClick={(e) => {
                    try {
                      e.target.showPicker();
                    } catch (err) {}
                  }}
                  style={{ width: '100%', padding: '8px', border: '1px solid var(--border)', borderRadius: '4px', background: 'var(--bg-main)', color: 'var(--text)', cursor: 'pointer' }}
                />
              </div>
              <div className="filter-group" style={{ flex: 1, minWidth: '150px' }}>
                <label htmlFor="stats-end-date">Fecha de Fin:</label>
                <input
                  id="stats-end-date"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  onClick={(e) => {
                    try {
                      e.target.showPicker();
                    } catch (err) {}
                  }}
                  style={{ width: '100%', padding: '8px', border: '1px solid var(--border)', borderRadius: '4px', background: 'var(--bg-main)', color: 'var(--text)', cursor: 'pointer' }}
                />
              </div>
              <div className="filter-group" style={{ flex: 1, minWidth: '180px' }}>
                <label htmlFor="stats-filter-cat">Filtrar por Categoría:</label>
                <select
                  id="stats-filter-cat"
                  value={statsCategoryFilter}
                  onChange={(e) => setStatsCategoryFilter(e.target.value)}
                  style={{ width: '100%', padding: '8px', border: '1px solid var(--border)', borderRadius: '4px', background: 'var(--bg-main)', color: 'var(--text)' }}
                >
                  <option value="all">Todas las Categorías</option>
                  {CATEGORIES.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.icon} {c.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="filter-group" style={{ flex: 1, minWidth: '180px' }}>
                <label htmlFor="stats-filter-zone">Filtrar por Provincia:</label>
                <select
                  id="stats-filter-zone"
                  value={statsZoneFilter}
                  onChange={(e) => setStatsZoneFilter(e.target.value)}
                  style={{ width: '100%', padding: '8px', border: '1px solid var(--border)', borderRadius: '4px', background: 'var(--bg-main)', color: 'var(--text)' }}
                >
                  <option value="all">Todas las Provincias</option>
                  <option value="San José">San José</option>
                  <option value="Alajuela">Alajuela</option>
                  <option value="Cartago">Cartago</option>
                  <option value="Heredia">Heredia</option>
                  <option value="Guanacaste">Guanacaste</option>
                  <option value="Puntarenas">Puntarenas</option>
                  <option value="Limón">Limón</option>
                </select>
              </div>
            </section>

            {/* Stats Metrics Row */}
            <section className="metrics-row animate-fade-in" style={{ marginBottom: '20px' }}>
              <div className="metric-card card">
                <span className="metric-icon blue">📁</span>
                <div className="metric-details">
                  <h4>Total Reportes</h4>
                  <span className="metric-val">{filteredStatsReports.length}</span>
                </div>
              </div>
              <div className="metric-card card">
                <span className="metric-icon green">✅</span>
                <div className="metric-details">
                  <h4>Resueltos</h4>
                  <span className="metric-val">
                    {statsResolved.length} 
                    <span style={{ fontSize: '12px', fontWeight: 'normal', color: 'var(--text-muted)', marginLeft: '6px' }}>
                      ({filteredStatsReports.length > 0 ? Math.round((statsResolved.length / filteredStatsReports.length) * 100) : 0}%)
                    </span>
                  </span>
                </div>
              </div>
              <div className="metric-card card">
                <span className="metric-icon yellow">⏳</span>
                <div className="metric-details">
                  <h4>En Gestión</h4>
                  <span className="metric-val">
                    {statsInManagement.length}
                    <span style={{ fontSize: '12px', fontWeight: 'normal', color: 'var(--text-muted)', marginLeft: '6px' }}>
                      ({filteredStatsReports.length > 0 ? Math.round((statsInManagement.length / filteredStatsReports.length) * 100) : 0}%)
                    </span>
                  </span>
                </div>
              </div>
              <div className="metric-card card">
                <span className="metric-icon red">🚫</span>
                <div className="metric-details">
                  <h4>Rechazados</h4>
                  <span className="metric-val">
                    {statsRejected.length}
                    <span style={{ fontSize: '12px', fontWeight: 'normal', color: 'var(--text-muted)', marginLeft: '6px' }}>
                      ({filteredStatsReports.length > 0 ? Math.round((statsRejected.length / filteredStatsReports.length) * 100) : 0}%)
                    </span>
                  </span>
                </div>
              </div>
              <div className="metric-card card" style={{ minWidth: '220px' }}>
                <span className="metric-icon purple">⏱️</span>
                <div className="metric-details">
                  <h4>Tiempo de Resolución</h4>
                  <span className="metric-val" style={{ fontSize: '20px' }}>
                    {avgResolutionTimeDays > 0 
                      ? (avgResolutionTimeDays >= 1 
                          ? `${avgResolutionTimeDays.toFixed(1)} días` 
                          : `${(avgResolutionTimeDays * 24).toFixed(1)} horas`) 
                      : 'N/A'}
                  </span>
                </div>
              </div>
            </section>

            {/* Layout: Heat Map and Frequencies */}
            <div className="dashboard-grid animate-fade-in" style={{ gridTemplateColumns: '1.2fr 0.8fr', gap: '20px' }}>
              
              {/* Heat Map Card */}
              <section className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'left' }}>
                <div className="card-header" style={{ paddingBottom: '10px', borderBottom: '1px solid var(--border)' }}>
                  <h3 style={{ margin: 0 }}>🗺️ Mapa Real de Incidencias y Calor</h3>
                  <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: 'var(--text-muted)' }}>
                    Visualice la ubicación exacta y concentración de los reportes. Haga clic en un pin para ver detalles y gestionarlo.
                  </p>
                </div>

                {/* Control Panel for Heatmap/Markers Options */}
                <div style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '16px',
                  padding: '12px',
                  backgroundColor: 'var(--bg-main, #f9fafb)',
                  borderRadius: 'var(--radius-sm, 6px)',
                  border: '1px solid var(--border, #e5e7eb)',
                  fontSize: '13px',
                  marginBottom: '10px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '500', cursor: 'pointer', margin: 0 }}>
                      <input
                        type="checkbox"
                        checked={showMarkers}
                        onChange={(e) => setShowMarkers(e.target.checked)}
                        style={{ cursor: 'pointer' }}
                      />
                      📍 Mostrar Marcadores
                    </label>
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '500', cursor: 'pointer', margin: 0 }}>
                      <input
                        type="checkbox"
                        checked={showHeat}
                        onChange={(e) => setShowHeat(e.target.checked)}
                        style={{ cursor: 'pointer' }}
                      />
                      🔥 Mostrar Capa de Calor
                    </label>
                  </div>

                  {showHeat && (
                    <div style={{ display: 'flex', gap: '16px', flex: 1, minWidth: '250px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ color: 'var(--text-muted, #6b7280)' }}>Radio:</span>
                        <input
                          type="range"
                          min="10"
                          max="50"
                          value={heatRadius}
                          onChange={(e) => setHeatRadius(Number(e.target.value))}
                          style={{ width: '80px', cursor: 'pointer' }}
                        />
                        <span style={{ fontWeight: '600' }}>{heatRadius}px</span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ color: 'var(--text-muted, #6b7280)' }}>Difuminado:</span>
                        <input
                          type="range"
                          min="10"
                          max="40"
                          value={heatBlur}
                          onChange={(e) => setHeatBlur(Number(e.target.value))}
                          style={{ width: '80px', cursor: 'pointer' }}
                        />
                        <span style={{ fontWeight: '600' }}>{heatBlur}px</span>
                      </div>
                    </div>
                  )}
                </div>

                <AuthorityMap
                  reports={filteredStatsReports}
                  showMarkers={showMarkers}
                  showHeat={showHeat}
                  heatRadius={heatRadius}
                  heatBlur={heatBlur}
                  onSelectReport={(rep) => {
                    setSelectedReport(rep);
                    setActiveTab('inbox');
                    setClosureComment('');
                    setClosureImage(null);
                    setEstimatedDate(rep.estimatedDate || '');
                    setReassignReason('');
                    setRejectReason('');
                    setSelectedRejectReason('fuera_jurisdiccion');
                    setCustomRejectReason('');
                    setManualClosureImage(null);
                    setShowRejectForm(false);
                  }}
                />
              </section>

              {/* Frequencies Card */}
              <section className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'left', height: 'fit-content' }}>
                <div className="card-header" style={{ paddingBottom: '10px', borderBottom: '1px solid var(--border)' }}>
                  <h3 style={{ margin: 0 }}>📈 Tipos de Incidencia Frecuentes</h3>
                  <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: 'var(--text-muted)' }}>
                    Categorías ordenadas de mayor a menor frecuencia en el período.
                  </p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '10px' }}>
                  {sortedCategories.map(cat => {
                    const percentage = filteredStatsReports.length > 0 
                      ? Math.round((cat.count / filteredStatsReports.length) * 100) 
                      : 0;
                    return (
                      <div key={cat.id} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'var(--text-main)' }}>
                          <span style={{ fontWeight: '500' }}>{cat.icon} {cat.label}</span>
                          <span style={{ fontWeight: '600' }}>{cat.count} {cat.count === 1 ? 'caso' : 'casos'} ({percentage}%)</span>
                        </div>
                        <div style={{ width: '100%', height: '8px', background: 'var(--border)', borderRadius: '4px', overflow: 'hidden', backgroundColor: 'rgba(0,0,0,0.05)' }}>
                          <div style={{ width: `${percentage}%`, height: '100%', background: 'var(--primary)', borderRadius: '4px', transition: 'width 0.3s ease' }}></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            </div>
          </>
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
