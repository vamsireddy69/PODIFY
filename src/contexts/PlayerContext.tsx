import { createContext, useCallback, useContext, useEffect, useRef, useState, ReactNode } from "react";
import type { Podcast } from "@/lib/types";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { getTranslation } from "@/lib/tts-utils";
import { useCatalog } from "@/contexts/CatalogContext";

export type PlayMode = "audio" | "video";

const PROGRESS_KEY = "podify.progress.v1";
const LIKED_KEY = "podify.liked.v1";
const HISTORY_KEY = "podify.history.v1";

export interface HistoryItem {
  podcastId: string;
  timestamp: number; // epoch
  progress: number;
}

function readProgress(): Record<string, number> {
  try { return JSON.parse(localStorage.getItem(PROGRESS_KEY) || "{}"); } catch { return {}; }
}
function readLiked(): string[] {
  try { return JSON.parse(localStorage.getItem(LIKED_KEY) || "[]"); } catch { return []; }
}
function readHistory(): HistoryItem[] {
  try { return JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]"); } catch { return []; }
}

interface PlayerCtx {
  current: Podcast | null;
  queue: Podcast[];
  isPlaying: boolean;
  progress: number; // 0..1
  duration: number;
  volume: number;
  speed: number;
  shuffle: boolean;
  repeat: boolean;
  mode: PlayMode;
  liked: Set<string>;
  progressMap: Record<string, number>; // 0..1 per podcast id
  history: HistoryItem[];
  /** Load (don't autoplay) */
  load: (p: Podcast, queue?: Podcast[]) => void;
  /** Load and start playing (user gesture) */
  play: (p: Podcast, queue?: Podcast[]) => void;
  toggle: () => void;
  next: () => void;
  prev: () => void;
  seek: (pct: number) => void;
  seekBy: (seconds: number) => void;
  setVolume: (v: number) => void;
  toggleMute: () => void;
  setSpeed: (s: number) => void;
  toggleShuffle: () => void;
  toggleRepeat: () => void;
  toggleLike: (id: string) => void;
  addToQueue: (p: Podcast) => void;
  removeFromQueue: (id: string) => void;
  clearQueue: () => void;
  setQueue: (q: Podcast[]) => void;
  setMode: (m: PlayMode) => void;
  registerYouTube: (player: YTPlayer | null) => void;
  reportYouTubeState: (data: { isPlaying?: boolean; progress?: number; duration?: number }) => void;
  removeFromHistory: (podcastId: string) => void;
  clearHistory: () => void;
}

export interface YTPlayer {
  loadVideoById: (opts: string | { videoId: string; startSeconds?: number }) => void;
  cueVideoById: (opts: string | { videoId: string; startSeconds?: number }) => void;
  playVideo: () => void;
  pauseVideo: () => void;
  seekTo: (seconds: number, allow: boolean) => void;
  setVolume: (v: number) => void;
  setPlaybackRate: (r: number) => void;
  getDuration: () => number;
  getCurrentTime: () => number;
  destroy: () => void;
}

const Ctx = createContext<PlayerCtx | null>(null);

