// ============================================================
// LUNAR — Phase 3: Citizen Service
// PostgreSQL-backed API queries via apiClient + in-memory
// Phase 2 Demo Showcase crew (SIM-00001..SIM-00026).
// Real citizens are NEVER stored in localStorage.
// ============================================================

import {
  Achievement,
  AstronautType,
  CareerRank,
  Citizen,
  CitizenStatus,
  Department,
  DepartmentId,
  DistrictId,
  RegistrationFormData,
} from '../types';
import { apiClient, isApiError } from './apiClient';
import { makeAchievement } from '../data/achievements';
import { DEPARTMENTS } from '../data/departments';
import { assignPlacementSlot, getDistrictForDepartment } from './citizenPlacement';

// ---- Demo Citizens Seed Data ----
// 26 showcase citizens across all 6 districts (isolated as SIM-* with isDemo: true)

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

// ---- Demo Showcase Builder (In-Memory Only, SIM-* Namespace) ----

function buildDemoShowcaseCitizens(): Citizen[] {
  return DEMO_CITIZENS_SEED.map((seed, idx) => {
    const seq = idx + 1;
    const citizenId = `SIM-${String(seq).padStart(5, '0')}`;
    return {
      _internalId: `sim-${String(seq).padStart(5, '0')}`,
      citizenId,
      ...seed,
      isDemo: true,
    };
  });
}

// ---- Backend DTO Normalization ----

const VALID_DISTRICTS = new Set<DistrictId>(['NEXUS', 'FORGE', 'EDEN', 'AETHER', 'BEACON', 'HAVEN']);
const VALID_DEPARTMENTS = new Set<DepartmentId>([
  'ENGINEERING',
  'BIOSCIENCE',
  'RESEARCH',
  'SECURITY',
  'COMMUNICATIONS',
  'CULTURE',
]);

function normalizeDepartmentId(raw: unknown): DepartmentId {
  if (typeof raw === 'string') {
    const upper = raw.toUpperCase() as DepartmentId;
    if (VALID_DEPARTMENTS.has(upper)) return upper;
  }
  if (raw && typeof raw === 'object') {
    const obj = raw as Record<string, unknown>;
    const candidate = obj.slug ?? obj.id;
    if (typeof candidate === 'string') {
      const upper = candidate.toUpperCase() as DepartmentId;
      if (VALID_DEPARTMENTS.has(upper)) return upper;
    }
  }
  return 'ENGINEERING';
}

function normalizeDistrictId(raw: unknown, fallbackDepartment: DepartmentId): DistrictId {
  if (typeof raw === 'string') {
    const upper = raw.toUpperCase() as DistrictId;
    if (VALID_DISTRICTS.has(upper)) return upper;
  }
  return getDistrictForDepartment(fallbackDepartment);
}

function normalizeAchievement(raw: unknown): Achievement {
  const obj = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
  const nested =
    obj.achievement && typeof obj.achievement === 'object'
      ? (obj.achievement as Record<string, unknown>)
      : obj;

  const rarityRaw = typeof nested.rarity === 'string' ? nested.rarity.toLowerCase() : 'common';
  const rarity: Achievement['rarity'] =
    rarityRaw === 'rare' || rarityRaw === 'epic' || rarityRaw === 'legendary'
      ? rarityRaw
      : 'common';

  return {
    id: String(nested.slug ?? nested.id ?? 'ACHIEVEMENT'),
    name: String(nested.name ?? 'Colony Commendation'),
    description: String(nested.description ?? ''),
    icon: String(nested.icon ?? 'Award'),
    unlockedAt:
      typeof obj.unlockedAt === 'string'
        ? obj.unlockedAt
        : typeof nested.unlockedAt === 'string'
          ? nested.unlockedAt
          : undefined,
    rarity,
  };
}

/**
 * Normalizes a PostgreSQL public Citizen DTO (canonical nested or flat Prisma shape)
 * into the frontend Citizen contract with isDemo = false.
 */
