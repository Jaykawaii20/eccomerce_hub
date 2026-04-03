import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../config/prisma';
import { authenticate } from '../middlewares/auth.middleware';
import { requirePermission } from '../middlewares/rbac.middleware';
import { sendSuccess, sendError, sendPaginated } from '../utils/response';
import { asyncHandler } from '../utils/async-handler';

const router = Router();

router.get(
  '/',
  authenticate,
  requirePermission('products:read'),
  asyncHandler(async (req, res) => {
    const { page = '1', pageSize = '20', search, isApproved } = req.query as Record<string, string>;
    const p = parseInt(page);
    const ps = parseInt(pageSize);
    const skip = (p - 1) * ps;

    const where: Record<string, unknown> = {};
    if (search) {
      where['product'] = { name: { contains: search, mode: 'insensitive' } };
    }
    if (isApproved !== undefined && isApproved !== '') {
      where['isApproved'] = isApproved === 'true';
    }

    const [data, total] = await Promise.all([
      prisma.productReview.findMany({
        where,
        skip,
        take: ps,
        orderBy: { createdAt: 'desc' },
        include: {
          product: { select: { id: true, name: true } },
          user: { select: { id: true, firstName: true, lastName: true, email: true } },
        },
      }),
      prisma.productReview.count({ where }),
    ]);

    sendPaginated(res, data, { page: p, pageSize: ps, total });
  })
);

router.patch(
  '/:id/approve',
  authenticate,
  requirePermission('products:write'),
  asyncHandler(async (req, res) => {
    const { isApproved } = z.object({ isApproved: z.boolean() }).parse(req.body);
    const review = await prisma.productReview.update({
      where: { id: req.params['id'] },
      data: { isApproved },
    });
    sendSuccess(res, { data: review });
  })
);

router.delete(
  '/:id',
  authenticate,
  requirePermission('products:delete'),
  asyncHandler(async (req, res) => {
    const review = await prisma.productReview.findUnique({ where: { id: req.params['id'] } });
    if (!review) {
      sendError(res, { code: 'REVIEW_NOT_FOUND', message: 'Review not found.', status: 404 });
      return;
    }
    await prisma.productReview.delete({ where: { id: req.params['id'] } });
    sendSuccess(res, { data: null, status: 204 });
  })
);

export default router;
