import { Router } from 'express';
import { couponController } from '../controllers/coupon.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { requirePermission } from '../middlewares/rbac.middleware';
import { validate } from '../middlewares/validate.middleware';
import { createCouponSchema, updateCouponSchema } from '../validators/coupon.validator';

const router = Router();

router.get('/', authenticate, requirePermission('coupons:read'), couponController.list);
router.get('/:id', authenticate, requirePermission('coupons:read'), couponController.getById);
router.post('/', authenticate, requirePermission('coupons:write'), validate(createCouponSchema), couponController.create);
router.put('/:id', authenticate, requirePermission('coupons:write'), validate(updateCouponSchema), couponController.update);
router.delete('/:id', authenticate, requirePermission('coupons:delete'), couponController.deleteCoupon);

export default router;