export function normalizeApiCitizen(raw: unknown): Citizen {
  const obj = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
  const department = normalizeDepartmentId(obj.department ?? obj.departmentId);
  const districtId = normalizeDistrictId(
    obj.districtId ?? (obj.location as Record<string, unknown> | undefined)?.districtId,
    department
  );
  const rawLocation =
    obj.location && typeof obj.location === 'object'
      ? (obj.location as Record<string, unknown>)
      : {};

  const buildingId = String(
    obj.buildingId ?? rawLocation.buildingId ?? 'nexus-core'
  );
  const x = Number(rawLocation.x ?? obj.positionX ?? 0);
  const y = Number(rawLocation.y ?? obj.positionY ?? 0);
  const z = Number(rawLocation.z ?? obj.positionZ ?? 0);
  const rotationY = Number(rawLocation.rotationY ?? obj.rotationY ?? 0);

  const rawStats =
    obj.contributionStats && typeof obj.contributionStats === 'object'
      ? (obj.contributionStats as Record<string, unknown>)
      : {};

  const rawAchievements = Array.isArray(obj.achievements) ? obj.achievements : [];

  return {
    _internalId: typeof obj._internalId === 'string' ? obj._internalId : undefined,
    citizenId: String(obj.citizenId ?? 'LUN-00000'),
    username: String(obj.username ?? 'citizen'),
    displayName: String(obj.displayName ?? obj.username ?? 'Lunar Citizen'),
    avatarUrl: typeof obj.avatarUrl === 'string' ? obj.avatarUrl : null,
    astronautType: (typeof obj.astronautType === 'string'
      ? obj.astronautType
      : 'civilian') as AstronautType,
    suitColor: typeof obj.suitColor === 'string' ? obj.suitColor : '#ffffff',
    bio: typeof obj.bio === 'string' ? obj.bio : '',
    department,
    profession: String(
      obj.profession ?? DEPARTMENTS[department].professions[0]
    ),
    rank: String(obj.rank ?? obj.careerRank ?? 'Citizen') as CareerRank,
    districtId,
    buildingId,
    location: {
      x: Number.isFinite(x) ? x : 0,
      y: Number.isFinite(y) ? y : 0,
      z: Number.isFinite(z) ? z : 0,
      rotationY: Number.isFinite(rotationY) ? rotationY : 0,
      districtId,
      buildingId,
    },
    currentActivity: String(
      obj.currentActivity ?? `Stationed at ${districtId} District`
    ),
    status: String(obj.status ?? 'ACTIVE') as CitizenStatus,
    joinedAt:
      typeof obj.joinedAt === 'string'
        ? obj.joinedAt
        : new Date().toISOString(),
    xp: Number(obj.xp ?? 0),
    level: Number(obj.level ?? 1),
    colonyCredits: Number(obj.colonyCredits ?? 100),
    achievements: rawAchievements.map(normalizeAchievement),
    isFoundingCitizen: Boolean(obj.isFoundingCitizen),
    isDemo: false,
    contributionStats: {
      missionsCompleted: Number(rawStats.missionsCompleted ?? obj.missionsCompleted ?? 0),
      structuresContributed: Number(rawStats.structuresContributed ?? obj.structuresContributed ?? 0),
      totalContribution: Number(rawStats.totalContribution ?? obj.totalContribution ?? 0),
      evaSessions: Number(rawStats.evaSessions ?? obj.evaSessions ?? 0),
      discoveryCount: Number(rawStats.discoveryCount ?? obj.discoveryCount ?? 0),
    },
  };
}

function unwrapPayload<T = Record<string, unknown>>(payload: unknown): T {
  if (payload && typeof payload === 'object') {
    const root = payload as Record<string, unknown>;
    if (root.data && typeof root.data === 'object' && !Array.isArray(root.data)) {
      return root.data as T;
    }
  }
  return (payload ?? {}) as T;
}

// ---- Coordinate De-confliction ----
// Real PostgreSQL citizens keep their exact server-assigned coordinates.
// Any Demo Showcase citizen colliding within 1.5m gets a deterministic radial offset.

const COLLISION_THRESHOLD_SQ = 1.5 * 1.5;

