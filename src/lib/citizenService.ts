// ============================================================
// LUNAR — Citizen Service
// Single source of truth for all citizen data.
// LocalStorage-persisted with clean abstraction layer for
// eventual backend migration.
// ============================================================

import { Citizen, DepartmentId, DistrictId, CareerRank, CitizenStatus, AstronautType } from '../types';
import { generateCitizenId, generateInternalId } from './citizenId';
import { makeAchievement } from '../data/achievements';
import { getDistrictForDepartment, assignPlacementSlot } from './citizenPlacement';

const STORAGE_KEY = 'lunar_citizens_v2';
const SEQUENCE_KEY = 'lunar_citizen_sequence_v2';

// ---- Demo Citizens Seed Data ----
// 25+ citizens across all 6 districts with realistic variation

const DEMO_CITIZENS_SEED: Omit<Citizen, '_internalId' | 'citizenId'>[] = [
  // ---- NEXUS / SECURITY ----
  {
    username: 'elena_rostova',
    displayName: 'Commander Elena Rostova',
    avatarUrl: null,
    astronautType: 'commander',
    suitColor: '#ffffff',
    bio: 'Former ESA flight director with 12 years of deep space logistics experience. Led the original Artemis Base construction expedition.',
    department: 'SECURITY',
    profession: 'EVA Commander',
    rank: 'Colony Council',
    districtId: 'NEXUS',
    buildingId: 'nexus-core',
    location: { x: 4, y: 0, z: 6, rotationY: 0.4, districtId: 'NEXUS', buildingId: 'nexus-core' },
    currentActivity: 'Conducting orbital transit clearance with Artemis Gateway',
    status: 'ON DUTY',
    joinedAt: '2026-01-01T00:00:00Z',
    xp: 4800,
    level: 48,
    colonyCredits: 12000,
    achievements: [
      makeAchievement('FIRST_ARRIVAL', '2026-01-01T00:00:00Z'),
      makeAchievement('FOUNDING_100', '2026-01-01T00:00:00Z'),
      makeAchievement('MASTER_EVA', '2026-02-01T00:00:00Z'),
      makeAchievement('CIVIC_LEADER', '2026-03-01T00:00:00Z'),
    ],
    isFoundingCitizen: true,
    contributionStats: { missionsCompleted: 42, structuresContributed: 8, totalContribution: 980, evaSessions: 95, discoveryCount: 12 },
  },
  {
    username: 'kaito_net',
    displayName: 'Kaito Tanaka',
    avatarUrl: null,
    astronautType: 'technician',
    suitColor: '#e0e7ff',
    bio: 'Pioneer of low-latency quantum relay nodes. Designed the colony mesh protocol connecting all six districts without radio deadzones.',
    department: 'COMMUNICATIONS',
    profession: 'Network Architect',
    rank: 'Department Lead',
    districtId: 'NEXUS',
    buildingId: 'nexus-transit-hub',
    location: { x: -10, y: 0, z: 8, rotationY: 1.8, districtId: 'NEXUS', buildingId: 'nexus-transit-hub' },
    currentActivity: 'Calibrating quantum entanglement repeater at Central Spine',
    status: 'ACTIVE',
    joinedAt: '2026-05-01T00:00:00Z',
    xp: 2400,
    level: 24,
    colonyCredits: 5500,
    achievements: [
      makeAchievement('FOUNDING_100', '2026-05-01T00:00:00Z'),
      makeAchievement('COLONY_BUILDER', '2026-06-01T00:00:00Z'),
    ],
    isFoundingCitizen: true,
    contributionStats: { missionsCompleted: 18, structuresContributed: 3, totalContribution: 460, evaSessions: 22, discoveryCount: 4 },
  },
  {
    username: 'soraya_atmos',
    displayName: 'Dr. Soraya Mir',
    avatarUrl: null,
    astronautType: 'scientist',
    suitColor: '#dcfce7',
    bio: 'Specializes in supercritical gas separation. Developed the nitrogen recovery loop that achieved 99.98% colony atmospheric retention.',
    department: 'ENGINEERING',
    profession: 'Systems Engineer',
    rank: 'Senior Specialist',
    districtId: 'NEXUS',
    buildingId: 'nexus-atmos-dome',
    location: { x: 14, y: 0, z: -8, rotationY: -0.8, districtId: 'NEXUS', buildingId: 'nexus-atmos-dome' },
    currentActivity: 'Inspecting catalytic scrub valves on primary gas intake manifold',
    status: 'ACTIVE',
    joinedAt: '2026-04-08T00:00:00Z',
    xp: 1860,
    level: 18,
    colonyCredits: 3800,
    achievements: [
      makeAchievement('FOUNDING_100', '2026-04-08T00:00:00Z'),
      makeAchievement('COLONY_BUILDER', '2026-05-01T00:00:00Z'),
    ],
    isFoundingCitizen: true,
    contributionStats: { missionsCompleted: 14, structuresContributed: 2, totalContribution: 310, evaSessions: 30, discoveryCount: 2 },
  },
  {
    username: 'jax_scout',
    displayName: 'Jaxson Pierce',
    avatarUrl: null,
    astronautType: 'commander',
    suitColor: '#f1f5f9',
    bio: 'Has logged over 3,000 EVA hours on the lunar surface. First person to descend into the interior rim of Shackleton Crater on foot.',
    department: 'SECURITY',
    profession: 'EVA Commander',
    rank: 'Senior Specialist',
    districtId: 'NEXUS',
    buildingId: 'nexus-core',
    location: { x: -38, y: 0, z: 22, rotationY: 0.7, districtId: 'NEXUS', buildingId: 'nexus-core' },
    currentActivity: 'Traversing connecting corridor to check seal pressure sensors',
    status: 'ACTIVE',
    joinedAt: '2026-03-16T00:00:00Z',
    xp: 3100,
    level: 31,
    colonyCredits: 7200,
    achievements: [
      makeAchievement('FOUNDING_100', '2026-03-16T00:00:00Z'),
      makeAchievement('MASTER_EVA', '2026-06-01T00:00:00Z'),
      makeAchievement('EXPLORER', '2026-04-01T00:00:00Z'),
    ],
    isFoundingCitizen: true,
    contributionStats: { missionsCompleted: 55, structuresContributed: 1, totalContribution: 740, evaSessions: 210, discoveryCount: 8 },
  },

  // ---- FORGE / ENGINEERING ----
  {
    username: 'vance_forge',
    displayName: 'Marcus Vance',
    avatarUrl: null,
    astronautType: 'engineer',
    suitColor: '#fed7aa',
    bio: 'Veteran industrial engineer from Rio Tinto lunar extraction consortium. Mastered the process of pulling structural titanium from lunar basalt.',
    department: 'ENGINEERING',
    profession: 'Structural Engineer',
    rank: 'Department Lead',
    districtId: 'FORGE',
    buildingId: 'forge-smelter-alpha',
    location: { x: -80, y: 0, z: 48, rotationY: 2.3, districtId: 'FORGE', buildingId: 'forge-smelter-alpha' },
    currentActivity: 'Supervising high-arc regolith plasma sintering cycle 84',
    status: 'ON DUTY',
    joinedAt: '2026-01-25T00:00:00Z',
    xp: 3650,
    level: 36,
    colonyCredits: 9100,
    achievements: [
      makeAchievement('FOUNDING_100', '2026-01-25T00:00:00Z'),
      makeAchievement('COLONY_BUILDER', '2026-02-15T00:00:00Z'),
      makeAchievement('VETERAN', '2026-04-01T00:00:00Z'),
    ],
    isFoundingCitizen: true,
    contributionStats: { missionsCompleted: 28, structuresContributed: 12, totalContribution: 820, evaSessions: 60, discoveryCount: 3 },
  },
  {
    username: 'nia_tokamak',
    displayName: 'Nia Okonjo',
    avatarUrl: null,
    astronautType: 'engineer',
    suitColor: '#ffedd5',
    bio: 'MIT Plasma Science fellow. Engineered the triple-redundant magnetic quench protection that protects the colony from fusion disruptions.',
    department: 'ENGINEERING',
    profession: 'Energy Specialist',
    rank: 'Senior Specialist',
    districtId: 'FORGE',
    buildingId: 'forge-fusion-reactor',
    location: { x: -98, y: 0, z: 32, rotationY: -1.2, districtId: 'FORGE', buildingId: 'forge-fusion-reactor' },
    currentActivity: 'Monitoring magnetic toroidal field containment parameters',
    status: 'RESEARCHING',
    joinedAt: '2026-04-20T00:00:00Z',
    xp: 2100,
    level: 21,
    colonyCredits: 4600,
    achievements: [
      makeAchievement('FOUNDING_100', '2026-04-20T00:00:00Z'),
      makeAchievement('FUSION_SPECIALIST', '2026-06-01T00:00:00Z'),
    ],
    isFoundingCitizen: true,
    contributionStats: { missionsCompleted: 10, structuresContributed: 4, totalContribution: 390, evaSessions: 15, discoveryCount: 1 },
  },
  {
    username: 'viktor_rover',
    displayName: 'Viktor Lindqvist',
    avatarUrl: null,
    astronautType: 'technician',
    suitColor: '#fef08a',
    bio: 'Certified heavy roboticist. Kept 100% of autonomous colony rovers operational through three continuous lunar nights.',
    department: 'ENGINEERING',
    profession: 'Robotics Technician',
    rank: 'Specialist',
    districtId: 'FORGE',
    buildingId: 'forge-assembly-hangar',
    location: { x: -66, y: 0, z: 62, rotationY: 0.9, districtId: 'FORGE', buildingId: 'forge-assembly-hangar' },
    currentActivity: 'Replacing titanium wheel hub on heavy hauler Rover-03',
    status: 'MAINTENANCE',
    joinedAt: '2026-08-04T00:00:00Z',
    xp: 870,
    level: 8,
    colonyCredits: 1900,
    achievements: [
      makeAchievement('COLONY_BUILDER', '2026-09-01T00:00:00Z'),
    ],
    isFoundingCitizen: false,
    contributionStats: { missionsCompleted: 6, structuresContributed: 1, totalContribution: 150, evaSessions: 24, discoveryCount: 0 },
  },
  {
    username: 'ryo_constructs',
    displayName: 'Ryo Hashimoto',
    avatarUrl: null,
    astronautType: 'engineer',
    suitColor: '#fca5a5',
    bio: 'Structural engineer who designed the reinforced regolith berms protecting Haven district from solar storm particle flux.',
    department: 'ENGINEERING',
    profession: 'Construction Engineer',
    rank: 'Specialist',
    districtId: 'FORGE',
    buildingId: 'forge-assembly-hangar',
    location: { x: -72, y: 0, z: 70, rotationY: 1.4, districtId: 'FORGE', buildingId: 'forge-assembly-hangar' },
    currentActivity: 'Reviewing stress simulations for expanded habitat module truss',
    status: 'ACTIVE',
    joinedAt: '2026-09-11T00:00:00Z',
    xp: 540,
    level: 5,
    colonyCredits: 1200,
    achievements: [],
    isFoundingCitizen: false,
    contributionStats: { missionsCompleted: 3, structuresContributed: 2, totalContribution: 95, evaSessions: 8, discoveryCount: 0 },
  },

  // ---- EDEN / BIOSCIENCE ----
  {
    username: 'li_biosphere',
    displayName: 'Dr. Li Wei',
    avatarUrl: null,
    astronautType: 'scientist',
    suitColor: '#bbf7d0',
    bio: 'Engineered synthetic mycorrhizal fungi capable of breaking down lunar regolith to feed terrestrial root systems.',
    department: 'BIOSCIENCE',
    profession: 'Biologist',
    rank: 'Department Lead',
    districtId: 'EDEN',
    buildingId: 'eden-biodome-main',
    location: { x: 70, y: 0, z: -15, rotationY: 3.0, districtId: 'EDEN', buildingId: 'eden-biodome-main' },
    currentActivity: 'Checking genetic cultivars of drought-resistant lunar wheat in Dome Alpha',
    status: 'ACTIVE',
    joinedAt: '2026-01-19T00:00:00Z',
    xp: 2960,
    level: 29,
    colonyCredits: 7400,
    achievements: [
      makeAchievement('FOUNDING_100', '2026-01-19T00:00:00Z'),
      makeAchievement('GREEN_PIONEER', '2026-03-01T00:00:00Z'),
      makeAchievement('SCIENTIST', '2026-04-01T00:00:00Z'),
    ],
    isFoundingCitizen: true,
    contributionStats: { missionsCompleted: 20, structuresContributed: 2, totalContribution: 580, evaSessions: 18, discoveryCount: 7 },
  },
  {
    username: 'amina_algae',
    displayName: 'Amina Al-Mansoor',
    avatarUrl: null,
    astronautType: 'scientist',
    suitColor: '#a7f3d0',
    bio: 'Optimized high-yield micro-algae that supplies 40% of the colony nutritional protein and 60% of regenerative oxygen.',
    department: 'BIOSCIENCE',
    profession: 'Agricultural Specialist',
    rank: 'Specialist',
    districtId: 'EDEN',
    buildingId: 'eden-hydroponics-west',
    location: { x: 88, y: 0, z: -32, rotationY: -2.1, districtId: 'EDEN', buildingId: 'eden-hydroponics-west' },
    currentActivity: 'Sampling spirulina protein density in vertical column array',
    status: 'RESEARCHING',
    joinedAt: '2026-06-30T00:00:00Z',
    xp: 1420,
    level: 14,
    colonyCredits: 2900,
    achievements: [
      makeAchievement('SCIENTIST', '2026-08-01T00:00:00Z'),
    ],
    isFoundingCitizen: false,
    contributionStats: { missionsCompleted: 9, structuresContributed: 0, totalContribution: 240, evaSessions: 5, discoveryCount: 2 },
  },
  {
    username: 'mateo_vaults',
    displayName: 'Mateo Rossi',
    avatarUrl: null,
    astronautType: 'scientist',
    suitColor: '#99f6e4',
    bio: 'Curates humanity\'s off-world planetary biodiversity backup. Responsible for over 2 million seeds preserved at -196°C.',
    department: 'BIOSCIENCE',
    profession: 'Cryo-Preservation Geneticist',
    rank: 'Specialist',
    districtId: 'EDEN',
    buildingId: 'eden-seed-vault',
    location: { x: 66, y: 0, z: -38, rotationY: 0.1, districtId: 'EDEN', buildingId: 'eden-seed-vault' },
    currentActivity: 'Verifying liquid nitrogen equilibrium inside Subterranean Vault C',
    status: 'ACTIVE',
    joinedAt: '2026-08-29T00:00:00Z',
    xp: 710,
    level: 7,
    colonyCredits: 1600,
    achievements: [],
    isFoundingCitizen: false,
    contributionStats: { missionsCompleted: 4, structuresContributed: 1, totalContribution: 110, evaSessions: 6, discoveryCount: 1 },
  },
  {
    username: 'priya_life',
    displayName: 'Dr. Priya Nair',
    avatarUrl: null,
    astronautType: 'medic',
    suitColor: '#d1fae5',
    bio: 'Life support specialist who engineered the emergency atmospheric recycling protocol that saved 40 colonists during a dome breach.',
    department: 'BIOSCIENCE',
    profession: 'Life Support Specialist',
    rank: 'Senior Specialist',
    districtId: 'EDEN',
    buildingId: 'eden-biodome-main',
    location: { x: 76, y: 0, z: -8, rotationY: -1.5, districtId: 'EDEN', buildingId: 'eden-biodome-main' },
    currentActivity: 'Testing CO2 scrubber backup units before next crew rotation',
    status: 'ACTIVE',
    joinedAt: '2026-05-15T00:00:00Z',
    xp: 1820,
    level: 18,
    colonyCredits: 3900,
    achievements: [
      makeAchievement('LIFE_SAVER', '2026-07-01T00:00:00Z'),
      makeAchievement('SCIENTIST', '2026-06-01T00:00:00Z'),
    ],
    isFoundingCitizen: true,
    contributionStats: { missionsCompleted: 15, structuresContributed: 0, totalContribution: 320, evaSessions: 10, discoveryCount: 3 },
  },

  // ---- AETHER / RESEARCH ----
  {
    username: 'aris_stars',
    displayName: 'Dr. Aris Thorne',
    avatarUrl: null,
    astronautType: 'scientist',
    suitColor: '#e9d5ff',
    bio: 'Chief scientist behind the 16m far-side optical telescope. Published the first direct imaging of an exoplanetary weather system.',
    department: 'RESEARCH',
    profession: 'Astronomer',
    rank: 'Department Lead',
    districtId: 'AETHER',
    buildingId: 'aether-optics-dome',
    location: { x: 46, y: 0, z: -80, rotationY: 1.5, districtId: 'AETHER', buildingId: 'aether-optics-dome' },
    currentActivity: 'Reviewing spectroscopic atmosphere data from Trappist-1e',
    status: 'ON DUTY',
    joinedAt: '2026-02-14T00:00:00Z',
    xp: 3240,
    level: 32,
    colonyCredits: 8600,
    achievements: [
      makeAchievement('FOUNDING_100', '2026-02-14T00:00:00Z'),
      makeAchievement('SCIENTIST', '2026-03-01T00:00:00Z'),
      makeAchievement('PIONEER', '2026-04-01T00:00:00Z'),
    ],
    isFoundingCitizen: true,
    contributionStats: { missionsCompleted: 22, structuresContributed: 1, totalContribution: 640, evaSessions: 12, discoveryCount: 15 },
  },
  {
    username: 'meera_qubits',
    displayName: 'Dr. Meera Patel',
    avatarUrl: null,
    astronautType: 'scientist',
    suitColor: '#f3e8ff',
    bio: 'Developed the vacuum-isolated superconducting qubit harness that reduced quantum decoherence to near-zero.',
    department: 'RESEARCH',
    profession: 'Quantum Engineer',
    rank: 'Senior Specialist',
    districtId: 'AETHER',
    buildingId: 'aether-quantum-lab',
    location: { x: 36, y: 0, z: -92, rotationY: -0.5, districtId: 'AETHER', buildingId: 'aether-quantum-lab' },
    currentActivity: 'Fine-tuning dilution refrigerator magnetic shielding at 14 millikelvin',
    status: 'RESEARCHING',
    joinedAt: '2026-05-10T00:00:00Z',
    xp: 1950,
    level: 19,
    colonyCredits: 4200,
    achievements: [
      makeAchievement('SCIENTIST', '2026-07-01T00:00:00Z'),
    ],
    isFoundingCitizen: true,
    contributionStats: { missionsCompleted: 11, structuresContributed: 0, totalContribution: 350, evaSessions: 7, discoveryCount: 5 },
  },
  {
    username: 'tomas_geo',
    displayName: 'Tomas Novak',
    avatarUrl: null,
    astronautType: 'scientist',
    suitColor: '#fae8ff',
    bio: 'Identified three deep subsurface lava tube caverns now slated for Phase 2 colony expansion.',
    department: 'RESEARCH',
    profession: 'Lunar Geologist',
    rank: 'Specialist',
    districtId: 'AETHER',
    buildingId: 'aether-seismic-post',
    location: { x: 64, y: 0, z: -78, rotationY: 2.7, districtId: 'AETHER', buildingId: 'aether-seismic-post' },
    currentActivity: 'Analyzing tidal stress data along Shackleton crater fault line',
    status: 'ACTIVE',
    joinedAt: '2026-11-05T00:00:00Z',
    xp: 420,
    level: 4,
    colonyCredits: 900,
    achievements: [
      makeAchievement('EXPLORER', '2026-11-10T00:00:00Z'),
    ],
    isFoundingCitizen: false,
    contributionStats: { missionsCompleted: 3, structuresContributed: 0, totalContribution: 65, evaSessions: 15, discoveryCount: 3 },
  },
  {
    username: 'ife_analyst',
    displayName: 'Ifeanyi Obi',
    avatarUrl: null,
    astronautType: 'scientist',
    suitColor: '#e0e7ff',
    bio: 'Research analyst cataloguing mineral composition of regolith cores drilled at the Shackleton rim.',
    department: 'RESEARCH',
    profession: 'Research Analyst',
    rank: 'Citizen',
    districtId: 'AETHER',
    buildingId: 'aether-quantum-lab',
    location: { x: 28, y: 0, z: -100, rotationY: 2.0, districtId: 'AETHER', buildingId: 'aether-quantum-lab' },
    currentActivity: 'Cataloguing mineral spectrometry data from drill core batch 17',
    status: 'ACTIVE',
    joinedAt: '2026-10-22T00:00:00Z',
    xp: 190,
    level: 1,
    colonyCredits: 400,
    achievements: [],
    isFoundingCitizen: false,
    contributionStats: { missionsCompleted: 1, structuresContributed: 0, totalContribution: 20, evaSessions: 2, discoveryCount: 1 },
  },

  // ---- BEACON / COMMUNICATIONS ----
  {
    username: 'sarah_relay',
    displayName: 'Commander Sarah Jenkins',
    avatarUrl: null,
    astronautType: 'commander',
    suitColor: '#bfdbfe',
    bio: 'Former NASA Deep Space Network flight controller. Has maintained uninterrupted Earth-Moon contact for 1,200 consecutive sols.',
    department: 'COMMUNICATIONS',
    profession: 'Earth Relay Specialist',
    rank: 'Department Lead',
    districtId: 'BEACON',
    buildingId: 'beacon-main-dish',
    location: { x: -66, y: 0, z: -70, rotationY: 0.8, districtId: 'BEACON', buildingId: 'beacon-main-dish' },
    currentActivity: 'Directing continuous laser tracking uplink to Goldstone Deep Space Network',
    status: 'ON DUTY',
    joinedAt: '2026-01-09T00:00:00Z',
    xp: 4200,
    level: 42,
    colonyCredits: 10800,
    achievements: [
      makeAchievement('FIRST_ARRIVAL', '2026-01-09T00:00:00Z'),
      makeAchievement('FOUNDING_100', '2026-01-09T00:00:00Z'),
      makeAchievement('EARTH_TETHER', '2026-07-01T00:00:00Z'),
      makeAchievement('VETERAN', '2026-04-01T00:00:00Z'),
    ],
    isFoundingCitizen: true,
    contributionStats: { missionsCompleted: 38, structuresContributed: 5, totalContribution: 900, evaSessions: 48, discoveryCount: 6 },
  },
  {
    username: 'zane_photon',
    displayName: 'Zane Gallagher',
    avatarUrl: null,
    astronautType: 'technician',
    suitColor: '#dbeafe',
    bio: 'Holds the solar system record for coherent optical data transmission bandwidth (120 Gbps over 384,000 km).',
    department: 'COMMUNICATIONS',
    profession: 'Transmission Officer',
    rank: 'Specialist',
    districtId: 'BEACON',
    buildingId: 'beacon-laser-tower',
    location: { x: -82, y: 0, z: -58, rotationY: -1.7, districtId: 'BEACON', buildingId: 'beacon-laser-tower' },
    currentActivity: 'Aligning piezo fast-steering mirrors on orbital Gateway downlink',
    status: 'ACTIVE',
    joinedAt: '2026-07-14T00:00:00Z',
    xp: 1050,
    level: 10,
    colonyCredits: 2300,
    achievements: [],
    isFoundingCitizen: false,
    contributionStats: { missionsCompleted: 7, structuresContributed: 1, totalContribution: 185, evaSessions: 14, discoveryCount: 1 },
  },
  {
    username: 'fatima_nav',
    displayName: 'Fatima Zahra',
    avatarUrl: null,
    astronautType: 'technician',
    suitColor: '#eff6ff',
    bio: 'Maintains the Lunar Constellation Navigation Grid that gives every rover and EVA astronaut sub-decimeter positioning.',
    department: 'COMMUNICATIONS',
    profession: 'Navigation Engineer',
    rank: 'Specialist',
    districtId: 'BEACON',
    buildingId: 'beacon-telecom-relay',
    location: { x: -50, y: 0, z: -84, rotationY: 1.1, districtId: 'BEACON', buildingId: 'beacon-telecom-relay' },
    currentActivity: 'Recalibrating surface microwave beacon synchronizer',
    status: 'MAINTENANCE',
    joinedAt: '2026-09-19T00:00:00Z',
    xp: 650,
    level: 6,
    colonyCredits: 1400,
    achievements: [],
    isFoundingCitizen: false,
    contributionStats: { missionsCompleted: 4, structuresContributed: 0, totalContribution: 100, evaSessions: 10, discoveryCount: 0 },
  },
  {
    username: 'olga_comms',
    displayName: 'Olga Vasilieva',
    avatarUrl: null,
    astronautType: 'technician',
    suitColor: '#c7d2fe',
    bio: 'Communications operator specializing in solar-event adaptive frequency management for interference-free Earth relay.',
    department: 'COMMUNICATIONS',
    profession: 'Communications Operator',
    rank: 'Citizen',
    districtId: 'BEACON',
    buildingId: 'beacon-telecom-relay',
    location: { x: -58, y: 0, z: -92, rotationY: -0.3, districtId: 'BEACON', buildingId: 'beacon-telecom-relay' },
    currentActivity: 'Routing emergency telemetry packets around solar plasma interference',
    status: 'ACTIVE',
    joinedAt: '2026-10-30T00:00:00Z',
    xp: 230,
    level: 2,
    colonyCredits: 500,
    achievements: [],
    isFoundingCitizen: false,
    contributionStats: { missionsCompleted: 1, structuresContributed: 0, totalContribution: 30, evaSessions: 3, discoveryCount: 0 },
  },

  // ---- HAVEN / CULTURE ----
  {
    username: 'lucas_haven',
    displayName: 'Dr. Lucas Morales',
    avatarUrl: null,
    astronautType: 'civilian',
    suitColor: '#fef9c3',
    bio: 'Architect of the Haven living rings, famous for incorporating simulated natural daylight curves to eliminate seasonal depression.',
    department: 'CULTURE',
    profession: 'Habitat Architect',
    rank: 'Department Lead',
    districtId: 'HAVEN',
    buildingId: 'haven-hab-ring-a',
    location: { x: 32, y: 0, z: 74, rotationY: -0.4, districtId: 'HAVEN', buildingId: 'haven-hab-ring-a' },
    currentActivity: 'Reviewing modular expansion blueprints for Residential Ring Gamma',
    status: 'ACTIVE',
    joinedAt: '2026-02-19T00:00:00Z',
    xp: 2600,
    level: 26,
    colonyCredits: 6500,
    achievements: [
      makeAchievement('FOUNDING_100', '2026-02-19T00:00:00Z'),
      makeAchievement('CIVIC_LEADER', '2026-04-01T00:00:00Z'),
      makeAchievement('COLONY_BUILDER', '2026-03-01T00:00:00Z'),
    ],
    isFoundingCitizen: true,
    contributionStats: { missionsCompleted: 16, structuresContributed: 7, totalContribution: 540, evaSessions: 20, discoveryCount: 2 },
  },
  {
    username: 'ananya_meds',
    displayName: 'Dr. Ananya Sharma',
    avatarUrl: null,
    astronautType: 'medic',
    suitColor: '#fef08a',
    bio: 'Specializes in low-gravity pharmacology and bone density maintenance protocols for multi-year lunar residents.',
    department: 'CULTURE',
    profession: 'Medical Officer',
    rank: 'Senior Specialist',
    districtId: 'HAVEN',
    buildingId: 'haven-medical-center',
    location: { x: 22, y: 0, z: 65, rotationY: 1.9, districtId: 'HAVEN', buildingId: 'haven-medical-center' },
    currentActivity: 'Monitoring astronaut cardiovascular adaptation in 1/6th gravity',
    status: 'ON DUTY',
    joinedAt: '2026-02-02T00:00:00Z',
    xp: 2850,
    level: 28,
    colonyCredits: 7000,
    achievements: [
      makeAchievement('FOUNDING_100', '2026-02-02T00:00:00Z'),
      makeAchievement('LIFE_SAVER', '2026-05-01T00:00:00Z'),
    ],
    isFoundingCitizen: true,
    contributionStats: { missionsCompleted: 20, structuresContributed: 0, totalContribution: 490, evaSessions: 8, discoveryCount: 0 },
  },
  {
    username: 'gabriel_lore',
    displayName: 'Gabriel Santos',
    avatarUrl: null,
    astronautType: 'civilian',
    suitColor: '#fefce8',
    bio: 'Curates the colony time capsule and oversees the Agora civic commons where lunar music and literature are cultivated.',
    department: 'CULTURE',
    profession: 'Colony Historian',
    rank: 'Specialist',
    districtId: 'HAVEN',
    buildingId: 'haven-civic-center',
    location: { x: 48, y: 0, z: 88, rotationY: -2.4, districtId: 'HAVEN', buildingId: 'haven-civic-center' },
    currentActivity: 'Recording oral history archives of the first 1,000 lunar births',
    status: 'OFF-DUTY',
    joinedAt: '2026-06-24T00:00:00Z',
    xp: 1180,
    level: 11,
    colonyCredits: 2600,
    achievements: [],
    isFoundingCitizen: false,
    contributionStats: { missionsCompleted: 8, structuresContributed: 0, totalContribution: 195, evaSessions: 2, discoveryCount: 1 },
  },
  {
    username: 'yuki_inspect',
    displayName: 'Yuki Takahashi',
    avatarUrl: null,
    astronautType: 'technician',
    suitColor: '#f1f5f9',
    bio: 'Inspects thousands of meters of pressurized inter-district corridors against micrometeorite impacts and thermal expansion.',
    department: 'ENGINEERING',
    profession: 'Systems Engineer',
    rank: 'Specialist',
    districtId: 'HAVEN',
    buildingId: 'haven-hab-ring-a',
    location: { x: 18, y: 0, z: 42, rotationY: 2.1, districtId: 'HAVEN', buildingId: 'haven-hab-ring-a' },
    currentActivity: 'Ultrasonic testing of pressurized transit tube expansion joints',
    status: 'ACTIVE',
    joinedAt: '2026-05-20T00:00:00Z',
    xp: 1340,
    level: 13,
    colonyCredits: 2800,
    achievements: [],
    isFoundingCitizen: true,
    contributionStats: { missionsCompleted: 10, structuresContributed: 3, totalContribution: 240, evaSessions: 32, discoveryCount: 0 },
  },
  {
    username: 'ceri_care',
    displayName: 'Ceri Morgan',
    avatarUrl: null,
    astronautType: 'civilian',
    suitColor: '#fce7f3',
    bio: 'Community coordinator running the colony\'s mental wellness program and social cohesion initiatives for long-duration crews.',
    department: 'CULTURE',
    profession: 'Community Coordinator',
    rank: 'Citizen',
    districtId: 'HAVEN',
    buildingId: 'haven-civic-center',
    location: { x: 52, y: 0, z: 92, rotationY: 1.2, districtId: 'HAVEN', buildingId: 'haven-civic-center' },
    currentActivity: 'Facilitating weekly "Earth-view" mindfulness session at the Agora',
    status: 'ACTIVE',
    joinedAt: '2026-10-05T00:00:00Z',
    xp: 310,
    level: 3,
    colonyCredits: 700,
    achievements: [],
    isFoundingCitizen: false,
    contributionStats: { missionsCompleted: 2, structuresContributed: 0, totalContribution: 40, evaSessions: 1, discoveryCount: 0 },
  },
  // Additional Nexus security officer
  {
    username: 'dmitri_guard',
    displayName: 'Dmitri Volkov',
    avatarUrl: null,
    astronautType: 'commander',
    suitColor: '#e2e8f0',
    bio: 'Colony security officer specializing in EVA corridor patrol and pressurized airlock emergency response procedures.',
    department: 'SECURITY',
    profession: 'Security Officer',
    rank: 'Specialist',
    districtId: 'NEXUS',
    buildingId: 'nexus-transit-hub',
    location: { x: -18, y: 0, z: 20, rotationY: 2.1, districtId: 'NEXUS', buildingId: 'nexus-transit-hub' },
    currentActivity: 'Conducting access control audit on Transit Hub Bay 04',
    status: 'ON DUTY',
    joinedAt: '2026-07-01T00:00:00Z',
    xp: 870,
    level: 8,
    colonyCredits: 2000,
    achievements: [],
    isFoundingCitizen: false,
    contributionStats: { missionsCompleted: 6, structuresContributed: 0, totalContribution: 130, evaSessions: 20, discoveryCount: 0 },
  },
  // Additional Haven medical
  {
    username: 'femi_heals',
    displayName: 'Femi Adeyemi',
    avatarUrl: null,
    astronautType: 'medic',
    suitColor: '#ecfdf5',
    bio: 'Emergency medicine physician specializing in acute hypoxia response in compromised pressurization scenarios.',
    department: 'CULTURE',
    profession: 'Medical Officer',
    rank: 'Citizen',
    districtId: 'HAVEN',
    buildingId: 'haven-medical-center',
    location: { x: 18, y: 0, z: 58, rotationY: -1.0, districtId: 'HAVEN', buildingId: 'haven-medical-center' },
    currentActivity: 'Running hypoxia response drill simulation with crew rotation team',
    status: 'ACTIVE',
    joinedAt: '2026-09-28T00:00:00Z',
    xp: 390,
    level: 3,
    colonyCredits: 850,
    achievements: [],
    isFoundingCitizen: false,
    contributionStats: { missionsCompleted: 2, structuresContributed: 0, totalContribution: 55, evaSessions: 3, discoveryCount: 0 },
  },
  // Additional Forge Energy
  {
    username: 'petra_grid',
    displayName: 'Petra Hoffmann',
    avatarUrl: null,
    astronautType: 'engineer',
    suitColor: '#fef3c7',
    bio: 'Energy grid specialist managing power distribution and load balancing across all six colony districts.',
    department: 'ENGINEERING',
    profession: 'Energy Specialist',
    rank: 'Specialist',
    districtId: 'FORGE',
    buildingId: 'forge-smelter-alpha',
    location: { x: -88, y: 0, z: 55, rotationY: 1.6, districtId: 'FORGE', buildingId: 'forge-smelter-alpha' },
    currentActivity: 'Balancing reactive power load between Tokamak and solar array feeds',
    status: 'ACTIVE',
    joinedAt: '2026-08-15T00:00:00Z',
    xp: 720,
    level: 7,
    colonyCredits: 1600,
    achievements: [],
    isFoundingCitizen: false,
    contributionStats: { missionsCompleted: 5, structuresContributed: 1, totalContribution: 120, evaSessions: 8, discoveryCount: 0 },
  },
  // Forge exploration
  {
    username: 'alex_explore',
    displayName: 'Alex Kuznetsov',
    avatarUrl: null,
    astronautType: 'engineer',
    suitColor: '#fde68a',
    bio: 'Exploration specialist who pioneered the regolith resource survey methodology for the Shackleton basin mining expansion.',
    department: 'RESEARCH',
    profession: 'Exploration Specialist',
    rank: 'Citizen',
    districtId: 'AETHER',
    buildingId: 'aether-optics-dome',
    location: { x: 52, y: 0, z: -88, rotationY: 0.9, districtId: 'AETHER', buildingId: 'aether-optics-dome' },
    currentActivity: 'Planning next-cycle crater floor survey route with rover AI',
    status: 'ACTIVE',
    joinedAt: '2026-10-11T00:00:00Z',
    xp: 290,
    level: 2,
    colonyCredits: 620,
    achievements: [
      makeAchievement('EXPLORER', '2026-10-20T00:00:00Z'),
    ],
    isFoundingCitizen: false,
    contributionStats: { missionsCompleted: 2, structuresContributed: 0, totalContribution: 45, evaSessions: 12, discoveryCount: 2 },
  },
  // Additional Eden ecosystem
  {
    username: 'hana_eco',
    displayName: 'Hana Kimura',
    avatarUrl: null,
    astronautType: 'scientist',
    suitColor: '#d1fae5',
    bio: 'Ecosystem researcher studying the long-term viability of closed biospheres for multi-generational lunar habitation.',
    department: 'BIOSCIENCE',
    profession: 'Ecosystem Researcher',
    rank: 'Citizen',
    districtId: 'EDEN',
    buildingId: 'eden-hydroponics-west',
    location: { x: 94, y: 0, z: -42, rotationY: 2.6, districtId: 'EDEN', buildingId: 'eden-hydroponics-west' },
    currentActivity: 'Measuring photosynthetic efficiency in row 12 of the spiral towers',
    status: 'ACTIVE',
    joinedAt: '2026-10-18T00:00:00Z',
    xp: 180,
    level: 1,
    colonyCredits: 380,
    achievements: [],
    isFoundingCitizen: false,
    contributionStats: { missionsCompleted: 1, structuresContributed: 0, totalContribution: 25, evaSessions: 2, discoveryCount: 0 },
  },
];

