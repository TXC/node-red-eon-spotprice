export type EonSpotpriceArea = 'SE1' | 'SE2' | 'SE3' | 'SE4';

export type EonSpotpriceAction =
  // Price for today or an override if specified
  | 'todayOrOverride'
  // Price for the day ahead
  // @deprecated Use 'todayOrOverride' instead for current day pricing
  | 'dayAhead'
  // Rolling price
  // @deprecated Use 'todayOrOverride' instead for rolling pricing
  | 'rolling';

export interface EonSpotpriceOptions {
  area: EonSpotpriceArea;
  action: EonSpotpriceAction;
}

export interface EonSpotpriceRequestOpts {
  area: EonSpotpriceArea;
  date: string;
}

export interface EonSpotpriceApiResponse {
  dateTime: Date
  value: number
  valueInclVat: number
  definitive: boolean
  padded: boolean
}

export type EonSpotpriceApiResponseArray = EonSpotpriceApiResponse[];

export interface EonSpotpriceOutput {
  timestamp: Date
  priceExclVat: number
  priceInclVat: number
  definitive: boolean
  padded: boolean
  area: string
}

export type EonSpotpriceOutputArray = EonSpotpriceOutput[];
