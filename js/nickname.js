import { ensureSession, getProfile, registerNickname, validateNickname } from "./auth.js";
import { mountChrome, requireBackend } from "./ui.js";
import { t, applyI18n, onLangChange } from "./language.js";

async function init() {
  mountChrome();
  if (!requireBackend()) return;
  try { if (await getProfile()) { location.replace("mission.html"); return; } } catch {}
  const form = document.getElementById("nick-form"), input = document.getElementById("nick"), err = document.getElementById("nick-error"), btn = document.getElementById("nick-btn");
  let lastKey = null;
  const show = (key) => { lastKey = key; err.hidden = !key; err.textContent = key ? t(key) : ""; input.setAttribute("aria-invalid", String(!!key)); };
  onLangChange(() => show(lastKey));
  input.addEventListener("input", () => { if (lastKey) show(null); });
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const bad = validateNickname(input.value); if (bad) { show(bad); input.focus(); return; }
    btn.disabled = true; btn.textContent = t("nickChecking");
    const key = await registerNickname(input.value);
    if (!key) { location.href = "mission.html"; return; }
    show(key); btn.disabled = false; applyI18n(); input.focus();
  });
}
init();
