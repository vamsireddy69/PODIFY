import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { PodcastCard } from "@/components/PodcastCard";
import { useCatalog } from "@/contexts/CatalogContext";
import { usePlayer } from "@/contexts/PlayerContext";
import { usePlaylists } from "@/contexts/PlaylistContext";
import { useFollow } from "@/contexts/FollowContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Music2, UserPlus, Trash2, Play, Pause } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { SmartImage } from "@/components/SmartImage";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { CATEGORIES } from "@/lib/mock-data";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

const formatDate = (timestamp: number) => {
  const date = new Date(timestamp);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  if (date.toDateString() === today.toDateString()) {
    return "Today";
  } else if (date.toDateString() === yesterday.toDateString()) {
    return "Yesterday";
  } else {
    return date.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  }
};

const formatTime = (timestamp: number) => {
  return new Date(timestamp).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
};

export default function Library() {
  const { liked, history, removeFromHistory, clearHistory, play, progressMap, current, progress, isPlaying, toggle } = usePlayer();
  const { podcasts, creators } = useCatalog();
  const { playlists, createPlaylist, deletePlaylist } = usePlaylists();
  const { following } = useFollow();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") || "liked";

  const liked_list = podcasts.filter((p) => liked.has(p.id));
  // Recent = newly added custom podcasts first, then most-recent from catalog
  const customRecent = podcasts.filter((p) => p.id.startsWith("custom-"));
  const recent = [...customRecent, ...podcasts.filter((p) => !p.id.startsWith("custom-"))].slice(0, 12);
  const followedCreators = creators.filter((c) => following.has(c.id));

  // Create playlist modal state
  const [open, setOpen] = useState(false);
  const [pName, setPName] = useState("");
  const [pCategory, setPCategory] = useState<string>("");
  const [pDesc, setPDesc] = useState("");

  const submitPlaylist = () => {
    if (!pName.trim()) { toast.error("Playlist name is required"); return; }
    createPlaylist({ name: pName, category: pCategory || undefined, description: pDesc || undefined });
    toast.success("Playlist created");
    setPName(""); setPCategory(""); setPDesc(""); setOpen(false);
  };

  return (
    <AppLayout>
      <div className="space-y-8">
        <div className="flex items-end justify-between">
          <div>
            <div className="text-xs uppercase tracking-widest text-primary-glow">Your library</div>
            <h1 className="font-display text-3xl font-bold md:text-4xl">Everything you love.</h1>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={(val) => setSearchParams({ tab: val })} className="w-full">
          <TabsList className="bg-card/60">
            <TabsTrigger value="liked">Liked</TabsTrigger>
            <TabsTrigger value="playlists">Playlists</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
            <TabsTrigger value="recent">Recent</TabsTrigger>
            <TabsTrigger value="following">Following</TabsTrigger>
          </TabsList>

          {/* LIKED */}
          <TabsContent value="liked" className="mt-6">
            {liked_list.length === 0 ? (
              <Empty
                title="No liked episodes yet"
                desc="Tap the heart on any podcast to save it here."
                action={<Button onClick={() => navigate("/app/discover")} className="bg-gradient-primary shadow-glow">Browse podcasts</Button>}
              />
            ) : (
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
                {liked_list.map((p) => (
                  <PodcastCard key={p.id} podcast={p} queue={liked_list} />
                ))}
              </div>
            )}
          </TabsContent>

          {/* PLAYLISTS */}
          <TabsContent value="playlists" className="mt-6">
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
              <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                  <button className="flex aspect-[4/3] flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-primary/40 bg-primary/5 text-primary-glow card-hover">
                    <Plus className="h-8 w-8" />
                    New playlist
                  </button>
                </DialogTrigger>
                <DialogContent className="glass-strong">
                  <DialogHeader>
                    <DialogTitle>Create a playlist</DialogTitle>
                    <DialogDescription>Group episodes the way you like to listen.</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-3">
                    <div>
                      <Label>Playlist name <span className="text-destructive">*</span></Label>
                      <Input value={pName} onChange={(e) => setPName(e.target.value)} placeholder="e.g. Morning focus" />
                    </div>
                    <div>
                      <Label>Category <span className="text-muted-foreground">(optional)</span></Label>
                      <Select value={pCategory} onValueChange={setPCategory}>
                        <SelectTrigger><SelectValue placeholder="Pick a category" /></SelectTrigger>
                        <SelectContent>
                          {CATEGORIES.map((c) => <SelectItem key={c.id} value={c.name}>{c.icon} {c.name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Description <span className="text-muted-foreground">(optional)</span></Label>
                      <Textarea value={pDesc} onChange={(e) => setPDesc(e.target.value)} placeholder="What is this playlist about?" rows={3} />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
                    <Button onClick={submitPlaylist} className="bg-gradient-primary shadow-glow">Create playlist</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              {playlists.map((pl) => {
                const cover = podcasts.find((p) => pl.podcastIds.includes(p.id))?.cover ?? podcasts[0]?.cover ?? "";
                return (
                  <div key={pl.id} className="rounded-2xl glass overflow-hidden card-hover group">
                    <div className="relative aspect-[4/3]">
                      <SmartImage src={cover} alt="" fallbackLabel={pl.name} className="h-full w-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                      <div className="absolute bottom-3 left-4">
                        <div className="font-display text-lg font-bold">{pl.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {pl.podcastIds.length} episode{pl.podcastIds.length === 1 ? "" : "s"}
                          {pl.category && ` · ${pl.category}`}
                        </div>
                      </div>
                      <button
                        onClick={() => { deletePlaylist(pl.id); toast.success("Playlist deleted"); }}
                        className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full bg-black/60 text-muted-foreground opacity-0 transition group-hover:opacity-100 hover:text-destructive"
                        aria-label="Delete playlist"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    {pl.description && <div className="px-4 py-3 text-xs text-muted-foreground line-clamp-2">{pl.description}</div>}
                  </div>
                );
              })}
            </div>
          </TabsContent>

          {/* HISTORY */}
          <TabsContent value="history" className="mt-6">
            {history.length === 0 ? (
              <Empty
                title="No listening history"
                desc="Podcasts you play will be kept here with your playback progress."
                action={<Button onClick={() => navigate("/app")} className="bg-gradient-primary shadow-glow">Start listening</Button>}
              />
            ) : (
              <div className="space-y-6">
                <div className="flex justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => { clearHistory(); toast.success("History cleared"); }}
                    className="border-destructive/30 hover:bg-destructive/10 hover:text-destructive"
                  >
                    Clear all history
                  </Button>
                </div>
                <div className="space-y-3">
                  {history.map((item) => {
                    const pod = podcasts.find((p) => p.id === item.podcastId);
                    if (!pod) return null;
                    const isCurrent = current?.id === pod.id;
                    const livePct = isCurrent ? progress : (progressMap[pod.id] ?? 0);
                    const percent = Math.round(livePct * 100);
                    const isCurrentPlaying = isCurrent && isPlaying;
                    return (
                      <div
                        key={item.podcastId + "-" + item.timestamp}
                        className="group relative flex items-center gap-3 md:gap-4 rounded-2xl glass p-3 card-hover text-left"
                      >
                        {/* Thumbnail Cover with progress bar */}
                        <div className="relative h-16 w-24 sm:w-28 md:w-32 shrink-0 overflow-hidden rounded-xl bg-black/40">
                          <SmartImage src={pod.cover} alt="" className="h-full w-full object-cover" />
                          <div className="absolute inset-x-0 bottom-0 h-1 bg-white/25">
                            <div className="h-full bg-gradient-primary" style={{ width: `${percent}%` }} />
                          </div>
                        </div>

                        {/* Text Metadata */}
                        <div className="min-w-0 flex-1">
                          <h3 className="font-semibold text-sm sm:text-base truncate leading-snug">{pod.title}</h3>
                          <p className="text-xs text-muted-foreground truncate mt-0.5">{pod.creator}</p>
                          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-1 text-[10px] text-muted-foreground font-medium">
                            <span>{formatDate(item.timestamp)} at {formatTime(item.timestamp)}</span>
                            <span className="hidden sm:inline">·</span>
                            <span className="text-primary-glow">{percent}% listened</span>
                          </div>
                        </div>

                        {/* Controls (Play and Delete) */}
                        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                          <button
                            onClick={() => isCurrent ? toggle() : play(pod, podcasts)}
                            className={cn(
                              "grid h-9 w-9 place-items-center rounded-full bg-gradient-primary text-white shadow-glow transition hover:scale-105",
                              isCurrent ? "opacity-100" : "sm:opacity-0 group-hover:opacity-100"
                            )}
                            aria-label={isCurrentPlaying ? "Pause" : "Play"}
                          >
                            {isCurrentPlaying ? (
                              <Pause className="h-4 w-4 fill-white text-white" />
                            ) : (
                              <Play className="h-4 w-4 fill-white text-white pl-0.5" />
                            )}
                          </button>
                          
                          <button
                            onClick={() => { removeFromHistory(item.podcastId); toast.success("Removed from history"); }}
                            className="grid h-9 w-9 place-items-center rounded-full bg-card/60 border border-border/40 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                            aria-label="Remove from history"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </TabsContent>

          {/* RECENT */}
          <TabsContent value="recent" className="mt-6">
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
              {recent.map((p) => (
                <PodcastCard key={p.id} podcast={p} queue={recent} />
              ))}
            </div>
          </TabsContent>

          {/* FOLLOWING */}
          <TabsContent value="following" className="mt-6">
            {followedCreators.length === 0 ? (
              <Empty
                title="You're not following anyone yet"
                desc="Discover creators and follow them to get updates."
                action={
                  <Button asChild className="bg-gradient-primary shadow-glow">
                    <Link to="/app/creators"><UserPlus className="mr-2 h-4 w-4" /> Browse Creators</Link>
                  </Button>
                }
              />
            ) : (
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                {followedCreators.map((c) => (
                  <Link key={c.id} to={`/creator/${c.id}`} className="group rounded-2xl glass p-5 text-center card-hover">
                    <SmartImage src={c.avatar} alt={c.name} fallbackLabel={c.name} fallbackVariant="round" className="mx-auto h-24 w-24 rounded-full border-2 border-primary/40 object-cover" />
                    <div className="mt-3 truncate font-display font-semibold">{c.name}</div>
                    <div className="text-xs text-muted-foreground">{c.followers.toLocaleString()} followers</div>
                  </Link>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}

function Empty({ title, desc, action }: { title: string; desc: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/60 bg-card/30 py-20 text-center">
      <div className="grid h-16 w-16 place-items-center rounded-2xl bg-primary/10 text-primary-glow">
        <Music2 className="h-8 w-8" />
      </div>
      <h3 className="mt-4 font-display text-xl font-semibold">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">{desc}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
