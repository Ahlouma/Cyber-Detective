import { supabase } from "./supabase.js";
import { CONFIG } from "./config.js";

export async function ensureSession() {
  const { data } = await supabase.auth.getSession();
  if (data.session) return data.session.user;
  const { data: d, error } = await supabase.auth.signInAnonymously();
  if (error) throw error;
  return d.user;
}

export async function getProfile() {
  const { data: s } = await supabase.auth.getSession();
  if (!s.session) return null;
  const { data, error } = await supabase.from("profiles").select("id, nickname").eq("id", s.session.user.id).maybeSingle();
  if (error) throw error;
  return data;
}

// Returns the profile or redirects to the nickname page.
export async function requireProfile(base = "") {
  let p = null;
  try { p = await getProfile(); } catch { /* treated as not registered */ }
  if (!p) { location.replace(base + "nickname.html"); return null; }
  return p;
}

// Validation result: null if OK, else an i18n key.
export function validateNickname(raw) {
  const n = raw.trim();
  if (n.length < CONFIG.NICK_MIN) return "nickShort";
  if (n.length > CONFIG.NICK_MAX) return "nickLong";
  if (/[\u0000-\u001f<>]/.test(n)) return "nickInvalid";
  return null;
}

// Returns null on success or an i18n key on a handled failure.
export async function registerNickname(raw) {
  const bad = validateNickname(raw); if (bad) return bad;
  try {
    await ensureSession();
    const { error } = await supabase.rpc("register_nickname", { p_nickname: raw.trim() });
    if (!error) return null;
    const m = error.message || "";
    if (m.includes("nickname_taken")) return "nickTaken";
    if (m.includes("already_registered")) return "nickAlready";
    if (m.includes("invalid_nickname")) return "nickInvalid";
    return "nickNet";
  } catch { return "nickNet"; }
}
