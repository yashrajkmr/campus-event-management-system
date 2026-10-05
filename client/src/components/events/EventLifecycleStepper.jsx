import React from 'react';
import { CheckCircle2, Circle, ArrowRight, Sparkles } from 'lucide-react';

const STAGES = [
  { key: 'Draft', label: 'Draft', desc: 'Private event staging' },
  { key: 'Published', label: 'Published', desc: 'Visible on catalog' },
  { key: 'Registration Open', label: 'Registration Open', desc: 'Accepting bookings' },
  { key: 'Registration Closed', label: 'Registration Closed', desc: 'Seats full or locked' },
  { key: 'Event Completed', label: 'Event Completed', desc: 'Event concluded' },
];

const EventLifecycleStepper = ({ currentStatus, onStatusChange, readOnly = false }) => {
  const currentIndex = STAGES.findIndex((s) => s.key === currentStatus);

  return (
    <div className="w-full bg-slate-900/90 border border-slate-800 rounded-2xl p-5 sm:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-indigo-400" />
          <h4 className="text-sm font-bold text-white uppercase tracking-wider">
            Event Lifecycle Progression
          </h4>
        </div>
        <span className="text-xs text-slate-400">
          Current State: <strong className="text-indigo-300 font-semibold">{currentStatus}</strong>
        </span>
      </div>

      {/* Stepper Steps */}
      <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 relative">
        {STAGES.map((stage, idx) => {
          const isCurrent = stage.key === currentStatus;
          const isPast = currentIndex > idx;
          const isUpcoming = currentIndex < idx;

          return (
            <button
              key={stage.key}
              type="button"
              disabled={readOnly}
              onClick={() => onStatusChange && onStatusChange(stage.key)}
              className={`relative flex flex-col items-start p-3 rounded-xl border text-left transition-all ${
                isCurrent
                  ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-lg shadow-indigo-500/10 scale-[1.02]'
                  : isPast
                  ? 'bg-slate-950/60 border-slate-800/80 text-slate-300 hover:border-slate-700'
                  : 'bg-slate-950/30 border-slate-800/40 text-slate-500 hover:border-slate-700 hover:text-slate-400'
              } ${readOnly ? 'cursor-default' : 'cursor-pointer'}`}
            >
              {/* Top Row */}
              <div className="flex items-center justify-between w-full mb-1.5">
                <span className="text-[11px] font-mono font-bold text-slate-400">
                  0{idx + 1}
                </span>
                {isPast ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                ) : isCurrent ? (
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-500" />
                  </span>
                ) : (
                  <Circle className="w-3.5 h-3.5 text-slate-600" />
                )}
              </div>

              {/* Title & Description */}
              <span className={`text-xs font-bold ${isCurrent ? 'text-indigo-200' : 'text-slate-200'}`}>
                {stage.label}
              </span>
              <span className="text-[10px] text-slate-400 leading-tight mt-0.5 line-clamp-1">
                {stage.desc}
              </span>
            </button>
          );
        })}
      </div>

      {!readOnly && (
        <p className="text-[11px] text-slate-400 text-center">
          💡 Click any stage box above to immediately transition this event to that lifecycle state.
        </p>
      )}
    </div>
  );
};

export default EventLifecycleStepper;
