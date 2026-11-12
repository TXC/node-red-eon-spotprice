import type { EonSpotpriceNode } from "./types";
import type {
  EonSpotpriceRequestOpts,
  EonSpotpriceApiResponse,
  EonSpotpriceOutput,
} from "../shared/types";

export const prices = async (
  node: EonSpotpriceNode,
  opts: EonSpotpriceRequestOpts,
) => {
  node.status({ fill: "blue", shape: "dot", text: "Getting prices" });
  try {
    const qsParams = new URLSearchParams({
      priceArea: opts.area,
      date: opts.date,
    });
    const requestUrl = new URL(
      "https://eonepapirun.azurewebsites.net/api/getSpotPrices?" +
        qsParams.toString(),
    );
    const request = new Request(requestUrl);
    const items = await fetch(request)
      .then((response) => {
        if (response.ok) {
          return response;
        } else {
          const errorText = `${response.status} - Error: ${response.statusText}`;
          node.status({
            fill: "yellow",
            text: "No data found for " + opts.date,
          });
          return Promise.reject(new Error(errorText));
        }
      })
      .then((response) => response.json())
      .then((data: EonSpotpriceApiResponse[]) => {
        if (!data || !data.length) {
          const errorText = "No data found for " + opts.date;
          node.status({ fill: "yellow", text: errorText });
          return Promise.reject(new Error(errorText));
        }

        const items = data.map((entry): EonSpotpriceOutput => {
          return {
            timestamp: new Date(entry.dateTime).toISOString(),
            priceExclVat: entry.value / 100,
            priceInclVat: entry.valueInclVat / 100,
            definitive: entry.definitive,
            padded: entry.padded,
            area: opts.area,
          };
        });
        return items;
      })
      .catch((error) => {
        node.status({ fill: "red", text: "Error getting data" });
        throw error;
      });
    node.status({ fill: "green", text: opts.date + " OK" });
    return items;
  } catch (error) {
    node.status({ fill: "red", text: "Error getting prices" });
    throw error;
  }
};
