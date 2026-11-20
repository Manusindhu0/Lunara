import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Shield,
  User,
  Compass,
  Palette,
  Briefcase,
  FileText,
  Rocket,
  Award,
  Check,
  Zap,
  Globe2
} from 'lucide-react';
import { useCitizen } from '../context/CitizenContext';
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
  const { registerCitizen, isUsernameTaken } = useCitizen();

  // Wizard Step: 1 (Welcome) -> 2 (Callsign) -> 3 (Bio) -> 4 (Dept) -> 5 (Profession) -> 6 (Suit) -> 7 (Review) -> 8 (Arrival Animation / Granted)
  const [step, setStep] = useState<number>(1);

  // Form State
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [department, setDepartment] = useState<DepartmentId>('ENGINEERING');
  const [profession, setProfession] = useState<string>(DEPARTMENTS.ENGINEERING.professions[0]);
  const [astronautType, setAstronautType] = useState<AstronautType>('engineer');
  const [suitColor, setSuitColor] = useState<string>('#ffffff');

  // Registration result
  const [registeredCitizen, setRegisteredCitizen] = useState<Citizen | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [arrivalStage, setArrivalStage] = useState<'descending' | 'touchdown' | 'complete'>('descending');

  // Real-time username validation
  const usernameClean = username.trim().toLowerCase().replace(/\s+/g, '_');
  const isUsernameValid = /^[a-zA-Z0-9_]{3,20}$/.test(usernameClean);
  const usernameTaken = useMemo(() => {
    if (!usernameClean || !isUsernameValid) return false;
    return isUsernameTaken(usernameClean);
  }, [usernameClean, isUsernameValid, isUsernameTaken]);

  const isStep2Valid = isUsernameValid && !usernameTaken && displayName.trim().length >= 2;
  const isStep3Valid = bio.trim().length >= 10;

  // Handle department change -> reset profession to first available
  const handleDeptSelect = (deptId: DepartmentId) => {
    setDepartment(deptId);
    setProfession(DEPARTMENTS[deptId].professions[0]);
  };

  // Submit registration
  const handleRegister = () => {
    setIsSubmitting(true);
    try {
      const citizen = registerCitizen({
        username: usernameClean,
        displayName: displayName.trim(),
        bio: bio.trim(),
        department,
        profession,
        astronautType,
        suitColor,
      });
      setRegisteredCitizen(citizen);
      setStep(8); // Go to Arrival sequence

      // Dramatic timed arrival steps
      setTimeout(() => {
        setArrivalStage('touchdown');
      }, 1800);
      setTimeout(() => {
        setArrivalStage('complete');
      }, 3400);
    } catch (err: any) {
      alert(err.message || 'Registration failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const chosenDeptInfo = DEPARTMENTS[department];

  return (
    <div className="min-h-screen bg-[#05070a] text-slate-100 flex flex-col font-sans">
      {/* Top Bar */}
      <header className="sticky top-0 z-30 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/80 px-6 py-4 flex items-center justify-between">
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
              <span className="text-[10px] font-mono tracking-wider px-1.5 py-0.5 rounded bg-cyan-950/80 text-cyan-400 border border-cyan-800/60 font-semibold">
                ENLISTMENT
              </span>
            </div>
            <div className="text-[11px] font-mono text-slate-400">
              Civilian & Specialist Onboarding Protocol
            </div>
          </div>
        </button>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/citizens')}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-mono text-slate-300 hover:text-white transition-colors"
          >
            <span>VIEW DIRECTORY</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-4xl mx-auto w-full px-6 py-8 flex flex-col justify-center">
        {/* Step Indicator (Steps 1-7) */}
        {step < 8 && (
          <div className="mb-8">
            <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-2">
              <span>STEP {step} OF 7</span>
              <span className="text-cyan-400 font-semibold">
                {
                  [
                    'Briefing',
                    'Callsign & Identity',
                    'Civic Biography',
                    'Department',
                    'Specialization',
                    'EVA Suit Specs',
                    'Identity Review',
                  ][step - 1]
                }
              </span>
            </div>
            <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 to-indigo-500 transition-all duration-300"
                style={{ width: `${(step / 7) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* STEP 1: Welcome & Mission Briefing */}
        {step === 1 && (
          <div className="bg-slate-950/90 border border-slate-800/90 rounded-3xl p-8 md:p-12 shadow-2xl text-center relative overflow-hidden">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-800/80 text-cyan-400 text-xs font-mono font-bold mb-4">
              <Sparkles className="w-3.5 h-3.5" />
              PROTOTYPE CITIZEN REGISTRATION
            </div>

            <h1 className="font-chakra text-3xl md:text-5xl font-extrabold text-white tracking-wide leading-tight">
              Become a Citizen of <span className="text-cyan-400">LUNAR</span>
            </h1>

            <p className="text-slate-300 text-sm md:text-base mt-4 max-w-xl mx-auto leading-relaxed">
              Step onto the lunar surface at Selenia Prime. You will be assigned a permanent, non-recyclable
              Citizen ID, a 3D astronaut avatar placed within the colony, and an active role across one of our six districts.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto my-8 font-mono text-xs text-left">
              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
                <Shield className="w-5 h-5 text-cyan-400 mb-2" />
                <div className="font-bold text-white mb-1">Permanent ID</div>
                <div className="text-slate-400 text-[11px]">
                  Unique <code className="text-cyan-300">LUN-XXXXX</code> token tied to your identity forever.
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
                <Compass className="w-5 h-5 text-amber-400 mb-2" />
                <div className="font-bold text-white mb-1">3D World Avatar</div>
                <div className="text-slate-400 text-[11px]">
                  A physically-rendered astronaut placed on the lunar regolith.
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
                <Award className="w-5 h-5 text-emerald-400 mb-2" />
                <div className="font-bold text-white mb-1">Founding Rights</div>
                <div className="text-slate-400 text-[11px]">
                  First 100 registrants gain permanent Founding Pioneer status.
                </div>
              </div>
            </div>

            <button
              onClick={() => setStep(2)}
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-chakra text-base font-bold transition-all shadow-xl shadow-cyan-950/50"
            >
              <span>BEGIN ENLISTMENT PROTOCOL</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* STEP 2: Username & Display Name */}
        {step === 2 && (
          <div className="bg-slate-950/90 border border-slate-800/90 rounded-3xl p-8 shadow-2xl">
            <h2 className="font-chakra text-2xl font-bold text-white mb-1">
              Call Sign & Display Identity
            </h2>
            <p className="text-xs font-mono text-slate-400 mb-6">
              Your username is your unique comms handle. Your display name is how personnel address you in person.
            </p>

            <div className="space-y-5">
              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1.5 uppercase font-semibold">
                  Unique Username / Call Sign
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
                    className="w-full pl-8 pr-10 py-3 bg-slate-900 border border-slate-750 rounded-xl text-sm font-mono text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500"
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
                    Username must be 3-20 characters, alphanumeric & underscore only.
                  </div>
                )}
                {usernameTaken && (
                  <div className="text-[11px] font-mono text-rose-400 mt-1">
                    This username is already claimed by an active lunar citizen.
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
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-750 rounded-xl text-sm font-mono text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500"
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

        {/* STEP 3: Civic Biography */}
        {step === 3 && (
          <div className="bg-slate-950/90 border border-slate-800/90 rounded-3xl p-8 shadow-2xl">
            <h2 className="font-chakra text-2xl font-bold text-white mb-1">
              Civic Record & Mission Statement
            </h2>
            <p className="text-xs font-mono text-slate-400 mb-6">
              Describe your background, specialty, and purpose on the lunar surface (minimum 10 characters).
            </p>

            <div>
              <textarea
                rows={5}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="e.g. Former orbital architect dedicated to expanding regolith sintered dome infrastructure across Selenia Prime..."
                className="w-full p-4 bg-slate-900 border border-slate-750 rounded-xl text-sm font-sans text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500 leading-relaxed"
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

        {/* STEP 4: Department Assignment */}
        {step === 4 && (
          <div className="bg-slate-950/90 border border-slate-800/90 rounded-3xl p-8 shadow-2xl">
            <h2 className="font-chakra text-2xl font-bold text-white mb-1">
              Department Enlistment
            </h2>
            <p className="text-xs font-mono text-slate-400 mb-6">
              Choose your department. This determines your primary district station and career path.
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

        {/* STEP 5: Specialization / Profession */}
        {step === 5 && (
          <div className="bg-slate-950/90 border border-slate-800/90 rounded-3xl p-8 shadow-2xl">
            <h2 className="font-chakra text-2xl font-bold text-white mb-1">
              Select Your Specialization
            </h2>
            <p className="text-xs font-mono text-slate-400 mb-6">
              Designated roles within the <span className="text-cyan-400 font-bold">{chosenDeptInfo.name}</span> department.
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

                    <span className="text-[10px] font-mono text-slate-500 uppercase">
                      RANK: CITIZEN
                    </span>
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

        {/* STEP 6: EVA Suit Customization */}
        {step === 6 && (
          <div className="bg-slate-950/90 border border-slate-800/90 rounded-3xl p-8 shadow-2xl">
            <h2 className="font-chakra text-2xl font-bold text-white mb-1">
              EVA Suit Customization
            </h2>
            <p className="text-xs font-mono text-slate-400 mb-6">
              Configure your pressurized surface suit and astronaut specialization type.
            </p>

            {/* Astronaut Type */}
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
                      <div className="font-chakra text-sm font-bold text-white mb-0.5">
                        {type.label}
                      </div>
                      <div className="text-[10px] text-slate-400 line-clamp-2">
                        {type.desc}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Suit Color */}
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
                <span>REVIEW DOSSIER</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 7: Review Identity Card Preview */}
        {step === 7 && (
          <div className="bg-slate-950/90 border border-slate-800/90 rounded-3xl p-8 shadow-2xl">
            <h2 className="font-chakra text-2xl font-bold text-white mb-1">
              Identity Verification Preview
            </h2>
            <p className="text-xs font-mono text-slate-400 mb-6">
              Review your official lunar citizen credentials before transmitting them to Selenia Prime registry.
            </p>

            {/* Holographic ID Card Preview */}
            <div className="bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 border-2 border-cyan-500/50 rounded-2xl p-6 shadow-2xl max-w-lg mx-auto relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />

              <div className="flex items-start justify-between border-b border-slate-800 pb-4 mb-4">
                <div>
                  <div className="text-[10px] font-mono tracking-widest text-cyan-400 uppercase font-bold">
                    SELENIA PRIME CITIZEN ID
                  </div>
                  <div className="font-chakra text-xl font-bold text-white mt-0.5">
                    {displayName}
                  </div>
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
                  <div className="text-[10px] text-slate-500 uppercase">Starting Balance</div>
                  <div className="text-amber-300 font-bold">100 CC</div>
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
                onClick={handleRegister}
                className="px-8 py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-chakra text-sm font-bold flex items-center gap-2 shadow-lg shadow-cyan-950/50"
              >
                <Rocket className="w-4 h-4" />
                <span>CONFIRM & TRANSMIT CITIZENSHIP</span>
              </button>
            </div>
          </div>
        )}

        {/* STEP 8: Arrival Sequence & Completed Dossier */}
        {step === 8 && registeredCitizen && (
          <div className="bg-slate-950/95 border border-cyan-500/60 rounded-3xl p-8 md:p-12 shadow-2xl text-center relative overflow-hidden">
            {arrivalStage === 'descending' && (
              <div className="py-12 animate-in fade-in duration-300">
                <Rocket className="w-16 h-16 text-cyan-400 mx-auto mb-4 animate-bounce" />
                <h2 className="font-chakra text-2xl md:text-3xl font-extrabold text-white">
                  TRANSMITTING ORBITAL DESCENT VECTORS...
                </h2>
                <p className="text-xs font-mono text-slate-400 mt-2">
                  Selenia Prime Gateway has cleared shuttle approach to {registeredCitizen.districtId} District.
                </p>
                <div className="mt-6 flex justify-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                  <div className="w-2 h-2 rounded-full bg-cyan-400 animate-ping delay-100" />
                  <div className="w-2 h-2 rounded-full bg-cyan-400 animate-ping delay-200" />
                </div>
              </div>
            )}

            {arrivalStage === 'touchdown' && (
              <div className="py-12 animate-in fade-in duration-300">
                <Zap className="w-16 h-16 text-amber-400 mx-auto mb-4 animate-pulse" />
                <h2 className="font-chakra text-2xl md:text-3xl font-extrabold text-white">
                  TOUCHDOWN CONFIRMED — PRESSURIZING AIRLOCK
                </h2>
                <p className="text-xs font-mono text-slate-400 mt-2">
                  Atmospheric telemetry synced. Astronaut Mk.IV suit telemetry online.
                </p>
              </div>
            )}

            {arrivalStage === 'complete' && (
              <div className="animate-in fade-in duration-500">
                <div className="w-16 h-16 rounded-2xl bg-emerald-950/80 border border-emerald-800/80 flex items-center justify-center mx-auto mb-4 text-emerald-400">
                  <CheckCircle2 className="w-10 h-10" />
                </div>

                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800 text-xs font-mono font-bold mb-3">
                  CITIZENSHIP GRANTED
                </div>

                <h2 className="font-chakra text-3xl md:text-4xl font-extrabold text-white">
                  Welcome to Selenia Prime, {registeredCitizen.displayName}
                </h2>

                <div className="mt-4 p-4 rounded-2xl bg-slate-900/80 border border-slate-800 max-w-md mx-auto font-mono text-xs text-left space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Permanent Citizen ID:</span>
                    <span className="text-cyan-400 font-bold text-sm">
                      {registeredCitizen.citizenId}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Assigned District:</span>
                    <span className="text-white font-bold">
                      {registeredCitizen.districtId} DISTRICT
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Starting Colony Credits:</span>
                    <span className="text-amber-300 font-bold">
                      {registeredCitizen.colonyCredits} CC
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Status:</span>
                    <span className="text-emerald-400 font-bold">ACTIVE — STATIONED</span>
                  </div>
                </div>

                <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
                  <button
                    onClick={() => navigate(`/citizen/${registeredCitizen.citizenId}`)}
                    className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-mono text-slate-300 hover:text-white transition-colors"
                  >
                    VIEW CITIZEN DOSSIER
                  </button>

                  <button
                    onClick={() => navigate(`/world?focus=${registeredCitizen.citizenId}`)}
                    className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-chakra text-sm font-bold flex items-center justify-center gap-2 shadow-xl shadow-cyan-950/60"
                  >
                    <Compass className="w-5 h-5" />
                    <span>ENTER 3D COLONY WORLD</span>
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
