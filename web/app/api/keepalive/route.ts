import { connection } from "next/server";
import { supabase } from "@/lib/supabase";

// Dipanggil Vercel Cron sekali sehari (vercel.json) supaya Supabase gratis tidak dijeda karena 7 hari tanpa aktivitas.
export async function GET() {
  await connection();
  const { count, error } = await supabase.from("airlines").select("*", { count: "exact", head: true });
  if (error) return Response.json({ ok: false, error: error.message }, { status: 503 });
  return Response.json({ ok: true, airlines: count });
}
