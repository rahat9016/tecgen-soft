import ErrorMessage from "@/src/components/shared/Errors/ErrorMessage";
import ControlledInputField from "@/src/components/shared/FromController/ControlledInputField";
import Paragraph from "@/src/components/shared/Paragraph";
import SubmitButton from "@/src/components/shared/SubmitButton";
import { Button } from "@/src/components/ui/button";
import { ErrorType } from "@/src/types/common/common";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useFieldArray, useFormContext } from "react-hook-form";
import { ContactInfoSchemaForm } from "../Schema/contactInfoSchema";

export default function ContactInfoForm({
  isEditMode = false,
  onSubmit,
  error,
  isPending = false,
}: {
  isEditMode?: boolean;
  onSubmit: (data: ContactInfoSchemaForm) => void;
  error?: ErrorType | null;
  isPending?: boolean;
}) {
  const router = useRouter();

  const { control, watch, setValue, handleSubmit } =
    useFormContext<ContactInfoSchemaForm>();

  /* ---------------- Phones ---------------- */
  const {
    fields: phoneFields,
    append: appendPhone,
    remove: removePhone,
  } = useFieldArray({
    control,
    name: "phones",
  });

  const phoneInput = watch("phoneInput");

  const handleAddPhone = () => {
    if (phoneInput?.trim()) {
      appendPhone({ number: phoneInput.trim() });
      setValue("phoneInput", "");
    }
  };

  /* ---------------- Emails ---------------- */
  const {
    fields: emailFields,
    append: appendEmail,
    remove: removeEmail,
  } = useFieldArray({
    control,
    name: "emails",
  });

  const emailInput = watch("emailInput");

  const handleAddEmail = () => {
    if (emailInput?.trim()) {
      appendEmail({ email: emailInput.trim() });
      setValue("emailInput", "");
    }
  };

  /* ---------------- Office Hour ---------------- */
  const officeHour = watch("officeHour");
  const officeHourTemp = watch("officeHourTemp");
  const [editingOfficeHour, setEditingOfficeHour] = useState(false);

  // If officeHour exists on load, make sure temp is synced
  useEffect(() => {
    if (officeHour) {
      setValue("officeHourTemp", officeHour);
    }
  }, [officeHour, setValue]);
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="w-full space-y-6">
      <div className="space-y-8">
        {/* ================= Phones ================= */}
        <div className="border border-light-silver rounded-lg p-8 bg-white">
          <div className="flex items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 w-9 h-9 flex items-center justify-center rounded-md border border-primary/20">
                <Image
                  src="/icons/phone.svg"
                  alt="phone"
                  width={36}
                  height={36}
                  className="w-4"
                />
              </div>
              <Paragraph className="xl:text-lg font-medium">
                Phone Numbers
              </Paragraph>
            </div>
            <Button type="button" onClick={handleAddPhone} className="h-11">
              <Image
                src="/icons/plus-white.svg"
                alt="add new"
                width={36}
                height={36}
                className="w-4"
              />
              Add new phone
            </Button>
          </div>

          <ControlledInputField
            name="phoneInput"
            placeholder="Add phone number"
            className="bg-light"
          />

          <AnimatePresence>
            {phoneFields.length > 0 && (
              <ul className="mt-4 space-y-3">
                {phoneFields.map((item, index) => (
                  <motion.li
                    key={item.id}
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="flex items-center justify-between bg-light px-3 py-2 rounded-lg h-13"
                  >
                    <span>{item.number}</span>
                    <Button
                      type="button"
                      onClick={() => removePhone(index)}
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

        {/* ================= Emails ================= */}
        <div className="border border-light-silver rounded-lg p-8 bg-white">
          <div className="flex items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 w-9 h-9 flex items-center justify-center rounded-md border border-primary/20">
                <Image
                  src="/icons/email.svg"
                  alt="email"
                  width={36}
                  height={36}
                  className="w-4"
                />
              </div>
              <Paragraph className="xl:text-lg font-medium">Emails</Paragraph>
            </div>
            <Button type="button" onClick={handleAddEmail} className="h-11">
              <Image
                src="/icons/plus-white.svg"
                alt="add new"
                width={36}
                height={36}
                className="w-4"
              />
              Add new email
            </Button>
          </div>

          <ControlledInputField
            name="emailInput"
            placeholder="Add email"
            className="bg-light"
          />

          <AnimatePresence>
            {emailFields.length > 0 && (
              <ul className="mt-4 space-y-3">
                {emailFields.map((item, index) => (
                  <motion.li
                    key={item.id}
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="flex items-center justify-between bg-light px-3 py-2 rounded-lg h-13"
                  >
                    <span>{item.email}</span>
                    <Button
                      type="button"
                      onClick={() => removeEmail(index)}
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

        {/* ================= Office Hour ================= */}
        <div className="border border-light-silver rounded-lg p-8 bg-white">
          <div className="flex items-center justify-between mb-4">
            <Paragraph className="xl:text-lg font-medium">
              Office Hour
            </Paragraph>

            {/* Edit button only if value exists */}
            {officeHour && (
              <Button
                type="button"
                onClick={() => {
                  setValue("officeHourTemp", officeHour);
                  setEditingOfficeHour(true);
                }}
              >
                <Image
                  src="/icons/plus-white.svg"
                  alt="add new"
                  width={36}
                  height={36}
                  className="w-4"
                />
                Edit info
              </Button>
            )}
          </div>

          {/* No value → show input only */}
          {!officeHour && (
            <ControlledInputField
              name="officeHourTemp"
              placeholder="Saturday to Thursday 09.00AM - 10.00PM (GMT)"
              className="bg-light"
            />
          )}

          {/* Editing mode */}
          {officeHour && editingOfficeHour && (
            <div className="relative">
              <ControlledInputField
                name="officeHourTemp"
                className="bg-light w-full h-13"
              />

              <div className="absolute right-3 top-1 flex items-center gap-4">
                <Button
                  type="button"
                  className="bg-[#ECFDF3] shadow-none hover:bg-[#ECFDF3] w-8 h-8 p-2"
                  onClick={() => {
                    if (officeHourTemp?.trim()) {
                      setValue("officeHour", officeHourTemp.trim());
                    }
                    setEditingOfficeHour(false);
                  }}
                >
                  <Image
                    src="/icons/tick.svg"
                    alt="tick"
                    width={36}
                    height={36}
                  />
                </Button>

                <Button
                  type="button"
                  onClick={() => {
                    setValue("officeHourTemp", officeHour);
                    setEditingOfficeHour(false);
                  }}
                  className="bg-[#FEF3F2] shadow-none hover:bg-[#FEF3F2] w-8 h-8 p-2"
                >
                  <Image
                    src="/icons/cross.svg"
                    alt="tick"
                    width={36}
                    height={36}
                  />
                </Button>
              </div>
            </div>
          )}

          {/* Preview */}
          {officeHour && !editingOfficeHour && (
            <div className="bg-light px-3 py-2 rounded-lg h-13 flex items-center text-secondary-foreground text-base font-normal">
              {officeHour}
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <ErrorMessage error={error} />

      <div className="flex justify-end gap-4">
        <Button
          type="button"
          onClick={() => router.push("/admin/contact-info")}
        >
          Cancel
        </Button>

        <SubmitButton
          isLoading={isPending}
          label={isEditMode ? "Update Contact Info" : "Create Contact Info"}
        />
      </div>
    </form>
  );
}
