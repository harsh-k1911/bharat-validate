/**
 * GST state codes - the first two digits of every GSTIN.
 *
 * Codes 01-38 are states and union territories, assigned in the order used
 * by the 2011 census. 97 and 99 are special jurisdictions.
 */
export const GST_STATE_CODES = {
  '01': 'Jammu and Kashmir',
  '02': 'Himachal Pradesh',
  '03': 'Punjab',
  '04': 'Chandigarh',
  '05': 'Uttarakhand',
  '06': 'Haryana',
  '07': 'Delhi',
  '08': 'Rajasthan',
  '09': 'Uttar Pradesh',
  '10': 'Bihar',
  '11': 'Sikkim',
  '12': 'Arunachal Pradesh',
  '13': 'Nagaland',
  '14': 'Manipur',
  '15': 'Mizoram',
  '16': 'Tripura',
  '17': 'Meghalaya',
  '18': 'Assam',
  '19': 'West Bengal',
  '20': 'Jharkhand',
  '21': 'Odisha',
  '22': 'Chhattisgarh',
  '23': 'Madhya Pradesh',
  '24': 'Gujarat',
  // 25 was Daman and Diu before its 2020 merger into code 26. Registrations
  // issued under it still exist, so it is kept here.
  '25': 'Daman and Diu (merged into 26 in 2020)',
  '26': 'Dadra and Nagar Haveli and Daman and Diu',
  '27': 'Maharashtra',
  // 28 was undivided Andhra Pradesh before the 2014 bifurcation.
  '28': 'Andhra Pradesh (before bifurcation)',
  '29': 'Karnataka',
  '30': 'Goa',
  '31': 'Lakshadweep',
  '32': 'Kerala',
  '33': 'Tamil Nadu',
  '34': 'Puducherry',
  '35': 'Andaman and Nicobar Islands',
  '36': 'Telangana',
  '37': 'Andhra Pradesh',
  '38': 'Ladakh',
  '97': 'Other Territory',
  '99': 'Centre Jurisdiction',
} as const;

export type GstStateCode = keyof typeof GST_STATE_CODES;

const BY_CODE: Record<string, string> = GST_STATE_CODES;

/** Returns the state for a GST state code, or `undefined` if unassigned. */
export function gstStateName(code: string): string | undefined {
  return BY_CODE[code];
}
