import { strict as assert } from 'node:assert';
import { describe, it } from 'node:test';

import { rejection } from './helpers.ts';

import { isPincode, validatePincode } from '../src/pincode.ts';

describe('validatePincode', () => {
  it('names the postal zone', () => {
    const mumbai = validatePincode('400001');
    assert.equal(mumbai.valid, true);
    if (!mumbai.valid) return;
    assert.equal(mumbai.zoneDigit, '4');
    assert.equal(mumbai.zone, 'Western');
    assert.ok(mumbai.states.includes('Maharashtra'));
    assert.equal(mumbai.isArmyPostalService, false);
  });

  it('ignores spaces', () => {
    assert.equal(validatePincode('400 001').valid, true);
  });

  it('flags Army Postal Service codes', () => {
    const result = validatePincode('900001');
    assert.equal(result.valid, true);
    if (!result.valid) return;
    assert.equal(result.isArmyPostalService, true);
    assert.equal(result.zone, 'Army Postal Service');
  });

  it('rejects a leading zero', () => {
    const result = validatePincode('012345');
    assert.equal(result.valid === false && result.error, 'RESERVED_PREFIX');
  });

  it('reports length and format problems separately', () => {
    assert.equal(rejection(validatePincode('40001')).error, 'BAD_LENGTH');
    assert.equal(rejection(validatePincode('4000A1')).error, 'BAD_FORMAT');
  });

  it('covers every zone digit 1 to 9', () => {
    for (const digit of '123456789') {
      const result = validatePincode(`${digit}00001`);
      assert.equal(result.valid, true, `zone ${digit} failed`);
    }
  });
});

describe('isPincode', () => {
  it('is a boolean shorthand', () => {
    assert.equal(isPincode('110001'), true);
    assert.equal(isPincode('000000'), false);
  });
});
