import type { NodeInitializer } from "node-red";
import type { EonSpotpriceNode, EonSpotpriceNodeDef } from "./modules/types";
import { getOpts } from "./modules/get-opts";
import { prices } from "./modules/prices";

const nodeInit: NodeInitializer = (RED): void => {
  function EonSpotpriceNodeConstructor(
    this: EonSpotpriceNode,
    config: EonSpotpriceNodeDef,
  ): void {
    RED.nodes.createNode(this, config);

    this.status({ text: "Ready" });

    this.on("input", async (msg, send, done) => {
      try {
        const opts = getOpts(msg, config);
        msg.payload = await prices(this, opts);
        send(msg);
        done();
      } catch (error: unknown) {
        this.status({
          fill: "red",
          text: `Error: ${(error as Error).message}`,
        });
        done(error as Error);
        return;
      }
    });
  }

  RED.nodes.registerType("eon-spotprice", EonSpotpriceNodeConstructor);
};

export default nodeInit;
