import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/+esm";
import { CONFIG, isConfigured } from "./config.js";

export const supabase = isConfigured()
  ? createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_PUBLISHABLE_KEY, {
      auth: { persistSession: true, autoRefreshToken: true, storageKey: "cyber-detective-auth" },
    })
  : null;

// Calls the submit-quiz Edge Function. Throws Error with .code (e.g. "too_fast", "rate_limited").
export async function callFn(body) {
  const { data, error } = await supabase.functions.invoke(CONFIG.FUNCTION_NAME, { body });
  if (error) {
    let code = "server_error";
    try { const j = await error.context.json(); code = j.error || code; } catch {}
    const err = new Error(code); err.code = code; throw err;
  }
  return data;
}
