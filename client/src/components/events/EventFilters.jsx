import React, { useState, useEffect } from 'react';
import {
  Search,
  RotateCcw,
  LayoutGrid,
  List,
  Filter,
  MapPin,
  Calendar,
  CheckCircle,
  X,
  Sparkles,
} from 'lucide-react';

const CATEGORIES = [
  'All',
  'Hackathon',
  'Workshop',
  'Technical',
  'Seminar',
  'Cultural',
  'Academic',
];

const VENUES = [
  'All',
  'Auditorium',
  'Computer Science Lab 1',
  'Seminar Hall 2',
  'Cyber Security Lab',
  'Amphitheatre',
  'Open Air Campus Grounds',
];

const DATE_OPTIONS = [
  { label: 'All Dates', value: 'All' },
  { label: 'Upcoming Only', value: 'upcoming' },
  { label: 'Today', value: 'today' },
  { label: 'Next 7 Days', value: 'week' },
  { label: 'Next 30 Days', value: 'month' },
];

const EventFilters = ({
  search,
  setSearch,
  selectedType,
  setSelectedType,
  selectedVenue,
  setSelectedVenue,
  selectedDate,
  setSelectedDate,
  availableOnly,
  setAvailableOnly,
  selectedStatus,
  setSelectedStatus,
  sortBy,
  setSortBy,
  viewMode,
  setViewMode,
  onReset,
  totalEvents,
}) => {
  // Local search state for debouncing
  const [localSearch, setLocalSearch] = useState(search);

  // 300ms Debounce effect on search
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(localSearch);
    }, 300);
    return () => clearTimeout(timer);
  }, [localSearch, setSearch]);

  // Sync if parent clears search
  useEffect(() => {
    setLocalSearch(search);
  }, [search]);

  const hasActiveFilters =
    search.trim() !== '' ||
    selectedType !== 'All' ||
    selectedVenue !== 'All' ||
    selectedDate !== 'All' ||
    availableOnly ||
    selectedStatus !== 'All';

  return (
    <div className="space-y-4 rounded-2xl bg-[#161B22] border border-[#30363D] p-5 sm:p-6 shadow-xl">
      {/* Top Row: Debounced Search & Toggle Controls */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        {/* Debounced Search Bar */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            id="event-search-input"
            placeholder="Search by event title, speaker name, agenda keywords, or venue..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            className="w-full pl-10 pr-9 py-2.5 rounded-xl bg-[#0A0C10] border border-[#30363D] text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors font-sans"
          />
          {localSearch && (
            <button
              onClick={() => {
                setLocalSearch('');
                setSearch('');
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white p-1 rounded-md hover:bg-[#21262D]"
              title="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Right Filter Dropdowns & View Controls */}
        <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
          {/* Venue Filter Dropdown */}
          <div className="relative">
            <select
              id="venue-filter-select"
              value={selectedVenue}
              onChange={(e) => setSelectedVenue(e.target.value)}
              className="py-2.5 px-3 rounded-xl bg-[#0A0C10] border border-[#30363D] text-xs font-medium text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
            >
              <option value="All">All Venues</option>
              {VENUES.filter((v) => v !== 'All').map((venue) => (
                <option key={venue} value={venue}>
                  {venue}
                </option>
              ))}
            </select>
          </div>

          {/* Date Filter Dropdown */}
          <div className="relative">
            <select
              id="date-filter-select"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="py-2.5 px-3 rounded-xl bg-[#0A0C10] border border-[#30363D] text-xs font-medium text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
            >
              {DATE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Sort Dropdown */}
          <div className="relative">
            <select
              id="sort-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="py-2.5 px-3 rounded-xl bg-[#0A0C10] border border-[#30363D] text-xs font-medium text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
            >
              <option value="date">Date: Upcoming First</option>
              <option value="date_desc">Date: Latest / Past</option>
              <option value="seats">Available Seats: High to Low</option>
              <option value="seats_asc">Available Seats: Low to High</option>
              <option value="title">Title: A-Z</option>
            </select>
          </div>

          {/* "Show Available Seats Only" Switch Toggle */}
          <button
            type="button"
            id="available-seats-toggle"
            onClick={() => setAvailableOnly(!availableOnly)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all whitespace-nowrap ${
              availableOnly
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-sm shadow-emerald-500/10'
                : 'bg-[#0A0C10] text-slate-400 border-[#30363D] hover:text-slate-200 hover:border-slate-600'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                availableOnly ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'
              }`}
            />
            <span>Available Seats Only</span>
          </button>

          {/* Grid / List View Toggle */}
          {setViewMode && (
            <div className="flex items-center bg-[#0A0C10] p-1 rounded-xl border border-[#30363D]">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-indigo-600 text-white shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Grid View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === 'list'
                    ? 'bg-indigo-600 text-white shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="List View"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Reset button */}
          {hasActiveFilters && (
            <button
              onClick={onReset}
              className="p-2.5 rounded-xl bg-[#21262D] border border-[#30363D] text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
              title="Reset All Filters"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Category Pills Row with Live Active State */}
      <div className="pt-3 border-t border-[#30363D] flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full no-scrollbar">
          <span className="text-[11px] font-mono text-slate-500 uppercase tracking-wider mr-1 hidden sm:inline-block">
            Category:
          </span>
          {CATEGORIES.map((cat) => {
            const isSelected = selectedType === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedType(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/25 border border-indigo-400/40'
                    : 'bg-[#0A0C10] text-slate-300 border border-[#30363D] hover:border-slate-600 hover:text-white'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {totalEvents !== undefined && (
          <div className="text-xs font-mono text-slate-400 whitespace-nowrap ml-auto">
            Matching Catalog: <strong className="text-emerald-400">{totalEvents}</strong> events
          </div>
        )}
      </div>

      {/* Active Filter Indicators Bar */}
      {hasActiveFilters && (
        <div className="pt-2 flex items-center gap-2 flex-wrap text-xs">
          <span className="text-slate-500 font-mono text-[11px]">ACTIVE FILTERS:</span>
          {search.trim() && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 text-[11px] font-mono">
              Query: "{search}"
              <button onClick={() => { setSearch(''); setLocalSearch(''); }} className="hover:text-white">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {selectedType !== 'All' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 text-[11px] font-mono">
              Track: {selectedType}
              <button onClick={() => setSelectedType('All')} className="hover:text-white">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {selectedVenue !== 'All' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 text-[11px] font-mono">
              Venue: {selectedVenue}
              <button onClick={() => setSelectedVenue('All')} className="hover:text-white">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {selectedDate !== 'All' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-purple-500/15 text-purple-300 border border-purple-500/30 text-[11px] font-mono">
              Date: {selectedDate}
              <button onClick={() => setSelectedDate('All')} className="hover:text-white">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {availableOnly && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-[11px] font-mono">
              Seats Available Only
              <button onClick={() => setAvailableOnly(false)} className="hover:text-white">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          <button
            onClick={onReset}
            className="text-[11px] font-mono text-rose-400 hover:text-rose-300 underline ml-1"
          >
            Clear All
          </button>
        </div>
      )}
    </div>
  );
};

export default EventFilters;
