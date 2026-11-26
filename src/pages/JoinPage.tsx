import React, { useState, useMemo } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  FlaskConical,
  Shield,
  Compass,
  Rocket,
  Award,
  Zap,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCitizen } from '../context/CitizenContext';
import { AccountMenu } from '../components/ui/AccountMenu';
import { DEPARTMENTS } from '../data/departments';
import { DepartmentId, AstronautType, Citizen } from '../types';

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

export const JoinPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const { registerDemoPreview, isUsernameTaken, citizens } = useCitizen();

  const [step, setStep] = useState<number>(1);

  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [department, setDepartment] = useState<DepartmentId>('ENGINEERING');
  const [profession, setProfession] = useState<string>(DEPARTMENTS.ENGINEERING.professions[0]);
  const [astronautType, setAstronautType] = useState<AstronautType>('engineer');
  const [suitColor, setSuitColor] = useState<string>('#ffffff');

  const [registeredCitizen, setRegisteredCitizen] = useState<Citizen | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [arrivalStage, setArrivalStage] = useState<'descending' | 'touchdown' | 'complete'>('descending');

  const usernameClean = username.trim().toLowerCase().replace(/\s+/g, '_');
  const isUsernameValid = /^[a-z0-9_]{3,20}$/.test(usernameClean);
  const usernameTaken = useMemo(() => {
    if (!usernameClean || !isUsernameValid) return false;
    return (
      isUsernameTaken(usernameClean) ||
      citizens.some((c) => c.username.toLowerCase() === usernameClean)
    );
  }, [usernameClean, isUsernameValid, isUsernameTaken, citizens]);

  const isStep2Valid = isUsernameValid && !usernameTaken && displayName.trim().length >= 2;
  const isStep3Valid = bio.trim().length >= 10;

  // Authenticated accounts route directly into the official Phase 3 Citizenship Terminal
  if (!isAuthLoading && isAuthenticated) {
    return <Navigate to="/citizenship" replace />;
  }

  const handleDeptSelect = (deptId: DepartmentId) => {
    setDepartment(deptId);
    setProfession(DEPARTMENTS[deptId].professions[0]);
  };

  const handleDemoPreviewRegister = () => {
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const citizen = registerDemoPreview({
        username: usernameClean,
        displayName: displayName.trim(),
        bio: bio.trim(),
        department,
        profession,
        astronautType,
        suitColor,
      });
      setRegisteredCitizen(citizen);
      setStep(8);

      window.setTimeout(() => {
        setArrivalStage('touchdown');
      }, 1500);
      window.setTimeout(() => {
        setArrivalStage('complete');
      }, 3000);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Demo preview failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const chosenDeptInfo = DEPARTMENTS[department];

  return (
    <div className="h-screen overflow-y-auto bg-[#05070a] text-slate-100 flex flex-col font-sans select-text">
      {/* Top Bar */}
      <header className="sticky top-0 z-30 bg-slate-950/85 backdrop-blur-xl border-b border-slate-800/80 px-6 py-4 flex items-center justify-between gap-4">
        <button
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
              <span className="text-[10px] font-mono tracking-wider px-1.5 py-0.5 rounded bg-amber-950/80 text-amber-300 border border-amber-800/60 font-semibold">
                DEMO PREVIEW
              </span>
            </div>
            <div className="text-[11px] font-mono text-slate-400 hidden sm:block">
              Interactive Onboarding Preview Sandbox
            </div>
          </div>
        </button>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => navigate('/citizenship')}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-xs font-mono font-bold text-white transition-colors"
          >
            <ShieldCheck className="w-4 h-4" />
            <span className="hidden sm:inline">REAL CITIZENSHIP</span>
          </button>

          <button
            onClick={() => navigate('/citizens')}
            className="hidden md:flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-mono text-slate-300 hover:text-white transition-colors"
          >
            <span>VIEW DIRECTORY</span>
          </button>

          <AccountMenu citizenshipPath="/citizenship" />
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-4xl mx-auto w-full px-6 py-8 pb-16 flex flex-col justify-center">
        {/* Official Real Citizenship Prompt Banner */}
        <div className="mb-6 p-4 md:p-5 rounded-2xl bg-cyan-950/30 border border-cyan-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
            <div>
              <div className="font-chakra text-sm font-bold text-white uppercase tracking-wide">
                Applying for Official LUNAR Citizenship (<code className="text-cyan-300 font-mono">LUN-XXXXX</code>)?
              </div>
              <p className="text-xs font-mono text-slate-300 mt-0.5">
                Real citizenship records require verified email, social connection, and server eligibility clearance at the Citizenship Terminal.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => navigate('/citizenship')}
            className="shrink-0 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-chakra text-xs font-bold tracking-wider uppercase flex items-center justify-center gap-2 shadow-lg shadow-cyan-950/50"
          >
            <span>Open /citizenship</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Step Indicator (Steps 1-7) */}
        {step < 8 && (
          <div className="mb-8">
            <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-2">
              <span>DEMO PREVIEW STEP {step} OF 7</span>
              <span className="text-amber-300 font-semibold">
                {
                  [
                    'Demo Preview Briefing',
                    'Callsign & Identity',
                    'Civic Biography',
                    'Department',
                    'Specialization',
                    'EVA Suit Specs',
                    'Preview Review',
                  ][step - 1]
                }
              </span>
            </div>
            <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-cyan-500 transition-all duration-300"
                style={{ width: `${(step / 7) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* STEP 1: Welcome & Demo Briefing */}
        {step === 1 && (
          <div className="bg-slate-950/90 border border-slate-800/90 rounded-3xl p-8 md:p-12 shadow-2xl text-center relative overflow-hidden">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-950/80 border border-amber-800/80 text-amber-300 text-xs font-mono font-bold mb-4">
              <FlaskConical className="w-3.5 h-3.5" />
              DEMO PREVIEW SANDBOX (IN-MEMORY ONLY)
            </div>

            <h1 className="font-chakra text-3xl md:text-5xl font-extrabold text-white tracking-wide leading-tight">
              Preview <span className="text-cyan-400">LUNAR</span> Enlistment
            </h1>

            <p className="text-slate-300 text-sm md:text-base mt-4 max-w-xl mx-auto leading-relaxed">
              Explore the citizen onboarding flow in-memory (<code className="text-amber-300 font-mono">SIM-9XXXX</code>) before signing in, or head directly to the official Citizenship Terminal to claim a permanent <code className="text-cyan-300 font-mono">LUN-XXXXX</code> record.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto my-8 font-mono text-xs text-left">
              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
                <Shield className="w-5 h-5 text-cyan-400 mb-2" />
                <div className="font-bold text-white mb-1">Official Route</div>
                <div className="text-slate-400 text-[11px]">
                  Permanent <code className="text-cyan-300">LUN-XXXXX</code> IDs are issued exclusively via <code className="text-cyan-300">/citizenship</code>.
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
                <Compass className="w-5 h-5 text-amber-400 mb-2" />
                <div className="font-bold text-white mb-1">3D Sandbox Avatar</div>
                <div className="text-slate-400 text-[11px]">
                  Test suit colors & district placement temporarily in your current session.
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
                <Award className="w-5 h-5 text-emerald-400 mb-2" />
                <div className="font-bold text-white mb-1">Non-Persistent</div>
                <div className="text-slate-400 text-[11px]">
                  Demo previews never write to PostgreSQL or localStorage.
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => navigate('/citizenship')}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-chakra text-sm font-bold transition-all shadow-xl shadow-cyan-950/50"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>GO TO REAL CITIZENSHIP</span>
              </button>

              <button
                onClick={() => setStep(2)}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-amber-300 font-chakra text-sm font-bold transition-all"
              >
                <span>TRY DEMO PREVIEW</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <div className="bg-slate-950/90 border border-slate-800/90 rounded-3xl p-8 shadow-2xl">
            <h2 className="font-chakra text-2xl font-bold text-white mb-1">
              Preview Call Sign & Display Identity
            </h2>
            <p className="text-xs font-mono text-slate-400 mb-6">
              Temporary simulation callsign for Demo Preview only.
            </p>

            <div className="space-y-5">
              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1.5 uppercase font-semibold">
                  Preview Username / Call Sign
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-mono text-slate-500 text-sm">
                    @
                  </span>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="e.g. demo_pioneer"
                    className="w-full pl-8 pr-10 py-3 bg-slate-900 border border-slate-700 rounded-xl text-sm font-mono text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500"
                  />
                  {usernameClean && (
                    <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
                      {isUsernameValid && !usernameTaken ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-rose-400" />
                      )}
                    </div>
                  )}
                </div>
                {usernameClean && !isUsernameValid && (
                  <div className="text-[11px] font-mono text-rose-400 mt-1">
                    Username must be 3-20 characters, lowercase alphanumeric & underscore only.
                  </div>
                )}
                {usernameTaken && (
                  <div className="text-[11px] font-mono text-rose-400 mt-1">
                    This username is already present in the current roster.
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
                  placeholder="e.g. Demo Pioneer"
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-sm font-mono text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div className="mt-8 flex justify-between">
              <button
                onClick={() => setStep(1)}
                className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-mono text-slate-300"
              >
                BACK
              </button>
              <button
                disabled={!isStep2Valid}
                onClick={() => setStep(3)}
                className={`px-6 py-2.5 rounded-xl font-mono text-xs font-bold flex items-center gap-2 ${
                  isStep2Valid
                    ? 'bg-cyan-600 hover:bg-cyan-500 text-white'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                }`}
              >
                <span>CONTINUE</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3 */}
        {step === 3 && (
          <div className="bg-slate-950/90 border border-slate-800/90 rounded-3xl p-8 shadow-2xl">
            <h2 className="font-chakra text-2xl font-bold text-white mb-1">
              Civic Record & Mission Statement
            </h2>
            <p className="text-xs font-mono text-slate-400 mb-6">
              Describe your background and purpose on the lunar surface (minimum 10 characters).
            </p>

            <div>
              <textarea
                rows={5}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="e.g. Orbital systems architect testing Selenia Prime surface coordinates..."
                className="w-full p-4 bg-slate-900 border border-slate-700 rounded-xl text-sm font-sans text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500 leading-relaxed"
              />
              <div className="flex justify-between text-[11px] font-mono text-slate-500 mt-1">
                <span>Minimum 10 characters</span>
                <span className={bio.trim().length >= 10 ? 'text-emerald-400' : 'text-slate-500'}>
                  {bio.trim().length} chars
                </span>
              </div>
            </div>

            <div className="mt-8 flex justify-between">
              <button
                onClick={() => setStep(2)}
                className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-mono text-slate-300"
              >
                BACK
              </button>
              <button
                disabled={!isStep3Valid}
                onClick={() => setStep(4)}
                className={`px-6 py-2.5 rounded-xl font-mono text-xs font-bold flex items-center gap-2 ${
                  isStep3Valid
                    ? 'bg-cyan-600 hover:bg-cyan-500 text-white'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                }`}
              >
                <span>CONTINUE</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 4 */}
        {step === 4 && (
          <div className="bg-slate-950/90 border border-slate-800/90 rounded-3xl p-8 shadow-2xl">
            <h2 className="font-chakra text-2xl font-bold text-white mb-1">
              Department Enlistment
            </h2>
            <p className="text-xs font-mono text-slate-400 mb-6">
              Choose your department to determine your district assignment.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {Object.values(DEPARTMENTS).map((dept) => {
                const isSelected = department === dept.id;
                return (
                  <div
                    key={dept.id}
                    onClick={() => handleDeptSelect(dept.id)}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-slate-900 border-cyan-500 shadow-lg shadow-cyan-950/50'
                        : 'bg-slate-900/40 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-chakra text-base font-bold" style={{ color: dept.accentColor }}>
                        {dept.name}
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                        {dept.primaryDistrictId}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">{dept.description}</p>
                  </div>
                );
              })}
            </div>

            <div className="mt-8 flex justify-between">
              <button
                onClick={() => setStep(3)}
                className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-mono text-slate-300"
              >
                BACK
              </button>
              <button
                onClick={() => setStep(5)}
                className="px-6 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-mono text-xs font-bold flex items-center gap-2"
              >
                <span>CONTINUE</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 5 */}
        {step === 5 && (
          <div className="bg-slate-950/90 border border-slate-800/90 rounded-3xl p-8 shadow-2xl">
            <h2 className="font-chakra text-2xl font-bold text-white mb-1">
              Select Your Specialization
            </h2>
            <p className="text-xs font-mono text-slate-400 mb-6">
              Designated roles within <span className="text-cyan-400 font-bold">{chosenDeptInfo.name}</span>.
            </p>

            <div className="space-y-2.5">
              {chosenDeptInfo.professions.map((prof) => {
                const isSelected = profession === prof;
                return (
                  <div
                    key={prof}
                    onClick={() => setProfession(prof)}
                    className={`p-3.5 rounded-xl border cursor-pointer flex items-center justify-between transition-all ${
                      isSelected
                        ? 'bg-slate-900 border-cyan-500 text-white shadow-md'
                        : 'bg-slate-900/40 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                          isSelected ? 'border-cyan-400 bg-cyan-400' : 'border-slate-600'
                        }`}
                      >
                        {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-slate-950" />}
                      </div>
                      <span className="font-mono text-sm font-semibold">{prof}</span>
                    </div>

                    <span className="text-[10px] font-mono text-slate-500 uppercase">RANK: CITIZEN</span>
                  </div>
                );
              })}
            </div>

            <div className="mt-8 flex justify-between">
              <button
                onClick={() => setStep(4)}
                className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-mono text-slate-300"
              >
                BACK
              </button>
              <button
                onClick={() => setStep(6)}
                className="px-6 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-mono text-xs font-bold flex items-center gap-2"
              >
                <span>CONTINUE</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 6 */}
        {step === 6 && (
          <div className="bg-slate-950/90 border border-slate-800/90 rounded-3xl p-8 shadow-2xl">
            <h2 className="font-chakra text-2xl font-bold text-white mb-1">
              EVA Suit Customization
            </h2>
            <p className="text-xs font-mono text-slate-400 mb-6">
              Configure your surface suit and astronaut specialization class.
            </p>

            <div className="mb-6">
              <label className="block text-xs font-mono text-slate-300 mb-2 uppercase font-semibold">
                Astronaut Class
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {ASTRONAUT_TYPES.map((type) => {
                  const isSelected = astronautType === type.id;
                  return (
                    <div
                      key={type.id}
                      onClick={() => setAstronautType(type.id)}
                      className={`p-3 rounded-xl border cursor-pointer text-left transition-all ${
                        isSelected
                          ? 'bg-slate-900 border-cyan-500 shadow-md'
                          : 'bg-slate-900/40 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="font-chakra text-sm font-bold text-white mb-0.5">{type.label}</div>
                      <div className="text-[10px] text-slate-400 line-clamp-2">{type.desc}</div>
                    </div>
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
                    <div
                      key={c.value}
                      onClick={() => setSuitColor(c.value)}
                      className={`p-2.5 rounded-xl border cursor-pointer flex items-center gap-3 transition-all ${
                        isSelected
                          ? 'bg-slate-900 border-cyan-500 shadow-md'
                          : 'bg-slate-900/40 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div
                        className="w-6 h-6 rounded-lg border border-slate-600 shrink-0"
                        style={{ backgroundColor: c.value }}
                      />
                      <span className="text-xs font-mono text-slate-200 truncate">{c.name}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="mt-8 flex justify-between">
              <button
                onClick={() => setStep(5)}
                className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-mono text-slate-300"
              >
                BACK
              </button>
              <button
                onClick={() => setStep(7)}
                className="px-6 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-mono text-xs font-bold flex items-center gap-2"
              >
                <span>REVIEW PREVIEW</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 7 */}
        {step === 7 && (
          <div className="bg-slate-950/90 border border-slate-800/90 rounded-3xl p-8 shadow-2xl">
            <h2 className="font-chakra text-2xl font-bold text-white mb-1">
              Demo Preview Dossier
            </h2>
            <p className="text-xs font-mono text-slate-400 mb-6">
              This launches a temporary in-memory <code className="text-amber-300">SIM-9XXXX</code> astronaut in the 3D colony.
            </p>

            {submitError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-950/50 border border-rose-800/70 text-xs font-mono text-rose-200">
                {submitError}
              </div>
            )}

            <div className="bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 border-2 border-amber-500/40 rounded-2xl p-6 shadow-2xl max-w-lg mx-auto">
              <div className="flex items-start justify-between border-b border-slate-800 pb-4 mb-4">
                <div>
                  <div className="text-[10px] font-mono tracking-widest text-amber-300 uppercase font-bold">
                    DEMO PREVIEW SIMULATION CARD
                  </div>
                  <div className="font-chakra text-xl font-bold text-white mt-0.5">{displayName}</div>
                  <div className="text-xs font-mono text-slate-400">@{usernameClean}</div>
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
                  <div className="text-white font-bold">{chosenDeptInfo.primaryDistrictId}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-500 uppercase">Specialization</div>
                  <div className="text-slate-200">{profession}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-500 uppercase">Mode</div>
                  <div className="text-amber-300 font-bold">IN-MEMORY DEMO</div>
                </div>
              </div>

              <div className="text-xs text-slate-300 font-sans border-t border-slate-800/80 pt-3 italic">
                "{bio}"
              </div>
            </div>

            <div className="mt-8 flex justify-between">
              <button
                onClick={() => setStep(6)}
                className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-mono text-slate-300"
              >
                BACK
              </button>
              <button
                disabled={isSubmitting}
                onClick={handleDemoPreviewRegister}
                className="px-8 py-3 rounded-xl bg-gradient-to-r from-amber-600 to-cyan-600 hover:from-amber-500 hover:to-cyan-500 text-white font-chakra text-sm font-bold flex items-center gap-2 shadow-lg"
              >
                <Rocket className="w-4 h-4" />
                <span>LAUNCH DEMO PREVIEW</span>
              </button>
            </div>
          </div>
        )}

        {/* STEP 8 */}
        {step === 8 && registeredCitizen && (
          <div className="bg-slate-950/95 border border-amber-500/50 rounded-3xl p-8 md:p-12 shadow-2xl text-center relative overflow-hidden">
            {arrivalStage === 'descending' && (
              <div className="py-12">
                <Rocket className="w-16 h-16 text-amber-400 mx-auto mb-4 animate-bounce" />
                <h2 className="font-chakra text-2xl md:text-3xl font-extrabold text-white">
                  DEPLOYING DEMO PREVIEW AVATAR...
                </h2>
                <p className="text-xs font-mono text-slate-400 mt-2">
                  Placing simulation avatar in {registeredCitizen.districtId} District.
                </p>
              </div>
            )}

            {arrivalStage === 'touchdown' && (
              <div className="py-12">
                <Zap className="w-16 h-16 text-cyan-400 mx-auto mb-4 animate-pulse" />
                <h2 className="font-chakra text-2xl md:text-3xl font-extrabold text-white">
                  SIMULATION TOUCHDOWN CONFIRMED
                </h2>
                <p className="text-xs font-mono text-slate-400 mt-2">
                  Surface telemetry online in local sandbox.
                </p>
              </div>
            )}

            {arrivalStage === 'complete' && (
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-950 text-amber-300 border border-amber-800 text-xs font-mono font-bold mb-3">
                  DEMO PREVIEW ACTIVE (NON-PERSISTENT)
                </div>

                <h2 className="font-chakra text-3xl font-extrabold text-white">
                  Preview Ready: {registeredCitizen.displayName}
                </h2>

                <div className="mt-4 p-4 rounded-2xl bg-slate-900/80 border border-slate-800 max-w-md mx-auto font-mono text-xs text-left space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Preview ID:</span>
                    <span className="text-amber-300 font-bold">{registeredCitizen.citizenId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Assigned District:</span>
                    <span className="text-white font-bold">{registeredCitizen.districtId} DISTRICT</span>
                  </div>
                </div>

                <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
                  <button
                    onClick={() => navigate(`/world?focus=${registeredCitizen.citizenId}`)}
                    className="w-full sm:w-auto px-7 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-white font-chakra text-sm font-bold flex items-center justify-center gap-2"
                  >
                    <Compass className="w-4 h-4 text-cyan-400" />
                    <span>VIEW IN 3D COLONY</span>
                  </button>

                  <button
                    onClick={() => navigate('/citizenship')}
                    className="w-full sm:w-auto px-8 py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-chakra text-sm font-bold flex items-center justify-center gap-2"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>CLAIM REAL CITIZENSHIP</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default JoinPage;
