"use client";

import { IHealthCheckPackage } from "@/src/components/health-check/types";
import { usePatch } from "@/src/hooks/usePatch";
import { usePost } from "@/src/hooks/usePost";
import { StatusType } from "@/src/types/common/common";
import { yupResolver } from "@hookform/resolvers/yup";
import { useRouter } from "next/navigation";
import { FormProvider, useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { packageSchema, TPackageFormType } from "../Schema/packageSchema";
import PackageForm from "./PackageForm";

export default function CreateUpdatePackage({
  initialValues,
}: {
  initialValues?: IHealthCheckPackage | null;
}) {
  const router = useRouter();
  const isEditMode = Boolean(initialValues?.id);
  const { mutateAsync, error, isPending } = usePost(
    "/health-packages",
    () => {
      toast.success("Package created successfully!");
      router.push("/admin/health-packages");
    },
    [["health-packages"]]
  );

  const {
    mutateAsync: patchMutateAsync,
    error: patchError,
    isPending: patchIsPending,
  } = usePatch(() => {
    toast.success("Package updated successfully!");
    router.push("/admin/health-packages");
  }, [["health-packages"]]);

  const methods = useForm({
    resolver: yupResolver(packageSchema),
    values: {
      serviceList: (Array.isArray(initialValues?.serviceList)
        ? initialValues.serviceList
        : []
      ).map((item: string) => ({ name: item })),
      image: initialValues?.image || "",
      title: initialValues?.title || "",
      description: initialValues?.description || "",
      price: Number(initialValues?.price) || 0,
      status: initialValues?.status as StatusType,
      serviceInput: "",
    },
  });

  const onSubmit = (data: TPackageFormType) => {
    const payload = new FormData();
    payload.append("title", data.title);
    payload.append("description", data.description);
    payload.append("price", String(data.price));
    payload.append("status", data.status);

    if (data.image instanceof File) {
      payload.append("image", data.image);
    } else if (typeof data.image === "string" && data.image.trim()) {
      payload.append("image", data.image);
    }

    (data.serviceList || [])
      .map((item) => item?.name?.trim())
      .filter(Boolean)
      .forEach((service) => {
        payload.append("serviceList", service as string);
      });

    if (isEditMode && initialValues?.id) {
      patchMutateAsync({
        url: `/health-packages/${initialValues.id}`,
        data: payload,
      }).catch((err) => {
        toast.error(err?.message || "Failed to update package");
      });
    } else {
      mutateAsync(payload).catch((err) => {
        toast.error(err?.message || "Failed to create package");
      });
    }
  };

  return (
    <FormProvider {...methods}>
      <PackageForm
        isEditMode={isEditMode}
        onSubmit={onSubmit}
        error={isEditMode ? patchError : error}
        isPending={isEditMode ? patchIsPending : isPending}
      />
    </FormProvider>
  );
}
