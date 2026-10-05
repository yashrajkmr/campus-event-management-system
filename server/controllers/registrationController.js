const crypto = require('crypto');
const mongoose = require('mongoose');
const Registration = require('../models/Registration');
const Event = require('../models/Event');

// Cryptographically secure pass code generator (e.g. CHUB-2026-X9A7K2)
const generatePassCode = () => {
  const randomHex = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `CHUB-2026-${randomHex}`;
};

// @desc    Atomic Concurrency-Safe Reservation
// @route   POST /api/v1/events/:id/book OR POST /api/events/:id/book OR POST /api/registrations/:eventId
// @access  Private (Student & Admin)
const registerForEvent = async (req, res, next) => {
  try {
    const eventId = req.params.eventId || req.params.id;
    const userId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      return res.status(404).json({
        success: false,
        message: 'Invalid Event ID',
      });
    }

    // Step 1: Pre-check if user already holds an active or checked-in ticket
    const existingRegistration = await Registration.findOne({
      event: eventId,
      user: userId,
      status: { $in: ['ACTIVE', 'CHECKED_IN', 'Registered'] },
    });

    if (existingRegistration) {
      return res.status(400).json({
        success: false,
        message: 'You already hold an active pass for this event',
        passCode: existingRegistration.passCode,
        registration: existingRegistration,
      });
    }

    // Step 2: Atomic conditional decrement with capacity guard
    // Uses aggregation pipeline in findOneAndUpdate to guarantee single-step atomic decrement
    // and instant transition to 'Registration Closed' the exact millisecond availableSeats hits 0.
    const updatedEvent = await Event.findOneAndUpdate(
      {
        _id: eventId,
        availableSeats: { $gte: 1 },
        status: { $in: ['Registration Open', 'Published'] },
      },
      [
        {
          $set: {
            availableSeats: { $subtract: ['$availableSeats', 1] },
            status: {
              $cond: {
                if: { $lte: [{ $subtract: ['$availableSeats', 1] }, 0] },
                then: 'Registration Closed',
                else: '$status',
              },
            },
          },
        },
      ],
      { new: true }
    );

    if (!updatedEvent) {
      // Determine if event exists to provide high-precision 409 Conflict vs 404
      const checkEvent = await Event.findById(eventId);
      if (!checkEvent) {
        return res.status(404).json({
          success: false,
          message: 'Event not found',
        });
      }

      return res.status(409).json({
        success: false,
        message: 'Registration Closed: Event at full capacity',
      });
    }

    // Step 3: Issue cryptographically secure digital pass code
    const passCode = generatePassCode();

    let registration = await Registration.findOne({ event: eventId, user: userId });
    if (registration) {
      registration.status = 'ACTIVE';
      registration.passCode = registration.passCode || passCode;
      registration.registeredAt = new Date();
      registration.cancelledAt = undefined;
      registration.checkedInAt = undefined;
      await registration.save();
    } else {
      registration = await Registration.create({
        event: eventId,
        user: userId,
        status: 'ACTIVE',
        passCode,
        registeredAt: new Date(),
      });
    }

    await registration.populate('event', 'title eventType eventDate venue resourcePerson status availableSeats maxParticipants');
    await registration.populate('user', 'name email role');

    return res.status(201).json({
      success: true,
      message: 'Reservation confirmed! Digital pass generated.',
      passCode: registration.passCode,
      registration,
      availableSeats: updatedEvent.availableSeats,
      eventStatus: updatedEvent.status,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all registrations / digital passes for current user
// @route   GET /api/v1/registrations/my OR GET /api/registrations/my
// @access  Private
const getMyRegistrations = async (req, res, next) => {
  try {
    const { status } = req.query;
    const filter = { user: req.user._id };

    if (status && status !== 'All') {
      if (status === 'ACTIVE') {
        filter.status = { $in: ['ACTIVE', 'Registered'] };
      } else {
        filter.status = status;
      }
    }

    const registrations = await Registration.find(filter)
      .populate({
        path: 'event',
        populate: { path: 'createdBy', select: 'name email' },
      })
      .sort({ registeredAt: -1 });

    res.status(200).json({
      success: true,
      count: registrations.length,
      registrations,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Atomic Seat Rollback & Pass Invalidation on Cancellation
// @route   DELETE /api/v1/registrations/:id OR POST /api/v1/registrations/:id/cancel
// @access  Private (Student for own ticket, or Admin)
const cancelRegistration = async (req, res, next) => {
  try {
    const targetId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(targetId)) {
      return res.status(404).json({
        success: false,
        message: 'Invalid identifier',
      });
    }

    // Step 1: Find active registration by registration _id OR event _id
    let registration = await Registration.findOne({
      _id: targetId,
      ...(req.user.role === 'admin' ? {} : { user: req.user._id }),
      status: { $in: ['ACTIVE', 'CHECKED_IN', 'Registered'] },
    });

    if (!registration) {
      registration = await Registration.findOne({
        event: targetId,
        ...(req.user.role === 'admin' ? {} : { user: req.user._id }),
        status: { $in: ['ACTIVE', 'CHECKED_IN', 'Registered'] },
      });
    }

    if (!registration) {
      return res.status(404).json({
        success: false,
        message: 'Active reservation not found or already cancelled',
      });
    }

    // Step 2: Invalidate pass atomically
    registration.status = 'CANCELLED';
    registration.cancelledAt = new Date();
    await registration.save();

    // Step 3: Atomic seat rollback to event pool with conditional auto-reopening
    const updatedEvent = await Event.findOneAndUpdate(
      { _id: registration.event },
      [
        {
          $set: {
            availableSeats: {
              $cond: {
                if: { $lt: ['$availableSeats', '$maxParticipants'] },
                then: { $add: ['$availableSeats', 1] },
                else: '$availableSeats',
              },
            },
            status: {
              $cond: {
                if: {
                  $and: [
                    { $eq: ['$status', 'Registration Closed'] },
                    { $gt: ['$eventDate', new Date()] },
                  ],
                },
                then: 'Registration Open',
                else: '$status',
              },
            },
          },
        },
      ],
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: 'Reservation cancelled successfully and seat restored to event pool.',
      registration,
      event: updatedEvent
        ? {
            _id: updatedEvent._id,
            availableSeats: updatedEvent.availableSeats,
            status: updatedEvent.status,
          }
        : null,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin Attendee Verification & Check-In
// @route   PATCH /api/v1/registrations/:id/checkin OR POST /api/v1/registrations/verify-pass
// @access  Private (Admin only)
const checkInAttendee = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { passCode } = req.body || {};

    let query;
    if (id && mongoose.Types.ObjectId.isValid(id)) {
      query = { _id: id };
    } else if (passCode) {
      query = { passCode: passCode.trim().toUpperCase() };
    } else {
      return res.status(400).json({
        success: false,
        message: 'Registration ID or valid Pass Code required',
      });
    }

    const registration = await Registration.findOne(query)
      .populate('event', 'title eventDate venue')
      .populate('user', 'name email');

    if (!registration) {
      return res.status(404).json({
        success: false,
        message: 'Attendee pass not found with provided credentials',
      });
    }

    if (registration.status === 'CANCELLED') {
      return res.status(400).json({
        success: false,
        message: 'Invalid Pass: This ticket was cancelled and voided',
      });
    }

    if (registration.status === 'CHECKED_IN') {
      return res.status(200).json({
        success: true,
        message: 'Attendee already verified and checked in',
        alreadyCheckedIn: true,
        registration,
      });
    }

    registration.status = 'CHECKED_IN';
    registration.checkedInAt = new Date();
    await registration.save();

    res.status(200).json({
      success: true,
      message: 'Attendee verified and checked in successfully!',
      registration,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerForEvent,
  bookEvent: registerForEvent, // Alias for POST /api/v1/events/:id/book
  getMyRegistrations,
  cancelRegistration,
  cancelEventBooking: cancelRegistration,
  checkInAttendee,
};
