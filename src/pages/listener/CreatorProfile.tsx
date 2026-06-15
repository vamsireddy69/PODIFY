import { useParams } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { youtubeChannelUrl } from "@/lib/mock-data";
import { useCatalog } from "@/contexts/CatalogContext";
import { useFollow } from "@/contexts/FollowContext";
import { PodcastCard } from "@/components/PodcastCard";
import { Button } from "@/components/ui/button";
import { Star, UserPlus, Check, Youtube } from "lucide-react";
import { SmartImage } from "@/components/SmartImage";

export default function CreatorProfile() {
  const { id } = useParams();
  const { creators, podcasts } = useCatalog();
  const { isFollowing, toggleFollow } = useFollow();
  const creator = creators.find((c) => c.id.toLowerCase() === id?.toLowerCase()) || creators[0];
  const ownEpisodes = podcasts.filter((p) => p.creatorId === creator.id);
  const episodes = ownEpisodes.length ? ownEpisodes : podcasts.slice(0, 3);
  const following = isFollowing(creator.id);

  return (
    <AppLayout>
      <div className="space-y-10">
        <div className="relative overflow-hidden rounded-3xl border border-border/60 bg-gradient-to-br from-primary/15 via-card/40 to-secondary/15 p-8 md:p-12">
          <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-primary/30 blur-3xl" />
          <div className="relative flex flex-col items-start gap-6 md:flex-row md:items-center">
            <SmartImage src={creator.avatar} alt={creator.name} fallbackLabel={creator.name} fallbackVariant="round" className="h-32 w-32 rounded-full border-4 border-primary/40 object-cover shadow-glow" />
            <div className="flex-1">
              <div className="text-xs uppercase tracking-widest text-primary-glow">Verified Creator</div>
              <h1 className="mt-1 font-display text-4xl font-bold md:text-5xl">{creator.name}</h1>
              <p className="mt-2 max-w-xl text-muted-foreground">{creator.bio}</p>
              <div className="mt-3 flex items-center gap-4 text-sm text-muted-foreground">
                <span><b className="text-foreground">{creator.followers.toLocaleString()}</b> followers</span>
                <span>·</span>
                <span><b className="text-foreground">{episodes.length}</b> episodes</span>
                <span>·</span>
                <span className="flex items-center gap-1"><Star className="h-4 w-4 fill-amber-400 text-amber-400" /> 4.9</span>
              </div>
            </div>
            <div className="flex flex-col gap-2 md:items-end">
              <Button onClick={() => toggleFollow(creator.id)} className={following ? "" : "bg-gradient-primary shadow-glow"}>
                {following ? <><Check className="mr-2 h-4 w-4" /> Following</> : <><UserPlus className="mr-2 h-4 w-4" /> Follow</>}
              </Button>
              {creator.youtubeChannel && (
                <a
                  href={youtubeChannelUrl(creator.youtubeChannel)}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/40 px-4 py-1.5 text-xs text-muted-foreground hover:text-foreground"
                >
                  <Youtube className="h-3.5 w-3.5" /> Visit YouTube channel
                </a>
              )}
            </div>
          </div>
        </div>

        <section>
          <h2 className="mb-4 font-display text-2xl font-bold">All episodes</h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
            {episodes.map((p, i) => (
              <PodcastCard key={p.id + i} podcast={p} queue={episodes} />
            ))}
          </div>
        </section>
      </div>
    </AppLayout>
  );
}

