import { Response } from 'express';
import { CustomerService } from '../services/customer.service';
import { CustomerRepository } from '../repositories/customer.repository';
import { sendSuccess, sendError, sendPaginated } from '../utils/response';
import { asyncHandler } from '../utils/async-handler';
import { AuthenticatedRequest } from '../types';
import { z } from 'zod';

const customerService = new CustomerService(new CustomerRepository());

const listCustomersSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().optional(),
  sort: z.string().default('createdAt:desc'),
});

const toggleActiveSchema = z.object({
  isActive: z.boolean(),
});

export const customerController = {
  list: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const params = listCustomersSchema.parse(req.query);
    const result = await customerService.list(params);
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
    const result = await customerService.getById(req.params['id'] as string);
    if (result.isErr()) {
      sendError(res, { code: result.error.code, message: result.error.message, status: result.error.httpStatus });
      return;
    }
    sendSuccess(res, { data: result.value });
  }),

  toggleActive: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { isActive } = toggleActiveSchema.parse(req.body);
    const result = await customerService.toggleActive(req.params['id'] as string, isActive);
    if (result.isErr()) {
      sendError(res, { code: result.error.code, message: result.error.message, status: result.error.httpStatus });
      return;
    }
    sendSuccess(res, { data: result.value });
  }),
};
