import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { Shield } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { buildAuthRedirectUrl } from '../../lib/authRedirect';

export interface ProtectedRouteProps {
  children?: React.ReactNode;
  requireVerified?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireVerified = false,
}) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  const returnPath = `${location.pathname}${location.search}${location.hash}`;

  if (isLoading) {
    return (
      <div className="h-screen overflow-y-auto bg-[#05070a] text-slate-100 flex items-center justify-center px-6">
        <div className="bg-slate-950/90 border border-slate-800/90 rounded-2xl px-8 py-6 shadow-2xl flex flex-col items-center gap-3 max-w-xs w-full text-center">
          <div className="w-11 h-11 rounded-xl bg-slate-900 border border-cyan-500/40 flex items-center justify-center">
            <Shield className="w-5 h-5 text-cyan-400 animate-pulse" />
          </div>
          <div className="font-chakra text-sm font-bold tracking-widest text-white uppercase">
            Verifying Clearance
          </div>
          <div className="text-[11px] font-mono text-slate-400">
            Syncing Selenia Prime session telemetry...
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <Navigate
        to={buildAuthRedirectUrl('/login', returnPath)}
        state={{ from: location }}
        replace
      />
    );
  }

  if (requireVerified && !user.emailVerified) {
    return (
      <Navigate
        to={buildAuthRedirectUrl('/verify-email', returnPath)}
        state={{ from: location }}
        replace
      />
    );
  }

  return children ? <>{children}</> : <Outlet />;
};

export default ProtectedRoute;
