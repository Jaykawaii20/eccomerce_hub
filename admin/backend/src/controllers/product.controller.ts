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
import { redis } from '../config/redis';

const productService = new ProductService(new ProductRepository());

const CACHE_TTL = 300; // 5 minutes

/** Build a deterministic cache key from query params */
function productListCacheKey(query: Record<string, unknown>): string {
  const { page = 1, pageSize = 20, status = '', type = '', search = '', categoryId = '', sort = 'createdAt:desc' } = query;
  return `products:list:${page}:${pageSize}:${status}:${type}:${search}:${categoryId}:${sort}`;
}

/** Invalidate all product list cache entries (called on create/update/delete) */
async function invalidateProductCache(): Promise<void> {
  if (!redis) return;
  try {
    // Upstash SCAN to find and delete all products:list:* keys
    let cursor = 0;
    do {
      const [nextCursor, keys] = await redis.scan(cursor, { match: 'products:list:*', count: 100 });
      cursor = Number(nextCursor);
      if (keys.length > 0) {
        await redis.del(...keys);
      }
    } while (cursor !== 0);
  } catch {
    // Cache invalidation failure must never break the mutation
  }
}

export const productController = {
  list: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const params = listProductsSchema.parse(req.query);

    // Try cache first
    if (redis) {
      try {
        const cacheKey = productListCacheKey(req.query as Record<string, unknown>);
        const cached = await redis.get<string>(cacheKey);
        if (cached) {
          res.setHeader('X-Cache', 'HIT');
          res.json(JSON.parse(cached));
          return;
        }
      } catch { /* cache miss — fall through */ }
    }

    const result = await productService.list(params);
    if (result.isErr()) {
      sendError(res, { code: result.error.code, message: result.error.message, status: result.error.httpStatus });
      return;
    }

    const responseBody = {
      success: true,
      data: result.value.data,
      meta: {
        page: params.page,
        pageSize: params.pageSize,
        total: result.value.total,
        totalPages: Math.ceil(result.value.total / params.pageSize),
      },
    };

    // Store in cache (fire-and-forget)
    if (redis) {
      const cacheKey = productListCacheKey(req.query as Record<string, unknown>);
      redis.set(cacheKey, JSON.stringify(responseBody), { ex: CACHE_TTL }).catch(() => null);
    }

    res.setHeader('X-Cache', 'MISS');
    res.json(responseBody);
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
    await invalidateProductCache();
    sendSuccess(res, { data: result.value, status: 201 });
  }),

  update: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const input = updateProductSchema.parse(req.body);
    const result = await productService.update(req.params['id'] as string, input);
    if (result.isErr()) {
      sendError(res, { code: result.error.code, message: result.error.message, status: result.error.httpStatus });
      return;
    }
    await invalidateProductCache();
    sendSuccess(res, { data: result.value });
  }),

  deleteProduct: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const result = await productService.delete(req.params['id'] as string);
    if (result.isErr()) {
      sendError(res, { code: result.error.code, message: result.error.message, status: result.error.httpStatus });
      return;
    }
    await invalidateProductCache();
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
