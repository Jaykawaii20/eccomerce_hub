interface HeroProps {
  headline?: string;
  subheadline?: string;
  buttonText?: string;
  buttonLink?: string;
  buttonSecondaryText?: string;
  buttonSecondaryLink?: string;
  backgroundColor?: string;
  textColor?: string;
  backgroundImage?: string;
  overlay?: boolean;
  overlayOpacity?: number;
}

export function HeroSection({
  headline = 'Discover Amazing Products',
  subheadline = 'Shop the latest trends and find everything you need in one place.',
  buttonText = 'Shop Now',
  buttonLink = '/store/products',
  buttonSecondaryText = 'View Deals',
  buttonSecondaryLink = '/store/products',
  backgroundColor = '#0f172a',
  textColor = '#ffffff',
  backgroundImage = '',
  overlay = true,
  overlayOpacity = 0.5,
}: HeroProps) {
  const bgStyle: React.CSSProperties = backgroundImage
    ? {
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }
    : { backgroundColor };

  return (
    <section className="relative min-h-[520px] flex items-center" style={bgStyle}>
      {/* Overlay */}
      {backgroundImage && overlay && (
        <div
          className="absolute inset-0"
          style={{ backgroundColor: `rgba(0,0,0,${overlayOpacity})` }}
        />
      )}

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="max-w-2xl">
          <h1
            className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight"
            style={{ color: textColor }}
          >
            {headline}
          </h1>
          <p className="mt-6 text-lg sm:text-xl opacity-80" style={{ color: textColor }}>
            {subheadline}
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            {buttonText && (
              <a
                href={buttonLink}
                className="inline-flex items-center px-8 py-3 rounded-lg text-base font-semibold bg-orange-500 text-white hover:bg-orange-600 transition-colors shadow-lg"
              >
                {buttonText}
              </a>
            )}
            {buttonSecondaryText && (
              <a
                href={buttonSecondaryLink}
                className="inline-flex items-center px-8 py-3 rounded-lg text-base font-semibold border-2 hover:opacity-80 transition-opacity"
                style={{ borderColor: textColor, color: textColor }}
              >
                {buttonSecondaryText}
              </a>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
