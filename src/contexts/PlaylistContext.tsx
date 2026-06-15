import { createContext, useCallback, useContext, useEffect, useMemo, useState, ReactNode } from "react";

const safeUUID = () => {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

const KEY = "podify.playlists.v1";

export interface Playlist {
  id: string;
  name: string;
  category?: string;
  description?: string;
  podcastIds: string[];
  createdAt: number;
}

interface PlaylistCtx {
  playlists: Playlist[];
  createPlaylist: (input: { name: string; category?: string; description?: string }) => Playlist;
  deletePlaylist: (id: string) => void;
  addToPlaylist: (playlistId: string, podcastId: string) => void;
}

const Ctx = createContext<PlaylistCtx | null>(null);

export function PlaylistProvider({ children }: { children: ReactNode }) {
  const [playlists, setPlaylists] = useState<Playlist[]>(() => {
    try { return JSON.parse(localStorage.getItem(KEY) || "[]"); } catch { return []; }
  });

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(playlists));
  }, [playlists]);

  const createPlaylist = useCallback((input: { name: string; category?: string; description?: string }) => {
    const pl: Playlist = {
      id: safeUUID(),
      name: input.name.trim(),
      category: input.category?.trim() || undefined,
      description: input.description?.trim() || undefined,
      podcastIds: [],
      createdAt: Date.now(),
    };
    setPlaylists((p) => [pl, ...p]);
    return pl;
  }, []);

  const deletePlaylist = useCallback((id: string) => {
    setPlaylists((p) => p.filter((x) => x.id !== id));
  }, []);

  const addToPlaylist = useCallback((playlistId: string, podcastId: string) => {
    setPlaylists((p) => p.map((pl) =>
      pl.id === playlistId && !pl.podcastIds.includes(podcastId)
        ? { ...pl, podcastIds: [...pl.podcastIds, podcastId] }
        : pl,
    ));
  }, []);

  const value = useMemo(() => ({ playlists, createPlaylist, deletePlaylist, addToPlaylist }), [playlists, createPlaylist, deletePlaylist, addToPlaylist]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function usePlaylists() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("usePlaylists must be used within PlaylistProvider");
  return ctx;
}
