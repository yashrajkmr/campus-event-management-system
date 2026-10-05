import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Ticket,
  Sparkles,
  Calendar,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  RotateCcw,
} from 'lucide-react';
import RegistrationCard from '../components/registrations/RegistrationCard';
import Modal from '../components/common/Modal';
import { registrationService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const MyRegistrationsPage = () => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('active'); // 'active' | 'past' | 'cancelled' | 'all'

  // Cancellation Modal state
  const [cancelModal, setCancelModal] = useState({
    isOpen: false,
    registration: null,
    isProcessing: false,
  });

  useEffect(() => {
    fetchRegistrations();
  }, []);

  const fetchRegistrations = async () => {
    try {
      setLoading(true);
      const res = await registrationService.getMyRegistrations();
      if (res.data.success) {
        setRegistrations(res.data.registrations || []);
      }
    } catch (err) {
      showToast('Failed to load your event reservations', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCancelModal = (registration) => {
    setCancelModal({ isOpen: true, registration, isProcessing: false });
  };

  const handleConfirmCancel = async () => {
    if (!cancelModal.registration) return;
    try {
      setCancelModal((prev) => ({ ...prev, isProcessing: true }));
      const res = await registrationService.cancelRegistration(cancelModal.registration._id);
      if (res.data.success) {
        showToast(
          'Reservation cancelled: Seat was atomically refunded to the event pool!',
          'success'
        );
        setCancelModal({ isOpen: false, registration: null, isProcessing: false });
        fetchRegistrations();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to cancel reservation', 'error');
      setCancelModal((prev) => ({ ...prev, isProcessing: false }));
    }
  };

  // Filter registrations into tabs
  const now = new Date();
  const activeRegistrations = registrations.filter(
    (r) => (r.status === 'ACTIVE' || r.status === 'Registered' || r.status === 'CHECKED_IN') && new Date(r.event?.eventDate) >= now
  );
  const pastRegistrations = registrations.filter(
    (r) => (r.status === 'ACTIVE' || r.status === 'Registered' || r.status === 'CHECKED_IN') && new Date(r.event?.eventDate) < now
  );
  const cancelledRegistrations = registrations.filter((r) => r.status === 'CANCELLED' || r.status === 'Cancelled');

  const displayedRegistrations =
    activeTab === 'active'
      ? activeRegistrations
      : activeTab === 'past'
      ? pastRegistrations
      : activeTab === 'cancelled'
      ? cancelledRegistrations
      : registrations;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#30363D] pb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider mb-1">
            <Ticket className="w-3.5 h-3.5" />
            <span>Digital Ticket Wallet</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold font-display text-white">
            My Passes & Event Reservations
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Logged in as Student: <strong className="text-white">{user?.name || 'Yashraj Kumar'}</strong> ({user?.email})
          </p>
        </div>

        <Link to="/events" className="btn-primary !py-2.5 !px-4 !text-xs self-start sm:self-auto font-semibold">
          <Sparkles className="w-4 h-4" />
          <span>Browse More Events</span>
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-[#30363D] pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('active')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 whitespace-nowrap font-mono ${
            activeTab === 'active'
              ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-[#161B22]'
          }`}
        >
          <span>Active Passes</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/20 text-emerald-300 font-bold">
            {activeRegistrations.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('past')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 whitespace-nowrap font-mono ${
            activeTab === 'past'
              ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-[#161B22]'
          }`}
        >
          <span>Past Events</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-800 text-slate-300">
            {pastRegistrations.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('cancelled')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 whitespace-nowrap font-mono ${
            activeTab === 'cancelled'
              ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-[#161B22]'
          }`}
        >
          <span>Cancelled & Refunded</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] bg-rose-500/20 text-rose-300 font-bold">
            {cancelledRegistrations.length}
          </span>
        </button>
      </div>

      {/* Passes List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2].map((n) => (
            <div
              key={n}
              className="h-44 rounded-2xl bg-[#161B22] border border-[#30363D] animate-pulse"
            />
          ))}
        </div>
      ) : displayedRegistrations.length === 0 ? (
        <div className="text-center py-16 rounded-2xl bg-[#161B22] border border-[#30363D] space-y-4 shadow-xl">
          <Ticket className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-lg font-bold text-white">
            {activeTab === 'active'
              ? 'No active digital passes found'
              : activeTab === 'past'
              ? 'No past events in your attendance history'
              : 'No cancelled registrations'}
          </h3>
          <p className="text-sm text-slate-400 max-w-sm mx-auto">
            {activeTab === 'active'
              ? 'Browse our upcoming workshops and hackathons to secure your confirmed reservation.'
              : 'Past participation records and certificates will appear here automatically.'}
          </p>
          <Link to="/events" className="btn-primary !py-2 !px-4 !text-xs inline-flex font-semibold">
            Browse Event Catalog
          </Link>
        </div>
      ) : (
        <div className="space-y-5">
          {displayedRegistrations.map((reg) => (
            <RegistrationCard
              key={reg._id}
              registration={reg}
              currentUserName={user?.name}
              onCancel={handleOpenCancelModal}
            />
          ))}
        </div>
      )}

      {/* Atomic Cancellation Confirmation Modal */}
      <Modal
        isOpen={cancelModal.isOpen}
        onClose={() =>
          setCancelModal({ isOpen: false, registration: null, isProcessing: false })
        }
        title="Atomic Cancellation & Seat Rollback"
      >
        {cancelModal.registration && (
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs">
              <AlertCircle className="w-5 h-5 shrink-0 text-amber-400 mt-0.5" />
              <div>
                <strong className="font-semibold block text-white mb-1">
                  Surrender reservation and restore seat?
                </strong>
                You are about to cancel your pass for "
                {cancelModal.registration.event?.title}".
                Your seat count will be atomically refunded back into the event pool, your pass code ({cancelModal.registration.passCode}) will be invalidated, and other students will immediately be able to claim the seat.
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#30363D]">
              <button
                type="button"
                onClick={() =>
                  setCancelModal({ isOpen: false, registration: null, isProcessing: false })
                }
                className="btn-secondary !py-2 !px-4 !text-xs"
              >
                Keep My Seat
              </button>
              <button
                type="button"
                id="confirm-cancel-btn"
                onClick={handleConfirmCancel}
                disabled={cancelModal.isProcessing}
                className="btn-danger !py-2 !px-4 !text-xs font-mono font-semibold"
              >
                {cancelModal.isProcessing ? 'Rolling Back Seat...' : 'Confirm Cancellation'}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default MyRegistrationsPage;
