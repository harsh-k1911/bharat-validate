import { strict as assert } from 'node:assert';
import { describe, it } from 'node:test';

import * as bharat from '../src/index.ts';

describe('public API', () => {
  it('exports a validate and an is function for every identifier', () => {
    const identifiers = [
      'Aadhaar',
      'Pan',
      'Gstin',
      'Ifsc',
      'Upi',
      'Pincode',
      'Mobile',
      'VehicleNumber',
    ];

    for (const name of identifiers) {
      assert.equal(
        typeof (bharat as Record<string, unknown>)[`validate${name}`],
        'function',
        `missing validate${name}`,
      );
      assert.equal(
        typeof (bharat as Record<string, unknown>)[`is${name}`],
        'function',
        `missing is${name}`,
      );
    }
  });

  it('exports the reference tables and the checksum helpers', () => {
    assert.equal(typeof bharat.GST_STATE_CODES, 'object');
    assert.equal(typeof bharat.PIN_ZONES, 'object');
    assert.equal(typeof bharat.UPI_HANDLES, 'object');
    assert.equal(typeof bharat.VEHICLE_STATE_CODES, 'object');
    assert.equal(typeof bharat.verhoeffCheckDigit, 'function');
    assert.equal(typeof bharat.gstinCheckCharacter, 'function');
  });

  it('gives every validator the same shape of failure', () => {
    const validators = [
      bharat.validateAadhaar,
      bharat.validatePan,
      bharat.validateGstin,
      bharat.validateIfsc,
      bharat.validateUpi,
      bharat.validatePincode,
      bharat.validateMobile,
      bharat.validateVehicleNumber,
    ];

    for (const validate of validators) {
      const result = validate(undefined);
      assert.equal(result.valid, false);
      if (result.valid) continue;
      assert.equal(result.error, 'NOT_A_STRING');
      assert.equal(typeof result.message, 'string');
      assert.ok(result.message.length > 0);
    }
  });
});
