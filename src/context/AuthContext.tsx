import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { apiClient, clearCsrfToken, isApiError } from '../lib/apiClient';

// ============================================================
// LUNAR — Phase 3: Cookie-Session Authentication Context
// No auth tokens are ever stored in localStorage/sessionStorage.
// ============================================================

export interface AuthCitizenSummary {
  id?: string;
  citizenId: string;
  username: string;
  displayName: string;
  districtId?: string;
  department?: string;
  status?: string;
  avatarUrl?: string | null;
  suitColor?: string;
}

export interface AuthInstagramSummary {
  connected: boolean;
  username?: string;
  profilePictureUrl?: string | null;
}

export interface AuthEligibilitySummary {
  status: string;
  verifiedAt?: string | null;
  expiresAt?: string | null;
}

export interface AuthUser {
  id: string;
  email: string;
  emailVerified: boolean;
  role: 'USER' | 'ADMIN' | string;
  createdAt?: string;
  citizen?: AuthCitizenSummary | null;
  instagram?: AuthInstagramSummary | null;
  eligibility?: AuthEligibilitySummary | null;
}

export interface RegisterResult {
  user: AuthUser | null;
  message: string;
  verificationRequired: boolean;
  emailDeliveryMode?: 'resend' | 'console' | 'disabled';
  devVerificationUrl?: string;
}

export interface VerifyEmailResult {
  user: AuthUser | null;
  message: string;
}

export interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  refreshUser: () => Promise<AuthUser | null>;
  login: (email: string, password: string) => Promise<AuthUser>;
  register: (email: string, password: string) => Promise<RegisterResult>;
  logout: () => Promise<void>;
  verifyEmail: (token: string) => Promise<VerifyEmailResult>;
  resendVerification: (email?: string) => Promise<{ message: string }>;
  forgotPassword: (email: string) => Promise<{ message: string }>;
  resetPassword: (token: string, password: string) => Promise<{ message: string }>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function extractAuthUser(payload: unknown): AuthUser | null {
  if (!payload || typeof payload !== 'object') {
    return null;
  }

  const root = payload as Record<string, unknown>;
  const data =
    root.data && typeof root.data === 'object'
      ? (root.data as Record<string, unknown>)
      : root;

  const rawUser =
    data.user && typeof data.user === 'object'
      ? (data.user as Record<string, unknown>)
      : typeof data.id === 'string' && typeof data.email === 'string'
        ? data
        : null;

  if (!rawUser || typeof rawUser.id !== 'string' || typeof rawUser.email !== 'string') {
    return null;
  }

  const citizenSource =
    (rawUser.citizen && typeof rawUser.citizen === 'object' ? rawUser.citizen : null) ??
    (data.citizen && typeof data.citizen === 'object' ? data.citizen : null);

  const instagramSource =
    (rawUser.instagram && typeof rawUser.instagram === 'object' ? rawUser.instagram : null) ??
    (data.instagram && typeof data.instagram === 'object' ? data.instagram : null);

  const eligibilitySource =
    (rawUser.eligibility && typeof rawUser.eligibility === 'object' ? rawUser.eligibility : null) ??
    (data.eligibility && typeof data.eligibility === 'object' ? data.eligibility : null);

  return {
    id: rawUser.id,
    email: rawUser.email,
    emailVerified: Boolean(rawUser.emailVerified),
    role: typeof rawUser.role === 'string' ? rawUser.role : 'USER',
    createdAt: typeof rawUser.createdAt === 'string' ? rawUser.createdAt : undefined,
    citizen: citizenSource as AuthCitizenSummary | null,
    instagram: instagramSource as AuthInstagramSummary | null,
    eligibility: eligibilitySource as AuthEligibilitySummary | null,
  };
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshUser = useCallback(async (): Promise<AuthUser | null> => {
    try {
      const res = await apiClient.get<unknown>('/api/auth/me');
      const nextUser = extractAuthUser(res);
      setUser(nextUser);
      return nextUser;
    } catch (err) {
      // 401/403 means guest or expired session; network errors keep app usable in offline/demo mode
      if (isApiError(err) && (err.status === 401 || err.status === 403)) {
        setUser(null);
        return null;
      }
      setUser(null);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshUser();
  }, [refreshUser]);

  const login = useCallback(
    async (email: string, password: string): Promise<AuthUser> => {
      const res = await apiClient.post<unknown>('/api/auth/login', {
        email: email.trim().toLowerCase(),
        password,
      });

      const loggedInUser = extractAuthUser(res) ?? (await refreshUser());
      if (!loggedInUser) {
        throw new Error('Authentication succeeded but user profile could not be loaded.');
      }
      setUser(loggedInUser);
      setIsLoading(false);
      return loggedInUser;
    },
    [refreshUser]
  );

  const register = useCallback(
    async (email: string, password: string): Promise<RegisterResult> => {
      const res = await apiClient.post<Record<string, unknown>>('/api/auth/register', {
        email: email.trim().toLowerCase(),
        password,
      });

      const createdUser = extractAuthUser(res) ?? (await refreshUser());
      if (createdUser) {
        setUser(createdUser);
      }
      setIsLoading(false);

      const message =
        typeof res?.message === 'string'
          ? res.message
          : 'Account registered. Check your inbox for the verification link.';

      return {
        user: createdUser,
        message,
        verificationRequired: createdUser ? !createdUser.emailVerified : true,
        emailDeliveryMode:
          res?.emailDeliveryMode === 'resend' ||
          res?.emailDeliveryMode === 'console' ||
          res?.emailDeliveryMode === 'disabled'
            ? res.emailDeliveryMode
            : undefined,
        devVerificationUrl:
          typeof res?.devVerificationUrl === 'string' ? res.devVerificationUrl : undefined,
      };
    },
    [refreshUser]
  );

  const logout = useCallback(async (): Promise<void> => {
    try {
      await apiClient.post('/api/auth/logout');
    } catch {
      // Clear local session state even if server session already expired
    } finally {
      clearCsrfToken();
      setUser(null);
      setIsLoading(false);
    }
  }, []);

  const verifyEmail = useCallback(
    async (token: string): Promise<VerifyEmailResult> => {
      const res = await apiClient.post<Record<string, unknown>>('/api/auth/verify-email', {
        token,
      });

      const verifiedUser = extractAuthUser(res) ?? (await refreshUser());
      if (verifiedUser) {
        setUser(verifiedUser);
      }

      const message =
        typeof res?.message === 'string'
          ? res.message
          : 'Email address verified. Lunar uplink confirmed.';

      return {
        user: verifiedUser,
        message,
      };
    },
    [refreshUser]
  );

  const resendVerification = useCallback(
    async (email?: string): Promise<{ message: string }> => {
      const payload = email?.trim()
        ? { email: email.trim().toLowerCase() }
        : user?.email
          ? { email: user.email }
          : {};

      const res = await apiClient.post<Record<string, unknown>>(
        '/api/auth/resend-verification',
        payload
      );

      return {
        message:
          typeof res?.message === 'string'
            ? res.message
            : 'Verification transmission dispatched. Check your email inbox.',
      };
    },
    [user?.email]
  );

  const forgotPassword = useCallback(async (email: string): Promise<{ message: string }> => {
    const res = await apiClient.post<Record<string, unknown>>('/api/auth/forgot-password', {
      email: email.trim().toLowerCase(),
    });

    return {
      message:
        typeof res?.message === 'string'
          ? res.message
          : 'If an account matches that email, recovery instructions have been dispatched.',
    };
  }, []);

  const resetPassword = useCallback(
    async (token: string, password: string): Promise<{ message: string }> => {
      const res = await apiClient.post<Record<string, unknown>>('/api/auth/reset-password', {
        token,
        password,
      });

      return {
        message:
          typeof res?.message === 'string'
            ? res.message
            : 'Security credentials updated. You may now sign in.',
      };
    },
    []
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isLoading,
      refreshUser,
      login,
      register,
      logout,
      verifyEmail,
      resendVerification,
      forgotPassword,
      resetPassword,
    }),
    [
      user,
      isLoading,
      refreshUser,
      login,
      register,
      logout,
      verifyEmail,
      resendVerification,
      forgotPassword,
      resetPassword,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}

export default AuthContext;
