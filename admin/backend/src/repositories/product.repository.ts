import { Product, Category, Prisma } from '@prisma/client';
import { prisma } from '../config/prisma';
import { CreateProductInput, UpdateProductInput, ListProductsInput } from '../validators/product.validator';

export interface ProductListItem {
  id: string;
  name: string;
  slug: string;
  sku: string | null;
  status: Product['status'];
  type: Product['type'];
  price: number;
  salePrice: number | null;
  stockQuantity: number;
  featuredImageUrl: string | null;
  createdAt: Date;
}

export interface IProductRepository {
  findAll(params: ListProductsInput): Promise<{ data: ProductListItem[]; total: number }>;
  findById(id: string): Promise<Product | null>;
  findBySlug(slug: string): Promise<Product | null>;
  create(data: CreateProductInput): Promise<Product>;
  update(id: string, data: UpdateProductInput): Promise<Product>;
  delete(id: string): Promise<void>;
  findCategories(): Promise<Category[]>;
}

export class ProductRepository implements IProductRepository {
  async findAll(params: ListProductsInput): Promise<{ data: ProductListItem[]; total: number }> {
    const { page, pageSize, status, type, search, categoryId, sort } = params;
    const skip = (page - 1) * pageSize;

    const [sortField, sortDirection] = sort.split(':') as [string, string];
    const orderBy: Prisma.ProductOrderByWithRelationInput = {
      [sortField]: (sortDirection ?? 'desc') as Prisma.SortOrder,
    };

    const where: Prisma.ProductWhereInput = {
      deletedAt: null,
      ...(status ? { status: status as Prisma.EnumProductStatusFilter } : {}),
      ...(type ? { type: type as Prisma.EnumProductTypeFilter } : {}),
      ...(search ? { name: { contains: search, mode: 'insensitive' as Prisma.QueryMode } } : {}),
      ...(categoryId
        ? { categories: { some: { categoryId } } }
        : {}),
    };

    const [data, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: pageSize,
        orderBy,
        select: {
          id: true,
          name: true,
          slug: true,
          sku: true,
          status: true,
          type: true,
          price: true,
          salePrice: true,
          stockQuantity: true,
          featuredImageUrl: true,
          createdAt: true,
        },
      }),
      prisma.product.count({ where }),
    ]);

    return { data, total };
  }

  async findById(id: string): Promise<Product | null> {
    return prisma.product.findUnique({
      where: { id, deletedAt: null },
      include: {
        images: { orderBy: { sortOrder: 'asc' } },
        categories: { include: { category: true } },
        variants: true,
        reviews: {
          take: 5,
          orderBy: { createdAt: 'desc' },
        },
      },
    }) as Promise<Product | null>;
  }

  async findBySlug(slug: string): Promise<Product | null> {
    // Use findFirst (not findUnique) so we can search across ALL rows,
    // including soft-deleted ones — the DB unique constraint covers every row.
    return prisma.product.findFirst({ where: { slug } });
  }

  async create(data: CreateProductInput): Promise<Product> {
    const { categoryIds, sku, ...productData } = data;

    return prisma.$transaction(async (tx) => {
      // ── Slug uniqueness (across ALL rows, including soft-deleted) ──────────
      let newSlug = productData.slug;
      const slugTaken = await tx.product.findFirst({ where: { slug: newSlug } });
      if (slugTaken) {
        let counter = 1;
        while (await tx.product.findFirst({ where: { slug: `${productData.slug}-${counter}` } })) {
          counter++;
        }
        newSlug = `${productData.slug}-${counter}`;
      }

      // ── SKU uniqueness ─────────────────────────────────────────────────────
      let newSku = sku;
      if (sku) {
        let skuTaken = await tx.product.findUnique({ where: { sku } });
        let counter = 1;
        while (skuTaken) {
          newSku = `${sku}-${counter}`;
          skuTaken = await tx.product.findUnique({ where: { sku: newSku } });
          counter++;
        }
      }

      // Create product
      const product = await tx.product.create({
        data: {
          ...productData,
          slug: newSlug,
          ...(newSku && { sku: newSku }),
          weight: productData.weight !== undefined ? productData.weight : undefined,
          length: productData.length !== undefined ? productData.length : undefined,
          width: productData.width !== undefined ? productData.width : undefined,
          height: productData.height !== undefined ? productData.height : undefined,
        },
      });

      // Assign categories if provided
      if (categoryIds && categoryIds.length > 0) {
        await tx.productCategory.createMany({
          data: categoryIds.map((categoryId) => ({
            productId: product.id,
            categoryId,
          })),
        });
      }

      return product;
    });
  }

  async update(id: string, data: UpdateProductInput): Promise<Product> {
    const { categoryIds, sku, ...productData } = data;

    return prisma.$transaction(async (tx) => {

      let newSku = sku;

      // Check if SKU is provided and if it's already taken by another product
      if (sku) {
        let exists = await tx.product.findUnique({ where: { sku } });
        let counter = 1;

        // Keep generating a new SKU until it's unique
        while (exists && exists.id !== id) {
          newSku = `${sku}-${counter}`;
          exists = await tx.product.findUnique({ where: { sku: newSku } });
          counter++;
        }
      }

      // Update the product
      const product = await tx.product.update({
        where: { id },
        data: {
          ...productData,
          ...(newSku && { sku: newSku }),
        },
      });

      // Update categories if provided
      if (categoryIds !== undefined) {
        await tx.productCategory.deleteMany({ where: { productId: id } });
        if (categoryIds.length > 0) {
          await tx.productCategory.createMany({
            data: categoryIds.map((categoryId) => ({
              productId: id,
              categoryId,
            })),
          });
        }
      }

      return product;
    });
  }

  async delete(id: string): Promise<void> {
    await prisma.product.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async findCategories(): Promise<Category[]> {
    return prisma.category.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    });
  }
}
