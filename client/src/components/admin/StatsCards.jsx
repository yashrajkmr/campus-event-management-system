import React from 'react';
import {
  Calendar,
  Ticket,
  Percent,
  CheckCircle2,
  AlertOctagon,
  Users,
} from 'lucide-react';

const StatsCards = ({ stats }) => {
  if (!stats) return null;

  // 4 Required Overview Metrics from Section 5:
  // 1. Total Events
  // 2. Total Registered Attendees
  // 3. Sold Out Events
  // 4. Capacity Utilization Rate (%)
  const cards = [
    {
      title: 'Total Events',
      value: stats.totalEvents || 0,
      sub: 'All scheduled & catalog events',
      icon: <Calendar className="w-5 h-5 text-indigo-400" />,
      color: 'from-indigo-500/15 to-transparent border-indigo-500/30',
      tag: 'Catalog',
    },
    {
      title: 'Total Registered Attendees',
      value: stats.activeRegistrations || 0,
      sub: `${stats.checkedInCount || 0} attendees verified check-in`,
      icon: <Ticket className="w-5 h-5 text-[#10B981]" />,
      color: 'from-emerald-500/15 to-transparent border-emerald-500/30',
      tag: 'Confirmed',
    },
    {
      title: 'Sold Out Events',
      value: stats.soldOutEvents || 0,
      sub: '100% capacity locked via guards',
      icon: <AlertOctagon className="w-5 h-5 text-[#F43F5E]" />,
      color: 'from-rose-500/15 to-transparent border-rose-500/30',
      tag: 'Closed',
    },
    {
      title: 'Capacity Utilization Rate',
      value: `${stats.occupancyRate || 0}%`,
      sub: `${stats.totalBooked || 0} / ${stats.totalCapacity || 0} seats filled`,
      icon: <Percent className="w-5 h-5 text-[#F59E0B]" />,
      color: 'from-amber-500/15 to-transparent border-amber-500/30',
      tag: 'Utilization',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
      {cards.map((card, idx) => (
        <div
          key={idx}
          className={`relative overflow-hidden rounded-2xl bg-[#161B22] border bg-gradient-to-br ${card.color} p-5 sm:p-6 transition-all duration-200 hover:border-slate-500 shadow-xl`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
              {card.title}
            </span>
            <div className="w-9 h-9 rounded-xl bg-[#0A0C10] border border-[#30363D] flex items-center justify-center shadow">
              {card.icon}
            </div>
          </div>

          <div className="mt-3">
            <div className="text-3xl font-extrabold font-display text-white tracking-tight">
              {card.value}
            </div>
            <div className="mt-1 flex items-center justify-between text-xs text-slate-400 font-mono">
              <span>{card.sub}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatsCards;
