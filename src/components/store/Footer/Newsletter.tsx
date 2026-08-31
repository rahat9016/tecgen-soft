import { Mail } from "lucide-react";
import { Input } from "@/src/components/ui/input";
import { Button } from "@/src/components/ui/button";

export default function Newsletter() {
  return (
    <div className="border-y border-white/10 bg-emerald-800 shadow-inner">
      <div className="container flex flex-col md:flex-row items-center justify-between gap-6 py-8">
        <div className="flex items-center gap-4">
          <span className="flex size-11 items-center justify-center rounded-full bg-white/10 text-white">
            <Mail className="size-5" />
          </span>
          <div>
            <h3 className="text-lg font-semibold text-white">
              Subscribe to Our Newsletter
            </h3>
            <p className="text-sm text-emerald-100">
              Subscribe now to get the latest offers and updates first.
            </p>
          </div>
        </div>

        <form className="flex w-full max-w-md">
          <Input
            type="email"
            placeholder="Enter your email"
            className="h-11 rounded-r-none border-0 focus-visible:ring-0"
          />
          <Button
            type="submit"
            className="h-11 rounded-l-none bg-amber-400 text-emerald-950 hover:bg-amber-300"
          >
            Subscribe
          </Button>
        </form>
      </div>
    </div>
  );
}
