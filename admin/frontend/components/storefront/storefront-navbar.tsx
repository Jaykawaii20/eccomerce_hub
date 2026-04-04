'use client';

import { useState } from 'react';
import { Menu, X, Search, ShoppingCart, User } from 'lucide-react';
import { useCart } from '@/app/store/context/cart-context';
import { useCustomerAuth } from '@/app/store/context/customer-auth-context';

interface NavLink {
  label: string;
  href: string;
}

interface NavbarProps {
  logoText?: string;
  navLinks?: NavLink[];
  showSearch?: boolean;
  showCart?: boolean;
  backgroundColor?: string;
  textColor?: string;
}

export function StorefrontNavbar({
  logoText = 'ShopHub',
  navLinks = [],
  showSearch = true,
  showCart = true,
  backgroundColor = '#ffffff',
  textColor = '#111827',
}: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { count } = useCart();
  const { customer, logout } = useCustomerAuth();

  const defaultLinks: NavLink[] = [
    { label: 'Home', href: '/store' },
    { label: 'Shop', href: '/store/products' },
  ];
  const links = navLinks.length > 0 ? navLinks : defaultLinks;

  return (
    <nav className="sticky top-0 z-50 shadow-sm" style={{ backgroundColor, color: textColor }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <a href="/store" className="text-xl font-bold" style={{ color: textColor }}>
            {logoText}
          </a>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-8">
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm font-medium hover:opacity-70 transition-opacity"
                style={{ color: textColor }}
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            {showSearch && (
              <a href="/store/products" className="p-2 hover:opacity-70 transition-opacity" style={{ color: textColor }}>
                <Search className="h-5 w-5" />
              </a>
            )}
            {showCart && (
              <a href="/store/cart" className="relative p-2 hover:opacity-70 transition-opacity" style={{ color: textColor }}>
                <ShoppingCart className="h-5 w-5" />
                {count > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-orange-500 text-white text-[10px] flex items-center justify-center font-bold">
                    {count > 9 ? '9+' : count}
                  </span>
                )}
              </a>
            )}

            {/* Auth */}
            {customer ? (
              <button
                onClick={logout}
                className="hidden md:flex items-center gap-1.5 text-sm font-medium hover:opacity-70 transition-opacity"
                style={{ color: textColor }}
              >
                <User className="h-4 w-4" />
                {customer.firstName}
              </button>
            ) : (
              <a
                href="/store/auth/login"
                className="hidden md:flex items-center gap-1.5 text-sm font-medium hover:opacity-70 transition-opacity"
                style={{ color: textColor }}
              >
                <User className="h-4 w-4" />
                Sign In
              </a>
            )}

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 hover:opacity-70 transition-opacity"
              style={{ color: textColor }}
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t" style={{ backgroundColor, borderColor: `${textColor}20` }}>
          <div className="px-4 py-3 space-y-3">
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="block text-sm font-medium py-1 hover:opacity-70"
                style={{ color: textColor }}
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </a>
            ))}
            {customer ? (
              <>
                <a href="/store/account/orders" className="block text-sm font-medium py-1 hover:opacity-70" style={{ color: textColor }} onClick={() => setMobileOpen(false)}>
                  My Orders
                </a>
                <button onClick={() => { logout(); setMobileOpen(false); }} className="block text-sm font-medium py-1 text-red-500">
                  Sign Out
                </button>
              </>
            ) : (
              <a href="/store/auth/login" className="block text-sm font-medium py-1 hover:opacity-70" style={{ color: textColor }} onClick={() => setMobileOpen(false)}>
                Sign In / Register
              </a>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
