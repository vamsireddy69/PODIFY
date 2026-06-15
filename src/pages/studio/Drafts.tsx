import { StudioLayout } from "@/components/StudioLayout";
import { PODCASTS, CATEGORIES } from "@/lib/mock-data";
import { Edit3, Trash2, Send, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import type { Podcast } from "@/lib/types";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DateTimePicker } from "@/components/DateTimePicker";
import { useCatalog } from "@/contexts/CatalogContext";

const STORAGE_KEY = "podify.drafts.v1";

function readDrafts(): Podcast[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const initial = PODCASTS.slice(8, 12).map((p) => ({
        ...p,
        isDraft: true,
        editedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      }));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
      return initial;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export default function Drafts() {
  const { addPodcast } = useCatalog();
  const [draftsList, setDraftsList] = useState<Podcast[]>(() => readDrafts());
  const [editingDraft, setEditingDraft] = useState<Podcast | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editCategory, setEditCategory] = useState("");

  // Scheduling states
  const [schedulingDraft, setSchedulingDraft] = useState<Podcast | null>(null);
  const [scheduledDate, setScheduledDate] = useState("");

  // Real-time ticking state to force re-render every second (for relative time calculation)
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => {
      setTick((t) => t + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const saveDraftsToStorage = (list: Podcast[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    } catch (e) {
      console.error("Failed to save drafts to storage", e);
    }
  };

  const handleDelete = (id: string) => {
    const updated = draftsList.filter((d) => d.id !== id);
    setDraftsList(updated);
    saveDraftsToStorage(updated);
    toast.success("Draft deleted successfully");
  };

  const handlePublish = (id: string) => {
    const draft = draftsList.find((d) => d.id === id);
    if (!draft) return;

    // Publish directly to general catalog
    addPodcast({
      title: draft.title,
      creator: draft.creator || "AI Creator",
      category: draft.category,
      language: draft.language || "English",
      tags: draft.tags || [],
      description: draft.description || "",
      youtubeId: draft.youtubeId || "",
      cover: draft.cover,
      duration: draft.duration,
      audioUrl: draft.audioUrl,
      script: draft.script,
      voice: draft.voice,
      ttsLang: draft.ttsLang,
    });

    const updated = draftsList.filter((d) => d.id !== id);
    setDraftsList(updated);
    saveDraftsToStorage(updated);
    toast.success("🚀 Draft published successfully!");
  };

  const handleStartSchedule = (d: Podcast) => {
    setSchedulingDraft(d);
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const localISO = new Date(tomorrow.getTime() - tomorrow.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
    setScheduledDate(localISO);
  };

  const handleSaveSchedule = () => {
    if (!scheduledDate) return toast.error("Please select a date and time");
    if (new Date(scheduledDate) <= new Date()) {
      return toast.error("Schedule time must be in the future");
    }
    if (!schedulingDraft) return;

    // Add to general podcasts catalog with scheduledFor date
    addPodcast({
      title: schedulingDraft.title,
      creator: schedulingDraft.creator || "AI Creator",
      category: schedulingDraft.category,
      language: schedulingDraft.language || "English",
      tags: schedulingDraft.tags || [],
      description: schedulingDraft.description || "",
      youtubeId: schedulingDraft.youtubeId || "",
      cover: schedulingDraft.cover,
      duration: schedulingDraft.duration,
      audioUrl: schedulingDraft.audioUrl,
      script: schedulingDraft.script,
      voice: schedulingDraft.voice,
      ttsLang: schedulingDraft.ttsLang,
      scheduledFor: new Date(scheduledDate).toISOString(),
    });

    const updated = draftsList.filter((d) => d.id !== schedulingDraft.id);
    setDraftsList(updated);
    saveDraftsToStorage(updated);
    setSchedulingDraft(null);
    toast.success("📅 Draft scheduled successfully!");
  };

  const handleStartEdit = (d: Podcast) => {
    setEditingDraft(d);
    setEditTitle(d.title);
    setEditDesc(d.description || "");
    setEditCategory(d.category);
  };

  const handleSaveEdit = () => {
    if (!editTitle.trim()) return toast.error("Title is required");
    const updated = draftsList.map((d) =>
      d.id === editingDraft?.id
        ? {
            ...d,
            title: editTitle,
            description: editDesc,
            category: editCategory,
            editedAt: new Date().toISOString(),
          }
        : d
    );
    setDraftsList(updated);
    saveDraftsToStorage(updated);
    setEditingDraft(null);
    toast.success("Draft updated successfully");
  };

  const formatTimeAgo = (dateStr?: string) => {
    if (!dateStr) return "Edited recently";
    try {
      const past = new Date(dateStr);
      const diffMs = Date.now() - past.getTime();
      const diffSecs = Math.floor(diffMs / 1000);
      if (diffSecs < 1) return "Just now";
      if (diffSecs < 60) return `Edited ${diffSecs}s ago`;
      const diffMins = Math.floor(diffSecs / 60);
      if (diffMins < 60) return `Edited ${diffMins}m ago`;
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `Edited ${diffHours}h ago`;
      const diffDays = Math.floor(diffHours / 24);
      return `Edited ${diffDays}d ago`;
    } catch {
      return "Edited recently";
    }
  };

  return (
    <StudioLayout title="Drafts" subtitle="Pick up where you left off.">
      {draftsList.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {draftsList.map((d) => (
            <div key={d.id} className="rounded-2xl glass p-4 card-hover flex flex-col justify-between">
              <div>
                <img src={d.cover} alt="" className="aspect-video w-full rounded-xl object-cover" />
                <div className="mt-3 flex items-center justify-between">
                  <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-amber-300">Draft</span>
                  <span className="text-xs text-muted-foreground font-medium">{formatTimeAgo(d.editedAt)}</span>
                </div>
                <h3 className="mt-2 font-display font-semibold truncate">{d.title}</h3>
                <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{d.description}</p>
              </div>
              <div className="mt-4 flex gap-1.5 items-center">
                <Button onClick={() => handlePublish(d.id)} size="sm" className="flex-1 bg-gradient-primary shadow-glow px-2">
                  <Send className="mr-1 h-3 w-3" /> Publish
                </Button>
                <Button onClick={() => handleStartSchedule(d)} size="sm" variant="outline" className="flex-1 px-2">
                  <Calendar className="mr-1 h-3 w-3" /> Schedule
                </Button>
                <Button onClick={() => handleStartEdit(d)} size="icon" variant="outline" title="Edit Draft">
                  <Edit3 className="h-3.5 w-3.5" />
                </Button>
                <Button
                  onClick={() => handleDelete(d.id)}
                  size="icon"
                  variant="outline"
                  className="text-muted-foreground hover:text-neon-pink hover:bg-card-accent hover:border-neon-pink/30 transition-colors"
                  title="Delete Draft"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center rounded-2xl glass-strong border border-border/40 min-h-[300px]">
          <div className="w-14 h-14 rounded-full bg-card border border-border/40 flex items-center justify-center mb-4">
            <Edit3 className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="text-base font-bold font-display">No drafts found</h3>
          <p className="text-xs text-muted-foreground max-w-[280px] mt-1.5 leading-relaxed">
            Create a new episode draft in the upload studio or multi-agent studio to get started.
          </p>
        </div>
      )}

      {/* Edit Draft Dialog */}
      <Dialog open={editingDraft !== null} onOpenChange={(open) => !open && setEditingDraft(null)}>
        <DialogContent className="sm:max-w-[500px] glass-strong">
          <DialogHeader>
            <DialogTitle className="font-display text-xl font-bold">Edit Draft</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-1.5">
              <Label htmlFor="title" className="text-sm font-medium">Title</Label>
              <Input
                id="title"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                placeholder="Episode title"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="description" className="text-sm font-medium">Description</Label>
              <Textarea
                id="description"
                rows={4}
                value={editDesc}
                onChange={(e) => setEditDesc(e.target.value)}
                placeholder="Episode description"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="category" className="text-sm font-medium">Category</Label>
              <Select value={editCategory} onValueChange={setEditCategory}>
                <SelectTrigger id="category" className="w-full">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c.id} value={c.name}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setEditingDraft(null)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit} className="bg-gradient-primary shadow-glow">
              Save changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Schedule Draft Dialog */}
      <Dialog open={schedulingDraft !== null} onOpenChange={(open) => !open && setSchedulingDraft(null)}>
        <DialogContent className="sm:max-w-[400px] glass-strong">
          <DialogHeader>
            <DialogTitle className="font-display text-xl font-bold">Schedule Episode</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-1.5">
              <DateTimePicker
                value={scheduledDate}
                onChange={setScheduledDate}
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setSchedulingDraft(null)}>
              Cancel
            </Button>
            <Button onClick={handleSaveSchedule} className="bg-gradient-primary shadow-glow">
              Schedule Release
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </StudioLayout>
  );
}
