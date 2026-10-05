import axios from 'axios';

const api = axios.create({
  baseURL: '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: attach JWT token if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: handle token expiration or 401s
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      const currentPath = window.location.pathname;
      if (
        !currentPath.includes('/login') &&
        !currentPath.includes('/register') &&
        localStorage.getItem('token')
      ) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.dispatchEvent(new Event('auth-logout'));
      }
    }
    return Promise.reject(error);
  }
);

// API Service Endpoints
export const authService = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getMe: () => api.get('/auth/me'),
};

export const eventService = {
  getEvents: (params) => api.get('/events', { params }),
  getUpcomingEvents: () => api.get('/events/upcoming'),
  getEventById: (id) => api.get(`/events/${id}`),
  getStats: () => api.get('/events/stats'),
  createEvent: (data) => api.post('/events', data),
  updateEvent: (id, data) => api.put(`/events/${id}`, data),
  deleteEvent: (id) => api.delete(`/events/${id}`),
  getEventAttendees: (id) => api.get(`/events/${id}/attendees`),
  bookEvent: (id) => api.post(`/events/${id}/book`),
};

export const registrationService = {
  registerForEvent: (eventId) => api.post(`/events/${eventId}/book`),
  getMyRegistrations: (params) => api.get('/registrations/my', { params }),
  cancelRegistration: (id) => api.delete(`/registrations/${id}`),
  checkInAttendee: (id, passCode) => api.patch(`/registrations/${id}/checkin`, { passCode }),
  verifyPass: (passCode) => api.post('/registrations/verify-pass', { passCode }),
};

export default api;
