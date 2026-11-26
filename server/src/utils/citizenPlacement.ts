// ============================================================
// LUNAR — Server-Authoritative Citizen Placement System
// Mirrors src/lib/citizenPlacement.ts & src/data/buildings.ts
// Maps departments -> districts -> buildings -> lunar surface XYZ.
// ============================================================

export const DISTRICT_IDS = [
  'NEXUS',
  'FORGE',
  'EDEN',
  'AETHER',
  'BEACON',
  'HAVEN',
] as const;

export type DistrictId = (typeof DISTRICT_IDS)[number];

export const DEPARTMENT_IDS = [
  'ENGINEERING',
  'BIOSCIENCE',
  'RESEARCH',
  'SECURITY',
  'COMMUNICATIONS',
  'CULTURE',
] as const;

export type DepartmentId = (typeof DEPARTMENT_IDS)[number];

export const CANONICAL_BUILDING_IDS = [
  // NEXUS
  'nexus-core',
  'nexus-transit-hub',
  'nexus-atmos-dome',
  // FORGE
  'forge-smelter-alpha',
  'forge-fusion-reactor',
  'forge-assembly-hangar',
  // EDEN
  'eden-biodome-main',
  'eden-hydroponics-west',
  'eden-seed-vault',
  // AETHER
  'aether-optics-dome',
  'aether-quantum-lab',
  'aether-seismic-post',
  // BEACON
  'beacon-main-dish',
  'beacon-laser-tower',
  'beacon-telecom-relay',
  // HAVEN
  'haven-hab-ring-a',
  'haven-civic-center',
  'haven-medical-center',
] as const;

export type CanonicalBuildingId = (typeof CANONICAL_BUILDING_IDS)[number];

export interface PlacementSlot {
  districtId: DistrictId;
  buildingId: CanonicalBuildingId;
  x: number;
  y: number;
  z: number;
  rotationY: number;
}

export interface SurfaceCoordinate {
  x: number;
  z: number;
}

const PLACEMENT_SLOTS: PlacementSlot[] = [
  // ---- NEXUS ----
  { districtId: 'NEXUS', buildingId: 'nexus-core', x: 4, y: 0, z: 6, rotationY: 0.4 },
  { districtId: 'NEXUS', buildingId: 'nexus-core', x: -6, y: 0, z: 3, rotationY: 1.2 },
  { districtId: 'NEXUS', buildingId: 'nexus-core', x: 8, y: 0, z: -4, rotationY: -0.5 },
  { districtId: 'NEXUS', buildingId: 'nexus-transit-hub', x: -10, y: 0, z: 8, rotationY: 1.8 },
  { districtId: 'NEXUS', buildingId: 'nexus-transit-hub', x: -18, y: 0, z: 20, rotationY: 2.1 },
  { districtId: 'NEXUS', buildingId: 'nexus-atmos-dome', x: 14, y: 0, z: -8, rotationY: -0.8 },
  { districtId: 'NEXUS', buildingId: 'nexus-core', x: -38, y: 0, z: 22, rotationY: 0.7 },
  { districtId: 'NEXUS', buildingId: 'nexus-transit-hub', x: 18, y: 0, z: 42, rotationY: 2.1 },

  // ---- FORGE ----
  { districtId: 'FORGE', buildingId: 'forge-smelter-alpha', x: -80, y: 0, z: 48, rotationY: 2.3 },
  { districtId: 'FORGE', buildingId: 'forge-smelter-alpha', x: -88, y: 0, z: 55, rotationY: 1.6 },
  { districtId: 'FORGE', buildingId: 'forge-fusion-reactor', x: -98, y: 0, z: 32, rotationY: -1.2 },
  { districtId: 'FORGE', buildingId: 'forge-fusion-reactor', x: -105, y: 0, z: 24, rotationY: -0.4 },
  { districtId: 'FORGE', buildingId: 'forge-assembly-hangar', x: -66, y: 0, z: 62, rotationY: 0.9 },
  { districtId: 'FORGE', buildingId: 'forge-assembly-hangar', x: -72, y: 0, z: 70, rotationY: 1.4 },

  // ---- EDEN ----
  { districtId: 'EDEN', buildingId: 'eden-biodome-main', x: 70, y: 0, z: -15, rotationY: 3.0 },
  { districtId: 'EDEN', buildingId: 'eden-biodome-main', x: 76, y: 0, z: -8, rotationY: -1.5 },
  { districtId: 'EDEN', buildingId: 'eden-hydroponics-west', x: 88, y: 0, z: -32, rotationY: -2.1 },
  { districtId: 'EDEN', buildingId: 'eden-hydroponics-west', x: 94, y: 0, z: -42, rotationY: 2.6 },
  { districtId: 'EDEN', buildingId: 'eden-seed-vault', x: 66, y: 0, z: -38, rotationY: 0.1 },

  // ---- AETHER ----
  { districtId: 'AETHER', buildingId: 'aether-optics-dome', x: 46, y: 0, z: -80, rotationY: 1.5 },
  { districtId: 'AETHER', buildingId: 'aether-optics-dome', x: 52, y: 0, z: -88, rotationY: 0.9 },
  { districtId: 'AETHER', buildingId: 'aether-quantum-lab', x: 36, y: 0, z: -92, rotationY: -0.5 },
  { districtId: 'AETHER', buildingId: 'aether-quantum-lab', x: 28, y: 0, z: -100, rotationY: 2.0 },
  { districtId: 'AETHER', buildingId: 'aether-seismic-post', x: 64, y: 0, z: -78, rotationY: 2.7 },

  // ---- BEACON ----
  { districtId: 'BEACON', buildingId: 'beacon-main-dish', x: -66, y: 0, z: -70, rotationY: 0.8 },
  { districtId: 'BEACON', buildingId: 'beacon-main-dish', x: -74, y: 0, z: -78, rotationY: 1.5 },
  { districtId: 'BEACON', buildingId: 'beacon-laser-tower', x: -82, y: 0, z: -58, rotationY: -1.7 },
  { districtId: 'BEACON', buildingId: 'beacon-telecom-relay', x: -50, y: 0, z: -84, rotationY: 1.1 },
  { districtId: 'BEACON', buildingId: 'beacon-telecom-relay', x: -58, y: 0, z: -92, rotationY: -0.3 },

  // ---- HAVEN ----
  { districtId: 'HAVEN', buildingId: 'haven-hab-ring-a', x: 32, y: 0, z: 74, rotationY: -0.4 },
  { districtId: 'HAVEN', buildingId: 'haven-hab-ring-a', x: 40, y: 0, z: 80, rotationY: 1.2 },
  { districtId: 'HAVEN', buildingId: 'haven-civic-center', x: 52, y: 0, z: 92, rotationY: -2.4 },
  { districtId: 'HAVEN', buildingId: 'haven-medical-center', x: 22, y: 0, z: 65, rotationY: 1.9 },
  { districtId: 'HAVEN', buildingId: 'haven-medical-center', x: 18, y: 0, z: 58, rotationY: -1.0 },
];

