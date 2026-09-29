"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatTaka } from "@/src/lib/gadget-store/format";

const compact = (n: number) =>
  n >= 1e7 ? `${(n / 1e7).toFixed(1)}Cr` : n >= 1e5 ? `${(n / 1e5).toFixed(1)}L` : n >= 1e3 ? `${Math.round(n / 1e3)}K` : String(n);

/** Single-series daily bars; one hue, so identity never depends on colour. */
export function SalesBars({ data, height = 260 }: { data: { label: string; total: number }[]; height?: number }) {
  return (
    <div style={{ height }} role="img" aria-label="Daily sales bar chart">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 4, left: 0, bottom: 0 }} barCategoryGap={2}>
          <CartesianGrid vertical={false} stroke="#f0f0f0" />
          <XAxis
            dataKey="label"
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 11, fill: "#737373" }}
            interval="preserveStartEnd"
            minTickGap={16}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            width={44}
            tick={{ fontSize: 11, fill: "#737373" }}
            tickFormatter={(v: number) => `৳${compact(v)}`}
          />
          <Tooltip
            cursor={{ fill: "#fff7ed" }}
            contentStyle={{ borderRadius: 12, border: "1px solid #e5e5e5", fontSize: 12 }}
            formatter={(v) => [formatTaka(Number(v)), "Sales"]}
          />
          <Bar dataKey="total" fill="#f97316" radius={[4, 4, 0, 0]} maxBarSize={28} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

/** Ranked horizontal bars in plain HTML — every bar is labelled with its value. */
export function RankBars({ rows, max }: { rows: [string, number][]; max?: number }) {
  const top = max ?? Math.max(1, ...rows.map((r) => r[1]));
  return (
    <ul className="space-y-3">
      {rows.map(([label, value]) => (
        <li key={label} title={`${label}: ${formatTaka(value)}`}>
          <div className="flex justify-between text-sm">
            <span className="text-neutral-700">{label}</span>
            <span className="font-medium tabular-nums text-neutral-900">{formatTaka(value)}</span>
          </div>
          <div className="mt-1.5 h-2 rounded-full bg-neutral-100">
            <div className="h-2 rounded-full bg-orange-500" style={{ width: `${Math.max(2, (value / top) * 100)}%` }} />
          </div>
        </li>
      ))}
    </ul>
  );
}
