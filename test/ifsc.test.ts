import { strict as assert } from 'node:assert';
import { describe, it } from 'node:test';

import { rejection } from './helpers.ts';

import { isIfsc, validateIfsc } from '../src/ifsc.ts';

describe('validateIfsc', () => {
  it('accepts a well-formed code and splits it', () => {
    const result = validateIfsc('HDFC0000123');
    assert.equal(result.valid, true);
    if (!result.valid) return;
    assert.equal(result.bankCode, 'HDFC');
    assert.equal(result.branchCode, '000123');
  });

  it('uppercases and strips separators', () => {
    assert.equal(validateIfsc(' sbin0001234 ').valid, true);
  });

  it('requires the reserved zero in position five', () => {
    const result = validateIfsc('HDFC1000123');
    assert.equal(result.valid === false && result.error, 'BAD_FORMAT');
  });

  it('rejects digits in the bank code', () => {
    assert.equal(rejection(validateIfsc('HD1C0000123')).error, 'BAD_FORMAT');
  });

  it('reports length problems', () => {
    assert.equal(rejection(validateIfsc('HDFC000012')).error, 'BAD_LENGTH');
  });
});

describe('isIfsc', () => {
  it('is a boolean shorthand', () => {
    assert.equal(isIfsc('HDFC0000123'), true);
    assert.equal(isIfsc('HDFC1000123'), false);
  });
});
