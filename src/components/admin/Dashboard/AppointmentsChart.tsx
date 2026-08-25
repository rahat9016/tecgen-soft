"use client";

import { useElementSize } from "@/src/hooks/useElementSize";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const appointmentData = [
  { day: "Mon", onsite: 15, teleOnline: 10 },
  { day: "Tue", onsite: 18, teleOnline: 14 },
  { day: "Wed", onsite: 16, teleOnline: 15 },
  { day: "Thu", onsite: 20, teleOnline: 16 },
  { day: "Fri", onsite: 22, teleOnline: 18 },
  { day: "Sat", onsite: 28, teleOnline: 20 },
];

const CustomLegend = () => (
  <div className="flex items-center gap-4">
    <div className="flex items-center gap-1.5">
      <span
        className="w-3 h-3 rounded-full"
        style={{ backgroundColor: "#f97316" }}
      />
      <span className="text-xs text-secondary-gary">Onsite</span>
    </div>
    <div className="flex items-center gap-1.5">
      <span
        className="w-3 h-3 rounded-full"
        style={{ backgroundColor: "#009dab" }}
      />
      <span className="text-xs text-secondary-gary">Tele Online</span>
    </div>
  </div>
);

const AppointmentsChart = () => {
  const { ref, width, height } = useElementSize<HTMLDivElement>();
  const canRenderChart = width > 0 && height > 0;

  return (
    <div className="bg-white rounded-xl p-5 shadow-sm h-full min-w-0">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-[#0C0B18]">Appointments</h3>
        <CustomLegend />
      </div>
      <div ref={ref} className="w-full h-72 min-w-0">
        {canRenderChart && (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={appointmentData}>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#f0f0f0"
              />
              <XAxis
                dataKey="day"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: "#545454" }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: "#545454" }}
                domain={[0, 40]}
                ticks={[0, 10, 20, 30, 40]}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #e0e0e0",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
              />
              <Line
                type="monotone"
                dataKey="onsite"
                stroke="#f97316"
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 5, fill: "#f97316" }}
              />
              <Line
                type="monotone"
                dataKey="teleOnline"
                stroke="#009dab"
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 5, fill: "#009dab" }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

export default AppointmentsChart;
