import { StudioLayout } from "@/components/StudioLayout";
import { CATEGORIES, formatPlays, formatDuration, PODCASTS } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { Plus, Edit3, Trash2, Send, Calendar } from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { useCatalog } from "@/contexts/CatalogContext";
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

export default function StudioEpisodes() {
  const { podcasts, removePodcast, updatePodcast, addPodcast } = useCatalog();
  const [activeTab, setActiveTab] = useState("All");

  // Read drafts from localstorage
  const [drafts, setDrafts] = useState<Podcast[]>(() => {
    try {
      const raw = localStorage.getItem("podify.drafts.v1");
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });

  // Scheduling states
  const [schedulingEpisode, setSchedulingEpisode] = useState<Podcast | null>(null);
  const [scheduledDate, setScheduledDate] = useState("");

  // Real-time ticking state to force re-render relative time ago strings every second
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => {
      setTick((t) => t + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Helper to save drafts
  const saveDrafts = (updated: Podcast[]) => {
    try {
      localStorage.setItem("podify.drafts.v1", JSON.stringify(updated));
      setDrafts(updated);
    } catch (e) {
      console.error(e);
    }
  };

  const handlePublish = (id: string) => {
    const draft = drafts.find((d) => d.id === id);
    if (!draft) return;

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

    const updated = drafts.filter((d) => d.id !== id);
    saveDrafts(updated);
    toast.success("🚀 Draft published successfully!");
  };

  const handleStartSchedule = (episode: Podcast) => {
    setSchedulingEpisode(episode);
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const localISO = new Date(tomorrow.getTime() - tomorrow.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
    setScheduledDate(localISO);
  };

  const handleSaveSchedule = () => {
    if (!scheduledDate) return toast.error("Please select a date and time");
    if (new Date(scheduledDate) <= new Date()) {
      return toast.error("Schedule time must be in the future");
    }
    if (!schedulingEpisode) return;

    addPodcast({
      title: schedulingEpisode.title,
      creator: schedulingEpisode.creator || "AI Creator",
      category: schedulingEpisode.category,
      language: schedulingEpisode.language || "English",
      tags: schedulingEpisode.tags || [],
      description: schedulingEpisode.description || "",
      youtubeId: schedulingEpisode.youtubeId || "",
      cover: schedulingEpisode.cover,
      duration: schedulingEpisode.duration,
      audioUrl: schedulingEpisode.audioUrl,
      script: schedulingEpisode.script,
      voice: schedulingEpisode.voice,
      ttsLang: schedulingEpisode.ttsLang,
      scheduledFor: new Date(scheduledDate).toISOString(),
    });

    // Remove from drafts if scheduling a draft
    const isDraftItem = schedulingEpisode.isDraft || schedulingEpisode.id.startsWith("draft-");
    if (isDraftItem) {
      const updated = drafts.filter((d) => d.id !== schedulingEpisode.id);
      saveDrafts(updated);
    }

    setSchedulingEpisode(null);
    toast.success("📅 Episode scheduled successfully!");
  };

  const handleDelete = (id: string, isDraftItem: boolean) => {
    if (isDraftItem) {
      const updated = drafts.filter((d) => d.id !== id);
      saveDrafts(updated);
      toast.success("Draft deleted successfully");
    } else {
      removePodcast(id);
      toast.success("Episode deleted successfully");
    }
  };

  // Edit states
  const [editingEpisode, setEditingEpisode] = useState<Podcast | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editCategory, setEditCategory] = useState("");

  const handleStartEdit = (episode: Podcast) => {
    setEditingEpisode(episode);
    setEditTitle(episode.title);
    setEditDesc(episode.description || "");
    setEditCategory(episode.category);
  };

  const handleSaveEdit = () => {
    if (!editTitle.trim()) return toast.error("Title is required");
    if (!editingEpisode) return;

    const isDraftItem = editingEpisode.isDraft || editingEpisode.id.startsWith("draft-");

    if (isDraftItem) {
      const updated = drafts.map((d) =>
        d.id === editingEpisode.id
          ? {
              ...d,
              title: editTitle,
              description: editDesc,
              category: editCategory,
              editedAt: new Date().toISOString(),
            }
          : d
      );
      saveDrafts(updated);
      toast.success("Draft updated successfully");
    } else {
      updatePodcast(editingEpisode.id, {
        title: editTitle,
        description: editDesc,
        category: editCategory,
      });
      toast.success("Episode updated successfully");
    }
    setEditingEpisode(null);
  };

  // Date utilities
  const isScheduledInFuture = (p: Podcast) => {
    return p.scheduledFor && new Date(p.scheduledFor) > new Date();
  };

  const formatScheduleDate = (dateStr?: string) => {
    if (!dateStr) return "Scheduled";
    try {
      const date = new Date(dateStr);
      return date.toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
    } catch {
      return "Scheduled";
    }
  };

  const formatTimeAgo = (dateStr?: string) => {
    if (!dateStr) return "Edited recently";
    try {
      const past = new Date(dateStr);
      const diffMs = Date.now() - past.getTime();
      const diffSecs = Math.floor(diffMs / 1000);
      if (diffSecs < 1) return "Just now";
      if (diffSecs < 60) return `${diffSecs}s ago`;
      const diffMins = Math.floor(diffSecs / 60);
      if (diffMins < 60) return `${diffMins}m ago`;
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours}h ago`;
      const diffDays = Math.floor(diffHours / 24);
      return `${diffDays}d ago`;
    } catch {
      return "Edited recently";
    }
  };

  // Get displayed episodes based on tab selection
  const filteredEpisodes = (() => {
    // Only display podcasts belonging to this creator:
    // Custom podcasts (user-uploaded/published) + the first 8 mock podcasts (initial creator podcasts)
    const creatorPodcasts = podcasts.filter(
      (p) => p.id.startsWith("custom-") || PODCASTS.slice(0, 8).some((mock) => mock.id === p.id)
    );

    const publishedList = creatorPodcasts
      .filter((p) => !isScheduledInFuture(p))
      .map((p) => ({ ...p, isDraft: false }));

    const scheduledList = creatorPodcasts
      .filter((p) => isScheduledInFuture(p))
      .map((p) => ({ ...p, isDraft: false }));

    const draftList = drafts.map((d) => ({ ...d, isDraft: true }));

    switch (activeTab) {
      case "Published":
        return publishedList;
      case "Scheduled":
        return scheduledList;
      case "Drafts":
        return draftList;
      case "All":
      default:
        // Show Scheduled items as well in "All" view
        return [...draftList, ...scheduledList, ...publishedList];
    }
  })();

  return (
    <StudioLayout title="My episodes" subtitle="Manage all your published and scheduled episodes.">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex gap-2">
          {["All", "Published", "Scheduled", "Drafts"].map((t) => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              className={`rounded-full px-4 py-1.5 text-sm transition-all duration-200 ${
                activeTab === t
                  ? "bg-gradient-primary text-white shadow-glow"
                  : "bg-card/60 text-muted-foreground hover:text-foreground"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
        <Button asChild className="bg-gradient-primary shadow-glow">
          <Link to="/studio/upload">
            <Plus className="mr-2 h-4 w-4" /> New episode
          </Link>
        </Button>
      </div>

      <div className="rounded-2xl glass overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b border-border/40 text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="p-4 text-left">Episode</th>
              <th className="p-4 text-left hidden md:table-cell">Category</th>
              <th className="p-4 text-left hidden md:table-cell">Status</th>
              <th className="p-4 text-left hidden md:table-cell">Plays</th>
              <th className="p-4 text-left hidden lg:table-cell">Duration</th>
              <th className="p-4 text-left hidden lg:table-cell">Rating</th>
              <th className="p-4" />
            </tr>
          </thead>
          <tbody>
            {filteredEpisodes.length > 0 ? (
              filteredEpisodes.map((p) => {
                const isDraftItem = p.isDraft || p.id.startsWith("draft-");
                const isScheduledItem = isScheduledInFuture(p);
                return (
                  <tr key={p.id} className="border-b border-border/40 last:border-0 hover:bg-card/40">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img src={p.cover} alt="" className="h-10 w-10 rounded-lg object-cover" />
                        <div className="min-w-0">
                          <div className="font-medium truncate max-w-[200px] sm:max-w-[300px]">
                            {p.title}
                          </div>
                          <div className="truncate text-xs text-muted-foreground">
                            {isDraftItem ? (
                              <span className="text-amber-400/80">Draft · Edited {formatTimeAgo(p.editedAt)}</span>
                            ) : p.tags && p.tags.length > 0 ? (
                              p.tags.join(" · ")
                            ) : (
                              "no tags"
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 hidden md:table-cell text-muted-foreground">{p.category}</td>
                    <td className="p-4 hidden md:table-cell">
                      {isDraftItem ? (
                        <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-amber-300">
                          Draft
                        </span>
                      ) : isScheduledItem ? (
                        <span className="rounded-full bg-blue-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-blue-300">
                          Scheduled
                        </span>
                      ) : (
                        <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-300">
                          Published
                        </span>
                      )}
                    </td>
                    <td className="p-4 hidden md:table-cell">
                      {isDraftItem || isScheduledItem ? "-" : formatPlays(p.plays)}
                    </td>
                    <td className="p-4 hidden lg:table-cell">
                      {formatDuration(p.duration)}
                    </td>
                    <td className="p-4 hidden lg:table-cell">
                      {isDraftItem || isScheduledItem ? "-" : `${p.rating.toFixed(1)} ★`}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-1.5">
                        {isDraftItem && (
                          <>
                            <button
                              onClick={() => handlePublish(p.id)}
                              className="rounded-lg p-1.5 text-primary-glow hover:text-white transition-colors"
                              title="Publish Draft"
                            >
                              <Send className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleStartSchedule(p)}
                              className="rounded-lg p-1.5 text-muted-foreground hover:text-foreground transition-colors"
                              title="Schedule Draft"
                            >
                              <Calendar className="h-4 w-4" />
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => handleStartEdit(p)}
                          className="rounded-lg p-1.5 text-muted-foreground hover:text-foreground transition-colors"
                          title="Edit Details"
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(p.id, isDraftItem)}
                          className="rounded-lg p-1.5 text-muted-foreground hover:text-destructive transition-colors"
                          title="Delete Episode"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={7} className="p-12 text-center">
                  <div className="flex flex-col items-center justify-center text-muted-foreground">
                    <Calendar className="h-8 w-8 mb-2 opacity-65" />
                    <span className="text-sm font-semibold">No episodes found</span>
                    <span className="text-xs text-muted-foreground/80 mt-0.5">
                      Try selecting another tab or create a new episode draft.
                    </span>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Edit Episode Dialog */}
      <Dialog open={editingEpisode !== null} onOpenChange={(open) => !open && setEditingEpisode(null)}>
        <DialogContent className="sm:max-w-[500px] glass-strong">
          <DialogHeader>
            <DialogTitle className="font-display text-xl font-bold">Edit Details</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-1.5">
              <Label htmlFor="title" className="text-sm font-medium">
                Title
              </Label>
              <Input
                id="title"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                placeholder="Episode title"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="description" className="text-sm font-medium">
                Description
              </Label>
              <Textarea
                id="description"
                rows={4}
                value={editDesc}
                onChange={(e) => setEditDesc(e.target.value)}
                placeholder="Episode description"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="category" className="text-sm font-medium">
                Category
              </Label>
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
            <Button variant="outline" onClick={() => setEditingEpisode(null)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit} className="bg-gradient-primary shadow-glow">
              Save changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Schedule Dialog */}
      <Dialog open={schedulingEpisode !== null} onOpenChange={(open) => !open && setSchedulingEpisode(null)}>
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
            <Button variant="outline" onClick={() => setSchedulingEpisode(null)}>
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
