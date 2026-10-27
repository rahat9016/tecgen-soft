import { bn as hotel } from "../hotel-store/i18n-bn";

/**
 * Bangla text for the turf admin, keyed by the English shown in the UI. Starts from the hotel admin's
 * dictionary (shared words like "Bookings", "Save changes") and adds turf-only phrases on top.
 * Missing keys fall back to English. Brand and wallet names (bKash, Nagad) stay as they are.
 */
export const bn: Record<string, string> = {
  ...hotel,
};
