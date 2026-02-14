// src/lib/supabase.ts
import { createBrowserClient } from '@supabase/ssr'
import { Database } from '../types/supabase' // Vamos gerar isso depois

export const createClient = () => {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
