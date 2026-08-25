import { CheckCircle2, Star, ArrowRight } from "lucide-react";
import { whyChoose, reviews } from "@/src/data/hotelHome";

export default function WhyChooseAndReviews() {
  return (
    <section className="container py-8">
      <div className="grid gap-5 md:grid-cols-3">
        <div className="rounded-xl border border-neutral-100 bg-white p-5 shadow-sm">
          <h3 className="text-base font-bold text-neutral-900">Why Choose TripWave?</h3>
          <ul className="mt-4 space-y-3">
            {whyChoose.map((item) => (
              <li key={item} className="flex items-center gap-2 text-sm text-neutral-700">
                <CheckCircle2 className="size-4 shrink-0 text-sky-600" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="md:col-span-2">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-neutral-900">What Our Guests Say</h3>
            <a href="#" className="flex items-center gap-1 text-sm font-medium text-sky-700 hover:underline">
              View All Reviews <ArrowRight className="size-3.5" />
            </a>
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            {reviews.map((review) => (
              <div
                key={review.name}
                className="rounded-xl border border-neutral-100 bg-white p-4 shadow-sm"
              >
                <div className="flex gap-0.5 text-amber-400">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="size-3.5 fill-amber-400" />
                  ))}
                </div>
                <p className="mt-2 text-sm text-neutral-600">&ldquo;{review.quote}&rdquo;</p>
                <div className="mt-3 flex items-center gap-2">
                  <img
                    src={`https://i.pravatar.cc/64?img=${review.avatar}`}
                    alt={review.name}
                    className="size-8 rounded-full object-cover"
                  />
                  <div>
                    <p className="text-xs font-semibold text-neutral-900">{review.name}</p>
                    <p className="text-[11px] text-neutral-500">{review.location}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
