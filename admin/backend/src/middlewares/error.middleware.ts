import { Request, Response, NextFunction } from 'express';
import { env } from '../config/env';
import { logger } from '../utils/logger';
import { sendError } from '../utils/response';

export function errorMiddleware(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  const correlationId = (req as Request & { correlationId?: string }).correlationId;

  logger.error('Unhandled error', {
    correlationId,
    message: err.message,
    stack: env.NODE_ENV !== 'production' ? err.stack : undefined,
    path: req.path,
    method: req.method,
  });

  if (res.headersSent) return;

  sendError(res, {
    code: 'INTERNAL_ERROR',
    message: env.NODE_ENV === 'production' ? 'An unexpected error occurred.' : err.message,
    status: 500,
  });
}
