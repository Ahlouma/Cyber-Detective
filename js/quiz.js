import { supabase, callFn } from "./supabase.js";
import { requireProfile } from "./auth.js";
import { loadQuestions } from "./questions.js";
import { mountChrome, requireBackend, esc } from "./ui.js";
import { t, pick, letter, num, formatTime, onLangChange, applyI18n } from "./language.js";

const S = { qs: [], i: 0, attemptId: null, picked: null, result: null, busy: false, error: null, t0: Date.now() };
const main = () => document.getElementById("main");

function errText(code) {
  return code === "too_fast" ? t("tooFast") : code === "rate_limited" ? t("rateLimited") : t("genericError");
}

function render() {
  const q = S.qs[S.i]; if (!q) return;
  const total = S.qs.length, answered = !!S.result, last = S.i === total - 1;
  const fb = answered ? S.result.feedback[document.documentElement.lang] || S.result.feedback.en : null;
  const opts = q.options.map((o, idx) => {
    let cls = "answer", extra = "";
    if (answered) {
      extra = " disabled";
      if (o.id === S.result.correct_option_id) cls += " is-correct";
      else if (o.id === S.picked) cls += " is-wrong";
      else cls += " is-dim";
    }
    return `<button type="button" role="radio" class="${cls}" data-id="${o.id}" aria-checked="${o.id === S.picked}"${extra}>
      <span class="letter" aria-hidden="true">${letter(idx)}</span><span>${esc(pick(o.label))}</span></button>`;
  }).join("");

  let feedback = "";
  if (answered) {
    const good = S.result.correct;
    const bestIdx = q.options.findIndex((o) => o.id === S.result.correct_option_id);
    feedback = `<div class="feedback ${good ? "good" : "bad"}" role="status" aria-live="polite">
      <h3>${good ? t("goodTitle") : t("badTitle")}</h3>
      <span class="threat">${t("threat")}: ${esc(fb.threat)}</span>
      ${good ? "" : `<p><span class="label">${t("bestIs", { l: letter(bestIdx) })}</span></p>
        <p><span class="label">${t("whyRisky")}</span>${esc(fb.wrong[S.result.selected_position])}</p>`}
      <p><span class="label">${t("whyBest")}</span>${esc(fb.lesson)}</p>
      ${good ? '<i class="sparkle" style="inset-inline-end:14%;top:30%"></i><i class="sparkle" style="inset-inline-end:6%;top:60%;animation-delay:.2s"></i><i class="sparkle" style="inset-inline-end:26%;top:12%;animation-delay:.35s"></i>' : ""}
    </div>`;
  }

  main().innerHTML = `
    <div class="narrow page-in">
      <div class="quiz-top">
        <div class="chips"><span class="chip">${t("stageWord")} ${num(q.stage)}: ${t("stage" + q.stage)}</span>
          <span class="chip cat">${esc(pick(q.categories?.name))}</span></div>
        <span class="timer" aria-hidden="true" id="timer">${formatTime(Date.now() - S.t0)}</span>
      </div>
      <div class="progress" role="progressbar" aria-valuemin="1" aria-valuemax="${total}" aria-valuenow="${S.i + 1}">
        <span style="width:${((S.i + (answered ? 1 : 0)) / total) * 100}%"></span></div>
      <p class="q-count">${t("questionOf", { n: num(S.i + 1), t: num(total) })}</p>
      <section class="case q-enter" data-tab="${t("caseWord")} ${num(S.i + 1)}" aria-labelledby="scn">
        <p class="scenario" id="scn">${esc(pick(q.scenario))}</p>
        <div class="answers" role="radiogroup" aria-labelledby="scn">${opts}</div>
        ${S.error ? `<div class="error" role="alert">${esc(S.error)}</div>` : ""}
        ${feedback}
        <div class="actions">
          ${answered
            ? `<button type="button" class="btn btn-primary" id="next" ${S.busy ? "disabled" : ""}>${last ? t("finish") : t("next")}</button>`
            : `<button type="button" class="btn btn-primary" id="submit" ${S.picked && !S.busy ? "" : "disabled"}>${t("submit")}</button>`}
        </div>
      </section>
    </div>`;
  bind();
}

function bind() {
  const group = main().querySelector(".answers");
  group.querySelectorAll(".answer").forEach((b) => {
    b.addEventListener("click", () => { if (S.result) return; S.picked = b.dataset.id; S.error = null; refreshSelection(); });
    b.addEventListener("keydown", (e) => {
      const all = [...group.querySelectorAll(".answer")], i = all.indexOf(b);
      const step = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[e.key];
      if (step && !S.result) { e.preventDefault(); all[(i + step + all.length) % all.length].focus(); }
    });
  });
  document.getElementById("submit")?.addEventListener("click", submit);
  document.getElementById("next")?.addEventListener("click", next);
  if (S.result) document.getElementById("next")?.focus({ preventScroll: false });
}

// Update selection in place (no full re-render, so no flicker or lost focus)
function refreshSelection() {
  main().querySelectorAll(".answer").forEach((b) => b.setAttribute("aria-checked", String(b.dataset.id === S.picked)));
  const s = document.getElementById("submit"); if (s) s.disabled = !S.picked;
}

async function submit() {
  if (!S.picked || S.busy || S.result) return;
  S.busy = true; S.error = null;
  const btn = document.getElementById("submit"); if (btn) btn.disabled = true;
  try {
    S.result = await callFn({ action: "answer", attempt_id: S.attemptId, question_id: S.qs[S.i].id, option_id: S.picked });
  } catch (e) { S.error = errText(e.code); }
  S.busy = false; render();
}

async function next() {
  if (S.busy) return;
  if (S.i < S.qs.length - 1) { S.i++; S.picked = null; S.result = null; S.error = null; render(); window.scrollTo({ top: 0, behavior: "smooth" }); return; }
  S.busy = true; S.error = null; render();
  try {
    const res = await callFn({ action: "finish", attempt_id: S.attemptId });
    sessionStorage.setItem("cd-result", JSON.stringify(res));
    location.href = "results.html";
  } catch (e) { S.busy = false; S.error = errText(e.code); render(); }
}

async function init() {
  mountChrome();
  if (!requireBackend()) return;
  main().innerHTML = `<div class="loading narrow"><span class="spinner"></span><span data-i18n="loading"></span></div>`; applyI18n();
  if (!(await requireProfile())) return;
  try {
    S.qs = await loadQuestions();
    S.attemptId = (await callFn({ action: "start" })).attempt_id;
    S.t0 = Date.now();
  } catch (e) {
    main().innerHTML = `<div class="case narrow" data-tab=""><div class="error" role="alert">${esc(e.code === "rate_limited" ? t("rateLimited") : t("loadError"))}</div>
      <p><a class="btn btn-ghost" href="">${t("retry")}</a></p></div>`;
    return;
  }
  render();
  setInterval(() => { const el = document.getElementById("timer"); if (el) el.textContent = formatTime(Date.now() - S.t0); }, 1000);
  onLangChange(render);
}
init();
