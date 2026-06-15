import { AppLayout } from "@/components/AppLayout";
import { CATEGORIES } from "@/lib/mock-data";
import { useCatalog } from "@/contexts/CatalogContext";
import { PodcastCard } from "@/components/PodcastCard";
import { useSearchParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

export default function Discover() {
  const [params] = useSearchParams();
  const [active, setActive] = useState<string | null>(params.get("cat") || null);
  const { podcasts } = useCatalog();

  useEffect(() => {
    setActive(params.get("cat") || null);
  }, [params]);

  const list = active ? podcasts.filter((p) => p.category.toLowerCase() === active.toLowerCase() || CATEGORIES.find((c) => c.id === active)?.name === p.category) : podcasts;

  return (
    <AppLayout>
      <div className="space-y-8">
        <div>
          <div className="text-xs uppercase tracking-widest text-primary-glow">Discover</div>
          <h1 className="font-display text-3xl font-bold md:text-4xl">Find your next obsession.</h1>
        </div>

        <div className="flex flex-wrap gap-2">
          <Pill label="All" active={!active} onClick={() => setActive(null)} />
          {CATEGORIES.map((c) => (
            <Pill key={c.id} label={c.name} active={active === c.id || active === c.name} onClick={() => setActive(c.id)} />
          ))}
        </div>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
          {list.map((p) => (
            <PodcastCard key={p.id} podcast={p} queue={list} />
          ))}
        </div>
      </div>
    </AppLayout>
  );
}

function Pill({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "rounded-full px-4 py-1.5 text-sm transition",
        active ? "bg-gradient-primary text-white shadow-glow" : "bg-card/60 text-muted-foreground hover:text-foreground",
      )}
    >
      {label}
    </button>
  );
}
