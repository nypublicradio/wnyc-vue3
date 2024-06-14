import { createClient } from "@supabase/supabase-js";

export function supabaseClient() {
    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
    return supabase;
}