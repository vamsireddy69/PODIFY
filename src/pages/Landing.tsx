import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { ArrowRight, Sparkles, Mic, Bot, PlayCircle, Wand2, Headphones, Star, X, Check } from "lucide-react";
import { ParticleField } from "@/components/ParticleField";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { PODCASTS, CREATORS } from "@/lib/mock-data";
import { PodcastCard } from "@/components/PodcastCard";
import { Dialog, DialogContent } from "@/components/ui/dialog";

interface Feature {
  icon: typeof Wand2;
  title: string;
  desc: string;
  gradient: string;
  long: string;
  bullets: string[];
}

const FEATURES: Feature[] = [
  {
    icon: Wand2,
    title: "AI Podcast Generator",
    desc: "Multi-agent system that writes, voices, and edits a full episode from a single prompt.",
    gradient: "from-purple-500/30 to-fuchsia-500/10",
    long: "Describe a topic in one line and our multi-agent studio researches it, outlines an episode, writes the full script, casts AI voices for your hosts and guests, and exports a polished, broadcast-ready podcast — usually in under 5 minutes.",
    bullets: [
      "Research, scripting, voicing & mixing — fully automated",
      "Pick from 30+ ultra-realistic AI voices",
      "Multi-host conversations with natural turn-taking",
      "Auto chapters, summaries and SEO tags",
    ],
  },
  {
    icon: Mic,
    title: "Creator Studio",
    desc: "Upload, edit, and publish with AI copilot for titles, summaries, chapters and SEO tags.",
    gradient: "from-blue-500/30 to-cyan-500/10",
    long: "A modern, distraction-free editor for creators. Upload raw recordings, let the AI Copilot suggest titles, write descriptions, generate chapters and translate transcripts. Publish to Podify and syndicate everywhere with one click.",
    bullets: [
      "Smart title & description suggestions",
      "Auto-generated chapters & timestamps",
      "Multi-language transcripts",
      "One-click distribution",
    ],
  },
  {
    icon: Sparkles,
    title: "Smart Recommendations",
    desc: "A personalised feed that learns your taste across topics, hosts, languages and moods.",
    gradient: "from-pink-500/30 to-rose-500/10",
    long: "Podify learns from every play, like and skip. Your home feed surfaces shows you'll actually love — across topics, hosts, languages and even moods like 'focus' or 'late-night thinking'.",
    bullets: [
      "Mood-aware playlists",
      "Cross-language discovery",
      "Daily personalised mix",
      "Follow creators, never miss a drop",
    ],
  },
];

