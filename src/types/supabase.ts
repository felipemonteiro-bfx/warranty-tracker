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
      warranties: {
        Row: {
          id: string
          user_id: string
          name: string
          category: string | null
          purchase_date: string
          warranty_months: number
          invoice_url: string | null
          created_at: string
          store: string | null
          price: number | null
          notes: string | null
          total_saved: number | null
          serial_number: string | null
          estimated_sale_value: number | null
          folder: string | null
          maintenance_frequency_months: number | null
          last_maintenance_date: string | null
          card_brand: string | null
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          category?: string | null
          purchase_date: string
          warranty_months: number
          invoice_url?: string | null
          created_at?: string
          store?: string | null
          price?: number | null
          notes?: string | null
          total_saved?: number | null
          serial_number?: string | null
          estimated_sale_value?: number | null
          folder?: string | null
          maintenance_frequency_months?: number | null
          last_maintenance_date?: string | null
          card_brand?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          category?: string | null
          purchase_date?: string
          warranty_months?: number
          invoice_url?: string | null
          created_at?: string
          store?: string | null
          price?: number | null
          notes?: string | null
          total_saved?: number | null
          serial_number?: string | null
          estimated_sale_value?: number | null
          folder?: string | null
          maintenance_frequency_months?: number | null
          last_maintenance_date?: string | null
          card_brand?: string | null
        }
      }
    }
  }
}

export type Warranty = Database['public']['Tables']['warranties']['Row']
