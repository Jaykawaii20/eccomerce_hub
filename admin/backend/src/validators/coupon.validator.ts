import { z } from 'zod';

export const createCouponSchema = z.object({
  code: z.string().min(1, 'Coupon code is required').max(100).transform((v) => v.toUpperCase()),
  type: z.enum(['PERCENTAGE', 'FIXED_CART', 'FIXED_PRODUCT']),
  amount: z.number().int('Amount must be an integer (cents)').min(0, 'Amount must be non-negative'),
  description: z.string().optional(),
  minOrderAmount: z.number().int().min(0).optional(),
  maxOrderAmount: z.number().int().min(0).optional(),
  usageLimitTotal: z.number().int().min(1).optional(),
  usageLimitPerUser: z.number().int().min(1).optional(),
  expiresAt: z.string().datetime().optional(),
  isActive: z.boolean().default(true),
});

export const updateCouponSchema = createCouponSchema.partial();

export const listCouponsSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().optional(),
  isActive: z.coerce.boolean().optional(),
});

export type CreateCouponInput = z.infer<typeof createCouponSchema>;
export type UpdateCouponInput = z.infer<typeof updateCouponSchema>;
export type ListCouponsInput = z.infer<typeof listCouponsSchema>;
