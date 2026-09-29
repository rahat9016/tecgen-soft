"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, Printer } from "lucide-react";
import { toast } from "react-toastify";
import { recordMemoPayment, useGadgetDB } from "@/src/lib/gadget-store/store";
import { formatTaka, paymentLabels } from "@/src/lib/gadget-store/format";
import Invoice from "./Invoice";
import { btn } from "./kit";

export default function MemoView({ id }: { id: string }) {
  const db = useGadgetDB();
  const params = useSearchParams();
  const memo = db.memos.find((m) => m.id === id);
  const [amount, setAmount] = useState("");
  const autoPrint = params.get("print") === "1";
  const printed = useRef(false);
  const found = !!memo;

  useEffect(() => {
    if (!found || !autoPrint || printed.current) return;
    let cancelled = false;
    // Print only once fonts and the logo have loaded, otherwise the memo prints unstyled.
    const imagesReady = Array.from(document.images).map((img) =>
      img.complete
        ? Promise.resolve()
        : new Promise<void>((resolve) => {
            img.addEventListener("load", () => resolve(), { once: true });
            img.addEventListener("error", () => resolve(), { once: true });
          })
    );
    Promise.all([document.fonts.ready, ...imagesReady]).then(() => {
      if (cancelled || printed.current) return;
      printed.current = true;
      // Drop ?print=1 so a refresh doesn't open the print dialog again.
      window.history.replaceState(null, "", window.location.pathname);
      requestAnimationFrame(() => window.print());
    });
    return () => {
      cancelled = true;
    };
  }, [found, autoPrint]);

  if (!memo) {
    return (
      <p className="text-sm text-neutral-500">
        Memo not found. <Link href="/gadgets/admin/cash-memo" className="text-orange-600">Back</Link>
      </p>
    );
  }

  const due = Math.max(0, memo.total - memo.paid);

  return (
    <>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3 print:hidden">
        <div>
          <Link href="/gadgets/admin/cash-memo" className="flex items-center gap-1 text-sm text-neutral-500 hover:text-orange-600">
            <ArrowLeft className="size-4" /> Cash memos
          </Link>
          <h1 className="mt-2 text-2xl font-bold text-neutral-900">{memo.id}</h1>
          <p className="text-sm text-neutral-500">
            {paymentLabels[memo.paymentMethod]} · sold by {memo.soldBy}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {due > 0 && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const n = Math.round(Number(amount));
                if (!n || n <= 0) return;
                recordMemoPayment(memo.id, n);
                setAmount("");
                toast.success(`Received ${formatTaka(Math.min(n, due))}`);
              }}
              className="flex gap-2"
            >
              <input
                type="number"
                min={1}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder={`Due ${due}`}
                aria-label="Collect due amount"
                className="h-10 w-36 rounded-xl border border-neutral-200 px-3 text-sm outline-none focus:border-orange-400"
              />
              <button className={btn.outline}>Collect due</button>
            </form>
          )}
          <button onClick={() => window.print()} className={btn.dark}>
            <Printer className="size-4" /> Print
          </button>
        </div>
      </div>

      <Invoice
        title="Cash Memo"
        number={memo.id}
        date={memo.createdAt}
        billTo={{ name: memo.customerName, phone: memo.customerPhone }}
        items={memo.items}
        rows={[
          ["Subtotal", memo.subtotal],
          ["Discount", -memo.discount],
        ]}
        total={memo.total}
        paid={memo.paid}
      />
    </>
  );
}
