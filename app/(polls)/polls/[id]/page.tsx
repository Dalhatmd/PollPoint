"use client";

import { use } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { usePolls } from "@/lib/polls-context";

export default function PollDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { polls, voteOption } = usePolls();
  const { id } = use(params);
  const poll = polls.find((p) => p.id === id);

  if (!poll) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Poll not found</CardTitle>
          <CardDescription>It may have been removed.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const totalVotes = poll.options.reduce((sum, o) => sum + o.votes, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{poll.question}</CardTitle>
        <CardDescription>
          {totalVotes} vote{totalVotes === 1 ? "" : "s"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3">
          {poll.options.map((opt) => {
            const pct = totalVotes === 0 ? 0 : Math.round((opt.votes / totalVotes) * 100);
            return (
              <div key={opt.id} className="border rounded-md p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="font-medium">{opt.text}</div>
                  <div className="text-sm text-muted-foreground">{opt.votes} ({pct}%)</div>
                </div>
                <div className="h-2 bg-muted rounded">
                  <div
                    className="h-2 bg-foreground rounded"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <div className="mt-3">
                  <Button size="sm" onClick={() => voteOption(poll.id, opt.id)}>Vote</Button>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}


