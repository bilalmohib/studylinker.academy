/**
 * Supabase Database Client
 * Singleton pattern for database connections
 */

import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";

// Server-side Supabase client (uses service role key for admin operations)
let supabaseAdmin: ReturnType<typeof createClient<Database>> | null = null;

// Client-side Supabase client (uses anon key)
let supabaseClient: ReturnType<typeof createClient<Database>> | null = null;

/**
 * Get Supabase admin client (server-side only)
 * Uses service role key for admin operations
 */
export function getSupabaseAdmin() {
  if (supabaseAdmin) {
    return supabaseAdmin;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error(
      "Missing Supabase environment variables. Please check your .env.local file."
    );
  }

  supabaseAdmin = createClient<Database>(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  return supabaseAdmin;
}

/**
 * Get Supabase client (for client-side operations)
 * Uses anon key for public operations
 */
export function getSupabaseClient() {
  if (supabaseClient) {
    return supabaseClient;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Missing Supabase environment variables. Please check your .env.local file."
    );
  }

  supabaseClient = createClient<Database>(supabaseUrl, supabaseAnonKey, {
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
  });

  return supabaseClient;
}

/**
 * Get database connection for raw SQL queries (if needed)
 * Note: Prefer using Supabase client methods when possible
 * For raw SQL, use Supabase RPC functions or direct SQL queries via Supabase client
 */
export function getSupabaseForRawSQL() {
  return getSupabaseAdmin();
}

