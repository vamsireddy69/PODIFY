import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface Props extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  /** Optional label used for the initial-letter fallback (creator/title). */
  fallbackLabel?: string;
  /** "square" tones the gradient for square covers, "round" for avatars. */
  fallbackVariant?: "square" | "round";
}

/**
 * Image that gracefully degrades through multiple YouTube thumbnail qualities,
 * then to a generated initial-letter SVG. Detects YouTube's 120x90 grey
 * "video unavailable" placeholder (which loads with HTTP 200) and treats it
 * as a failure so we keep falling back.
 */
export function SmartImage({
  src,
  alt,
  fallbackLabel,
  fallbackVariant = "square",
  className,
  ...rest
}: Props) {
  const candidates = buildCandidates(src);
  const [idx, setIdx] = useState(0);
  const imgRef = useRef<HTMLImageElement>(null);

  // Reset when src changes (new card / new creator)
  useEffect(() => {
    setIdx(0);
  }, [src]);

  if (idx >= candidates.length) {
    return (
      <InitialFallback
        label={fallbackLabel || alt}
        variant={fallbackVariant}
        className={className}
        ariaLabel={alt}
      />
    );
  }

  const next = () => setIdx((i) => i + 1);

  return (
    <img
      {...rest}
      ref={imgRef}
      src={candidates[idx]}
      alt={alt}
      className={cn(className)}
      onError={next}
      onLoad={(e) => {
        const el = e.currentTarget;
        // YouTube returns a 120x90 grey placeholder when a thumbnail size
        // doesn't exist for that video. Treat that as a miss and try next.
        if (el.naturalWidth === 120 && el.naturalHeight === 90) {
          next();
        }
      }}
      referrerPolicy="no-referrer"
      crossOrigin="anonymous"
    />
  );
}

function buildCandidates(src: string): string[] {
  // YouTube thumbs: try most-likely-to-exist first (hqdefault always exists),
  // then attempt better resolutions, then smaller fallbacks.
  const ytMatch = src.match(/i\.ytimg\.com\/vi\/([A-Za-z0-9_-]{6,})\//);
  if (ytMatch) {
    const id = ytMatch[1];
    return [
      `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
      `https://i.ytimg.com/vi/${id}/maxresdefault.jpg`,
      `https://i.ytimg.com/vi/${id}/sddefault.jpg`,
      `https://i.ytimg.com/vi/${id}/mqdefault.jpg`,
      `https://i.ytimg.com/vi/${id}/0.jpg`,
      // Alternate CDN as last resort
      `https://img.youtube.com/vi/${id}/hqdefault.jpg`,
    ];
  }
  return [src];
}

function InitialFallback({
  label,
  variant,
  className,
  ariaLabel,
}: {
  label: string;
  variant: "square" | "round";
  className?: string;
  ariaLabel: string;
}) {
  const initials = (label || "?")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join("");
  // Deterministic hue from label
  let h = 0;
  for (let i = 0; i < label.length; i++) h = (h * 31 + label.charCodeAt(i)) % 360;
  const c1 = `hsl(${h}, 80%, 55%)`;
  const c2 = `hsl(${(h + 50) % 360}, 80%, 45%)`;
  return (
    <div
      role="img"
      aria-label={ariaLabel}
      className={cn(
        "grid place-items-center text-white font-display font-bold",
        variant === "round" ? "rounded-full" : "",
        className,
      )}
      style={{
        backgroundImage: `linear-gradient(135deg, ${c1}, ${c2})`,
      }}
    >
      <span className="text-xl drop-shadow-sm">{initials || "?"}</span>
    </div>
  );
}
