import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getPollById } from "@/lib/polls";
import { voteOnOption } from "@/lib/actions";
import { PollVotingForm } from "./poll-voting-form";

export default async function PollDetailPage({ params }: { params: { id: string } }) {
  const poll = await getPollById(params.id);

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
        <PollVotingForm poll={poll} />
      </CardContent>
    </Card>
  );
}


