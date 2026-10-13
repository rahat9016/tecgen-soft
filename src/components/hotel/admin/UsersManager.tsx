"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { format } from "date-fns";
import { toast } from "react-toastify";
import { Download, KeyRound, Pencil, Plus, ShieldCheck, UserRound, Users } from "lucide-react";
import { can, staffRoles } from "@/src/lib/hotel-store/auth";
import { downloadCsv, initials, rangeLabel, roleLabels, taka } from "@/src/lib/hotel-store/format";
import { paidOf, saveStaff, setUserStatus, updateGuestProfile, useCurrentStaff, useHotelDB, type StaffInput } from "@/src/lib/hotel-store/store";
import type { HotelDB, StaffRole, User } from "@/src/lib/hotel-store/types";
import { cn } from "@/src/lib/utils";
import { ADMIN, AdminHeader, Drawer, Empty, Field, hbtn, inputClass, Modal, Pager, SearchBox, Select, StatusBadge, tableCardClass, Tabs, textareaClass, toolbarClass, usePagination } from "./ui";

const guestStats = (db: HotelDB, u: User) => {
  const bookings = db.bookings.filter((b) => b.userId === u.id).sort((a, b) => b.checkIn.localeCompare(a.checkIn));
  const stays = bookings.filter((b) => b.status === "checked-out" || b.status === "checked-in");
  return { bookings, stays: stays.length, spent: bookings.reduce((s, b) => s + Math.max(0, paidOf(b)), 0), last: stays[0]?.checkIn, inHouse: bookings.some((b) => b.status === "checked-in") };
};

