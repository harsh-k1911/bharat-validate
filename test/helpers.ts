import { strict as assert } from 'node:assert';

import type { InvalidResult } from '../src/internal/result.ts';

/**
 * Asserts that a validator rejected its input and returns the failure.
 *
 * Calling a validator twice inside one assertion defeats TypeScript's
 * narrowing, so tests funnel rejections through here instead.
 */
export function rejection(result: { readonly valid: boolean }): InvalidResult {
  assert.equal(result.valid, false, 'expected this value to be rejected');
  return result as unknown as InvalidResult;
}
