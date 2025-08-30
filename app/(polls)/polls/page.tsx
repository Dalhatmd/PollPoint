"use client";

import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { usePolls } from "@/lib/polls-context";

export default function PollsPage() {
  const { polls } = usePolls();
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Polls</h1>
        <Link href="/polls/new" className="underline">Create a poll</Link>
      </div>
      {polls.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Welcome</CardTitle>
            <CardDescription>Poll listing will appear here.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">No polls yet.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {polls.map((poll) => (
            <Card key={poll.id}>
              <CardHeader>
                <CardTitle className="text-base font-medium">
                  <Link href={`/polls/${poll.id}`} className="underline">
                    {poll.question}
                  </Link>
                </CardTitle>
                <CardDescription>{poll.options.length} options</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}


