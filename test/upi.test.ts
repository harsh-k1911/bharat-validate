import { strict as assert } from 'node:assert';
import { describe, it } from 'node:test';

import { isUpi, validateUpi } from '../src/upi.ts';

describe('validateUpi', () => {
  it('splits the identifier from the handle', () => {
    const result = validateUpi('harsh@okhdfcbank');
    assert.equal(result.valid, true);
    if (!result.valid) return;
    assert.equal(result.identifier, 'harsh');
    assert.equal(result.handle, 'okhdfcbank');
    assert.equal(result.provider, 'Google Pay (HDFC Bank)');
  });

  it('lowercases the whole ID', () => {
    const result = validateUpi('Harsh@OkHdfcBank');
    assert.equal(result.valid && result.value, 'harsh@okhdfcbank');
  });

  it('accepts a handle it does not know, with a null provider', () => {
    const result = validateUpi('someone@brandnewbank');
    assert.equal(result.valid, true);
    if (!result.valid) return;
    // An unknown handle must never make a real UPI ID fail.
    assert.equal(result.provider, null);
  });

  it('accepts dots, hyphens and underscores in the identifier', () => {
    for (const id of ['first.last@ybl', 'a_b@paytm', 'nine-nine@apl']) {
      assert.equal(validateUpi(id).valid, true, `rejected ${id}`);
    }
  });

  it('requires exactly one @', () => {
    for (const id of ['noathere', 'two@at@signs']) {
      const result = validateUpi(id);
      assert.equal(result.valid === false && result.error, 'BAD_FORMAT');
    }
  });

  it('rejects a handle that starts with a digit', () => {
    assert.equal(validateUpi('harsh@1bank').valid, false);
  });

  it('rejects an empty side', () => {
    assert.equal(validateUpi('@okaxis').valid, false);
    assert.equal(validateUpi('harsh@').valid, false);
  });
});

describe('isUpi', () => {
  it('is a boolean shorthand', () => {
    assert.equal(isUpi('harsh@okaxis'), true);
    assert.equal(isUpi('harsh'), false);
  });
});
