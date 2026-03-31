import { createClient } from '@supabase/supabase-js'
import { env } from '@shared/config/env'
import type { Database } from './types'

// El genérico <Database> es lo que da el tipado completo:
// supabase.from('profiles').select('*') devuelve el tipo correcto de la tabla
export const supabase = createClient<Database>(env.supabase.url, env.supabase.anonKey, {
  auth: {
    // Persiste la sesión en localStorage automáticamente
    persistSession: true,
    // Refresca el token antes de que expire — transparente para el usuario
    autoRefreshToken: true,
    // Detecta el token en la URL al volver de OAuth o email confirmation
    detectSessionInUrl: true,
  },
})
