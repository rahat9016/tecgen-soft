"use client";

import {
  generalMembershipSchema,
  GeneralMembershipSchemaForm,
} from "@/src/components/admin/Membership/Schema/generalMembershipSchema";
import { DialogContent } from "@/src/components/ui/dialog";
import { usePost } from "@/src/hooks/usePost";
import { yupResolver } from "@hookform/resolvers/yup";
import { useEffect, useState } from "react";
import { FormProvider, Resolver, useForm } from "react-hook-form";
import { toast } from "react-toastify";
import MembershipSuccessContent from "../MembershipSuccessContent";
import GeneralMembershipForm from "./GeneralMembershipForm";
import {
  cleanGeneralMembershipPayload,
  getDefaultValues,
} from "./getDefaultValues";

type GeneralMembershipRequestFormProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const successTitle = "Thank you for joining!";
const successDescription =
  "We’ve received your membership application. Our team will review your details and send a confirmation email once your membership is approved.";

export default function GeneralMembershipRequestForm({
  open,
  onOpenChange,
}: GeneralMembershipRequestFormProps) {
  const [isSuccess, setIsSuccess] = useState(false);
  const methods = useForm<GeneralMembershipSchemaForm>({
    resolver: yupResolver(
      generalMembershipSchema
    ) as Resolver<GeneralMembershipSchemaForm>,
    defaultValues: getDefaultValues(),
  });

  const { mutateAsync, isPending, error } = usePost(
    "/general-membership",
    () => {
      toast.success("General membership request submitted successfully!");
      setIsSuccess(true);
      methods.reset(getDefaultValues());
    },
    [["general-membership"]]
  );

  useEffect(() => {
    if (!open) return;

    methods.reset(getDefaultValues());
  }, [methods, open]);

  useEffect(() => {
    if (!isSuccess) return;

    const timer = window.setTimeout(() => {
      setIsSuccess(false);
      onOpenChange(false);
    }, 3000);

    return () => window.clearTimeout(timer);
  }, [isSuccess, onOpenChange]);
  const onSubmit = (values: GeneralMembershipSchemaForm) => {
    const payload = cleanGeneralMembershipPayload(values);

    mutateAsync(payload).catch((requestError) => {
      toast.error(
        requestError?.message || "Failed to submit membership request"
      );
    });
  };

  return (
    <DialogContent className="bg-white min-w-[90vw] lg:min-w-[50vw] overflow-y-auto max-h-[90vh] p-6 lg:p-10">
      {isSuccess ? (
        <MembershipSuccessContent
          title={successTitle}
          description={successDescription}
        />
      ) : (
        <>
          <FormProvider {...methods}>
            <GeneralMembershipForm
              onSubmit={onSubmit}
              onClose={() => onOpenChange(false)}
              error={error}
              isPending={isPending}
            />
          </FormProvider>
        </>
      )}
    </DialogContent>
  );
}
