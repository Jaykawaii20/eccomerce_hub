import { ShopNavbar } from '../../components/shop-navbar';
import { AddToCartSection } from './add-to-cart-section';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

const BACKEND = process.env['BACKEND_URL'] ?? 'http://localhost:4000';

interface VariantAttribute {
  value: string;
  attribute: { name: string };
}

interface Variant {
  id: string;
  sku: string;
  price: number;
  salePrice?: number | null;
  stockQuantity: number;
  imageUrl?: string | null;
  attributes: VariantAttribute[];
}

interface Review {
  id: string;
  rating: number;
  title?: string | null;
  body: string;
  createdAt: string;
  user: { firstName: string; lastName: string };
}

interface ProductDetail {
  id: string;
  name: string;
  slug: string;
  sku?: string | null;
  type: string;
  price: number;
  salePrice?: number | null;
  featuredImageUrl?: string | null;
  description?: string | null;
  shortDescription?: string | null;
  stockQuantity: number;
  manageStock: boolean;
  allowBackorders: boolean;
  categories: { category: { id: string; name: string; slug: string } }[];
  images: { id: string; url: string; altText?: string | null }[];
  variants: Variant[];
  reviews: Review[];
}

async function getProduct(slug: string): Promise<ProductDetail | null> {
  try {
    const res = await fetch(`${BACKEND}/api/v1/storefront/products/${slug}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data as ProductDetail;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);
  return {
    title: product?.name ?? 'Product',
    description: product?.shortDescription ?? undefined,
  };
}

function formatPrice(cents: number) {
  return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(cents / 100);
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          className={`h-4 w-4 ${i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 fill-gray-200'}`}
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) notFound();

  const hasDiscount = product.salePrice != null && product.salePrice < product.price;
  const discountPct = hasDiscount
    ? Math.round(((product.price - (product.salePrice ?? 0)) / product.price) * 100)
    : 0;
  const inStock = !product.manageStock || product.stockQuantity > 0 || product.allowBackorders;
  const avgRating = product.reviews.length
    ? Math.round(product.reviews.reduce((s, r) => s + r.rating, 0) / product.reviews.length)
    : 0;

  const allImages = [
    ...(product.featuredImageUrl ? [{ id: 'featured', url: product.featuredImageUrl, altText: product.name }] : []),
    ...product.images.filter((img) => img.url !== product.featuredImageUrl),
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <ShopNavbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <a href="/store" className="hover:text-gray-700">Home</a>
          <span>/</span>
          <a href="/store/products" className="hover:text-gray-700">Products</a>
          <span>/</span>
          <span className="text-gray-900 font-medium">{product.name}</span>
        </nav>

        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="grid md:grid-cols-2 gap-0">
            {/* Images */}
            <div className="p-6 space-y-3">
              <div className="aspect-square rounded-xl bg-gray-50 overflow-hidden">
                {allImages[0] ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={allImages[0].url}
                    alt={allImages[0].altText ?? product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300">
                    <svg className="h-24 w-24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
              </div>
              {allImages.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {allImages.slice(1, 5).map((img) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      key={img.id}
                      src={img.url}
                      alt={img.altText ?? product.name}
                      className="aspect-square rounded-lg object-cover border border-gray-100 cursor-pointer hover:border-orange-300 transition-colors"
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Info & Add to Cart */}
            <div className="p-6 md:p-8 border-t md:border-t-0 md:border-l border-gray-100">
              {product.categories[0] && (
                <a
                  href={`/store/products?category=${product.categories[0].category.slug}`}
                  className="text-xs font-semibold text-orange-500 uppercase tracking-wider hover:underline"
                >
                  {product.categories[0].category.name}
                </a>
              )}
              <h1 className="text-2xl font-bold text-gray-900 mt-2">{product.name}</h1>

              {/* Rating */}
              {product.reviews.length > 0 && (
                <div className="flex items-center gap-2 mt-2">
                  <StarRating rating={avgRating} />
                  <span className="text-sm text-gray-500">({product.reviews.length} reviews)</span>
                </div>
              )}

              {/* Price */}
              <div className="flex items-baseline gap-3 mt-4">
                <span className="text-3xl font-bold text-gray-900">
                  {formatPrice(hasDiscount ? (product.salePrice ?? product.price) : product.price)}
                </span>
                {hasDiscount && (
                  <>
                    <span className="text-lg text-gray-400 line-through">{formatPrice(product.price)}</span>
                    <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-600 text-xs font-bold">
                      -{discountPct}% OFF
                    </span>
                  </>
                )}
              </div>

              {/* Stock */}
              <div className="mt-3">
                {inStock ? (
                  <span className="text-sm text-green-600 font-medium">✓ In Stock</span>
                ) : (
                  <span className="text-sm text-red-500 font-medium">Out of Stock</span>
                )}
                {product.manageStock && product.stockQuantity > 0 && product.stockQuantity <= 5 && (
                  <span className="ml-2 text-xs text-orange-500">Only {product.stockQuantity} left!</span>
                )}
              </div>

              {/* Short description */}
              {product.shortDescription && (
                <p className="mt-4 text-sm text-gray-600 leading-relaxed">{product.shortDescription}</p>
              )}

              {/* Add to cart client component */}
              <AddToCartSection product={{
                id: product.id,
                slug: product.slug,
                name: product.name,
                price: product.price,
                salePrice: product.salePrice,
                featuredImageUrl: product.featuredImageUrl,
                stockQuantity: product.stockQuantity,
                manageStock: product.manageStock,
                allowBackorders: product.allowBackorders,
                variants: product.variants,
              }} />

              {/* SKU */}
              {product.sku && (
                <p className="mt-4 text-xs text-gray-400">SKU: {product.sku}</p>
              )}
            </div>
          </div>

          {/* Description */}
          {product.description && (
            <div className="px-6 md:px-8 py-6 border-t border-gray-100">
              <h2 className="text-lg font-bold text-gray-900 mb-3">Product Description</h2>
              <div
                className="prose prose-sm max-w-none text-gray-600"
                dangerouslySetInnerHTML={{ __html: product.description }}
              />
            </div>
          )}

          {/* Reviews */}
          {product.reviews.length > 0 && (
            <div className="px-6 md:px-8 py-6 border-t border-gray-100">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Customer Reviews</h2>
              <div className="space-y-4">
                {product.reviews.map((review) => (
                  <div key={review.id} className="pb-4 border-b border-gray-100 last:border-0">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="h-8 w-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 text-sm font-bold">
                        {review.user.firstName[0]}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">
                          {review.user.firstName} {review.user.lastName}
                        </p>
                        <StarRating rating={review.rating} />
                      </div>
                      <span className="ml-auto text-xs text-gray-400">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    {review.title && <p className="text-sm font-medium text-gray-800 mb-1">{review.title}</p>}
                    <p className="text-sm text-gray-600">{review.body}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
