import Transport from "@ledgerhq/hw-transport";
import { log } from "@ledgerhq/logs";
import type { RecordStore } from "./RecordStore";

/**
 * create a transport replayer with a record store.
 * @param recordStore
 */
const createTransportReplayer = <Descriptor>(
  recordStore: RecordStore
): new () => Transport<Descriptor> => {
  class TransportReplayer extends Transport<Descriptor> {
    static readonly isSupported = () => Promise.resolve(true);
    static readonly list = () => Promise.resolve([]);
    static readonly listen = (o) => {
      let unsubscribed;
      setTimeout(() => {
        if (unsubscribed) return;
        o.next({
          type: "add",
          descriptor: null,
        });
        o.complete();
      }, 0);
      return {
        unsubscribe: () => {
          unsubscribed = true;
        },
      };
    };
    static readonly open = () => Promise.resolve(new TransportReplayer());

    setScrambleKey() {}

    close() {
      return Promise.resolve();
    }

    exchange(apdu: Buffer): Promise<Buffer> {
      log("apdu", apdu.toString("hex"));

      try {
        const buffer = recordStore.replayExchange(apdu);
        log("apdu", buffer.toString("hex"));
        return Promise.resolve(buffer);
      } catch (e) {
        log("apdu-error", String(e));
        return Promise.reject(e);
      }
    }
  }

  return TransportReplayer;
};

export default createTransportReplayer;
