import { Router } from 'express';
import { userManagementController } from '../controllers/user-management.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { requirePermission } from '../middlewares/rbac.middleware';

const router = Router();

// All routes require authentication + users permission
router.use(authenticate);

router.get('/', requirePermission('users:read'), userManagementController.list);
router.get('/:id', requirePermission('users:read'), userManagementController.getById);
router.post('/', requirePermission('users:write'), userManagementController.create);
router.put('/:id', requirePermission('users:write'), userManagementController.update);
router.delete('/:id', requirePermission('users:write'), userManagementController.delete);

export default router;
