import ErrorMessage from "@/src/components/shared/Errors/ErrorMessage";
import ControlledInputField from "@/src/components/shared/FromController/ControlledInputField";
import ControlledSelectField from "@/src/components/shared/FromController/ControlledSelectField";
import InputLabel from "@/src/components/shared/InputLabel";
import Paragraph from "@/src/components/shared/Paragraph";
import SubmitButton from "@/src/components/shared/SubmitButton";
import { Button } from "@/src/components/ui/button";
import { useGet } from "@/src/hooks/useGet";
import { ErrorType, StatusType } from "@/src/types/common/common";
import { mapToSelectOptions } from "@/src/utils/mapToSelectOptions";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useFieldArray, useFormContext, useWatch } from "react-hook-form";
import { employeeColumns } from "../Columns/employeeColumns";
import { CorporateMembershipSchemaForm } from "../Schema/corporateMembershipSchema";
import CorporateEmployeeTable from "../Table/CorporateEmployeeTable";
import { ICorporateEmployee, IMembershipPackageOption } from "../types";
import CreateUpdateCorporateEmployeeModal from "./CreateUpdateCorporateEmployeeModal";

type EmployeeStatus =
  | StatusType.ACTIVE
  | StatusType.INACTIVE
  | StatusType.PENDING
  | StatusType.REJECTED;

const normalizeStatus = (status: unknown): EmployeeStatus => {
  const normalized = String(status).toUpperCase();

  if (normalized === StatusType.INACTIVE) return StatusType.INACTIVE;
  if (normalized === StatusType.PENDING) return StatusType.PENDING;
  if (normalized === StatusType.REJECTED) return StatusType.REJECTED;

  return StatusType.ACTIVE;
};

