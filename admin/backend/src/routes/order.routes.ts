import { Router } from 'express';
import { orderController } from '../controllers/order.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { requirePermission } from '../middlewares/rbac.middleware';
import { validate } from '../middlewares/validate.middleware';
import { updateOrderStatusSchema, addOrderNoteSchema } from '../validators/order.validator';

const router = Router();

router.get('/', authenticate, requirePermission('orders:read'), orderController.list);
router.get('/:id', authenticate, requirePermission('orders:read'), orderController.getById);
router.patch('/:id/status', authenticate, requirePermission('orders:write'), validate(updateOrderStatusSchema), orderController.updateStatus);
router.post('/:id/notes', authenticate, requirePermission('orders:write'), validate(addOrderNoteSchema), orderController.addNote);

export default router;
