import { format } from "date-fns";
import { Star } from "lucide-react";
import type { HotelReview } from "@/src/data/hotels";
import { ratingLabel } from "@/src/components/hotel/shared/ratingLabel";

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

export default function ReviewsSection({
  reviews,
  rating,
  reviewsCount,
}: {
  reviews: HotelReview[];
  rating: number;
  reviewsCount: number;
}) {
  return (
    <div>
      <div className="flex items-center gap-4 rounded-2xl bg-sky-950 p-5 text-white">
        <span className="flex size-16 shrink-0 items-center justify-center rounded-2xl rounded-bl-none bg-white text-2xl font-extrabold text-sky-950">
          {rating.toFixed(1)}
        </span>
        <div>
          <p className="text-lg font-bold">{ratingLabel(rating)}</p>
          <div className="mt-1">
            <Stars rating={rating} size="size-4" />
          </div>
          <p className="mt-1 text-xs text-sky-200">Based on {reviewsCount.toLocaleString()} guest reviews</p>
        </div>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        {reviews.map((review) => (
          <article
            key={review.name}
            className="flex flex-col rounded-2xl border border-neutral-200/70 bg-white p-5"
          >
            <div className="flex items-center gap-3">
              <img
                src={`https://i.pravatar.cc/80?img=${review.avatar}`}
                alt={review.name}
                className="size-10 rounded-full object-cover ring-2 ring-white shadow"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-neutral-900">{review.name}</p>
                <p className="truncate text-xs text-neutral-500">
                  {review.location} &middot; {format(new Date(review.date), "MMM yyyy")}
                </p>
              </div>
            </div>
            <div className="mt-3">
              <Stars rating={review.rating} size="size-3.5" />
            </div>
            <p className="mt-2 text-sm leading-relaxed text-neutral-700">&ldquo;{review.comment}&rdquo;</p>
          </article>
        ))}
      </div>
    </div>
  );
}
