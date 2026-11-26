import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Compass,
  Copy,
  Check,
  Share2,
  MapPin,
  Activity,
  Award,
  Shield,
  ShieldCheck,
  Coins,
  Trophy,
  BarChart3,
  Flame,
  RefreshCw,
} from 'lucide-react';
import { useCitizen } from '../context/CitizenContext';
import { citizenService } from '../lib/citizenService';
import { AccountMenu } from '../components/ui/AccountMenu';
import { DISTRICTS } from '../data/districts';
import { DEPARTMENTS } from '../data/departments';
import { BUILDINGS } from '../data/buildings';
import { Citizen } from '../types';

export const CitizenProfilePage: React.FC = () => {
  const { citizenId } = useParams<{ citizenId: string }>();
  const navigate = useNavigate();
  const { getCitizenById } = useCitizen();

  const cachedCitizen = citizenId ? getCitizenById(citizenId) : undefined;
  const [remoteCitizen, setRemoteCitizen] = useState<Citizen | null>(null);
  const [isFetching, setIsFetching] = useState<boolean>(
    Boolean(citizenId && !cachedCitizen && !citizenId.toUpperCase().startsWith('SIM-'))
  );

  const [copiedId, setCopiedId] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);

  useEffect(() => {
    if (!citizenId) {
      setIsFetching(false);
      return;
    }

    // Always resolve SIM-* from demo store; for LUN-* fetch fresh public DTO if not cached
    if (citizenId.toUpperCase().startsWith('SIM-')) {
      setRemoteCitizen(null);
      setIsFetching(false);
      return;
    }

    let cancelled = false;
    if (!cachedCitizen) {
      setIsFetching(true);
    }

    citizenService
      .fetchPublicCitizenById(citizenId)
      .then((found) => {
        if (!cancelled) {
          setRemoteCitizen(found);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setRemoteCitizen(null);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsFetching(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [citizenId, cachedCitizen]);

  const citizen = remoteCitizen ?? cachedCitizen;

  const handleCopyId = () => {
    if (!citizen) return;
    navigator.clipboard.writeText(citizen.citizenId);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const handleShare = async () => {
    if (!citizen) return;
    const shareData = {
      title: `${citizen.displayName} — LUNAR Citizen Dossier`,
      text: `View ${citizen.displayName} (${citizen.citizenId}), ${citizen.profession} in ${citizen.districtId} District on Selenia Prime.`,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {
        handleCopyUrl();
      }
    } else {
      handleCopyUrl();
    }
  };

  if (isFetching && !citizen) {
    return (
      <div className="h-screen overflow-y-auto bg-[#05070a] text-slate-100 flex flex-col items-center justify-center p-6 font-mono">
        <div className="max-w-sm w-full bg-slate-950 border border-slate-800 rounded-2xl p-8 text-center shadow-2xl">
          <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin mx-auto mb-3" />
          <div className="font-chakra text-lg font-bold text-white">
            Retrieving Citizen Dossier
          </div>
          <div className="text-xs text-slate-400 mt-1">
            Querying Selenia Prime registry for {citizenId}...
          </div>
        </div>
      </div>
    );
  }

  if (!citizen) {
    return (
      <div className="h-screen overflow-y-auto bg-[#05070a] text-slate-100 flex flex-col items-center justify-center p-6 font-mono">
        <div className="max-w-md w-full bg-slate-950 border border-slate-800 rounded-2xl p-8 text-center shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-rose-950/60 border border-rose-800/80 flex items-center justify-center mx-auto mb-4 text-rose-400">
            <Shield className="w-8 h-8" />
          </div>
          <h2 className="font-chakra text-2xl font-bold text-white mb-2">
            Citizen Dossier Not Found
          </h2>
          <p className="text-xs text-slate-400 mb-6 leading-relaxed">
            The citizen identity record <span className="text-cyan-400 font-bold">"{citizenId}"</span> does not
            exist in the Selenia Prime central registry.
          </p>
          <button
            onClick={() => navigate('/citizens')}
            className="w-full py-2.5 px-4 bg-cyan-600 hover:bg-cyan-500 rounded-xl text-xs font-bold text-white transition-colors"
          >
            Return to Citizen Directory
          </button>
        </div>
      </div>
    );
  }

  const district = DISTRICTS[citizen.districtId];
  const department = DEPARTMENTS[citizen.department];
  const building = BUILDINGS.find((b) => b.id === citizen.buildingId);
  const isDemo = Boolean(citizen.isDemo);

  const currentLevelBaseXp = (citizen.level - 1) * 100;
  const progressPercent = Math.min(100, Math.max(0, ((citizen.xp - currentLevelBaseXp) / 100) * 100));

  return (
    <div className="h-screen overflow-y-auto bg-[#05070a] text-slate-100 flex flex-col font-sans pb-16 select-text">
      {/* Top Navigation */}
      <header className="sticky top-0 z-30 bg-slate-950/85 backdrop-blur-xl border-b border-slate-800/80 px-6 py-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/citizens')}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-xs font-mono font-medium text-slate-300 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>DIRECTORY</span>
          </button>

          <div className="hidden sm:block h-5 w-px bg-slate-800" />

          <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-slate-400">
            <span>REGISTRY</span>
            <span>/</span>
            <span className="text-cyan-400 font-bold">{citizen.citizenId}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-mono text-slate-300 hover:text-white transition-colors"
            title="Share Citizen Dossier"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{copiedUrl ? 'LINK COPIED!' : 'SHARE'}</span>
          </button>

          <button
            onClick={() => navigate(`/world?focus=${citizen.citizenId}`)}
            className="flex items-center gap-2 px-4 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 border border-cyan-400 text-xs font-mono font-bold text-white transition-all shadow-lg shadow-cyan-950/40"
          >
            <Compass className="w-4 h-4" />
            <span className="hidden sm:inline">LOCATE IN 3D WORLD</span>
            <span className="sm:hidden">3D VIEW</span>
          </button>

          <AccountMenu citizenshipPath="/citizenship" />
        </div>
      </header>

      {/* Main Dossier Content */}
      <main className="max-w-6xl mx-auto w-full px-6 pt-8">
        {/* Identity Banner Card */}
        <div className="bg-slate-950/90 border border-slate-800/90 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden mb-8">
          <div
            className="absolute -top-24 -right-24 w-80 h-80 rounded-full blur-3xl opacity-20 pointer-events-none"
            style={{ backgroundColor: department?.accentColor || '#38bdf8' }}
          />

          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 md:w-28 md:h-28 rounded-2xl bg-slate-900 border-2 border-slate-700/80 flex items-center justify-center relative overflow-hidden shadow-2xl shrink-0">
                <div
                  className="w-16 h-16 md:w-20 md:h-20 rounded-full border-4 border-slate-400/80 relative flex items-center justify-center shadow-inner"
                  style={{ backgroundColor: citizen.suitColor }}
                >
                  <div className="w-9 h-9 md:w-11 md:h-11 rounded-full bg-gradient-to-tr from-amber-500 via-amber-300 to-amber-100 opacity-90 shadow-lg" />
                </div>
                <span className="absolute bottom-2 right-2 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-slate-950 animate-pulse" />
              </div>

              <div>
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <button
                    onClick={handleCopyId}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-cyan-950 text-cyan-300 border border-cyan-800/80 font-mono text-xs font-bold hover:bg-cyan-900 transition-colors"
                    title="Click to copy ID"
                  >
                    <span>{citizen.citizenId}</span>
                    {copiedId ? (
                      <Check className="w-3 h-3 text-emerald-400" />
                    ) : (
                      <Copy className="w-3 h-3 opacity-70" />
                    )}
                  </button>

                  <span className="text-xs font-mono text-slate-400">
                    @{citizen.username}
                  </span>

                  {isDemo ? (
                    <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-amber-950/90 text-amber-300 border border-amber-800/80 font-bold">
                      DEMO SHOWCASE
                    </span>
                  ) : (
                    <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-emerald-950/90 text-emerald-300 border border-emerald-800/80 font-bold flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-emerald-400" />
                      VERIFIED CITIZEN
                    </span>
                  )}

                  {citizen.isFoundingCitizen && (
                    <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-amber-950/90 text-amber-300 border border-amber-800/80 font-bold flex items-center gap-1">
                      <Award className="w-3 h-3 text-amber-400" />
                      FOUNDING CITIZEN
                    </span>
                  )}
                </div>

                <h1 className="font-chakra text-2xl md:text-3xl font-extrabold text-white tracking-wide">
                  {citizen.displayName}
                </h1>

                <div className="flex items-center gap-2 mt-2 flex-wrap font-mono text-xs">
                  <span className="text-cyan-400 font-semibold">{citizen.profession}</span>
                  <span className="text-slate-600">•</span>
                  <span className="text-slate-300">{citizen.rank}</span>
                  <span className="text-slate-600">•</span>
                  <span className="text-slate-400">
                    Joined Sol {citizen.joinedAt.split('T')[0]}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row md:flex-col items-start md:items-end gap-3 shrink-0">
              <div className="flex items-center gap-2 font-mono text-xs">
                <span className="px-3 py-1 rounded-lg bg-emerald-950/80 border border-emerald-800/80 text-emerald-300 font-bold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
                  STATUS: {citizen.status}
                </span>
              </div>

              <div className="text-xs font-mono text-slate-400 flex items-center gap-1">
                <span>SUIT SPEC:</span>
                <span className="uppercase text-slate-200 font-bold">{citizen.astronautType} Mk.IV</span>
              </div>
            </div>
          </div>

          {/* Active Activity Strip */}
          <div className="mt-6 bg-cyan-950/30 border border-cyan-900/50 rounded-2xl p-4 flex items-center gap-3 font-mono text-xs text-cyan-200">
            <Activity className="w-5 h-5 text-cyan-400 shrink-0 animate-pulse" />
            <div className="flex-1">
              <span className="text-[10px] text-cyan-400 uppercase tracking-wider block font-bold">
                Current Real-Time Mission / Operation
              </span>
              <span className="text-sm font-medium">{citizen.currentActivity}</span>
            </div>
          </div>
        </div>

        {/* Grid Layout: 2 Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-6">
            {/* Progression & Economy Card */}
            <div className="bg-slate-950/80 border border-slate-800/80 rounded-2xl p-6 shadow-xl font-mono">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-chakra text-sm font-bold text-slate-300 tracking-wider uppercase flex items-center gap-2">
                  <Flame className="w-4 h-4 text-indigo-400" />
                  Progression & Wealth
                </h3>
                <span className="text-xs px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800 font-bold">
                  LEVEL {citizen.level}
                </span>
              </div>

              <div className="mb-4">
                <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
                  <span>Colony XP Progress</span>
                  <span className="text-cyan-400 font-bold">{citizen.xp} XP</span>
                </div>
                <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-500 to-indigo-500 transition-all duration-500"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                  <span>Lvl {citizen.level}</span>
                  <span>Lvl {citizen.level + 1}</span>
                </div>
              </div>

              <div className="p-3.5 bg-slate-900/80 border border-slate-800 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-amber-950/80 border border-amber-800/80 flex items-center justify-center text-amber-400">
                    <Coins className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400 uppercase">Colony Credits</div>
                    <div className="text-base font-bold text-amber-300">{citizen.colonyCredits} CC</div>
                  </div>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                  SOL CURRENCY
                </span>
              </div>
            </div>

            {/* Station Location Card */}
            <div className="bg-slate-950/80 border border-slate-800/80 rounded-2xl p-6 shadow-xl font-mono text-xs">
              <h3 className="font-chakra text-sm font-bold text-slate-300 tracking-wider uppercase mb-4 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-cyan-400" />
                Stationed Station & Coordinates
              </h3>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-2.5 bg-slate-900/60 rounded-xl border border-slate-800/60">
                  <span className="text-slate-400">District:</span>
                  <span className="text-white font-bold flex items-center gap-1.5">
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: district?.accentColor }}
                    />
                    {district?.name} DISTRICT
                  </span>
                </div>

                <div className="flex items-center justify-between p-2.5 bg-slate-900/60 rounded-xl border border-slate-800/60">
                  <span className="text-slate-400">Station / Hab:</span>
                  <span className="text-white font-bold">
                    {building?.name || citizen.buildingId}
                  </span>
                </div>

                <div className="flex items-center justify-between p-2.5 bg-slate-900/60 rounded-xl border border-slate-800/60">
                  <span className="text-slate-400">Surface Grid:</span>
                  <span className="text-cyan-400 font-bold">
                    X: {Math.round(citizen.location.x)} | Z: {Math.round(citizen.location.z)}
                  </span>
                </div>
              </div>

              <button
                onClick={() => navigate(`/world?focus=${citizen.citizenId}`)}
                className="w-full mt-4 py-2.5 px-3 rounded-xl bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-800/60 text-cyan-300 font-bold flex items-center justify-center gap-2 transition-colors"
              >
                <Compass className="w-4 h-4" />
                <span>Focus in 3D Colony View</span>
              </button>
            </div>

            {/* Department Card */}
            <div className="bg-slate-950/80 border border-slate-800/80 rounded-2xl p-6 shadow-xl">
              <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1 font-semibold">
                Department Affiliation
              </div>
              <h4
                className="font-chakra text-lg font-bold"
                style={{ color: department?.accentColor || '#38bdf8' }}
              >
                {department?.name || citizen.department}
              </h4>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                {department?.description}
              </p>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div className="bg-slate-950/80 border border-slate-800/80 rounded-2xl p-6 md:p-8 shadow-xl">
              <h3 className="font-chakra text-base font-bold text-white tracking-wider uppercase mb-3 flex items-center gap-2">
                <Shield className="w-4 h-4 text-cyan-400" />
                Civic Record & Biography
              </h3>
              <p className="text-slate-300 text-sm leading-relaxed font-sans">
                {citizen.bio}
              </p>
            </div>

            <div className="bg-slate-950/80 border border-slate-800/80 rounded-2xl p-6 md:p-8 shadow-xl font-mono">
              <h3 className="font-chakra text-base font-bold text-white tracking-wider uppercase mb-4 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-emerald-400" />
                Colony Contribution Metrics
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3.5">
                  <div className="text-[10px] text-slate-400 uppercase">Missions Done</div>
                  <div className="text-2xl font-bold text-white mt-1">
                    {citizen.contributionStats.missionsCompleted}
                  </div>
                  <div className="text-[10px] text-emerald-400 mt-0.5">EVA Expeditions</div>
                </div>

                <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3.5">
                  <div className="text-[10px] text-slate-400 uppercase">Structures Contributed</div>
                  <div className="text-2xl font-bold text-cyan-400 mt-1">
                    {citizen.contributionStats.structuresContributed}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Hab Modules</div>
                </div>

                <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3.5">
                  <div className="text-[10px] text-slate-400 uppercase">EVA Sessions</div>
                  <div className="text-2xl font-bold text-amber-400 mt-1">
                    {citizen.contributionStats.evaSessions ?? 0}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Regolith Hours</div>
                </div>

                <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3.5">
                  <div className="text-[10px] text-slate-400 uppercase">Discoveries</div>
                  <div className="text-2xl font-bold text-indigo-400 mt-1">
                    {citizen.contributionStats.discoveryCount ?? 0}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Catalogued</div>
                </div>
              </div>
            </div>

            <div className="bg-slate-950/80 border border-slate-800/80 rounded-2xl p-6 md:p-8 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-chakra text-base font-bold text-white tracking-wider uppercase flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-amber-400" />
                  Commendations & Achievements ({citizen.achievements.length})
                </h3>
              </div>

              {citizen.achievements.length === 0 ? (
                <div className="py-8 text-center text-slate-500 font-mono text-xs">
                  No unlocked commendations yet. Participate in EVA missions or engineering builds to unlock achievements.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {citizen.achievements.map((ach) => {
                    const rarityColors = {
                      common: 'border-slate-700 bg-slate-900/40 text-slate-300',
                      rare: 'border-cyan-800/60 bg-cyan-950/30 text-cyan-300',
                      epic: 'border-indigo-800/60 bg-indigo-950/30 text-indigo-300',
                      legendary: 'border-amber-800/80 bg-amber-950/40 text-amber-300',
                    }[ach.rarity] || 'border-slate-700 bg-slate-900/40 text-slate-300';

                    return (
                      <div
                        key={ach.id}
                        className={`p-3.5 rounded-xl border ${rarityColors} flex items-start gap-3`}
                      >
                        <div className="w-9 h-9 rounded-lg bg-slate-900/80 border border-slate-700 flex items-center justify-center shrink-0 text-amber-400">
                          <Award className="w-4 h-4" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="font-chakra text-sm font-bold text-white">
                              {ach.name}
                            </span>
                            <span className="text-[9px] font-mono uppercase px-1.5 py-0.2 rounded bg-slate-900 border border-slate-800">
                              {ach.rarity}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                            {ach.description}
                          </p>
                          {ach.unlockedAt && (
                            <div className="text-[10px] font-mono text-slate-500 mt-1.5">
                              Unlocked Sol {ach.unlockedAt.split('T')[0]}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CitizenProfilePage;
