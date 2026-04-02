import { createBrowserClient as _createBrowserClient } from '@supabase/ssr';
import { createServerClient as _createServerClient } from '@supabase/ssr';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/**
 * Browser-side Supabase client — AUTH ONLY.
 * Call once and reuse; the SSR package handles singleton caching.
 */
export function createBrowserClient() {
  return _createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

/**
 * Server-side Supabase client — AUTH ONLY.
 * Pass the cookie store from `next/headers` (Next.js 15 async cookies).
 *
 * Usage in a Server Component or Route Handler:
 *   const cookieStore = await cookies();
 *   const supabase = createServerClient(cookieStore);
 */
export function createServerClient(
  cookieStore: {
    getAll: () => { name: string; value: string }[];
    set: (name: string, value: string, options?: Record<string, unknown>) => void;
  },
) {
  return _createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // setAll can throw in Server Components (read-only context).
          // This is safe to ignore — the middleware handles refresh.
        }
      },
    },
  });
}
