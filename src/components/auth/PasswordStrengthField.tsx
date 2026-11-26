import React, { useMemo, useState } from 'react';
import { AlertCircle, CheckCircle2, Eye, EyeOff, Lock } from 'lucide-react';
import { evaluatePassword } from '../../lib/passwordRules';

export interface PasswordStrengthFieldProps {
  password: string;
  onPasswordChange: (value: string) => void;
  confirmPassword: string;
  onConfirmPasswordChange: (value: string) => void;
  passwordLabel?: string;
  confirmLabel?: string;
  autoComplete?: string;
  disabled?: boolean;
}

export const PasswordStrengthField: React.FC<PasswordStrengthFieldProps> = ({
  password,
  onPasswordChange,
  confirmPassword,
  onConfirmPasswordChange,
  passwordLabel = 'Access Passkey',
  confirmLabel = 'Confirm Passkey',
  autoComplete = 'new-password',
  disabled = false,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const evaluation = useMemo(() => evaluatePassword(password), [password]);
  const passwordsMatch =
    confirmPassword.length > 0 && password === confirmPassword;
  const showMismatch =
    confirmPassword.length > 0 && password !== confirmPassword;

  const barColors = [
    'bg-slate-800',
    'bg-rose-500',
    'bg-amber-400',
    'bg-cyan-400',
    'bg-emerald-400',
  ];

  const labelColor =
    evaluation.score <= 1
      ? 'text-rose-400'
      : evaluation.score === 2
        ? 'text-amber-400'
        : evaluation.score === 3
          ? 'text-cyan-400'
          : 'text-emerald-400';

  return (
    <div className="space-y-4">
      {/* Password Input */}
      <div>
        <label className="block text-xs font-mono text-slate-300 mb-1.5 uppercase font-semibold">
          {passwordLabel}
        </label>
        <div className="relative">
          <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => onPasswordChange(e.target.value)}
            autoComplete={autoComplete}
            disabled={disabled}
            required
            placeholder="Minimum 8 characters"
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

        {/* Strength meter */}
        {password.length > 0 && (
          <div className="mt-2.5 space-y-2">
            <div className="flex items-center justify-between text-[11px] font-mono">
              <span className="text-slate-500">KEY INTEGRITY</span>
              <span className={`font-semibold ${labelColor}`}>
                {evaluation.strengthLabel}
              </span>
            </div>
            <div className="grid grid-cols-4 gap-1.5">
              {[1, 2, 3, 4].map((segment) => (
                <div
                  key={segment}
                  className={`h-1.5 rounded-full transition-colors ${
                    evaluation.score >= segment
                      ? barColors[evaluation.score]
                      : 'bg-slate-800'
                  }`}
                />
              ))}
            </div>
          </div>
        )}

        {/* Password rules checklist */}
        <ul className="mt-3 space-y-1.5 bg-slate-900/50 border border-slate-800/80 rounded-xl p-3">
          {evaluation.rules.map((rule) => (
            <li
              key={rule.id}
              className={`flex items-center gap-2 text-[11px] font-mono ${
                rule.passed ? 'text-emerald-400' : 'text-slate-500'
              }`}
            >
              <CheckCircle2
                className={`w-3.5 h-3.5 shrink-0 ${
                  rule.passed ? 'text-emerald-400' : 'text-slate-700'
                }`}
              />
              <span>
                {rule.label}
                {!rule.required && (
                  <span className="text-slate-600 ml-1">(recommended)</span>
                )}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* Confirm Password Input */}
      <div>
        <label className="block text-xs font-mono text-slate-300 mb-1.5 uppercase font-semibold">
          {confirmLabel}
        </label>
        <div className="relative">
          <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type={showConfirm ? 'text' : 'password'}
            value={confirmPassword}
            onChange={(e) => onConfirmPasswordChange(e.target.value)}
            autoComplete={autoComplete}
            disabled={disabled}
            required
            placeholder="Re-enter passkey"
            className={`w-full pl-10 pr-10 py-3 bg-slate-900 border rounded-xl text-sm font-mono text-white placeholder-slate-600 focus:outline-none disabled:opacity-60 ${
              showMismatch
                ? 'border-rose-500/80 focus:border-rose-400'
                : passwordsMatch
                  ? 'border-emerald-500/70 focus:border-emerald-400'
                  : 'border-slate-800 focus:border-cyan-500'
            }`}
          />
          <button
            type="button"
            onClick={() => setShowConfirm((v) => !v)}
            aria-label={showConfirm ? 'Hide confirmation password' : 'Show confirmation password'}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-500 hover:text-slate-300 transition-colors"
          >
            {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>

        {showMismatch && (
          <div className="flex items-center gap-1.5 text-[11px] font-mono text-rose-400 mt-1.5">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>Passkeys do not match.</span>
          </div>
        )}
        {passwordsMatch && (
          <div className="flex items-center gap-1.5 text-[11px] font-mono text-emerald-400 mt-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
            <span>Passkeys match.</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default PasswordStrengthField;
