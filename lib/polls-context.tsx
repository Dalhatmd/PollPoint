"use client";

import { createContext, useContext, useEffect, useMemo, useState, useCallback } from "react";
import type { Poll } from "@/lib/types";
import { generateId } from "@/lib/utils";
import { useAuth } from "./auth-context";

type NewPollInput = {
  question: string;
  options: { text: string }[];
};

type PollsContextValue = {
  polls: Poll[];
  addPoll: (poll: NewPollInput) => string;
  voteOption: (pollId: string, optionId: string) => void;
};

const PollsContext = createContext<PollsContextValue | null>(null);

const STORAGE_KEY = "polls:v1";

export function PollsProvider({ children }: { children: React.ReactNode }) {
  const [polls, setPolls] = useState<Poll[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Poll[];
        if (Array.isArray(parsed)) {
          setPolls(parsed);
        }
      }
    } catch {}
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(polls));
    } catch {}
  }, [polls, hydrated]);

  const addPoll = useCallback((data: NewPollInput) => {
    const id = generateId();
    const now = new Date().toISOString();
    const poll: Poll = {
      id,
      question: data.question,
      options: data.options.map((o, idx) => ({ 
        id: `${id}-${idx}`, 
        text: o.text, 
        order_index: idx,
        votes: 0 
      })),
      author_id: user?.id,
      created_at: now,
    };
    setPolls((prev) => [poll, ...prev]);
    return id;
  }, [user?.id]);

  const voteOption = useCallback((pollId: string, optionId: string) => {
    setPolls((prev) =>
      prev.map((p) =>
        p.id !== pollId
          ? p
          : {
              ...p,
              options: p.options.map((opt) =>
                opt.id === optionId ? { ...opt, votes: opt.votes + 1 } : opt
              ),
            }
      )
    );
  }, []);

  const value = useMemo(() => ({ polls, addPoll, voteOption }), [polls, addPoll, voteOption]);
  return <PollsContext.Provider value={value}>{children}</PollsContext.Provider>;
}

export function usePolls() {
  const ctx = useContext(PollsContext);
  if (!ctx) throw new Error("usePolls must be used within PollsProvider");
  return ctx;
}


