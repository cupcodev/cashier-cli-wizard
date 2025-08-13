export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      audit_logs: {
        Row: {
          action: string
          actor: string
          created_at: string
          details: Json | null
          id: string
        }
        Insert: {
          action: string
          actor: string
          created_at?: string
          details?: Json | null
          id?: string
        }
        Update: {
          action?: string
          actor?: string
          created_at?: string
          details?: Json | null
          id?: string
        }
        Relationships: []
      }
      customer_addresses: {
        Row: {
          bairro: string
          cep: string
          cidade: string
          codigo_ibge_municipio: number | null
          complemento: string | null
          created_at: string
          customerId: string
          id: string
          logradouro: string
          numero: string
          pais: string
          tipo: Database["public"]["Enums"]["address_type_enum"]
          uf: string
          updated_at: string
        }
        Insert: {
          bairro: string
          cep: string
          cidade: string
          codigo_ibge_municipio?: number | null
          complemento?: string | null
          created_at?: string
          customerId: string
          id?: string
          logradouro: string
          numero: string
          pais?: string
          tipo: Database["public"]["Enums"]["address_type_enum"]
          uf: string
          updated_at?: string
        }
        Update: {
          bairro?: string
          cep?: string
          cidade?: string
          codigo_ibge_municipio?: number | null
          complemento?: string | null
          created_at?: string
          customerId?: string
          id?: string
          logradouro?: string
          numero?: string
          pais?: string
          tipo?: Database["public"]["Enums"]["address_type_enum"]
          uf?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "customer_addresses_customerId_fkey"
            columns: ["customerId"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_contacts: {
        Row: {
          aceite_comercial_data: string | null
          aceite_comercial_ip: string | null
          canal_preferido: string | null
          cargo: string | null
          created_at: string
          customerId: string
          email: string | null
          id: string
          nome: string
          responsavel_financeiro: boolean | null
          responsavel_tecnico: boolean | null
          telefone: string | null
          updated_at: string
          whatsapp: string | null
        }
        Insert: {
          aceite_comercial_data?: string | null
          aceite_comercial_ip?: string | null
          canal_preferido?: string | null
          cargo?: string | null
          created_at?: string
          customerId: string
          email?: string | null
          id?: string
          nome: string
          responsavel_financeiro?: boolean | null
          responsavel_tecnico?: boolean | null
          telefone?: string | null
          updated_at?: string
          whatsapp?: string | null
        }
        Update: {
          aceite_comercial_data?: string | null
          aceite_comercial_ip?: string | null
          canal_preferido?: string | null
          cargo?: string | null
          created_at?: string
          customerId?: string
          email?: string | null
          id?: string
          nome?: string
          responsavel_financeiro?: boolean | null
          responsavel_tecnico?: boolean | null
          telefone?: string | null
          updated_at?: string
          whatsapp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customer_contacts_customerId_fkey"
            columns: ["customerId"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      customers: {
        Row: {
          address: Json | null
          atualizado_por: string | null
          cnae_principal_cliente: string | null
          cnpj: string | null
          cpf: string | null
          created_at: string
          criado_por: string | null
          email: string | null
          id: string
          inscricao_estadual: string | null
          inscricao_municipal: string | null
          legal_name: string | null
          phone: string | null
          pii_expire_at: string | null
          porte_empresa: string | null
          setor_atividade: string | null
          status_cliente: string | null
          tags: string[] | null
          tax_id: string | null
          tipo_pessoa: Database["public"]["Enums"]["person_type_enum"] | null
          trade_name: string | null
          updated_at: string
          whatsapp: string | null
        }
        Insert: {
          address?: Json | null
          atualizado_por?: string | null
          cnae_principal_cliente?: string | null
          cnpj?: string | null
          cpf?: string | null
          created_at?: string
          criado_por?: string | null
          email?: string | null
          id?: string
          inscricao_estadual?: string | null
          inscricao_municipal?: string | null
          legal_name?: string | null
          phone?: string | null
          pii_expire_at?: string | null
          porte_empresa?: string | null
          setor_atividade?: string | null
          status_cliente?: string | null
          tags?: string[] | null
          tax_id?: string | null
          tipo_pessoa?: Database["public"]["Enums"]["person_type_enum"] | null
          trade_name?: string | null
          updated_at?: string
          whatsapp?: string | null
        }
        Update: {
          address?: Json | null
          atualizado_por?: string | null
          cnae_principal_cliente?: string | null
          cnpj?: string | null
          cpf?: string | null
          created_at?: string
          criado_por?: string | null
          email?: string | null
          id?: string
          inscricao_estadual?: string | null
          inscricao_municipal?: string | null
          legal_name?: string | null
          phone?: string | null
          pii_expire_at?: string | null
          porte_empresa?: string | null
          setor_atividade?: string | null
          status_cliente?: string | null
          tags?: string[] | null
          tax_id?: string | null
          tipo_pessoa?: Database["public"]["Enums"]["person_type_enum"] | null
          trade_name?: string | null
          updated_at?: string
          whatsapp?: string | null
        }
        Relationships: []
      }
      invoice_items: {
        Row: {
          amount_cents: number
          description: string
          id: string
          invoice_id: string
        }
        Insert: {
          amount_cents: number
          description: string
          id?: string
          invoice_id: string
        }
        Update: {
          amount_cents?: number
          description?: string
          id?: string
          invoice_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoice_items_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          amount_cents: number
          created_at: string
          customer_id: string
          due_date: string
          id: string
          settlement_attachment_file_id: string | null
          settlement_reason: string | null
          status: string
          terms: Json | null
          updated_at: string
        }
        Insert: {
          amount_cents: number
          created_at?: string
          customer_id: string
          due_date: string
          id?: string
          settlement_attachment_file_id?: string | null
          settlement_reason?: string | null
          status?: string
          terms?: Json | null
          updated_at?: string
        }
        Update: {
          amount_cents?: number
          created_at?: string
          customer_id?: string
          due_date?: string
          id?: string
          settlement_attachment_file_id?: string | null
          settlement_reason?: string | null
          status?: string
          terms?: Json | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoices_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      migrations: {
        Row: {
          id: number
          name: string
          timestamp: number
        }
        Insert: {
          id?: number
          name: string
          timestamp: number
        }
        Update: {
          id?: number
          name?: string
          timestamp?: number
        }
        Relationships: []
      }
      packages: {
        Row: {
          active: boolean
          base_price_cents: number
          category: string
          config: Json | null
          created_at: string
          id: string
          periodicity: string
          promo_price_cents: number
          tier: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          base_price_cents?: number
          category: string
          config?: Json | null
          created_at?: string
          id?: string
          periodicity?: string
          promo_price_cents?: number
          tier: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          base_price_cents?: number
          category?: string
          config?: Json | null
          created_at?: string
          id?: string
          periodicity?: string
          promo_price_cents?: number
          tier?: string
          updated_at?: string
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount_cents: number
          created_at: string
          id: string
          invoice_id: string
          method: string
          provider: string | null
          provider_id: string | null
          provider_meta: Json | null
          updated_at: string
        }
        Insert: {
          amount_cents: number
          created_at?: string
          id?: string
          invoice_id: string
          method: string
          provider?: string | null
          provider_id?: string | null
          provider_meta?: Json | null
          updated_at?: string
        }
        Update: {
          amount_cents?: number
          created_at?: string
          id?: string
          invoice_id?: string
          method?: string
          provider?: string | null
          provider_id?: string | null
          provider_meta?: Json | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          charge_day: number
          created_at: string
          customer_id: string
          early_discount_enabled: boolean
          early_discount_until: string | null
          early_discount_value_cents: number | null
          id: string
          interest_value_or_pct_bp: number
          late_fee_value_or_pct_bp: number
          next_due_date: string | null
          package_id: string
          status: string
          updated_at: string
          use_percentage_interest: boolean
          use_percentage_late_fee: boolean
        }
        Insert: {
          charge_day?: number
          created_at?: string
          customer_id: string
          early_discount_enabled?: boolean
          early_discount_until?: string | null
          early_discount_value_cents?: number | null
          id?: string
          interest_value_or_pct_bp?: number
          late_fee_value_or_pct_bp?: number
          next_due_date?: string | null
          package_id: string
          status?: string
          updated_at?: string
          use_percentage_interest?: boolean
          use_percentage_late_fee?: boolean
        }
        Update: {
          charge_day?: number
          created_at?: string
          customer_id?: string
          early_discount_enabled?: boolean
          early_discount_until?: string | null
          early_discount_value_cents?: number | null
          id?: string
          interest_value_or_pct_bp?: number
          late_fee_value_or_pct_bp?: number
          next_due_date?: string | null
          package_id?: string
          status?: string
          updated_at?: string
          use_percentage_interest?: boolean
          use_percentage_late_fee?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscriptions_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "packages"
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
      address_type_enum: "cobranca" | "operacional"
      person_type_enum: "PJ" | "PF"
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
      address_type_enum: ["cobranca", "operacional"],
      person_type_enum: ["PJ", "PF"],
    },
  },
} as const
