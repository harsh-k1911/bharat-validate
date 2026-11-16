import { strict as assert } from 'node:assert';
import { describe, it } from 'node:test';

import { rejection } from './helpers.ts';

import { isPan, validatePan } from '../src/pan.ts';

describe('validatePan', () => {
  it('accepts a well-formed PAN and decodes it', () => {
    const result = validatePan('ABCPK1234F');
    assert.equal(result.valid, true);
    if (!result.valid) return;
    assert.equal(result.value, 'ABCPK1234F');
    assert.equal(result.holderTypeCode, 'P');
    assert.equal(result.holderType, 'Individual');
    assert.equal(result.nameInitial, 'K');
  });

  it('uppercases lowercase input', () => {
    const result = validatePan('  abcpk1234f ');
    assert.equal(result.valid && result.value, 'ABCPK1234F');
  });

  it('decodes each holder category', () => {
    const cases: ReadonlyArray<readonly [string, string]> = [
      ['ABCCK1234F', 'Company'],
      ['ABCHK1234F', 'Hindu Undivided Family (HUF)'],
      ['ABCFK1234F', 'Firm or Limited Liability Partnership'],
      ['ABCTK1234F', 'Trust'],
      ['ABCGK1234F', 'Government'],
    ];
    for (const [pan, expected] of cases) {
      const result = validatePan(pan);
      assert.equal(result.valid && result.holderType, expected, `for ${pan}`);
    }
  });

  it('never claims to have verified the check character', () => {
    const result = validatePan('ABCPK1234F');
    // The Income Tax Department has not published the algorithm.
    assert.equal(result.valid && result.checksumVerified, false);
  });

  it('rejects an unknown holder category', () => {
    const result = validatePan('ABCXK1234F');
    assert.equal(result.valid, false);
    if (result.valid) return;
    assert.equal(result.error, 'UNKNOWN_HOLDER_TYPE');
  });

  it('rejects the 0000 block, which is never issued', () => {
    const result = validatePan('ABCPK0000F');
    assert.equal(result.valid === false && result.error, 'BAD_FORMAT');
  });

  it('rejects the wrong shape or length', () => {
    assert.equal(rejection(validatePan('ABCP1234F')).error, 'BAD_LENGTH');
    assert.equal(rejection(validatePan('ABC1K1234F')).error, 'BAD_FORMAT');
    assert.equal(rejection(validatePan('ABCPK12345')).error, 'BAD_FORMAT');
  });
});

describe('isPan', () => {
  it('is a boolean shorthand', () => {
    assert.equal(isPan('ABCPK1234F'), true);
    assert.equal(isPan('NOTAPAN'), false);
  });
});
