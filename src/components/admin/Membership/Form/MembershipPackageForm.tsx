import ErrorMessage from "@/src/components/shared/Errors/ErrorMessage";
import ControlledInputField from "@/src/components/shared/FromController/ControlledInputField";
import ControlledSelectField from "@/src/components/shared/FromController/ControlledSelectField";
import ControlledTextareaField from "@/src/components/shared/FromController/ControlledTextareaField";
import InputLabel from "@/src/components/shared/InputLabel";
import Paragraph from "@/src/components/shared/Paragraph";
import SubmitButton from "@/src/components/shared/SubmitButton";
import { Button } from "@/src/components/ui/button";
import { ErrorType, StatusType } from "@/src/types/common/common";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useFieldArray, useFormContext } from "react-hook-form";
import { MembershipPackageSchemaForm } from "../Schema/membershipPackageSchema";

export default function MembershipPackageForm({
  onSubmit,
  error,
  isPending = false,
  isEditMode = false,
}: {
  onSubmit: (data: MembershipPackageSchemaForm) => void;
  error?: ErrorType | null;
  isPending?: boolean;
  isEditMode?: boolean;
}) {
  const router = useRouter();
  const { control, watch, setValue, handleSubmit, reset } =
    useFormContext<MembershipPackageSchemaForm>();

  const {
    fields: benefitFields,
    append: appendBenefit,
    remove: removeBenefit,
  } = useFieldArray({
    control,
    name: "benefits",
  });

  const {
    fields: noticeFields,
    append: appendNotice,
    remove: removeNotice,
  } = useFieldArray({
    control,
    name: "notices",
  });

  const benefitInput = watch("benefitInput");
  const noticeInput = watch("noticeInput");

  const handleAddBenefit = () => {
    if (benefitInput?.trim()) {
      appendBenefit({ value: benefitInput.trim() });
      setValue("benefitInput", "");
    }
  };

  const handleAddNotice = () => {
    if (noticeInput?.trim()) {
      appendNotice({ value: noticeInput.trim() });
      setValue("noticeInput", "");
    }
  };

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
              src="/icons/group.svg"
              alt="package information"
              width={36}
              height={36}
              className="w-4"
            />
          </div>
          <Paragraph className="xl:text-lg font-medium">
            Package Information
          </Paragraph>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2  gap-3 lg:gap-6 mt-6">
          <div>
            <InputLabel label="Title" />
            <ControlledInputField
              className="bg-light"
              name="title"
              placeholder="Enter package title"
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

          <div className="md:col-span-2">
            <InputLabel label="Description" />
            <ControlledTextareaField
              className="bg-light"
              name="description"
              placeholder="Write package description"
            />
          </div>
        </div>
      </div>

      <div className="border border-light-silver rounded-lg p-8 bg-white">
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 w-9 h-9 flex items-center justify-center rounded-md border border-primary/20">
              <Image
                src="/icons/group.svg"
                alt="benefits"
                width={36}
                height={36}
                className="w-4"
              />
            </div>
            <Paragraph className="xl:text-lg font-medium">Benefits</Paragraph>
          </div>
          <Button type="button" onClick={handleAddBenefit} className="h-11">
            <Image
              src="/icons/plus-white.svg"
              alt="add new"
              width={36}
              height={36}
              className="w-4"
            />
            Add benefit
          </Button>
        </div>

        <ControlledInputField
          name="benefitInput"
          placeholder="Add benefit"
          className="bg-light"
        />

        <AnimatePresence>
          {benefitFields.length > 0 && (
            <ul className="mt-4 space-y-3">
              {benefitFields.map((item, index) => (
                <motion.li
                  key={item.id}
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="flex items-center justify-between bg-light px-3 py-2 rounded-lg h-13"
                >
                  <span>{item.value}</span>
                  <Button
                    type="button"
                    onClick={() => removeBenefit(index)}
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

      <div className="border border-light-silver rounded-lg p-8 bg-white">
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 w-9 h-9 flex items-center justify-center rounded-md border border-primary/20">
              <Image
                src="/icons/group.svg"
                alt="notices"
                width={36}
                height={36}
                className="w-4"
              />
            </div>
            <Paragraph className="xl:text-lg font-medium">Notices</Paragraph>
          </div>
          <Button type="button" onClick={handleAddNotice} className="h-11">
            <Image
              src="/icons/plus-white.svg"
              alt="add new"
              width={36}
              height={36}
              className="w-4"
            />
            Add notice
          </Button>
        </div>

        <ControlledInputField
          name="noticeInput"
          placeholder="Add notice"
          className="bg-light"
        />

        <AnimatePresence>
          {noticeFields.length > 0 && (
            <ul className="mt-4 space-y-3">
              {noticeFields.map((item, index) => (
                <motion.li
                  key={item.id}
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="flex items-center justify-between bg-light px-3 py-2 rounded-lg h-13"
                >
                  <span>{item.value}</span>
                  <Button
                    type="button"
                    onClick={() => removeNotice(index)}
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
            router.push("/admin/packages");
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
