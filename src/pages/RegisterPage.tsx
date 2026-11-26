import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { AlertCircle, ArrowRight, Mail } from 'lucide-react';
import AuthLayout from '../components/auth/AuthLayout';
import PasswordStrengthField from '../components/auth/PasswordStrengthField';
import { useAuth } from '../context/AuthContext';
import { isApiError } from '../lib/apiClient';
import { buildAuthRedirectUrl, sanitizeRedirectPath } from '../lib/authRedirect';
import { evaluatePassword } from '../lib/passwordRules';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isAuthenticated, isLoading, register } = useAuth();

  const redirectTarget = sanitizeRedirectPath(searchParams.get('redirect'), '/join');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate(redirectTarget, { replace: true });
    }
  }, [isLoading, isAuthenticated, navigate, redirectTarget]);

  const passwordEval = useMemo(() => evaluatePassword(password), [password]);
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const passwordsMatch = password.length > 0 && password === confirmPassword;
  const canSubmit = isEmailValid && passwordEval.isValid && passwordsMatch && !isSubmitting;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!isEmailValid) {
      setError('Please enter a valid email address.');
      return;
    }
    if (!passwordEval.isValid) {
      setError('Passkey must meet all required security criteria.');
      return;
    }
    if (!passwordsMatch) {
      setError('Passkey confirmation does not match.');
      return;
    }

    setIsSubmitting(true);
    try {
      const normalizedEmail = email.trim().toLowerCase();
      const result = await register(normalizedEmail, password);

      if (result.verificationRequired) {
        navigate(buildAuthRedirectUrl('/verify-email', redirectTarget), {
          replace: true,
          state: {
            email: normalizedEmail,
            fromRegister: true,
            message: result.message,
            emailDeliveryMode: result.emailDeliveryMode,
            devVerificationUrl: result.devVerificationUrl,
          },
        });
      } else {
        navigate(redirectTarget, { replace: true });
      }
    } catch (err) {
      if (isApiError(err)) {
        setError(err.message);
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Account registration failed. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const loginLink =
    redirectTarget !== '/join'
      ? buildAuthRedirectUrl('/login', redirectTarget)
      : '/login';

  return (
    <AuthLayout
      badge="ENLISTMENT AUTH"
      subtitle="Create Your Selenia Prime Account"
      eyebrow="Step 1 — Account Registration"
      title="Register Lunar Account"
      description="Establish your verified account before entering the Selenia Prime citizenship enlistment protocol."
      footer={
        <span>
          Already hold orbital clearance?{' '}
          <Link
            to={loginLink}
            className="text-cyan-400 hover:text-cyan-300 font-semibold transition-colors"
          >
            Sign in
          </Link>
        </span>
      }
    >
      {error && (
        <div className="mb-5 p-3.5 rounded-xl bg-rose-950/50 border border-rose-800/70 text-xs font-mono text-rose-200 flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <span>{error}</span>
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
              placeholder="applicant@domain.com"
              className="w-full pl-10 pr-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-sm font-mono text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500 disabled:opacity-60"
            />
          </div>
        </div>

        <PasswordStrengthField
          password={password}
          onPasswordChange={setPassword}
          confirmPassword={confirmPassword}
          onConfirmPasswordChange={setConfirmPassword}
          disabled={isSubmitting}
        />

        <button
          type="submit"
          disabled={!canSubmit}
          className="w-full mt-2 py-3.5 px-6 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:from-slate-800 disabled:to-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed text-white font-chakra text-sm font-bold tracking-wider uppercase flex items-center justify-center gap-2 transition-all shadow-lg shadow-cyan-950/50"
        >
          <span>{isSubmitting ? 'TRANSMITTING...' : 'CREATE ACCOUNT'}</span>
          {!isSubmitting && <ArrowRight className="w-4 h-4" />}
        </button>
      </form>
    </AuthLayout>
  );
};

export default RegisterPage;
