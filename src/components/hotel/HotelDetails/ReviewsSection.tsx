import { Star } from "lucide-react";
import type { HotelReview } from "@/src/data/hotels";

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
      <div className="flex items-center gap-3">
        <span className="flex size-12 items-center justify-center rounded-lg bg-sky-700 text-lg font-bold text-white">
          {rating}
        </span>
        <div>
          <div className="flex gap-0.5 text-amber-400">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`size-4 ${i < Math.round(rating) ? "fill-amber-400" : "fill-neutral-200 text-neutral-200"}`}
              />
            ))}
          </div>
          <p className="text-xs text-neutral-500">Based on {reviewsCount} reviews</p>
        </div>
      </div>

      <div className="mt-5 space-y-4">
        {reviews.map((review) => (
          <div key={review.name} className="rounded-xl border border-neutral-100 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <img
                  src={`https://i.pravatar.cc/64?img=${review.avatar}`}
                  alt={review.name}
                  className="size-9 rounded-full object-cover"
                />
                <div>
                  <p className="text-sm font-semibold text-neutral-900">{review.name}</p>
                  <p className="text-xs text-neutral-500">{review.location}</p>
                </div>
              </div>
              <div className="flex gap-0.5 text-amber-400">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`size-3.5 ${i < review.rating ? "fill-amber-400" : "fill-neutral-200 text-neutral-200"}`}
                  />
                ))}
              </div>
            </div>
            <p className="mt-2 text-sm text-neutral-600">{review.comment}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
