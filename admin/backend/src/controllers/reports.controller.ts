import { Response } from 'express';
import { z } from 'zod';
import { prisma } from '../config/prisma';
import { sendSuccess } from '../utils/response';
import { asyncHandler } from '../utils/async-handler';
import { AuthenticatedRequest } from '../types';

const dateRangeSchema = z.object({
  from: z.string().optional(),
  to: z.string().optional(),
  groupBy: z.enum(['day', 'week', 'month']).default('day'),
});

function getPeriodDates(from?: string, to?: string) {
  const toDate = to ? new Date(to) : new Date();
  toDate.setHours(23, 59, 59, 999);
  const fromDate = from ? new Date(from) : new Date(toDate.getTime() - 30 * 24 * 60 * 60 * 1000);
  fromDate.setHours(0, 0, 0, 0);
  const prevFromDate = new Date(fromDate.getTime() - (toDate.getTime() - fromDate.getTime()));
  return { fromDate, toDate, prevFromDate };
}

export const reportsController = {
  summary: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { from, to } = req.query as { from?: string; to?: string };
    const { fromDate, toDate, prevFromDate } = getPeriodDates(from, to);

    const [
      currentRevenue,
      prevRevenue,
      totalOrders,
      prevOrders,
      totalCustomers,
      totalProducts,
    ] = await Promise.all([
      prisma.order.aggregate({
        _sum: { total: true },
        where: {
          status: 'COMPLETED',
          paymentStatus: 'PAID',
          createdAt: { gte: fromDate, lte: toDate },
          deletedAt: null,
        },
      }),
      prisma.order.aggregate({
        _sum: { total: true },
        where: {
          status: 'COMPLETED',
          paymentStatus: 'PAID',
          createdAt: { gte: prevFromDate, lt: fromDate },
          deletedAt: null,
        },
      }),
      prisma.order.count({
        where: {
          status: { notIn: ['CANCELLED', 'FAILED'] },
          createdAt: { gte: fromDate, lte: toDate },
          deletedAt: null,
        },
      }),
      prisma.order.count({
        where: {
          status: { notIn: ['CANCELLED', 'FAILED'] },
          createdAt: { gte: prevFromDate, lt: fromDate },
          deletedAt: null,
        },
      }),
      prisma.user.count({ where: { role: 'CUSTOMER', deletedAt: null } }),
      prisma.product.count({ where: { status: 'PUBLISHED', deletedAt: null } }),
    ]);

    const rev = currentRevenue._sum.total ?? 0;
    const prevRev = prevRevenue._sum.total ?? 0;
    const revenueChange = prevRev === 0 ? null : Math.round(((rev - prevRev) / prevRev) * 100);
    const ordersChange = prevOrders === 0 ? null : Math.round(((totalOrders - prevOrders) / prevOrders) * 100);

    sendSuccess(res, {
      data: {
        totalRevenue: rev,
        totalOrders,
        totalCustomers,
        totalProducts,
        revenueChange,
        ordersChange,
      },
    });
  }),

  salesByDate: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const params = dateRangeSchema.parse(req.query);
    const { fromDate, toDate } = getPeriodDates(params.from, params.to);

    const truncMap: Record<string, string> = {
      day: 'day',
      week: 'week',
      month: 'month',
    };
    const trunc = truncMap[params.groupBy];

    const rows = await prisma.$queryRaw<{ date: Date; revenue: bigint; orders: bigint }[]>`
      SELECT
        date_trunc(${trunc}, created_at) AS date,
        SUM(total)::bigint AS revenue,
        COUNT(*)::bigint AS orders
      FROM orders
      WHERE
        status NOT IN ('CANCELLED', 'FAILED')
        AND deleted_at IS NULL
        AND created_at >= ${fromDate}
        AND created_at <= ${toDate}
      GROUP BY date_trunc(${trunc}, created_at)
      ORDER BY date ASC
    `;

    sendSuccess(res, {
      data: rows.map((r) => ({
        date: r.date,
        revenue: Number(r.revenue),
        orders: Number(r.orders),
      })),
    });
  }),

  topProducts: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { from, to } = req.query as { from?: string; to?: string };
    const { fromDate, toDate } = getPeriodDates(from, to);

    const rows = await prisma.$queryRaw<
      { productId: string; name: string; totalRevenue: bigint; totalQuantity: bigint }[]
    >`
      SELECT
        oi.product_id AS "productId",
        oi.name,
        SUM(oi.total_price)::bigint AS "totalRevenue",
        SUM(oi.quantity)::bigint AS "totalQuantity"
      FROM order_items oi
      JOIN orders o ON o.id = oi.order_id
      WHERE
        o.status NOT IN ('CANCELLED', 'FAILED')
        AND o.deleted_at IS NULL
        AND o.created_at >= ${fromDate}
        AND o.created_at <= ${toDate}
      GROUP BY oi.product_id, oi.name
      ORDER BY "totalRevenue" DESC
      LIMIT 10
    `;

    sendSuccess(res, {
      data: rows.map((r) => ({
        productId: r.productId,
        name: r.name,
        totalRevenue: Number(r.totalRevenue),
        totalQuantity: Number(r.totalQuantity),
      })),
    });
  }),
};
