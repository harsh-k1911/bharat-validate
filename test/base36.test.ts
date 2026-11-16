import { strict as assert } from 'node:assert';
import { describe, it } from 'node:test';

import {
  BASE36_ALPHABET,
  gstinCheckCharacter,
} from '../src/internal/base36.ts';

describe('gstinCheckCharacter', () => {
  it('reproduces the check character of real GSTINs', () => {
    // Each of these is a publicly listed GSTIN; the fifteenth character is
    // removed and recomputed from the first fourteen.
    const known = [
      '27AAPFU0939F1ZV',
      '29AAGCB7383J1Z4',
      '19AAACT2727Q1ZT',
      '24AAACC1206D1ZM',
    ];

    for (const gstin of known) {
      assert.equal(
        gstinCheckCharacter(gstin.slice(0, 14)),
        gstin[14],
        `wrong check character for ${gstin}`,
      );
    }
  });

  it('always returns one character from the base-36 alphabet', () => {
    const samples = [
      '27AAPFU0939F1Z',
      '07AAACT2727Q1Z',
      '36ZZZZZ9999Z9Z',
      '01AAAAA0001A1Z',
    ];

    for (const sample of samples) {
      const character = gstinCheckCharacter(sample);
      assert.equal(character.length, 1);
      assert.ok(
        BASE36_ALPHABET.includes(character),
        `${character} is outside the alphabet`,
      );
    }
  });

  it('is deterministic', () => {
    assert.equal(
      gstinCheckCharacter('27AAPFU0939F1Z'),
      gstinCheckCharacter('27AAPFU0939F1Z'),
    );
  });

  it('detects a single-character change somewhere in the GSTIN', () => {
    const base = '27AAPFU0939F1Z';
    const expected = gstinCheckCharacter(base);

    let detected = 0;
    let total = 0;
    for (let position = 0; position < base.length; position += 1) {
      for (const replacement of BASE36_ALPHABET) {
        if (replacement === base[position]) continue;
        const corrupted =
          base.slice(0, position) + replacement + base.slice(position + 1);
        total += 1;
        if (gstinCheckCharacter(corrupted) !== expected) detected += 1;
      }
    }

    // A mod-36 scheme cannot catch everything, but it should catch the
    // overwhelming majority of single-character slips.
    assert.ok(
      detected / total > 0.9,
      `only caught ${detected}/${total} single-character changes`,
    );
  });

  it('rejects input of the wrong length', () => {
    assert.throws(() => gstinCheckCharacter('27AAPFU0939F1'), TypeError);
    assert.throws(() => gstinCheckCharacter('27AAPFU0939F1ZV'), TypeError);
    assert.throws(() => gstinCheckCharacter(''), TypeError);
  });

  it('rejects characters outside 0-9 and A-Z', () => {
    assert.throws(() => gstinCheckCharacter('27aapfu0939f1z'), TypeError);
    assert.throws(() => gstinCheckCharacter('27AAPFU0939F1-'), TypeError);
  });
});
