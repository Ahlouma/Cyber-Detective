import { requireProfile } from "./auth.js";
import { mountChrome, requireBackend, esc } from "./ui.js";
import { t, onLangChange } from "./language.js";

async function init() {
  mountChrome();
  if (!requireBackend()) return;
  const p = await requireProfile(); if (!p) return;
  const render = () => {
    document.getElementById("main").innerHTML = `<article class="case narrow page-in" data-tab="${t("missionPageTitle")}">
      <h1 style="font-size:clamp(1.8rem,6vw,2.6rem)">${t("missionHi")} ${esc(p.nickname)}</h1>
      <p>${t("mission1")}</p><p>${t("mission2")}</p><p>${t("mission3")}</p>
      <a class="btn btn-primary" href="quiz.html">${t("begin")}</a></article>`;
  };
  render(); onLangChange(render);
}
init();
