import { ReactNode } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Home,
  Search,
  Library,
  Mic,
  Upload,
  Sparkles,
  BarChart3,
  Settings as SettingsIcon,
  LogOut,
  Bot,
  Compass,
  Shield,
  Crown,
  Users,
  Menu,
} from "lucide-react";
import { Logo } from "./Logo";
import { useAuth } from "@/contexts/AuthContext";
import { GlobalPlayer } from "./GlobalPlayer";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { usePlayer } from "@/contexts/PlayerContext";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useState } from "react";

interface NavItem {
  to: string;
  label: string;
  icon: any;
}

const listenerNav: NavItem[] = [
  { to: "/app", label: "Home", icon: Home },
  { to: "/app/search", label: "Search", icon: Search },
  { to: "/app/library", label: "Library", icon: Library },
  { to: "/app/discover", label: "Discover", icon: Compass },
];

const creatorNav: NavItem[] = [
  { to: "/studio", label: "Episodes", icon: Mic },
  { to: "/studio/upload", label: "Upload", icon: Upload },
  { to: "/studio/copilot", label: "AI Copilot", icon: Sparkles },
  { to: "/studio/multi-agent", label: "Multi-Agent", icon: Bot },
  { to: "/studio/analytics", label: "Analytics", icon: BarChart3 },
];

