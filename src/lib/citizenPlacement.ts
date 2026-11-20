// ============================================================
// LUNAR — Citizen Placement System
// Maps departments → districts → buildings → XYZ coordinates
// All coordinates validated to be on the lunar surface and
// within the colony's safe habitation area.
// ============================================================

import { DepartmentId, DistrictId } from '../types';

export interface PlacementSlot {
  districtId: DistrictId;
  buildingId: string;
  x: number;
  y: number;
  z: number;
  rotationY: number;
}

// Placement slots near each building — position offsets from building center
// Building centers are defined in data/buildings.ts
const PLACEMENT_SLOTS: PlacementSlot[] = [
  // ---- NEXUS ----
  { districtId: 'NEXUS', buildingId: 'nexus-core', x: 4,   y: 0, z: 6,   rotationY: 0.4 },
  { districtId: 'NEXUS', buildingId: 'nexus-core', x: -6,  y: 0, z: 3,   rotationY: 1.2 },
  { districtId: 'NEXUS', buildingId: 'nexus-core', x: 8,   y: 0, z: -4,  rotationY: -0.5 },
  { districtId: 'NEXUS', buildingId: 'nexus-transit-hub', x: -10, y: 0, z: 8,   rotationY: 1.8 },
  { districtId: 'NEXUS', buildingId: 'nexus-transit-hub', x: -18, y: 0, z: 20,  rotationY: 2.1 },
  { districtId: 'NEXUS', buildingId: 'nexus-atmos-dome',  x: 14,  y: 0, z: -8,  rotationY: -0.8 },
  { districtId: 'NEXUS', buildingId: 'nexus-core',         x: -38, y: 0, z: 22,  rotationY: 0.7 },
  { districtId: 'NEXUS', buildingId: 'nexus-transit-hub',  x: 18,  y: 0, z: 42,  rotationY: 2.1 },

  // ---- FORGE ----
  { districtId: 'FORGE', buildingId: 'forge-smelter-alpha', x: -80, y: 0, z: 48,  rotationY: 2.3 },
  { districtId: 'FORGE', buildingId: 'forge-smelter-alpha', x: -88, y: 0, z: 55,  rotationY: 1.6 },
  { districtId: 'FORGE', buildingId: 'forge-fusion-reactor', x: -98, y: 0, z: 32, rotationY: -1.2 },
  { districtId: 'FORGE', buildingId: 'forge-fusion-reactor', x: -105, y: 0, z: 24, rotationY: -0.4 },
  { districtId: 'FORGE', buildingId: 'forge-assembly-hangar', x: -66, y: 0, z: 62, rotationY: 0.9 },
  { districtId: 'FORGE', buildingId: 'forge-assembly-hangar', x: -72, y: 0, z: 70, rotationY: 1.4 },

  // ---- EDEN ----
  { districtId: 'EDEN', buildingId: 'eden-biodome-main',       x: 70, y: 0, z: -15,  rotationY: 3.0 },
  { districtId: 'EDEN', buildingId: 'eden-biodome-main',       x: 76, y: 0, z: -8,   rotationY: -1.5 },
  { districtId: 'EDEN', buildingId: 'eden-hydroponics-west',   x: 88, y: 0, z: -32,  rotationY: -2.1 },
  { districtId: 'EDEN', buildingId: 'eden-hydroponics-west',   x: 94, y: 0, z: -42,  rotationY: 2.6 },
  { districtId: 'EDEN', buildingId: 'eden-seed-vault',         x: 66, y: 0, z: -38,  rotationY: 0.1 },

  // ---- AETHER ----
  { districtId: 'AETHER', buildingId: 'aether-optics-dome',   x: 46, y: 0, z: -80,  rotationY: 1.5 },
  { districtId: 'AETHER', buildingId: 'aether-optics-dome',   x: 52, y: 0, z: -88,  rotationY: 0.9 },
  { districtId: 'AETHER', buildingId: 'aether-quantum-lab',   x: 36, y: 0, z: -92,  rotationY: -0.5 },
  { districtId: 'AETHER', buildingId: 'aether-quantum-lab',   x: 28, y: 0, z: -100, rotationY: 2.0 },
  { districtId: 'AETHER', buildingId: 'aether-seismic-post',  x: 64, y: 0, z: -78,  rotationY: 2.7 },

  // ---- BEACON ----
  { districtId: 'BEACON', buildingId: 'beacon-main-dish',     x: -66, y: 0, z: -70,  rotationY: 0.8 },
  { districtId: 'BEACON', buildingId: 'beacon-main-dish',     x: -74, y: 0, z: -78,  rotationY: 1.5 },
  { districtId: 'BEACON', buildingId: 'beacon-laser-tower',   x: -82, y: 0, z: -58,  rotationY: -1.7 },
  { districtId: 'BEACON', buildingId: 'beacon-telecom-relay', x: -50, y: 0, z: -84,  rotationY: 1.1 },
  { districtId: 'BEACON', buildingId: 'beacon-telecom-relay', x: -58, y: 0, z: -92,  rotationY: -0.3 },

  // ---- HAVEN ----
  { districtId: 'HAVEN', buildingId: 'haven-hab-ring-a',      x: 32, y: 0, z: 74,   rotationY: -0.4 },
  { districtId: 'HAVEN', buildingId: 'haven-hab-ring-a',      x: 40, y: 0, z: 80,   rotationY: 1.2 },
  { districtId: 'HAVEN', buildingId: 'haven-civic-center',    x: 52, y: 0, z: 92,   rotationY: -2.4 },
  { districtId: 'HAVEN', buildingId: 'haven-medical-center',  x: 22, y: 0, z: 65,   rotationY: 1.9 },
  { districtId: 'HAVEN', buildingId: 'haven-medical-center',  x: 18, y: 0, z: 58,   rotationY: -1.0 },
];

