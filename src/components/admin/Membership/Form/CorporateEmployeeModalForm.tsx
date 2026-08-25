import ControlledInputField from "@/src/components/shared/FromController/ControlledInputField";
import ControlledSelectField from "@/src/components/shared/FromController/ControlledSelectField";
import InputLabel from "@/src/components/shared/InputLabel";
import { Button } from "@/src/components/ui/button";
import { StatusType } from "@/src/types/common/common";

export default function CorporateEmployeeModalForm({
  onSubmit,
  onClose,
  isEditMode = false,
}: {
  onSubmit: () => void;
  onClose: () => void;
  isEditMode?: boolean;
}) {
  const statusOptions = [
    { label: "Active", value: StatusType.ACTIVE },
    { label: "Inactive", value: StatusType.INACTIVE },
    { label: "Pending", value: StatusType.PENDING },
    { label: "Rejected", value: StatusType.REJECTED },
  ];

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        event.stopPropagation();
        onSubmit();
      }}
      className="space-y-6"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border border-light-silver p-4 rounded-lg">
        <div>
          <InputLabel label="Employee ID" />
          <ControlledInputField
            name="employeeId"
            className="bg-light"
            placeholder="EMP-001"
          />
        </div>

        <div>
          <InputLabel label="Name" />
          <ControlledInputField
            name="name"
            className="bg-light"
            placeholder="Enter employee name"
          />
        </div>

        <div>
          <InputLabel label="Designation" />
          <ControlledInputField
            name="designation"
            className="bg-light"
            placeholder="Enter designation"
          />
        </div>

        <div>
          <InputLabel label="Phone" />
          <ControlledInputField
            name="phone"
            className="bg-light"
            placeholder="01712345678"
          />
        </div>

        <div>
          <InputLabel label="Email" />
          <ControlledInputField
            name="email"
            type="email"
            className="bg-light"
            placeholder="employee@gmail.com"
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

      <div className="flex justify-end gap-3">
        <Button
          type="button"
          onClick={onClose}
          className="text-secondary-foreground bg-transparent hover:bg-transparent border shadow-none cursor-pointer"
        >
          Cancel
        </Button>
        <Button
          type="button"
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            onSubmit();
          }}
        >
          {isEditMode ? "Update" : "Add"}
        </Button>
      </div>
    </form>
  );
}
