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
  // RFC 3339 string representation of the timestamp
  dateTime: string
  // Price excluding VAT in the local currency
  value: number
  // Price including VAT in the local currency
  valueInclVat: number
  // Whether the price is definitive or not
  definitive: boolean
  // Whether the price is padded or not
  padded: boolean
}

export type EonSpotpriceApiResponseArray = EonSpotpriceApiResponse[];

export interface EonSpotpriceOutput {
  // ISO string representation of the timestamp
  timestamp: string
  // Price excluding VAT in the local currency
  priceExclVat: number
  // Price including VAT in the local currency
  priceInclVat: number
  // Whether the price is definitive or not
  definitive: boolean
  // Whether the price is padded or not
  padded: boolean
  // The area for which the price applies
  area: string
}

export type EonSpotpriceOutputArray = EonSpotpriceOutput[];
