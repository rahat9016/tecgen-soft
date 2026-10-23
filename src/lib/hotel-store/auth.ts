import SHA256 from "crypto-js/sha256";
import type { Role, StaffRole } from "./types";

/**
 * DEMO ONLY: accounts live in the browser, so this hash only keeps plain-text passwords out of
 * localStorage. A real deployment must check passwords on a server (bcrypt/argon2) and issue sessions there.
 */
export const hashPassword = (email: string, password: string) =>
  SHA256(`tripwave:${email.trim().toLowerCase()}:${password}`).toString();

export const staffRoles: StaffRole[] = ["admin", "manager", "receptionist"];
export const isStaff = (role?: Role): role is StaffRole => !!role && role !== "guest";

/** What each staff role may do in the admin panel. */
const grants = {
  "bookings.manage": ["admin", "manager", "receptionist"],
  "payments.record": ["admin", "manager", "receptionist"],
  "payments.refund": ["admin", "manager"],
  "payments.void": ["admin", "manager"],
  "rooms.housekeeping": ["admin", "manager", "receptionist"],
  "rooms.manage": ["admin", "manager"],
  "guests.view": ["admin", "manager", "receptionist"],
  "guests.message": ["admin", "manager", "receptionist"],
  "guests.manage": ["admin", "manager"],
  "staff.manage": ["admin"],
  "content.manage": ["admin", "manager"],
  "reviews.manage": ["admin", "manager"],
  "settings.manage": ["admin"],
} satisfies Record<string, StaffRole[]>;

export type Permission = keyof typeof grants;

export const can = (role: Role | undefined, permission: Permission) =>
  isStaff(role) && (grants[permission] as StaffRole[]).includes(role);

/** Largest discount, as a percent of the room charge, each role may give without a manager. */
export const discountLimits: Record<StaffRole, number> = { admin: 100, manager: 50, receptionist: 10 };
export const discountLimit = (role: Role | undefined) => (isStaff(role) ? discountLimits[role] : 0);
