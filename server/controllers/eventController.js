const mongoose = require('mongoose');
const Event = require('../models/Event');
const Registration = require('../models/Registration');
const { registerForEvent, cancelRegistration } = require('./registrationController');

// @desc    Get all events with compound search, multi-parameter filters & pagination
// @route   GET /api/v1/events OR GET /api/events
// @access  Public
const getEvents = async (req, res, next) => {
  try {
    const {
      search,
      type,
      status,
      venue,
      date,
      availableOnly,
      sort = 'date',
      page = 1,
      limit = 9,
    } = req.query;

    const query = {};

    // 1. Text search across title, description, resourcePerson, and venue
    if (search && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { title: searchRegex },
        { description: searchRegex },
        { resourcePerson: searchRegex },
        { venue: searchRegex },
      ];
    }

    // 2. Multi-type category filter (comma-separated or single)
    if (type && type !== 'All') {
      const types = type.split(',').map((t) => t.trim()).filter(Boolean);
      if (types.length > 0) {
        query.eventType = { $in: types };
      }
    }

    // 3. Status filter
    if (status && status !== 'All') {
      const statuses = status.split(',').map((s) => s.trim()).filter(Boolean);
      if (statuses.length > 0) {
        query.status = { $in: statuses };
      }
    }

    // 4. Venue filter
    if (venue && venue !== 'All') {
      query.venue = new RegExp(venue.trim(), 'i');
    }

    // 5. Seat availability filter ("Show Available Seats Only")
    if (availableOnly === 'true' || availableOnly === true) {
      query.availableSeats = { $gt: 0 };
      query.status = { $in: ['Registration Open', 'Published'] };
    }

    // 6. Date filtering (e.g. 'upcoming', 'today', 'week', 'month')
    if (date && date !== 'All') {
      const now = new Date();
      if (date === 'today') {
        const startOfDay = new Date(now.setHours(0, 0, 0, 0));
        const endOfDay = new Date(now.setHours(23, 59, 59, 999));
        query.eventDate = { $gte: startOfDay, $lte: endOfDay };
      } else if (date === 'upcoming') {
        query.eventDate = { $gte: new Date() };
      } else if (date === 'week') {
        const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        query.eventDate = { $gte: new Date(), $lte: nextWeek };
      } else if (date === 'month') {
        const nextMonth = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
        query.eventDate = { $gte: new Date(), $lte: nextMonth };
      } else if (!isNaN(new Date(date).getTime())) {
        const targetDate = new Date(date);
        const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
        const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));
        query.eventDate = { $gte: startOfDay, $lte: endOfDay };
      }
    }

    // Sorting
    let sortOption = {};
    switch (sort) {
      case 'date':
      case 'date_asc':
        sortOption = { eventDate: 1 };
        break;
      case 'date_desc':
        sortOption = { eventDate: -1 };
        break;
      case 'seats':
      case 'seats_desc':
        sortOption = { availableSeats: -1 };
        break;
      case 'seats_asc':
        sortOption = { availableSeats: 1 };
        break;
      case 'title':
        sortOption = { title: 1 };
        break;
      default:
        sortOption = { eventDate: 1 };
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, parseInt(limit, 10) || 9);
    const skip = (pageNum - 1) * limitNum;

    const total = await Event.countDocuments(query);
    const events = await Event.find(query)
      .populate('createdBy', 'name email role')
      .sort(sortOption)
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      count: events.length,
      total,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      events,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get top upcoming events (nearest date)
