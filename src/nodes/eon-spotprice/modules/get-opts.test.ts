import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { formatDate, getOpts } from "./get-opts";
import type { EonSpotpriceNodeDef } from "./types";

const config = (
  overrides: Partial<EonSpotpriceNodeDef> = {},
): EonSpotpriceNodeDef =>
  ({
    id: "n1",
    type: "eon-spotprice",
    name: "",
    z: "",
    area: "SE3",
    action: "todayOrOverride",
    ...overrides,
  }) as EonSpotpriceNodeDef;

describe("formatDate", () => {
  it("formats as YYYY-MM-DD with zero padding", () => {
    expect(formatDate(new Date(2026, 0, 5))).toBe("2026-01-05");
  });

  it("uses local time, not UTC", () => {
    expect(formatDate(new Date(2026, 11, 31, 23, 59))).toBe("2026-12-31");
  });
});

describe("getOpts", () => {
  beforeEach(() => {
    // Local noon on Jan 31st, so "tomorrow" crosses a month boundary.
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date(2026, 0, 31, 12));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("todayOrOverride", () => {
    it("uses today when msg.date is missing", () => {
      expect(getOpts({}, config())).toEqual({
        area: "SE3",
        date: "2026-01-31",
      });
    });

    it("uses msg.date when given", () => {
      expect(getOpts({ date: "2026-03-15T12:00" }, config()).date).toBe(
        "2026-03-15",
      );
    });

    it("throws on an invalid msg.date", () => {
      expect(() => getOpts({ date: "not a date" }, config())).toThrow(
        "Invalid time value input in msg.date",
      );
    });
  });

  describe("dayAhead", () => {
    it("uses tomorrow", () => {
      expect(getOpts({}, config({ action: "dayAhead" })).date).toBe(
        "2026-02-01",
      );
    });

    it("ignores msg.date", () => {
      const msg = { date: "2026-03-15T12:00" };
      expect(getOpts(msg, config({ action: "dayAhead" })).date).toBe(
        "2026-02-01",
      );
    });
  });

  describe("rolling", () => {
    it("uses today and ignores msg.date", () => {
      const msg = { date: "2026-03-15T12:00" };
      expect(getOpts(msg, config({ action: "rolling" })).date).toBe(
        "2026-01-31",
      );
    });
  });

  describe("area", () => {
    it("prefers msg.area over the node setting", () => {
      expect(getOpts({ area: "SE1" }, config()).area).toBe("SE1");
    });

    it("falls back to SE1 when neither is set", () => {
      const noArea = config({ area: undefined });
      expect(getOpts({}, noArea).area).toBe("SE1");
    });
  });
});
