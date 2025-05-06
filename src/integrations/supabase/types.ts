export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      admin_users: {
        Row: {
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          is_icebreaker: boolean | null
          match_id: string
          read_at: string | null
          sender_id: string
          translated_content: string | null
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          is_icebreaker?: boolean | null
          match_id: string
          read_at?: string | null
          sender_id: string
          translated_content?: string | null
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          is_icebreaker?: boolean | null
          match_id?: string
          read_at?: string | null
          sender_id?: string
          translated_content?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
        ]
      }
      identity_verifications: {
        Row: {
          country_code: string | null
          created_at: string
          doc_type: string | null
          id: string
          id_front_url: string
          rejection_reason: string | null
          reviewed_at: string | null
          status: string | null
          submitted_at: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          country_code?: string | null
          created_at?: string
          doc_type?: string | null
          id?: string
          id_front_url: string
          rejection_reason?: string | null
          reviewed_at?: string | null
          status?: string | null
          submitted_at?: string | null
          updated_at: string
          user_id?: string | null
        }
        Update: {
          country_code?: string | null
          created_at?: string
          doc_type?: string | null
          id?: string
          id_front_url?: string
          rejection_reason?: string | null
          reviewed_at?: string | null
          status?: string | null
          submitted_at?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "identity_verifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      language_skills: {
        Row: {
          id: string
          language_code: string
          proficiency: string | null
          user_id: string | null
        }
        Insert: {
          id?: string
          language_code: string
          proficiency?: string | null
          user_id?: string | null
        }
        Update: {
          id?: string
          language_code?: string
          proficiency?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "language_skills_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      matches: {
        Row: {
          created_at: string
          id: string
          status: string
          target_user_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          status: string
          target_user_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          status?: string
          target_user_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          body: string
          created_at: string
          id: string
          is_read: boolean | null
          related_id: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          body: string
          created_at?: string
          id?: string
          is_read?: boolean | null
          related_id?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          is_read?: boolean | null
          related_id?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      profile_photos: {
        Row: {
          id: string
          sort_order: number
          uploaded_at: string | null
          url: string
          user_id: string | null
        }
        Insert: {
          id?: string
          sort_order: number
          uploaded_at?: string | null
          url: string
          user_id?: string | null
        }
        Update: {
          id?: string
          sort_order?: number
          uploaded_at?: string | null
          url?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profile_photos_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_interests: {
        Row: {
          id: string
          interest: string
          user_id: string | null
        }
        Insert: {
          id?: string
          interest: string
          user_id?: string | null
        }
        Update: {
          id?: string
          interest?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_interests_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_nationalities: {
        Row: {
          created_at: string
          id: string
          nationality: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          nationality: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          nationality?: string
          user_id?: string
        }
        Relationships: []
      }
      users: {
        Row: {
          bio: string | null
          birthdate: string | null
          city: string | null
          country_code: string | null
          created_at: string | null
          gender: string | null
          id: string
          is_verified: boolean | null
          nickname: string | null
          onboarding_completed: boolean | null
          onboarding_step: number | null
          updated_at: string | null
        }
        Insert: {
          bio?: string | null
          birthdate?: string | null
          city?: string | null
          country_code?: string | null
          created_at?: string | null
          gender?: string | null
          id: string
          is_verified?: boolean | null
          nickname?: string | null
          onboarding_completed?: boolean | null
          onboarding_step?: number | null
          updated_at?: string | null
        }
        Update: {
          bio?: string | null
          birthdate?: string | null
          city?: string | null
          country_code?: string | null
          created_at?: string | null
          gender?: string | null
          id?: string
          is_verified?: boolean | null
          nickname?: string | null
          onboarding_completed?: boolean | null
          onboarding_step?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      verification_requests: {
        Row: {
          created_at: string
          id: string
          photo_url: string
          rejection_reason: string | null
          status: string
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          photo_url: string
          rejection_reason?: string | null
          status: string
          type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          photo_url?: string
          rejection_reason?: string | null
          status?: string
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      delete_account_rpc: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      delete_profile_photo: {
        Args: { photo_id: string }
        Returns: undefined
      }
      get_recommended_profiles_by_nationality: {
        Args: { p_user_id: string }
        Returns: {
          id: string
          name: string
          age: number
          location: string
          photo: string
          bio: string
          job: string
          nationality: string
        }[]
      }
      get_recommended_profiles_by_nationality_fixed: {
        Args: { p_user_id: string }
        Returns: {
          id: string
          name: string
          age: number
          location: string
          photo: string
          bio: string
          job: string
          nationality: string
        }[]
      }
      get_user_notifications: {
        Args: { p_user_id: string }
        Returns: {
          id: string
          type: string
          title: string
          body: string
          related_id: string
          is_read: boolean
          created_at: string
        }[]
      }
      get_user_onboarding_status: {
        Args: { user_id: string }
        Returns: {
          id: string
          onboarding_completed: boolean
          onboarding_step: number
        }[]
      }
      get_user_profile_photos: {
        Args: { user_id: string }
        Returns: {
          id: string
          url: string
          sort_order: number
          user_id: string
          uploaded_at: string
        }[]
      }
      handle_user_like: {
        Args: { p_user_id: string; p_target_profile_id: string }
        Returns: boolean
      }
      insert_profile_photo: {
        Args: { user_id: string; photo_url: string; order_number: number }
        Returns: {
          id: string
          sort_order: number
          uploaded_at: string | null
          url: string
          user_id: string | null
        }
      }
      is_admin: {
        Args: { user_id: string }
        Returns: boolean
      }
      mark_all_notifications_as_read: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      mark_notification_as_read: {
        Args: { p_notification_id: string }
        Returns: boolean
      }
      update_user_onboarding_step: {
        Args: { user_id: string; step_number: number; is_completed?: boolean }
        Returns: {
          bio: string | null
          birthdate: string | null
          city: string | null
          country_code: string | null
          created_at: string | null
          gender: string | null
          id: string
          is_verified: boolean | null
          nickname: string | null
          onboarding_completed: boolean | null
          onboarding_step: number | null
          updated_at: string | null
        }
      }
      upsert_user_profile: {
        Args: { user_id: string; step_number?: number; is_completed?: boolean }
        Returns: {
          bio: string | null
          birthdate: string | null
          city: string | null
          country_code: string | null
          created_at: string | null
          gender: string | null
          id: string
          is_verified: boolean | null
          nickname: string | null
          onboarding_completed: boolean | null
          onboarding_step: number | null
          updated_at: string | null
        }
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
