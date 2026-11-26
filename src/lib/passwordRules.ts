// ============================================================
// LUNAR — Phase 3: Password Strength & Validation Rules
// ============================================================

export interface PasswordRuleResult {
  id: string;
  label: string;
  required: boolean;
  passed: boolean;
}

export interface PasswordEvaluation {
  rules: PasswordRuleResult[];
  isValid: boolean;
  score: number; // 0..4
  strengthLabel: 'Too Weak' | 'Weak' | 'Fair' | 'Strong' | 'Orbital-Grade';
}

export function evaluatePassword(password: string): PasswordEvaluation {
  const rules: PasswordRuleResult[] = [
    {
      id: 'length',
      label: 'At least 8 characters',
      required: true,
      passed: password.length >= 8,
    },
    {
      id: 'upper',
      label: 'One uppercase letter (A-Z)',
      required: true,
      passed: /[A-Z]/.test(password),
    },
    {
      id: 'lower',
      label: 'One lowercase letter (a-z)',
      required: true,
      passed: /[a-z]/.test(password),
    },
    {
      id: 'number',
      label: 'One numeric digit (0-9)',
      required: true,
      passed: /[0-9]/.test(password),
    },
    {
      id: 'special',
      label: 'One special symbol (!@#$...)',
      required: false,
      passed: /[^A-Za-z0-9]/.test(password),
    },
  ];

  const requiredPassed = rules.filter((r) => r.required && r.passed).length;
  const totalPassed = rules.filter((r) => r.passed).length;
  const isValid = rules.filter((r) => r.required).every((r) => r.passed);

  let score = 0;
  if (password.length > 0) {
    if (totalPassed <= 1) score = 1;
    else if (totalPassed === 2 || !isValid) score = 2;
    else if (requiredPassed === 4 && totalPassed === 4) score = 3;
    else if (totalPassed === 5) score = 4;
  }

  const strengthLabel: PasswordEvaluation['strengthLabel'] =
    score === 0
      ? 'Too Weak'
      : score === 1
        ? 'Weak'
        : score === 2
          ? 'Fair'
          : score === 3
            ? 'Strong'
            : 'Orbital-Grade';

  return { rules, isValid, score, strengthLabel };
}
