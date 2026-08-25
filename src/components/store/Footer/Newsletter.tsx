import { Mail } from "lucide-react";
import { Input } from "@/src/components/ui/input";
import { Button } from "@/src/components/ui/button";

export default function Newsletter() {
  return (
    <div className="bg-emerald-900">
      <div className="container flex flex-col md:flex-row items-center justify-between gap-6 py-8">
        <div className="flex items-center gap-4">
          <span className="flex size-11 items-center justify-center rounded-full bg-white/10 text-white">
            <Mail className="size-5" />
          </span>
          <div>
            <h3 className="text-lg font-semibold text-white">
              নিউজলেটার সাবস্ক্রাইব করুন
            </h3>
            <p className="text-sm text-emerald-100">
              নতুন অফার ও আপডেট সবার আগে পেতে এখনই সাবস্ক্রাইব করুন।
            </p>
          </div>
        </div>

        <form className="flex w-full max-w-md">
          <Input
            type="email"
            placeholder="আপনার ইমেইল লিখুন"
            className="h-11 rounded-r-none border-0 focus-visible:ring-0"
          />
          <Button
            type="submit"
            className="h-11 rounded-l-none bg-amber-400 text-emerald-950 hover:bg-amber-300"
          >
            সাবস্ক্রাইব করুন
          </Button>
        </form>
      </div>
    </div>
  );
}
