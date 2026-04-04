import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../config/prisma';
import { asyncHandler } from '../utils/async-handler';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

// ─── GET /storefront/products ─────────────────────────────────────────────────
// Public: paginated list of published products
router.get('/products', asyncHandler(async (req, res) => {
  const {
    page = '1',
    pageSize = '12',
    category,
    search,
    minPrice,
    maxPrice,
    sort = 'createdAt:desc',
    featured,
  } = req.query as Record<string, string | undefined>;

  const pageNum = Math.max(1, parseInt(page ?? '1'));
  const size = Math.min(50, Math.max(1, parseInt(pageSize ?? '12')));
  const skip = (pageNum - 1) * size;

  const [sortField, sortDir] = (sort ?? 'createdAt:desc').split(':');
  const validSortFields = ['price', 'createdAt', 'name'];
  const field = validSortFields.includes(sortField ?? '') ? (sortField as string) : 'createdAt';
  const dir = sortDir === 'asc' ? 'asc' : 'desc';

  const where: Record<string, unknown> = {
    status: 'PUBLISHED',
    deletedAt: null,
  };

  if (search) {
    where['OR'] = [
      { name: { contains: search, mode: 'insensitive' } },
      { shortDescription: { contains: search, mode: 'insensitive' } },
      { sku: { contains: search, mode: 'insensitive' } },
    ];
  }
  if (minPrice) where['price'] = { ...(where['price'] as object ?? {}), gte: parseInt(minPrice) };
  if (maxPrice) where['price'] = { ...(where['price'] as object ?? {}), lte: parseInt(maxPrice) };
  if (featured === 'true') where['isFeatured'] = true;
  if (category) {
    where['categories'] = {
      some: { category: { slug: category } },
    };
  }

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      select: {
        id: true,
        name: true,
        slug: true,
        price: true,
        salePrice: true,
        featuredImageUrl: true,
        isFeatured: true,
        stockQuantity: true,
        manageStock: true,
        shortDescription: true,
        categories: {
          select: {
            category: { select: { id: true, name: true, slug: true } },
          },
        },
      },
      orderBy: { [field]: dir },
      skip,
      take: size,
    }),
    prisma.product.count({ where }),
  ]);

  res.json({
    success: true,
    data: products,
    meta: { page: pageNum, pageSize: size, total, totalPages: Math.ceil(total / size) },
  });
}));

