// Base de Datos Mock - Persistida en LocalStorage para simular backend
export const DEFAULT_USERS = [
  {
    email: 'autoridad@municipal.go.cr',
    password: 'autoridad123',
    name: 'Ing. Laura Flores',
    role: 'autoridad',
    department: 'Gestión Urbana y Servicios'
  },
  {
    email: 'campo@municipal.go.cr',
    password: 'campo123',
    name: 'Carlos Mendoza',
    role: 'personal_campo',
    department: 'Mantenimiento de Vías'
  }
];

export const CATEGORIES = [
  { id: 'vias', label: 'Baches y Pavimentación', icon: '🛣️' },
  { id: 'alumbrado', label: 'Alumbrado Público', icon: '💡' },
  { id: 'aseo', label: 'Basura y Limpieza', icon: '🧹' },
  { id: 'parques', label: 'Parques y Zonas Verdes', icon: '🌳' },
  { id: 'agua', label: 'Fugas de Agua y Alcantarillado', icon: '🚰' },
  { id: 'otros', label: 'Otros Incidentes', icon: '📌' }
];

export const PRIORITIES = [
  { value: 'low', label: 'Baja', color: '#10b981' },
  { value: 'medium', label: 'Media', color: '#f59e0b' },
  { value: 'high', label: 'Alta', color: '#ef4444' }
];

export const STATUSES = [
  { value: 'received', label: 'Recibido', color: '#6b7280' },
  { value: 'assigned', label: 'En gestión', color: '#3b82f6' },
  { value: 'in_progress', label: 'En gestión', color: '#8b5cf6' },
  { value: 'resolved', label: 'Resuelto', color: '#10b981' },
  { value: 'closed', label: 'Cerrado', color: '#1f2937' },
  { value: 'rejected', label: 'Rechazado', color: '#ef4444' }
];

const INITIAL_REPORTS = [
  {
    id: 'rep-1',
    title: 'Fuga de agua masiva en Av. Central',
    description: 'Hay una tubería rota que está inundando la acera frente al supermercado. Se están desperdiciando cientos de litros de agua potable.',
    category: 'agua',
    location: 'Av. Central, entre Calle 4 y 6, frente al Súper Más',
    priority: 'high',
    status: 'assigned',
    assignedTo: 'campo@municipal.go.cr',
    citizenEmail: 'vecino.preocupado@gmail.com',
    createdAt: '2026-05-24T10:30:00Z',
    notes: 'Asignado prioritariamente para reparación urgente.',
    coordinates: { x: 35, y: 48 }, // Coordinates relative to our custom interactive map grid (%)
    images: [],
    history: [
      { date: '2026-05-24T10:30:00Z', status: 'received', note: 'Reporte registrado por ciudadano' },
      { date: '2026-05-24T14:00:00Z', status: 'assigned', note: 'Asignado a Carlos Mendoza para inspección' }
    ]
  },
  {
    id: 'rep-2',
    title: 'Lámpara de poste parpadea constantemente',
    description: 'La luminaria pública número LP-452 se apaga y enciende constantemente por las noches, dejando la esquina a oscuras a ratos.',
    category: 'alumbrado',
    location: 'Calle Los Almendros, Esquina con Av. 12',
    priority: 'low',
    status: 'received',
    citizenEmail: 'maria.rodriguez@gmail.com',
    createdAt: '2026-05-25T07:15:00Z',
    coordinates: { x: 62, y: 28 },
    images: [],
    history: [
      { date: '2026-05-25T07:15:00Z', status: 'received', note: 'Reporte registrado por ciudadano' }
    ]
  }
];

// Inicializar localStorage si no existen datos
export const initStorage = () => {
  if (!localStorage.getItem('rc_users')) {
    localStorage.setItem('rc_users', JSON.stringify(DEFAULT_USERS));
  }
  if (!localStorage.getItem('rc_reports')) {
    localStorage.setItem('rc_reports', JSON.stringify(INITIAL_REPORTS));
  }
};

// Obtener usuarios
export const getUsers = () => {
  initStorage();
  return JSON.parse(localStorage.getItem('rc_users'));
};

// Guardar nuevo usuario (Ciudadano)
export const saveUser = (user) => {
  const users = getUsers();
  if (users.find(u => u.email.toLowerCase() === user.email.toLowerCase())) {
    throw new Error('El correo electrónico ya está registrado.');
  }
  users.push(user);
  localStorage.setItem('rc_users', JSON.stringify(users));
  return user;
};

