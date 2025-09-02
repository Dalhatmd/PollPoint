"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createPoll(formData: FormData) {
  const supabase = await createClient();
  
  // Get form data
  const question = String(formData.get("question") || "").trim();
  const rawOptions = [
    String(formData.get("option1") || "").trim(),
    String(formData.get("option2") || "").trim(),
    String(formData.get("option3") || "").trim(),
  ].filter(Boolean);

  // Validation
  if (!question) {
    throw new Error("Question is required");
  }
  
  if (rawOptions.length < 2) {
    throw new Error("At least 2 options are required");
  }

  try {
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error("You must be logged in to create a poll");
    }

    // Create poll
    const { data: poll, error: pollError } = await supabase
      .from("polls")
      .insert({
        question,
        author_id: user.id,
      })
      .select()
      .single();

    if (pollError || !poll) {
      throw new Error("Failed to create poll");
    }

    // Create poll options
    const options = rawOptions.map((text, index) => ({
      poll_id: poll.id,
      text,
      order_index: index,
    }));

    const { error: optionsError } = await supabase
      .from("poll_options")
      .insert(options);

    if (optionsError) {
      throw new Error("Failed to create poll options");
    }

    revalidatePath("/polls");
    redirect(`/polls/${poll.id}`);
  } catch (error) {
    console.error("Error creating poll:", error);
    throw error;
  }
}

export async function voteOnOption(pollId: string, optionId: string) {
  const supabase = await createClient();
  
  try {
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error("You must be logged in to vote");
    }

    // Check if user already voted on this poll
    const { data: existingVote } = await supabase
      .from("votes")
      .select()
      .eq("poll_id", pollId)
      .eq("user_id", user.id)
      .single();

    if (existingVote) {
      throw new Error("You have already voted on this poll");
    }

    // Record the vote
    const { error: voteError } = await supabase
      .from("votes")
      .insert({
        poll_id: pollId,
        option_id: optionId,
        user_id: user.id,
      });

    if (voteError) {
      throw new Error("Failed to record vote");
    }

    revalidatePath(`/polls/${pollId}`);
    revalidatePath("/polls");
  } catch (error) {
    console.error("Error voting:", error);
    throw error;
  }
}
