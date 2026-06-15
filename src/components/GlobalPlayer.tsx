import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Heart,
  Volume1,
  Volume2,
  VolumeX,
  ListMusic,
  Music,
  Video,
  X,
  ExternalLink,
  Rewind,
  FastForward,
  ChevronUp,
  ChevronDown,
  Trash2,
  Maximize2,
  RotateCw,
} from "lucide-react";
import { usePlayer, type YTPlayer } from "@/contexts/PlayerContext";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { formatDuration } from "@/lib/mock-data";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";
import { SmartImage } from "@/components/SmartImage";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

// --- YouTube IFrame API loader (singleton) -------------------------
let ytApiPromise: Promise<void> | null = null;
function loadYouTubeIframeAPI(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const w = window as any;
  if (w.YT && w.YT.Player) return Promise.resolve();
  if (ytApiPromise) return ytApiPromise;
  ytApiPromise = new Promise<void>((resolve) => {
    const prev = w.onYouTubeIframeAPIReady;
    w.onYouTubeIframeAPIReady = () => {
      prev?.();
      resolve();
    };
    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    document.head.appendChild(tag);
  });
  return ytApiPromise;
}

export function GlobalPlayer() {
  const {
    current,
    isPlaying,
    progress,
    duration,
    volume,
    speed,
    shuffle,
    repeat,
    liked,
    queue,
    mode,
    toggle,
    next,
    prev,
    seek,
    seekBy,
    setVolume,
    toggleMute,
    setSpeed,
    toggleShuffle,
    toggleRepeat,
    toggleLike,
    setMode,
    registerYouTube,
    reportYouTubeState,
    removeFromQueue,
    clearQueue,
    setQueue,
    play,
  } = usePlayer();
  const { user } = useAuth();
  const [showQueue, setShowQueue] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const [isMobilePlayerOpen, setIsMobilePlayerOpen] = useState(false);

  const handleMoveTrack = (index: number, direction: number) => {
    const newQueue = [...queue];
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= newQueue.length) return;
    const temp = newQueue[index];
    newQueue[index] = newQueue[targetIndex];
    newQueue[targetIndex] = temp;
    setQueue(newQueue);
  };

  const ytHostRef = useRef<HTMLDivElement | null>(null);
  const videoContainerRef = useRef<HTMLDivElement | null>(null);
  const ytPlayerRef = useRef<YTPlayer | null>(null);
  const pollRef = useRef<number | null>(null);
  const lastVideoIdRef = useRef<string | null>(null);

  const nextRef = useRef(next);
  const currentRef = useRef(current);
  const removeFromQueueRef = useRef(removeFromQueue);
  const registerYouTubeRef = useRef(registerYouTube);

  const hasPlayedRef = useRef(false);

  useEffect(() => {
    hasPlayedRef.current = false;
  }, [current?.id]);

  useEffect(() => { nextRef.current = next; }, [next]);
  useEffect(() => { currentRef.current = current; }, [current]);
  useEffect(() => { removeFromQueueRef.current = removeFromQueue; }, [removeFromQueue]);
  useEffect(() => { registerYouTubeRef.current = registerYouTube; }, [registerYouTube]);

  // Lock body scroll when queue sidebar is open
  useEffect(() => {
    if (showQueue) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [showQueue]);

  // Keep the floating video panel open when mode is video & a YT episode is playing
  useEffect(() => {
    if (mode === "video" && current?.youtubeId && !current.youtubeId.startsWith("custom-yt")) setShowVideo(true);
    else setShowVideo(false);
  }, [mode, current]);

  // Initialize the YouTube IFrame player exactly once
  useEffect(() => {
    let cancelled = false;
    loadYouTubeIframeAPI().then(() => {
      if (cancelled) return;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const YT = (window as any).YT;
      if (!YT || !ytHostRef.current) return;

      const player = new YT.Player(ytHostRef.current, {
        height: "100%",
        width: "100%",
        videoId: "",
        playerVars: {
          autoplay: 1,
          controls: 0,
          modestbranding: 1,
          rel: 0,
          playsinline: 1,
          iv_load_policy: 3,
        },
        events: {
          onReady: () => {
            ytPlayerRef.current = player as YTPlayer;
            registerYouTubeRef.current(player as YTPlayer);
          },
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          onStateChange: (e: any) => {
            // 1=playing, 2=paused, 0=ended, 3=buffering
            if (e.data === 1) {
              hasPlayedRef.current = true;
              reportYouTubeState({ isPlaying: true, duration: player.getDuration?.() });
            } else if (e.data === 2) {
              if (hasPlayedRef.current) {
                reportYouTubeState({ isPlaying: false });
              }
            } else if (e.data === 0) {
              reportYouTubeState({ isPlaying: false, progress: 1 });
              // advance — let context handle next/repeat
              setTimeout(() => nextRef.current(), 100);
            }
          },
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          onError: (e: any) => {
            const currentPod = currentRef.current;
            if (currentPod) {
              toast.error(`"${currentPod.title}" is unavailable. Skipping...`);
              removeFromQueueRef.current(currentPod.id);
            } else {
              toast.error("Video unavailable. Skipping...");
            }
            setTimeout(() => nextRef.current(), 500);
          },
        },
      });
    });

    // Poll for time/duration while a YT video is active
    pollRef.current = window.setInterval(() => {
      const p = ytPlayerRef.current;
      if (!p || !currentRef.current?.youtubeId || currentRef.current.youtubeId.startsWith("custom-yt")) return;
      try {
        const d = p.getDuration?.() ?? 0;
        const t = p.getCurrentTime?.() ?? 0;
        if (d > 0) reportYouTubeState({ duration: d, progress: t / d });
      } catch { /* not ready */ }
    }, 500);

    return () => {
      cancelled = true;
      if (pollRef.current) window.clearInterval(pollRef.current);
      try { ytPlayerRef.current?.destroy?.(); } catch { /* noop */ }
      ytPlayerRef.current = null;
      registerYouTubeRef.current(null);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, !!current]);



  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const isLiked = current ? liked.has(current.id) : false;
  const elapsed = duration ? progress * duration : 0;
  const isYouTube = !!current?.youtubeId && !current.youtubeId.startsWith("custom-yt");
  const videoVisible = isYouTube && (isMobile ? (isMobilePlayerOpen && mode === "video") : (mode === "video"));

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isFullscreenRotated, setIsFullscreenRotated] = useState(false);

  // Track fullscreen changes to unlock screen orientation automatically when exiting
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isCurrentlyFullscreen = !!(
        document.fullscreenElement ||
        (document as any).webkitFullscreenElement ||
        (document as any).mozFullScreenElement ||
        (document as any).msFullscreenElement
      );
      setIsFullscreen(isCurrentlyFullscreen);
      if (!isCurrentlyFullscreen) {
        setIsFullscreenRotated(false);
        if (screen.orientation && screen.orientation.unlock) {
          try {
            screen.orientation.unlock();
          } catch (e) {
            console.warn("Screen orientation unlock warning:", e);
          }
        }
      }
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
    document.addEventListener("mozfullscreenchange", handleFullscreenChange);
    document.addEventListener("MSFullscreenChange", handleFullscreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener("webkitfullscreenchange", handleFullscreenChange);
      document.removeEventListener("mozfullscreenchange", handleFullscreenChange);
      document.removeEventListener("MSFullscreenChange", handleFullscreenChange);
    };
  }, []);

  const openMobilePlayer = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest("button") || target.closest(".slider-root") || target.closest("span")) return;
    if (window.innerWidth < 768) {
      setIsMobilePlayerOpen(true);
    }
  };

  const handleFullscreen = () => {
    const el = videoContainerRef.current;
    if (!el) return;
    try {
      const isCurrentlyFullscreen = !!(
        document.fullscreenElement ||
        (document as any).webkitFullscreenElement ||
        (document as any).mozFullScreenElement ||
        (document as any).msFullscreenElement
      );

      if (isCurrentlyFullscreen) {
        const exit =
          document.exitFullscreen ||
          (document as any).webkitExitFullscreen ||
          (document as any).mozCancelFullScreen ||
          (document as any).msExitFullscreen;
        if (exit) exit.call(document);
      } else {
        const req =
          el.requestFullscreen ||
          (el as any).webkitRequestFullscreen ||
          (el as any).mozRequestFullScreen ||
          (el as any).msRequestFullscreen;

        if (req) {
          req.call(el);
        }
      }
    } catch (err) {
      console.error("Fullscreen error:", err);
    }
  };

  if (!user) return null;

  return (
    <>
      {/* Player bar — only when something is loaded */}
      {current && (
      <div className="fixed bottom-[68px] left-3 right-3 z-40 md:bottom-4 md:left-[272px] md:right-4">
        <div onClick={openMobilePlayer} className="glass-strong relative overflow-hidden rounded-2xl px-3 py-2 md:px-4 md:py-3 shadow-elegant cursor-pointer md:cursor-default">
          {/* A thin progress line at the very top of the mini-player for mobile */}
          <div className="absolute inset-x-0 top-0 h-0.5 bg-white/10 md:hidden">
            <div className="h-full bg-gradient-primary transition-all" style={{ width: `${progress * 100}%` }} />
          </div>

          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary to-transparent opacity-60" />

          <div className="flex items-center justify-between gap-3 md:gap-5">
            {/* Now playing */}
            <div className="flex min-w-0 flex-1 items-center gap-2.5 md:w-80 md:shrink-0 md:flex-initial">
              <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg md:h-12 md:w-12">
                <SmartImage src={current.cover} alt={current.title} fallbackLabel={current.creator} className="h-full w-full object-cover" />
                {isPlaying && (
                  <div className="absolute inset-x-0 bottom-0 flex h-1.5 items-end justify-center gap-0.5 bg-black/40 px-0.5">
                    {[0, 0.1, 0.2, 0.3, 0.4].map((d) => (
                      <span
                        key={d}
                        className="w-0.5 rounded-full bg-gradient-primary animate-wave"
                        style={{ animationDelay: `${d}s`, height: "70%" }}
                      />
                    ))}
                  </div>
                )}
              </div>
              <div className="min-w-0">
                <div className="truncate text-xs font-semibold md:text-sm">{current.title}</div>
                <div className="truncate text-[10px] text-muted-foreground md:text-xs">{current.creator}</div>
              </div>
              <button
                onClick={() => toggleLike(current.id)}
                className={cn(
                  "ml-1 hidden shrink-0 rounded-full p-1.5 md:block",
                  isLiked ? "text-neon-pink" : "text-muted-foreground hover:text-foreground",
                )}
                aria-label="Like"
              >
                <Heart className={cn("h-4 w-4", isLiked && "fill-current")} />
              </button>
            </div>

            {/* Mobile controls (Play/Pause + Skip next) */}
            <div className="flex items-center gap-1 md:hidden">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggle();
                }}
                className="p-2 text-foreground hover:text-primary transition-colors"
                aria-label={isPlaying ? "Pause" : "Play"}
              >
                {isPlaying ? <Pause className="h-5 w-5 fill-current" /> : <Play className="h-5 w-5 fill-current pl-0.5" />}
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  next();
                }}
                className="p-2 text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Next track"
              >
                <SkipForward className="h-5 w-5" />
              </button>
            </div>

            {/* Controls */}
            <div className="hidden md:flex flex-1 flex-col items-center gap-1.5">
              <div className="flex items-center gap-2 md:gap-3">
                <button
                  onClick={toggleShuffle}
                  className={cn("hidden rounded-full p-1.5 transition md:block", shuffle ? "text-primary" : "text-muted-foreground hover:text-foreground")}
                  aria-label="Shuffle"
                >
                  <Shuffle className="h-4 w-4" />
                </button>
                <button onClick={prev} className="hidden rounded-full p-1.5 text-muted-foreground hover:text-foreground md:block" aria-label="Previous">
                  <SkipBack className="h-5 w-5" />
                </button>
                <button onClick={() => seekBy(-5)} className="rounded-full p-1.5 text-muted-foreground hover:text-foreground" aria-label="Back 5 seconds" title="-5s (←)">
                  <Rewind className="h-4 w-4" />
                </button>
                <button
                  onClick={toggle}
                  className="grid h-10 w-10 place-items-center rounded-full bg-gradient-primary shadow-glow transition hover:scale-105"
                  aria-label={isPlaying ? "Pause" : "Play"}
                >
                  {isPlaying ? <Pause className="h-5 w-5 fill-white text-white" /> : <Play className="h-5 w-5 fill-white text-white pl-0.5" />}
                </button>
                <button onClick={() => seekBy(5)} className="rounded-full p-1.5 text-muted-foreground hover:text-foreground" aria-label="Forward 5 seconds" title="+5s (→)">
                  <FastForward className="h-4 w-4" />
                </button>
                <button onClick={next} className="hidden rounded-full p-1.5 text-muted-foreground hover:text-foreground md:block" aria-label="Next">
                  <SkipForward className="h-5 w-5" />
                </button>
                <button
                  onClick={toggleRepeat}
                  className={cn("hidden rounded-full p-1.5 transition md:block", repeat ? "text-primary" : "text-muted-foreground hover:text-foreground")}
                  aria-label="Repeat"
                >
                  <Repeat className="h-4 w-4" />
                </button>
              </div>

              <div className="flex w-full items-center gap-2 text-[10px] tabular-nums text-muted-foreground">
                <span className="hidden w-12 text-right md:inline">{formatDuration(elapsed)}</span>
                <Slider
                  value={[progress * 100]}
                  max={100}
                  step={0.1}
                  onValueChange={(v) => seek(v[0] / 100)}
                  className="flex-1"
                />
                <span className="hidden w-12 md:inline">{formatDuration(duration || current.duration)}</span>
              </div>
            </div>

            {/* Right tools */}
            <div className="hidden shrink-0 items-center gap-3 md:flex md:w-80 md:justify-end">
              {/* Audio / Video toggle — only meaningful for YouTube items */}
              {isYouTube && (
                <div className="flex shrink-0 items-center gap-1 p-0.5 rounded-full border border-border/60 bg-card/40 text-xs">
                  <button
                    onClick={() => setMode("audio")}
                    className={cn(
                      "flex shrink-0 items-center gap-1.5 px-3 py-1 transition rounded-full",
                      mode === "audio" ? "bg-gradient-primary text-white shadow-glow-sm" : "text-muted-foreground hover:text-foreground",
                    )}
                    aria-pressed={mode === "audio"}
                    aria-label="Audio only"
                  >
                    <Music className="h-3.5 w-3.5" /> Audio
                  </button>
                  <button
                    onClick={() => setMode("video")}
                    className={cn(
                      "flex shrink-0 items-center gap-1.5 px-3 py-1 transition rounded-full",
                      mode === "video" ? "bg-gradient-primary text-white shadow-glow-sm" : "text-muted-foreground hover:text-foreground",
                    )}
                    aria-pressed={mode === "video"}
                    aria-label="Video"
                  >
                    <Video className="h-3.5 w-3.5" /> Video
                  </button>
                </div>
              )}

              <Popover>
                <PopoverTrigger asChild>
                  <button className="rounded-full px-2 py-1 text-xs font-medium text-muted-foreground hover:text-foreground">
                    {speed}×
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-32 p-1 glass-strong">
                  {[0.75, 1, 1.25, 1.5, 1.75, 2].map((s) => (
                    <button
                      key={s}
                      onClick={() => setSpeed(s)}
                      className={cn(
                        "block w-full rounded-md px-3 py-1.5 text-left text-sm hover:bg-primary/20",
                        speed === s && "bg-primary/20 text-primary",
                      )}
                    >
                      {s}× {s === 1 && "Normal"}
                    </button>
                  ))}
                </PopoverContent>
              </Popover>

              <button
                onClick={() => setShowQueue((s) => !s)}
                className={cn("rounded-full p-1.5", showQueue ? "text-primary" : "text-muted-foreground hover:text-foreground")}
                aria-label="Queue"
              >
                <ListMusic className="h-4 w-4" />
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={toggleMute}
                  className="text-muted-foreground hover:text-foreground transition-colors shrink-0"
                  aria-label={volume === 0 ? "Unmute" : "Mute"}
                >
                  {volume === 0 ? (
                    <VolumeX className="h-4 w-4 text-primary-glow" />
                  ) : volume <= 0.5 ? (
                    <Volume1 className="h-4 w-4" />
                  ) : (
                    <Volume2 className="h-4 w-4" />
                  )}
                </button>
                <Slider
                  value={[volume * 100]}
                  max={100}
                  onValueChange={(v) => setVolume(v[0] / 100)}
                  className="w-24"
                />
              </div>
            </div>
          </div>

        </div>
      </div>
      )}

      {/* Backdrop overlay */}
      {showQueue && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
          onClick={() => setShowQueue(false)}
        />
      )}

      {/* Sliding Queue Sidebar */}
      <div
        className={cn(
          "fixed top-0 right-0 bottom-0 z-50 w-full md:w-[400px] border-l border-border/40 bg-background/95 backdrop-blur-2xl shadow-elegant transition-transform duration-300 ease-out flex flex-col p-6",
          showQueue ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/40 pb-4 mb-4 shrink-0">
          <div className="flex items-center gap-2">
            <ListMusic className="h-5 w-5 text-primary-glow" />
            <h2 className="text-lg font-bold font-display">Up Next</h2>
          </div>
          <div className="flex items-center gap-3">
            {queue.length > 0 && (
              <button
                onClick={clearQueue}
                className="text-xs font-medium text-muted-foreground hover:text-primary transition-colors"
              >
                Clear Queue
              </button>
            )}
            <button
              onClick={() => setShowQueue(false)}
              className="rounded-full p-1.5 text-muted-foreground hover:bg-card-accent hover:text-foreground transition"
              aria-label="Close queue"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Now Playing card */}
        {current && (
          <div className="shrink-0 mb-6">
            <div className="text-[10px] font-bold uppercase tracking-wider text-primary mb-3 font-display">
              Now Playing
            </div>
            <div className="flex items-center gap-4 p-3 rounded-xl bg-card border border-border/40 shadow-sm relative overflow-hidden group">
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg shadow-elegant">
                <SmartImage
                  src={current.cover}
                  alt={current.title}
                  fallbackLabel={current.creator}
                  className="h-full w-full object-cover"
                />
                
                {/* Play/Pause overlay on hover */}
                <button
                  onClick={toggle}
                  className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label={isPlaying ? "Pause" : "Play"}
                >
                  {isPlaying ? (
                    <Pause className="h-6 w-6 fill-white text-white" />
                  ) : (
                    <Play className="h-6 w-6 fill-white text-white pl-0.5" />
                  )}
                </button>

                {/* Equalizer waves when playing and NOT hovered */}
                {isPlaying && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 group-hover:opacity-0 pointer-events-none transition-opacity">
                    <div className="flex items-end gap-1 h-6">
                      {[0, 0.1, 0.2, 0.3].map((d) => (
                        <span
                          key={d}
                          className="w-1 rounded-full bg-gradient-primary animate-wave"
                          style={{ animationDelay: `${d}s`, height: "60%" }}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="font-semibold text-sm truncate leading-snug">{current.title}</h4>
                <p className="text-xs text-muted-foreground truncate mt-0.5">{current.creator}</p>
                <div className="text-[10px] text-muted-foreground/80 mt-1.5 flex items-center gap-1.5 font-medium">
                  <span>{formatDuration(elapsed)}</span>
                  <span>/</span>
                  <span>{formatDuration(duration || current.duration)}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Scrollable list */}
        <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-3 shrink-0 font-display">
          Next Up ({queue.length})
        </div>

        {queue.length > 0 ? (
          <div className="flex-1 overflow-y-auto pr-1 -mr-2 space-y-1.5 pb-6">
            {queue.map((q, index) => {
              const isPlayingItem = q.id === current?.id;
              return (
                <div
                  key={q.id}
                  className={cn(
                    "group relative flex items-center gap-3 rounded-xl p-2.5 transition duration-200 border border-transparent",
                    isPlayingItem
                      ? "bg-primary/10 border-primary/20"
                      : "hover:bg-card hover:border-border/40"
                  )}
                >
                  <button
                    onClick={() => isPlayingItem ? toggle() : play(q, queue)}
                    className="w-6 h-6 flex items-center justify-center shrink-0 text-xs text-muted-foreground hover:text-primary transition-colors font-semibold"
                    aria-label={isPlayingItem && isPlaying ? "Pause" : "Play"}
                  >
                    {/* Index / Active indicator (shows by default, hidden on hover) */}
                    <div className="md:group-hover:hidden">
                      {isPlayingItem ? (
                        isPlaying ? (
                          <Pause className="h-4 w-4 text-primary" />
                        ) : (
                          <span className="text-primary text-sm">▶</span>
                        )
                      ) : (
                        index + 1
                      )}
                    </div>

                    {/* Interactive Play/Pause button (shows ONLY on hover) */}
                    <div className="hidden md:group-hover:block">
                      {isPlayingItem && isPlaying ? (
                        <Pause className="h-4 w-4" />
                      ) : (
                        <Play className="h-4 w-4 fill-current" />
                      )}
                    </div>
                  </button>

                   <div
                    onClick={() => isPlayingItem ? toggle() : play(q, queue)}
                    className="relative h-11 w-11 shrink-0 overflow-hidden rounded-lg shadow-sm cursor-pointer"
                  >
                    <SmartImage
                      src={q.cover}
                      alt=""
                      fallbackLabel={q.creator}
                      className="h-full w-full object-cover"
                    />
                  </div>

                  <div
                    onClick={() => isPlayingItem ? toggle() : play(q, queue)}
                    className="min-w-0 flex-1 cursor-pointer select-none"
                  >
                    <div
                      className={cn(
                        "truncate text-xs font-semibold leading-snug hover:text-primary transition-colors",
                        isPlayingItem ? "text-primary" : "text-foreground"
                      )}
                    >
                      {q.title}
                    </div>
                    <div className="truncate text-[10px] text-muted-foreground mt-0.5">
                      {q.creator}
                    </div>
                  </div>

                  <div className="text-[10px] text-muted-foreground/80 shrink-0 font-medium tabular-nums group-hover:hidden">
                    {formatDuration(q.duration)}
                  </div>

                  <div className="hidden shrink-0 items-center gap-1 group-hover:flex">
                    <button
                      onClick={() => handleMoveTrack(index, -1)}
                      disabled={index === 0}
                      className="rounded p-1 text-muted-foreground hover:text-foreground hover:bg-card-accent transition-colors disabled:opacity-30 disabled:pointer-events-none"
                      title="Move Up"
                    >
                      <ChevronUp className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => handleMoveTrack(index, 1)}
                      disabled={index === queue.length - 1}
                      className="rounded p-1 text-muted-foreground hover:text-foreground hover:bg-card-accent transition-colors disabled:opacity-30 disabled:pointer-events-none"
                      title="Move Down"
                    >
                      <ChevronDown className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => removeFromQueue(q.id)}
                      className="rounded p-1 text-muted-foreground hover:text-neon-pink hover:bg-card-accent transition-colors"
                      title="Remove from Queue"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center flex-1 py-12 px-4 text-center">
            <div className="w-12 h-12 rounded-full bg-card/60 border border-border/40 flex items-center justify-center mb-3">
              <ListMusic className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-sm">Your Queue is Empty</h3>
            <p className="text-[11px] text-muted-foreground max-w-[220px] mt-1.5 leading-relaxed">
              Add podcasts to your queue to build your next listening session.
            </p>
          </div>
        )}
      </div>

      {/* Mobile Player Overlay */}
      {current && (
        <div
          className={cn(
            "fixed inset-0 z-50 flex flex-col bg-background/95 backdrop-blur-2xl p-6 transition-transform duration-300 md:fixed md:inset-0 md:transform-none md:transition-none md:bg-transparent md:backdrop-blur-none md:p-0 md:pointer-events-none",
            isMobilePlayerOpen ? "translate-y-0" : "translate-y-full"
          )}
        >
          {/* Top bar */}
          <div className="flex items-center justify-between shrink-0 md:hidden">
            <button
              onClick={() => setIsMobilePlayerOpen(false)}
              className="rounded-full p-2 text-muted-foreground hover:bg-card-accent hover:text-foreground transition"
              aria-label="Close player"
            >
              <ChevronDown className="h-6 w-6" />
            </button>
            <span className="font-display text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Now Playing
            </span>
            <div className="w-10" /> {/* Spacer */}
          </div>

          {/* Cover Art (centered, large) */}
          <div className="my-auto flex flex-col items-center justify-center py-4 md:my-0 md:py-0 md:h-0 md:w-0 md:overflow-visible md:pointer-events-none">
            {/* Relative wrapper with constant height to prevent layout shifts when switching audio/video */}
            <div className="relative aspect-square w-full max-w-[280px] flex items-center justify-center md:h-0 md:w-0 md:overflow-visible md:pointer-events-none md:aspect-auto">
              {mode === "video" && isYouTube ? (
                /* A placeholder of the exact size of the overlaying video player, centered vertically */
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[min(380px,calc(100vw-2rem))] aspect-video rounded-2xl bg-black/40 border border-border/20 shadow-glow md:hidden" />
              ) : (
                <div className="w-full h-full overflow-hidden rounded-2xl shadow-glow-strong md:hidden">
                  <SmartImage
                    src={current.cover}
                    alt={current.title}
                    fallbackLabel={current.creator}
                    className="h-full w-full object-cover"
                  />
                </div>
              )}

              {/* Persistent YouTube host — never unmounts, just repositions to keep YT.Player alive */}
              <div
                className={cn(
                  "overflow-hidden bg-black transition-all",
                  videoVisible
                    ? (isMobile
                        ? "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[min(380px,calc(100vw-2rem))] aspect-video rounded-2xl border border-border/60 shadow-glow-strong opacity-100 z-10 pointer-events-auto"
                        : "fixed bottom-28 right-4 w-[min(420px,calc(100vw-1.5rem))] rounded-2xl border border-border/60 shadow-elegant opacity-100 z-50 pointer-events-auto"
                      )
                    : "pointer-events-none fixed -left-[9999px] -top-[9999px] w-[300px] h-[200px] opacity-0"
                )}
                aria-hidden={!videoVisible}
              >
                {videoVisible && current && (
                  <div className="hidden md:flex items-center justify-between gap-2 border-b border-border/40 bg-card/80 px-3 py-1.5 text-xs">
                    <div className="truncate font-medium">{current.title}</div>
                    <div className="flex items-center gap-1">
                      <a
                        href={`https://www.youtube.com/watch?v=${current.youtubeId}`}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded p-1 text-muted-foreground hover:text-foreground"
                        aria-label="Open on YouTube"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                      <button
                        onClick={() => setMode("audio")}
                        className="rounded p-1 text-muted-foreground hover:text-foreground"
                        aria-label="Switch to audio only"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                )}
                <div
                  ref={videoContainerRef}
                  className={cn(
                    videoVisible
                      ? "w-full aspect-video flex items-center justify-center bg-black fullscreen:aspect-auto fullscreen:w-screen fullscreen:h-screen"
                      : "w-full h-full",
                    "relative"
                  )}
                >
                  <div className={cn("w-full h-full flex items-center justify-center relative inner-rotated", isFullscreenRotated && "force-rotated")}>
                    <div ref={ytHostRef} className="w-full h-full aspect-video max-h-full max-w-full" />
                    
                    {/* Custom play/pause click overlay for the video player */}
                    {videoVisible && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/20 z-10 group/overlay">
                        {/* Play/Pause click overlay */}
                        <div onClick={toggle} className="absolute inset-0 z-0 cursor-pointer" />
                        
                        {!isPlaying && (
                          <div
                            onClick={toggle}
                            className="grid h-12 w-12 place-items-center rounded-full bg-black/65 border border-white/20 text-white shadow-glow transition hover:scale-110 z-10 cursor-pointer"
                          >
                            <Play className="h-5 w-5 fill-white text-white pl-0.5" />
                          </div>
                        )}

                        {/* Rotate Option (Visible in fullscreen mode) */}
                        {isFullscreen && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setIsFullscreenRotated((r) => !r);
                            }}
                            className="absolute bottom-2 left-2 p-1.5 rounded-lg bg-black/60 border border-white/10 text-white hover:bg-black/80 hover:scale-105 transition active:scale-95 z-20 cursor-pointer flex items-center gap-1 text-xs"
                            aria-label="Rotate Video"
                          >
                            <RotateCw className="h-4 w-4" />
                            <span>Rotate</span>
                          </button>
                        )}

                        {/* Fullscreen Option */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleFullscreen();
                          }}
                          className="absolute bottom-2 right-2 p-1.5 rounded-lg bg-black/60 border border-white/10 text-white hover:bg-black/80 hover:scale-105 transition active:scale-95 z-20 cursor-pointer"
                          aria-label="Fullscreen"
                        >
                          <Maximize2 className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Metadata & Like button */}
            <div className="w-full max-w-[280px] flex items-center justify-between mt-6 px-1 md:hidden">
              <div className="min-w-0 pr-4">
                <h3 className="font-display font-bold text-lg truncate leading-snug">{current.title}</h3>
                <p className="text-sm text-muted-foreground truncate mt-0.5">{current.creator}</p>
              </div>
              <button
                onClick={() => toggleLike(current.id)}
                className={cn(
                  "shrink-0 rounded-full p-2",
                  isLiked ? "text-neon-pink" : "text-muted-foreground hover:text-foreground"
                )}
                aria-label="Like"
              >
                <Heart className={cn("h-5 w-5", isLiked && "fill-current")} />
              </button>
            </div>
          </div>

          {/* Bottom controls container */}
          <div className="w-full shrink-0 flex flex-col gap-5 pb-4 md:hidden">
            {/* Seeker Progress Slider */}
            <div className="w-full">
              <Slider
                value={[progress * 100]}
                max={100}
                step={0.1}
                onValueChange={(v) => seek(v[0] / 100)}
                className="w-full"
              />
              <div className="flex justify-between text-[10px] tabular-nums text-muted-foreground mt-1.5 px-0.5">
                <span>{formatDuration(elapsed)}</span>
                <span>{formatDuration(duration || current.duration)}</span>
              </div>
            </div>

            {/* Playback Controls */}
            <div className="flex items-center justify-between px-3">
              <button
                onClick={toggleShuffle}
                className={cn("rounded-full p-2 transition", shuffle ? "text-primary" : "text-muted-foreground")}
                aria-label="Shuffle"
              >
                <Shuffle className="h-5 w-5" />
              </button>
              <button
                onClick={prev}
                className="rounded-full p-2 text-muted-foreground hover:text-foreground"
                aria-label="Previous"
              >
                <SkipBack className="h-6 w-6" />
              </button>
              <button
                onClick={() => seekBy(-5)}
                className="rounded-full p-2 text-muted-foreground hover:text-foreground"
                aria-label="Back 5 seconds"
              >
                <Rewind className="h-5 w-5" />
              </button>
              <button
                onClick={toggle}
                className="grid h-14 w-14 place-items-center rounded-full bg-gradient-primary shadow-glow transition hover:scale-105"
                aria-label={isPlaying ? "Pause" : "Play"}
              >
                {isPlaying ? <Pause className="h-6 w-6 fill-white text-white" /> : <Play className="h-6 w-6 fill-white text-white pl-0.5" />}
              </button>
              <button
                onClick={() => seekBy(5)}
                className="rounded-full p-2 text-muted-foreground hover:text-foreground"
                aria-label="Forward 5 seconds"
              >
                <FastForward className="h-5 w-5" />
              </button>
              <button
                onClick={next}
                className="rounded-full p-2 text-muted-foreground hover:text-foreground"
                aria-label="Next"
              >
                <SkipForward className="h-6 w-6" />
              </button>
              <button
                onClick={toggleRepeat}
                className={cn("rounded-full p-2 transition", repeat ? "text-primary" : "text-muted-foreground")}
                aria-label="Repeat"
              >
                <Repeat className="h-5 w-5" />
              </button>
            </div>

            {/* Utilities Sub-row */}
            <div className="flex items-center justify-between px-1 border-t border-border/20 pt-4">
              {/* Playback speed */}
              <Popover>
                <PopoverTrigger asChild>
                  <button className="rounded-full px-3 py-1 text-xs font-semibold bg-card/60 border border-border/40 text-muted-foreground">
                    {speed}×
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-32 p-1 glass-strong z-[60]">
                  {[0.75, 1, 1.25, 1.5, 1.75, 2].map((s) => (
                    <button
                      key={s}
                      onClick={() => setSpeed(s)}
                      className={cn(
                        "block w-full rounded-md px-3 py-1.5 text-left text-sm hover:bg-primary/20",
                        speed === s && "bg-primary/20 text-primary",
                      )}
                    >
                      {s}× {s === 1 && "Normal"}
                    </button>
                  ))}
                </PopoverContent>
              </Popover>

              {/* Audio/Video Toggle */}
              {isYouTube && (
                <div className="flex items-center gap-1 p-0.5 rounded-full border border-border/60 bg-card/40 text-xs">
                  <button
                    onClick={() => setMode("audio")}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1 transition rounded-full",
                      mode === "audio" ? "bg-gradient-primary text-white shadow-glow-sm" : "text-muted-foreground",
                    )}
                  >
                    <Music className="h-3.5 w-3.5" /> Audio
                  </button>
                  <button
                    onClick={() => setMode("video")}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1 transition rounded-full",
                      mode === "video" ? "bg-gradient-primary text-white shadow-glow-sm" : "text-muted-foreground",
                    )}
                  >
                    <Video className="h-3.5 w-3.5" /> Video
                  </button>
                </div>
              )}

              {/* Queue sidebar trigger */}
              <button
                onClick={() => {
                  setShowQueue(true);
                  setIsMobilePlayerOpen(false); // Close mobile player overlay to let Queue render
                }}
                className="rounded-full p-1.5 text-muted-foreground hover:text-foreground"
                aria-label="Queue"
              >
                <ListMusic className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
