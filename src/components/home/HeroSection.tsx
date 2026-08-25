"use client";
import { useGet } from "@/src/hooks/useGet";
import clsx from "clsx";
import Image from "next/image";
import { useEffect, useState } from "react";
import { IHeroManagement } from "../admin/HeroManagement/types";
import HeroAction from "./HeroAction";
import HeroSkeleton from "./skeleton/HeroSkeleton";

export default function HeroSection() {
  const [active, setActive] = useState(0);
  const { data, isLoading } = useGet<IHeroManagement>(`/hero-management`, [
    "hero-management",
  ]);

  useEffect(() => {
    if (!data) return;
    const interval = setInterval(() => {
      setActive((prev) => (prev + 1) % data.data?.images?.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [data]);

  // =======================

  return (
    <div>
      {isLoading ? (
        <HeroSkeleton />
      ) : (
        <div className="relative h-[85vh] w-full overflow-hidden">
          {data?.data?.images &&
            data.data.images.map(
              (slide, index) =>
                typeof slide === "string" && (
                  <Image
                    key={index}
                    src={slide}
                    alt={"Your Health Our Priority"}
                    fill
                    priority={index === 0}
                    className={clsx(
                      "object-cover transition-opacity duration-1000",
                      active === index ? "opacity-100" : "opacity-0"
                    )}
                  />
                )
            )}

          <div className="absolute inset-0 bg-black/50" />

          <div className="relative z-10 container h-full flex flex-col items-center justify-center text-center text-white px-4">
            {data?.data?.title && (
              <h1 className="text-xl md:text-2xl lg:text-5xl xl:text-7xl font-semibold max-w-4xl">
                {data.data.title}
              </h1>
            )}

            {data?.data?.description && (
              <p className="mt-3 xl:mt-6 xl:max-w-3xl text-sm  xl:text-base md:text-lg text-white/90">
                {data.data.description}
              </p>
            )}
            <div className="mt-5 xl:mt-20">
              <HeroAction />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
