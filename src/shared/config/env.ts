import { z } from 'zod'

const envSchema = z.object({
  VITE_SUPABASE_URL: z.string().min(1, 'VITE_SUPABASE_URL is required'),
  VITE_SUPABASE_ANON_KEY: z.string().min(1, 'VITE_SUPABASE_ANON_KEY is required'),
})

const parsed = envSchema.parse(import.meta.env)

export const env = {
  supabase: {
    url: parsed.VITE_SUPABASE_URL,
    anonKey: parsed.VITE_SUPABASE_ANON_KEY,
  },
} as const
