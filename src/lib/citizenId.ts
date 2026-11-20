// ============================================================
// LUNAR — Citizen ID Generator
// IDs are permanent, never recycled, never depend on username.
// Format: LUN-XXXXX (zero-padded, 5 digits)
// ============================================================

export const CITIZEN_ID_PREFIX = 'LUN';
const CITIZEN_ID_DIGITS = 5;

/**
 * Generates a human-readable, permanent Citizen ID.
 * @param sequence A unique integer sequence number (from the citizen store).
 */
export function generateCitizenId(sequence: number): string {
  if (sequence < 1) {
    throw new Error('Citizen ID sequence must start at 1');
  }
  const padded = String(sequence).padStart(CITIZEN_ID_DIGITS, '0');
  return `${CITIZEN_ID_PREFIX}-${padded}`;
}

/**
 * Parses a Citizen ID back to its sequence number.
 * Returns null if the ID format is invalid.
 */
export function parseCitizenId(citizenId: string): number | null {
  const match = citizenId.match(/^LUN-(\d+)$/);
  if (!match) return null;
  return parseInt(match[1], 10);
}

/**
 * Validates a Citizen ID string.
 */
export function isValidCitizenId(citizenId: string): boolean {
  return /^LUN-\d{5}$/.test(citizenId);
}

/**
 * Generates an RFC4122v4-compatible UUID for internal _internalId.
 * This is the stable database key that never changes even if citizenId format evolves.
 */
export function generateInternalId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback for environments without crypto.randomUUID
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
