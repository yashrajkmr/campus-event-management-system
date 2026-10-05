const express = require('express');
const router = express.Router();
const {
  getEvents,
  getUpcomingEvents,
  getEventById,
  getEventStats,
  createEvent,
  updateEvent,
  deleteEvent,
  getEventAttendees,
  bookEvent,
  cancelEventBooking,
} = require('../controllers/eventController');
const {
  authenticateJWT,
  optionalAuth,
  authorizeRoles,
} = require('../middleware/authMiddleware');

// Public routes & specific endpoints
router.get('/', getEvents);
router.get('/upcoming', getUpcomingEvents);
router.get('/stats', authenticateJWT, authorizeRoles('admin'), getEventStats);
router.get('/:id', optionalAuth, getEventById);
router.get('/:id/attendees', authenticateJWT, authorizeRoles('admin'), getEventAttendees);

// Atomic Reservation & Rollback routes
router.post('/:id/book', authenticateJWT, bookEvent);
router.post('/:id/cancel', authenticateJWT, cancelEventBooking);

// Admin-only modification routes
router.post('/', authenticateJWT, authorizeRoles('admin'), createEvent);
router.put('/:id', authenticateJWT, authorizeRoles('admin'), updateEvent);
router.delete('/:id', authenticateJWT, authorizeRoles('admin'), deleteEvent);

module.exports = router;
