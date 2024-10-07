import { createStorage } from "unstorage";
import redisDriver from "unstorage/drivers/redis";
import vercelKVDriver from "unstorage/drivers/vercel-kv";
import { singleton } from "tsyringe";

@singleton()
export class KvCache {
  constructor(
    public client: ReturnType<typeof createStorage> = createStorage({
      driver:
        process.env.NODE_ENV === "development"
          ? redisDriver({ base: "unstorage" })
          : vercelKVDriver({
              base: "tiledhn",
            }),
    }),
  ) {}

  async getCached<T>(key: string, call: () => Promise<T>): Promise<T> {
    try {
      const cached = (await this.client.getItem(key)) as T;
      return cached ? cached : call();
    } catch (err) {
      console.log(err);
      return call();
    }
  }
}
