// ============================================================
// LUNAR — Phase 2: Extended Type System
// ============================================================

// ---- Re-exports for Phase 1 compatibility ----
export type DistrictId = 'NEXUS' | 'FORGE' | 'EDEN' | 'AETHER' | 'BEACON' | 'HAVEN';

export interface DistrictInfo {
  id: DistrictId;
  name: string;
  tagline: string;
  description: string;
  center: [number, number, number];
  color: string;
  accentColor: string;
  buildingCount: number;
  citizenCount: number;
  lifeSupportLevel: string;
  powerGrid: string;
}

export interface BuildingData {
  id: string;
  name: string;
  districtId: DistrictId;
  type: string;
  purpose: string;
  status: 'OPTIMAL' | 'OPERATIONAL' | 'HIGH LOAD' | 'MAINTENANCE';
  population: number;
  capacity: number;
  position: [number, number, number];
  rotation?: [number, number, number];
  scale?: [number, number, number];
  primaryActivity: string;
  features: string[];
  metrics: {
    powerUsage: string;
    structuralIntegrity: string;
    temperature: string;
    radiationShielding: string;
  };
}

// ---- Phase 2: Departments & Professions ----

export type DepartmentId =
  | 'ENGINEERING'
  | 'BIOSCIENCE'
  | 'RESEARCH'
  | 'SECURITY'
  | 'COMMUNICATIONS'
  | 'CULTURE';

export interface Department {
  id: DepartmentId;
  name: string;
  primaryDistrictId: DistrictId;
  description: string;
  accentColor: string;
  professions: string[];
}

export type CareerRank =
  | 'Citizen'
  | 'Specialist'
  | 'Senior Specialist'
  | 'Department Lead'
  | 'Mission Commander'
  | 'Colony Council';

export type CitizenStatus = 'ACTIVE' | 'ON DUTY' | 'RESEARCHING' | 'MAINTENANCE' | 'OFF-DUTY' | 'SUSPENDED';

export type AstronautType = 'engineer' | 'scientist' | 'medic' | 'commander' | 'technician' | 'civilian';

// ---- Phase 2: Citizen Location ----

export interface CitizenLocation {
  x: number;
  y: number;
  z: number;
  rotationY?: number;
  districtId: DistrictId;
  buildingId: string;
}

// ---- Phase 2: Achievement ----

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;        // lucide icon name
  unlockedAt?: string; // ISO date string
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

// ---- Phase 2: Contribution Stats ----

export interface ContributionStats {
  missionsCompleted: number;
  structuresContributed: number;
  totalContribution: number;
  evaSessions?: number;
  discoveryCount?: number;
}

// ---- Phase 2: Core Citizen (data-layer record) ----

export interface Citizen {
  // Internal system identity (omitted on public API responses)
  _internalId?: string;     // UUID, never shown publicly
  citizenId: string;        // "LUN-00001" (live) or "SIM-00001" (demo) — permanent, never recycled
  
  // Public identity
  username: string;         // unique, changeable
  displayName: string;
  avatarUrl: string | null;
  astronautType: AstronautType;
  suitColor: string;
  bio: string;
  
  // Career & assignment
  department: DepartmentId;
  profession: string;
  rank: CareerRank;
  districtId: DistrictId;
  buildingId: string;
  
  // 3D world presence
  location: CitizenLocation;
  currentActivity: string;
  
  // Status & metadata
  status: CitizenStatus;
  joinedAt: string;    // ISO date string
  
  // Progression
  xp: number;
  level: number;
  colonyCredits: number;
  
  // Achievements
  achievements: Achievement[];
  
  // Flags
  isFoundingCitizen: boolean;
  isDemo?: boolean;         // true for Phase 2 simulation showcase citizens (SIM-*), false for PostgreSQL citizens (LUN-*)
  
  // Statistics
  contributionStats: ContributionStats;
}

// ---- Phase 1 CitizenData — preserved for 3D scene compatibility ----
// The 3D Astronaut component uses CitizenData. We adapt Citizen → CitizenData on-the-fly.

export interface CitizenData {
  id: string;        // citizenId
  name: string;      // displayName
  handle: string;    // '@username'
  districtId: DistrictId;
  profession: string;
  role: string;      // department name
  status: CitizenStatus;
  currentActivity: string;
  position: [number, number, number];
  rotationY?: number;
  buildingId?: string;
  avatarSeed: string;
  suitColor: string;
  joinDate: string;
  biography: string;
  badges: string[];  // achievement names
  isDemo?: boolean;  // true for SIM-* showcase citizens
}

export type CameraViewPreset = 'overview' | 'district' | 'inspection';

export interface ColonyState {
  selectedBuilding: BuildingData | null;
  selectedCitizen: CitizenData | null;
  selectedDistrict: DistrictId | null;
  hoveredBuilding: BuildingData | null;
  hoveredCitizen: CitizenData | null;
  isSearchOpen: boolean;
  isNotificationsOpen: boolean;
  isSettingsOpen: boolean;
  graphicsQuality: 'high' | 'medium' | 'performance';
  cameraPreset: CameraViewPreset;
  timeOfDay: 'cinematic' | 'high-noon' | 'earth-glow';
}

// ---- Phase 2: Registration Form ----

export interface RegistrationFormData {
  username: string;
  displayName: string;
  bio: string;
  department: DepartmentId;
  profession: string;
  astronautType: AstronautType;
  suitColor: string;
}

// ---- Phase 2: Directory Filters ----

export interface CitizenDirectoryFilters {
  query: string;
  department: DepartmentId | 'ALL';
  districtId: DistrictId | 'ALL';
  rank: CareerRank | 'ALL';
  status: CitizenStatus | 'ALL';
  sortBy: 'newest' | 'xp' | 'level' | 'contribution' | 'name';
}
