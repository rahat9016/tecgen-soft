"use client";

import { useMemo, useState } from "react";
import { Check, Plus, Search, X } from "lucide-react";
import { amenityIcons } from "@/src/components/hotel/HotelDetails/AmenitiesGrid";
import { cn } from "@/src/lib/utils";
import { hbtn } from "../ui";
import { COMMON_FACILITIES, facilityLabel } from "./model";
import { ctl, focusRing } from "./parts";

// "AC Rooms" and "Free Breakfast" are older duplicates kept for existing data.
const OTHER = Object.keys(amenityIcons)
  .filter((a) => !["AC Rooms", "Free Breakfast"].includes(a) && !COMMON_FACILITIES.some((c) => c.value === a))
  .sort((x, y) => x.localeCompare(y));

const chip = (on: boolean) =>
  cn(
    "inline-flex h-9 items-center gap-1.5 rounded-md border px-3 text-sm font-medium transition",
    on ? "border-sky-600 bg-sky-50 text-sky-900" : "border-neutral-300 bg-white text-neutral-700 hover:border-sky-400",
    focusRing
  );

export default function FacilityPicker({ value, onChange }: { value: string[]; onChange: (v: string[]) => void }) {
  const [query, setQuery] = useState("");
  const [customOpen, setCustomOpen] = useState(false);
  const [custom, setCustom] = useState("");
  const [customError, setCustomError] = useState("");

  const has = (v: string) => value.some((x) => x.toLowerCase() === v.toLowerCase());
  const toggle = (v: string) => onChange(has(v) ? value.filter((x) => x.toLowerCase() !== v.toLowerCase()) : [...value, v]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return OTHER.filter((a) => a.toLowerCase().includes(q)).slice(0, 8);
  }, [query]);

  const closeCustom = () => {
    setCustomOpen(false);
    setCustom("");
    setCustomError("");
  };
  const addCustom = () => {
    const v = custom.trim().replace(/\s+/g, " ");
    if (!v) return setCustomError("Type a facility name");
    if (has(v)) return setCustomError(`${facilityLabel(v)} is already selected`);
    onChange([...value, v]);
    closeCustom();
  };

  return (
    <div>
      <div className="flex flex-wrap gap-2" role="group" aria-label="Common facilities">
        {COMMON_FACILITIES.map((c) => {
          const on = has(c.value);
          return (
            <button key={c.value} type="button" aria-pressed={on} onClick={() => toggle(c.value)} className={chip(on)}>
              {on ? <Check className="size-4" aria-hidden /> : <Plus className="size-4 text-neutral-500" aria-hidden />}
              {c.label}
            </button>
          );
        })}
      </div>

      <div className="mt-4 flex gap-2">
        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-neutral-500" aria-hidden />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                if (results[0] && !has(results[0])) {
                  toggle(results[0]);
                  setQuery("");
                }
              }
            }}
            type="search"
            aria-label="Search other facilities"
            aria-controls="facility-results"
            placeholder="Search facilities"
            className={cn(ctl(), "pl-9")}
          />
        </div>
        <button
          type="button"
          onClick={() => {
            setCustomOpen(true);
            setCustom(query.trim() && !results.length ? query.trim() : "");
          }}
          disabled={customOpen}
          aria-expanded={customOpen}
          aria-controls="custom-facility-panel"
          aria-label="Add custom facility"
          className={cn(hbtn.outline, "shrink-0 max-sm:px-3")}
        >
          <Plus className="size-4" aria-hidden />
          <span className="sm:hidden">Add</span>
          <span className="max-sm:hidden">Add custom facility</span>
        </button>
      </div>

      {query.trim() && (
        <div id="facility-results" className="mt-2 flex flex-wrap gap-2" aria-live="polite">
          {results.length ? (
            results.map((a) => (
              <button key={a} type="button" aria-pressed={has(a)} onClick={() => toggle(a)} className={cn(chip(has(a)), "h-8 text-xs")}>
                {has(a) && <Check className="size-3.5" aria-hidden />}
                {a}
              </button>
            ))
          ) : (
            <p className="text-sm text-neutral-600">
              No match for “{query.trim()}”. Use <b className="font-medium text-neutral-800">Add custom facility</b> to add it.
            </p>
          )}
        </div>
      )}

      {customOpen && (
        <div id="custom-facility-panel" className="mt-3 rounded-md border border-neutral-200 bg-neutral-50 p-3">
          <label htmlFor="custom-facility" className="mb-1.5 block text-sm font-medium text-neutral-800">
            Custom facility
          </label>
          <div className="flex flex-wrap gap-2 sm:flex-nowrap">
            <input
              id="custom-facility"
              autoFocus
              value={custom}
              onChange={(e) => {
                setCustom(e.target.value);
                setCustomError("");
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addCustom();
                }
                if (e.key === "Escape") closeCustom();
              }}
              maxLength={40}
              aria-invalid={customError ? true : undefined}
              aria-describedby={customError ? "custom-facility-error" : undefined}
              placeholder="e.g. Prayer mat"
              className={ctl(!!customError)}
            />
            <div className="flex gap-2">
              <button type="button" onClick={closeCustom} className={hbtn.outline}>
                Cancel
              </button>
              <button type="button" onClick={addCustom} className={hbtn.primary}>
                Add
              </button>
            </div>
          </div>
          {customError && (
            <p id="custom-facility-error" className="mt-1.5 text-xs font-medium text-rose-700">
              {customError}
            </p>
          )}
        </div>
      )}

      {value.length > 0 && (
        <div className="mt-4 border-t border-neutral-100 pt-3">
          <p className="mb-2 text-sm font-medium text-neutral-800">Selected ({value.length})</p>
          <ul className="flex flex-wrap gap-1.5">
            {value.map((v) => (
              <li key={v} className="inline-flex h-7 items-center gap-1 rounded-md bg-sky-50 pl-2.5 pr-1 text-xs font-medium text-sky-900 ring-1 ring-inset ring-sky-200">
                {facilityLabel(v)}
                <button type="button" onClick={() => toggle(v)} aria-label={`Remove ${facilityLabel(v)}`} className={cn("flex size-5 items-center justify-center rounded text-sky-700 hover:bg-sky-100", focusRing)}>
                  <X className="size-3.5" />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
