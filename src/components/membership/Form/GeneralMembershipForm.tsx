import { GeneralMembershipSchemaForm } from "@/src/components/admin/Membership/Schema/generalMembershipSchema";
import { RelationshipType } from "@/src/components/admin/Membership/types";
import ErrorMessage from "@/src/components/shared/Errors/ErrorMessage";
import ControlledInputField from "@/src/components/shared/FromController/ControlledInputField";
import ControlledSelectField from "@/src/components/shared/FromController/ControlledSelectField";
import InputLabel from "@/src/components/shared/InputLabel";
import { Button } from "@/src/components/ui/button";
import {
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/src/components/ui/dialog";
import { ErrorType, Gender } from "@/src/types/common/common";
import { useFormContext } from "react-hook-form";

type GeneralMembershipFormProps = {
  onSubmit: (values: GeneralMembershipSchemaForm) => void;
  onClose: () => void;
  isPending?: boolean;
  error?: ErrorType | null;
};

export default function GeneralMembershipForm({
  onSubmit,
  onClose,
  isPending = false,
  error,
}: GeneralMembershipFormProps) {
  const { handleSubmit } = useFormContext<GeneralMembershipSchemaForm>();

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

  return (
    <>
      <DialogHeader>
        <DialogTitle className="text-2xl text-secondary-dark">
          Request General Membership
        </DialogTitle>
        <DialogDescription className="text-secondary-foreground text-xl font-medium mt-6">
          Personal Information
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 pt-4">
        <div className="bg-white">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <InputLabel label="Full Name" required />
              <ControlledInputField name="name" placeholder="Enter your Name" />
            </div>

            <div>
              <InputLabel label="Date of Birth" isOptional />
              <ControlledInputField name="dateOfBirth" type="date" />
            </div>

            <div>
              <InputLabel label="Gender" required />
              <ControlledSelectField
                name="gender"
                placeholder="Select gender"
                options={genderOptions}
                className="shadow-none h-11"
              />
            </div>

            <div>
              <InputLabel label="National ID / Passport Number " isOptional />
              <ControlledInputField
                name="nationalId"
                placeholder="Enter national ID / passport number"
              />
            </div>

            <div>
              <InputLabel label="Mobile Number" required />
              <ControlledInputField
                name="contactNumber"
                placeholder="01712345678"
              />
            </div>

            <div>
              <InputLabel label="Blood Group" isOptional />
              <ControlledSelectField
                name="bloodGroup"
                placeholder="Select blood group"
                options={bloodGroupOptions}
                className="shadow-none h-11"
              />
            </div>

            <div>
              <InputLabel label="Email" required />
              <ControlledInputField
                name="email"
                placeholder="user@gmail.com"
                type="email"
              />
            </div>

            <div>
              <InputLabel label="Address" isOptional />
              <ControlledInputField
                name="address"
                placeholder="Enter your present address"
              />
            </div>
          </div>
        </div>

        <div className="bg-white mt-6">
          <h3 className="text-xl font-medium text-secondary-foreground mb-4">
            Emergency Contact <span className="text-[#BDBDBD]">(Optional)</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <InputLabel label="Name" isOptional />
              <ControlledInputField
                name="emergency.name"
                placeholder="Emergency Contact Person Name"
              />
            </div>

            <div>
              <InputLabel label="Mobile Number" isOptional />
              <ControlledInputField
                name="emergency.phone"
                placeholder="Enter your Phone Number"
                className="h-11"
              />
            </div>

            <div>
              <InputLabel label="Relation" isOptional />
              <ControlledSelectField
                name="emergency.relation"
                placeholder="Select Relationship"
                options={relationOptions}
                className="shadow-none h-11"
              />
            </div>
          </div>
        </div>

        <ErrorMessage error={error} />

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end pt-2">
          <Button
            type="button"
            onClick={onClose}
            className="bg-transparent hover:bg-transparent text-secondary-foreground border shadow-none"
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending ? "Submitting..." : "Submit Request"}
          </Button>
        </div>
      </form>
    </>
  );
}
