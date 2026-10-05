import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, ArrowLeft } from 'lucide-react';

const NotFoundPage = () => {
  return (
    <div className="min-h-[65vh] flex items-center justify-center px-4 py-16">
      <div className="text-center max-w-md space-y-5 glass-card p-8 rounded-3xl border border-slate-800">
        <div className="w-16 h-16 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mx-auto">
          <Compass className="w-8 h-8 animate-spin-slow" />
        </div>
        <div className="space-y-2">
          <h1 className="text-5xl font-extrabold font-display text-white">404</h1>
          <h2 className="text-xl font-bold text-slate-200">Page Not Found</h2>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
            The page you are looking for might have been moved, removed, or never existed in the campus catalog.
          </p>
        </div>

        <Link to="/events" className="btn-primary inline-flex items-center gap-2 !py-2.5 !px-5 !text-xs">
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Events Catalog</span>
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;
