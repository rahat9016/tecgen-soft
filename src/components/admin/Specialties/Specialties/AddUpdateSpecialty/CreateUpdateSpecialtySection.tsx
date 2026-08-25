"use client";

import ControlledInputField from "@/src/components/shared/FromController/ControlledInputField";
import ControlledSelectField from "@/src/components/shared/FromController/ControlledSelectField";
import ControlledTextareaField from "@/src/components/shared/FromController/ControlledTextareaField";
import InputLabel from "@/src/components/shared/InputLabel";
import { Button } from "@/src/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/src/components/ui/dialog";
import { yupResolver } from "@hookform/resolvers/yup";
import { useEffect } from "react";
import { FormProvider, Resolver, useForm } from "react-hook-form";
import * as yup from "yup";
import { ISectionItem, StatusValue } from "./types";

const sectionItemSchema = yup.object({
  title: yup.string().required("Title is required"),
  description: yup.string().optional(),
  status: yup
    .mixed<StatusValue>()
    .oneOf(["ACTIVE", "INACTIVE"])
    .required("Status is required"),
});

type SectionItemForm = yup.InferType<typeof sectionItemSchema>;

export default function CreateUpdateSpecialtySection({
  isOpen,
  onClose,
  initialValues,
  onSave,
}: {
  isOpen: boolean;
  onClose: () => void;
  initialValues?: ISectionItem | undefined;
  onSave: (item: ISectionItem) => void;
}) {
  const methods = useForm<SectionItemForm>({
    resolver: yupResolver(sectionItemSchema) as Resolver<SectionItemForm>,
    defaultValues: {
      title: "",
      description: "",
      status: "ACTIVE",
    },
    mode: "onChange",
  });

  useEffect(() => {
    if (!isOpen) return;

    methods.reset({
      title: initialValues?.title || "",
      description: initialValues?.description || "",
      status: initialValues?.status || "ACTIVE",
    });
  }, [initialValues, isOpen, methods]);

  const handleSubmit = methods.handleSubmit((data) => {
    onSave({
      id: initialValues?.id,
      title: data.title,
      description: data.description,
      status: data.status,
    });
    onClose();
  });

  const statusOptions = [
    { label: "Active", value: "ACTIVE" },
    { label: "Inactive", value: "INACTIVE" },
  ];

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className="bg-white min-h-[20vh] min-w-[50vw] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl text-secondary-dark">
            {initialValues ? "Edit List Item" : "Add List Item"}
          </DialogTitle>
        </DialogHeader>

        <FormProvider {...methods}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 border border-light-silver p-4 rounded-lg">
              <div className="lg:col-span-1 col-span-2">
                <InputLabel label="Title" required />
                <ControlledInputField name="title" placeholder="Enter title" />
              </div>

              <div className="lg:col-span-1 col-span-2">
                <InputLabel label="Status" required />
                <ControlledSelectField
                  name="status"
                  placeholder="Select status"
                  options={statusOptions}
                  className="bg-white shadow-none"
                />
              </div>

              <div className="col-span-2">
                <InputLabel label="Description" />
                <ControlledTextareaField
                  name="description"
                  placeholder="Enter description"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <Button
                type="button"
                onClick={onClose}
                className="text-secondary-foreground bg-transparent hover:bg-transparent border shadow-none cursor-pointer"
              >
                Cancel
              </Button>
              <Button className="text-white" type="submit">
                {initialValues ? "Update Item" : "Add Item"}
              </Button>
            </div>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}
