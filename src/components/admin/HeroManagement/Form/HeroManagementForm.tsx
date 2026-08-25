import ErrorMessage from "@/src/components/shared/Errors/ErrorMessage";
import ControlledInputField from "@/src/components/shared/FromController/ControlledInputField";
import ControlledTextareaField from "@/src/components/shared/FromController/ControlledTextareaField";
import { MultipleImageUploadController } from "@/src/components/shared/FromController/MultipleImageFileInput";
import InputLabel from "@/src/components/shared/InputLabel";
import Paragraph from "@/src/components/shared/Paragraph";
import SubmitButton from "@/src/components/shared/SubmitButton";
import { ErrorType } from "@/src/types/common/common";
import Image from "next/image";
import { useFormContext } from "react-hook-form";
import { HeroManagementSchemaForm } from "../Schema/heroManagementSchema";

export default function HeroManagementForm({
  isEditMode = false,
  onSubmit,
  error,
  isPending = false,
}: {
  isEditMode?: boolean;
  onSubmit: (data: HeroManagementSchemaForm) => void;
  error?: ErrorType | null;
  isPending?: boolean;
}) {
  const { handleSubmit } = useFormContext<HeroManagementSchemaForm>();

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="w-full space-y-6">
      <div className="border border-light-silver rounded-lg p-8 bg-white">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 w-9 h-9 flex items-center justify-center rounded-md border border-primary/20">
            <Image
              src={"/icons/media.svg"}
              alt="basic information"
              width={36}
              height={36}
              className="w-4"
            />
          </div>
          <Paragraph className="xl:text-lg font-medium">Image</Paragraph>
        </div>

        <div className="mt-6">
          <MultipleImageUploadController name="images" maxFiles={5} />
        </div>

        <div className="flex flex-col gap-y-6 gap-x-6 mt-6">
          <div>
            <InputLabel label="Title" />
            <ControlledInputField
              name="title"
              placeholder="Your Health, Our Priority"
              className="bg-light shadow-none"
            />
          </div>
          <div>
            <InputLabel label="Description" />
            <ControlledTextareaField
              name="description"
              placeholder="Write here your..."
              className="bg-light shadow-none"
            />
          </div>
        </div>
      </div>

      {/* Footer */}
      <ErrorMessage error={error} />

      <div className="flex items-center justify-end gap-4">
        <SubmitButton
          isLoading={isPending}
          label={isEditMode ? "Updating Changes" : "Update Changes"}
        />
      </div>
    </form>
  );
}
