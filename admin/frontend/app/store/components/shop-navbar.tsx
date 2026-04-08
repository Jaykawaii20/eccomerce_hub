'use client';

import { useState } from 'react';
import { ShoppingCart, User, Menu, X, Search, Package } from 'lucide-react';
import { useCart } from '../context/cart-context';
import { useCustomerAuth } from '../context/customer-auth-context';
import { useStoreConfig } from '../context/store-config-context';
import { useAuthModal } from '../context/auth-modal-context';

export function ShopNavbar() {
  const { count } = useCart();
  const { customer, logout } = useCustomerAuth();
  const { loaded, primaryColor, navbar } = useStoreConfig();
  const { openAuthModal } = useAuthModal();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false);
  const { logoText, backgroundColor, textColor, showSearch, showCart, navLinks } = navbar;

  return (
    <nav
      className="sticky top-0 z-50 shadow-sm border-b"
      style={{ backgroundColor, borderColor: `${textColor}15` }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <a href="/store" className="text-xl font-bold" style={{ color: primaryColor }}>
            {loaded ? logoText : ''}
          </a>

          {/* Desktop nav links */}
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

          {/* Right actions */}
          <div className="flex items-center gap-3">
            {/* Search */}
            {showSearch && (
              <a
                href="/store/products"
                className="p-2 hover:opacity-70 transition-opacity"
                style={{ color: textColor }}
                aria-label="Search products"
              >
                <Search className="h-5 w-5" />
              </a>
            )}

            {/* Cart */}
            {showCart && (
              <a
                href="/store/cart"
                className="relative p-2 hover:opacity-70 transition-opacity"
                style={{ color: textColor }}
                aria-label="Cart"
              >
                <ShoppingCart className="h-5 w-5" />
                {count > 0 && (
                  <span
                    className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full text-white text-[10px] flex items-center justify-center font-bold"
                    style={{ backgroundColor: primaryColor }}
                  >
                    {count > 9 ? '9+' : count}
                  </span>
                )}
              </a>
            )}

            {/* Account */}
            {customer ? (
              <div className="relative">
                <button
                  onClick={() => setAccountOpen(!accountOpen)}
                  className="flex items-center gap-1.5 p-2 text-gray-500 hover:text-gray-800 transition-colors"
                >
                  <div
                    className="h-7 w-7 rounded-full flex items-center justify-center text-white text-xs font-bold"
                    style={{ backgroundColor: primaryColor }}
                  >
                    {customer.firstName[0]?.toUpperCase()}
                  </div>
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
                        onClick={() => {
                          setAccountOpen(false);
                          // Show confirmation modal
                          setShowSignOutConfirm(true);
                        }}
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        <User className="h-4 w-4" />
                        Sign Out
                      </button>
                    </div>
                  </>
                )}

                {/* Sign Out Confirmation Modal */}
                {/* Sign Out Confirmation Modal - MOVED OUTSIDE the dropdown */}
                {showSignOutConfirm && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center">
                    {/* Backdrop */}
                    <div
                      className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300"
                      onClick={() => setShowSignOutConfirm(false)}
                    />

                    {/* Modal */}
                    <div className="relative bg-white rounded-2xl shadow-2xl max-w-sm w-full mx-4 transform transition-all duration-300 animate-in fade-in zoom-in">
                      {/* Icon */}
                      <div className="flex justify-center mt-6">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                          <User className="w-8 h-8 text-red-500" />
                        </div>
                      </div>

                      {/* Content */}
                      <div className="text-center px-6 pb-6">
                        <h3 className="text-xl font-bold text-gray-900 mb-2 mt-4">Sign Out?</h3>
                        <p className="text-gray-500 text-sm mb-6">
                          Are you sure you want to sign out of your account?
                        </p>

                        {/* Buttons */}
                        <div className="flex gap-3">
                          <button
                            onClick={() => {
                              setShowSignOutConfirm(false);
                              logout();
                            }}
                            className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-2.5 rounded-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
                          >
                            Sign Out
                          </button>
                          <button
                            onClick={() => setShowSignOutConfirm(false)}
                            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2.5 rounded-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => openAuthModal({ tab: 'login' })}
                className="hidden sm:flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-opacity hover:opacity-90"
                style={{ backgroundColor: primaryColor }}
              >
                <User className="h-4 w-4" />
                Sign In
              </button>
            )}

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 text-gray-500 hover:text-gray-800"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white">
          <div className="px-4 py-4 space-y-3">
            <a href="/store" className="block text-sm font-medium text-gray-700 py-1" onClick={() => setMobileOpen(false)}>
              Home
            </a>
            <a href="/store/products" className="block text-sm font-medium text-gray-700 py-1" onClick={() => setMobileOpen(false)}>
              Shop
            </a>
            {customer ? (
              <>
                <a href="/store/account/orders" className="block text-sm font-medium text-gray-700 py-1" onClick={() => setMobileOpen(false)}>
                  My Orders
                </a>
                <button
                  onClick={() => { logout(); setMobileOpen(false); }}
                  className="block text-sm font-medium text-red-600 py-1"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <button
                onClick={() => { setMobileOpen(false); openAuthModal({ tab: 'login' }); }}
                className="block text-sm font-medium py-1 text-left"
                style={{ color: primaryColor }}
              >
                Sign In / Register
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
