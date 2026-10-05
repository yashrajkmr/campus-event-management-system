import React from 'react';

const StatusBadge = ({ status, size = 'md' }) => {
  const sizeClasses = {
    sm: 'text-[11px] font-mono font-bold px-2.5 py-0.5',
    md: 'text-xs font-mono font-bold px-3 py-1',
    lg: 'text-sm font-mono font-bold px-4 py-1.5',
  };

  const getStatusStyles = () => {
    switch (status) {
      case 'Registration Open':
      case 'Open':
        return {
          wrapper: 'bg-[#10B981]/15 text-[#10B981] border-[#10B981]/40 shadow-sm shadow-[#10B981]/10',
          dot: 'bg-[#10B981]',
          pulse: true,
          label: 'REGISTRATION OPEN',
        };
      case 'Registration Closed':
      case 'Closed':
      case 'Sold Out':
        return {
          wrapper: 'bg-[#F43F5E]/15 text-[#F43F5E] border-[#F43F5E]/40 shadow-sm shadow-[#F43F5E]/10',
          dot: 'bg-[#F43F5E]',
          pulse: false,
          label: 'REGISTRATION CLOSED',
        };
      case 'Published':
        return {
          wrapper: 'bg-[#6366F1]/15 text-[#6366F1] border-[#6366F1]/40',
          dot: 'bg-[#6366F1]',
          pulse: false,
          label: 'PUBLISHED',
        };
      case 'Event Completed':
      case 'Completed':
        return {
          wrapper: 'bg-slate-800 text-slate-400 border-[#30363D]',
          dot: 'bg-slate-500',
          pulse: false,
          label: 'CONCLUDED',
        };
      case 'Draft':
        return {
          wrapper: 'bg-slate-900 text-slate-400 border-[#30363D]',
          dot: 'bg-slate-600',
          pulse: false,
          label: 'DRAFT',
        };
      default:
        return {
          wrapper: 'bg-slate-800 text-slate-300 border-[#30363D]',
          dot: 'bg-slate-400',
          pulse: false,
          label: status || 'UNKNOWN',
        };
    }
  };

  const style = getStatusStyles();

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border tracking-wide uppercase transition-all ${
        sizeClasses[size] || sizeClasses.md
      } ${style.wrapper}`}
    >
      <span className="relative flex h-2 w-2">
        {style.pulse && (
          <span
            className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${style.dot}`}
          />
        )}
        <span className={`relative inline-flex rounded-full h-2 w-2 ${style.dot}`} />
      </span>
      <span>{style.label}</span>
    </span>
  );
};

export default StatusBadge;
