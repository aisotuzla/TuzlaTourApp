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
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      achievements: {
        Row: {
          created_at: string
          description: Json
          icon: string
          id: string
          is_active: boolean
          sort_order: number
          title: Json
          xp_reward: number
        }
        Insert: {
          created_at?: string
          description: Json
          icon?: string
          id: string
          is_active?: boolean
          sort_order?: number
          title: Json
          xp_reward?: number
        }
        Update: {
          created_at?: string
          description?: Json
          icon?: string
          id?: string
          is_active?: boolean
          sort_order?: number
          title?: Json
          xp_reward?: number
        }
        Relationships: []
      }
      Audio: {
        Row: {
          created_at: Json
          id: number
        }
        Insert: {
          created_at: Json
          id?: number
        }
        Update: {
          created_at?: Json
          id?: number
        }
        Relationships: []
      }
      player_achievements: {
        Row: {
          achievement_id: string
          unlocked_at: string
          user_id: string
        }
        Insert: {
          achievement_id: string
          unlocked_at?: string
          user_id: string
        }
        Update: {
          achievement_id?: string
          unlocked_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "player_achievements_achievement_id_fkey"
            columns: ["achievement_id"]
            isOneToOne: false
            referencedRelation: "achievements"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string | null
          id: string
          leaderboard_opt_in: boolean
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          id: string
          leaderboard_opt_in?: boolean
        }
        Update: {
          created_at?: string
          display_name?: string | null
          id?: string
          leaderboard_opt_in?: boolean
        }
        Relationships: []
      }
      quest_completions: {
        Row: {
          completed_at: string
          id: string
          player_id: string
          quest_id: string
          xp_awarded: number
        }
        Insert: {
          completed_at?: string
          id?: string
          player_id: string
          quest_id: string
          xp_awarded: number
        }
        Update: {
          completed_at?: string
          id?: string
          player_id?: string
          quest_id?: string
          xp_awarded?: number
        }
        Relationships: [
          {
            foreignKeyName: "quest_completions_quest_id_fkey"
            columns: ["quest_id"]
            isOneToOne: false
            referencedRelation: "quests"
            referencedColumns: ["id"]
          },
        ]
      }
      quests: {
        Row: {
          created_at: string
          description: Json | null
          gps_required: boolean
          id: string
          is_active: boolean
          location: unknown
          phase: number
          qr_code_id: string | null
          radius_meters: number
          title: Json
          xp_reward: number
        }
        Insert: {
          created_at?: string
          description?: Json | null
          gps_required?: boolean
          id: string
          is_active?: boolean
          location: unknown
          phase: number
          qr_code_id?: string | null
          radius_meters?: number
          title: Json
          xp_reward?: number
        }
        Update: {
          created_at?: string
          description?: Json | null
          gps_required?: boolean
          id?: string
          is_active?: boolean
          location?: unknown
          phase?: number
          qr_code_id?: string | null
          radius_meters?: number
          title?: Json
          xp_reward?: number
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          role: string
          user_id: string
        }
        Insert: {
          created_at?: string
          role: string
          user_id: string
        }
        Update: {
          created_at?: string
          role?: string
          user_id?: string
        }
        Relationships: []
      }
      verification_attempts: {
        Row: {
          created_at: string
          distance_meters: number | null
          failure_reason: string | null
          id: number
          method: string
          player_id: string | null
          quest_id: string | null
          succeeded: boolean
        }
        Insert: {
          created_at?: string
          distance_meters?: number | null
          failure_reason?: string | null
          id?: never
          method: string
          player_id?: string | null
          quest_id?: string | null
          succeeded: boolean
        }
        Update: {
          created_at?: string
          distance_meters?: number | null
          failure_reason?: string | null
          id?: never
          method?: string
          player_id?: string | null
          quest_id?: string | null
          succeeded?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "verification_attempts_quest_id_fkey"
            columns: ["quest_id"]
            isOneToOne: false
            referencedRelation: "quests"
            referencedColumns: ["id"]
          },
        ]
      }
      xp_transactions: {
        Row: {
          amount: number
          created_at: string
          description: string | null
          id: number
          idempotency_key: string
          phase: number | null
          quest_id: string | null
          reason: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          description?: string | null
          id?: never
          idempotency_key: string
          phase?: number | null
          quest_id?: string | null
          reason: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string | null
          id?: never
          idempotency_key?: string
          phase?: number | null
          quest_id?: string | null
          reason?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "xp_transactions_quest_id_fkey"
            columns: ["quest_id"]
            isOneToOne: false
            referencedRelation: "quests"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      admin_get_tuzla_quest_config: { Args: never; Returns: Json }
      admin_set_tuzla_quest_qr: {
        Args: { p_qr_payload: string; p_quest_id: string }
        Returns: Json
      }
      complete_tuzla_quest: {
        Args: {
          p_lat?: number
          p_lon?: number
          p_qr_payload: string
          p_quest_id: string
        }
        Returns: Json
      }
      complete_tuzla_quest_legacy: {
        Args: {
          p_lat?: number
          p_lon?: number
          p_qr_payload: string
          p_quest_id: string
        }
        Returns: Json
      }
      get_my_tuzla_dashboard: { Args: never; Returns: Json }
      get_tuzla_admin_dashboard: {
        Args: { p_recent_limit?: number }
        Returns: Json
      }
      get_tuzla_leaderboard: {
        Args: { p_limit?: number }
        Returns: {
          display_name: string
          player_level: number
          player_rank: number
          quests_completed: number
          xp_total: number
        }[]
      }
      tuzla_level_for_xp: { Args: { p_xp: number }; Returns: number }
      tuzla_level_title: { Args: { p_level: number }; Returns: string }
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
