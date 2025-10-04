import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "a";
const SUPABASE_ANON_KEY = "a";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
