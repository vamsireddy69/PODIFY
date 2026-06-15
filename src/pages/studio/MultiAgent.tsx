import { StudioLayout } from "@/components/StudioLayout";
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Bot, Sparkles, Play, Pause, Loader2, Wand2, CheckCircle2, Music, Volume2, VolumeX } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { ParticleField } from "@/components/ParticleField";
import { useCatalog } from "@/contexts/CatalogContext";

const TONES = ["Educational", "Debate", "Storytelling", "Casual"];
const DURATIONS = [5, 10, 30];
const HOSTS = [
  { id: "expert", name: "Expert", emoji: "🎓" },
  { id: "casual", name: "Casual", emoji: "😎" },
  { id: "story", name: "Storyteller", emoji: "📖" },
  { id: "anchor", name: "News Anchor", emoji: "📺" },
  { id: "debate", name: "Debate Mode", emoji: "🥊" },
];

const STEPS = [
  "Drafting multi-host script…",
  "Casting AI voices…",
  "Mixing dialogue & ambience…",
  "Composing intro & outro music…",
  "Generating cover thumbnail…",
  "Mastering final episode…",
];

export default function MultiAgent() {
  const { addPodcast } = useCatalog();
  const [topic, setTopic] = useState("");
  const [tone, setTone] = useState("Educational");
  const [duration, setDuration] = useState(10);
  const [speakers, setSpeakers] = useState(2);
  const [personas, setPersonas] = useState<string[]>(["expert", "casual"]);
  const [running, setRunning] = useState(false);
  const [step, setStep] = useState(-1);
  const [done, setDone] = useState(false);

  // Local demo audio/speech states
  const [localPlaying, setLocalPlaying] = useState(false);
  const [localVolume, setLocalVolume] = useState(0.8);
  const [speakingLine, setSpeakingLine] = useState<number>(-1);
  const [localCurrentTime, setLocalCurrentTime] = useState(0);

  // Refs to control playback and prevent garbage collection / state issues
  const isPlayingRef = useRef(false);
  const activeUtterancesRef = useRef<Set<SpeechSynthesisUtterance>>(new Set());
  const localAudioRef = useRef<HTMLAudioElement | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const timerRef = useRef<number | null>(null);

  const formatDuration = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  const getDialogueScript = () => {
    const hostName1 = HOSTS.find(h => h.id === personas[0])?.name || "Expert";
    const hostName2 = HOSTS.find(h => h.id === personas[1])?.name || "Casual";
    const activeTopic = topic.trim() || "The Rise of AI Music Producers";
    
    const discussions = [
      {
        q: `Let's start by looking at the foundation of ${activeTopic}. Why do you think this has become such a massive trend recently?`,
        a: `Well, it's all about accessibility. In the past, exploring ${activeTopic} required expensive gear or specialized training. Now, with modern AI agents and creators, anyone can get started in seconds.`
      },
      {
        q: `That makes sense. But what about the quality? Some critics say that ${tone.toLowerCase()} content generated this way lacks a human touch.`,
        a: `I think that's a fair concern, but the technology is evolving rapidly. When you look at how creators combine their personal taste with these tools, the results are incredibly polished and unique.`
      },
      {
        q: `Interesting. How does this shift affect traditional creators who have spent years mastering their craft?`,
        a: `It definitely changes the landscape. Instead of replacing creators, it shifts their role to curation, direction, and high-level concept design. It's a new medium of expression.`
      },
      {
        q: `What about the learning curve? Is it easy for beginners to adapt to these new tools?`,
        a: `Absolutely, the barrier to entry has never been lower. However, mastering the prompts and directing the agents to get exactly what you want still requires creative skill.`
      },
      {
        q: `Let's talk about the future. Where do you see this heading in the next five to ten years?`,
        a: `I see a hybrid model where AI agents act as co-creators in real time, helping brainstorm ideas, generate drafts, and polish the final production seamlessly.`
      },
      {
        q: `Are there any major ethical concerns we should keep in mind as this technology becomes more mainstream?`,
        a: `Copyright and attribution are definitely hot topics. We need to establish clear frameworks to protect original artists while encouraging open innovation.`
      },
      {
        q: `How do these tools impact the cost and speed of production for independent creators?`,
        a: `It reduces costs dramatically and speeds up the workflow from weeks to minutes. Creators can experiment with ten different directions in a single afternoon.`
      },
      {
        q: `That's a huge advantage. Do you have any advice for someone looking to get started with this today?`,
        a: `Start small, experiment without expectations, and focus on your unique perspective. The technology is just an amplifier for your ideas.`
      },
      {
        q: `What are some of the most surprising use cases you've seen so far in this space?`,
        a: `We've seen people generate entire serialized audio dramas, personalized educational series, and interactive co-host panels on highly niche topics.`
      },
      {
        q: `How does the choice of tone—like ${tone.toLowerCase()}—affect the way the AI hosts present the content?`,
        a: `It changes everything from vocabulary to pacing. A debate tone introduces lively counterarguments, while an educational tone focuses on structured explainers.`
      },
      {
        q: `What role does collaboration play in these new AI-assisted workflows?`,
        a: `It actually makes collaboration easier. Multiple creators can share prompt templates, style seeds, and agent configurations to co-create rich content portfolios.`
      },
      {
        q: `Do you think audience expectations are shifting as they consume more AI-generated content?`,
        a: `Definitely. Listeners value authenticity and raw perspective even more now, since clean formatting and production can be automated in seconds.`
      },
      {
        q: `How can independent creators monetize content created with these new systems?`,
        a: `By focusing on the community, selling customized versions, offering premium subscriptions, and licensing their refined models or workflows.`
      },
      {
        q: `What are the hosting and distribution challenges for these high-velocity creators?`,
        a: `Managing large audio libraries and reaching listeners across standard directories can be tough, but integrated platforms are simplifying this distribution.`
      },
      {
        q: `Lastly, what sound design and audio engineering improvements can we expect soon?`,
        a: `We will see highly dynamic real-time room acoustic simulation, natural conversational pauses, and automatic atmospheric music styling matching host emotion.`
      }
    ];

    const introLines = [
      { speaker: hostName1, text: `Hello there! In today's episode, we are diving deep into a trending topic: ${activeTopic}.` },
      { speaker: hostName2, text: `Hey everyone! Oh, this is going to be a fun one. I've been seeing ${activeTopic} discussed all over social media. It is quite a big deal.` },
      { speaker: hostName1, text: `It certainly is. From a ${tone.toLowerCase()} perspective, this has massive implications for the industry.` },
      { speaker: hostName2, text: `Totally agree. And since we set our episode tone to ${tone}, let's make sure we deliver all the key takeaways in this ${duration}-minute session.` },
      { speaker: hostName1, text: `Perfect. Let's unpack the core concepts, starting with how this shift affects modern creators.` }
    ];

    const outroLines = [
      { speaker: hostName2, text: `Awesome! Let's get right into it.` },
      { speaker: hostName1, text: `That brings us to the end of this discussion. What a fascinating journey into ${activeTopic}.` },
      { speaker: hostName2, text: `Indeed! Thanks for listening, everyone. Make sure to subscribe and leave a review. See you in the next episode!` },
      { speaker: hostName1, text: `Goodbye everyone, and keep creating!` }
    ];

    const targetSecs = duration * 60;
    
    const getScriptDuration = (script: typeof introLines) => {
      return script.reduce((acc, line) => {
        const words = line.text.split(/\s+/).length;
        const estSecs = Math.max(3, Math.ceil(words / 2.8 + 1.2));
        return acc + estSecs;
      }, 0);
    };

    const introDur = getScriptDuration(introLines);
    const outroDur = getScriptDuration(outroLines);
    
    // The target duration for the discussion middle section is:
    // targetSecs - introDur - outroDur
    const targetMiddleSecs = targetSecs - introDur - outroDur;
    
    let middleScript: typeof introLines = [];
    let middleDur = 0;
    let loopCount = 0;
    
    // Fill the script with discussion points until we span the target duration
    while (middleDur < targetMiddleSecs && loopCount < 300) {
      const pair = discussions[loopCount % discussions.length];
      
      const qWords = pair.q.split(/\s+/).length;
      const qSecs = Math.max(3, Math.ceil(qWords / 2.8 + 1.2));
      
      // Stop if we are already within 8 seconds of the target middle duration
      if (Math.abs(middleDur - targetMiddleSecs) <= 8) {
        break;
      }

      middleScript.push({ speaker: hostName1, text: pair.q });
      middleDur += qSecs;
      
      if (Math.abs(middleDur - targetMiddleSecs) <= 8) {
        break;
      }

      const aWords = pair.a.split(/\s+/).length;
      const aSecs = Math.max(3, Math.ceil(aWords / 2.8 + 1.2));

      middleScript.push({ speaker: hostName2, text: pair.a });
      middleDur += aSecs;
      
      loopCount++;
    }

    // Assemble the full script
    const currentScript = [...introLines, ...middleScript, ...outroLines];

    // Map script lines to include estimated durations and start times
    let accumulatedTime = 0;
    return currentScript.map((line) => {
      const words = line.text.split(/\s+/).length;
      const estSecs = Math.max(3, Math.ceil(words / 2.8 + 1.2));
      const startTime = accumulatedTime;
      accumulatedTime += estSecs;
      return {
        ...line,
        duration: estSecs,
        startTime,
      };
    });
  };

  const scriptLines = getDialogueScript();
  const totalSpeechDuration = scriptLines.reduce((acc, l) => acc + l.duration, 0);

  // Derive display values based on selected configuration duration
  const localDuration = totalSpeechDuration;
  const localProgress = localDuration > 0 ? Math.min(100, (localCurrentTime / localDuration) * 100) : 0;

  // Initialize/warm-up voices on mount
  useEffect(() => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.getVoices();
    }
    return () => {
      isPlayingRef.current = false;
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      if (localAudioRef.current) {
        localAudioRef.current.pause();
        localAudioRef.current = null;
      }
    };
  }, []);

  const speakLine = (index: number) => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    const synth = window.speechSynthesis;

    // Check if user has paused since this line was scheduled
    if (!isPlayingRef.current) return;

    if (index >= scriptLines.length) {
      setSpeakingLine(-1);
      return;
    }

    setSpeakingLine(index);
    const line = scriptLines[index];
    
    // Sync player time to the start of this line to correct any minor timer drift
    setLocalCurrentTime(line.startTime);

    const utterance = new SpeechSynthesisUtterance(line.text);
    utteranceRef.current = utterance;
    activeUtterancesRef.current.add(utterance);

    const voices = synth.getVoices();
    if (voices.length > 0) {
      const isSpeaker1 = index % 2 === 0;
      if (isSpeaker1) {
        // Prefer stable native desktop voices
        utterance.voice = voices.find(v => v.lang.startsWith("en") && (v.name.includes("David") || v.name.includes("Male") || v.name.includes("Google"))) || voices[0];
        utterance.pitch = 1.0;
        utterance.rate = 1.0;
      } else {
        utterance.voice = voices.find(v => v.lang.startsWith("en") && (v.name.includes("Zira") || v.name.includes("Female") || v.name.includes("Google"))) || voices[1] || voices[0];
        utterance.pitch = 1.15;
        utterance.rate = 1.05;
      }
    }

    utterance.onend = () => {
      activeUtterancesRef.current.delete(utterance);
      if (isPlayingRef.current) {
        speakLine(index + 1);
      }
    };

    utterance.onerror = (e) => {
      activeUtterancesRef.current.delete(utterance);
      console.error("Utterance error:", e);
      if (e.error !== "interrupted" && isPlayingRef.current) {
        // Do not stop the whole player, just clear speaking line display
        setSpeakingLine(-1);
      }
    };

    synth.speak(utterance);
  };

  const playLocalDemo = () => {
    if (typeof window === "undefined" || !window.speechSynthesis) {
      toast.error("Text-to-speech is not supported in this browser.");
      return;
    }

    const synth = window.speechSynthesis;
    
    if (localPlaying) {
      // Pause action
      isPlayingRef.current = false;
      setLocalPlaying(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      synth.cancel();
      if (localAudioRef.current) localAudioRef.current.pause();
      return;
    }

    // Play/Resume action
    isPlayingRef.current = true;
    setLocalPlaying(true);
    
    // Play quiet ambient music in background
    if (!localAudioRef.current) {
      const audio = new Audio("https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3");
      audio.volume = localVolume * 0.04; // background ambient is quiet
      audio.loop = true;
      localAudioRef.current = audio;
    }
    localAudioRef.current.volume = localVolume * 0.04;
    localAudioRef.current.play().catch(() => {});
    
    // Cancel first to clear any stuck utterances
    synth.cancel();

    // Start the smooth playback timer at 1 second per second
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = window.setInterval(() => {
      setLocalCurrentTime((t) => {
        const nextTime = t + 0.25;
        if (nextTime >= localDuration) {
          // Finished the entire configured podcast duration
          setLocalPlaying(false);
          isPlayingRef.current = false;
          if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
          }
          if (localAudioRef.current) {
            localAudioRef.current.pause();
            localAudioRef.current.currentTime = 0;
          }
          setSpeakingLine(-1);
          return 0; // reset
        }
        return nextTime;
      });
    }, 250);

    // Use a small timeout to clear the queue and start speaking
    // Determine target script line based on current localCurrentTime
    const targetLineIndex = scriptLines.findIndex(
      (line, i) => localCurrentTime >= line.startTime && (i === scriptLines.length - 1 || localCurrentTime < scriptLines[i + 1].startTime)
    );

    setTimeout(() => {
      if (isPlayingRef.current) {
        if (targetLineIndex !== -1 && localCurrentTime < totalSpeechDuration) {
          speakLine(targetLineIndex);
        } else {
          setSpeakingLine(-1);
        }
      }
    }, 200);
  };

  const handleLocalSeek = (value: number) => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    const synth = window.speechSynthesis;
    
    const seekTime = (value / 100) * localDuration;
    
    // Find which line corresponds to the seeked time
    const targetLineIndex = scriptLines.findIndex(
      (line, i) => seekTime >= line.startTime && (i === scriptLines.length - 1 || seekTime < scriptLines[i + 1].startTime)
    );
    
    // Stop current speaking
    synth.cancel();
    setLocalCurrentTime(seekTime);
    
    if (targetLineIndex !== -1 && seekTime < totalSpeechDuration) {
      setSpeakingLine(targetLineIndex);
    } else {
      setSpeakingLine(-1);
    }
    
    // If it was playing, restart the timer and start speaking from the new line
    if (isPlayingRef.current) {
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = window.setInterval(() => {
        setLocalCurrentTime((t) => {
          const nextTime = t + 0.25;
          if (nextTime >= localDuration) {
            setLocalPlaying(false);
            isPlayingRef.current = false;
            if (timerRef.current) {
              clearInterval(timerRef.current);
              timerRef.current = null;
            }
            if (localAudioRef.current) {
              localAudioRef.current.pause();
              localAudioRef.current.currentTime = 0;
            }
            setSpeakingLine(-1);
            return 0; // reset
          }
          return nextTime;
        });
      }, 250);

      setTimeout(() => {
        if (isPlayingRef.current) {
          if (targetLineIndex !== -1 && seekTime < totalSpeechDuration) {
            speakLine(targetLineIndex);
          }
        }
      }, 200);
    }
  };

  const handleSelectLine = (index: number) => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    const synth = window.speechSynthesis;
    const line = scriptLines[index];
    if (!line) return;

    // Stop current speech
    synth.cancel();
    setLocalCurrentTime(line.startTime);
    setSpeakingLine(index);

    // Ensure ambient music is running
    if (!isPlayingRef.current || !localPlaying) {
      isPlayingRef.current = true;
      setLocalPlaying(true);
      
      if (!localAudioRef.current) {
        const audio = new Audio("https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3");
        audio.volume = localVolume * 0.04;
        audio.loop = true;
        localAudioRef.current = audio;
      }
      localAudioRef.current.volume = localVolume * 0.04;
      localAudioRef.current.play().catch(() => {});
    }

    // Restart the timer
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = window.setInterval(() => {
      setLocalCurrentTime((t) => {
        const nextTime = t + 0.25;
        if (nextTime >= localDuration) {
          setLocalPlaying(false);
          isPlayingRef.current = false;
          if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
          }
          if (localAudioRef.current) {
            localAudioRef.current.pause();
            localAudioRef.current.currentTime = 0;
          }
          setSpeakingLine(-1);
          return 0;
        }
        return nextTime;
      });
    }, 250);

    setTimeout(() => {
      if (isPlayingRef.current) {
        speakLine(index);
      }
    }, 200);
  };

  const handleLocalVolume = (value: number) => {
    setLocalVolume(value);
    if (localAudioRef.current) {
      localAudioRef.current.volume = value * 0.04;
    }
  };

  const publishEpisode = () => {
    addPodcast({
      title: topic.trim() || "AI Generated Podcast",
      creator: personas.map(p => HOSTS.find(h => h.id === p)?.name || p).join(" & ") || "AI Agent",
      category: tone,
      language: "English",
      tags: ["AI Generated", tone],
      description: `An automatically generated episode about: ${topic}. Tone: ${tone}. Duration: ${formatDuration(totalSpeechDuration)}.`,
      youtubeId: "_NLRYgWh2IE", // default backup playable video id
      duration: totalSpeechDuration,
    });
    toast.success("Published to your library!");
  };

  const togglePersona = (id: string) => {
    setPersonas((p) => (p.includes(id) ? p.filter((x) => x !== id) : p.length < speakers ? [...p, id] : p));
  };

  const generate = async () => {
    if (!topic.trim()) return toast.error("Add a topic for the agents");
    setRunning(true);
    setDone(false);
    setLocalPlaying(false);
    isPlayingRef.current = false;
    setSpeakingLine(-1);
    setLocalCurrentTime(0);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    if (localAudioRef.current) {
      localAudioRef.current.pause();
      localAudioRef.current = null;
    }
    for (let i = 0; i < STEPS.length; i++) {
      setStep(i);
      await new Promise((r) => setTimeout(r, 150));
    }
    setRunning(false);
    setDone(true);
    toast.success("Episode generated! Ready to publish.");
  };

  return (
    <StudioLayout title="Multi-Agent Studio" subtitle="A team of AI agents writes, voices and produces a full episode for you.">
      <div className="relative overflow-hidden rounded-3xl">
        <ParticleField className="opacity-50" density={0.08} />
        <div className="pointer-events-none absolute inset-0 bg-gradient-radial opacity-60" />

        <div className="relative grid gap-6 p-6 md:p-10 lg:grid-cols-[1fr_400px]">
          {/* LEFT — config */}
          <div className="space-y-6">
            <div className="rounded-2xl glass-strong p-6">
              <Label className="text-xs uppercase tracking-widest text-primary-glow">Topic</Label>
              <Input value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="The Rise of AI Music Producers" className="mt-2 h-12 text-lg" />
            </div>

            <div className="rounded-2xl glass-strong p-6">
              <Label className="text-xs uppercase tracking-widest text-primary-glow">Tone</Label>
              <div className="mt-3 flex flex-wrap gap-2">
                {TONES.map((t) => (
                  <button
                    key={t}
                    onClick={() => setTone(t)}
                    className={cn(
                      "rounded-full px-4 py-2 text-sm transition",
                      tone === t ? "bg-gradient-primary text-white shadow-glow" : "bg-card/60 hover:bg-card",
                    )}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="rounded-2xl glass-strong p-6">
                <Label className="text-xs uppercase tracking-widest text-primary-glow">Duration</Label>
                <div className="mt-3 flex gap-2">
                  {DURATIONS.map((d) => (
                    <button
                      key={d}
                      onClick={() => setDuration(d)}
                      className={cn(
                        "flex-1 rounded-xl border px-4 py-3 text-center transition",
                        duration === d ? "border-primary/60 bg-primary/10 text-primary-glow" : "border-border/60 hover:border-primary/30",
                      )}
                    >
                      <div className="font-display text-xl font-bold">{d}</div>
                      <div className="text-xs text-muted-foreground">minutes</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl glass-strong p-6">
                <div className="flex items-center justify-between">
                  <Label className="text-xs uppercase tracking-widest text-primary-glow">Speakers</Label>
                  <span className="font-display text-2xl font-bold">{speakers}</span>
                </div>
                <Slider value={[speakers]} min={1} max={4} step={1} onValueChange={(v) => { setSpeakers(v[0]); setPersonas((p) => p.slice(0, v[0])); }} className="mt-4" />
              </div>
            </div>

            <div className="rounded-2xl glass-strong p-6">
              <Label className="text-xs uppercase tracking-widest text-primary-glow">Host personalities</Label>
              <p className="mt-1 text-xs text-muted-foreground">Pick up to {speakers}</p>
              <div className="mt-3 grid grid-cols-2 gap-2 md:grid-cols-5">
                {HOSTS.map((h) => (
                  <button
                    key={h.id}
                    onClick={() => togglePersona(h.id)}
                    className={cn(
                      "rounded-xl border p-3 text-center transition",
                      personas.includes(h.id)
                        ? "border-primary/60 bg-primary/10 shadow-glow"
                        : "border-border/60 hover:border-primary/30",
                    )}
                  >
                    <div className="text-2xl">{h.emoji}</div>
                    <div className="mt-1 text-xs font-semibold">{h.name}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT — agent run */}
          <div className="space-y-4">
            <div className="rounded-2xl glass-strong p-6">
              <div className="flex items-center gap-3">
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-primary shadow-glow animate-pulse-glow">
                  <Bot className="h-6 w-6 text-white" />
                </div>
                <div>
                  <div className="text-xs uppercase tracking-widest text-primary-glow">Agent Pipeline</div>
                  <div className="font-display text-lg font-bold">Ready to generate</div>
                </div>
              </div>

              <div className="mt-5 space-y-2">
                {STEPS.map((s, i) => {
                  const active = step === i && running;
                  const complete = step > i || done;
                  return (
                    <div key={s} className={cn("flex items-center gap-3 rounded-xl border p-3 text-sm transition", active ? "border-primary/60 bg-primary/10" : complete ? "border-emerald-500/40 bg-emerald-500/5" : "border-border/60")}>
                      {complete ? <CheckCircle2 className="h-4 w-4 text-emerald-400" /> : active ? <Loader2 className="h-4 w-4 animate-spin text-primary-glow" /> : <div className="h-4 w-4 rounded-full border border-border" />}
                      <span className={cn(complete ? "text-foreground" : active ? "text-primary-glow" : "text-muted-foreground")}>{s}</span>
                    </div>
                  );
                })}
              </div>

              <Button disabled={running} onClick={generate} className="mt-5 h-12 w-full bg-gradient-primary text-base font-semibold shadow-glow">
                {running ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating…</> : <><Wand2 className="mr-2 h-4 w-4" /> Generate Episode</>}
              </Button>

              {done && (
                <div className="mt-4 rounded-2xl border border-primary/30 bg-primary/5 p-4 animate-fade-in">
                  <div className="flex items-center gap-2 text-primary-glow">
                    <Sparkles className="h-4 w-4" />
                    <span className="text-sm font-semibold">Episode ready</span>
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <Button size="sm" onClick={playLocalDemo} className="bg-gradient-primary shadow-glow">
                      {localPlaying ? (
                        <><Pause className="mr-2 h-3 w-3 fill-white" /> Pause</>
                      ) : (
                        <><Play className="mr-2 h-3 w-3 fill-white" /> Preview</>
                      )}
                    </Button>
                    <Button size="sm" variant="outline">Edit script</Button>
                    <Button size="sm" variant="outline"><Music className="mr-2 h-3 w-3" /> Music</Button>
                  </div>
                  <Button onClick={publishEpisode} className="mt-2 w-full bg-gradient-accent">
                    🚀 Publish in one click
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Dynamic Demo Player displayed below the config columns */}
        {done && (
          <div className="relative border-t border-border/40 p-6 md:p-10 bg-card/25 backdrop-blur-md rounded-b-3xl">
            <h3 className="font-display text-base font-bold text-primary-glow flex items-center gap-2 mb-5">
              <Sparkles className="h-4 w-4 animate-pulse" /> Generated Episode Demo Preview
            </h3>
            
            <div className="flex flex-col md:flex-row gap-6 items-center">
              {/* Cover Art */}
              <div className="relative w-28 h-28 md:w-32 md:h-32 shrink-0 rounded-2xl overflow-hidden shadow-elegant border border-primary/20 group">
                <img
                  src="https://images.unsplash.com/photo-161283360392f-3b61f84b630b?w=400&auto=format&fit=crop&q=60"
                  alt="AI Podcast Cover"
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <div className="flex items-end gap-1 h-8">
                    {[0, 0.1, 0.2, 0.3].map((d) => (
                      <span
                        key={d}
                        className={cn(
                          "w-1 rounded-full bg-gradient-primary transition-all duration-300",
                          localPlaying ? "animate-wave" : "h-2"
                        )}
                        style={{ animationDelay: `${d}s`, height: localPlaying ? "60%" : undefined }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Player details and controls */}
              <div className="flex-1 w-full space-y-4">
                <div>
                  <h4 className="font-display font-bold text-lg text-foreground truncate leading-snug">{topic || "The Rise of AI Music Producers"}</h4>
                  <p className="text-xs text-primary-glow font-medium mt-1">
                    AI Co-Hosts ({personas.map(p => HOSTS.find(h => h.id === p)?.name || p).join(" & ")})
                  </p>
                  {speakingLine !== -1 ? (
                    <div className="mt-3 p-3 rounded-xl bg-primary/10 border border-primary/20 text-xs italic animate-fade-in relative min-h-[70px] flex items-center">
                      <div className="absolute -top-2 left-3 px-1.5 py-0.5 rounded bg-gradient-primary text-[9px] font-bold uppercase tracking-wider not-italic text-white">
                        {scriptLines[speakingLine].speaker}
                      </div>
                      <p className="text-foreground/90 mt-1 leading-relaxed">
                        "{scriptLines[speakingLine].text}"
                      </p>
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground mt-2 line-clamp-2 leading-relaxed">
                      An automatically generated podcast using tone '{tone}' spanning {duration} minutes of high fidelity voice synthesis and background ambient production.
                    </p>
                  )}
                </div>

                {/* Player Controls */}
                <div className="space-y-2">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={playLocalDemo}
                      className="grid h-10 w-10 place-items-center rounded-full bg-gradient-primary shadow-glow transition hover:scale-105 shrink-0"
                      aria-label={localPlaying ? "Pause" : "Play"}
                    >
                      {localPlaying ? (
                        <Pause className="h-4 w-4 text-white fill-white" />
                      ) : (
                        <Play className="h-4 w-4 text-white fill-white pl-0.5" />
                      )}
                    </button>

                    <div className="flex-1 flex items-center gap-3 text-xs font-medium tabular-nums text-muted-foreground">
                      <span>{formatDuration(localCurrentTime)}</span>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={localProgress}
                        onChange={(e) => handleLocalSeek(Number(e.target.value))}
                        className="flex-1 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-primary"
                        style={{ background: `linear-gradient(to right, hsl(var(--primary)) 0%, hsl(var(--primary)) ${localProgress}%, rgba(255,255,255,0.2) ${localProgress}%, rgba(255,255,255,0.2) 100%)` }}
                      />
                      <span>{formatDuration(localDuration)}</span>
                    </div>

                    <div className="hidden md:flex items-center gap-2">
                      <button
                        onClick={() => handleLocalVolume(localVolume === 0 ? 0.8 : 0)}
                        className="text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {localVolume === 0 ? (
                          <VolumeX className="h-4 w-4" />
                        ) : (
                          <Volume2 className="h-4 w-4" />
                        )}
                      </button>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.05"
                        value={localVolume}
                        onChange={(e) => handleLocalVolume(Number(e.target.value))}
                        className="w-16 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-primary"
                        style={{ background: `linear-gradient(to right, hsl(var(--primary)) 0%, hsl(var(--primary)) ${localVolume * 100}%, rgba(255,255,255,0.2) ${localVolume * 100}%, rgba(255,255,255,0.2) 100%)` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Interactive transcript below the player */}
            <div className="mt-8 border-t border-border/40 pt-6">
              <h4 className="font-display font-bold text-sm text-primary-glow flex items-center gap-2 mb-4">
                <Bot className="h-4 w-4" /> Podcast Interactive Transcript <span className="text-xs font-normal text-muted-foreground">(Click any line to jump and listen)</span>
              </h4>
              <div className="max-h-80 overflow-y-auto space-y-3 pr-2 -mr-2 scrollbar-thin">
                {scriptLines.map((line, idx) => {
                  const isCurrent = idx === speakingLine;
                  const isSpeaker1 = idx % 2 === 0;
                  return (
                    <button
                      key={idx}
                      onClick={() => handleSelectLine(idx)}
                      className={cn(
                        "w-full text-left p-3.5 rounded-2xl border transition-all duration-300 flex flex-col gap-1.5 relative overflow-hidden group card-hover",
                        isCurrent
                          ? "bg-primary/10 border-primary/30 shadow-elegant"
                          : "bg-card/40 border-border/40 hover:bg-card/60 hover:border-primary/20"
                      )}
                    >
                      {isCurrent && (
                        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-primary" />
                      )}
                      
                      <div className="flex items-center justify-between w-full">
                        <div className={cn(
                          "px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider",
                          isSpeaker1 ? "bg-gradient-primary text-white" : "bg-card-accent border border-border/60 text-primary-glow"
                        )}>
                          {line.speaker}
                        </div>
                        <div className="text-[10px] text-muted-foreground/80 font-medium tabular-nums group-hover:text-primary-glow transition-colors">
                          {formatDuration(line.startTime)}
                        </div>
                      </div>
                      
                      <p className={cn(
                        "text-xs leading-relaxed transition-colors",
                        isCurrent ? "text-foreground font-medium" : "text-muted-foreground group-hover:text-foreground"
                      )}>
                        "{line.text}"
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </StudioLayout>
  );
}
