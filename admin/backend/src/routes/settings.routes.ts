import { Router } from 'express';
import { settingsController } from '../controllers/settings.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { requirePermission } from '../middlewares/rbac.middleware';

const router = Router();

router.get('/', authenticate, requirePermission('settings:read'), settingsController.getAll);
router.post('/', authenticate, requirePermission('settings:write'), settingsController.upsert);
router.get('/:key', authenticate, requirePermission('settings:read'), settingsController.getByKey);

export default router;
