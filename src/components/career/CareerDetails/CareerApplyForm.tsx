import ControlledInputField from "@/src/components/shared/FromController/ControlledInputField";
import ControlledSelectField from "@/src/components/shared/FromController/ControlledSelectField";
import InputLabel from "@/src/components/shared/InputLabel";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { ArrowRight } from "lucide-react";
import { Controller, useFormContext } from "react-hook-form";
import { CareerApplySchemaForm } from "./Schema/careerApplySchema";

interface CareerApplyFormProps {
  onSubmit: (data: CareerApplySchemaForm) => void;
  isPending?: boolean;
  careerTitle: string;
}

export default function CareerApplyForm({
  onSubmit,
  isPending = false,
  careerTitle,
}: CareerApplyFormProps) {
  const {
    handleSubmit,
    formState: { errors },
  } = useFormContext<CareerApplySchemaForm>();

  const genderOptions = [
    { label: "Male", value: "MALE" },
    { label: "Female", value: "FEMALE" },
  ];

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="w-full space-y-5 lg:space-y-6"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
        <div>
          <InputLabel label="Full Name" required />
          <ControlledInputField
            className="bg-light"
            name="fullName"
            placeholder="Enter your full name"
          />
        </div>

        <div>
          <InputLabel label="Applying For" />
          <Input value={careerTitle} readOnly className="bg-light" />
        </div>

        <div>
          <InputLabel label="Gender" required />
          <ControlledSelectField
            name="gender"
            placeholder="Select gender"
            options={genderOptions}
            className="bg-light shadow-none"
          />
        </div>

        <div>
          <InputLabel label="Phone Number" required />
          <ControlledInputField
            className="bg-light"
            name="phone"
            placeholder="Enter your phone number"
          />
        </div>

        <div>
          <InputLabel label="Email" required />
          <ControlledInputField
            className="bg-light"
            name="email"
            placeholder="Enter email"
            type="email"
          />
        </div>

        <div>
          <InputLabel label="Resume" required />
          <Controller
            name="resume"
            render={({ field }) => (
              <div>
                <Input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  className="bg-light file:h-9 file:px-3 file:rounded file:border file:border-light-silver"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    field.onChange(file);
                  }}
                />
                {errors.resume?.message && (
                  <div className="text-rose-500 text-xs mt-1 pl-2">
                    {errors.resume.message}
                  </div>
                )}
              </div>
            )}
          />
        </div>
      </div>

      <div>
        <Button type="submit" disabled={isPending} className="px-6">
          Submit Application <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </form>
  );
}
