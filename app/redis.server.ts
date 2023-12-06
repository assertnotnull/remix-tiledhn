import { createStorage } from "unstorage";
import redisDriver from "unstorage/drivers/redis";
import vercelKVDriver from "unstorage/drivers/vercel-kv";

export const cacheClient = createStorage({
  driver:
    process.env.NODE_ENV === "development"
      ? redisDriver({ base: "unstorage" })
      : vercelKVDriver({
          base: "tiledhn",
        }),
});
