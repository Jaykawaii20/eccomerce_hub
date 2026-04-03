import { Response } from 'express';
import { z } from 'zod';
import { prisma } from '../config/prisma';
import { sendSuccess, sendError } from '../utils/response';
import { asyncHandler } from '../utils/async-handler';
import { AuthenticatedRequest } from '../types';

const upsertSettingsSchema = z.record(z.string(), z.string());

export const settingsController = {
  getAll: asyncHandler(async (_req: AuthenticatedRequest, res: Response) => {
    const rows = await prisma.setting.findMany();
    const settings = Object.fromEntries(rows.map((r) => [r.key, r.value]));
    sendSuccess(res, { data: settings });
  }),

  getByKey: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const key = req.params['key'] as string;
    const setting = await prisma.setting.findUnique({ where: { key } });
    if (!setting) {
      sendError(res, { code: 'SETTING_NOT_FOUND', message: `Setting "${key}" not found.`, status: 404 });
      return;
    }
    sendSuccess(res, { data: setting });
  }),

  upsert: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const input = upsertSettingsSchema.parse(req.body);
    const operations = Object.entries(input).map(([key, value]) =>
      prisma.setting.upsert({
        where: { key },
        update: { value },
        create: { key, value },
      })
    );
    await Promise.all(operations);
    sendSuccess(res, { data: input });
  }),
};
