// The CommonJS half of the smoke test: `require` must resolve to the cjs
// build and behave identically to the ESM one.
//
// Every check comes in a pair - one value that must be accepted and one that
// must be rejected. A smoke test that only feeds in valid input would still
// pass if validation were broken to accept everything.
const assert = require('node:assert/strict');

const {
  gstinCheckCharacter,
  validateAadhaar,
  validateGstin,
  validatePincode,
  validateUpi,
  verhoeffCheckDigit,
  verhoeffValidate,
} = require('bharat-validate');

// Aadhaar: the second number differs only in its check digit.
assert.equal(validateAadhaar('999941057058').valid, true);
assert.equal(validateAadhaar('999941057059').valid, false);

// The checksum primitives themselves.
assert.equal(verhoeffCheckDigit('236'), 3);
assert.equal(verhoeffValidate('2363'), true);
assert.equal(verhoeffValidate('2364'), false);
assert.equal(gstinCheckCharacter('27AAPFU0939F1Z'), 'V');

// GSTIN: same string, wrong final character.
assert.equal(validateGstin('27AAPFU0939F1ZV').valid, true);
assert.equal(validateGstin('27AAPFU0939F1ZX').valid, false);

const pincode = validatePincode('400001');
assert.equal(pincode.valid, true);
assert.equal(pincode.zone, 'Western');
assert.equal(validatePincode('012345').valid, false);

assert.equal(validateUpi('Harsh@okhdfcbank').handle, 'okhdfcbank');
assert.equal(validateUpi('no-at-sign').valid, false);

console.log(`CJS  ok on Node ${process.version}`);
