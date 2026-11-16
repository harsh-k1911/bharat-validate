/**
 * Known UPI handles mapped to the app or bank behind them.
 *
 * This list is informational only - it is never used to accept or reject a
 * UPI ID. New handles appear regularly, so treating an unknown handle as
 * invalid would break real payments.
 */
export const UPI_HANDLES = {
  okhdfcbank: 'Google Pay (HDFC Bank)',
  okaxis: 'Google Pay (Axis Bank)',
  oksbi: 'Google Pay (State Bank of India)',
  okicici: 'Google Pay (ICICI Bank)',
  ybl: 'PhonePe (Yes Bank)',
  ibl: 'PhonePe (ICICI Bank)',
  axl: 'PhonePe (Axis Bank)',
  paytm: 'Paytm',
  ptaxis: 'Paytm (Axis Bank)',
  ptsbi: 'Paytm (State Bank of India)',
  ptyes: 'Paytm (Yes Bank)',
  pthdfc: 'Paytm (HDFC Bank)',
  apl: 'Amazon Pay',
  yapl: 'Amazon Pay (Yes Bank)',
  upi: 'BHIM',
  airtel: 'Airtel Payments Bank',
  freecharge: 'Freecharge',
  slice: 'Slice',
  jupiteraxis: 'Jupiter (Axis Bank)',
  naviaxis: 'Navi (Axis Bank)',
  fam: 'FamPay',
  sbi: 'State Bank of India',
  hdfcbank: 'HDFC Bank',
  icici: 'ICICI Bank',
  axisbank: 'Axis Bank',
  kotak: 'Kotak Mahindra Bank',
  idfcbank: 'IDFC First Bank',
  indus: 'IndusInd Bank',
  barodampay: 'Bank of Baroda',
  pnb: 'Punjab National Bank',
  cnrb: 'Canara Bank',
  unionbank: 'Union Bank of India',
  waaxis: 'WhatsApp Pay (Axis Bank)',
  waicici: 'WhatsApp Pay (ICICI Bank)',
  wasbi: 'WhatsApp Pay (State Bank of India)',
  wahdfcbank: 'WhatsApp Pay (HDFC Bank)',
} as const;

export type UpiHandle = keyof typeof UPI_HANDLES;

const BY_HANDLE: Record<string, string> = UPI_HANDLES;

/** Returns the app or bank behind a UPI handle, if it is one we know. */
export function upiProvider(handle: string): string | undefined {
  return BY_HANDLE[handle];
}
