import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  UserPlus,
  Compass,
  ArrowRight,
  Shield,
  ShieldCheck,
  Sparkles,
  MapPin,
  Activity,
  Coins,
  Check,
  Copy,
  Award,
  FlaskConical,
  WifiOff,
} from 'lucide-react';
import { useCitizen } from '../context/CitizenContext';
import { AccountMenu } from '../components/ui/AccountMenu';
import { DEPARTMENTS } from '../data/departments';
import { DISTRICTS } from '../data/districts';
import { DepartmentId, DistrictId, CareerRank, CitizenStatus } from '../types';

type SourceFilter = 'ALL' | 'LIVE' | 'DEMO';

export const CitizenDirectoryPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    citizens,
    totalCount,
    liveCount,
    isLoading,
    isApiOnline,
    showDemoCrew,
    setShowDemoCrew,
  } = useCitizen();

  // Search & Filter State
  const [query, setQuery] = useState('');
  const [sourceFilter, setSourceFilter] = useState<SourceFilter>('ALL');
  const [selectedDept, setSelectedDept] = useState<DepartmentId | 'ALL'>('ALL');
  const [selectedDistrict, setSelectedDistrict] = useState<DistrictId | 'ALL'>('ALL');
  const [selectedRank, setSelectedRank] = useState<CareerRank | 'ALL'>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<CitizenStatus | 'ALL'>('ALL');
  const [sortBy, setSortBy] = useState<'level' | 'newest' | 'contribution' | 'name' | 'id'>('level');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopyId = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredCitizens = useMemo(() => {
    const result = citizens.filter((c) => {
      if (sourceFilter === 'LIVE' && c.isDemo) return false;
      if (sourceFilter === 'DEMO' && !c.isDemo) return false;

      if (query.trim()) {
        const q = query.toLowerCase().trim();
        const matchesQuery =
          c.citizenId.toLowerCase().includes(q) ||
          c.username.toLowerCase().includes(q) ||
          c.displayName.toLowerCase().includes(q) ||
          c.profession.toLowerCase().includes(q) ||
          c.department.toLowerCase().includes(q) ||
          c.districtId.toLowerCase().includes(q) ||
          c.currentActivity.toLowerCase().includes(q);
        if (!matchesQuery) return false;
      }

      if (selectedDept !== 'ALL' && c.department !== selectedDept) return false;
      if (selectedDistrict !== 'ALL' && c.districtId !== selectedDistrict) return false;
      if (selectedRank !== 'ALL' && c.rank !== selectedRank) return false;
      if (selectedStatus !== 'ALL' && c.status !== selectedStatus) return false;

      return true;
    });

    result.sort((a, b) => {
      // Prioritize real verified citizens first when sorting by newest/level unless identical
      if (a.isDemo !== b.isDemo && sortBy === 'newest') {
        return a.isDemo ? 1 : -1;
      }
      switch (sortBy) {
        case 'level':
          return b.level - a.level || b.xp - a.xp;
        case 'newest':
          return new Date(b.joinedAt).getTime() - new Date(a.joinedAt).getTime();
        case 'contribution':
          return b.contributionStats.totalContribution - a.contributionStats.totalContribution;
        case 'name':
          return a.displayName.localeCompare(b.displayName);
        case 'id':
          return a.citizenId.localeCompare(b.citizenId);
        default:
          return 0;
      }
    });

    return result;
  }, [
    citizens,
    sourceFilter,
    query,
    selectedDept,
    selectedDistrict,
    selectedRank,
    selectedStatus,
    sortBy,
  ]);

  const activeCount = citizens.filter((c) => c.status === 'ACTIVE' || c.status === 'ON DUTY').length;
  const foundingCount = citizens.filter((c) => c.isFoundingCitizen).length;
  const totalXp = citizens.reduce((sum, c) => sum + c.xp, 0);

  const resetFilters = () => {
    setQuery('');
    setSourceFilter('ALL');
    setSelectedDept('ALL');
    setSelectedDistrict('ALL');
    setSelectedRank('ALL');
    setSelectedStatus('ALL');
    setSortBy('level');
  };

  return (
    <div className="h-screen overflow-y-auto bg-[#05070a] text-slate-100 flex flex-col font-sans select-text">
      {/* Top Navbar */}
      <header className="sticky top-0 z-30 bg-slate-950/85 backdrop-blur-xl border-b border-slate-800/80 px-6 py-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/world')}
            className="flex items-center gap-3 group focus:outline-none"
            title="Return to 3D Colony"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/80 flex items-center justify-center relative overflow-hidden shadow-inner group-hover:border-cyan-500/60 transition-colors">
              <div className="w-5 h-5 rounded-full border-2 border-slate-300 relative">
                <div className="absolute top-0.5 right-0.5 w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              </div>
            </div>
            <div className="text-left">
              <div className="flex items-center gap-2">
                <span className="font-chakra tracking-[0.25em] text-lg font-bold text-white group-hover:text-cyan-400 transition-colors">
                  LUNAR
                </span>
                <span className="text-[10px] font-mono tracking-wider px-1.5 py-0.5 rounded bg-cyan-950/80 text-cyan-400 border border-cyan-800/60 font-semibold">
                  DIRECTORY
                </span>
              </div>
              <div className="text-[11px] font-mono text-slate-400 hidden sm:block">
                Selenia Prime Citizen Registry
              </div>
            </div>
          </button>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => navigate('/world')}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-xs font-mono font-medium text-slate-200 hover:text-white transition-all shadow-sm"
          >
            <Compass className="w-4 h-4 text-cyan-400" />
            <span className="hidden sm:inline">3D COLONY WORLD</span>
          </button>

          <button
            onClick={() => navigate('/citizenship')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-mono font-bold transition-all shadow-lg shadow-cyan-950/40 border border-cyan-400/30"
          >
            <UserPlus className="w-4 h-4" />
            <span className="hidden md:inline">CITIZENSHIP TERMINAL</span>
            <span className="md:hidden">APPLY</span>
          </button>

          <AccountMenu citizenshipPath="/citizenship" />
        </div>
      </header>

      {/* Hero Header & Colony Stats Banner */}
      <section className="px-6 py-8 border-b border-slate-800/60 bg-gradient-to-b from-slate-950 via-slate-900/40 to-transparent">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-cyan-950/60 border border-cyan-800/40 text-cyan-400 font-mono text-xs font-semibold mb-3">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                OFFICIAL CITIZEN REGISTRY — SELENIA PRIME
              </div>
              <h1 className="font-chakra text-3xl md:text-4xl font-extrabold text-white tracking-wide">
                Colony Citizens & Pioneer Directory
              </h1>
              <p className="text-slate-400 text-sm mt-2 max-w-2xl leading-relaxed">
                Explore verified citizens (<code className="text-emerald-300 font-mono">LUN-XXXXX</code>)
                alongside the Selenia Prime simulation showcase crew (<code className="text-amber-300 font-mono">SIM-XXXXX</code>).
                Every citizen holds an immutable Citizen ID and live world coordinates.
              </p>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono">
              <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3">
                <div className="text-[10px] text-slate-400 uppercase tracking-wider">Verified Live</div>
                <div className="text-xl font-bold text-emerald-400 mt-0.5">{liveCount}</div>
                <div className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1">
                  <span
                    className={`w-1.5 h-1.5 rounded-full inline-block ${
                      isApiOnline ? 'bg-emerald-400' : 'bg-amber-400'
                    }`}
                  />
                  {isApiOnline ? 'PostgreSQL Synced' : 'Offline Mode'}
                </div>
              </div>

              <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3">
                <div className="text-[10px] text-slate-400 uppercase tracking-wider">On Duty</div>
                <div className="text-xl font-bold text-cyan-400 mt-0.5">{activeCount}</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Active Station</div>
              </div>

              <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3">
                <div className="text-[10px] text-slate-400 uppercase tracking-wider">Founding Cohort</div>
                <div className="text-xl font-bold text-amber-400 mt-0.5">{foundingCount}</div>
                <div className="text-[10px] text-amber-400/80 mt-0.5">Sol 001 Pioneers</div>
              </div>

              <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3">
                <div className="text-[10px] text-slate-400 uppercase tracking-wider">Colony XP</div>
                <div className="text-xl font-bold text-indigo-400 mt-0.5">{(totalXp / 1000).toFixed(1)}k</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Civilization XP</div>
              </div>
            </div>
          </div>

          {/* API Offline / Empty Live Registry Status Notice */}
          {!isApiOnline && (
            <div className="mt-5 p-3.5 rounded-xl bg-amber-950/40 border border-amber-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono text-amber-200">
              <div className="flex items-center gap-2.5">
                <WifiOff className="w-4 h-4 text-amber-400 shrink-0" />
                <span>
                  Backend citizen API is currently unreachable. Displaying local Simulation Showcase crew (<code className="text-amber-300">SIM-*</code>) in Demo Mode.
                </span>
              </div>
            </div>
          )}

          {isApiOnline && !isLoading && liveCount === 0 && (
            <div className="mt-5 p-3.5 rounded-xl bg-cyan-950/40 border border-cyan-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono text-cyan-200">
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>
                  No verified PostgreSQL citizens (<code className="text-cyan-300">LUN-00001</code>) have enlisted yet. Simulation showcase crew is displayed below.
                </span>
              </div>
              <button
                onClick={() => navigate('/citizenship')}
                className="shrink-0 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold transition-colors"
              >
                CLAIM LUN-00001
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Filters and Controls */}
      <section className="px-6 py-6 max-w-7xl mx-auto w-full pb-12">
        <div className="bg-slate-950/90 border border-slate-800/90 rounded-2xl p-4 shadow-xl mb-6">
          <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between">
            {/* Search bar */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-cyan-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by Citizen ID (LUN-00001 / SIM-00001), @username, name, or profession..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-900/90 border border-slate-700/80 rounded-xl text-sm font-mono text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500/80 transition-colors"
              />
              {query && (
                <button
                  onClick={() => setQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-mono text-slate-400 hover:text-white"
                >
                  CLEAR
                </button>
              )}
            </div>

            {/* Filter selectors */}
            <div className="flex flex-wrap items-center gap-2.5 font-mono text-xs">
              {/* Source Filter */}
              <select
                value={sourceFilter}
                onChange={(e) => setSourceFilter(e.target.value as SourceFilter)}
                className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
              >
                <option value="ALL">All Sources ({totalCount})</option>
                <option value="LIVE">Verified Citizens ({liveCount})</option>
                <option value="DEMO">Demo Showcase</option>
              </select>

              {/* Department */}
              <select
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value as DepartmentId | 'ALL')}
                className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
              >
                <option value="ALL">All Departments</option>
                {Object.values(DEPARTMENTS).map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>

              {/* District */}
              <select
                value={selectedDistrict}
                onChange={(e) => setSelectedDistrict(e.target.value as DistrictId | 'ALL')}
                className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
              >
                <option value="ALL">All Districts</option>
                {Object.values(DISTRICTS).map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} District
                  </option>
                ))}
              </select>

              {/* Rank */}
              <select
                value={selectedRank}
                onChange={(e) => setSelectedRank(e.target.value as CareerRank | 'ALL')}
                className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
              >
                <option value="ALL">All Ranks</option>
                <option value="Colony Council">Colony Council</option>
                <option value="Mission Commander">Mission Commander</option>
                <option value="Department Lead">Department Lead</option>
                <option value="Senior Specialist">Senior Specialist</option>
                <option value="Specialist">Specialist</option>
                <option value="Citizen">Citizen</option>
              </select>

              {/* Sort By */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-cyan-300 font-semibold focus:outline-none focus:border-cyan-500"
              >
                <option value="level">Sort: Highest Level / XP</option>
                <option value="newest">Sort: Newest Arrival</option>
                <option value="contribution">Sort: Total Contribution</option>
                <option value="name">Sort: Name (A-Z)</option>
                <option value="id">Sort: Citizen ID</option>
              </select>

              {/* Demo Crew Toggle (when API is online) */}
              {isApiOnline && (
                <button
                  type="button"
                  onClick={() => setShowDemoCrew(!showDemoCrew)}
                  className={`px-3 py-2 rounded-xl border text-xs font-mono transition-colors flex items-center gap-1.5 ${
                    showDemoCrew
                      ? 'bg-amber-950/60 border-amber-700/70 text-amber-300'
                      : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-white'
                  }`}
                  title="Toggle Phase 2 Simulation Showcase Crew in 3D World & Directory"
                >
                  <FlaskConical className="w-3.5 h-3.5" />
                  <span>{showDemoCrew ? 'Demo Crew: ON' : 'Demo Crew: OFF'}</span>
                </button>
              )}

              {(query ||
                sourceFilter !== 'ALL' ||
                selectedDept !== 'ALL' ||
                selectedDistrict !== 'ALL' ||
                selectedRank !== 'ALL') && (
                <button
                  onClick={resetFilters}
                  className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                >
                  Reset
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-4 px-1">
          <div>
            Showing <span className="text-cyan-400 font-bold">{filteredCitizens.length}</span> of {totalCount} citizens
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-ping" />
            <span>{isLoading ? 'SYNCING REGISTRY...' : 'LIVE 3D SURFACE PRESENCE ACTIVE'}</span>
          </div>
        </div>

        {/* Grid of Citizen Cards */}
        {filteredCitizens.length === 0 ? (
          <div className="py-20 text-center bg-slate-950/60 border border-slate-800/80 rounded-2xl p-8">
            <Shield className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h3 className="font-chakra text-lg font-bold text-slate-300">No Citizens Found</h3>
            <p className="text-xs font-mono text-slate-500 mt-1 max-w-sm mx-auto">
              No lunar personnel match your current filter parameters.
            </p>
            <button
              onClick={resetFilters}
              className="mt-4 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-xs font-mono font-semibold text-white transition-colors"
            >
              Clear All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCitizens.map((citizen) => {
              const district = DISTRICTS[citizen.districtId];
              const department = DEPARTMENTS[citizen.department];
              const isCopied = copiedId === citizen.citizenId;
              const isDemo = Boolean(citizen.isDemo);

              return (
                <div
                  key={citizen.citizenId}
                  onClick={() => navigate(`/citizen/${citizen.citizenId}`)}
                  className="bg-slate-950/80 border border-slate-850 hover:border-slate-700 rounded-2xl p-5 shadow-lg hover:shadow-cyan-950/20 transition-all duration-200 cursor-pointer flex flex-col justify-between group relative overflow-hidden"
                >
                  {/* Subtle Top glow bar based on district color */}
                  <div
                    className="absolute top-0 left-0 right-0 h-1 opacity-70 group-hover:opacity-100 transition-opacity"
                    style={{ backgroundColor: district?.accentColor || '#38bdf8' }}
                  />

                  <div>
                    {/* Header: Avatar, Citizen ID, Source & Founding Badges */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center shrink-0 relative overflow-hidden shadow-inner">
                          <div
                            className="w-8 h-8 rounded-full border-2 border-slate-400 relative flex items-center justify-center"
                            style={{ backgroundColor: citizen.suitColor }}
                          >
                            <div className="w-4 h-4 rounded-full bg-amber-400/90" />
                          </div>
                          {citizen.status === 'ON DUTY' && (
                            <span className="absolute bottom-1 right-1 w-2.5 h-2.5 rounded-full bg-cyan-400 border border-slate-950 animate-pulse" />
                          )}
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <button
                              onClick={(e) => handleCopyId(e, citizen.citizenId)}
                              className="inline-flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-800/60 font-bold hover:bg-cyan-900 transition-colors"
                              title="Click to copy Citizen ID"
                            >
                              {citizen.citizenId}
                              {isCopied ? (
                                <Check className="w-2.5 h-2.5 text-emerald-400" />
                              ) : (
                                <Copy className="w-2.5 h-2.5 text-cyan-400 opacity-60 group-hover:opacity-100" />
                              )}
                            </button>
                            <span className="text-xs font-mono text-slate-400 truncate">
                              @{citizen.username}
                            </span>
                          </div>

                          <h3 className="font-chakra text-base font-bold text-white group-hover:text-cyan-300 transition-colors mt-0.5 truncate">
                            {citizen.displayName}
                          </h3>
                        </div>
                      </div>

                      {/* Badges */}
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        {isDemo ? (
                          <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-amber-950/70 text-amber-300 border border-amber-800/70 font-bold">
                            DEMO SHOWCASE
                          </span>
                        ) : (
                          <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-800/80 font-bold flex items-center gap-1">
                            <ShieldCheck className="w-2.5 h-2.5 text-emerald-400" />
                            VERIFIED CITIZEN
                          </span>
                        )}

                        {citizen.isFoundingCitizen && (
                          <span
                            className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-amber-950/80 text-amber-300 border border-amber-800/80 font-bold flex items-center gap-1 shadow-sm"
                            title="Sol 001 Founding Cohort"
                          >
                            <Award className="w-2.5 h-2.5 text-amber-400" />
                            FOUNDING
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Department, District & Rank */}
                    <div className="mt-3 flex flex-wrap gap-1.5 font-mono text-[11px]">
                      <span
                        className="px-2 py-0.5 rounded-md border bg-slate-900/90"
                        style={{
                          borderColor: `${department?.accentColor || '#64748b'}50`,
                          color: department?.accentColor || '#cbd5e1',
                        }}
                      >
                        {department?.name || citizen.department}
                      </span>

                      <span
                        className="px-2 py-0.5 rounded-md border bg-slate-900/90"
                        style={{
                          borderColor: `${district?.accentColor || '#64748b'}50`,
                          color: district?.accentColor || '#cbd5e1',
                        }}
                      >
                        <MapPin className="w-3 h-3 inline mr-1" />
                        {district?.name}
                      </span>

                      <span className="px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-slate-300">
                        {citizen.rank}
                      </span>
                    </div>

                    {/* Profession & Bio */}
                    <div className="mt-2.5">
                      <div className="text-xs font-mono font-semibold text-slate-200">
                        {citizen.profession}
                      </div>
                      <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                        {citizen.bio}
                      </p>
                    </div>

                    {/* Current Activity Box */}
                    <div className="mt-3 bg-cyan-950/20 border border-cyan-900/30 rounded-xl p-2.5 flex items-start gap-2 text-xs font-mono text-cyan-200">
                      <Activity className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5 animate-pulse" />
                      <div className="truncate">
                        <span className="text-[10px] text-cyan-500 uppercase block font-semibold">Active Sol Task</span>
                        <span className="truncate block">{citizen.currentActivity}</span>
                      </div>
                    </div>
                  </div>

                  {/* Card Footer */}
                  <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1.5">
                        <span className="px-1.5 py-0.5 rounded bg-indigo-950 border border-indigo-800 text-indigo-300 font-bold text-[10px]">
                          LVL {citizen.level}
                        </span>
                        <span className="text-[11px] text-slate-400 font-medium">
                          {citizen.xp} XP
                        </span>
                      </div>

                      <div className="flex items-center gap-1 text-amber-300 text-[11px]">
                        <Coins className="w-3 h-3 text-amber-400" />
                        <span>{citizen.colonyCredits} CC</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/world?focus=${citizen.citizenId}`);
                        }}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-cyan-950 hover:bg-cyan-900 border border-cyan-800/60 text-cyan-300 text-[11px] font-bold transition-colors"
                        title="Focus camera on astronaut in 3D Lunar Colony"
                      >
                        <Compass className="w-3 h-3" />
                        <span>LOCATE</span>
                      </button>

                      <div className="p-1 rounded-lg text-slate-400 group-hover:text-cyan-400 transition-colors">
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};

export default CitizenDirectoryPage;
