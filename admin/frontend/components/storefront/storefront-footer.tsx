interface FooterLink {
  label: string;
  href: string;
}

interface FooterColumn {
  title: string;
  links: FooterLink[];
}

interface FooterProps {
  logoText?: string;
  tagline?: string;
  columns?: FooterColumn[];
  copyright?: string;
  backgroundColor?: string;
  textColor?: string;
}

export function StorefrontFooter({
  logoText = '',
  tagline = 'Your one-stop shop for everything.',
  columns = [],
  copyright = '© 2026. All rights reserved.',
  backgroundColor = '#111827',
  textColor = '#9ca3af',
}: FooterProps) {
  return (
    <footer style={{ backgroundColor, color: textColor }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand column */}
          <div>
            <p className="text-xl font-bold text-white mb-3">{logoText}</p>
            <p className="text-sm leading-relaxed opacity-70">{tagline}</p>
          </div>

          {/* Link columns */}
          {columns.map((col, i) => (
            <div key={i}>
              <p className="text-sm font-semibold text-white uppercase tracking-wider mb-4">{col.title}</p>
              <ul className="space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <a
                      href={link.href}
                      className="text-sm hover:text-white transition-colors"
                      style={{ color: textColor }}
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 pt-8 border-t" style={{ borderColor: `${textColor}30` }}>
          <p className="text-sm text-center opacity-60">{copyright}</p>
        </div>
      </div>
    </footer>
  );
}
