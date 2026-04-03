import { Router } from 'express';
import { productController } from '../controllers/product.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { requirePermission } from '../middlewares/rbac.middleware';
import { validate } from '../middlewares/validate.middleware';
import { createProductSchema, updateProductSchema } from '../validators/product.validator';

const router = Router();

router.get('/', authenticate, requirePermission('products:read'), productController.list);
router.get('/categories', authenticate, requirePermission('products:read'), productController.listCategories);
router.get('/:id', authenticate, requirePermission('products:read'), productController.getById);
router.post('/', authenticate, requirePermission('products:write'), validate(createProductSchema), productController.create);
router.put('/:id', authenticate, requirePermission('products:write'), validate(updateProductSchema), productController.update);
router.delete('/:id', authenticate, requirePermission('products:delete'), productController.deleteProduct);

export default router;
