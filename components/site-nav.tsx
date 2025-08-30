"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";

export function SiteNav() {
  const { user, signOut, loading } = useAuth();

  return (
    <header className="border-b">
      <div className="container mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="font-semibold">Poll App</Link>
        <nav className="flex items-center gap-2">
          {!loading && (
            <>
              {user ? (
                <>
                  <Button asChild variant="ghost">
                    <Link href="/polls">Polls</Link>
                  </Button>
                  <Button asChild variant="default">
                    <Link href="/polls/new">New Poll</Link>
                  </Button>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      {user.user_metadata?.name || user.email}
                    </span>
                    <Button variant="outline" size="sm" onClick={signOut}>
                      Logout
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <Button asChild variant="outline">
                    <Link href="/login">Login</Link>
                  </Button>
                  <Button asChild variant="default">
                    <Link href="/register">Register</Link>
                  </Button>
                </>
              )}
            </>
          )}
        </nav>
      </div>
    </header>
  );
}



