import { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { cn } from "@/lib/utils";
import { Mic, Upload, Sparkles, Bot, BarChart3, FileText } from "lucide-react";

const tabs = [
  { to: "/studio", label: "Episodes", icon: Mic, end: true },
  { to: "/studio/upload", label: "Upload", icon: Upload },
  { to: "/studio/copilot", label: "AI Copilot", icon: Sparkles },
  { to: "/studio/multi-agent", label: "Multi-Agent", icon: Bot },
  { to: "/studio/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/studio/drafts", label: "Drafts", icon: FileText },
];

export function StudioLayout({ children, title, subtitle }: { children: ReactNode; title: string; subtitle?: string }) {
  const { pathname } = useLocation();
  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <div className="text-xs uppercase tracking-widest text-primary-glow">Creator Studio</div>
          <h1 className="font-display text-3xl font-bold md:text-4xl">{title}</h1>
          {subtitle && <p className="mt-1 text-muted-foreground">{subtitle}</p>}
        </div>

        <div className="flex flex-wrap gap-1 rounded-2xl glass p-1">
          {tabs.map((t) => {
            const active = t.end ? pathname === t.to : pathname.startsWith(t.to);
            const handleClick = () => {
              if (active) {
                window.scrollTo({ top: 0, behavior: "smooth" });
              }
            };
            return (
              <Link
                key={t.to}
                to={t.to}
                onClick={handleClick}
                className={cn(
                  "inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition",
                  active ? "bg-gradient-primary text-white shadow-glow" : "text-muted-foreground hover:bg-card hover:text-foreground",
                )}
              >
                <t.icon className="h-4 w-4" />
                {t.label}
              </Link>
            );
          })}
        </div>

        <div>{children}</div>
      </div>
    </AppLayout>
  );
}
