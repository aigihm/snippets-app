export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          created_at?: string
          updated_at?: string
        }
      }
      snippets: {
        Row: {
          id: string
          podcast_title: string
          podcast_author: string
          episode_title: string
          audio_url: string
          duration: number
          description: string
          topics: string[]
          keywords: string[]
          sentiment: 'positive' | 'negative' | 'neutral'
          named_entities: Json
          transcript: string
          start_time: number
          end_time: number
          created_at: string
          thumbnail_url: string | null
        }
        Insert: {
          id?: string
          podcast_title: string
          podcast_author: string
          episode_title: string
          audio_url: string
          duration: number
          description: string
          topics?: string[]
          keywords?: string[]
          sentiment?: 'positive' | 'negative' | 'neutral'
          named_entities?: Json
          transcript?: string
          start_time: number
          end_time: number
          created_at?: string
          thumbnail_url?: string | null
        }
        Update: {
          id?: string
          podcast_title?: string
          podcast_author?: string
          episode_title?: string
          audio_url?: string
          duration?: number
          description?: string
          topics?: string[]
          keywords?: string[]
          sentiment?: 'positive' | 'negative' | 'neutral'
          named_entities?: Json
          transcript?: string
          start_time?: number
          end_time?: number
          created_at?: string
          thumbnail_url?: string | null
        }
      }
      user_interactions: {
        Row: {
          id: string
          user_id: string
          snippet_id: string
          interaction_type: 'play' | 'skip' | 'like' | 'save' | 'complete'
          listen_duration: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          snippet_id: string
          interaction_type: 'play' | 'skip' | 'like' | 'save' | 'complete'
          listen_duration?: number
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          snippet_id?: string
          interaction_type?: 'play' | 'skip' | 'like' | 'save' | 'complete'
          listen_duration?: number
          created_at?: string
        }
      }
      playlists: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      playlist_snippets: {
        Row: {
          id: string
          playlist_id: string
          snippet_id: string
          added_at: string
        }
        Insert: {
          id?: string
          playlist_id: string
          snippet_id: string
          added_at?: string
        }
        Update: {
          id?: string
          playlist_id?: string
          snippet_id?: string
          added_at?: string
        }
      }
      user_preferences: {
        Row: {
          user_id: string
          preferred_topics: string[]
          disliked_topics: string[]
          created_at: string
          updated_at: string
        }
        Insert: {
          user_id: string
          preferred_topics?: string[]
          disliked_topics?: string[]
          created_at?: string
          updated_at?: string
        }
        Update: {
          user_id?: string
          preferred_topics?: string[]
          disliked_topics?: string[]
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
