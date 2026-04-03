import { Request, Response } from 'express';
import { prisma } from '../config/prisma';
import { redis } from '../config/redis';
import { supabaseAdmin } from '../config/supabase';
import { env } from '../config/env';
import { asyncHandler } from '../utils/async-handler';

export const healthController = {
  check: asyncHandler(async (_req: Request, res: Response) => {
    const [db, redisCheck, storage] = await Promise.allSettled([
      prisma.$queryRaw`SELECT 1`,
      redis ? redis.ping() : Promise.resolve('not_configured'),
      supabaseAdmin.storage.listBuckets(),
    ]);

    const status = {
      status: [db, storage].every((c) => c.status === 'fulfilled') ? 'ok' : 'degraded',
      version: env.API_VERSION,
      db: db.status === 'fulfilled' ? 'ok' : 'error',
      redis: redis ? (redisCheck.status === 'fulfilled' ? 'ok' : 'error') : 'not_configured',
      storage: storage.status === 'fulfilled' ? 'ok' : 'error',
      timestamp: new Date().toISOString(),
    };

    res.status(status.status === 'ok' ? 200 : 503).json(status);
  }),
};
