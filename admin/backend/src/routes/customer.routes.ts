import { Router } from 'express';
import { customerController } from '../controllers/customer.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { requirePermission } from '../middlewares/rbac.middleware';

const router = Router();

router.get('/', authenticate, requirePermission('customers:read'), customerController.list);
router.get('/:id', authenticate, requirePermission('customers:read'), customerController.getById);
router.patch('/:id/active', authenticate, requirePermission('customers:write'), customerController.toggleActive);

export default router;
