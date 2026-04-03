import { Router } from 'express';
import { reportsController } from '../controllers/reports.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { requirePermission } from '../middlewares/rbac.middleware';

const router = Router();

router.get('/summary', authenticate, requirePermission('reports:read'), reportsController.summary);
router.get('/sales', authenticate, requirePermission('reports:read'), reportsController.salesByDate);
router.get('/top-products', authenticate, requirePermission('reports:read'), reportsController.topProducts);

export default router;
