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
      digital_platforms: {
        Row: {
          created_at: string
          description: string | null
          id: string
          logo_url: string | null
          name: string
          official_policy_url: string | null
          slug: string
          status: Database["public"]["Enums"]["dpc_platform_status"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          logo_url?: string | null
          name: string
          official_policy_url?: string | null
          slug: string
          status?: Database["public"]["Enums"]["dpc_platform_status"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          logo_url?: string | null
          name?: string
          official_policy_url?: string | null
          slug?: string
          status?: Database["public"]["Enums"]["dpc_platform_status"]
          updated_at?: string
        }
        Relationships: []
      }
      employee_training_progress: {
        Row: {
          attempts: number
          completed_at: string | null
          created_at: string
          employee_id: string
          id: string
          last_activity_at: string | null
          lesson_id: string | null
          manager_notes: string | null
          platform_id: string | null
          progress_percent: number
          quiz_score: number | null
          status: Database["public"]["Enums"]["dpc_progress_status"]
          updated_at: string
        }
        Insert: {
          attempts?: number
          completed_at?: string | null
          created_at?: string
          employee_id: string
          id?: string
          last_activity_at?: string | null
          lesson_id?: string | null
          manager_notes?: string | null
          platform_id?: string | null
          progress_percent?: number
          quiz_score?: number | null
          status?: Database["public"]["Enums"]["dpc_progress_status"]
          updated_at?: string
        }
        Update: {
          attempts?: number
          completed_at?: string | null
          created_at?: string
          employee_id?: string
          id?: string
          last_activity_at?: string | null
          lesson_id?: string | null
          manager_notes?: string | null
          platform_id?: string | null
          progress_percent?: number
          quiz_score?: number | null
          status?: Database["public"]["Enums"]["dpc_progress_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "employee_training_progress_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "training_lessons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employee_training_progress_platform_id_fkey"
            columns: ["platform_id"]
            isOneToOne: false
            referencedRelation: "digital_platforms"
            referencedColumns: ["id"]
          },
        ]
      }
      platform_policies: {
        Row: {
          category: string
          created_at: string
          current_content: string | null
          current_version: string
          id: string
          platform_id: string
          risk_level: Database["public"]["Enums"]["dpc_severity"]
          status: Database["public"]["Enums"]["dpc_policy_status"]
          summary: string | null
          title: string
          updated_at: string
        }
        Insert: {
          category: string
          created_at?: string
          current_content?: string | null
          current_version?: string
          id?: string
          platform_id: string
          risk_level?: Database["public"]["Enums"]["dpc_severity"]
          status?: Database["public"]["Enums"]["dpc_policy_status"]
          summary?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          current_content?: string | null
          current_version?: string
          id?: string
          platform_id?: string
          risk_level?: Database["public"]["Enums"]["dpc_severity"]
          status?: Database["public"]["Enums"]["dpc_policy_status"]
          summary?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "platform_policies_platform_id_fkey"
            columns: ["platform_id"]
            isOneToOne: false
            referencedRelation: "digital_platforms"
            referencedColumns: ["id"]
          },
        ]
      }
      platform_policy_sources: {
        Row: {
          check_frequency: Database["public"]["Enums"]["dpc_check_freq"]
          created_at: string
          id: string
          is_active: boolean
          last_checked_at: string | null
          last_status: string | null
          platform_id: string
          source_name: string
          source_type: Database["public"]["Enums"]["dpc_source_type"]
          source_url: string | null
          updated_at: string
        }
        Insert: {
          check_frequency?: Database["public"]["Enums"]["dpc_check_freq"]
          created_at?: string
          id?: string
          is_active?: boolean
          last_checked_at?: string | null
          last_status?: string | null
          platform_id: string
          source_name: string
          source_type?: Database["public"]["Enums"]["dpc_source_type"]
          source_url?: string | null
          updated_at?: string
        }
        Update: {
          check_frequency?: Database["public"]["Enums"]["dpc_check_freq"]
          created_at?: string
          id?: string
          is_active?: boolean
          last_checked_at?: string | null
          last_status?: string | null
          platform_id?: string
          source_name?: string
          source_type?: Database["public"]["Enums"]["dpc_source_type"]
          source_url?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "platform_policy_sources_platform_id_fkey"
            columns: ["platform_id"]
            isOneToOne: false
            referencedRelation: "digital_platforms"
            referencedColumns: ["id"]
          },
        ]
      }
      platform_policy_updates: {
        Row: {
          action_required: string | null
          affected_roles: string[] | null
          affected_team: string | null
          change_type: string
          created_at: string
          detected_at: string
          id: string
          new_text: string | null
          old_text: string | null
          platform_id: string
          policy_id: string | null
          published_at: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          severity: Database["public"]["Enums"]["dpc_severity"]
          source_id: string | null
          status: Database["public"]["Enums"]["dpc_update_status"]
          update_summary: string | null
          update_title: string
          updated_at: string
        }
        Insert: {
          action_required?: string | null
          affected_roles?: string[] | null
          affected_team?: string | null
          change_type?: string
          created_at?: string
          detected_at?: string
          id?: string
          new_text?: string | null
          old_text?: string | null
          platform_id: string
          policy_id?: string | null
          published_at?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          severity?: Database["public"]["Enums"]["dpc_severity"]
          source_id?: string | null
          status?: Database["public"]["Enums"]["dpc_update_status"]
          update_summary?: string | null
          update_title: string
          updated_at?: string
        }
        Update: {
          action_required?: string | null
          affected_roles?: string[] | null
          affected_team?: string | null
          change_type?: string
          created_at?: string
          detected_at?: string
          id?: string
          new_text?: string | null
          old_text?: string | null
          platform_id?: string
          policy_id?: string | null
          published_at?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          severity?: Database["public"]["Enums"]["dpc_severity"]
          source_id?: string | null
          status?: Database["public"]["Enums"]["dpc_update_status"]
          update_summary?: string | null
          update_title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "platform_policy_updates_platform_id_fkey"
            columns: ["platform_id"]
            isOneToOne: false
            referencedRelation: "digital_platforms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "platform_policy_updates_policy_id_fkey"
            columns: ["policy_id"]
            isOneToOne: false
            referencedRelation: "platform_policies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "platform_policy_updates_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "platform_policy_sources"
            referencedColumns: ["id"]
          },
        ]
      }
      platform_policy_versions: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          change_summary: string | null
          created_at: string
          detected_at: string
          detected_by: string
          id: string
          new_content: string | null
          old_content: string | null
          policy_id: string
          version_number: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          change_summary?: string | null
          created_at?: string
          detected_at?: string
          detected_by?: string
          id?: string
          new_content?: string | null
          old_content?: string | null
          policy_id: string
          version_number: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          change_summary?: string | null
          created_at?: string
          detected_at?: string
          detected_by?: string
          id?: string
          new_content?: string | null
          old_content?: string | null
          policy_id?: string
          version_number?: string
        }
        Relationships: [
          {
            foreignKeyName: "platform_policy_versions_policy_id_fkey"
            columns: ["policy_id"]
            isOneToOne: false
            referencedRelation: "platform_policies"
            referencedColumns: ["id"]
          },
        ]
      }
      policy_acknowledgements: {
        Row: {
          acknowledged_at: string | null
          assigned_at: string
          assigned_by: string | null
          created_at: string
          due_date: string | null
          employee_id: string
          id: string
          manager_approval_status: string | null
          manager_approved_at: string | null
          manager_approved_by: string | null
          platform_id: string | null
          policy_update_id: string | null
          status: Database["public"]["Enums"]["dpc_ack_status"]
          updated_at: string
        }
        Insert: {
          acknowledged_at?: string | null
          assigned_at?: string
          assigned_by?: string | null
          created_at?: string
          due_date?: string | null
          employee_id: string
          id?: string
          manager_approval_status?: string | null
          manager_approved_at?: string | null
          manager_approved_by?: string | null
          platform_id?: string | null
          policy_update_id?: string | null
          status?: Database["public"]["Enums"]["dpc_ack_status"]
          updated_at?: string
        }
        Update: {
          acknowledged_at?: string | null
          assigned_at?: string
          assigned_by?: string | null
          created_at?: string
          due_date?: string | null
          employee_id?: string
          id?: string
          manager_approval_status?: string | null
          manager_approved_at?: string | null
          manager_approved_by?: string | null
          platform_id?: string | null
          policy_update_id?: string | null
          status?: Database["public"]["Enums"]["dpc_ack_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "policy_acknowledgements_platform_id_fkey"
            columns: ["platform_id"]
            isOneToOne: false
            referencedRelation: "digital_platforms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "policy_acknowledgements_policy_update_id_fkey"
            columns: ["policy_update_id"]
            isOneToOne: false
            referencedRelation: "platform_policy_updates"
            referencedColumns: ["id"]
          },
        ]
      }
      policy_monitoring_logs: {
        Row: {
          checked_at: string
          created_at: string
          detected_updates_count: number
          error_details: string | null
          id: string
          message: string | null
          platform_id: string | null
          run_status: Database["public"]["Enums"]["dpc_monitor_status"]
          source_id: string | null
        }
        Insert: {
          checked_at?: string
          created_at?: string
          detected_updates_count?: number
          error_details?: string | null
          id?: string
          message?: string | null
          platform_id?: string | null
          run_status: Database["public"]["Enums"]["dpc_monitor_status"]
          source_id?: string | null
        }
        Update: {
          checked_at?: string
          created_at?: string
          detected_updates_count?: number
          error_details?: string | null
          id?: string
          message?: string | null
          platform_id?: string | null
          run_status?: Database["public"]["Enums"]["dpc_monitor_status"]
          source_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "policy_monitoring_logs_platform_id_fkey"
            columns: ["platform_id"]
            isOneToOne: false
            referencedRelation: "digital_platforms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "policy_monitoring_logs_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "platform_policy_sources"
            referencedColumns: ["id"]
          },
        ]
      }
      training_assignments: {
        Row: {
          assigned_by: string | null
          assigned_to_department: string | null
          assigned_to_employee_id: string | null
          assigned_to_role: string | null
          created_at: string
          due_date: string | null
          id: string
          lesson_id: string | null
          platform_id: string | null
          status: Database["public"]["Enums"]["dpc_assignment_status"]
          updated_at: string
        }
        Insert: {
          assigned_by?: string | null
          assigned_to_department?: string | null
          assigned_to_employee_id?: string | null
          assigned_to_role?: string | null
          created_at?: string
          due_date?: string | null
          id?: string
          lesson_id?: string | null
          platform_id?: string | null
          status?: Database["public"]["Enums"]["dpc_assignment_status"]
          updated_at?: string
        }
        Update: {
          assigned_by?: string | null
          assigned_to_department?: string | null
          assigned_to_employee_id?: string | null
          assigned_to_role?: string | null
          created_at?: string
          due_date?: string | null
          id?: string
          lesson_id?: string | null
          platform_id?: string | null
          status?: Database["public"]["Enums"]["dpc_assignment_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "training_assignments_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "training_lessons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "training_assignments_platform_id_fkey"
            columns: ["platform_id"]
            isOneToOne: false
            referencedRelation: "digital_platforms"
            referencedColumns: ["id"]
          },
        ]
      }
      training_audit_logs: {
        Row: {
          action_type: string
          created_at: string
          description: string | null
          entity_id: string | null
          id: string
          metadata: Json | null
          module: string | null
          platform_id: string | null
          user_id: string | null
        }
        Insert: {
          action_type: string
          created_at?: string
          description?: string | null
          entity_id?: string | null
          id?: string
          metadata?: Json | null
          module?: string | null
          platform_id?: string | null
          user_id?: string | null
        }
        Update: {
          action_type?: string
          created_at?: string
          description?: string | null
          entity_id?: string | null
          id?: string
          metadata?: Json | null
          module?: string | null
          platform_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "training_audit_logs_platform_id_fkey"
            columns: ["platform_id"]
            isOneToOne: false
            referencedRelation: "digital_platforms"
            referencedColumns: ["id"]
          },
        ]
      }
      training_lessons: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          estimated_minutes: number
          id: string
          is_required: boolean
          lesson_content: string | null
          level: Database["public"]["Enums"]["dpc_lesson_level"]
          platform_id: string | null
          policy_id: string | null
          required_roles: string[] | null
          status: Database["public"]["Enums"]["dpc_lesson_status"]
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          estimated_minutes?: number
          id?: string
          is_required?: boolean
          lesson_content?: string | null
          level?: Database["public"]["Enums"]["dpc_lesson_level"]
          platform_id?: string | null
          policy_id?: string | null
          required_roles?: string[] | null
          status?: Database["public"]["Enums"]["dpc_lesson_status"]
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          estimated_minutes?: number
          id?: string
          is_required?: boolean
          lesson_content?: string | null
          level?: Database["public"]["Enums"]["dpc_lesson_level"]
          platform_id?: string | null
          policy_id?: string | null
          required_roles?: string[] | null
          status?: Database["public"]["Enums"]["dpc_lesson_status"]
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "training_lessons_platform_id_fkey"
            columns: ["platform_id"]
            isOneToOne: false
            referencedRelation: "digital_platforms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "training_lessons_policy_id_fkey"
            columns: ["policy_id"]
            isOneToOne: false
            referencedRelation: "platform_policies"
            referencedColumns: ["id"]
          },
        ]
      }
      training_quiz_questions: {
        Row: {
          correct_answer: string
          created_at: string
          explanation: string | null
          id: string
          options: Json
          points: number
          question: string
          quiz_id: string
        }
        Insert: {
          correct_answer: string
          created_at?: string
          explanation?: string | null
          id?: string
          options?: Json
          points?: number
          question: string
          quiz_id: string
        }
        Update: {
          correct_answer?: string
          created_at?: string
          explanation?: string | null
          id?: string
          options?: Json
          points?: number
          question?: string
          quiz_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "training_quiz_questions_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "training_quizzes"
            referencedColumns: ["id"]
          },
        ]
      }
      training_quizzes: {
        Row: {
          created_at: string
          id: string
          lesson_id: string | null
          max_attempts: number
          passing_score: number
          status: Database["public"]["Enums"]["dpc_lesson_status"]
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          lesson_id?: string | null
          max_attempts?: number
          passing_score?: number
          status?: Database["public"]["Enums"]["dpc_lesson_status"]
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          lesson_id?: string | null
          max_attempts?: number
          passing_score?: number
          status?: Database["public"]["Enums"]["dpc_lesson_status"]
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "training_quizzes_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "training_lessons"
            referencedColumns: ["id"]
          },
        ]
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
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_hr_or_admin: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "super_admin" | "admin" | "hr" | "manager" | "employee"
      dpc_ack_status: "pending" | "acknowledged" | "overdue"
      dpc_assignment_status: "assigned" | "completed" | "overdue"
      dpc_check_freq: "daily" | "weekly" | "manual"
      dpc_lesson_level: "beginner" | "intermediate" | "advanced"
      dpc_lesson_status: "draft" | "published" | "archived"
      dpc_monitor_status:
        | "success"
        | "failed"
        | "no_change"
        | "changes_detected"
      dpc_platform_status: "active" | "coming_soon"
      dpc_policy_status: "active" | "archived"
      dpc_progress_status:
        | "not_started"
        | "in_progress"
        | "completed"
        | "failed"
      dpc_severity: "low" | "medium" | "high" | "critical"
      dpc_source_type: "official_url" | "rss" | "api" | "manual"
      dpc_update_status:
        | "pending_review"
        | "approved"
        | "rejected"
        | "published"
        | "archived"
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
      app_role: ["super_admin", "admin", "hr", "manager", "employee"],
      dpc_ack_status: ["pending", "acknowledged", "overdue"],
      dpc_assignment_status: ["assigned", "completed", "overdue"],
      dpc_check_freq: ["daily", "weekly", "manual"],
      dpc_lesson_level: ["beginner", "intermediate", "advanced"],
      dpc_lesson_status: ["draft", "published", "archived"],
      dpc_monitor_status: [
        "success",
        "failed",
        "no_change",
        "changes_detected",
      ],
      dpc_platform_status: ["active", "coming_soon"],
      dpc_policy_status: ["active", "archived"],
      dpc_progress_status: [
        "not_started",
        "in_progress",
        "completed",
        "failed",
      ],
      dpc_severity: ["low", "medium", "high", "critical"],
      dpc_source_type: ["official_url", "rss", "api", "manual"],
      dpc_update_status: [
        "pending_review",
        "approved",
        "rejected",
        "published",
        "archived",
      ],
    },
  },
} as const
