"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { taka } from "@/src/lib/hotel-store/format";

const compact = (n: number) => (n >= 1e5 ? `${(n / 1e5).toFixed(1)}L` : n >= 1e3 ? `${Math.round(n / 1e3)}K` : String(n));
const SKY = "#0284c7";

/** Single-series vertical bars; one hue so identity never depends on colour. */
export function ValueBars({
  data,
  kind,
  height = 240,
  label,
}: {
  data: { label: string; value: number; hint?: string }[];
  kind: "money" | "percent";
  height?: number;
  label: string;
}) {
  const fmt = (v: number) => (kind === "money" ? taka(v) : `${Math.round(v)}%`);
  return (
    <div style={{ height }} role="img" aria-label={label}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 4, left: 0, bottom: 0 }} barCategoryGap={2}>
          <CartesianGrid vertical={false} stroke="#f0f0f0" />
          <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "#737373" }} interval="preserveStartEnd" minTickGap={14} />
          <YAxis
            tickLine={false}
            axisLine={false}
            width={44}
            tick={{ fontSize: 11, fill: "#737373" }}
            domain={kind === "percent" ? [0, 100] : undefined}
            tickFormatter={(v: number) => (kind === "money" ? `৳${compact(v)}` : `${v}%`)}
          />
          <Tooltip
            cursor={{ fill: "#f0f9ff" }}
            contentStyle={{ borderRadius: 8, border: "1px solid #e5e5e5", fontSize: 12 }}
            labelFormatter={(l, payload) => (payload?.[0]?.payload?.hint as string) ?? l}
            formatter={(v) => [fmt(Number(v)), kind === "money" ? "Amount" : "Occupancy"]}
          />
          <Bar dataKey="value" fill={SKY} radius={[4, 4, 0, 0]} maxBarSize={26} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

/** Ranked horizontal bars in plain HTML — every bar is labelled with its value. */
export function RankBars({ rows, format = taka }: { rows: { label: string; value: number; note?: string }[]; format?: (n: number) => string }) {
  const top = Math.max(1, ...rows.map((r) => r.value));
  return (
    <ul className="space-y-3">
      {rows.map((r) => (
        <li key={r.label} title={`${r.label}: ${format(r.value)}`}>
          <div className="flex justify-between gap-3 text-sm">
            <span className="truncate text-neutral-700">{r.label}</span>
            <span className="shrink-0 font-medium tabular-nums text-neutral-900">
              {format(r.value)}
              {r.note && <span className="ml-1.5 text-xs font-normal text-neutral-500">{r.note}</span>}
            </span>
          </div>
          <div className="mt-1.5 h-2 rounded-full bg-neutral-100">
            <div className="h-2 rounded-full bg-sky-600" style={{ width: `${Math.max(2, (r.value / top) * 100)}%` }} />
          </div>
        </li>
      ))}
    </ul>
  );
}
