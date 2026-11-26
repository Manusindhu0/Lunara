import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  AlertCircle,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Award,
  CheckCircle2,
  Compass,
  FlaskConical,
  Instagram,
  Link2Off,
  Lock,
  LogIn,
  Mail,
  RefreshCw,
  Rocket,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  UserCheck,
  UserPlus,
  Zap,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCitizen } from '../context/CitizenContext';
import { AccountMenu } from '../components/ui/AccountMenu';
import { apiClient, isApiError } from '../lib/apiClient';
import { buildAuthRedirectUrl } from '../lib/authRedirect';
import { citizenService } from '../lib/citizenService';
import { DEPARTMENTS } from '../data/departments';
import { AstronautType, Citizen, Department, DepartmentId } from '../types';

interface InstagramConnectionInfo {
  username: string;
  profilePictureUrl: string | null;
  connectedAt: string;
  tokenExpiresAt: string | null;
  isExpired: boolean;
}

interface InstagramStatusResponse {
  configured: boolean;
  connected: boolean;
  connection: InstagramConnectionInfo | null;
}

interface InstagramConnectResponse {
  configured: boolean;
  status?: 'READY' | 'UNAVAILABLE';
  authorizationUrl: string | null;
  reason?: string;
}

type EligibilityStatusCode =
  | 'NOT_STARTED'
  | 'PENDING'
  | 'VERIFIED'
  | 'FAILED'
  | 'UNAVAILABLE'
  | 'EXPIRED'
  | 'MANUAL_REVIEW';

interface EligibilityVerificationRecord {
  id?: string;
  status: EligibilityStatusCode;
  verificationMethod: string;
  reason: string;
  verifiedAt: string | null;
  expiresAt: string | null;
  provider: string;
  isMock: boolean;
}

interface VerificationStatusResponse {
  status: EligibilityStatusCode;
  verification: EligibilityVerificationRecord | null;
  mockModeEnabled: boolean;
}

interface CitizenshipStatusResponse {
  emailVerified: boolean;
  instagram: InstagramStatusResponse;
  eligibility: VerificationStatusResponse;
  citizenship: {
    hasCitizenship: boolean;
    citizen: Citizen | null;
  };
}

const SUIT_COLORS = [
  { name: 'NASA Lunar White', value: '#ffffff' },
  { name: 'Cyber Cyan', value: '#06b6d4' },
  { name: 'Solar Gold', value: '#f59e0b' },
  { name: 'Deep Cobalt', value: '#3b82f6' },
  { name: 'Regolith Graphite', value: '#475569' },
  { name: 'Hazard Amber', value: '#d97706' },
  { name: 'Bio Emerald', value: '#10b981' },
  { name: 'Expedition Crimson', value: '#ef4444' },
];

const ASTRONAUT_TYPES: { id: AstronautType; label: string; desc: string }[] = [
  { id: 'engineer', label: 'Engineer', desc: 'Heavy construction, solar maintenance & robotics' },
  { id: 'scientist', label: 'Scientist', desc: 'Regolith geology, botany & astrophysics' },
  { id: 'medic', label: 'Life Support / Medic', desc: 'Biosphere homeostasis & human health' },
  { id: 'commander', label: 'Mission Commander', desc: 'Colony logistics, EVA authority & council' },
  { id: 'technician', label: 'Technician', desc: 'Pressurized conduit & rover telemetry' },
  { id: 'civilian', label: 'Pioneer Citizen', desc: 'Arts, architecture & colony culture' },
];

const IG_ERROR_MESSAGES: Record<string, string> = {
  access_denied: 'Instagram authorization was cancelled before completion.',
  not_configured: 'Instagram OAuth is not configured on this server (Meta App credentials missing).',
  already_linked: 'This Instagram account is already linked to a different LUNAR user.',
  invalid_state: 'OAuth state validation failed. Please retry connecting Instagram.',
  state_already_used: 'That Instagram OAuth handshake was already consumed. Please try again.',
  state_expired: 'Instagram OAuth session expired. Please initiate connection again.',
  state_mismatch: 'Instagram OAuth callback did not match the active authenticated LUNAR session.',
  missing_code: 'Instagram callback did not include an authorization code.',
  token_exchange_failed: 'Failed to exchange authorization code with Instagram.',
  profile_fetch_failed: 'Connected token succeeded, but Instagram profile details could not be retrieved.',
};

