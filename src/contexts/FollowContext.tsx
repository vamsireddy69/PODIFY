import { createContext, useCallback, useContext, useEffect, useState, ReactNode } from "react";

const KEY = "podify.following.v1";

interface FollowCtx {
  following: Set<string>;
  isFollowing: (id: string) => boolean;
  toggleFollow: (id: string) => void;
}

const Ctx = createContext<FollowCtx | null>(null);

export function FollowProvider({ children }: { children: ReactNode }) {
  const [following, setFollowing] = useState<Set<string>>(() => {
    try { return new Set(JSON.parse(localStorage.getItem(KEY) || "[]")); } catch { return new Set(); }
  });

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify([...following]));
  }, [following]);

  const toggleFollow = useCallback((id: string) => {
    setFollowing((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }, []);

  const isFollowing = useCallback((id: string) => following.has(id), [following]);

  return <Ctx.Provider value={{ following, isFollowing, toggleFollow }}>{children}</Ctx.Provider>;
}

export function useFollow() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useFollow must be used within FollowProvider");
  return ctx;
}
