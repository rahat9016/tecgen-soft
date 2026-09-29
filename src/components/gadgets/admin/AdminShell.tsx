"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  CalendarClock,
  ExternalLink,
  FolderTree,
  LayoutDashboard,
  Menu,
  MessageSquare,
  Package,
  ReceiptText,
  RotateCcw,
  ShoppingCart,
  Tags,
  Users,
  X,
} from "lucide-react";
import { toast } from "react-toastify";
import { resetDemoData, useGadgetDB, useHydrated } from "@/src/lib/gadget-store/store";
import { cn } from "@/src/lib/utils";
import { PageLoader } from "../shared";

const nav = [
  { href: "/gadgets/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/gadgets/admin/orders", label: "Orders", icon: ShoppingCart, badge: "orders" as const },
  { href: "/gadgets/admin/pre-orders", label: "Pre-orders", icon: CalendarClock },
  { href: "/gadgets/admin/chat", label: "Customer Chat", icon: MessageSquare, badge: "chat" as const },
  { href: "/gadgets/admin/cash-memo", label: "Cash Memo", icon: ReceiptText },
  { href: "/gadgets/admin/accounts", label: "Accounts", icon: BarChart3 },
  { section: "Catalog" },
  { href: "/gadgets/admin/products", label: "Products", icon: Package },
  { href: "/gadgets/admin/categories", label: "Categories", icon: FolderTree },
  { href: "/gadgets/admin/brands", label: "Brands", icon: Tags },
  { href: "/gadgets/admin/customers", label: "Customers", icon: Users },
] as const;

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const db = useGadgetDB();
  const hydrated = useHydrated();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const badges = {
    orders: db.orders.filter((o) => o.status === "pending").length,
    chat: db.chats.reduce((s, t) => s + t.adminUnread, 0),
  };

  const sidebar = (
    <nav className="flex h-full flex-col">
      <Link href="/gadgets/admin" className="flex items-center gap-2 px-5 py-5">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/gadgets/logo-horizontal-light.webp" alt="gadgethub" className="h-8 w-auto" />
      </Link>
      <p className="px-5 text-[10px] font-semibold uppercase tracking-[0.2em] text-neutral-500">Admin Panel</p>
      <ul className="mt-4 flex-1 space-y-0.5 overflow-y-auto px-3">
        {nav.map((item) => {
          if ("section" in item) {
            return (
              <li key={item.section} className="px-3 pb-1 pt-5 text-[10px] font-semibold uppercase tracking-[0.2em] text-neutral-500">
                {item.section}
              </li>
            );
          }
          const Icon = item.icon;
          const active = item.href === "/gadgets/admin" ? pathname === item.href : pathname.startsWith(item.href);
          const count = "badge" in item && hydrated ? badges[item.badge] : 0;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition",
                  active ? "bg-orange-500 font-semibold text-white" : "text-neutral-300 hover:bg-white/5 hover:text-white"
                )}
              >
                <Icon className="size-4" />
                {item.label}
                {count > 0 && (
                  <span
                    className={cn(
                      "ml-auto rounded-full px-1.5 text-[10px] font-bold",
                      active ? "bg-white text-orange-600" : "bg-orange-500 text-white"
                    )}
                  >
                    {count}
                  </span>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
      <div className="space-y-1 border-t border-white/10 p-3">
        <Link
          href="/gadgets"
          className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-neutral-300 hover:bg-white/5 hover:text-white"
        >
          <ExternalLink className="size-4" /> View store
        </Link>
        <button
          onClick={() => {
            if (confirm("Reset all demo data (orders, products, memos, chats) to the original sample?")) {
              resetDemoData();
              toast.success("Demo data reset");
            }
          }}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm text-neutral-300 hover:bg-white/5 hover:text-white"
        >
          <RotateCcw className="size-4" /> Reset demo data
        </button>
      </div>
    </nav>
  );

  return (
    <div className="min-h-screen bg-neutral-50">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 bg-neutral-950 lg:block print:hidden">{sidebar}</aside>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden print:hidden">
          <button aria-label="Close menu" className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-64 bg-neutral-950">
            <button onClick={() => setOpen(false)} aria-label="Close menu" className="absolute right-3 top-5 text-white">
              <X className="size-5" />
            </button>
            {sidebar}
          </aside>
        </div>
      )}

      <div className="min-w-0 lg:pl-64 print:pl-0">
        <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-neutral-200 bg-white/90 px-4 backdrop-blur md:px-8 print:hidden">
          <button onClick={() => setOpen(true)} aria-label="Open menu" className="lg:hidden">
            <Menu className="size-6" />
          </button>
          <p className="hidden text-sm text-neutral-500 sm:block">Demo admin · data is stored in this browser</p>
          <div className="ml-auto flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold text-neutral-900">Store Admin</p>
              <p className="text-xs text-neutral-500">admin@gadgethub.com.bd</p>
            </div>
            <span className="flex size-9 items-center justify-center rounded-full bg-orange-500 text-sm font-bold text-white">A</span>
          </div>
        </header>
        <main className="p-4 md:p-8 print:p-0">{hydrated ? children : <PageLoader />}</main>
      </div>
    </div>
  );
}
