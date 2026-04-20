const API_BASE = '/api';

async function request(endpoint, options = {}) {
  const token = localStorage.getItem('token');
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });
  const contentType = res.headers.get('content-type') || '';

  if (res.headers.get('content-type')?.includes('text/csv')) {
    if (!res.ok) throw new Error('Request failed');
    return res;
  }

  let data = null;
  if (contentType.includes('application/json')) {
    data = await res.json();
  }

  if (res.status === 401 && token) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
    throw new Error(data?.message || 'Session expired');
  }

  if (!res.ok) throw new Error(data?.message || 'Request failed');
  return data;
}

const get = (url) => request(url);
const post = (url, body) => request(url, { method: 'POST', body: JSON.stringify(body) });
const put = (url, body) => request(url, { method: 'PUT', body: JSON.stringify(body) });
const del = (url) => request(url, { method: 'DELETE' });
const putParams = (url, params) => {
  const query = new URLSearchParams(params).toString();
  return request(`${url}?${query}`, { method: 'PUT' });
};

export const authApi = {
  login: (body) => post('/auth/login', body),
  refresh: (body) => post('/auth/refresh', body),
};

export const memberApi = {
  getMe: () => get('/members/me'),
  getById: (id) => get(`/members/${id}`),
  register: (body) => post('/members/register', body),
  updateProfile: (body) => put('/members/me', body),
  listAll: () => get('/members'),
};

export const facilityApi = {
  getAll: () => get('/facilities'),
  getById: (id) => get(`/facilities/${id}`),
};

export const classApi = {
  getSchedule: () => get('/classes/schedule'),
};

export const reservationApi = {
  bookClass: (body) => post('/reservations/class', body),
  bookCourt: (body) => post('/reservations/court', body),
  getMine: () => get('/reservations/me'),
  cancel: (id) => del(`/reservations/${id}`),
};

export const trainerApi = {
  getAll: () => get('/trainers'),
  getById: (id) => get(`/trainers/${id}`),
  getMyProfile: () => get('/trainer/profile'),
  updateProfile: (body) => put('/trainer/profile', body),
  addAvailability: (body) => post('/trainer/availability', body),
  removeAvailability: (id) => del(`/trainer/availability/${id}`),
  getSchedule: () => get('/trainer/schedule'),
  getAttendees: (id) => get(`/trainer/classes/${id}/attendees`),
  getPTSessions: () => get('/trainer/pt-sessions'),
  getPendingPT: () => get('/trainer/pt-sessions/pending'),
};

export const ptApi = {
  book: (body) => post('/pt-sessions', body),
  getMine: () => get('/pt-sessions/me'),
  updateStatus: (id, status) => putParams(`/pt-sessions/${id}/status`, { status }),
};

export const paymentApi = {
  createOrder: (body) => post('/payments/create-order', body),
  verify: (body) => post('/payments/verify', body),
  getHistory: () => get('/payments/history'),
  getInvoices: () => get('/payments/invoices'),
  getInvoice: (num) => get(`/payments/invoices/${num}`),
};

export const accessApi = {
  scan: (body) => post('/access/scan', body),
};

export const adminApi = {
  createClass: (body) => post('/admin/classes', body),
  updateCapacity: (id, capacity) => putParams(`/admin/facilities/${id}/capacity`, { capacity }),
  updateStatus: (id, open) => putParams(`/admin/facilities/${id}/status`, { open }),
  getDashboard: () => get('/admin/analytics/dashboard'),
  getRevenue: () => get('/admin/analytics/revenue'),
  getMemberStats: () => get('/admin/analytics/members'),
  getFacilityStats: () => get('/admin/analytics/facilities'),
  getPeakHours: () => get('/admin/analytics/peak-hours'),
  bulkAction: (body) => post('/admin/bulk/members', body),
  reportMembers: () => request('/admin/reports/members'),
  reportPayments: (from, to) => request(`/admin/reports/payments?from=${from}&to=${to}`),
  reportRevenue: () => request('/admin/reports/revenue-summary'),
};
