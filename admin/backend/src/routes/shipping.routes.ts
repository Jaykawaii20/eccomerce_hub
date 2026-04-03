import { Router } from 'express';
import { shippingController } from '../controllers/shipping.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { requirePermission } from '../middlewares/rbac.middleware';

const router = Router();

router.get('/zones', authenticate, requirePermission('settings:read'), shippingController.listZones);
router.get('/zones/:id', authenticate, requirePermission('settings:read'), shippingController.getZone);
router.post('/zones', authenticate, requirePermission('settings:write'), shippingController.createZone);
router.put('/zones/:id', authenticate, requirePermission('settings:write'), shippingController.updateZone);
router.delete('/zones/:id', authenticate, requirePermission('settings:write'), shippingController.deleteZone);
router.post('/zones/:id/methods', authenticate, requirePermission('settings:write'), shippingController.addMethod);
router.put('/methods/:id', authenticate, requirePermission('settings:write'), shippingController.updateMethod);
router.delete('/methods/:id', authenticate, requirePermission('settings:write'), shippingController.deleteMethod);

export default router;
