"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/src/components/ui/dialog";
import { StatusType } from "@/src/types/common/common";
import { yupResolver } from "@hookform/resolvers/yup";
import { useEffect } from "react";
import { FormProvider, useForm } from "react-hook-form";
import {
  CorporateEmployeeModalSchemaForm,
  corporateEmployeeModalSchema,
} from "../Schema/corporateEmployeeModalSchema";
import { ICorporateEmployee } from "../types";
import CorporateEmployeeModalForm from "./CorporateEmployeeModalForm";

type EmployeeStatus =
  | StatusType.ACTIVE
  | StatusType.INACTIVE
  | StatusType.PENDING
  | StatusType.REJECTED;

const normalizeStatus = (status: unknown): EmployeeStatus => {
  const normalized = String(status).toUpperCase();

  if (normalized === StatusType.INACTIVE) return StatusType.INACTIVE;
  if (normalized === StatusType.PENDING) return StatusType.PENDING;
  if (normalized === StatusType.REJECTED) return StatusType.REJECTED;

  return StatusType.ACTIVE;
};

export default function CreateUpdateCorporateEmployeeModal({
  isOpen,
  onClose,
  onSave,
  initialValues,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSave: (employee: ICorporateEmployee) => void;
  initialValues?: ICorporateEmployee;
}) {
  const methods = useForm<CorporateEmployeeModalSchemaForm>({
    resolver: yupResolver(corporateEmployeeModalSchema),
    defaultValues: {
      employeeId: "",
      name: "",
      designation: "",
      phone: "",
      email: "",
      status: StatusType.ACTIVE,
    },
    mode: "onChange",
  });

  useEffect(() => {
    if (!isOpen) return;

    methods.reset({
      employeeId: initialValues?.employeeId || "",
      name: initialValues?.name || "",
      designation: initialValues?.designation || "",
      phone: initialValues?.phone || "",
      email: initialValues?.email || "",
      status: normalizeStatus(initialValues?.status),
    });
  }, [initialValues, isOpen, methods]);

  const handleSubmit = methods.handleSubmit((value) => {
    const normalizedStatus = normalizeStatus(value.status);

    onSave({
      employeeId: value.employeeId,
      name: value.name,
      designation: value.designation,
      phone: value.phone,
      email: value.email,
      status: normalizedStatus,
    });
    onClose();
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white min-w-[60vw] overflow-y-auto max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-2xl text-secondary-dark">
            {initialValues ? "Update Employee" : "Add Employee"}
          </DialogTitle>
        </DialogHeader>

        <FormProvider {...methods}>
          <CorporateEmployeeModalForm
            onSubmit={() => {
              handleSubmit();
            }}
            onClose={onClose}
            isEditMode={Boolean(initialValues)}
          />
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}
