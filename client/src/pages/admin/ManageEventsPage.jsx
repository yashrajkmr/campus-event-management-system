import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ListOrdered,
  Search,
  PlusCircle,
  Edit3,
  Trash2,
  Users,
  Eye,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Filter,
} from 'lucide-react';
import StatusBadge from '../../components/common/StatusBadge';
import AttendeeListModal from '../../components/events/AttendeeListModal';
import Modal from '../../components/common/Modal';
import { eventService } from '../../services/api';
import { formatDate } from '../../utils/formatters';
import { useToast } from '../../context/ToastContext';

const EVENT_STATUSES = ['Draft', 'Published', 'Registration Open', 'Registration Closed', 'Event Completed'];

const ManageEventsPage = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalEvents, setTotalEvents] = useState(0);
  const { showToast } = useToast();

  // Attendees Modal
  const [attendeeModal, setAttendeeModal] = useState({
    isOpen: false,
    eventId: null,
    eventTitle: '',
  });

  // Delete Modal
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    eventId: null,
    eventTitle: '',
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchEvents();
    }, 200);
    return () => clearTimeout(timer);
  }, [search, statusFilter, currentPage]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: 10,
        sort: 'date_desc',
      };
      if (search.trim()) params.search = search.trim();
      if (statusFilter !== 'All') params.status = statusFilter;

      const res = await eventService.getEvents(params);
      if (res.data.success) {
        setEvents(res.data.events || []);
        setTotalPages(res.data.totalPages || 1);
        setTotalEvents(res.data.total || 0);
      }
    } catch (err) {
      showToast('Failed to load events list', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickStatusChange = async (eventId, newStatus) => {
    try {
      const res = await eventService.updateEvent(eventId, { status: newStatus });
      if (res.data.success) {
        showToast(`Event status updated to "${newStatus}"`, 'success');
        setEvents((prev) =>
          prev.map((e) => (e._id === eventId ? { ...e, status: newStatus } : e))
        );
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update status', 'error');
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteModal.eventId) return;
    try {
      const res = await eventService.deleteEvent(deleteModal.eventId);
      if (res.data.success) {
        showToast('Event deleted successfully', 'success');
        setDeleteModal({ isOpen: false, eventId: null, eventTitle: '' });
        fetchEvents();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to delete event', 'error');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div className="space-y-1">
          <Link
            to="/admin/dashboard"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
          </Link>
          <h1 className="text-3xl sm:text-4xl font-extrabold font-display text-white">
            Manage All Campus Events
          </h1>
        </div>

        <Link to="/admin/create-event" className="btn-primary !py-2.5 !px-4 !text-xs self-start sm:self-auto">
          <PlusCircle className="w-4 h-4" />
          <span>Create New Event</span>
        </Link>
      </div>

      {/* Filter Row */}
      <div className="glass-card p-4 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by title, venue, or speaker..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="glass-input w-full pl-10 pr-4 py-2 text-xs sm:text-sm"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="glass-input py-2 px-3 text-xs sm:text-sm bg-slate-900 w-full sm:w-auto cursor-pointer"
          >
            <option value="All">All Statuses ({totalEvents})</option>
            {EVENT_STATUSES.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="glass-card rounded-2xl border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 uppercase tracking-wider">
                <th className="py-3.5 px-4 font-semibold">Event Title & Speaker</th>
                <th className="py-3.5 px-4 font-semibold">Type</th>
                <th className="py-3.5 px-4 font-semibold">Event Date</th>
                <th className="py-3.5 px-4 font-semibold">Seats Booked</th>
                <th className="py-3.5 px-4 font-semibold">Status Lifecycle</th>
                <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-400">
                    <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    Loading events...
                  </td>
                </tr>
              ) : events.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-400">
                    No events found matching your criteria.
                  </td>
                </tr>
              ) : (
                events.map((evt) => {
                  const booked = evt.maxParticipants - evt.availableSeats;
                  return (
                    <tr key={evt._id} className="hover:bg-slate-900/40 transition-colors">
                      <td className="py-3.5 px-4 max-w-xs">
                        <Link
                          to={`/events/${evt._id}`}
                          className="font-bold text-white hover:text-indigo-300 transition-colors block truncate"
                        >
                          {evt.title}
                        </Link>
                        <div className="text-[11px] text-slate-400 truncate">
                          {evt.resourcePerson} • <span className="text-slate-500">{evt.venue}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-slate-300">{evt.eventType}</span>
                      </td>

                      <td className="py-3.5 px-4 text-slate-300 whitespace-nowrap font-mono text-[11px]">
                        {formatDate(evt.eventDate)}
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="font-semibold text-slate-200">
                          <span className="text-emerald-400">{booked}</span> / {evt.maxParticipants}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {evt.availableSeats} available
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <select
                          value={evt.status}
                          onChange={(e) => handleQuickStatusChange(evt._id, e.target.value)}
                          className="text-[11px] font-semibold py-1 px-2.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 cursor-pointer focus:ring-1 focus:ring-indigo-500"
                        >
                          {EVENT_STATUSES.map((st) => (
                            <option key={st} value={st}>
                              {st}
                            </option>
                          ))}
                        </select>
                      </td>

                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() =>
                              setAttendeeModal({
                                isOpen: true,
                                eventId: evt._id,
                                eventTitle: evt.title,
                              })
                            }
                            className="p-1.5 rounded-lg bg-slate-800 text-emerald-400 hover:bg-slate-700 hover:text-emerald-300 transition-colors"
                            title="View Attendee Roster"
                          >
                            <Users className="w-4 h-4" />
                          </button>
                          <Link
                            to={`/admin/edit-event/${evt._id}`}
                            className="p-1.5 rounded-lg bg-purple-500/15 text-purple-300 border border-purple-500/30 hover:bg-purple-500/25 transition-colors"
                            title="Edit Event"
                          >
                            <Edit3 className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() =>
                              setDeleteModal({
                                isOpen: true,
                                eventId: evt._id,
                                eventTitle: evt.title,
                              })
                            }
                            className="p-1.5 rounded-lg bg-rose-500/15 text-rose-300 border border-rose-500/30 hover:bg-rose-500/25 transition-colors"
                            title="Delete Event"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-800 bg-slate-950/40 text-xs">
            <span className="text-slate-400">
              Page <strong className="text-white">{currentPage}</strong> of {totalPages}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="btn-secondary !py-1 !px-2.5 !text-xs"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="btn-secondary !py-1 !px-2.5 !text-xs"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Attendees Modal */}
      <AttendeeListModal
        isOpen={attendeeModal.isOpen}
        onClose={() => setAttendeeModal({ isOpen: false, eventId: null, eventTitle: '' })}
        eventId={attendeeModal.eventId}
        eventTitle={attendeeModal.eventTitle}
      />

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, eventId: null, eventTitle: '' })}
        title="Delete Event"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-300 leading-relaxed">
            Are you sure you want to delete <strong className="text-white">"{deleteModal.eventTitle}"</strong>?
            All registrations for this event will be permanently revoked.
          </p>
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              onClick={() => setDeleteModal({ isOpen: false, eventId: null, eventTitle: '' })}
              className="btn-secondary !py-2 !px-4 !text-xs"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmDelete}
              className="btn-danger !py-2 !px-4 !text-xs"
            >
              Confirm Delete
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ManageEventsPage;
