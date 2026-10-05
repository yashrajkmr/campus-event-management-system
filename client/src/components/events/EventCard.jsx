import React from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar as CalendarIcon,
  MapPin,
  User as UserIcon,
  ArrowRight,
  Edit3,
  Trash2,
  Sparkles,
  Zap,
} from 'lucide-react';
import StatusBadge from '../common/StatusBadge';
import SeatAvailabilityIndicator from '../common/SeatAvailabilityIndicator';
import CountdownTimer from '../common/CountdownTimer';
import { formatDate, getEventTypeConfig } from '../../utils/formatters';
import { useAuth } from '../../context/AuthContext';

const EventCard = ({ event, onDelete, onRegister, isRegistered = false }) => {
  const { isAdmin } = useAuth();
  const typeConfig = getEventTypeConfig(event.eventType);

  const isRegistrationOpen = event.status === 'Registration Open' && event.availableSeats > 0;
  const isPast = new Date(event.eventDate) < new Date();

  return (
    <div className="group relative flex flex-col justify-between rounded-2xl overflow-hidden border border-[#30363D] bg-[#161B22] p-5 sm:p-6 transition-all duration-300 hover:border-slate-500 hover:shadow-xl hover:shadow-indigo-500/10 hover:-translate-y-1">
      {/* Top Ambient Glow Gradient */}
      <div
        className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${typeConfig.gradient} opacity-80 group-hover:opacity-100 transition-opacity`}
      />

      <div className="space-y-4">
        {/* Badges Bar: Category & Status */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold border ${typeConfig.bg}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${typeConfig.dot}`} />
            {event.eventType}
          </span>
          <StatusBadge status={event.status} size="sm" />
        </div>

        {/* Title */}
        <div>
          <Link
            to={`/events/${event._id}`}
            className="block text-lg sm:text-xl font-bold font-display text-white group-hover:text-indigo-300 transition-colors line-clamp-2 leading-snug"
          >
            {event.title}
          </Link>
          <p className="mt-2 text-xs sm:text-sm text-slate-400 line-clamp-2 leading-relaxed">
            {event.description}
          </p>
        </div>

        {/* Metadata Details */}
        <div className="space-y-2 pt-2 border-t border-[#30363D]/80 text-xs text-slate-300">
          {/* Date */}
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-4 h-4 text-indigo-400 shrink-0" />
            <span className="font-medium text-slate-200">{formatDate(event.eventDate)}</span>
          </div>

          {/* Venue */}
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-rose-400 shrink-0" />
            <span className="truncate text-slate-300">{event.venue}</span>
          </div>

          {/* Speaker */}
          <div className="flex items-center gap-2">
            <UserIcon className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="truncate text-slate-300">
              <strong className="text-slate-400 font-normal">Speaker:</strong> {event.resourcePerson}
            </span>
          </div>
        </div>

        {/* Dynamic Capacity Meter */}
        <div className="pt-2">
          <SeatAvailabilityIndicator
            availableSeats={event.availableSeats}
            maxParticipants={event.maxParticipants}
            size="sm"
          />
        </div>

        {/* Countdown preview for upcoming events */}
        {!isPast && (
          <div className="pt-1 flex items-center justify-between border-t border-[#30363D]/40">
            <span className="text-[11px] font-mono text-slate-400">STARTS IN:</span>
            <CountdownTimer targetDate={event.eventDate} compact={true} />
          </div>
        )}
      </div>

      {/* Action Footer */}
      <div className="mt-5 pt-4 border-t border-[#30363D] flex items-center justify-between gap-2">
        {/* Admin Controls */}
        {isAdmin ? (
          <div className="flex items-center justify-between w-full gap-2">
            <Link
              to={`/events/${event._id}`}
              className="btn-secondary !py-2 !px-3 !text-xs flex-1 text-center"
            >
              Details
            </Link>
            <Link
              to={`/admin/edit-event/${event._id}`}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-purple-500/15 text-purple-300 border border-purple-500/30 hover:bg-purple-500/25 text-xs font-semibold transition-all"
            >
              <Edit3 className="w-3.5 h-3.5" /> Edit
            </Link>
            {onDelete && (
              <button
                onClick={() => onDelete(event._id, event.title)}
                className="p-2 rounded-xl bg-rose-500/15 text-rose-300 border border-rose-500/30 hover:bg-rose-500/25 transition-all"
                title="Delete Event"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        ) : (
          /* Student / Public Controls */
          <div className="flex items-center justify-between w-full gap-2">
            <Link
              to={`/events/${event._id}`}
              className="btn-secondary !py-2 !px-3.5 !text-xs flex items-center gap-1.5 font-semibold"
            >
              <span>View Details</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>

            {isRegistered ? (
              <span className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-emerald-500/15 text-emerald-300 border border-emerald-500/40 text-xs font-mono font-bold">
                ✓ PASS ACTIVE
              </span>
            ) : isRegistrationOpen ? (
              onRegister ? (
                <button
                  type="button"
                  onClick={() => onRegister(event)}
                  className="btn-primary !py-2 !px-4 !text-xs font-semibold"
                >
                  <Zap className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
                  <span>Reserve Seat</span>
                </button>
              ) : (
                <Link
                  to={`/events/${event._id}`}
                  className="btn-primary !py-2 !px-4 !text-xs font-semibold"
                >
                  <Zap className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
                  <span>Reserve Seat</span>
                </Link>
              )
            ) : (
              <button
                disabled
                className="px-3 py-2 rounded-xl bg-[#21262D] text-slate-500 text-xs font-mono font-bold cursor-not-allowed border border-[#30363D]"
              >
                {event.status === 'Registration Closed' ? 'REGISTRATION CLOSED' : event.status.toUpperCase()}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default EventCard;
