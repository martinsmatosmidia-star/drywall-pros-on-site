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
      calc_settings: {
        Row: {
          created_at: string
          espacamento: number
          fita_tipo: string
          margem_pct: number
          massa_m2_balde: number
          mo_contraparede: number
          mo_forro: number
          mo_parede: number
          parafusos_por_placa: number
          perda_pct: number
          perfil_mm: number
          placa_preco_perf_ru: number
          placa_preco_perf_st: number
          placa_preco_rf: number
          placa_preco_ru: number
          placa_preco_st: number
          placa_tipo: string
          preco_arame: number
          preco_bucha: number
          preco_f530: number
          preco_fita: number
          preco_guia: number
          preco_guia_48: number
          preco_guia_70: number
          preco_guia_90: number
          preco_massa: number
          preco_montante: number
          preco_montante_48: number
          preco_montante_70: number
          preco_montante_90: number
          preco_parafuso: number
          preco_regulador: number
          preco_tabica: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          espacamento?: number
          fita_tipo?: string
          margem_pct?: number
          massa_m2_balde?: number
          mo_contraparede?: number
          mo_forro?: number
          mo_parede?: number
          parafusos_por_placa?: number
          perda_pct?: number
          perfil_mm?: number
          placa_preco_perf_ru?: number
          placa_preco_perf_st?: number
          placa_preco_rf?: number
          placa_preco_ru?: number
          placa_preco_st?: number
          placa_tipo?: string
          preco_arame?: number
          preco_bucha?: number
          preco_f530?: number
          preco_fita?: number
          preco_guia?: number
          preco_guia_48?: number
          preco_guia_70?: number
          preco_guia_90?: number
          preco_massa?: number
          preco_montante?: number
          preco_montante_48?: number
          preco_montante_70?: number
          preco_montante_90?: number
          preco_parafuso?: number
          preco_regulador?: number
          preco_tabica?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          espacamento?: number
          fita_tipo?: string
          margem_pct?: number
          massa_m2_balde?: number
          mo_contraparede?: number
          mo_forro?: number
          mo_parede?: number
          parafusos_por_placa?: number
          perda_pct?: number
          perfil_mm?: number
          placa_preco_perf_ru?: number
          placa_preco_perf_st?: number
          placa_preco_rf?: number
          placa_preco_ru?: number
          placa_preco_st?: number
          placa_tipo?: string
          preco_arame?: number
          preco_bucha?: number
          preco_f530?: number
          preco_fita?: number
          preco_guia?: number
          preco_guia_48?: number
          preco_guia_70?: number
          preco_guia_90?: number
          preco_massa?: number
          preco_montante?: number
          preco_montante_48?: number
          preco_montante_70?: number
          preco_montante_90?: number
          preco_parafuso?: number
          preco_regulador?: number
          preco_tabica?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      company_settings: {
        Row: {
          created_at: string
          email: string
          logo_url: string | null
          name: string
          notes: string
          phone: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email?: string
          logo_url?: string | null
          name?: string
          notes?: string
          phone?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string
          logo_url?: string | null
          name?: string
          notes?: string
          phone?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string
          id: string
          name?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      quotes: {
        Row: {
          cliente: string
          created_at: string
          id: string
          items_snapshot: Json
          obra: string
          settings_snapshot: Json
          total: number
          updated_at: string
          user_id: string
        }
        Insert: {
          cliente?: string
          created_at?: string
          id?: string
          items_snapshot?: Json
          obra?: string
          settings_snapshot?: Json
          total?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          cliente?: string
          created_at?: string
          id?: string
          items_snapshot?: Json
          obra?: string
          settings_snapshot?: Json
          total?: number
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
