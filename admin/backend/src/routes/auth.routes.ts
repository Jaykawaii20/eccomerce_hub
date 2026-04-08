import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { authRateLimit } from '../middlewares/rate-limit.middleware';
import { validate } from '../middlewares/validate.middleware';
import { registerSchema, loginSchema, forgotPasswordSchema } from '../validators/auth.validator';

const router = Router();

router.post('/register', authRateLimit, validate(registerSchema), authController.register);
router.post('/admin/login', authRateLimit, validate(loginSchema), authController.adminLogin);
router.post('/login', authRateLimit, validate(loginSchema), authController.login);
router.post('/logout', authenticate, authController.logout);
router.post('/refresh', authController.refresh);
router.post('/forgot-password', authRateLimit, validate(forgotPasswordSchema), authController.forgotPassword);
router.get('/me', authenticate, authController.me);

export default router;
