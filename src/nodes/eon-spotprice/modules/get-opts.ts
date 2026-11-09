import type {EonSpotpriceNodeDef} from './types';
import {EonSpotpriceArea, EonSpotpriceRequestOpts} from '../shared/types';

// Simple type guard with typeof
export const areaCheck = (value: unknown): EonSpotpriceArea => {
  if (typeof value !== "string") {
    throw new Error("Invalid area value");
  }
  if (value === "SE1" || value === "SE2" || value === "SE3" || value === "SE4") {
    return value;
  }
  throw new Error("Invalid area value");
}

export const formatDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const getOpts = (
  msg: Record<string, unknown>,
  config: EonSpotpriceNodeDef
) : EonSpotpriceRequestOpts => {
  let date = new Date()
  if (config.action === "dayAhead") {
    date = new Date(date.setDate(date.getDate() + 1))
  } else if (config.action !== "rolling" && typeof msg.date === "string") {
    // new Date() never throws; an unparsable input gives an Invalid Date (NaN).
    date = new Date(msg.date)
    if (isNaN(date.getTime())) {
      throw new Error("Invalid time value input in msg.date")
    }
  }

  let area: EonSpotpriceArea = 'SE1';
  try {
    if (config.area !== undefined) {
      area = areaCheck(config.area);
    }
    if (msg.area !== undefined) {
      area = areaCheck(msg.area);
    }
  } catch (error) {
    /*
    if (error instanceof Error) {
      throw new Error(`Invalid area value in msg.area or config.area: ${error.message}`);
    } else {
      throw new Error(`Invalid area value in msg.area or config.area: ${String(error)}`);
    }
    */
    area = 'SE1'
    console.error(`Invalid area value in msg.area or config.area: ${String(error)}`);
  }

  return {
    area: area,
    date: formatDate(date)
  }
}

