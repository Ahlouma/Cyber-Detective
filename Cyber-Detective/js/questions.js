import { supabase } from "./supabase.js";
// Loads the 20 questions + options. Correct answers are NOT here: they live in answer_keys (server only).
export async function loadQuestions() {
  const { data, error } = await supabase
    .from("questions")
    .select("id, position, stage, scenario, categories(name), options(id, position, label)")
    .order("position");
  if (error) throw error;
  if (!data || data.length !== 20) throw new Error("Expected 20 questions, got " + (data?.length ?? 0));
  return data.map((q) => ({ ...q, options: [...q.options].sort((a, b) => a.position - b.position) }));
}
