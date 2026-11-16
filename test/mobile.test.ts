import { strict as assert } from 'node:assert';
import { describe, it } from 'node:test';

import { rejection } from './helpers.ts';

import { isMobile, validateMobile } from '../src/mobile.ts';

describe('validateMobile', () => {
  it('normalises every common way of writing the country code', () => {
    for (const written of [
      '9876543210',
      '+919876543210',
      '+91 98765 43210',
      '+91-98765-43210',
      '09876543210',
      '919876543210',
      '0091 9876543210',
      '(98765) 43210',
    ]) {
      const result = validateMobile(written);
      assert.equal(result.valid, true, `rejected ${written}`);
      if (!result.valid) continue;
      assert.equal(result.value, '9876543210', `wrong value for ${written}`);
      assert.equal(result.e164, '+919876543210');
    }
  });

  it('formats the national form the way Indians write it', () => {
    const result = validateMobile('9876543210');
    assert.equal(result.valid && result.national, '98765 43210');
  });

  it('does not mistake a leading 91 for a country code', () => {
    // 9123456789 is a real ten-digit mobile number starting with 9.
    const result = validateMobile('9123456789');
    assert.equal(result.valid, true);
    assert.equal(result.valid && result.value, '9123456789');
  });

  it('accepts every valid starting digit', () => {
    for (const first of '6789') {
      assert.equal(
        validateMobile(`${first}876543210`).valid,
        true,
        `rejected a number starting with ${first}`,
      );
    }
  });

  it('rejects starting digits India does not assign to mobiles', () => {
    for (const first of '012345') {
      const result = validateMobile(`${first}87654321`);
      assert.equal(result.valid, false, `accepted ${first}87654321`);
    }
  });

  it('reports length problems', () => {
    assert.equal(rejection(validateMobile('98765')).error, 'BAD_LENGTH');
  });

  it('rejects letters', () => {
    assert.equal(rejection(validateMobile('98765abcde')).error, 'BAD_FORMAT');
  });
});

describe('isMobile', () => {
  it('is a boolean shorthand', () => {
    assert.equal(isMobile('+91 98765 43210'), true);
    assert.equal(isMobile('1234567890'), false);
  });
});