const Landing = () => {
  const navigate = useNavigate();
  const [openFeature, setOpenFeature] = useState<Feature | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      navigate(user.role === "creator" ? "/studio" : "/app", { replace: true });
    }
  }, [user, navigate]);

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-background text-foreground">
      {/* Fixed Nav */}
      <header className="fixed top-0 left-0 right-0 z-40 border-b border-border/40 bg-background/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Logo />
          <nav className="hidden items-center gap-8 text-sm text-muted-foreground md:flex">
            <a href="#features" className="hover:text-foreground transition">
              Features
            </a>
            <a href="#trending" className="hover:text-foreground transition">
              Trending
            </a>
            <a href="#creators" className="hover:text-foreground transition">
              Creators
            </a>
            <a href="#pricing" className="hover:text-foreground transition">
              Pricing
            </a>
          </nav>
          <div className="flex items-center gap-3">
            {user ? (
              <Button asChild className="bg-gradient-primary shadow-glow hover:opacity-90">
                <Link to={user.role === "creator" ? "/studio" : "/app"}>Go to App</Link>
              </Button>
            ) : (
              <>
                <Link
                  to="/auth?mode=login"
                  className="hidden text-sm text-muted-foreground hover:text-foreground md:inline"
                >
                  Log in
                </Link>
                <Button asChild className="bg-gradient-primary shadow-glow hover:opacity-90">
                  <Link to="/auth?mode=signup&role=listener">Get Started</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="relative isolate overflow-hidden">
        <ParticleField className="opacity-80" density={0.12} />
        <div className="pointer-events-none absolute inset-0 bg-gradient-radial" />
        <div className="pointer-events-none absolute left-1/2 top-0 h-[600px] w-[1000px] -translate-x-1/2 rounded-full bg-primary/15 blur-[160px]" />

        <div className="relative mx-auto max-w-6xl px-6 pt-36 pb-32 text-center">
          <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-medium text-primary-glow animate-fade-in">
            <Sparkles className="h-3.5 w-3.5" />
            Multi-Agent AI Podcast Studio · Now in beta
          </div>

          <h1 className="mt-8 font-display text-5xl font-bold leading-[1.05] tracking-tight md:text-7xl lg:text-8xl animate-slide-up">
            Create. Listen.
            <br />
            <span className="text-gradient">Automate Podcasts</span>
            <br />
            with AI.
          </h1>

          <p
            className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground animate-slide-up"
            style={{ animationDelay: "0.15s" }}
          >
            Podify is the all-in-one AI studio to script, voice, and publish full-length podcast episodes in minutes —
            and a Spotify-grade player to listen to the best of them.
          </p>

          <div
            className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row animate-slide-up"
            style={{ animationDelay: "0.3s" }}
          >
            <Button
              asChild
              size="lg"
              className="h-12 bg-gradient-primary px-7 text-base font-semibold shadow-glow hover:opacity-90"
            >
              <Link to={user ? "/app" : "/auth?mode=signup&role=listener"}>
                <Headphones className="mr-2 h-5 w-5" />
                Start Listening
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="h-12 border-primary/30 bg-card/40 px-7 text-base hover:bg-card hover:text-primary-glow"
            >
              <Link to={user ? "/studio" : "/auth?mode=signup&role=creator"}>
                <Mic className="mr-2 h-5 w-5" />
                Become a Creator
              </Link>
            </Button>
          </div>

          {/* Floating preview */}
          <div className="relative mx-auto mt-20 max-w-4xl animate-slide-up" style={{ animationDelay: "0.45s" }}>
            <div className="relative rounded-3xl border border-border/60 bg-card/40 p-2 shadow-elegant backdrop-blur-xl">
              <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-card via-card to-background p-6">
                <div className="flex items-center gap-4">
                  <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-gradient-primary shadow-glow animate-pulse-glow">
                    <Bot className="h-7 w-7 text-white" />
                  </div>
                  <div className="flex-1 text-left">
                    <div className="text-xs uppercase tracking-widest text-primary-glow">AI Multi-Agent Studio</div>
                    <div className="mt-1 font-display text-lg">
                      Generating: "The Future of Indie Music in an AI World"
                    </div>
                  </div>
                  <div className="flex items-end gap-1">
                    {[0, 0.1, 0.2, 0.3, 0.4, 0.5].map((d, i) => (
                      <span
                        key={i}
                        className="w-1 rounded-full bg-gradient-primary animate-wave"
                        style={{ animationDelay: `${d}s`, height: `${20 + (i % 3) * 10}px` }}
                      />
                    ))}
                  </div>
                </div>
                <div className="mt-6 grid grid-cols-3 gap-3 text-xs">
                  {[
                    { l: "Script", v: "Generated" },
                    { l: "Voices", v: "3 Hosts" },
                    { l: "Duration", v: "23:14" },
                  ].map((x) => (
                    <div key={x.l} className="rounded-xl border border-border/60 bg-background/40 p-3">
                      <div className="text-muted-foreground">{x.l}</div>
                      <div className="mt-1 font-semibold">{x.v}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="relative mx-auto max-w-6xl px-6 py-24 scroll-mt-20">
        <div className="mb-14 text-center">
          <div className="text-xs uppercase tracking-widest text-primary-glow">Why Podify</div>
          <h2 className="mt-3 font-display text-4xl font-bold md:text-5xl">An AI studio behind every great show.</h2>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {FEATURES.map((f) => (
            <button
              key={f.title}
              onClick={() => setOpenFeature(f)}
              className={`group relative overflow-hidden rounded-3xl border border-border/60 bg-gradient-to-br ${f.gradient} p-8 text-left backdrop-blur-xl transition hover:border-primary/40 card-hover`}
            >
              <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-primary/20 blur-3xl transition group-hover:bg-primary/40" />
              <f.icon className="h-9 w-9 text-primary-glow" />
              <h3 className="mt-6 font-display text-2xl font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
              <div className="mt-6 inline-flex items-center gap-1 text-sm text-primary-glow opacity-90">
                Explore <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* TRENDING — landing variant: no playing animation, all CTAs route to login */}
      <section id="trending" className="relative mx-auto max-w-7xl px-6 py-16 scroll-mt-20">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <div className="text-xs uppercase tracking-widest text-primary-glow">Trending now</div>
            <h2 className="mt-2 font-display text-3xl font-bold md:text-4xl">The world's listening.</h2>
          </div>
          <Link
            to="/auth?mode=login"
            className="hidden text-sm text-muted-foreground hover:text-foreground md:inline-flex items-center gap-1"
          >
            See all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
          {PODCASTS.slice(0, 6).map((p) => (
            <PodcastCard key={p.id} podcast={p} queue={PODCASTS} variant="landing" />
          ))}
        </div>
      </section>

      {/* CREATORS — slow marquee, hover pause */}
      <section id="creators" className="relative overflow-hidden py-20 scroll-mt-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-10 text-center">
            <div className="text-xs uppercase tracking-widest text-primary-glow">Featured creators</div>
            <h2 className="mt-2 font-display text-3xl font-bold md:text-4xl">Voices shaping the future.</h2>
          </div>
        </div>
        <div className="group/marquee relative">
          <div className="flex w-max animate-marquee-slow gap-6 px-6 group-hover/marquee:[animation-play-state:paused]">
            {[...CREATORS, ...CREATORS].map((c, i) => (
              <div key={i} className="w-72 shrink-0 rounded-2xl glass p-6 card-hover">
                <div className="flex items-center gap-4">
                  <img
                    src={c.avatar}
                    alt=""
                    className="h-14 w-14 rounded-full border-2 border-primary/40 object-cover"
                  />
                  <div>
                    <div className="font-display text-lg font-semibold">{c.name}</div>
                    <div className="text-xs text-muted-foreground">{c.followers.toLocaleString()} followers</div>
                  </div>
                </div>
                <p className="mt-4 line-clamp-2 text-sm text-muted-foreground">{c.bio}</p>
                <div className="mt-4 flex items-center gap-1 text-xs text-amber-300">
                  {Array.from({ length: 5 }).map((_, n) => (
                    <Star key={n} className="h-3 w-3 fill-current" />
                  ))}
                  <span className="ml-1 text-muted-foreground">4.9</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section id="pricing" className="relative mx-auto max-w-5xl px-6 py-24 scroll-mt-20">
        <div className="relative overflow-hidden rounded-3xl border border-primary/30 bg-gradient-to-br from-primary/15 via-background to-secondary/15 p-12 text-center">
          <ParticleField density={0.05} interactive={false} />
          <div className="pointer-events-none absolute inset-0 bg-grid opacity-30" />
          <div className="relative">
            <h2 className="font-display text-4xl font-bold md:text-5xl">
              Your AI podcast studio is <span className="text-gradient">one click away.</span>
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
              Start free. Generate up to 5 episodes per month with the AI Multi-Agent Studio.
            </p>
            <Button
              asChild
              size="lg"
              className="mt-8 h-12 bg-gradient-primary px-8 text-base font-semibold shadow-glow"
            >
              <Link to={user ? (user.role === "creator" ? "/studio" : "/app") : "/auth?mode=signup&role=creator"}>
                <PlayCircle className="mr-2 h-5 w-5" />
                Launch Podify
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <footer className="border-t border-border/40 px-6 py-10 text-center text-sm text-muted-foreground">
        {new Date().getFullYear()} © Podify by{" "}
        <a
          href="https://koushalchintakayala.in/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 underline hover:text-blue-400 transition-colors"
        >
          Koushal Chintakayala
        </a>
        . All rights reserved.
      </footer>

      {/* FEATURE MODAL */}
      <Dialog open={!!openFeature} onOpenChange={(o) => !o && setOpenFeature(null)}>
        <DialogContent className="glass-strong max-w-3xl overflow-hidden p-0">
          {openFeature && (
            <div className="grid gap-0 md:grid-cols-2">
              <div className="space-y-4 p-8">
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-primary shadow-glow">
                  <openFeature.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-display text-2xl font-bold">{openFeature.title}</h3>
                <p className="text-sm text-muted-foreground">{openFeature.long}</p>
                <ul className="space-y-2 pt-1">
                  {openFeature.bullets.map((b) => (
                    <li key={b} className="flex items-start gap-2 text-sm">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary-glow" /> <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="relative bg-gradient-to-br from-primary/15 via-card/40 to-secondary/15 p-8">
                <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-primary/30 blur-3xl" />
                <div className="relative flex h-full flex-col justify-center">
                  <Sparkles className="h-7 w-7 text-primary-glow" />
                  <h4 className="mt-3 font-display text-xl font-bold leading-tight">
                    Start Listening with a free Podify account
                  </h4>
                  <p className="mt-2 text-sm text-muted-foreground">
                    No credit card. Cancel anytime. Your taste, automated.
                  </p>
                  <Button asChild className="mt-5 bg-gradient-primary shadow-glow">
                    <Link to="/auth?mode=signup&role=listener">Sign up free</Link>
                  </Button>
                  <Link
                    to="/auth?mode=login"
                    className="mt-3 text-center text-xs text-muted-foreground hover:text-foreground"
                  >
                    Already have an account? <span className="text-primary-glow">Log in</span>
                  </Link>
                </div>
              </div>
            </div>
          )}
          <div className="border-t border-border/40 bg-card/30 px-8 py-3 text-right">
            <Button variant="ghost" size="sm" onClick={() => setOpenFeature(null)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Landing;
