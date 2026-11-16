import { clean, invalid, type InvalidResult } from './internal/result.ts';

/** The entity categories encoded in the fourth character of a PAN. */
export const PAN_HOLDER_TYPES = {
  A: 'Association of Persons (AOP)',
  B: 'Body of Individuals (BOI)',
  C: 'Company',
  F: 'Firm or Limited Liability Partnership',
  G: 'Government',
  H: 'Hindu Undivided Family (HUF)',
  J: 'Artificial Juridical Person',
  L: 'Local Authority',
  P: 'Individual',
  T: 'Trust',
} as const;

export type PanHolderTypeCode = keyof typeof PAN_HOLDER_TYPES;

export interface PanDetails {
  readonly valid: true;
  /** The ten characters, uppercased. */
  readonly value: string;
  /** Fourth character of the PAN. */
  readonly holderTypeCode: PanHolderTypeCode;
  /** What that character means, e.g. `Individual`. */
  readonly holderType: string;
  /**
   * Fifth character: the first letter of the holder's surname for an
   * individual, or of the entity's name otherwise.
   */
  readonly nameInitial: string;
  /**
   * Always `false`. The tenth character of a PAN is a check character, but
   * the Income Tax Department has never published how it is derived, so no
   * library can verify it offline. Anything claiming otherwise is guessing.
   */
  readonly checksumVerified: false;
}

export type PanResult = PanDetails | InvalidResult;

const PAN_PATTERN = /^[A-Z]{5}[0-9]{4}[A-Z]$/;
const HOLDER_TYPES: Record<string, string> = PAN_HOLDER_TYPES;

/**
 * Validates the structure of a PAN and decodes what it tells you.
 *
 * The tenth character cannot be verified - see {@link PanDetails.checksumVerified}.
 *
 * @example
 * validatePan('abcpk1234f');
 * // { valid: true, value: 'ABCPK1234F', holderTypeCode: 'P',
 * //   holderType: 'Individual', nameInitial: 'K', checksumVerified: false }
 */
export function validatePan(input: unknown): PanResult {
  const cleaned = clean(input);
  if (!cleaned.ok) return cleaned.result;

  const value = cleaned.value.replace(/[\s-]/g, '').toUpperCase();

  if (value.length !== 10) {
    return invalid(
      'BAD_LENGTH',
      `A PAN is 10 characters long, received ${value.length}.`,
    );
  }

  if (!PAN_PATTERN.test(value)) {
    return invalid(
      'BAD_FORMAT',
      'A PAN is five letters, then four digits, then one letter (AAAAA9999A).',
    );
  }

  const holderTypeCode = value[3]!;
  const holderType = HOLDER_TYPES[holderTypeCode];
  if (holderType === undefined) {
    return invalid(
      'UNKNOWN_HOLDER_TYPE',
      `"${holderTypeCode}" is not a PAN holder category; expected one of ${Object.keys(PAN_HOLDER_TYPES).join(', ')}.`,
    );
  }

  // The numeric block runs from 0001 to 9999, so 0000 is never issued.
  if (value.slice(5, 9) === '0000') {
    return invalid(
      'BAD_FORMAT',
      'The four-digit block of a PAN runs from 0001 to 9999, never 0000.',
    );
  }

  return {
    valid: true,
    value,
    holderTypeCode: holderTypeCode as PanHolderTypeCode,
    holderType,
    nameInitial: value[4]!,
    checksumVerified: false,
  };
}

/** Whether the input is a structurally valid PAN. */
export function isPan(input: unknown): boolean {
  return validatePan(input).valid;
}
