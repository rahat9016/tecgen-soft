"use client";

import { ArrowUpRight } from "lucide-react";
import Image from "next/image";

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  isPositive?: boolean;
}

const StatCard = ({ title, value, change, isPositive }: StatCardProps) => {
  return (
    <div className="bg-white rounded-xl p-8 border-l-4 border-l-[#33AEB3] shadow-sm hover:shadow-md duration-300 transition-all group hover:bg-primary cursor-pointer">
      <div className="flex items-center justify-between mb-3">
        <p className="text-lg text-secondary-foreground font-semibold group-hover:text-white">
          {title}
        </p>
        <div className="w-12 h-12 rounded-full group flex items-center justify-center border border-light-silver text-[#33AEB3] group-hover:bg-white">
          <Image
            src="/icons/right_up_arrow.svg"
            alt={title}
            width={40}
            height={40}
          />
        </div>
      </div>
      <p className="text-[32px] font-semibold text-secondary-dark mb-4 group-hover:text-white">
        {value}
      </p>
      {change && (
        <div className="flex items-center gap-2">
          <span
            className={`text-xs font-semibold flex items-center gap-0.5 ${
              isPositive
                ? "text-[#28A745] bg-[#ECFDF3] group-hover:bg-white p-0.5 rounded"
                : "text-[#F04438] bg-[#FEF3F2] group-hover:bg-white p-0.5 rounded"
            }`}
          >
            {isPositive ? (
              <ArrowUpRight size={14} />
            ) : (
              <ArrowUpRight size={14} className="rotate-90" />
            )}
            {change}
          </span>
          <span className="text-xs font-medium text-[#BDBDBD] group-hover:text-white">
            from yesterday
          </span>
        </div>
      )}
    </div>
  );
};

export default StatCard;
