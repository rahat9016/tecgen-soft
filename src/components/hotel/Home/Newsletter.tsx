import { Input } from "@/src/components/ui/input";

export default function Newsletter() {
  return (
    <section className="container py-8">
      <div
        className="relative overflow-hidden rounded-2xl bg-cover bg-center"
        style={{
          backgroundImage:
            "url(https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=1200&q=80&auto=format&fit=crop)",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-sky-950/95 via-sky-950/80 to-sky-950/30" />

        <div className="relative flex flex-col gap-4 p-8 text-white md:max-w-md">
          <h2 className="text-2xl font-bold">Subscribe to Our Newsletter</h2>
          <p className="text-sm text-sky-100">
            Get exclusive offers, travel tips &amp; more straight to your inbox.
          </p>
          <form className="flex gap-2">
            <Input
              type="email"
              placeholder="Enter your email address"
              className="h-11 border-0 bg-white text-neutral-900"
            />
            <button
              type="submit"
              className="shrink-0 rounded-md bg-amber-400 px-5 text-sm font-semibold text-neutral-900 hover:bg-amber-300"
            >
              Subscribe
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
