import { Redis } from '@upstash/redis';
import { env } from './env';

// Redis is optional — only instantiated when credentials are provided.
// Rate limiting and caching degrade gracefully when Redis is not configured.
export const redis =
  env.UPSTASH_REDIS_REST_URL && env.UPSTASH_REDIS_REST_TOKEN
    ? new Redis({ url: env.UPSTASH_REDIS_REST_URL, token: env.UPSTASH_REDIS_REST_TOKEN })
    : null;
