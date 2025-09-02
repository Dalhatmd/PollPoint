"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createPoll } from "@/lib/actions";

export default function CreatePollForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    setIsSubmitting(true);
    setError(null);

    try {
      await createPoll(formData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create poll");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-white">Create New Poll</CardTitle>
        <CardDescription className="text-gray-300">
          Ask a question and add options for others to vote on
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="grid gap-4" action={handleSubmit}>
          <div className="grid gap-2">
            <Label htmlFor="question" className="text-white">
              Question
            </Label>
            <Input 
              id="question" 
              name="question" 
              placeholder="What should we build next?" 
              required
              className="bg-gray-800 border-gray-600 text-white placeholder:text-gray-400"
            />
          </div>
          
          <div className="grid gap-2">
            <Label className="text-white">Options</Label>
            <Input 
              placeholder="Option 1" 
              name="option1" 
              required
              className="bg-gray-800 border-gray-600 text-white placeholder:text-gray-400"
            />
            <Input 
              placeholder="Option 2" 
              name="option2" 
              required
              className="bg-gray-800 border-gray-600 text-white placeholder:text-gray-400"
            />
            <Input 
              placeholder="Option 3 (optional)" 
              name="option3" 
              className="bg-gray-800 border-gray-600 text-white placeholder:text-gray-400"
            />
          </div>

          {error && (
            <div className="p-3 bg-red-900/20 border border-red-500/50 rounded-md">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <Button 
            type="submit" 
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Creating..." : "Create Poll"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
