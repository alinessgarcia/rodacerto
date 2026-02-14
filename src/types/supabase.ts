// src/types/supabase.ts (Mock temporário até ter o banco)
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
      user_simulations: {
        Row: {
          id: string
          vehicle_name: string | null
          current_value: number
          is_rented: boolean
          rental_cost_weekly: number
          avg_km_day: number
          days_worked_week: number
          hours_worked_day: number
          empty_km_percentage: number
          gross_earnings_day: number
          insurance_cost_year: number
          ipva_cost_year: number
          licensing_cost_year: number
          created_at: string
        }
        Insert: {
          // ... (simplificado para agilidade)
        }
        Update: {
          // ...
        }
      }
    }
  }
}
