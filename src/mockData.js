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
  },
  {
    email: 'ciudadano@ejemplo.com',
    password: 'ciudadano123',
    name: 'Usuario PoC (Ciudadano)',
    role: 'ciudadano'
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
    location: 'San José, San José, Carmen - Av. Central, entre Calle 4 y 6, frente al Súper Más',
    priority: 'high',
    status: 'assigned',
    assignedTo: 'campo@municipal.go.cr',
    citizenEmail: 'vecino.preocupado@gmail.com',
    createdAt: '2026-06-10T10:30:00Z',
    notes: 'Asignado prioritariamente para reparación urgente.',
    coordinates: { x: 35, y: 48, lat: 9.9364, lng: -84.1045 },
    images: [],
    history: [
      { date: '2026-06-10T10:30:00Z', status: 'received', note: 'Reporte registrado por ciudadano' },
      { date: '2026-06-10T14:00:00Z', status: 'assigned', note: 'Asignado a Carlos Mendoza para inspección' }
    ]
  },
  {
    id: 'rep-2',
    title: 'Lámpara de poste parpadea constantemente',
    description: 'La luminaria pública número LP-452 se apaga y enciende constantemente por las noches, dejando la esquina a oscuras a ratos.',
    category: 'alumbrado',
    location: 'San José, San José, Merced - Calle Los Almendros, Esquina con Av. 12',
    priority: 'low',
    status: 'received',
    citizenEmail: 'maria.rodriguez@gmail.com',
    createdAt: '2026-06-11T07:15:00Z',
    coordinates: { x: 62, y: 28, lat: 9.9504, lng: -84.0694 },
    images: [],
    history: [
      { date: '2026-06-11T07:15:00Z', status: 'received', note: 'Reporte registrado por ciudadano' }
    ]
  },
  {
    id: 'rep-3',
    title: 'Bache profundo en vía principal de Heredia',
    description: 'Hay un cráter de gran tamaño en media calle que está provocando daños en los aros de los vehículos y maniobras evasivas peligrosas.',
    category: 'vias',
    location: 'Heredia, Heredia, Heredia Centro - Frente a la entrada del Polideportivo, carril izquierdo',
    priority: 'high',
    status: 'assigned',
    assignedTo: 'campo@municipal.go.cr',
    citizenEmail: 'juan.perez@ejemplo.com',
    createdAt: '2026-06-12T14:20:00Z',
    notes: 'Programada inspección de bacheo.',
    coordinates: { x: 24, y: 0, lat: 9.9994, lng: -84.1182 },
    images: [],
    history: [
      { date: '2026-06-12T14:20:00Z', status: 'received', note: 'Reporte registrado por ciudadano' },
      { date: '2026-06-12T16:00:00Z', status: 'assigned', note: 'Asignado a Carlos Mendoza' }
    ]
  },
  {
    id: 'rep-4',
    title: 'Alcantarilla sin tapa en la acera',
    description: 'Falta la rejilla metálica de la alcantarilla en la acera peatonal, lo cual representa una trampa peligrosa para peatones y niños por la noche.',
    category: 'agua',
    location: 'Heredia, Heredia, Heredia Centro - Calle 4, 50 metros norte del Parque Central',
    priority: 'high',
    status: 'received',
    citizenEmail: 'ciudadano.activo@gmail.com',
    createdAt: '2026-06-12T18:45:00Z',
    coordinates: { x: 27, y: 0, lat: 10.0012, lng: -84.1145 },
    images: [],
    history: [
      { date: '2026-06-12T18:45:00Z', status: 'received', note: 'Reporte registrado por ciudadano' }
    ]
  },
  {
    id: 'rep-5',
    title: 'Acumulación de basura en parque infantil',
    description: 'Han dejado gran cantidad de bolsas de basura y desechos de jardín en el área de juegos, obstruyendo el paso y atrayendo plagas.',
    category: 'aseo',
    location: 'Heredia, Heredia, Mercedes - Parque Infantil de Mercedes Norte, sector oeste',
    priority: 'medium',
    status: 'received',
    citizenEmail: 'vecina.mercedes@gmail.com',
    createdAt: '2026-06-13T09:10:00Z',
    coordinates: { x: 17, y: 0, lat: 10.0064, lng: -84.1282 },
    images: [],
    history: [
      { date: '2026-06-13T09:10:00Z', status: 'received', note: 'Reporte registrado por ciudadano' }
    ]
  },
  {
    id: 'rep-6',
    title: 'Semáforo dañado causa colisiones',
    description: 'El semáforo peatonal e intersectorial se encuentra completamente apagado en una intersección con alta fluidez de vehículos.',
    category: 'otros',
    location: 'Alajuela, Alajuela, Alajuela Centro - Cruce del Parque de la Agonía',
    priority: 'high',
    status: 'in_progress',
    assignedTo: 'campo@municipal.go.cr',
    citizenEmail: 'alajuelense.preocupado@gmail.com',
    createdAt: '2026-06-11T12:00:00Z',
    notes: 'Equipo técnico en camino.',
    coordinates: { x: 0, y: 0, lat: 10.0175, lng: -84.2132 },
    images: [],
    history: [
      { date: '2026-06-11T12:00:00Z', status: 'received', note: 'Reporte registrado por ciudadano' },
      { date: '2026-06-11T13:30:00Z', status: 'assigned', note: 'Asignado a Carlos Mendoza' },
      { date: '2026-06-11T14:00:00Z', status: 'in_progress', note: 'Inspección de cableado y fusibles iniciada' }
    ]
  },
  {
    id: 'rep-7',
    title: 'Fuga de agua potable en acera principal',
    description: 'Brota agua limpia constantemente desde la base del medidor de una propiedad comercial, inundando el paso de peatones.',
    category: 'agua',
    location: 'Alajuela, Alajuela, Alajuela Centro - 100 metros oeste de la Catedral de Alajuela',
    priority: 'medium',
    status: 'received',
    citizenEmail: 'comerciante.centro@gmail.com',
    createdAt: '2026-06-13T08:00:00Z',
    coordinates: { x: 0, y: 0, lat: 10.0192, lng: -84.2085 },
    images: [],
    history: [
      { date: '2026-06-13T08:00:00Z', status: 'received', note: 'Reporte registrado por ciudadano' }
    ]
  },
  {
    id: 'rep-8',
    title: 'Escombros bloquean paso peatonal',
    description: 'Dejaron materiales de construcción (piedra, arena) sobre la acera y parte del carril derecho de circulación sin ninguna señalización.',
    category: 'aseo',
    location: 'Cartago, Cartago, Oriental - Calle 3, entre Avenidas 2 y 4',
    priority: 'medium',
    status: 'received',
    citizenEmail: 'cartagines.peaton@gmail.com',
    createdAt: '2026-06-12T10:15:00Z',
    coordinates: { x: 100, y: 100, lat: 9.8654, lng: -83.9192 },
    images: [],
    history: [
      { date: '2026-06-12T10:15:00Z', status: 'received', note: 'Reporte registrado por ciudadano' }
    ]
  },
  {
    id: 'rep-9',
    title: 'Poste de luz dañado por choque',
    description: 'Un camión golpeó la base del poste del alumbrado público. El poste se encuentra visiblemente agrietado y la lámpara superior se desprendió.',
    category: 'alumbrado',
    location: 'Cartago, Cartago, Oriental - Frente al costado sur de la Basílica de Los Ángeles',
    priority: 'high',
    status: 'assigned',
    assignedTo: 'campo@municipal.go.cr',
    citizenEmail: 'parroco.angeles@gmail.com',
    createdAt: '2026-06-13T06:30:00Z',
    notes: 'Coordinado con el departamento de obras públicas municipales.',
    coordinates: { x: 100, y: 100, lat: 9.8631, lng: -83.9154 },
    images: [],
    history: [
      { date: '2026-06-13T06:30:00Z', status: 'received', note: 'Reporte registrado por ciudadano' },
      { date: '2026-06-13T08:00:00Z', status: 'assigned', note: 'Asignado a Carlos Mendoza para delimitación de área' }
    ]
  },
  {
    id: 'rep-10',
    title: 'Ramas de árbol obstruyen cables eléctricos',
    description: 'Las ramas de un gran árbol de ciprés en propiedad pública están en contacto directo con las líneas de alta tensión, provocando chispas con el viento.',
    category: 'parques',
    location: 'San José, Escazú, San Rafael - Residencial El Cortijo, parque de la etapa 2',
    priority: 'high',
    status: 'received',
    citizenEmail: 'vecino.escazu@gmail.com',
    createdAt: '2026-06-13T11:00:00Z',
    coordinates: { x: 5, y: 69, lat: 9.9214, lng: -84.1432 },
    images: [],
    history: [
      { date: '2026-06-13T11:00:00Z', status: 'received', note: 'Reporte registrado por ciudadano' }
    ]
  },
  {
    id: 'rep-11',
    title: 'Basurero municipal desbordado',
    description: 'El recolector público de basura lleva días lleno y la gente ha empezado a apilar basura a su alrededor, bloqueando la acera peatonal.',
    category: 'aseo',
    location: 'San José, San José, Merced - Frente a la Estación de Ferrocarril al Pacífico',
    priority: 'low',
    status: 'resolved',
    assignedTo: 'campo@municipal.go.cr',
    citizenEmail: 'peaton.chepe@gmail.com',
    createdAt: '2026-06-11T15:45:00Z',
    notes: 'Limpieza y vaciado completado.',
    coordinates: { x: 49, y: 45, lat: 9.9388, lng: -84.0864 },
    images: [],
    resolutionComment: 'Se procedió al vaciado del contenedor y la limpieza del perímetro.',
    resolutionImages: [],
    history: [
      { date: '2026-06-11T15:45:00Z', status: 'received', note: 'Reporte registrado por ciudadano' },
      { date: '2026-06-11T17:00:00Z', status: 'assigned', note: 'Asignado a Carlos Mendoza' },
      { date: '2026-06-12T10:00:00Z', status: 'resolved', note: 'Marcado como Resuelto por el operario. Comentario: Se procedió al vaciado del contenedor y la limpieza del perímetro.' }
    ]
  },
  {
    id: 'rep-12',
    title: 'Hundimiento severo en la calzada',
    description: 'Un tramo de asfalto de aproximadamente 2 metros de diámetro se hundió tras las últimas lluvias. El hueco es muy hondo y puede causar accidentes trágicos.',
    category: 'vias',
    location: 'Heredia, Barva, Barva Centro - Calle Principal hacia San Pedro de Barva',
    priority: 'high',
    status: 'received',
    citizenEmail: 'barveno.alerta@gmail.com',
    createdAt: '2026-06-13T05:15:00Z',
    coordinates: { x: 22, y: 0, lat: 10.0162, lng: -84.1215 },
    images: [],
    history: [
      { date: '2026-06-13T05:15:00Z', status: 'received', note: 'Reporte registrado por ciudadano' }
    ]
  }
];

