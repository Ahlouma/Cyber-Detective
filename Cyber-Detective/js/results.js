import { requireProfile } from "./auth.js";
import { mountChrome, requireBackend, esc } from "./ui.js";
import { t, num, formatTime, onLangChange } from "./language.js";

let profile, res;
function render() {
  const pct = res.percentage;
  const msg = pct >= 90 ? "msg90" : pct >= 70 ? "msg70" : pct >= 50 ? "msg50" : "msg0";
  document.getElementById("main").innerHTML = `
    <article class="case report page-in" data-tab="${t("resultsTitle")}">
      <div class="report-head"><h1 style="font-size:clamp(1.6rem,5vw,2.4rem);margin:0">${t("resultsTitle")}</h1><span class="stamp">${t("stamp")}</span></div>
      <p class="score-big" aria-label="${t("score")}">${num(res.score)}<small> / ${num(res.total_questions)}</small></p>
      ${res.improved ? `<p><span class="badge-new">${t("newBest")}</span></p>` : ""}
      <dl class="facts">
        <div><dt>${t("detective")}</dt><dd>${esc(profile.nickname)}</dd></div>
        <div><dt>${t("percent")}</dt><dd>${num(pct)}%</dd></div>
        <div><dt>${t("correctCount")}</dt><dd>${num(res.score)} ${t("of")} ${num(res.total_questions)}</dd></div>
        <div><dt>${t("time")}</dt><dd>${formatTime(res.duration_ms)}</dd></div>
        <div><dt>${t("best")}</dt><dd>${num(res.best_score)} / ${num(res.total_questions)} &middot; ${formatTime(res.best_duration_ms)}</dd></div>
        <div><dt>${t("rank")}</dt><dd>${res.rank ? "#" + num(res.rank) + " " + t("of") + " " + num(res.total_participants) : "-"}</dd></div>
      </dl>
      <p>${t(msg)}</p>
      <div class="btn-row"><a class="btn btn-primary" href="leaderboard.html">${t("viewBoard")}</a><a class="btn btn-ghost" href="quiz.html">${t("tryAgain")}</a></div>
    </article>`;
}
async function init() {
  mountChrome();
  if (!requireBackend()) return;
  profile = await requireProfile(); if (!profile) return;
  try { res = JSON.parse(sessionStorage.getItem("cd-result") || "null"); } catch { res = null; }
  if (!res) {
    document.getElementById("main").innerHTML = `<div class="case narrow" data-tab=""><p>${t("noResult")}</p><a class="btn btn-primary" href="mission.html">${t("begin")}</a></div>`;
  } else render();
  onLangChange(() => (res ? render() : init()));
}
init();
