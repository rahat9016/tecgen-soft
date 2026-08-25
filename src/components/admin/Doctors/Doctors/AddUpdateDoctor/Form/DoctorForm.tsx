"use client";

import ErrorMessage from "@/src/components/shared/Errors/ErrorMessage";
import ControlledInputField from "@/src/components/shared/FromController/ControlledInputField";
import ControlledSelectField from "@/src/components/shared/FromController/ControlledSelectField";
import { FileUploadController } from "@/src/components/shared/FromController/FileUploadController";
import InputLabel from "@/src/components/shared/InputLabel";
import Paragraph from "@/src/components/shared/Paragraph";
import SubmitButton from "@/src/components/shared/SubmitButton";
import { ErrorType } from "@/src/types/common/common";
import Image from "next/image";
import { useFormContext } from "react-hook-form";
import { IDoctorFormType } from "../types";
import AreaOfExpertise from "./AreaOfExpertise";

export default function DoctorForm({
  onSubmit,
  departmentOptions,
  error,
  isEditMode = false,
  isIdentityLocked = false,
  isPending = false,
}: {
  isEditMode?: boolean;
  isIdentityLocked?: boolean;
  onSubmit: (data: IDoctorFormType) => void;
  departmentOptions: { label: string; value: string }[];
  error?: ErrorType | null;
  isPending?: boolean;
}) {
  const { handleSubmit } = useFormContext<IDoctorFormType>();
  return (
    <div>
      <form onSubmit={handleSubmit(onSubmit)} className="w-full space-y-8">
        {/* ================= Basic Information ================= */}
        <div className="flex flex-col gap-4 p-8 border border-light-silver rounded-lg bg-white">
          <div className="flex items-center justify-between mb-5 xl:mb-8">
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 w-9 h-9 flex items-center justify-center rounded-md border border-primary/20">
                <Image
                  src={"/icons/group.svg"}
                  alt="basic information"
                  width={36}
                  height={36}
                  className="w-4"
                />
              </div>
              <Paragraph className="xl:text-lg font-medium">
                Basic Information
              </Paragraph>
            </div>
          </div>
          <div>
            <FileUploadController name="image" />
          </div>
          <div className="grid grid-cols-1  md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-5 xl:mt-8">
            <div>
              <InputLabel label="Doctor ID" />
              <ControlledInputField
                name="doctorId"
                placeholder="Enter Doctor ID"
                readOnly={isEditMode || isIdentityLocked}
                className="border-light-silver bg-light text-secondary-foreground"
              />
            </div>

            <div>
              <InputLabel label="Full Name" />
              <ControlledInputField
                name="fullName"
                placeholder="Enter full name"
                readOnly={isEditMode || isIdentityLocked}
                className="border-light-silver bg-light text-secondary-foreground"
              />
            </div>

            <div>
              <InputLabel label="Gender" />
              <ControlledSelectField
                name="gender"
                placeholder="Select Gender"
                options={[
                  { label: "Male", value: "MALE" },
                  { label: "Female", value: "FEMALE" },
                  { label: "Other", value: "OTHER" },
                ]}
                className="border-light-silver bg-light text-secondary-foreground"
              />
            </div>

            <div>
              <InputLabel label="Contact Number" />
              <ControlledInputField
                name="contactNumber"
                placeholder="Enter contact number"
                className="border-light-silver bg-light text-secondary-foreground"
              />
            </div>
            <div>
              <InputLabel label="Email" />
              <ControlledInputField
                name="email"
                placeholder="Enter Email"
                className="border-light-silver bg-light text-secondary-foreground"
              />
            </div>
            <div>
              <InputLabel label="Booking Type" />
              <ControlledSelectField
                name="bookingType"
                placeholder="Select Booking Type"
                options={[
                  { label: "Onsite", value: "ONSITE" },
                  { label: "Tele Online", value: "TELE_ONLINE" },
                ]}
                className="border-light-silver bg-light text-secondary-foreground"
              />
            </div>
            <div>
              <InputLabel label="Status" />
              <ControlledSelectField
                name="status"
                placeholder="Select Status"
                options={[
                  { label: "Active", value: "ACTIVE" },
                  { label: "On Leave", value: "ON_LEAVE" },
                ]}
                className="border-light-silver bg-light text-secondary-foreground"
              />
            </div>
          </div>
        </div>

        {/* ================= Specialization & Qualifications ================= */}
        <div className="flex flex-col gap-4 p-8 border border-light-silver rounded-lg bg-white">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 w-9 h-9 flex items-center justify-center rounded-md border border-primary/20">
              <Image
                src={"/icons/spe.svg"}
                alt="basic information"
                width={36}
                height={36}
                className="w-4"
              />
            </div>
            <Paragraph className="xl:text-lg font-medium">
              Specialization & Qualifications
            </Paragraph>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <div>
              <InputLabel label="Department" />
              <ControlledSelectField
                name="department"
                placeholder="Select Department"
                options={departmentOptions}
                className="border-light-silver bg-light text-secondary-foreground"
              />
            </div>

            <div>
              <InputLabel label="Specialization" />
              <ControlledInputField
                name="specialization"
                placeholder="Enter specialization"
                className="border-light-silver bg-light text-secondary-foreground"
              />
            </div>

            <div>
              <InputLabel label="Designation" />
              <ControlledInputField
                name="designation"
                placeholder="Enter designation"
                className="border-light-silver bg-light text-secondary-foreground"
              />
            </div>
          </div>
        </div>
        <AreaOfExpertise />
        <ErrorMessage error={error} />
        <div className="flex items-center justify-end gap-4">
          <SubmitButton isLoading={isPending} label="Save Changes" />
        </div>
      </form>
    </div>
  );
}
