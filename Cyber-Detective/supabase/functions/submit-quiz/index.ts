// Edge Function: submit-quiz
// Actions: start | answer | finish. All scoring and timing are computed here, never in the browser.
import { createClient } from "jsr:@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": Deno.env.get("ALLOWED_ORIGIN") ?? "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const MIN_MS_PER_QUESTION = 2000;   // faster than this on average is rejected as automated
const MAX_ATTEMPT_MS = 2 * 60 * 60 * 1000;
const STARTS_PER_HOUR = 15;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);
  try {
    const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, {
      auth: { persistSession: false },
    });
    const token = (req.headers.get("Authorization") ?? "").replace(/^Bearer\s+/i, "");
    const { data: auth, error: authErr } = await admin.auth.getUser(token);
    if (authErr || !auth?.user) return json({ error: "unauthorized" }, 401);
    const uid = auth.user.id;

    const { data: profile } = await admin.from("profiles").select("id").eq("id", uid).maybeSingle();
    if (!profile) return json({ error: "no_profile" }, 403);

    const body = await req.json().catch(() => ({}));

    // ------------------------------------------------------------ start
    if (body.action === "start") {
      const since = new Date(Date.now() - 3600_000).toISOString();
      const { count } = await admin.from("attempts").select("id", { count: "exact", head: true })
        .eq("user_id", uid).gte("started_at", since);
      if ((count ?? 0) >= STARTS_PER_HOUR) return json({ error: "rate_limited" }, 429);
      await admin.from("attempts").update({ status: "abandoned" }).eq("user_id", uid).eq("status", "active");
      const { data, error } = await admin.from("attempts").insert({ user_id: uid }).select("id").single();
      if (error) throw error;
      return json({ attempt_id: data.id });
    }

    // load + validate the attempt for answer/finish
    // deno-lint-ignore no-explicit-any
    let attempt: any = null;
    if (body.action === "answer" || body.action === "finish") {
      if (!UUID.test(body.attempt_id ?? "")) return json({ error: "bad_request" }, 400);
      const res = await admin.from("attempts").select("*").eq("id", body.attempt_id).maybeSingle();
      attempt = res.data;
      if (!attempt || attempt.user_id !== uid) return json({ error: "not_found" }, 404);
      if (attempt.status !== "active") return json({ error: "attempt_closed" }, 409);
      if (Date.now() - new Date(attempt.started_at).getTime() > MAX_ATTEMPT_MS) {
        await admin.from("attempts").update({ status: "expired" }).eq("id", attempt.id);
        return json({ error: "attempt_expired" }, 410);
      }
    }

    // ------------------------------------------------------------ answer
    if (body.action === "answer") {
      if (!UUID.test(body.question_id ?? "") || !UUID.test(body.option_id ?? "")) return json({ error: "bad_request" }, 400);
      const { data: opts } = await admin.from("options").select("id, position").eq("question_id", body.question_id);
      const chosen = opts?.find((o) => o.id === body.option_id);
      if (!opts || !chosen) return json({ error: "bad_request" }, 400);
      const { data: key } = await admin.from("answer_keys").select("correct_option_id, feedback")
        .eq("question_id", body.question_id).single();
      if (!key) return json({ error: "not_found" }, 404);
      const isCorrect = key.correct_option_id === body.option_id;
      const { error: insErr } = await admin.from("attempt_answers").insert({
        attempt_id: attempt.id, question_id: body.question_id, option_id: body.option_id, is_correct: isCorrect,
      });
      if (insErr) return json({ error: insErr.code === "23505" ? "already_answered" : "server_error" }, insErr.code === "23505" ? 409 : 500);
      return json({
        correct: isCorrect,
        correct_option_id: key.correct_option_id,
        selected_position: chosen.position,
        feedback: key.feedback,
      });
    }

    // ------------------------------------------------------------ finish
    if (body.action === "finish") {
      const { count: totalQs } = await admin.from("questions").select("id", { count: "exact", head: true });
      const { data: answers } = await admin.from("attempt_answers").select("is_correct").eq("attempt_id", attempt.id);
      if (!answers || answers.length !== totalQs) return json({ error: "incomplete" }, 400);

      const durationMs = Math.max(1, Date.now() - new Date(attempt.started_at).getTime());
      if (durationMs < (totalQs ?? 20) * MIN_MS_PER_QUESTION) {
        await admin.from("attempts").update({ status: "rejected", finished_at: new Date().toISOString(), duration_ms: durationMs }).eq("id", attempt.id);
        return json({ error: "too_fast" }, 422);
      }
      const score = answers.filter((a) => a.is_correct).length;
      // Close the attempt exactly once (guards against double submits)
      const { data: closed } = await admin.from("attempts")
        .update({ status: "finished", finished_at: new Date().toISOString(), score, duration_ms: durationMs })
        .eq("id", attempt.id).eq("status", "active").select("id");
      if (!closed?.length) return json({ error: "attempt_closed" }, 409);

      const { data: improved } = await admin.rpc("submit_best", { p_user: uid, p_score: score, p_duration_ms: durationMs });
      const { data: standing } = await admin.rpc("standing_for", { p_user: uid });
      const s = standing?.[0];
      return json({
        score, total_questions: totalQs, percentage: Math.round((score / (totalQs ?? 20)) * 100),
        duration_ms: durationMs, improved: !!improved,
        best_score: s?.score ?? score, best_duration_ms: s?.duration_ms ?? durationMs,
        rank: s ? Number(s.rank) : null, total_participants: s ? Number(s.total) : null,
      });
    }

    return json({ error: "unknown_action" }, 400);
  } catch (e) {
    console.error(e);
    return json({ error: "server_error" }, 500);
  }
});
