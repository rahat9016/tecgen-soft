"use client";

import { useEffect, useRef, useState } from "react";
import { format } from "date-fns";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import type { HotelReview } from "@/src/data/hotels";
import { ratingLabel } from "@/src/components/hotel/shared/ratingLabel";
import { initials } from "@/src/lib/hotel-store/format";

function Stars({ rating, size }: { rating: number; size: string }) {
  return (
    <div className="flex gap-0.5" aria-label={`${rating} out of 5`}>
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          className={`${size} ${
            i < Math.round(rating) ? "fill-amber-400 text-amber-400" : "fill-neutral-200 text-neutral-200"
          }`}
        />
      ))}
    </div>
  );
}

const arrowClass =
  "flex size-9 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-700 transition hover:border-sky-300 hover:text-sky-700 disabled:pointer-events-none disabled:opacity-35";

/** Heading row with the overall score, then a swipeable row of reviews: one card (plus a peek) on phones, two on wider screens. */
export default function ReviewsSection({
  reviews,
  rating,
  reviewsCount,
}: {
  reviews: HotelReview[];
  rating: number;
  reviewsCount: number;
}) {
  const track = useRef<HTMLUListElement>(null);
  const [edge, setEdge] = useState({ start: true, end: false });

  const update = () => {
    const el = track.current;
    if (!el) return;
    setEdge({ start: el.scrollLeft <= 4, end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 4 });
  };
  useEffect(() => {
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  // One step is a card plus its gap, so each press lands on the next card edge.
  const step = (dir: 1 | -1) => {
    const el = track.current;
    const card = el?.firstElementChild as HTMLElement | null;
    if (!el || !card) return;
    el.scrollBy({ left: dir * (card.offsetWidth + 16), behavior: "smooth" });
  };

  return (
    <div>
      <div className="flex items-end justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-xl font-bold text-neutral-900">Guest Reviews</h2>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-neutral-600">
            <Star className="size-4 fill-amber-400 text-amber-400" aria-hidden />
            <b className="font-bold text-neutral-900">{rating.toFixed(1)}</b>
            <span className="truncate">
              {ratingLabel(rating)} · {reviewsCount.toLocaleString()} reviews
            </span>
          </p>
        </div>
        {reviews.length > 1 && (
          <div className="flex shrink-0 gap-2">
            <button type="button" onClick={() => step(-1)} disabled={edge.start} aria-label="Previous reviews" className={arrowClass}>
              <ChevronLeft className="size-4" />
            </button>
            <button type="button" onClick={() => step(1)} disabled={edge.end} aria-label="Next reviews" className={arrowClass}>
              <ChevronRight className="size-4" />
            </button>
          </div>
        )}
      </div>

      <ul
        ref={track}
        onScroll={update}
        aria-label="Guest reviews"
        className="-mx-4 mt-4 flex snap-x snap-mandatory scroll-px-4 gap-4 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:mx-0 sm:scroll-px-0 sm:px-0 [&::-webkit-scrollbar]:hidden"
      >
        {reviews.map((review) => (
          <li
            key={`${review.name}-${review.date}`}
            className="flex w-[85%] shrink-0 snap-start flex-col rounded-md border border-neutral-200/70 bg-white p-4 sm:w-[calc(50%-0.5rem)] sm:p-5"
          >
            <div className="flex items-center gap-3">
              {review.avatar ? (
                // eslint-disable-next-line @next/next/no-img-element -- remote avatar placeholder
                <img
                  src={`https://i.pravatar.cc/80?img=${review.avatar}`}
                  alt=""
                  loading="lazy"
                  className="size-10 rounded-full object-cover shadow ring-2 ring-white"
                />
              ) : (
                <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-sky-100 text-sm font-bold text-sky-700 shadow ring-2 ring-white">
                  {initials(review.name)}
                </span>
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-neutral-900">{review.name}</p>
                <p className="truncate text-xs text-neutral-500">
                  {review.location.split(",")[0]} &middot; {format(new Date(review.date), "MMM yyyy")}
                </p>
              </div>
            </div>
            <div className="mt-3">
              <Stars rating={review.rating} size="size-3.5" />
            </div>
            <p className="mt-2 line-clamp-4 text-sm leading-relaxed text-neutral-700">&ldquo;{review.comment}&rdquo;</p>
            {review.reply && (
              <p className="mt-3 line-clamp-3 rounded-md bg-sky-50 p-3 text-xs leading-relaxed text-sky-900">
                <span className="font-semibold">Hotel reply:</span> {review.reply}
              </p>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
