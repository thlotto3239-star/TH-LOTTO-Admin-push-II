import { createClient } from "@supabase/supabase-js";

const FALLBACK_URL = "https://ygopnjbvccenryejqmlw.supabase.co";
const FALLBACK_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlnb3BuamJ2Y2NlbnJ5ZWpxbWx3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY1NTc2NjQsImV4cCI6MjA5MjEzMzY2NH0.aOA0zbkUtS85hb0Bz5aZO8koi2gVHmDGE7Vttv0VDME";

const isAscii = (str: string) => {
  if (!str || str.length < 50) return false;
  for (let i = 0; i < str.length; i++) {
    if (str.charCodeAt(i) > 127) return false;
  }
  return true;
};

const rawUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || "").trim();
const rawAnon = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "").trim();
const rawService = (process.env.SUPABASE_SERVICE_ROLE_KEY || "").trim();

const supabaseUrl = rawUrl.startsWith("http") ? rawUrl : FALLBACK_URL;
const supabaseAnonKey = isAscii(rawAnon) ? rawAnon : FALLBACK_ANON_KEY;
const supabaseServiceRoleKey = isAscii(rawService) ? rawService : "";

// Public / Browser Client (Subject to RLS)
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

// Admin / Server Client (Bypasses RLS for secure backend API routes)
export const supabaseAdmin = supabaseServiceRoleKey
  ? createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    })
  : supabase;
