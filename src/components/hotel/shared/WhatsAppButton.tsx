"use client";

import { MessageCircle } from "lucide-react";
import { useHotelDB } from "@/src/lib/hotel-store/store";

export default function WhatsAppButton() {
  const { whatsapp } = useHotelDB().content.hotel;
  if (!whatsapp) return null;
  return (
    <a
      href={`https://wa.me/${whatsapp.replace(/\D/g, "")}`}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-4 z-50 flex print:hidden items-center gap-2 rounded-md bg-emerald-500 py-2 pl-3 pr-4 text-xs font-semibold text-white shadow-lg hover:bg-emerald-600 md:right-6 [body:has([data-booking-bar])_&]:bottom-24 lg:[body:has([data-booking-bar])_&]:bottom-6"
    >
      <MessageCircle className="size-5 shrink-0" />
      <span className="hidden sm:inline">Chat with us on WhatsApp</span>
    </a>
  );
}
