"use client";

import { usePatch } from "@/src/hooks/usePatch";
import { usePost } from "@/src/hooks/usePost";
import { StatusType } from "@/src/types/common/common";
import { yupResolver } from "@hookform/resolvers/yup";
import { useRouter } from "next/navigation";
import { FormProvider, Resolver, useForm } from "react-hook-form";
import { toast } from "react-toastify";
import {
    membershipPackageSchema,
    MembershipPackageSchemaForm,
} from "../Schema/membershipPackageSchema";
import { IMembershipPackage } from "../types";
import MembershipPackageForm from "./MembershipPackageForm";

export default function CreateUpdateMembershipPackage({
  initialValues,
}: {
  initialValues?: IMembershipPackage;
}) {
  const router = useRouter();
  const isEditMode = Boolean(initialValues?.id);

  const { mutateAsync, error, isPending } = usePost(
    "/package",
    () => {
      toast.success("Package created successfully!");
      router.push("/admin/packages");
    },
    [["membership-package"]]
  );

  const {
    mutateAsync: patchMutateAsync,
    error: patchError,
    isPending: patchIsPending,
  } = usePatch(() => {
    toast.success("Package updated successfully!");
    router.push("/admin/packages");
  }, [["membership-package"]]);

  const methods = useForm({
    resolver: yupResolver(
      membershipPackageSchema
    ) as Resolver<MembershipPackageSchemaForm>,
    values: initialValues
      ? {
          title: initialValues.title || "",
          description: initialValues.description || "",
          benefits: (initialValues.benefits || []).map((item) => ({
            value: item,
          })),
          notices: (initialValues.notices || []).map((item) => ({
            value: item,
          })),
          benefitInput: "",
          noticeInput: "",
          status:
            String(initialValues.status).toUpperCase() === StatusType.INACTIVE
              ? StatusType.INACTIVE
              : StatusType.ACTIVE,
        }
      : undefined,
  });

  const onSubmit = (data: MembershipPackageSchemaForm) => {
    const payload = {
      title: data.title,
      description: data.description,
      benefits: (data.benefits || []).map((item) => item.value),
      notices: (data.notices || []).map((item) => item.value),
      status: data.status,
    };

    if (isEditMode && initialValues?.id) {
      patchMutateAsync({
        url: `/package/${initialValues.id}`,
        data: payload,
      }).catch((err) => {
        toast.error(err?.message || "Failed to update package");
      });
      return;
    }

    mutateAsync(payload).catch((err) => {
      toast.error(err?.message || "Failed to create package");
    });
  };

  return (
    <FormProvider {...methods}>
      <MembershipPackageForm
        onSubmit={onSubmit}
        error={isEditMode ? patchError : error}
        isPending={isEditMode ? patchIsPending : isPending}
        isEditMode={isEditMode}
      />
    </FormProvider>
  );
}
