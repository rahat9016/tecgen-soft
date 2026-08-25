import { MessageCircle } from "lucide-react";

export default function WhatsAppButton() {
  return (
    <a
      href="https://wa.me/8801880982822"
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-4 z-50 flex items-center gap-2 rounded-full bg-emerald-500 py-2 pl-3 pr-4 text-xs font-semibold text-white shadow-lg hover:bg-emerald-600 md:right-6"
    >
      <MessageCircle className="size-5 shrink-0" />
      <span className="hidden sm:inline">Chat with us on WhatsApp</span>
    </a>
  );
}
