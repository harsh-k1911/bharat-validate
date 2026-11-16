import { strict as assert } from 'node:assert';
import { describe, it } from 'node:test';

import { rejection } from './helpers.ts';

import { isGstin, validateGstin } from '../src/gstin.ts';

const REAL = [
  '27AAPFU0939F1ZV',
  '29AAGCB7383J1Z4',
  '19AAACT2727Q1ZT',
  '24AAACC1206D1ZM',
];

describe('validateGstin', () => {
  it('accepts real GSTINs', () => {
    for (const gstin of REAL) {
      assert.equal(validateGstin(gstin).valid, true, `rejected ${gstin}`);
    }
  });

  it('decodes the state, PAN and entity number', () => {
    const result = validateGstin('27AAPFU0939F1ZV');
    assert.equal(result.valid, true);
    if (!result.valid) return;
    assert.equal(result.stateCode, '27');
    assert.equal(result.stateName, 'Maharashtra');
    assert.equal(result.pan, 'AAPFU0939F');
    assert.equal(result.entityNumber, '1');
    assert.equal(result.checkCharacter, 'V');
  });

  it('uppercases lowercase input', () => {
    assert.equal(validateGstin('27aapfu0939f1zv').valid, true);
  });

  it('rejects a wrong check character', () => {
    const result = validateGstin('27AAPFU0939F1ZX');
    assert.equal(result.valid, false);
    if (result.valid) return;
    assert.equal(result.error, 'BAD_CHECKSUM');
    assert.match(result.message, /should be "V"/);
  });

  it('rejects an unassigned state code', () => {
    // 50 is not an assigned GST state code.
    const result = validateGstin('50AAPFU0939F1ZV');
    assert.equal(result.valid === false && result.error, 'UNKNOWN_STATE_CODE');
  });

  it('requires the literal Z in position fourteen', () => {
    const result = validateGstin('27AAPFU0939F1YV');
    assert.equal(result.valid === false && result.error, 'BAD_FORMAT');
  });

  it('reports length problems', () => {
    assert.equal(rejection(validateGstin('27AAPFU0939F1Z')).error, 'BAD_LENGTH');
  });
});

describe('isGstin', () => {
  it('is a boolean shorthand', () => {
    assert.equal(isGstin('27AAPFU0939F1ZV'), true);
    assert.equal(isGstin('27AAPFU0939F1ZX'), false);
  });
});
