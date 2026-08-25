"use client";

import { usePatch } from "@/src/hooks/usePatch";
import { usePost } from "@/src/hooks/usePost";
import { StatusType } from "@/src/types/common/common";
import { yupResolver } from "@hookform/resolvers/yup";
import { useEffect } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { toast } from "react-toastify";
import {
  departmentSchema,
  DepartmentSchemaForm,
} from "../Schema/departmentSchema";
import { IDepartment } from "../types";
import DepartmentForm from "./DepartmentForm";

const getInitialStatus = (status?: string) =>
  status === StatusType.INACTIVE ? StatusType.INACTIVE : StatusType.ACTIVE;

export default function CreateUpdateDepartment({
  initialValues,
  onCancel,
  onSuccess,
}: {
  initialValues?: IDepartment;
  onCancel: () => void;
  onSuccess?: () => void;
}) {
  const { mutateAsync, error, isPending } = usePost(
    "/department",
    () => {
      toast.success("Department created successfully!");
      onSuccess?.();
    },
    [["departments"]]
  );

  const {
    mutateAsync: patchMutateAsync,
    error: patchError,
    isPending: patchIsPending,
  } = usePatch(() => {
    toast.success("Department updated successfully!");
    onSuccess?.();
  }, [["departments"]]);

  const methods = useForm<DepartmentSchemaForm>({
    resolver: yupResolver(departmentSchema),
    defaultValues: {
      name: initialValues?.name || "",
      status: getInitialStatus(initialValues?.status),
    },
  });

  useEffect(() => {
    if (initialValues) {
      methods.reset({
        name: initialValues.name || "",
        status: getInitialStatus(initialValues.status),
      });
    } else {
      methods.reset({
        name: "",
        status: StatusType.ACTIVE,
      });
    }
  }, [initialValues, methods]);

  const onSubmit = (data: DepartmentSchemaForm) => {
    const payload = {
      name: data.name,
      status: data.status,
    };

    if (initialValues) {
      patchMutateAsync({
        url: `/department/${initialValues.id}`,
        data: payload,
      }).catch((err) => {
        toast.error(err?.message || "Failed to update department");
      });
    } else {
      mutateAsync(payload).catch((err) => {
        toast.error(err?.message || "Failed to create department");
      });
    }
  };

  return (
    <FormProvider {...methods}>
      <DepartmentForm
        isEditMode={!!initialValues}
        onSubmit={onSubmit}
        onCancel={onCancel}
        error={initialValues ? patchError : error}
        isPending={initialValues ? patchIsPending : isPending}
      />
    </FormProvider>
  );
}