export function mergeCitizensWithDemo(
  liveCitizens: Citizen[],
  demoCitizens: Citizen[],
  includeDemo: boolean
): Citizen[] {
  const realList = liveCitizens.map((c) => ({ ...c, isDemo: false }));
  if (!includeDemo || demoCitizens.length === 0) {
    return realList;
  }

  const placedCoords: Array<{ x: number; z: number }> = realList.map((c) => ({
    x: c.location.x,
    z: c.location.z,
  }));

  const deconflictedDemo = demoCitizens.map((demo, idx) => {
    let x = demo.location.x;
    let z = demo.location.z;

    const collides = (cx: number, cz: number) =>
      placedCoords.some((p) => {
        const dx = cx - p.x;
        const dz = cz - p.z;
        return dx * dx + dz * dz < COLLISION_THRESHOLD_SQ;
      });

    if (collides(x, z)) {
      const baseAngle = idx * 2.399963229728653; // golden angle
      for (let ring = 1; ring <= 8; ring++) {
        const radius = 2.2 * ring;
        const angle = baseAngle + ring * 0.7;
        const candidateX = Number((demo.location.x + Math.cos(angle) * radius).toFixed(2));
        const candidateZ = Number((demo.location.z + Math.sin(angle) * radius).toFixed(2));
        if (!collides(candidateX, candidateZ)) {
          x = candidateX;
          z = candidateZ;
          break;
        }
      }
    }

    placedCoords.push({ x, z });
    return {
      ...demo,
      isDemo: true,
      location: {
        ...demo.location,
        x,
        z,
      },
    };
  });

  return [...realList, ...deconflictedDemo];
}

// ============================================================
// Citizen Service (API-First + Demo Showcase Store)
// ============================================================

class CitizenService {
  private readonly baseDemoCitizens: Citizen[] = buildDemoShowcaseCitizens();
  private previewDemoCitizens: Citizen[] = [];
  private previewSequence = 90000;

  getDemoCitizens(): Citizen[] {
    return [...this.baseDemoCitizens, ...this.previewDemoCitizens];
  }

  resetDemoPreview(): void {
    this.previewDemoCitizens = [];
    this.previewSequence = 90000;
  }

  /**
   * Fetches real PostgreSQL citizens from GET /api/citizens (paginating if needed).
   */
  async fetchLiveCitizens(): Promise<Citizen[]> {
    const collected: Citizen[] = [];
    let page = 1;
    let totalPages = 1;

    do {
      const res = await apiClient.get<unknown>(`/api/citizens?page=${page}&limit=100`);
      const body = unwrapPayload<Record<string, unknown>>(res);
      const rawList = Array.isArray(res)
        ? res
        : Array.isArray(body.citizens)
          ? body.citizens
          : Array.isArray(body.items)
            ? body.items
            : [];

      for (const item of rawList) {
        collected.push(normalizeApiCitizen(item));
      }

      const pagination =
        body.pagination && typeof body.pagination === 'object'
          ? (body.pagination as Record<string, unknown>)
          : null;
      totalPages = pagination && typeof pagination.totalPages === 'number' ? pagination.totalPages : 1;
      page += 1;
    } while (page <= totalPages && page <= 10);

    return collected;
  }

  /**
   * Fetches a single public citizen dossier by citizenId from GET /api/citizens/:citizenId/public.
   */
  async fetchPublicCitizenById(citizenId: string): Promise<Citizen | null> {
    const trimmed = citizenId.trim();
    if (!trimmed) return null;

    if (trimmed.toUpperCase().startsWith('SIM-')) {
      return (
        this.getDemoCitizens().find(
          (c) => c.citizenId.toUpperCase() === trimmed.toUpperCase()
        ) ?? null
      );
    }

    try {
      const res = await apiClient.get<unknown>(
        `/api/citizens/${encodeURIComponent(trimmed)}/public`
      );
      const body = unwrapPayload<Record<string, unknown>>(res);
      const rawCitizen =
        body.citizen && typeof body.citizen === 'object' ? body.citizen : body;
      return normalizeApiCitizen(rawCitizen);
    } catch (err) {
      if (isApiError(err) && err.status === 404) {
        return null;
      }
      throw err;
    }
  }

