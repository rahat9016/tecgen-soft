import { Suspense } from "react";
import MessagesInbox from "@/src/components/hotel/admin/MessagesInbox";

export default function HotelAdminMessagesPage() {
  return (
    <Suspense>
      <MessagesInbox />
    </Suspense>
  );
}
