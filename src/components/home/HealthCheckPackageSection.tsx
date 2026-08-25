"use client";
import { useGet } from "@/src/hooks/useGet";
import Image from "next/image";
import { useRouter } from "next/navigation";
import HealthCheckPackageCard from "../health-check/HealthCheck/HealthCheckPackageCard";
import HealthCheckPackageCardSkeleton from "../health-check/HealthCheck/HealthCheckPackageCardSkeleton";
import { IHealthCheckPackage } from "../health-check/types";
import NotFoundData from "../shared/NotFoundData";
import Text from "../shared/Text";
import { Button } from "../ui/button";

export default function HealthCheckPackageSection() {
  const router = useRouter();
  const { data, isLoading } = useGet<IHealthCheckPackage[]>(
    "/health-packages",
    ["health-packages"],
    {
      ...{
        page: 1,
        limit: 8,
      },
    }
  );
  const healthData = data?.data;
  return (
    <div className="py-8 xl:py-10">
      <div className="container">
        <Text className="mb-6 xl:mb-10">Health Check Packages</Text>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6 pb-10">
          {isLoading &&
            Array.from({ length: 8 }).map((_, i) => (
              <HealthCheckPackageCardSkeleton key={i} />
            ))}

          {!isLoading &&
            healthData &&
            healthData.length > 0 &&
            healthData.map((blog) => (
              <HealthCheckPackageCard key={blog.id} {...blog} />
            ))}

          {!isLoading && (!healthData || healthData.length === 0) && (
            <NotFoundData />
          )}
        </div>
        <div className="flex justify-center">
          <Button
            onClick={() => router.push(`/health-check`)}
            className="px-6 py-4 h-11 mt-5 lg:mt-10 mb-10 lg:mb-20 cursor-pointer"
          >
            See All Packages{" "}
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
