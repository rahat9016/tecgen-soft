"use client";
import { useGet } from "@/src/hooks/useGet";
import DynamicBreadcrumb from "../../shared/DynamicBreadcrumb";
import NotFoundData from "../../shared/NotFoundData";
import Text from "../../shared/Text";
import { IHealthCheckPackage } from "../types";
import HealthCheckPackageCard from "./HealthCheckPackageCard";
import HealthCheckPackageCardSkeleton from "./HealthCheckPackageCardSkeleton";
import WhatIsHealthCheck from "./WhatIsHealthCheck";

export default function HealthCheckPackagesSection() {
  const { data, isLoading } = useGet<IHealthCheckPackage[]>(
    "/health-packages?status=ACTIVE",
    ["health-packages"]
  );
  const healthData = data?.data;

  return (
    <div>
      <div className="container mt-6">
        <div className="mb-6 lg:mb-10">
          <DynamicBreadcrumb />
        </div>
        <WhatIsHealthCheck />
        <Text className="mb-6 xl:mb-10">Health Check Packages</Text>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6 pb-10 lg:mb-25">
          {isLoading &&
            Array.from({ length: 8 }).map((_, i) => (
              <HealthCheckPackageCardSkeleton key={i} />
            ))}

          {!isLoading &&
            healthData &&
            healthData.length > 0 &&
            healthData.map((hltPackage) => (
              <HealthCheckPackageCard key={hltPackage.id} {...hltPackage} />
            ))}

          {!isLoading && (!healthData || healthData.length === 0) && (
            <NotFoundData />
          )}
        </div>
      </div>
    </div>
  );
}
