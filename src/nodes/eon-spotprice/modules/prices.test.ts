import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { prices } from "./prices";
import type { EonSpotpriceNode } from "./types";
import type { EonSpotpriceApiResponse } from "../shared/types";

const apiEntry = {
  dateTime: "2026-01-31T00:00:00.000+01:00",
  value: 247.35,
  valueInclVat: 305.19,
  definitive: true,
  padded: false,
} as unknown as EonSpotpriceApiResponse;

const opts = { area: "SE3", date: "2026-01-31" } as const;

const stubFetch = (response: Response | Error) =>
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => {
      if (response instanceof Error) throw response;
      return response;
    }),
  );

const json = (body: unknown) => new Response(JSON.stringify(body));

describe("prices", () => {
  let node: EonSpotpriceNode;

  beforeEach(() => {
    node = { status: vi.fn() } as unknown as EonSpotpriceNode;
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("requests the area and date from the E.ON API", async () => {
    stubFetch(json([apiEntry]));
    await prices(node, opts);

    const request = vi.mocked(fetch).mock.calls[0][0] as Request;
    const url = new URL(request.url);
    expect(url.origin + url.pathname).toBe(
      "https://eonepapirun.azurewebsites.net/api/getSpotPrices",
    );
    expect(url.searchParams.get("priceArea")).toBe("SE3");
    expect(url.searchParams.get("date")).toBe("2026-01-31");
  });

  it("maps API entries to the output shape", async () => {
    stubFetch(json([apiEntry]));
    expect(await prices(node, opts)).toEqual([
      {
        timestamp: "2026-01-30T23:00:00.000Z",
        priceExclVat: 2.4735,
        priceInclVat: 3.0519,
        definitive: true,
        padded: false,
        area: "SE3",
      },
    ]);
  });

  it("shows a green status on success", async () => {
    stubFetch(json([apiEntry]));
    await prices(node, opts);
    expect(node.status).toHaveBeenLastCalledWith({
      fill: "green",
      text: "2026-01-31 OK",
    });
  });

  it("rejects on an HTTP error", async () => {
    stubFetch(new Response("", { status: 500, statusText: "Server Error" }));
    await expect(prices(node, opts)).rejects.toThrow(
      "500 - Error: Server Error",
    );
    expect(node.status).toHaveBeenLastCalledWith(
      expect.objectContaining({ fill: "red" }),
    );
  });

  it("rejects when the API returns no entries", async () => {
    stubFetch(json([]));
    await expect(prices(node, opts)).rejects.toThrow(
      "No data found for 2026-01-31",
    );
  });

  it("rejects on a network error", async () => {
    stubFetch(new TypeError("fetch failed"));
    await expect(prices(node, opts)).rejects.toThrow("fetch failed");
    expect(node.status).toHaveBeenLastCalledWith(
      expect.objectContaining({ fill: "red" }),
    );
  });
});
