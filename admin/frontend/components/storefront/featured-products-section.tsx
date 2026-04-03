import { ShoppingCart, Star } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  price: number;
  salePrice?: number | null;
  featuredImageUrl?: string | null;
  isFeatured?: boolean;
}

interface FeaturedProductsProps {
  title?: string;
  subtitle?: string;
  products?: Product[];
  showBadge?: boolean;
}

function formatPrice(cents: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100);
}

export function FeaturedProductsSection({
  title = 'Featured Products',
  subtitle = 'Hand-picked items just for you',
  products = [],
  showBadge = true,
}: FeaturedProductsProps) {
  if (products.length === 0) {
    products = Array.from({ length: 8 }, (_, i) => ({
      id: `placeholder-${i}`,
      name: ['Wireless Headphones', 'Smart Watch', 'Running Shoes', 'Laptop Bag', 'Coffee Maker', 'Yoga Mat', 'Sunglasses', 'Backpack'][i] ?? 'Product',
      price: [9999, 29999, 7999, 4999, 8999, 3999, 5999, 6999][i] ?? 9999,
      salePrice: i % 3 === 0 ? [7999, 24999, 5999, null, null, null, null, null][i] : null,
      isFeatured: i < 3,
    }));
  }

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-10">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">{title}</h2>
            {subtitle && <p className="mt-2 text-gray-500">{subtitle}</p>}
          </div>
          <a href="/shop" className="text-sm font-semibold text-orange-500 hover:text-orange-600 transition-colors">
            View all →
          </a>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
          {products.map((product) => {
            const hasDiscount = product.salePrice !== null && product.salePrice !== undefined;
            const discountPct = hasDiscount
              ? Math.round(((product.price - (product.salePrice ?? 0)) / product.price) * 100)
              : 0;

            return (
              <a
                key={product.id}
                href={`/shop/${product.id}`}
                className="group rounded-2xl overflow-hidden border border-gray-100 hover:shadow-lg transition-shadow bg-white"
              >
                {/* Image */}
                <div className="relative aspect-square bg-gray-100 overflow-hidden">
                  {product.featuredImageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={product.featuredImageUrl}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                        <ShoppingCart className="h-8 w-8 text-gray-400" />
                      </div>
                    </div>
                  )}
                  {showBadge && hasDiscount && (
                    <span className="absolute top-3 left-3 px-2 py-0.5 bg-red-500 text-white text-xs font-bold rounded-full">
                      -{discountPct}%
                    </span>
                  )}
                  {showBadge && product.isFeatured && !hasDiscount && (
                    <span className="absolute top-3 left-3 px-2 py-0.5 bg-orange-500 text-white text-xs font-bold rounded-full">
                      Featured
                    </span>
                  )}
                </div>

                {/* Info */}
                <div className="p-4">
                  <h3 className="text-sm font-medium text-gray-900 line-clamp-2 group-hover:text-orange-500 transition-colors">
                    {product.name}
                  </h3>
                  <div className="flex items-center gap-1 mt-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={`h-3 w-3 ${i < 4 ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 fill-gray-200'}`} />
                    ))}
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    {hasDiscount ? (
                      <>
                        <span className="text-base font-bold text-orange-500">
                          {formatPrice(product.salePrice ?? 0)}
                        </span>
                        <span className="text-xs text-gray-400 line-through">
                          {formatPrice(product.price)}
                        </span>
                      </>
                    ) : (
                      <span className="text-base font-bold text-gray-900">{formatPrice(product.price)}</span>
                    )}
                  </div>
                  <button className="mt-3 w-full py-2 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold transition-colors flex items-center justify-center gap-2">
                    <ShoppingCart className="h-4 w-4" />
                    Add to Cart
                  </button>
                </div>
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
}
