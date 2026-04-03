import { Response } from 'express';

interface SuccessOptions<T> {
  data: T;
  meta?: Record<string, unknown>;
  status?: number;
}

interface ErrorOptions {
  code: string;
  message: string;
  details?: unknown[];
  status?: number;
}

export function sendSuccess<T>(res: Response, options: SuccessOptions<T>): void {
  res.status(options.status ?? 200).json({
    success: true,
    data: options.data,
    ...(options.meta ? { meta: options.meta } : {}),
  });
}

export function sendError(res: Response, options: ErrorOptions): void {
  res.status(options.status ?? 500).json({
    success: false,
    error: {
      code: options.code,
      message: options.message,
      ...(options.details?.length ? { details: options.details } : {}),
    },
  });
}

export function sendPaginated<T>(
  res: Response,
  data: T[],
  meta: { page: number; pageSize: number; total: number }
): void {
  res.status(200).json({
    success: true,
    data,
    meta: {
      ...meta,
      totalPages: Math.ceil(meta.total / meta.pageSize),
    },
  });
}
