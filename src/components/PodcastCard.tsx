import { Play, Heart } from "lucide-react";
import { Link } from "react-router-dom";
import type { Podcast } from "@/lib/types";
import { formatPlays } from "@/lib/mock-data";
import { usePlayer } from "@/contexts/PlayerContext";
import { cn } from "@/lib/utils";
import { SmartImage } from "@/components/SmartImage";

const formatRelativeDate = (dateStr?: string) => {
  if (!dateStr) return "";
  try {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSecs < 60) {
      return "just now";
    }
    if (diffMins < 60) {
      return `${diffMins} ${diffMins === 1 ? "minute" : "minutes"} ago`;
    }
    if (diffHours < 24) {
      return `${diffHours} ${diffHours === 1 ? "hour" : "hours"} ago`;
    }
    if (diffDays < 30) {
      return `${diffDays} ${diffDays === 1 ? "day" : "days"} ago`;
    }

    const diffMonths = (now.getFullYear() - date.getFullYear()) * 12 + (now.getMonth() - date.getMonth());
    if (diffMonths < 12) {
      return `${diffMonths} ${diffMonths === 1 ? "month" : "months"} ago`;
    }
    const diffYears = Math.floor(diffMonths / 12);
    return `${diffYears} ${diffYears === 1 ? "year" : "years"} ago`;
  } catch {
    return "";
  }
};

interface Props {
  podcast: Podcast;
  queue?: Podcast[];
  variant?: "default" | "wide" | "compact" | "landing";
  className?: string;
}

export function PodcastCard({ podcast, queue, variant = "default", className }: Props) {
  const { play, current, isPlaying, liked, toggleLike } = usePlayer();
  const isCurrent = current?.id === podcast.id;
  const isLiked = liked.has(podcast.id);
  const isLanding = variant === "landing";

  if (variant === "compact") {
    return (
      <button
        onClick={() => play(podcast, queue)}
        className={cn(
          "group flex items-center gap-3 rounded-xl glass p-2 pr-4 text-left card-hover w-full",
          className,
        )}
      >
        <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg">
          <SmartImage
            src={podcast.cover}
            alt={podcast.title}
            fallbackLabel={podcast.creator}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 grid place-items-center bg-black/50 opacity-0 transition group-hover:opacity-100">
            <Play className="h-5 w-5 fill-white text-white" />
          </div>
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-medium">{podcast.title}</div>
          <div className="truncate text-xs text-muted-foreground">{podcast.creator}</div>
        </div>
      </button>
    );
  }

  // ---- Landing variant: hover Play, click Play/Heart -> /auth ----
  if (isLanding) {
    return (
      <div className={cn("group relative rounded-2xl glass p-3 card-hover", className)}>
        <Link to="/auth?mode=signup&role=listener" className="block">
          <div className="relative overflow-hidden rounded-xl aspect-square">
            <SmartImage
              src={podcast.cover}
              alt={podcast.title}
              fallbackLabel={podcast.creator}
              className="h-full w-full object-cover transition duration-700 group-hover:scale-110"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
            <div
              className="absolute bottom-3 right-3 grid h-12 w-12 place-items-center rounded-full bg-gradient-primary opacity-0 shadow-glow transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0 translate-y-2"
              aria-hidden="true"
            >
              <Play className="h-5 w-5 fill-white text-white" />
            </div>
          </div>
        </Link>
        <div className="mt-3 flex items-start justify-between gap-2">
          <Link to="/auth?mode=signup&role=listener" className="min-w-0 flex-1 block">
            <div className="truncate font-display font-semibold hover:text-primary-glow">{podcast.title}</div>
            <div className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground flex-wrap">
              <span className="truncate">{podcast.creator}</span>
              <span>·</span>
              <span>{formatPlays(podcast.plays)} plays</span>
              {(podcast.publishedAt || podcast.scheduledFor) && (
                <>
                  <span>·</span>
                  <span>{formatRelativeDate(podcast.publishedAt || podcast.scheduledFor)}</span>
                </>
              )}
            </div>
          </Link>
          <Link
            to="/auth?mode=signup&role=listener"
            className="shrink-0 rounded-full p-1.5 text-muted-foreground hover:text-neon-pink"
            aria-label="Sign in to like"
          >
            <Heart className="h-4 w-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("group relative rounded-2xl glass p-3 card-hover", className)}>
      <Link to={`/podcast/${podcast.id}`} className="block">
        <div className="relative overflow-hidden rounded-xl aspect-square">
          <SmartImage
            src={podcast.cover}
            alt={podcast.title}
            fallbackLabel={podcast.creator}
            className="h-full w-full object-cover transition duration-700 group-hover:scale-110"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
          <button
            onClick={(e) => {
              e.preventDefault();
              play(podcast, queue);
            }}
            className="absolute bottom-3 right-3 grid h-12 w-12 place-items-center rounded-full bg-gradient-primary opacity-0 shadow-glow transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0 translate-y-2 hover:scale-110"
            aria-label="Play"
          >
            <Play className="h-5 w-5 fill-white text-white" />
          </button>
          {isCurrent && isPlaying && (
            <div className="absolute left-3 top-3 flex h-8 items-end gap-0.5 rounded-full bg-black/60 px-2 backdrop-blur">
              {[0, 0.15, 0.3, 0.45].map((d) => (
                <span
                  key={d}
                  className="w-0.5 rounded-full bg-gradient-primary animate-wave"
                  style={{ animationDelay: `${d}s`, height: "60%" }}
                />
              ))}
            </div>
          )}
        </div>
      </Link>
      <div className="mt-3 flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <Link to={`/podcast/${podcast.id}`} className="block truncate font-display font-semibold hover:text-primary-glow">
            {podcast.title}
          </Link>
          <div className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground flex-wrap">
            <span className="truncate">{podcast.creator}</span>
            <span>·</span>
            <span>{formatPlays(podcast.plays)} plays</span>
            {(podcast.publishedAt || podcast.scheduledFor) && (
              <>
                <span>·</span>
                <span>{formatRelativeDate(podcast.publishedAt || podcast.scheduledFor)}</span>
              </>
            )}
          </div>
        </div>
        <button
          onClick={(e) => {
            e.preventDefault();
            toggleLike(podcast.id);
          }}
          className={cn(
            "shrink-0 rounded-full p-1.5 transition",
            isLiked ? "text-neon-pink" : "text-muted-foreground hover:text-foreground",
          )}
        >
          <Heart className={cn("h-4 w-4", isLiked && "fill-current")} />
        </button>
      </div>
    </div>
  );
}
