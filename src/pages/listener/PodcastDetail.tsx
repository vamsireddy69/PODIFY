import { useParams, Link } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";

const safeUUID = () => {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};
import { MOCK_COMMENTS, formatDuration, formatPlays } from "@/lib/mock-data";
import { useCatalog } from "@/contexts/CatalogContext";
import { usePlayer } from "@/contexts/PlayerContext";
import { Play, Heart, Share2, Star, Plus, Send } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { PodcastCard } from "@/components/PodcastCard";
import { SmartImage } from "@/components/SmartImage";

const formatSpecificDate = (dateStr?: string) => {
  if (!dateStr) return "";
  try {
    const date = new Date(dateStr);
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const month = months[date.getMonth()];
    const day = date.getDate();
    const year = date.getFullYear();

    let suffix = "th";
    if (day === 1 || day === 21 || day === 31) suffix = "st";
    else if (day === 2 || day === 22) suffix = "nd";
    else if (day === 3 || day === 23) suffix = "rd";

    return `${month} ${day}${suffix}, ${year}`;
  } catch {
    return "";
  }
};

export default function PodcastDetail() {
  const { id } = useParams();
  const { podcasts } = useCatalog();
  const podcast = podcasts.find((p) => p.id === id) || podcasts[0];
  const { play, liked, toggleLike, addToQueue } = usePlayer();
  const isLiked = liked.has(podcast.id);
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState(MOCK_COMMENTS);
  const related = podcasts.filter((p) => p.id !== podcast.id && p.category === podcast.category).slice(0, 5);

  const submit = () => {
    if (!comment.trim()) return;
    setComments([{ id: safeUUID(), user: "You", avatar: "https://i.pravatar.cc/100?img=33", text: comment, time: "Just now" }, ...comments]);
    setComment("");
    toast.success("Comment posted");
  };

  return (
    <AppLayout>
      <div className="space-y-10">
        {/* Hero */}
        <div className="relative overflow-hidden rounded-3xl">
          <SmartImage src={podcast.cover} alt="" fallbackLabel={podcast.creator} className="absolute inset-0 h-full w-full object-cover opacity-30 blur-3xl" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background/20" />
          <div className="relative flex flex-col gap-8 p-8 md:flex-row md:p-10">
            <SmartImage src={podcast.cover} alt={podcast.title} fallbackLabel={podcast.creator} className="h-56 w-56 rounded-2xl object-cover shadow-elegant" />
            <div className="flex-1">
              <div className="text-xs uppercase tracking-widest text-primary-glow">{podcast.category} · {podcast.language}</div>
              <h1 className="mt-2 font-display text-4xl font-bold md:text-5xl">{podcast.title}</h1>
              <Link to={`/creator/${podcast.creatorId}`} className="mt-3 inline-block text-muted-foreground hover:text-foreground">
                by <span className="font-semibold text-foreground">{podcast.creator}</span>
              </Link>
              <div className="mt-2 flex items-center gap-3 text-sm text-muted-foreground flex-wrap">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                  {podcast.rating.toFixed(1)}
                </div>
                <span>·</span>
                <span>{formatPlays(podcast.plays)} plays</span>
                <span>·</span>
                <span>{formatDuration(podcast.duration)}</span>
                {(podcast.publishedAt || podcast.scheduledFor) && (
                  <>
                    <span>·</span>
                    <span>Published on {formatSpecificDate(podcast.publishedAt || podcast.scheduledFor)}</span>
                  </>
                )}
              </div>
              <p className="mt-4 max-w-2xl text-muted-foreground">{podcast.description}</p>
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <Button onClick={() => play(podcast, related.length ? related : [podcast])} className="h-11 bg-gradient-primary px-6 shadow-glow">
                  <Play className="mr-2 h-4 w-4 fill-white" /> Play
                </Button>
                <Button onClick={() => toggleLike(podcast.id)} variant="outline" className="h-11 border-border/60">
                  <Heart className={`mr-2 h-4 w-4 ${isLiked ? "fill-neon-pink text-neon-pink" : ""}`} />
                  {isLiked ? "Liked" : "Like"}
                </Button>
                <Button onClick={() => { addToQueue(podcast); toast.success("Added to queue"); }} variant="outline" className="h-11 border-border/60">
                  <Plus className="mr-2 h-4 w-4" /> Add to queue
                </Button>
                <Button onClick={() => { navigator.clipboard?.writeText(window.location.href); toast.success("Link copied"); }} variant="outline" className="h-11 border-border/60">
                  <Share2 className="mr-2 h-4 w-4" /> Share
                </Button>
                {podcast.youtubeId && !podcast.youtubeId.startsWith("custom-yt") && (
                  <a
                    href={`https://www.youtube.com/watch?v=${podcast.youtubeId}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex h-11 items-center gap-2 rounded-md border border-border/60 px-4 text-sm text-muted-foreground hover:text-foreground"
                  >
                    Watch on YouTube
                  </a>
                )}
              </div>
              {podcast.youtubeId && !podcast.youtubeId.startsWith("custom-yt") && (
                <p className="mt-3 text-xs text-muted-foreground">
                  Tip: use the <span className="text-foreground">Audio</span> / <span className="text-foreground">Video</span> toggle in the player to switch modes.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Comments */}
        <section>
          <h2 className="mb-4 font-display text-2xl font-bold">Comments</h2>
          <div className="rounded-2xl glass p-4">
            <div className="flex items-start gap-3">
              <img src="https://i.pravatar.cc/100?img=33" alt="" className="h-9 w-9 rounded-full" />
              <div className="flex flex-1 items-center gap-2">
                <input
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && submit()}
                  placeholder="Add a comment…"
                  className="h-10 flex-1 rounded-full border border-border/60 bg-background/40 px-4 text-sm outline-none focus:border-primary/60"
                />
                <Button onClick={submit} size="icon" className="bg-gradient-primary shadow-glow">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="mt-6 space-y-4">
              {comments.map((c) => (
                <div key={c.id} className="flex gap-3">
                  <img src={c.avatar} alt="" className="h-9 w-9 rounded-full" />
                  <div>
                    <div className="text-sm">
                      <span className="font-semibold">{c.user}</span> <span className="text-muted-foreground">· {c.time}</span>
                    </div>
                    <div className="text-sm text-muted-foreground">{c.text}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Related */}
        <section>
          <h2 className="mb-4 font-display text-2xl font-bold">More like this</h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
            {related.map((p) => (
              <PodcastCard key={p.id} podcast={p} queue={related} />
            ))}
          </div>
        </section>
      </div>
    </AppLayout>
  );
}
