"use client";
import { useGet } from "@/src/hooks/useGet";
import CreateUpdateHeroManagement from "./Form/CreateUpdateHeroManagement";
import HeroManagementFormSkeleton from "./Skeleton/HeroManagementFormSkeleton";
import { IHeroManagement } from "./types";

export default function HeroManagement() {
  const { data, isLoading } = useGet<IHeroManagement>(`/hero-management`, [
    "hero-management",
  ]);

  return (
    <div>
      {isLoading ? (
        <HeroManagementFormSkeleton />
      ) : (
        <CreateUpdateHeroManagement initialValues={data?.data} />
      )}
    </div>
  );
}
