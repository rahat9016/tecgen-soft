import InputLabel from "@/src/components/shared/InputLabel";
import TextEditor from "@/src/components/shared/text-editor/TextEditor";
import { useEffect } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { ISpecialtyFormType } from "../types";
import { FileSpecialtyUploadController } from "./FileSpecialtyUploadController";
import Section from "./Section";

export default function SectionTwoFields() {
  const {
    control,
    setValue,
    formState: { errors },
  } = useFormContext<ISpecialtyFormType>();

  const sectionTwoDescription = useWatch({
    control,
    name: "sections.sectionTwo.description",
  });
  const sectionTwoCoverImage = useWatch({
    control,
    name: "sections.sectionTwo.coverImage",
  });

  useEffect(() => {
    setValue("sections.sectionTwo.images.0.imageUrl", sectionTwoCoverImage, {
      shouldDirty: true,
      shouldValidate: true,
    });
    setValue("sections.sectionTwo.images.0.position", 0, {
      shouldDirty: true,
      shouldValidate: true,
    });
  }, [sectionTwoCoverImage, setValue]);

  return (
    <Section
      name="sections.sectionTwo"
      sectionTitle="Section 03"
      inputLabel="Section Title"
      inputPlaceholder="Enter section title"
    >
      <div className="col-span-2">
        <InputLabel label="Description" required />
        <TextEditor
          value={sectionTwoDescription}
          onChange={(value) => {
            setValue("sections.sectionTwo.description", value, {
              shouldValidate: true,
            });
          }}
          error={errors?.sections?.sectionTwo?.description}
        />
      </div>

      <FileSpecialtyUploadController
        name="sections.sectionTwo.coverImage"
        label="Upload cover image (position 0)"
        className="border-light-silver text-secondary-foreground bg-light"
      />

      <div className="flex flex-col gap-4 xl:flex-row xl:items-center">
        <div className="w-full h-80 xl:w-92.25 xl:h-115 shrink-0 relative rounded-xl overflow-hidden">
          <FileSpecialtyUploadController
            name="sections.sectionTwo.images[1].imageUrl"
            label="Upload image (position 1)"
            className="border-light-silver text-secondary-foreground bg-light xl:h-115"
          />
        </div>
        <div className="w-full xl:flex-1 relative rounded-xl overflow-hidden h-80 xl:h-126.75">
          <FileSpecialtyUploadController
            name="sections.sectionTwo.images[2].imageUrl"
            label="Upload image (position 2)"
            className="border-light-silver text-secondary-foreground bg-light xl:h-126.75"
          />
        </div>
        <div className="w-full h-80 xl:w-92.25 xl:h-115 shrink-0 relative rounded-xl overflow-hidden">
          <FileSpecialtyUploadController
            name="sections.sectionTwo.images[3].imageUrl"
            label="Upload image (position 3)"
            className="border-light-silver text-secondary-foreground bg-light h-80 xl:w-92.25 xl:h-115"
          />
        </div>
      </div>
    </Section>
  );
}
