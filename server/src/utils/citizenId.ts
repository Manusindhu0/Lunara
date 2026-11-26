// ============================================================
// LUNAR — Server-Authoritative Citizen ID Utilities
// IDs are permanent, never recycled, and formatted as LUN-XXXXX.
// ============================================================

export const CITIZEN_ID_PREFIX = 'LUN';
export const CITIZEN_ID_DIGITS = 5;

/**
 * Formats a positive integer sequence into a permanent LUNAR Citizen ID.
 */
export function generateCitizenId(sequence: number): string {
  if (!Number.isInteger(sequence) || sequence < 1) {
    throw new Error('Citizen ID sequence must be a positive integer starting at 1');
  }
  const padded = String(sequence).padStart(CITIZEN_ID_DIGITS, '0');
  return `${CITIZEN_ID_PREFIX}-${padded}`;
}

/**
 * Parses a Citizen ID back to its numeric sequence, or returns null if invalid.
 */
export function parseCitizenId(citizenId: string): number | null {
  const match = citizenId.trim().toUpperCase().match(/^LUN-(\d{5,})$/);
  if (!match) {
    return null;
  }
  return Number.parseInt(match[1], 10);
}

/**
 * Validates whether a string matches the canonical LUN-XXXXX format.
 */
export function isValidCitizenId(citizenId: string): boolean {
  return /^LUN-\d{5,}$/.test(citizenId.trim().toUpperCase());
}
