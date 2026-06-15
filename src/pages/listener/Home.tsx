import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { AppLayout } from "@/components/AppLayout";
import { PodcastCard } from "@/components/PodcastCard";
import { PODCASTS, TRENDING, RECOMMENDED, RECENT, CATEGORIES } from "@/lib/mock-data";
import { useCatalog } from "@/contexts/CatalogContext";
import { ArrowRight, Sparkles, Play, Pause } from "lucide-react";
import { usePlayer } from "@/contexts/PlayerContext";
import { SmartImage } from "@/components/SmartImage";
import { cn } from "@/lib/utils";

export default function ListenerHome() {
  const { user } = useAuth();
  const { play, progressMap, history, current, progress } = usePlayer();
  const { creators, podcasts: allPodcasts } = useCatalog();
  const customExtras = allPodcasts.filter((p) => p.id.startsWith("custom-"));
  const trending = customExtras.length ? [...customExtras.slice(0, 4), ...TRENDING].slice(0, 8) : TRENDING;
  const isCreator = user?.role === "creator";
  const hour = new Date().getHours();
  const greet = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  // Continue listening: map history entries to podcasts, preserving chronological order and filtering for in-progress
  const continueList = history
    .map((h) => allPodcasts.find((p) => p.id === h.podcastId))
    .filter((p): p is typeof allPodcasts[0] => !!p)
    .filter((p) => {
      const pct = progressMap[p.id] ?? 0;
      return pct < 0.95; // Started but not yet completed
    })
    .slice(0, 6);

  return (
    <AppLayout>
      <div className="space-y-12">
        {/* Hero greeting */}
        <section className="relative overflow-hidden rounded-3xl border border-border/60 bg-gradient-to-br from-primary/15 via-card/40 to-secondary/15 p-8 md:p-10">
          <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/30 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 -left-10 h-64 w-64 rounded-full bg-secondary/20 blur-3xl" />
          <div className="relative max-w-2xl">
            <div className="text-xs uppercase tracking-widest text-primary-glow">{greet}</div>
            <h1 className="mt-2 font-display text-3xl font-bold md:text-5xl">
              Welcome back, {user?.name?.split(" ")[0] || "Listener"}.
            </h1>
            <p className="mt-3 text-muted-foreground">Pick up where you left off, or let our AI suggest something fresh.</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <button
                onClick={() => play(trending[0], trending)}
                className="inline-flex items-center gap-2 rounded-full bg-gradient-primary px-5 py-2.5 text-sm font-semibold text-white shadow-glow"
              >
                <Play className="h-4 w-4 fill-white" /> Play top trending
              </button>
              {isCreator && (
                <Link
                  to="/studio/multi-agent"
                  className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-card/40 px-5 py-2.5 text-sm hover:bg-card"
                >
                  <Sparkles className="h-4 w-4 text-primary-glow" /> Generate with AI
                </Link>
              )}
            </div>
          </div>
        </section>

        {/* Continue listening */}
        {continueList.length > 0 && (
          <Section title="Continue listening" linkTo="/app/library?tab=history">
            <div className="grid grid-cols-2 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {continueList.map((p, index) => {
                const isCurrent = current?.id === p.id;
                const livePct = isCurrent ? progress : (progressMap[p.id] ?? 0);
                return (
                  <div key={p.id} className={cn(index >= 2 && "hidden md:block")}>
                    <ContinueRow podcast={p} pct={Math.round(livePct * 100)} queue={continueList} />
                  </div>
                );
              })}
            </div>
          </Section>
        )}

        {/* Categories */}
        <Section title="Browse all" subtitle="Categories" linkTo="/app/search" mobileOnlyLink>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {CATEGORIES.map((c, index) => (
              <Link
                key={c.id}
                to={`/app/discover?cat=${c.id}`}
                className={cn(
                  `group relative overflow-hidden rounded-2xl bg-gradient-to-br ${c.color} p-5 h-28 card-hover`,
                  index >= 4 && "hidden md:block"
                )}
              >
                <div className="text-3xl">{c.icon}</div>
                <div className="absolute bottom-3 left-5 font-display text-lg font-bold">{c.name}</div>
                <div className="pointer-events-none absolute -bottom-6 -right-6 h-24 w-24 rounded-full bg-white/10 blur-xl" />
              </Link>
            ))}
          </div>
        </Section>

        {/* Trending */}
        <Section title="Trending now" linkTo="/app/discover">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
            {trending.map((p) => (
              <PodcastCard key={p.id} podcast={p} queue={trending} />
            ))}
          </div>
        </Section>

        {/* Recommended */}
        <Section title="Recommended for you" subtitle="Based on what you love">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
            {RECOMMENDED.map((p) => (
              <PodcastCard key={p.id} podcast={p} queue={RECOMMENDED} />
            ))}
          </div>
        </Section>

        {/* Featured creators */}
        <Section title="Featured creators" linkTo="/app/creators" mobileOnlyLink>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
            {creators.slice(0, 6).map((c) => (
              <Link key={c.id} to={`/creator/${c.id}`} className="group rounded-2xl glass p-5 text-center card-hover">
                <div className="relative mx-auto h-20 w-20">
                  <SmartImage src={c.avatar} alt={c.name} fallbackLabel={c.name} fallbackVariant="round" className="h-20 w-20 rounded-full border-2 border-primary/40 object-cover" />
                  <div className="absolute inset-0 rounded-full bg-gradient-primary opacity-0 blur-md transition group-hover:opacity-50" />
                </div>
                <div className="mt-3 truncate font-display font-semibold">{c.name}</div>
                <div className="text-xs text-muted-foreground">{c.followers.toLocaleString()} followers</div>
              </Link>
            ))}
          </div>
        </Section>
      </div>
    </AppLayout>
  );
}

