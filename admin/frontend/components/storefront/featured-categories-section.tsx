interface Category {
  id: string;
  name: string;
  slug: string;
  imageUrl?: string | null;
  _count?: { products: number };
}

interface FeaturedCategoriesProps {
  title?: string;
  subtitle?: string;
  categories?: Category[];
}

const PLACEHOLDER_COLORS = [
  'from-orange-400 to-pink-500',
  'from-blue-400 to-indigo-500',
  'from-green-400 to-teal-500',
  'from-purple-400 to-violet-500',
  'from-yellow-400 to-orange-500',
  'from-red-400 to-rose-500',
];

async function fetchCategories(): Promise<Category[]> {
  try {
    const backend = process.env['BACKEND_URL'] ?? 'http://localhost:4000';
    const res = await fetch(`${backend}/api/v1/storefront/categories`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) return [];
    const json = await res.json();
    return (json.data ?? []) as Category[];
  } catch {
    return [];
  }
}

export async function FeaturedCategoriesSection({
  title = 'Shop by Category',
  subtitle = 'Find exactly what you are looking for',
  categories: propCategories,
}: FeaturedCategoriesProps) {
  const categories = (propCategories && propCategories.length > 0)
    ? propCategories
    : await fetchCategories();

  // Don't render empty section
  if (categories.length === 0) return null;

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">{title}</h2>
          {subtitle && <p className="mt-3 text-gray-500">{subtitle}</p>}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.slice(0, 6).map((cat, i) => (
            <a
              key={cat.id}
              href={`/store/products?category=${cat.slug}`}
              className="group flex flex-col items-center gap-3 p-4 rounded-2xl bg-white shadow-sm hover:shadow-md transition-shadow"
            >
              <div
                className={`w-full aspect-square rounded-xl bg-gradient-to-br ${PLACEHOLDER_COLORS[i % PLACEHOLDER_COLORS.length]} flex items-center justify-center overflow-hidden`}
              >
                {cat.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={cat.imageUrl} alt={cat.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-4xl text-white font-bold opacity-70">
                    {cat.name.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <p className="text-sm font-medium text-gray-800 text-center group-hover:text-orange-500 transition-colors">
                {cat.name}
              </p>
              {cat._count !== undefined && (
                <p className="text-xs text-gray-400">{cat._count.products} items</p>
              )}
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
