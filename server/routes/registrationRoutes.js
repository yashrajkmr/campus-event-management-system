const express = require('express');
const router = express.Router();
const {
  registerForEvent,
  getMyRegistrations,
  cancelRegistration,
  checkInAttendee,
} = require('../controllers/registrationController');
const { authenticateJWT, authorizeRoles } = require('../middleware/authMiddleware');

router.use(authenticateJWT); // All registration routes require authentication

// Static routes MUST come before parameterized :eventId/:id routes
router.post('/verify-pass', authorizeRoles('admin'), checkInAttendee);
router.get('/my', getMyRegistrations);

// Parameterized reservation routes
router.post('/:eventId', registerForEvent);
router.post('/:eventId/book', registerForEvent);
router.delete('/:id', cancelRegistration);
router.post('/:id/cancel', cancelRegistration);

// Check-in by registration ID
router.patch('/:id/checkin', authorizeRoles('admin'), checkInAttendee);

module.exports = router;