// Obtener reportes
export const getReports = () => {
  initStorage();
  return JSON.parse(localStorage.getItem('rc_reports'));
};

// Crear nuevo reporte
export const createReport = (report) => {
  const reports = getReports();
  const newReport = {
    id: `rep-${Date.now()}`,
    createdAt: new Date().toISOString(),
    status: 'received',
    history: [
      { date: new Date().toISOString(), status: 'received', note: 'Reporte creado' }
    ],
    ...report
  };
  reports.unshift(newReport);
  localStorage.setItem('rc_reports', JSON.stringify(reports));
  return newReport;
};

// Asignar reporte a personal de campo
export const assignReport = (reportId, staffEmail, estimatedDate, reassignReason = '') => {
  const reports = getReports();
  const index = reports.findIndex(r => r.id === reportId);
  if (index !== -1) {
    const report = reports[index];
    const previousAssignee = report.assignedTo;
    const isReassignment = previousAssignee && previousAssignee.toLowerCase() !== staffEmail.toLowerCase();
    
    report.status = 'assigned';
    report.assignedTo = staffEmail;
    report.estimatedDate = estimatedDate || '';
    
    if (isReassignment) {
      report.history.push({
        date: new Date().toISOString(),
        status: 'assigned',
        note: `Reasignado de ${previousAssignee} a ${staffEmail}. Motivo: ${reassignReason}`
      });
      
      // Notificar al operario anterior
      createNotificationForUser(previousAssignee, reportId, `El reporte "${report.title}" que tenías asignado fue reasignado a otro operario. Motivo: ${reassignReason}`);
    } else {
      report.history.push({
        date: new Date().toISOString(),
        status: 'assigned',
        note: `Asignado a personal de campo (${staffEmail}). Fecha estimada: ${estimatedDate}`
      });
    }

    localStorage.setItem('rc_reports', JSON.stringify(reports));
    
    // Notificar al nuevo operario
    createNotificationForUser(staffEmail, reportId, `Se te ha asignado el reporte "${report.title}". Fecha estimada: ${estimatedDate}`);

    // Notificar al ciudadano
    createNotification(reportId, 'assigned', `Asignado a personal de campo (${staffEmail}). Fecha estimada: ${estimatedDate}`);

    return report;
  }
  throw new Error('Reporte no encontrado');
};

// Actualizar estado del reporte
export const updateReportStatus = (reportId, newStatus, note = '') => {
  const reports = getReports();
  const index = reports.findIndex(r => r.id === reportId);
  if (index !== -1) {
    reports[index].status = newStatus;
    if (note) {
      reports[index].notes = note;
    }
    reports[index].history.push({
      date: new Date().toISOString(),
      status: newStatus,
      note: note || `Estado actualizado a ${newStatus}`
    });
    localStorage.setItem('rc_reports', JSON.stringify(reports));
    
    // Notificar al ciudadano
    createNotification(reportId, newStatus, note);

    return reports[index];
  }
  throw new Error('Reporte no encontrado');
};

// Actualizar datos del perfil del usuario (ej. notificaciones)
export const updateUserProfile = (email, fields) => {
  const users = getUsers();
  const index = users.findIndex(u => u.email.toLowerCase() === email.toLowerCase());
  if (index !== -1) {
    users[index] = { ...users[index], ...fields };
    localStorage.setItem('rc_users', JSON.stringify(users));
    
    // Sincronizar sesión activa si corresponde
    const savedUser = sessionStorage.getItem('rc_session');
    if (savedUser) {
      const parsed = JSON.parse(savedUser);
      if (parsed.email.toLowerCase() === email.toLowerCase()) {
        sessionStorage.setItem('rc_session', JSON.stringify(users[index]));
      }
    }
    return users[index];
  }
  throw new Error('Usuario no encontrado');
};

// Crear notificación de cambio de estado
export const createNotification = (reportId, newStatus, note = '') => {
  const reports = getReports();
  const report = reports.find(r => r.id === reportId);
  if (!report) return;

  const users = getUsers();
  const citizen = users.find(u => u.email.toLowerCase() === report.citizenEmail.toLowerCase());
  
  // Si las notificaciones están desactivadas en su perfil, no creamos la alerta
  if (citizen && citizen.notificationsEnabled === false) {
    return;
  }

  const notifications = JSON.parse(localStorage.getItem('rc_notifications') || '[]');
  
  const statusObj = STATUSES.find(s => s.value === newStatus) || { label: newStatus };
  
  const newNotif = {
    id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    citizenEmail: report.citizenEmail,
    reportId: report.id,
    reportTitle: report.title,
    newStatus: statusObj.label,
    note: note,
    date: new Date().toISOString(),
    read: false
  };

  notifications.unshift(newNotif);
  localStorage.setItem('rc_notifications', JSON.stringify(notifications));
};

