/**
 * bharat-validate - validate and parse Indian identifiers.
 *
 * Every validator comes in two forms: `isX` for a quick boolean, and
 * `validateX` for a result that explains a rejection and decodes what a
 * valid value contains.
 *
 * @example
 * import { validateGstin, isAadhaar } from 'bharat-validate';
 *
 * isAadhaar('9999 4105 7058'); // true
 *
 * const result = validateGstin('27AAPFU0939F1ZV');
 * if (result.valid) console.log(result.stateName); // 'Maharashtra'
 * else console.error(result.message);
 */

export {
  isAadhaar,
  maskAadhaar,
  validateAadhaar,
  type AadhaarDetails,
  type AadhaarResult,
} from './aadhaar.ts';

export {
  isPan,
  PAN_HOLDER_TYPES,
  validatePan,
  type PanDetails,
  type PanHolderTypeCode,
  type PanResult,
} from './pan.ts';

export {
  isGstin,
  validateGstin,
  type GstinDetails,
  type GstinResult,
} from './gstin.ts';

export {
  isIfsc,
  validateIfsc,
  type IfscDetails,
  type IfscResult,
} from './ifsc.ts';

export {
  isUpi,
  validateUpi,
  type UpiDetails,
  type UpiResult,
} from './upi.ts';

export {
  isPincode,
  validatePincode,
  type PincodeDetails,
  type PincodeResult,
} from './pincode.ts';

export {
  isMobile,
  validateMobile,
  type MobileDetails,
  type MobileResult,
} from './mobile.ts';

export {
  isVehicleNumber,
  validateVehicleNumber,
  type VehicleDetails,
  type VehicleRegistrationKind,
  type VehicleResult,
} from './vehicle.ts';

// Reference data, exported so callers can build dropdowns from the same
// tables the validators use.
export {
  GST_STATE_CODES,
  gstStateName,
  type GstStateCode,
} from './data/gst-states.ts';
export {
  PIN_ZONES,
  pinZone,
  type PinZone,
  type PinZoneDigit,
} from './data/pin-zones.ts';
export {
  UPI_HANDLES,
  upiProvider,
  type UpiHandle,
} from './data/upi-handles.ts';
export {
  VEHICLE_STATE_CODES,
  vehicleStateName,
  type VehicleStateCode,
} from './data/vehicle-states.ts';

// The checksum algorithms, useful on their own.
export {
  verhoeffCheckDigit,
  verhoeffValidate,
} from './internal/verhoeff.ts';
export {
  BASE36_ALPHABET,
  gstinCheckCharacter,
} from './internal/base36.ts';

export type {
  InvalidResult,
  ValidationErrorCode,
} from './internal/result.ts';
