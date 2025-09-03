"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { voteOnOption } from "@/lib/actions";
import type { Poll } from "@/lib/types";

interface PollVotingFormProps {
  poll: Poll;
}

export function PollVotingForm({ poll }: PollVotingFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const totalVotes = poll.options.reduce((sum, o) => sum + o.votes, 0);

  async function handleVote(formData: FormData) {
    setError(null);
    
    startTransition(async () => {
      try {
        const optionId = String(formData.get("optionId") || "");
        if (!optionId) return;
        
        await voteOnOption(poll.id, optionId);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("An error occurred while voting");
        }
      }
    });
  }

  return (
    <div className="space-y-4">
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="text-red-800 text-sm">{error}</div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setError(null)}
              className="mt-2"
            >
              Dismiss
            </Button>
          </CardContent>
        </Card>
      )}
      
      <form action={handleVote} className="grid gap-4">
        <div className="grid gap-3">
          {poll.options.map((opt) => {
            const pct = totalVotes === 0 ? 0 : Math.round((opt.votes / totalVotes) * 100);
            return (
              <label key={opt.id} className="border rounded-md p-3 flex items-start gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="optionId"
                  value={opt.id}
                  required
                  className="mt-1 h-4 w-4 accent-foreground"
                />
                <div className="flex-1">
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
                </div>
              </label>
            );
          })}
        </div>
        <div>
          <Button size="sm" type="submit" disabled={isPending}>
            {isPending ? "Submitting..." : "Submit vote"}
          </Button>
        </div>
      </form>
    </div>
  );
}
