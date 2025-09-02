import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getPollById } from "@/lib/polls";
import { voteOnOption } from "@/lib/actions";

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

  async function voteAction(formData: FormData) {
    "use server";
    const optionId = String(formData.get("optionId") || "");
    if (!optionId) return;
    await voteOnOption(poll.id, optionId);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{poll.question}</CardTitle>
        <CardDescription>
          {totalVotes} vote{totalVotes === 1 ? "" : "s"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={voteAction} className="grid gap-4">
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
            <Button size="sm" type="submit">Submit vote</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}


