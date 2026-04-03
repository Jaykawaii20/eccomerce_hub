import { Star } from 'lucide-react';

interface TestimonialItem {
  name: string;
  role?: string;
  text: string;
  rating?: number;
}

interface TestimonialsProps {
  title?: string;
  items?: TestimonialItem[];
}

export function TestimonialsSection({ title = 'What Our Customers Say', items = [] }: TestimonialsProps) {
  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {title && (
          <h2 className="text-2xl sm:text-3xl font-bold text-center text-gray-900 mb-12">{title}</h2>
        )}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {items.map((item, i) => (
            <div key={i} className="bg-white rounded-2xl p-8 shadow-sm">
              <div className="flex gap-1 mb-4">
                {Array.from({ length: 5 }).map((_, s) => (
                  <Star
                    key={s}
                    className={`h-4 w-4 ${s < (item.rating ?? 5) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 fill-gray-200'}`}
                  />
                ))}
              </div>
              <p className="text-gray-600 text-sm leading-relaxed italic">"{item.text}"</p>
              <div className="mt-6 flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center text-white font-bold text-sm">
                  {item.name.charAt(0)}
                </div>
                <div>
                  <p className="font-semibold text-sm text-gray-900">{item.name}</p>
                  {item.role && <p className="text-xs text-gray-400">{item.role}</p>}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
