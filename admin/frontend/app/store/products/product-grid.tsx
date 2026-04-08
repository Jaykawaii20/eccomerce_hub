'use client';

import { ShoppingCart, Star, Check } from 'lucide-react';
import { useState } from 'react';
import { useCart } from '../context/cart-context';
import { useCustomerAuth } from '../context/customer-auth-context';
import { useAuthModal } from '../context/auth-modal-context';

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  salePrice?: number | null;
  featuredImageUrl?: string | null;
  isFeatured: boolean;
  stockQuantity: number;
  categories: { category: { id: string; name: string; slug: string } }[];
}

function formatPrice(cents: number) {
  return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(cents / 100);
}

function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart();
  const { customer } = useCustomerAuth();
  const { openAuthModal } = useAuthModal();
  const [added, setAdded] = useState(false);

  const hasDiscount = product.salePrice != null && product.salePrice < product.price;
  const discountPct = hasDiscount
    ? Math.round(((product.price - (product.salePrice ?? 0)) / product.price) * 100)
    : 0;
  const effectivePrice = hasDiscount ? (product.salePrice ?? product.price) : product.price;
  const inStock = product.stockQuantity > 0;

  function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!inStock) return;

    if (!customer) {
      openAuthModal({
        tab: 'login',
        onSuccess: () => {
          addItem({
            productId: product.id,
            slug: product.slug,
            name: product.name,
            price: effectivePrice,
            originalPrice: product.price,
            image: product.featuredImageUrl ?? undefined,
          });
          setAdded(true);
          setTimeout(() => setAdded(false), 1500);
        },
      });
      return;
    }

    addItem({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      price: effectivePrice,
      originalPrice: product.price,
      image: product.featuredImageUrl ?? undefined,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  return (
    <a
      href={`/store/products/${product.slug}`}
      className="group rounded-2xl overflow-hidden border border-gray-100 hover:shadow-lg transition-all bg-white flex flex-col"
    >
      {/* Image */}
      <div className="relative aspect-square bg-gray-50 overflow-hidden">
        {product.featuredImageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.featuredImageUrl}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ShoppingCart className="h-10 w-10 text-gray-300" />
          </div>
        )}
        {hasDiscount && (
          <span className="absolute top-3 left-3 px-2 py-0.5 bg-red-500 text-white text-[11px] font-bold rounded-full">
            -{discountPct}%
          </span>
        )}
        {!inStock && (
          <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
            <span className="text-xs font-semibold text-gray-500 bg-white px-3 py-1 rounded-full border border-gray-200">
              Out of stock
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4 flex flex-col flex-1">
        <p className="text-xs text-gray-400 mb-1">
          {product.categories[0]?.category.name ?? 'Uncategorized'}
        </p>
        <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 group-hover:text-orange-500 transition-colors flex-1">
          {product.name}
        </h3>
        <div className="flex items-center gap-1 mt-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={`h-3 w-3 ${i < 4 ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 fill-gray-200'}`}
            />
          ))}
        </div>
        <div className="flex items-center gap-2 mt-2">
          <span className="text-base font-bold text-orange-500">{formatPrice(effectivePrice)}</span>
          {hasDiscount && (
            <span className="text-xs text-gray-400 line-through">{formatPrice(product.price)}</span>
          )}
        </div>
        <button
          onClick={handleAddToCart}
          disabled={!inStock}
          className={`mt-3 w-full py-2 rounded-lg text-white text-sm font-semibold transition-colors flex items-center justify-center gap-2 ${
            added
              ? 'bg-green-500'
              : inStock
              ? 'bg-orange-500 hover:bg-orange-600'
              : 'bg-gray-200 cursor-not-allowed'
          }`}
        >
          {added ? (
            <><Check className="h-4 w-4" /> Added!</>
          ) : (
            <><ShoppingCart className="h-4 w-4" /> Add to Cart</>
          )}
        </button>
      </div>
    </a>
  );
}

export function ProductGrid({ products }: { products: Product[] }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
