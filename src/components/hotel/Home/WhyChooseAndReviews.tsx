import { format } from "date-fns";
import { CheckCircle2, Quote, Star } from "lucide-react";
import { whyChoose } from "@/src/data/hotelHome";
import { hotel } from "@/src/data/hotels";
import SectionHeading from "./SectionHeading";

const latestReviews = [...hotel.reviews].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 4);

function Stars({ rating, className }: { rating: number; className: string }) {
  return (
    <div className="flex gap-0.5" aria-label={`${rating} out of 5`}>
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          className={`${className} ${
            i < Math.round(rating) ? "fill-amber-400 text-amber-400" : "fill-neutral-200 text-neutral-200"
          }`}
        />
      ))}
    </div>
  );
}

export default function WhyChooseAndReviews() {
  return (
    <section id="reviews" className="container scroll-mt-24 py-10">
      <SectionHeading title="What Our Guests Say" subtitle="Real stories from guests who stayed with us." />

      <div className="mt-6 grid gap-5 lg:grid-cols-[340px_1fr]">
        <div className="relative overflow-hidden rounded-3xl bg-sky-950 p-6 text-white md:p-8">
          <div className="pointer-events-none absolute -right-16 -top-16 size-56 rounded-full bg-sky-500/30 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 -left-10 size-48 rounded-full bg-amber-400/20 blur-3xl" />

          <p className="relative text-sm font-medium text-sky-200">Overall guest rating</p>
          <div className="relative mt-2 flex items-end gap-2">
            <span className="text-6xl font-extrabold leading-none">{hotel.rating.toFixed(1)}</span>
            <span className="pb-1 text-lg font-medium text-sky-200">/ 5</span>
          </div>
          <div className="relative mt-3">
            <Stars rating={hotel.rating} className="size-5" />
          </div>
          <p className="relative mt-2 text-sm text-sky-200">
            Based on {hotel.reviewsCount.toLocaleString()} guest reviews
          </p>

          <div className="relative my-6 h-px bg-white/10" />

          <p className="relative text-sm font-semibold">Why guests choose {hotel.name}</p>
          <ul className="relative mt-4 space-y-3">
            {whyChoose.map((item) => (
              <li key={item} className="flex items-center gap-2.5 text-sm text-sky-50">
                <CheckCircle2 className="size-4 shrink-0 text-amber-400" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {latestReviews.map((review) => (
            <article
              key={review.name}
              className="flex flex-col rounded-2xl border border-neutral-200/70 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
            >
              <div className="flex items-start justify-between">
                <Stars rating={review.rating} className="size-4" />
                <Quote className="size-8 fill-sky-100 text-sky-100" />
              </div>

              <p className="mt-2 flex-1 text-[15px] leading-relaxed text-neutral-700">
                &ldquo;{review.comment}&rdquo;
              </p>

              <div className="mt-5 flex items-center gap-3 border-t border-neutral-100 pt-4">
                <img
                  src={`https://i.pravatar.cc/80?img=${review.avatar}`}
                  alt={review.name}
                  className="size-10 shrink-0 rounded-full object-cover ring-2 ring-white shadow"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-neutral-900">{review.name}</p>
                  <p className="truncate text-xs text-neutral-500">
                    {review.location} &middot; {format(new Date(review.date), "MMM yyyy")}
                  </p>
                </div>
              </div>

            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
