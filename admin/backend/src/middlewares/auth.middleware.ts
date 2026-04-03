import { Response, NextFunction } from 'express';
import { supabaseAdmin } from '../config/supabase';
import { prisma } from '../config/prisma';
import { AuthenticatedRequest } from '../types';
import { sendError } from '../utils/response';
import { asyncHandler } from '../utils/async-handler';

export const authenticate = asyncHandler(
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      sendError(res, { code: 'UNAUTHORIZED', message: 'Missing Bearer token.', status: 401 });
      return;
    }

    const token = authHeader.slice(7);

    const { data: { user: supabaseUser }, error } = await supabaseAdmin.auth.getUser(token);

    if (error || !supabaseUser) {
      sendError(res, { code: 'UNAUTHORIZED', message: 'Invalid or expired token.', status: 401 });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { supabaseId: supabaseUser.id, deletedAt: null },
      select: { id: true, supabaseId: true, email: true, role: true, isActive: true },
    });

    if (!user) {
      sendError(res, { code: 'UNAUTHORIZED', message: 'User account not found.', status: 401 });
      return;
    }

    if (!user.isActive) {
      sendError(res, { code: 'FORBIDDEN', message: 'Account is deactivated.', status: 403 });
      return;
    }

    req.user = { id: user.id, supabaseId: user.supabaseId, email: user.email, role: user.role };
    next();
  }
);
