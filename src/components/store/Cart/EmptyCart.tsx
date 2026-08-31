import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { Button } from "@/src/components/ui/button";

export default function EmptyCart() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <span className="flex size-20 items-center justify-center rounded-full bg-neutral-100 text-neutral-400">
        <ShoppingCart className="size-9" />
      </span>
      <h2 className="mt-6 text-lg font-semibold text-neutral-800">Your cart is empty</h2>
      <p className="mt-1 text-sm text-neutral-500">
        You haven&apos;t added any products to your cart yet. Start shopping now.
      </p>
      <Button asChild className="mt-6 bg-emerald-800 hover:bg-emerald-900 text-white">
        <Link href="/ecommerce#products">Start Shopping</Link>
      </Button>
    </div>
  );
}
