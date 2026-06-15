import { StudioLayout } from "@/components/StudioLayout";
import { PODCASTS, formatPlays } from "@/lib/mock-data";
import { TrendingUp, Users, Headphones, Star } from "lucide-react";

export default function Analytics() {
  const stats = [
    { label: "Total plays", value: "1.2M", change: "+18%", icon: Headphones, gradient: "from-purple-500 to-fuchsia-500" },
    { label: "Followers", value: "24.8K", change: "+312", icon: Users, gradient: "from-blue-500 to-cyan-500" },
    { label: "Retention", value: "78%", change: "+4%", icon: TrendingUp, gradient: "from-emerald-500 to-teal-500" },
    { label: "Avg. rating", value: "4.8", change: "+0.2", icon: Star, gradient: "from-amber-500 to-rose-500" },
  ];

  const top = PODCASTS.slice(0, 5);
  const points = Array.from({ length: 30 }, (_, i) => 30 + Math.sin(i / 3) * 15 + Math.random() * 25);
  const max = Math.max(...points);

  return (
    <StudioLayout title="Analytics" subtitle="See how your audience is engaging with your shows.">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="relative overflow-hidden rounded-2xl glass p-5 card-hover">
            <div className={`pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gradient-to-br ${s.gradient} opacity-20 blur-2xl`} />
            <s.icon className="h-5 w-5 text-primary-glow" />
            <div className="mt-3 text-xs text-muted-foreground">{s.label}</div>
            <div className="mt-1 font-display text-3xl font-bold">{s.value}</div>
            <div className="mt-1 text-xs text-emerald-400">{s.change} this month</div>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl glass p-6 lg:col-span-2">
          <h3 className="font-display text-lg font-semibold">Listener retention · last 30 days</h3>
          <svg viewBox="0 0 600 200" className="mt-4 h-48 w-full">
            <defs>
              <linearGradient id="grad" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="hsl(270 95% 65%)" stopOpacity="0.6" />
                <stop offset="100%" stopColor="hsl(270 95% 65%)" stopOpacity="0" />
              </linearGradient>
              <linearGradient id="line" x1="0" x2="1" y1="0" y2="0">
                <stop offset="0%" stopColor="hsl(270 95% 65%)" />
                <stop offset="100%" stopColor="hsl(200 100% 60%)" />
              </linearGradient>
            </defs>
            {(() => {
              const path = points.map((p, i) => `${(i / (points.length - 1)) * 600},${200 - (p / max) * 180}`).join(" L");
              return (
                <>
                  <path d={`M0,200 L${path} L600,200 Z`} fill="url(#grad)" />
                  <path d={`M${path}`} stroke="url(#line)" strokeWidth="2.5" fill="none" />
                </>
              );
            })()}
          </svg>
        </div>

        <div className="rounded-2xl glass p-6">
          <h3 className="font-display text-lg font-semibold">Top episodes</h3>
          <div className="mt-4 space-y-3">
            {top.map((p, i) => (
              <div key={p.id} className="flex items-center gap-3">
                <div className="font-display text-xl font-bold text-muted-foreground">{i + 1}</div>
                <img src={p.cover} alt="" className="h-10 w-10 rounded-lg object-cover" />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium">{p.title}</div>
                  <div className="text-xs text-muted-foreground">{formatPlays(p.plays)} plays</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </StudioLayout>
  );
}
