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
          auth_user_id: string
          role: 'founder' | 'builder' | 'student'
          full_name: string
          username: string
          headline: string | null
          bio: string | null
          avatar_url: string | null
          skills: string[]
          interests: string[]
          commitment_level: 'exploring' | 'part_time' | 'full_time'
          location: string | null
          open_to_remote: boolean
          links: Json | null
          onboarding_completed: boolean
          accepted_terms_at: string
          accepted_privacy_at: string
          terms_version: string
          privacy_version: string
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: {
          id?: string
          auth_user_id: string
          role: 'founder' | 'builder' | 'student'
          full_name: string
          username: string
          headline?: string | null
          bio?: string | null
          avatar_url?: string | null
          skills?: string[]
          interests?: string[]
          commitment_level?: 'exploring' | 'part_time' | 'full_time'
          location?: string | null
          open_to_remote?: boolean
          links?: Json | null
          onboarding_completed?: boolean
          accepted_terms_at?: string
          accepted_privacy_at?: string
          terms_version?: string
          privacy_version?: string
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Update: {
          id?: string
          auth_user_id?: string
          role?: 'founder' | 'builder' | 'student'
          full_name?: string
          username?: string
          headline?: string | null
          bio?: string | null
          avatar_url?: string | null
          skills?: string[]
          interests?: string[]
          commitment_level?: 'exploring' | 'part_time' | 'full_time'
          location?: string | null
          open_to_remote?: boolean
          links?: Json | null
          onboarding_completed?: boolean
          accepted_terms_at?: string
          accepted_privacy_at?: string
          terms_version?: string
          privacy_version?: string
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
      }
      waitlist: {
        Row: {
          id: string
          email: string
          role_interest: 'founder' | 'builder' | 'student' | null
          source: string | null
          confirmed_at: string | null
          accepted_terms_at: string
          accepted_privacy_at: string
          terms_version: string
          privacy_version: string
          ip_hash: string | null
          user_agent: string | null
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: {
          id?: string
          email: string
          role_interest?: 'founder' | 'builder' | 'student' | null
          source?: string | null
          confirmed_at?: string | null
          accepted_terms_at: string
          accepted_privacy_at: string
          terms_version: string
          privacy_version: string
          ip_hash?: string | null
          user_agent?: string | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Update: {
          id?: string
          email?: string
          role_interest?: 'founder' | 'builder' | 'student' | null
          source?: string | null
          confirmed_at?: string | null
          accepted_terms_at?: string
          accepted_privacy_at?: string
          terms_version?: string
          privacy_version?: string
          ip_hash?: string | null
          user_agent?: string | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
      }
      startups: {
        Row: {
          id: string
          owner_id: string
          name: string
          slug: string
          tagline: string
          problem: string
          solution: string
          stage: 'idea' | 'prototype' | 'mvp'
          industry: string
          location: string | null
          tags: string[]
          looking_for: string[]
          website_url: string | null
          pitch_deck_path: string | null
          logo_url: string | null
          is_featured: boolean
          featured_week: string | null
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: {
          id?: string
          owner_id: string
          name: string
          slug: string
          tagline: string
          problem: string
          solution: string
          stage: 'idea' | 'prototype' | 'mvp'
          industry: string
          location?: string | null
          tags?: string[]
          looking_for?: string[]
          website_url?: string | null
          pitch_deck_path?: string | null
          logo_url?: string | null
          is_featured?: boolean
          featured_week?: string | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Update: {
          id?: string
          owner_id?: string
          name?: string
          slug?: string
          tagline?: string
          problem?: string
          solution?: string
          stage?: 'idea' | 'prototype' | 'mvp'
          industry?: string
          location?: string | null
          tags?: string[]
          looking_for?: string[]
          website_url?: string | null
          pitch_deck_path?: string | null
          logo_url?: string | null
          is_featured?: boolean
          featured_week?: string | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
      }
      swipes: {
        Row: {
          id: string
          swiper_id: string
          target_id: string
          direction: 'connect' | 'pass'
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: {
          id?: string
          swiper_id: string
          target_id: string
          direction: 'connect' | 'pass'
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Update: {
          id?: string
          swiper_id?: string
          target_id?: string
          direction?: 'connect' | 'pass'
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
      }
      matches: {
        Row: {
          id: string
          user_a_id: string
          user_b_id: string
          status: 'pending' | 'matched' | 'blocked'
          matched_at: string | null
          compatibility_score: number
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: {
          id?: string
          user_a_id: string
          user_b_id: string
          status?: 'pending' | 'matched' | 'blocked'
          matched_at?: string | null
          compatibility_score?: number
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Update: {
          id?: string
          user_a_id?: string
          user_b_id?: string
          status?: 'pending' | 'matched' | 'blocked'
          matched_at?: string | null
          compatibility_score?: number
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
      }
      community_posts: {
        Row: {
          id: string
          author_id: string
          group_id: string | null
          type: 'post' | 'ama' | 'startup_of_the_week'
          title: string
          body: string
          media_url: string | null
          like_count: number
          comment_count: number
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: {
          id?: string
          author_id: string
          group_id?: string | null
          type?: 'post' | 'ama' | 'startup_of_the_week'
          title: string
          body: string
          media_url?: string | null
          like_count?: number
          comment_count?: number
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Update: {
          id?: string
          author_id?: string
          group_id?: string | null
          type?: 'post' | 'ama' | 'startup_of_the_week'
          title?: string
          body?: string
          media_url?: string | null
          like_count?: number
          comment_count?: number
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
      }
      hackathons: {
        Row: {
          id: string
          title: string
          slug: string
          description: string
          mode: 'online' | 'offline' | 'hybrid'
          location: string | null
          starts_at: string
          ends_at: string
          registration_deadline: string
          prize_pool_text: string | null
          banner_url: string | null
          tracks: Json | null
          rules: string | null
          status: 'upcoming' | 'live' | 'completed'
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: {
          id?: string
          title: string
          slug: string
          description: string
          mode?: 'online' | 'offline' | 'hybrid'
          location?: string | null
          starts_at: string
          ends_at: string
          registration_deadline: string
          prize_pool_text?: string | null
          banner_url?: string | null
          tracks?: Json | null
          rules?: string | null
          status?: 'upcoming' | 'live' | 'completed'
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Update: {
          id?: string
          title?: string
          slug?: string
          description?: string
          mode?: 'online' | 'offline' | 'hybrid'
          location?: string | null
          starts_at?: string
          ends_at?: string
          registration_deadline?: string
          prize_pool_text?: string | null
          banner_url?: string | null
          tracks?: Json | null
          rules?: string | null
          status?: 'upcoming' | 'live' | 'completed'
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          type: string
          payload: Json
          read_at: string | null
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          type: string
          payload: Json
          read_at?: string | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          type?: string
          payload?: Json
          read_at?: string | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
      }
    }
    Views: {
      active_startups: {
        Row: Database['public']['Tables']['startups']['Row']
      }
    }
    Functions: {
      create_mutual_match: {
        Args: {
          swiper: string
          target: string
        }
        Returns: {
          matched: boolean
          match_id: string | null
        }
      }
    }
  }
}