function GuestDrawer({ user, onClose }: { user: User; onClose: () => void }) {
  const db = useHotelDB();
  const staff = useCurrentStaff();
  const canManage = can(staff?.role, "guests.manage");
  const stats = guestStats(db, user);
  const [form, setForm] = useState({ name: user.name, phone: user.phone, country: user.country ?? "", note: user.note ?? "" });

  return (
    <Drawer
      open
      onClose={onClose}
      title={
        <div className="flex items-center gap-3">
          <span className="flex size-11 items-center justify-center rounded-full bg-sky-100 font-bold text-sky-800">{initials(user.name)}</span>
          <div>
            <p className="text-lg font-semibold text-neutral-900">{user.name}</p>
            <p className="text-xs text-neutral-500">
              {user.passwordHash ? "Registered account" : "Guest profile — no login"} · since {format(new Date(user.createdAt), "MMM yyyy")}
              {user.status === "blocked" && <span className="ml-1 font-semibold text-rose-600">· Blocked</span>}
            </p>
          </div>
        </div>
      }
      footer={
        <div className="flex flex-wrap gap-2">
          <Link href={`${ADMIN}/bookings/new?guest=${user.id}`} className={hbtn.primary}>
            <Plus className="size-4" /> New booking
          </Link>
          {canManage && (
            <>
              <button
                onClick={() => {
                  updateGuestProfile(user.id, { name: form.name.trim() || user.name, phone: form.phone, country: form.country || undefined, note: form.note || undefined });
                  toast.success("Guest saved");
                }}
                className={hbtn.outline}
              >
                Save changes
              </button>
              <button
                onClick={() => {
                  const next = user.status === "blocked" ? "active" : "blocked";
                  if (next === "blocked" && !confirm(`Block ${user.name}? They can't log in or book online until unblocked.`)) return;
                  const r = setUserStatus(user.id, next);
                  if (r.ok) toast.success(next === "blocked" ? "Guest blocked" : "Guest unblocked");
                  else toast.error(r.error);
                }}
                className={user.status === "blocked" ? hbtn.outline : hbtn.danger}
              >
                {user.status === "blocked" ? "Unblock" : "Block guest"}
              </button>
            </>
          )}
        </div>
      }
    >
      <div className="grid grid-cols-3 gap-3 text-center">
        {[
          ["Stays", stats.stays],
          ["Bookings", stats.bookings.length],
          ["Paid", taka(stats.spent)],
        ].map(([label, value]) => (
          <div key={label} className="rounded-xl bg-neutral-50 p-3">
            <p className="text-lg font-bold text-neutral-900">{value}</p>
            <p className="text-xs text-neutral-500">{label}</p>
          </div>
        ))}
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <Field label="Name">
          <input value={form.name} disabled={!canManage} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputClass} />
        </Field>
        <Field label="Phone">
          <input value={form.phone} disabled={!canManage} onChange={(e) => setForm({ ...form, phone: e.target.value })} className={inputClass} />
        </Field>
        <Field label="Email">
          <input value={user.email} disabled className={inputClass} />
        </Field>
        <Field label="Country">
          <input value={form.country} disabled={!canManage} onChange={(e) => setForm({ ...form, country: e.target.value })} className={inputClass} />
        </Field>
        <Field label="Staff note (preferences, VIP …)" className="sm:col-span-2">
          <textarea value={form.note} disabled={!canManage} onChange={(e) => setForm({ ...form, note: e.target.value })} rows={2} className={textareaClass} />
        </Field>
      </div>

      <h3 className="mt-6 text-xs font-semibold uppercase tracking-wide text-neutral-500">Bookings</h3>
      {stats.bookings.length === 0 ? (
        <p className="mt-2 text-sm text-neutral-500">No bookings yet.</p>
      ) : (
        <ul className="mt-2 divide-y divide-neutral-100">
          {stats.bookings.map((b) => (
            <li key={b.id}>
              <Link href={`${ADMIN}/bookings/${b.id}`} className="flex items-center gap-3 py-2.5 hover:bg-neutral-50">
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-medium text-neutral-900">
                    {b.code} · {b.roomName}
                  </span>
                  <span className="block text-xs text-neutral-500">{rangeLabel(b.checkIn, b.checkOut)}</span>
                </span>
                <StatusBadge status={b.status} />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Drawer>
  );
}

function StaffModal({ user, onClose }: { user: User | "new"; onClose: () => void }) {
  const existing = user === "new" ? undefined : user;
  const [form, setForm] = useState<StaffInput>({
    id: existing?.id,
    name: existing?.name ?? "",
    email: existing?.email ?? "",
    phone: existing?.phone ?? "",
    role: (existing?.role as StaffRole) ?? "receptionist",
    password: "",
  });
  const submit = () => {
    const r = saveStaff({ ...form, password: form.password || undefined });
    if (!r.ok) return toast.error(r.error);
    toast.success(existing ? "Staff account updated" : `${r.value.name} can now sign in`);
    onClose();
  };
  return (
    <Modal open onClose={onClose} title={existing ? `Edit ${existing.name}` : "Add staff member"}>
      <div className="space-y-3">
        <Field label="Full name">
          <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputClass} />
        </Field>
        <Field label="Email (login)">
          <input value={form.email} type="email" onChange={(e) => setForm({ ...form, email: e.target.value })} className={inputClass} />
        </Field>
        <Field label="Phone">
          <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className={inputClass} />
        </Field>
        <Field label="Role">
          <div className="grid grid-cols-3 gap-2">
            {staffRoles.map((r) => (
              <button key={r} type="button" onClick={() => setForm({ ...form, role: r })} className={cn("rounded-lg border px-2 py-2 text-xs font-medium", form.role === r ? "border-sky-500 bg-sky-50 text-sky-800" : "border-neutral-200 text-neutral-600")}>
                {roleLabels[r]}
              </button>
            ))}
          </div>
        </Field>
        <Field label={existing ? "New password (leave blank to keep)" : "Password"} hint="At least 6 characters">
          <input value={form.password} type="password" autoComplete="new-password" onChange={(e) => setForm({ ...form, password: e.target.value })} className={inputClass} />
        </Field>
        <div className="flex justify-end gap-2 pt-1">
          <button onClick={onClose} className={hbtn.outline}>
            Cancel
          </button>
          <button onClick={submit} className={hbtn.primary}>
            {existing ? "Save" : "Add staff"}
          </button>
        </div>
      </div>
    </Modal>
  );
}

const roleInfo: Record<StaffRole, string> = {
  admin: "Everything, including staff accounts and settings",
  manager: "Front office, refunds & voids, rooms, website content, reviews",
  receptionist: "Bookings, check-in/out, payments, housekeeping, guests (view)",
};

export default function UsersManager() {
  const db = useHotelDB();
  const staff = useCurrentStaff();
  const router = useRouter();
  const params = useSearchParams();
  const openGuestId = params.get("guest");
  const canStaff = can(staff?.role, "staff.manage");
  const [tab, setTab] = useState<"guests" | "staff">("guests");
  const [q, setQ] = useState("");
  const [kind, setKind] = useState<"any" | "registered" | "profile" | "blocked" | "in-house">("any");
  const [staffModal, setStaffModal] = useState<User | "new" | null>(null);

  const guests = useMemo(() => {
    const n = q.trim().toLowerCase();
    return db.users
      .filter((u) => u.role === "guest")
      .map((u) => ({ u, s: guestStats(db, u) }))
      .filter(({ u, s }) => {
        if (kind === "registered" && !u.passwordHash) return false;
        if (kind === "profile" && u.passwordHash) return false;
        if (kind === "blocked" && u.status !== "blocked") return false;
        if (kind === "in-house" && !s.inHouse) return false;
        return !n || [u.name, u.email, u.phone].some((v) => v.toLowerCase().includes(n));
      })
      .sort((a, b) => (b.s.last ?? b.u.createdAt).localeCompare(a.s.last ?? a.u.createdAt));
  }, [db, q, kind]);
  const page = usePagination(guests, 20);
  const staffList = db.users.filter((u) => u.role !== "guest");
  const openGuest = openGuestId ? db.users.find((u) => u.id === openGuestId) : undefined;

  const exportCsv = () =>
    downloadCsv("guests.csv", [
      ["Name", "Email", "Phone", "Country", "Account", "Stays", "Bookings", "Paid", "Last stay", "Status"],
      ...guests.map(({ u, s }) => [u.name, u.email, u.phone, u.country ?? "", u.passwordHash ? "Registered" : "Profile", s.stays, s.bookings.length, s.spent, s.last ?? "", u.status]),
    ]);

  return (
    <div>
      <AdminHeader
        title="Guests & staff"
        subtitle={`${db.users.filter((u) => u.role === "guest").length} guests · ${db.users.filter((u) => u.role === "guest" && u.passwordHash).length} with accounts · ${staffList.length} staff`}
        actions={
          tab === "guests" ? (
            <button onClick={exportCsv} className={hbtn.outline}>
              <Download className="size-4" /> Export CSV
            </button>
          ) : (
            canStaff && (
              <button onClick={() => setStaffModal("new")} className={hbtn.primary}>
                <Plus className="size-4" /> Add staff
              </button>
            )
          )
        }
      />

      <div className={tableCardClass}>
        <Tabs
          value={tab}
          onChange={setTab}
          tabs={[
            { value: "guests", label: "Guests", count: db.users.filter((u) => u.role === "guest").length },
            { value: "staff", label: "Staff", count: staffList.length },
          ]}
        />

        {tab === "guests" && (
          <>
            <div className={toolbarClass}>
              <SearchBox value={q} onChange={(v) => { setQ(v); page.setPage(1); }} placeholder="Search name, email or phone" />
              <Select
                label="Guest type"
                value={kind}
                onChange={setKind}
                options={[
                  { value: "any", label: "All guests" },
                  { value: "in-house", label: "Staying now" },
                  { value: "registered", label: "Registered accounts" },
                  { value: "profile", label: "Profiles (no login)" },
                  { value: "blocked", label: "Blocked" },
                ]}
              />
            </div>
            {guests.length === 0 ? (
              <Empty icon={Users} title="No guests found" />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[820px] text-sm">
                  <thead className="bg-neutral-50 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">
                    <tr>
                      <th className="px-4 py-3">Guest</th>
                      <th className="px-4 py-3">Contact</th>
                      <th className="px-4 py-3">Account</th>
                      <th className="px-4 py-3 text-right">Stays</th>
                      <th className="px-4 py-3 text-right">Paid</th>
                      <th className="px-4 py-3">Last stay</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {page.rows.map(({ u, s }) => (
                      <tr key={u.id} onClick={() => router.push(`${ADMIN}/users?guest=${u.id}`, { scroll: false })} className="cursor-pointer hover:bg-sky-50/40">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-sky-100 text-xs font-bold text-sky-800">{initials(u.name)}</span>
                            <span>
                              <span className="block font-medium text-neutral-900">{u.name}</span>
                              <span className="block text-xs text-neutral-500">{u.country ?? "—"}</span>
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-neutral-600">
                          <p>{u.phone}</p>
                          <p className="text-xs text-neutral-500">{u.email}</p>
                        </td>
                        <td className="px-4 py-3">
                          <span className={cn("rounded-full px-2 py-0.5 text-xs font-medium", u.status === "blocked" ? "bg-rose-50 text-rose-600" : u.passwordHash ? "bg-sky-50 text-sky-700" : "bg-neutral-100 text-neutral-600")}>
                            {u.status === "blocked" ? "Blocked" : u.passwordHash ? "Registered" : "Profile"}
                          </span>
                          {s.inHouse && <span className="ml-1.5 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">In house</span>}
                        </td>
                        <td className="px-4 py-3 text-right tabular-nums">{s.stays}</td>
                        <td className="px-4 py-3 text-right tabular-nums">{taka(s.spent)}</td>
                        <td className="px-4 py-3 text-neutral-600">{s.last ? format(new Date(`${s.last}T00:00`), "dd MMM yyyy") : "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <Pager {...page} noun="guests" />
          </>
        )}

        {tab === "staff" && (
          <div>
            <div className="grid gap-3 border-b border-neutral-100 bg-neutral-50/50 p-4 sm:grid-cols-3">
              {staffRoles.map((r) => (
                <div key={r} className="flex gap-2 text-xs text-neutral-600">
                  <ShieldCheck className="size-4 shrink-0 text-sky-600" />
                  <span>
                    <b className="text-neutral-800">{roleLabels[r]}:</b> {roleInfo[r]}
                  </span>
                </div>
              ))}
            </div>
            <ul className="divide-y divide-neutral-100">
              {staffList.map((u) => (
                <li key={u.id} className="flex flex-wrap items-center gap-3 px-4 py-3">
                  <span className="flex size-10 items-center justify-center rounded-full bg-sky-900 text-sm font-bold text-white">{initials(u.name)}</span>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-neutral-900">
                      {u.name} {u.id === staff?.id && <span className="text-xs font-normal text-neutral-400">(you)</span>}
                    </p>
                    <p className="text-xs text-neutral-500">
                      {u.email} · {u.phone}
                    </p>
                  </div>
                  <span className="rounded-full bg-sky-50 px-2.5 py-0.5 text-xs font-medium text-sky-800">{roleLabels[u.role]}</span>
                  <span className="w-36 text-xs text-neutral-500">{u.lastLoginAt ? `Last login ${format(new Date(u.lastLoginAt), "dd MMM, h:mm a")}` : "Never signed in"}</span>
                  <span className={cn("rounded-full px-2 py-0.5 text-xs font-medium", u.status === "active" ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-600")}>
                    {u.status === "active" ? "Active" : "Suspended"}
                  </span>
                  {canStaff && (
                    <span className="flex gap-1">
                      <button onClick={() => setStaffModal(u)} aria-label={`Edit ${u.name}`} className={hbtn.icon}>
                        <Pencil className="size-4" />
                      </button>
                      <button
                        onClick={() => {
                          const r = setUserStatus(u.id, u.status === "active" ? "blocked" : "active");
                          if (r.ok) toast.success(u.status === "active" ? `${u.name} suspended` : `${u.name} reactivated`);
                          else toast.error(r.error);
                        }}
                        aria-label={u.status === "active" ? `Suspend ${u.name}` : `Reactivate ${u.name}`}
                        className={u.status === "active" ? hbtn.iconDanger : hbtn.icon}
                        title={u.status === "active" ? "Suspend" : "Reactivate"}
                      >
                        {u.status === "active" ? <UserRound className="size-4" /> : <KeyRound className="size-4" />}
                      </button>
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {openGuest && <GuestDrawer key={openGuest.id} user={openGuest} onClose={() => router.push(`${ADMIN}/users`, { scroll: false })} />}
      {staffModal && <StaffModal user={staffModal} onClose={() => setStaffModal(null)} />}
    </div>
  );
}
