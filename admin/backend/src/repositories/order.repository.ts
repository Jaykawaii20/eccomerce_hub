import { Order, OrderNote, Prisma, OrderStatus } from '@prisma/client';
import { prisma } from '../config/prisma';
import { ListOrdersInput } from '../validators/order.validator';

export interface IOrderRepository {
  findAll(params: ListOrdersInput): Promise<{ data: Order[]; total: number }>;
  findById(id: string): Promise<Order | null>;
  updateStatus(id: string, status: OrderStatus, comment: string | undefined, createdBy: string): Promise<Order>;
  addNote(orderId: string, note: string, isCustomerNote: boolean, createdBy: string): Promise<OrderNote>;
}

export class OrderRepository implements IOrderRepository {
  async findAll(params: ListOrdersInput): Promise<{ data: Order[]; total: number }> {
    const { page, pageSize, status, search, from, to, sort } = params;
    const skip = (page - 1) * pageSize;

    const [sortField, sortDirection] = sort.split(':') as [string, string];
    const orderBy: Prisma.OrderOrderByWithRelationInput = {
      [sortField]: (sortDirection ?? 'desc') as Prisma.SortOrder,
    };

    const where: Prisma.OrderWhereInput = {
      deletedAt: null,
      ...(status ? { status } : {}),
      ...(from || to
        ? {
            createdAt: {
              ...(from ? { gte: new Date(from) } : {}),
              ...(to ? { lte: new Date(to) } : {}),
            },
          }
        : {}),
      ...(search
        ? {
            OR: [
              { orderNumber: { contains: search, mode: 'insensitive' as Prisma.QueryMode } },
              { user: { email: { contains: search, mode: 'insensitive' as Prisma.QueryMode } } },
            ],
          }
        : {}),
    };

    const [data, total] = await Promise.all([
      prisma.order.findMany({
        where,
        skip,
        take: pageSize,
        orderBy,
        include: {
          user: {
            select: {
              email: true,
              firstName: true,
              lastName: true,
            },
          },
          items: {
            include: {
              product: {
                select: { id: true, name: true },
              },
            },
          },
        },
      }),
      prisma.order.count({ where }),
    ]);

    return { data, total };
  }

  async findById(id: string): Promise<Order | null> {
    return prisma.order.findUnique({
      where: { id, deletedAt: null },
      include: {
        user: true,
        items: {
          include: {
            product: true,
            variant: true,
          },
        },
        statusHistory: {
          orderBy: { createdAt: 'desc' },
        },
        notes: {
          orderBy: { createdAt: 'desc' },
        },
        payment: true,
        refunds: true,
      },
    }) as Promise<Order | null>;
  }

  async updateStatus(
    id: string,
    status: OrderStatus,
    comment: string | undefined,
    createdBy: string
  ): Promise<Order> {
    return prisma.$transaction(async (tx) => {
      const order = await tx.order.update({
        where: { id },
        data: { status },
      });

      await tx.orderStatusHistory.create({
        data: {
          orderId: id,
          status,
          comment,
          createdBy,
        },
      });

      return order;
    });
  }

  async addNote(
    orderId: string,
    note: string,
    isCustomerNote: boolean,
    createdBy: string
  ): Promise<OrderNote> {
    return prisma.orderNote.create({
      data: {
        orderId,
        note,
        isCustomerNote,
        createdBy,
      },
    });
  }
}
