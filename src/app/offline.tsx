"use client";

import Link from "next/link";

export default function OfflinePage() {
  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="text-center">
        <h1 className="text-4xl font-semibold mb-4">You&apos;re offline</h1>
        <p className="text-sm text-muted-foreground mb-6">
          It looks like your internet connection is lost.
          <br />
        </p>
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => window.location.reload()}
            className="inline-block bg-primary text-white px-4 py-2 rounded-md hover:opacity-95"
          >
            Retry
          </button>
          <Link href="/" className="text-sm text-primary underline">
            Go home
          </Link>
        </div>
      </div>
    </main>
  );
}
