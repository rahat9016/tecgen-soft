"use client";

import { useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { toast } from "react-toastify";
import { Check, EyeOff, MessageSquareReply, Star, Trash2 } from "lucide-react";
import { initials } from "@/src/lib/hotel-store/format";
import { deleteReview, saveReview, setReviewStatus, useHotelDB } from "@/src/lib/hotel-store/store";
import type { Review, ReviewStatus } from "@/src/lib/hotel-store/types";
import { cn } from "@/src/lib/utils";
import { ADMIN, AdminHeader, Card, Empty, hbtn, Tabs, textareaClass } from "./ui";

function ReviewCard({ review }: { review: Review }) {
  const db = useHotelDB();
  const [reply, setReply] = useState(review.reply ?? "");
  const [replying, setReplying] = useState(false);
  const room = db.roomTypes.find((t) => t.id === review.roomId);
  const booking = db.bookings.find((b) => b.id === review.bookingId);

  return (
    <Card>
      <div className="flex flex-wrap items-start gap-3">
        {review.avatar ? (
          // eslint-disable-next-line @next/next/no-img-element -- avatar
          <img src={`https://i.pravatar.cc/80?img=${review.avatar}`} alt="" className="size-10 rounded-full object-cover" />
        ) : (
          <span className="flex size-10 items-center justify-center rounded-full bg-sky-100 text-sm font-bold text-sky-800">{initials(review.name)}</span>
        )}
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-neutral-900">{review.name}</p>
          <p className="text-xs text-neutral-500">
            {review.location || "—"} · {room?.name ?? "Room"} · {format(new Date(`${review.date}T00:00`), "dd MMM yyyy")}
            {booking && (
              <>
                {" · "}
                <Link href={`${ADMIN}/bookings/${booking.id}`} className="font-medium text-sky-700 hover:underline">
                  {booking.code}
                </Link>{" "}
                <span className="text-emerald-700">verified stay</span>
              </>
            )}
          </p>
        </div>
        <div className="flex gap-0.5" aria-label={`${review.rating} out of 5`}>
          {Array.from({ length: 5 }, (_, i) => (
            <Star key={i} className={cn("size-4", i < review.rating ? "fill-amber-400 text-amber-400" : "fill-neutral-200 text-neutral-200")} />
          ))}
        </div>
      </div>
      <p className="mt-3 text-sm leading-relaxed text-neutral-700">&ldquo;{review.comment}&rdquo;</p>
      {review.reply && !replying && (
        <p className="mt-3 rounded-md bg-sky-50 p-3 text-xs text-sky-900">
          <b>Hotel reply:</b> {review.reply}
        </p>
      )}
      {replying && (
        <div className="mt-3">
          <textarea value={reply} onChange={(e) => setReply(e.target.value)} rows={2} placeholder="Thank the guest or respond to their feedback" className={textareaClass} />
          <div className="mt-2 flex justify-end gap-2">
            <button onClick={() => setReplying(false)} className={hbtn.small}>
              Cancel
            </button>
            <button
              onClick={() => {
                saveReview({ ...review, reply: reply.trim() || undefined });
                setReplying(false);
                toast.success("Reply saved");
              }}
              className={cn(hbtn.small, "border-sky-600 bg-sky-600 text-white hover:text-white")}
            >
              Save reply
            </button>
          </div>
        </div>
      )}
      <div className="mt-4 flex flex-wrap gap-2">
        {review.status !== "published" && (
          <button
            onClick={() => {
              setReviewStatus(review.id, "published");
              toast.success("Review published on the website");
            }}
            className={cn(hbtn.small, "border-emerald-200 text-emerald-700")}
          >
            <Check className="size-3.5" /> Publish
          </button>
        )}
        {review.status !== "hidden" && (
          <button onClick={() => setReviewStatus(review.id, "hidden")} className={hbtn.small}>
            <EyeOff className="size-3.5" /> Hide
          </button>
        )}
        <button onClick={() => setReplying(true)} className={hbtn.small}>
          <MessageSquareReply className="size-3.5" /> {review.reply ? "Edit reply" : "Reply"}
        </button>
        <button
          onClick={() => {
            if (!confirm("Delete this review permanently?")) return;
            deleteReview(review.id);
            toast.success("Review deleted");
          }}
          className={cn(hbtn.small, "ml-auto hover:border-rose-300 hover:text-rose-600")}
        >
          <Trash2 className="size-3.5" /> Delete
        </button>
      </div>
    </Card>
  );
}

export default function ReviewsManager() {
  const db = useHotelDB();
  const [tab, setTab] = useState<ReviewStatus>(db.reviews.some((r) => r.status === "pending") ? "pending" : "published");
  const list = db.reviews.filter((r) => r.status === tab).sort((a, b) => b.date.localeCompare(a.date));
  const published = db.reviews.filter((r) => r.status === "published");
  const avg = published.length ? published.reduce((s, r) => s + r.rating, 0) / published.length : 0;

  return (
    <div>
      <AdminHeader title="Reviews" subtitle={`${published.length} published · average ${avg.toFixed(1)}★ · guests can review after check-out`} />
      <div className="overflow-hidden rounded-md border border-neutral-200 bg-white">
        <Tabs
          value={tab}
          onChange={setTab}
          tabs={(["pending", "published", "hidden"] as const).map((s) => ({
            value: s,
            label: s === "pending" ? "To approve" : s === "published" ? "Published" : "Hidden",
            count: db.reviews.filter((r) => r.status === s).length,
            dot: s === "pending" && db.reviews.some((r) => r.status === "pending") ? "bg-amber-400" : undefined,
          }))}
        />
      </div>
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        {list.map((r) => (
          <ReviewCard key={r.id} review={r} />
        ))}
      </div>
      {list.length === 0 && (
        <Card className="mt-4">
          <Empty icon={Star} title={tab === "pending" ? "No reviews waiting" : "Nothing here"} />
        </Card>
      )}
    </div>
  );
}
