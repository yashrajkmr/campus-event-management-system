import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  User,
  Users,
  FileText,
  Tag,
  CheckCircle,
  AlertCircle,
  Eye,
} from 'lucide-react';
import EventCard from './EventCard';
import EventLifecycleStepper from './EventLifecycleStepper';

const EVENT_TYPES = ['Technical', 'Workshop', 'Seminar', 'Hackathon', 'Cultural', 'Academic'];
const EVENT_STATUSES = ['Draft', 'Published', 'Registration Open', 'Registration Closed', 'Event Completed'];

const EventForm = ({
  initialValues = {
    title: '',
    eventType: 'Workshop',
    resourcePerson: '',
    eventDate: '',
    venue: '',
    description: '',
    maxParticipants: 50,
    status: 'Draft',
  },
  onSubmit,
  isSubmitting = false,
  isEdit = false,
}) => {
  const [formData, setFormData] = useState({
    title: initialValues.title || '',
    eventType: initialValues.eventType || 'Workshop',
    resourcePerson: initialValues.resourcePerson || '',
    eventDate: initialValues.eventDate
      ? new Date(initialValues.eventDate).toISOString().slice(0, 16)
      : '',
    venue: initialValues.venue || '',
    description: initialValues.description || '',
    maxParticipants: initialValues.maxParticipants || 50,
    status: initialValues.status || 'Draft',
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [showLivePreview, setShowLivePreview] = useState(true);

  // Validate a single field
  const validateField = (name, value) => {
    let error = '';
    const now = new Date();

    switch (name) {
      case 'title':
        if (!value || value.trim().length < 3) {
          error = 'Title is required (minimum 3 characters)';
        } else if (value.trim().length > 150) {
          error = 'Title cannot exceed 150 characters';
        }
        break;
      case 'eventType':
        if (!value || !EVENT_TYPES.includes(value)) {
          error = 'Please select a valid event type';
        }
        break;
      case 'resourcePerson':
        if (!value || value.trim().length < 3) {
          error = 'Resource person / speaker is required (min 3 chars)';
        }
        break;
      case 'venue':
        if (!value || value.trim().length < 3) {
          error = 'Venue / location is required (min 3 chars)';
        }
        break;
      case 'description':
        if (!value || value.trim().length < 10) {
          error = 'Description is required (min 10 chars)';
        }
        break;
      case 'eventDate':
        if (!value) {
          error = 'Event date and time is required';
        } else if (new Date(value) < now && !isEdit) {
          error = 'Event date cannot be in the past';
        }
        break;
      case 'maxParticipants':
        const num = parseInt(value, 10);
        if (isNaN(num) || num < 1) {
          error = 'Capacity must be a positive integer > 0';
        }
        break;
      default:
        break;
    }
    return error;
  };

  // Handle Input Change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (touched[name]) {
      const error = validateField(name, value);
      setErrors((prev) => ({ ...prev, [name]: error }));
    }
  };

  // Handle Input Blur
  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    const error = validateField(name, value);
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  // Form Submit Validation
  const handleSubmit = (e) => {
    e.preventDefault();

    const newErrors = {};
    Object.keys(formData).forEach((field) => {
      const error = validateField(field, formData[field]);
      if (error) {
        newErrors[field] = error;
      }
    });

    setTouched({
      title: true,
      eventType: true,
      resourcePerson: true,
      venue: true,
      description: true,
      eventDate: true,
      maxParticipants: true,
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSubmit({
      ...formData,
      maxParticipants: parseInt(formData.maxParticipants, 10),
    });
  };

  // Generate ISO date for minimum date picker constraint
  const minDateTime = new Date().toISOString().slice(0, 16);

  // Live preview dummy object
  const previewEvent = {
    _id: 'preview_event',
    title: formData.title || 'Your Event Title Will Appear Here',
    eventType: formData.eventType || 'Workshop',
    resourcePerson: formData.resourcePerson || 'Speaker Name & Designation',
    venue: formData.venue || 'Campus Auditorium / Lab Hall',
    description:
      formData.description ||
      'This is a live preview of how your event details and description will be displayed to students across the portal.',
    eventDate: formData.eventDate || new Date(Date.now() + 86400000).toISOString(),
    maxParticipants: parseInt(formData.maxParticipants, 10) || 50,
    availableSeats: parseInt(formData.maxParticipants, 10) || 50,
    status: formData.status || 'Draft',
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Form Column */}
      <div className="lg:col-span-7 space-y-6">
        {/* Status Stepper */}
        <EventLifecycleStepper
          currentStatus={formData.status}
          onStatusChange={(newStatus) => setFormData((prev) => ({ ...prev, status: newStatus }))}
        />

        <form onSubmit={handleSubmit} className="glass-card p-6 sm:p-8 rounded-2xl space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <h3 className="text-lg font-bold text-white font-display">
              {isEdit ? 'Update Event Details' : 'Create New Event'}
            </h3>
            <button
              type="button"
              onClick={() => setShowLivePreview(!showLivePreview)}
              className="lg:hidden flex items-center gap-1.5 text-xs text-indigo-400 font-medium"
            >
              <Eye className="w-3.5 h-3.5" />
              {showLivePreview ? 'Hide Preview' : 'Show Preview'}
            </button>
          </div>

          {/* Event Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Event Title <span className="text-rose-400">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                name="title"
                placeholder="e.g. Next-Gen Full-Stack & Cloud Architecture Summit"
                value={formData.title}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`glass-input w-full ${errors.title ? 'border-rose-500/80 focus:border-rose-500' : ''}`}
              />
            </div>
            {touched.title && errors.title && (
              <p className="mt-1.5 text-xs text-rose-400 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" /> {errors.title}
              </p>
            )}
          </div>

          {/* Event Type & Max Participants (Grid) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Event Type */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Event Type <span className="text-rose-400">*</span>
              </label>
              <select
                name="eventType"
                value={formData.eventType}
                onChange={handleChange}
                onBlur={handleBlur}
                className="glass-input w-full bg-slate-900 cursor-pointer"
              >
                {EVENT_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            {/* Max Capacity */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Maximum Seats <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <Users className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="number"
                  name="maxParticipants"
                  min="1"
                  max="5000"
                  value={formData.maxParticipants}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`glass-input w-full pl-10 ${errors.maxParticipants ? 'border-rose-500' : ''}`}
                />
              </div>
              {touched.maxParticipants && errors.maxParticipants && (
                <p className="mt-1.5 text-xs text-rose-400 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" /> {errors.maxParticipants}
                </p>
              )}
            </div>
          </div>

          {/* Resource Person & Venue (Grid) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Resource Person */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Speaker / Resource Person <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  name="resourcePerson"
                  placeholder="e.g. Dr. Maya Sundaram (Meta)"
                  value={formData.resourcePerson}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`glass-input w-full pl-10 ${errors.resourcePerson ? 'border-rose-500' : ''}`}
                />
              </div>
              {touched.resourcePerson && errors.resourcePerson && (
                <p className="mt-1.5 text-xs text-rose-400 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" /> {errors.resourcePerson}
                </p>
              )}
            </div>

            {/* Venue */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Venue / Hall <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  name="venue"
                  placeholder="e.g. Main Auditorium Hall A"
                  value={formData.venue}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`glass-input w-full pl-10 ${errors.venue ? 'border-rose-500' : ''}`}
                />
              </div>
              {touched.venue && errors.venue && (
                <p className="mt-1.5 text-xs text-rose-400 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" /> {errors.venue}
                </p>
              )}
            </div>
          </div>

          {/* Event Date & Time */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Event Date & Time <span className="text-rose-400">*</span>
            </label>
            <div className="relative">
              <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="datetime-local"
                name="eventDate"
                min={!isEdit ? minDateTime : undefined}
                value={formData.eventDate}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`glass-input w-full pl-10 bg-slate-900 cursor-pointer ${
                  errors.eventDate ? 'border-rose-500' : ''
                }`}
              />
            </div>
            {touched.eventDate && errors.eventDate && (
              <p className="mt-1.5 text-xs text-rose-400 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" /> {errors.eventDate}
              </p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Detailed Description <span className="text-rose-400">*</span>
            </label>
            <textarea
              name="description"
              rows={4}
              placeholder="Outline event agenda, key learning objectives, prerequisites, hardware requirements, or tracks..."
              value={formData.description}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`glass-input w-full resize-none ${errors.description ? 'border-rose-500' : ''}`}
            />
            {touched.description && errors.description && (
              <p className="mt-1.5 text-xs text-rose-400 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" /> {errors.description}
              </p>
            )}
          </div>

          {/* Submit Buttons */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary w-full sm:w-auto"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Saving Event...</span>
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  <span>{isEdit ? 'Save Changes' : 'Create & Stage Event'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Live Preview Column */}
      <div className={`lg:col-span-5 space-y-4 ${showLivePreview ? 'block' : 'hidden lg:block'}`}>
        <div className="sticky top-28 space-y-3">
          <div className="flex items-center justify-between px-1">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-indigo-400" />
              Live Student Card Preview
            </h4>
            <span className="text-[10px] text-indigo-400 bg-indigo-950/60 px-2 py-0.5 rounded-md border border-indigo-500/30 font-medium">
              Real-Time
            </span>
          </div>

          <EventCard event={previewEvent} />

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 text-xs text-slate-400 space-y-2">
            <div className="font-semibold text-slate-300">💡 Quick Admin Tips:</div>
            <ul className="list-disc list-inside space-y-1 text-slate-400">
              <li>Set status to <strong className="text-slate-200">Registration Open</strong> to allow student signups.</li>
              <li>Capacity will be tracked atomically; sold-out events close automatically.</li>
              <li>You can view and export registered attendee lists anytime from the dashboard.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventForm;
