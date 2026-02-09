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
      ai_configurations: {
        Row: {
          id: string
          project_id: string
          provider: string
          model: string
          system_prompt: string
          temperature: number
          max_tokens: number
          timeout_ms: number
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          project_id: string
          provider: string
          model: string
          system_prompt: string
          temperature: number
          max_tokens: number
          timeout_ms: number
          is_active: boolean
          created_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          provider?: string
          model?: string
          system_prompt?: string
          temperature?: number
          max_tokens?: number
          timeout_ms?: number
          is_active?: boolean
          created_at?: string
        }
      }
      contacts: {
        Row: {
          id: string
          wa_id: string
          name: string | null
          created_at: string
        }
        Insert: {
          id?: string
          wa_id: string
          name?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          wa_id?: string
          name?: string | null
          created_at?: string
        }
      }
      integrations: {
        Row: {
          id: string
          project_id: string
          type: string
          is_active: boolean
          config: Json
          created_at: string
        }
        Insert: {
          id?: string
          project_id: string
          type: string
          is_active: boolean
          config: Json
          created_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          type?: string
          is_active?: boolean
          config?: Json
          created_at?: string
        }
      }
      media_files: {
        Row: {
          id: string
          media_id: string
          mime_type: string | null
          file_size: number | null
          storage_path: string | null
          public_url: string | null
          project_id: string
          whatsapp_number_id: string
          workflow_id: string
          contact_id: string
          message_id: string
          metadata: Json
          created_at: string
          contact?: {
            wa_id: string
          }
        }
        Insert: {
          id?: string
          media_id: string
          mime_type?: string | null
          file_size?: number | null
          storage_path?: string | null
          public_url?: string | null
          project_id: string
          whatsapp_number_id: string
          workflow_id: string
          contact_id: string
          message_id: string
          metadata?: Json
          created_at?: string
        }
        Update: {
          id?: string
          media_id?: string
          mime_type?: string | null
          file_size?: number | null
          storage_path?: string | null
          public_url?: string | null
          project_id?: string
          whatsapp_number_id?: string
          workflow_id?: string
          contact_id?: string
          message_id?: string
          metadata?: Json
          created_at?: string
        }
      }
      message_jobs: {
        Row: {
          id: string
          type: string
          status: string
          payload: Json
          error: string | null
          created_at: string
        }
        Insert: {
          id?: string
          type: string
          status: string
          payload: Json
          error?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          type?: string
          status?: string
          payload?: Json
          error?: string | null
          created_at?: string
        }
      }
      message_statuses: {
        Row: {
          id: string
          whatsapp_message_id: string
          status: string
          timestamp: number | null
          recipient_id: string
          conversation_id: string
          pricing: Json
          metadata: Json
          created_at: string
        }
        Insert: {
          id?: string
          whatsapp_message_id: string
          status: string
          timestamp?: number | null
          recipient_id: string
          conversation_id: string
          pricing?: Json
          metadata?: Json
          created_at?: string
        }
        Update: {
          id?: string
          whatsapp_message_id?: string
          status?: string
          timestamp?: number | null
          recipient_id?: string
          conversation_id?: string
          pricing?: Json
          metadata?: Json
          created_at?: string
        }
      }
      message_templates: {
        Row: {
          id: string
          template_id: string
          name: string
          category: string
          language: string
          status: string
          content: Json
          whatsapp_number_id: string
          updated_at: string
          created_at: string
        }
        Insert: {
          id?: string
          template_id: string
          name: string
          category: string
          language: string
          status: string
          content: Json
          whatsapp_number_id: string
          updated_at?: string
          created_at?: string
        }
        Update: {
          id?: string
          template_id?: string
          name?: string
          category?: string
          language?: string
          status?: string
          content?: Json
          whatsapp_number_id?: string
          updated_at?: string
          created_at?: string
        }
      }
      messages: {
        Row: {
          id: string
          whatsapp_message_id: string
          contact_id: string
          whatsapp_number_id: string
          project_id: string
          workflow_id: string
          type: string
          direction: string
          body: string | null
          metadata: Json
          created_at: string
        }
        Insert: {
          id?: string
          whatsapp_message_id: string
          contact_id: string
          whatsapp_number_id: string
          project_id: string
          workflow_id: string
          type: string
          direction: string
          body?: string | null
          metadata?: Json
          created_at?: string
        }
        Update: {
          id?: string
          whatsapp_message_id?: string
          contact_id?: string
          whatsapp_number_id?: string
          project_id?: string
          workflow_id?: string
          type?: string
          direction?: string
          body?: string | null
          metadata?: Json
          created_at?: string
        }
      }
      templates: {
        Row: {
          id: string
          wa_template_name: string
          wa_template_code: string
          phone_number_id: string
          status: string
          category: string
          language: string
          preview_text: string
          variables_count: number
          created_at: string
        }
        Insert: {
          id?: string
          wa_template_name: string
          wa_template_code: string
          phone_number_id: string
          status: string
          category: string
          language: string
          preview_text: string
          variables_count: number
          created_at?: string
        }
        Update: {
          id?: string
          wa_template_name?: string
          wa_template_code?: string
          phone_number_id?: string
          status?: string
          category?: string
          language?: string
          preview_text?: string
          variables_count?: number
          created_at?: string
        }
      }
      webhook_events: {
        Row: {
          id: string
          source: string
          payload: Json
          raw_body: string
          signature: string | null
          event_hash: string
          created_at: string
        }
        Insert: {
          id?: string
          source: string
          payload: Json
          raw_body: string
          signature?: string | null
          event_hash: string
          created_at?: string
        }
        Update: {
          id?: string
          source?: string
          payload?: Json
          raw_body?: string
          signature?: string | null
          event_hash?: string
          created_at?: string
        }
      }
      whatsapp_numbers: {
        Row: {
          id: string
          name: string
          phone_number: string
          phone_number_id: string
          business_account_id: string
          project_id: string
          created_at: string
          project?: {
            slug: string
          }
        }
        Insert: {
          id?: string
          name: string
          phone_number: string
          phone_number_id: string
          business_account_id: string
          project_id: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          phone_number?: string
          phone_number_id?: string
          business_account_id?: string
          project_id?: string
          created_at?: string
        }
      }
      workflows: {
        Row: {
          id: string
          project_id: string
          ai_enabled: boolean
          name: string
          trigger: string
          run_count: number
          last_run_at: string | null
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          project_id: string
          ai_enabled: boolean
          name: string
          trigger: string
          run_count?: number
          last_run_at?: string | null
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          ai_enabled?: boolean
          name?: string
          trigger?: string
          run_count?: number
          last_run_at?: string | null
          is_active?: boolean
          created_at?: string
        }
      }
      workflow_steps: {
        Row: {
          id: string
          workflow_id: string
          type: string
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          workflow_id: string
          type: string
          is_active: boolean
          created_at?: string
        }
        Update: {
          id?: string
          workflow_id?: string
          type?: string
          is_active?: boolean
          created_at?: string
        }
      }
      webhooks: {
        Row: {
          id: string
          url: string
          is_active: boolean
          events: string[]
          created_at: string
        }
        Insert: {
          id?: string
          url: string
          is_active?: boolean
          events: string[]
          created_at?: string
        }
        Update: {
          id?: string
          url?: string
          is_active?: boolean
          events?: string[]
          created_at?: string
        }
      }
      ai_settings: {
        Row: {
          id: string
          is_enabled: boolean
          provider: string
          model: string
          system_prompt: string
          temperature: number
          created_at: string
        }
        Insert: {
          id?: string
          is_enabled?: boolean
          provider: string
          model: string
          system_prompt: string
          temperature?: number
          created_at?: string
        }
        Update: {
          id?: string
          is_enabled?: boolean
          provider?: string
          model?: string
          system_prompt?: string
          temperature?: number
          created_at?: string
        }
      }
      projects: {
        Row: {
          id: string
          name: string
          slug: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          created_at?: string
        }
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
