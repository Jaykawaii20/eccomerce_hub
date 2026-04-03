import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../config/prisma';
import { authenticate } from '../middlewares/auth.middleware';
import { requirePermission } from '../middlewares/rbac.middleware';
import { sendSuccess, sendError } from '../utils/response';
import { asyncHandler } from '../utils/async-handler';

const router = Router();

const categorySchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().optional(),
  parentId: z.string().uuid().optional().nullable(),
  imageUrl: z.string().url().optional().nullable(),
  isActive: z.boolean().default(true),
  sortOrder: z.number().int().default(0),
});

router.get(
  '/',
  authenticate,
  requirePermission('products:read'),
  asyncHandler(async (_req, res) => {
    const categories = await prisma.category.findMany({
      include: { _count: { select: { products: true } } },
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    });
    sendSuccess(res, { data: categories });
  })
);

router.get(
  '/:id',
  authenticate,
  requirePermission('products:read'),
  asyncHandler(async (req, res) => {
    const category = await prisma.category.findUnique({ where: { id: req.params['id'] } });
    if (!category) {
      sendError(res, { code: 'CATEGORY_NOT_FOUND', message: 'Category not found.', status: 404 });
      return;
    }
    sendSuccess(res, { data: category });
  })
);

router.post(
  '/',
  authenticate,
  requirePermission('products:write'),
  asyncHandler(async (req, res) => {
    const input = categorySchema.parse(req.body);
    const existing = await prisma.category.findUnique({ where: { slug: input.slug } });
    if (existing) {
      sendError(res, { code: 'CONFLICT', message: `A category with slug "${input.slug}" already exists.`, status: 409 });
      return;
    }
    const category = await prisma.category.create({ data: input });
    sendSuccess(res, { data: category, status: 201 });
  })
);

router.put(
  '/:id',
  authenticate,
  requirePermission('products:write'),
  asyncHandler(async (req, res) => {
    const input = categorySchema.partial().parse(req.body);
    if (input.slug) {
      const existing = await prisma.category.findFirst({
        where: { slug: input.slug, id: { not: req.params['id'] } },
      });
      if (existing) {
        sendError(res, { code: 'CONFLICT', message: `Slug "${input.slug}" is already taken.`, status: 409 });
        return;
      }
    }
    const category = await prisma.category.update({ where: { id: req.params['id'] }, data: input });
    sendSuccess(res, { data: category });
  })
);

router.delete(
  '/:id',
  authenticate,
  requirePermission('products:delete'),
  asyncHandler(async (req, res) => {
    await prisma.category.delete({ where: { id: req.params['id'] } });
    sendSuccess(res, { data: null, status: 204 });
  })
);

export default router;
