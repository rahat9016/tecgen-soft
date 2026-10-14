"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { Bell, BellOff, CalendarCheck, CheckCheck, KeyRound, LogOut, Moon, UserRound, Wallet } from "lucide-react";
import { bdt, formatDateTime, initials, timeAgo } from "@/src/lib/hotel-store/format";
import {
  changePassword,
  guestBookings,
  logOut,
  markNoticesRead,
  paidOf,
  updateProfile,
  useCurrentGuest,
  useHotelDB,
  useHydrated,
  useNow,
  useSession,
} from "@/src/lib/hotel-store/store";
import type { User } from "@/src/lib/hotel-store/types";

const inputClass =
  "h-11 w-full rounded-md border border-neutral-200 bg-white px-3.5 text-sm outline-none transition placeholder:text-neutral-400 focus:border-sky-400 focus:ring-4 focus:ring-sky-100";

function Panel({ title, icon: Icon, children, id }: { title: string; icon: typeof Bell; children: React.ReactNode; id?: string }) {
  return (
    <section id={id} className="scroll-mt-24 rounded-md border border-neutral-200/80 bg-white p-5 shadow-sm md:p-6">
      <h2 className="flex items-center gap-2 font-bold text-neutral-900">
        <span className="flex size-8 items-center justify-center rounded-md bg-sky-50 text-sky-600">
          <Icon className="size-4" />
        </span>
        {title}
      </h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function ProfileForm({ user }: { user: User }) {
  const [profile, setProfile] = useState({ name: user.name, phone: user.phone, country: user.country ?? "" });
  const saveProfile = (e: FormEvent) => {
    e.preventDefault();
    const result = updateProfile(user.id, { name: profile.name, phone: profile.phone, country: profile.country || undefined });
    if (result.ok) toast.success("Profile saved");
    else toast.error(result.error);
  };
  return (
    <form onSubmit={saveProfile} className="space-y-3">
      <label className="block">
        <span className="mb-1 block text-xs font-medium text-neutral-600">Full name</span>
        <input value={profile.name} onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))} className={inputClass} />
      </label>
      <label className="block">
        <span className="mb-1 block text-xs font-medium text-neutral-600">Mobile number</span>
        <input value={profile.phone} onChange={(e) => setProfile((p) => ({ ...p, phone: e.target.value }))} className={inputClass} />
      </label>
      <label className="block">
        <span className="mb-1 block text-xs font-medium text-neutral-600">Country</span>
        <input value={profile.country} onChange={(e) => setProfile((p) => ({ ...p, country: e.target.value }))} className={inputClass} />
      </label>
      <button className="h-10 w-full rounded-md bg-sky-600 text-sm font-semibold text-white hover:bg-sky-700">Save profile</button>
    </form>
  );
}

