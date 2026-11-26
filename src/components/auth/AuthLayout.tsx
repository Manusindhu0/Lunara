import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Compass } from 'lucide-react';

export interface AuthLayoutProps {
  badge?: string;
  subtitle?: string;
  eyebrow?: string;
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({
  badge = 'AUTH GATEWAY',
  subtitle = 'Selenia Prime Orbital Access Protocol',
  eyebrow,
  title,
  description,
  children,
  footer,
}) => {
  const navigate = useNavigate();

  return (
    <div className="h-screen overflow-y-auto bg-[#05070a] text-slate-100 flex flex-col font-sans select-text relative">
      {/* Subtle lunar horizon ambient lighting */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[720px] h-[360px] rounded-full bg-cyan-500/[0.06] blur-3xl" />
        <div className="absolute -bottom-48 right-1/4 w-[520px] h-[320px] rounded-full bg-amber-500/[0.04] blur-3xl" />
      </div>

      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-30 bg-slate-950/85 backdrop-blur-xl border-b border-slate-800/80 px-6 py-4 flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate('/world')}
          className="flex items-center gap-3 group focus:outline-none"
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
                {badge}
              </span>
            </div>
            <div className="text-[11px] font-mono text-slate-400 hidden sm:block">
              {subtitle}
            </div>
          </div>
        </button>

        <button
          type="button"
          onClick={() => navigate('/world')}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-xs font-mono text-slate-200 hover:text-cyan-300 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-cyan-400" />
          <Compass className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
          <span>Return to Moon</span>
        </button>
      </header>

      {/* Main Centered Auth Card */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-6 py-10">
        <div className="w-full max-w-md">
          <div className="bg-slate-950/90 border border-slate-800/90 rounded-3xl p-7 md:p-8 shadow-2xl relative overflow-hidden">
            {/* Subtle top HUD hairline */}
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />

            <div className="mb-6">
              {eyebrow && (
                <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-cyan-400 font-semibold mb-1.5">
                  {eyebrow}
                </div>
              )}
              <h1 className="font-chakra text-2xl md:text-3xl font-bold text-white tracking-wide">
                {title}
              </h1>
              {description && (
                <p className="text-xs font-mono text-slate-400 mt-2 leading-relaxed">
                  {description}
                </p>
              )}
            </div>

            {children}
          </div>

          {footer && (
            <div className="mt-5 text-center text-xs font-mono text-slate-400">
              {footer}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AuthLayout;
