import ControlledTextareaField from "@/src/components/shared/FromController/ControlledTextareaField";
import InputLabel from "@/src/components/shared/InputLabel";
import Section from "./Section";

export default function SectionOneFields() {
  return (
    <Section
      name="sections.sectionOne"
      sectionTitle="Section 02"
      inputLabel="Section Title"
      inputPlaceholder="Enter section title"
    >
      <div>
        <InputLabel label="Description" required />
        <ControlledTextareaField
          name="sections.sectionOne.description"
          placeholder="Enter section description"
          className="border-light-silver bg-light text-secondary-foreground"
        />
      </div>
    </Section>
  );
}
