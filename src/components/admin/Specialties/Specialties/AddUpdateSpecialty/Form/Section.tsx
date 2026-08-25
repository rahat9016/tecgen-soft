import ControlledInputField from "@/src/components/shared/FromController/ControlledInputField";
import ControlledToggleField from "@/src/components/shared/FromController/ControlledToggleField";
import InputLabel from "@/src/components/shared/InputLabel";
import Paragraph from "@/src/components/shared/Paragraph";
import Image from "next/image";

export default function Section({
  name,
  sectionTitle,
  toggleName,
  inputLabel,
  inputPlaceholder,
  children,
}: {
  name: string;
  sectionTitle?: string;
  toggleName?: string;
  inputLabel?: string;
  inputPlaceholder?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 p-8 border border-light-silver rounded-lg bg-white">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 w-9 h-9 flex items-center justify-center rounded-md border border-primary/20">
            <Image
              src={"/icons/reports.svg"}
              alt="basic information"
              width={36}
              height={36}
              className="w-4"
            />
          </div>
          <Paragraph className="xl:text-lg font-medium">
            {sectionTitle}
          </Paragraph>
        </div>
        <ControlledToggleField name={toggleName || `${name}.isActive`} />
      </div>
      <div>
        {inputLabel && <InputLabel label={inputLabel} required />}
        <ControlledInputField
          name={`${name}.title`}
          placeholder={inputPlaceholder || "Write a title for this section"}
        />
      </div>
      {children}
    </div>
  );
}