function Section({
  title,
  subtitle,
  linkTo,
  mobileOnlyLink,
  children,
}: {
  title: string;
  subtitle?: string;
  linkTo?: string;
  mobileOnlyLink?: boolean;
  children: React.ReactNode;
}) {
  return (
    <section>
      <div className="mb-4 flex items-end justify-between">
        <div>
          {subtitle && <div className="text-xs uppercase tracking-widest text-primary-glow">{subtitle}</div>}
          <h2 className="font-display text-2xl font-bold md:text-3xl">{title}</h2>
        </div>
        {linkTo && (
          <Link
            to={linkTo}
            className={cn(
              "inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground",
              mobileOnlyLink && "md:hidden"
            )}
          >
            See all <ArrowRight className="h-4 w-4" />
          </Link>
        )}
      </div>
      {children}
    </section>
  );
}

function ContinueRow({ podcast, pct, queue }: { podcast: typeof PODCASTS[0]; pct: number; queue: typeof PODCASTS }) {
  const { play, toggle, current, isPlaying } = usePlayer();
  const displayPct = Math.max(0, Math.min(100, pct || 0));
  const isCurrent = current?.id === podcast.id;
  const isCurrentPlaying = isCurrent && isPlaying;

  return (
    <button
      onClick={() => isCurrent ? toggle() : play(podcast, queue)}
      className="group relative flex flex-col md:flex-row items-stretch md:items-center gap-3 md:gap-4 overflow-hidden rounded-2xl glass p-3 text-left card-hover w-full h-full"
    >
      {/* Cover image area */}
      <div className="relative aspect-square w-full md:h-16 md:w-16 shrink-0 overflow-hidden rounded-xl">
        <SmartImage src={podcast.cover} alt="" fallbackLabel={podcast.creator} className="h-full w-full object-cover" />
        
        {/* Mobile progress bar over image */}
        <div className="absolute inset-x-0 bottom-0 h-1.5 bg-white/20 md:hidden">
          <div className="h-full bg-gradient-primary transition-all" style={{ width: `${displayPct}%` }} />
        </div>

        {/* Mobile Play indicator overlay */}
        <div
          className={cn(
            "absolute inset-0 grid place-items-center bg-black/50 transition md:hidden",
            isCurrent ? "opacity-100" : "opacity-0 group-hover:opacity-100"
          )}
        >
          {isCurrentPlaying ? (
            <Pause className="h-6 w-6 fill-white text-white" />
          ) : (
            <Play className="h-6 w-6 fill-white text-white pl-0.5" />
          )}
        </div>
      </div>

      {/* Metadata & Progress details */}
      <div className="min-w-0 flex-1 flex flex-col justify-between py-0.5">
        <div>
          <div className="truncate font-semibold text-sm md:text-base">{podcast.title}</div>
          <div className="truncate text-xs text-muted-foreground mt-0.5">{podcast.creator}</div>
        </div>
        
        <div className="mt-2 md:mt-3">
          {/* Desktop progress bar */}
          <div className="hidden md:block h-1 w-full overflow-hidden rounded-full bg-white/20">
            <div className="h-full rounded-full bg-gradient-primary transition-all" style={{ width: `${displayPct}%` }} />
          </div>
          <div className="text-[10px] text-muted-foreground mt-1 font-medium">
            {displayPct}% listened
          </div>
        </div>
      </div>

      {/* Desktop Play/Pause trigger */}
      <div
        className={cn(
          "hidden md:grid h-10 w-10 place-items-center rounded-full bg-gradient-primary shadow-glow transition shrink-0",
          isCurrent ? "opacity-100" : "opacity-0 group-hover:opacity-100"
        )}
      >
        {isCurrentPlaying ? (
          <Pause className="h-4 w-4 fill-white text-white" />
        ) : (
          <Play className="h-4 w-4 fill-white text-white pl-0.5" />
        )}
      </div>
    </button>
  );
}
