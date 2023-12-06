import { createStorage } from "unstorage";
import redisDriver from "unstorage/drivers/redis";
import vercelKVDriver from "unstorage/drivers/vercel-kv";
import { z } from "zod";

const redisEnvSchema = z.object({
  REDIS_HOST: z.string().min(1),
  REDIS_PORT: z
    .string()
    .min(1)
    .transform((v) => parseInt(v)),
  REDIS_USERNAME: z.string().optional(),
  REDIS_PASSWORD: z.string().optional(),
});

const config = redisEnvSchema.parse(process.env);

export const cacheClient = createStorage({
  driver:
    process.env.NODE_ENV === "development"
      ? redisDriver({ base: "unstorage" })
      : vercelKVDriver({
          base: "tiledhn",
        }),
});
