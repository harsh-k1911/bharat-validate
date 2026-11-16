/**
 * Postal zones - the first digit of a six-digit PIN code.
 *
 * Zones 1-8 are geographic. Zone 9 belongs to the Army Postal Service, so a
 * PIN beginning with 9 is a field post office rather than a civilian address.
 */
export interface PinZone {
  readonly name: string;
  readonly states: readonly string[];
}

export const PIN_ZONES = {
  '1': {
    name: 'Northern',
    states: [
      'Delhi',
      'Haryana',
      'Punjab',
      'Himachal Pradesh',
      'Jammu and Kashmir',
      'Ladakh',
      'Chandigarh',
    ],
  },
  '2': { name: 'Northern', states: ['Uttar Pradesh', 'Uttarakhand'] },
  '3': {
    name: 'Western',
    states: [
      'Rajasthan',
      'Gujarat',
      'Daman and Diu',
      'Dadra and Nagar Haveli',
    ],
  },
  '4': {
    name: 'Western',
    states: ['Maharashtra', 'Madhya Pradesh', 'Chhattisgarh', 'Goa'],
  },
  '5': {
    name: 'Southern',
    states: ['Andhra Pradesh', 'Telangana', 'Karnataka'],
  },
  '6': {
    name: 'Southern',
    states: ['Tamil Nadu', 'Kerala', 'Puducherry', 'Lakshadweep'],
  },
  '7': {
    name: 'Eastern',
    states: [
      'West Bengal',
      'Odisha',
      'Assam',
      'Sikkim',
      'Arunachal Pradesh',
      'Nagaland',
      'Manipur',
      'Mizoram',
      'Tripura',
      'Meghalaya',
      'Andaman and Nicobar Islands',
    ],
  },
  '8': { name: 'Eastern', states: ['Bihar', 'Jharkhand'] },
  '9': { name: 'Army Postal Service', states: ['Field Post Office'] },
} as const satisfies Record<string, PinZone>;

export type PinZoneDigit = keyof typeof PIN_ZONES;

const BY_DIGIT: Record<string, PinZone> = PIN_ZONES;

/** Returns the postal zone for a PIN's leading digit. */
export function pinZone(digit: string): PinZone | undefined {
  return BY_DIGIT[digit];
}
