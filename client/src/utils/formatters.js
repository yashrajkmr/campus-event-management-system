// Format date into human-readable string
export const formatDate = (dateString, includeTime = true) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return 'Invalid Date';

  const options = {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    ...(includeTime
      ? {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        }
      : {}),
  };
  return date.toLocaleDateString('en-US', options);
};

// Format short date (e.g. Oct 24, 2026)
export const formatShortDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return 'Invalid Date';
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

// Get visual theme & config for Event Types
export const getEventTypeConfig = (type) => {
  const configs = {
    Technical: {
      bg: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
      badgeBg: 'bg-cyan-500/20',
      dot: 'bg-cyan-400',
      gradient: 'from-cyan-500 to-blue-600',
    },
    Workshop: {
      bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
      badgeBg: 'bg-emerald-500/20',
      dot: 'bg-emerald-400',
      gradient: 'from-emerald-500 to-teal-600',
    },
    Seminar: {
      bg: 'bg-violet-500/10 text-violet-400 border-violet-500/30',
      badgeBg: 'bg-violet-500/20',
      dot: 'bg-violet-400',
      gradient: 'from-violet-500 to-purple-600',
    },
    Hackathon: {
      bg: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
      badgeBg: 'bg-amber-500/20',
      dot: 'bg-amber-400',
      gradient: 'from-amber-500 to-orange-600',
    },
    Cultural: {
      bg: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
      badgeBg: 'bg-rose-500/20',
      dot: 'bg-rose-400',
      gradient: 'from-rose-500 to-pink-600',
    },
    Academic: {
      bg: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30',
      badgeBg: 'bg-indigo-500/20',
      dot: 'bg-indigo-400',
      gradient: 'from-indigo-500 to-blue-600',
    },
  };
  return (
    configs[type] || {
      bg: 'bg-slate-500/10 text-slate-400 border-slate-500/30',
      badgeBg: 'bg-slate-500/20',
      dot: 'bg-slate-400',
      gradient: 'from-slate-600 to-slate-700',
    }
  );
};

// Generate and trigger download for iCalendar (.ics) file
export const downloadCalendarEvent = (event) => {
  if (!event) return;
  const startDate = new Date(event.eventDate);
  const endDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1000); // 2 hours duration

  const formatICSDate = (date) => {
    return date.toISOString().replace(/-|:|\.\d+/g, '');
  };

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Campus Event Management//EN',
    'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT',
    `UID:${event._id}@campusevents.edu`,
    `DTSTAMP:${formatICSDate(new Date())}`,
    `DTSTART:${formatICSDate(startDate)}`,
    `DTEND:${formatICSDate(endDate)}`,
    `SUMMARY:${event.title.replace(/,/g, '\\,')}`,
    `DESCRIPTION:${(event.description || '').replace(/\n/g, '\\n')}`,
    `LOCATION:${(event.venue || '').replace(/,/g, '\\,')}`,
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');

  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const link = document.createElement('a');
  link.href = window.URL.createObjectURL(blob);
  link.setAttribute('download', `${event.title.replace(/\s+/g, '_')}.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
