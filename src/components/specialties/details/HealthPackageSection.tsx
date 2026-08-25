import { useGet } from "@/src/hooks/useGet";
import Image from "next/image";
import { useRouter } from "next/navigation";
import HealthCheckPackageCard from "../../health-check/HealthCheck/HealthCheckPackageCard";
import HealthCheckPackageCardSkeleton from "../../health-check/HealthCheck/HealthCheckPackageCardSkeleton";
import { IHealthCheckPackage } from "../../health-check/types";
import Text from "../../shared/Text";
import { Button } from "../../ui/button";

export default function HealthPackageSection() {
  const { data: healthCheckPackages, isLoading: isHealthCheckPackagesLoading } =
    useGet<IHealthCheckPackage[]>("/health-packages?status=ACTIVE", [
      "health-packages",
    ]);
  const router = useRouter();
  return (
    <div className="container pb-8 lg:pb-25">
      <Text
        as="h2"
        className="mb-6 text-xl lg:text-3xl xl:text-[44px] font-semibold text-secondary-dark"
      >
        Our Services
      </Text>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
        {isHealthCheckPackagesLoading
          ? Array.from({ length: 8 }).map((_, i) => (
              <HealthCheckPackageCardSkeleton key={i} />
            ))
          : healthCheckPackages?.data?.map((pkg) => (
              <HealthCheckPackageCard key={pkg.id} {...pkg} />
            ))}
      </div>
      <Button
        onClick={() => router.push("/health-check")}
        className="mx-auto flex items-center gap-2 mt-5 lg:mt-10"
      >
        See All Packages{" "}
        <Image
          src="/icons/right_arrow_white.svg"
          width={20}
          height={20}
          alt={"See All Packages"}
        />{" "}
      </Button>
    </div>
  );
}
