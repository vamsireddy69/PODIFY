import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { Podcast } from "@/lib/types";
import { PODCASTS, CREATORS } from "@/lib/mock-data";

const STORAGE_KEY = "podify.custom-podcasts.v1";

export interface NewPodcastInput {
  title: string;
  creator: string;
  category: string;
  language: string;
  tags: string[];
  description: string;
  youtubeId: string;
  youtubeChannel?: string;
  duration?: number;
  cover?: string;
  scheduledFor?: string;
  publishedAt?: string;
  audioUrl?: string;
  script?: string;
  voice?: string;
  ttsLang?: string;
}

export interface Creator {
  id: string;
  name: string;
  avatar: string;
  youtubeChannel: string;
  followers: number;
  bio: string;
}

interface CatalogValue {
  podcasts: Podcast[];
  creators: Creator[];
  customIds: Set<string>;
  addPodcast: (input: NewPodcastInput) => Podcast;
  removePodcast: (id: string) => void;
  updatePodcast: (id: string, updates: Partial<Podcast>) => void;
  removeCreator: (id: string) => void;
  updateCreator: (id: string, updates: Partial<Creator>) => void;
}

const CatalogContext = createContext<CatalogValue | null>(null);

const slug = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

function readStored(): Podcast[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as Podcast[]) : [];
  } catch {
    return [];
  }
}

