import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Calendar as CalendarIcon,
  MapPin,
  User as UserIcon,
  Users,
  Sparkles,
  ArrowLeft,
  Download,
  Share2,
  Edit3,
  UserCheck,
  CheckCircle2,
  AlertTriangle,
  Zap,
  Ticket,
  Clock,
  QrCode,
  ShieldCheck,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { QRCodeSVG } from 'qrcode.react';
import StatusBadge from '../components/common/StatusBadge';
import SeatAvailabilityIndicator from '../components/common/SeatAvailabilityIndicator';
import CountdownTimer from '../components/common/CountdownTimer';
import AttendeeListModal from '../components/events/AttendeeListModal';
import { eventService, registrationService } from '../services/api';
import { formatDate, getEventTypeConfig, downloadCalendarEvent } from '../utils/formatters';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const EventDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, isAdmin } = useAuth();
  const { showToast } = useToast();

  const [event, setEvent] = useState(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const [userRegistration, setUserRegistration] = useState(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [showAttendeesModal, setShowAttendeesModal] = useState(false);
  const [concurrencyError, setConcurrencyError] = useState(null);

  useEffect(() => {
    fetchEventDetails();
  }, [id]);

  const fetchEventDetails = async () => {
    try {
      setLoading(true);
      const res = await eventService.getEventById(id);
      if (res.data.success) {
        setEvent(res.data.event);
        setIsRegistered(res.data.isUserRegistered);
        setUserRegistration(res.data.userRegistration);
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to load event details', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleReserveSeat = async () => {
    if (!isAuthenticated) {
      showToast('Please sign in to reserve your seat', 'info');
      navigate('/login');
      return;
    }

    try {
      setRegistering(true);
      setConcurrencyError(null);
      const res = await eventService.bookEvent(id);
      if (res.data.success) {
        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#6366F1', '#10B981', '#38BDF8'],
        });

        showToast(`Seat locked! Digital Pass issued: ${res.data.passCode}`, 'success');
        setIsRegistered(true);
        setUserRegistration(res.data.registration);

        // Refresh event details
        fetchEventDetails();
      }
    } catch (err) {
      if (err.response?.status === 409) {
        const conflictMsg = '409 Conflict: Event Capacity Reached (All Seats Booked)';
        setConcurrencyError(conflictMsg);
        showToast(conflictMsg, 'error');
        fetchEventDetails();
      } else {
        const errorMsg = err.response?.data?.message || 'Failed to complete reservation';
        showToast(errorMsg, 'error');
      }
    } finally {
      setRegistering(false);
    }
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      showToast('Event link copied to clipboard!', 'info');
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-3">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-slate-400 font-mono text-sm">Querying event node & live seat inventory...</p>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center rounded-2xl bg-[#161B22] border border-[#30363D] space-y-4">
        <h2 className="text-2xl font-bold text-white">Event Not Found</h2>
        <p className="text-sm text-slate-400">
          The requested event record may have been removed or does not exist.
        </p>
        <Link to="/events" className="btn-primary inline-flex">
          Back to Events Catalog
        </Link>
      </div>
    );
  }

  const typeConfig = getEventTypeConfig(event.eventType);
  const isRegistrationOpen = event.status === 'Registration Open' && event.availableSeats > 0;
  const isPast = new Date(event.eventDate) < new Date();
  const passCode = userRegistration?.passCode || `CHUB-2026-${(userRegistration?._id || '').slice(-6).toUpperCase()}`;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Top Breadcrumb & Admin Quick Actions */}
      <div className="flex items-center justify-between">
        <Link
          to="/events"
          className="inline-flex items-center gap-1.5 text-xs font-mono font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Events</span>
        </Link>

        {isAdmin && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAttendeesModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#21262D] hover:bg-slate-700 text-slate-200 border border-[#30363D] text-xs font-mono transition-all"
            >
              <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Attendee Roster</span>
            </button>
            <Link
              to={`/admin/edit-event/${event._id}`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/40 text-xs font-mono font-semibold transition-all"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit Event</span>
            </Link>
          </div>
        )}
      </div>

      {/* Main Banner Card */}
      <div className="relative rounded-3xl overflow-hidden bg-[#161B22] border border-[#30363D] p-6 sm:p-10 space-y-6 shadow-2xl">
        <div
          className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${typeConfig.gradient}`}
        />

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span
              className={`inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-mono font-bold border ${typeConfig.bg}`}
            >
              <span className={`w-2 h-2 rounded-full ${typeConfig.dot}`} />
              {event.eventType} Track
            </span>
            <StatusBadge status={event.status} size="md" />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="p-2.5 rounded-xl bg-[#0A0C10] border border-[#30363D] text-slate-300 hover:text-white transition-colors"
              title="Share Event Link"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => downloadCalendarEvent(event)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#0A0C10] border border-[#30363D] text-slate-300 hover:text-white text-xs font-mono font-semibold transition-colors"
              title="Add to iCalendar (.ics)"
            >
              <Download className="w-3.5 h-3.5 text-indigo-400" />
              <span>Add to Calendar</span>
            </button>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-3xl sm:text-5xl font-extrabold font-display text-white tracking-tight leading-tight">
          {event.title}
        </h1>

        {/* Live Countdown for Upcoming Events */}
        {!isPast && (
          <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-[#0A0C10] border border-[#30363D]">
            <div className="space-y-0.5">
              <span className="text-xs text-indigo-300 font-mono font-bold uppercase tracking-wider block">
                Time Remaining Until Commencing
              </span>
              <span className="text-xs text-slate-400">
                Doors open 30 minutes prior for digital ticket pass verification and badge pickup.
              </span>
            </div>
            <CountdownTimer targetDate={event.eventDate} />
          </div>
        )}
      </div>

      {/* 2-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Agenda & Faculty Details (Col 8) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Detailed Overview */}
          <div className="rounded-2xl bg-[#161B22] border border-[#30363D] p-6 sm:p-8 space-y-4 shadow-xl">
            <h3 className="text-lg font-bold font-display text-white border-b border-[#30363D] pb-3 flex items-center justify-between">
              <span>Event Overview & Technical Agenda</span>
              <span className="text-xs font-mono text-slate-400 font-normal">CHUB-SPEC-2026</span>
            </h3>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed whitespace-pre-line">
              {event.description}
            </p>
          </div>

          {/* Keynote Speaker & Faculty Coordinator Card */}
          <div className="rounded-2xl bg-[#161B22] border border-[#30363D] p-6 space-y-4 shadow-xl">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
              Keynote Speaker & Faculty Coordinator
            </h3>
            <div className="flex items-center gap-4 pt-1">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-emerald-500 flex items-center justify-center text-xl font-bold text-white shadow-lg shrink-0 border border-indigo-400/30">
                {event.resourcePerson[0].toUpperCase()}
              </div>
              <div>
                <h4 className="text-lg font-bold text-white">
                  {event.resourcePerson}
                </h4>
                <p className="text-xs font-mono text-emerald-400">
                  Lead Coordinator & Featured Speaker
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Responsible for attendee qualification, session lab exercises, and digital pass verification.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Concurrency Booking Card (Col 4) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="rounded-2xl bg-[#161B22] border border-[#30363D] p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#30363D] pb-3">
              <h3 className="text-base font-bold font-display text-white">
                Seat Reservation
              </h3>
              <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live Sync
              </span>
            </div>

            {/* Dynamic Capacity Meter */}
            <SeatAvailabilityIndicator
              availableSeats={event.availableSeats}
              maxParticipants={event.maxParticipants}
              size="md"
            />

            {/* Concurrency Error Banner */}
            {concurrencyError && (
              <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
                <div>
                  <span className="font-bold block text-white">Capacity Lock Triggered</span>
                  {concurrencyError}
                </div>
              </div>
            )}

            {/* Interactive Booking Flow */}
            <div>
              {isRegistered ? (
                /* Confirmed Pass State with Digital Pass Code */
                <div className="space-y-4 rounded-xl bg-[#0A0C10] border border-emerald-500/30 p-4">
                  <div className="flex items-center gap-2 text-emerald-300 text-xs font-bold font-mono">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Seat Reserved & Confirmed</span>
                  </div>

                  {/* QR Box & Pass Code */}
                  <div className="p-3 rounded-lg bg-white flex flex-col items-center justify-center gap-2">
                    <QRCodeSVG
                      value={`CAMPUSHUB-VERIFY:${passCode}:${event._id}`}
                      size={110}
                      level="M"
                    />
                  </div>

                  <div className="text-center font-mono">
                    <span className="text-[10px] text-slate-400 uppercase tracking-widest block">
                      Digital Verification Pass Code
                    </span>
                    <span className="text-base font-extrabold text-indigo-400 tracking-wider">
                      {passCode}
                    </span>
                  </div>

                  <Link
                    to="/my-passes"
                    className="btn-secondary w-full !text-xs text-center flex items-center justify-center gap-1.5 font-semibold"
                  >
                    <Ticket className="w-3.5 h-3.5 text-emerald-400" />
                    <span>View Pass in Digital Wallet</span>
                  </Link>
                </div>
              ) : isRegistrationOpen ? (
                /* One-Click "Reserve My Seat" Action */
                <button
                  type="button"
                  id="reserve-seat-btn"
                  onClick={handleReserveSeat}
                  disabled={registering}
                  className="btn-primary w-full !py-3.5 !text-sm font-semibold shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2"
                >
                  {registering ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Executing Atomic Decrement...</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 text-amber-300 fill-amber-300" />
                      <span>Reserve My Seat</span>
                    </>
                  )}
                </button>
              ) : (
                <div className="p-4 rounded-xl bg-[#0A0C10] border border-[#30363D] text-center space-y-1">
                  <span className="text-xs font-mono font-bold text-rose-400 uppercase block">
                    {event.status === 'Registration Closed' ? 'Registration Closed: Event Full' : event.status}
                  </span>
                  <span className="text-[11px] text-slate-500">
                    All available seats have been allocated via concurrency guards.
                  </span>
                </div>
              )}
            </div>

            {/* Event Key Facts */}
            <div className="space-y-3 pt-3 border-t border-[#30363D] text-xs text-slate-300 font-sans">
              <div className="flex items-start gap-2.5">
                <CalendarIcon className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-slate-200 block">Date & Time</span>
                  <span className="text-slate-400 font-mono text-[11px]">{formatDate(event.eventDate)}</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-slate-200 block">Venue Location</span>
                  <span className="text-slate-400">{event.venue}</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <Users className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-slate-200 block">Total Seat Pool</span>
                  <span className="text-slate-400">{event.maxParticipants} Attendees Max</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-slate-200 block">Anti-Race Concurrency</span>
                  <span className="text-slate-400 font-mono text-[10px]">Conditional Write Guard Active</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Admin Attendee Roster Modal */}
      {isAdmin && (
        <AttendeeListModal
          isOpen={showAttendeesModal}
          onClose={() => setShowAttendeesModal(false)}
          eventId={event._id}
          eventTitle={event.title}
        />
      )}
    </div>
  );
};

export default EventDetailPage;
