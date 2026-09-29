"use client";

import Link from "next/link";
import { Heart } from "lucide-react";
import { useGadgetDB } from "@/src/lib/gadget-store/store";
import GadgetCard from "@/src/components/gadgets/GadgetCard";
import { EmptyState } from "@/src/components/gadgets/shared";

export default function WishlistPage() {
  const db = useGadgetDB();
  const items = db.products.filter((p) => db.wishlist.includes(p.id));

  return (
    <div>
      <h1 className="text-2xl font-bold text-neutral-900">Wishlist</h1>
      {items.length ? (
        <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
          {items.map((p) => (
            <GadgetCard key={p.id} item={p} />
          ))}
        </div>
      ) : (
        <div className="mt-5">
          <EmptyState
            icon={Heart}
            title="Your wishlist is empty"
            text="Tap the heart on any product to save it here."
            action={
              <Link href="/gadgets/shop" className="rounded-full bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white">
                Browse gadgets
              </Link>
            }
          />
        </div>
      )}
    </div>
  );
}
