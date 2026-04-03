import { Truck, Shield, RefreshCcw, Headphones, Star, Package, Zap, Heart } from 'lucide-react';

interface FeatureItem {
  icon: string;
  title: string;
  description: string;
}

interface FeaturesProps {
  title?: string;
  items?: FeatureItem[];
}

const ICONS: Record<string, React.ElementType> = {
  truck: Truck,
  shield: Shield,
  refresh: RefreshCcw,
  headphones: Headphones,
  star: Star,
  package: Package,
  zap: Zap,
  heart: Heart,
};

export function FeaturesSection({ title = 'Why Shop With Us', items = [] }: FeaturesProps) {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {title && (
          <h2 className="text-2xl sm:text-3xl font-bold text-center text-gray-900 mb-12">{title}</h2>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {items.map((item, i) => {
            const Icon = ICONS[item.icon] ?? Package;
            return (
              <div key={i} className="flex flex-col items-center text-center p-6">
                <div className="p-4 bg-orange-50 rounded-2xl mb-4">
                  <Icon className="h-8 w-8 text-orange-500" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{item.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
