import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  LayoutDashboard,
  PlusCircle,
  Calendar,
  Sparkles,
  ArrowRight,
  ListOrdered,
  Eye,
  RefreshCw,
  UserCheck,
} from 'lucide-react';
import StatsCards from '../../components/admin/StatsCards';
import AnalyticsCharts from '../../components/admin/AnalyticsCharts';
import StatusBadge from '../../components/common/StatusBadge';
import AttendeeListModal from '../../components/events/AttendeeListModal';
import { eventService } from '../../services/api';
import { formatDate } from '../../utils/formatters';
import { useToast } from '../../context/ToastContext';

const AdminDashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAttendeeEvent, setSelectedAttendeeEvent] = useState(null);
  const { showToast } = useToast();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, eventsRes] = await Promise.all([
        eventService.getStats(),
        eventService.getEvents({ limit: 8, sort: 'date_asc' }),
      ]);

      if (statsRes.data.success) {
        setStats(statsRes.data.stats);
      }
      if (eventsRes.data.success) {
        setEvents(eventsRes.data.events || []);
      }
    } catch (err) {
      showToast('Failed to load admin analytics', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#30363D] pb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-purple-400 uppercase tracking-wider mb-1">
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>Faculty & Operations Control Console</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold font-display text-white">
            Administration & Telemetry
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Logged in as Faculty Admin: <strong className="text-white">Dr. Tegil</strong> (admin@campus.edu)
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={fetchDashboardData}
            className="btn-secondary !py-2.5 !px-3.5 !text-xs font-mono"
            title="Refresh Telemetry"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>
          <Link
            to="/admin/manage-events"
            className="btn-secondary !py-2.5 !px-4 !text-xs font-mono"
          >
            <ListOrdered className="w-3.5 h-3.5 text-indigo-400" />
            <span>Manage All Events</span>
          </Link>
          <Link
            to="/admin/create-event"
            className="btn-primary !py-2.5 !px-4 !text-xs font-semibold shadow-lg shadow-indigo-500/25"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create New Event</span>
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center space-y-3 font-mono">
          <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-slate-400">Loading campus analytics & seat concurrency metrics...</p>
        </div>
      ) : (
        <>
          {/* Key Metric Overview Cards */}
          <StatsCards stats={stats} />

          {/* Analytics Visual Charts */}
          <AnalyticsCharts
            categoryStats={stats?.categoryStats || []}
            statusStats={stats?.statusStats || []}
            recentRegistrations={stats?.recentRegistrations || []}
          />

          {/* Quick Events Overview & Attendee Roster Table */}
          <div className="rounded-2xl bg-[#161B22] border border-[#30363D] p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-[#30363D] pb-3">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-indigo-400" />
                <h3 className="text-base font-bold font-display text-white">
                  Upcoming Events & Attendee Rosters
                </h3>
              </div>
              <Link
                to="/admin/manage-events"
                className="text-xs font-mono font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
              >
                <span>Full Catalog</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#30363D] text-slate-400 font-mono uppercase text-[10px] tracking-wider">
                    <th className="py-3 px-3">Title & Speaker</th>
                    <th className="py-3 px-3">Category</th>
                    <th className="py-3 px-3">Date</th>
                    <th className="py-3 px-3">Seat Progress</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#30363D]/60 font-sans">
                  {events.map((evt) => (
                    <tr key={evt._id} className="hover:bg-[#1F242C] transition-colors">
                      <td className="py-3 px-3 max-w-xs">
                        <div className="font-bold text-white truncate">{evt.title}</div>
                        <div className="text-[11px] text-slate-400 font-mono truncate">{evt.resourcePerson}</div>
                      </td>
                      <td className="py-3 px-3">
                        <span className="font-mono text-slate-300">{evt.eventType}</span>
                      </td>
                      <td className="py-3 px-3 text-slate-300 font-mono text-[11px] whitespace-nowrap">
                        {formatDate(evt.eventDate, false)}
                      </td>
                      <td className="py-3 px-3 font-mono font-semibold text-slate-200">
                        <span className={evt.availableSeats === 0 ? 'text-[#F43F5E]' : evt.availableSeats < 5 ? 'text-[#F59E0B]' : 'text-[#10B981]'}>
                          {evt.maxParticipants - evt.availableSeats}
                        </span>{' '}
                        / {evt.maxParticipants} Booked
                      </td>
                      <td className="py-3 px-3">
                        <StatusBadge status={evt.status} size="sm" />
                      </td>
                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => setSelectedAttendeeEvent(evt)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/25 font-mono text-xs font-semibold"
                            title="Open Attendee Roster Table & Check-In"
                          >
                            <UserCheck className="w-3.5 h-3.5" />
                            <span>Roster</span>
                          </button>
                          <Link
                            to={`/events/${evt._id}`}
                            className="p-1.5 rounded-lg bg-[#21262D] text-slate-300 hover:text-white border border-[#30363D]"
                            title="View Public Event Page"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </Link>
                          <Link
                            to={`/admin/edit-event/${evt._id}`}
                            className="px-2.5 py-1 rounded-lg bg-purple-500/15 text-purple-300 border border-purple-500/30 hover:bg-purple-500/25 font-mono text-xs font-semibold"
                          >
                            Edit
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Attendee Roster Modal */}
      {selectedAttendeeEvent && (
        <AttendeeListModal
          isOpen={!!selectedAttendeeEvent}
          onClose={() => setSelectedAttendeeEvent(null)}
          eventId={selectedAttendeeEvent._id}
          eventTitle={selectedAttendeeEvent.title}
        />
      )}
    </div>
  );
};

export default AdminDashboardPage;
