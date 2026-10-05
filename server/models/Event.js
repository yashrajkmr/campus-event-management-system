const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Event title is required'],
      trim: true,
      minlength: [3, 'Event title must be at least 3 characters'],
      maxlength: [150, 'Event title cannot exceed 150 characters'],
    },
    eventType: {
      type: String,
      required: [true, 'Event type is required'],
      enum: {
        values: ['Technical', 'Workshop', 'Seminar', 'Hackathon', 'Cultural', 'Academic'],
        message: '{VALUE} is not a valid event type',
      },
    },
    resourcePerson: {
      type: String,
      required: [true, 'Resource person / speaker name is required'],
      trim: true,
      minlength: [3, 'Resource person name must be at least 3 characters'],
    },
    eventDate: {
      type: Date,
      required: [true, 'Event date and time is required'],
    },
    venue: {
      type: String,
      required: [true, 'Event venue / location is required'],
      trim: true,
      minlength: [3, 'Venue must be at least 3 characters'],
    },
    description: {
      type: String,
      required: [true, 'Event description is required'],
      trim: true,
      minlength: [10, 'Description must be at least 10 characters'],
    },
    maxParticipants: {
      type: Number,
      required: [true, 'Maximum participants limit is required'],
      min: [1, 'Maximum participants must be at least 1'],
    },
    availableSeats: {
      type: Number,
      required: true,
      min: [0, 'Available seats cannot be negative'],
    },
    status: {
      type: String,
      enum: {
        values: ['Draft', 'Published', 'Registration Open', 'Registration Closed', 'Event Completed'],
        message: '{VALUE} is not a valid event status',
      },
      default: 'Draft',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Event creator ID is required'],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for registered seats count
eventSchema.virtual('registeredParticipantsCount').get(function () {
  return this.maxParticipants - this.availableSeats;
});

// Index for search, filtering, and sorting performance
eventSchema.index({ title: 'text', description: 'text', resourcePerson: 'text', venue: 'text' });
eventSchema.index({ eventDate: 1, status: 1, eventType: 1 });
eventSchema.index({ availableSeats: 1, status: 1 });

module.exports = mongoose.model('Event', eventSchema);

