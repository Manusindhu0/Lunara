import React from 'react';
import { RotateCcw, ZoomIn, ZoomOut, Layers, Eye, Compass, HelpCircle } from 'lucide-react';
import { useColony } from '../../context/ColonyContext';
import { CameraViewPreset } from '../../types';

export const CameraControlsHUD: React.FC = () => {
  const {
    cameraPreset,
    setCameraPreset,
    resetCamera,
    zoomIn,
    zoomOut,
    selectedDistrict,
    districts,
    focusDistrict
  } = useColony();

  const handlePresetChange = (preset: CameraViewPreset) => {
    setCameraPreset(preset);
    if (preset === 'overview') {
      resetCamera();
    } else if (preset === 'district') {
      focusDistrict(selectedDistrict || 'NEXUS');
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-20 pointer-events-none flex flex-col items-end gap-3">
      {/* Interaction Hint Pill */}
      <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-950/70 backdrop-blur-md border border-slate-800/60 text-[11px] font-mono text-slate-400 shadow-xl">
        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
        <span>LEFT CLICK TO ORBIT • RIGHT CLICK TO PAN • SCROLL TO ZOOM</span>
      </div>

      {/* Camera Controls Panel */}
      <div className="pointer-events-auto flex items-center gap-2 bg-slate-950/85 backdrop-blur-md border border-slate-800/80 rounded-2xl p-2 shadow-2xl">
        {/* Preset Selector */}
        <div className="flex items-center gap-1 p-1 bg-slate-900/90 rounded-xl border border-slate-800">
          <button
            onClick={() => handlePresetChange('overview')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium tracking-wider transition-all flex items-center gap-1.5 ${
              cameraPreset === 'overview'
                ? 'bg-slate-800 text-white shadow-sm border border-slate-700/80 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Colony Wide Overview"
          >
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">OVERVIEW</span>
          </button>

          <button
            onClick={() => handlePresetChange('district')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium tracking-wider transition-all flex items-center gap-1.5 ${
              cameraPreset === 'district'
                ? 'bg-slate-800 text-white shadow-sm border border-slate-700/80 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="District Level Exploration"
          >
            <Compass className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden sm:inline">DISTRICT</span>
          </button>

          <button
            onClick={() => handlePresetChange('inspection')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium tracking-wider transition-all flex items-center gap-1.5 ${
              cameraPreset === 'inspection'
                ? 'bg-slate-800 text-white shadow-sm border border-slate-700/80 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Building / Astronaut Inspection"
          >
            <Eye className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">INSPECT</span>
          </button>
        </div>

        <div className="w-px h-6 bg-slate-800 mx-1" />

        {/* Zoom In Button */}
        <button
          onClick={zoomIn}
          className="p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition-colors"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </button>

        {/* Zoom Out Button */}
        <button
          onClick={zoomOut}
          className="p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition-colors"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>

        {/* Reset View Button */}
        <button
          onClick={resetCamera}
          className="p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-cyan-400 transition-colors"
          title="Reset Camera to Default"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
