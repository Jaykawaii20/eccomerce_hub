'use client';

import { useState } from 'react';
import { Menu, X, Search, ShoppingCart } from 'lucide-react';

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

  return (
    <nav className="sticky top-0 z-50 shadow-sm" style={{ backgroundColor, color: textColor }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <a href="/" className="text-xl font-bold" style={{ color: textColor }}>
            {logoText}
          </a>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
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
          <div className="flex items-center gap-4">
            {showSearch && (
              <button className="p-2 hover:opacity-70 transition-opacity" style={{ color: textColor }}>
                <Search className="h-5 w-5" />
              </button>
            )}
            {showCart && (
              <button className="relative p-2 hover:opacity-70 transition-opacity" style={{ color: textColor }}>
                <ShoppingCart className="h-5 w-5" />
                <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-orange-500 text-white text-[10px] flex items-center justify-center font-bold">
                  0
                </span>
              </button>
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
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="block text-sm font-medium py-1 hover:opacity-70"
                style={{ color: textColor }}
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
