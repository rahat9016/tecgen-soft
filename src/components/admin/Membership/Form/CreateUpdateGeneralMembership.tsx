"use client";

import { usePatch } from "@/src/hooks/usePatch";
import { usePost } from "@/src/hooks/usePost";
import { yupResolver } from "@hookform/resolvers/yup";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { FormProvider, Resolver, useForm } from "react-hook-form";
import { toast } from "react-toastify";
import {
  generalMembershipSchema,
  GeneralMembershipSchemaForm,
} from "../Schema/generalMembershipSchema";
import { IGeneralMembership } from "../types";
import GeneralMembershipForm from "./GeneralMembershipForm";
import {
  cleanGeneralMembershipPayload,
  getDefaultValues,
} from "./getDefaultValues";

export default function CreateUpdateGeneralMembership({
  initialValues,
}: {
  initialValues?: IGeneralMembership;
}) {
  const router = useRouter();
  const isEditMode = Boolean(initialValues?.id);

  const { mutateAsync, error, isPending } = usePost(
    "/general-membership",
    () => {
      toast.success("General membership created successfully!");
      router.push("/admin/general-membership");
    },
    [["general-membership"]]
  );

  const {
    mutateAsync: patchMutateAsync,
    error: patchError,
    isPending: patchIsPending,
  } = usePatch(() => {
    toast.success("General membership updated successfully!");
    router.push("/admin/general-membership");
  }, [["general-membership"]]);

  const methods = useForm<GeneralMembershipSchemaForm>({
    resolver: yupResolver(
      generalMembershipSchema
    ) as unknown as Resolver<GeneralMembershipSchemaForm>,
    values: initialValues
      ? getDefaultValues(initialValues)
      : getDefaultValues(),
  });

  useEffect(() => {
    methods.reset(getDefaultValues(initialValues));
  }, [initialValues, methods]);

  const onSubmit = (data: GeneralMembershipSchemaForm) => {
    const payload = cleanGeneralMembershipPayload(data);

    if (isEditMode && initialValues?.id) {
      patchMutateAsync({
        url: `/general-membership/${initialValues.id}`,
        data: payload,
      }).catch((err) => {
        toast.error(err?.message || "Failed to update general membership");
      });
      return;
    }

    mutateAsync(payload as unknown as Record<string, unknown>).catch((err) => {
      toast.error(err?.message || "Failed to create general membership");
    });
  };

  return (
    <FormProvider {...methods}>
      <GeneralMembershipForm
        onSubmit={onSubmit}
        error={isEditMode ? patchError : error}
        isPending={isEditMode ? patchIsPending : isPending}
        isEditMode={isEditMode}
      />
    </FormProvider>
  );
}
