"use client";

import { useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { toast } from "react-toastify";
import { Check, EyeOff, MessageSquareReply, Star, Trash2 } from "lucide-react";
import { initials } from "@/src/lib/hotel-store/format";
import { deleteReview, saveReview, setReviewStatus, useHotelDB } from "@/src/lib/hotel-store/store";
import type { Review } from "@/src/lib/hotel-store/types";
import { useT } from "@/src/lib/hotel-store/i18n";
import { cn } from "@/src/lib/utils";
import { ADMIN, Card, Empty, hbtn, textareaClass } from "./ui";

const statusTone: Record<Review["status"], { label: string; tone: string }> = {
  pending: { label: "To approve", tone: "bg-violet-50 text-violet-700 ring-violet-200" },
  published: { label: "Published", tone: "bg-emerald-50 text-emerald-700 ring-emerald-200" },
  hidden: { label: "Hidden", tone: "bg-neutral-100 text-neutral-600 ring-neutral-200" },
};

function ReviewCard({ review }: { review: Review }) {
  const t = useT();
  const db = useHotelDB();
  const [reply, setReply] = useState(review.reply ?? "");
  const [replying, setReplying] = useState(false);
  const room = db.roomTypes.find((t) => t.id === review.roomId);
  const booking = db.bookings.find((b) => b.id === review.bookingId);

  return (
    <Card className={cn("p-4 sm:p-5", review.status === "pending" && "border-violet-200")}>
      <div className="flex items-start gap-3">
        {review.avatar ? (
          // eslint-disable-next-line @next/next/no-img-element -- avatar
          <img src={`https://i.pravatar.cc/80?img=${review.avatar}`} alt="" className="size-10 rounded-full object-cover" />
        ) : (
          <span className="flex size-10 items-center justify-center rounded-full bg-sky-100 text-sm font-bold text-sky-800">{initials(review.name)}</span>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <p className="truncate font-semibold text-neutral-900">{review.name}</p>
            <span className={cn("shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1 ring-inset", statusTone[review.status].tone)}>{t(statusTone[review.status].label)}</span>
          </div>
          <div className="mt-0.5 flex gap-0.5" aria-label={`${review.rating}/5`}>
            {Array.from({ length: 5 }, (_, i) => (
              <Star key={i} className={cn("size-3.5", i < review.rating ? "fill-sky-500 text-sky-500" : "fill-neutral-200 text-neutral-200")} />
            ))}
          </div>
          <p className="mt-1 text-xs text-neutral-500">
            {room?.name ?? t("Room")} · {format(new Date(`${review.date}T00:00`), "dd MMM yyyy")}
            {booking && (
              <>
                {" · "}
                <Link href={`${ADMIN}/bookings/${booking.id}`} className="font-medium text-sky-700 hover:underline">
                  {booking.code}
                </Link>
              </>
            )}
          </p>
        </div>
      </div>
      <p className="mt-3 text-sm leading-relaxed text-neutral-700">&ldquo;{review.comment}&rdquo;</p>
      {review.reply && !replying && (
        <p className="mt-3 rounded-md bg-sky-50 p-3 text-xs text-sky-900">
          <b>{t("Hotel reply")}:</b> {review.reply}
        </p>
      )}
      {replying && (
        <div className="mt-3">
          <textarea value={reply} onChange={(e) => setReply(e.target.value)} rows={2} placeholder={t("Thank the guest or respond to their feedback")} className={textareaClass} />
          <div className="mt-2 flex justify-end gap-2">
            <button onClick={() => setReplying(false)} className={hbtn.small}>
              {t("Cancel")}
            </button>
            <button
              onClick={() => {
                saveReview({ ...review, reply: reply.trim() || undefined });
                setReplying(false);
                toast.success(t("Reply saved"));
              }}
              className={cn(hbtn.small, "border-sky-600 bg-sky-600 text-white hover:text-white")}
            >
              {t("Save reply")}
            </button>
          </div>
        </div>
      )}
      <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-neutral-100 pt-3">
        {review.status !== "published" && (
          <button
            onClick={() => {
              setReviewStatus(review.id, "published");
              toast.success(t("Review published on the website"));
            }}
            className={cn(hbtn.small, "border-emerald-200 text-emerald-700")}
          >
            <Check className="size-3.5" /> {t("Publish")}
          </button>
        )}
        {review.status !== "hidden" && (
          <button onClick={() => setReviewStatus(review.id, "hidden")} className={hbtn.small}>
            <EyeOff className="size-3.5" /> {t("Hide")}
          </button>
        )}
        <button onClick={() => setReplying(true)} className={hbtn.small}>
          <MessageSquareReply className="size-3.5" /> {review.reply ? t("Edit reply") : t("Reply")}
        </button>
        <button
          onClick={() => {
            if (!confirm(t("Delete this review permanently?"))) return;
            deleteReview(review.id);
            toast.success(t("Review deleted"));
          }}
          aria-label={t("Delete")}
          className={cn(hbtn.small, "ml-auto hover:border-rose-300 hover:text-rose-600")}
        >
          <Trash2 className="size-3.5" /> <span className="hidden sm:inline">{t("Delete")}</span>
        </button>
      </div>
    </Card>
  );
}

/** Every review in one list: ones waiting for approval first, then published, then hidden — newest first within each. */
export default function ReviewsManager() {
  const db = useHotelDB();
  const rank = { pending: 0, published: 1, hidden: 2 } as const;
  const list = [...db.reviews].sort((a, b) => rank[a.status] - rank[b.status] || b.date.localeCompare(a.date));

  if (!list.length)
    return (
      <Card>
        <Empty icon={Star} title="No reviews yet" />
      </Card>
    );

  return (
    <div className="grid gap-2.5 sm:gap-4 lg:grid-cols-2">
      {list.map((r) => (
        <ReviewCard key={r.id} review={r} />
      ))}
    </div>
  );
}
