"use client";

import Link from "next/link";
import { Button } from "../components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="text-center">
        <h1 className="text-4xl font-semibold mb-4">Something went wrong</h1>
        <p className="text-sm text-muted-foreground mb-4">
          An unexpected error has occurred.
        </p>
        <pre className="bg-muted p-3 rounded mb-4 text-left overflow-auto max-w-xl">
          {error?.message}
        </pre>
        <div className="flex items-center justify-center gap-3">
          <Button
            onClick={() => reset()}
            className="inline-block bg-primary text-white px-4 py-2 rounded-md hover:opacity-95"
          >
            Try again
          </Button>
          <Link href="/" className="text-sm text-primary underline">
            Go home
          </Link>
        </div>
      </div>
    </main>
  );
}