export function AppLayout({ children }: { children: ReactNode }) {
  const { user, logout, switchRole } = useAuth();
  const { current } = usePlayer();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isStudio = location.pathname.startsWith("/studio");
  const isActive = (to: string) =>
    to === "/app" || to === "/studio" ? location.pathname === to : location.pathname.startsWith(to);

  const nav = isStudio ? creatorNav : listenerNav;

  const handleNavClick = (to: string) => {
    setMobileOpen(false);
    if (isActive(to)) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const Sidebar = (
    <>
      <div className="px-5 py-5">
        <Logo />
      </div>

      <nav className="mt-2 flex-1 space-y-0.5 px-3 overflow-y-auto">
        <div className="px-3 py-2 text-[10px] uppercase tracking-widest text-muted-foreground">
          {isStudio ? "Creator Studio" : "Listening"}
        </div>
        {nav.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            onClick={() => handleNavClick(item.to)}
            className={cn(
              "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition",
              isActive(item.to)
                ? "bg-gradient-primary text-white shadow-glow"
                : "text-muted-foreground hover:bg-sidebar-accent hover:text-foreground",
            )}
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </Link>
        ))}

        {/* Listener-only extras */}
        {!isStudio && (
          <>
            <Link
              to="/app/creators"
              onClick={() => handleNavClick("/app/creators")}
              className={cn(
                "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition",
                isActive("/app/creators")
                  ? "bg-gradient-primary text-white shadow-glow"
                  : "text-muted-foreground hover:bg-sidebar-accent hover:text-foreground",
              )}
            >
              <Users className="h-4 w-4" />
              Creators
            </Link>
            <Link
              to="/app/settings"
              onClick={() => handleNavClick("/app/settings")}
              className={cn(
                "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition",
                isActive("/app/settings")
                  ? "bg-gradient-primary text-white shadow-glow"
                  : "text-muted-foreground hover:bg-sidebar-accent hover:text-foreground",
              )}
            >
              <SettingsIcon className="h-4 w-4" />
              Settings
            </Link>
          </>
        )}

        {/* Creator-only quick switch back */}
        {user?.role === "creator" && !isStudio && (
          <Link
            to="/studio"
            onClick={() => setMobileOpen(false)}
            className="mt-4 flex items-center gap-3 rounded-xl border border-primary/30 bg-primary/10 px-3 py-2.5 text-sm text-primary-glow hover:bg-primary/20"
          >
            <Mic className="h-4 w-4" />
            Creator Studio
          </Link>
        )}
        {isStudio && (
          <Link
            to="/app"
            onClick={() => setMobileOpen(false)}
            className="mt-4 flex items-center gap-3 rounded-xl border border-secondary/30 bg-secondary/10 px-3 py-2.5 text-sm text-secondary hover:bg-secondary/20"
          >
            <Home className="h-4 w-4" />
            Back to Listening
          </Link>
        )}

        {user?.role === "admin" && (
          <Link
            to="/admin"
            onClick={() => setMobileOpen(false)}
            className="mt-2 flex items-center gap-3 rounded-xl border border-accent/30 bg-accent/10 px-3 py-2.5 text-sm text-accent hover:bg-accent/20"
          >
            <Shield className="h-4 w-4" />
            Admin Panel
          </Link>
        )}
      </nav>

    </>
  );

  return (
    <div className="h-screen w-full overflow-hidden bg-background text-foreground flex flex-col">
      <div className="flex flex-1 min-h-0 w-full">
        {/* Desktop Sidebar */}
        <aside className="hidden h-full w-64 shrink-0 flex-col border-r border-border/60 bg-sidebar/80 backdrop-blur-xl md:flex">
          {Sidebar}
        </aside>

        {/* Main */}
        <main className="min-w-0 flex-1 flex flex-col h-full overflow-hidden">
          {/* Top bar */}
          <header className="flex items-center justify-between gap-3 border-b border-border/40 bg-background/70 px-4 py-3 backdrop-blur-xl md:px-8 shrink-0">
            {/* Mobile hamburger */}
            <div className="flex items-center gap-2 md:hidden">
              <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
                <SheetTrigger asChild>
                  <button className="grid h-9 w-9 place-items-center rounded-full bg-card/60 text-muted-foreground hover:text-foreground" aria-label="Menu">
                    <Menu className="h-5 w-5" />
                  </button>
                </SheetTrigger>
                <SheetContent side="left" className="w-72 border-border/60 bg-sidebar/95 p-0">
                  <div className="flex h-full flex-col">{Sidebar}</div>
                </SheetContent>
              </Sheet>
              <Logo />
            </div>

            <div className="hidden items-center gap-2 md:flex">
              <button
                onClick={() => navigate(-1)}
                className="grid h-9 w-9 place-items-center rounded-full bg-card/60 text-muted-foreground hover:text-foreground"
                aria-label="Back"
              >
                ‹
              </button>
              <button
                onClick={() => navigate(1)}
                className="grid h-9 w-9 place-items-center rounded-full bg-card/60 text-muted-foreground hover:text-foreground"
                aria-label="Forward"
              >
                ›
              </button>
            </div>

            <div className="flex flex-1 items-center justify-end gap-3">
              <Link
                to="/app/search"
                className="hidden items-center gap-2 rounded-full bg-card/60 px-4 py-2 text-sm text-muted-foreground hover:text-foreground md:flex"
              >
                <Search className="h-4 w-4" />
                Search podcasts, creators, topics…
              </Link>


              {user && (
                <DropdownMenu>
                  <DropdownMenuTrigger className="flex items-center gap-2 rounded-full bg-card/60 p-1 pr-3 hover:bg-card">
                    <img src={user.avatar} alt="" className="h-8 w-8 rounded-full object-cover" />
                    <span className="hidden text-sm font-medium md:inline">{user.name}</span>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56 glass-strong">
                    <DropdownMenuLabel>
                      <div className="text-sm">{user.name}</div>
                      <div className="text-xs font-normal text-muted-foreground capitalize">{user.role}</div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {user.role === "creator" ? (
                      <DropdownMenuItem onClick={() => navigate("/studio")}>
                        <Mic className="mr-2 h-4 w-4" />
                        Creator Studio
                      </DropdownMenuItem>
                    ) : (
                      <DropdownMenuItem onClick={() => { switchRole("creator"); navigate("/studio"); }}>
                        <Mic className="mr-2 h-4 w-4" />
                        Become a Creator
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem onClick={() => navigate("/app/settings")}>
                      <SettingsIcon className="mr-2 h-4 w-4" />
                      Settings
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => { logout(); navigate("/"); }}>
                      <LogOut className="mr-2 h-4 w-4" />
                      Log out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </header>

          {/* Main content scroll container */}
          <div className={cn("flex-1 overflow-y-auto min-h-0 px-4 py-6 md:px-8 md:py-8", current ? "pb-36 md:pb-28" : "pb-24 md:pb-8")}>
            <div className="mx-auto max-w-6xl w-full">{children}</div>
          </div>

          {/* Mobile Bottom Navigation */}
          <nav className="flex justify-around border-t border-border/60 bg-sidebar/95 px-2 py-2 backdrop-blur md:hidden shrink-0">
            {nav.slice(0, 4).map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => handleNavClick(item.to)}
                className={cn(
                  "flex flex-col items-center gap-1 rounded-lg px-3 py-1.5 text-[10px]",
                  isActive(item.to) ? "text-primary" : "text-muted-foreground",
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </Link>
            ))}
          </nav>
        </main>
      </div>
    </div>
  );
}
