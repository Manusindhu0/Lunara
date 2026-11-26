import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Mail,
  RefreshCw,
  ShieldCheck,
} from 'lucide-react';
import AuthLayout from '../components/auth/AuthLayout';
import { useAuth } from '../context/AuthContext';
import { isApiError } from '../lib/apiClient';
import { sanitizeRedirectPath } from '../lib/authRedirect';

interface VerifyLocationState {
  email?: string;
  fromRegister?: boolean;
  message?: string;
  emailDeliveryMode?: 'resend' | 'console' | 'disabled';
  devVerificationUrl?: string;
}

export const VerifyEmailPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { user, verifyEmail, resendVerification, refreshUser } = useAuth();

  const token = searchParams.get('token')?.trim() ?? '';
  const redirectTarget = sanitizeRedirectPath(searchParams.get('redirect'), '/join');
  const locState = (location.state as VerifyLocationState | null) ?? {};

  const [verifyStatus, setVerifyStatus] = useState<
    'idle' | 'verifying' | 'verified' | 'error'
  >(token ? 'verifying' : user?.emailVerified ? 'verified' : 'idle');
  const [statusMessage, setStatusMessage] = useState<string | null>(
    locState.message ?? null
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [emailInput, setEmailInput] = useState<string>(
    user?.email ?? locState.email ?? ''
  );
  const [isResending, setIsResending] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [cooldownSeconds, setCooldownSeconds] = useState(0);

  const tokenRequestRef = useRef<{
    token: string;
    promise: Promise<{ message: string }>;
  } | null>(null);

  useEffect(() => {
    if (user?.email && !emailInput) {
      setEmailInput(user.email);
    }
  }, [user?.email, emailInput]);

  useEffect(() => {
    if (!token && user?.emailVerified) {
      setVerifyStatus('verified');
    }
  }, [token, user?.emailVerified]);

  useEffect(() => {
    if (!token) {
      return;
    }

    let cancelled = false;
    setVerifyStatus('verifying');
    setErrorMessage(null);

    if (!tokenRequestRef.current || tokenRequestRef.current.token !== token) {
      tokenRequestRef.current = {
        token,
        promise: verifyEmail(token),
      };
    }

    tokenRequestRef.current.promise
      .then((res) => {
        if (cancelled) return;
        setVerifyStatus('verified');
        setStatusMessage(res.message);
      })
      .catch((err) => {
        if (cancelled) return;
        setVerifyStatus('error');
        if (isApiError(err)) {
          setErrorMessage(err.message);
        } else if (err instanceof Error) {
          setErrorMessage(err.message);
        } else {
          setErrorMessage('Verification link is invalid or has expired.');
        }
      });

    return () => {
      cancelled = true;
    };
  }, [token, verifyEmail]);

  useEffect(() => {
    if (cooldownSeconds <= 0) return;
    const timer = window.setTimeout(() => {
      setCooldownSeconds((s) => Math.max(0, s - 1));
    }, 1000);
    return () => window.clearTimeout(timer);
  }, [cooldownSeconds]);

  const handleResend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage(null);
    setStatusMessage(null);

    const targetEmail = (user?.email ?? emailInput).trim().toLowerCase();
    if (!targetEmail) {
      setErrorMessage('Enter the email address associated with your account.');
      return;
    }

    setIsResending(true);
    try {
      const res = await resendVerification(targetEmail);
      setStatusMessage(res.message);
      setCooldownSeconds(60);
    } catch (err) {
      if (isApiError(err)) {
        setErrorMessage(err.message);
      } else if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage('Unable to resend verification email right now.');
      }
    } finally {
      setIsResending(false);
    }
  };

  const handleCheckStatus = async () => {
    setIsRefreshing(true);
    setErrorMessage(null);
    try {
      const latest = await refreshUser();
      if (latest?.emailVerified) {
        setVerifyStatus('verified');
        setStatusMessage('Email verification confirmed.');
      } else {
        setStatusMessage('Verification still pending. Check your email inbox or spam folder.');
      }
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <AuthLayout
      badge="VERIFICATION"
      subtitle="Email Telemetry Confirmation"
      eyebrow="Identity Check"
      title={
        verifyStatus === 'verified'
          ? 'Email Confirmed'
          : verifyStatus === 'verifying'
            ? 'Verifying Uplink...'
            : 'Verify Your Email'
      }
      description={
        verifyStatus === 'verified'
          ? 'Your communication channel is verified and cleared for Selenia Prime citizenship protocols.'
          : 'Confirm your email address using the verification link sent to your inbox.'
      }
      footer={
        <div className="flex items-center justify-center gap-4">
          <Link to="/login" className="text-cyan-400 hover:text-cyan-300 transition-colors">
            Sign in
          </Link>
          <span className="text-slate-700">•</span>
          <Link to="/world" className="text-slate-400 hover:text-slate-200 transition-colors">
            Explore 3D Moon
          </Link>
        </div>
      }
    >
      {verifyStatus === 'verifying' && (
        <div className="py-8 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-cyan-950/70 border border-cyan-800/70 flex items-center justify-center mx-auto">
            <RefreshCw className="w-7 h-7 text-cyan-400 animate-spin" />
          </div>
          <div className="text-xs font-mono text-slate-300">
            Validating cryptographic verification token...
          </div>
        </div>
      )}

      {verifyStatus === 'verified' && (
        <div className="space-y-5">
          <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-800/60 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div className="text-xs font-mono text-emerald-200 leading-relaxed">
              {statusMessage ?? 'Email address successfully verified.'}
            </div>
          </div>

          <div className="flex flex-col gap-2.5">
            <button
              type="button"
              onClick={() => navigate(redirectTarget)}
              className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-chakra text-sm font-bold tracking-wider uppercase flex items-center justify-center gap-2 transition-all shadow-lg shadow-cyan-950/50"
            >
              <span>CONTINUE TO COLONY</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => navigate('/world')}
              className="w-full py-2.5 px-5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-mono text-slate-300 transition-colors"
            >
              Return to Moon
            </button>
          </div>
        </div>
      )}

      {(verifyStatus === 'idle' || verifyStatus === 'error') && (
        <div className="space-y-5">
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-950/50 border border-rose-800/70 text-xs font-mono text-rose-200 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {statusMessage && !errorMessage && (
            <div className="p-3.5 rounded-xl bg-cyan-950/40 border border-cyan-800/60 text-xs font-mono text-cyan-200 flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <span>{statusMessage}</span>
            </div>
          )}

          {locState.emailDeliveryMode === 'console' && locState.devVerificationUrl && (
            <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-700/60 space-y-3">
              <div className="text-[11px] font-mono uppercase tracking-wider text-amber-300 font-semibold">
                Dev Console Mode — No Email Provider Configured
              </div>
              <p className="text-xs font-mono text-amber-100/90 leading-relaxed">
                No email was delivered to your inbox because{' '}
                <code className="text-amber-300">RESEND_API_KEY</code> is unset in{' '}
                <code className="text-amber-300">server/.env</code>. Use this local dev link to
                verify your account now:
              </p>
              <Link
                to={locState.devVerificationUrl}
                className="w-full py-2.5 px-4 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-chakra text-xs font-bold tracking-wider uppercase flex items-center justify-center gap-2 transition-colors"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>VERIFY EMAIL NOW (DEV MODE)</span>
              </Link>
            </div>
          )}

          <form onSubmit={handleResend} className="space-y-4">
            {user?.email ? (
              <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs font-mono">
                <div className="text-[10px] uppercase text-slate-500 mb-1">
                  Target Email Channel
                </div>
                <div className="text-slate-100 font-semibold break-all">{user.email}</div>
              </div>
            ) : (
              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1.5 uppercase font-semibold">
                  Account Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="email"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    required
                    disabled={isResending}
                    placeholder="citizen@selenia.lunar"
                    className="w-full pl-10 pr-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-sm font-mono text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isResending || cooldownSeconds > 0}
              className="w-full py-3 px-5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 disabled:from-slate-800 disabled:to-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed text-slate-950 font-chakra text-sm font-bold tracking-wider uppercase flex items-center justify-center gap-2 transition-all"
            >
              <Mail className="w-4 h-4" />
              <span>
                {isResending
                  ? 'TRANSMITTING...'
                  : cooldownSeconds > 0
                    ? `RESEND AVAILABLE IN ${cooldownSeconds}S`
                    : 'RESEND VERIFICATION EMAIL'}
              </span>
            </button>
          </form>

          {user && (
            <button
              type="button"
              disabled={isRefreshing}
              onClick={handleCheckStatus}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-mono text-slate-300 flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>{isRefreshing ? 'CHECKING STATUS...' : 'I HAVE VERIFIED — REFRESH'}</span>
            </button>
          )}
        </div>
      )}
    </AuthLayout>
  );
};

export default VerifyEmailPage;
