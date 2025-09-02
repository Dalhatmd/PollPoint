import { createClient } from "@/lib/supabase/server";
import type { Poll } from "@/lib/types";

export async function getPolls(): Promise<Poll[]> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from("polls")
    .select(`
      id,
      question,
      author_id,
      created_at,
      updated_at,
      poll_options (
        id,
        text,
        order_index,
        votes:votes(count)
      )
    `)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching polls:", error);
    throw new Error("Failed to fetch polls");
  }

  return data?.map(poll => ({
    id: poll.id,
    question: poll.question,
    author_id: poll.author_id,
    created_at: poll.created_at,
    updated_at: poll.updated_at,
    options: poll.poll_options?.map(option => ({
      id: option.id,
      text: option.text,
      order_index: option.order_index,
      votes: option.votes?.[0]?.count || 0
    })) || []
  })) || [];
}

export async function getPollById(id: string): Promise<Poll | null> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from("polls")
    .select(`
      id,
      question,
      author_id,
      created_at,
      updated_at,
      poll_options (
        id,
        text,
        order_index,
        votes:votes(count)
      )
    `)
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching poll:", error);
    return null;
  }

  return {
    id: data.id,
    question: data.question,
    author_id: data.author_id,
    created_at: data.created_at,
    updated_at: data.updated_at,
    options: data.poll_options?.map(option => ({
      id: option.id,
      text: option.text,
      order_index: option.order_index,
      votes: option.votes?.[0]?.count || 0
    })) || []
  };
}