// ─── GET /storefront/products/:slug ──────────────────────────────────────────
router.get('/products/:slug', asyncHandler(async (req, res) => {
  const product = await prisma.product.findFirst({
    where: { slug: req.params.slug, status: 'PUBLISHED', deletedAt: null },
    select: {
      id: true,
      name: true,
      slug: true,
      sku: true,
      type: true,
      price: true,
      salePrice: true,
      featuredImageUrl: true,
      description: true,
      shortDescription: true,
      isFeatured: true,
      stockQuantity: true,
      manageStock: true,
      allowBackorders: true,
      weight: true,
      categories: {
        select: { category: { select: { id: true, name: true, slug: true } } },
      },
      images: {
        select: { id: true, url: true, altText: true, sortOrder: true },
        orderBy: { sortOrder: 'asc' },
      },
      variants: {
        where: { isActive: true },
        select: {
          id: true,
          sku: true,
          price: true,
          salePrice: true,
          stockQuantity: true,
          imageUrl: true,
          attributes: {
            select: {
              value: true,
              attribute: { select: { name: true } },
            },
          },
        },
      },
      reviews: {
        where: { isApproved: true },
        select: {
          id: true,
          rating: true,
          title: true,
          body: true,
          createdAt: true,
          user: { select: { firstName: true, lastName: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
      },
    },
  });

  if (!product) {
    return res.status(404).json({
      success: false,
      error: { code: 'PRODUCT_NOT_FOUND', message: 'Product not found.' },
    });
  }

  res.json({ success: true, data: product });
}));

// ─── GET /storefront/categories ───────────────────────────────────────────────
router.get('/categories', asyncHandler(async (_req, res) => {
  const categories = await prisma.category.findMany({
    where: { isActive: true, parentId: null },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      imageUrl: true,
      children: {
        where: { isActive: true },
        select: { id: true, name: true, slug: true },
        orderBy: { name: 'asc' },
      },
      _count: { select: { products: true } },
    },
    orderBy: { sortOrder: 'asc' },
  });

  res.json({ success: true, data: categories });
}));

// ─── POST /storefront/checkout ─────────────────────────────────────────────────
const checkoutSchema = z.object({
  items: z.array(z.object({
    productId: z.string().uuid(),
    variantId: z.string().uuid().optional(),
    quantity: z.number().int().positive(),
  })).min(1),
  paymentMethod: z.enum(['CASH_ON_DELIVERY', 'STRIPE', 'BANK_TRANSFER', 'GCASH', 'PAYMAYA']),
  shippingAddress: z.object({
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    address1: z.string().min(1),
    address2: z.string().optional(),
    city: z.string().min(1),
    state: z.string().min(1),
    postalCode: z.string().min(1),
    country: z.string().default('PH'),
    phone: z.string().optional(),
  }),
  billingAddress: z.object({
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    address1: z.string().min(1),
    address2: z.string().optional(),
    city: z.string().min(1),
    state: z.string().min(1),
    postalCode: z.string().min(1),
    country: z.string().default('PH'),
  }).optional(),
  customerEmail: z.string().email(),
  customerNote: z.string().optional(),
  couponCode: z.string().optional(),
});

router.post('/checkout', asyncHandler(async (req, res) => {
  const parsed = checkoutSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid checkout data.',
        details: parsed.error.flatten(),
      },
    });
  }

  const { items, paymentMethod, shippingAddress, billingAddress, customerEmail, customerNote, couponCode } = parsed.data;

  // Map e-wallet methods → BANK_TRANSFER in DB; store real method in metadata
  const dbPaymentMethod = ['GCASH', 'PAYMAYA'].includes(paymentMethod)
    ? ('BANK_TRANSFER' as const)
    : (paymentMethod as 'CASH_ON_DELIVERY' | 'STRIPE' | 'BANK_TRANSFER');

  // Fetch products
  const productIds = items.map((i) => i.productId);
  const products = await prisma.product.findMany({
    where: { id: { in: productIds }, status: 'PUBLISHED', deletedAt: null },
    select: {
      id: true,
      name: true,
      sku: true,
      price: true,
      salePrice: true,
      manageStock: true,
      stockQuantity: true,
      allowBackorders: true,
      variants: {
        where: { isActive: true },
        select: { id: true, price: true, salePrice: true, stockQuantity: true, sku: true },
      },
    },
  });

  // Validate and build order items
  const orderItems: {
    productId: string;
    variantId: string | null;
    name: string;
    sku: string | null;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }[] = [];
  let subtotal = 0;

  for (const item of items) {
    const product = products.find((p) => p.id === item.productId);
    if (!product) {
      return res.status(422).json({
        success: false,
        error: { code: 'PRODUCT_UNAVAILABLE', message: `Product ${item.productId} is not available.` },
      });
    }

    let unitPrice = product.salePrice ?? product.price;
    let sku = product.sku;

    if (item.variantId) {
      const variant = product.variants.find((v) => v.id === item.variantId);
      if (!variant) {
        return res.status(422).json({
          success: false,
          error: { code: 'VARIANT_NOT_FOUND', message: 'Variant not found.' },
        });
      }
      unitPrice = variant.salePrice ?? variant.price;
      sku = variant.sku;

      if (product.manageStock && variant.stockQuantity < item.quantity && !product.allowBackorders) {
        return res.status(422).json({
          success: false,
          error: { code: 'INSUFFICIENT_STOCK', message: `Insufficient stock for ${product.name}.` },
        });
      }
    } else if (product.manageStock && product.stockQuantity < item.quantity && !product.allowBackorders) {
      return res.status(422).json({
        success: false,
        error: { code: 'INSUFFICIENT_STOCK', message: `Insufficient stock for ${product.name}.` },
      });
    }

    const totalPrice = unitPrice * item.quantity;
    subtotal += totalPrice;
    orderItems.push({
      productId: product.id,
      variantId: item.variantId ?? null,
      name: product.name,
      sku: sku ?? null,
      quantity: item.quantity,
      unitPrice,
      totalPrice,
    });
  }

  // Coupon
  let discountAmount = 0;
  let coupon: { id: string; type: string; amount: number } | null = null;
  if (couponCode) {
    coupon = await prisma.coupon.findFirst({
      where: {
        code: couponCode,
        isActive: true,
        OR: [{ expiresAt: null }, { expiresAt: { gte: new Date() } }],
      },
      select: { id: true, type: true, amount: true },
    });

    if (coupon) {
      if (coupon.type === 'PERCENTAGE') {
        discountAmount = Math.round(subtotal * (coupon.amount / 100));
      } else if (coupon.type === 'FIXED_CART') {
        discountAmount = Math.min(subtotal, coupon.amount);
      }
    }
  }

  const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
  const total = Math.max(0, subtotal - discountAmount);
  const billing = billingAddress ?? shippingAddress;

  // Find user by email (optional — guest checkout allowed)
  const user = await prisma.user.findFirst({
    where: { email: customerEmail, deletedAt: null },
    select: { id: true },
  });

  const order = await prisma.$transaction(async (tx) => {
    const created = await tx.order.create({
      data: {
        orderNumber,
        userId: user?.id ?? null,
        status: 'PENDING',
        paymentStatus: 'PENDING',
        paymentMethod: dbPaymentMethod,
        currency: 'PHP',
        subtotal,
        discountAmount,
        shippingAmount: 0,
        taxAmount: 0,
        total,
        couponCode: couponCode ?? null,
        customerNote: customerNote ?? null,
        billingAddress: billing,
        shippingAddress,
        metadata: { customerEmail, actualPaymentMethod: paymentMethod },
        items: { create: orderItems },
        statusHistory: {
          create: { status: 'PENDING', comment: 'Order placed by customer.' },
        },
      },
      select: {
        id: true,
        orderNumber: true,
        status: true,
        paymentMethod: true,
        total: true,
        currency: true,
        createdAt: true,
      },
    });

    // Deduct stock
    for (const item of items) {
      const product = products.find((p) => p.id === item.productId);
      if (product?.manageStock) {
        if (item.variantId) {
          await tx.productVariant.update({
            where: { id: item.variantId },
            data: { stockQuantity: { decrement: item.quantity } },
          });
        } else {
          await tx.product.update({
            where: { id: item.productId },
            data: { stockQuantity: { decrement: item.quantity } },
          });
        }
      }
    }

    // Record coupon usage
    if (coupon && user) {
      await tx.couponUsage.create({
        data: { couponId: coupon.id, userId: user.id, orderId: created.id },
      });
    }

    return created;
  });

  res.status(201).json({ success: true, data: order });
}));

