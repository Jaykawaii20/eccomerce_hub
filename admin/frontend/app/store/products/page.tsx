import { ShopNavbar } from '../components/shop-navbar';
import { ProductGrid } from './product-grid';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Shop All Products' };

interface SearchParams {
  page?: string;
  search?: string;
  category?: string;
  sort?: string;
  minPrice?: string;
  maxPrice?: string;
}

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

interface Category {
  id: string;
  name: string;
  slug: string;
}

async function getProducts(params: SearchParams) {
  try {
    const backend = process.env['BACKEND_URL'] ?? 'http://localhost:4000';
    const qs = new URLSearchParams();
    if (params.page) qs.set('page', params.page);
    qs.set('pageSize', '24');
    if (params.search) qs.set('search', params.search);
    if (params.category) qs.set('category', params.category);
    if (params.sort) qs.set('sort', params.sort);
    if (params.minPrice) qs.set('minPrice', String(parseInt(params.minPrice) * 100));
    if (params.maxPrice) qs.set('maxPrice', String(parseInt(params.maxPrice) * 100));
    const res = await fetch(`${backend}/api/v1/storefront/products?${qs.toString()}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return { data: [] as Product[], meta: { total: 0, totalPages: 1, page: 1 } };
    const json = await res.json();
    return json as { data: Product[]; meta: { total: number; totalPages: number; page: number } };
  } catch {
    return { data: [] as Product[], meta: { total: 0, totalPages: 1, page: 1 } };
  }
}

async function getCategories(): Promise<Category[]> {
  try {
    const backend = process.env['BACKEND_URL'] ?? 'http://localhost:4000';
    const res = await fetch(`${backend}/api/v1/storefront/categories`, { next: { revalidate: 300 } });
    if (!res.ok) return [];
    const json = await res.json();
    return (json.data ?? []) as Category[];
  } catch {
    return [];
  }
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const [result, categories] = await Promise.all([
    getProducts(params),
    getCategories(),
  ]);

  const sortOptions = [
    { value: 'createdAt:desc', label: 'Newest' },
    { value: 'price:asc', label: 'Price: Low to High' },
    { value: 'price:desc', label: 'Price: High to Low' },
    { value: 'name:asc', label: 'Name A–Z' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <ShopNavbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">All Products</h1>
          <p className="text-sm text-gray-500 mt-1">{result.meta.total} products found</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar filters */}
          <aside className="lg:w-64 shrink-0">
            <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-6">
              {/* Search */}
              <form method="get">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Search
                </label>
                <div className="relative">
                  <input
                    name="search"
                    defaultValue={params.search ?? ''}
                    placeholder="Search products…"
                    className="w-full pl-3 pr-4 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500"
                  />
                </div>
                {params.category && <input type="hidden" name="category" value={params.category} />}
                {params.sort && <input type="hidden" name="sort" value={params.sort} />}
                <button
                  type="submit"
                  className="mt-2 w-full py-2 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold transition-colors"
                >
                  Search
                </button>
              </form>

              {/* Categories */}
              {categories.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                    Categories
                  </p>
                  <div className="space-y-1">
                    <a
                      href="/store/products"
                      className={`block text-sm px-3 py-1.5 rounded-lg transition-colors ${
                        !params.category
                          ? 'bg-orange-50 text-orange-600 font-semibold'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      All Categories
                    </a>
                    {categories.map((cat) => (
                      <a
                        key={cat.id}
                        href={`/store/products?category=${cat.slug}${params.search ? `&search=${params.search}` : ''}${params.sort ? `&sort=${params.sort}` : ''}`}
                        className={`block text-sm px-3 py-1.5 rounded-lg transition-colors ${
                          params.category === cat.slug
                            ? 'bg-orange-50 text-orange-600 font-semibold'
                            : 'text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        {cat.name}
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Sort */}
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Sort By</p>
                <div className="space-y-1">
                  {sortOptions.map((opt) => (
                    <a
                      key={opt.value}
                      href={`/store/products?sort=${opt.value}${params.category ? `&category=${params.category}` : ''}${params.search ? `&search=${params.search}` : ''}`}
                      className={`block text-sm px-3 py-1.5 rounded-lg transition-colors ${
                        (params.sort ?? 'createdAt:desc') === opt.value
                          ? 'bg-orange-50 text-orange-600 font-semibold'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {opt.label}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Product grid */}
          <div className="flex-1">
            {result.data.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                  <span className="text-2xl">🛍️</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-800">No products found</h3>
                <p className="text-sm text-gray-500 mt-1">Try adjusting your filters or search terms.</p>
                <a href="/store/products" className="mt-4 text-orange-500 font-semibold text-sm hover:underline">
                  Clear filters
                </a>
              </div>
            ) : (
              <>
                <ProductGrid products={result.data} />

                {/* Pagination */}
                {result.meta.totalPages > 1 && (
                  <div className="mt-8 flex items-center justify-center gap-2">
                    {result.meta.page > 1 && (
                      <a
                        href={`/store/products?page=${result.meta.page - 1}${params.category ? `&category=${params.category}` : ''}${params.sort ? `&sort=${params.sort}` : ''}${params.search ? `&search=${params.search}` : ''}`}
                        className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                      >
                        ← Previous
                      </a>
                    )}
                    <span className="text-sm text-gray-500">
                      Page {result.meta.page} of {result.meta.totalPages}
                    </span>
                    {result.meta.page < result.meta.totalPages && (
                      <a
                        href={`/store/products?page=${result.meta.page + 1}${params.category ? `&category=${params.category}` : ''}${params.sort ? `&sort=${params.sort}` : ''}${params.search ? `&search=${params.search}` : ''}`}
                        className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                      >
                        Next →
                      </a>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