// Inicializar localStorage si no existen datos
export const initStorage = () => {
  if (!localStorage.getItem('rc_users')) {
    localStorage.setItem('rc_users', JSON.stringify(DEFAULT_USERS));
  } else {
    // Asegurar que los usuarios por defecto (incluido el nuevo usuario PoC) existan en localStorage
    try {
      const users = JSON.parse(localStorage.getItem('rc_users'));
      let updated = false;
      DEFAULT_USERS.forEach(defUser => {
        if (!users.some(u => u.email.toLowerCase() === defUser.email.toLowerCase())) {
          users.push(defUser);
          updated = true;
        }
      });
      if (updated) {
        localStorage.setItem('rc_users', JSON.stringify(users));
      }
    } catch (e) {
      console.error('Error updating default users:', e);
    }
  }
  if (!localStorage.getItem('rc_reports')) {
    localStorage.setItem('rc_reports', JSON.stringify(INITIAL_REPORTS));
  } else {
    try {
      const reports = JSON.parse(localStorage.getItem('rc_reports')) || [];
      let updated = false;
      INITIAL_REPORTS.forEach(defReport => {
        if (!reports.some(r => r.id === defReport.id)) {
          reports.push(defReport);
          updated = true;
        }
      });
      if (updated) {
        localStorage.setItem('rc_reports', JSON.stringify(reports));
      }
    } catch (e) {
      console.error('Error updating default reports:', e);
    }
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
    if (report.status === 'rejected') {
      throw new Error('Un reporte rechazado no puede ser asignado al personal de campo.');
    }
    if (report.status === 'closed') {
      throw new Error('Un reporte cerrado no puede ser asignado al personal de campo.');
    }
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

    // Limpiar alertas de inactividad ya que se actualizó el reporte
    clearInactivityAlerts(reportId);

    return report;
  }
  throw new Error('Reporte no encontrado');
};

