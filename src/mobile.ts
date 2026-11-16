import { clean, invalid, type InvalidResult } from './internal/result.ts';

export interface MobileDetails {
  readonly valid: true;
  /** The ten national digits, with any prefix removed. */
  readonly value: string;
  /** International form, e.g. `+919876543210`. */
  readonly e164: string;
  /** How the number is usually written in India, e.g. `98765 43210`. */
  readonly national: string;
}

export type MobileResult = MobileDetails | InvalidResult;

const MOBILE_PATTERN = /^[6-9][0-9]{9}$/;

/**
 * Validates an Indian mobile number and normalises it.
 *
 * Accepts the country code written as `+91`, `0091` or `91`, a leading
 * trunk `0`, and any spacing, hyphens, dots or brackets in between.
 *
 * @example
 * validateMobile('+91 98765-43210');
 * // { valid: true, value: '9876543210',
 * //   e164: '+919876543210', national: '98765 43210' }
 */
export function validateMobile(input: unknown): MobileResult {
  const cleaned = clean(input);
  if (!cleaned.ok) return cleaned.result;

  let value = cleaned.value.replace(/[\s()\-.]/g, '');

  if (value.startsWith('+91')) {
    value = value.slice(3);
  } else if (value.startsWith('0091')) {
    value = value.slice(4);
  } else if (value.length === 12 && value.startsWith('91')) {
    // Only strip a bare 91 when the length proves it is a country code -
    // 9123456789 is itself a perfectly good mobile number.
    value = value.slice(2);
  } else if (value.length === 11 && value.startsWith('0')) {
    value = value.slice(1);
  }

  if (!/^\d+$/.test(value)) {
    return invalid(
      'BAD_FORMAT',
      'A mobile number contains only digits, optionally with a +91 prefix.',
    );
  }

  if (value.length !== 10) {
    return invalid(
      'BAD_LENGTH',
      `An Indian mobile number is 10 digits after the country code, received ${value.length}.`,
    );
  }

  if (!MOBILE_PATTERN.test(value)) {
    return invalid(
      'RESERVED_PREFIX',
      'An Indian mobile number starts with 6, 7, 8 or 9.',
    );
  }

  return {
    valid: true,
    value,
    e164: `+91${value}`,
    national: `${value.slice(0, 5)} ${value.slice(5)}`,
  };
}

/** Whether the input is a valid Indian mobile number. */
export function isMobile(input: unknown): boolean {
  return validateMobile(input).valid;
}
