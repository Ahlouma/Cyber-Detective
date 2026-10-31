import { t, initLanguage } from "./language.js";
import { isConfigured } from "./config.js";

export const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

export function mountChrome() {
  const root = document.body.dataset.root || "";
  document.getElementById("chrome").innerHTML =
    `<a class="skip" href="#main" data-i18n="skip"></a>
     <header class="site-header">
       <a class="brand" href="${root}index.html"><img src="${root}assets/images/logo.svg" alt="" width="38" height="38"><span data-i18n="brand"></span></a>
       <div class="lang" role="group" aria-label="Language / اللغة">
         <button type="button" data-lang="en" lang="en" aria-pressed="false">English</button>
         <button type="button" data-lang="ar" lang="ar" aria-pressed="false">العربية</button>
       </div>
     </header>`;
  initLanguage();
}

// Returns true if the backend is configured; otherwise renders a setup notice inside #main.
export function requireBackend() {
  if (isConfigured()) return true;
  const main = document.getElementById("main");
  main.innerHTML = `<div class="case narrow page-in" data-tab=""><h2 data-i18n="setupTitle"></h2><p data-i18n="setupText"></p></div>`;
  initLanguage();
  return false;
}