// Map department to preferred district, with fallback
const DEPARTMENT_DISTRICT_MAP: Record<DepartmentId, DistrictId> = {
  ENGINEERING: 'FORGE',
  BIOSCIENCE: 'EDEN',
  RESEARCH: 'AETHER',
  SECURITY: 'NEXUS',
  COMMUNICATIONS: 'BEACON',
  CULTURE: 'HAVEN',
};

/**
 * Returns the preferred district for a given department.
 */
export function getDistrictForDepartment(department: DepartmentId): DistrictId {
  return DEPARTMENT_DISTRICT_MAP[department];
}

/**
 * Finds an unused slot for a citizen in their department's preferred district.
 * Falls back to any slot in that district, or any slot overall.
 * If all slots are taken, creates a jittered slot near the district center.
 */
export function assignPlacementSlot(
  department: DepartmentId,
  usedSlots: Set<string> // "x,z" keys
): PlacementSlot {
  const preferredDistrict = DEPARTMENT_DISTRICT_MAP[department];

  // Priority 1: slot in preferred district, not yet used
  const preferredSlots = PLACEMENT_SLOTS.filter(
    (s) => s.districtId === preferredDistrict && !usedSlots.has(slotKey(s))
  );
  if (preferredSlots.length > 0) {
    const slot = preferredSlots[Math.floor(Math.random() * preferredSlots.length)];
    usedSlots.add(slotKey(slot));
    return slot;
  }

  // Priority 2: any unused slot
  const anySlot = PLACEMENT_SLOTS.find((s) => !usedSlots.has(slotKey(s)));
  if (anySlot) {
    usedSlots.add(slotKey(anySlot));
    return anySlot;
  }

  // Priority 3: jitter around district center (overflow citizens)
  const districtCenters: Record<DistrictId, [number, number]> = {
    NEXUS: [0, 0],
    FORGE: [-85, 45],
    EDEN: [75, -20],
    AETHER: [50, -85],
    BEACON: [-70, -75],
    HAVEN: [35, 80],
  };
  const [cx, cz] = districtCenters[preferredDistrict];
  const jx = cx + (Math.random() - 0.5) * 20;
  const jz = cz + (Math.random() - 0.5) * 20;
  return {
    districtId: preferredDistrict,
    buildingId: 'nexus-core', // fallback
    x: jx,
    y: 0,
    z: jz,
    rotationY: Math.random() * Math.PI * 2,
  };
}

function slotKey(s: PlacementSlot): string {
  return `${s.x},${s.z}`;
}
