// Frontend configuration. The publishable (anon) key is designed to be public.
// NEVER put the service_role / secret key here. See README.md for where to find these values.
export const CONFIG = {
  SUPABASE_URL: "https://rrxelypcadvgqtlxictb.supabase.co",                 // e.g. https://abcdxyz.supabase.co
  SUPABASE_PUBLISHABLE_KEY: "sb_publishable_dLfvjE-45PAPydrwHnVoJA_cp6mGPCK", // publishable / anon key only
  FUNCTION_NAME: "submit-quiz",
  NICK_MIN: 3,
  NICK_MAX: 20,
};
export const isConfigured = () =>
  /^https:\/\/.+\.supabase\.co\/?$/.test(CONFIG.SUPABASE_URL) && !CONFIG.SUPABASE_PUBLISHABLE_KEY.startsWith("YOUR_");
