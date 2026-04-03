import { Response } from 'express';
import { z } from 'zod';
import { ShippingService } from '../services/shipping.service';
import { ShippingRepository } from '../repositories/shipping.repository';
import { sendSuccess, sendError } from '../utils/response';
import { asyncHandler } from '../utils/async-handler';
import { AuthenticatedRequest } from '../types';

const shippingService = new ShippingService(new ShippingRepository());

const createZoneSchema = z.object({
  name: z.string().min(1),
  isDefault: z.boolean().default(false),
});

const updateZoneSchema = createZoneSchema.partial();

const createMethodSchema = z.object({
  name: z.string().min(1),
  type: z.enum(['FLAT_RATE', 'FREE_SHIPPING', 'LOCAL_PICKUP']),
  cost: z.number().int().min(0).default(0),
  minOrderAmount: z.number().int().min(0).optional(),
  isActive: z.boolean().default(true),
});

const updateMethodSchema = createMethodSchema.partial();

export const shippingController = {
  listZones: asyncHandler(async (_req: AuthenticatedRequest, res: Response) => {
    const result = await shippingService.listZones();
    if (result.isErr()) {
      sendError(res, { code: result.error.code, message: result.error.message, status: result.error.httpStatus });
      return;
    }
    sendSuccess(res, { data: result.value });
  }),

  getZone: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const result = await shippingService.getZone(req.params['id'] as string);
    if (result.isErr()) {
      sendError(res, { code: result.error.code, message: result.error.message, status: result.error.httpStatus });
      return;
    }
    sendSuccess(res, { data: result.value });
  }),

  createZone: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const input = createZoneSchema.parse(req.body);
    const result = await shippingService.createZone(input);
    if (result.isErr()) {
      sendError(res, { code: result.error.code, message: result.error.message, status: result.error.httpStatus });
      return;
    }
    sendSuccess(res, { data: result.value, status: 201 });
  }),

  updateZone: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const input = updateZoneSchema.parse(req.body);
    const result = await shippingService.updateZone(req.params['id'] as string, input);
    if (result.isErr()) {
      sendError(res, { code: result.error.code, message: result.error.message, status: result.error.httpStatus });
      return;
    }
    sendSuccess(res, { data: result.value });
  }),

  deleteZone: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const result = await shippingService.deleteZone(req.params['id'] as string);
    if (result.isErr()) {
      sendError(res, { code: result.error.code, message: result.error.message, status: result.error.httpStatus });
      return;
    }
    sendSuccess(res, { data: null, status: 204 });
  }),

  addMethod: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const input = createMethodSchema.parse(req.body);
    const result = await shippingService.addMethod(req.params['id'] as string, input);
    if (result.isErr()) {
      sendError(res, { code: result.error.code, message: result.error.message, status: result.error.httpStatus });
      return;
    }
    sendSuccess(res, { data: result.value, status: 201 });
  }),

  updateMethod: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const input = updateMethodSchema.parse(req.body);
    const result = await shippingService.updateMethod(req.params['id'] as string, input);
    if (result.isErr()) {
      sendError(res, { code: result.error.code, message: result.error.message, status: result.error.httpStatus });
      return;
    }
    sendSuccess(res, { data: result.value });
  }),

  deleteMethod: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const result = await shippingService.deleteMethod(req.params['id'] as string);
    if (result.isErr()) {
      sendError(res, { code: result.error.code, message: result.error.message, status: result.error.httpStatus });
      return;
    }
    sendSuccess(res, { data: null, status: 204 });
  }),
};
