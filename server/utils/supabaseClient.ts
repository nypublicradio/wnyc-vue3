import { createClient } from "@supabase/supabase-js";

// Create a new Supabase client
export function supabaseClient() {
    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
    return supabase;
}