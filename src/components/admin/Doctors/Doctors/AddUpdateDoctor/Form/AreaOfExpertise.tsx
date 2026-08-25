import ControlledInputField from "@/src/components/shared/FromController/ControlledInputField";
import Paragraph from "@/src/components/shared/Paragraph";
import { Button } from "@/src/components/ui/button";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { useFieldArray, useFormContext } from "react-hook-form";
import { IDoctorFormType } from "../types";

export default function AreaOfExpertise() {
  const { control, watch, setValue } = useFormContext<IDoctorFormType>();

  /* ---------------- Phones ---------------- */
  const {
    fields: areaExpertiseFields,
    append: appendPhone,
    remove: removePhone,
  } = useFieldArray({
    control,
    name: "areaExpertise",
  });

  const expertiseInput = watch("expertiseInput");

  const handleAddPhone = () => {
    if (expertiseInput?.trim()) {
      appendPhone({ expertise: expertiseInput.trim() });
      setValue("expertiseInput", "");
    }
  };
  return (
    <div>
      <div className="border border-light-silver rounded-lg p-8 bg-white">
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 w-9 h-9 flex items-center justify-center rounded-md border border-primary/20">
              <Image
                src="/icons/expertise.svg"
                alt="phone"
                width={36}
                height={36}
                className="w-4"
              />
            </div>
            <Paragraph className="xl:text-lg font-medium">
              Area of expertise
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
            Add new
          </Button>
        </div>

        <ControlledInputField
          name="expertiseInput"
          placeholder="Add new expertise"
          className="bg-light"
        />

        <AnimatePresence>
          {areaExpertiseFields.length > 0 && (
            <ul className="mt-4 space-y-3">
              {areaExpertiseFields.map((item, index) => (
                <motion.li
                  key={item.id}
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="flex items-center justify-between bg-light px-3 py-2 rounded-lg h-13"
                >
                  <span>{item.expertise}</span>
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
    </div>
  );
}
