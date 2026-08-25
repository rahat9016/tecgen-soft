"use client";
import { useGet } from "@/src/hooks/useGet";
import { useParams, useRouter } from "next/navigation";
import DynamicBreadcrumb from "../../shared/DynamicBreadcrumb";
import NotFoundData from "../../shared/NotFoundData";
import Paragraph from "../../shared/Paragraph";
import { Button } from "../../ui/button";
import { IHealthCheckPackage } from "../types";
import HealthPackageSelect from "./HealthPackageSelect";
import HealthCheckContentSkeleton from "./Skeleton/HealthCheckContentSkeleton";
import WhatYouGet from "./WhatYouGet";

export default function HealthCheckContent() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const { data: healthPackagesData, isLoading: healthPackagesDataLoading } =
    useGet<IHealthCheckPackage[]>("/health-packages", ["health-packages"]);
  const { data, isLoading } = useGet<IHealthCheckPackage>(
    `/health-packages/${id}`,
    ["health-package", id]
  );
  const packages = healthPackagesData?.data ?? [];

  return (
    <>
      {isLoading ? (
        <HealthCheckContentSkeleton />
      ) : data ? (
        <div className="container">
          <div className="mt-6">
            <DynamicBreadcrumb />
          </div>

          <div className="my-5 mt-7 lg:my-10 flex flex-col-reverse md:flex-row md:justify-between gap-5 lg:gap-0">
            <div>
              <p className="text-2xl font-semibold text-secondary">
                {data?.data?.title}
              </p>
              <p className="text-2xl font-semibold text-primary">
                {data?.data?.price} BDT
              </p>
            </div>

            <div className="flex">
              <div className="flex lg:flex-col items-center lg:items-start gap-1">
                <Paragraph className="mb-1">Select Packages</Paragraph>
                <HealthPackageSelect
                  packages={packages}
                  value={id}
                  loading={healthPackagesDataLoading}
                  onChange={(value) => router.push(`/health-check/${value}`)}
                />
              </div>
            </div>
          </div>

          <WhatYouGet serviceList={data?.data?.serviceList} />

          <div className="mt-6 lg:mt-8 flex items-center gap-2">
            <p className="text-base lg:text-2xl font-semibold text-secondary">
              For Booking and more information. Please call
            </p>
            <Button className="bg-amber-500 hover:bg-amber-500 hover:text-secondary">
              Hotline: 16254
            </Button>
          </div>

          <Button
            onClick={() => router.push(`/health-check`)}
            className="px-6 py-4 h-11 mt-5 lg:mt-10 mb-10 lg:mb-20"
          >
            ← Back to All packages
          </Button>
        </div>
      ) : (
        <NotFoundData />
      )}
    </>
  );
}
