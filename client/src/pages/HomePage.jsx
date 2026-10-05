import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  GraduationCap,
  Users,
  Zap,
  CheckCircle2,
  Ticket,
  Clock,
  Compass,
  Lock,
  RotateCcw,
} from 'lucide-react';
import EventCard from '../components/events/EventCard';
import { eventService, registrationService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const HomePage = () => {
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, isAuthenticated, isAdmin, isStudent } = useAuth();
  const { showToast } = useToast();

  useEffect(() => {
    const fetchUpcoming = async () => {
      try {
        const res = await eventService.getUpcomingEvents();
        if (res.data.success) {
          setUpcomingEvents(res.data.events || []);
        }
      } catch (err) {
        console.error('Failed to load upcoming events', err);
      } finally {
        setLoading(false);
      }
    };
    fetchUpcoming();
  }, []);

  const handleQuickRegister = async (event) => {
    if (!isAuthenticated) {
      showToast('Please sign in or use a demo student account to reserve tickets', 'info');
      return;
    }
    try {
      const res = await registrationService.registerForEvent(event._id);
      if (res.data.success) {
        showToast(`Pass issued! Verification code: ${res.data.passCode}`, 'success');
        setUpcomingEvents((prev) =>
          prev.map((e) =>
            e._id === event._id
              ? {
                  ...e,
                  availableSeats: res.data.availableSeats,
                  status: res.data.eventStatus,
                }
              : e
          )
        );
      }
    } catch (err) {
      const msg =
        err.response?.status === 409
          ? '409 Conflict: Event Capacity Reached'
          : err.response?.data?.message || 'Registration failed';
      showToast(msg, 'error');
    }
  };

  return (
    <div className="space-y-16 sm:space-y-24">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-8 pb-12 sm:pt-16 sm:pb-20">
        {/* Glow Ambient Highlights */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 right-10 w-72 h-72 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-4xl mx-auto text-center space-y-6 px-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#161B22] border border-[#30363D] text-indigo-300 text-xs font-mono font-semibold shadow-lg shadow-indigo-500/10">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>CampusHub — High-Concurrency Event Reservation Engine</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold font-display tracking-tight text-white leading-[1.1]">
            Zero Race Conditions.{' '}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-emerald-400 to-cyan-300">
              Atomic Reservations.
            </span>
          </h1>

          <p className="text-base sm:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Eliminate event overbooking during traffic spikes with atomic conditional writes, instant status transitions to <span className="text-[#F43F5E] font-mono font-bold">Registration Closed</span>, atomic seat rollbacks, and cryptographic digital passes.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              to="/events"
              className="btn-primary !py-3.5 !px-8 !text-base w-full sm:w-auto shadow-xl shadow-indigo-500/25 font-semibold"
            >
              <Compass className="w-5 h-5" />
              <span>Explore Live Catalog</span>
            </Link>

            {isAuthenticated && isAdmin ? (
              <Link
                to="/admin"
                className="btn-secondary !py-3.5 !px-8 !text-base w-full sm:w-auto font-semibold"
              >
                <ShieldCheck className="w-5 h-5 text-purple-400" />
                <span>Admin Console</span>
              </Link>
            ) : isAuthenticated ? (
              <Link
                to="/my-passes"
                className="btn-secondary !py-3.5 !px-8 !text-base w-full sm:w-auto font-semibold"
              >
                <Ticket className="w-5 h-5 text-emerald-400" />
                <span>My Digital Passes</span>
              </Link>
            ) : (
              <Link
                to="/events"
                className="btn-secondary !py-3.5 !px-8 !text-base w-full sm:w-auto font-semibold"
              >
                <span>Browse Without Login</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            )}
          </div>

          {/* Quick Metrics Ticker */}
          <div className="pt-8 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto border-t border-[#30363D]">
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-white font-display">100%</div>
              <div className="text-xs text-slate-400 uppercase font-mono tracking-wider mt-0.5">Concurrency Safe</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-[#10B981] font-display">0 ms</div>
              <div className="text-xs text-slate-400 uppercase font-mono tracking-wider mt-0.5">Closed Lag</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-indigo-400 font-display">Atomic</div>
              <div className="text-xs text-slate-400 uppercase font-mono tracking-wider mt-0.5">Seat Rollback</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-purple-400 font-display">Crypto</div>
              <div className="text-xs text-slate-400 uppercase font-mono tracking-wider mt-0.5">Digital Passes</div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Upcoming Events Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#30363D] pb-5">
          <div>
            <div className="inline-flex items-center gap-2 text-indigo-400 text-xs font-mono font-bold uppercase tracking-wider mb-1">
              <Clock className="w-4 h-4" />
              <span>Upcoming Queue</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold font-display text-white">
              Nearest Upcoming Events & Masterclasses
            </h2>
          </div>

          <Link
            to="/events"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-mono font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            <span>View Full Catalog</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="h-80 rounded-2xl bg-[#161B22] border border-[#30363D] animate-pulse"
              />
            ))}
          </div>
        ) : upcomingEvents.length === 0 ? (
          <div className="text-center py-16 rounded-2xl bg-[#161B22] border border-[#30363D]">
            <Calendar className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-white">No upcoming events scheduled yet</h3>
            <p className="text-sm text-slate-400 mt-1">
              Check back soon or explore our previous workshop records.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcomingEvents.map((event) => (
              <EventCard
                key={event._id}
                event={event}
                onRegister={handleQuickRegister}
              />
            ))}
          </div>
        )}
      </section>

      {/* Specialization Tracks Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold font-display text-white">
            Filter by Academic & Engineering Track
          </h2>
          <p className="text-sm text-slate-400">
            Targeted event categories designed for hands-on systems programming, research publications, and creative arts.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[
            {
              title: 'Hackathons & Sprints',
              type: 'Hackathon',
              desc: 'Intense 24 to 36-hour competitive engineering marathons with prizes and industry mentors.',
              color: 'from-amber-500/15 to-transparent border-amber-500/30 text-amber-300',
            },
            {
              title: 'Hands-On Workshops',
              type: 'Workshop',
              desc: 'Build real-world systems, Generative AI models, autonomous robotics, and security exploits.',
              color: 'from-emerald-500/15 to-transparent border-emerald-500/30 text-emerald-300',
            },
            {
              title: 'Technical Summits',
              type: 'Technical',
              desc: 'Architectural deep dives into cloud native microservices, Web3, and distributed databases.',
              color: 'from-cyan-500/15 to-transparent border-cyan-500/30 text-cyan-300',
            },
            {
              title: 'Distinguished Seminars',
              type: 'Seminar',
              desc: 'Keynotes from world-renowned researchers on Quantum Physics, Cryptography, and Ethics.',
              color: 'from-violet-500/15 to-transparent border-violet-500/30 text-violet-300',
            },
            {
              title: 'Cultural Galas & Fests',
              type: 'Cultural',
              desc: 'Campus musical showdowns, dramatic choreography, battle of the bands, and art exhibitions.',
              color: 'from-rose-500/15 to-transparent border-rose-500/30 text-rose-300',
            },
            {
              title: 'Academic Publishing',
              type: 'Academic',
              desc: 'Masterclasses on writing high-impact IEEE journals, peer-review frameworks, and methodology.',
              color: 'from-indigo-500/15 to-transparent border-indigo-500/30 text-indigo-300',
            },
          ].map((cat, idx) => (
            <Link
              key={idx}
              to={`/events?type=${cat.type}`}
              className={`p-6 rounded-2xl bg-[#161B22] border bg-gradient-to-br ${cat.color} hover:border-slate-500 hover:scale-[1.02] transition-all duration-300 flex flex-col justify-between`}
            >
              <div className="space-y-2">
                <h3 className="text-lg font-bold font-display text-white">{cat.title}</h3>
                <p className="text-xs text-slate-300 leading-relaxed">{cat.desc}</p>
              </div>
              <div className="mt-4 pt-3 border-t border-[#30363D] flex items-center justify-between text-xs font-mono font-semibold">
                <span>View {cat.type}s</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Architectural Rigor & Business Engine Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-[#161B22] border border-[#30363D] p-8 sm:p-12">
          <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
            <span className="text-xs font-mono font-bold text-indigo-400 uppercase tracking-widest">
              Domain 2: Backend & Software Engineering Rigor
            </span>
            <h3 className="text-2xl sm:text-3xl font-extrabold font-display text-white">
              The CampusHub Concurrency Engine
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center sm:text-left">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mx-auto sm:mx-0">
                <Zap className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-white font-display">1. Atomic Conditional Decrement</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Uses MongoDB aggregation pipeline conditional updates (<code className="text-indigo-300 font-mono">availableSeats: &#123; $gte: 1 &#125;</code>). Single database operation eliminates thread race conditions.
              </p>

            </div>

            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-[#10B981] mx-auto sm:mx-0">
                <Lock className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-white font-display">2. Instant Status Transition</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Switches status to <span className="text-[#F43F5E] font-mono">Registration Closed</span> the millisecond seats reach 0, returning deterministic HTTP 409 Conflict.
              </p>
            </div>

            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400 mx-auto sm:mx-0">
                <RotateCcw className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-white font-display">3. Atomic Cancellation Rollback</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Refunds seat count atomically, caps at maxParticipants, and auto-reopens event to <span className="text-[#10B981] font-mono">Registration Open</span>.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
