import { Response } from 'express';
import { OrderService } from '../services/order.service';
import { OrderRepository } from '../repositories/order.repository';
import {
  listOrdersSchema,
  updateOrderStatusSchema,
  addOrderNoteSchema,
} from '../validators/order.validator';
import { sendSuccess, sendError, sendPaginated } from '../utils/response';
import { asyncHandler } from '../utils/async-handler';
import { AuthenticatedRequest } from '../types';

const orderService = new OrderService(new OrderRepository());

export const orderController = {
  list: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const params = listOrdersSchema.parse(req.query);
    const result = await orderService.list(params);
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
    const result = await orderService.getById(req.params['id'] as string);
    if (result.isErr()) {
      sendError(res, { code: result.error.code, message: result.error.message, status: result.error.httpStatus });
      return;
    }
    sendSuccess(res, { data: result.value });
  }),

  updateStatus: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const input = updateOrderStatusSchema.parse(req.body);
    const result = await orderService.updateStatus(
      req.params['id'] as string,
      input.status,
      input.comment,
      req.user.id
    );
    if (result.isErr()) {
      sendError(res, { code: result.error.code, message: result.error.message, status: result.error.httpStatus });
      return;
    }
    sendSuccess(res, { data: result.value });
  }),

  addNote: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const input = addOrderNoteSchema.parse(req.body);
    const result = await orderService.addNote(
      req.params['id'] as string,
      input.note,
      input.isCustomerNote,
      req.user.id
    );
    if (result.isErr()) {
      sendError(res, { code: result.error.code, message: result.error.message, status: result.error.httpStatus });
      return;
    }
    sendSuccess(res, { data: result.value, status: 201 });
  }),
};
