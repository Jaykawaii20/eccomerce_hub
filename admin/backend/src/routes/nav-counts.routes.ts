import { Router } from 'express';
import { prisma } from '../config/prisma';
import { authenticate } from '../middlewares/auth.middleware';
import { sendSuccess } from '../utils/response';
import { asyncHandler } from '../utils/async-handler';

const router = Router();

// Returns live counts for sidebar badges — one request, no N+1
router.get(
  '/',
  authenticate,
  asyncHandler(async (_req, res) => {
    const [
      products,
      pendingOrders,
      pendingReviews,
      activeCoupons,
    ] = await Promise.all([
      prisma.product.count({ where: { deletedAt: null } }),
      prisma.order.count({ where: { status: 'PENDING', deletedAt: null } }),
      prisma.productReview.count({ where: { isApproved: false } }),
      prisma.coupon.count({ where: { isActive: true } }),
    ]);

    sendSuccess(res, {
      data: {
        products,
        pendingOrders,
        pendingReviews,
        activeCoupons,
      },
    });
  })
);

export default router;
