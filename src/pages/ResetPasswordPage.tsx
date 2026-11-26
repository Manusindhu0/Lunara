import React, { useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { AlertCircle, ArrowRight, CheckCircle2, KeyRound } from 'lucide-react';
import AuthLayout from '../components/auth/AuthLayout';
import PasswordStrengthField from '../components/auth/PasswordStrengthField';
import { useAuth } from '../context/AuthContext';
import { isApiError } from '../lib/apiClient';
import { evaluatePassword } from '../lib/passwordRules';

export const ResetPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { resetPassword } = useAuth();

  const token = searchParams.get('token')?.trim() ?? '';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const passwordEval = useMemo(() => evaluatePassword(password), [password]);
  const passwordsMatch = password.length > 0 && password === confirmPassword;
  const canSubmit = Boolean(token) && passwordEval.isValid && passwordsMatch && !isSubmitting;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!token) {
      setError('Missing password reset token.');
      return;
    }
    if (!passwordEval.isValid) {
      setError('New passkey must meet all required security criteria.');
      return;
    }
    if (!passwordsMatch) {
      setError('Passkey confirmation does not match.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await resetPassword(token, password);
      setSuccessMessage(res.message);
    } catch (err) {
      if (isApiError(err)) {
        setError(err.message);
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Unable to reset passkey. Your reset link may have expired.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout
      badge="RECOVERY"
      subtitle="Cryptographic Passkey Update"
      eyebrow="Credential Override"
      title={successMessage ? 'Passkey Updated' : 'Set New Passkey'}
      description={
        successMessage
          ? 'Your Selenia Prime credentials have been updated. Active sessions have been rotated.'
          : 'Choose a strong new access passkey for your LUNAR account.'
      }
      footer={
        <span>
          Need a fresh reset link?{' '}
          <Link
            to="/forgot-password"
            className="text-cyan-400 hover:text-cyan-300 font-semibold transition-colors"
          >
            Request recovery email
          </Link>
        </span>
      }
    >
      {!token ? (
        <div className="space-y-5">
          <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-800/60 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="text-xs font-mono text-amber-200 leading-relaxed">
              No reset token found in this URL. Open the full link from your recovery email or request a new one.
            </div>
          </div>

          <Link
            to="/forgot-password"
            className="w-full py-3 px-5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-mono text-center text-slate-200 block transition-colors"
          >
            REQUEST NEW RESET LINK
          </Link>
        </div>
      ) : successMessage ? (
        <div className="space-y-5">
          <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-800/60 flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div className="text-xs font-mono text-emerald-200 leading-relaxed">
              {successMessage}
            </div>
          </div>

          <button
            type="button"
            onClick={() => navigate('/login', { replace: true })}
            className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-chakra text-sm font-bold tracking-wider uppercase flex items-center justify-center gap-2 transition-all shadow-lg shadow-cyan-950/50"
          >
            <span>SIGN IN WITH NEW PASSKEY</span>
            <ArrowRight className="w-4 h-4" />
          </button>
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
            <PasswordStrengthField
              password={password}
              onPasswordChange={setPassword}
              confirmPassword={confirmPassword}
              onConfirmPasswordChange={setConfirmPassword}
              passwordLabel="New Access Passkey"
              confirmLabel="Confirm New Passkey"
              disabled={isSubmitting}
            />

            <button
              type="submit"
              disabled={!canSubmit}
              className="w-full mt-2 py-3.5 px-6 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:from-slate-800 disabled:to-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed text-white font-chakra text-sm font-bold tracking-wider uppercase flex items-center justify-center gap-2 transition-all shadow-lg shadow-cyan-950/50"
            >
              <KeyRound className="w-4 h-4" />
              <span>{isSubmitting ? 'UPDATING...' : 'UPDATE PASSKEY'}</span>
            </button>
          </form>
        </>
      )}
    </AuthLayout>
  );
};

export default ResetPasswordPage;
