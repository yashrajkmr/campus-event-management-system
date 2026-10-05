import React from 'react';
import {
  Calendar,
  MapPin,
  User,
  Download,
  CheckCircle2,
  Clock,
  XCircle,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { formatDate, formatShortDate, getEventTypeConfig, downloadCalendarEvent } from '../../utils/formatters';

const RegistrationCard = ({ registration, onCancel, currentUserName }) => {
  const event = registration.event;
  if (!event) return null;

  const isCancelled = registration.status === 'CANCELLED';
  const isCheckedIn = registration.status === 'CHECKED_IN';
  const isActive = registration.status === 'ACTIVE' || registration.status === 'Registered';
  const typeConfig = getEventTypeConfig(event.eventType);
  const isPast = new Date(event.eventDate) < new Date();

  const attendeeName = registration.user?.name || currentUserName || 'Student Attendee';
  const passCode =
    registration.passCode ||
    `CHUB-2026-${(registration._id || '').slice(-6).toUpperCase()}`;

  return (
    <div
      className={`relative flex flex-col md:flex-row rounded-2xl overflow-hidden border shadow-2xl transition-all duration-300 ${
        isCancelled
          ? 'bg-[#161B22]/50 border-rose-500/30 opacity-70'
          : isCheckedIn
          ? 'bg-[#161B22] border-indigo-500/40 hover:border-indigo-400'
          : 'bg-[#161B22] border-[#30363D] hover:border-slate-500'
      }`}
    >
      {/* Left Colored Accent Bar */}
      <div
        className={`w-full md:w-3 h-2 md:h-auto bg-gradient-to-b ${
          isCancelled ? 'from-rose-600 to-rose-800' : typeConfig.gradient
        }`}
      />

      {/* Main Ticket Body */}
      <div className="flex-1 p-5 sm:p-7 flex flex-col justify-between space-y-4">
        <div>
          {/* Header Row: Category Pill & Dynamic Ticket Status Badge */}
          <div className="flex items-center justify-between gap-2 flex-wrap mb-2">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold border ${typeConfig.bg}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${typeConfig.dot}`} />
              {event.eventType} Track
            </span>

            {/* Dynamic Ticket Status Badge: ACTIVE, CHECKED_IN, CANCELLED */}
            {isCancelled ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-extrabold bg-[#F43F5E]/15 text-[#F43F5E] border border-[#F43F5E]/40 shadow-sm">
                <XCircle className="w-3.5 h-3.5" /> CANCELLED & VOID
              </span>
            ) : isCheckedIn ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-extrabold bg-[#6366F1]/15 text-indigo-300 border border-indigo-500/40 shadow-sm">
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" /> CHECKED_IN
              </span>
            ) : isPast ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-slate-800 text-slate-400 border border-[#30363D]">
                <Clock className="w-3.5 h-3.5" /> CONCLUDED
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-extrabold bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/40 shadow-sm shadow-[#10B981]/10">
                <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
                ACTIVE PASS
              </span>
            )}
          </div>

          {/* Event Title */}
          <h3 className="text-xl sm:text-2xl font-bold font-display text-white leading-tight">
            {event.title}
          </h3>

          <p className="mt-1 text-xs sm:text-sm text-slate-400 line-clamp-2">
            {event.description}
          </p>
        </div>

        {/* Boarding Pass Meta Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 py-3 border-y border-[#30363D] text-xs">
          <div>
            <span className="text-slate-500 font-mono text-[10px] uppercase block">
              Attendee Name
            </span>
            <div className="flex items-center gap-1.5 text-white font-semibold mt-0.5">
              <User className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
              <span className="truncate">{attendeeName}</span>
            </div>
          </div>

          <div>
            <span className="text-slate-500 font-mono text-[10px] uppercase block">
              Date & Commencing
            </span>
            <div className="flex items-center gap-1.5 text-slate-200 font-mono font-medium mt-0.5">
              <Calendar className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="truncate">{formatDate(event.eventDate)}</span>
            </div>
          </div>

          <div>
            <span className="text-slate-500 font-mono text-[10px] uppercase block">
              Allocated Venue
            </span>
            <div className="flex items-center gap-1.5 text-slate-200 font-semibold mt-0.5 truncate">
              <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
              <span className="truncate">{event.venue}</span>
            </div>
          </div>
        </div>

        {/* Footer Meta & Calendar Export */}
        <div className="flex items-center justify-between text-xs text-slate-400 pt-1 flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <span className="font-mono text-[11px]">
              Issued: <strong className="text-slate-300">{formatShortDate(registration.registeredAt)}</strong>
            </span>
            {registration.checkedInAt && (
              <span className="font-mono text-[11px] text-indigo-400">
                Verified at: {new Date(registration.checkedInAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
            {isCancelled && registration.cancelledAt && (
              <span className="font-mono text-[11px] text-rose-400">
                Seat Refunded: {formatShortDate(registration.cancelledAt)}
              </span>
            )}
          </div>

          {!isCancelled && (
            <button
              onClick={() => downloadCalendarEvent(event)}
              className="inline-flex items-center gap-1.5 text-indigo-400 hover:text-indigo-300 font-mono text-xs font-semibold transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Add to Calendar (.ics)</span>
            </button>
          )}
        </div>
      </div>

      {/* Ticket Perforation Stub with Punch Hole Notches */}
      <div className="relative flex md:flex-col items-center justify-between p-6 bg-[#0A0C10] md:border-l border-t md:border-t-0 border-dashed border-[#30363D] md:w-56 shrink-0">
        {/* Top & Bottom Circular Punch Hole Notches */}
        <div className="hidden md:block absolute -top-3 -left-3 w-6 h-6 rounded-full bg-[#0A0C10] border-b border-r border-[#30363D]" />
        <div className="hidden md:block absolute -bottom-3 -left-3 w-6 h-6 rounded-full bg-[#0A0C10] border-t border-r border-[#30363D]" />

        {/* QR Visualizer Container */}
        <div className="relative flex md:flex-col items-center gap-3 text-center w-full">
          <div className="relative p-2.5 rounded-xl bg-white shadow-xl flex items-center justify-center">
            <QRCodeSVG
              value={`CAMPUSHUB-PASS:${passCode}:${registration._id}`}
              size={100}
              level="M"
            />

            {/* Void Stamp Overlay if Cancelled */}
            {isCancelled && (
              <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <span className="ticket-stamp-void text-xs px-2 py-0.5 bg-rose-500/20 rounded">
                  VOIDED
                </span>
              </div>
            )}
          </div>

          {/* Pass ID & Barcode simulation */}
          <div className="flex flex-col text-left md:text-center">
            <span className="text-[10px] uppercase font-mono tracking-widest text-slate-500">
              VERIFICATION PASS
            </span>
            <span
              className={`text-xs font-mono font-extrabold tracking-wider ${
                isCancelled ? 'text-rose-400 line-through' : 'text-indigo-400'
              }`}
            >
              {passCode}
            </span>
          </div>
        </div>

        {/* Mock Barcode Visualizer */}
        <div className="w-full hidden md:flex items-center justify-center gap-0.5 h-6 opacity-40 my-2">
          {[12, 24, 8, 16, 28, 10, 20, 14, 26, 8, 18, 12, 22, 16, 24, 10, 28, 14].map(
            (height, idx) => (
              <div
                key={idx}
                className="w-1 bg-slate-400 rounded-sm"
                style={{ height: `${height}px` }}
              />
            )
          )}
        </div>

        {/* Cancel Reservation Action */}
        {!isCancelled && !isPast && onCancel && (
          <div className="w-full mt-3 md:mt-0">
            <button
              type="button"
              id={`cancel-pass-${registration._id}`}
              onClick={() => onCancel(registration)}
              className="btn-danger w-full !py-2 !px-3 !text-xs font-mono font-semibold"
            >
              Cancel Reservation
            </button>
          </div>
        )}

        {isCancelled && (
          <div className="w-full text-center mt-2">
            <span className="text-[10px] font-mono text-slate-500">Seat Returned to Pool</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default RegistrationCard;
