"use client";

import { useGet } from "@/src/hooks/useGet";
import { usePatch } from "@/src/hooks/usePatch";
import { yupResolver } from "@hookform/resolvers/yup";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { toast } from "react-toastify";
import {
  contactInfoSchema,
  ContactInfoSchemaForm,
} from "../Schema/contactInfoSchema";
import { IContactInfo } from "../types";
import ContactInfoForm from "./ContactInfoForm";

export default function CreateUpdateContactInfo({
  initialValues,
}: {
  initialValues?: IContactInfo;
}) {
  const router = useRouter();

  const { data: contactInfoData } = useGet<IContactInfo>("/contact-info", [
    "contact-info",
  ]);

  const {
    mutateAsync: patchMutateAsync,
    error: patchError,
    isPending: patchIsPending,
  } = usePatch(() => {
    toast.success("Contact info updated successfully!");
    router.push("/admin/contact-info");
  }, [["contact-info"]]);

  const fetchedContactInfo = contactInfoData?.data;
  const effectiveInitialValues = initialValues ?? fetchedContactInfo;

  const methods = useForm({
    resolver: yupResolver(contactInfoSchema),
    mode: "onChange",
    defaultValues: {
      phones: [],
      emails: [],
      phoneInput: "",
      emailInput: "",
      officeHour: "",
      officeHourTemp: "",
    },
  });

  useEffect(() => {
    if (effectiveInitialValues) {
      methods.reset({
        phones: (effectiveInitialValues.phones || []).map((phoneNumber) => ({
          number: phoneNumber,
        })),
        emails: (effectiveInitialValues.emails || []).map((emailAddress) => ({
          email: emailAddress,
        })),
        phoneInput: "",
        emailInput: "",
        officeHour: effectiveInitialValues.office_hour || "",
        officeHourTemp: effectiveInitialValues.office_hour || "",
      });
      return;
    }

    methods.reset({
      phones: [],
      emails: [],
      phoneInput: "",
      emailInput: "",
      officeHour: "",
      officeHourTemp: "",
    });
  }, [effectiveInitialValues, methods]);

  const onSubmit = (data: ContactInfoSchemaForm) => {
    const payload = {
      phones: (data.phones || [])
        .map((item) => item.number?.trim())
        .filter(Boolean),
      emails: (data.emails || [])
        .map((item) => item.email?.trim())
        .filter(Boolean),
      office_hour: (data.officeHourTemp || data.officeHour || "").trim(),
    };

    patchMutateAsync({
      url: "/contact-info",
      data: payload,
    }).catch((err) => {
      toast.error(err?.message || "Failed to update contact info");
    });
  };

  return (
    <FormProvider {...methods}>
      <ContactInfoForm
        isEditMode={Boolean(effectiveInitialValues)}
        onSubmit={onSubmit}
        error={patchError}
        isPending={patchIsPending}
      />
    </FormProvider>
  );
}
