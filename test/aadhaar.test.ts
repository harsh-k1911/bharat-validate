import { strict as assert } from 'node:assert';
import { describe, it } from 'node:test';

import { rejection } from './helpers.ts';

import { isAadhaar, maskAadhaar, validateAadhaar } from '../src/aadhaar.ts';

// Published by UIDAI for integration testing: real check digits, no resident.
const SANDBOX = ['999941057058', '999971658847', '999933119405'];

describe('validateAadhaar', () => {
  it('accepts UIDAI sandbox numbers', () => {
    for (const number of SANDBOX) {
      assert.equal(validateAadhaar(number).valid, true, `rejected ${number}`);
    }
  });

  it('ignores spaces and hyphens', () => {
    const spaced = validateAadhaar('9999 4105 7058');
    const hyphened = validateAadhaar('9999-4105-7058');
    assert.equal(spaced.valid, true);
    assert.equal(hyphened.valid, true);
    assert.equal(spaced.valid && spaced.value, '999941057058');
  });

  it('returns a formatted and a masked form', () => {
    const result = validateAadhaar('999941057058');
    assert.equal(result.valid, true);
    if (!result.valid) return;
    assert.equal(result.formatted, '9999 4105 7058');
    assert.equal(result.masked, 'XXXX XXXX 7058');
  });

  it('rejects a number whose check digit is wrong', () => {
    const result = validateAadhaar('999941057059');
    assert.equal(result.valid, false);
    if (result.valid) return;
    assert.equal(result.error, 'BAD_CHECKSUM');
  });

  it('rejects the usual placeholder', () => {
    const result = validateAadhaar('123456789012');
    assert.equal(result.valid, false);
    if (result.valid) return;
    assert.equal(result.error, 'RESERVED_PREFIX');
  });

  it('rejects numbers starting with 0 or 1', () => {
    for (const number of ['012345678901', '112345678901']) {
      const result = validateAadhaar(number);
      assert.equal(result.valid, false);
      if (result.valid) return;
      assert.equal(result.error, 'RESERVED_PREFIX');
    }
  });

  it('reports length and format problems separately', () => {
    const short = validateAadhaar('99994105705');
    assert.equal(short.valid === false && short.error, 'BAD_LENGTH');

    const letters = validateAadhaar('99994105705X');
    assert.equal(letters.valid === false && letters.error, 'BAD_FORMAT');
  });

  it('rejects non-strings and blanks', () => {
    assert.equal(rejection(validateAadhaar(999941057058)).error, 'NOT_A_STRING');
    assert.equal(rejection(validateAadhaar(null)).error, 'NOT_A_STRING');
    assert.equal(rejection(validateAadhaar('   ')).error, 'EMPTY');
  });
});

describe('isAadhaar', () => {
  it('is a boolean shorthand', () => {
    assert.equal(isAadhaar('9999 4105 7058'), true);
    assert.equal(isAadhaar('123456789012'), false);
  });
});

describe('maskAadhaar', () => {
  it('hides everything but the last four digits', () => {
    assert.equal(maskAadhaar('999941057058'), 'XXXX XXXX 7058');
    assert.equal(maskAadhaar('9999 4105 7058'), 'XXXX XXXX 7058');
  });

  it('refuses anything that is not twelve digits', () => {
    assert.throws(() => maskAadhaar('12345'), TypeError);
  });
});