// Obtener notificaciones para un ciudadano
export const getNotifications = (email) => {
  const all = JSON.parse(localStorage.getItem('rc_notifications') || '[]');
  return all.filter(n => n.citizenEmail.toLowerCase() === email.toLowerCase());
};

// Marcar notificación como leída
export const markNotificationRead = (notifId) => {
  const all = JSON.parse(localStorage.getItem('rc_notifications') || '[]');
  const index = all.findIndex(n => n.id === notifId);
  if (index !== -1) {
    all[index].read = true;
    localStorage.setItem('rc_notifications', JSON.stringify(all));
  }
};

// Marcar todas las notificaciones como leídas
export const markAllNotificationsRead = (email) => {
  const all = JSON.parse(localStorage.getItem('rc_notifications') || '[]');
  all.forEach(n => {
    if (n.citizenEmail.toLowerCase() === email.toLowerCase()) {
      n.read = true;
    }
  });
  localStorage.setItem('rc_notifications', JSON.stringify(all));
};

// Cerrar un reporte por parte de la autoridad
export const closeReport = (reportId, closureComment, closureImage) => {
  const reports = getReports();
  const index = reports.findIndex(r => r.id === reportId);
  if (index !== -1) {
    reports[index].status = 'closed';
    reports[index].closureComment = closureComment || '';
    reports[index].closureImage = closureImage || null;
    reports[index].history.push({
      date: new Date().toISOString(),
      status: 'closed',
      note: closureComment ? `Caso Cerrado: ${closureComment}` : 'Caso Cerrado por la Autoridad Municipal'
    });
    localStorage.setItem('rc_reports', JSON.stringify(reports));
    
    // Notificar al ciudadano
    createNotification(reportId, 'closed', closureComment);

    return reports[index];
  }
  throw new Error('Reporte no encontrado');
};

// Crear notificación general para cualquier usuario (Ciudadano u Operario)
export const createNotificationForUser = (email, reportId, message) => {
  const users = getUsers();
  const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
  
  if (user && user.notificationsEnabled === false) {
    return;
  }

  const notifications = JSON.parse(localStorage.getItem('rc_notifications') || '[]');
  
  const newNotif = {
    id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    citizenEmail: email,
    reportId: reportId,
    reportTitle: message,
    newStatus: 'Notificación',
    note: '',
    date: new Date().toISOString(),
    read: false
  };

  notifications.unshift(newNotif);
  localStorage.setItem('rc_notifications', JSON.stringify(notifications));
};

// Rechazar un reporte por parte de la autoridad
export const rejectReport = (reportId, rejectReason) => {
  const reports = getReports();
  const index = reports.findIndex(r => r.id === reportId);
  if (index !== -1) {
    reports[index].status = 'rejected';
    reports[index].rejectReason = rejectReason || '';
    reports[index].history.push({
      date: new Date().toISOString(),
      status: 'rejected',
      note: `Reporte rechazado por la autoridad. Motivo: ${rejectReason}`
    });
    localStorage.setItem('rc_reports', JSON.stringify(reports));
    
    // Notificar al ciudadano
    createNotification(reportId, 'rejected', `Reporte rechazado. Motivo: ${rejectReason}`);

    return reports[index];
  }
  throw new Error('Reporte no encontrado');
};

// Actualización manual de estado por la autoridad con comentario
export const updateReportStatusByAuthority = (reportId, newStatus, comment = '') => {
  const reports = getReports();
  const index = reports.findIndex(r => r.id === reportId);
  if (index !== -1) {
    reports[index].status = newStatus;
    reports[index].history.push({
      date: new Date().toISOString(),
      status: newStatus,
      note: comment || `Estado cambiado por la autoridad municipal`
    });
    localStorage.setItem('rc_reports', JSON.stringify(reports));
    
    // Notificar al ciudadano
    createNotification(reportId, newStatus, comment);

    // Si está asignado y se actualiza, notificar al operario
    if (reports[index].assignedTo) {
      createNotificationForUser(reports[index].assignedTo, reportId, `El estado del reporte asignado "${reports[index].title}" cambió a ${newStatus}.`);
    }

    return reports[index];
  }
  throw new Error('Reporte no encontrado');
};
