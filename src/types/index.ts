export interface Snippet {
  id: string;
  podcast_title: string;
  podcast_author: string;
  episode_title: string;
  audio_url: string;
  duration: number;
  description: string;
  topics: string[];
  keywords: string[];
  sentiment: 'positive' | 'negative' | 'neutral';
  named_entities: Record<string, string[]>;
  transcript: string;
  start_time: number;
  end_time: number;
  created_at: string;
  thumbnail_url: string | null;
}

export interface UserInteraction {
  id: string;
  user_id: string;
  snippet_id: string;
  interaction_type: 'play' | 'skip' | 'like' | 'save' | 'complete';
  listen_duration: number;
  created_at: string;
}

export interface Playlist {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface PlaylistSnippet {
  id: string;
  playlist_id: string;
  snippet_id: string;
  added_at: string;
}

export interface UserPreferences {
  user_id: string;
  preferred_topics: string[];
  disliked_topics: string[];
  created_at: string;
  updated_at: string;
}

export interface PlayerState {
  currentSnippet: Snippet | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  isLoading: boolean;
}
