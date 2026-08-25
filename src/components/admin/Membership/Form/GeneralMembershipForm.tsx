import ErrorMessage from "@/src/components/shared/Errors/ErrorMessage";
import ControlledInputField from "@/src/components/shared/FromController/ControlledInputField";
import ControlledSelectField from "@/src/components/shared/FromController/ControlledSelectField";
import InputLabel from "@/src/components/shared/InputLabel";
import Paragraph from "@/src/components/shared/Paragraph";
import SubmitButton from "@/src/components/shared/SubmitButton";
import { Button } from "@/src/components/ui/button";
import { ErrorType, Gender, StatusType } from "@/src/types/common/common";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useFormContext } from "react-hook-form";
import { GeneralMembershipSchemaForm } from "../Schema/generalMembershipSchema";
import { RelationshipType } from "../types";

export default function GeneralMembershipForm({
  onSubmit,
  error,
  isPending = false,
  isEditMode = false,
}: {
  onSubmit: (data: GeneralMembershipSchemaForm) => void;
  error?: ErrorType | null;
  isPending?: boolean;
  isEditMode?: boolean;
}) {
  const router = useRouter();
  const { handleSubmit, reset } = useFormContext<GeneralMembershipSchemaForm>();

  const genderOptions = [
    { label: "Male", value: Gender.MALE },
    { label: "Female", value: Gender.FEMALE },
  ];

  const bloodGroupOptions = [
    { label: "A+", value: "A+" },
    { label: "A-", value: "A-" },
    { label: "B+", value: "B+" },
    { label: "B-", value: "B-" },
    { label: "O+", value: "O+" },
    { label: "O-", value: "O-" },
    { label: "AB+", value: "AB+" },
    { label: "AB-", value: "AB-" },
  ];

  const relationOptions = [
    { label: "Father", value: RelationshipType.FATHER },
    { label: "Mother", value: RelationshipType.MOTHER },
    { label: "Brother", value: RelationshipType.BROTHER },
    { label: "Sister", value: RelationshipType.SISTER },
    { label: "Other", value: RelationshipType.OTHER },
  ];

  const statusOptions = [
    { label: "Active", value: StatusType.ACTIVE },
    { label: "Inactive", value: StatusType.INACTIVE },
    { label: "Pending", value: StatusType.PENDING },
    { label: "Rejected", value: StatusType.REJECTED },
  ];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="w-full space-y-6">
      <div className="border border-light-silver rounded-lg p-8 bg-white">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 w-9 h-9 flex items-center justify-center rounded-md border border-primary/20">
            <Image
              src="/icons/group.svg"
              alt="membership information"
              width={36}
              height={36}
              className="w-4"
            />
          </div>
          <Paragraph className="xl:text-lg font-medium">
            Membership Information
          </Paragraph>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-3 lg:gap-6 mt-6">
          <div>
            <InputLabel label="Full Name" required />
            <ControlledInputField
              className="bg-light"
              name="name"
              placeholder="Enter full name"
            />
          </div>

          <div>
            <InputLabel label="Date of Birth (Optional)" />
            <ControlledInputField
              className="bg-light"
              name="dateOfBirth"
              type="date"
            />
          </div>

          <div>
            <InputLabel label="Gender" required />
            <ControlledSelectField
              name="gender"
              placeholder="Select gender"
              options={genderOptions}
              className="bg-light shadow-none h-11"
            />
          </div>

          <div>
            <InputLabel label="National ID / Passport Number (Optional)" />
            <ControlledInputField
              className="bg-light"
              name="nationalId"
              placeholder="Enter national ID / passport number"
            />
          </div>

          <div>
            <InputLabel label="Mobile Number" required />
            <ControlledInputField
              className="bg-light"
              name="contactNumber"
              placeholder="01712345678"
            />
          </div>

          <div>
            <InputLabel label="Blood Group (Optional)" />
            <ControlledSelectField
              name="bloodGroup"
              placeholder="Select blood group"
              options={bloodGroupOptions}
              className="bg-light shadow-none h-11"
            />
          </div>

          <div>
            <InputLabel label="Email" required />
            <ControlledInputField
              className="bg-light"
              name="email"
              placeholder="user@gmail.com"
              type="email"
            />
          </div>

          <div>
            <InputLabel label="Address (Optional)" />
            <ControlledInputField
              className="bg-light"
              name="address"
              placeholder="Enter your present address"
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
              className="bg-light shadow-none h-11"
            />
          </div>
        </div>
      </div>

      <div className="border border-light-silver rounded-lg p-8 bg-white">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 w-9 h-9 flex items-center justify-center rounded-md border border-primary/20">
            <Image
              src="/icons/reports.svg"
              alt="emergency contact"
              width={36}
              height={36}
              className="w-4"
            />
          </div>
          <Paragraph className="xl:text-lg font-medium">
            Emergency Contact (Optional)
          </Paragraph>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 lg:gap-6 mt-6">
          <div>
            <InputLabel label="Name (Optional)" />
            <ControlledInputField
              className="bg-light"
              name="emergency.name"
              placeholder="Enter emergency contact name"
            />
          </div>

          <div>
            <InputLabel label="Phone (Optional)" />
            <ControlledInputField
              className="bg-light"
              name="emergency.phone"
              placeholder="01712345678"
            />
          </div>

          <div>
            <InputLabel label="Relation (Optional)" />
            <ControlledSelectField
              name="emergency.relation"
              placeholder="Select relation"
              options={relationOptions}
              className="bg-light shadow-none h-11"
            />
          </div>
        </div>
      </div>

      <ErrorMessage error={error} />

      <div className="flex items-center justify-end gap-4">
        <Button
          onClick={() => {
            router.push("/admin/general-membership");
            reset();
          }}
          type="button"
          className="text-secondary-foreground bg-transparent hover:bg-transparent border shadow-none cursor-pointer"
        >
          Cancel
        </Button>
        <SubmitButton
          isLoading={isPending}
          label={isEditMode ? "Update Membership" : "Create Membership"}
        />
      </div>
    </form>
  );
}
