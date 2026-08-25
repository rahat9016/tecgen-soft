"use client";

import { usePost } from "@/src/hooks/usePost";
import { yupResolver } from "@hookform/resolvers/yup";
import { FormProvider, useForm } from "react-hook-form";
import { toast } from "react-toastify";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../ui/dialog";
import CareerApplyForm from "./CareerApplyForm";
import {
  CareerApplySchemaForm,
  careerApplySchema,
} from "./Schema/careerApplySchema";

interface ApplyJobModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  careerId: string;
  careerTitle: string;
}

export default function ApplyJobModal({
  open,
  onOpenChange,
  careerId,
  careerTitle,
}: ApplyJobModalProps) {
  const methods = useForm<CareerApplySchemaForm>({
    resolver: yupResolver(careerApplySchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      gender: undefined,
      resume: undefined,
      careerId,
    },
  });

  const { mutateAsync, isPending } = usePost(
    "/applicant",
    () => {
      toast.success("Application submitted successfully!");
      methods.reset({
        fullName: "",
        email: "",
        phone: "",
        gender: undefined,
        resume: undefined,
        careerId,
      });
      onOpenChange(false);
    },
    [["applicants"]]
  );

  const onSubmit = (data: CareerApplySchemaForm) => {
    const formData = new FormData();
    formData.append("fullName", data.fullName);
    formData.append("email", data.email);
    formData.append("phone", data.phone);
    formData.append("gender", data.gender);
    formData.append("careerId", careerId);

    if (data.resume instanceof File) {
      formData.append("resume", data.resume);
    }

    mutateAsync(formData).catch((err) => {
      toast.error(err?.message || "Failed to submit application");
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="min-w-[60vw] overflow-y-auto p-6 lg:p-8">
        <DialogHeader>
          <DialogTitle className="text-2xl text-secondary">
            Apply here
          </DialogTitle>
        </DialogHeader>

        <FormProvider {...methods}>
          <CareerApplyForm
            onSubmit={onSubmit}
            isPending={isPending}
            careerTitle={careerTitle}
          />
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}
