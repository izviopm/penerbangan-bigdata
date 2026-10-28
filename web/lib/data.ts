import { cacheLife } from "next/cache";
import { supabase } from "@/lib/supabase";

// Data agregat hanya berubah saat notebook 04 dijalankan ulang → cache per hari cukup.
export async function getTotals() {
  "use cache";
  cacheLife("days");
  const { data, error } = await supabase.from("monthly_airline_stats").select("flights, class_5");
  if (error) throw new Error(`Supabase: ${error.message}`);
  return {
    flights: data.reduce((s, r) => s + r.flights, 0),
    class5: data.reduce((s, r) => s + r.class_5, 0),
  };
}
