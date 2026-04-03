interface PromoBannerProps {
  headline?: string;
  subheadline?: string;
  buttonText?: string;
  buttonLink?: string;
  backgroundColor?: string;
  textColor?: string;
}

export function PromoBannerSection({
  headline = 'Summer Sale Up to 50% Off',
  subheadline = 'Limited time offer. Shop now before it is too late.',
  buttonText = 'Grab the Deal',
  buttonLink = '/sale',
  backgroundColor = '#7c3aed',
  textColor = '#ffffff',
}: PromoBannerProps) {
  return (
    <section className="py-14" style={{ backgroundColor }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl sm:text-4xl font-extrabold" style={{ color: textColor }}>
          {headline}
        </h2>
        <p className="mt-4 text-lg opacity-80 max-w-xl mx-auto" style={{ color: textColor }}>
          {subheadline}
        </p>
        {buttonText && (
          <a
            href={buttonLink}
            className="mt-8 inline-block px-10 py-4 rounded-xl text-base font-bold bg-white hover:opacity-90 transition-opacity shadow-lg"
            style={{ color: backgroundColor }}
          >
            {buttonText}
          </a>
        )}
      </div>
    </section>
  );
}
