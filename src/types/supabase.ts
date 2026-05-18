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
      apartments: {
        Row: {
          address: string | null
          base_price: number
          created_at: string
          description: string | null
          id: string
          images: string[] | null
          is_active: boolean
          max_guests: number
          name: string
        }
        Insert: {
          address?: string | null
          base_price: number
          created_at?: string
          description?: string | null
          id?: string
          images?: string[] | null
          is_active?: boolean
          max_guests?: number
          name: string
        }
        Update: {
          address?: string | null
          base_price?: number
          created_at?: string
          description?: string | null
          id?: string
          images?: string[] | null
          is_active?: boolean
          max_guests?: number
          name?: string
        }
        Relationships: []
      }
      bookings: {
        Row: {
          apartment_id: string
          check_in: string
          check_out: string
          created_at: string
          created_by: string | null
          guest_id_card: string | null
          guest_name: string
          guest_phone: string | null
          id: string
          id_card_url: string | null
          nights: number
          notes: string | null
          price_per_night: number
          status: string
          total_price: number
          updated_at: string
        }
        Insert: {
          apartment_id: string
          check_in: string
          check_out: string
          created_at?: string
          created_by?: string | null
          guest_id_card?: string | null
          guest_name: string
          guest_phone?: string | null
          id?: string
          id_card_url?: string | null
          nights: number
          notes?: string | null
          price_per_night: number
          status?: string
          total_price: number
          updated_at?: string
        }
        Update: {
          apartment_id?: string
          check_in?: string
          check_out?: string
          created_at?: string
          created_by?: string | null
          guest_id_card?: string | null
          guest_name?: string
          guest_phone?: string | null
          id?: string
          id_card_url?: string | null
          nights?: number
          notes?: string | null
          price_per_night?: number
          status?: string
          total_price?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_apartment_id_fkey"
            columns: ["apartment_id"]
            referencedRelation: "apartments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_created_by_fkey"
            columns: ["created_by"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      booking_days: {
        Row: {
          apartment_id: string
          booking_id: string
          day: string
          id: string
          status: string
        }
        Insert: {
          apartment_id: string
          booking_id: string
          day: string
          id?: string
          status: string
        }
        Update: {
          apartment_id?: string
          booking_id?: string
          day?: string
          id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "booking_days_apartment_id_fkey"
            columns: ["apartment_id"]
            referencedRelation: "apartments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "booking_days_booking_id_fkey"
            columns: ["booking_id"]
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          }
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          full_name: string | null
          id: string
          is_active: boolean
          phone: string | null
          role: string
        }
        Insert: {
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          is_active?: boolean
          phone?: string | null
          role?: string
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          is_active?: boolean
          phone?: string | null
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
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
