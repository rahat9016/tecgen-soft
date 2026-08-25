import ErrorMessage from "@/src/components/shared/Errors/ErrorMessage";
import ControlledInputField from "@/src/components/shared/FromController/ControlledInputField";
import ControlledSelectField from "@/src/components/shared/FromController/ControlledSelectField";
import ControlledTextareaField from "@/src/components/shared/FromController/ControlledTextareaField";
import { FileUploadController } from "@/src/components/shared/FromController/FileUploadController";
import InputLabel from "@/src/components/shared/InputLabel";
import Paragraph from "@/src/components/shared/Paragraph";
import SubmitButton from "@/src/components/shared/SubmitButton";
import { Button } from "@/src/components/ui/button";
import { ErrorType, StatusType } from "@/src/types/common/common";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useFormContext } from "react-hook-form";
import { MediaVideoSchemaForm } from "../Schema/mediaVideoSchema";

export default function MediaVideoForm({
  isEditMode = false,
  onSubmit,
  error,
  isPending = false,
}: {
  isEditMode?: boolean;
  onSubmit: (data: MediaVideoSchemaForm) => void;
  error?: ErrorType | null;
  isPending?: boolean;
}) {
  const router = useRouter();

  const { handleSubmit, reset } = useFormContext<MediaVideoSchemaForm>();

  const statusOptions = [
    { label: "Active", value: StatusType.ACTIVE },
    { label: "Inactive", value: StatusType.INACTIVE },
  ];

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
          <Paragraph className="xl:text-lg font-medium">
            Video Information
          </Paragraph>
        </div>
        <div className="mt-6">
          <FileUploadController name="videoThumbnail" />
        </div>
        {/* Fields */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-y-6 gap-x-6 mt-6">
          <div>
            <InputLabel label="Title" />
            <ControlledInputField
              className="bg-light"
              name="title"
              placeholder="Enter video title..."
            />
          </div>
          <div>
            <InputLabel label="Link" />
            <ControlledInputField
              className="bg-light"
              name="link"
              placeholder="https://example.com/video"
            />
          </div>
          <div>
            <InputLabel label="Duration" />
            <ControlledInputField
              className="bg-light"
              name="duration"
              placeholder="10:30"
            />
          </div>
          <div>
            <InputLabel label="Status" />
            <ControlledSelectField
              name="status"
              placeholder="Select status"
              options={statusOptions}
              className="bg-light shadow-none"
            />
          </div>
          <div className="lg:col-span-4">
            <InputLabel label="Description" />
            <ControlledTextareaField
              className="bg-light"
              name="description"
              placeholder="Enter video description"
            />
          </div>
        </div>
      </div>

      {/* Footer */}
      <ErrorMessage error={error} />

      <div className="flex items-center justify-end gap-4">
        <Button
          onClick={() => {
            router.push("/admin/video-gallery");
            reset();
          }}
          type="button"
          className="text-secondary-foreground bg-transparent hover:bg-transparent border shadow-none cursor-pointer"
        >
          Cancel
        </Button>

        <SubmitButton
          isLoading={isPending}
          label={isEditMode ? "Update Video" : "Create Video"}
        />
      </div>
    </form>
  );
}
