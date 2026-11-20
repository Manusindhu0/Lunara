import React from 'react';
import { Compass, Zap, HeartPulse, Building2, Users } from 'lucide-react';
import { useColony } from '../../context/ColonyContext';
import { DistrictId } from '../../types';

export const DistrictHUD: React.FC = () => {
  const {
    selectedDistrict,
    districts,
    focusDistrict
  } = useColony();

  const currentDistrict = selectedDistrict ? districts[selectedDistrict] : districts.NEXUS;

  const districtList: DistrictId[] = ['NEXUS', 'FORGE', 'EDEN', 'AETHER', 'BEACON', 'HAVEN'];

  return (
    <div className="fixed bottom-6 left-6 z-20 pointer-events-none flex flex-col gap-3 max-w-md w-full">
      {/* District Selector Tabs */}
      <div className="pointer-events-auto flex items-center gap-1.5 p-1 bg-slate-950/85 backdrop-blur-md border border-slate-800/80 rounded-xl overflow-x-auto shadow-2xl">
        {districtList.map((id) => {
          const dist = districts[id];
          const isSelected = selectedDistrict === id;
          return (
            <button
              key={id}
              onClick={() => focusDistrict(id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold tracking-wider transition-all flex items-center gap-1.5 whitespace-nowrap ${
                isSelected
                  ? 'bg-slate-800 text-white shadow-sm border border-slate-700/80'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
            >
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: dist.accentColor }}
              />
              {dist.name}
            </button>
          );
        })}
      </div>

      {/* District Telemetry Card */}
      <div className="pointer-events-auto bg-slate-950/85 backdrop-blur-md border border-slate-800/80 rounded-2xl p-4 shadow-2xl text-slate-200">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span
                className="w-2.5 h-2.5 rounded-full shadow-sm"
                style={{ backgroundColor: currentDistrict.accentColor }}
              />
              <span className="font-chakra text-lg font-bold tracking-wide text-white">
                DISTRICT {currentDistrict.name}
              </span>
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400">
                ZONE 0{districtList.indexOf(currentDistrict.id) + 1}
              </span>
            </div>
            <div className="text-xs text-slate-400 font-mono mt-0.5 font-medium">
              {currentDistrict.tagline}
            </div>
          </div>
        </div>

        <p className="text-xs text-slate-300/90 leading-relaxed mt-2.5 font-sans">
          {currentDistrict.description}
        </p>

        {/* District Metrics Grid */}
        <div className="grid grid-cols-2 gap-2 mt-3.5 pt-3 border-t border-slate-800/60 font-mono text-[11px]">
          <div className="flex items-center gap-2 text-slate-400">
            <HeartPulse className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span className="truncate">Life Support: <strong className="text-slate-200">{currentDistrict.lifeSupportLevel.split(' ')[0]}</strong></span>
          </div>

          <div className="flex items-center gap-2 text-slate-400">
            <Zap className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="truncate">Power: <strong className="text-slate-200">{currentDistrict.powerGrid.split(' ')[0]}</strong></span>
          </div>

          <div className="flex items-center gap-2 text-slate-400">
            <Building2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span>Facilities: <strong className="text-slate-200">{currentDistrict.buildingCount} Units</strong></span>
          </div>

          <div className="flex items-center gap-2 text-slate-400">
            <Users className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
            <span>Assigned: <strong className="text-slate-200">{currentDistrict.citizenCount} Staff</strong></span>
          </div>
        </div>
      </div>
    </div>
  );
};
