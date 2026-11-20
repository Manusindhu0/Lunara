import React from 'react';
import { X, Bell, AlertTriangle, CheckCircle, Info, Radio } from 'lucide-react';
import { useColony } from '../../context/ColonyContext';

export const NotificationsModal: React.FC = () => {
  const { isNotificationsOpen, setIsNotificationsOpen } = useColony();

  if (!isNotificationsOpen) return null;

  const notifications = [
    {
      id: '1',
      type: 'info',
      title: 'Earth Optical Downlink Online',
      desc: 'BEACON District locked coherent laser link with Goldstone Deep Space Station. Bandwidth: 120 Gbps.',
      time: '2m ago'
    },
    {
      id: '2',
      type: 'success',
      title: 'Helium-3 Tokamak Generation Surge',
      desc: 'FORGE Reactor 01 output reached nominal +38.5 MW. Energy reserves at 99.8% capacity.',
      time: '14m ago'
    },
    {
      id: '3',
      type: 'warning',
      title: 'Micrometeorite Advisory: Sector 4',
      desc: 'Low-density debris cloud passing Shackleton rim. Perimeter sensors indicate zero hull breaches.',
      time: '42m ago'
    },
    {
      id: '4',
      type: 'info',
      title: 'Hydroponic Harvest Cycle 88 Completed',
      desc: 'EDEN Biosphere Dome harvested 420 kg of spirulina protein biomass and enriched closed-loop O2 reserves.',
      time: '1h ago'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center gap-2.5">
            <Radio className="w-4 h-4 text-cyan-400 animate-pulse" />
            <h3 className="font-chakra text-base font-bold text-white tracking-wide">
              COLONY TELEMETRY & ALERTS
            </h3>
          </div>
          <button
            onClick={() => setIsNotificationsOpen(false)}
            className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-3 overflow-y-auto max-h-[60vh]">
          {notifications.map((item) => (
            <div
              key={item.id}
              className="p-3.5 rounded-xl bg-slate-900/40 border border-slate-800 flex items-start gap-3"
            >
              <div className="mt-0.5">
                {item.type === 'success' && <CheckCircle className="w-4 h-4 text-emerald-400" />}
                {item.type === 'warning' && <AlertTriangle className="w-4 h-4 text-amber-400" />}
                {item.type === 'info' && <Info className="w-4 h-4 text-cyan-400" />}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-mono font-semibold text-slate-200">{item.title}</h4>
                  <span className="text-[10px] font-mono text-slate-500">{item.time}</span>
                </div>
                <p className="text-xs text-slate-400 mt-1 font-sans leading-relaxed">
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-900/30 border-t border-slate-800 flex items-center justify-end">
          <button
            onClick={() => setIsNotificationsOpen(false)}
            className="px-4 py-1.5 rounded-lg text-xs font-mono font-semibold bg-slate-800 hover:bg-slate-700 text-white"
          >
            Dismiss All
          </button>
        </div>
      </div>
    </div>
  );
};