  /**
   * Fetches canonical departments from GET /api/departments with static fallback.
   */
  async fetchDepartments(): Promise<Department[]> {
    try {
      const res = await apiClient.get<unknown>('/api/departments');
      const body = unwrapPayload<Record<string, unknown>>(res);
      const rawList = Array.isArray(res)
        ? res
        : Array.isArray(body.departments)
          ? body.departments
          : [];

      if (rawList.length === 0) {
        return Object.values(DEPARTMENTS);
      }

      return rawList.map((raw) => {
        const obj = raw as Record<string, unknown>;
        const id = normalizeDepartmentId(obj.slug ?? obj.id);
        const fallback = DEPARTMENTS[id];
        return {
          id,
          name: typeof obj.name === 'string' ? obj.name : fallback.name,
          primaryDistrictId: normalizeDistrictId(
            obj.districtId ?? obj.primaryDistrictId,
            id
          ),
          description:
            typeof obj.description === 'string'
              ? obj.description
              : fallback.description,
          accentColor:
            typeof obj.accentColor === 'string'
              ? obj.accentColor
              : fallback.accentColor,
          professions: Array.isArray(obj.professions)
            ? obj.professions.map(String)
            : fallback.professions,
        };
      });
    } catch {
      return Object.values(DEPARTMENTS);
    }
  }

  /**
   * Checks real-time PostgreSQL username availability via GET /api/citizens/check-username.
   */
  async checkUsernameAvailable(username: string): Promise<{
    username: string;
    valid: boolean;
    available: boolean;
  }> {
    const normalized = username.trim().toLowerCase();
    const valid = /^[a-z0-9_]{3,20}$/.test(normalized);
    if (!valid) {
      return { username: normalized, valid: false, available: false };
    }
    const res = await apiClient.get<{
      username: string;
      valid: boolean;
      available: boolean;
    }>(`/api/citizens/check-username?username=${encodeURIComponent(normalized)}`);
    return res;
  }

  /**
   * Submits a real verified citizenship application to POST /api/citizenship/apply.
   */
  async applyForCitizenship(data: RegistrationFormData): Promise<Citizen> {
    const payload = {
      username: data.username.trim().toLowerCase(),
      displayName: data.displayName.trim(),
      bio: data.bio.trim(),
      departmentId: data.department,
      profession: data.profession,
      astronautType: data.astronautType,
      suitColor: data.suitColor,
    };

    const res = await apiClient.post<unknown>('/api/citizenship/apply', payload);
    const body = unwrapPayload<Record<string, unknown>>(res);
    const rawCitizen =
      body.citizen && typeof body.citizen === 'object' ? body.citizen : body;
    return normalizeApiCitizen(rawCitizen);
  }

  /**
   * In-memory-only Demo Preview registration for /join sandbox (never persisted to localStorage,
   * never issues LUN-* IDs).
   */
  registerDemoPreview(
    data: RegistrationFormData,
    existingCitizens: Citizen[] = this.getDemoCitizens()
  ): Citizen {
    const cleanUsername = data.username.trim().toLowerCase().replace(/\s+/g, '_');
    const taken = existingCitizens.some(
      (c) => c.username.toLowerCase() === cleanUsername
    );
    if (taken) {
      throw new Error(`Username "${cleanUsername}" is already in use in the preview roster.`);
    }

    const district = getDistrictForDepartment(data.department);
    const usedSlots = new Set<string>(
      existingCitizens.map((c) => `${c.location.x},${c.location.z}`)
    );
    const slot = assignPlacementSlot(data.department, usedSlots);

    this.previewSequence += 1;
    const citizenId = `SIM-${String(this.previewSequence).padStart(5, '0')}`;
    const now = new Date().toISOString();

    const previewCitizen: Citizen = {
      _internalId: `sim-${this.previewSequence}`,
      citizenId,
      username: cleanUsername,
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
      currentActivity: `Demo simulation preview at ${district} District`,
      status: 'ACTIVE',
      joinedAt: now,
      xp: 0,
      level: 1,
      colonyCredits: 100,
      achievements: [],
      isFoundingCitizen: false,
      isDemo: true,
      contributionStats: {
        missionsCompleted: 0,
        structuresContributed: 0,
        totalContribution: 0,
        evaSessions: 0,
        discoveryCount: 0,
      },
    };

    this.previewDemoCitizens = [...this.previewDemoCitizens, previewCitizen];
    return previewCitizen;
  }
}

export const citizenService = new CitizenService();
