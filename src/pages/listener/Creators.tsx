import { Link } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { useCatalog } from "@/contexts/CatalogContext";
import { useFollow } from "@/contexts/FollowContext";
import { SmartImage } from "@/components/SmartImage";
import { Button } from "@/components/ui/button";
import { Check, UserPlus } from "lucide-react";

export default function Creators() {
  const { creators } = useCatalog();
  const { isFollowing, toggleFollow } = useFollow();

  return (
    <AppLayout>
      <div className="space-y-8">
        <div>
          <div className="text-xs uppercase tracking-widest text-primary-glow">All creators</div>
          <h1 className="font-display text-3xl font-bold md:text-4xl">Browse creators</h1>
          <p className="mt-1 text-muted-foreground">Follow your favorites to see new episodes in your library.</p>
        </div>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {creators.map((c) => {
            const followed = isFollowing(c.id);
            return (
              <div key={c.id} className="rounded-2xl glass p-5 text-center card-hover">
                <Link to={`/creator/${c.id}`} className="block">
                  <SmartImage src={c.avatar} alt={c.name} fallbackLabel={c.name} fallbackVariant="round" className="mx-auto h-24 w-24 rounded-full border-2 border-primary/40 object-cover" />
                  <div className="mt-3 truncate font-display font-semibold">{c.name}</div>
                  <div className="text-xs text-muted-foreground">{c.followers.toLocaleString()} followers</div>
                </Link>
                <Button
                  size="sm"
                  variant={followed ? "outline" : "default"}
                  className={`mt-3 w-full ${!followed ? "bg-gradient-primary shadow-glow" : ""}`}
                  onClick={() => toggleFollow(c.id)}
                >
                  {followed ? <><Check className="mr-1 h-3.5 w-3.5" /> Following</> : <><UserPlus className="mr-1 h-3.5 w-3.5" /> Follow</>}
                </Button>
              </div>
            );
          })}
        </div>
      </div>
    </AppLayout>
  );
}
