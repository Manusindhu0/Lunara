import React, { useMemo } from 'react';
import { X, Building2, Activity, Users, Shield, Zap, Thermometer, CheckCircle2, User, ChevronRight } from 'lucide-react';
import { useColony } from '../../context/ColonyContext';
import { useCitizen } from '../../context/CitizenContext';
import { DISTRICTS } from '../../data/districts';
import { citizenToCitizenData } from '../../lib/citizenAdapter';

export const BuildingInfoPanel: React.FC = () => {
  const { selectedBuilding, selectBuilding, selectCitizen, resetCamera } = useColony();
  const { getCitizensByBuildingId } = useCitizen();

  const occupants = useMemo(() => {
    if (!selectedBuilding) return [];
    return getCitizensByBuildingId(selectedBuilding.id);
  }, [selectedBuilding, getCitizensByBuildingId]);

  if (!selectedBuilding) return null;

  const district = DISTRICTS[selectedBuilding.districtId];

  return (
    <div className="fixed top-20 right-6 z-30 w-96 max-w-[calc(100vw-3rem)] max-h-[85vh] overflow-y-auto bg-slate-950/95 backdrop-blur-xl border border-slate-800/90 rounded-2xl p-5 shadow-2xl animate-in fade-in slide-in-from-right-4 duration-300 text-slate-200 font-sans">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: district.accentColor }}
            />
            <span className="text-[11px] font-mono tracking-wider text-slate-400 uppercase font-semibold">
              {district.name} DISTRICT • {selectedBuilding.type}
            </span>
          </div>
          <h3 className="font-chakra text-lg font-bold text-white mt-1 leading-snug">
            {selectedBuilding.name}
          </h3>
        </div>

        <button
          onClick={() => selectBuilding(null)}
          className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          title="Close Inspection Panel"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Status Pill */}
      <div className="flex items-center gap-2 mt-3.5">
        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-mono font-semibold ${
          selectedBuilding.status === 'OPTIMAL'
            ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-850'
            : selectedBuilding.status === 'HIGH LOAD'
            ? 'bg-amber-950/80 text-amber-300 border border-amber-850'
            : 'bg-cyan-950/80 text-cyan-300 border border-cyan-850'
        }`}>
          <CheckCircle2 className="w-3 h-3" />
          STATUS: {selectedBuilding.status}
        </span>

        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-mono bg-slate-900 border border-slate-800 text-slate-300">
          <Users className="w-3 h-3 text-slate-400" />
          {occupants.length} Assigned Personnel
        </span>
      </div>

      {/* Purpose */}
      <div className="mt-3.5 text-xs text-slate-300 leading-relaxed font-sans bg-slate-900/60 rounded-xl p-3 border border-slate-800/60">
        <div className="text-[10px] font-mono text-slate-400 uppercase mb-1">Operational Purpose</div>
        {selectedBuilding.purpose}
      </div>

      {/* Current Real-time Activity */}
      <div className="mt-3 flex items-start gap-2.5 text-xs text-cyan-300/90 font-mono bg-cyan-950/30 border border-cyan-900/40 rounded-xl p-2.5">
        <Activity className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5 animate-pulse" />
        <div>
          <span className="text-[10px] text-cyan-500 uppercase block font-semibold">Active Process</span>
          <span>{selectedBuilding.primaryActivity}</span>
        </div>
      </div>

      {/* Assigned Occupants / Stationed Personnel */}
      <div className="mt-4 pt-3.5 border-t border-slate-800/80">
        <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-2 font-semibold">
          <div className="flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-cyan-400" />
            <span>Stationed Personnel ({occupants.length})</span>
          </div>
          <span className="text-[10px] text-slate-500">CLICK TO FOCUS</span>
        </div>

        {occupants.length === 0 ? (
          <div className="p-3 bg-slate-900/40 rounded-xl border border-slate-800/50 text-xs font-mono text-slate-500 text-center">
            Automated Facility — Unmanned during this shift
          </div>
        ) : (
          <div className="space-y-1.5">
            {occupants.slice(0, 5).map((citizen) => (
              <button
                key={citizen.citizenId}
                onClick={() => {
                  selectBuilding(null);
                  selectCitizen(citizenToCitizenData(citizen));
                }}
                className="w-full p-2 rounded-xl bg-slate-900/50 hover:bg-slate-900 border border-slate-800/70 hover:border-slate-700 transition-all flex items-center justify-between text-left group"
                title={`Focus on ${citizen.displayName}`}
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-6 h-6 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: citizen.suitColor }}
                    />
                  </div>
                  <div>
                    <div className="text-xs font-chakra font-bold text-white group-hover:text-cyan-400 transition-colors">
                      {citizen.displayName}
                    </div>
                    <div className="text-[10px] font-mono text-slate-400">
                      {citizen.profession}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  {citizen.isDemo && (
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-amber-950/80 text-amber-300 border border-amber-800/60">
                      DEMO
                    </span>
                  )}
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-cyan-300">
                    {citizen.citizenId}
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400 transition-colors" />
                </div>
              </button>
            ))}

            {occupants.length > 5 && (
              <div className="text-[10px] font-mono text-slate-500 text-center pt-1">
                + {occupants.length - 5} more personnel stationed in this module
              </div>
            )}
          </div>
        )}
      </div>

      {/* Key Features */}
      <div className="mt-4 pt-3 border-t border-slate-800/80">
        <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1.5 font-semibold">
          Architectural Subsystems
        </div>
        <div className="flex flex-wrap gap-1.5">
          {selectedBuilding.features.map((feature, i) => (
            <span
              key={i}
              className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-800/80 text-slate-300"
            >
              {feature}
            </span>
          ))}
        </div>
      </div>

      {/* Telemetry Metrics */}
      <div className="grid grid-cols-2 gap-2 mt-4 pt-3.5 border-t border-slate-800/80 font-mono text-[11px]">
        <div className="bg-slate-900/50 p-2 rounded-lg border border-slate-800/50">
          <div className="flex items-center gap-1.5 text-slate-400 text-[10px]">
            <Zap className="w-3 h-3 text-amber-400" />
            <span>POWER LOAD</span>
          </div>
          <div className="text-slate-100 font-semibold mt-0.5">{selectedBuilding.metrics.powerUsage}</div>
        </div>

        <div className="bg-slate-900/50 p-2 rounded-lg border border-slate-800/50">
          <div className="flex items-center gap-1.5 text-slate-400 text-[10px]">
            <Shield className="w-3 h-3 text-emerald-400" />
            <span>INTEGRITY</span>
          </div>
          <div className="text-slate-100 font-semibold mt-0.5">{selectedBuilding.metrics.structuralIntegrity}</div>
        </div>

        <div className="bg-slate-900/50 p-2 rounded-lg border border-slate-800/50">
          <div className="flex items-center gap-1.5 text-slate-400 text-[10px]">
            <Thermometer className="w-3 h-3 text-blue-400" />
            <span>INTERNAL TEMP</span>
          </div>
          <div className="text-slate-100 font-semibold mt-0.5">{selectedBuilding.metrics.temperature}</div>
        </div>

        <div className="bg-slate-900/50 p-2 rounded-lg border border-slate-800/50">
          <div className="flex items-center gap-1.5 text-slate-400 text-[10px]">
            <Shield className="w-3 h-3 text-indigo-400" />
            <span>RADIATION SHIELD</span>
          </div>
          <div className="text-slate-100 font-semibold mt-0.5 truncate">{selectedBuilding.metrics.radiationShielding}</div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="mt-4 pt-3 flex items-center justify-end gap-2 border-t border-slate-800/80">
        <button
          onClick={resetCamera}
          className="px-3 py-1.5 rounded-lg text-xs font-mono text-slate-400 hover:text-slate-200 transition-colors"
        >
          Exit Focus
        </button>
        <button
          onClick={() => selectBuilding(null)}
          className="px-4 py-1.5 rounded-lg text-xs font-mono font-semibold bg-cyan-600 hover:bg-cyan-500 text-white transition-colors"
        >
          Close Panel
        </button>
      </div>
    </div>
  );
};
