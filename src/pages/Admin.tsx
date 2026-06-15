import { AppLayout } from "@/components/AppLayout";
import { CATEGORIES, formatPlays } from "@/lib/mock-data";
import { useCatalog } from "@/contexts/CatalogContext";
import { Users, Mic, Tag, Flag, Star, Plus, Trash2, Youtube, Sparkles, Pencil, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { useState } from "react";
import { SmartImage } from "@/components/SmartImage";

const LANGUAGES = ["English", "Hindi", "Tamil", "Telugu", "Malayalam", "Kannada", "Spanish", "French"];

function extractYouTubeId(input: string): string {
  const trimmed = input.trim();
  if (/^[A-Za-z0-9_-]{6,15}$/.test(trimmed) && !trimmed.includes("/")) return trimmed;
  const short = trimmed.match(/youtu\.be\/([A-Za-z0-9_-]{6,})/);
  if (short) return short[1];
  const watch = trimmed.match(/[?&]v=([A-Za-z0-9_-]{6,})/);
  if (watch) return watch[1];
  const path = trimmed.match(/\/(embed|shorts|v)\/([A-Za-z0-9_-]{6,})/);
  if (path) return path[2];
  return "";
}

function extractChannelHandle(input: string): string {
  const trimmed = input.trim().replace(/^@/, "");
  const m = trimmed.match(/youtube\.com\/@([A-Za-z0-9._-]+)/);
  if (m) return m[1];
  if (!trimmed.includes("/") && !trimmed.includes(" ")) return trimmed;
  return "";
}

export default function Admin() {
  const {
    podcasts,
    creators,
    addPodcast,
    removePodcast,
    updatePodcast,
    removeCreator,
    updateCreator,
  } = useCatalog();

  const stats = [
    { label: "Total users", value: "48.2K", icon: Users },
    { label: "Creators in Database", value: creators.length.toLocaleString(), icon: Mic },
    { label: "Total Episodes", value: podcasts.length.toLocaleString(), icon: Star },
    { label: "Reports", value: "23", icon: Flag },
  ];

  // Search states
  const [podcastSearch, setPodcastSearch] = useState("");
  const [creatorSearch, setCreatorSearch] = useState("");

  // Add Podcast Form state
  const [form, setForm] = useState({
    title: "",
    creator: "",
    youtubeUrl: "",
    youtubeChannel: "",
    category: CATEGORIES[0].name,
    language: "English",
    tags: "",
    description: "",
    duration: "1800",
  });

  // Edit Podcast state
  const [editingPodcast, setEditingPodcast] = useState<any | null>(null);
  const [podcastEditForm, setPodcastEditForm] = useState({
    title: "",
    creator: "",
    category: "",
    language: "",
    plays: 0,
    description: "",
  });

  // Edit Creator state
  const [editingCreator, setEditingCreator] = useState<any | null>(null);
  const [creatorEditForm, setCreatorEditForm] = useState({
    name: "",
    bio: "",
    followers: 0,
    youtubeChannel: "",
  });

  const updateAddForm = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const submitAddForm = (e: React.FormEvent) => {
    e.preventDefault();
    const youtubeId = extractYouTubeId(form.youtubeUrl);
    if (!youtubeId) {
      toast.error("Couldn't read a YouTube video ID from that URL.");
      return;
    }
    if (!form.title.trim() || !form.creator.trim()) {
      toast.error("Title and creator are required.");
      return;
    }
    addPodcast({
      title: form.title,
      creator: form.creator,
      category: form.category,
      language: form.language,
      tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
      description: form.description || `${form.title} — by ${form.creator}.`,
      youtubeId,
      youtubeChannel: extractChannelHandle(form.youtubeChannel) || undefined,
      duration: Math.max(30, Number(form.duration) || 1800),
    });
    toast.success("Podcast added to the catalog");
    setForm({
      title: "",
      creator: "",
      youtubeUrl: "",
      youtubeChannel: "",
      category: form.category,
      language: form.language,
      tags: "",
      description: "",
      duration: "1800",
    });
  };

  const handleStartEditPodcast = (p: any) => {
    setEditingPodcast(p);
    setPodcastEditForm({
      title: p.title,
      creator: p.creator,
      category: p.category,
      language: p.language,
      plays: p.plays,
      description: p.description,
    });
  };

  const handleSavePodcastEdit = () => {
    if (!editingPodcast) return;
    updatePodcast(editingPodcast.id, {
      title: podcastEditForm.title.trim(),
      creator: podcastEditForm.creator.trim(),
      category: podcastEditForm.category,
      language: podcastEditForm.language,
      plays: Number(podcastEditForm.plays) || 0,
      description: podcastEditForm.description.trim(),
    });
    toast.success("Podcast updated successfully!");
    setEditingPodcast(null);
  };

  const handleStartEditCreator = (c: any) => {
    setEditingCreator(c);
    setCreatorEditForm({
      name: c.name,
      bio: c.bio || "",
      followers: c.followers || 0,
      youtubeChannel: c.youtubeChannel || "",
    });
  };

  const handleSaveCreatorEdit = () => {
    if (!editingCreator) return;
    const channelHandle = extractChannelHandle(creatorEditForm.youtubeChannel) || creatorEditForm.youtubeChannel.trim().replace(/^@/, "");
    updateCreator(editingCreator.id, {
      name: creatorEditForm.name.trim(),
      bio: creatorEditForm.bio.trim(),
      followers: Number(creatorEditForm.followers) || 0,
      youtubeChannel: channelHandle,
    });
    toast.success("Creator updated successfully!");
    setEditingCreator(null);
  };

  const filteredPodcasts = podcasts.filter((p) => {
    const term = podcastSearch.toLowerCase();
    return p.title.toLowerCase().includes(term) || p.creator.toLowerCase().includes(term);
  });

  const filteredCreators = creators.filter((c) => {
    const term = creatorSearch.toLowerCase();
    return c.name.toLowerCase().includes(term) || c.id.toLowerCase().includes(term);
  });

  return (
    <AppLayout>
      <div className="space-y-8 pb-12">
        <div>
          <div className="text-xs uppercase tracking-widest text-accent">Admin Console</div>
          <h1 className="font-display text-3xl font-bold md:text-4xl">Platform Database Admin</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Read, update, and delete access for all creators and episodes on Podify.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="rounded-2xl glass p-5 card-hover">
              <s.icon className="h-5 w-5 text-primary-glow" />
              <div className="mt-3 text-xs text-muted-foreground">{s.label}</div>
              <div className="mt-1 font-display text-3xl font-bold">{s.value}</div>
            </div>
          ))}
        </div>

        {/* Add Podcast Form */}
        <div className="rounded-2xl glass p-6">
          <h3 className="font-display text-xl font-semibold flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary-glow" /> Add YouTube podcast to catalog
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            Instantly sync YouTube videos as streamable items across Home, Discover, and Search.
          </p>

          <form onSubmit={submitAddForm} className="mt-5 grid gap-4 md:grid-cols-2">
            <Field label="Title *">
              <Input value={form.title} onChange={(e) => updateAddForm("title", e.target.value)} placeholder="The Diary of a CEO" />
            </Field>
            <Field label="Creator name *">
              <Input value={form.creator} onChange={(e) => updateAddForm("creator", e.target.value)} placeholder="Steven Bartlett" />
            </Field>

            <Field label="YouTube video URL or ID *">
              <Input
                value={form.youtubeUrl}
                onChange={(e) => updateAddForm("youtubeUrl", e.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
              />
            </Field>
            <Field label="YouTube channel handle (optional)">
              <Input
                value={form.youtubeChannel}
                onChange={(e) => updateAddForm("youtubeChannel", e.target.value)}
                placeholder="@TheDiaryOfACEO"
              />
            </Field>

            <Field label="Category">
              <Select value={form.category} onValueChange={(v) => updateAddForm("category", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c.id} value={c.name}>{c.icon} {c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Language">
              <Select value={form.language} onValueChange={(v) => updateAddForm("language", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {LANGUAGES.map((l) => (
                    <SelectItem key={l} value={l}>{l}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field label="Tags (comma separated)">
              <Input value={form.tags} onChange={(e) => updateAddForm("tags", e.target.value)} placeholder="Mindset, Business" />
            </Field>
            <Field label="Duration (seconds)">
              <Input type="number" min={30} value={form.duration} onChange={(e) => updateAddForm("duration", e.target.value)} />
            </Field>

            <div className="md:col-span-2">
              <Label className="text-xs text-muted-foreground">Description</Label>
              <Textarea
                value={form.description}
                onChange={(e) => updateAddForm("description", e.target.value)}
                placeholder="What is this episode about?"
                rows={3}
                className="mt-1 text-xs"
              />
            </div>

            <div className="md:col-span-2 flex items-center justify-end">
              <Button type="submit" className="bg-gradient-primary shadow-glow">
                <Plus className="mr-2 h-4 w-4" /> Add podcast
              </Button>
            </div>
          </form>
        </div>

        {/* Creators Database Panel */}
        <div className="rounded-2xl glass p-6 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="font-display text-xl font-semibold flex items-center gap-2">
                <Mic className="h-5 w-5 text-primary-glow" /> Manage Creators Database
              </h3>
              <p className="text-sm text-muted-foreground">
                View, modify details, or remove creators from the platform.
              </p>
            </div>
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                value={creatorSearch}
                onChange={(e) => setCreatorSearch(e.target.value)}
                placeholder="Search creators..."
                className="pl-9 text-xs h-9 bg-black/20"
              />
            </div>
          </div>

          <div className="border border-border/40 rounded-xl overflow-hidden bg-background/20 max-h-[380px] overflow-y-auto scrollbar-thin">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border/40 bg-black/40 text-[10px] uppercase tracking-wider text-muted-foreground font-bold">
                  <th className="p-3">Avatar & Name</th>
                  <th className="p-3 hidden md:table-cell">Creator ID</th>
                  <th className="p-3 hidden lg:table-cell">Bio Summary</th>
                  <th className="p-3">Followers</th>
                  <th className="p-3 hidden md:table-cell">YouTube Channel</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/20 text-xs">
                {filteredCreators.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-muted-foreground">
                      No creators found.
                    </td>
                  </tr>
                ) : (
                  filteredCreators.map((c) => (
                    <tr key={c.id} className="hover:bg-white/5 transition-colors">
                      <td className="p-3 flex items-center gap-3">
                        <div className="h-8 w-8 shrink-0 overflow-hidden rounded-full border border-primary/20">
                          <SmartImage src={c.avatar} alt="" fallbackLabel={c.name} fallbackVariant="round" className="h-full w-full object-cover" />
                        </div>
                        <div className="font-semibold text-foreground truncate max-w-[120px]">{c.name}</div>
                      </td>
                      <td className="p-3 font-mono text-[10px] text-muted-foreground hidden md:table-cell">{c.id}</td>
                      <td className="p-3 text-muted-foreground truncate max-w-[200px] hidden lg:table-cell">{c.bio}</td>
                      <td className="p-3 font-medium tabular-nums">{c.followers.toLocaleString()}</td>
                      <td className="p-3 text-muted-foreground hidden md:table-cell">
                        {c.youtubeChannel ? (
                          <a
                            href={`https://youtube.com/@${c.youtubeChannel}`}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-1 hover:text-primary-glow font-medium text-[11px]"
                          >
                            <Youtube className="h-3.5 w-3.5 text-red-500" /> @{c.youtubeChannel}
                          </a>
                        ) : (
                          "-"
                        )}
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex justify-end gap-1.5">
                          <Button size="sm" variant="outline" className="h-7 w-7 p-0 rounded-lg hover:border-primary/40 hover:bg-primary/5 text-primary-glow" onClick={() => handleStartEditCreator(c)}>
                            <Pencil className="h-3 w-3" />
                          </Button>
                          <Button size="sm" variant="outline" className="h-7 w-7 p-0 rounded-lg border-red-500/20 hover:border-red-500 hover:bg-red-500/5 text-red-400" onClick={() => {
                            removeCreator(c.id);
                            toast.success(`Removed creator: ${c.name}`);
                          }}>
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Podcasts Database Panel */}
        <div className="rounded-2xl glass p-6 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="font-display text-xl font-semibold flex items-center gap-2">
                <Star className="h-5 w-5 text-primary-glow" /> Manage Podcasts Catalog
              </h3>
              <p className="text-sm text-muted-foreground">
                View, modify details, plays count, or remove episodes from the global library.
              </p>
            </div>
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                value={podcastSearch}
                onChange={(e) => setPodcastSearch(e.target.value)}
                placeholder="Search episodes..."
                className="pl-9 text-xs h-9 bg-black/20"
              />
            </div>
          </div>

          <div className="border border-border/40 rounded-xl overflow-hidden bg-background/20 max-h-[420px] overflow-y-auto scrollbar-thin">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border/40 bg-black/40 text-[10px] uppercase tracking-wider text-muted-foreground font-bold">
                  <th className="p-3">Cover & Title</th>
                  <th className="p-3">Creator</th>
                  <th className="p-3 hidden md:table-cell">Category</th>
                  <th className="p-3 hidden lg:table-cell">Language</th>
                  <th className="p-3">Plays</th>
                  <th className="p-3 hidden md:table-cell">Format</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/20 text-xs">
                {filteredPodcasts.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-muted-foreground">
                      No podcasts found.
                    </td>
                  </tr>
                ) : (
                  filteredPodcasts.map((p) => {
                    const isCustom = p.id.startsWith("custom-");
                    return (
                      <tr key={p.id} className="hover:bg-white/5 transition-colors">
                        <td className="p-3 flex items-center gap-3">
                          <div className="h-8 w-8 shrink-0 overflow-hidden rounded border border-primary/20">
                            <SmartImage src={p.cover} alt="" fallbackLabel={p.creator} className="h-full w-full object-cover" />
                          </div>
                          <div className="font-semibold text-foreground truncate max-w-[150px]">{p.title}</div>
                        </td>
                        <td className="p-3 text-muted-foreground truncate max-w-[100px]">{p.creator}</td>
                        <td className="p-3 text-muted-foreground hidden md:table-cell">{p.category}</td>
                        <td className="p-3 text-muted-foreground hidden lg:table-cell">{p.language}</td>
                        <td className="p-3 font-medium tabular-nums">{formatPlays(p.plays)}</td>
                        <td className="p-3 text-muted-foreground hidden md:table-cell">
                          {p.youtubeId && !p.youtubeId.startsWith("custom-yt") ? (
                            <a
                              href={`https://www.youtube.com/watch?v=${p.youtubeId}`}
                              target="_blank"
                              rel="noreferrer"
                              className="flex items-center gap-1 hover:text-red-500 font-medium text-[10px]"
                            >
                              <Youtube className="h-3.5 w-3.5 text-red-500" /> YouTube
                            </a>
                          ) : (
                            <span className="text-primary-glow font-medium text-[10px]">AI Speech / Upload</span>
                          )}
                        </td>
                        <td className="p-3 text-right">
                          <div className="flex justify-end gap-1.5">
                            <Button size="sm" variant="outline" className="h-7 w-7 p-0 rounded-lg hover:border-primary/40 hover:bg-primary/5 text-primary-glow" onClick={() => handleStartEditPodcast(p)}>
                              <Pencil className="h-3 w-3" />
                            </Button>
                            <Button size="sm" variant="outline" className="h-7 w-7 p-0 rounded-lg border-red-500/20 hover:border-red-500 hover:bg-red-500/5 text-red-400" onClick={() => {
                              removePodcast(p.id);
                              toast.success("Podcast removed");
                            }}>
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Categories Card */}
        <div className="rounded-2xl glass p-5">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-lg font-semibold">Browse categories</h3>
            <Button size="sm" className="bg-gradient-primary shadow-glow" onClick={() => toast.info("Category management coming soon!")}><Tag className="mr-2 h-3.5 w-3.5" /> Add category</Button>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {CATEGORIES.map((c) => (
              <span key={c.id} className={`rounded-full bg-gradient-to-r ${c.color} px-4 py-1.5 text-xs font-semibold text-white`}>
                {c.icon} {c.name}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Edit Podcast Dialog */}
      <Dialog open={!!editingPodcast} onOpenChange={(open) => !open && setEditingPodcast(null)}>
        <DialogContent className="glass-strong border border-border/40 text-foreground max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display font-bold text-lg text-primary-glow flex items-center gap-2">
              <Pencil className="h-4 w-4" /> Edit Podcast Details
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Modify the database entries for: <span className="font-semibold text-foreground">{editingPodcast?.title}</span>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 my-3 text-xs">
            <div className="grid gap-2">
              <Label className="text-muted-foreground text-[10px] uppercase">Title</Label>
              <Input
                value={podcastEditForm.title}
                onChange={(e) => setPodcastEditForm({ ...podcastEditForm, title: e.target.value })}
                className="bg-black/40"
              />
            </div>
            <div className="grid gap-2">
              <Label className="text-muted-foreground text-[10px] uppercase">Creator Name</Label>
              <Input
                value={podcastEditForm.creator}
                onChange={(e) => setPodcastEditForm({ ...podcastEditForm, creator: e.target.value })}
                className="bg-black/40"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-2">
                <Label className="text-muted-foreground text-[10px] uppercase">Category</Label>
                <Select
                  value={podcastEditForm.category}
                  onValueChange={(v) => setPodcastEditForm({ ...podcastEditForm, category: v })}
                >
                  <SelectTrigger className="bg-black/40"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => (
                      <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label className="text-muted-foreground text-[10px] uppercase">Language</Label>
                <Select
                  value={podcastEditForm.language}
                  onValueChange={(v) => setPodcastEditForm({ ...podcastEditForm, language: v })}
                >
                  <SelectTrigger className="bg-black/40"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {LANGUAGES.map((l) => (
                      <SelectItem key={l} value={l}>{l}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-2">
              <Label className="text-muted-foreground text-[10px] uppercase">Plays Count</Label>
              <Input
                type="number"
                value={podcastEditForm.plays}
                onChange={(e) => setPodcastEditForm({ ...podcastEditForm, plays: Number(e.target.value) || 0 })}
                className="bg-black/40 font-mono"
              />
            </div>
            <div className="grid gap-2">
              <Label className="text-muted-foreground text-[10px] uppercase">Description</Label>
              <Textarea
                value={podcastEditForm.description}
                onChange={(e) => setPodcastEditForm({ ...podcastEditForm, description: e.target.value })}
                className="bg-black/40 text-xs"
                rows={3}
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" size="sm" onClick={() => setEditingPodcast(null)}>
              Cancel
            </Button>
            <Button size="sm" className="bg-gradient-primary shadow-glow" onClick={handleSavePodcastEdit}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Creator Dialog */}
      <Dialog open={!!editingCreator} onOpenChange={(open) => !open && setEditingCreator(null)}>
        <DialogContent className="glass-strong border border-border/40 text-foreground max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display font-bold text-lg text-primary-glow flex items-center gap-2">
              <Pencil className="h-4 w-4" /> Edit Creator Details
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Modify the database entries for: <span className="font-semibold text-foreground">{editingCreator?.name}</span>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 my-3 text-xs">
            <div className="grid gap-2">
              <Label className="text-muted-foreground text-[10px] uppercase">Name</Label>
              <Input
                value={creatorEditForm.name}
                onChange={(e) => setCreatorEditForm({ ...creatorEditForm, name: e.target.value })}
                className="bg-black/40"
              />
            </div>
            <div className="grid gap-2">
              <Label className="text-muted-foreground text-[10px] uppercase">Followers</Label>
              <Input
                type="number"
                value={creatorEditForm.followers}
                onChange={(e) => setCreatorEditForm({ ...creatorEditForm, followers: Number(e.target.value) || 0 })}
                className="bg-black/40 font-mono"
              />
            </div>
            <div className="grid gap-2">
              <Label className="text-muted-foreground text-[10px] uppercase">YouTube Channel Handle</Label>
              <Input
                value={creatorEditForm.youtubeChannel}
                onChange={(e) => setCreatorEditForm({ ...creatorEditForm, youtubeChannel: e.target.value.replace(/^@/, "") })}
                placeholder="e.g. warikoo"
                className="bg-black/40"
              />
            </div>
            <div className="grid gap-2">
              <Label className="text-muted-foreground text-[10px] uppercase">Bio Description</Label>
              <Textarea
                value={creatorEditForm.bio}
                onChange={(e) => setCreatorEditForm({ ...creatorEditForm, bio: e.target.value })}
                className="bg-black/40 text-xs"
                rows={3}
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" size="sm" onClick={() => setEditingCreator(null)}>
              Cancel
            </Button>
            <Button size="sm" className="bg-gradient-primary shadow-glow" onClick={handleSaveCreatorEdit}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <div className="mt-1">{children}</div>
    </div>
  );
}
