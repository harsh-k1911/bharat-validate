/**
 * Why a value was rejected.
 *
 * These codes are part of the public API and will not change meaning within
 * a major version, so it is safe to branch on them.
 */
export type ValidationErrorCode =
  /** The input was not a string at all. */
  | 'NOT_A_STRING'
  /** The input was an empty string, or only whitespace. */
  | 'EMPTY'
  /** The input had the right character set but the wrong number of them. */
  | 'BAD_LENGTH'
  /** The input did not match the shape of the identifier. */
  | 'BAD_FORMAT'
  /** The shape was right but the check digit did not match. */
  | 'BAD_CHECKSUM'
  /** The input used a prefix the issuing authority never assigns. */
  | 'RESERVED_PREFIX'
  /** The embedded state code is not one the authority has assigned. */
  | 'UNKNOWN_STATE_CODE'
  /** The embedded holder-type character is not a recognised category. */
  | 'UNKNOWN_HOLDER_TYPE';

/** Returned by every `validate*` function when the input is rejected. */
export interface InvalidResult {
  readonly valid: false;
  readonly error: ValidationErrorCode;
  /** A human-readable explanation, safe to show to an end user. */
  readonly message: string;
}

export function invalid(
  error: ValidationErrorCode,
  message: string,
): InvalidResult {
  return { valid: false, error, message };
}

export type Cleaned =
  | { readonly ok: true; readonly value: string }
  | { readonly ok: false; readonly result: InvalidResult };

/**
 * Shared front door for every validator: rejects non-strings and blanks so
 * each validator can get straight to the part that is specific to it.
 */
export function clean(input: unknown): Cleaned {
  if (typeof input !== 'string') {
    const received = input === null ? 'null' : typeof input;
    return {
      ok: false,
      result: invalid(
        'NOT_A_STRING',
        `Expected a string, received ${received}.`,
      ),
    };
  }

  const value = input.trim();
  if (value.length === 0) {
    return {
      ok: false,
      result: invalid('EMPTY', 'Expected a value, received an empty string.'),
    };
  }

  return { ok: true, value };
}
