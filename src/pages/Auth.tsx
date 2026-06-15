import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ParticleField } from "@/components/ParticleField";
import { Logo } from "@/components/Logo";
import { Headphones, Mic, Sparkles } from "lucide-react";
import { toast } from "sonner";
import type { Role } from "@/lib/types";
import { cn } from "@/lib/utils";

const Auth = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { user, login, signup } = useAuth();

  useEffect(() => {
    if (user) {
      navigate(user.role === "creator" ? "/studio" : "/app", { replace: true });
    }
  }, [user, navigate]);

  const [mode, setMode] = useState<"login" | "signup">((params.get("mode") as "login" | "signup") || "login");
  const [role, setRole] = useState<Role>((params.get("role") as Role) || "listener");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = mode === "login" ? await login(email, password) : await signup(name, email, password, role);
    setLoading(false);
    if (!res.ok) {
      toast.error(res.error || "Something went wrong");
      return;
    }
    toast.success(mode === "login" ? "Welcome back!" : "Account created");
    const stored = localStorage.getItem("podify_user");
    const u = stored ? JSON.parse(stored) : null;
    navigate(u?.role === "creator" ? "/studio" : "/app");
  };

  return (
    <div className="relative h-screen max-h-screen overflow-hidden bg-background">
      <ParticleField density={0.1} />
      <div className="pointer-events-none absolute inset-0 bg-gradient-radial opacity-70" />

      <div className="relative grid h-full lg:grid-cols-2 overflow-hidden">
        {/* Left visual */}
        <div className="relative hidden h-full flex-col justify-between p-12 lg:flex">
          <Logo />
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs text-primary-glow">
              <Sparkles className="h-3.5 w-3.5" /> Welcome to Podify
            </div>
            <h1 className="font-display text-5xl font-bold leading-tight">
              Tune in to the<br /><span className="text-gradient">future of audio.</span>
            </h1>
            <p className="max-w-md text-muted-foreground">
              Sign in to access your dashboard, AI Copilot and the Multi-Agent Podcast Studio.
            </p>

            <div className="grid grid-cols-2 gap-3 pt-4">
              {[
                { icon: Headphones, label: "Personalised feed" },
                { icon: Mic, label: "AI Creator Studio" },
              ].map((f) => (
                <div key={f.label} className="flex items-center gap-3 rounded-2xl glass p-4">
                  <f.icon className="h-5 w-5 text-primary-glow" />
                  <span className="text-sm">{f.label}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="text-xs text-muted-foreground">
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
          </div>
        </div>

        {/* Right form */}
        <div className="relative flex h-full items-center justify-center px-6 py-6 overflow-hidden">
          <div className="w-full max-w-md">
            <div className="lg:hidden mb-4 flex justify-center">
              <Logo />
            </div>

            <div className="rounded-3xl glass-strong p-6 shadow-elegant">
              <div className="mb-4 grid grid-cols-2 gap-1 rounded-xl bg-muted/30 p-1 text-sm">
                {(["login", "signup"] as const).map((m) => (
                  <button
                    key={m}
                    onClick={() => setMode(m)}
                    className={cn(
                      "rounded-lg py-2 font-medium transition capitalize",
                      mode === m ? "bg-gradient-primary text-white shadow-glow" : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {m === "login" ? "Log in" : "Sign up"}
                  </button>
                ))}
              </div>

              <h2 className="font-display text-2xl font-bold">
                {mode === "login" ? "Welcome back." : "Create your account."}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {mode === "login" ? "Enter your details to continue." : "Pick a role to get started."}
              </p>

              {mode === "signup" && (
                <div className="mt-4 grid grid-cols-2 gap-3">
                  {([
                    { id: "listener", label: "Listener", icon: Headphones, desc: "Discover & enjoy" },
                    { id: "creator", label: "Creator", icon: Mic, desc: "Publish with AI" },
                  ] as const).map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => setRole(r.id)}
                      className={cn(
                        "flex flex-col items-start gap-1 rounded-2xl border p-3 text-left transition",
                        role === r.id
                          ? "border-primary/60 bg-primary/10 shadow-glow"
                          : "border-border/60 hover:border-primary/30",
                      )}
                    >
                      <r.icon className={cn("h-4 w-4", role === r.id ? "text-primary-glow" : "text-muted-foreground")} />
                      <span className="font-semibold text-sm">{r.label}</span>
                      <span className="text-xs text-muted-foreground">{r.desc}</span>
                    </button>
                  ))}
                </div>
              )}

              <form onSubmit={submit} className="mt-4 space-y-3">
                {mode === "signup" && (
                  <div className="space-y-1">
                    <Label htmlFor="name">Name</Label>
                    <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" className="h-9" />
                  </div>
                )}
                <div className="space-y-1">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@studio.com" className="h-9" />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="password">Password</Label>
                  <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="h-9" />
                </div>

                <Button type="submit" disabled={loading} className="h-10 w-full bg-gradient-primary text-base font-semibold shadow-glow hover:opacity-90">
                  {loading ? "Please wait…" : mode === "login" ? "Log in" : "Create account"}
                </Button>

                {mode === "login" && (
                  <button
                    type="button"
                    onClick={() => { setEmail("demo@gmail.com"); setPassword("DEMO@123"); }}
                    className="w-full rounded-lg border border-primary/30 bg-primary/5 px-3 py-1.5 text-xs text-primary-glow hover:bg-primary/10"
                  >
                    Use demo account · demo@gmail.com / DEMO@123
                  </button>
                )}
              </form>

              <div className="mt-4 text-center text-sm text-muted-foreground">
                {mode === "login" ? (
                  <>
                    Don't have an account?{" "}
                    <button type="button" onClick={() => setMode("signup")} className="font-semibold text-primary-glow hover:underline">
                      Sign Up
                    </button>
                  </>
                ) : (
                  <>
                    Already have an account?{" "}
                    <button type="button" onClick={() => setMode("login")} className="font-semibold text-primary-glow hover:underline">
                      Log In
                    </button>
                  </>
                )}
              </div>

              <div className="mt-3 text-center text-xs text-muted-foreground">
                <Link to="/" className="hover:text-foreground">← Back to home</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
