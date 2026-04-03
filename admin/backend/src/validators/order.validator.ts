import { z } from 'zod';

export const listOrdersSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  status: z
    .enum(['PENDING', 'PROCESSING', 'ON_HOLD', 'COMPLETED', 'CANCELLED', 'REFUNDED', 'FAILED'])
    .optional(),
  search: z.string().optional(),
  from: z.string().optional(),
  to: z.string().optional(),
  sort: z.string().default('createdAt:desc'),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum(['PENDING', 'PROCESSING', 'ON_HOLD', 'COMPLETED', 'CANCELLED', 'REFUNDED', 'FAILED']),
  comment: z.string().optional(),
});

export const addOrderNoteSchema = z.object({
  note: z.string().min(1, 'Note cannot be empty'),
  isCustomerNote: z.boolean().default(false),
});

export type ListOrdersInput = z.infer<typeof listOrdersSchema>;
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;
export type AddOrderNoteInput = z.infer<typeof addOrderNoteSchema>;
