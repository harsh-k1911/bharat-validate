import { pinZone } from './data/pin-zones.ts';
import { clean, invalid, type InvalidResult } from './internal/result.ts';

export interface PincodeDetails {
  readonly valid: true;
  /** The six digits. */
  readonly value: string;
  /** Leading digit. */
  readonly zoneDigit: string;
  /** The postal zone it belongs to, e.g. `Western`. */
  readonly zone: string;
  /** The states served by that zone. */
  readonly states: readonly string[];
  /** True for zone 9, which is the Army Postal Service rather than a place. */
  readonly isArmyPostalService: boolean;
}

export type PincodeResult = PincodeDetails | InvalidResult;

const PINCODE_PATTERN = /^[1-9][0-9]{5}$/;

/**
 * Validates a six-digit PIN code and names the postal zone it falls in.
 *
 * @example
 * validatePincode('400 001');
 * // { valid: true, value: '400001', zoneDigit: '4', zone: 'Western',
 * //   states: ['Maharashtra', ...], isArmyPostalService: false }
 */
export function validatePincode(input: unknown): PincodeResult {
  const cleaned = clean(input);
  if (!cleaned.ok) return cleaned.result;

  const value = cleaned.value.replace(/[\s-]/g, '');

  if (!/^\d+$/.test(value)) {
    return invalid('BAD_FORMAT', 'A PIN code contains only digits.');
  }

  if (value.length !== 6) {
    return invalid(
      'BAD_LENGTH',
      `A PIN code is 6 digits long, received ${value.length}.`,
    );
  }

  if (!PINCODE_PATTERN.test(value)) {
    return invalid(
      'RESERVED_PREFIX',
      'A PIN code never begins with 0; the first digit is the postal zone, 1 to 9.',
    );
  }

  const zoneDigit = value[0]!;
  const zone = pinZone(zoneDigit)!;

  return {
    valid: true,
    value,
    zoneDigit,
    zone: zone.name,
    states: zone.states,
    isArmyPostalService: zoneDigit === '9',
  };
}

/** Whether the input is a structurally valid PIN code. */
export function isPincode(input: unknown): boolean {
  return validatePincode(input).valid;
}
