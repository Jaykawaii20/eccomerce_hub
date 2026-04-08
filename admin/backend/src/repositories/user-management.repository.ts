import { User, UserRole, Prisma } from '@prisma/client';
import { prisma } from '../config/prisma';

export interface UserListParams {
  page: number;
  pageSize: number;
  search?: string;
  role?: UserRole;
  sort?: string;
}

export interface CreateUserData {
  supabaseId: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  phone?: string;
}

export interface UpdateUserData {
  firstName?: string;
  lastName?: string;
  role?: UserRole;
  isActive?: boolean;
  phone?: string;
}

export interface IUserManagementRepository {
  findAll(params: UserListParams): Promise<{ data: User[]; total: number }>;
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  create(data: CreateUserData): Promise<User>;
  update(id: string, data: UpdateUserData): Promise<User>;
  softDelete(id: string): Promise<void>;
}

export class UserManagementRepository implements IUserManagementRepository {
  async findAll(params: UserListParams): Promise<{ data: User[]; total: number }> {
    const { page, pageSize, search, role, sort = 'createdAt:desc' } = params;
    const skip = (page - 1) * pageSize;

    const [sortField, sortDirection] = sort.split(':') as [string, string];
    const orderBy: Prisma.UserOrderByWithRelationInput = {
      [sortField]: (sortDirection ?? 'desc') as Prisma.SortOrder,
    };

    const where: Prisma.UserWhereInput = {
      deletedAt: null,
      ...(role ? { role } : {}),
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
          _count: { select: { orders: true } },
        },
      }),
      prisma.user.count({ where }),
    ]);

    return { data, total };
  }

  async findById(id: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { id, deletedAt: null },
    }) as Promise<User | null>;
  }

  async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { email, deletedAt: null } });
  }

  async create(data: CreateUserData): Promise<User> {
    return prisma.user.create({ data });
  }

  async update(id: string, data: UpdateUserData): Promise<User> {
    return prisma.user.update({ where: { id }, data });
  }

  async softDelete(id: string): Promise<void> {
    await prisma.user.update({ where: { id }, data: { deletedAt: new Date() } });
  }
}
