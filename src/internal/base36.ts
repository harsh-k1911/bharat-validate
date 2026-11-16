/**
 * The mod-36 check character used by GSTIN.
 *
 * Unlike the PAN check character, the GSTIN algorithm is published by the
 * GST Network, so it can be verified entirely offline.
 */

/** Digit values for the GSTIN checksum: '0'-'9' are 0-9, 'A'-'Z' are 10-35. */
export const BASE36_ALPHABET = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';

/**
 * Computes the fifteenth character of a GSTIN from the first fourteen.
 *
 * Each character is weighted alternately by 1 and 2 from the left. Products
 * are folded back under 36 (quotient plus remainder, the mod-36 cousin of the
 * digit-sum step in Luhn), summed, and subtracted from the next multiple of
 * 36.
 *
 * @param first14 The first fourteen characters of a GSTIN, uppercase.
 * @throws TypeError if the input is not fourteen base-36 characters.
 *
 * @example
 * gstinCheckCharacter('27AAPFU0939F1Z'); // 'V'
 */
export function gstinCheckCharacter(first14: string): string {
  if (first14.length !== 14) {
    throw new TypeError(
      `gstinCheckCharacter: expected exactly 14 characters, received ${first14.length}.`,
    );
  }

  let sum = 0;
  for (let i = 0; i < 14; i += 1) {
    const character = first14[i]!;
    const value = BASE36_ALPHABET.indexOf(character);
    if (value < 0) {
      throw new TypeError(
        `gstinCheckCharacter: expected 0-9 or A-Z, found ${JSON.stringify(character)}.`,
      );
    }

    // Weight 1 for odd positions, 2 for even positions (1-indexed).
    const product = value * (i % 2 === 0 ? 1 : 2);
    sum += Math.floor(product / 36) + (product % 36);
  }

  return BASE36_ALPHABET[(36 - (sum % 36)) % 36]!;
}
