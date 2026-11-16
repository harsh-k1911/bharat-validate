import { gstStateName } from './data/gst-states.ts';
import { gstinCheckCharacter } from './internal/base36.ts';
import { clean, invalid, type InvalidResult } from './internal/result.ts';

export interface GstinDetails {
  readonly valid: true;
  /** The fifteen characters, uppercased. */
  readonly value: string;
  /** First two digits. */
  readonly stateCode: string;
  /** The state or jurisdiction that code refers to. */
  readonly stateName: string;
  /** Characters 3-12: the PAN of the registered entity. */
  readonly pan: string;
  /**
   * Thirteenth character: how many registrations this PAN holds in this
   * state. `1` for the first, counting on through 9 then A-Z.
   */
  readonly entityNumber: string;
  /** Fifteenth character, verified against the mod-36 checksum. */
  readonly checkCharacter: string;
}

export type GstinResult = GstinDetails | InvalidResult;

// Two digits, a PAN, the entity number, a literal Z, then the check character.
const GSTIN_PATTERN = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][0-9A-Z]Z[0-9A-Z]$/;

/**
 * Validates a GSTIN, including the published mod-36 check character, and
 * decodes the state and PAN embedded in it.
 *
 * @example
 * validateGstin('27AAPFU0939F1ZV');
 * // { valid: true, stateCode: '27', stateName: 'Maharashtra',
 * //   pan: 'AAPFU0939F', entityNumber: '1', checkCharacter: 'V', ... }
 */
export function validateGstin(input: unknown): GstinResult {
  const cleaned = clean(input);
  if (!cleaned.ok) return cleaned.result;

  const value = cleaned.value.replace(/[\s-]/g, '').toUpperCase();

  if (value.length !== 15) {
    return invalid(
      'BAD_LENGTH',
      `A GSTIN is 15 characters long, received ${value.length}.`,
    );
  }

  if (!GSTIN_PATTERN.test(value)) {
    return invalid(
      'BAD_FORMAT',
      'A GSTIN is a 2-digit state code, a 10-character PAN, an entity number, the letter Z, then a check character.',
    );
  }

  const stateCode = value.slice(0, 2);
  const stateName = gstStateName(stateCode);
  if (stateName === undefined) {
    return invalid(
      'UNKNOWN_STATE_CODE',
      `"${stateCode}" is not an assigned GST state code.`,
    );
  }

  const expected = gstinCheckCharacter(value.slice(0, 14));
  const actual = value[14]!;
  if (expected !== actual) {
    return invalid(
      'BAD_CHECKSUM',
      `The check character should be "${expected}" but is "${actual}", so this GSTIN is not genuine.`,
    );
  }

  return {
    valid: true,
    value,
    stateCode,
    stateName,
    pan: value.slice(2, 12),
    entityNumber: value[12]!,
    checkCharacter: actual,
  };
}

/** Whether the input is a valid GSTIN. */
export function isGstin(input: unknown): boolean {
  return validateGstin(input).valid;
}
