import InputLabel from "@/src/components/shared/InputLabel";
import TextEditor from "@/src/components/shared/text-editor/TextEditor";
import { useFormContext, useWatch } from "react-hook-form";
import { ISpecialtyFormType } from "../types";
import Section from "./Section";

export default function SectionFiveFields() {
  const {
    control,
    setValue,
    formState: { errors },
  } = useFormContext<ISpecialtyFormType>();

  const sectionFiveDescription = useWatch({
    control,
    name: "sections.sectionFive.description",
  });

  return (
    <Section
      name="sections.sectionFive"
      sectionTitle="Section 06"
      inputLabel="Section Title"
      inputPlaceholder="Enter section title"
    >
      <div className="col-span-2">
        <InputLabel label="Description" required />
        <TextEditor
          value={sectionFiveDescription}
          onChange={(value) => {
            setValue("sections.sectionFive.description", value, {
              shouldValidate: true,
            });
          }}
          error={errors?.sections?.sectionFive?.description}
        />
      </div>
    </Section>
  );
}
