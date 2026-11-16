import { clean, invalid, type InvalidResult } from './internal/result.ts';

export interface IfscDetails {
  readonly valid: true;
  /** The eleven characters, uppercased. */
  readonly value: string;
  /** First four letters, identifying the bank, e.g. `HDFC`. */
  readonly bankCode: string;
  /** Last six characters, identifying the branch. */
  readonly branchCode: string;
}

export type IfscResult = IfscDetails | InvalidResult;

// Four letters, a reserved zero, then six alphanumeric characters.
const IFSC_PATTERN = /^[A-Z]{4}0[A-Z0-9]{6}$/;

/**
 * Validates the structure of an IFSC code.
 *
 * An IFSC carries no check digit, so this confirms the shape only. Whether
 * the branch exists needs a lookup against RBI data, which this package
 * deliberately does not bundle - it changes as branches merge and close.
 *
 * @example
 * validateIfsc('HDFC0000123');
 * // { valid: true, value: 'HDFC0000123', bankCode: 'HDFC', branchCode: '000123' }
 */
export function validateIfsc(input: unknown): IfscResult {
  const cleaned = clean(input);
  if (!cleaned.ok) return cleaned.result;

  const value = cleaned.value.replace(/[\s-]/g, '').toUpperCase();

  if (value.length !== 11) {
    return invalid(
      'BAD_LENGTH',
      `An IFSC code is 11 characters long, received ${value.length}.`,
    );
  }

  if (!IFSC_PATTERN.test(value)) {
    return invalid(
      'BAD_FORMAT',
      'An IFSC code is four letters, then a 0, then six letters or digits (ABCD0123456).',
    );
  }

  return {
    valid: true,
    value,
    bankCode: value.slice(0, 4),
    branchCode: value.slice(5),
  };
}

/** Whether the input is a structurally valid IFSC code. */
export function isIfsc(input: unknown): boolean {
  return validateIfsc(input).valid;
}
