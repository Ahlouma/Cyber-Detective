import { supabase } from "./supabase.js";
import { requireProfile } from "./auth.js";
import { mountChrome, requireBackend, esc } from "./ui.js";
import { t, num, formatTime, onLangChange } from "./language.js";

let data = null, timer = null;
const row = (r, i) => `<li class="lb-row${r.is_me ? " me" : ""}" style="animation-delay:${i * 40}ms">
  <span class="rank">${num(r.rank)}</span><span class="nick">${esc(r.nickname)}${r.is_me ? ` <small>(${t("you")})</small>` : ""}</span>
  <span class="num">${num(r.score)}/20</span><span class="num time">${formatTime(r.duration_ms)}</span></li>`;

function render() {
  const top = data.top, me = data.me, main = document.getElementById("main");
  const podium = top.slice(0, 3);
  const order = [podium[1], podium[0], podium[2]].map((p, i) => p && { p, cls: ["p2", "p1", "p3"][i] }).filter(Boolean);
  const rest = top.slice(3);
  main.innerHTML = `<div class="lb-wrap page-in">
    <h1 style="font-size:clamp(1.8rem,5vw,2.8rem)">${t("boardTitle")}</h1>
    <p>${t("boardText")}</p>
    <span class="lb-total" aria-live="polite">${t("participants")}: ${num(data.total)}</span>
    ${me ? `<p><strong>${t("yourRank")}: #${num(me.rank)}</strong> &middot; ${num(me.score)}/20 &middot; ${formatTime(me.duration_ms)}</p>` : `<p class="hint">${t("noEntry")}</p>`}
    ${top.length === 0 ? `<div class="notice">${t("boardEmpty")}</div>` : ""}
    ${order.length ? `<div class="podium">${order.map(({ p, cls }) => `<div class="pod ${cls}${p.is_me ? " me" : ""}">
      <span class="medal">${num(p.rank)}</span><b>${esc(p.nickname)}</b><span>${num(p.score)}/20</span><span>${formatTime(p.duration_ms)}</span></div>`).join("")}</div>` : ""}
    <ol class="lb-list" start="4">${rest.map(row).join("")}</ol>
    ${me && me.rank > 10 ? `<p class="lb-gap" aria-hidden="true">&middot; &middot; &middot;</p><ol class="lb-list" start="${me.rank}">${row(me, 0)}</ol>` : ""}
    <p style="margin-top:24px"><a class="btn btn-primary" href="quiz.html">${t("tryAgain")}</a></p></div>`;
}
async function load() {
  const { data: d, error } = await supabase.rpc("get_leaderboard", { p_limit: 10 });
  if (error) { document.getElementById("main").innerHTML = `<div class="case narrow" data-tab=""><div class="error" role="alert">${t("genericError")}</div></div>`; return; }
  data = d; render();
}
async function init() {
  mountChrome();
  if (!requireBackend()) return;
  if (!(await requireProfile())) return;
  await load();
  // Live updates when anyone's best result changes
  supabase.channel("lb").on("postgres_changes", { event: "*", schema: "public", table: "leaderboard_entries" },
    () => { clearTimeout(timer); timer = setTimeout(load, 600); }).subscribe();
  onLangChange(() => data && render());
}
init();
