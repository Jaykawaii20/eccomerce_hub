import { AnnouncementBar } from '@/components/storefront/announcement-bar';
import { StorefrontNavbar } from '@/components/storefront/storefront-navbar';
import { HeroSection } from '@/components/storefront/hero-section';
import { FeaturesSection } from '@/components/storefront/features-section';
import { FeaturedCategoriesSection } from '@/components/storefront/featured-categories-section';
import { FeaturedProductsSection } from '@/components/storefront/featured-products-section';
import { PromoBannerSection } from '@/components/storefront/promo-banner-section';
import { TestimonialsSection } from '@/components/storefront/testimonials-section';
import { NewsletterSection } from '@/components/storefront/newsletter-section';
import { StorefrontFooter } from '@/components/storefront/storefront-footer';

interface SectionConfig {
  id: string;
  type: string;
  enabled: boolean;
  order: number;
  props: Record<string, unknown>;
}

interface PageConfig {
  globalStyles: {
    primaryColor: string;
    storeName: string;
    logoText: string;
  };
  sections: SectionConfig[];
}

async function getPageConfig(): Promise<PageConfig | null> {
  try {
    const backendUrl = process.env['BACKEND_URL'] ?? 'http://localhost:4000';
    const res = await fetch(`${backendUrl}/api/v1/page-builder/public`, {
      next: { revalidate: 60 }, // revalidate every 60 seconds
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data as PageConfig;
  } catch {
    return null;
  }
}

function renderSection(section: SectionConfig) {
  const p = section.props;

  switch (section.type) {
    case 'announcement':
      return (
        <AnnouncementBar
          key={section.id}
          text={p['text'] as string}
          link={p['link'] as string}
          backgroundColor={p['backgroundColor'] as string}
          textColor={p['textColor'] as string}
        />
      );

    case 'navbar':
      return (
        <StorefrontNavbar
          key={section.id}
          logoText={p['logoText'] as string}
          navLinks={p['navLinks'] as { label: string; href: string }[]}
          showSearch={p['showSearch'] as boolean}
          showCart={p['showCart'] as boolean}
          backgroundColor={p['backgroundColor'] as string}
          textColor={p['textColor'] as string}
        />
      );

    case 'hero':
      return (
        <HeroSection
          key={section.id}
          headline={p['headline'] as string}
          subheadline={p['subheadline'] as string}
          buttonText={p['buttonText'] as string}
          buttonLink={p['buttonLink'] as string}
          buttonSecondaryText={p['buttonSecondaryText'] as string}
          buttonSecondaryLink={p['buttonSecondaryLink'] as string}
          backgroundColor={p['backgroundColor'] as string}
          textColor={p['textColor'] as string}
          backgroundImage={p['backgroundImage'] as string}
          overlay={p['overlay'] as boolean}
          overlayOpacity={p['overlayOpacity'] as number}
        />
      );

    case 'features':
      return (
        <FeaturesSection
          key={section.id}
          title={p['title'] as string}
          items={p['items'] as { icon: string; title: string; description: string }[]}
        />
      );

    case 'featured-categories':
      return (
        <FeaturedCategoriesSection
          key={section.id}
          title={p['title'] as string}
          subtitle={p['subtitle'] as string}
        />
      );

    case 'featured-products':
      return (
        <FeaturedProductsSection
          key={section.id}
          title={p['title'] as string}
          subtitle={p['subtitle'] as string}
          showBadge={p['showBadge'] as boolean}
        />
      );

    case 'promo-banner':
      return (
        <PromoBannerSection
          key={section.id}
          headline={p['headline'] as string}
          subheadline={p['subheadline'] as string}
          buttonText={p['buttonText'] as string}
          buttonLink={p['buttonLink'] as string}
          backgroundColor={p['backgroundColor'] as string}
          textColor={p['textColor'] as string}
        />
      );

    case 'testimonials':
      return (
        <TestimonialsSection
          key={section.id}
          title={p['title'] as string}
          items={p['items'] as { name: string; role: string; text: string; rating: number }[]}
        />
      );

    case 'newsletter':
      return (
        <NewsletterSection
          key={section.id}
          title={p['title'] as string}
          subtitle={p['subtitle'] as string}
          placeholder={p['placeholder'] as string}
          buttonText={p['buttonText'] as string}
          backgroundColor={p['backgroundColor'] as string}
          textColor={p['textColor'] as string}
        />
      );

    case 'footer':
      return (
        <StorefrontFooter
          key={section.id}
          logoText={p['logoText'] as string}
          tagline={p['tagline'] as string}
          columns={p['columns'] as { title: string; links: { label: string; href: string }[] }[]}
          copyright={p['copyright'] as string}
          backgroundColor={p['backgroundColor'] as string}
          textColor={p['textColor'] as string}
        />
      );

    default:
      return null;
  }
}

export default async function StorePage() {
  const config = await getPageConfig();

  if (!config) {
    // Fallback with default sections when backend is not available
    return (
      <div>
        <AnnouncementBar text="Free shipping on orders over $50! Use code FREESHIP" />
        <StorefrontNavbar
          logoText="ShopHub"
          navLinks={[
            { label: 'Home', href: '/store' },
            { label: 'Shop', href: '/shop' },
            { label: 'About', href: '/about' },
            { label: 'Contact', href: '/contact' },
          ]}
        />
        <HeroSection />
        <FeaturesSection
          items={[
            { icon: 'truck', title: 'Free Shipping', description: 'On all orders over $50.' },
            { icon: 'shield', title: 'Secure Payment', description: 'Your payment is always safe.' },
            { icon: 'refresh', title: 'Easy Returns', description: '30-day return policy.' },
            { icon: 'headphones', title: '24/7 Support', description: 'We are always here.' },
          ]}
        />
        <FeaturedCategoriesSection />
        <FeaturedProductsSection />
        <PromoBannerSection />
        <TestimonialsSection
          items={[
            { name: 'Sarah Johnson', role: 'Verified Buyer', text: 'Amazing quality and super fast shipping!', rating: 5 },
            { name: 'Mark Chen', role: 'Verified Buyer', text: 'Great prices and helpful customer support.', rating: 5 },
            { name: 'Emma Williams', role: 'Verified Buyer', text: 'Exactly as described. Very happy!', rating: 4 },
          ]}
        />
        <NewsletterSection />
        <StorefrontFooter
          columns={[
            { title: 'Shop', links: [{ label: 'All Products', href: '/shop' }, { label: 'Sale', href: '/sale' }] },
            { title: 'Company', links: [{ label: 'About', href: '/about' }, { label: 'Blog', href: '/blog' }] },
            { title: 'Support', links: [{ label: 'Help', href: '/help' }, { label: 'Contact', href: '/contact' }] },
          ]}
        />
      </div>
    );
  }

  const enabledSections = config.sections
    .filter((s) => s.enabled)
    .sort((a, b) => a.order - b.order);

  return <div>{enabledSections.map(renderSection)}</div>;
}
