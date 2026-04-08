'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { apiClient } from '@/lib/api-client';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Tag,
  Truck,
  Settings,
  BarChart3,
  Image,
  ShoppingBag,
  DollarSign,
  Star,
  MessageCircle,
  ChevronLeft,
  ChevronRight,
  Gift,
  TrendingUp,
  Store,
  HelpCircle,
  Paintbrush,
  ShieldCheck,
} from 'lucide-react';

// ─── Nav structure (badges are keys into NavCounts, not static strings) ────────

interface NavItemDef {
  href: string;
  label: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  icon: any;
  countKey?: keyof NavCounts;
}

interface NavCounts {
  products: number;
  pendingOrders: number;
  pendingReviews: number;
  activeCoupons: number;
}

const mainNavItems: NavItemDef[] = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/products', label: 'Products', icon: Package, countKey: 'products' },
  { href: '/orders', label: 'Orders', icon: ShoppingCart, countKey: 'pendingOrders' },
  { href: '/customers', label: 'Customers', icon: Users },
  { href: '/users', label: 'User Management', icon: ShieldCheck },
];

const catalogNavItems: NavItemDef[] = [
  { href: '/categories', label: 'Categories', icon: Tag },
  { href: '/brands', label: 'Brands', icon: Store },
  { href: '/reviews', label: 'Reviews', icon: Star, countKey: 'pendingReviews' },
];

const marketingNavItems: NavItemDef[] = [
  { href: '/coupons', label: 'Coupons', icon: Gift, countKey: 'activeCoupons' },
  { href: '/campaigns', label: 'Campaigns', icon: TrendingUp },
];

const analyticsNavItems: NavItemDef[] = [
  { href: '/reports', label: 'Analytics', icon: BarChart3 },
  { href: '/sales', label: 'Sales', icon: DollarSign },
];

const supportNavItems: NavItemDef[] = [
  { href: '/shipping', label: 'Shipping', icon: Truck },
  { href: '/messages', label: 'Messages', icon: MessageCircle },
];

const bottomNavItems: NavItemDef[] = [
  { href: '/media', label: 'Media', icon: Image },
  { href: '/builder', label: 'Page Builder', icon: Paintbrush },
  { href: '/settings', label: 'Settings', icon: Settings },
];

// ─── NavItem component ────────────────────────────────────────────────────────

interface NavItemProps extends NavItemDef {
  badge?: string | null;
  isActive: boolean;
  collapsed: boolean;
}

const NavItem = ({ href, label, icon: Icon, badge, isActive, collapsed }: NavItemProps) => (
  <Link
    href={href}
    className={cn(
      'group relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200',
      isActive
        ? 'bg-gradient-to-r from-orange-50 to-pink-50 dark:from-orange-950/30 dark:to-pink-950/30 text-orange-600 dark:text-orange-400 font-medium shadow-sm'
        : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
      collapsed ? 'justify-center' : 'justify-start'
    )}
    title={collapsed ? label : undefined}
  >
    <Icon className={cn(
      'h-5 w-5 shrink-0 transition-transform duration-200',
      isActive && 'text-orange-500 dark:text-orange-400',
      !collapsed && 'group-hover:scale-105'
    )} />

    {!collapsed && (
      <>
        <span className="flex-1">{label}</span>
        {badge && (
          <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-gradient-to-r from-orange-100 to-pink-100 dark:from-orange-900/30 dark:to-pink-900/30 text-orange-600 dark:text-orange-400">
            {badge}
          </span>
        )}
      </>
    )}

    {collapsed && badge && (
      <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-orange-500 to-pink-500 rounded-full text-[10px] text-white flex items-center justify-center">
        {badge}
      </div>
    )}
  </Link>
);

// ─── Sidebar ──────────────────────────────────────────────────────────────────

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [counts, setCounts] = useState<NavCounts | null>(null);

  useEffect(() => {
    apiClient
      .get<{ data: NavCounts }>('/nav-counts')
      .then(({ data }) => setCounts(data.data))
      .catch(() => setCounts(null));
  }, []);

  function getBadge(item: NavItemDef): string | null {
    if (!item.countKey || !counts) return null;
    const n = counts[item.countKey];
    return n > 0 ? String(n) : null;
  }

  const NavSection = ({ title, items }: { title?: string; items: NavItemDef[] }) => (
    <div className="space-y-1">
      {title && !collapsed && (
        <div className="px-3 pt-4 pb-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            {title}
          </p>
        </div>
      )}
      {items.map((item) => (
        <NavItem
          key={item.href}
          {...item}
          badge={getBadge(item)}
          isActive={pathname === item.href || pathname.startsWith(item.href + '/')}
          collapsed={collapsed}
        />
      ))}
    </div>
  );

  return (
    <aside
      className={cn(
        'flex flex-col h-full bg-background border-r transition-all duration-300 relative',
        collapsed ? 'w-20' : 'w-64'
      )}
    >
      {/* Logo */}
      <div className={cn(
        'flex items-center border-b px-4 py-4',
        collapsed ? 'justify-center' : 'justify-between'
      )}>
        {!collapsed ? (
          <>
            <div className="flex items-center gap-2">
              <div className="bg-gradient-to-br from-orange-500 to-pink-500 p-1.5 rounded-lg">
                <ShoppingBag className="h-5 w-5 text-white" />
              </div>
              <span className="font-bold text-lg bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent">
                Ecommerce Hub
              </span>
            </div>
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="p-1 rounded-md hover:bg-accent transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          </>
        ) : (
          <>
            <div className="bg-gradient-to-br from-orange-500 to-pink-500 p-2 rounded-lg">
              <ShoppingBag className="h-5 w-5 text-white" />
            </div>
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="p-1 rounded-md hover:bg-accent transition-colors absolute -right-3 top-6 bg-background border shadow-sm"
            >
              <ChevronRight className="h-3 w-3" />
            </button>
          </>
        )}
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-4">
        <div className="px-3 space-y-6">
          <NavSection items={mainNavItems} />
          <NavSection title="Catalog" items={catalogNavItems} />
          <NavSection title="Marketing" items={marketingNavItems} />
          <NavSection title="Analytics" items={analyticsNavItems} />
          <NavSection title="Support" items={supportNavItems} />
          <NavSection items={bottomNavItems} />
        </div>
      </div>

      {/* Bottom */}
      <div className="border-t pt-4 pb-6 px-3">
        <div className="space-y-1">
          {!collapsed ? (
            <Link
              href="/help"
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-xs text-muted-foreground hover:text-accent-foreground transition-colors"
            >
              <HelpCircle className="h-4 w-4" />
              <span>Help & Support</span>
            </Link>
          ) : (
            <Link
              href="/help"
              className="flex justify-center px-3 py-2 rounded-lg text-muted-foreground hover:text-accent-foreground transition-colors"
              title="Help & Support"
            >
              <HelpCircle className="h-5 w-5" />
            </Link>
          )}
        </div>
      </div>
    </aside>
  );
}
