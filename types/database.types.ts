export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "10.2.0 (e07807d)"
  }
  public: {
    Tables: {
      app_settings: {
        Row: {
          ask_the_mayor: boolean | null
          created_at: string
          id: number
        }
        Insert: {
          ask_the_mayor?: boolean | null
          created_at?: string
          id?: number
        }
        Update: {
          ask_the_mayor?: boolean | null
          created_at?: string
          id?: number
        }
        Relationships: []
      }
      atm_submissions: {
        Row: {
          approved_for_use: boolean | null
          created_at: string
          id: number
          instagram_handle: string | null
          metadata: Json | null
          retakes: number | null
          subfolder_date: string | null
          transcript: string | null
          user_id: string | null
          video_filename: string | null
        }
        Insert: {
          approved_for_use?: boolean | null
          created_at?: string
          id?: number
          instagram_handle?: string | null
          metadata?: Json | null
          retakes?: number | null
          subfolder_date?: string | null
          transcript?: string | null
          user_id?: string | null
          video_filename?: string | null
        }
        Update: {
          approved_for_use?: boolean | null
          created_at?: string
          id?: number
          instagram_handle?: string | null
          metadata?: Json | null
          retakes?: number | null
          subfolder_date?: string | null
          transcript?: string | null
          user_id?: string | null
          video_filename?: string | null
        }
        Relationships: []
      }
      closedCaptioning: {
        Row: {
          created_at: string | null
          current_partial_transcript: string | null
          id: number
          station_id: number | null
        }
        Insert: {
          created_at?: string | null
          current_partial_transcript?: string | null
          id?: number
          station_id?: number | null
        }
        Update: {
          created_at?: string | null
          current_partial_transcript?: string | null
          id?: number
          station_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "closedCaptioning_station_id_fkey"
            columns: ["station_id"]
            isOneToOne: false
            referencedRelation: "stations"
            referencedColumns: ["id"]
          },
        ]
      }
      device_ids: {
        Row: {
          created_at: string
          device_id: string | null
          id: number
          user_id: string | null
        }
        Insert: {
          created_at?: string
          device_id?: string | null
          id?: number
          user_id?: string | null
        }
        Update: {
          created_at?: string
          device_id?: string | null
          id?: number
          user_id?: string | null
        }
        Relationships: []
      }
      favorited: {
        Row: {
          audio: Json | null
          authors: Json | null
          cmsSource: string | null
          created_at: string
          estimatedDuration: number | null
          id: number
          image: Json | null
          media_id: string | null
          meta: Json | null
          producingOrganizations: Json | null
          reading_time: string | null
          showTitle: string | null
          slug: string | null
          title: string | null
          type: string | null
          uid: string | null
          url: string | null
        }
        Insert: {
          audio?: Json | null
          authors?: Json | null
          cmsSource?: string | null
          created_at?: string
          estimatedDuration?: number | null
          id?: number
          image?: Json | null
          media_id?: string | null
          meta?: Json | null
          producingOrganizations?: Json | null
          reading_time?: string | null
          showTitle?: string | null
          slug?: string | null
          title?: string | null
          type?: string | null
          uid?: string | null
          url?: string | null
        }
        Update: {
          audio?: Json | null
          authors?: Json | null
          cmsSource?: string | null
          created_at?: string
          estimatedDuration?: number | null
          id?: number
          image?: Json | null
          media_id?: string | null
          meta?: Json | null
          producingOrganizations?: Json | null
          reading_time?: string | null
          showTitle?: string | null
          slug?: string | null
          title?: string | null
          type?: string | null
          uid?: string | null
          url?: string | null
        }
        Relationships: []
      }
      notification_topics: {
        Row: {
          created_at: string
          description: string | null
          id: number
          key: string | null
          label: string | null
          value: boolean | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: number
          key?: string | null
          label?: string | null
          value?: boolean | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: number
          key?: string | null
          label?: string | null
          value?: boolean | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          app_user: boolean | null
          autodownload: boolean | null
          avatar_image_url: string | null
          continuous_play: boolean | null
          dark_mode: boolean | null
          default_live_stream: string | null
          email: string | null
          id: string
          initial: boolean | null
          is_admin: boolean | null
          name: string | null
          one_signal_notification_channels: Json | null
          one_signal_subscription_ids: string[] | null
          onesignal_id: string | null
          phone: string | null
          pronouns: string | null
          receive_general_notifications: boolean | null
          salesforce_id: string | null
          text_size: string | null
          updated_at: string | null
        }
        Insert: {
          app_user?: boolean | null
          autodownload?: boolean | null
          avatar_image_url?: string | null
          continuous_play?: boolean | null
          dark_mode?: boolean | null
          default_live_stream?: string | null
          email?: string | null
          id: string
          initial?: boolean | null
          is_admin?: boolean | null
          name?: string | null
          one_signal_notification_channels?: Json | null
          one_signal_subscription_ids?: string[] | null
          onesignal_id?: string | null
          phone?: string | null
          pronouns?: string | null
          receive_general_notifications?: boolean | null
          salesforce_id?: string | null
          text_size?: string | null
          updated_at?: string | null
        }
        Update: {
          app_user?: boolean | null
          autodownload?: boolean | null
          avatar_image_url?: string | null
          continuous_play?: boolean | null
          dark_mode?: boolean | null
          default_live_stream?: string | null
          email?: string | null
          id?: string
          initial?: boolean | null
          is_admin?: boolean | null
          name?: string | null
          one_signal_notification_channels?: Json | null
          one_signal_subscription_ids?: string[] | null
          onesignal_id?: string | null
          phone?: string | null
          pronouns?: string | null
          receive_general_notifications?: boolean | null
          salesforce_id?: string | null
          text_size?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      recently_viewed: {
        Row: {
          audio: Json | null
          authors: Json | null
          cmsSource: string | null
          created_at: string
          estimatedDuration: number | null
          id: number
          image: Json | null
          media_id: string | null
          meta: Json | null
          producingOrganizations: Json | null
          reading_time: string | null
          showTitle: string | null
          slug: string | null
          title: string | null
          type: string | null
          uid: string | null
          url: string | null
        }
        Insert: {
          audio?: Json | null
          authors?: Json | null
          cmsSource?: string | null
          created_at?: string
          estimatedDuration?: number | null
          id?: number
          image?: Json | null
          media_id?: string | null
          meta?: Json | null
          producingOrganizations?: Json | null
          reading_time?: string | null
          showTitle?: string | null
          slug?: string | null
          title?: string | null
          type?: string | null
          uid?: string | null
          url?: string | null
        }
        Update: {
          audio?: Json | null
          authors?: Json | null
          cmsSource?: string | null
          created_at?: string
          estimatedDuration?: number | null
          id?: number
          image?: Json | null
          media_id?: string | null
          meta?: Json | null
          producingOrganizations?: Json | null
          reading_time?: string | null
          showTitle?: string | null
          slug?: string | null
          title?: string | null
          type?: string | null
          uid?: string | null
          url?: string | null
        }
        Relationships: []
      }
      shows: {
        Row: {
          cmsSource: string | null
          createdAt: string
          description: string | null
          featured: boolean | null
          guid: string | null
          id: number
          showId: number | null
          slug: string | null
          title: string | null
        }
        Insert: {
          cmsSource?: string | null
          createdAt?: string
          description?: string | null
          featured?: boolean | null
          guid?: string | null
          id?: number
          showId?: number | null
          slug?: string | null
          title?: string | null
        }
        Update: {
          cmsSource?: string | null
          createdAt?: string
          description?: string | null
          featured?: boolean | null
          guid?: string | null
          id?: number
          showId?: number | null
          slug?: string | null
          title?: string | null
        }
        Relationships: []
      }
      stations: {
        Row: {
          created_at: string | null
          hls_url: string | null
          id: number
          name: string | null
        }
        Insert: {
          created_at?: string | null
          hls_url?: string | null
          id?: number
          name?: string | null
        }
        Update: {
          created_at?: string | null
          hls_url?: string | null
          id?: number
          name?: string | null
        }
        Relationships: []
      }
      transactions: {
        Row: {
          created_at: string
          id: number
          new_amount: number | null
          salesforce_id: string | null
          springboard_id: number | null
          status: string | null
          type: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string
          id?: number
          new_amount?: number | null
          salesforce_id?: string | null
          springboard_id?: number | null
          status?: string | null
          type?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string
          id?: number
          new_amount?: number | null
          salesforce_id?: string | null
          springboard_id?: number | null
          status?: string | null
          type?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      transcripts: {
        Row: {
          created_at: string | null
          id: number
          station_id: number | null
          transcript: Json | null
        }
        Insert: {
          created_at?: string | null
          id?: number
          station_id?: number | null
          transcript?: Json | null
        }
        Update: {
          created_at?: string | null
          id?: number
          station_id?: number | null
          transcript?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "transcripts_station_id_fkey"
            columns: ["station_id"]
            isOneToOne: false
            referencedRelation: "stations"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_current_user_admin: { Args: never; Returns: boolean }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
