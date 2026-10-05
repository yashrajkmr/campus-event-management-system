import React, { useState, useEffect } from 'react';
import {
  Download,
  Search,
  Users,
  Mail,
  Calendar,
  UserCheck,
  CheckCircle2,
  Clock,
  ShieldCheck,
  XCircle,
  Scan,
} from 'lucide-react';
import Modal from '../common/Modal';
import { eventService, registrationService } from '../../services/api';
import { formatDate } from '../../utils/formatters';
import { useToast } from '../../context/ToastContext';

const AttendeeListModal = ({ isOpen, onClose, eventId, eventTitle }) => {
  const [attendees, setAttendees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [scanCode, setScanCode] = useState('');
  const [checkingInId, setCheckingInId] = useState(null);
  const { showToast } = useToast();

  useEffect(() => {
    if (isOpen && eventId) {
      fetchAttendees();
    }
  }, [isOpen, eventId]);

  const fetchAttendees = async () => {
    try {
      setLoading(true);
      const res = await eventService.getEventAttendees(eventId);
      if (res.data.success) {
        setAttendees(res.data.attendees || []);
      }
    } catch (err) {
      showToast('Failed to load attendee roster', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async (registrationId, passCode) => {
    try {
      setCheckingInId(registrationId);
      const res = await registrationService.checkInAttendee(registrationId, passCode);
      if (res.data.success) {
        showToast(res.data.message || 'Attendee checked in!', 'success');
        // Update local attendee state
        setAttendees((prev) =>
          prev.map((a) =>
            a._id === registrationId
              ? { ...a, status: 'CHECKED_IN', checkedInAt: new Date() }
              : a
          )
        );
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Check-in failed', 'error');
    } finally {
      setCheckingInId(null);
    }
  };

  const handleVerifyByPassCode = async (e) => {
    e.preventDefault();
    if (!scanCode.trim()) return;
    try {
      const res = await registrationService.verifyPass(scanCode.trim());
      if (res.data.success) {
        showToast(`Pass Verified: ${res.data.registration?.user?.name || 'Attendee'} Checked In!`, 'success');
        setScanCode('');
        fetchAttendees();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Invalid or revoked pass code', 'error');
    }
  };

  const filteredAttendees = attendees.filter((item) => {
    const term = search.toLowerCase();
    const pass = (item.passCode || '').toLowerCase();
    return (
      item.user?.name?.toLowerCase().includes(term) ||
      item.user?.email?.toLowerCase().includes(term) ||
      pass.includes(term)
    );
  });

  const exportCSV = () => {
    if (attendees.length === 0) return;

    const headers = ['Student Name', 'Email', 'Digital Pass Code', 'Status', 'Registered At', 'Checked In At'];
    const rows = attendees.map((a) => [
      `"${a.user?.name || 'N/A'}"`,
      `"${a.user?.email || 'N/A'}"`,
      `"${a.passCode || 'N/A'}"`,
      `"${a.status || 'ACTIVE'}"`,
      `"${new Date(a.registeredAt).toLocaleString()}"`,
      `"${a.checkedInAt ? new Date(a.checkedInAt).toLocaleString() : 'N/A'}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${(eventTitle || 'Event').replace(/\s+/g, '_')}_Attendees_Roster.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Attendee Roster & Pass Verification Console"
      maxWidth="max-w-4xl"
    >
      <div className="space-y-4">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-[#0A0C10] p-4 rounded-xl border border-[#30363D]">
          <div>
            <h4 className="text-sm font-bold text-white truncate max-w-md">
              {eventTitle}
            </h4>
            <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 mt-0.5">
              <UserCheck className="w-3.5 h-3.5" />
              <span>{attendees.length} Total Booked Reservations</span>
            </div>
          </div>

          <button
            onClick={exportCSV}
            disabled={attendees.length === 0}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-mono font-semibold hover:bg-emerald-500/30 transition-all disabled:opacity-40"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Roster CSV</span>
          </button>
        </div>

        {/* Quick Pass Code Scanner / Verifier */}
        <form onSubmit={handleVerifyByPassCode} className="flex items-center gap-2">
          <div className="relative flex-1">
            <Scan className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-400" />
            <input
              type="text"
              placeholder="Enter or scan pass code to check-in attendee (e.g. CHUB-2026-X9A7K2)..."
              value={scanCode}
              onChange={(e) => setScanCode(e.target.value.toUpperCase())}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#0A0C10] border border-[#30363D] text-xs sm:text-sm font-mono text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>
          <button
            type="submit"
            disabled={!scanCode.trim()}
            className="btn-primary !py-2 !px-4 !text-xs font-mono font-semibold whitespace-nowrap"
          >
            Verify Pass
          </button>
        </form>

        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search attendee by name, email, or pass code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#0A0C10] border border-[#30363D] text-xs font-sans text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Attendee Roster Table */}
        <div className="rounded-xl border border-[#30363D] overflow-hidden bg-[#0A0C10]">
          <div className="max-h-80 overflow-y-auto">
            {loading ? (
              <div className="py-12 text-center text-slate-400 font-mono text-xs">
                <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                Querying database roster...
              </div>
            ) : filteredAttendees.length === 0 ? (
              <div className="py-10 text-center text-slate-500 text-xs font-mono">
                No registered attendees found matching query.
              </div>
            ) : (
              <table className="w-full text-left text-xs">
                <thead className="sticky top-0 bg-[#161B22] border-b border-[#30363D] text-slate-400 font-mono uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="py-2.5 px-3">Student Name</th>
                    <th className="py-2.5 px-3">Digital Pass Code</th>
                    <th className="py-2.5 px-3">Registered At</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-right">Check-In Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#30363D]/60 font-sans">
                  {filteredAttendees.map((reg) => {
                    const isChecked = reg.status === 'CHECKED_IN';
                    const isCancelled = reg.status === 'CANCELLED';
                    return (
                      <tr key={reg._id} className="hover:bg-[#161B22]/50 transition-colors">
                        <td className="py-3 px-3">
                          <div className="font-semibold text-white">
                            {reg.user?.name || 'Student'}
                          </div>
                          <div className="text-[11px] text-slate-400 font-mono">
                            {reg.user?.email}
                          </div>
                        </td>

                        <td className="py-3 px-3">
                          <span className="font-mono text-xs font-bold text-indigo-300 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                            {reg.passCode || `CHUB-${reg._id.slice(-6).toUpperCase()}`}
                          </span>
                        </td>

                        <td className="py-3 px-3 font-mono text-slate-400 text-[11px] whitespace-nowrap">
                          {formatDate(reg.registeredAt, false)}
                        </td>

                        <td className="py-3 px-3 whitespace-nowrap">
                          {isChecked ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-mono font-bold text-indigo-400 bg-indigo-500/15 px-2 py-0.5 rounded-full border border-indigo-500/30">
                              <ShieldCheck className="w-3 h-3" /> CHECKED_IN
                            </span>
                          ) : isCancelled ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-mono font-bold text-rose-400 bg-rose-500/15 px-2 py-0.5 rounded-full border border-rose-500/30">
                              <XCircle className="w-3 h-3" /> CANCELLED
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] font-mono font-bold text-[#10B981] bg-[#10B981]/15 px-2 py-0.5 rounded-full border border-[#10B981]/30">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
                              ACTIVE
                            </span>
                          )}
                        </td>

                        <td className="py-3 px-3 text-right whitespace-nowrap">
                          {isChecked ? (
                            <span className="text-[11px] font-mono text-slate-400 flex items-center justify-end gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                              <span>Verified</span>
                            </span>
                          ) : isCancelled ? (
                            <span className="text-[11px] font-mono text-slate-500">Void</span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleCheckIn(reg._id, reg.passCode)}
                              disabled={checkingInId === reg._id}
                              className="px-3 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30 text-xs font-mono font-bold transition-all disabled:opacity-50"
                            >
                              {checkingInId === reg._id ? 'Checking...' : 'Check In'}
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default AttendeeListModal;
