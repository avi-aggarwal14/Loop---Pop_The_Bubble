import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { upsertFounder } from "../db/index";
import { createServiceClient } from "./server";

function hasSupabaseEnv(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

export function founderQueryFallbackAllowed(): boolean {
  return process.env.ALLOW_QUERY_FOUNDER_ID === "true" || process.env.NODE_ENV !== "production";
}

export async function getAuthenticatedFounderId(): Promise<string | null> {
  if (!hasSupabaseEnv()) return null;

  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
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
            // Route handlers that only read auth can ignore cookie refresh writes.
          }
        },
      },
    },
  );

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) return null;

  await upsertFounder(createServiceClient(), {
    id: user.id,
    email: user.email ?? null,
  });

  return user.id;
}

export async function resolveFounderIdForOAuth(url: URL): Promise<string | null> {
  const authenticatedFounderId = await getAuthenticatedFounderId();
  if (authenticatedFounderId) return authenticatedFounderId;

  if (!founderQueryFallbackAllowed()) return null;
  return url.searchParams.get("founder_id");
}
