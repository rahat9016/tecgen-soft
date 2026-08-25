import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="text-center">
        <h1 className="text-4xl font-semibold mb-4">Page not found</h1>
        <p className="text-sm text-muted-foreground mb-6">
          We couldn&apos;t find the page you&apos;re looking for.
        </p>
        <Link
          href="/"
          className="inline-block bg-primary text-white px-4 py-2 rounded-md hover:opacity-95"
        >
          Go back home
        </Link>
      </div>
    </main>
  );
}
