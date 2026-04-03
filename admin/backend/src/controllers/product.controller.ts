import { Response } from 'express';
import { ProductService } from '../services/product.service';
import { ProductRepository } from '../repositories/product.repository';
import {
  createProductSchema,
  updateProductSchema,
  listProductsSchema,
} from '../validators/product.validator';
import { sendSuccess, sendError, sendPaginated } from '../utils/response';
import { asyncHandler } from '../utils/async-handler';
import { AuthenticatedRequest } from '../types';

const productService = new ProductService(new ProductRepository());

export const productController = {
  list: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const params = listProductsSchema.parse(req.query);
    const result = await productService.list(params);
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
    const result = await productService.getById(req.params['id'] as string);
    if (result.isErr()) {
      sendError(res, { code: result.error.code, message: result.error.message, status: result.error.httpStatus });
      return;
    }
    sendSuccess(res, { data: result.value });
  }),

  create: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const input = createProductSchema.parse(req.body);
    const result = await productService.create(input, req.user.id);
    if (result.isErr()) {
      sendError(res, { code: result.error.code, message: result.error.message, status: result.error.httpStatus });
      return;
    }
    sendSuccess(res, { data: result.value, status: 201 });
  }),

  update: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const input = updateProductSchema.parse(req.body);
    const result = await productService.update(req.params['id'] as string, input);
    if (result.isErr()) {
      sendError(res, { code: result.error.code, message: result.error.message, status: result.error.httpStatus });
      return;
    }
    sendSuccess(res, { data: result.value });
  }),

  deleteProduct: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const result = await productService.delete(req.params['id'] as string);
    if (result.isErr()) {
      sendError(res, { code: result.error.code, message: result.error.message, status: result.error.httpStatus });
      return;
    }
    sendSuccess(res, { data: null, status: 204 });
  }),

  listCategories: asyncHandler(async (_req: AuthenticatedRequest, res: Response) => {
    const result = await productService.listCategories();
    if (result.isErr()) {
      sendError(res, { code: result.error.code, message: result.error.message, status: result.error.httpStatus });
      return;
    }
    sendSuccess(res, { data: result.value });
  }),
};
