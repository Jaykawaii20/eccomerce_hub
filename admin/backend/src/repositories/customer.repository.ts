import { User, Prisma } from '@prisma/client';
import { prisma } from '../config/prisma';

export interface CustomerListParams {
  page: number;
  pageSize: number;
  search?: string;
  sort?: string;
}

export interface ICustomerRepository {
  findAll(params: CustomerListParams): Promise<{ data: User[]; total: number }>;
  findById(id: string): Promise<User | null>;
  update(id: string, data: { isActive?: boolean; firstName?: string; lastName?: string; phone?: string }): Promise<User>;
}

export class CustomerRepository implements ICustomerRepository {
  async findAll(params: CustomerListParams): Promise<{ data: User[]; total: number }> {
    const { page, pageSize, search, sort = 'createdAt:desc' } = params;
    const skip = (page - 1) * pageSize;

    const [sortField, sortDirection] = sort.split(':') as [string, string];
    const orderBy: Prisma.UserOrderByWithRelationInput = {
      [sortField]: (sortDirection ?? 'desc') as Prisma.SortOrder,
    };

    const where: Prisma.UserWhereInput = {
      role: 'CUSTOMER',
      deletedAt: null,
      ...(search
        ? {
            OR: [
              { email: { contains: search, mode: 'insensitive' as Prisma.QueryMode } },
              { firstName: { contains: search, mode: 'insensitive' as Prisma.QueryMode } },
              { lastName: { contains: search, mode: 'insensitive' as Prisma.QueryMode } },
            ],
          }
        : {}),
    };

    const [data, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: pageSize,
        orderBy,
        include: {
          _count: {
            select: { orders: true },
          },
        },
      }),
      prisma.user.count({ where }),
    ]);

    return { data, total };
  }

  async findById(id: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { id, deletedAt: null },
      include: {
        addresses: true,
        _count: {
          select: { orders: true },
        },
      },
    }) as Promise<User | null>;
  }

  async update(
    id: string,
    data: { isActive?: boolean; firstName?: string; lastName?: string; phone?: string }
  ): Promise<User> {
    return prisma.user.update({
      where: { id },
      data,
    });
  }
}