export function CatalogProvider({ children }: { children: React.ReactNode }) {
  const [custom, setCustom] = useState<Podcast[]>(() => readStored());

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(custom));
    } catch {
      /* quota — ignore */
    }
  }, [custom]);

  const [mockPlays, setMockPlays] = useState<Record<string, number>>({});

  const [deletedPodcasts, setDeletedPodcasts] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("podify.deleted-podcasts.v1") || "[]");
    } catch {
      return [];
    }
  });

  const [mockUpdates, setMockUpdates] = useState<Record<string, Partial<Podcast>>>(() => {
    try {
      return JSON.parse(localStorage.getItem("podify.mock-updates.v1") || "{}");
    } catch {
      return {};
    }
  });

  const [deletedCreators, setDeletedCreators] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("podify.deleted-creators.v1") || "[]");
    } catch {
      return [];
    }
  });

  const [modifiedCreators, setModifiedCreators] = useState<Record<string, Partial<Creator>>>(() => {
    try {
      return JSON.parse(localStorage.getItem("podify.modified-creators.v1") || "{}");
    } catch {
      return {};
    }
  });

  useEffect(() => {
    localStorage.setItem("podify.deleted-podcasts.v1", JSON.stringify(deletedPodcasts));
  }, [deletedPodcasts]);

  useEffect(() => {
    localStorage.setItem("podify.mock-updates.v1", JSON.stringify(mockUpdates));
  }, [mockUpdates]);

  useEffect(() => {
    localStorage.setItem("podify.deleted-creators.v1", JSON.stringify(deletedCreators));
  }, [deletedCreators]);

  useEffect(() => {
    localStorage.setItem("podify.modified-creators.v1", JSON.stringify(modifiedCreators));
  }, [modifiedCreators]);

  const addPodcast = useCallback((input: NewPodcastInput): Podcast => {
    const creatorId = slug(input.creator);
    const id = `custom-${Date.now()}-${slug(input.title).slice(0, 24)}`;
    const finalYoutubeId = input.youtubeId?.trim() ? input.youtubeId.trim() : `custom-yt-${Date.now()}`;
    const cover =
      input.cover?.trim() ||
      (input.youtubeId?.trim() 
        ? `https://i.ytimg.com/vi/${input.youtubeId.trim()}/hqdefault.jpg`
        : "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=600&auto=format&fit=crop&q=80");
    const podcast: Podcast = {
      id,
      title: input.title.trim(),
      creator: input.creator.trim(),
      creatorId,
      category: input.category,
      tags: input.tags,
      language: input.language,
      cover,
      duration: input.duration ?? 1800,
      plays: 0,
      rating: 5,
      description: input.description.trim(),
      youtubeId: finalYoutubeId,
      youtubeChannel: input.youtubeChannel?.trim() || undefined,
      audioUrl: input.audioUrl,
      script: input.script,
      voice: input.voice,
      ttsLang: input.ttsLang,
      scheduledFor: input.scheduledFor,
      publishedAt: input.publishedAt || new Date().toISOString(),
    };
    setCustom((prev) => [podcast, ...prev]);
    return podcast;
  }, []);

  const removePodcast = useCallback((id: string) => {
    if (id.startsWith("custom-")) {
      setCustom((prev) => prev.filter((p) => p.id !== id));
    } else {
      setDeletedPodcasts((prev) => [...prev, id]);
    }
  }, []);
  const updatePodcast = useCallback((id: string, updates: Partial<Podcast>) => {
    const extraUpdates: Partial<Podcast> = { ...updates };
    if (updates.creator) {
      extraUpdates.creatorId = slug(updates.creator);
    }
    if (id.startsWith("custom-")) {
      setCustom((prev) =>
        prev.map((p) => (p.id === id ? { ...p, ...extraUpdates } : p))
      );
    } else {
      setMockUpdates((prev) => ({
        ...prev,
        [id]: { ...(prev[id] || {}), ...extraUpdates }
      }));
    }
  }, []);

  const removeCreator = useCallback((id: string) => {
    setDeletedCreators((prev) => [...prev, id]);
  }, []);

  const updateCreator = useCallback((id: string, updates: Partial<Creator>) => {
    setModifiedCreators((prev) => ({
      ...prev,
      [id]: { ...(prev[id] || {}), ...updates }
    }));
  }, []);

  const value = useMemo<CatalogValue>(() => {
    // Build creators list first: existing creators + any creators introduced by custom entries
    const seen = new Map(CREATORS.map((c) => [c.id, c] as const));
    custom.forEach((p, i) => {
      if (!seen.has(p.creatorId)) {
        seen.set(p.creatorId, {
          id: p.creatorId,
          name: p.creator,
          avatar: p.cover,
          youtubeChannel: p.youtubeChannel || "",
          followers: 1000 + i * 137,
          bio: `Long-form conversations & ideas from ${p.creator}.`,
        });
      }
    });

    const creatorsList = Array.from(seen.values())
      .map((c) => {
        const mod = modifiedCreators[c.id];
        return mod ? { ...c, ...mod } as Creator : c as Creator;
      })
      .filter((c) => !deletedCreators.includes(c.id));

    // Create a lookup map of creator's youtubeChannel
    const creatorYoutubeMap = new Map(creatorsList.map((c) => [c.id, c.youtubeChannel]));

    const podcasts = [
      ...custom,
      ...PODCASTS.map((p) => {
        let updated = p;
        if (mockPlays[p.id] !== undefined) {
          updated = { ...updated, plays: mockPlays[p.id] };
        }
        const extra = mockUpdates[p.id];
        if (extra) {
          updated = { ...updated, ...extra };
        }
        return updated;
      }),
    ]
      .map((p) => {
        const updatedChannel = creatorYoutubeMap.get(p.creatorId);
        if (updatedChannel !== undefined) {
          return { ...p, youtubeChannel: updatedChannel };
        }
        return p;
      })
      .filter((p) => !deletedPodcasts.includes(p.id))
      .filter((p) => !deletedCreators.includes(p.creatorId));

    return {
      podcasts,
      creators: creatorsList,
      customIds: new Set(custom.map((p) => p.id)),
      addPodcast,
      removePodcast,
      updatePodcast,
      removeCreator,
      updateCreator,
    };
  }, [custom, mockPlays, deletedPodcasts, mockUpdates, deletedCreators, modifiedCreators, addPodcast, removePodcast, updatePodcast, removeCreator, updateCreator]);

  return <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>;
}

export function useCatalog() {
  const ctx = useContext(CatalogContext);
  if (!ctx) throw new Error("useCatalog must be used within CatalogProvider");
  return ctx;
}
