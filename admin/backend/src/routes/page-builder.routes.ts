import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../config/prisma';
import { authenticate } from '../middlewares/auth.middleware';
import { requirePermission } from '../middlewares/rbac.middleware';
import { sendSuccess } from '../utils/response';
import { asyncHandler } from '../utils/async-handler';

const router = Router();

const PAGE_BUILDER_KEY = 'page_builder_config';

// Public route — storefront reads this without auth
router.get(
  '/public',
  asyncHandler(async (_req, res) => {
    const setting = await prisma.setting.findUnique({ where: { key: PAGE_BUILDER_KEY } });
    const config = setting ? JSON.parse(setting.value) : getDefaultConfig();
    sendSuccess(res, { data: config });
  })
);

router.get(
  '/',
  authenticate,
  requirePermission('settings:read'),
  asyncHandler(async (_req, res) => {
    const setting = await prisma.setting.findUnique({ where: { key: PAGE_BUILDER_KEY } });
    const config = setting ? JSON.parse(setting.value) : getDefaultConfig();
    sendSuccess(res, { data: config });
  })
);

router.post(
  '/',
  authenticate,
  requirePermission('settings:write'),
  asyncHandler(async (req, res) => {
    const configSchema = z.object({
      globalStyles: z.object({
        primaryColor: z.string(),
        storeName: z.string(),
        logoText: z.string(),
      }),
      sections: z.array(
        z.object({
          id: z.string(),
          type: z.string(),
          enabled: z.boolean(),
          order: z.number(),
          props: z.record(z.unknown()),
        })
      ),
    });
    const config = configSchema.parse(req.body);
    await prisma.setting.upsert({
      where: { key: PAGE_BUILDER_KEY },
      update: { value: JSON.stringify(config) },
      create: { key: PAGE_BUILDER_KEY, value: JSON.stringify(config) },
    });
    sendSuccess(res, { data: config });
  })
);

function getDefaultConfig() {
  return {
    globalStyles: {
      primaryColor: '#f97316',
      storeName: 'My Store',
      logoText: 'ShopHub',
    },
    sections: [
      {
        id: 'announcement',
        type: 'announcement',
        enabled: true,
        order: 0,
        props: {
          text: 'Free shipping on orders over $50! Use code FREESHIP',
          link: '',
          backgroundColor: '#f97316',
          textColor: '#ffffff',
        },
      },
      {
        id: 'navbar',
        type: 'navbar',
        enabled: true,
        order: 1,
        props: {
          logoText: 'ShopHub',
          navLinks: [
            { label: 'Home', href: '/' },
            { label: 'Shop', href: '/shop' },
            { label: 'About', href: '/about' },
            { label: 'Contact', href: '/contact' },
          ],
          showSearch: true,
          showCart: true,
          backgroundColor: '#ffffff',
          textColor: '#111827',
        },
      },
      {
        id: 'hero',
        type: 'hero',
        enabled: true,
        order: 2,
        props: {
          headline: 'Discover Amazing Products',
          subheadline: 'Shop the latest trends and find everything you need in one place.',
          buttonText: 'Shop Now',
          buttonLink: '/shop',
          buttonSecondaryText: 'View Deals',
          buttonSecondaryLink: '/deals',
          backgroundColor: '#0f172a',
          textColor: '#ffffff',
          backgroundImage: '',
          overlay: true,
          overlayOpacity: 0.5,
        },
      },
      {
        id: 'features',
        type: 'features',
        enabled: true,
        order: 3,
        props: {
          title: 'Why Shop With Us',
          items: [
            { icon: 'truck', title: 'Free Shipping', description: 'On all orders over $50 within the country.' },
            { icon: 'shield', title: 'Secure Payment', description: 'Your payment information is always protected.' },
            { icon: 'refresh', title: 'Easy Returns', description: '30-day hassle-free return policy.' },
            { icon: 'headphones', title: '24/7 Support', description: 'Our team is here whenever you need us.' },
          ],
        },
      },
      {
        id: 'featured-categories',
        type: 'featured-categories',
        enabled: true,
        order: 4,
        props: {
          title: 'Shop by Category',
          subtitle: 'Find exactly what you are looking for',
          limit: 6,
        },
      },
      {
        id: 'featured-products',
        type: 'featured-products',
        enabled: true,
        order: 5,
        props: {
          title: 'Featured Products',
          subtitle: 'Hand-picked items just for you',
          limit: 8,
          showBadge: true,
        },
      },
      {
        id: 'promo-banner',
        type: 'promo-banner',
        enabled: true,
        order: 6,
        props: {
          headline: 'Summer Sale Up to 50% Off',
          subheadline: 'Limited time offer. Shop now before it is too late.',
          buttonText: 'Grab the Deal',
          buttonLink: '/sale',
          backgroundColor: '#7c3aed',
          textColor: '#ffffff',
          imagePosition: 'right',
        },
      },
      {
        id: 'testimonials',
        type: 'testimonials',
        enabled: true,
        order: 7,
        props: {
          title: 'What Our Customers Say',
          items: [
            { name: 'Sarah Johnson', role: 'Verified Buyer', text: 'Amazing quality and super fast shipping! Will definitely order again.', rating: 5 },
            { name: 'Mark Chen', role: 'Verified Buyer', text: 'Great prices and the customer support team was incredibly helpful.', rating: 5 },
            { name: 'Emma Williams', role: 'Verified Buyer', text: 'Exactly as described. Very happy with my purchase.', rating: 4 },
          ],
        },
      },
      {
        id: 'newsletter',
        type: 'newsletter',
        enabled: true,
        order: 8,
        props: {
          title: 'Stay in the Loop',
          subtitle: 'Get the latest deals, new arrivals and exclusive offers straight to your inbox.',
          placeholder: 'Enter your email address',
          buttonText: 'Subscribe',
          backgroundColor: '#f3f4f6',
          textColor: '#111827',
        },
      },
      {
        id: 'footer',
        type: 'footer',
        enabled: true,
        order: 9,
        props: {
          logoText: 'ShopHub',
          tagline: 'Your one-stop shop for everything.',
          columns: [
            {
              title: 'Shop',
              links: [
                { label: 'All Products', href: '/shop' },
                { label: 'New Arrivals', href: '/new' },
                { label: 'Sale', href: '/sale' },
              ],
            },
            {
              title: 'Company',
              links: [
                { label: 'About Us', href: '/about' },
                { label: 'Blog', href: '/blog' },
                { label: 'Careers', href: '/careers' },
              ],
            },
            {
              title: 'Support',
              links: [
                { label: 'Help Center', href: '/help' },
                { label: 'Contact Us', href: '/contact' },
                { label: 'Returns', href: '/returns' },
              ],
            },
          ],
          copyright: '© 2026 ShopHub. All rights reserved.',
          backgroundColor: '#111827',
          textColor: '#9ca3af',
        },
      },
    ],
  };
}

export default router;
