import { strict as assert } from 'node:assert';
import { describe, it } from 'node:test';

import {
  verhoeffCheckDigit,
  verhoeffValidate,
} from '../src/internal/verhoeff.ts';

/** Deterministic PRNG, so a failing property test is reproducible. */
function mulberry32(seed: number): () => number {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function randomDigits(random: () => number, length: number): string {
  let out = '';
  for (let i = 0; i < length; i += 1) out += Math.floor(random() * 10);
  return out;
}

/** A 12-digit number carrying a correct Verhoeff check digit. */
function validNumber(random: () => number): string {
  const payload = randomDigits(random, 11);
  return payload + verhoeffCheckDigit(payload);
}

describe('verhoeffCheckDigit', () => {
  it('matches the published reference vector', () => {
    // 236 -> 3 is the worked example used throughout the literature.
    assert.equal(verhoeffCheckDigit('236'), 3);
  });

  it('appends a digit that validates', () => {
    const random = mulberry32(1);
    for (let i = 0; i < 500; i += 1) {
      const payload = randomDigits(random, 11);
      const full = payload + verhoeffCheckDigit(payload);
      assert.equal(verhoeffValidate(full), true, `failed for ${full}`);
    }
  });

  it('is the only digit of the ten that validates', () => {
    const random = mulberry32(2);
    for (let i = 0; i < 100; i += 1) {
      const payload = randomDigits(random, 11);
      const accepted = [...'0123456789'].filter((d) =>
        verhoeffValidate(payload + d),
      );
      assert.deepEqual(accepted, [String(verhoeffCheckDigit(payload))]);
    }
  });

  it('rejects anything that is not a digit', () => {
    assert.throws(() => verhoeffCheckDigit('12a4'), TypeError);
    assert.throws(() => verhoeffCheckDigit('12 4'), TypeError);
    assert.throws(() => verhoeffCheckDigit('१२३'), TypeError);
    assert.throws(() => verhoeffCheckDigit(''), TypeError);
  });
});

describe('verhoeffValidate', () => {
  it('accepts the published reference vector and rejects a corruption', () => {
    assert.equal(verhoeffValidate('2363'), true);
    assert.equal(verhoeffValidate('2364'), false);
  });

  it("accepts UIDAI's published sandbox Aadhaar numbers", () => {
    // Published by UIDAI for integration testing, so they carry real check
    // digits while belonging to no actual resident.
    for (const number of [
      '999941057058',
      '999971658847',
      '999933119405',
      '999999990019',
    ]) {
      assert.equal(verhoeffValidate(number), true, `rejected ${number}`);
    }
  });

  it('rejects the sequential number people use as a placeholder', () => {
    assert.equal(verhoeffValidate('123456789012'), false);
  });

  // The two guarantees that make Verhoeff worth using over a mod-10 sum.
  it('detects every single-digit error', () => {
    const random = mulberry32(3);
    for (let i = 0; i < 100; i += 1) {
      const number = validNumber(random);
      for (let position = 0; position < number.length; position += 1) {
        for (const replacement of '0123456789') {
          if (replacement === number[position]) continue;
          const corrupted =
            number.slice(0, position) + replacement + number.slice(position + 1);
          assert.equal(
            verhoeffValidate(corrupted),
            false,
            `missed a single-digit error: ${number} -> ${corrupted}`,
          );
        }
      }
    }
  });

  it('detects every transposition of two adjacent digits', () => {
    const random = mulberry32(4);
    for (let i = 0; i < 200; i += 1) {
      const number = validNumber(random);
      for (let position = 0; position < number.length - 1; position += 1) {
        const a = number[position]!;
        const b = number[position + 1]!;
        if (a === b) continue;
        const corrupted =
          number.slice(0, position) + b + a + number.slice(position + 2);
        assert.equal(
          verhoeffValidate(corrupted),
          false,
          `missed a transposition: ${number} -> ${corrupted}`,
        );
      }
    }
  });

  it('rejects anything that is not a digit', () => {
    assert.throws(() => verhoeffValidate('9999-4105-7058'), TypeError);
    assert.throws(() => verhoeffValidate(''), TypeError);
  });
});
