import { clean, invalid, type InvalidResult } from './internal/result.ts';
import { verhoeffValidate } from './internal/verhoeff.ts';

export interface AadhaarDetails {
  readonly valid: true;
  /** The twelve digits, with any spaces or hyphens removed. */
  readonly value: string;
  /** Grouped for display, e.g. `9999 4105 7058`. */
  readonly formatted: string;
  /** First eight digits hidden, e.g. `XXXX XXXX 7058`. */
  readonly masked: string;
}

export type AadhaarResult = AadhaarDetails | InvalidResult;

const DIGITS_ONLY = /^\d+$/;

/**
 * Validates an Aadhaar number, including its Verhoeff check digit.
 *
 * Spaces and hyphens are ignored, so input copied from a card works as-is.
 *
 * @example
 * validateAadhaar('9999 4105 7058');
 * // { valid: true, value: '999941057058',
 * //   formatted: '9999 4105 7058', masked: 'XXXX XXXX 7058' }
 */
export function validateAadhaar(input: unknown): AadhaarResult {
  const cleaned = clean(input);
  if (!cleaned.ok) return cleaned.result;

  const value = cleaned.value.replace(/[\s-]/g, '');

  if (!DIGITS_ONLY.test(value)) {
    return invalid(
      'BAD_FORMAT',
      'An Aadhaar number contains only digits; spaces and hyphens are ignored.',
    );
  }

  if (value.length !== 12) {
    return invalid(
      'BAD_LENGTH',
      `An Aadhaar number is 12 digits long, received ${value.length}.`,
    );
  }

  // UIDAI never issues a number starting with 0 or 1, which keeps Aadhaar
  // numbers from colliding with older identifiers.
  if (value.startsWith('0') || value.startsWith('1')) {
    return invalid(
      'RESERVED_PREFIX',
      'An Aadhaar number never begins with 0 or 1.',
    );
  }

  if (!verhoeffValidate(value)) {
    return invalid(
      'BAD_CHECKSUM',
      'The check digit does not match, so this is not a real Aadhaar number.',
    );
  }

  return {
    valid: true,
    value,
    formatted: formatAadhaar(value),
    masked: maskAadhaar(value),
  };
}

/** Whether the input is a structurally valid Aadhaar number. */
export function isAadhaar(input: unknown): boolean {
  return validateAadhaar(input).valid;
}

function formatAadhaar(value: string): string {
  return `${value.slice(0, 4)} ${value.slice(4, 8)} ${value.slice(8)}`;
}

/**
 * Hides all but the last four digits.
 *
 * UIDAI requires Aadhaar numbers to be masked wherever they are displayed or
 * printed, so prefer this over showing the full number in a UI or a log.
 *
 * @throws TypeError if the input is not twelve digits.
 */
export function maskAadhaar(input: string): string {
  const value = input.replace(/[\s-]/g, '');
  if (!DIGITS_ONLY.test(value) || value.length !== 12) {
    throw new TypeError('maskAadhaar: expected a 12-digit Aadhaar number.');
  }
  return `XXXX XXXX ${value.slice(8)}`;
}
