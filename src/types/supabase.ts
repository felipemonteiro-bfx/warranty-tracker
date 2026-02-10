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
        }
      }
    }
  }
}

export type Warranty = Database['public']['Tables']['warranties']['Row']
