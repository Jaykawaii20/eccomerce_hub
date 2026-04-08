'use client';

import { useState } from 'react';
import { Menu, X, Search, ShoppingCart, User, Package, LogOut } from 'lucide-react';
import { useCart } from '@/app/store/context/cart-context';
import { useCustomerAuth } from '@/app/store/context/customer-auth-context';
import { useAuthModal } from '@/app/store/context/auth-modal-context';

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
  logoText = '',
  navLinks = [],
  showSearch = true,
  showCart = true,
  backgroundColor = '#ffffff',
  textColor = '#111827',
}: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false);
  const { count } = useCart();
  const { customer, logout } = useCustomerAuth();
  const { openAuthModal } = useAuthModal();

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
              <div className="relative hidden md:block">
                <button
                  onClick={() => setAccountOpen((o) => !o)}
                  className="flex items-center gap-1.5 text-sm font-medium hover:opacity-70 transition-opacity"
                  style={{ color: textColor }}
                >
                  <div className="h-7 w-7 rounded-full bg-orange-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                    {customer.firstName[0]?.toUpperCase()}
                  </div>
                  <span>{customer.firstName}</span>
                </button>

                {accountOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setAccountOpen(false)} />
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-20">
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-sm font-semibold text-gray-900">{customer.firstName} {customer.lastName}</p>
                        <p className="text-xs text-gray-500 truncate">{customer.email}</p>
                      </div>
                      <a
                        href="/store/account/orders"
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        onClick={() => setAccountOpen(false)}
                      >
                        <Package className="h-4 w-4" />
                        My Orders
                      </a>
                      <button
                        onClick={() => { setAccountOpen(false); setShowSignOutConfirm(true); }}
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        <LogOut className="h-4 w-4" />
                        Sign Out
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <button
                onClick={() => openAuthModal({ tab: 'login' })}
                className="hidden md:flex items-center gap-1.5 text-sm font-medium hover:opacity-70 transition-opacity"
                style={{ color: textColor }}
              >
                <User className="h-4 w-4" />
                Sign In
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
                <a
                  href="/store/account/orders"
                  className="block text-sm font-medium py-1 hover:opacity-70"
                  style={{ color: textColor }}
                  onClick={() => setMobileOpen(false)}
                >
                  My Orders
                </a>
                <button
                  onClick={() => { setShowSignOutConfirm(true); setMobileOpen(false); }}
                  className="block text-sm font-medium py-1 text-red-500"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => { setMobileOpen(false); openAuthModal({ tab: 'login' }); }}
                  className="block text-sm font-medium py-1 hover:opacity-70 text-left w-full"
                  style={{ color: textColor }}
                >
                  Sign In
                </button>
                <button
                  onClick={() => { setMobileOpen(false); openAuthModal({ tab: 'register' }); }}
                  className="block text-sm font-medium py-1 text-orange-500 text-left w-full"
                >
                  Create Account
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Sign Out Confirmation Modal */}
      {showSignOutConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowSignOutConfirm(false)}
          />
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-sm w-full mx-4">
            <div className="flex justify-center mt-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <LogOut className="w-8 h-8 text-red-500" />
              </div>
            </div>
            <div className="text-center px-6 pb-6">
              <h3 className="text-xl font-bold text-gray-900 mb-2 mt-4">Sign Out?</h3>
              <p className="text-gray-500 text-sm mb-6">Are you sure you want to sign out of your account?</p>
              <div className="flex gap-3">
                <button
                  onClick={() => { setShowSignOutConfirm(false); logout(); }}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-2.5 rounded-xl transition-colors"
                >
                  Sign Out
                </button>
                <button
                  onClick={() => setShowSignOutConfirm(false)}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2.5 rounded-xl transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
