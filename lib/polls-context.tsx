"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { Poll } from "@/lib/types";
import { generateId } from "@/lib/utils";

type NewPollInput = {
  question: string;
  authorId?: string;
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

  const addPoll: PollsContextValue["addPoll"] = (data) => {
    const id = generateId();
    const now = new Date().toISOString();
    const poll: Poll = {
      id,
      question: data.question,
      options: data.options.map((o, idx) => ({ id: `${id}-${idx}`, text: o.text, votes: 0 })),
      authorId: data.authorId,
      createdAt: now,
    };
    setPolls((prev) => [poll, ...prev]);
    return id;
  };

  const voteOption: PollsContextValue["voteOption"] = (pollId, optionId) => {
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
  };

  const value = useMemo(() => ({ polls, addPoll, voteOption }), [polls]);
  return <PollsContext.Provider value={value}>{children}</PollsContext.Provider>;
}

export function usePolls() {
  const ctx = useContext(PollsContext);
  if (!ctx) throw new Error("usePolls must be used within PollsProvider");
  return ctx;
}