export default function CorporateMembershipForm({
  onSubmit,
  error,
  isPending = false,
  isEditMode = false,
}: {
  onSubmit: (data: CorporateMembershipSchemaForm) => void;
  error?: ErrorType | null;
  isPending?: boolean;
  isEditMode?: boolean;
}) {
  const router = useRouter();
  const {
    control,
    handleSubmit,
    reset,
    trigger,
    formState: { errors, isDirty, isSubmitted },
  } = useFormContext<CorporateMembershipSchemaForm>();
  const [isEmployeeModalOpen, setIsEmployeeModalOpen] = useState(false);
  const [editingEmployeeIndex, setEditingEmployeeIndex] = useState<
    number | null
  >(null);

  const employeeTableErrorMessage = (() => {
    const employeesError = errors.employees;

    if (!employeesError) return undefined;

    if (
      typeof employeesError === "object" &&
      "message" in employeesError &&
      typeof employeesError.message === "string"
    ) {
      return employeesError.message;
    }

    if (Array.isArray(employeesError)) {
      for (const item of employeesError) {
        if (!item || typeof item !== "object") continue;

        const typedItem = item as Record<string, { message?: string }>;

        if (typedItem.phone?.message) return typedItem.phone.message;
        if (typedItem.employeeId?.message) return typedItem.employeeId.message;
        if (typedItem.email?.message) return typedItem.email.message;
        if (typedItem.name?.message) return typedItem.name.message;
        if (typedItem.designation?.message)
          return typedItem.designation.message;
        if (typedItem.status?.message) return typedItem.status.message;
      }
    }

    return undefined;
  })();

  const {
    fields: employeeFields,
    append: appendEmployee,
    update: updateEmployee,
    remove: removeEmployee,
  } = useFieldArray({
    control,
    name: "employees",
  });

  const contactNumber = useWatch({ control, name: "contactNumber" });
  const companyEmail = useWatch({ control, name: "email" });
  const employees = useWatch({ control, name: "employees" });

  // Only cross-validate employees once the user has actually edited the form or
  // attempted a submit. Otherwise loading an existing record would surface
  // validation errors on mount without any user action.
  useEffect(() => {
    if (!employees?.length) return;
    if (!isDirty && !isSubmitted) return;
    void trigger("employees");
  }, [contactNumber, companyEmail, employees, trigger, isDirty, isSubmitted]);

  const { data: packageListData } = useGet<IMembershipPackageOption[]>(
    "/package/list",
    ["membership-package-list"]
  );

  const packageOptions = mapToSelectOptions(
    packageListData?.data as unknown as IMembershipPackageOption[],
    "title",
    "id"
  );

  const statusOptions = [
    { label: "Active", value: StatusType.ACTIVE },
    { label: "Inactive", value: StatusType.INACTIVE },
    { label: "Pending", value: StatusType.PENDING },
    { label: "Rejected", value: StatusType.REJECTED },
  ];

  const columns = employeeColumns({
    onEdit: (rowIndex) => {
      setEditingEmployeeIndex(rowIndex);
      setIsEmployeeModalOpen(true);
    },
    onDelete: (rowIndex) => removeEmployee(rowIndex),
  });

  const editingEmployee =
    editingEmployeeIndex !== null
      ? (employeeFields[editingEmployeeIndex] as unknown as ICorporateEmployee)
      : undefined;

  const handleEmployeeSave = (employee: ICorporateEmployee) => {
    const normalizedStatus = normalizeStatus(employee.status);

    const normalizedEmployee = {
      ...employee,
      status: normalizedStatus,
    };

    if (editingEmployeeIndex !== null) {
      updateEmployee(editingEmployeeIndex, normalizedEmployee);
      setEditingEmployeeIndex(null);
      return;
    }

    appendEmployee(normalizedEmployee);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="w-full space-y-6">
      <div className="border border-light-silver rounded-lg p-8 bg-white">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 w-9 h-9 flex items-center justify-center rounded-md border border-primary/20">
            <Image
              src="/icons/group.svg"
              alt="corporate membership information"
              width={36}
              height={36}
              className="w-4"
            />
          </div>
          <Paragraph className="xl:text-lg font-medium">
            Corporate Membership Information
          </Paragraph>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-3 lg:gap-6 mt-6">
          <div>
            <InputLabel label="Company Name" />
            <ControlledInputField
              className="bg-light"
              name="companyName"
              placeholder="Enter company name"
            />
          </div>

          <div>
            <InputLabel label="Contact Person" />
            <ControlledInputField
              className="bg-light"
              name="contactPerson"
              placeholder="Enter contact person"
            />
          </div>

          <div>
            <InputLabel label="Contact Number" />
            <ControlledInputField
              className="bg-light"
              name="contactNumber"
              placeholder="01712345678"
            />
          </div>
          <div>
            <InputLabel label="Email" />
            <ControlledInputField
              className="bg-light"
              name="email"
              type="email"
              placeholder="company@gmail.com"
            />
          </div>
          <div>
            <InputLabel label="Total Employees" />
            <ControlledInputField
              className="bg-light"
              name="totalEmployees"
              type="number"
              placeholder="Enter total employees"
            />
          </div>
          <div>
            <InputLabel label="Contact Person Designation" />
            <ControlledInputField
              className="bg-light"
              name="contactPersonDesignation"
              placeholder="Manager"
            />
          </div>

          <div>
            <InputLabel label="Address" />
            <ControlledInputField
              className="bg-light"
              name="address"
              placeholder="Dhaka, Bangladesh"
            />
          </div>

          <div>
            <InputLabel label="Trade License" />
            <ControlledInputField
              className="bg-light"
              name="tradeLicense"
              placeholder="TRADE-123456"
            />
          </div>
          <div>
            <InputLabel label="Industry Type" />
            <ControlledInputField
              className="bg-light"
              name="industryType"
              placeholder="IT, Finance, etc."
            />
          </div>

          <div>
            <InputLabel label="Discount (%)" />
            <ControlledInputField
              className="bg-light"
              name="discount"
              type="number"
              placeholder="Enter discount"
            />
          </div>

          <div>
            <InputLabel label="Package" />
            <ControlledSelectField
              name="packageId"
              placeholder="Select package"
              options={packageOptions}
              className="bg-light shadow-none"
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
      </div>

      <div className="border border-light-silver rounded-lg p-8 bg-white">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-primary/10 w-9 h-9 flex items-center justify-center rounded-md border border-primary/20">
            <Image
              src="/icons/group.svg"
              alt="employees"
              width={36}
              height={36}
              className="w-4"
            />
          </div>
          <Paragraph className="xl:text-lg font-medium">Employees</Paragraph>
        </div>

        <CorporateEmployeeTable
          columns={columns}
          data={employeeFields as unknown as ICorporateEmployee[]}
          onCreate={() => {
            setEditingEmployeeIndex(null);
            setIsEmployeeModalOpen(true);
          }}
          createTitle="Add Employee"
        />

        {employeeTableErrorMessage ? (
          <p className="mt-3 text-sm text-destructive">
            {employeeTableErrorMessage}
          </p>
        ) : null}
      </div>

      <ErrorMessage error={error} />

      <div className="flex items-center justify-end gap-4">
        <Button
          onClick={() => {
            router.push("/admin/corporate-membership");
            reset();
          }}
          type="button"
          className="text-secondary-foreground bg-transparent hover:bg-transparent border shadow-none cursor-pointer"
        >
          Cancel
        </Button>
        <SubmitButton
          isLoading={isPending}
          label={
            isEditMode
              ? "Update Corporate Membership"
              : "Create Corporate Membership"
          }
        />
      </div>

      <CreateUpdateCorporateEmployeeModal
        isOpen={isEmployeeModalOpen}
        onClose={() => {
          setIsEmployeeModalOpen(false);
          setEditingEmployeeIndex(null);
        }}
        onSave={handleEmployeeSave}
        initialValues={editingEmployee}
      />
    </form>
  );
}
