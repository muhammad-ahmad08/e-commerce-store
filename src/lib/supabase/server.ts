import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

function getSupabaseCredentials() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabasePublishableKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

  if (!supabaseUrl || !supabasePublishableKey) {
    throw new Error('Supabase URL and publishable key must be configured.')
  }

  return { supabaseUrl, supabasePublishableKey }
}

export function createPublicClient() {
  const { supabaseUrl, supabasePublishableKey } = getSupabaseCredentials()

  return createServerClient(supabaseUrl, supabasePublishableKey, {
    cookies: {
      getAll() {
        return []
      },
      setAll() {
        // Public, cacheable reads do not access or mutate user sessions.
      },
    },
  })
}

export async function createClient() {
  const { supabaseUrl, supabasePublishableKey } = getSupabaseCredentials()

  const cookieStore = await cookies()

  return createServerClient(supabaseUrl, supabasePublishableKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          )
        } catch {
          // Server Components cannot write cookies; proxy.ts handles refreshes.
        }
      },
    },
  })
}
