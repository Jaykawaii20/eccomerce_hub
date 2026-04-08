import { UserRole } from '@prisma/client';
import { Request } from 'express';

export interface AuthenticatedUser {
  id: string;
  supabaseId: string;
  email: string;
  role: UserRole;
}

export interface AuthenticatedRequest extends Request {
  user: AuthenticatedUser;
  correlationId: string;
}

export type CorrelatedRequest = Request & { correlationId: string };

export interface PaginationParams {
  page: number;
  pageSize: number;
}

export interface PaginatedResult<T> {
  data: T[];
  meta: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export type Permission =
  | 'products:read' | 'products:write' | 'products:delete'
  | 'orders:read' | 'orders:write' | 'orders:delete'
  | 'customers:read' | 'customers:write'
  | 'coupons:read' | 'coupons:write' | 'coupons:delete'
  | 'settings:read' | 'settings:write'
  | 'reports:read'
  | 'media:read' | 'media:write' | 'media:delete'
  | 'users:read' | 'users:write';

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  SUPER_ADMIN: [
    'products:read', 'products:write', 'products:delete',
    'orders:read', 'orders:write', 'orders:delete',
    'customers:read', 'customers:write',
    'coupons:read', 'coupons:write', 'coupons:delete',
    'settings:read', 'settings:write',
    'reports:read',
    'media:read', 'media:write', 'media:delete',
    'users:read', 'users:write',
  ],
  ADMIN: [
    'products:read', 'products:write', 'products:delete',
    'orders:read', 'orders:write',
    'customers:read', 'customers:write',
    'coupons:read', 'coupons:write',
    'settings:read',
    'reports:read',
    'media:read', 'media:write', 'media:delete',
    'users:read', 'users:write',
  ],
  MANAGER: [
    'products:read', 'products:write',
    'orders:read', 'orders:write',
    'customers:read',
    'coupons:read',
    'reports:read',
    'media:read', 'media:write',
  ],
  SUPPORT: [
    'orders:read', 'orders:write',
    'customers:read',
  ],
  VENDOR: [
    'products:read', 'products:write',
    'orders:read',
    'media:read', 'media:write',
  ],
  CUSTOMER: [],
};
