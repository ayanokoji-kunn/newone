import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://ifawfohuumjjnmptzqzw.supabase.co" ;
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlmYXdmb2h1dW1qam5tcHR6cXp3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY3MTI2MjMsImV4cCI6MjA4MjI4ODYyM30.4pjWk74n2jKeLCZzI5Y85cgSSBrDXAFqS-9BL1XghwU";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);