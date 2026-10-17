"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useFormContext, useFormState, useWatch } from "react-hook-form";
import {
  AlertTriangle,
  Ban,
  Search,
  UserCheck,
  UserPlus,
  UserRound,
  X,
} from "lucide-react";
import { dateLabel, initials, taka } from "@/src/lib/hotel-store/format";
import {
  findGuestMatch,
  guestStats,
  useHotelDB,
} from "@/src/lib/hotel-store/store";
import type { User } from "@/src/lib/hotel-store/types";
import { cn } from "@/src/lib/utils";
import { ADMIN, hbtn, inputClass } from "../ui";
import { FieldError, Section, Segmented } from "./parts";
import GuestFields from "./GuestFields";
import {
  composeGuest,
  emptyGuest,
  guestFromUser,
  type BookingFormValues,
  type GuestMode,
} from "./schema";

const looksLikePhone = (q: string) => /^[+\d][\d\s-]{4,}$/.test(q.trim());

export default function GuestSection({ step }: { step: number }) {
  const db = useHotelDB();
  const { control, setValue, register } = useFormContext<BookingFormValues>();
  const { isSubmitted } = useFormState({ control });
  const [mode, userId, guest] = useWatch({
    control,
    name: ["guestMode", "userId", "guest"],
  });
  const [query, setQuery] = useState("");
  const user = userId ? db.users.find((u) => u.id === userId) : undefined;

  const opts = { shouldDirty: true, shouldValidate: isSubmitted };

  const matches = useMemo(() => {
    const n = query.trim().toLowerCase();
    if (n.length < 2) return [];
    const digits = n.replace(/\D/g, "");
    const byCode = db.bookings.find((b) => b.code.toLowerCase() === n)?.userId;
    return db.users
      .filter((u) => u.role === "guest")
      .filter(
        (u) =>
          u.id === byCode ||
          u.name.toLowerCase().includes(n) ||
          u.email.includes(n) ||
          (digits.length >= 3 && u.phone.replace(/\D/g, "").includes(digits))
      )
      .slice(0, 6);
  }, [db.users, db.bookings, query]);

  // A "new" guest whose phone or email is already on file.
  const composed = composeGuest(guest);
  const duplicate = mode === "new" ? findGuestMatch(db, composed) : undefined;
  const duplicateVia =
    duplicate &&
    guest.email.trim() &&
    duplicate.email === guest.email.trim().toLowerCase()
      ? "email"
      : "phone number";

  const pick = (u: User) => {
    const last = guestStats(db, u.id).lastId;
    setValue("guestMode", "returning", opts);
    setValue("userId", u.id, opts);
    setValue("guest", guestFromUser(u, last), opts);
    setValue("updateProfile", false);
    setQuery("");
  };

  const switchMode = (m: GuestMode) => {
    if (m === mode) return;
    setValue("guestMode", m, opts);
    setValue("userId", "", opts);
    setValue("updateProfile", false);
    if (m === "new") {
      // Carry over what staff typed into the search box.
      const q = query.trim();
      setValue(
        "guest",
        {
          ...emptyGuest,
          ...(q &&
            (looksLikePhone(q)
              ? { phone: q }
              : {
                  firstName: q.split(" ")[0],
                  lastName: q.split(" ").slice(1).join(" "),
                })),
        },
        opts
      );
    } else {
      setQuery(guest.phone || `${guest.firstName} ${guest.lastName}`.trim());
      setValue("guest", emptyGuest, opts);
    }
  };

  const clearPick = () => {
    setValue("userId", "", opts);
    setValue("guest", emptyGuest, opts);
  };

  const digitsOf = (p: string) =>
    p
      .replace(/\D/g, "")
      .replace(/^880/, "0")
      .replace(/^(?=1)/, "0");
  const changed = user
    ? [
        composed.name !== user.name.trim() && "name",
        digitsOf(composed.phone) !== digitsOf(user.phone) && "phone",
        (composed.country ?? "") !== (user.country ?? "") && "country",
      ].filter((x): x is string => !!x)
    : [];

  return (
    <Section
      id="guest"
      step={step}
      icon={UserRound}
      title="Guest"
      aside={
        <Segmented
          value={mode}
          onChange={switchMode}
          options={[
            { value: "new", label: "New guest", icon: UserPlus },
            { value: "returning", label: "Returning guest", icon: UserCheck },
          ]}
        />
      }
    >
      {mode === "returning" && !user && (
        <div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-neutral-400" />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name, phone, email or booking code (e.g. TW-1024)"
              className={cn(inputClass, "h-11 pl-9")}
            />
          </div>
          <FieldError name="userId" />

          {query.trim().length >= 2 && (
            <div className="mt-3 overflow-hidden rounded-md border border-neutral-200">
              {matches.length ? (
                <ul className="divide-y divide-neutral-100">
                  {matches.map((u) => {
                    const s = guestStats(db, u.id);
                    return (
                      <li key={u.id}>
                        <button
                          type="button"
                          onClick={() => pick(u)}
                          className="flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-sky-50"
                        >
                          <Avatar
                            name={u.name}
                            blocked={u.status === "blocked"}
                          />
                          <span className="min-w-0 flex-1">
                            <span className="flex items-center gap-2 font-medium text-neutral-900">
                              {u.name}
                              {u.status === "blocked" && (
                                <span className="rounded bg-rose-50 px-1.5 text-[10px] font-semibold text-rose-600">
                                  Blocked
                                </span>
                              )}
                              {s.inHouse && (
                                <span className="rounded bg-emerald-50 px-1.5 text-[10px] font-semibold text-emerald-700">
                                  In house
                                </span>
                              )}
                            </span>
                            <span className="block truncate text-xs text-neutral-500">
                              {u.phone}
                              {u.email && ` · ${u.email}`}
                            </span>
                          </span>
                          <span className="hidden shrink-0 text-right text-xs text-neutral-500 sm:block">
                            <b className="text-neutral-800">{s.stays}</b> stay
                            {s.stays !== 1 ? "s" : ""}
                            <span className="block">
                              {s.last
                                ? `Last ${dateLabel(s.last, "dd MMM yyyy")}`
                                : "No stays yet"}
                            </span>
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-4 text-sm">
                  <span className="text-neutral-500">
                    No guest matches &ldquo;{query.trim()}&rdquo;.
                  </span>
                  <button
                    type="button"
                    onClick={() => switchMode("new")}
                    className={hbtn.small}
                  >
                    <UserPlus className="size-3.5" /> Add as new guest
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {user && <GuestCard user={user} onClear={clearPick} />}

      {duplicate && (
        <div className="mb-4 flex flex-wrap items-center gap-3 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm">
          <AlertTriangle className="size-4 shrink-0 text-amber-600" />
          <span className="min-w-0 flex-1 text-amber-900">
            <b>{duplicate.name}</b> already has a profile with this{" "}
            {duplicateVia}. Use it to keep their stays together.
          </span>
          <button
            type="button"
            onClick={() => pick(duplicate)}
            className={cn(
              hbtn.small,
              "border-amber-300 bg-white text-amber-800"
            )}
          >
            Use existing profile
          </button>
        </div>
      )}

      {(mode === "new" || user) && (
        <div className={cn(user && "mt-5")}>
          <GuestFields />
          {user && changed.length > 0 && (
            <label className="mt-4 flex items-start gap-2 rounded-md bg-sky-50 px-3 py-2.5 text-sm text-sky-900">
              <input
                type="checkbox"
                {...register("updateProfile")}
                className="mt-0.5 size-4 accent-sky-600"
              />
              <span>
                Also update {user.name.split(" ")[0]}&rsquo;s profile with the
                new {changed.join(" and ")}
              </span>
            </label>
          )}
        </div>
      )}
    </Section>
  );
}

function Avatar({
  name,
  blocked,
  large,
}: {
  name: string;
  blocked?: boolean;
  large?: boolean;
}) {
  return (
    <span
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full font-semibold",
        large ? "size-12 text-base" : "size-9 text-xs",
        blocked ? "bg-rose-100 text-rose-700" : "bg-sky-100 text-sky-700"
      )}
    >
      {initials(name)}
    </span>
  );
}

/** The selected returning guest: who they are and their history with the hotel. */
function GuestCard({ user, onClear }: { user: User; onClear: () => void }) {
  const db = useHotelDB();
  const s = guestStats(db, user.id);
  const blocked = user.status === "blocked";
  return (
    <div
      className={cn(
        "rounded-md border p-4",
        blocked
          ? "border-rose-200 bg-rose-50/50"
          : "border-sky-200 bg-sky-50/40"
      )}
    >
      <div className="flex flex-wrap items-start gap-3">
        <Avatar name={user.name} blocked={blocked} large />
        <div className="min-w-0 flex-1">
          <p className="flex flex-wrap items-center gap-2 font-semibold text-neutral-900">
            {user.name}
            <span className="rounded bg-white px-1.5 py-0.5 text-[10px] font-semibold text-sky-700 ring-1 ring-sky-200">
              {s.stays ? "Returning" : "Has profile"}
            </span>
            {user.passwordHash && (
              <span className="rounded bg-white px-1.5 py-0.5 text-[10px] font-semibold text-neutral-600 ring-1 ring-neutral-200">
                Registered
              </span>
            )}
            {s.inHouse && (
              <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-700">
                In house now
              </span>
            )}
          </p>
          <p className="truncate text-sm text-neutral-500">
            {user.phone}
            {user.email && ` · ${user.email}`}
            {user.country && ` · ${user.country}`}
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href={`${ADMIN}/users?guest=${user.id}`}
            target="_blank"
            className={hbtn.small}
          >
            Profile
          </Link>
          <button type="button" onClick={onClear} className={hbtn.small}>
            <X className="size-3.5" /> Change
          </button>
        </div>
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {[
          ["Stays", s.stays],
          ["Nights", s.nights],
          ["Paid to date", taka(s.spent)],
          ["Last stay", s.last ? dateLabel(s.last, "dd MMM yyyy") : "—"],
        ].map(([k, v]) => (
          <div
            key={k}
            className="rounded-md bg-white px-3 py-2 ring-1 ring-neutral-100"
          >
            <dt className="text-[11px] text-neutral-500">{k}</dt>
            <dd className="font-semibold tabular-nums text-neutral-900">{v}</dd>
          </div>
        ))}
      </dl>

      {(blocked || s.noShows > 0 || s.upcoming.length > 0 || user.note) && (
        <div className="mt-3 space-y-1.5 text-xs">
          {blocked && (
            <p className="flex items-center gap-1.5 font-medium text-rose-700">
              <Ban className="size-3.5" /> This guest is blocked. You&rsquo;ll
              be asked to confirm before booking.
            </p>
          )}
          {s.noShows > 0 && (
            <p className="flex items-center gap-1.5 text-amber-700">
              <AlertTriangle className="size-3.5" /> {s.noShows} no-show
              {s.noShows > 1 ? "s" : ""} — consider taking a deposit.
            </p>
          )}
          {s.upcoming.length > 0 && (
            <p className="text-neutral-600">
              Already booked:{" "}
              {s.upcoming.slice(0, 3).map((b, i) => (
                <span key={b.id}>
                  {i > 0 && ", "}
                  <Link
                    href={`${ADMIN}/bookings/${b.id}`}
                    target="_blank"
                    className="font-medium text-sky-700 hover:underline"
                  >
                    {b.code}
                  </Link>{" "}
                  ({dateLabel(b.checkIn, "dd MMM")})
                </span>
              ))}{" "}
              — check this isn&rsquo;t a double booking.
            </p>
          )}
          {user.note && (
            <p className="rounded bg-white px-2 py-1.5 text-neutral-700 ring-1 ring-neutral-100">
              Staff note: {user.note}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
