import { Router } from 'express';
import healthRoutes from './health.routes';
import authRoutes from './auth.routes';
import productRoutes from './product.routes';
import orderRoutes from './order.routes';
import customerRoutes from './customer.routes';
import couponRoutes from './coupon.routes';
import shippingRoutes from './shipping.routes';
import settingsRoutes from './settings.routes';
import reportRoutes from './reports.routes';
import categoryRoutes from './category.routes';
import reviewRoutes from './review.routes';
import pageBuilderRoutes from './page-builder.routes';
import navCountsRoutes from './nav-counts.routes';

const router = Router();

router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/products', productRoutes);
router.use('/orders', orderRoutes);
router.use('/customers', customerRoutes);
router.use('/coupons', couponRoutes);
router.use('/shipping', shippingRoutes);
router.use('/settings', settingsRoutes);
router.use('/reports', reportRoutes);
router.use('/categories', categoryRoutes);
router.use('/reviews', reviewRoutes);
router.use('/page-builder', pageBuilderRoutes);
router.use('/nav-counts', navCountsRoutes);

export default router;
