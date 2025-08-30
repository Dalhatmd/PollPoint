import Link from "next/link";
import { Button } from "@/components/ui/button";

export function SiteNav() {
  return (
    <header className="border-b">
      <div className="container mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="font-semibold">Poll App</Link>
        <nav className="flex items-center gap-2">
          <Button asChild variant="ghost">
            <Link href="/polls">Polls</Link>
          </Button>
          <Button asChild variant="default">
            <Link href="/polls/new">New Poll</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/login">Login</Link>
          </Button>
        </nav>
      </div>
    </header>
  );
}



