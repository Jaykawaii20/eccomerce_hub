import { Response, NextFunction } from 'express';
import { AuthenticatedRequest, Permission, ROLE_PERMISSIONS } from '../types';
import { sendError } from '../utils/response';

export function requirePermission(permission: Permission) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      sendError(res, { code: 'UNAUTHORIZED', message: 'Authentication required.', status: 401 });
      return;
    }
    const userPermissions = ROLE_PERMISSIONS[req.user.role] ?? [];
    if (!userPermissions.includes(permission)) {
      sendError(res, { code: 'FORBIDDEN', message: 'Insufficient permissions.', status: 403 });
      return;
    }
    next();
  };
}

export function requireRole(...roles: string[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role)) {
      sendError(res, { code: 'FORBIDDEN', message: 'Insufficient permissions.', status: 403 });
      return;
    }
    next();
  };
}
