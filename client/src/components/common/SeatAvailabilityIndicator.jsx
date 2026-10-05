import React from 'react';
import { Users, AlertTriangle } from 'lucide-react';

const SeatAvailabilityIndicator = ({
  availableSeats = 0,
  maxParticipants = 0,
  showDetails = true,
  size = 'md',
}) => {
  const max = Math.max(1, maxParticipants);
  const booked = Math.max(0, max - availableSeats);
  const percentage = Math.min(100, Math.round((booked / max) * 100));

  // 2026 UI Accents Directive:
  // - Coral Red (#F43F5E) for Registration Closed / 0 seats
  // - Amber (#F59E0B) for critical capacity (< 5 seats left)
  // - Neon Mint (#10B981) for available seats
  const getColorStyles = () => {
    if (availableSeats <= 0) {
      return {
        bar: 'bg-[#F43F5E]',
        text: 'text-[#F43F5E]',
        label: 'FULL CAPACITY',
        badge: 'bg-[#F43F5E]/15 text-[#F43F5E] border-[#F43F5E]/30',
        isCritical: false,
      };
    }
    if (availableSeats < 5) {
      return {
        bar: 'bg-[#F59E0B]',
        text: 'text-[#F59E0B]',
        label: `CRITICAL: ${availableSeats} SEAT${availableSeats > 1 ? 'S' : ''} LEFT`,
        badge: 'bg-[#F59E0B]/15 text-[#F59E0B] border-[#F59E0B]/30 animate-pulse',
        isCritical: true,
      };
    }
    return {
      bar: 'bg-gradient-to-r from-indigo-500 to-[#10B981]',
      text: 'text-[#10B981]',
      label: 'SEATS AVAILABLE',
      badge: 'bg-[#10B981]/15 text-[#10B981] border-[#10B981]/30',
      isCritical: false,
    };
  };

  const color = getColorStyles();

  return (
    <div className="w-full space-y-1.5 font-sans">
      {showDetails && (
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-slate-400 font-mono">
            <Users className="w-3.5 h-3.5 text-slate-400" />
            <span>
              <strong className="text-white font-semibold">{booked}</strong> / {maxParticipants} Seats Booked
            </span>
          </div>

          <div className="flex items-center gap-1.5 font-mono text-[11px] font-bold">
            {color.isCritical && <AlertTriangle className="w-3.5 h-3.5 text-[#F59E0B] shrink-0" />}
            <span className={color.text}>{color.label}</span>
          </div>
        </div>
      )}

      {/* Progress Bar Container */}
      <div
        className={`w-full bg-[#0A0C10] rounded-full overflow-hidden border border-[#30363D] ${
          size === 'sm' ? 'h-1.5' : size === 'lg' ? 'h-3' : 'h-2'
        }`}
      >
        <div
          className={`h-full transition-all duration-500 ease-out rounded-full ${color.bar}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export default SeatAvailabilityIndicator;
