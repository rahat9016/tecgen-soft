/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { usePatch } from "@/src/hooks/usePatch";
import { usePost } from "@/src/hooks/usePost";
import { yupResolver } from "@hookform/resolvers/yup";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { toast } from "react-toastify";
import {
  corporateMembershipSchema,
  CorporateMembershipSchemaForm,
} from "../Schema/corporateMembershipSchema";
import { ICorporateMembership } from "../types";
import CorporateMembershipForm from "./CorporateMembershipForm";
import { getCorporateMembershipValues } from "./getCorporateMembershipValues";

export default function CreateUpdateCorporateMembership({
  initialValues,
}: {
  initialValues?: ICorporateMembership;
}) {
  const router = useRouter();
  const isEditMode = Boolean(initialValues?.id);

  const { mutateAsync, error, isPending } = usePost(
    "/corporate-membership",
    () => {
      toast.success("Corporate membership created successfully!");
      router.push("/admin/corporate-membership");
    },
    [["corporate-membership"]]
  );

  const {
    mutateAsync: patchMutateAsync,
    error: patchError,
    isPending: patchIsPending,
  } = usePatch(() => {
    toast.success("Corporate membership updated successfully!");
    router.push("/admin/corporate-membership");
  }, [["corporate-membership"]]);

  const methods = useForm<CorporateMembershipSchemaForm>({
    resolver: yupResolver(corporateMembershipSchema) as any,
    values: initialValues
      ? getCorporateMembershipValues(initialValues)
      : getCorporateMembershipValues(),
  });

  useEffect(() => {
    methods.reset(getCorporateMembershipValues(initialValues));
  }, [initialValues, methods]);

  const onSubmit = (data: CorporateMembershipSchemaForm) => {
    if (isEditMode && initialValues?.id) {
      patchMutateAsync({
        url: `/corporate-membership/${initialValues.id}`,
        data,
      });
      return;
    }

    mutateAsync(data);
  };

  return (
    <FormProvider {...methods}>
      <CorporateMembershipForm
        onSubmit={onSubmit}
        error={isEditMode ? patchError : error}
        isPending={isEditMode ? patchIsPending : isPending}
        isEditMode={isEditMode}
      />
    </FormProvider>
  );
}
