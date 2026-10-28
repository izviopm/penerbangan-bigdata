import { createClient } from "@supabase/supabase-js";

// Hanya baca: schema penerbangan di-RLS "public read", tanpa izin tulis untuk anon (key publishable aman dibuka).
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  { db: { schema: "penerbangan" }, auth: { persistSession: false } },
);
