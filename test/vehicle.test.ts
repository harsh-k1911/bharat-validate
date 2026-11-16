import { strict as assert } from 'node:assert';
import { describe, it } from 'node:test';

import { isVehicleNumber, validateVehicleNumber } from '../src/vehicle.ts';

describe('validateVehicleNumber', () => {
  it('breaks a standard plate into its parts', () => {
    const result = validateVehicleNumber('MH 12 AB 1234');
    assert.equal(result.valid, true);
    if (!result.valid) return;
    assert.equal(result.kind, 'standard');
    assert.equal(result.value, 'MH12AB1234');
    assert.equal(result.stateCode, 'MH');
    assert.equal(result.stateName, 'Maharashtra');
    assert.equal(result.rtoCode, '12');
    assert.equal(result.series, 'AB');
    assert.equal(result.number, '1234');
    assert.equal(result.formatted, 'MH 12 AB 1234');
    assert.equal(result.registrationYear, null);
  });

  it('handles a single-digit RTO and a three-letter series', () => {
    const result = validateVehicleNumber('DL1CAB1234');
    assert.equal(result.valid, true);
    if (!result.valid) return;
    assert.equal(result.stateName, 'Delhi');
    assert.equal(result.rtoCode, '1');
    assert.equal(result.series, 'CAB');
  });

  it('reads a Bharat series plate', () => {
    const result = validateVehicleNumber('21BH1234AA');
    assert.equal(result.valid, true);
    if (!result.valid) return;
    assert.equal(result.kind, 'bharat-series');
    assert.equal(result.registrationYear, 2021);
    assert.equal(result.number, '1234');
    assert.equal(result.series, 'AA');
    // A BH plate is not tied to a state, which is the whole point of it.
    assert.equal(result.stateCode, null);
    assert.equal(result.stateName, null);
  });

  it('knows the states that changed their code', () => {
    assert.equal(
      validateVehicleNumber('OR01AB1234').valid &&
        validateVehicleNumber('OR01AB1234').valid,
      true,
    );
    const newer = validateVehicleNumber('OD01AB1234');
    assert.equal(newer.valid && newer.stateName, 'Odisha');
  });

  it('rejects a state code that does not exist', () => {
    const result = validateVehicleNumber('XX12AB1234');
    assert.equal(result.valid === false && result.error, 'UNKNOWN_STATE_CODE');
  });

  it('rejects malformed plates', () => {
    for (const plate of ['MH12AB12345', 'MH12341234', '12MHAB1234', 'MHAB1234']) {
      const result = validateVehicleNumber(plate);
      assert.equal(result.valid, false, `accepted ${plate}`);
    }
  });
});

describe('isVehicleNumber', () => {
  it('is a boolean shorthand', () => {
    assert.equal(isVehicleNumber('KA01AB1234'), true);
    assert.equal(isVehicleNumber('ZZ01AB1234'), false);
  });
});
