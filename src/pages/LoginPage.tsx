import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { AlertCircle, ArrowRight, Eye, EyeOff, Lock, Mail } from 'lucide-react';
import AuthLayout from '../components/auth/AuthLayout';
import { useAuth } from '../context/AuthContext';
import { isApiError } from '../lib/apiClient';
import { buildAuthRedirectUrl, sanitizeRedirectPath } from '../lib/authRedirect';

interface LocationState {
  from?: {
    pathname?: string;
    search?: string;
    hash?: string;
  };
}

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { isAuthenticated, isLoading, login } = useAuth();

  const stateFrom = (location.state as LocationState | null)?.from;
  const fromPath = stateFrom?.pathname
    ? `${stateFrom.pathname}${stateFrom.search ?? ''}${stateFrom.hash ?? ''}`
    : null;
  const redirectTarget = sanitizeRedirectPath(
    searchParams.get('redirect') ?? fromPath,
    '/world'
  );

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [needsVerification, setNeedsVerification] = useState(false);

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate(redirectTarget, { replace: true });
    }
  }, [isLoading, isAuthenticated, navigate, redirectTarget]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setNeedsVerification(false);

    if (!email.trim() || !password) {
      setError('Enter both your email address and access passkey.');
      return;
    }

    setIsSubmitting(true);
    try {
      const loggedInUser = await login(email, password);
      if (!loggedInUser.emailVerified && redirectTarget.startsWith('/join')) {
        navigate(buildAuthRedirectUrl('/verify-email', redirectTarget), {
          replace: true,
        });
        return;
      }
      navigate(redirectTarget, { replace: true });
    } catch (err) {
      if (isApiError(err)) {
        setError(err.message);
        if (err.code === 'EMAIL_NOT_VERIFIED') {
          setNeedsVerification(true);
        }
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Unable to authenticate. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const registerLink =
    redirectTarget !== '/world'
      ? buildAuthRedirectUrl('/register', redirectTarget)
      : '/register';

  return (
    <AuthLayout
      badge="AUTH GATEWAY"
      subtitle="Selenia Prime Colony Uplink"
      eyebrow="Personnel Sign-In"
      title="Access Lunar Account"
      description="Authenticate with your Selenia Prime credentials to manage your citizenship and orbital status."
      footer={
        <span>
          New to Selenia Prime?{' '}
          <Link
            to={registerLink}
            className="text-cyan-400 hover:text-cyan-300 font-semibold transition-colors"
          >
            Create an account
          </Link>
        </span>
      }
    >
      {error && (
        <div className="mb-5 p-3.5 rounded-xl bg-rose-950/50 border border-rose-800/70 text-xs font-mono text-rose-200 flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <div className="space-y-1.5">
            <div>{error}</div>
            {needsVerification && (
              <Link
                to="/verify-email"
                state={{ email: email.trim().toLowerCase() }}
                className="inline-block text-amber-300 hover:text-amber-200 underline font-semibold"
              >
                Open email verification console
              </Link>
            )}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-mono text-slate-300 mb-1.5 uppercase font-semibold">
            Email Address
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
              disabled={isSubmitting}
              placeholder="citizen@selenia.lunar"
              className="w-full pl-10 pr-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-sm font-mono text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500 disabled:opacity-60"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-mono text-slate-300 uppercase font-semibold">
              Access Passkey
            </label>
            <Link
              to="/forgot-password"
              className="text-[11px] font-mono text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              Forgot passkey?
            </Link>
          </div>
          <div className="relative">
            <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
              disabled={isSubmitting}
              placeholder="Enter your passkey"
              className="w-full pl-10 pr-10 py-3 bg-slate-900 border border-slate-800 rounded-xl text-sm font-mono text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500 disabled:opacity-60"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-500 hover:text-slate-300 transition-colors"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full mt-2 py-3.5 px-6 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:from-slate-800 disabled:to-slate-800 disabled:text-slate-500 text-white font-chakra text-sm font-bold tracking-wider uppercase flex items-center justify-center gap-2 transition-all shadow-lg shadow-cyan-950/50"
        >
          <span>{isSubmitting ? 'AUTHENTICATING...' : 'ESTABLISH UPLINK'}</span>
          {!isSubmitting && <ArrowRight className="w-4 h-4" />}
        </button>
      </form>
    </AuthLayout>
  );
};

export default LoginPage;
