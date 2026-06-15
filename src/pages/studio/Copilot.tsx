import { StudioLayout } from "@/components/StudioLayout";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, FileText, Type, ListOrdered, Tag, Mic2, BookOpen, Loader2, Copy } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const TOOLS = [
  { id: "script", name: "Script Generator", icon: FileText, desc: "Monologue, interview or storytelling" },
  { id: "title", name: "Title Generator", icon: Type, desc: "Viral, click-worthy titles" },
  { id: "summary", name: "Summarizer", icon: BookOpen, desc: "Short episode descriptions" },
  { id: "notes", name: "Show Notes", icon: ListOrdered, desc: "Bullet highlights + resources" },
  { id: "chapters", name: "Chapter Generator", icon: ListOrdered, desc: "Auto timestamps" },
  { id: "tags", name: "SEO Tags", icon: Tag, desc: "Keywords + tags" },
  { id: "intro", name: "Intro / Outro", icon: Mic2, desc: "Branded openings & sign-offs" },
];

const MOCK: Record<string, (input: string) => string> = {
  script: (i) => `# ${i || "Untitled Episode"}\n\n[INTRO]\nHost: Welcome back to another episode of Podify. Today we're diving deep into ${i || "an exciting topic"}.\n\n[SEGMENT 1]\nLet's start with the basics. ${i ? i + " has been transforming the way we think about audio content." : "This subject has been making waves recently."}\n\n[SEGMENT 2]\nNow, here's where it gets really interesting…\n\n[OUTRO]\nThanks for tuning in. Like, share, and subscribe for more.`,
  title: (i) => `1. The Untold Truth About ${i}\n2. ${i}: What Nobody Is Talking About\n3. How ${i} Will Change Everything by 2030\n4. I Tried ${i} for 30 Days — Here's What Happened\n5. The ${i} Playbook Every Creator Needs`,
  summary: (i) => `In this episode, we explore ${i} — unpacking the trends, breakthroughs and human stories behind it. Join us for a 20-minute deep dive featuring expert insights and practical takeaways you can apply today.`,
  notes: (i) => `• Why ${i} matters in 2025\n• Three case studies you should know\n• Tools mentioned: Podify Studio, Notion AI, Descript\n• Recommended reading: "The Future of Audio"\n• Guest links: @creator on X`,
  chapters: () => `00:00 — Intro\n01:24 — The big idea\n05:47 — Real-world examples\n12:10 — Expert interview\n19:32 — Practical takeaways\n23:05 — Outro`,
  tags: (i) => `#${i?.replace(/\s+/g, "")} #podcast #ai #audio #future #startup #creators #indie #storytelling #2025`,
  intro: (i) => `[Music swells]\n"You're tuned in to Podify — where ideas become voices. This is your host, and today we're talking about ${i}. Let's get into it."\n[Music fades]`,
};

export default function Copilot() {
  const [tool, setTool] = useState("script");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);

  const generate = () => {
    if (!input.trim()) return toast.error("Enter a topic or prompt");
    setLoading(true);
    setTimeout(() => {
      setOutput(MOCK[tool](input));
      setLoading(false);
    }, 300);
  };

  const copy = () => {
    navigator.clipboard?.writeText(output);
    toast.success("Copied to clipboard");
  };

  return (
    <StudioLayout title="AI Copilot" subtitle="Your creative partner for scripts, titles, summaries and more.">
      <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
        {/* Tools sidebar */}
        <div className="rounded-2xl glass p-3">
          <div className="px-2 py-2 text-xs uppercase tracking-widest text-muted-foreground">AI Tools</div>
          <div className="space-y-1">
            {TOOLS.map((t) => (
              <button
                key={t.id}
                onClick={() => { setTool(t.id); setOutput(""); }}
                className={cn(
                  "flex w-full items-start gap-3 rounded-xl p-3 text-left transition",
                  tool === t.id ? "bg-gradient-primary text-white shadow-glow" : "hover:bg-card",
                )}
              >
                <t.icon className="mt-0.5 h-4 w-4 shrink-0" />
                <div className="min-w-0">
                  <div className="text-sm font-semibold">{t.name}</div>
                  <div className={cn("text-xs", tool === t.id ? "text-white/80" : "text-muted-foreground")}>{t.desc}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Workspace */}
        <div className="space-y-4">
          <div className="rounded-2xl glass p-5">
            <div className="flex items-center gap-2 text-primary-glow">
              <Sparkles className="h-4 w-4" />
              <h3 className="font-semibold">{TOOLS.find((t) => t.id === tool)?.name}</h3>
            </div>
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="What's the topic? Try: 'How AI is reshaping indie music'"
              className="mt-3 text-xs leading-relaxed scrollbar-thin h-16 resize-none"
            />
            <div className="mt-3 flex flex-wrap gap-2">
              {["Monologue", "Interview", "Storytelling", "Debate"].map((t) => (
                <button key={t} className="rounded-full bg-card/60 px-3 py-1 text-xs hover:bg-card">{t}</button>
              ))}
            </div>
            <Button disabled={loading} onClick={generate} className="mt-4 h-11 bg-gradient-primary shadow-glow">
              {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating…</> : <><Sparkles className="mr-2 h-4 w-4" /> Generate</>}
            </Button>
          </div>

          <div className="rounded-2xl glass p-5">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-semibold">Output</h3>
              {output && (
                <Button onClick={copy} size="sm" variant="outline"><Copy className="mr-2 h-3 w-3" /> Copy</Button>
              )}
            </div>
            <Textarea
              rows={14}
              value={output}
              onChange={(e) => setOutput(e.target.value)}
              placeholder="Your generated content will appear here. Edit freely."
              className="font-mono text-xs leading-relaxed scrollbar-thin"
            />
          </div>
        </div>
      </div>
    </StudioLayout>
  );
}
