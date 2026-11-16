import { upiProvider } from './data/upi-handles.ts';
import { clean, invalid, type InvalidResult } from './internal/result.ts';

export interface UpiDetails {
  readonly valid: true;
  /** The whole ID, lowercased. */
  readonly value: string;
  /** The part before the `@`. */
  readonly identifier: string;
  /** The part after the `@`, e.g. `okhdfcbank`. */
  readonly handle: string;
  /**
   * The app or bank behind the handle, or `null` if it is not one we
   * recognise. A `null` here does not make the ID invalid - new handles
   * appear regularly.
   */
  readonly provider: string | null;
}

export type UpiResult = UpiDetails | InvalidResult;

const UPI_PATTERN = /^[a-z0-9._-]{2,256}@[a-z][a-z0-9.]{1,63}$/;

/**
 * Validates a UPI ID (also called a VPA).
 *
 * There is no checksum and no offline way to tell whether an ID is actually
 * registered, so this checks the structure NPCI specifies and names the
 * provider when the handle is a familiar one.
 *
 * @example
 * validateUpi('Harsh@okhdfcbank');
 * // { valid: true, value: 'harsh@okhdfcbank', identifier: 'harsh',
 * //   handle: 'okhdfcbank', provider: 'Google Pay (HDFC Bank)' }
 */
export function validateUpi(input: unknown): UpiResult {
  const cleaned = clean(input);
  if (!cleaned.ok) return cleaned.result;

  const value = cleaned.value.replace(/\s/g, '').toLowerCase();

  const atCount = (value.match(/@/g) ?? []).length;
  if (atCount !== 1) {
    return invalid(
      'BAD_FORMAT',
      `A UPI ID has exactly one "@", found ${atCount}.`,
    );
  }

  if (!UPI_PATTERN.test(value)) {
    return invalid(
      'BAD_FORMAT',
      'A UPI ID looks like name@bank, using only letters, digits, dots, hyphens and underscores.',
    );
  }

  const separator = value.indexOf('@');
  const handle = value.slice(separator + 1);

  return {
    valid: true,
    value,
    identifier: value.slice(0, separator),
    handle,
    provider: upiProvider(handle) ?? null,
  };
}

/** Whether the input is a structurally valid UPI ID. */
export function isUpi(input: unknown): boolean {
  return validateUpi(input).valid;
}
