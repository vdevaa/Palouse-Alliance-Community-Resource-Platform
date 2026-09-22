// Supabase setup (reference this file when working with Supabase)
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const getEventFlyerUrl = (flyerPath) => {
  if (!flyerPath) {
    return null;
  }

  const { data } = supabase.storage.from("event-flyers").getPublicUrl(flyerPath);
  return data?.publicUrl || null;
};
