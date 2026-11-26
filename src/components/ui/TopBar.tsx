import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Bell, Settings, Users, Globe2, UserPlus } from 'lucide-react';
import { useColony } from '../../context/ColonyContext';
import { useCitizen } from '../../context/CitizenContext';
import { AccountMenu } from './AccountMenu';

export const TopBar: React.FC = () => {
  const navigate = useNavigate();
  const {
    setIsSearchOpen,
    setIsNotificationsOpen,
    setIsSettingsOpen,
    resetCamera,
    citizens,
  } = useColony();
  const { isApiOnline, liveCount, showDemoCrew } = useCitizen();

  return (
    <header className="fixed top-0 left-0 right-0 z-20 pointer-events-none px-4 sm:px-6 py-4 flex items-start justify-between gap-3">
      {/* Top Left: LUNAR Brand & Civilization Status */}
      <div className="pointer-events-auto flex items-center gap-4 bg-slate-950/80 backdrop-blur-md border border-slate-800/80 rounded-xl px-4 py-2.5 shadow-2xl">
        <button
          onClick={resetCamera}
          className="flex items-center gap-3 text-left group focus:outline-none"
          title="Return to Colony Overview"
        >
          {/* Futuristic Hexagonal Lunar Logo */}
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/80 flex items-center justify-center relative overflow-hidden shadow-inner group-hover:border-cyan-500/60 transition-colors">
            <div className="w-5 h-5 rounded-full border-2 border-slate-300 relative">
              <div className="absolute top-0.5 right-0.5 w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-chakra tracking-[0.25em] text-lg font-bold text-white group-hover:text-cyan-400 transition-colors">
                LUNAR
              </span>
              {isApiOnline ? (
                <span
                  className="text-[10px] font-mono tracking-wider px-1.5 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-800/60 font-semibold"
                  title={
                    showDemoCrew
                      ? `${liveCount} verified citizens + simulation showcase crew`
                      : `${liveCount} verified PostgreSQL citizens`
                  }
                >
                  LIVE COLONY
                </span>
              ) : (
                <span
                  className="text-[10px] font-mono tracking-wider px-1.5 py-0.5 rounded bg-amber-950/80 text-amber-300 border border-amber-800/60 font-semibold"
                  title="Backend registry offline — viewing local simulation showcase"
                >
                  DEMO SANDBOX
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5 text-[11px] font-mono text-emerald-400 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping inline-block" />
              <span>CIVILIZATION ONLINE</span>
              <span className="text-slate-500 hidden sm:inline">•</span>
              <span className="text-slate-400 hidden sm:inline">99.4% HAB INTEGRITY</span>
            </div>
          </div>
        </button>
      </div>

      {/* Top Center: Colony Statistics + Navigation Pills */}
      <div className="pointer-events-auto hidden lg:flex items-center gap-4 bg-slate-950/80 backdrop-blur-md border border-slate-800/80 rounded-xl px-5 py-2 shadow-2xl">
        {/* Colony Settlement */}
        <div className="flex items-center gap-2.5">
          <Globe2 className="w-4 h-4 text-cyan-400" />
          <div>
            <div className="text-[9px] font-mono tracking-wider text-slate-400 uppercase">Settlement</div>
            <div className="text-xs font-semibold text-slate-100 tracking-wide font-chakra">SELENIA PRIME</div>
          </div>
        </div>

        <div className="w-px h-6 bg-slate-800" />

        {/* Colony Population */}
        <div className="flex items-center gap-2.5">
          <Users className="w-4 h-4 text-indigo-400" />
          <div>
            <div className="text-[9px] font-mono tracking-wider text-slate-400 uppercase">Population</div>
            <div className="text-xs font-semibold text-slate-100 font-mono tracking-wide">
              {citizens.length} <span className="text-[9px] text-slate-400">CITIZENS</span>
            </div>
          </div>
        </div>

        <div className="w-px h-6 bg-slate-800" />

        {/* Direct Nav: Citizens Directory */}
        <button
          onClick={() => navigate('/citizens')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-850 border border-slate-750 text-xs font-mono text-slate-200 hover:text-cyan-300 transition-colors"
          title="Open Citizen Directory & Records"
        >
          <Users className="w-3.5 h-3.5 text-cyan-400" />
          <span>DIRECTORY</span>
        </button>

        {/* Direct Nav: Citizenship Terminal */}
        <button
          onClick={() => navigate('/citizenship')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-700/60 text-xs font-mono font-bold text-cyan-300 hover:text-white transition-colors"
          title="Open Lunar Citizenship Terminal"
        >
          <UserPlus className="w-3.5 h-3.5 text-cyan-400" />
          <span>JOIN COLONY</span>
        </button>
      </div>

      {/* Top Right: Search, Notifications, Settings & Account Menu */}
      <div className="pointer-events-auto flex items-center gap-2 bg-slate-950/80 backdrop-blur-md border border-slate-800/80 rounded-xl p-1.5 shadow-2xl">
        {/* Search Citizen Button */}
        <button
          onClick={() => setIsSearchOpen(true)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/90 hover:bg-slate-800 border border-slate-700/60 text-slate-200 hover:text-white transition-all text-xs font-mono font-medium group"
          title="Search Citizens (Cmd+K)"
        >
          <Search className="w-3.5 h-3.5 text-cyan-400 group-hover:scale-110 transition-transform" />
          <span className="hidden xl:inline">FIND CITIZEN</span>
          <kbd className="hidden 2xl:inline-block px-1.5 py-0.5 text-[9px] bg-slate-800 rounded border border-slate-700 text-slate-400 font-mono">
            ⌘K
          </kbd>
        </button>

        {/* Notifications */}
        <button
          onClick={() => setIsNotificationsOpen(true)}
          className="relative p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-100 transition-colors"
          title="Colony Telemetry & Alerts"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-cyan-400" />
        </button>

        {/* Settings */}
        <button
          onClick={() => setIsSettingsOpen(true)}
          className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-100 transition-colors"
          title="Graphics & Environmental Settings"
        >
          <Settings className="w-4 h-4" />
        </button>

        <div className="w-px h-5 bg-slate-800" />

        {/* Phase 3 Account Menu */}
        <AccountMenu citizenshipPath="/citizenship" />
      </div>
    </header>
  );
};