export const DEPARTMENT_DISTRICT_MAP: Record<DepartmentId, DistrictId> = {
  ENGINEERING: 'FORGE',
  BIOSCIENCE: 'EDEN',
  RESEARCH: 'AETHER',
  SECURITY: 'NEXUS',
  COMMUNICATIONS: 'BEACON',
  CULTURE: 'HAVEN',
};

const DISTRICT_CENTERS: Record<DistrictId, [number, number]> = {
  NEXUS: [0, 0],
  FORGE: [-85, 45],
  EDEN: [75, -20],
  AETHER: [50, -85],
  BEACON: [-70, -75],
  HAVEN: [35, 80],
};

const DISTRICT_FALLBACK_BUILDINGS: Record<DistrictId, CanonicalBuildingId> = {
  NEXUS: 'nexus-core',
  FORGE: 'forge-smelter-alpha',
  EDEN: 'eden-biodome-main',
  AETHER: 'aether-optics-dome',
  BEACON: 'beacon-main-dish',
  HAVEN: 'haven-hab-ring-a',
};

function isCoordinateOccupied(
  x: number,
  z: number,
  occupied: SurfaceCoordinate[],
  minDistance = 1.0
): boolean {
  return occupied.some((pos) => Math.hypot(pos.x - x, pos.z - z) < minDistance);
}

/**
 * Returns the canonical primary district for a department.
 */
export function getDistrictForDepartment(department: DepartmentId): DistrictId {
  return DEPARTMENT_DISTRICT_MAP[department];
}

/**
 * Selects an unoccupied placement slot in the citizen's preferred district,
 * falling back to any open canonical slot or a collision-free jittered coordinate
 * near the preferred district center.
 */
export function assignPlacementSlot(
  department: DepartmentId,
  existingPositions: SurfaceCoordinate[]
): PlacementSlot {
  const preferredDistrict = getDistrictForDepartment(department);

  const preferredSlots = PLACEMENT_SLOTS.filter(
    (slot) =>
      slot.districtId === preferredDistrict &&
      !isCoordinateOccupied(slot.x, slot.z, existingPositions, 0.5)
  );
  if (preferredSlots.length > 0) {
    return preferredSlots[Math.floor(Math.random() * preferredSlots.length)];
  }

  const anySlot = PLACEMENT_SLOTS.find(
    (slot) => !isCoordinateOccupied(slot.x, slot.z, existingPositions, 0.5)
  );
  if (anySlot) {
    return anySlot;
  }

  const [cx, cz] = DISTRICT_CENTERS[preferredDistrict];
  const fallbackBuildingId = DISTRICT_FALLBACK_BUILDINGS[preferredDistrict];

  for (let attempt = 0; attempt < 25; attempt++) {
    const spread = 20 + attempt * 1.5;
    const x = Number((cx + (Math.random() - 0.5) * spread).toFixed(2));
    const z = Number((cz + (Math.random() - 0.5) * spread).toFixed(2));
    if (!isCoordinateOccupied(x, z, existingPositions, 1.5)) {
      return {
        districtId: preferredDistrict,
        buildingId: fallbackBuildingId,
        x,
        y: 0,
        z,
        rotationY: Number((Math.random() * Math.PI * 2).toFixed(3)),
      };
    }
  }

  // Deterministic spiral fallback if densely populated
  const angle = existingPositions.length * 0.618 * Math.PI * 2;
  const radius = 12 + (existingPositions.length % 10) * 2;
  return {
    districtId: preferredDistrict,
    buildingId: fallbackBuildingId,
    x: Number((cx + Math.cos(angle) * radius).toFixed(2)),
    y: 0,
    z: Number((cz + Math.sin(angle) * radius).toFixed(2)),
    rotationY: Number((angle % (Math.PI * 2)).toFixed(3)),
  };
}
