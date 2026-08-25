"use client";

import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { useElementSize } from "@/src/hooks/useElementSize";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const departmentsData = [
  { name: "General", revenue1: 5500, revenue2: 2800 },
  { name: "Cardiology", revenue1: 4800, revenue2: 2200 },
  { name: "Orthopedics", revenue1: 3200, revenue2: 1800 },
  { name: "Pediatrics", revenue1: 2800, revenue2: 1500 },
  { name: "Neurology", revenue1: 4200, revenue2: 2000 },
];

const formatYAxis = (value: number) => {
  if (value >= 1000) return `${value / 1000}K`;
  return `${value}`;
};

const PopularDepartmentsChart = () => {
  const [selectedYear, setSelectedYear] = useState("2024 - 2025");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { ref, width, height } = useElementSize<HTMLDivElement>();
  const canRenderChart = width > 0 && height > 0;

  return (
    <div className="bg-white rounded-xl p-5 shadow-sm h-full min-w-0">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-[#0C0B18]">
          Popular Departments
        </h3>
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-1 text-xs text-secondary-gary border border-light-silver rounded-md px-2.5 py-1.5 hover:bg-light transition-colors"
          >
            {selectedYear}
            <ChevronDown size={14} />
          </button>
          {dropdownOpen && (
            <div className="absolute right-0 top-full mt-1 bg-white border border-light-silver rounded-md shadow-lg z-10">
              {["2024 - 2025", "2023 - 2024", "2022 - 2023"].map((year) => (
                <button
                  key={year}
                  onClick={() => {
                    setSelectedYear(year);
                    setDropdownOpen(false);
                  }}
                  className="block w-full text-left px-3 py-1.5 text-xs text-secondary-gary hover:bg-light transition-colors whitespace-nowrap"
                >
                  {year}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      <div ref={ref} className="w-full h-72 min-w-0">
        {canRenderChart && (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={departmentsData} barCategoryGap="25%">
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#f0f0f0"
              />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: "#545454" }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: "#545454" }}
                tickFormatter={formatYAxis}
                domain={[0, 10000]}
                ticks={[0, 2000, 4000, 6000, 8000, 10000]}
              />
              <Tooltip
                formatter={(value) => [`${Number(value).toLocaleString()}`, ""]}
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #e0e0e0",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
              />
              <Bar
                dataKey="revenue1"
                stackId="a"
                fill="#009AA0"
                radius={[0, 0, 0, 0]}
              />
              <Bar
                dataKey="revenue2"
                stackId="a"
                fill="#33AEB3"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

export default PopularDepartmentsChart;
