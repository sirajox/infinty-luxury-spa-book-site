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
      services: {
        Row: {
          id: string
          name: string
          description: string | null
          duration_minutes: number
          price: number
          is_active: boolean
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['services']['Row'], 'id' | 'created_at'> & { id?: string, created_at?: string }
        Update: Partial<Database['public']['Tables']['services']['Insert']>
      }
      appointments: {
        Row: {
          id: string
          full_name: string
          email: string
          phone: string
          service_id: string
          appointment_date: string
          start_time: string
          end_time: string
          status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
          notes: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['appointments']['Row'], 'id' | 'created_at'> & { id?: string, created_at?: string }
        Update: Partial<Database['public']['Tables']['appointments']['Insert']>
      }
      business_hours: {
        Row: {
          id: string
          weekday: number // 0 = Sunday, 1 = Monday, etc.
          is_open: boolean
          start_time: string // 'HH:mm:ss'
          end_time: string // 'HH:mm:ss'
        }
        Insert: Omit<Database['public']['Tables']['business_hours']['Row'], 'id'> & { id?: string }
        Update: Partial<Database['public']['Tables']['business_hours']['Insert']>
      }
      blocked_dates: {
        Row: {
          id: string
          blocked_date: string // 'YYYY-MM-DD'
          reason: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['blocked_dates']['Row'], 'id' | 'created_at'> & { id?: string, created_at?: string }
        Update: Partial<Database['public']['Tables']['blocked_dates']['Insert']>
      }
      spa_settings: {
        Row: {
          id: string
          spa_name: string
          spa_email: string
          spa_phone: string
          spa_address: string
          slot_interval_minutes: number
          booking_notice_hours: number
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['spa_settings']['Row'], 'id' | 'created_at'> & { id?: string, created_at?: string }
        Update: Partial<Database['public']['Tables']['spa_settings']['Insert']>
      }
      admin_users: {
        Row: {
          id: string
          user_id: string
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['admin_users']['Row'], 'id' | 'created_at'> & { id?: string, created_at?: string }
        Update: Partial<Database['public']['Tables']['admin_users']['Insert']>
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
