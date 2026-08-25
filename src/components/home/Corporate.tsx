"use client";
import { useGet } from "@/src/hooks/useGet";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Text from "../shared/Text";
import { Button } from "../ui/button";

export default function Corporate() {
  const router = useRouter();
  const { data } = useGet<
    Array<{
      id: string;
      imageUrl: string;
      status: string;
    }>
  >("/corporate-service/list", ["corporate-service", "list"]);

  const corporateData = (data?.data ?? [])
    .filter((item) => String(item.status).toUpperCase() === "ACTIVE")
    .map((item) => item.imageUrl);

  const duplicatedData = corporateData.concat(corporateData);

  return (
    <div>
      <div className="container">
        <Text className="mb-10 text-2xl font-semibold">Corporate Services</Text>
        <div className="relative overflow-hidden">
          <div className="flex animate-marquee gap-8">
            {duplicatedData.map((img, i) => (
              <div
                key={i}
                className="shrink-0 w-56 h-28 border flex items-center justify-center rounded-md"
              >
                <Image
                  src={img}
                  alt={`Corporate ${i}`}
                  width={150}
                  height={80}
                  className="object-contain"
                />
              </div>
            ))}
          </div>

          {/* Left overlay */}
          <div className="pointer-events-none absolute top-0 left-0 h-full w-80 bg-linear-to-r from-white to-white/0" />
          {/* Right overlay */}
          <div className="pointer-events-none absolute top-0 right-0 h-full w-80 bg-linear-to-l from-white to-white/0" />
        </div>

        {/* Row 2 → right-to-left */}
        <div className="relative overflow-hidden mt-6">
          <div className="flex animate-marquee-reverse gap-8">
            {duplicatedData.map((img, i) => (
              <div
                key={i}
                className="shrink-0 w-56 h-28 border flex items-center justify-center rounded-md"
              >
                <Image
                  src={img}
                  alt={`Corporate ${i}`}
                  width={150}
                  height={80}
                  className="object-contain"
                />
              </div>
            ))}
          </div>

          {/* Left overlay */}
          <div className="pointer-events-none absolute top-0 left-0 h-full w-20 lg:w-80 bg-linear-to-r from-white to-white/0" />
          {/* Right overlay */}
          <div className="pointer-events-none absolute top-0 right-0 h-full w-20 lg:w-80 bg-linear-to-l from-white to-white/0" />
        </div>

        <div className="flex justify-center">
          <Button
            onClick={() => router.push(`/membership`)}
            className="px-6 py-4 h-11 mt-5 lg:mt-10 mb-10 lg:mb-20 cursor-pointer"
          >
            Get Yours Service{" "}
            <Image
              src="/icons/right_arrow_white.svg"
              alt="Arrow right"
              width={20}
              height={20}
            />
          </Button>
        </div>
      </div>
    </div>
  );
}
