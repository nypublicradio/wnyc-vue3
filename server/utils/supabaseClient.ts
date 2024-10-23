import { createClient } from "@supabase/supabase-js";

// Create a new Supabase client
export function supabaseClient() {
    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
    return supabase;
}