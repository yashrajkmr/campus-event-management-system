import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Calendar,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
  Ticket,
  ArrowRight,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import EventCard from '../components/events/EventCard';
import EventFilters from '../components/events/EventFilters';
import Modal from '../components/common/Modal';
import { eventService, registrationService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const EventsDiscoveryPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, isAuthenticated, isAdmin } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [events, setEvents] = useState([]);
  const [totalEvents, setTotalEvents] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('page') || '1', 10));
  const [loading, setLoading] = useState(true);

  // Multi-parameter Filters State
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [selectedType, setSelectedType] = useState(searchParams.get('type') || 'All');
  const [selectedVenue, setSelectedVenue] = useState(searchParams.get('venue') || 'All');
  const [selectedDate, setSelectedDate] = useState(searchParams.get('date') || 'All');
  const [availableOnly, setAvailableOnly] = useState(searchParams.get('availableOnly') === 'true');
  const [selectedStatus, setSelectedStatus] = useState(searchParams.get('status') || 'All');
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'date');
  const [viewMode, setViewMode] = useState('grid');

  // Confirmation Modal State (Delete or Register)
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, eventId: null, eventTitle: '' });
  const [registerModal, setRegisterModal] = useState({
    isOpen: false,
    event: null,
    isProcessing: false,
    confirmedPass: null,
  });

  // Fetch events when any filter or page updates
  useEffect(() => {
    fetchEvents();
  }, [search, selectedType, selectedVenue, selectedDate, availableOnly, selectedStatus, sortBy, currentPage]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: 9,
        sort: sortBy,
      };

      if (search.trim()) params.search = search.trim();
      if (selectedType !== 'All') params.type = selectedType;
      if (selectedVenue !== 'All') params.venue = selectedVenue;
      if (selectedDate !== 'All') params.date = selectedDate;
      if (availableOnly) params.availableOnly = 'true';
      if (selectedStatus !== 'All') params.status = selectedStatus;

      const res = await eventService.getEvents(params);
      if (res.data.success) {
        setEvents(res.data.events || []);
        setTotalEvents(res.data.total || 0);
        setTotalPages(res.data.totalPages || 1);
      }
    } catch (err) {
      showToast('Failed to load events catalog', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleResetFilters = () => {
    setSearch('');
    setSelectedType('All');
    setSelectedVenue('All');
    setSelectedDate('All');
    setAvailableOnly(false);
    setSelectedStatus('All');
    setSortBy('date');
    setCurrentPage(1);
  };

  // Instant booking reservation flow
  const handleRegisterClick = (event) => {
    if (!isAuthenticated) {
      showToast('Please sign in to reserve event tickets', 'info');
      navigate('/login');
      return;
    }
    setRegisterModal({
      isOpen: true,
      event,
      isProcessing: false,
      confirmedPass: null,
    });
  };

  const handleConfirmRegistration = async () => {
    if (!registerModal.event) return;
    try {
      setRegisterModal((prev) => ({ ...prev, isProcessing: true }));
      const res = await registrationService.registerForEvent(registerModal.event._id);
      if (res.data.success) {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#6366F1', '#10B981', '#38BDF8'],
        });

        showToast(`Pass confirmed: ${res.data.passCode || 'CHUB-PASS'}!`, 'success');

        setRegisterModal((prev) => ({
          ...prev,
          isProcessing: false,
          confirmedPass: res.data.registration,
        }));

        // Refresh events in background to show updated seat availability
        fetchEvents();
      }
    } catch (err) {
      const errorMsg =
        err.response?.status === 409
          ? '409 Conflict: Event Capacity Reached (Sold Out)'
          : err.response?.data?.message || 'Reservation failed';
      showToast(errorMsg, 'error');
      setRegisterModal((prev) => ({ ...prev, isProcessing: false }));
    }
  };

  // Admin delete handler
  const handleDeleteClick = (eventId, eventTitle) => {
    setDeleteModal({ isOpen: true, eventId, eventTitle });
  };

  const handleConfirmDelete = async () => {
    if (!deleteModal.eventId) return;
    try {
      const res = await eventService.deleteEvent(deleteModal.eventId);
      if (res.data.success) {
        showToast('Event removed from catalog successfully', 'success');
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#30363D] pb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-indigo-400 uppercase tracking-wider mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Campus Event Engine & Ticket Lab</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold font-display text-white">
            Discover Events & Workshops
          </h1>
        </div>
      </div>

      {/* Multi-parameter Filter & Search Bar */}
      <EventFilters
        search={search}
        setSearch={(s) => {
          setSearch(s);
          setCurrentPage(1);
        }}
        selectedType={selectedType}
        setSelectedType={(t) => {
          setSelectedType(t);
          setCurrentPage(1);
        }}
        selectedVenue={selectedVenue}
        setSelectedVenue={(v) => {
          setSelectedVenue(v);
          setCurrentPage(1);
        }}
        selectedDate={selectedDate}
        setSelectedDate={(d) => {
          setSelectedDate(d);
          setCurrentPage(1);
        }}
        availableOnly={availableOnly}
        setAvailableOnly={(a) => {
          setAvailableOnly(a);
          setCurrentPage(1);
        }}
        selectedStatus={selectedStatus}
        setSelectedStatus={(st) => {
          setSelectedStatus(st);
          setCurrentPage(1);
        }}
        sortBy={sortBy}
        setSortBy={setSortBy}
        viewMode={viewMode}
        setViewMode={setViewMode}
        onReset={handleResetFilters}
        totalEvents={totalEvents}
      />

      {/* Events Grid / List */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 py-6">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div
              key={n}
              className="h-80 rounded-2xl bg-[#161B22] border border-[#30363D] animate-pulse"
            />
          ))}
        </div>
      ) : events.length === 0 ? (
        <div className="text-center py-20 rounded-2xl bg-[#161B22] border border-[#30363D] space-y-4">
          <Calendar className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-lg font-bold text-white">No matching events found</h3>
          <p className="text-sm text-slate-400 max-w-sm mx-auto">
            Try adjusting your search criteria or clearing selected category, venue, and date filters.
          </p>
          <button
            onClick={handleResetFilters}
            className="btn-secondary !py-2 !px-4 !text-xs mx-auto"
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        <div
          className={
            viewMode === 'grid'
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
              : 'flex flex-col gap-4'
          }
        >
          {events.map((event) => (
            <EventCard
              key={event._id}
              event={event}
              onRegister={handleRegisterClick}
              onDelete={handleDeleteClick}
            />
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 pt-6 border-t border-[#30363D]">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="btn-secondary !py-2 !px-3.5 !text-xs font-mono"
          >
            <ChevronLeft className="w-4 h-4" /> Previous
          </button>

          <span className="text-xs font-mono font-semibold text-slate-300 px-3">
            Page <strong className="text-white">{currentPage}</strong> of {totalPages}
          </span>

          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="btn-secondary !py-2 !px-3.5 !text-xs font-mono"
          >
            Next <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Concurrency Booking & Pass Confirmation Modal */}
      <Modal
        isOpen={registerModal.isOpen}
        onClose={() =>
          setRegisterModal({
            isOpen: false,
            event: null,
            isProcessing: false,
            confirmedPass: null,
          })
        }
        title={registerModal.confirmedPass ? 'Digital Ticket Pass Issued' : 'Confirm Seat Reservation'}
      >
        {registerModal.event && (
          <div className="space-y-4">
            {registerModal.confirmedPass ? (
              /* Success Pass View with Pass Code */
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    <span className="font-bold text-sm">Atomic Reservation Successful!</span>
                  </div>
                  <p className="text-xs text-slate-300">
                    Your seat has been reserved through atomic conditional writes. Your digital pass is verified.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-[#0A0C10] border border-[#30363D] text-center space-y-1">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400">
                    Cryptographic Digital Pass Code
                  </span>
                  <div className="text-xl font-mono font-extrabold text-indigo-400 tracking-wider">
                    {registerModal.confirmedPass.passCode}
                  </div>
                  <div className="text-[11px] text-slate-400 pt-1">
                    Event: <strong className="text-white">{registerModal.event.title}</strong>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#30363D]">
                  <button
                    type="button"
                    onClick={() =>
                      setRegisterModal({
                        isOpen: false,
                        event: null,
                        isProcessing: false,
                        confirmedPass: null,
                      })
                    }
                    className="btn-secondary !py-2 !px-4 !text-xs"
                  >
                    Done
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setRegisterModal({
                        isOpen: false,
                        event: null,
                        isProcessing: false,
                        confirmedPass: null,
                      });
                      navigate('/my-passes');
                    }}
                    className="btn-primary !py-2 !px-4 !text-xs flex items-center gap-1.5"
                  >
                    <Ticket className="w-4 h-4" />
                    <span>Open My Passes</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ) : (
              /* Pre-booking confirmation view */
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-[#0A0C10] border border-[#30363D] space-y-2">
                  <h4 className="font-bold text-white text-base">
                    {registerModal.event.title}
                  </h4>
                  <div className="text-xs text-slate-400 space-y-1">
                    <div>
                      <strong className="text-slate-300">Speaker:</strong> {registerModal.event.resourcePerson}
                    </div>
                    <div>
                      <strong className="text-slate-300">Venue:</strong> {registerModal.event.venue}
                    </div>
                    <div>
                      <strong className="text-slate-300">Seats Remaining:</strong>{' '}
                      <span className="text-emerald-400 font-mono font-bold">
                        {registerModal.event.availableSeats}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/25 text-xs text-indigo-300">
                  ⚡ <strong>Concurrency Safety:</strong> Your reservation is executed via an atomic conditional decrement directly in MongoDB. Overbooking is strictly guarded against.
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#30363D]">
                  <button
                    type="button"
                    onClick={() =>
                      setRegisterModal({
                        isOpen: false,
                        event: null,
                        isProcessing: false,
                        confirmedPass: null,
                      })
                    }
                    className="btn-secondary !py-2 !px-4 !text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmRegistration}
                    disabled={registerModal.isProcessing}
                    className="btn-primary !py-2 !px-5 !text-xs"
                  >
                    {registerModal.isProcessing ? 'Locking Seat...' : 'Confirm & Issue Pass'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Modal (Admin) */}
      <Modal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, eventId: null, eventTitle: '' })}
        title="Delete Event"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <div>
              <strong className="font-semibold block text-white mb-1">
                Are you sure you want to permanently delete this event?
              </strong>
              "{deleteModal.eventTitle}" will be deleted, and all attendee registrations associated with it will be revoked.
            </div>
          </div>

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

export default EventsDiscoveryPage;
