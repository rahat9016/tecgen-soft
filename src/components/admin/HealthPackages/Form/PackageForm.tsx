import ErrorMessage from "@/src/components/shared/Errors/ErrorMessage";
import ControlledInputField from "@/src/components/shared/FromController/ControlledInputField";
import ControlledSelectField from "@/src/components/shared/FromController/ControlledSelectField";
import { FileUploadController } from "@/src/components/shared/FromController/FileUploadController";
import InputLabel from "@/src/components/shared/InputLabel";
import Paragraph from "@/src/components/shared/Paragraph";
import StatusBadge from "@/src/components/shared/Status/Status";
import SubmitButton from "@/src/components/shared/SubmitButton";
import { Button } from "@/src/components/ui/button";
import { ErrorType, StatusType } from "@/src/types/common/common";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useFieldArray, useFormContext } from "react-hook-form";
import { TPackageFormType } from "../Schema/packageSchema";

export default function PackageForm({
  isEditMode = false,
  onSubmit,
  error,
  isPending = false,
}: {
  isEditMode?: boolean;
  onSubmit: (data: TPackageFormType) => void;
  error?: ErrorType | null;
  isPending?: boolean;
}) {
  const router = useRouter();
  const { control, setValue, watch, handleSubmit, reset } =
    useFormContext<TPackageFormType>();
  const { fields, append, remove } = useFieldArray({
    control,
    name: "serviceList",
  });

  const serviceInput = watch("serviceInput");

  const handleAddService = () => {
    if (serviceInput && serviceInput.trim() !== "") {
      append({ name: serviceInput.trim() });
      setValue("serviceInput", "");
    }
  };

  const handleServiceKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddService();
    }
  };

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
          {isEditMode && <StatusBadge status={StatusType.ACTIVE} />}
        </div>

        <div className="mt-6">
          <FileUploadController name="image" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 lg:gap-6 mt-6">
          <div>
            <InputLabel label="Package Title" />
            <ControlledInputField
              className="bg-light"
              name="title"
              placeholder="Enter package title"
            />
          </div>

          <div>
            <InputLabel label="Description" />
            <ControlledInputField
              className="bg-light"
              name="description"
              placeholder="Write package description"
            />
          </div>

          <div>
            <InputLabel label="Price" />
            <ControlledInputField
              className="bg-light"
              name="price"
              type="number"
              placeholder="Enter price"
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
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 w-9 h-9 flex items-center justify-center rounded-md border border-primary/20">
              <Image
                src={"/icons/service.svg"}
                alt="basic information"
                width={36}
                height={36}
                className="w-4"
              />
            </div>
            <Paragraph className="xl:text-lg font-medium">
              Service List
            </Paragraph>
          </div>
          <Button type="button" onClick={handleAddService} className="h-11">
            <Image
              src="/icons/plus-white.svg"
              alt="add new"
              width={36}
              height={36}
              className="w-4 cursor-pointer"
            />
            Add new
          </Button>
        </div>
        <div className="flex gap-2 mt-6">
          <div className="flex-1">
            <ControlledInputField
              onKeyDown={handleServiceKeyDown}
              className="bg-light"
              name="serviceInput"
              placeholder="Add new Service"
            />
          </div>
        </div>

        <AnimatePresence>
          {fields.length > 0 && (
            <ul className="mt-6 space-y-3">
              {fields.map((item, index) => (
                <motion.li
                  key={item.id}
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="flex items-center justify-between bg-light px-2 py-3 rounded-lg"
                >
                  <div className="flex items-center gap-3 pl-5">
                    <span className="w-1 h-1 bg-secondary-foreground rounded-full"></span>
                    <span>{item.name}</span>
                  </div>

                  <Button
                    type="button"
                    onClick={() => remove(index)}
                    className="bg-[#FEF3F2] hover:bg-[#FEF3F2] w-9 h-9 p-0 shadow-none"
                  >
                    <Image
                      src="/icons/delete.svg"
                      alt="delete"
                      width={36}
                      height={36}
                      className="w-4"
                    />
                  </Button>
                </motion.li>
              ))}
            </ul>
          )}
        </AnimatePresence>
      </div>

      <ErrorMessage error={error} />
      <div className="flex items-center justify-end gap-4">
        <Button
          onClick={() => {
            router.push("/admin/health-packages");
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
