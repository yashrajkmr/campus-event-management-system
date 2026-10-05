import React from 'react';
import { Calendar, Heart, Shield, Code, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="border-t border-slate-800/80 bg-slate-950/90 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Col */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center shadow-md shadow-indigo-500/20">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold font-display tracking-tight text-white">
                Campus<span className="text-indigo-400">Hub</span>
              </span>
            </div>
            <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
              The unified event portal for university workshops, technical hackathons, guest seminars, and cultural festivals. Built for students, leaders, and organizers.
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 font-mono">
                <Code className="w-3 h-3 text-indigo-400" /> MERN Stack
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 font-mono">
                <Sparkles className="w-3 h-3 text-purple-400" /> Tailwind CSS
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
              Navigation
            </h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <Link to="/events" className="hover:text-indigo-400 transition-colors">
                  Explore All Events
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-indigo-400 transition-colors">
                  Student / Admin Portal
                </Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-indigo-400 transition-colors">
                  Create Campus Account
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
              Event Categories
            </h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <Link to="/events?type=Hackathon" className="hover:text-indigo-400 transition-colors">
                  Hackathons & Sprints
                </Link>
              </li>
              <li>
                <Link to="/events?type=Workshop" className="hover:text-indigo-400 transition-colors">
                  Hands-on Workshops
                </Link>
              </li>
              <li>
                <Link to="/events?type=Seminar" className="hover:text-indigo-400 transition-colors">
                  Keynotes & Seminars
                </Link>
              </li>
              <li>
                <Link to="/events?type=Cultural" className="hover:text-indigo-400 transition-colors">
                  Cultural & Music Galas
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            &copy; {new Date().getFullYear()} CampusHub Management Portal. All rights reserved.
          </div>
          <div className="flex items-center gap-1">
            <span>Engineered for campus excellence</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
