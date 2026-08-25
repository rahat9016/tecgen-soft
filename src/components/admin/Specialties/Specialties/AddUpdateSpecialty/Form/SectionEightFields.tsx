import InputLabel from "@/src/components/shared/InputLabel";
import TextEditor from "@/src/components/shared/text-editor/TextEditor";
import { useFormContext, useWatch } from "react-hook-form";
import { ISpecialtyFormType } from "../types";
import Section from "./Section";

export default function SectionEightFields() {
  const {
    control,
    setValue,
    formState: { errors },
  } = useFormContext<ISpecialtyFormType>();

  const sectionEightDescription = useWatch({
    control,
    name: "sections.sectionEight.description",
  });

  return (
    <Section
      name="sections.sectionEight"
      sectionTitle="Section 09"
      inputLabel="Section Title"
      inputPlaceholder="Enter section title"
    >
      <div>
        <InputLabel label="Description" required />
        <TextEditor
          value={sectionEightDescription}
          onChange={(value) => {
            setValue("sections.sectionEight.description", value, {
              shouldValidate: true,
            });
          }}
          error={errors?.sections?.sectionEight?.description}
        />
      </div>
    </Section>
  );
}
