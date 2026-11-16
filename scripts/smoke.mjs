// Imports the published package as ESM and exercises each validator against
// an installed tarball, not against src/, so it checks what users download.
//
// Every check comes in a pair - one value that must be accepted and one that
// must be rejected - so that validation broken to accept everything fails
// here rather than shipping.
import assert from 'node:assert/strict';

import {
  isPan,
  maskAadhaar,
  validateAadhaar,
  validateGstin,
  validateMobile,
  validateVehicleNumber,
} from 'bharat-validate';

assert.equal(validateAadhaar('9999 4105 7058').valid, true);
assert.equal(validateAadhaar('999941057059').valid, false);
assert.equal(maskAadhaar('999941057058'), 'XXXX XXXX 7058');

const gstin = validateGstin('27AAPFU0939F1ZV');
assert.equal(gstin.valid, true);
assert.equal(gstin.stateName, 'Maharashtra');
assert.equal(validateGstin('27AAPFU0939F1ZX').valid, false);

assert.equal(validateMobile('+91 98765-43210').e164, '+919876543210');
assert.equal(validateMobile('1234567890').valid, false);

assert.equal(isPan('ABCPK1234F'), true);
assert.equal(isPan('ABCXK1234F'), false);

assert.equal(validateVehicleNumber('21BH1234AA').registrationYear, 2021);
assert.equal(validateVehicleNumber('XX12AB1234').valid, false);

console.log(`ESM  ok on Node ${process.version}`);
