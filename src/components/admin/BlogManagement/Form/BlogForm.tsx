import ErrorMessage from "@/src/components/shared/Errors/ErrorMessage";
import ControlledInputField from "@/src/components/shared/FromController/ControlledInputField";
import ControlledSelectField from "@/src/components/shared/FromController/ControlledSelectField";
import { FileUploadController } from "@/src/components/shared/FromController/FileUploadController";
import InputLabel from "@/src/components/shared/InputLabel";
import Paragraph from "@/src/components/shared/Paragraph";
import StatusBadge from "@/src/components/shared/Status/Status";
import SubmitButton from "@/src/components/shared/SubmitButton";
import TextEditor from "@/src/components/shared/text-editor/TextEditor";
import { Button } from "@/src/components/ui/button";
import { ErrorType, StatusType } from "@/src/types/common/common";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useFormContext } from "react-hook-form";
import { BlogSchemaSchemaForm } from "../Schema/blogSchema";

export default function BlogForm({
  isEditMode = false,
  onSubmit,
  error,
  isPending = false,
  status,
}: {
  isEditMode?: boolean;
  onSubmit: (data: BlogSchemaSchemaForm) => void;
  error?: ErrorType | null;
  isPending?: boolean;
  status: StatusType.ACTIVE | StatusType.INACTIVE;
}) {
  const router = useRouter();
  const {
    handleSubmit,
    reset,
    watch,
    setValue,

    formState: { errors },
  } = useFormContext<BlogSchemaSchemaForm>();

  const statusOptions = [
    { label: "Active", value: StatusType.ACTIVE },
    { label: "Inactive", value: StatusType.INACTIVE },
  ];
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="w-full space-y-6">
      <div className="border border-light-silver rounded-lg p-8 bg-white">
        <div className="flex items-center justify-between">
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
          {isEditMode && <StatusBadge status={status} />}
        </div>

        <div className="mt-6">
          <FileUploadController name="image" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 lg:gap-6 mt-6">
          <div className="col-span-2 lg:col-span-1">
            <InputLabel label="Title" />
            <ControlledInputField
              className="bg-light"
              name="title"
              placeholder="Enter title..."
            />
          </div>

          <div className="col-span-2 lg:col-span-1">
            <InputLabel label="Status" />
            <ControlledSelectField
              name="status"
              placeholder="Select status"
              options={statusOptions}
              className="bg-light shadow-none"
            />
          </div>
          <div className="col-span-2">
            <InputLabel label="Description" />
            <TextEditor
              value={watch("description")}
              onChange={(value) => {
                setValue("description", value, {
                  shouldValidate: true,
                });
              }}
              error={errors?.description}
            />
          </div>
        </div>
      </div>

      <ErrorMessage error={error} />
      <div className="flex items-center justify-end gap-4">
        <Button
          onClick={() => {
            router.push("/admin/blogs");
            reset();
          }}
          type="button"
          className="text-secondary-foreground bg-transparent hover:bg-transparent border shadow-none cursor-pointer"
        >
          Cancel
        </Button>
        <SubmitButton
          isLoading={isPending}
          label={isEditMode ? "Update Package" : "Create Package"}
        />
      </div>
    </form>
  );
}
