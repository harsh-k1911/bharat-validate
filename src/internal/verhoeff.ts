/**
 * The Verhoeff check-digit algorithm (J. Verhoeff, 1969).
 *
 * Verhoeff works over the dihedral group of order 10, which is what lets it
 * catch every single-digit error and every transposition of two adjacent
 * digits - the two mistakes people actually make when copying numbers by
 * hand. A plain mod-10 sum catches neither reliably.
 *
 * UIDAI uses it for the twelfth digit of an Aadhaar number, which is why a
 * regex alone cannot tell a real Aadhaar number from twelve random digits.
 */

/** Multiplication table for the dihedral group D5. */
const D: readonly (readonly number[])[] = [
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
  [1, 2, 3, 4, 0, 6, 7, 8, 9, 5],
  [2, 3, 4, 0, 1, 7, 8, 9, 5, 6],
  [3, 4, 0, 1, 2, 8, 9, 5, 6, 7],
  [4, 0, 1, 2, 3, 9, 5, 6, 7, 8],
  [5, 9, 8, 7, 6, 0, 4, 3, 2, 1],
  [6, 5, 9, 8, 7, 1, 0, 4, 3, 2],
  [7, 6, 5, 9, 8, 2, 1, 0, 4, 3],
  [8, 7, 6, 5, 9, 3, 2, 1, 0, 4],
  [9, 8, 7, 6, 5, 4, 3, 2, 1, 0],
];

/** Permutation table, applied cyclically by position. */
const P: readonly (readonly number[])[] = [
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
  [1, 5, 7, 6, 2, 8, 3, 0, 9, 4],
  [5, 8, 0, 3, 7, 9, 6, 1, 4, 2],
  [8, 9, 1, 6, 0, 4, 3, 5, 2, 7],
  [9, 4, 5, 3, 1, 2, 6, 8, 7, 0],
  [4, 2, 8, 6, 5, 7, 3, 9, 0, 1],
  [2, 7, 9, 3, 8, 0, 6, 4, 1, 5],
  [7, 0, 4, 6, 9, 1, 3, 2, 5, 8],
];

/** Multiplicative inverse within D5. */
const INV: readonly number[] = [0, 4, 3, 2, 1, 5, 6, 7, 8, 9];

function digitsOf(value: string, caller: string): number[] {
  const digits: number[] = [];
  for (const character of value) {
    const digit = character.charCodeAt(0) - 48;
    if (digit < 0 || digit > 9) {
      throw new TypeError(
        `${caller}: expected only the digits 0-9, found ${JSON.stringify(character)}.`,
      );
    }
    digits.push(digit);
  }
  if (digits.length === 0) {
    throw new TypeError(`${caller}: expected at least one digit.`);
  }
  return digits;
}

/**
 * Computes the Verhoeff check digit for a payload that does not yet have one.
 *
 * @param payload Digits only, without a check digit.
 * @returns The digit that should be appended to `payload`.
 * @throws TypeError if `payload` contains anything but the digits 0-9.
 *
 * @example
 * verhoeffCheckDigit('236'); // 3, so '2363' is a valid Verhoeff number
 */
export function verhoeffCheckDigit(payload: string): number {
  const digits = digitsOf(payload, 'verhoeffCheckDigit');

  // Walk right to left. The check digit will occupy position 0 once
  // appended, so the rightmost payload digit sits at position 1.
  let checksum = 0;
  for (let i = 0; i < digits.length; i += 1) {
    const digit = digits[digits.length - 1 - i]!;
    checksum = D[checksum]![P[(i + 1) % 8]![digit]!]!;
  }

  return INV[checksum]!;
}

/**
 * Checks a number whose final digit is already a Verhoeff check digit.
 *
 * @param value Digits only, including the trailing check digit.
 * @throws TypeError if `value` contains anything but the digits 0-9.
 *
 * @example
 * verhoeffValidate('2363'); // true
 * verhoeffValidate('2364'); // false
 */
export function verhoeffValidate(value: string): boolean {
  const digits = digitsOf(value, 'verhoeffValidate');

  let checksum = 0;
  for (let i = 0; i < digits.length; i += 1) {
    const digit = digits[digits.length - 1 - i]!;
    checksum = D[checksum]![P[i % 8]![digit]!]!;
  }

  return checksum === 0;
}
