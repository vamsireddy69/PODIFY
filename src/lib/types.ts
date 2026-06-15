export type Role = "listener" | "creator" | "admin";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar: string;
  bio?: string;
  followers?: number;
}

export interface Podcast {
  id: string;
  title: string;
  creator: string;
  creatorId: string;
  category: string;
  tags: string[];
  language: string;
  cover: string;
  duration: number; // seconds (estimate for YouTube items)
  plays: number;
  rating: number;
  description: string;
  audioUrl?: string;
  /** YouTube video ID — if present, this episode plays via the YouTube iframe (audio or video) */
  youtubeId?: string;
  /** YouTube channel handle (e.g. "warikoo") — used for the creator profile link out */
  youtubeChannel?: string;
  isDraft?: boolean;
  editedAt?: string;
  script?: string;
  voice?: string;
  ttsLang?: string;
  thumbPrompt?: string;
  scheduledFor?: string;
  publishedAt?: string;
}

export interface Comment {
  id: string;
  user: string;
  avatar: string;
  text: string;
  time: string;
}
