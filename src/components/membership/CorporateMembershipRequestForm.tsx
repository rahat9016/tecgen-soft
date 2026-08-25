"use client";

import { yupResolver } from "@hookform/resolvers/yup";
import { useEffect, useState } from "react";
import { FormProvider, Resolver, useForm } from "react-hook-form";
import { toast } from "react-toastify";

import {
  corporateMembershipSchema,
  CorporateMembershipSchemaForm,
} from "@/src/components/admin/Membership/Schema/corporateMembershipSchema";
import { usePost } from "@/src/hooks/usePost";
import { StatusType } from "@/src/types/common/common";
import ErrorMessage from "../shared/Errors/ErrorMessage";
import ControlledInputField from "../shared/FromController/ControlledInputField";
import ControlledSelectField from "../shared/FromController/ControlledSelectField";
import InputLabel from "../shared/InputLabel";
import { Button } from "../ui/button";
import {
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import MembershipSuccessContent from "./MembershipSuccessContent";

type CorporateMembershipRequestFormProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  packageId?: string;
  packageTitle?: string;
};

const successTitle = "Thank you for your request!";
const successDescription =
  "We’ve received your corporate membership request. Our team will review the details and contact you shortly with the next steps.";

const statusOptions = [
  { label: "Active", value: StatusType.ACTIVE },
  { label: "Inactive", value: StatusType.INACTIVE },
  { label: "Pending", value: StatusType.PENDING },
  { label: "Rejected", value: StatusType.REJECTED },
];

const createDefaultValues = (
  packageId?: string
): CorporateMembershipSchemaForm => ({
  companyName: "",
  contactPerson: "",
  contactNumber: "",
  totalEmployees: 1,
  email: "",
  contactPersonDesignation: "",
  address: "",
  tradeLicense: "",
  industryType: "",
  discount: undefined,
  status: StatusType.PENDING,
  packageId: packageId || "",
  employees: undefined,
});

const cleanCorporateMembershipPayload = (
  values: CorporateMembershipSchemaForm,
  packageId?: string
) => {
  const totalEmployees = Number(values.totalEmployees);

  return {
    ...values,
    totalEmployees: Number.isNaN(totalEmployees) ? 0 : totalEmployees,
    packageId: packageId || values.packageId,
    contactPersonDesignation: values.contactPersonDesignation || "N/A",
    address: values.address || undefined,
    tradeLicense: values.tradeLicense || undefined,
    industryType: values.industryType || undefined,
    discount: values.discount ?? undefined,
    status: values.status || StatusType.PENDING,
    employees:
      values.employees && values.employees.length > 0
        ? values.employees
        : undefined,
  };
};

export default function CorporateMembershipRequestForm({
  open,
  onOpenChange,
  packageId,
  packageTitle,
}: CorporateMembershipRequestFormProps) {
  const [isSuccess, setIsSuccess] = useState(false);
  const methods = useForm<CorporateMembershipSchemaForm>({
    resolver: yupResolver(
      corporateMembershipSchema
    ) as Resolver<CorporateMembershipSchemaForm>,
    defaultValues: createDefaultValues(packageId),
  });

  const { mutateAsync, isPending, error } = usePost(
    "/corporate-membership",
    () => {
      toast.success("Corporate membership request submitted successfully!");
      setIsSuccess(true);
      methods.reset(createDefaultValues(packageId));
    },
    [["corporate-membership"]]
  );

  useEffect(() => {
    if (!open) return;

    methods.reset(createDefaultValues(packageId));
  }, [methods, open, packageId]);

  useEffect(() => {
    if (!isSuccess) return;

    const timer = window.setTimeout(() => {
      setIsSuccess(false);
      onOpenChange(false);
    }, 3000);

    return () => window.clearTimeout(timer);
  }, [isSuccess, onOpenChange]);

  const handleSubmit = methods.handleSubmit((values) => {
    const payload = cleanCorporateMembershipPayload(values, packageId);

    mutateAsync(payload).catch((requestError) => {
      toast.error(
        requestError?.message || "Failed to submit corporate membership request"
      );
    });
  });

  return (
    <DialogContent className="bg-white min-w-[90vw] lg:min-w-[55vw] overflow-y-auto max-h-[90vh]">
      {isSuccess ? (
        <MembershipSuccessContent
          title={successTitle}
          description={successDescription}
        />
      ) : (
        <>
          <DialogHeader>
            <DialogTitle className="text-2xl text-secondary-dark">
              Request Corporate Membership
            </DialogTitle>
            <DialogDescription>
              {packageTitle
                ? `Package: ${packageTitle}`
                : "Submit your corporate membership request"}
            </DialogDescription>
          </DialogHeader>

          <FormProvider {...methods}>
            <form onSubmit={handleSubmit} className="space-y-6 pt-2">
              <div className="bg-white">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <InputLabel label="Company Name" required />
                    <ControlledInputField
                      className="bg-light"
                      name="companyName"
                      placeholder="Enter company name"
                    />
                  </div>

                  <div>
                    <InputLabel label="Contact Person" required />
                    <ControlledInputField
                      className="bg-light"
                      name="contactPerson"
                      placeholder="Enter contact person"
                    />
                  </div>

                  <div>
                    <InputLabel label="Contact Number" required />
                    <ControlledInputField
                      className="bg-light"
                      name="contactNumber"
                      placeholder="01712345678"
                    />
                  </div>

                  <div>
                    <InputLabel label="Email" required />
                    <ControlledInputField
                      className="bg-light"
                      name="email"
                      type="email"
                      placeholder="company@gmail.com"
                    />
                  </div>

                  <div>
                    <InputLabel label="Total Employees" required />
                    <ControlledInputField
                      className="bg-light"
                      name="totalEmployees"
                      type="number"
                      placeholder="Enter total employees"
                    />
                  </div>

                  <div>
                    <InputLabel label="Contact Person Designation (Optional)" />
                    <ControlledInputField
                      className="bg-light"
                      name="contactPersonDesignation"
                      placeholder="Manager"
                    />
                  </div>

                  <div>
                    <InputLabel label="Address (Optional)" />
                    <ControlledInputField
                      className="bg-light"
                      name="address"
                      placeholder="Dhaka, Bangladesh"
                    />
                  </div>

                  <div>
                    <InputLabel label="Trade License (Optional)" />
                    <ControlledInputField
                      className="bg-light"
                      name="tradeLicense"
                      placeholder="TRADE-123"
                    />
                  </div>

                  <div>
                    <InputLabel label="Industry Type (Optional)" />
                    <ControlledInputField
                      className="bg-light"
                      name="industryType"
                      placeholder="IT"
                    />
                  </div>

                  <div>
                    <InputLabel label="Discount (%) (Optional)" />
                    <ControlledInputField
                      className="bg-light"
                      name="discount"
                      type="number"
                      placeholder="Enter discount"
                    />
                  </div>

                  <div>
                    <InputLabel label="Status (Optional)" />
                    <ControlledSelectField
                      name="status"
                      placeholder="Select status"
                      options={statusOptions}
                      className="bg-light shadow-none"
                    />
                  </div>

                  <input
                    type="hidden"
                    value={packageId || ""}
                    {...methods.register("packageId")}
                  />
                </div>
              </div>

              <ErrorMessage error={error} />

              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end pt-2">
                <Button
                  type="button"
                  onClick={() => onOpenChange(false)}
                  className="bg-transparent hover:bg-transparent text-secondary-foreground border shadow-none"
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isPending}>
                  {isPending ? "Submitting..." : "Submit Request"}
                </Button>
              </div>
            </form>
          </FormProvider>
        </>
      )}
    </DialogContent>
  );
}
