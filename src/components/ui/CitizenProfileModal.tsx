import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  X,
  User,
  MapPin,
  Award,
  Activity,
  Calendar,
  Crosshair,
  ExternalLink,
  Coins,
  Copy,
  Check,
  Flame
} from 'lucide-react';
import { useColony } from '../../context/ColonyContext';
import { DISTRICTS } from '../../data/districts';
import { DEPARTMENTS } from '../../data/departments';
import { citizenService } from '../../lib/citizenService';

export const CitizenProfileModal: React.FC = () => {
  const navigate = useNavigate();
  const { selectedCitizen, selectCitizen, focusCitizen } = useColony();
  const [copiedId, setCopiedId] = useState(false);

  if (!selectedCitizen) return null;

  const district = DISTRICTS[selectedCitizen.districtId];
  const fullCitizen = citizenService.getById(selectedCitizen.id);
  const department = fullCitizen ? DEPARTMENTS[fullCitizen.department] : undefined;

  const handleCopyId = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(selectedCitizen.id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const handleViewDossier = () => {
    navigate(`/citizen/${selectedCitizen.id}`);
  };

  return (
    <div className="fixed top-20 right-6 z-30 w-96 max-w-[calc(100vw-3rem)] bg-slate-950/95 backdrop-blur-xl border border-slate-800/90 rounded-2xl p-5 shadow-2xl animate-in fade-in slide-in-from-right-4 duration-300 text-slate-200 font-sans">
      {/* Top Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          {/* Astronaut Suit Badge Avatar */}
          <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-700/80 flex items-center justify-center relative overflow-hidden shadow-inner shrink-0">
            <div
              className="w-8 h-8 rounded-full border-2 border-slate-400 relative flex items-center justify-center"
              style={{ backgroundColor: selectedCitizen.suitColor }}
            >
              <div className="w-4 h-4 rounded-full bg-amber-400" />
            </div>
            {/* Status dot */}
            <span className="absolute bottom-1 right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 border border-slate-950" />
          </div>

          <div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                onClick={handleCopyId}
                className="inline-flex items-center gap-1 text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800/60 font-semibold hover:bg-cyan-900 transition-colors"
                title="Click to copy Citizen ID"
              >
                <span>{selectedCitizen.id}</span>
                {copiedId ? (
                  <Check className="w-2.5 h-2.5 text-emerald-400" />
                ) : (
                  <Copy className="w-2.5 h-2.5 opacity-60" />
                )}
              </button>
              <span className="text-xs font-mono text-slate-400 font-medium">
                {selectedCitizen.handle}
              </span>
            </div>
            <h3 className="font-chakra text-lg font-bold text-white mt-0.5">
              {selectedCitizen.name}
            </h3>
          </div>
        </div>

        <button
          onClick={() => selectCitizen(null)}
          className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          title="Close Citizen Card"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Profession, Department & District Pill */}
      <div className="mt-3.5 flex flex-wrap items-center gap-1.5 text-xs font-mono">
        {department && (
          <span
            className="px-2 py-0.5 rounded-md border bg-slate-900/90 text-[11px]"
            style={{
              borderColor: `${department.accentColor}50`,
              color: department.accentColor,
            }}
          >
            {department.name}
          </span>
        )}

        <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-[11px] text-slate-300">
          <MapPin className="w-3 h-3 text-amber-400" />
          <span>{district.name} DISTRICT</span>
        </div>

        {fullCitizen && (
          <span className="px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-[11px] text-slate-300">
            {fullCitizen.rank}
          </span>
        )}
      </div>

      {/* Profession */}
      <div className="mt-2 text-xs font-mono text-slate-300 flex items-center gap-1.5">
        <User className="w-3.5 h-3.5 text-cyan-400" />
        <span className="font-semibold">{selectedCitizen.profession}</span>
      </div>

      {/* Real-time Activity */}
      <div className="mt-3 bg-cyan-950/30 border border-cyan-900/40 rounded-xl p-3 flex items-start gap-2.5 font-mono text-xs text-cyan-200">
        <Activity className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5 animate-pulse" />
        <div>
          <span className="text-[10px] text-cyan-400 uppercase block font-semibold">Current Activity</span>
          <span>{selectedCitizen.currentActivity}</span>
        </div>
      </div>

      {/* Level, XP & Colony Credits Mini Bar */}
      {fullCitizen && (
        <div className="mt-3 p-2.5 bg-slate-900/60 border border-slate-800/80 rounded-xl flex items-center justify-between font-mono text-xs">
          <div className="flex items-center gap-2">
            <span className="px-1.5 py-0.5 rounded bg-indigo-950 border border-indigo-800 text-indigo-300 font-bold text-[10px]">
              LVL {fullCitizen.level}
            </span>
            <span className="text-slate-400 text-[11px]">{fullCitizen.xp} XP</span>
          </div>

          <div className="flex items-center gap-1 text-amber-300 text-[11px] font-bold">
            <Coins className="w-3.5 h-3.5 text-amber-400" />
            <span>{fullCitizen.colonyCredits} CC</span>
          </div>
        </div>
      )}

      {/* Citizen Biography */}
      <div className="mt-3 text-xs text-slate-300 leading-relaxed font-sans bg-slate-900/50 p-3 rounded-xl border border-slate-800/60 line-clamp-3">
        {selectedCitizen.biography}
      </div>

      {/* Badges / Commendations */}
      {selectedCitizen.badges.length > 0 && (
        <div className="mt-3">
          <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1 font-semibold flex items-center gap-1.5">
            <Award className="w-3 h-3 text-amber-400" />
            <span>Key Commendations</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {selectedCitizen.badges.slice(0, 3).map((badge, i) => (
              <span
                key={i}
                className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900/90 border border-amber-900/40 text-amber-300"
              >
                ★ {badge}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Action Footer */}
      <div className="mt-4 pt-3 flex items-center justify-between gap-2 border-t border-slate-800/80">
        <button
          onClick={() => focusCitizen(selectedCitizen)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono bg-cyan-950/80 hover:bg-cyan-900 text-cyan-300 border border-cyan-800/60 transition-colors"
          title="Center 3D Camera on Astronaut"
        >
          <Crosshair className="w-3.5 h-3.5" />
          <span>Focus</span>
        </button>

        <button
          onClick={handleViewDossier}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono bg-slate-800 hover:bg-slate-700 text-white transition-colors"
          title="Open Full Profile Dossier"
        >
          <span>View Dossier</span>
          <ExternalLink className="w-3 h-3 text-cyan-400" />
        </button>

        <button
          onClick={() => selectCitizen(null)}
          className="px-3 py-1.5 rounded-lg text-xs font-mono text-slate-400 hover:text-white transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );
};
