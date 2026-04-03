interface AnnouncementProps {
  text: string;
  link?: string;
  backgroundColor?: string;
  textColor?: string;
}

export function AnnouncementBar({ text, link, backgroundColor = '#f97316', textColor = '#ffffff' }: AnnouncementProps) {
  const content = (
    <p className="text-sm font-medium text-center py-2 px-4">{text}</p>
  );

  return (
    <div style={{ backgroundColor, color: textColor }}>
      {link ? (
        <a href={link} className="block hover:opacity-90 transition-opacity">
          {content}
        </a>
      ) : content}
    </div>
  );
}
