import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { useAuth } from "@/contexts/AuthContext";

import { usePlaylists } from "@/contexts/PlaylistContext";
import { useFollow } from "@/contexts/FollowContext";
import { useCatalog } from "@/contexts/CatalogContext";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { toast } from "sonner";
import { Crown, LogOut, RotateCcw, KeyRound, Bell, Trash2, Shield, Mic } from "lucide-react";
import { SmartImage } from "@/components/SmartImage";

export default function Settings() {
  const { user, logout, switchRole } = useAuth();
  const { playlists } = usePlaylists();
  const { following } = useFollow();
  const { creators } = useCatalog();
  const navigate = useNavigate();

  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [birthday, setBirthday] = useState("");
  const [avatar, setAvatar] = useState(user?.avatar || "");

  if (!user) return null;

  const followedCreators = creators.filter((c) => following.has(c.id));

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <div className="text-xs uppercase tracking-widest text-primary-glow">Account</div>
          <h1 className="font-display text-3xl font-bold md:text-4xl">Settings</h1>
        </div>

        <Tabs defaultValue="account">
          <TabsList className="bg-card/60">
            <TabsTrigger value="account">Account</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="support">Support</TabsTrigger>
          </TabsList>

          {/* ---------------- ACCOUNT ---------------- */}
          <TabsContent value="account" className="mt-6 space-y-4">
            <Section title="Switch role">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="font-medium">Currently: <span className="capitalize text-primary-glow">{user.role}</span></div>
                  <div className="text-xs text-muted-foreground">Listeners can become Creators anytime to publish episodes with the AI Studio.</div>
                </div>
                {user.role === "listener" ? (
                  <Button onClick={() => { switchRole("creator"); toast.success("You're now a Creator. Open Creator Studio."); }}>
                    <Mic className="mr-2 h-4 w-4" /> Become a Creator
                  </Button>
                ) : (
                  <Button variant="outline" onClick={() => { switchRole("listener"); toast.success("Switched back to Listener"); }}>
                    Switch to Listener
                  </Button>
                )}
              </div>
            </Section>

            <Section title="Recover playlists">
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">Restore deleted playlists from the past 90 days.</div>
                <Button variant="outline" onClick={() => toast("No deleted playlists in the last 90 days.")}>
                  <RotateCcw className="mr-2 h-4 w-4" /> Recover
                </Button>
              </div>
            </Section>

            <Section title="Change password">
              <div className="grid gap-3 md:grid-cols-3">
                <Input type="password" placeholder="Current password" />
                <Input type="password" placeholder="New password" />
                <Input type="password" placeholder="Confirm new password" />
              </div>
              <Button className="mt-3 bg-gradient-primary shadow-glow" onClick={() => toast.success("Password updated")}>
                <KeyRound className="mr-2 h-4 w-4" /> Update password
              </Button>
            </Section>

            <Section title="Notifications">
              <div className="space-y-3">
                {[
                  { id: "n1", label: "New episodes from creators you follow" },
                  { id: "n2", label: "Personalized recommendations" },
                  { id: "n3", label: "Marketing emails" },
                  { id: "n4", label: "Push notifications" },
                ].map((n) => (
                  <div key={n.id} className="flex items-center justify-between rounded-xl border border-border/40 bg-background/40 px-4 py-3">
                    <div className="flex items-center gap-2 text-sm"><Bell className="h-4 w-4 text-muted-foreground" /> {n.label}</div>
                    <Switch defaultChecked={n.id !== "n3"} />
                  </div>
                ))}
              </div>
            </Section>

            <Section title="Sessions">
              <Button variant="outline" onClick={() => toast.success("Signed out from all other devices")}>
                <Shield className="mr-2 h-4 w-4" /> Sign out everywhere
              </Button>
            </Section>

            <Section title="Danger zone" tone="danger">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="text-sm text-muted-foreground">Permanently delete your account and all your data.</div>
                <Button variant="destructive" onClick={() => toast("Contact support to close your account.")}>
                  <Trash2 className="mr-2 h-4 w-4" /> Close account
                </Button>
              </div>
            </Section>

            <div className="flex justify-end">
              <Button variant="ghost" onClick={() => { logout(); navigate("/"); }}>
                <LogOut className="mr-2 h-4 w-4" /> Log out
              </Button>
            </div>
          </TabsContent>

          {/* ---------------- PROFILE ---------------- */}
          <TabsContent value="profile" className="mt-6 space-y-4">
            <Section title="Profile photo">
              <div className="flex items-center gap-4">
                <SmartImage src={avatar} alt={name} fallbackLabel={name} fallbackVariant="round" className="h-20 w-20 rounded-full border-2 border-primary/40 object-cover" />
                <div className="flex-1">
                  <Label>Image URL</Label>
                  <Input value={avatar} onChange={(e) => setAvatar(e.target.value)} placeholder="https://…" />
                </div>
              </div>
            </Section>

            <Section title="Personal info">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-1.5">
                  <Label>Name</Label>
                  <Input value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label>Email</Label>
                  <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label>Birthday (optional)</Label>
                  <Input type="date" value={birthday} onChange={(e) => setBirthday(e.target.value)} />
                </div>
              </div>
              <Button className="mt-4 bg-gradient-primary shadow-glow" onClick={() => toast.success("Profile updated")}>Save changes</Button>
            </Section>

            <Section title="Your stats">
              <div className="grid gap-3 md:grid-cols-4">
                <Stat label="Followers" value={(user.followers ?? 0).toLocaleString()} />
                <Stat label="Following" value={following.size.toString()} />
                <Stat label="Playlists" value={playlists.length.toString()} />
                <Stat label="Top creators" value={followedCreators.length.toString()} />
              </div>
            </Section>

            {followedCreators.length > 0 && (
              <Section title="Top creators you follow">
                <div className="flex flex-wrap gap-3">
                  {followedCreators.slice(0, 8).map((c) => (
                    <div key={c.id} className="flex items-center gap-2 rounded-full border border-border/60 bg-card/40 py-1 pl-1 pr-3">
                      <SmartImage src={c.avatar} alt="" fallbackLabel={c.name} fallbackVariant="round" className="h-7 w-7 rounded-full object-cover" />
                      <span className="text-sm">{c.name}</span>
                    </div>
                  ))}
                </div>
              </Section>
            )}
          </TabsContent>

          {/* ---------------- SUPPORT ---------------- */}
          <TabsContent value="support" className="mt-6 space-y-4">
            <Section title="Frequently asked">
              <Accordion type="single" collapsible className="w-full">
                {FAQ.map((f, i) => (
                  <AccordionItem key={i} value={`f-${i}`}>
                    <AccordionTrigger className="text-left">{f.q}</AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">{f.a}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </Section>

            <Section title="Still need help?">
              <p className="text-sm text-muted-foreground">Email us at <a className="text-primary-glow hover:underline" href="mailto:hello@podify.app">hello@podify.app</a> and we'll get back to you within 24 hours.</p>
            </Section>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}

function Section({ title, children, tone }: { title: string; children: React.ReactNode; tone?: "danger" }) {
  return (
    <div className={`rounded-2xl border ${tone === "danger" ? "border-destructive/30 bg-destructive/5" : "border-border/60 bg-card/40"} p-5`}>
      <div className="mb-3 font-display text-lg font-semibold">{title}</div>
      {children}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border/60 bg-background/40 p-4">
      <div className="text-xs uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className="mt-1 font-display text-2xl font-bold">{value}</div>
    </div>
  );
}

const FAQ = [
  { q: "How do I cancel my subscription?", a: "Go to Settings → Account → Current plan → Manage / Upgrade. You can cancel any time and keep premium features until the end of your billing period." },
  { q: "Can I download episodes for offline listening?", a: "Yes — download is available on Plus, Pro and Ultimate plans. Tap the download icon on any episode page." },
  { q: "How do I switch from Listener to Creator?", a: "Open Settings → Account → Switch role → Become a Creator. Creator Studio will then appear in the sidebar and the menu." },
  { q: "What's the difference between Audio and Video mode?", a: "Audio mode plays the soundtrack of an episode in the background. Video mode pops up a floating player so you can watch the original recording." },
  { q: "Where is my listening progress saved?", a: "Progress is saved locally in your browser per episode, so picking up where you left off works automatically." },
  { q: "Is Podify free?", a: "Yes — you can listen for free forever. Upgrade for ad-free playback, downloads and AI features." },
];
