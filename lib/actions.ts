"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

// Types
type CreatePollInput = {
  question: string;
  options: string[];
};

type PollRecord = {
  id: string;
  question: string;
  author_id: string;
};

type StandardActionError = Error;

// Error helpers
function actionError(message: string): StandardActionError {
  return new Error(message);
}

// Centralized Supabase
async function getSupabase() {
  return await createClient();
}

// Auth abstraction
async function requireUserId(supabase: Awaited<ReturnType<typeof getSupabase>>): Promise<string> {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) {
    throw actionError("You must be logged in to perform this action");
  }
  return user.id as string;
}

// Input parsing and validation
function parseCreatePollForm(formData: FormData): CreatePollInput {
  const question = String(formData.get("question") || "").trim();
  const optionsRaw = [
    String(formData.get("option1") || "").trim(),
    String(formData.get("option2") || "").trim(),
    String(formData.get("option3") || "").trim(),
  ].filter(Boolean);

  if (!question) {
    throw actionError("Question is required");
  }
  if (optionsRaw.length < 2) {
    throw actionError("At least 2 options are required");
  }

  return { question, options: optionsRaw };
}

// Poll operations
async function insertPoll(supabase: Awaited<ReturnType<typeof getSupabase>>, question: string, authorId: string): Promise<PollRecord> {
  const { data: poll, error } = await supabase
    .from("polls")
    .insert({ question, author_id: authorId })
    .select()
    .single();
  if (error || !poll) {
    throw actionError("Failed to create poll");
  }
  return poll as PollRecord;
}

async function insertPollOptions(
  supabase: Awaited<ReturnType<typeof getSupabase>>,
  pollId: string,
  options: string[]
) {
  const records = options.map((text, index) => ({ poll_id: pollId, text, order_index: index }));
  const { error } = await supabase.from("poll_options").insert(records);
  if (error) {
    throw actionError("Failed to create poll options");
  }
}

async function hasUserVoted(
  supabase: Awaited<ReturnType<typeof getSupabase>>,
  pollId: string,
  userId: string
) {
  const { data } = await supabase
    .from("votes")
    .select()
    .eq("poll_id", pollId)
    .eq("user_id", userId)
    .single();
  return Boolean(data);
}

async function insertVote(
  supabase: Awaited<ReturnType<typeof getSupabase>>,
  pollId: string,
  optionId: string,
  userId: string
) {
  const { error } = await supabase.from("votes").insert({ poll_id: pollId, option_id: optionId, user_id: userId });
  if (error) {
    throw actionError("Failed to record vote");
  }
}

// Server Actions
export async function createPoll(formData: FormData) {
  const supabase = await getSupabase();
  const { question, options } = parseCreatePollForm(formData);
  try {
    const userId = await requireUserId(supabase);
    const poll = await insertPoll(supabase, question, userId);
    await insertPollOptions(supabase, poll.id, options);
    revalidatePath("/polls");
    redirect(`/polls/${poll.id}`);
  } catch (error) {
    // keep error messages expected by tests/UI
    throw error as StandardActionError;
  }
}

export async function voteOnOption(pollId: string, optionId: string) {
  const supabase = await getSupabase();
  try {
    const userId = await requireUserId(supabase);
    const alreadyVoted = await hasUserVoted(supabase, pollId, userId);
    if (alreadyVoted) {
      throw actionError("You have already voted on this poll");
    }
    await insertVote(supabase, pollId, optionId, userId);
    revalidatePath(`/polls/${pollId}`);
    revalidatePath("/polls");
  } catch (error) {
    throw error as StandardActionError;
  }
}
