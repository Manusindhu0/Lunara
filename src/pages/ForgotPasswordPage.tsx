import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, ArrowRight, CheckCircle2, Mail } from 'lucide-react';
import AuthLayout from '../components/auth/AuthLayout';
import { useAuth } from '../context/AuthContext';
import { isApiError } from '../lib/apiClient';

export const ForgotPasswordPage: React.FC = () => {
  const { forgotPassword } = useAuth();

  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedMessage, setSubmittedMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim()) {
      setError('Enter your registered email address.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await forgotPassword(email);
      setSubmittedMessage(res.message);
    } catch (err) {
      if (isApiError(err)) {
        setError(err.message);
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Unable to process password recovery request.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout
      badge="RECOVERY"
      subtitle="Passkey Reset Dispatch"
      eyebrow="Credential Recovery"
      title="Reset Access Passkey"
      description="Enter your registered email address to receive a time-limited passkey reset link."
      footer={
        <span>
          Remembered your passkey?{' '}
          <Link
            to="/login"
            className="text-cyan-400 hover:text-cyan-300 font-semibold transition-colors"
          >
            Return to sign in
          </Link>
        </span>
      }
    >
      {submittedMessage ? (
        <div className="space-y-5">
          <div className="p-4 rounded-2xl bg-cyan-950/40 border border-cyan-800/60 flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
            <div className="text-xs font-mono text-slate-200 leading-relaxed">
              {submittedMessage}
            </div>
          </div>

          <div className="flex flex-col gap-2.5">
            <Link
              to="/login"
              className="w-full py-3 px-5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-mono text-center text-slate-200 transition-colors"
            >
              RETURN TO SIGN IN
            </Link>
            <button
              type="button"
              onClick={() => {
                setSubmittedMessage(null);
                setEmail('');
              }}
              className="text-[11px] font-mono text-slate-400 hover:text-cyan-300 transition-colors py-1"
            >
              Send to a different email address
            </button>
          </div>
        </div>
      ) : (
        <>
          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-950/50 border border-rose-800/70 text-xs font-mono text-rose-200 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-mono text-slate-300 mb-1.5 uppercase font-semibold">
                Registered Email Address
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

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:from-slate-800 disabled:to-slate-800 disabled:text-slate-500 text-white font-chakra text-sm font-bold tracking-wider uppercase flex items-center justify-center gap-2 transition-all shadow-lg shadow-cyan-950/50"
            >
              <span>{isSubmitting ? 'DISPATCHING...' : 'SEND RECOVERY LINK'}</span>
              {!isSubmitting && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>
        </>
      )}
    </AuthLayout>
  );
};

export default ForgotPasswordPage;