export function PlayerProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { updatePodcast } = useCatalog();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const ytRef = useRef<YTPlayer | null>(null);
  const ytReadyRef = useRef(false);
  const pendingLoadRef = useRef<{ id: string; start: number; autoplay: boolean } | null>(null);
  const prevVolumeRef = useRef(1.0);
  const ttsUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const ttsTimerRef = useRef<number | null>(null);
  const ttsKeepAliveRef = useRef<number | null>(null);

  const [current, setCurrent] = useState<Podcast | null>(null);
  const [queue, setQueueState] = useState<Podcast[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(1.0);
  const [speed, setSpeedState] = useState(1);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState(false);
  const [mode, setModeState] = useState<PlayMode>("audio");
  const [liked, setLiked] = useState<Set<string>>(() => new Set(readLiked()));
  const [progressMap, setProgressMap] = useState<Record<string, number>>({});
  const [durationMap, setDurationMap] = useState<Record<string, number>>({});
  const [history, setHistory] = useState<HistoryItem[]>([]);

  // Get keys dynamically based on active user
  const getKeys = useCallback(() => {
    const userPrefix = user ? `user_${user.id}_` : "global_";
    return {
      progress: `podify.progress.${userPrefix}v1`,
      history: `podify.history.${userPrefix}v1`,
      duration: `podify.duration.${userPrefix}v1`,
    };
  }, [user]);

  // Load user-specific history, progress and duration when user changes (login/logout)
  useEffect(() => {
    const keys = getKeys();
    try {
      setProgressMap(JSON.parse(localStorage.getItem(keys.progress) || "{}"));
    } catch {
      setProgressMap({});
    }
    try {
      setDurationMap(JSON.parse(localStorage.getItem(keys.duration) || "{}"));
    } catch {
      setDurationMap({});
    }
    try {
      setHistory(JSON.parse(localStorage.getItem(keys.history) || "[]"));
    } catch {
      setHistory([]);
    }
  }, [user, getKeys]);

  const addToHistory = useCallback((podcastId: string, progressVal: number) => {
    setHistory((prev) => {
      const filtered = prev.filter((item) => item.podcastId !== podcastId);
      const next = [
        { podcastId, timestamp: Date.now(), progress: progressVal },
        ...filtered
      ];
      localStorage.setItem(getKeys().history, JSON.stringify(next));
      return next;
    });
  }, [getKeys]);

  const removeFromHistory = useCallback((podcastId: string) => {
    setHistory((prev) => {
      const next = prev.filter((item) => item.podcastId !== podcastId);
      localStorage.setItem(getKeys().history, JSON.stringify(next));
      return next;
    });
  }, [getKeys]);

  const clearHistory = useCallback(() => {
    setHistory([]);
    localStorage.removeItem(getKeys().history);
  }, [getKeys]);

  // persist liked
  useEffect(() => {
    localStorage.setItem(LIKED_KEY, JSON.stringify([...liked]));
  }, [liked]);

  // Throttled save of progress map and duration map
  const lastSaveRef = useRef(0);
  useEffect(() => {
    const now = Date.now();
    if (now - lastSaveRef.current > 1500) {
      lastSaveRef.current = now;
      try {
        localStorage.setItem(getKeys().progress, JSON.stringify(progressMap));
        localStorage.setItem(getKeys().duration, JSON.stringify(durationMap));
      } catch { /* noop */ }
    }
  }, [progressMap, durationMap, getKeys]);

  // Persistent background save beforeunload and unmount
  const progressMapRef = useRef(progressMap);
  const durationMapRef = useRef(durationMap);
  useEffect(() => {
    progressMapRef.current = progressMap;
    durationMapRef.current = durationMap;
  }, [progressMap, durationMap]);

  useEffect(() => {
    const handleUnload = () => {
      try {
        localStorage.setItem(getKeys().progress, JSON.stringify(progressMapRef.current));
        localStorage.setItem(getKeys().duration, JSON.stringify(durationMapRef.current));
      } catch {}
    };
    window.addEventListener("beforeunload", handleUnload);
    return () => {
      window.removeEventListener("beforeunload", handleUnload);
      handleUnload();
    };
  }, [getKeys]);

  // ---- HTML <audio> engine ----
  useEffect(() => {
    const a = new Audio();
    a.preload = "metadata";
    audioRef.current = a;
    const onTime = () => {
      if (a.duration) {
        const pct = a.currentTime / a.duration;
        setProgress(pct);
        const id = currentRef.current?.id;
        if (id) setProgressMap((m) => ({ ...m, [id]: pct }));
      }
    };
    const onMeta = () => {
      setDuration(a.duration);
      const id = currentRef.current?.id;
      if (id) setDurationMap((m) => ({ ...m, [id]: a.duration }));
    };
    const onEnd = () => {
      const id = currentRef.current?.id;
      if (id) setProgressMap((m) => ({ ...m, [id]: 1 }));
      if (repeatRef.current) { a.currentTime = 0; a.play().catch(() => {}); }
      else nextRef.current?.();
    };
    const onError = () => {
      const p = currentRef.current;
      // If we are currently playing a YouTube podcast, ignore any audio element load errors
      const isRealYT = !!(p?.youtubeId && !p.youtubeId.startsWith("custom-yt"));
      if (isRealYT) return;

      if (p) {
        toast.error(`"${p.title}" audio is unavailable. Skipping...`);
        const currentQueue = queueRef.current;
        const filteredQueue = currentQueue.filter((x) => x.id !== p.id);
        setQueueState(filteredQueue);

        let nextPodcast: Podcast | null = null;
        if (filteredQueue.length > 0) {
          const idx = currentQueue.findIndex((q) => q.id === p.id);
          if (idx !== -1) {
            if (shuffleRef.current) {
              const randIdx = Math.floor(Math.random() * filteredQueue.length);
              nextPodcast = filteredQueue[randIdx];
            } else {
              const nextIdx = idx % filteredQueue.length;
              nextPodcast = filteredQueue[nextIdx];
            }
          } else {
            nextPodcast = filteredQueue[0];
          }
        }

        if (nextPodcast) {
          play(nextPodcast, filteredQueue);
        } else {
          setCurrent(null);
          setIsPlaying(false);
          setProgress(0);
        }
      }
    };
    a.addEventListener("timeupdate", onTime);
    a.addEventListener("loadedmetadata", onMeta);
    a.addEventListener("ended", onEnd);
    a.addEventListener("error", onError);
    return () => {
      a.pause();
      a.removeEventListener("timeupdate", onTime);
      a.removeEventListener("loadedmetadata", onMeta);
      a.removeEventListener("ended", onEnd);
      a.removeEventListener("error", onError);
      audioRef.current = null;

      // Cleanup TTS on unmount
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      if (ttsTimerRef.current) {
        window.clearInterval(ttsTimerRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const currentRef = useRef<Podcast | null>(null);
  useEffect(() => { currentRef.current = current; }, [current]);

  const repeatRef = useRef(repeat);
  useEffect(() => { repeatRef.current = repeat; }, [repeat]);

  const queueRef = useRef<Podcast[]>([]);
  useEffect(() => { queueRef.current = queue; }, [queue]);

  const shuffleRef = useRef(shuffle);
  useEffect(() => { shuffleRef.current = shuffle; }, [shuffle]);

  useEffect(() => {
    const a = audioRef.current;
    if (a) a.volume = volume;
    try { ytRef.current?.setVolume(Math.round(volume * 100)); } catch { /* noop */ }
  }, [volume]);

  useEffect(() => {
    const a = audioRef.current;
    if (a) a.playbackRate = speed;
    try { ytRef.current?.setPlaybackRate(speed); } catch { /* noop */ }
  }, [speed]);

  // ---- TTS synthesis support ----
  const stopTTS = useCallback(() => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    if (ttsTimerRef.current) {
      window.clearInterval(ttsTimerRef.current);
      ttsTimerRef.current = null;
    }
    if (ttsKeepAliveRef.current) {
      window.clearInterval(ttsKeepAliveRef.current);
      ttsKeepAliveRef.current = null;
    }
  }, []);

  const playTTS = useCallback((p: Podcast, autoplay: boolean, startPct: number) => {
    stopTTS();
    if (typeof window === "undefined" || !window.speechSynthesis) return;

    const synth = window.speechSynthesis;
    const words = (p.script || "").trim().split(/\s+/).filter(Boolean).length;
    const estimatedDuration = Math.max(10, Math.ceil(words / 2.5 + 2.0));
    setDuration(estimatedDuration);

    const langCodes: Record<string, string> = {
      "English": "en",
      "Hindi": "hi",
      "Tamil": "ta",
      "Telugu": "te",
      "Malayalam": "ml",
      "Kannada": "kn"
    };
    const targetLangCode = langCodes[p.ttsLang || "English"] || "en";
    const voices = synth.getVoices();
    let matchingVoices = voices.filter(v => v.lang.startsWith(targetLangCode));

    let isFallback = false;
    if (targetLangCode !== "en" && matchingVoices.length === 0 && voices.length > 0) {
      matchingVoices = voices.filter(v => v.lang.startsWith("en"));
      isFallback = true;
    }

    const textToSpeak = getTranslation(p.script || "", p.ttsLang || "English", p.title, isFallback);
    const utterance = new SpeechSynthesisUtterance(textToSpeak);

    if (voices.length > 0) {
      const isFemale = p.voice === "aria" || p.voice === "leela";
      if (isFemale) {
        utterance.voice = matchingVoices.find(v => 
          v.name.includes("Zira") || 
          v.name.includes("Female") || 
          v.name.includes("Google") || 
          v.name.toLowerCase().includes("woman") ||
          v.name.toLowerCase().includes("girl")
        ) || matchingVoices[0] || voices[0];
        utterance.pitch = p.voice === "leela" ? 1.15 : 1.0;
      } else {
        utterance.voice = matchingVoices.find(v => 
          v.name.includes("David") || 
          v.name.includes("Male") || 
          v.name.includes("Google") ||
          v.name.toLowerCase().includes("man") ||
          v.name.toLowerCase().includes("boy")
        ) || matchingVoices[0] || voices[0];
        utterance.pitch = p.voice === "neo" ? 0.85 : 1.0;
      }
    }

    ttsUtteranceRef.current = utterance;

    let elapsed = startPct * estimatedDuration;
    setProgress(startPct);

    utterance.onend = () => {
      stopTTS();
      setIsPlaying(false);
      setProgress(1);
      const id = currentRef.current?.id;
      if (id) setProgressMap((m) => ({ ...m, [id]: 1 }));
      nextRef.current?.();
    };

    utterance.onerror = () => {
      stopTTS();
      setIsPlaying(false);
    };

    if (autoplay) {
      synth.cancel();
      setTimeout(() => {
        synth.speak(utterance);
      }, 50);

      setIsPlaying(true);

      // Keep alive SpeechSynthesis
      if (ttsKeepAliveRef.current) window.clearInterval(ttsKeepAliveRef.current);
      ttsKeepAliveRef.current = window.setInterval(() => {
        if (synth.speaking && !synth.paused) {
          synth.pause();
          synth.resume();
        }
      }, 8000);

      ttsTimerRef.current = window.setInterval(() => {
        elapsed += 0.5;
        const pct = Math.min(1, elapsed / estimatedDuration);
        setProgress(pct);
        const id = currentRef.current?.id;
        if (id) setProgressMap((m) => ({ ...m, [id]: pct }));

        if (pct >= 1) {
          stopTTS();
          setIsPlaying(false);
          nextRef.current?.();
        }
      }, 500);
    } else {
      setIsPlaying(false);
    }
  }, [stopTTS]);

  // ---- Core ----
  const loadOrPlay = useCallback((p: Podcast, q: Podcast[] | undefined, autoplay: boolean) => {
    updatePodcast(p.id, { plays: (p.plays || 0) + 1 });
    setCurrent(p);
    if (q) setQueueState(q);
    let savedPct = progressMap[p.id] ?? 0;
    if (savedPct >= 0.95) {
      savedPct = 0;
      setProgressMap((m) => ({ ...m, [p.id]: 0 }));
    }
    const startFromPct = savedPct;
    addToHistory(p.id, startFromPct);
    const a = audioRef.current;

    // Get actual duration from map or fallback to p.duration
    const actualDuration = durationMap[p.id] || p.duration || 0;

    const isTTS = !!p.script && !!p.ttsLang;
    const isRealYT = p.youtubeId && !p.youtubeId.startsWith("custom-yt");

    // Pause other engines
    if (a) {
      a.pause();
    }
    if (ytRef.current) {
      try { ytRef.current.pauseVideo(); } catch {}
    }
    stopTTS();

    if (isTTS) {
      playTTS(p, autoplay, startFromPct);
    } else if (isRealYT) {
      if (a) { a.removeAttribute("src"); a.load(); }

      if (ytRef.current && ytReadyRef.current) {
        try {
          // Use cueVideoById for non-autoplay (loadVideoById always autoplays)
          if (autoplay) {
            ytRef.current.loadVideoById({ videoId: p.youtubeId!, startSeconds: startFromPct * actualDuration });
          } else {
            ytRef.current.cueVideoById({ videoId: p.youtubeId!, startSeconds: startFromPct * actualDuration });
          }
          ytRef.current.setVolume(Math.round(volume * 100));
          setIsPlaying(autoplay);
        } catch { setIsPlaying(autoplay); }
      } else {
        // queue for when YT ready
        pendingLoadRef.current = { id: p.youtubeId!, start: startFromPct * actualDuration, autoplay };
        setIsPlaying(autoplay);
      }
      setProgress(startFromPct);
    } else if (p.audioUrl && a) {
      const handleLoadedMetadata = () => {
        if (startFromPct > 0 && a.duration) a.currentTime = startFromPct * a.duration;
        if (autoplay) a.play().catch(() => {});
      };
      a.addEventListener("loadedmetadata", function once() {
        a.removeEventListener("loadedmetadata", once);
        handleLoadedMetadata();
      });
      a.src = p.audioUrl;
      setIsPlaying(autoplay);
    }
  }, [progressMap, durationMap, volume, playTTS, stopTTS, updatePodcast]);

  const play = useCallback((p: Podcast, q?: Podcast[]) => loadOrPlay(p, q, true), [loadOrPlay]);
  const load = useCallback((p: Podcast, q?: Podcast[]) => loadOrPlay(p, q, false), [loadOrPlay]);

  const toggle = useCallback(() => {
    if (!current) return;
    const isTTS = !!current.script && !!current.ttsLang;
    if (isTTS) {
      const synth = window.speechSynthesis;
      if (isPlaying) {
        synth.pause();
        setIsPlaying(false);
        if (ttsTimerRef.current) {
          window.clearInterval(ttsTimerRef.current);
          ttsTimerRef.current = null;
        }
        if (ttsKeepAliveRef.current) {
          window.clearInterval(ttsKeepAliveRef.current);
          ttsKeepAliveRef.current = null;
        }
      } else {
        if (synth.paused) {
          synth.resume();
        } else {
          playTTS(current, true, progress);
          return;
        }
        setIsPlaying(true);
        const estimatedDuration = duration || 180;
        let elapsed = progress * estimatedDuration;

        // Restart keep alive
        if (ttsKeepAliveRef.current) window.clearInterval(ttsKeepAliveRef.current);
        ttsKeepAliveRef.current = window.setInterval(() => {
          if (synth.speaking && !synth.paused) {
            synth.pause();
            synth.resume();
          }
        }, 8000);

        ttsTimerRef.current = window.setInterval(() => {
          elapsed += 0.5;
          const pct = Math.min(1, elapsed / estimatedDuration);
          setProgress(pct);
          const id = currentRef.current?.id;
          if (id) setProgressMap((m) => ({ ...m, [id]: pct }));
          if (pct >= 1) {
            stopTTS();
            setIsPlaying(false);
            nextRef.current?.();
          }
        }, 500);
      }
      return;
    }

    const isRealYT = current.youtubeId && !current.youtubeId.startsWith("custom-yt");
    if (isRealYT && ytRef.current) {
      if (isPlaying) ytRef.current.pauseVideo();
      else ytRef.current.playVideo();
      setIsPlaying((s) => !s);
      return;
    }
    const a = audioRef.current;
    if (!a) return;
    if (a.paused) { a.play().catch(() => {}); setIsPlaying(true); }
    else { a.pause(); setIsPlaying(false); }
  }, [current, isPlaying, playTTS, progress, duration, stopTTS]);

  const next = useCallback(() => {
    if (!queue.length || !current) return;
    let idx = queue.findIndex((q) => q.id === current.id);
    if (shuffle) idx = Math.floor(Math.random() * queue.length);
    else idx = (idx + 1) % queue.length;
    play(queue[idx], queue);
  }, [queue, current, shuffle, play]);

  const prev = useCallback(() => {
    if (!queue.length || !current) return;
    const idx = queue.findIndex((q) => q.id === current.id);
    const target = (idx - 1 + queue.length) % queue.length;
    play(queue[target], queue);
  }, [queue, current, play]);

  const nextRef = useRef(next);
  useEffect(() => { nextRef.current = next; }, [next]);

  const seek = useCallback((pct: number) => {
    if (!current) return;
    const id = current.id;
    setProgressMap((m) => ({ ...m, [id]: pct }));

    const isTTS = !!current.script && !!current.ttsLang;
    if (isTTS) {
      setProgress(pct);
      playTTS(current, isPlaying, pct);
      return;
    }

    const isRealYT = current.youtubeId && !current.youtubeId.startsWith("custom-yt");
    if (isRealYT && ytRef.current) {
      const d = ytRef.current.getDuration?.() || duration;
      if (d) { ytRef.current.seekTo(pct * d, true); setProgress(pct); }
      return;
    }
    const a = audioRef.current;
    if (!a || !a.duration) return;
    a.currentTime = pct * a.duration;
    setProgress(pct);
  }, [current, duration, playTTS, isPlaying]);

  const seekBy = useCallback((seconds: number) => {
    if (!current) return;
    const id = current.id;
    const isTTS = !!current.script && !!current.ttsLang;
    if (isTTS) {
      const d = duration || 180;
      const nt = Math.max(0, Math.min(d, (progress * d) + seconds));
      const pct = nt / d;
      setProgress(pct);
      playTTS(current, isPlaying, pct);
      return;
    }

    const isRealYT = current.youtubeId && !current.youtubeId.startsWith("custom-yt");
    if (isRealYT && ytRef.current) {
      try {
        const t = ytRef.current.getCurrentTime?.() ?? 0;
        const d = ytRef.current.getDuration?.() || duration || 1;
        const nt = Math.max(0, Math.min(d, t + seconds));
        ytRef.current.seekTo(nt, true);
        const pct = nt / d;
        setProgress(pct);
        setProgressMap((m) => ({ ...m, [id]: pct }));
      } catch { /* noop */ }
      return;
    }
    const a = audioRef.current;
    if (!a || !a.duration) return;
    const nt = Math.max(0, Math.min(a.duration, a.currentTime + seconds));
    a.currentTime = nt;
    const pct = nt / a.duration;
    setProgress(pct);
    setProgressMap((m) => ({ ...m, [id]: pct }));
  }, [current, duration, progress, playTTS, isPlaying]);

  const toggleLike = (id: string) =>
    setLiked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });

  const addToQueue = (p: Podcast) =>
    setQueueState((q) => (q.some((x) => x.id === p.id) ? q : [...q, p]));
  const removeFromQueue = (id: string) =>
    setQueueState((q) => q.filter((x) => x.id !== id));
  const clearQueue = () => setQueueState([]);
  const setQueue = (q: Podcast[]) => setQueueState(q);

  // ---- YouTube bridge ----
  const registerYouTube = useCallback((player: YTPlayer | null) => {
    ytRef.current = player;
    ytReadyRef.current = !!player;
    if (player) {
      try { player.setVolume(Math.round(volume * 100)); } catch { /* noop */ }
      const pending = pendingLoadRef.current;
      if (pending) {
        try {
          if (pending.autoplay) player.loadVideoById({ videoId: pending.id, startSeconds: pending.start });
          else player.cueVideoById({ videoId: pending.id, startSeconds: pending.start });
        } catch { /* noop */ }
        pendingLoadRef.current = null;
      } else if (current?.youtubeId && !current.youtubeId.startsWith("custom-yt")) {
        try {
          const startSeconds = (progressMap[current.id] ?? 0) * (current.duration || 0);
          player.cueVideoById({ videoId: current.youtubeId, startSeconds });
        } catch { /* noop */ }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current, volume]);

  const reportYouTubeState = useCallback((data: { isPlaying?: boolean; progress?: number; duration?: number }) => {
    if (typeof data.isPlaying === "boolean") setIsPlaying(data.isPlaying);
    if (typeof data.progress === "number") {
      const p = Math.min(1, Math.max(0, data.progress));
      setProgress(p);
      const id = currentRef.current?.id;
      if (id) setProgressMap((m) => ({ ...m, [id]: p }));
    }
    if (typeof data.duration === "number" && data.duration > 0) {
      setDuration(data.duration);
      const id = currentRef.current?.id;
      if (id) setDurationMap((m) => ({ ...m, [id]: data.duration }));
    }
  }, []);

  // ---- Keyboard shortcuts ----
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // Don't hijack typing
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable)) return;
      if (!current) return;
      if (e.code === "Space") { e.preventDefault(); toggle(); }
      else if (e.code === "ArrowRight") { e.preventDefault(); seekBy(5); }
      else if (e.code === "ArrowLeft") { e.preventDefault(); seekBy(-5); }
      else if (e.code === "ArrowUp") { e.preventDefault(); setVolumeState((v) => Math.min(1, v + 0.05)); }
      else if (e.code === "ArrowDown") { e.preventDefault(); setVolumeState((v) => Math.max(0, v - 0.05)); }
      else if (e.code === "KeyM") {
        e.preventDefault();
        toggleMute();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [current, toggle, seekBy]);

  const toggleMute = useCallback(() => {
    setVolumeState((v) => {
      if (v > 0) {
        prevVolumeRef.current = v;
        return 0;
      } else {
        return prevVolumeRef.current || 1.0;
      }
    });
  }, []);

  return (
    <Ctx.Provider
      value={{
        current, queue, isPlaying, progress, duration, volume, speed,
        shuffle, repeat, mode, liked, progressMap, history,
        load, play, toggle, next, prev, seek, seekBy,
        setVolume: (v) => {
          setVolumeState(v);
          if (v > 0) prevVolumeRef.current = v;
        },
        toggleMute,
        setSpeed: (s) => setSpeedState(s),
        toggleShuffle: () => setShuffle((s) => !s),
        toggleRepeat: () => setRepeat((r) => !r),
        toggleLike, addToQueue, removeFromQueue, clearQueue, setQueue,
        setMode: (m) => setModeState(m),
        registerYouTube, reportYouTubeState,
        removeFromHistory, clearHistory,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function usePlayer() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("usePlayer must be used within PlayerProvider");
  return ctx;
}
