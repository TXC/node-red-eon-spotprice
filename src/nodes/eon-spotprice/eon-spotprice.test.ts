import type { EventEmitter } from "node:events";
import type { NodeMessage } from "node-red";
import testHelper, { type TestFlowsItem } from "node-red-node-test-helper";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import eon from "./eon-spotprice";
import type { EonSpotpriceNodeDef } from "./modules/types";

type FlowsItem = TestFlowsItem<EonSpotpriceNodeDef>;
type Flows = Array<FlowsItem>;

const apiEntry = {
  dateTime: "2026-03-15T00:00:00.000+01:00",
  value: 10.12,
  valueInclVat: 12.65,
  definitive: true,
  padded: false,
};

const flows = (overrides: Partial<FlowsItem> = {}): Flows => [
  {
    id: "n1",
    type: "eon-spotprice",
    name: "eon-spotprice",
    area: "SE3",
    action: "todayOrOverride",
    wires: [["n2"]],
    ...overrides,
  },
  { id: "n2", type: "helper" },
];

// Vitest has no `done` callback, so wrap the helper's callbacks in promises.
const load = (f: Flows) =>
  new Promise<void>((resolve) => testHelper.load(eon, f, resolve));

// Cast: Node's typings only list "input"/"close", not the helper's events.
const nextEvent = <T>(nodeId: string, event: string) =>
  new Promise<T>((resolve) =>
    (testHelper.getNode(nodeId) as EventEmitter).on(event, resolve),
  );

// Sends `msg` into n1 and resolves with the message n2 receives.
const roundTrip = (msg: NodeMessage) => {
  const received = nextEvent<NodeMessage>("n2", "input");
  testHelper.getNode("n1").receive(msg);
  return received;
};

// Sends `msg` into n1 and resolves with the error n1 reports.
const errorFor = async (msg: NodeMessage) => {
  // The helper emits `call:<method>` with the sinon call (args etc.).
  const reported = nextEvent<{ args: unknown[] }>("n1", "call:error");
  testHelper.getNode("n1").receive(msg);
  return (await reported).args[0];
};

const requestedUrl = () =>
  new URL((vi.mocked(fetch).mock.calls[0][0] as Request).url);

const stubFetch = (makeResponse: () => Response) =>
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => makeResponse()),
  );

describe("eon-spotprice node", () => {
  beforeEach(async () => {
    stubFetch(() => new Response(JSON.stringify([apiEntry])));
    await new Promise<void>((r) => testHelper.startServer(r));
  });

  afterEach(async () => {
    await testHelper.unload();
    await new Promise<void>((r) => testHelper.stopServer(r));
    vi.unstubAllGlobals();
  });

  it("should be loaded", async () => {
    await load([{ id: "n1", type: "eon-spotprice", name: "eon-spotprice" }]);
    const n1 = testHelper.getNode("n1");
    expect(n1).toBeTruthy();
    expect(n1.name).toEqual("eon-spotprice");
  });

  it("sends the prices as msg.payload", async () => {
    await load(flows());
    const msg = await roundTrip({ topic: "prices" });
    expect(msg.topic).toBe("prices");
    expect(msg.payload).toEqual([
      {
        timestamp: apiEntry.dateTime,
        priceExclVat: 10.12,
        priceInclVat: 12.65,
        definitive: true,
        padded: false,
        area: "SE3",
      },
    ]);
  });

  it("uses msg.area and msg.date over the node settings", async () => {
    await load(flows());
    await roundTrip({ area: "SE4", date: "2026-03-15T12:00" });
    expect(requestedUrl().searchParams.get("priceArea")).toBe("SE4");
    expect(requestedUrl().searchParams.get("date")).toBe("2026-03-15");
  });

  it("uses the node's area when msg.area is missing", async () => {
    await load(flows({ area: "SE2" }));
    await roundTrip({});
    expect(requestedUrl().searchParams.get("priceArea")).toBe("SE2");
  });

  it("reports an error when the API fails", async () => {
    stubFetch(
      () => new Response("", { status: 500, statusText: "Server Error" }),
    );
    await load(flows());
    const error = await errorFor({});
    expect(String(error)).toContain("500 - Error: Server Error");
  });

  it("reports an error for an invalid msg.date", async () => {
    await load(flows());
    const error = await errorFor({ date: "not a date" });
    expect(String(error)).toContain("Invalid time value input in msg.date");
    expect(fetch).not.toHaveBeenCalled();
  });
});
