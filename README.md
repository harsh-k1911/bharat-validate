# bharat-validate

Validate and parse Indian identifiers — Aadhaar, PAN, GSTIN, IFSC, UPI ID, PIN code, mobile numbers and vehicle registrations — with **real checksums, not just regexes**.

[![npm version](https://img.shields.io/npm/v/bharat-validate.svg)](https://www.npmjs.com/package/bharat-validate)
[![types](https://img.shields.io/npm/types/bharat-validate.svg)](https://www.npmjs.com/package/bharat-validate)
[![dependencies](https://img.shields.io/badge/dependencies-0-brightgreen.svg)](./package.json)
[![license](https://img.shields.io/npm/l/bharat-validate.svg)](./LICENSE)

## Why this exists

Most Indian apps validate Aadhaar with a regex like `/^[2-9][0-9]{11}$/`. That regex happily accepts twelve twos:

```js
/^[2-9][0-9]{11}$/.test('222222222222');  // true  ← not a real Aadhaar number
```

Aadhaar's twelfth digit is a [Verhoeff](https://en.wikipedia.org/wiki/Verhoeff_algorithm) check digit. GSTIN's fifteenth character is a published mod-36 checksum. Checking them is the difference between "looks about right" and "could actually have been issued":

```js
import { isAadhaar } from 'bharat-validate';

isAadhaar('222222222222');   // false — check digit does not match
isAadhaar('9999 4105 7058'); // true
```

That single digit catches every typo'd digit and every pair of swapped adjacent digits — the two mistakes people actually make when copying a number off a card.

## Install

```sh
npm install bharat-validate
```

Zero runtime dependencies. Ships ESM and CommonJS builds with TypeScript types. Node 18+.

## Quick start

Every identifier has two functions: `isX` for a boolean, and `validateX` for a result that explains a rejection and decodes a valid value.

```js
import { isGstin, validateGstin } from 'bharat-validate';

isGstin('27AAPFU0939F1ZV'); // true

const result = validateGstin('27AAPFU0939F1ZV');
if (result.valid) {
  console.log(result.stateName);   // 'Maharashtra'
  console.log(result.pan);         // 'AAPFU0939F'
} else {
  console.log(result.error);       // e.g. 'BAD_CHECKSUM'
  console.log(result.message);     // a sentence you can show a user
}
```

CommonJS works too:

```js
const { validateGstin } = require('bharat-validate');
```

## Validating a form

The `error` code is for your logic; the `message` is for your user.

```js
import { validateMobile } from 'bharat-validate';

const result = validateMobile(input.value);

if (!result.valid) {
  showError(result.message);  // "An Indian mobile number starts with 6, 7, 8 or 9."
  return;
}

save(result.e164);            // always '+919876543210', however it was typed
```

Every validator normalises before it checks, so `+91 98765-43210`, `09876543210` and `9876543210` all come back the same.

## API

### Aadhaar

```js
validateAadhaar('9999 4105 7058');
// { valid: true, value: '999941057058',
//   formatted: '9999 4105 7058', masked: 'XXXX XXXX 7058' }
```

| Field | Description |
| --- | --- |
| `value` | The twelve digits, separators removed |
| `formatted` | Grouped for display: `9999 4105 7058` |
| `masked` | `XXXX XXXX 7058` |

Verifies the Verhoeff check digit, and rejects numbers starting with `0` or `1`, which UIDAI never issues.

**`maskAadhaar(value)`** returns the masked form directly. UIDAI requires Aadhaar numbers to be masked wherever they are displayed or printed, so prefer it over showing the full number in a UI or a log.

```js
maskAadhaar('999941057058'); // 'XXXX XXXX 7058'
```

### PAN

```js
validatePan('ABCPK1234F');
// { valid: true, value: 'ABCPK1234F', holderTypeCode: 'P',
//   holderType: 'Individual', nameInitial: 'K', checksumVerified: false }
```

| Field | Description |
| --- | --- |
| `holderTypeCode` | Fourth character, e.g. `P` |
| `holderType` | What it means, e.g. `Individual` |
| `nameInitial` | Fifth character: first letter of the surname, or of the entity name |
| `checksumVerified` | Always `false` — see [below](#what-this-package-deliberately-does-not-do) |

Holder categories: `A` AOP · `B` BOI · `C` Company · `F` Firm/LLP · `G` Government · `H` HUF · `J` Artificial Juridical Person · `L` Local Authority · `P` Individual · `T` Trust. Also rejects the `0000` numeric block, which is never issued.

### GSTIN

```js
validateGstin('27AAPFU0939F1ZV');
// { valid: true, value: '27AAPFU0939F1ZV', stateCode: '27',
//   stateName: 'Maharashtra', pan: 'AAPFU0939F',
//   entityNumber: '1', checkCharacter: 'V' }
```

| Field | Description |
| --- | --- |
| `stateCode` / `stateName` | First two digits and the jurisdiction they name |
| `pan` | The PAN embedded at characters 3–12 |
| `entityNumber` | How many registrations this PAN holds in this state |
| `checkCharacter` | The fifteenth character, verified |

Verifies the mod-36 check character and rejects unassigned state codes.

### IFSC

```js
validateIfsc('HDFC0000123');
// { valid: true, value: 'HDFC0000123', bankCode: 'HDFC', branchCode: '000123' }
```

Structure only — an IFSC carries no check digit.

### UPI ID

```js
validateUpi('Harsh@okhdfcbank');
// { valid: true, value: 'harsh@okhdfcbank', identifier: 'harsh',
//   handle: 'okhdfcbank', provider: 'Google Pay (HDFC Bank)' }
```

`provider` is `null` for a handle we don't recognise. **That never makes the ID invalid** — new handles launch all the time, and rejecting them would break real payments.

### PIN code

```js
validatePincode('400001');
// { valid: true, value: '400001', zoneDigit: '4', zone: 'Western',
//   states: ['Maharashtra', 'Madhya Pradesh', 'Chhattisgarh', 'Goa'],
//   isArmyPostalService: false }
```

`isArmyPostalService` is `true` for zone 9, which is a field post office rather than a civilian address.

### Mobile number

```js
validateMobile('+91 98765-43210');
// { valid: true, value: '9876543210',
//   e164: '+919876543210', national: '98765 43210' }
```

Accepts `+91`, `0091`, `91` and a trunk `0`, plus any spaces, hyphens, dots or brackets. A bare `91` prefix is only stripped when the length proves it is a country code, so `9123456789` — a real number starting with 91 — survives intact.

### Vehicle registration

```js
validateVehicleNumber('MH 12 AB 1234');
// { valid: true, kind: 'standard', stateCode: 'MH', stateName: 'Maharashtra',
//   rtoCode: '12', series: 'AB', number: '1234', registrationYear: null, ... }

validateVehicleNumber('21BH1234AA');
// { valid: true, kind: 'bharat-series', stateCode: null,
//   series: 'AA', number: '1234', registrationYear: 2021, ... }
```

Handles both state plates and the Bharat (BH) series introduced in 2021, which stays with the owner across states — so `stateCode` and `stateName` are `null` for it, and `registrationYear` is populated instead.

## Error codes

A rejected result is always `{ valid: false, error, message }`.

| Code | Meaning |
| --- | --- |
| `NOT_A_STRING` | The input was not a string |
| `EMPTY` | Empty or whitespace only |
| `BAD_LENGTH` | Right character set, wrong number of them |
| `BAD_FORMAT` | Does not match the shape of the identifier |
| `BAD_CHECKSUM` | Shape is right, but the check digit does not match |
| `RESERVED_PREFIX` | Uses a prefix the authority never assigns |
| `UNKNOWN_STATE_CODE` | The embedded state code is not assigned |
| `UNKNOWN_HOLDER_TYPE` | The PAN holder category is not recognised |

These codes are stable within a major version, so branching on them is safe.

## What this package deliberately does not do

Being clear about the limits matters more than claiming broad coverage.

- **It does not verify the PAN check character.** The tenth character of a PAN is a check character, but the Income Tax Department has never published how it is derived. No library can verify it offline. `checksumVerified` is permanently `false`, and there is a test asserting we never claim otherwise. Treat any package that says it validates the PAN checksum with suspicion.
- **It does not confirm that an identifier was actually issued.** A GSTIN with a correct checksum is well-formed, not necessarily registered. Only the GSTN, UIDAI or NPCI can tell you that.
- **It does not bundle a bank branch database.** IFSC codes are structural only; branches merge and close, and a stale bundled list is worse than none.
- **It does not do KYC.** This is input validation. It catches typos and obvious fakes before they reach your database.

## Reference data

The tables behind the validators are exported, so your dropdowns and your validation agree.

```js
import { GST_STATE_CODES, PIN_ZONES, UPI_HANDLES, VEHICLE_STATE_CODES } from 'bharat-validate';

GST_STATE_CODES['27'];        // 'Maharashtra'
VEHICLE_STATE_CODES.KA;       // 'Karnataka'
```

The checksum algorithms are exported too, in case you need them on their own:

```js
import { verhoeffCheckDigit, verhoeffValidate, gstinCheckCharacter } from 'bharat-validate';

verhoeffCheckDigit('236');              // 3
verhoeffValidate('2363');               // true
gstinCheckCharacter('27AAPFU0939F1Z');  // 'V'
```

## TypeScript

Results are discriminated unions, so narrowing on `.valid` gives you the parsed fields and nothing else:

```ts
const result = validateGstin(input);

result.stateName;        // ✗ compile error — check .valid first

if (result.valid) {
  result.stateName;      // ✓ string
} else {
  result.error;          // ✓ ValidationErrorCode
}
```

## Contributing

Issues and pull requests are welcome — especially corrections to the reference data, which changes as states reorganise and new UPI handles launch.

```sh
npm install
npm test          # runs on Node's built-in test runner
npm run typecheck
npm run build
```

## License

MIT