// ---- Citizen Store ----

function loadSequence(): number {
  try {
    const raw = localStorage.getItem(SEQUENCE_KEY);
    return raw ? parseInt(raw, 10) : 0;
  } catch {
    return 0;
  }
}

function saveSequence(seq: number) {
  try {
    localStorage.setItem(SEQUENCE_KEY, String(seq));
  } catch {}
}

function loadCitizens(): Citizen[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as Citizen[];
  } catch {
    return [];
  }
}

function saveCitizens(citizens: Citizen[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(citizens));
  } catch {}
}

function seedDemoCitizens(existingCitizens: Citizen[], startSeq: number): [Citizen[], number] {
  const seeded: Citizen[] = [...existingCitizens];
  let seq = startSeq;

  for (const seed of DEMO_CITIZENS_SEED) {
    const alreadyExists = seeded.some(
      (c) => c.username === seed.username || c.displayName === seed.displayName
    );
    if (alreadyExists) continue;

    seq += 1;
    const citizen: Citizen = {
      _internalId: generateInternalId(),
      citizenId: generateCitizenId(seq),
      ...seed,
    };
    seeded.push(citizen);
  }

  return [seeded, seq];
}

// ============================================================
// Citizen Service (Singleton Store)
// ============================================================

class CitizenService {
  private citizens: Citizen[] = [];
  private sequenceCounter: number = 0;
  private initialized = false;
  private listeners: Set<() => void> = new Set();

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.listeners.forEach((listener) => {
      try {
        listener();
      } catch (err) {
        console.error('Error in CitizenService listener:', err);
      }
    });
  }

  initialize() {
    if (this.initialized) return;
    this.initialized = true;

    this.sequenceCounter = loadSequence();
    let stored = loadCitizens();

    // Seed demo citizens if none exist or if demo data is missing
    const [seeded, newSeq] = seedDemoCitizens(stored, this.sequenceCounter);
    if (seeded.length !== stored.length || newSeq !== this.sequenceCounter) {
      this.citizens = seeded;
      this.sequenceCounter = newSeq;
      saveCitizens(this.citizens);
      saveSequence(this.sequenceCounter);
    } else {
      this.citizens = stored;
    }
  }

  getAll(): Citizen[] {
    this.initialize();
    return this.citizens;
  }

  getById(citizenId: string): Citizen | undefined {
    this.initialize();
    return this.citizens.find((c) => c.citizenId === citizenId);
  }

  getByUsername(username: string): Citizen | undefined {
    this.initialize();
    return this.citizens.find(
      (c) => c.username.toLowerCase() === username.toLowerCase()
    );
  }

  getByBuildingId(buildingId: string): Citizen[] {
    this.initialize();
    return this.citizens.filter((c) => c.buildingId === buildingId);
  }

  getByDistrict(districtId: DistrictId): Citizen[] {
    this.initialize();
    return this.citizens.filter((c) => c.districtId === districtId);
  }

  search(query: string): Citizen[] {
    this.initialize();
    const q = query.toLowerCase().trim();
    if (!q) return this.citizens;
    return this.citizens.filter(
      (c) =>
        c.citizenId.toLowerCase().includes(q) ||
        c.username.toLowerCase().includes(q) ||
        c.displayName.toLowerCase().includes(q) ||
        c.profession.toLowerCase().includes(q) ||
        c.department.toLowerCase().includes(q) ||
        c.districtId.toLowerCase().includes(q)
    );
  }

  isUsernameTaken(username: string, excludeId?: string): boolean {
    this.initialize();
    return this.citizens.some(
      (c) =>
        c.username.toLowerCase() === username.toLowerCase() &&
        c.citizenId !== excludeId
    );
  }

  register(data: {
    username: string;
    displayName: string;
    bio: string;
    department: DepartmentId;
    profession: string;
    astronautType: AstronautType;
    suitColor: string;
  }): Citizen {
    this.initialize();

    if (this.isUsernameTaken(data.username)) {
      throw new Error(`Username "${data.username}" is already taken.`);
    }

    const district = getDistrictForDepartment(data.department);
    
    // Pick a placement slot
    const usedSlots = new Set<string>(
      this.citizens.map((c) => `${c.location.x},${c.location.z}`)
    );
    
    const slot = assignPlacementSlot(data.department, usedSlots);

    this.sequenceCounter += 1;
    const citizenId = generateCitizenId(this.sequenceCounter);

    const now = new Date().toISOString();
    const newCitizen: Citizen = {
      _internalId: generateInternalId(),
      citizenId,
      username: data.username.trim().toLowerCase().replace(/\s+/g, '_'),
      displayName: data.displayName.trim(),
      avatarUrl: null,
      astronautType: data.astronautType,
      suitColor: data.suitColor,
      bio: data.bio.trim(),
      department: data.department,
      profession: data.profession,
      rank: 'Citizen',
      districtId: district,
      buildingId: slot.buildingId,
      location: {
        x: slot.x,
        y: slot.y,
        z: slot.z,
        rotationY: slot.rotationY,
        districtId: district,
        buildingId: slot.buildingId,
      },
      currentActivity: `Settling in at ${district} district`,
      status: 'ACTIVE',
      joinedAt: now,
      xp: 0,
      level: 1,
      colonyCredits: 100,
      achievements: [],
      isFoundingCitizen: this.citizens.length < 100,
      contributionStats: {
        missionsCompleted: 0,
        structuresContributed: 0,
        totalContribution: 0,
        evaSessions: 0,
        discoveryCount: 0,
      },
    };

    this.citizens = [...this.citizens, newCitizen];
    saveCitizens(this.citizens);
    saveSequence(this.sequenceCounter);
    this.notify();

    return newCitizen;
  }

  resetToDemo() {
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(SEQUENCE_KEY);
    } catch {}
    this.citizens = [];
    this.sequenceCounter = 0;
    this.initialized = false;
    this.initialize();
    this.notify();
  }

  getTotalCount(): number {
    this.initialize();
    return this.citizens.length;
  }
}

export const citizenService = new CitizenService();
