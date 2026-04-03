import { Product, Category, Prisma } from '@prisma/client';
import { prisma } from '../config/prisma';
import { CreateProductInput, UpdateProductInput, ListProductsInput } from '../validators/product.validator';

export interface IProductRepository {
  findAll(params: ListProductsInput): Promise<{ data: Product[]; total: number }>;
  findById(id: string): Promise<Product | null>;
  findBySlug(slug: string): Promise<Product | null>;
  create(data: CreateProductInput): Promise<Product>;
  update(id: string, data: UpdateProductInput): Promise<Product>;
  delete(id: string): Promise<void>;
  findCategories(): Promise<Category[]>;
}

export class ProductRepository implements IProductRepository {
  async findAll(params: ListProductsInput): Promise<{ data: Product[]; total: number }> {
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
        include: {
          images: {
            take: 1,
            orderBy: { sortOrder: 'asc' },
          },
          categories: {
            include: { category: true },
          },
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
    return prisma.product.findUnique({
      where: { slug, deletedAt: null },
    });
  }

  async create(data: CreateProductInput): Promise<Product> {
    const { categoryIds, ...productData } = data;

    return prisma.$transaction(async (tx) => {
      const product = await tx.product.create({
        data: {
          ...productData,
          weight: productData.weight !== undefined ? productData.weight : undefined,
          length: productData.length !== undefined ? productData.length : undefined,
          width: productData.width !== undefined ? productData.width : undefined,
          height: productData.height !== undefined ? productData.height : undefined,
        },
      });

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
    const { categoryIds, ...productData } = data;

    return prisma.$transaction(async (tx) => {
      const product = await tx.product.update({
        where: { id },
        data: {
          ...productData,
        },
      });

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
