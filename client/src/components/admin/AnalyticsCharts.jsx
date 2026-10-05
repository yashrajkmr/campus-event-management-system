import React from 'react';
import { BarChart3, PieChart, Clock, Sparkles, User, Calendar } from 'lucide-react';
import { getEventTypeConfig, formatDate, formatShortDate } from '../../utils/formatters';
import StatusBadge from '../common/StatusBadge';

const AnalyticsCharts = ({ categoryStats = [], statusStats = [], recentRegistrations = [] }) => {
  const maxCategoryCount = Math.max(...categoryStats.map((c) => c.count), 1);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Category Breakdown Chart (Col 7) */}
      <div className="lg:col-span-7 glass-card p-6 rounded-2xl space-y-5 border border-slate-800">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-indigo-400" />
            <h3 className="text-base font-bold font-display text-white">
              Events by Category & Capacity
            </h3>
          </div>
          <span className="text-xs text-slate-400">Distribution</span>
        </div>

        <div className="space-y-3.5">
          {categoryStats.length === 0 ? (
            <div className="text-center py-8 text-slate-500 text-sm">
              No category data available
            </div>
          ) : (
            categoryStats.map((cat) => {
              const typeConfig = getEventTypeConfig(cat._id);
              const percentage = Math.round((cat.count / maxCategoryCount) * 100);

              return (
                <div key={cat._id} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${typeConfig.dot}`} />
                      {cat._id}
                    </span>
                    <span className="text-slate-400">
                      <strong className="text-white">{cat.count}</strong> events ({cat.totalCapacity} seats)
                    </span>
                  </div>

                  <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                    <div
                      className={`h-full bg-gradient-to-r ${typeConfig.gradient} rounded-full transition-all duration-700`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Status Breakdown & Lifecycle Health (Col 5) */}
      <div className="lg:col-span-5 glass-card p-6 rounded-2xl space-y-5 border border-slate-800">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <PieChart className="w-5 h-5 text-purple-400" />
            <h3 className="text-base font-bold font-display text-white">
              Event Status Distribution
            </h3>
          </div>
          <span className="text-xs text-slate-400">Live States</span>
        </div>

        <div className="space-y-2.5">
          {statusStats.length === 0 ? (
            <div className="text-center py-8 text-slate-500 text-sm">
              No status data available
            </div>
          ) : (
            statusStats.map((stat) => (
              <div
                key={stat._id}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 transition-colors"
              >
                <StatusBadge status={stat._id} size="sm" />
                <span className="font-bold text-slate-200 text-sm">
                  {stat.count} <span className="text-xs font-normal text-slate-400">events</span>
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Recent Registrations Feed (Full width) */}
      <div className="lg:col-span-12 glass-card p-6 rounded-2xl space-y-4 border border-slate-800">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-emerald-400" />
            <h3 className="text-base font-bold font-display text-white">
              Recent Registration Activity
            </h3>
          </div>
          <span className="text-xs text-slate-400">Real-time bookings</span>
        </div>

        <div className="space-y-2.5">
          {recentRegistrations.length === 0 ? (
            <div className="text-center py-6 text-slate-500 text-sm">
              No registrations recorded yet.
            </div>
          ) : (
            recentRegistrations.map((reg) => (
              <div
                key={reg._id}
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-slate-950/50 border border-slate-800 hover:border-slate-700 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-600 flex items-center justify-center text-xs font-bold text-white shadow">
                    {reg.user?.name ? reg.user.name[0].toUpperCase() : 'S'}
                  </div>
                  <div>
                    <div className="text-xs sm:text-sm font-semibold text-white">
                      {reg.user?.name || 'Student'}
                    </div>
                    <div className="text-xs text-slate-400">
                      Enrolled in <strong className="text-slate-200 font-medium">{reg.event?.title}</strong>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-xs text-slate-400 self-end sm:self-auto">
                  <span className="inline-flex items-center gap-1 font-mono text-slate-400">
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                    {formatDate(reg.createdAt)}
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full font-semibold text-[11px] ${
                      reg.status === 'Registered'
                        ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                        : 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                    }`}
                  >
                    {reg.status}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsCharts;
