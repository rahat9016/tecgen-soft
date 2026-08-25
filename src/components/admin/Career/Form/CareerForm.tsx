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
import { CareerSchemaForm } from "../Schema/careerSchema";
import { JobType } from "../types";

export default function CareerForm({
  isEditMode = false,
  onSubmit,
  error,
  isPending = false,
}: {
  isEditMode?: boolean;
  onSubmit: (data: CareerSchemaForm) => void;
  error?: ErrorType | null;
  isPending?: boolean;
}) {
  const router = useRouter();

  const {
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useFormContext<CareerSchemaForm>();

  const statusOptions = [
    { label: "Active", value: StatusType.ACTIVE },
    { label: "Inactive", value: StatusType.INACTIVE },
  ];

  const jobTypeOptions = [
    { label: "Full Time", value: JobType.FULL_TIME },
    { label: "Part Time", value: JobType.PART_TIME },
    { label: "Contract", value: JobType.CONTRACT },
    { label: "Temporary", value: JobType.TEMPORARY },
    { label: "Intern", value: JobType.INTERN },
    { label: "Volunteer", value: JobType.VOLUNTEER },
  ];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="w-full space-y-6">
      <div className="border border-light-silver rounded-lg p-8 bg-white">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 w-9 h-9 flex items-center justify-center rounded-md border border-primary/20">
              <Image
                src={"/icons/group.svg"}
                alt="career information"
                width={36}
                height={36}
                className="w-4"
              />
            </div>
            <Paragraph className="xl:text-lg font-medium">
              Career Information
            </Paragraph>
          </div>
          {isEditMode && <StatusBadge status={StatusType.ACTIVE} />}
        </div>

        {/* Image */}
        <div className="mt-6">
          <FileUploadController name="image" />
        </div>

        {/* Fields */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-y-6 gap-x-6 mt-6">
          <div>
            <InputLabel label="Title" />
            <ControlledInputField
              className="bg-light"
              name="title"
              placeholder="Enter job title..."
            />
          </div>
          <div>
            <InputLabel label="Vacancy" />
            <ControlledInputField
              className="bg-light"
              type="number"
              name="vacancy"
              placeholder="Enter vacancy"
            />
          </div>
          <div>
            <InputLabel label="Location" />
            <ControlledInputField
              className="bg-light"
              name="location"
              placeholder="Dhaka, Bangladesh"
            />
          </div>
          <div>
            <InputLabel label="Experience" />
            <ControlledInputField
              type="number"
              className="bg-light"
              name="experience"
              placeholder="05 Years"
            />
          </div>
          <div>
            <InputLabel label="Salary Range" />
            <ControlledInputField
              className="bg-light"
              type="number"
              name="salary"
              placeholder="30000"
            />
          </div>

          <div>
            <InputLabel label="Deadline" />
            <ControlledInputField
              className="bg-light"
              type="date"
              name="deadline"
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
          <div>
            <InputLabel label="Job Type" />
            <ControlledSelectField
              name="jobType"
              placeholder="Select job type"
              options={jobTypeOptions}
              className="bg-light shadow-none"
            />
          </div>
          <div className="lg:col-span-4">
            <InputLabel label="Job Description" />
            <TextEditor
              value={watch("description")}
              onChange={(value) =>
                setValue("description", value, { shouldValidate: true })
              }
              error={errors?.description}
            />
          </div>
        </div>
      </div>

      {/* Footer */}
      <ErrorMessage error={error} />

      <div className="flex items-center justify-end gap-4">
        <Button
          onClick={() => {
            router.push("/admin/job-list");
            reset();
          }}
          type="button"
          className="text-secondary-foreground bg-transparent hover:bg-transparent border shadow-none cursor-pointer"
        >
          Cancel
        </Button>

        <SubmitButton
          isLoading={isPending}
          label={isEditMode ? "Update Career" : "Create Career"}
        />
      </div>
    </form>
  );
}
