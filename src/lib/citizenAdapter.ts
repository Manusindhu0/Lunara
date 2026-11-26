// ============================================================
// LUNAR — Citizen Adapter
// Converts the Phase-2 Citizen type to Phase-1 CitizenData
// so the 3D Astronaut component remains unchanged.
// ============================================================

import { Citizen, CitizenData } from '../types';
import { DEPARTMENTS } from '../data/departments';

export function citizenToCitizenData(c: Citizen): CitizenData {
  return {
    id: c.citizenId,
    name: c.displayName,
    handle: `@${c.username}`,
    districtId: c.districtId,
    profession: c.profession,
    role: DEPARTMENTS[c.department]?.name ?? c.department,
    status: c.status,
    currentActivity: c.currentActivity,
    position: [c.location.x, c.location.y, c.location.z],
    rotationY: c.location.rotationY ?? 0,
    buildingId: c.buildingId,
    avatarSeed: c.username,
    suitColor: c.suitColor,
    joinDate: c.joinedAt,
    biography: c.bio,
    badges: c.achievements.map((a) => a.name),
    isDemo: Boolean(c.isDemo),
  };
}

/**
 * Converts an array of Citizen records to CitizenData for the 3D scene.
 */
export function toCitizenDataArray(citizens: Citizen[]): CitizenData[] {
  return citizens.map(citizenToCitizenData);
}
