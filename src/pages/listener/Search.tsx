import { useMemo, useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { CATEGORIES } from "@/lib/mock-data";
import { useCatalog } from "@/contexts/CatalogContext";
import { PodcastCard } from "@/components/PodcastCard";
import { Search, X } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { SmartImage } from "@/components/SmartImage";

export default function SearchPage() {
  const [params, setParams] = useSearchParams();
  const [q, setQ] = useState(params.get("q") || "");
  const [activeCat, setActiveCat] = useState<string | null>(null);
  const { podcasts, creators } = useCatalog();

  const lower = q.toLowerCase().trim();

  const results = useMemo(() => {
    return podcasts.filter((p) => {
      const matchesQ =
        !lower ||
        p.title.toLowerCase().includes(lower) ||
        p.creator.toLowerCase().includes(lower) ||
        p.tags.some((t) => t.toLowerCase().includes(lower)) ||
        p.language.toLowerCase().includes(lower);
      const matchesCat = !activeCat || p.category.toLowerCase() === activeCat.toLowerCase();
      return matchesQ && matchesCat;
    });
  }, [lower, activeCat, podcasts]);

  const suggestions = useMemo(() => (lower ? podcasts.filter((p) => p.title.toLowerCase().includes(lower)).slice(0, 5) : []), [lower, podcasts]);

  return (
    <AppLayout>
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setParams(e.target.value ? { q: e.target.value } : {});
            }}
            placeholder="Search podcasts, creators, topics, tags or languages…"
            className="h-14 w-full rounded-2xl border border-border/60 bg-card/60 pl-12 pr-12 text-base outline-none transition focus:border-primary/60 focus:shadow-glow"
            autoFocus
          />
          {q && (
            <button onClick={() => setQ("")} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              <X className="h-5 w-5" />
            </button>
          )}
          {suggestions.length > 0 && (
            <div className="absolute left-0 right-0 top-full z-20 mt-2 rounded-2xl glass-strong p-2 shadow-elegant">
              {suggestions.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setQ(s.title)}
                  className="flex w-full items-center gap-3 rounded-xl p-2 text-left hover:bg-primary/10"
                >
                  <SmartImage src={s.cover} alt="" fallbackLabel={s.creator} className="h-9 w-9 rounded-lg object-cover" />
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium">{s.title}</div>
                    <div className="truncate text-xs text-muted-foreground">{s.creator}</div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {!q && (
          <>
            <div>
              <h3 className="mb-3 font-display text-lg font-semibold">Browse categories</h3>
              <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                {CATEGORIES.map((c) => (
                  <Link
                    key={c.id}
                    to={`/app/discover?cat=${c.id}`}
                    className={`group relative h-28 overflow-hidden rounded-2xl bg-gradient-to-br ${c.color} p-5 text-left card-hover`}
                  >
                    <div className="text-3xl">{c.icon}</div>
                    <div className="absolute bottom-3 left-5 font-display text-lg font-bold">{c.name}</div>
                    <div className="pointer-events-none absolute -bottom-6 -right-6 h-24 w-24 rounded-full bg-white/10 blur-xl" />
                  </Link>
                ))}
              </div>
            </div>

            <div>
              <h3 className="mb-3 font-display text-lg font-semibold">Top creators</h3>
              <div className="flex flex-wrap gap-3">
                {creators.map((c) => (
                  <Link key={c.id} to={`/creator/${c.id}`} className="flex items-center gap-3 rounded-full border border-border/60 bg-card/40 py-1.5 pl-1.5 pr-4 hover:border-primary/40">
                    <SmartImage src={c.avatar} alt="" fallbackLabel={c.name} fallbackVariant="round" className="h-8 w-8 rounded-full object-cover" />
                    <span className="text-sm font-medium">{c.name}</span>
                  </Link>
                ))}
              </div>
            </div>
          </>
        )}

        {(q || activeCat) && (
          <div>
            <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
              <span>{results.length} results</span>
              {activeCat && (
                <button onClick={() => setActiveCat(null)} className="rounded-full bg-primary/10 px-3 py-0.5 text-xs text-primary-glow">
                  {activeCat} ✕
                </button>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
              {results.map((p) => (
                <PodcastCard key={p.id} podcast={p} queue={results} />
              ))}
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