export default function GuestAccount() {
  const router = useRouter();
  const db = useHotelDB();
  const ses = useSession();
  const user = useCurrentGuest();
  const hydrated = useHydrated();
  const now = useNow(60_000);
  const [pw, setPw] = useState({ current: "", next: "" });

  useEffect(() => {
    if (hydrated && !user) router.replace("/hotel-management/login?next=/hotel-management/account");
  }, [hydrated, user, router]);

  if (!user) return null;

  const bookings = guestBookings(db, ses, user);
  const stays = bookings.filter((b) => b.status === "checked-out");
  const upcoming = bookings.filter((b) => b.status === "confirmed" || b.status === "pending" || b.status === "checked-in");
  const spent = bookings.reduce((s, b) => s + Math.max(0, paidOf(b)), 0);
  const notices = db.notices.filter((n) => n.to === user.id);
  const unread = notices.filter((n) => !n.read).length;

  const savePassword = (e: FormEvent) => {
    e.preventDefault();
    const result = changePassword(user.id, pw.current, pw.next);
    if (!result.ok) return toast.error(result.error);
    setPw({ current: "", next: "" });
    toast.success("Password changed");
  };

  return (
    <div className="container py-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <span className="flex size-14 items-center justify-center rounded-md bg-gradient-to-br from-sky-500 to-sky-700 text-lg font-bold text-white shadow-lg">
            {initials(user.name)}
          </span>
          <div>
            <h1 className="text-2xl font-bold text-neutral-900">{user.name}</h1>
            <p className="text-sm text-neutral-500">
              {user.email} · member since {new Date(user.createdAt).toLocaleDateString("en-GB", { month: "long", year: "numeric" })}
            </p>
          </div>
        </div>
        <button
          onClick={() => {
            logOut("guest");
            router.push("/hotel-management");
          }}
          className="flex items-center gap-2 rounded-md border border-neutral-200 px-4 py-2 text-sm font-medium text-neutral-700 hover:border-rose-200 hover:text-rose-600"
        >
          <LogOut className="size-4" /> Log out
        </button>
      </div>

      <div className="mt-6 grid grid-cols-3 gap-3">
        {[
          { icon: CalendarCheck, label: "Upcoming", value: upcoming.length },
          { icon: Moon, label: "Stays", value: stays.length },
          { icon: Wallet, label: "Paid", value: bdt(spent) },
        ].map(({ icon: Icon, label, value }) => (
          <Link key={label} href="/hotel-management/my-bookings" className="rounded-md border border-neutral-200/80 bg-white p-4 transition hover:border-sky-200">
            <Icon className="size-5 text-sky-600" />
            <p className="mt-2 text-xl font-bold text-neutral-900">{value}</p>
            <p className="text-xs text-neutral-500">{label}</p>
          </Link>
        ))}
      </div>

      <div className="mt-6 grid items-start gap-5 lg:grid-cols-[1fr_380px]">
        <Panel title={`Notifications${unread ? ` (${unread} new)` : ""}`} icon={Bell} id="notifications">
          {notices.length === 0 ? (
            <p className="flex items-center gap-2 py-8 text-sm text-neutral-500">
              <BellOff className="size-4" /> Nothing yet — updates about your bookings will show up here.
            </p>
          ) : (
            <>
              {unread > 0 && (
                <button onClick={() => markNoticesRead(user.id)} className="mb-3 flex items-center gap-1.5 text-xs font-semibold text-sky-700 hover:underline">
                  <CheckCheck className="size-3.5" /> Mark all as read
                </button>
              )}
              <ul className="divide-y divide-neutral-100">
                {notices.map((n) => {
                  const b = db.bookings.find((x) => x.id === n.bookingId);
                  return (
                    <li key={n.id} className="flex gap-3 py-3">
                      <span className={`mt-1.5 size-2 shrink-0 rounded-full ${n.read ? "bg-neutral-200" : "bg-sky-500"}`} />
                      <div className="min-w-0 flex-1">
                        <p className={`text-sm ${n.read ? "text-neutral-700" : "font-semibold text-neutral-900"}`}>{n.title}</p>
                        <p className="text-sm text-neutral-500">{n.body}</p>
                        <p className="mt-1 text-xs text-neutral-400" title={formatDateTime(n.at)}>
                          {timeAgo(n.at, now || undefined)}
                          {b && (
                            <>
                              {" · "}
                              <Link
                                href={`/hotel-management/booking-success?bookingId=${b.code}`}
                                onClick={() => markNoticesRead(user.id, [n.id])}
                                className="font-semibold text-sky-700 hover:underline"
                              >
                                View {b.code}
                              </Link>
                            </>
                          )}
                        </p>
                      </div>
                      {!n.read && (
                        <button onClick={() => markNoticesRead(user.id, [n.id])} className="self-start text-xs text-neutral-400 hover:text-sky-700">
                          Mark read
                        </button>
                      )}
                    </li>
                  );
                })}
              </ul>
            </>
          )}
        </Panel>

        <div className="space-y-5">
          <Panel title="Profile" icon={UserRound}>
            <ProfileForm key={user.id} user={user} />
          </Panel>

          <Panel title="Password" icon={KeyRound}>
            <form onSubmit={savePassword} className="space-y-3">
              <input type="password" autoComplete="current-password" placeholder="Current password" value={pw.current} onChange={(e) => setPw((p) => ({ ...p, current: e.target.value }))} className={inputClass} />
              <input type="password" autoComplete="new-password" placeholder="New password (6+ characters)" value={pw.next} onChange={(e) => setPw((p) => ({ ...p, next: e.target.value }))} className={inputClass} />
              <button className="h-10 w-full rounded-md border border-neutral-200 text-sm font-semibold text-neutral-700 hover:border-sky-300 hover:text-sky-700">
                Change password
              </button>
            </form>
          </Panel>
        </div>
      </div>
    </div>
  );
}
