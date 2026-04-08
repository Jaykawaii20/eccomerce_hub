import { Response } from 'express';
import { z } from 'zod';
import { UserRole } from '@prisma/client';
import { UserManagementService } from '../services/user-management.service';
import { UserManagementRepository } from '../repositories/user-management.repository';
import { sendSuccess, sendError, sendPaginated } from '../utils/response';
import { asyncHandler } from '../utils/async-handler';
import { AuthenticatedRequest } from '../types';

const service = new UserManagementService(new UserManagementRepository());

const listSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().optional(),
  role: z.nativeEnum(UserRole).optional(),
  sort: z.string().default('createdAt:desc'),
});

const createSchema = z.object({
  email: z.string().email(),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  firstName: z.string().min(1).max(50),
  lastName: z.string().min(1).max(50),
  role: z.nativeEnum(UserRole),
  phone: z.string().optional(),
});

const updateSchema = z.object({
  firstName: z.string().min(1).max(50).optional(),
  lastName: z.string().min(1).max(50).optional(),
  role: z.nativeEnum(UserRole).optional(),
  isActive: z.boolean().optional(),
  phone: z.string().optional(),
});

export const userManagementController = {
  list: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const params = listSchema.parse(req.query);
    const result = await service.list(params);
    if (result.isErr()) {
      sendError(res, { code: result.error.code, message: result.error.message, status: result.error.httpStatus });
      return;
    }
    sendPaginated(res, result.value.data, {
      page: params.page,
      pageSize: params.pageSize,
      total: result.value.total,
    });
  }),

  getById: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const result = await service.getById(req.params['id'] as string);
    if (result.isErr()) {
      sendError(res, { code: result.error.code, message: result.error.message, status: result.error.httpStatus });
      return;
    }
    sendSuccess(res, { data: result.value });
  }),

  create: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const input = createSchema.parse(req.body);
    const result = await service.create(input);
    if (result.isErr()) {
      sendError(res, { code: result.error.code, message: result.error.message, status: result.error.httpStatus });
      return;
    }
    sendSuccess(res, { data: result.value, status: 201 });
  }),

  update: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const data = updateSchema.parse(req.body);
    const result = await service.update(req.params['id'] as string, data);
    if (result.isErr()) {
      sendError(res, { code: result.error.code, message: result.error.message, status: result.error.httpStatus });
      return;
    }
    sendSuccess(res, { data: result.value });
  }),

  delete: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const result = await service.delete(req.params['id'] as string, req.user.id);
    if (result.isErr()) {
      sendError(res, { code: result.error.code, message: result.error.message, status: result.error.httpStatus });
      return;
    }
    sendSuccess(res, { data: null, status: 204 });
  }),
};
