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
  { value: 'pending', label: 'Pendiente', color: '#6b7280' },
  { value: 'assigned', label: 'Asignado', color: '#3b82f6' },
  { value: 'in_progress', label: 'En Progreso', color: '#8b5cf6' },
  { value: 'resolved', label: 'Resuelto', color: '#10b981' }
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
      { date: '2026-05-24T10:30:00Z', status: 'pending', note: 'Reporte registrado por ciudadano' },
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
    status: 'pending',
    citizenEmail: 'maria.rodriguez@gmail.com',
    createdAt: '2026-05-25T07:15:00Z',
    coordinates: { x: 62, y: 28 },
    images: [],
    history: [
      { date: '2026-05-25T07:15:00Z', status: 'pending', note: 'Reporte registrado por ciudadano' }
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
    status: 'pending',
    history: [
      { date: new Date().toISOString(), status: 'pending', note: 'Reporte creado' }
    ],
    ...report
  };
  reports.unshift(newReport);
  localStorage.setItem('rc_reports', JSON.stringify(reports));
  return newReport;
};

// Asignar reporte a personal de campo
export const assignReport = (reportId, staffEmail) => {
  const reports = getReports();
  const index = reports.findIndex(r => r.id === reportId);
  if (index !== -1) {
    reports[index].status = 'assigned';
    reports[index].assignedTo = staffEmail;
    reports[index].history.push({
      date: new Date().toISOString(),
      status: 'assigned',
      note: `Asignado a personal de campo (${staffEmail})`
    });
    localStorage.setItem('rc_reports', JSON.stringify(reports));
    return reports[index];
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
    return reports[index];
  }
  throw new Error('Reporte no encontrado');
};
