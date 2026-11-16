/**
 * The two-letter state codes that open an Indian vehicle registration.
 *
 * A few states appear twice because the code changed but older plates are
 * still on the road: Odisha (OR then OD) and Uttarakhand (UA then UK).
 */
export const VEHICLE_STATE_CODES = {
  AN: 'Andaman and Nicobar Islands',
  AP: 'Andhra Pradesh',
  AR: 'Arunachal Pradesh',
  AS: 'Assam',
  BR: 'Bihar',
  CG: 'Chhattisgarh',
  CH: 'Chandigarh',
  DD: 'Daman and Diu',
  DL: 'Delhi',
  DN: 'Dadra and Nagar Haveli',
  GA: 'Goa',
  GJ: 'Gujarat',
  HP: 'Himachal Pradesh',
  HR: 'Haryana',
  JH: 'Jharkhand',
  JK: 'Jammu and Kashmir',
  KA: 'Karnataka',
  KL: 'Kerala',
  LA: 'Ladakh',
  LD: 'Lakshadweep',
  MH: 'Maharashtra',
  ML: 'Meghalaya',
  MN: 'Manipur',
  MP: 'Madhya Pradesh',
  MZ: 'Mizoram',
  NL: 'Nagaland',
  OD: 'Odisha',
  OR: 'Odisha (older code)',
  PB: 'Punjab',
  PY: 'Puducherry',
  RJ: 'Rajasthan',
  SK: 'Sikkim',
  TN: 'Tamil Nadu',
  TR: 'Tripura',
  TS: 'Telangana',
  UA: 'Uttarakhand (older code)',
  UK: 'Uttarakhand',
  UP: 'Uttar Pradesh',
  WB: 'West Bengal',
} as const;

export type VehicleStateCode = keyof typeof VEHICLE_STATE_CODES;

const BY_CODE: Record<string, string> = VEHICLE_STATE_CODES;

/** Returns the state for a vehicle registration prefix. */
export function vehicleStateName(code: string): string | undefined {
  return BY_CODE[code];
}
