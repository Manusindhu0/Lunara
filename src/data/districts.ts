import { DistrictId, DistrictInfo } from '../types';

export const DISTRICTS: Record<DistrictId, DistrictInfo> = {
  NEXUS: {
    id: 'NEXUS',
    name: 'NEXUS',
    tagline: 'Colony Command & Central Spine',
    description: 'The monumental core of Lunar civilization. Houses high council chambers, orbital transit shuttles, main airlock networks, and primary atmospheric synthesis chambers.',
    center: [0, 0, 0],
    color: '#00f0ff',
    accentColor: '#38bdf8',
    buildingCount: 5,
    citizenCount: 380,
    lifeSupportLevel: '99.98% (Triple Redundant)',
    powerGrid: 'Fusion Ring Alfa (Nominal)'
  },
  FORGE: {
    id: 'FORGE',
    name: 'FORGE',
    tagline: 'Heavy Industrial & Regolith Smelting',
    description: 'Autonomous regolith mining, titanium-aluminum extraction, modular habitat manufacturing, and geothermal/fusion energy storage arrays that power the entire settlement.',
    center: [-85, 0, 45],
    color: '#f97316',
    accentColor: '#fb923c',
    buildingCount: 6,
    citizenCount: 215,
    lifeSupportLevel: '98.5% (High Filtration)',
    powerGrid: 'Primary Grid Exporter (+18.4 MW)'
  },
  EDEN: {
    id: 'EDEN',
    name: 'EDEN',
    tagline: 'Bioscience & Atmospheric Closed-Loop',
    description: 'Vast pressurized geodesic biodomes nurturing hydroponic crops, algae oxygen scrubbing farms, and synthetic biodiversity research required for self-sustaining lunar life.',
    center: [75, 0, -20],
    color: '#10b981',
    accentColor: '#34d399',
    buildingCount: 5,
    citizenCount: 195,
    lifeSupportLevel: '100% (Oxygen Engine Alpha)',
    powerGrid: 'Dedicated Solar & Biomass (Stable)'
  },
  AETHER: {
    id: 'AETHER',
    name: 'AETHER',
    tagline: 'Deep Space Observatory & Quantum Labs',
    description: 'Far-side optical arrays, quantum computational cores, lunar seismic monitoring, and ultra-high-resolution astronomical telescopes unhindered by atmospheric interference.',
    center: [50, 0, -85],
    color: '#a855f7',
    accentColor: '#c084fc',
    buildingCount: 5,
    citizenCount: 140,
    lifeSupportLevel: '99.4% (Cryo-stabilized)',
    powerGrid: 'Quantum Relay Tap (Stable)'
  },
  BEACON: {
    id: 'BEACON',
    name: 'BEACON',
    tagline: 'Earth-Moon Relay & Deep Space Comms',
    description: 'Massive optical laser transmitters, high-gain parabolic antennas, and Lagrange relay dishes maintaining gigabit quantum-encrypted communications with Earth and orbital stations.',
    center: [-70, 0, -75],
    color: '#3b82f6',
    accentColor: '#60a5fa',
    buildingCount: 5,
    citizenCount: 128,
    lifeSupportLevel: '99.1% (Shielded)',
    powerGrid: 'Direct Solar Array Beta (Optimal)'
  },
  HAVEN: {
    id: 'HAVEN',
    name: 'HAVEN',
    tagline: 'Sub-Surface Living & Civilian Quarters',
    description: 'Multi-tiered pressurized modular living habitats, recreation commons, hydroponic garden courtyards, and radiation-shielded private quarters for colony citizens.',
    center: [35, 0, 80],
    color: '#eab308',
    accentColor: '#fde047',
    buildingCount: 6,
    citizenCount: 420,
    lifeSupportLevel: '99.9% (Comfort Spec)',
    powerGrid: 'Haven Micro-grid Loop (Optimized)'
  }
};
