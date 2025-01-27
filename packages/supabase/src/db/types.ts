export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      invitations: {
        Row: {
          email: string;
          expires_at: string;
          id: string;
          inviter_id: string;
          organization_id: string;
          role: string | null;
          status: string;
        };
        Insert: {
          email: string;
          expires_at: string;
          id?: string;
          inviter_id: string;
          organization_id: string;
          role?: string | null;
          status: string;
        };
        Update: {
          email?: string;
          expires_at?: string;
          id?: string;
          inviter_id?: string;
          organization_id?: string;
          role?: string | null;
          status?: string;
        };
        Relationships: [
          {
            foreignKeyName: "invitations_inviter_id_users_id_fk";
            columns: ["inviter_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "invitations_organization_id_organizations_id_fk";
            columns: ["organization_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
        ];
      };
      members: {
        Row: {
          created_at: string;
          id: string;
          organization_id: string;
          role: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          organization_id: string;
          role: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          organization_id?: string;
          role?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "members_organization_id_organizations_id_fk";
            columns: ["organization_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "members_user_id_users_id_fk";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      organizations: {
        Row: {
          api_key: string;
          created_at: string;
          id: string;
          logo: string | null;
          metadata: string | null;
          name: string;
          plan: string;
          tier: number;
        };
        Insert: {
          api_key: string;
          created_at?: string;
          id: string;
          logo?: string | null;
          metadata?: string | null;
          name: string;
          plan?: string;
          tier?: number;
        };
        Update: {
          api_key?: string;
          created_at?: string;
          id?: string;
          logo?: string | null;
          metadata?: string | null;
          name?: string;
          plan?: string;
          tier?: number;
        };
        Relationships: [];
      };
      project_settings: {
        Row: {
          brand_name: string | null;
          brand_voice: string | null;
          context_detection: boolean;
          created_at: string;
          domain_expertise: string;
          emotive_intent: string;
          formality: string;
          id: string;
          idioms: boolean;
          inclusive_language: boolean;
          length_control: string;
          organization_id: string;
          project_id: string;
          quality_checks: boolean;
          terminology: string | null;
          tone_of_voice: string;
          translation_memory: boolean;
        };
        Insert: {
          brand_name?: string | null;
          brand_voice?: string | null;
          context_detection?: boolean;
          created_at?: string;
          domain_expertise?: string;
          emotive_intent?: string;
          formality?: string;
          id: string;
          idioms?: boolean;
          inclusive_language?: boolean;
          length_control?: string;
          organization_id: string;
          project_id: string;
          quality_checks?: boolean;
          terminology?: string | null;
          tone_of_voice?: string;
          translation_memory?: boolean;
        };
        Update: {
          brand_name?: string | null;
          brand_voice?: string | null;
          context_detection?: boolean;
          created_at?: string;
          domain_expertise?: string;
          emotive_intent?: string;
          formality?: string;
          id?: string;
          idioms?: boolean;
          inclusive_language?: boolean;
          length_control?: string;
          organization_id?: string;
          project_id?: string;
          quality_checks?: boolean;
          terminology?: string | null;
          tone_of_voice?: string;
          translation_memory?: boolean;
        };
        Relationships: [
          {
            foreignKeyName: "project_settings_organization_id_organizations_id_fk";
            columns: ["organization_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "project_settings_project_id_projects_id_fk";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
        ];
      };
      projects: {
        Row: {
          created_at: string;
          description: string | null;
          id: string;
          name: string;
          organization_id: string;
          slug: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          description?: string | null;
          id: string;
          name: string;
          organization_id: string;
          slug: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          description?: string | null;
          id?: string;
          name?: string;
          organization_id?: string;
          slug?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "projects_organization_id_organizations_id_fk";
            columns: ["organization_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
        ];
      };
      translations: {
        Row: {
          branch: string | null;
          commit: string | null;
          commit_link: string | null;
          commit_message: string | null;
          context: string | null;
          created_at: string;
          id: string;
          organization_id: string;
          project_id: string;
          source_file: string;
          source_format: string;
          source_language: string;
          source_provider: string | null;
          source_text: string;
          source_type: string;
          target_language: string;
          translated_text: string;
          translation_key: string;
          updated_at: string;
          user_id: string | null;
        };
        Insert: {
          branch?: string | null;
          commit?: string | null;
          commit_link?: string | null;
          commit_message?: string | null;
          context?: string | null;
          created_at?: string;
          id?: string;
          organization_id: string;
          project_id: string;
          source_file: string;
          source_format: string;
          source_language: string;
          source_provider?: string | null;
          source_text: string;
          source_type?: string;
          target_language: string;
          translated_text: string;
          translation_key: string;
          updated_at?: string;
          user_id?: string | null;
        };
        Update: {
          branch?: string | null;
          commit?: string | null;
          commit_link?: string | null;
          commit_message?: string | null;
          context?: string | null;
          created_at?: string;
          id?: string;
          organization_id?: string;
          project_id?: string;
          source_file?: string;
          source_format?: string;
          source_language?: string;
          source_provider?: string | null;
          source_text?: string;
          source_type?: string;
          target_language?: string;
          translated_text?: string;
          translation_key?: string;
          updated_at?: string;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "translations_organization_id_organizations_id_fk";
            columns: ["organization_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "translations_project_id_projects_id_fk";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "translations_user_id_users_id_fk";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      users: {
        Row: {
          api_key: string;
          created_at: string;
          email: string;
          id: string;
          image: string | null;
          name: string;
          updated_at: string;
        };
        Insert: {
          api_key: string;
          created_at?: string;
          email: string;
          id?: string;
          image?: string | null;
          name: string;
          updated_at?: string;
        };
        Update: {
          api_key?: string;
          created_at?: string;
          email?: string;
          id?: string;
          image?: string | null;
          name?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      get_project_analytics: {
        Args: {
          p_project_slug: string;
          p_organization_id: string;
          p_period?: string;
          p_start_date?: string;
          p_end_date?: string;
        };
        Returns: {
          period: string;
          key_count: number;
          document_count: number;
          total_keys: number;
          total_documents: number;
          total_languages: number;
        }[];
      };
      nanoid: {
        Args: {
          size?: number;
          alphabet?: string;
          additionalbytesfactor?: number;
        };
        Returns: string;
      };
      nanoid_optimized: {
        Args: {
          size: number;
          alphabet: string;
          mask: number;
          step: number;
        };
        Returns: string;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type PublicSchema = Database[Extract<keyof Database, "public">];

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;
