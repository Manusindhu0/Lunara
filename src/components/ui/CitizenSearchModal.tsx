import React, { useState, useEffect, useMemo } from 'react';
import { Search, X, User, MapPin, ArrowRight, ShieldCheck } from 'lucide-react';
import { useColony } from '../../context/ColonyContext';
import { CitizenData } from '../../types';
import { DISTRICTS } from '../../data/districts';
import { citizenService } from '../../lib/citizenService';

export const CitizenSearchModal: React.FC = () => {
  const { isSearchOpen, setIsSearchOpen, citizens, selectCitizen } = useColony();
  const [query, setQuery] = useState('');

  // Keyboard shortcut listener for Cmd+K / Ctrl+K and Esc
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
      if (e.key === 'Escape' && isSearchOpen) {
        setIsSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSearchOpen, setIsSearchOpen]);

  // Filter citizens by ID, name, handle, profession, or district
  const filteredCitizens = useMemo(() => {
    if (!query.trim()) return citizens;
    const q = query.toLowerCase().trim();
    return citizens.filter((c) =>
      c.id.toLowerCase().includes(q) ||
      c.name.toLowerCase().includes(q) ||
      c.handle.toLowerCase().includes(q) ||
      c.profession.toLowerCase().includes(q) ||
      c.districtId.toLowerCase().includes(q) ||
      c.role.toLowerCase().includes(q)
    );
  }, [query, citizens]);

  if (!isSearchOpen) return null;

  const handleSelect = (citizen: CitizenData) => {
    setIsSearchOpen(false);
    selectCitizen(citizen);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Search Header Bar */}
        <div className="p-4 border-b border-slate-800 flex items-center gap-3 bg-slate-900/50">
          <Search className="w-5 h-5 text-cyan-400 shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search citizens by ID (e.g. LUN-00001), username (@elena), or profession (Director)..."
            className="w-full bg-transparent border-none text-slate-100 placeholder-slate-500 font-mono text-sm focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-xs text-slate-400 hover:text-slate-200 font-mono px-2 py-1"
            >
              CLEAR
            </button>
          )}
          <button
            onClick={() => setIsSearchOpen(false)}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Results List */}
        <div className="p-3 overflow-y-auto space-y-2 flex-1 font-sans">
          <div className="text-[11px] font-mono text-slate-500 px-2 uppercase tracking-wider">
            {filteredCitizens.length} Citizens Located in Registry
          </div>

          {filteredCitizens.length === 0 ? (
            <div className="py-12 text-center text-slate-500 font-mono text-sm">
              No matching citizens found in colony registry.
            </div>
          ) : (
            filteredCitizens.map((citizen) => {
              const district = DISTRICTS[citizen.districtId];
              return (
                <button
                  key={citizen.id}
                  onClick={() => handleSelect(citizen)}
                  className="w-full text-left p-3 rounded-xl bg-slate-900/40 hover:bg-slate-900/90 border border-slate-850 hover:border-slate-700 transition-all flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3">
                    {/* Suit Color Icon */}
                    <div className="w-9 h-9 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: citizen.suitColor }}
                      />
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-chakra font-semibold text-white group-hover:text-cyan-400 transition-colors">
                          {citizen.name}
                        </span>
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-300 border border-cyan-800/60 font-bold">
                          {citizen.id}
                        </span>
                        <span className="text-xs font-mono text-slate-400">
                          {citizen.handle}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-400 font-mono">
                        <span>{citizen.profession}</span>
                        <span>•</span>
                        <span
                          className="font-medium"
                          style={{ color: district.accentColor }}
                        >
                          {district.name}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-[11px] font-mono text-slate-400 hidden sm:inline">
                      {citizen.status}
                    </span>
                    <div className="w-7 h-7 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400 group-hover:text-cyan-400 group-hover:bg-cyan-950/80 transition-colors">
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-900/40 border-t border-slate-800 flex items-center justify-between text-[11px] font-mono text-slate-500">
          <span>CENTRAL REGISTRY PROTOCOL V2.0</span>
          <span>PRESS ESC TO CLOSE</span>
        </div>
      </div>
    </div>
  );
};
