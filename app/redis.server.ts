import { Redis } from "ioredis";
import { z } from "zod";

const redisEnvSchema = z.object({
  REDIS_HOST: z.string().min(1),
  REDIS_PORT: z
    .string()
    .min(1)
    .transform((v) => parseInt(v)),
});

const config = redisEnvSchema.parse(process.env);

export const redisclient = new Redis({
  host: config.REDIS_HOST,
  port: config.REDIS_PORT,
});
