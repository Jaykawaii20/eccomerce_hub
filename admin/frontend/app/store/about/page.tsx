import { ShopNavbar } from '../components/shop-navbar';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'About Us' };

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <ShopNavbar />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Hero */}
        <div className="text-center mb-14">
          <h1 className="text-4xl font-extrabold text-gray-900">About Us</h1>
          <p className="mt-4 text-lg text-gray-500 max-w-2xl mx-auto">
            We&apos;re passionate about delivering quality products and an exceptional shopping experience to every customer.
          </p>
        </div>

        {/* Story */}
        <div className="bg-white rounded-2xl border border-gray-100 p-8 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Our Story</h2>
          <p className="text-gray-600 leading-relaxed">
            Founded with a simple mission — to make great products accessible to everyone. We carefully curate every item in our catalog, ensuring quality, value, and reliability. From our team to your doorstep, we take pride in every order.
          </p>
        </div>

        {/* Values */}
        <div className="grid sm:grid-cols-3 gap-6 mb-8">
          {[
            { title: 'Quality First', description: 'Every product is reviewed before it reaches our catalog.', icon: '⭐' },
            { title: 'Fast Delivery', description: 'We partner with trusted couriers to get orders to you quickly.', icon: '🚚' },
            { title: 'Customer Care', description: 'Our support team is always ready to help with any concern.', icon: '💬' },
          ].map((v) => (
            <div key={v.title} className="bg-white rounded-2xl border border-gray-100 p-6 text-center">
              <div className="text-3xl mb-3">{v.icon}</div>
              <h3 className="text-base font-bold text-gray-900 mb-2">{v.title}</h3>
              <p className="text-sm text-gray-500">{v.description}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center">
          <a
            href="/store/products"
            className="inline-flex items-center px-8 py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold transition-colors"
          >
            Start Shopping →
          </a>
        </div>
      </div>
    </div>
  );
}