export const CitizenshipPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, isAuthenticated, isLoading: isAuthLoading, refreshUser, resendVerification } = useAuth();
  const { applyForCitizenship, refreshCitizens } = useCitizen();

  // Callback query banner state
  const [igBanner, setIgBanner] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Verification / Onboarding Backend State
  const [isSyncingStatus, setIsSyncingStatus] = useState(false);
  const [instagramStatus, setInstagramStatus] = useState<InstagramStatusResponse | null>(null);
  const [connectUnavailableReason, setConnectUnavailableReason] = useState<string | null>(null);
  const [isConnectingIg, setIsConnectingIg] = useState(false);
  const [isDisconnectingIg, setIsDisconnectingIg] = useState(false);

  const [eligibilityStatus, setEligibilityStatus] = useState<EligibilityStatusCode>('NOT_STARTED');
  const [eligibilityRecord, setEligibilityRecord] = useState<EligibilityVerificationRecord | null>(null);
  const [mockModeEnabled, setMockModeEnabled] = useState(false);
  const [isCheckingEligibility, setIsCheckingEligibility] = useState(false);
  const [eligibilityError, setEligibilityError] = useState<string | null>(null);

  const [existingCitizen, setExistingCitizen] = useState<Citizen | null>(null);

  // Email resend state
  const [resendStatus, setResendStatus] = useState<string | null>(null);
  const [resendError, setResendError] = useState<string | null>(null);
  const [isResendingEmail, setIsResendingEmail] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Departments loaded from API with static fallback
  const [departments, setDepartments] = useState<Department[]>(() => Object.values(DEPARTMENTS));

  // Steps 4-8 Application Form State
  const [formSubStep, setFormSubStep] = useState<1 | 2 | 3 | 4>(1);
  const [username, setUsername] = useState('');
  const [usernameCheckState, setUsernameCheckState] = useState<'idle' | 'checking' | 'available' | 'taken' | 'invalid'>('idle');
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [department, setDepartment] = useState<DepartmentId>('ENGINEERING');
  const [profession, setProfession] = useState<string>(DEPARTMENTS.ENGINEERING.professions[0]);
  const [astronautType, setAstronautType] = useState<AstronautType>('engineer');
  const [suitColor, setSuitColor] = useState<string>('#ffffff');

  const [isSubmittingApplication, setIsSubmittingApplication] = useState(false);
  const [applicationError, setApplicationError] = useState<string | null>(null);

  // Steps 9-10 Arrival Sequence State
  const [mintedCitizen, setMintedCitizen] = useState<Citizen | null>(null);
  const [arrivalStage, setArrivalStage] = useState<'descending' | 'touchdown' | 'complete'>('descending');

  // Parse Instagram callback query params once
  useEffect(() => {
    const igConnected = searchParams.get('ig_connected');
    const igError = searchParams.get('ig_error');
    if (!igConnected && !igError) return;

    if (igConnected === '1') {
      setIgBanner({
        type: 'success',
        text: 'Instagram identity uplink established. You may now verify citizenship eligibility.',
      });
    } else if (igError) {
      setIgBanner({
        type: 'error',
        text: IG_ERROR_MESSAGES[igError] ?? `Instagram connection error: ${igError}`,
      });
    }

    const next = new URLSearchParams(searchParams);
    next.delete('ig_connected');
    next.delete('ig_error');
    setSearchParams(next, { replace: true });
  }, [searchParams, setSearchParams]);

  // Cooldown timer for resend verification
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = window.setTimeout(() => setResendCooldown((s) => Math.max(0, s - 1)), 1000);
    return () => window.clearTimeout(t);
  }, [resendCooldown]);

  // Load canonical departments
  useEffect(() => {
    void citizenService.fetchDepartments().then((list) => {
      if (list.length > 0) {
        setDepartments(list);
      }
    });
  }, []);

  // Load onboarding status from backend when authenticated
  const syncOnboardingState = useCallback(async () => {
    if (!isAuthenticated) {
      setInstagramStatus(null);
      setEligibilityStatus('NOT_STARTED');
      setEligibilityRecord(null);
      setExistingCitizen(null);
      return;
    }

    setIsSyncingStatus(true);
    try {
      const [statusRes, igRes, verifRes] = await Promise.all([
        apiClient.get<CitizenshipStatusResponse>('/api/citizenship/status').catch(() => null),
        apiClient.get<InstagramStatusResponse>('/api/instagram/status').catch(() => null),
        apiClient.get<VerificationStatusResponse>('/api/verification/status').catch(() => null),
      ]);

      const resolvedIg = igRes ?? statusRes?.instagram ?? null;
      if (resolvedIg) {
        setInstagramStatus(resolvedIg);
      }

      const resolvedVerif = verifRes ?? statusRes?.eligibility ?? null;
      if (resolvedVerif) {
        setEligibilityStatus(resolvedVerif.status);
        setEligibilityRecord(resolvedVerif.verification);
        setMockModeEnabled(Boolean(resolvedVerif.mockModeEnabled));
      }

      if (statusRes?.citizenship?.hasCitizenship && statusRes.citizenship.citizen) {
        setExistingCitizen(statusRes.citizenship.citizen);
      } else {
        setExistingCitizen(null);
      }
    } finally {
      setIsSyncingStatus(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthLoading) {
      void syncOnboardingState();
    }
  }, [isAuthLoading, syncOnboardingState]);

  // Real-time debounced username check against PostgreSQL
  const normalizedUsername = username.trim().toLowerCase();
  useEffect(() => {
    if (!normalizedUsername) {
      setUsernameCheckState('idle');
      return;
    }
    if (!/^[a-z0-9_]{3,20}$/.test(normalizedUsername)) {
      setUsernameCheckState('invalid');
      return;
    }

    let cancelled = false;
    setUsernameCheckState('checking');
    const timer = window.setTimeout(() => {
      citizenService
        .checkUsernameAvailable(normalizedUsername)
        .then((res) => {
          if (cancelled) return;
          if (!res.valid) {
            setUsernameCheckState('invalid');
          } else {
            setUsernameCheckState(res.available ? 'available' : 'taken');
          }
        })
        .catch(() => {
          if (!cancelled) {
            setUsernameCheckState('idle');
          }
        });
    }, 280);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [normalizedUsername]);

  const handleResendEmail = async () => {
    if (!user?.email) return;
    setResendError(null);
    setResendStatus(null);
    setIsResendingEmail(true);
    try {
      const res = await resendVerification(user.email);
      setResendStatus(res.message);
      setResendCooldown(60);
    } catch (err) {
      setResendError(
        isApiError(err) ? err.message : 'Unable to resend verification email right now.'
      );
    } finally {
      setIsResendingEmail(false);
    }
  };

  const handleRefreshVerification = async () => {
    await refreshUser();
    await syncOnboardingState();
  };

  const handleConnectInstagram = async () => {
    setConnectUnavailableReason(null);
    setIgBanner(null);
    setIsConnectingIg(true);
    try {
      const res = await apiClient.get<InstagramConnectResponse>('/api/instagram/connect');
      if (res.configured && res.authorizationUrl) {
        window.location.assign(res.authorizationUrl);
        return;
      }
      setConnectUnavailableReason(
        res.reason ??
          'Instagram OAuth requires Meta App credentials (INSTAGRAM_CLIENT_ID, INSTAGRAM_CLIENT_SECRET, INSTAGRAM_REDIRECT_URI).'
      );
      await syncOnboardingState();
    } catch (err) {
      setConnectUnavailableReason(
        isApiError(err) ? err.message : 'Unable to initiate Instagram connection.'
      );
    } finally {
      setIsConnectingIg(false);
    }
  };

  const handleDisconnectInstagram = async () => {
    setIsDisconnectingIg(true);
    setIgBanner(null);
    try {
      await apiClient.delete('/api/instagram/disconnect');
      await syncOnboardingState();
      await refreshUser();
    } catch (err) {
      setIgBanner({
        type: 'error',
        text: isApiError(err) ? err.message : 'Failed to disconnect Instagram account.',
      });
    } finally {
      setIsDisconnectingIg(false);
    }
  };

  const handleCheckEligibility = async () => {
    setIsCheckingEligibility(true);
    setEligibilityError(null);
    try {
      const res = await apiClient.post<
        EligibilityVerificationRecord & { mockModeEnabled?: boolean }
      >('/api/verification/check-eligibility');
      setEligibilityStatus(res.status);
      setEligibilityRecord(res);
      if (typeof res.mockModeEnabled === 'boolean') {
        setMockModeEnabled(res.mockModeEnabled);
      }
      await refreshUser();
    } catch (err) {
      setEligibilityError(
        isApiError(err) ? err.message : 'Eligibility verification check failed.'
      );
    } finally {
      setIsCheckingEligibility(false);
    }
  };

  const chosenDeptInfo = useMemo(
    () => departments.find((d) => d.id === department) ?? DEPARTMENTS[department],
    [departments, department]
  );

  const handleDeptSelect = (deptId: DepartmentId) => {
    setDepartment(deptId);
    const deptObj = departments.find((d) => d.id === deptId) ?? DEPARTMENTS[deptId];
    setProfession(deptObj.professions[0] ?? DEPARTMENTS[deptId].professions[0]);
  };

  const isCallsignValid =
    /^[a-z0-9_]{3,20}$/.test(normalizedUsername) &&
    usernameCheckState !== 'taken' &&
    usernameCheckState !== 'checking' &&
    displayName.trim().length >= 2;
  const isBioValid = bio.trim().length >= 10 && bio.trim().length <= 500;

  const handleSubmitCitizenship = async () => {
    setIsSubmittingApplication(true);
    setApplicationError(null);
    try {
      const created = await applyForCitizenship({
        username: normalizedUsername,
        displayName: displayName.trim(),
        bio: bio.trim(),
        department,
        profession,
        astronautType,
        suitColor,
      });

      setMintedCitizen(created);
      setArrivalStage('descending');

      await Promise.all([refreshUser(), refreshCitizens()]);

      window.setTimeout(() => {
        setArrivalStage('touchdown');
      }, 1700);
      window.setTimeout(() => {
        setArrivalStage('complete');
      }, 3300);
    } catch (err) {
      setApplicationError(
        isApiError(err)
          ? err.message
          : err instanceof Error
            ? err.message
            : 'Citizenship application could not be completed.'
      );
    } finally {
      setIsSubmittingApplication(false);
    }
  };

  const isAccountVerified = Boolean(isAuthenticated && user?.emailVerified);
  const isEligibilityVerified = eligibilityStatus === 'VERIFIED';
  const showMockBadge =
    mockModeEnabled ||
    Boolean(eligibilityRecord?.isMock) ||
    eligibilityRecord?.verificationMethod === 'MOCK_VERIFICATION';
  const resolvedExistingCitizenId =
    existingCitizen?.citizenId ?? user?.citizen?.citizenId ?? null;

  const loginUrl = buildAuthRedirectUrl('/login', '/citizenship');
  const registerUrl = buildAuthRedirectUrl('/register', '/citizenship');
  const verifyUrl = buildAuthRedirectUrl('/verify-email', '/citizenship');

  return (
    <div className="h-screen overflow-y-auto bg-[#05070a] text-slate-100 flex flex-col font-sans select-text relative">
      {/* Subtle orbital ambient lighting */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-44 left-1/2 -translate-x-1/2 w-[760px] h-[360px] rounded-full bg-cyan-500/[0.06] blur-3xl" />
        <div className="absolute -bottom-48 right-1/4 w-[540px] h-[320px] rounded-full bg-amber-500/[0.04] blur-3xl" />
      </div>

      {/* Top Navigation */}
      <header className="sticky top-0 z-30 bg-slate-950/85 backdrop-blur-xl border-b border-slate-800/80 px-6 py-4 flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={() => navigate('/world')}
          className="flex items-center gap-3 group focus:outline-none"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/80 flex items-center justify-center relative overflow-hidden shadow-inner group-hover:border-cyan-500/60 transition-colors">
            <div className="w-5 h-5 rounded-full border-2 border-slate-300 relative">
              <div className="absolute top-0.5 right-0.5 w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            </div>
          </div>
          <div className="text-left">
            <div className="flex items-center gap-2">
              <span className="font-chakra tracking-[0.25em] text-lg font-bold text-white group-hover:text-cyan-400 transition-colors">
                LUNAR
              </span>
              <span className="text-[10px] font-mono tracking-wider px-1.5 py-0.5 rounded bg-cyan-950/80 text-cyan-400 border border-cyan-800/60 font-semibold">
                CITIZENSHIP TERMINAL
              </span>
            </div>
            <div className="text-[11px] font-mono text-slate-400 hidden sm:block">
              Selenia Prime Orbital Immigration & Clearance Protocol
            </div>
          </div>
        </button>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => navigate('/world')}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-xs font-mono text-slate-200 hover:text-cyan-300 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-cyan-400" />
            <Compass className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
            <span>Return to Moon</span>
          </button>

          <AccountMenu citizenshipPath="/citizenship" />
        </div>
      </header>

      <main className="relative z-10 flex-1 max-w-5xl mx-auto w-full px-6 py-8 pb-16 space-y-6">
        {/* Terminal Hero Banner */}
        <section className="bg-slate-950/90 border border-slate-800/90 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-cyan-500/60 to-transparent" />
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-cyan-950/60 border border-cyan-800/50 text-cyan-400 font-mono text-[11px] font-semibold mb-2">
                <Sparkles className="w-3.5 h-3.5" />
                SELENIA PRIME CLEARANCE GATEWAY
              </div>
              <h1 className="font-chakra text-2xl md:text-4xl font-extrabold text-white tracking-wide">
                Lunar Citizenship Terminal
              </h1>
              <p className="text-xs md:text-sm font-mono text-slate-400 mt-1.5 max-w-2xl">
                Complete Earth identity verification, social uplink, and eligibility clearance to claim an immutable <code className="text-cyan-300">LUN-XXXXX</code> Citizen ID in PostgreSQL and deploy your astronaut to the 3D surface.
              </p>
            </div>

            <div className="shrink-0 flex flex-col items-start md:items-end gap-2 font-mono text-xs">
              <div className="text-[10px] uppercase tracking-wider text-slate-500">
                APPLICATION STATUS
              </div>
              {mintedCitizen || resolvedExistingCitizenId ? (
                <span className="px-3 py-1 rounded-lg bg-emerald-950/80 border border-emerald-700/70 text-emerald-300 font-bold flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  CITIZENSHIP ACTIVE
                </span>
              ) : isEligibilityVerified ? (
                <span className="px-3 py-1 rounded-lg bg-emerald-950/80 border border-emerald-700/70 text-emerald-300 font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  ELIGIBILITY CONFIRMED
                </span>
              ) : (
                <span className="px-3 py-1 rounded-lg bg-amber-950/80 border border-amber-700/70 text-amber-300 font-bold flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  AWAITING CLEARANCE
                </span>
              )}

              {showMockBadge && (
                <span className="px-2.5 py-0.5 rounded-md bg-amber-950/90 border border-amber-600/80 text-amber-300 text-[10px] font-bold flex items-center gap-1">
                  <FlaskConical className="w-3 h-3 text-amber-400" />
                  MOCK VERIFICATION (DEV MODE)
                </span>
              )}
            </div>
          </div>
        </section>

        {/* Instagram OAuth Callback Alert */}
        {igBanner && (
          <div
            className={`p-4 rounded-2xl border text-xs font-mono flex items-start justify-between gap-3 ${
              igBanner.type === 'success'
                ? 'bg-emerald-950/40 border-emerald-800/70 text-emerald-200'
                : 'bg-rose-950/40 border-rose-800/70 text-rose-200'
            }`}
          >
            <div className="flex items-start gap-2.5">
              {igBanner.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              )}
              <span>{igBanner.text}</span>
            </div>
            <button
              type="button"
              onClick={() => setIgBanner(null)}
              className="text-slate-400 hover:text-white shrink-0"
            >
              DISMISS
            </button>
          </div>
        )}

        {/* STEPS 9-10: Arrival Sequence & Completed Integration */}
        {mintedCitizen && (
          <section className="bg-slate-950/95 border border-cyan-500/60 rounded-3xl p-8 md:p-12 shadow-2xl text-center relative overflow-hidden">
            {arrivalStage === 'descending' && (
              <div className="py-10">
                <Rocket className="w-16 h-16 text-cyan-400 mx-auto mb-4 animate-bounce" />
                <h2 className="font-chakra text-2xl md:text-3xl font-extrabold text-white">
                  TRANSMITTING ORBITAL DESCENT VECTORS...
                </h2>
                <p className="text-xs font-mono text-slate-400 mt-2">
                  Selenia Prime Gateway has cleared shuttle approach to {mintedCitizen.districtId} District.
                </p>
              </div>
            )}

            {arrivalStage === 'touchdown' && (
              <div className="py-10">
                <Zap className="w-16 h-16 text-amber-400 mx-auto mb-4 animate-pulse" />
                <h2 className="font-chakra text-2xl md:text-3xl font-extrabold text-white">
                  TOUCHDOWN CONFIRMED — PRESSURIZING AIRLOCK
                </h2>
                <p className="text-xs font-mono text-slate-400 mt-2">
                  Surface coordinates locked at X:{Math.round(mintedCitizen.location.x)} Z:{Math.round(mintedCitizen.location.z)}.
                </p>
              </div>
            )}

            {arrivalStage === 'complete' && (
              <div>
                <div className="w-16 h-16 rounded-2xl bg-emerald-950/80 border border-emerald-800/80 flex items-center justify-center mx-auto mb-4 text-emerald-400">
                  <CheckCircle2 className="w-10 h-10" />
                </div>

                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800 text-xs font-mono font-bold mb-3">
                  CITIZENSHIP GRANTED — POSTGRESQL REGISTRY
                </div>

                <h2 className="font-chakra text-3xl md:text-4xl font-extrabold text-white">
                  Welcome to Selenia Prime, {mintedCitizen.displayName}
                </h2>

                <div className="mt-5 p-5 rounded-2xl bg-slate-900/80 border border-slate-800 max-w-md mx-auto font-mono text-xs text-left space-y-2.5">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Permanent Citizen ID:</span>
                    <span className="text-cyan-400 font-bold text-sm">{mintedCitizen.citizenId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Callsign:</span>
                    <span className="text-white">@{mintedCitizen.username}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Assigned District:</span>
                    <span className="text-white font-bold">{mintedCitizen.districtId} DISTRICT</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Assigned Facility:</span>
                    <span className="text-slate-200">{mintedCitizen.buildingId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Colony Credits:</span>
                    <span className="text-amber-300 font-bold">{mintedCitizen.colonyCredits} CC</span>
                  </div>
                  {mintedCitizen.isFoundingCitizen && (
                    <div className="flex justify-between">
                      <span className="text-slate-400">Cohort Status:</span>
                      <span className="text-amber-300 font-bold">FOUNDING CITIZEN</span>
                    </div>
                  )}
                </div>

                <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
                  <button
                    type="button"
                    onClick={() => navigate(`/citizen/${mintedCitizen.citizenId}`)}
                    className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-mono text-slate-300 hover:text-white transition-colors"
                  >
                    VIEW CITIZEN DOSSIER
                  </button>

                  <button
                    type="button"
                    onClick={() => navigate(`/world?focus=${mintedCitizen.citizenId}`)}
                    className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-chakra text-sm font-bold flex items-center justify-center gap-2 shadow-xl shadow-cyan-950/60"
                  >
                    <Compass className="w-5 h-5" />
                    <span>ENTER 3D COLONY WORLD</span>
                  </button>
                </div>
              </div>
            )}
          </section>
        )}

        {/* EXISTING CITIZENSHIP VIEW (prevents duplicate applications) */}
        {!mintedCitizen && resolvedExistingCitizenId && (
          <section className="bg-slate-950/90 border border-emerald-700/60 rounded-3xl p-6 md:p-8 shadow-2xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-800/80 text-emerald-300 text-xs font-mono font-bold mb-3">
                  <UserCheck className="w-3.5 h-3.5" />
                  EXISTING CITIZENSHIP RECORD DETECTED
                </div>
                <h2 className="font-chakra text-2xl md:text-3xl font-bold text-white">
                  {existingCitizen?.displayName ?? user?.citizen?.displayName}
                </h2>
                <div className="mt-2 flex flex-wrap items-center gap-2 font-mono text-xs">
                  <span className="px-2.5 py-1 rounded-lg bg-cyan-950 text-cyan-300 border border-cyan-800/80 font-bold">
                    {resolvedExistingCitizenId}
                  </span>
                  <span className="text-slate-400">
                    @{existingCitizen?.username ?? user?.citizen?.username}
                  </span>
                  {(existingCitizen?.districtId ?? user?.citizen?.districtId) && (
                    <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300">
                      {existingCitizen?.districtId ?? user?.citizen?.districtId} DISTRICT
                    </span>
                  )}
                </div>
                <p className="text-xs font-mono text-slate-400 mt-3 max-w-xl">
                  Your account already holds an immutable LUNAR Citizen ID. Duplicate citizenship issuance is disabled to preserve colony registry integrity.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => navigate(`/citizen/${resolvedExistingCitizenId}`)}
                  className="px-5 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-mono font-semibold text-white transition-colors"
                >
                  View Dossier
                </button>
                <button
                  type="button"
                  onClick={() => navigate(`/world?focus=${resolvedExistingCitizenId}`)}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-chakra text-sm font-bold flex items-center justify-center gap-2"
                >
                  <Compass className="w-4 h-4" />
                  <span>Enter Colony</span>
                </button>
              </div>
            </div>
          </section>
        )}

        {/* STEPS 1-3 GATEWAY CHECKLIST */}
        {!mintedCitizen && !resolvedExistingCitizenId && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* STEP 1: YOUR EARTH IDENTITY */}
            <section className="bg-slate-950/90 border border-slate-800/90 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 font-bold">
                    STEP 01 • YOUR EARTH IDENTITY
                  </span>
                  {isAccountVerified ? (
                    <span className="px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-800/70 text-[10px] font-mono text-emerald-300 font-bold">
                      VERIFIED
                    </span>
                  ) : isAuthenticated ? (
                    <span className="px-2 py-0.5 rounded bg-amber-950/80 border border-amber-800/70 text-[10px] font-mono text-amber-300 font-bold">
                      UNVERIFIED
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[10px] font-mono text-slate-400">
                      REQUIRED
                    </span>
                  )}
                </div>

                <h2 className="font-chakra text-lg font-bold text-white mb-2">
                  Account & Email Clearance
                </h2>

                {isAuthLoading ? (
                  <div className="py-6 text-xs font-mono text-slate-400 flex items-center gap-2">
                    <RefreshCw className="w-4 h-4 text-cyan-400 animate-spin" />
                    <span>Checking session telemetry...</span>
                  </div>
                ) : !isAuthenticated || !user ? (
                  <div className="space-y-4">
                    <p className="text-xs font-mono text-slate-400 leading-relaxed">
                      Sign in or create a LUNAR account with a verified email address to begin your citizenship clearance.
                    </p>
                    <div className="flex flex-col gap-2">
                      <Link
                        to={loginUrl}
                        className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-chakra text-xs font-bold tracking-wider uppercase flex items-center justify-center gap-2"
                      >
                        <LogIn className="w-4 h-4" />
                        <span>Sign In to Begin</span>
                      </Link>
                      <Link
                        to={registerUrl}
                        className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-mono text-slate-200 flex items-center justify-center gap-2"
                      >
                        <UserPlus className="w-4 h-4 text-cyan-400" />
                        <span>Register New Account</span>
                      </Link>
                    </div>
                  </div>
                ) : !user.emailVerified ? (
                  <div className="space-y-3">
                    <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-800/60 text-xs font-mono text-amber-200">
                      <div className="font-bold text-amber-300 mb-1">Email Verification Required</div>
                      <div className="break-all text-slate-300">{user.email}</div>
                    </div>

                    {resendStatus && (
                      <div className="p-2.5 rounded-xl bg-cyan-950/40 border border-cyan-800/60 text-[11px] font-mono text-cyan-200">
                        {resendStatus}
                      </div>
                    )}
                    {resendError && (
                      <div className="p-2.5 rounded-xl bg-rose-950/40 border border-rose-800/60 text-[11px] font-mono text-rose-200">
                        {resendError}
                      </div>
                    )}

                    <button
                      type="button"
                      disabled={isResendingEmail || resendCooldown > 0}
                      onClick={handleResendEmail}
                      className="w-full py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:bg-slate-800 disabled:text-slate-500 text-slate-950 font-chakra text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors"
                    >
                      <Mail className="w-4 h-4" />
                      <span>
                        {isResendingEmail
                          ? 'Transmitting...'
                          : resendCooldown > 0
                            ? `Resend in ${resendCooldown}s`
                            : 'Resend Verification Email'}
                      </span>
                    </button>

                    <div className="flex items-center gap-2">
                      <Link
                        to={verifyUrl}
                        className="flex-1 py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-[11px] font-mono text-center text-cyan-300"
                      >
                        Open Verify Page
                      </Link>
                      <button
                        type="button"
                        onClick={handleRefreshVerification}
                        className="py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-[11px] font-mono text-slate-300 flex items-center gap-1"
                        title="Refresh verification status"
                      >
                        <RefreshCw className="w-3 h-3" />
                        <span>Refresh</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-800/60 text-xs font-mono">
                      <div className="text-[10px] uppercase text-emerald-400 font-bold mb-1">
                        Cleared Identity
                      </div>
                      <div className="text-white break-all">{user.email}</div>
                    </div>
                    <p className="text-[11px] font-mono text-slate-400">
                      Email uplink confirmed. Proceed to establish your social connection.
                    </p>
                  </div>
                )}
              </div>
            </section>

            {/* STEP 2: ESTABLISH CONNECTION (INSTAGRAM) */}
            <section
              className={`bg-slate-950/90 border rounded-2xl p-6 shadow-xl flex flex-col justify-between ${
                isAccountVerified ? 'border-slate-800/90' : 'border-slate-900 opacity-75'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 font-bold">
                    STEP 02 • ESTABLISH CONNECTION
                  </span>
                  {instagramStatus?.connected ? (
                    <span className="px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-800/70 text-[10px] font-mono text-emerald-300 font-bold">
                      LINKED
                    </span>
                  ) : instagramStatus && !instagramStatus.configured ? (
                    <span className="px-2 py-0.5 rounded bg-amber-950/80 border border-amber-800/70 text-[10px] font-mono text-amber-300 font-bold">
                      CONFIG REQUIRED
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[10px] font-mono text-slate-400">
                      INSTAGRAM
                    </span>
                  )}
                </div>

                <h2 className="font-chakra text-lg font-bold text-white mb-2">
                  Instagram Uplink
                </h2>

                {!isAccountVerified ? (
                  <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs font-mono text-slate-500 flex items-center gap-2">
                    <Lock className="w-4 h-4 shrink-0" />
                    <span>Complete Step 01 (Verified Email) to link Instagram.</span>
                  </div>
                ) : isSyncingStatus && !instagramStatus ? (
                  <div className="py-6 text-xs font-mono text-slate-400 flex items-center gap-2">
                    <RefreshCw className="w-4 h-4 text-cyan-400 animate-spin" />
                    <span>Reading Instagram uplink status...</span>
                  </div>
                ) : instagramStatus?.connected && instagramStatus.connection ? (
                  <div className="space-y-3">
                    <div className="p-3.5 rounded-xl bg-slate-900/80 border border-emerald-800/60 flex items-center gap-3">
                      {instagramStatus.connection.profilePictureUrl ? (
                        <img
                          src={instagramStatus.connection.profilePictureUrl}
                          alt={`@${instagramStatus.connection.username}`}
                          className="w-10 h-10 rounded-full object-cover border border-slate-700"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 flex items-center justify-center shrink-0">
                          <Instagram className="w-5 h-5 text-white" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <div className="text-xs font-mono font-bold text-white truncate">
                          @{instagramStatus.connection.username}
                        </div>
                        <div className="text-[10px] font-mono text-slate-400">
                          Connected {instagramStatus.connection.connectedAt.split('T')[0]}
                        </div>
                        {instagramStatus.connection.isExpired && (
                          <div className="text-[10px] font-mono text-amber-300 mt-0.5">
                            OAuth token expired — reconnect if needed
                          </div>
                        )}
                      </div>
                    </div>

                    <button
                      type="button"
                      disabled={isDisconnectingIg}
                      onClick={handleDisconnectInstagram}
                      className="w-full py-2 px-3 rounded-xl bg-slate-900 hover:bg-rose-950/60 border border-slate-700 hover:border-rose-800/70 text-xs font-mono text-slate-300 hover:text-rose-200 flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                    >
                      <Link2Off className="w-3.5 h-3.5" />
                      <span>{isDisconnectingIg ? 'Disconnecting...' : 'Disconnect Instagram'}</span>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="text-xs font-mono text-slate-400 leading-relaxed">
                      Link your Instagram account via official Meta OAuth so Selenia Prime can evaluate citizenship eligibility.
                    </p>

                    {(connectUnavailableReason || (instagramStatus && !instagramStatus.configured)) && (
                      <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-800/60 text-[11px] font-mono text-amber-200 leading-relaxed">
                        <div className="font-bold text-amber-300 mb-1">
                          Configuration Required / Unavailable
                        </div>
                        <div>
                          {connectUnavailableReason ??
                            'Instagram OAuth requires Meta App credentials (INSTAGRAM_CLIENT_ID, INSTAGRAM_CLIENT_SECRET, INSTAGRAM_REDIRECT_URI) on the server.'}
                        </div>
                      </div>
                    )}

                    <button
                      type="button"
                      disabled={isConnectingIg}
                      onClick={handleConnectInstagram}
                      className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 border border-cyan-700/60 hover:border-cyan-500 text-xs font-mono font-bold text-cyan-300 hover:text-white flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                    >
                      <Instagram className="w-4 h-4 text-cyan-400" />
                      <span>{isConnectingIg ? 'Requesting OAuth...' : 'Connect Instagram'}</span>
                    </button>
                  </div>
                )}
              </div>
            </section>

            {/* STEP 3: VERIFY CITIZENSHIP ELIGIBILITY */}
            <section
              className={`bg-slate-950/90 border rounded-2xl p-6 shadow-xl flex flex-col justify-between ${
                isAccountVerified ? 'border-slate-800/90' : 'border-slate-900 opacity-75'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 font-bold">
                    STEP 03 • VERIFY CITIZENSHIP ELIGIBILITY
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${
                      eligibilityStatus === 'VERIFIED'
                        ? 'bg-emerald-950/80 border-emerald-800/70 text-emerald-300'
                        : eligibilityStatus === 'UNAVAILABLE' || eligibilityStatus === 'MANUAL_REVIEW' || eligibilityStatus === 'PENDING'
                          ? 'bg-amber-950/80 border-amber-800/70 text-amber-300'
                          : eligibilityStatus === 'FAILED' || eligibilityStatus === 'EXPIRED'
                            ? 'bg-rose-950/80 border-rose-800/70 text-rose-300'
                            : 'bg-slate-900 border-slate-800 text-slate-400'
                    }`}
                  >
                    {eligibilityStatus}
                  </span>
                </div>

                <h2 className="font-chakra text-lg font-bold text-white mb-2">
                  Eligibility Clearance
                </h2>

                {!isAccountVerified ? (
                  <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs font-mono text-slate-500 flex items-center gap-2">
                    <Lock className="w-4 h-4 shrink-0" />
                    <span>Complete Step 01 (Verified Email) to run eligibility check.</span>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {showMockBadge && (
                      <div className="p-2.5 rounded-xl bg-amber-950/50 border border-amber-600/80 text-[11px] font-mono text-amber-200 flex items-center gap-2">
                        <FlaskConical className="w-4 h-4 text-amber-400 shrink-0" />
                        <span className="font-bold text-amber-300">MOCK VERIFICATION (DEV MODE)</span>
                      </div>
                    )}

                    {eligibilityError && (
                      <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800/60 text-xs font-mono text-rose-200">
                        {eligibilityError}
                      </div>
                    )}

                    {eligibilityRecord ? (
                      <div
                        className={`p-3 rounded-xl border text-xs font-mono space-y-1.5 ${
                          eligibilityStatus === 'VERIFIED'
                            ? 'bg-emerald-950/30 border-emerald-800/60 text-emerald-200'
                            : eligibilityStatus === 'FAILED' || eligibilityStatus === 'EXPIRED'
                              ? 'bg-rose-950/30 border-rose-800/60 text-rose-200'
                              : 'bg-amber-950/30 border-amber-800/60 text-amber-200'
                        }`}
                      >
                        <div className="font-bold flex items-center justify-between">
                          <span>
                            {eligibilityStatus === 'VERIFIED'
                              ? 'ELIGIBILITY CONFIRMED'
                              : 'AWAITING CLEARANCE'}
                          </span>
                          <span className="text-[10px] opacity-80">
                            {eligibilityRecord.verificationMethod}
                          </span>
                        </div>
                        {eligibilityRecord.reason && (
                          <p className="text-[11px] leading-relaxed opacity-90">
                            {eligibilityRecord.reason}
                          </p>
                        )}
                      </div>
                    ) : (
                      <p className="text-xs font-mono text-slate-400 leading-relaxed">
                        Run the server eligibility check to validate your connected credentials before generating your Citizen ID.
                      </p>
                    )}

                    <button
                      type="button"
                      disabled={isCheckingEligibility}
                      onClick={handleCheckEligibility}
                      className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:from-slate-800 disabled:to-slate-800 disabled:text-slate-500 text-white font-chakra text-xs font-bold tracking-wider uppercase flex items-center justify-center gap-2 transition-all"
                    >
                      <ShieldCheck className="w-4 h-4" />
                      <span>
                        {isCheckingEligibility
                          ? 'CHECKING ELIGIBILITY...'
                          : 'CHECK CITIZENSHIP ELIGIBILITY'}
                      </span>
                    </button>
                  </div>
                )}
              </div>
            </section>
          </div>
        )}

        {/* STEPS 4-8: CITIZENSHIP APPLICATION TERMINAL */}
        {!mintedCitizen && !resolvedExistingCitizenId && (
          <section className="bg-slate-950/90 border border-slate-800/90 rounded-3xl p-6 md:p-8 shadow-2xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 mb-6 border-b border-slate-800/80">
              <div>
                <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-cyan-400 font-bold mb-1">
                  STEPS 04–08 • BEGIN YOUR ARRIVAL
                </div>
                <h2 className="font-chakra text-2xl font-bold text-white">
                  Citizen Identity & Colony Assignment
                </h2>
              </div>

              {isAccountVerified && isEligibilityVerified ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-700/70 text-emerald-300 text-xs font-mono font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  ELIGIBILITY CONFIRMED — TERMINAL UNLOCKED
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-950/70 border border-amber-800/70 text-amber-300 text-xs font-mono font-bold">
                  <Lock className="w-3.5 h-3.5" />
                  AWAITING CLEARANCE (VERIFIED ELIGIBILITY REQUIRED)
                </span>
              )}
            </div>

            {!isAccountVerified || !isEligibilityVerified ? (
              <div className="py-10 px-6 rounded-2xl bg-slate-900/50 border border-slate-800 text-center max-w-xl mx-auto">
                <ShieldAlert className="w-10 h-10 text-amber-400 mx-auto mb-3" />
                <h3 className="font-chakra text-lg font-bold text-white">
                  Application Locked — Awaiting Clearance
                </h3>
                <p className="text-xs font-mono text-slate-400 mt-2 leading-relaxed">
                  Citizenship issuance requires both a verified LUNAR email account and an approved eligibility status (<code className="text-emerald-300">VERIFIED</code>) from the backend verification service.
                </p>
              </div>
            ) : (
              <div>
                {/* Sub-step progress bar */}
                <div className="mb-6">
                  <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-2">
                    <span>APPLICATION STAGE {formSubStep} OF 4</span>
                    <span className="text-cyan-400 font-semibold">
                      {
                        [
                          'Callsign & Biography',
                          'Department & Specialization',
                          'EVA Suit Configuration',
                          'Review & Transmit',
                        ][formSubStep - 1]
                      }
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                    <div
                      className="h-full bg-gradient-to-r from-cyan-500 to-indigo-500 transition-all duration-300"
                      style={{ width: `${(formSubStep / 4) * 100}%` }}
                    />
                  </div>
                </div>

                {applicationError && (
                  <div className="mb-5 p-3.5 rounded-xl bg-rose-950/50 border border-rose-800/70 text-xs font-mono text-rose-200 flex items-start gap-2.5">
                    <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                    <span>{applicationError}</span>
                  </div>
                )}

                {/* Stage 1: Callsign, Display Name & Bio */}
                {formSubStep === 1 && (
                  <div className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-mono text-slate-300 mb-1.5 uppercase font-semibold">
                          Unique Callsign / Username
                        </label>
                        <div className="relative">
                          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-mono text-slate-500 text-sm">
                            @
                          </span>
                          <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="e.g. neil_armstrong"
                            className="w-full pl-8 pr-10 py-3 bg-slate-900 border border-slate-700 rounded-xl text-sm font-mono text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500"
                          />
                          <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
                            {usernameCheckState === 'checking' && (
                              <RefreshCw className="w-4 h-4 text-cyan-400 animate-spin" />
                            )}
                            {usernameCheckState === 'available' && (
                              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                            )}
                            {(usernameCheckState === 'taken' || usernameCheckState === 'invalid') && (
                              <AlertCircle className="w-4 h-4 text-rose-400" />
                            )}
                          </div>
                        </div>
                        {usernameCheckState === 'invalid' && (
                          <div className="text-[11px] font-mono text-rose-400 mt-1">
                            Must be 3–20 characters: lowercase letters, numbers, underscores.
                          </div>
                        )}
                        {usernameCheckState === 'taken' && (
                          <div className="text-[11px] font-mono text-rose-400 mt-1">
                            This callsign is already registered in Selenia Prime.
                          </div>
                        )}
                        {usernameCheckState === 'available' && (
                          <div className="text-[11px] font-mono text-emerald-400 mt-1">
                            Callsign @{normalizedUsername} is available.
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="block text-xs font-mono text-slate-300 mb-1.5 uppercase font-semibold">
                          Full Display Name
                        </label>
                        <input
                          type="text"
                          value={displayName}
                          onChange={(e) => setDisplayName(e.target.value)}
                          placeholder="e.g. Commander Neil Armstrong"
                          className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-sm font-mono text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-mono text-slate-300 mb-1.5 uppercase font-semibold">
                        Civic Record & Mission Statement (min 10 chars)
                      </label>
                      <textarea
                        rows={4}
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        placeholder="Describe your background, specialty, and purpose on Selenia Prime..."
                        className="w-full p-4 bg-slate-900 border border-slate-700 rounded-xl text-sm font-sans text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500 leading-relaxed"
                      />
                      <div className="flex justify-between text-[11px] font-mono text-slate-500 mt-1">
                        <span>Minimum 10 characters</span>
                        <span className={isBioValid ? 'text-emerald-400' : 'text-slate-500'}>
                          {bio.trim().length} / 500 chars
                        </span>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <button
                        type="button"
                        disabled={!isCallsignValid || !isBioValid}
                        onClick={() => setFormSubStep(2)}
                        className="px-6 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-800 disabled:text-slate-500 text-white font-mono text-xs font-bold flex items-center gap-2 transition-colors"
                      >
                        <span>CONTINUE TO DEPARTMENT</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}

                {/* Stage 2: Department & Specialization */}
                {formSubStep === 2 && (
                  <div className="space-y-6">
                    <div>
                      <label className="block text-xs font-mono text-slate-300 mb-2.5 uppercase font-semibold">
                        Select Colony Department
                      </label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {departments.map((dept) => {
                          const isSelected = department === dept.id;
                          return (
                            <button
                              type="button"
                              key={dept.id}
                              onClick={() => handleDeptSelect(dept.id)}
                              className={`p-4 rounded-2xl border text-left transition-all ${
                                isSelected
                                  ? 'bg-slate-900 border-cyan-500 shadow-lg shadow-cyan-950/40'
                                  : 'bg-slate-900/40 border-slate-800 hover:border-slate-700'
                              }`}
                            >
                              <div className="flex items-center justify-between mb-1">
                                <span
                                  className="font-chakra text-base font-bold"
                                  style={{ color: dept.accentColor }}
                                >
                                  {dept.name}
                                </span>
                                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                                  {dept.primaryDistrictId}
                                </span>
                              </div>
                              <p className="text-xs text-slate-400 leading-relaxed">
                                {dept.description}
                              </p>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-mono text-slate-300 mb-2 uppercase font-semibold">
                        Select Specialization ({chosenDeptInfo.name})
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {chosenDeptInfo.professions.map((prof) => {
                          const isSelected = profession === prof;
                          return (
                            <button
                              type="button"
                              key={prof}
                              onClick={() => setProfession(prof)}
                              className={`p-3 rounded-xl border flex items-center justify-between text-left transition-all ${
                                isSelected
                                  ? 'bg-slate-900 border-cyan-500 text-white'
                                  : 'bg-slate-900/40 border-slate-800 text-slate-300 hover:border-slate-700'
                              }`}
                            >
                              <span className="font-mono text-xs font-semibold">{prof}</span>
                              {isSelected && <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="flex justify-between">
                      <button
                        type="button"
                        onClick={() => setFormSubStep(1)}
                        className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-mono text-slate-300"
                      >
                        BACK
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormSubStep(3)}
                        className="px-6 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-mono text-xs font-bold flex items-center gap-2"
                      >
                        <span>CONTINUE TO EVA SUIT</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}

                {/* Stage 3: EVA Suit Customization */}
                {formSubStep === 3 && (
                  <div className="space-y-6">
                    <div>
                      <label className="block text-xs font-mono text-slate-300 mb-2 uppercase font-semibold">
                        Astronaut Class
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                        {ASTRONAUT_TYPES.map((type) => {
                          const isSelected = astronautType === type.id;
                          return (
                            <button
                              type="button"
                              key={type.id}
                              onClick={() => setAstronautType(type.id)}
                              className={`p-3 rounded-xl border text-left transition-all ${
                                isSelected
                                  ? 'bg-slate-900 border-cyan-500 shadow-md'
                                  : 'bg-slate-900/40 border-slate-800 hover:border-slate-700'
                              }`}
                            >
                              <div className="font-chakra text-sm font-bold text-white mb-0.5">
                                {type.label}
                              </div>
                              <div className="text-[10px] text-slate-400 line-clamp-2">
                                {type.desc}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-mono text-slate-300 mb-2 uppercase font-semibold">
                        Suit Color Palette
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {SUIT_COLORS.map((c) => {
                          const isSelected = suitColor === c.value;
                          return (
                            <button
                              type="button"
                              key={c.value}
                              onClick={() => setSuitColor(c.value)}
                              className={`p-2.5 rounded-xl border flex items-center gap-3 text-left transition-all ${
                                isSelected
                                  ? 'bg-slate-900 border-cyan-500 shadow-md'
                                  : 'bg-slate-900/40 border-slate-800 hover:border-slate-700'
                              }`}
                            >
                              <div
                                className="w-6 h-6 rounded-lg border border-slate-600 shrink-0"
                                style={{ backgroundColor: c.value }}
                              />
                              <span className="text-xs font-mono text-slate-200 truncate">
                                {c.name}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="flex justify-between">
                      <button
                        type="button"
                        onClick={() => setFormSubStep(2)}
                        className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-mono text-slate-300"
                      >
                        BACK
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormSubStep(4)}
                        className="px-6 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-mono text-xs font-bold flex items-center gap-2"
                      >
                        <span>REVIEW CREDENTIALS</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}

                {/* Stage 4: Final Review & Submit */}
                {formSubStep === 4 && (
                  <div className="space-y-6">
                    <div className="bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 border-2 border-cyan-500/50 rounded-2xl p-6 shadow-2xl max-w-lg mx-auto relative overflow-hidden">
                      <div className="flex items-start justify-between border-b border-slate-800 pb-4 mb-4">
                        <div>
                          <div className="text-[10px] font-mono tracking-widest text-cyan-400 uppercase font-bold">
                            SELENIA PRIME CITIZEN DOSSIER PREVIEW
                          </div>
                          <div className="font-chakra text-xl font-bold text-white mt-0.5">
                            {displayName}
                          </div>
                          <div className="text-xs font-mono text-slate-400">
                            @{normalizedUsername}
                          </div>
                        </div>

                        <div className="w-14 h-14 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center shrink-0">
                          <div
                            className="w-9 h-9 rounded-full border-2 border-slate-400 flex items-center justify-center"
                            style={{ backgroundColor: suitColor }}
                          >
                            <div className="w-4 h-4 rounded-full bg-amber-400" />
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-xs font-mono mb-4">
                        <div>
                          <div className="text-[10px] text-slate-500 uppercase">Department</div>
                          <div className="font-bold" style={{ color: chosenDeptInfo.accentColor }}>
                            {chosenDeptInfo.name}
                          </div>
                        </div>
                        <div>
                          <div className="text-[10px] text-slate-500 uppercase">Assigned District</div>
                          <div className="text-white font-bold">
                            {chosenDeptInfo.primaryDistrictId}
                          </div>
                        </div>
                        <div>
                          <div className="text-[10px] text-slate-500 uppercase">Specialization</div>
                          <div className="text-slate-200">{profession}</div>
                        </div>
                        <div>
                          <div className="text-[10px] text-slate-500 uppercase">Starting Balance</div>
                          <div className="text-amber-300 font-bold">100 CC</div>
                        </div>
                      </div>

                      <div className="text-xs text-slate-300 font-sans border-t border-slate-800/80 pt-3 italic">
                        "{bio}"
                      </div>
                    </div>

                    <div className="flex justify-between">
                      <button
                        type="button"
                        disabled={isSubmittingApplication}
                        onClick={() => setFormSubStep(3)}
                        className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-mono text-slate-300"
                      >
                        BACK
                      </button>
                      <button
                        type="button"
                        disabled={isSubmittingApplication}
                        onClick={handleSubmitCitizenship}
                        className="px-8 py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:from-slate-800 disabled:to-slate-800 disabled:text-slate-500 text-white font-chakra text-sm font-bold flex items-center gap-2 shadow-lg shadow-cyan-950/50"
                      >
                        <Rocket className="w-4 h-4" />
                        <span>
                          {isSubmittingApplication
                            ? 'MINTING CITIZEN ID...'
                            : 'BEGIN YOUR ARRIVAL'}
                        </span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  );
};

export default CitizenshipPage;
