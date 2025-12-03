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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      categories: {
        Row: {
          id: number
          name_en: string
          name_he: string
          name_ru: string
          slug: string
        }
        Insert: {
          id?: number
          name_en: string
          name_he: string
          name_ru: string
          slug: string
        }
        Update: {
          id?: number
          name_en?: string
          name_he?: string
          name_ru?: string
          slug?: string
        }
        Relationships: []
      }
      data_deletion_requests: {
        Row: {
          completed_date: string | null
          created_at: string
          id: string
          request_date: string
          status: string
          user_id: string
        }
        Insert: {
          completed_date?: string | null
          created_at?: string
          id?: string
          request_date?: string
          status?: string
          user_id: string
        }
        Update: {
          completed_date?: string | null
          created_at?: string
          id?: string
          request_date?: string
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      energy_category: {
        Row: {
          id: number
          name_en: string
          name_he: string
          name_ru: string
          slug: string
        }
        Insert: {
          id?: number
          name_en: string
          name_he: string
          name_ru: string
          slug: string
        }
        Update: {
          id?: number
          name_en?: string
          name_he?: string
          name_ru?: string
          slug?: string
        }
        Relationships: []
      }
      metadata: {
        Row: {
          key: string
          updated_at: string | null
          value: string | null
        }
        Insert: {
          key: string
          updated_at?: string | null
          value?: string | null
        }
        Update: {
          key?: string
          updated_at?: string | null
          value?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          description: string | null
          full_name: string | null
          hospital: string | null
          how_found_us: string | null
          id: string
          medical_field: string | null
          specialization: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          full_name?: string | null
          hospital?: string | null
          how_found_us?: string | null
          id: string
          medical_field?: string | null
          specialization?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          full_name?: string | null
          hospital?: string | null
          how_found_us?: string | null
          id?: string
          medical_field?: string | null
          specialization?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      sentences_for_doctors: {
        Row: {
          en: string
          energy_category_id: number | null
          he: string
          id: number
          rus: string
        }
        Insert: {
          en: string
          energy_category_id?: number | null
          he: string
          id?: number
          rus: string
        }
        Update: {
          en?: string
          energy_category_id?: number | null
          he?: string
          id?: number
          rus?: string
        }
        Relationships: [
          {
            foreignKeyName: "sentences_for_doctors_energy_category_id_fkey"
            columns: ["energy_category_id"]
            isOneToOne: false
            referencedRelation: "energy_category"
            referencedColumns: ["id"]
          },
        ]
      }
      user_category_progress: {
        Row: {
          category_id: number
          last_updated: string | null
          progress: Json | null
          user_id: string
        }
        Insert: {
          category_id: number
          last_updated?: string | null
          progress?: Json | null
          user_id: string
        }
        Update: {
          category_id?: number
          last_updated?: string | null
          progress?: Json | null
          user_id?: string
        }
        Relationships: []
      }
      user_consent: {
        Row: {
          consent_date: string
          created_at: string
          data_processing_accepted: boolean
          id: string
          ip_address: string | null
          marketing_accepted: boolean
          privacy_accepted: boolean
          terms_accepted: boolean
          updated_at: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          consent_date?: string
          created_at?: string
          data_processing_accepted?: boolean
          id?: string
          ip_address?: string | null
          marketing_accepted?: boolean
          privacy_accepted?: boolean
          terms_accepted?: boolean
          updated_at?: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          consent_date?: string
          created_at?: string
          data_processing_accepted?: boolean
          id?: string
          ip_address?: string | null
          marketing_accepted?: boolean
          privacy_accepted?: boolean
          terms_accepted?: boolean
          updated_at?: string
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_mastered_words: {
        Row: {
          mastered_at: string
          user_id: string
          word_key: string
        }
        Insert: {
          mastered_at?: string
          user_id: string
          word_key: string
        }
        Update: {
          mastered_at?: string
          user_id?: string
          word_key?: string
        }
        Relationships: []
      }
      user_progress: {
        Row: {
          attempts: number
          correct: number
          last_seen: string
          user_id: string
          word_id: number
        }
        Insert: {
          attempts?: number
          correct?: number
          last_seen?: string
          user_id: string
          word_id: number
        }
        Update: {
          attempts?: number
          correct?: number
          last_seen?: string
          user_id?: string
          word_id?: number
        }
        Relationships: []
      }
      word_sentences: {
        Row: {
          created_at: string
          id: number
          sentence_he: string
          word_id: number
        }
        Insert: {
          created_at?: string
          id?: number
          sentence_he: string
          word_id: number
        }
        Update: {
          created_at?: string
          id?: number
          sentence_he?: string
          word_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "word_sentences_word_id_fkey"
            columns: ["word_id"]
            isOneToOne: false
            referencedRelation: "words"
            referencedColumns: ["id"]
          },
        ]
      }
      words: {
        Row: {
          category_id: number | null
          en: string
          he: string
          id: number
          rus: string
        }
        Insert: {
          category_id?: number | null
          en: string
          he: string
          id?: number
          rus: string
        }
        Update: {
          category_id?: number | null
          en?: string
          he?: string
          id?: number
          rus?: string
        }
        Relationships: [
          {
            foreignKeyName: "words_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
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
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
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
