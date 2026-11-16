import { vehicleStateName } from './data/vehicle-states.ts';
import { clean, invalid, type InvalidResult } from './internal/result.ts';

/**
 * `standard` is the familiar state-based plate such as `MH12AB1234`.
 * `bharat-series` is the BH plate introduced in 2021, which stays with the
 * owner when they move between states.
 */
export type VehicleRegistrationKind = 'standard' | 'bharat-series';

export interface VehicleDetails {
  readonly valid: true;
  /** The registration with separators removed, uppercased. */
  readonly value: string;
  /** Grouped for display, e.g. `MH 12 AB 1234`. */
  readonly formatted: string;
  readonly kind: VehicleRegistrationKind;
  /** Two-letter state code, or `null` for a BH plate. */
  readonly stateCode: string | null;
  /** The state that code belongs to, or `null` for a BH plate. */
  readonly stateName: string | null;
  /** The RTO district number, or `null` for a BH plate. */
  readonly rtoCode: string | null;
  /** The letters between the district and the number, e.g. `AB`. */
  readonly series: string;
  /** The numeric portion of the plate. */
  readonly number: string;
  /** Year of registration, available for BH plates only. */
  readonly registrationYear: number | null;
}

export type VehicleResult = VehicleDetails | InvalidResult;

// State code, RTO district, the series letters, then the number. Every
// plate issued under the 1989 rules carries a series, so it is required -
// making it optional turns `MH1234` into an arbitrary guess at the split.
const STANDARD = /^([A-Z]{2})([0-9]{1,2})([A-Z]{1,3})([0-9]{1,4})$/;
// Year, the literal BH, the number, then a one or two letter series.
const BHARAT_SERIES = /^([0-9]{2})BH([0-9]{4})([A-Z]{1,2})$/;

/**
 * Validates an Indian vehicle registration number and breaks it into parts.
 *
 * Handles both the state format and the Bharat (BH) series. Spaces and
 * hyphens are ignored, so plates copied as written work as-is.
 *
 * @example
 * validateVehicleNumber('MH 12 AB 1234');
 * // { valid: true, kind: 'standard', stateCode: 'MH',
 * //   stateName: 'Maharashtra', rtoCode: '12', series: 'AB', number: '1234' }
 *
 * @example
 * validateVehicleNumber('21BH1234AA');
 * // { valid: true, kind: 'bharat-series', registrationYear: 2021, ... }
 */
export function validateVehicleNumber(input: unknown): VehicleResult {
  const cleaned = clean(input);
  if (!cleaned.ok) return cleaned.result;

  const value = cleaned.value.replace(/[\s-]/g, '').toUpperCase();

  const bharat = BHARAT_SERIES.exec(value);
  if (bharat) {
    const [, year, number, series] = bharat as unknown as [
      string,
      string,
      string,
      string,
    ];
    return {
      valid: true,
      value,
      formatted: `${year} BH ${number} ${series}`,
      kind: 'bharat-series',
      stateCode: null,
      stateName: null,
      rtoCode: null,
      series,
      number,
      registrationYear: 2000 + Number(year),
    };
  }

  const standard = STANDARD.exec(value);
  if (!standard) {
    return invalid(
      'BAD_FORMAT',
      'A registration number looks like MH12AB1234, or 21BH1234AA for a Bharat series plate.',
    );
  }

  const [, stateCode, rtoCode, series, number] = standard as unknown as [
    string,
    string,
    string,
    string,
    string,
  ];

  const stateName = vehicleStateName(stateCode);
  if (stateName === undefined) {
    return invalid(
      'UNKNOWN_STATE_CODE',
      `"${stateCode}" is not an Indian state registration code.`,
    );
  }

  return {
    valid: true,
    value,
    formatted: `${stateCode} ${rtoCode} ${series} ${number}`,
    kind: 'standard',
    stateCode,
    stateName,
    rtoCode,
    series,
    number,
    registrationYear: null,
  };
}

/** Whether the input is a valid Indian vehicle registration number. */
export function isVehicleNumber(input: unknown): boolean {
  return validateVehicleNumber(input).valid;
}
