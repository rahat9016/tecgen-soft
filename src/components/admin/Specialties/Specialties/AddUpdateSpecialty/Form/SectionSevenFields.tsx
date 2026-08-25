import InputLabel from "@/src/components/shared/InputLabel";
import TextEditor from "@/src/components/shared/text-editor/TextEditor";
import { useFormContext, useWatch } from "react-hook-form";
import { ColumnDef } from "../SpecialtyTable/specialty-data-table";
import { ISectionItem, ISpecialtyFormType } from "../types";
import SectionListFields from "./SectionListFields";

interface SectionSevenFieldsProps {
  columns: ColumnDef<ISectionItem>[];
  data: ISectionItem[];
  onOpenCreateModal: () => void;
}

export default function SectionSevenFields({
  columns,
  data,
  onOpenCreateModal,
}: SectionSevenFieldsProps) {
  const {
    control,
    setValue,
    formState: { errors },
  } = useFormContext<ISpecialtyFormType>();

  const sectionSevenDescription = useWatch({
    control,
    name: "sections.sectionSeven.description",
  });

  return (
    <SectionListFields
      sectionName="sections.sectionSeven"
      sectionTitle="Section 08"
      columns={columns}
      data={data}
      onOpenCreateModal={onOpenCreateModal}
    >
      <div className="col-span-2">
        <InputLabel label="Description" required />
        <TextEditor
          value={sectionSevenDescription}
          onChange={(value) => {
            setValue("sections.sectionSeven.description", value, {
              shouldValidate: true,
            });
          }}
          error={errors?.sections?.sectionSeven?.description}
        />
      </div>
    </SectionListFields>
  );
}
