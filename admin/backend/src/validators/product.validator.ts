import { z } from 'zod';

export const createProductSchema = z.object({
  name: z.string().min(1, 'Product name is required').max(255),
  slug: z.string().min(1, 'Slug is required').max(255),
  sku: z.string().max(100).optional(),
  type: z.enum(['SIMPLE', 'VARIABLE', 'GROUPED', 'VIRTUAL', 'DOWNLOADABLE']).default('SIMPLE'),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).default('DRAFT'),
  shortDescription: z.string().optional(),
  description: z.string().optional(),
  price: z.number().int('Price must be an integer (cents)').min(0, 'Price must be non-negative'),
  salePrice: z.number().int('Sale price must be an integer (cents)').min(0).optional(),
  taxClass: z.enum(['STANDARD', 'REDUCED', 'ZERO']).default('STANDARD'),
  manageStock: z.boolean().default(true),
  stockQuantity: z.number().int().default(0),
  lowStockThreshold: z.number().int().default(5),
  isFeatured: z.boolean().default(false),
  metaTitle: z.string().max(255).optional(),
  metaDescription: z.string().max(500).optional(),
  categoryIds: z.array(z.string().uuid()).optional(),
  weight: z.number().optional(),
  length: z.number().optional(),
  width: z.number().optional(),
  height: z.number().optional(),
});

export const updateProductSchema = createProductSchema.partial();

export const listProductsSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  status: z.string().optional(),
  type: z.string().optional(),
  search: z.string().optional(),
  categoryId: z.string().uuid().optional(),
  sort: z.string().default('createdAt:desc'),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type ListProductsInput = z.infer<typeof listProductsSchema>;