// Actualizar estado del reporte
export const updateReportStatus = (reportId, newStatus, note = '') => {
  const reports = getReports();
  const index = reports.findIndex(r => r.id === reportId);
  if (index !== -1) {
    if (reports[index].status === 'closed' || reports[index].status === 'rejected') {
      throw new Error('Un reporte cerrado o rechazado no puede ser modificado.');
    }
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

    // Limpiar alertas de inactividad ya que se actualizó el reporte
    clearInactivityAlerts(reportId);

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
    if (reports[index].status === 'closed' || reports[index].status === 'rejected') {
      throw new Error('Un reporte cerrado o rechazado no puede ser modificado.');
    }
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

    // Limpiar alertas de inactividad
    clearInactivityAlerts(reportId);

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

  const reports = getReports();
  const report = reports.find(r => r.id === reportId);

  const notifications = JSON.parse(localStorage.getItem('rc_notifications') || '[]');
  
  const newNotif = {
    id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    citizenEmail: email,
    reportId: reportId,
    reportTitle: message,
    newStatus: 'Notificación',
    note: '',
    date: new Date().toISOString(),
    read: false,
    reportDetails: report ? {
      category: report.category,
      description: report.description,
      location: report.location,
      imagesCount: report.images ? report.images.length : 0,
      images: report.images || [],
      estimatedDate: report.estimatedDate || ''
    } : null
  };

  notifications.unshift(newNotif);
  localStorage.setItem('rc_notifications', JSON.stringify(notifications));
};

// Rechazar un reporte por parte de la autoridad
export const rejectReport = (reportId, rejectReason) => {
  const reports = getReports();
  const index = reports.findIndex(r => r.id === reportId);
  if (index !== -1) {
    if (reports[index].status === 'closed' || reports[index].status === 'rejected') {
      throw new Error('Un reporte cerrado o rechazado no puede ser modificado.');
    }
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

    // Limpiar alertas de inactividad
    clearInactivityAlerts(reportId);

    return reports[index];
  }
  throw new Error('Reporte no encontrado');
};

// Actualización manual de estado por la autoridad con comentario
export const updateReportStatusByAuthority = (reportId, newStatus, comment = '') => {
  const reports = getReports();
  const index = reports.findIndex(r => r.id === reportId);
  if (index !== -1) {
    if (reports[index].status === 'closed' || reports[index].status === 'rejected') {
      throw new Error('Un reporte cerrado o rechazado no puede ser modificado.');
    }
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

    // Limpiar alertas de inactividad
    clearInactivityAlerts(reportId);

    return reports[index];
  }
  throw new Error('Reporte no encontrado');
};

// Actualizar la prioridad del reporte por la autoridad municipal
export const updateReportPriority = (reportId, newPriority) => {
  const reports = getReports();
  const index = reports.findIndex(r => r.id === reportId);
  if (index !== -1) {
    if (reports[index].status === 'closed' || reports[index].status === 'rejected') {
      throw new Error('Un reporte cerrado o rechazado no puede ser modificado.');
    }
    const oldPriorityObj = PRIORITIES.find(p => p.value === reports[index].priority);
    const newPriorityObj = PRIORITIES.find(p => p.value === newPriority);
    const oldLabel = oldPriorityObj ? oldPriorityObj.label : reports[index].priority;
    const newLabel = newPriorityObj ? newPriorityObj.label : newPriority;
    
    reports[index].priority = newPriority;
    reports[index].history.push({
      date: new Date().toISOString(),
      status: reports[index].status,
      note: `Prioridad cambiada de "${oldLabel}" a "${newLabel}" por la autoridad municipal`
    });
    localStorage.setItem('rc_reports', JSON.stringify(reports));
    
    // Notificar al ciudadano
    createNotification(reportId, reports[index].status, `La urgencia del reporte fue actualizada a: ${newLabel}`);
    
    // Si está asignado y se actualiza, notificar al operario
    if (reports[index].assignedTo) {
      createNotificationForUser(reports[index].assignedTo, reportId, `La prioridad del reporte asignado "${reports[index].title}" fue cambiada a: ${newLabel}`);
    }
    
    return reports[index];
  }
  throw new Error('Reporte no encontrado');
};


// Limpiar alertas de inactividad de un reporte específico
export const clearInactivityAlerts = (reportId) => {
  const alerts = JSON.parse(localStorage.getItem('rc_authority_alerts') || '[]');
  const filtered = alerts.filter(a => a.reportId !== reportId);
  localStorage.setItem('rc_authority_alerts', JSON.stringify(filtered));
};

// Activar o desactivar alertas para un reporte específico
export const disableReportAlerts = (reportId, disabledValue) => {
  const reports = getReports();
  const index = reports.findIndex(r => r.id === reportId);
  if (index !== -1) {
    reports[index].alertDisabled = disabledValue;
    localStorage.setItem('rc_reports', JSON.stringify(reports));
    
    if (disabledValue) {
      clearInactivityAlerts(reportId);
    }
    return reports[index];
  }
  throw new Error('Reporte no encontrado');
};

// Obtener alertas de la autoridad
export const getAuthorityAlerts = () => {
  return JSON.parse(localStorage.getItem('rc_authority_alerts') || '[]');
};

// Marcar alerta como leída
export const markAuthorityAlertRead = (alertId) => {
  const alerts = JSON.parse(localStorage.getItem('rc_authority_alerts') || '[]');
  const index = alerts.findIndex(a => a.id === alertId);
  if (index !== -1) {
    alerts[index].read = true;
    localStorage.setItem('rc_authority_alerts', JSON.stringify(alerts));
  }
};

// Marcar todas las alertas como leídas
export const markAllAuthorityAlertsRead = () => {
  const alerts = JSON.parse(localStorage.getItem('rc_authority_alerts') || '[]');
  alerts.forEach(a => {
    a.read = true;
  });
  localStorage.setItem('rc_authority_alerts', JSON.stringify(alerts));
};

// Crear alerta/notificación específica para la autoridad
export const createAuthorityNotification = (reportId, type, message) => {
  const reports = getReports();
  const report = reports.find(r => r.id === reportId);
  const alerts = JSON.parse(localStorage.getItem('rc_authority_alerts') || '[]');
  const now = new Date();
  
  const categoryObj = CATEGORIES.find(c => c.id === (report ? report.category : ''));
  const categoryLabel = categoryObj ? categoryObj.label : (report ? report.category : '');
  const zone = report ? (report.location || 'Zona no especificada') : '';

  const newAlert = {
    id: `alert-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    reportId: reportId,
    reportTitle: report ? report.title : 'Notificación',
    category: categoryLabel,
    zone: zone,
    message: message,
    type: type, // 'resolved' o 'cannot_resolve'
    date: now.toISOString(),
    read: false
  };

  alerts.unshift(newAlert);
  localStorage.setItem('rc_authority_alerts', JSON.stringify(alerts));
};

// Registrar resolución de un problema por el personal de campo (operario)
export const resolveReportByFieldStaff = (reportId, comment, resolutionImages) => {
  const reports = getReports();
  const index = reports.findIndex(r => r.id === reportId);
  if (index !== -1) {
    const report = reports[index];
    if (report.status === 'closed' || report.status === 'rejected') {
      throw new Error('Un reporte cerrado o rechazado no puede ser modificado.');
    }
    
    report.status = 'resolved';
    report.resolutionComment = comment;
    report.resolutionImages = resolutionImages || [];
    report.resolutionDate = new Date().toISOString();
    
    report.history.push({
      date: new Date().toISOString(),
      status: 'resolved',
      note: `Marcado como Resuelto por el operario. Comentario: ${comment}`,
      images: resolutionImages || []
    });
    
    localStorage.setItem('rc_reports', JSON.stringify(reports));
    
    // Notificar al ciudadano
    createNotification(reportId, 'resolved', comment);
    
    // Notificar a la autoridad
    createAuthorityNotification(
      reportId, 
      'resolved', 
      `El reporte "${report.title}" fue marcado como Resuelto por el operario. Comentario: "${comment}"`
    );
    
    // Limpiar alertas de inactividad
    clearInactivityAlerts(reportId);
    
    return report;
  }
  throw new Error('Reporte no encontrado');
};

// Registrar imposibilidad de resolución por el personal de campo (operario)
export const reportImpossibilityByFieldStaff = (reportId, reason) => {
  const reports = getReports();
  const index = reports.findIndex(r => r.id === reportId);
  if (index !== -1) {
    const report = reports[index];
    if (report.status === 'closed' || report.status === 'rejected') {
      throw new Error('Un reporte cerrado o rechazado no puede ser modificado.');
    }
    
    // El estado del reporte permanece en En gestión (su estado actual)
    report.history.push({
      date: new Date().toISOString(),
      status: report.status,
      note: `Imposibilidad de resolución reportada. Motivo: ${reason}`
    });
    
    localStorage.setItem('rc_reports', JSON.stringify(reports));
    
    // Notificar a la autoridad
    createAuthorityNotification(
      reportId, 
      'cannot_resolve', 
      `No se pudo resolver el reporte "${report.title}". Motivo: "${reason}"`
    );
    
    // Limpiar alertas de inactividad al haber novedades
    clearInactivityAlerts(reportId);
    
    return report;
  }
  throw new Error('Reporte no encontrado');
};

// Devolver reporte al personal de campo por parte de la autoridad
export const returnReportToFieldStaff = (reportId, returnReason) => {
  const reports = getReports();
  const index = reports.findIndex(r => r.id === reportId);
  if (index !== -1) {
    const report = reports[index];
    if (report.status === 'closed' || report.status === 'rejected') {
      throw new Error('Un reporte cerrado o rechazado no puede ser modificado.');
    }
    
    report.status = 'assigned'; // Vuelve a asignado (En gestión)
    
    report.history.push({
      date: new Date().toISOString(),
      status: 'assigned',
      note: `Devuelto al personal de campo. Motivo de devolución: ${returnReason}`
    });
    
    localStorage.setItem('rc_reports', JSON.stringify(reports));
    
    // Notificar al operario asignado
    if (report.assignedTo) {
      createNotificationForUser(
        report.assignedTo, 
        reportId, 
        `El reporte "${report.title}" fue devuelto para revisión. Motivo: ${returnReason}`
      );
    }
    
    // Notificar al ciudadano
    createNotification(
      reportId, 
      'assigned', 
      `El reporte vuelve a estar en gestión para corregir observaciones. Motivo: ${returnReason}`
    );
    
    // Limpiar alertas de inactividad
    clearInactivityAlerts(reportId);
    
    return report;
  }
  throw new Error('Reporte no encontrado');
};

// Verificar e inyectar alertas automáticas de inactividad
export const checkAndGenerateInactivityAlerts = () => {
  const reports = getReports();
  const alerts = JSON.parse(localStorage.getItem('rc_authority_alerts') || '[]');
  const now = new Date();
  let updatedAlerts = [...alerts];
  let alertsChanged = false;

  reports.forEach(report => {
    // Si ya está resuelto, cerrado o rechazado, no genera alerta
    if (['resolved', 'closed', 'rejected'].includes(report.status)) {
      return;
    }
    
    // Si tiene alertas desactivadas, no genera alerta
    if (report.alertDisabled) {
      return;
    }

    // Calcular el tiempo transcurrido desde el último evento de historial
    const lastEvent = report.history && report.history.length > 0 
      ? report.history[report.history.length - 1] 
      : { date: report.createdAt };
      
    const lastUpdateDate = new Date(lastEvent.date);
    const diffTime = Math.abs(now - lastUpdateDate);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays > 3) {
      // Verificar si ya existe una alerta activa para este reporte correspondiente a esta misma última actualización de estado
      const hasRecentAlert = updatedAlerts.some(a => a.reportId === report.id && new Date(a.date) >= lastUpdateDate);
      
      if (!hasRecentAlert) {
        const categoryObj = CATEGORIES.find(c => c.id === report.category);
        const categoryLabel = categoryObj ? categoryObj.label : report.category;
        const zone = report.location || 'Zona no especificada';

        const newAlert = {
          id: `alert-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          reportId: report.id,
          reportTitle: report.title,
          category: categoryLabel,
          zone: zone,
          daysElapsed: diffDays,
          date: now.toISOString(),
          type: 'inactivity',
          read: false
        };

        updatedAlerts.unshift(newAlert);
        alertsChanged = true;
      }
    }
  });

  if (alertsChanged) {
    localStorage.setItem('rc_authority_alerts', JSON.stringify(updatedAlerts));
  }
};

