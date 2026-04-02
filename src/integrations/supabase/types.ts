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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      chat_messages: {
        Row: {
          consultation_id: string
          created_at: string
          file_name: string | null
          file_size: string | null
          file_type: string | null
          file_url: string | null
          id: string
          message: string
          sender_name: string
          sender_user_id: string
        }
        Insert: {
          consultation_id: string
          created_at?: string
          file_name?: string | null
          file_size?: string | null
          file_type?: string | null
          file_url?: string | null
          id?: string
          message?: string
          sender_name: string
          sender_user_id: string
        }
        Update: {
          consultation_id?: string
          created_at?: string
          file_name?: string | null
          file_size?: string | null
          file_type?: string | null
          file_url?: string | null
          id?: string
          message?: string
          sender_name?: string
          sender_user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_consultation_id_fkey"
            columns: ["consultation_id"]
            isOneToOne: false
            referencedRelation: "consultations"
            referencedColumns: ["id"]
          },
        ]
      }
      consultations: {
        Row: {
          agenda: string | null
          case_name: string
          client_name: string
          client_user_id: string | null
          consultation_type: Database["public"]["Enums"]["consultation_type"]
          created_at: string
          date: string
          duration: number | null
          end_photo: string | null
          id: string
          jenis_kelamin: string | null
          law_type: string | null
          lawyer_user_id: string | null
          nik: string | null
          penyandang_disabilitas: boolean | null
          rating: number | null
          review: string | null
          service_type: string | null
          start_photo: string | null
          status: Database["public"]["Enums"]["consultation_status"]
          tanggal_lahir: string | null
          telp: string | null
          updated_at: string
        }
        Insert: {
          agenda?: string | null
          case_name: string
          client_name: string
          client_user_id?: string | null
          consultation_type?: Database["public"]["Enums"]["consultation_type"]
          created_at?: string
          date?: string
          duration?: number | null
          end_photo?: string | null
          id?: string
          jenis_kelamin?: string | null
          law_type?: string | null
          lawyer_user_id?: string | null
          nik?: string | null
          penyandang_disabilitas?: boolean | null
          rating?: number | null
          review?: string | null
          service_type?: string | null
          start_photo?: string | null
          status?: Database["public"]["Enums"]["consultation_status"]
          tanggal_lahir?: string | null
          telp?: string | null
          updated_at?: string
        }
        Update: {
          agenda?: string | null
          case_name?: string
          client_name?: string
          client_user_id?: string | null
          consultation_type?: Database["public"]["Enums"]["consultation_type"]
          created_at?: string
          date?: string
          duration?: number | null
          end_photo?: string | null
          id?: string
          jenis_kelamin?: string | null
          law_type?: string | null
          lawyer_user_id?: string | null
          nik?: string | null
          penyandang_disabilitas?: boolean | null
          rating?: number | null
          review?: string | null
          service_type?: string | null
          start_photo?: string | null
          status?: Database["public"]["Enums"]["consultation_status"]
          tanggal_lahir?: string | null
          telp?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      master_jenis_hukum: {
        Row: {
          created_at: string
          id: string
          nama: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          nama: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          nama?: string
          updated_at?: string
        }
        Relationships: []
      }
      master_jenis_layanan: {
        Row: {
          created_at: string
          id: string
          nama: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          nama: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          nama?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          approval_status: Database["public"]["Enums"]["approval_status"]
          approved_at: string | null
          approved_by: string | null
          created_at: string
          email: string | null
          id: string
          jenis_kelamin: string | null
          last_seen_at: string | null
          nama: string
          nik: string | null
          nomor_wa: string | null
          penyandang_disabilitas: boolean | null
          tanggal_lahir: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          approval_status?: Database["public"]["Enums"]["approval_status"]
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          email?: string | null
          id?: string
          jenis_kelamin?: string | null
          last_seen_at?: string | null
          nama?: string
          nik?: string | null
          nomor_wa?: string | null
          penyandang_disabilitas?: boolean | null
          tanggal_lahir?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          approval_status?: Database["public"]["Enums"]["approval_status"]
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          email?: string | null
          id?: string
          jenis_kelamin?: string | null
          last_seen_at?: string | null
          nama?: string
          nik?: string | null
          nomor_wa?: string | null
          penyandang_disabilitas?: boolean | null
          tanggal_lahir?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_approved: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "superadmin" | "admin" | "lawyer" | "client"
      approval_status: "pending" | "approved" | "rejected"
      consultation_status: "pending" | "in_progress" | "completed"
      consultation_type: "offline" | "chat" | "video_call"
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
    Enums: {
      app_role: ["superadmin", "admin", "lawyer", "client"],
      approval_status: ["pending", "approved", "rejected"],
      consultation_status: ["pending", "in_progress", "completed"],
      consultation_type: ["offline", "chat", "video_call"],
    },
  },
} as const
