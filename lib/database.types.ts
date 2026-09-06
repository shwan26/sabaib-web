export type Database = {
  public: {
    Tables: {
      bills: {
        Row: {
          id: string
          code: string | null
          owner_id: string | null
          restaurant_name: string | null
          currency: string
          subtotal: number
          service_charge_percent: number
          service_charge_amount: number
          vat_percent: number
          vat_amount: number
          discount_amount: number
          total_amount: number
          status: 'waiting' | 'splitting' | 'settling' | 'completed'
          receipt_image_url: string | null
          created_at: string
          updated_at: string
          settled_at: string | null
          delete_after: string | null
          keep_forever: boolean
          stage: 'waiting' | 'splitting' | 'payment'
          is_split_evenly: boolean
          promptpay_qr_path: string | null
        }
        Insert: {
          id?: string
          code?: string | null
          owner_id?: string | null
          restaurant_name?: string | null
          currency?: string
          subtotal?: number
          service_charge_percent?: number
          service_charge_amount?: number
          vat_percent?: number
          vat_amount?: number
          discount_amount?: number
          total_amount?: number
          status?: 'waiting' | 'splitting' | 'settling' | 'completed'
          receipt_image_url?: string | null
          created_at?: string
          updated_at?: string
          settled_at?: string | null
          delete_after?: string | null
          keep_forever?: boolean
          stage?: 'waiting' | 'splitting' | 'payment'
          is_split_evenly?: boolean
          promptpay_qr_path?: string | null
        }
        Update: {
          id?: string
          code?: string | null
          owner_id?: string | null
          restaurant_name?: string | null
          currency?: string
          subtotal?: number
          service_charge_percent?: number
          service_charge_amount?: number
          vat_percent?: number
          vat_amount?: number
          discount_amount?: number
          total_amount?: number
          status?: 'waiting' | 'splitting' | 'settling' | 'completed'
          receipt_image_url?: string | null
          created_at?: string
          updated_at?: string
          settled_at?: string | null
          delete_after?: string | null
          keep_forever?: boolean
          stage?: 'waiting' | 'splitting' | 'payment'
          is_split_evenly?: boolean
          promptpay_qr_path?: string | null
        }
      }
      participants: {
        Row: {
          id: string
          bill_id: string
          user_id: string | null
          name: string
          role: 'host' | 'member'
          joined_at: string
          is_ready: boolean
          guest_token_hash: string | null
        }
        Insert: {
          id?: string
          bill_id: string
          user_id?: string | null
          name: string
          role?: 'host' | 'member'
          joined_at?: string
          is_ready?: boolean
          guest_token_hash?: string | null
        }
        Update: {
          id?: string
          bill_id?: string
          user_id?: string | null
          name?: string
          role?: 'host' | 'member'
          joined_at?: string
          is_ready?: boolean
          guest_token_hash?: string | null
        }
      }
      receipt_items: {
        Row: {
          id: string
          bill_id: string
          original_name: string
          translated_name: string | null
          quantity: number
          unit_price: number
          total_price: number
          created_at: string
        }
        Insert: {
          id?: string
          bill_id: string
          original_name: string
          translated_name?: string | null
          quantity?: number
          unit_price?: number
          total_price?: number
          created_at?: string
        }
        Update: {
          id?: string
          bill_id?: string
          original_name?: string
          translated_name?: string | null
          quantity?: number
          unit_price?: number
          total_price?: number
          created_at?: string
        }
      }
    }
    Views: {}
    Functions: {}
    Enums: {}
  }
}
