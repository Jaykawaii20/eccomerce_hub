import { Response } from 'express';
import { CouponService } from '../services/coupon.service';
import { CouponRepository } from '../repositories/coupon.repository';
import {
  createCouponSchema,
  updateCouponSchema,
  listCouponsSchema,
} from '../validators/coupon.validator';
import { sendSuccess, sendError, sendPaginated } from '../utils/response';
import { asyncHandler } from '../utils/async-handler';
import { AuthenticatedRequest } from '../types';

const couponService = new CouponService(new CouponRepository());

export const couponController = {
  list: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const params = listCouponsSchema.parse(req.query);
    const result = await couponService.list(params);
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
    const result = await couponService.getById(req.params['id'] as string);
    if (result.isErr()) {
      sendError(res, { code: result.error.code, message: result.error.message, status: result.error.httpStatus });
      return;
    }
    sendSuccess(res, { data: result.value });
  }),

  create: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const input = createCouponSchema.parse(req.body);
    const result = await couponService.create(input);
    if (result.isErr()) {
      sendError(res, { code: result.error.code, message: result.error.message, status: result.error.httpStatus });
      return;
    }
    sendSuccess(res, { data: result.value, status: 201 });
  }),

  update: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const input = updateCouponSchema.parse(req.body);
    const result = await couponService.update(req.params['id'] as string, input);
    if (result.isErr()) {
      sendError(res, { code: result.error.code, message: result.error.message, status: result.error.httpStatus });
      return;
    }
    sendSuccess(res, { data: result.value });
  }),

  deleteCoupon: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const result = await couponService.delete(req.params['id'] as string);
    if (result.isErr()) {
      sendError(res, { code: result.error.code, message: result.error.message, status: result.error.httpStatus });
      return;
    }
    sendSuccess(res, { data: null, status: 204 });
  }),
};
