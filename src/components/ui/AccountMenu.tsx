import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  ChevronDown,
  ExternalLink,
  LogIn,
  LogOut,
  Rocket,
  ShieldCheck,
  UserCheck,
  UserPlus,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export interface AccountMenuProps {
  citizenshipPath?: string;
  className?: string;
}

export const AccountMenu: React.FC<AccountMenuProps> = ({
  citizenshipPath = '/join',
  className = '',
}) => {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  const handleNavigate = (path: string) => {
    setIsOpen(false);
    navigate(path);
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      setIsOpen(false);
    } finally {
      setIsLoggingOut(false);
    }
  };

  if (isLoading) {
    return (
      <div
        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/70 border border-slate-800 text-[11px] font-mono text-slate-400 ${className}`}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
        <span className="hidden sm:inline">UPLINK...</span>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div className={`flex items-center gap-1.5 ${className}`}>
        <button
          type="button"
          onClick={() => navigate('/login')}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900/90 hover:bg-slate-800 border border-slate-700/70 text-xs font-mono text-slate-200 hover:text-white transition-colors"
          title="Sign in to LUNAR"
        >
          <LogIn className="w-3.5 h-3.5 text-slate-300" />
          <span>LOGIN</span>
        </button>

        <button
          type="button"
          onClick={() => navigate('/register')}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-700/60 text-xs font-mono font-bold text-cyan-300 hover:text-white transition-colors"
          title="Create a LUNAR account"
        >
          <UserPlus className="w-3.5 h-3.5 text-cyan-400" />
          <span className="hidden sm:inline">REGISTER</span>
        </button>
      </div>
    );
  }

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-slate-900/90 hover:bg-slate-800 border border-slate-700/70 hover:border-cyan-500/50 text-xs font-mono text-slate-200 transition-all"
        title={user.email}
      >
        <span
          className={`w-2 h-2 rounded-full shrink-0 ${
            user.emailVerified ? 'bg-emerald-400' : 'bg-amber-400 animate-pulse'
          }`}
        />
        {user.citizen ? (
          <span className="text-cyan-300 font-bold tracking-wide">
            {user.citizen.citizenId}
          </span>
        ) : (
          <span className="max-w-[120px] sm:max-w-[150px] truncate text-slate-200">
            {user.email}
          </span>
        )}
        {user.emailVerified ? (
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
        ) : (
          <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
        )}
        <ChevronDown
          className={`w-3.5 h-3.5 text-slate-400 transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {isOpen && (
        <div
          role="menu"
          className="absolute right-0 mt-2 w-72 bg-slate-950/95 backdrop-blur-xl border border-slate-800 rounded-2xl shadow-2xl p-3 z-50 text-left"
        >
          {/* Account identity header */}
          <div className="px-2 py-2 border-b border-slate-800/80">
            <div className="text-[10px] font-mono uppercase tracking-wider text-slate-500 mb-1">
              Active Lunar Account
            </div>
            <div className="text-xs font-mono text-white font-medium break-all">
              {user.email}
            </div>

            <div className="mt-2 flex items-center justify-between gap-2">
              {user.emailVerified ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-950/70 border border-emerald-800/70 text-[10px] font-mono font-semibold text-emerald-300">
                  <ShieldCheck className="w-3 h-3" />
                  EMAIL VERIFIED
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => handleNavigate('/verify-email')}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-950/70 hover:bg-amber-900/70 border border-amber-700/70 text-[10px] font-mono font-semibold text-amber-300 transition-colors"
                >
                  <AlertTriangle className="w-3 h-3" />
                  UNVERIFIED — VERIFY
                </button>
              )}

              {user.role === 'ADMIN' && (
                <span className="px-1.5 py-0.5 rounded bg-cyan-950/80 border border-cyan-800/60 text-[10px] font-mono text-cyan-300">
                  ADMIN
                </span>
              )}
            </div>
          </div>

          {/* Citizenship links */}
          <div className="py-2 space-y-1.5 border-b border-slate-800/80">
            {user.citizen ? (
              <button
                type="button"
                role="menuitem"
                onClick={() => handleNavigate(`/citizen/${user.citizen!.citizenId}`)}
                className="w-full flex items-center justify-between px-2.5 py-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/40 transition-colors group"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <UserCheck className="w-4 h-4 text-cyan-400 shrink-0" />
                  <div className="text-left min-w-0">
                    <div className="text-xs font-mono font-bold text-cyan-300">
                      {user.citizen.citizenId}
                    </div>
                    <div className="text-[11px] text-slate-400 truncate">
                      {user.citizen.displayName}
                    </div>
                  </div>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-300 shrink-0" />
              </button>
            ) : (
              <button
                type="button"
                role="menuitem"
                onClick={() => handleNavigate(citizenshipPath)}
                className="w-full flex items-center justify-between px-2.5 py-2 rounded-xl bg-cyan-950/50 hover:bg-cyan-900/60 border border-cyan-800/50 text-xs font-mono font-semibold text-cyan-300 hover:text-white transition-colors"
              >
                <span className="flex items-center gap-2">
                  <Rocket className="w-4 h-4 text-cyan-400" />
                  <span>Apply for Citizenship</span>
                </span>
                <ExternalLink className="w-3.5 h-3.5 text-cyan-400" />
              </button>
            )}
          </div>

          {/* Logout */}
          <div className="pt-2">
            <button
              type="button"
              role="menuitem"
              disabled={isLoggingOut}
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-slate-900 hover:bg-rose-950/60 border border-slate-800 hover:border-rose-800/60 text-xs font-mono text-slate-300 hover:text-rose-200 transition-colors disabled:opacity-50"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>{isLoggingOut ? 'TERMINATING SESSION...' : 'LOGOUT'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountMenu;
