import { StudioLayout } from "@/components/StudioLayout";
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload as UploadIcon, ImageIcon, Wand2, Mic2, Volume2, Languages, Loader2, Info, Play, Pause } from "lucide-react";
import { CATEGORIES } from "@/lib/mock-data";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Slider } from "@/components/ui/slider";
import { useNavigate } from "react-router-dom";
import { useCatalog } from "@/contexts/CatalogContext";
import { getTranslation } from "@/lib/tts-utils";

const VOICES = [
  { id: "aria", name: "Aria", desc: "Warm female · English", color: "from-purple-500 to-pink-500" },
  { id: "kai", name: "Kai", desc: "Calm male · Multi-lang", color: "from-blue-500 to-cyan-500" },
  { id: "leela", name: "Leela", desc: "Expressive · Hindi/Tamil", color: "from-fuchsia-500 to-orange-500" },
  { id: "neo", name: "Neo", desc: "Synth voice · Futuristic", color: "from-emerald-500 to-teal-500" },
];

const LANGS = ["English", "Hindi", "Tamil", "Telugu", "Malayalam", "Kannada"];


export default function Upload() {
  const navigate = useNavigate();
  const { addPodcast } = useCatalog();
  const [thumb, setThumb] = useState<string | null>(null);
  const [audioName, setAudioName] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [uploadedDuration, setUploadedDuration] = useState<number>(0);
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [cat, setCat] = useState("");
  const [tags, setTags] = useState("");
  const [lang, setLang] = useState("English");

  // TTS
  const [script, setScript] = useState("");
  const [voice, setVoice] = useState("aria");
  const [ttsLang, setTtsLang] = useState("English");
  const [generating, setGenerating] = useState(false);
  const [genThumb, setGenThumb] = useState<string | null>(null);
  const [thumbPrompt, setThumbPrompt] = useState("");
  const [genThumbLoading, setGenThumbLoading] = useState(false);

  // AI Voiceover states
  const [genAudioName, setGenAudioName] = useState<string | null>(null);
  const [genAudioUrl, setGenAudioUrl] = useState<string | null>(null);
  const [isVoicePlaying, setIsVoicePlaying] = useState(false);
  const [voiceCurrentTime, setVoiceCurrentTime] = useState(0);
  const voiceTimerRef = useRef<number | null>(null);
  const voicePlayerRef = useRef<HTMLAudioElement | null>(null);
  const activeUtterancesRef = useRef<Set<SpeechSynthesisUtterance>>(new Set());
  const voiceKeepAliveRef = useRef<number | null>(null);

  const formatDuration = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  // Cleanup playing voiceover on unmount and load voices on mount
  useEffect(() => {
    let handleVoicesChanged = () => {};
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.getVoices();
      handleVoicesChanged = () => {
        window.speechSynthesis.getVoices();
      };
      window.speechSynthesis.addEventListener("voiceschanged", handleVoicesChanged);
    }
    return () => {
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.removeEventListener("voiceschanged", handleVoicesChanged);
        window.speechSynthesis.cancel();
      }
      if (voicePlayerRef.current) {
        voicePlayerRef.current.pause();
        voicePlayerRef.current = null;
      }
      if (voiceTimerRef.current) {
        clearInterval(voiceTimerRef.current);
        voiceTimerRef.current = null;
      }
      if (voiceKeepAliveRef.current) {
        clearInterval(voiceKeepAliveRef.current);
        voiceKeepAliveRef.current = null;
      }
    };
  }, []);

  const toggleVoicePlay = () => {
    if (typeof window === "undefined" || !window.speechSynthesis) {
      toast.error("Text-to-speech is not supported in this browser.");
      return;
    }
    const synth = window.speechSynthesis;

    const getScriptWords = () => {
      return (script || "Welcome to your AI voiceover.").trim().split(/\s+/).filter(Boolean).length;
    };
    const estimatedDuration = Math.max(3, Math.ceil(getScriptWords() / 2.8 + 1.2));

    if (isVoicePlaying) {
      synth.cancel();
      if (voicePlayerRef.current) voicePlayerRef.current.pause();
      setIsVoicePlaying(false);
      if (voiceTimerRef.current) {
        clearInterval(voiceTimerRef.current);
        voiceTimerRef.current = null;
      }
      if (voiceKeepAliveRef.current) {
        clearInterval(voiceKeepAliveRef.current);
        voiceKeepAliveRef.current = null;
      }
      return;
    }

    setIsVoicePlaying(true);

    // Play background ambient music
    if (!voicePlayerRef.current) {
      voicePlayerRef.current = new Audio("https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3");
      voicePlayerRef.current.volume = 0.03;
      voicePlayerRef.current.loop = true;
    }
    voicePlayerRef.current.volume = 0.03;
    voicePlayerRef.current.play().catch(() => {});

    // Start keep alive heartbeat
    if (voiceKeepAliveRef.current) clearInterval(voiceKeepAliveRef.current);
    voiceKeepAliveRef.current = window.setInterval(() => {
      if (synth.speaking && !synth.paused) {
        synth.pause();
        synth.resume();
      }
    }, 8000);

    // Start playback timer
    if (voiceTimerRef.current) clearInterval(voiceTimerRef.current);
    voiceTimerRef.current = window.setInterval(() => {
      setVoiceCurrentTime((t) => {
        const nextTime = t + 0.25;
        if (nextTime >= estimatedDuration) {
          synth.cancel();
          if (voicePlayerRef.current) {
            voicePlayerRef.current.pause();
            voicePlayerRef.current.currentTime = 0;
          }
          setIsVoicePlaying(false);
          if (voiceTimerRef.current) {
            clearInterval(voiceTimerRef.current);
            voiceTimerRef.current = null;
          }
          return 0; // Reset
        }
        return nextTime;
      });
    }, 250);

    const langCodes: Record<string, string> = {
      "English": "en",
      "Hindi": "hi",
      "Tamil": "ta",
      "Telugu": "te",
      "Malayalam": "ml",
      "Kannada": "kn"
    };
    const targetLangCode = langCodes[ttsLang] || "en";

    const voices = synth.getVoices();
    let textToSpeak = "";
    let matchingVoices = voices.filter(v => v.lang.startsWith(targetLangCode));
    let isFallback = false;

    if (targetLangCode !== "en" && matchingVoices.length === 0 && voices.length > 0) {
      toast.info(`Local ${ttsLang} voice pack not found on your system. Falling back to English voice preview.`);
      matchingVoices = voices.filter(v => v.lang.startsWith("en"));
      isFallback = true;
    }

    textToSpeak = getTranslation(script || "Welcome to your AI voiceover.", ttsLang, title, isFallback);

    const utterance = new SpeechSynthesisUtterance(textToSpeak);

    if (voices.length > 0) {
      const isFemale = voice === "aria" || voice === "leela";
      if (isFemale) {
        utterance.voice = matchingVoices.find(v => 
          v.name.includes("Zira") || 
          v.name.includes("Female") || 
          v.name.includes("Google") || 
          v.name.toLowerCase().includes("woman") ||
          v.name.toLowerCase().includes("girl")
        ) || matchingVoices[0] || voices[0];
        utterance.pitch = voice === "leela" ? 1.15 : 1.0;
      } else {
        utterance.voice = matchingVoices.find(v => 
          v.name.includes("David") || 
          v.name.includes("Male") || 
          v.name.includes("Google") ||
          v.name.toLowerCase().includes("man") ||
          v.name.toLowerCase().includes("boy")
        ) || matchingVoices[0] || voices[0];
        utterance.pitch = voice === "neo" ? 0.85 : 1.0;
      }
    }

    utterance.onend = () => {
      activeUtterancesRef.current.delete(utterance);
      setIsVoicePlaying(false);
      if (voicePlayerRef.current) {
        voicePlayerRef.current.pause();
        voicePlayerRef.current.currentTime = 0;
      }
      if (voiceTimerRef.current) {
        clearInterval(voiceTimerRef.current);
        voiceTimerRef.current = null;
      }
      if (voiceKeepAliveRef.current) {
        clearInterval(voiceKeepAliveRef.current);
        voiceKeepAliveRef.current = null;
      }
      setVoiceCurrentTime(0);
    };

    utterance.onerror = (e) => {
      activeUtterancesRef.current.delete(utterance);
      console.error("TTS error:", e);
      setIsVoicePlaying(false);
      if (voicePlayerRef.current) {
        voicePlayerRef.current.pause();
      }
      if (voiceTimerRef.current) {
        clearInterval(voiceTimerRef.current);
        voiceTimerRef.current = null;
      }
      if (voiceKeepAliveRef.current) {
        clearInterval(voiceKeepAliveRef.current);
        voiceKeepAliveRef.current = null;
      }
      setVoiceCurrentTime(0);
    };

    // Store reference to prevent garbage collection
    activeUtterancesRef.current.add(utterance);

    synth.cancel();
    setTimeout(() => {
      synth.speak(utterance);
    }, 100);
  };

  const handleFile = (file: File | undefined, kind: "thumb" | "audio") => {
    if (!file) return;
    if (kind === "thumb") {
      const url = URL.createObjectURL(file);
      setThumb(url);
      setGenThumb(null);
    } else {
      const url = URL.createObjectURL(file);
      setAudioName(file.name);
      setAudioUrl(url);

      if (typeof window !== "undefined") {
        const tempAudio = new Audio(url);
        tempAudio.addEventListener("loadedmetadata", () => {
          setUploadedDuration(Math.ceil(tempAudio.duration));
        });
      }

      // Clear generated AI audio
      setGenAudioName(null);
      setGenAudioUrl(null);
      setVoiceCurrentTime(0);
      if (voicePlayerRef.current) {
        voicePlayerRef.current.pause();
        voicePlayerRef.current = null;
        setIsVoicePlaying(false);
      }
      if (voiceTimerRef.current) {
        clearInterval(voiceTimerRef.current);
        voiceTimerRef.current = null;
      }
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    }
  };

  const generateAudio = () => {
    if (!script.trim()) return toast.error("Add a script first");
    setGenerating(true);

    // Clear manual audio
    setAudioName(null);
    setAudioUrl(null);
    setVoiceCurrentTime(0);

    if (voicePlayerRef.current) {
      voicePlayerRef.current.pause();
      voicePlayerRef.current = null;
      setIsVoicePlaying(false);
    }
    if (voiceTimerRef.current) {
      clearInterval(voiceTimerRef.current);
      voiceTimerRef.current = null;
    }
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }

    setTimeout(() => {
      setGenerating(false);
      const name = `ai_voiceover_${Date.now()}.mp3`;
      setGenAudioName(name);
      setGenAudioUrl("https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3");
      toast.success("AI voiceover generated");
    }, 300);
  };

  const generateThumb = () => {
    if (!thumbPrompt.trim()) return toast.error("Describe your thumbnail");
    setGenThumbLoading(true);
    setTimeout(() => {
      const images = [
        "photo-1590602847861-f357a9332bbc", // microphone neon
        "photo-1610116306796-6ebd30d79122", // headphone mic
        "photo-1478737270239-2f02b77fc618", // vintage mic
        "photo-1487180142328-0c4e37023af5", // headphone audio
        "photo-1618609373036-8ca89e104341", // neon headphone
        "photo-1516280440614-37939bbacd6a", // mic neon
        "photo-1508700115892-45ecd05ae2ad", // mixer neon
        "photo-1519751138087-5bf79df62d5b", // colorful sound
        "photo-1598488035139-bdbb2231ce04", // recording studio
        "photo-1559526324-4b87b5e36e44", // podcasting couple
      ];
      // Simple hash to consistently pick the same image for the same prompt
      let hash = 0;
      for (let i = 0; i < thumbPrompt.length; i++) {
        hash = thumbPrompt.charCodeAt(i) + ((hash << 5) - hash);
      }
      const index = Math.abs(hash) % images.length;
      const photoId = images[index];
      const imageUrl = `https://images.unsplash.com/${photoId}?w=600&auto=format&fit=crop&q=80&sig=${Math.abs(hash)}`;

      setGenThumb(imageUrl);
      setThumb(null);
      setGenThumbLoading(false);
      toast.success("Thumbnail generated");
    }, 300);
  };

  const publish = () => {
    if (!title || !cat || (!thumb && !genThumb) || (!audioName && !genAudioName)) {
      return toast.error("Title, thumbnail, audio and category are required");
    }

    const getScriptWords = () => {
      return (script || "Welcome to your AI voiceover.").trim().split(/\s+/).filter(Boolean).length;
    };
    const estimatedDuration = Math.max(3, Math.ceil(getScriptWords() / 2.8 + 1.2));
    const isTTS = !!(genAudioUrl || (script.trim() && !audioUrl));
    const finalDuration = isTTS ? estimatedDuration : (uploadedDuration || 1800);

    try {
      addPodcast({
        title: title.trim(),
        creator: "AI Creator",
        category: cat,
        language: lang || "English",
        tags: tags ? tags.split(",").map((t) => t.trim()) : [],
        description: desc.trim(),
        cover: thumb || genThumb || "",
        youtubeId: `custom-yt-${Date.now()}`,
        duration: finalDuration,
        audioUrl: audioUrl || genAudioUrl || undefined,
        script: script.trim() || undefined,
        voice: voice || undefined,
        ttsLang: ttsLang || undefined,
      });

      toast.success("🚀 Episode published!");
      navigate("/studio");
    } catch (e) {
      toast.error("Failed to publish episode");
    }
  };

  const saveAsDraft = () => {
    if (!title.trim()) {
      return toast.error("Title is required to save as a draft");
    }

    const getScriptWords = () => {
      return (script || "Welcome to your AI voiceover.").trim().split(/\s+/).filter(Boolean).length;
    };
    const estimatedDuration = Math.max(3, Math.ceil(getScriptWords() / 2.8 + 1.2));
    const isTTS = !!(genAudioUrl || (script.trim() && !audioUrl));
    const finalDuration = isTTS ? estimatedDuration : (uploadedDuration || 1800);

    const newDraft = {
      id: `draft-${Date.now()}`,
      title: title.trim(),
      description: desc.trim(),
      category: cat || "Startup",
      language: lang || "English",
      tags: tags ? tags.split(",").map((t) => t.trim()) : [],
      cover: thumb || genThumb || "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=600&auto=format&fit=crop&q=80",
      duration: finalDuration,
      plays: 0,
      rating: 5.0,
      isDraft: true,
      editedAt: new Date().toISOString(),
      script: script.trim(),
      voice: voice,
      ttsLang: ttsLang,
      thumbPrompt: thumbPrompt.trim(),
      audioUrl: audioUrl || genAudioUrl || undefined,
      audioName: audioName || genAudioName || undefined,
    };

    try {
      const STORAGE_KEY = "podify.drafts.v1";
      const existingRaw = localStorage.getItem(STORAGE_KEY);
      const existing = existingRaw ? JSON.parse(existingRaw) : [];
      const updated = [newDraft, ...existing];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

      toast.success("Draft saved successfully!");
      navigate("/studio/drafts");
    } catch (e) {
      toast.error("Failed to save draft");
    }
  };

  return (
    <StudioLayout title="Upload studio" subtitle="Upload your audio or generate it from a script with AI.">
      <div className="grid gap-6 lg:grid-cols-3">
        {/* LEFT — main form */}
        <div className="space-y-6 lg:col-span-2">
          <Card title="Episode details">
            <div className="space-y-4">
              <div>
                <Label>Title</Label>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="The future of AI podcasting" className="mt-1.5" />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea rows={4} value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="What's this episode about?" className="mt-1.5" />
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <Label>Category</Label>
                  <Select value={cat} onValueChange={setCat}>
                    <SelectTrigger className="mt-1.5"><SelectValue placeholder="Pick one" /></SelectTrigger>
                    <SelectContent>{CATEGORIES.map((c) => <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Language</Label>
                  <Select value={lang} onValueChange={setLang}>
                    <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                    <SelectContent>{LANGS.map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Tags</Label>
                  <Input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="ai, future, indie" className="mt-1.5" />
                </div>
              </div>
            </div>
          </Card>

          <Card title="Audio">
            <div className="grid gap-4 md:grid-cols-2">
              <DropZone
                icon={<UploadIcon className="h-8 w-8" />}
                title={audioName || "Drop your MP3 / WAV"}
                subtitle="Up to 500MB"
                accept="audio/*"
                onFile={(f) => handleFile(f, "audio")}
              />
              <div className="rounded-2xl border border-dashed border-primary/40 bg-primary/5 p-5">
                <div className="flex items-center gap-2 text-primary-glow">
                  <Wand2 className="h-5 w-5" />
                  <h3 className="font-semibold">AI Text-to-Speech Generator</h3>
                </div>
                <Textarea
                  value={script}
                  onChange={(e) => setScript(e.target.value)}
                  placeholder="Paste your script…"
                  className="mt-3 text-xs leading-relaxed scrollbar-thin h-24 resize-none"
                />
                <div className="mt-3 grid grid-cols-2 gap-3">
                  <Select value={ttsLang} onValueChange={setTtsLang}>
                    <SelectTrigger><Languages className="mr-2 h-4 w-4" /><SelectValue /></SelectTrigger>
                    <SelectContent>{LANGS.map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}</SelectContent>
                  </Select>
                  <Select value={voice} onValueChange={setVoice}>
                    <SelectTrigger><Mic2 className="mr-2 h-4 w-4" /><SelectValue /></SelectTrigger>
                    <SelectContent>{VOICES.map((v) => <SelectItem key={v.id} value={v.id}>{v.name} · {v.desc}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  {VOICES.map((v) => (
                    <button
                      key={v.id}
                      onClick={() => setVoice(v.id)}
                      className={cn(
                        "rounded-xl border p-2 text-left text-xs transition",
                        voice === v.id ? "border-primary/60 bg-primary/10" : "border-border/60 hover:border-primary/30",
                      )}
                    >
                      <div className={`h-1.5 w-full rounded-full bg-gradient-to-r ${v.color}`} />
                      <div className="mt-2 font-semibold">{v.name}</div>
                      <div className="text-muted-foreground">{v.desc}</div>
                    </button>
                  ))}
                </div>
                <div className="mt-4 rounded-xl border border-border/40 bg-card/45 p-3 text-[11.5px] text-muted-foreground leading-normal flex items-start gap-2">
                  <Info className="h-4 w-4 shrink-0 text-primary-glow mt-0.5" />
                  <div>
                    <span className="font-semibold text-foreground">Usage Tip:</span> Select the target language and voice. The generator dynamically translates your script and plays it back using the browser's native text-to-speech voice pack for that language.
                  </div>
                </div>
                <Button disabled={generating} onClick={generateAudio} className="mt-4 w-full bg-gradient-primary shadow-glow">
                  {generating ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating…</> : <><Volume2 className="mr-2 h-4 w-4" /> Generate AI voiceover</>}
                </Button>
                {genAudioName && (
                  <div className="mt-4 rounded-xl border border-primary/20 bg-primary/5 p-4 space-y-3 animate-fade-in">
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-semibold truncate text-primary-glow">{genAudioName}</div>
                        <div className="text-[10px] text-muted-foreground mt-0.5">AI Voiceover Preview</div>
                      </div>
                      <Button
                        size="sm"
                        onClick={toggleVoicePlay}
                        className="h-8 rounded-lg bg-gradient-primary shadow-glow text-xs shrink-0 flex items-center gap-1.5"
                      >
                        {isVoicePlaying ? (
                          <>
                            <Pause className="h-3.5 w-3.5 fill-white text-white" />
                            Pause
                          </>
                        ) : (
                          <>
                            <Play className="h-3.5 w-3.5 fill-white text-white pl-0.5" />
                            Listen
                          </>
                        )}
                      </Button>
                    </div>

                    {/* Timeline Slider and Timestamps */}
                    <div className="flex items-center gap-3 text-xs font-medium tabular-nums text-muted-foreground">
                      <span>{formatDuration(voiceCurrentTime)}</span>
                      <Slider
                        value={[
                          (() => {
                            const getScriptWords = () => {
                              return (script || "Welcome to your AI voiceover.").trim().split(/\s+/).filter(Boolean).length;
                            };
                            const estimatedDuration = Math.max(3, Math.ceil(getScriptWords() / 2.8 + 1.2));
                            return (voiceCurrentTime / estimatedDuration) * 100;
                          })()
                        ]}
                        max={100}
                        step={0.1}
                        className="flex-1"
                        disabled
                      />
                      <span>
                        {(() => {
                          const getScriptWords = () => {
                            return (script || "Welcome to your AI voiceover.").trim().split(/\s+/).filter(Boolean).length;
                          };
                          const estimatedDuration = Math.max(3, Math.ceil(getScriptWords() / 2.8 + 1.2));
                          return formatDuration(estimatedDuration);
                        })()}
                      </span>
                    </div>
                    {/* Dynamic Translated Spoken Script Preview */}
                    <div className="rounded-lg bg-black/40 border border-border/20 overflow-hidden flex flex-col max-h-24 shrink-0">
                      <div className="px-2.5 py-1 bg-black/60 border-b border-border/10 flex items-center justify-between shrink-0">
                        <span className="font-semibold text-[9px] uppercase tracking-wider text-primary-glow">Spoken Script ({ttsLang})</span>
                      </div>
                      <div className="p-2 text-[9px] leading-relaxed text-muted-foreground overflow-y-auto scrollbar-thin max-h-16">
                        "{(() => {
                          const synth = typeof window !== "undefined" ? window.speechSynthesis : null;
                          const langCodes: Record<string, string> = {
                            "English": "en", "Hindi": "hi", "Tamil": "ta", "Telugu": "te", "Malayalam": "ml", "Kannada": "kn"
                          };
                          const targetLangCode = langCodes[ttsLang] || "en";
                          const voices = synth ? synth.getVoices() : [];
                          const hasMatchingVoice = voices.some(v => v.lang.startsWith(targetLangCode));
                          const isFallback = targetLangCode !== "en" && !hasMatchingVoice && voices.length > 0;
                          return getTranslation(script, ttsLang, title, isFallback);
                        })()}"
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Card>

          <Card title="Thumbnail">
            <div className="grid gap-4 md:grid-cols-2">
              <DropZone
                icon={<ImageIcon className="h-8 w-8" />}
                title={thumb && !genThumb ? "Image uploaded ✓" : "Drop a JPG or PNG"}
                subtitle="Square recommended (1400×1400)"
                accept="image/*"
                onFile={(f) => handleFile(f, "thumb")}
                preview={thumb || undefined}
              />
              <div className="rounded-2xl border border-dashed border-primary/40 bg-primary/5 p-5">
                <div className="flex items-center gap-2 text-primary-glow">
                  <Wand2 className="h-5 w-5" />
                  <h3 className="font-semibold">AI Thumbnail Generator</h3>
                </div>
                <Input
                  value={thumbPrompt}
                  onChange={(e) => setThumbPrompt(e.target.value)}
                  placeholder="e.g. Futuristic AI podcast cover with neon theme"
                  className="mt-3"
                />
                <Button disabled={genThumbLoading} onClick={generateThumb} className="mt-3 w-full bg-gradient-primary shadow-glow">
                  {genThumbLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating…</> : <><Wand2 className="mr-2 h-4 w-4" /> Generate</>}
                </Button>
                {genThumb && <img src={genThumb} alt="" className="mt-3 aspect-square w-full rounded-xl object-cover" />}
              </div>
            </div>
          </Card>
        </div>

        {/* RIGHT — preview */}
        <div className="space-y-4">
          <Card title="Preview">
            <div className="rounded-2xl border border-border/60 bg-background/40 p-4">
              <div className="aspect-square w-full overflow-hidden rounded-xl bg-card">
                {thumb || genThumb ? (
                  <img src={thumb || genThumb!} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="grid h-full place-items-center text-muted-foreground"><ImageIcon className="h-10 w-10" /></div>
                )}
              </div>
              <div className="mt-3">
                <div className="font-display text-lg font-bold">{title || "Episode title"}</div>
                <div className="text-xs text-muted-foreground">{cat || "Category"} · {lang}</div>
                <p className="mt-2 line-clamp-3 text-xs text-muted-foreground">{desc || "Episode description preview."}</p>
              </div>
            </div>
            <Button onClick={publish} className="mt-4 w-full h-11 bg-gradient-primary shadow-glow">
              Publish episode
            </Button>
            <Button onClick={saveAsDraft} variant="outline" className="mt-2 w-full">Save as draft</Button>
          </Card>
        </div>
      </div>
    </StudioLayout>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl glass p-5">
      <h3 className="mb-4 font-display text-lg font-semibold">{title}</h3>
      {children}
    </div>
  );
}

function DropZone({
  icon,
  title,
  subtitle,
  accept,
  onFile,
  preview,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  accept: string;
  onFile: (f: File | undefined) => void;
  preview?: string;
}) {
  return (
    <label className="relative flex aspect-square cursor-pointer flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-border/60 bg-card/30 p-6 text-center transition hover:border-primary/40 hover:bg-card/50">
      {preview ? (
        <img src={preview} alt="" className="absolute inset-0 h-full w-full object-cover" />
      ) : (
        <>
          <div className="text-primary-glow">{icon}</div>
          <div className="mt-3 font-medium">{title}</div>
          <div className="text-xs text-muted-foreground">{subtitle}</div>
        </>
      )}
      <input type="file" accept={accept} onChange={(e) => onFile(e.target.files?.[0])} className="hidden" />
    </label>
  );
}
