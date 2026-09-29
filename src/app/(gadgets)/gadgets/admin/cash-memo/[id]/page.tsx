import { Suspense } from "react";
import MemoView from "@/src/components/gadgets/admin/MemoView";

export default async function CashMemoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <Suspense>
      <MemoView id={id} />
    </Suspense>
  );
}
