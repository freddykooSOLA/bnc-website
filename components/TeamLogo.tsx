/** 隊徽或縮寫圓形占位 */
export default function TeamLogo({
  name,
  imageUrl,
  abbreviation,
  size = 32,
  className = '',
}: {
  name: string;
  imageUrl?: string;
  abbreviation?: string;
  size?: number;
  className?: string;
}) {
  const abbr =
    abbreviation?.trim() ||
    name
      .split(/\s+/)
      .map((w) => w[0])
      .join('')
      .slice(0, 3)
      .toUpperCase();

  if (imageUrl) {
    return (
      <img
        src={imageUrl}
        alt={name}
        width={size}
        height={size}
        loading="lazy"
        className={`rounded-full object-cover bg-gray-100 shrink-0 ${className}`}
        style={{ width: size, height: size }}
      />
    );
  }

  return (
    <span
      className={`inline-flex items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold shrink-0 ${className}`}
      style={{ width: size, height: size }}
      aria-hidden={!abbr}
    >
      {abbr}
    </span>
  );
}
