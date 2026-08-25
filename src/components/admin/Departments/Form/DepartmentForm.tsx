import ErrorMessage from "@/src/components/shared/Errors/ErrorMessage";
import ControlledInputField from "@/src/components/shared/FromController/ControlledInputField";
import ControlledSelectField from "@/src/components/shared/FromController/ControlledSelectField";
import InputLabel from "@/src/components/shared/InputLabel";
import SubmitButton from "@/src/components/shared/SubmitButton";
import { Button } from "@/src/components/ui/button";
import { ErrorType, StatusType } from "@/src/types/common/common";
import { useFormContext } from "react-hook-form";
import { DepartmentSchemaForm } from "../Schema/departmentSchema";
import Paragraph from "@/src/components/shared/Paragraph";

export default function DepartmentForm({
  isEditMode = false,
  onSubmit,
  onCancel,
  error,
  isPending = false,
}: {
  isEditMode?: boolean;
  onSubmit: (data: DepartmentSchemaForm) => void;
  onCancel: () => void;
  error?: ErrorType | null;
  isPending?: boolean;
}) {
  const { handleSubmit, reset } = useFormContext<DepartmentSchemaForm>();

  const statusOptions = [
    { label: "Active", value: StatusType.ACTIVE },
    { label: "Inactive", value: StatusType.INACTIVE },
  ];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 gap-4 border rounded-2xl p-4">
        <Paragraph className="text-sm xl:text-lg">
          Department Information
        </Paragraph>
        <div>
          <InputLabel label="Department Name" />
          <ControlledInputField
            className="bg-light"
            name="name"
            placeholder="Enter department name"
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
      </div>

      <ErrorMessage error={error} />
      <div className="flex items-center justify-end gap-4">
        <Button
          onClick={() => {
            reset();
            onCancel();
          }}
          type="button"
          className="text-secondary-foreground bg-transparent hover:bg-transparent border shadow-none cursor-pointer"
        >
          Cancel
        </Button>
        <SubmitButton
          isLoading={isPending}
          label={isEditMode ? "Update Department" : "Create Department"}
        />
      </div>
    </form>
  );
}
