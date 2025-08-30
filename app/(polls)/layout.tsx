"use client";

import { PollsProvider } from "@/lib/polls-context";

export default function PollsLayout({ children }: { children: React.ReactNode }) {
  return (
    <PollsProvider>
      <div className="mx-auto max-w-3xl py-8 space-y-6">
        {children}
      </div>
    </PollsProvider>
  );
}


