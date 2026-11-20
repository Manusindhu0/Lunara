import React from 'react';
import { X, Sliders, Sun, Moon, Sparkles, Monitor } from 'lucide-react';
import { useColony } from '../../context/ColonyContext';

export const SettingsModal: React.FC = () => {
  const {
    isSettingsOpen,
    setIsSettingsOpen,
    graphicsQuality,
    setGraphicsQuality,
    timeOfDay,
    setTimeOfDay
  } = useColony();

  if (!isSettingsOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center gap-2.5">
            <Sliders className="w-4 h-4 text-cyan-400" />
            <h3 className="font-chakra text-base font-bold text-white tracking-wide">
              SIMULATION SETTINGS
            </h3>
          </div>
          <button
            onClick={() => setIsSettingsOpen(false)}
            className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-5">
          {/* Lighting & Time of Day */}
          <div>
            <label className="text-xs font-mono font-semibold text-slate-300 block mb-2 uppercase tracking-wider flex items-center gap-1.5">
              <Sun className="w-3.5 h-3.5 text-amber-400" />
              <span>Solar & Earth Illumination</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'cinematic', label: 'Cinematic', desc: 'Low sun & shadows' },
                { id: 'high-noon', label: 'High Noon', desc: 'Max surface visibility' },
                { id: 'earth-glow', label: 'Earthshine', desc: 'Blue atmospheric glow' }
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setTimeOfDay(opt.id as any)}
                  className={`p-2.5 rounded-xl text-left border transition-all ${
                    timeOfDay === opt.id
                      ? 'bg-slate-800 border-cyan-500/80 text-white shadow-sm'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="text-xs font-mono font-semibold">{opt.label}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5 leading-tight">{opt.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Graphics Quality */}
          <div>
            <label className="text-xs font-mono font-semibold text-slate-300 block mb-2 uppercase tracking-wider flex items-center gap-1.5">
              <Monitor className="w-3.5 h-3.5 text-cyan-400" />
              <span>Graphics & Shadows Quality</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'high', label: 'Ultra', desc: '2K Shadows + Antialias' },
                { id: 'medium', label: 'Balanced', desc: '1K Shadows' },
                { id: 'performance', label: 'Fast', desc: 'No shadows, high FPS' }
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setGraphicsQuality(opt.id as any)}
                  className={`p-2.5 rounded-xl text-left border transition-all ${
                    graphicsQuality === opt.id
                      ? 'bg-slate-800 border-cyan-500/80 text-white shadow-sm'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="text-xs font-mono font-semibold">{opt.label}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5 leading-tight">{opt.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Colony Info */}
          <div className="p-3 rounded-xl bg-slate-900/50 border border-slate-800 text-xs text-slate-400 font-mono space-y-1">
            <div className="flex justify-between">
              <span>ENGINE:</span>
              <span className="text-slate-200">Three.js / React Three Fiber</span>
            </div>
            <div className="flex justify-between">
              <span>TARGET LUNAR COORDINATES:</span>
              <span className="text-slate-200">89.9°S 0.0°E (Shackleton Rim)</span>
            </div>
            <div className="flex justify-between">
              <span>CIVILIZATION ENGINE:</span>
              <span className="text-slate-200">LUNAR v1.0.0</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-900/30 border-t border-slate-800 flex items-center justify-end">
          <button
            onClick={() => setIsSettingsOpen(false)}
            className="px-4 py-1.5 rounded-lg text-xs font-mono font-semibold bg-cyan-600 hover:bg-cyan-500 text-white transition-colors"
          >
            Apply & Close
          </button>
        </div>
      </div>
    </div>
  );
};
