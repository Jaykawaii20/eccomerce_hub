interface Category {
  id: string;
  name: string;
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

export function FeaturedCategoriesSection({
  title = 'Shop by Category',
  subtitle = 'Find exactly what you are looking for',
  categories = [],
}: FeaturedCategoriesProps) {
  if (categories.length === 0) {
    // Show placeholder tiles
    categories = Array.from({ length: 6 }, (_, i) => ({
      id: `placeholder-${i}`,
      name: ['Electronics', 'Clothing', 'Home & Garden', 'Sports', 'Beauty', 'Books'][i] ?? 'Category',
    }));
  }

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
              href={`/shop?category=${cat.id}`}
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
