import { Coupon, Prisma } from '@prisma/client';
import { prisma } from '../config/prisma';
import { CreateCouponInput, UpdateCouponInput, ListCouponsInput } from '../validators/coupon.validator';

export interface ICouponRepository {
  findAll(params: ListCouponsInput): Promise<{ data: Coupon[]; total: number }>;
  findById(id: string): Promise<Coupon | null>;
  findByCode(code: string): Promise<Coupon | null>;
  create(data: CreateCouponInput): Promise<Coupon>;
  update(id: string, data: UpdateCouponInput): Promise<Coupon>;
  delete(id: string): Promise<void>;
}

export class CouponRepository implements ICouponRepository {
  async findAll(params: ListCouponsInput): Promise<{ data: Coupon[]; total: number }> {
    const { page, pageSize, search, isActive } = params;
    const skip = (page - 1) * pageSize;

    const where: Prisma.CouponWhereInput = {
      ...(search ? { code: { contains: search, mode: 'insensitive' as Prisma.QueryMode } } : {}),
      ...(isActive !== undefined ? { isActive } : {}),
    };

    const [data, total] = await Promise.all([
      prisma.coupon.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: { usages: true },
          },
        },
      }),
      prisma.coupon.count({ where }),
    ]);

    return { data, total };
  }

  async findById(id: string): Promise<Coupon | null> {
    return prisma.coupon.findUnique({
      where: { id },
      include: {
        _count: {
          select: { usages: true },
        },
      },
    }) as Promise<Coupon | null>;
  }

  async findByCode(code: string): Promise<Coupon | null> {
    return prisma.coupon.findUnique({ where: { code } });
  }

  async create(data: CreateCouponInput): Promise<Coupon> {
    return prisma.coupon.create({
      data: {
        ...data,
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : undefined,
      },
    });
  }

  async update(id: string, data: UpdateCouponInput): Promise<Coupon> {
    return prisma.coupon.update({
      where: { id },
      data: {
        ...data,
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : undefined,
      },
    });
  }

  async delete(id: string): Promise<void> {
    await prisma.coupon.delete({ where: { id } });
  }
}