// ─── GET /storefront/orders ───────────────────────────────────────────────────
// Requires customer JWT
router.get('/orders', authenticate, asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { page = '1', pageSize = '10' } = req.query as Record<string, string>;
  const pageNum = Math.max(1, parseInt(page));
  const size = Math.min(20, Math.max(1, parseInt(pageSize)));
  const skip = (pageNum - 1) * size;

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where: { userId, deletedAt: null },
      select: {
        id: true,
        orderNumber: true,
        status: true,
        paymentStatus: true,
        paymentMethod: true,
        total: true,
        currency: true,
        createdAt: true,
        items: {
          select: {
            id: true,
            name: true,
            quantity: true,
            unitPrice: true,
            product: { select: { featuredImageUrl: true, slug: true } },
          },
          take: 3,
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: size,
    }),
    prisma.order.count({ where: { userId, deletedAt: null } }),
  ]);

  res.json({
    success: true,
    data: orders,
    meta: { page: pageNum, pageSize: size, total, totalPages: Math.ceil(total / size) },
  });
}));

// ─── GET /storefront/orders/:ref ─────────────────────────────────────────────
// Accessible by order number (guest tracking) or UUID (authenticated)
router.get('/orders/:ref', asyncHandler(async (req, res) => {
  const { ref } = req.params;

  // Try to extract user from token if provided (optional auth)
  let userId: string | null = null;
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    try {
      const { supabaseAdmin } = await import('../config/supabase');
      const token = authHeader.slice(7);
      const { data: { user } } = await supabaseAdmin.auth.getUser(token);
      if (user) {
        const dbUser = await prisma.user.findFirst({
          where: { supabaseId: user.id, deletedAt: null },
          select: { id: true },
        });
        userId = dbUser?.id ?? null;
      }
    } catch { /* proceed as guest */ }
  }

  const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(ref);

  // If authenticated: match by id OR orderNumber for that user
  // If guest: match by orderNumber only (no user restriction so anyone with the order number can view)
  const order = await prisma.order.findFirst({
    where: {
      ...(isUUID ? { id: ref } : { orderNumber: ref }),
      deletedAt: null,
      ...(userId ? { userId } : {}),
    },
    select: {
      id: true,
      orderNumber: true,
      status: true,
      paymentStatus: true,
      paymentMethod: true,
      total: true,
      subtotal: true,
      discountAmount: true,
      shippingAmount: true,
      taxAmount: true,
      currency: true,
      couponCode: true,
      customerNote: true,
      shippingAddress: true,
      billingAddress: true,
      metadata: true,
      createdAt: true,
      updatedAt: true,
      items: {
        select: {
          id: true,
          name: true,
          sku: true,
          quantity: true,
          unitPrice: true,
          totalPrice: true,
          product: { select: { slug: true, featuredImageUrl: true } },
        },
      },
      statusHistory: {
        select: { id: true, status: true, comment: true, createdAt: true },
        orderBy: { createdAt: 'asc' },
      },
      notes: {
        where: { isCustomerNote: true },
        select: { id: true, note: true, createdAt: true },
        orderBy: { createdAt: 'asc' },
      },
    },
  });

  if (!order) {
    return res.status(404).json({
      success: false,
      error: { code: 'ORDER_NOT_FOUND', message: 'Order not found.' },
    });
  }

  res.json({ success: true, data: order });
}));

export default router;
