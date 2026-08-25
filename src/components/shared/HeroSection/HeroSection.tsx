"use client";

import { cn } from "@/src/lib/utils";
import Image from "next/image";

interface IHero {
  image: string;
  title: string;
  description: string;
  className?: string;
  classTitle?: string;
  classDesc?: string;
}

const HeroSection = ({
  image,
  title,
  description,
  className,
  classTitle,
  classDesc,
}: IHero) => {
  return (
    <div>
      <div
        className={cn("relative w-full min-h-[40vh] max-h-[40vh]", className)}
      >
        <Image
          src={image}
          alt={title || "Happy Hospital Diagnostics"}
          fill
          priority
          className="object-cover object-center w-full h-full"
        />
        <div className=" absolute inset-0 bg-[linear-gradient(220deg,rgba(0,0,0,0)_25.63%,rgba(15,14,64,0.3)_44.93%)] blur-xs" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
          <h1
            className={cn(
              "text-[4vh] lg:text-[5vh] text-white font-semibold font-inter drop-shadow-lg",
              classTitle
            )}
          >
            {title}
          </h1>
          <p
            className={cn(
              "mt-[2vh] text-[2vh] lg:text-[2.5vh] text-white/90 font-inter font-medium w-full lg:w-6/12 leading-snug",
              classDesc
            )}
          >
            {description}
          </p>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
