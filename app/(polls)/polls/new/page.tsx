"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { usePolls } from "@/lib/polls-context";
import { useRouter } from "next/navigation";

export default function NewPollPage() {
  const { addPoll } = usePolls();
  const router = useRouter();

  function onSubmit(formData: FormData) {
    const question = String(formData.get("question") || "").trim();
    const rawOptions = [
      String(formData.get("option1") || "").trim(),
      String(formData.get("option2") || "").trim(),
      String(formData.get("option3") || "").trim(),
    ].filter(Boolean);
    const options = rawOptions.map((text) => ({ text }));
    const id = addPoll({ question, options });
    router.push(`/polls/${id}`);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>New Poll</CardTitle>
        <CardDescription>Create a question and add options</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="grid gap-4" action={onSubmit}>
          <div className="grid gap-2">
            <Label htmlFor="question">Question</Label>
            <Input id="question" name="question" placeholder="What should we build next?" />
          </div>
          <div className="grid gap-2">
            <Label>Options</Label>
            <Input placeholder="Option 1" name="option1" />
            <Input placeholder="Option 2" name="option2" />
            <Input placeholder="Option 3 (optional)" name="option3" />
          </div>
          <Button type="submit" className="w-full">Create Poll</Button>
        </form>
      </CardContent>
    </Card>
  );
}


