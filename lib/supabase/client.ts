
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  console.log('Supabase Client Init:', {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL,
    keyLength: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.length
  })
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