// @route   GET /api/v1/events/upcoming OR GET /api/events/upcoming
// @access  Public
const getUpcomingEvents = async (req, res, next) => {
  try {
    const now = new Date();
    const events = await Event.find({
      eventDate: { $gte: now },
      status: { $in: ['Registration Open', 'Published'] },
    })
      .populate('createdBy', 'name email')
      .sort({ eventDate: 1 })
      .limit(6);

    res.status(200).json({
      success: true,
      count: events.length,
      events,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single event by ID + current user registration status
// @route   GET /api/v1/events/:id OR GET /api/events/:id
// @access  Public (Optional auth for user status)
const getEventById = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({
        success: false,
        message: 'Event not found with valid ID',
      });
    }

    const event = await Event.findById(req.params.id).populate(
      'createdBy',
      'name email role'
    );

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found',
      });
    }

    // Check if authenticated user holds an active ticket pass
    let isUserRegistered = false;
    let userRegistration = null;

    if (req.user) {
      userRegistration = await Registration.findOne({
        event: event._id,
        user: req.user._id,
        status: { $in: ['ACTIVE', 'CHECKED_IN', 'Registered'] },
      });
      isUserRegistered = !!userRegistration;
    }

    res.status(200).json({
      success: true,
      event,
      isUserRegistered,
      userRegistration,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get faculty & administrator telemetry & metrics
// @route   GET /api/v1/events/stats OR GET /api/events/stats
// @access  Private (Admin only)
const getEventStats = async (req, res, next) => {
  try {
    const totalEvents = await Event.countDocuments();
    const activeRegistrations = await Registration.countDocuments({
      status: { $in: ['ACTIVE', 'CHECKED_IN', 'Registered'] },
    });
    const checkedInCount = await Registration.countDocuments({
      status: 'CHECKED_IN',
    });
    const cancelledRegistrations = await Registration.countDocuments({
      status: 'CANCELLED',
    });
    const soldOutEvents = await Event.countDocuments({
      $or: [{ availableSeats: 0 }, { status: 'Registration Closed' }],
    });

    // Seat capacity calculations
    const capacityAggregation = await Event.aggregate([
      {
        $group: {
          _id: null,
          totalCapacity: { $sum: '$maxParticipants' },
          totalAvailable: { $sum: '$availableSeats' },
        },
      },
    ]);

    const totalCapacity = capacityAggregation[0]?.totalCapacity || 0;
    const totalAvailable = capacityAggregation[0]?.totalAvailable || 0;
    const totalBooked = totalCapacity - totalAvailable;
    const occupancyRate = totalCapacity > 0 ? ((totalBooked / totalCapacity) * 100).toFixed(1) : 0;

    // Events by category
    const categoryStats = await Event.aggregate([
      {
        $group: {
          _id: '$eventType',
          count: { $sum: 1 },
          totalCapacity: { $sum: '$maxParticipants' },
          availableSeats: { $sum: '$availableSeats' },
        },
      },
      { $sort: { count: -1 } },
    ]);

    // Events by status
    const statusStats = await Event.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);

    // Recent 5 registrations
    const recentRegistrations = await Registration.find()
      .populate('user', 'name email')
      .populate('event', 'title eventType eventDate venue')
      .sort({ createdAt: -1 })
      .limit(6);

    res.status(200).json({
      success: true,
      stats: {
        totalEvents,
        activeRegistrations,
        checkedInCount,
        cancelledRegistrations,
        soldOutEvents,
        totalCapacity,
        totalBooked,
        totalAvailable,
        occupancyRate: Number(occupancyRate),
        categoryStats,
        statusStats,
        recentRegistrations,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new event
// @route   POST /api/v1/events OR POST /api/events
// @access  Private (Admin only)
const createEvent = async (req, res, next) => {
  try {
    const {
      title,
      eventType,
      resourcePerson,
      eventDate,
      venue,
      description,
      maxParticipants,
      status = 'Draft',
    } = req.body;

    if (
      !title ||
      !eventType ||
      !resourcePerson ||
      !eventDate ||
      !venue ||
      !description ||
      maxParticipants === undefined
    ) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required event details',
      });
    }

    const participantsNum = parseInt(maxParticipants, 10);
    if (isNaN(participantsNum) || participantsNum < 1) {
      return res.status(400).json({
        success: false,
        message: 'Maximum participants must be a positive number greater than 0',
      });
    }

    const eventDateTime = new Date(eventDate);
    if (isNaN(eventDateTime.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid event date',
      });
    }

    const event = await Event.create({
      title: title.trim(),
      eventType,
      resourcePerson: resourcePerson.trim(),
      eventDate: eventDateTime,
      venue: venue.trim(),
      description: description.trim(),
      maxParticipants: participantsNum,
      availableSeats: participantsNum,
      status,
      createdBy: req.user._id,
    });

    res.status(201).json({
      success: true,
      message: 'Event created successfully',
      event,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update an existing event
// @route   PUT /api/v1/events/:id OR PUT /api/events/:id
// @access  Private (Admin only)
const updateEvent = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({
        success: false,
        message: 'Event not found',
      });
    }

    let event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found',
      });
    }

    const {
      title,
      eventType,
      resourcePerson,
      eventDate,
      venue,
      description,
      maxParticipants,
      status,
    } = req.body;

    if (title) event.title = title.trim();
    if (eventType) event.eventType = eventType;
    if (resourcePerson) event.resourcePerson = resourcePerson.trim();
    if (venue) event.venue = venue.trim();
    if (description) event.description = description.trim();
    if (eventDate) event.eventDate = new Date(eventDate);

    if (maxParticipants !== undefined) {
      const newMax = parseInt(maxParticipants, 10);
      if (isNaN(newMax) || newMax < 1) {
        return res.status(400).json({
          success: false,
          message: 'Maximum participants must be at least 1',
        });
      }

      const currentRegisteredCount = event.maxParticipants - event.availableSeats;
      if (newMax < currentRegisteredCount) {
        return res.status(400).json({
          success: false,
          message: `Cannot reduce capacity below currently registered attendees (${currentRegisteredCount})`,
        });
      }

      event.maxParticipants = newMax;
      event.availableSeats = newMax - currentRegisteredCount;
    }

    if (status) {
      event.status = status;
    }

    await event.save();

    res.status(200).json({
      success: true,
      message: 'Event updated successfully',
      event,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete an event & associated registrations
// @route   DELETE /api/v1/events/:id OR DELETE /api/events/:id
// @access  Private (Admin only)
const deleteEvent = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({
        success: false,
        message: 'Event not found',
      });
    }

    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found',
      });
    }

    await Registration.deleteMany({ event: event._id });
    await event.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Event and associated registrations deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all attendees registered for a specific event
// @route   GET /api/v1/events/:id/attendees OR GET /api/events/:id/attendees
// @access  Private (Admin only)
const getEventAttendees = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({
        success: false,
        message: 'Event not found',
      });
    }

    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found',
      });
    }

    const attendees = await Registration.find({
      event: event._id,
      status: { $in: ['ACTIVE', 'CHECKED_IN', 'Registered'] },
    })
      .populate('user', 'name email role createdAt')
      .sort({ registeredAt: 1 });

    res.status(200).json({
      success: true,
      eventTitle: event.title,
      count: attendees.length,
      attendees,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getEvents,
  getUpcomingEvents,
  getEventById,
  getEventStats,
  createEvent,
  updateEvent,
  deleteEvent,
  getEventAttendees,
  bookEvent: registerForEvent,
  cancelEventBooking: cancelRegistration,
};
